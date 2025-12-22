const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Status = require("../models/Status");
const LichSuDangNhap = require("../models/LoginHistory");


const RegisterController = {
  async create(req, res) {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) return res.status(400).json({ success: false, message: "Vui lòng nhập đầy đủ thông tin!" });

      if (await User.findOne({ where: { TaiKhoan: username } })) return res.status(400).json({ success: false, message: "Username đã tồn tại!" });
      if (await User.findOne({ where: { Email: email } })) return res.status(400).json({ success: false, message: "Email đã tồn tại!" });

      const hashed = await bcrypt.hash(password, 10);
      await User.create({ TaiKhoan: username, Email: email, MatKhau: hashed, VaiTro: "User" });

      res.status(200).json({ success: true, message: "Đăng ký thành công!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Lỗi server!", error: err.message });
    }
  },

  async getTotalUser(req, res) {
    try {
        const total = await User.count({where: {VaiTro: ["User", "Admin"]}});
      res.json({ total });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

   async getAll(req, res) {
        try {
            const users = await User.findAll({
                attributes: ['ID_Taikhoan', 'TaiKhoan', 'Email', 'VaiTro'],
                include: [{
                    model: Status,
                    attributes: ['TrangThai', 'ThoiGianCapNhat'],
                    limit: 1,
                    order: [['ThoiGianCapNhat', 'DESC']]
                }]
            });

            const result = users.map(user => {
                return {
                    ID_Taikhoan: user.ID_Taikhoan,
                    TaiKhoan: user.TaiKhoan,
                    Email: user.Email,
                    VaiTro: user.VaiTro,
                    TrangThai: user.TrangThais[0]?.TrangThai || 'offline'
                };
            });

            res.json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
    },

async getAllWithStatus(req, res) {
  try {
    const users = await User.findAll({
      attributes: ["ID_Taikhoan", "TaiKhoan", "Email", "VaiTro"],
      include: [
        {
          model: Status,
          attributes: ["TrangThai", "ThoiGianCapNhat"],
          required: false, 
        },
        {
          model: LichSuDangNhap,
          as: "LichSuDangNhaps",
          attributes: ["TGDangNhap"],
          required: false,
        },
      ],
    });

    const now = new Date();

    const result = users.map(user => {
      const status = user.TrangThais
        ?.sort((a, b) => new Date(b.ThoiGianCapNhat) - new Date(a.ThoiGianCapNhat))[0];

      const lastLogin = user.LichSuDangNhaps
        ?.sort((a, b) => new Date(b.TGDangNhap) - new Date(a.TGDangNhap))[0];

      let lanDangNhapCuoi = "Chưa từng đăng nhập";

      if (status?.TrangThai === "offline" && status?.ThoiGianCapNhat) {
        const diffMs = now - new Date(status.ThoiGianCapNhat);
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffMin < 1) lanDangNhapCuoi = "Vừa xong";
        else if (diffMin < 60) lanDangNhapCuoi = `${diffMin} phút trước`;
        else if (diffHour < 24) lanDangNhapCuoi = `${diffHour} giờ trước`;
        else lanDangNhapCuoi = `${diffDay} ngày trước`;
      }

      return {
        ID_Taikhoan: user.ID_Taikhoan,
        TaiKhoan: user.TaiKhoan,
        Email: user.Email,
        TrangThai: status?.TrangThai,
        TGDangNhap: lastLogin?.TGDangNhap || null,
        LanDangNhapCuoi:
          status?.TrangThai === "online" ? "Đang hoạt động" : lanDangNhapCuoi,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getAllWithStatus error:", err);
    res.status(500).json({ error: err.message });
  }
}


,
  async getById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) return res.status(404).json({ message: "Không tìm thấy tài khoản!" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async update(req, res) {
    try {
      const { email } = req.body;
      await User.update({ Email: email }, { where: { ID_Taikhoan: req.params.id } });
      res.json({ message: "Cập nhật thành công!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

async delete(req, res) {
  try {
    const id = Number(req.params.id);

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại!" });
    }
    
    if (user.VaiTro.toLowerCase() === "admin") {
      return res.status(403).json({
        message: "Không thể xóa tài khoản Admin!"
      });
    }

    await LichSuDangNhap.destroy({ where: { ID_Taikhoan: id } });

    await Status.destroy({ where: { ID_Taikhoan: id } });

    await User.destroy({ where: { ID_Taikhoan: id } });

    res.json({ message: "Xóa tài khoản thành công!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
};

module.exports = RegisterController;
