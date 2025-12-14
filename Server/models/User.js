const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = sequelize.define("TaiKhoan", {
  ID_Taikhoan: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  TaiKhoan: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  
  // FIX LỖI HASH BCRYPT
  MatKhau: { type: DataTypes.STRING(255), allowNull: false },

  // NÊN BẮT BUỘC EMAIL
  Email: { type: DataTypes.STRING(100), allowNull: false, unique: true },

  VaiTro: { type: DataTypes.STRING(20), allowNull: true, defaultValue: "User" },
  ThoiGianTao: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW }
}, {
  tableName: "TaiKhoan",
  timestamps: false
});
module.exports = User;
