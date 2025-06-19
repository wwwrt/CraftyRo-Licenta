import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const db = {
  NAME: process.env.DB_NAME || "Crafty",
  USERNAME: process.env.DB_USERNAME || "Crafty",
  PASSWORD: process.env.DB_PASSWORD || "password",
  options: {
    dialect: "mysql",
    timezone: "+00:00",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    logging: function (str) {
      console.log(str);
    },
  },
};

export const sequelize = new Sequelize(
  db.NAME,
  db.USERNAME,
  db.PASSWORD,
  db.options
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();
