// public/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  const btnRegister = document.querySelector(".btn-primary");

  btnRegister.addEventListener("click", async () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !email || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message); // thông báo lỗi từ backend
        return;
      }

      alert(data.message || "Đăng ký thành công!");
      window.location.href = "./login.html";

    } catch (error) {
      console.error("Lỗi FE:", error);
      alert("Không thể kết nối server!");
    }
  });

  // ẨN/HIỆN MẬT KHẨU
  const passwordInput = document.getElementById("password");
  const toggleBtn = document.getElementById("togglePassword");
  const iconEye = document.getElementById("iconEye");

  toggleBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      iconEye.textContent = "visibility_off";
    } else {
      passwordInput.type = "password";
      iconEye.textContent = "visibility";
    }
  });
});
