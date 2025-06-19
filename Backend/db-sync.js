import { sequelize } from "./db.js";

import { Category } from "./models/Category.js";
import { Order } from "./models/Order.js";
import { OrderItem } from "./models/OrderItem.js";
import { Product } from "./models/Product.js";
import { Reviews } from "./models/Reviews.js";
import { User } from "./models/User.js";
import { Video } from "./models/Video.js";

sequelize.sync({ alter: true }).then(() => {
  console.log("FINISHED SUCCESS");
  process.exit(0);
});
