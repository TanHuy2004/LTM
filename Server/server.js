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
server.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);
