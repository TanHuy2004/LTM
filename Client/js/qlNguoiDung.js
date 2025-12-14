const allUsersTab = document.querySelector(".tab-link.active-tab"); // Tất cả người dùng
const activeUsersTab = document.getElementById("activeUsersTab");
let allUsersList = [];  
document.addEventListener("DOMContentLoaded", async () => {
    const tokenAdmin = localStorage.getItem("token_admin");
    if (!tokenAdmin) {
        alert("Vui lòng đăng nhập Admin!");
        window.location.href = "../index.html";
        return;
    }

    // Logout Admin
    document.getElementById("btnLogout").addEventListener("click", () => {
        localStorage.removeItem("token_admin");
        localStorage.removeItem("userId_admin");
        localStorage.removeItem("role_admin");
        window.location.href = "../index.html";
    });

    const tbody = document.getElementById("userTableBody");

    try {
        const res = await fetch("http://localhost:5000/api/auth/users", {
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        const users = await res.json();

        allUsersList = users.filter(user => user.VaiTro.toLowerCase() !== 'admin');

        renderUsers(allUsersList); // render tất cả user lúc đầu

    } catch (err) {
        console.error("Lỗi khi tải người dùng:", err);
        tbody.innerHTML = '<tr><td colspan="5">Không thể tải dữ liệu người dùng.</td></tr>';
    }
});


// Hàm delete
async function deleteUser(id) {
    const confirmDelete = confirm("Bạn có chắc muốn xóa tài khoản này?");
    if (!confirmDelete) return;

    const tokenAdmin = localStorage.getItem("token_admin");

    try {
        const res = await fetch(`http://localhost:5000/api/auth/users/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenAdmin}` }
        });
        const data = await res.json();
        alert(data.message);
        location.reload(); // load lại trang sau khi xóa
    } catch (err) {
        console.error("Lỗi khi xóa user:", err);
        alert("Xóa thất bại!");
    }
}

const addUserBtn = document.querySelector(".add-user-btn");
const addUserModal = document.getElementById("addUserModal");
const closeModal = addUserModal.querySelector(".close");

// Mở modal khi click nút
addUserBtn.addEventListener("click", () => {
    addUserModal.style.display = "block";
});

// Đóng modal khi click X
closeModal.addEventListener("click", () => {
    addUserModal.style.display = "none";
});

// Đóng modal khi click ra ngoài
window.addEventListener("click", (e) => {
    if (e.target == addUserModal) {
        addUserModal.style.display = "none";
    }
});

const addUserForm = document.getElementById("addUserForm");

addUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("newUsername").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const password = document.getElementById("newPassword").value.trim();

    if (!username || !email || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    const tokenAdmin = localStorage.getItem("token_admin");

    try {
        const res = await fetch("http://localhost:5000/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${tokenAdmin}`
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (data.success) {
            alert(data.message);
            addUserModal.style.display = "none";
            location.reload(); // load lại danh sách user
        } else {
            alert(data.message || "Thêm user thất bại!");
        }
    } catch (err) {
        console.error("Lỗi khi thêm user:", err);
        alert("Thêm user thất bại!");
    }
});

// Hàm render danh sách user
function renderUsers(users) {
    
    const tbody = document.getElementById("userTableBody");
    tbody.innerHTML = users.map(user => `
        <tr class="table-row">
            <td class="table-cell">
                <div class="user-cell">
                    <span class="user-name-table">${user.TaiKhoan}</span>
                </div>
            </td>
            <td class="table-cell">
                <div class="status-cell">
                    <span class="status-dot ${user.TrangThai === 'online' ? 'online' : 'offline'}"></span>
                    <span class="${user.TrangThai === 'online' ? 'text-green' : 'text-red'}">
                        ${user.TrangThai || 'Không xác định'}
                    </span>
                </div>
            </td>
            <td class="table-cell secondary-text">${user.VaiTro}</td>
            <td class="table-cell secondary-text">${user.Email}</td>
            <td class="table-cell action-cell">
                <button class="btn-delete" onclick="deleteUser(${user.ID_Taikhoan})">Xóa
                </button>
            </td>
        </tr>
    `).join("");
}

// Xử lý click tab
allUsersTab.addEventListener("click", (e) => {
    e.preventDefault();
    allUsersTab.classList.add("active-tab");
    activeUsersTab.classList.remove("active-tab");
    renderUsers(allUsersList);
});

activeUsersTab.addEventListener("click", (e) => {
    e.preventDefault();
    activeUsersTab.classList.add("active-tab");
    allUsersTab.classList.remove("active-tab");
    // Lọc chỉ những user online
    const onlineUsers = allUsersList.filter(user => user.TrangThai === 'online');
    renderUsers(onlineUsers);
});