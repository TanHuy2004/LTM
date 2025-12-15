document.addEventListener("DOMContentLoaded", () => {
    const tokenAdmin = localStorage.getItem("token_admin");
    if (!tokenAdmin) {
        alert("Vui lòng đăng nhập Admin!");
        window.location.href = "../index.html";
        return;
    }

    const socket = window.socket = io(window.AppConfig.getSocketUrl()); // Lưu socket

    // Khi connect xong, request online list ngay lập tức
    socket.on("connect", () => {
        console.log("Admin socket connected:", socket.id);
        socket.emit("request_online_list"); // yêu cầu server gửi danh sách hiện tại
    });

    // Nhận danh sách online
    socket.on("online_list", (list) => {
        const normalUsers = list.filter(u => (u.role || "").toLowerCase() !== "admin");
        document.getElementById("onlineCount").textContent = normalUsers.length;

        // Cập nhật bảng user realtime
        loadUsers();
    });

    // Load tổng số người dùng
    async function loadTotalUsers() {
        try {
            const res = await fetch(window.AppConfig.getApiUrl("/api/auth/total"), {
                headers: { "Authorization": `Bearer ${tokenAdmin}` }
            });
            if (!res.ok) throw new Error("Không có quyền truy cập API!");
            const data = await res.json();
            document.getElementById("totalUserCount").textContent = data.total;
        } catch (err) {
            console.error("Lỗi:", err);
            document.getElementById("totalUserCount").textContent = 0;
        }
    }
    loadTotalUsers();

    // Logout admin
    document.getElementById("btnLogout").addEventListener("click", () => {
        if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;

        localStorage.removeItem("token_admin");
        localStorage.removeItem("userId_admin");
        localStorage.removeItem("role_admin");
        window.location.href = "../index.html";
    });
    window.addEventListener("beforeunload", (e) => {
        logoutAdmin();
    });
    async function loadUsers() {
        const res = await fetch(window.AppConfig.getApiUrl("/api/auth/users/status"), {
            headers: { "Authorization": `Bearer ${tokenAdmin}` }
        });
        const users = await res.json();

        const tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";

        users.forEach(u => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${u.TaiKhoan}</td>
                <td>${u.Email}</td>
                <td><span class="${u.TrangThai === 'online' ? 'status-online' : 'status-offline'}">${u.TrangThai}</span></td>
                <td>${formatDateTime(u.TGDangNhap)}</td>
                <td>${u.LanDangNhapCuoi}</td>
            `;
            tbody.appendChild(tr);
        });
    }
    loadUsers();
});

function formatDateTime(dateString) {
    if (!dateString) return "Chưa từng đăng nhập";
    const date = new Date(dateString);
    date.setHours(date.getHours() - 7);
    return date.toLocaleString("vi-VN", { hour12: false });
}

