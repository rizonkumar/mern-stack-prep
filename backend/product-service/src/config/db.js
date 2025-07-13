const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // Set to true to see SQL queries in console (useful for debugging)
    pool: {
      // Connection pool options
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `MySQL Connected (Product Service): ${process.env.DB_HOST}/${process.env.DB_NAME}`
    );
  } catch (error) {
    console.error(`Error (Product Service - MySQL): ${error.message}`);
    console.error("Sequelize connection error:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
