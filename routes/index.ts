import express from "express";
import usersRouter from "./users.js";
import tradeRouter from "./tradeData.js";
import authRoutes from './auth.js'
import balanceRoutes from './balances.js'
import orderRoutes from './order.js'
import priceRoutes from './price.js'

const router = express.Router();

// Home & About
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Home endpoint" });
});

router.get("/about", (req, res) => {
  res.json({ message: "This is the About endpoint" });
});

// Other route groups
router.use("/users", usersRouter);
router.use("/trade", tradeRouter);
router.use("/auth", authRoutes);
router.use("/balances", balanceRoutes);
router.use("/order", orderRoutes);
router.use("/getPrice",priceRoutes);



export default router;
