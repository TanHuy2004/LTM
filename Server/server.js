require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');
const Status = require('./models/Status');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const SECRET = process.env.JWT_SECRET || "huydeptrai";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Client')));
app.use('/api/auth', authRoutes);

// ---------------- SOCKET.IO ----------------
const onlineUsers = {}; // userId -> { role, sockets: [] }

function broadcastOnlineList() {
    const list = Object.keys(onlineUsers).map(userId => ({
        userId: Number(userId),
        role: onlineUsers[userId].role,
        socketCount: onlineUsers[userId].sockets.length
    }));
    io.emit("online_list", list);
}

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);
    socket.on("request_online_list", () => {
        broadcastOnlineList(); // gửi danh sách hiện tại cho admin mới kết nối
    });

    // User online
    socket.on("user_online", async ({ token }) => {
        if (!token) return;
        try {
            const decoded = jwt.verify(token, SECRET);
            const userId = decoded.id;
            const role = decoded.role;

            if (!onlineUsers[userId]) onlineUsers[userId] = { role, sockets: [] };
            onlineUsers[userId].sockets.push(socket.id);

            // Upsert Status online
            await Status.upsert({
                ID_Taikhoan: Number(userId),
                TrangThai: "online",
                ThoiGianCapNhat: new Date()
            });

            broadcastOnlineList();
        } catch (err) {
            console.error("user_online error:", err);
        }
    });

    // User offline
    socket.on("user_offline", async ({ token }, callback) => {
        if (!token) return;
        try {
            const decoded = jwt.verify(token, SECRET);
            const userId = decoded.id;

            if (onlineUsers[userId]) {
                onlineUsers[userId].sockets = [];
                delete onlineUsers[userId];
            }

            await Status.upsert({
                ID_Taikhoan: Number(userId),
                TrangThai: "offline",
                ThoiGianCapNhat: new Date()
            });

            broadcastOnlineList();
            if (callback) callback();
        } catch (err) {
            console.error("user_offline error:", err);
            if (callback) callback(err);
        }
    });

    // Disconnect (tự động offline khi đóng tab)
    socket.on("disconnect", async () => {
        try {
            for (const userId in onlineUsers) {
                onlineUsers[userId].sockets = onlineUsers[userId].sockets.filter(id => id !== socket.id);
                if (onlineUsers[userId].sockets.length === 0) {
                    await Status.upsert({
                        ID_Taikhoan: Number(userId),
                        TrangThai: "offline",
                        ThoiGianCapNhat: new Date()
                    });
                    delete onlineUsers[userId];
                }
            }
            broadcastOnlineList();
        } catch (err) {
            console.error("disconnect error:", err);
        }
    });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';

// For demo: if HOST is localhost, bind to all interfaces (0.0.0.0) to allow external connections
// But keep display as localhost for simplicity
const BIND_HOST = HOST === 'localhost' ? '0.0.0.0' : HOST;

// Error handling for invalid IP
server.on('error', (err) => {
    if (err.code === 'EADDRNOTAVAIL') {
        console.log('\n❌ ERROR: IP address not available!');
        console.log(`   The IP ${HOST} is not valid for this computer.`);
        console.log('\n💡 SOLUTIONS:');
        console.log('   1. Run "ipconfig" (Windows) or "ifconfig" (Mac/Linux) to find your IP');
        console.log('   2. Edit Server/.env file');
        console.log(`   3. Change HOST=${HOST} to your actual IP`);
        console.log('   4. Or use HOST=0.0.0.0 for all network interfaces');
        console.log('\n');
        process.exit(1);
    } else {
        console.log('Server error:', err);
    }
});

server.listen(PORT, BIND_HOST, () => {
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let localIP = 'Not found';

    // Get actual IP addresses
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                if (localIP === 'Not found') {
                    localIP = interface.address;
                }
            }
        }
    }

    console.log('\n===================================');
    console.log('🚀 LTM - Login Tracking System');
    console.log('===================================');
    console.log(`📍 Local access: http://localhost:${PORT}`);
    console.log(`🖥️  Your IP: ${localIP}`);

    if (HOST !== '127.0.0.1' && HOST !== 'localhost') {
        console.log(`🌐 Network access: http://${HOST}:${PORT}`);

        // Check if HOST matches actual IP
        if (HOST !== '0.0.0.0' && HOST !== localIP) {
            console.log('\n⚠️  WARNING: HOST in .env does not match your IP!');
            console.log(`   Your actual IP: ${localIP}`);
            console.log(`   HOST in .env: ${HOST}`);
        }

        console.log('\n📝 Other computers can access using:');
        console.log(`   → http://${HOST}:${PORT}`);
    } else if (HOST === '127.0.0.1') {
        console.log('\n📝 Network access: DISABLED');
        console.log('   To enable: Edit .env and set HOST=0.0.0.0 or your IP');
    }

    console.log('\n🔧 To change network access:');
    console.log('   → Edit Server/.env file');
    console.log(`   → Current HOST: ${HOST}`);
    console.log('===================================\n');
});
