import { DataTypes } from "sequelize";
import { sequelize } from "../db.js";
import { Product } from "./Product.js";
import { User } from "./User.js";

export const Reviews = sequelize.define(
  "Reviews",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      references: {
        model: Product,
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: false,
  }
);

Reviews.belongsTo(Product, { foreignKey: "productId" });
Reviews.belongsTo(User, { foreignKey: "userId" });
