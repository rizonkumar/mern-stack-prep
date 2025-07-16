const { Sequelize } = require("sequelize");
const Redis = require("ioredis");

const sequelize = new Sequelize(
  process.env.PG_DATABASE,
  process.env.PG_USER,
  process.env.PG_PASSWORD,
  {
    host: process.env.PG_HOST,
    dialect: process.env.PG_DIALECT,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on("connect", () => console.log("Redis Connected (Cart Service)"));
redisClient.on("error", (err) =>
  console.error("Redis Error (Cart Service):", err)
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(
      `PostgreSQL Connected (Cart Service): ${process.env.PG_HOST}/${process.env.PG_DATABASE}`
    );

    // await sequelize.sync({ alter: true }); // Will add this after defining models
    // console.log("Cart table synchronized successfully.");
  } catch (error) {
    console.error(`Error (Cart Service - PostgreSQL): ${error.message}`);
    console.error("Sequelize PostgreSQL connection error:", error);
    process.exit(1);
  }
};

module.exports = { sequelize, redisClient, connectDB };
