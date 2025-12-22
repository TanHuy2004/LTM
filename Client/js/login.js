document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const alertDiv = document.getElementById("alertUnusual");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch(window.AppConfig.getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Kiểm tra login bất thường
      if (data.isUnusual) {
        alertDiv.textContent = "Phát hiện đăng nhập bất thường từ IP khác!";
        alertDiv.style.display = "block";
      } else {
        alertDiv.style.display = "none";
      }

      // Phân biệt Admin và User
if (data.user.role.toLowerCase() === "admin") {
    localStorage.setItem("token_admin", data.token);
    localStorage.setItem("userId_admin", data.user.id);
    localStorage.setItem("role_admin", data.user.role);

    // 🔥 EMIT ONLINE CHO ADMIN
    const socketAdmin = io(window.AppConfig.getSocketUrl());
    socketAdmin.emit("user_online", { token: data.token });

    window.location.href = "../admin/trangchuAdmin.html";
} else {
    localStorage.setItem("token_user", data.token);
    localStorage.setItem("userId_user", data.user.id);
    localStorage.setItem("role_user", data.user.role);

    // 🔥 EMIT ONLINE CHO USER
    const socketUser = io(window.AppConfig.getSocketUrl());
    socketUser.emit("user_online", { token: data.token });

    window.location.href = "../index.html";
}

    } catch (err) {
      console.error("Lỗi FE:", err);
      alert("Không thể kết nối đến server!");
    }
  });
});
