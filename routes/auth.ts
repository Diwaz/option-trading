import express from "express";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { initBalanceForUser } from "./balances";


const router = express.Router();
// In-memory "database"
export const users: Record<string, { username: string; password: string }> = {};

// Register
router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(403).json({ message: "Error while signing up" });
  }

  // check if already exists
  const exists = Object.values(users).some(u => u.username === username);
  if (exists) {
    return res.status(403).json({ message: "Error while signing up" });
  }

  const userId = randomUUID();
  initBalanceForUser(userId);
  users[userId] = { username, password };

  res.json({ message: userId });
});

// Login
router.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const entry = Object.entries(users).find(
    ([, u]) => u.username === username && u.password === password
  );

  if (!entry) {
    return res.status(403).json({ message: "Incorret credentials" });
  }
  const [userId] = entry;
  const payload = {userId,username}
  const token = jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:"1h"});
  res.json({token});
});

export default router;
