require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mssql',
    dialectOptions: {
      encrypt: false,
      enableArithAbort: true
    },
    logging: false,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✔ SQL Server connected via Sequelize!");
    return sequelize;
  } catch (error) {
    console.error("❌ Sequelize connection error:", error);
    throw error;
  }
}

module.exports = { sequelize, connectDB };
