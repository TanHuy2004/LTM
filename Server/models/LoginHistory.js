const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const User = require("./User");

const LoginHistory = sequelize.define("LichSuDangNhap", {
  ID_LichSu: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  ID_Taikhoan: { type: DataTypes.INTEGER, allowNull: false },
  TGDangNhap: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
}, {
  tableName: "LichSuDangNhap",
  timestamps: false
});

LoginHistory.belongsTo(User, { foreignKey: "ID_Taikhoan" });
User.hasMany(LoginHistory, { foreignKey: "ID_Taikhoan" });
module.exports = LoginHistory;
