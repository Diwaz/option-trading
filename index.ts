// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import routes from './routes/index.ts'


dotenv.config();

const app = express();

// Middleware
app.use(express.json()); 
app.use(cors());         
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
// Routes
app.use("/", routes);



// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
