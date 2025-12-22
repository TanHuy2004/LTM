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

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../Client')));
app.use('/api/auth', authRoutes);

// ---------------- SOCKET.IO ----------------
const onlineUsers = {}; // realtime: { userId: { role, sockets: [] } }

function broadcastOnlineList() {
    const list = Object.keys(onlineUsers).map(id => ({
        userId: Number(id),
        role: onlineUsers[id].role,
        socketCount: onlineUsers[id].sockets.length
    }));
    io.emit("online_list", list);
}

io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // ===== USER ONLINE =====
    socket.on("user_online", async ({ token }) => {
        if (!token) return;

        try {
            const decoded = jwt.verify(token, SECRET);
            const userId = decoded.id || decoded.ID_Taikhoan;
            const role = decoded.role || decoded.VaiTro;

            if (!userId) return;

            // Realtime online
            if (!onlineUsers[userId]) onlineUsers[userId] = { role, sockets: [] };
            if (!onlineUsers[userId].sockets.includes(socket.id)) {
                onlineUsers[userId].sockets.push(socket.id);
            }

            // Tạo dòng mới trong DB
            await Status.create({
                ID_Taikhoan: userId,
                TrangThai: "online",
                ThoiGianCapNhat: new Date(),
                Ip: socket.handshake.address || socket.handshake.headers['x-forwarded-for']
            });

            broadcastOnlineList();
        } catch (err) {
            console.error("user_online error:", err);
        }
    });

    // ===== USER OFFLINE (CLICK LOGOUT) =====
    socket.on("user_offline", async ({ token }, callback) => {
        try {
            if (!token) return callback?.();

            const decoded = jwt.verify(token, SECRET);
            const userId = decoded.id || decoded.ID_Taikhoan;

            if (!userId) return callback?.();

            // Xóa realtime
            delete onlineUsers[userId];

            // Tạo dòng mới offline
            await Status.create({
                ID_Taikhoan: userId,
                TrangThai: "offline",
                ThoiGianCapNhat: new Date(),
                Ip: socket.handshake.address || socket.handshake.headers['x-forwarded-for']
            });

            broadcastOnlineList();
            callback?.();
        } catch (err) {
            console.error("user_offline error:", err);
            callback?.();
        }
    });

    // ===== REQUEST ONLINE LIST =====
    socket.on("request_online_list", () => {
        broadcastOnlineList();
    });

    // ===== DISCONNECT =====
    socket.on("disconnect", async () => {
        for (const [userId, data] of Object.entries(onlineUsers)) {
            data.sockets = data.sockets.filter(id => id !== socket.id);
            if (data.sockets.length === 0) {
                // Xóa khỏi realtime
                delete onlineUsers[userId];

                // Tạo dòng offline khi hết socket
                try {
                    await Status.create({
                        ID_Taikhoan: userId,
                        TrangThai: "offline",
                        ThoiGianCapNhat: new Date(),
                        Ip: socket.handshake.address || socket.handshake.headers['x-forwarded-for']
                    });
                } catch (err) {
                    console.error("disconnect offline error:", err);
                }
            }
        }
        broadcastOnlineList();
    });
});

const PORT = 5000;
server.listen(PORT, "0.0.0.0", () => {
    console.log("SERVER ĐANG CHẠY");
    console.log(`Local: http://localhost:${PORT}`);
});
