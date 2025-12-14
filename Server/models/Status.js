const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const Status = sequelize.define("TrangThai", {
  ID_TrangThai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_Taikhoan: { type: DataTypes.INTEGER, allowNull: false, unique: true }, // <-- thêm unique
  TrangThai: { type: DataTypes.STRING(50), allowNull: true },
  ThoiGianCapNhat: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
  Ip: { type: DataTypes.STRING, allowNull: true }
}, {
  tableName: "TrangThai",
  timestamps: false
});


Status.belongsTo(User, { foreignKey: "ID_Taikhoan" });
User.hasMany(Status, { foreignKey: "ID_Taikhoan" });
module.exports = Status;
