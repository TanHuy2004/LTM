const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const Status = require("../models/Status");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = process.env.JWT_SECRET || "default_secret_key";

// Hàm lấy IP chuẩn hóa
function getClientIp(req) {
  let ip =
    req.headers["x-forwarded-for"] ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress;
  if (!ip) return "unknown";

  if (ip.includes(",")) ip = ip.split(",")[0].trim();
  if (ip === "::1" || ip === "127.0.0.1") ip = "127.0.0.1";
  if (ip.startsWith("::ffff:")) ip = ip.replace("::ffff:", "");

  return ip;
}

const LoginController = {
  async login(req, res) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ tài khoản và mật khẩu!",
        });
      }

      const user = await User.findOne({ where: { TaiKhoan: username.trim() } });
      if (!user)
        return res
          .status(400)
          .json({ success: false, message: "Tài khoản không tồn tại!" });

      const isMatch = await bcrypt.compare(password, user.MatKhau);
      if (!isMatch)
        return res
          .status(400)
          .json({ success: false, message: "Mật khẩu không chính xác!" });

      const ip = getClientIp(req);

      // Kiểm tra login bất thường
      const lastStatus = await Status.findOne({
        where: { ID_Taikhoan: user.ID_Taikhoan },
        order: [["ThoiGianCapNhat", "DESC"]],
      });
      const isUnusual = lastStatus && lastStatus.Ip && lastStatus.Ip !== ip;

      // Tạo mới dòng Status mỗi lần login
      await Status.create({
        ID_Taikhoan: user.ID_Taikhoan,
        TrangThai: "online",
        Ip: ip,
        ThoiGianCapNhat: new Date(),
      });

      // Ghi lịch sử login
      await LoginHistory.create({
        ID_Taikhoan: user.ID_Taikhoan,
        TGDangNhap: new Date(),
      }).catch((err) => console.error("Lỗi ghi LoginHistory:", err));

      const token = jwt.sign(
        { id: user.ID_Taikhoan, role: user.VaiTro || "User" },
        SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({
        success: true,
        message: "Đăng nhập thành công!",
        token,
        isUnusual,
        user: {
          id: user.ID_Taikhoan,
          username: user.TaiKhoan,
          email: user.Email || "",
          role: user.VaiTro || "User",
        },
      });
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi server, không thể đăng nhập!",
        error: error.message,
      });
    }
  },
};

module.exports = LoginController;
