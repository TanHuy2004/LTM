// ================== BIẾN TOÀN CỤC ==================
let socket;
let allUsersList = [];
let usersLoaded = false;   // 👈 QUAN TRỌNG

// ================== DOM READY ==================
document.addEventListener("DOMContentLoaded", async () => {
    const tokenAdmin = localStorage.getItem("token_admin");
    if (!tokenAdmin) {
        alert("Vui lòng đăng nhập Admin!");
        window.location.href = "../index.html";
        return;
    }

    // ================== SOCKET ==================
    socket = io(window.AppConfig.getSocketUrl(), {
        transports: ["websocket"],
        reconnection: true
    });

    socket.on("connect", () => {
        console.log("Admin socket connected:", socket.id);
        socket.emit("user_online", { token: tokenAdmin });
        socket.emit("request_online_list");
    });

    // ===== REALTIME ONLINE LIST =====
    socket.on("online_list", (onlineList = []) => {
        console.log("ONLINE LIST:", onlineList);

        // ---- CARD: SỐ NGƯỜI ONLINE ----
        const onlineCountEl = document.getElementById("onlineUserCount");
        if (onlineCountEl) {
            onlineCountEl.textContent = onlineList.length;
        }

        // ---- CHƯA LOAD USER → DỪNG ----
        if (!usersLoaded) return;

        const onlineMap = new Map(
            onlineList.map(u => [Number(u.userId), true])
        );

        allUsersList = allUsersList.map(u => ({
            ...u,
            TrangThai: onlineMap.has(Number(u.ID_Taikhoan))
                ? "online"
                : "offline"
        }));

        renderUsers(allUsersList);
    });

    // ================== LOGOUT (CHỜ CALLBACK) ==================
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", e => {
            e.preventDefault();
            if (!confirm("Bạn có chắc muốn đăng xuất không?")) return;

            socket.emit("user_offline", { token: tokenAdmin }, () => {
                localStorage.clear();
                window.location.href = "../index.html";
            });
        });
    }

    // ================== TOTAL USERS ==================
    const totalUserEl = document.getElementById("totalUserCount");
    if (totalUserEl) {
        try {
            const res = await fetch(
                window.AppConfig.getApiUrl("/api/auth/total"),
                { headers: { Authorization: `Bearer ${tokenAdmin}` } }
            );
            const data = await res.json();
            totalUserEl.textContent = data.total || 0;
        } catch {
            totalUserEl.textContent = 0;
        }
    }

    // ================== LOAD DATA ==================
    await loadAllUsers();  // 👈 LOAD TRƯỚC
    loadUsers();           // dashboard table
});

// ================== FUNCTIONS ==================

async function loadAllUsers() {
    const tokenAdmin = localStorage.getItem("token_admin");
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    try {
        const res = await fetch(
            window.AppConfig.getApiUrl("/api/auth/users"),
            { headers: { Authorization: `Bearer ${tokenAdmin}` } }
        );

        allUsersList = await res.json();
        usersLoaded = true;
        renderUsers(allUsersList);
    } catch {
        tbody.innerHTML = `<tr><td colspan="5">Không thể tải dữ liệu</td></tr>`;
    }
}

function renderUsers(users = []) {
    const tbody = document.getElementById("userTableBody");
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.TaiKhoan || ""}</td>
            <td class="${u.TrangThai === "online" ? "text-green" : "text-red"}">
                ${u.TrangThai || "offline"}
            </td>
            <td>${u.VaiTro || ""}</td>
            <td>${u.Email || ""}</td>
                <td>
                    <button class="delete-btn" onclick="deleteUser(${u.ID_Taikhoan})">Xóa</button>
                </td>
        </tr>
    `).join("");
}

async function deleteUser(id) {
    if (!confirm("Xóa tài khoản này?")) return;

    const tokenAdmin = localStorage.getItem("token_admin");
    await fetch(
        window.AppConfig.getApiUrl(`/api/auth/users/${id}`),
        { method: "DELETE", headers: { Authorization: `Bearer ${tokenAdmin}` } }
    );

    await loadAllUsers();
}

async function loadUsers() {
    const tokenAdmin = localStorage.getItem("token_admin");
    const tbody = document.getElementById("tablebody");
    if (!tbody) return;

    try {
        const res = await fetch(
            window.AppConfig.getApiUrl("/api/auth/users/status"),
            { headers: { Authorization: `Bearer ${tokenAdmin}` } }
        );

        const users = await res.json();
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.TaiKhoan}</td>
                <td>${u.Email}</td>
                <td class="${u.TrangThai === "online" ? "text-green" : "text-red"}">
                    ${u.TrangThai || "offline"}
                </td>
                <td>${formatDateTime(u.TGDangNhap)}</td>
                <td>${u.LanDangNhapCuoi || ""}</td>
            </tr>
        `).join("");
    } catch {
        tbody.innerHTML = `<tr><td colspan="5">Không tải được dữ liệu</td></tr>`;
    }
}

function formatDateTime(dateString) {
    if (!dateString) return "Chưa từng đăng nhập";
    return new Date(dateString).toLocaleString("vi-VN", { hour12: false });
}

// ================== ADD USER MODAL ==================
const addUserModal = document.getElementById("addUserModal");
const addUserBtn = document.querySelector(".add-user-btn");

if (addUserModal && addUserBtn) {
    const closeModal = addUserModal.querySelector(".close");
    const addUserForm = document.getElementById("addUserForm");

    // Mở modal
    addUserBtn.onclick = () => addUserModal.style.display = "block";

    // Đóng modal bằng nút X
    closeModal && (closeModal.onclick = () => addUserModal.style.display = "none");

    // Đóng modal khi click ra ngoài
    window.onclick = e => {
        if (e.target === addUserModal) addUserModal.style.display = "none";
    };

    // Submit form thêm user
    addUserForm && addUserForm.addEventListener("submit", async e => {
        e.preventDefault();

        const tokenAdmin = localStorage.getItem("token_admin");
        if (!tokenAdmin) {
            alert("Token admin không tồn tại, vui lòng đăng nhập lại!");
            return;
        }

        const username = document.getElementById("newUsername")?.value.trim();
        const email = document.getElementById("newEmail")?.value.trim();
        const password = document.getElementById("newPassword")?.value.trim();

        if (!username || !email || !password) {
            alert("Vui lòng nhập đầy đủ thông tin!");
            return;
        }
        console.log("Thêm user:", { username, email, password });

        try {
            const res = await fetch(window.AppConfig.getApiUrl("/api/auth/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${tokenAdmin}`
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                alert((data.message ));
                console.error("Server response:", data);
                return;
            }

            alert(data.message || "Thêm user thành công!");
            addUserModal.style.display = "none";
            await loadAllUsers();
        } catch (err) {
            console.error("Lỗi khi thêm user:", err);
            alert("Thêm user thất bại! Kiểm tra console để biết chi tiết.");
        }
    });
}
// ================== SEARCH ==================
const searchInput = document.querySelector(".search-input-small");
if (searchInput) {
    searchInput.addEventListener("input", () => {
        const keyword = searchInput.value.trim().toLowerCase();

        const filteredUsers = allUsersList.filter(u =>
            u.TaiKhoan?.toLowerCase().includes(keyword)
        );

        renderUsers(filteredUsers);
    });
}
// --- TAB SWITCH ---
const tabLinks = document.querySelectorAll(".tab-link");

tabLinks.forEach(tab => {
    tab.addEventListener("click", e => {
        e.preventDefault();

        // Xóa active-tab cũ
        tabLinks.forEach(t => t.classList.remove("active-tab"));

        // Thêm active-tab cho tab vừa click
        tab.classList.add("active-tab");

        // Kiểm tra tab đang chọn
        if (tab.id === "activeUsersTab") {
            // Hiển thị chỉ user online
            const onlineUsers = allUsersList.filter(u => u.TrangThai === "online");
            renderUsers(onlineUsers);
        } else {
            // Hiển thị tất cả user
            renderUsers(allUsersList);
        }
    });
});
