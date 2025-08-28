import express from "express";
import { randomUUID } from "crypto";
import { initBalanceForUser } from "./balances";

const router = express.Router();

// In-memory "database"
const users: Record<string, { username: string; password: string }> = {};

// Register
router.post("/signup", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  // check if already exists
  const exists = Object.values(users).some(u => u.username === username);
  if (exists) {
    return res.status(400).json({ error: "User already exists" });
  }

  const userId = randomUUID();
  initBalanceForUser(userId);
  users[userId] = { username, password };

  res.json({ message: "User registered successfully", userId });
});

// Login
router.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const entry = Object.entries(users).find(
    ([, u]) => u.username === username && u.password === password
  );

  if (!entry) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const [userId] = entry;
  res.json({ message: "Login successful", userId });
});

export default router;
