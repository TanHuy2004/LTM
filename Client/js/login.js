document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

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

      // Phân biệt Admin và User
      if (data.user.role.toLowerCase() === "admin") {
        localStorage.setItem("token_admin", data.token);
        localStorage.setItem("userId_admin", data.user.id);
        localStorage.setItem("role_admin", data.user.role);

        window.location.href = "../admin/trangchuAdmin.html";
      } else {
        localStorage.setItem("token_user", data.token);
        localStorage.setItem("userId_user", data.user.id);
        localStorage.setItem("role_user", data.user.role);
        window.location.href = "../index.html";
      }

      // Kết nối Socket
      const socket = io(window.AppConfig.getSocketUrl());
      socket.emit("user_online", { token: data.token });

    } catch (err) {
      console.error("Lỗi FE:", err);
      alert("Không thể kết nối đến server!");
    }
  });
});
