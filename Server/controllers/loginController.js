const User = require("../models/User");
const LoginHistory = require("../models/LoginHistory");
const Status = require("../models/Status");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const SECRET = process.env.JWT_SECRET || "default_secret_key";

function getVNTime() {
  const d = new Date();
  d.setHours(d.getHours() + 7);
  return d;
}

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
    if (!user) {
      return res.status(400).json({ success: false, message: "Tài khoản không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(password, user.MatKhau);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Mật khẩu không chính xác!" });
    }

    const ip = getClientIp(req);

    // Lấy lần login gần nhất
    const lastStatus = await Status.findOne({
      where: { ID_Taikhoan: user.ID_Taikhoan },
      order: [["ThoiGianCapNhat", "DESC"]],
    });

    // So sánh IP
    const isUnusual = lastStatus && lastStatus.Ip && lastStatus.Ip !== ip;

    // Ghi lịch sử đăng nhập
    await LoginHistory.create({
      ID_Taikhoan: user.ID_Taikhoan,
      TGDangNhap: getVNTime(), 
    }).catch(err => console.error("Lỗi ghi LoginHistory:", err));


    const token = jwt.sign(
      { id: user.ID_Taikhoan, role: user.VaiTro || "User" },
      SECRET,
      { expiresIn: "2h" }
    );

    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công!",
      token,
      isUnusual, // trả về frontend để cảnh báo
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
