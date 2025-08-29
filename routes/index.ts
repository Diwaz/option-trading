import express from "express";
import tradeRouter from "./tradeData.js";
import authRoutes from './auth.js'
import balanceRoutes from './balances.js'
import orderRoutes from './order.js'
import priceRoutes from './price.js'
import jwt from 'jsonwebtoken';
import {users} from './auth.js';
const router = express.Router();

const authenticateUser =(req,res,next)=>{
  const authHeader = req.headers["authorization"];
  // console.log('authHeader',authHeader);
  const token = authHeader;

  if (!token){
    return res.status(401).json({
      error: "No token provided"
    })
  }
    jwt.verify(token,process.env.JWT_SECRET,(err,user)=>{
      if (err){
        return res.status(403).json({
          error: "Invaid or expired token"
        })
      }
      const {userId} = user;
      console.log('userid',user);
      const exists = Object.values(users).some(u => u.username === user.username);
      if (!exists) {
        return res.status(403).json({ message: "Error for checking reasons while signing up" });
        }


      if (!req.body) req.body = {};
      req.body.userId = userId;
      // console.log("userid",userId.toString());
      next();
    })
  }
  
  // Home & About
router.get("/", (req, res) => {
  res.json({ message: "Welcome to the Home endpoint" });
});

router.get("/about", (req, res) => {
  res.json({ message: "This is the About endpoint" });
});

// Other route groups
router.use("/trade", tradeRouter);
router.use("/user", authRoutes);
router.use(authenticateUser);
router.use("/balances", balanceRoutes);
router.use("/trade", orderRoutes);
router.use("/getPrice",priceRoutes);



export default router;
