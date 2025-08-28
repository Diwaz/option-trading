import express from "express";
import {Client} from 'pg';

const pgClient = new Client({
  user: 'optionTradTest',
  host: 'localhost',
  database:'postgres',
  password:'admin',
  port: 5430,
})
pgClient.connect();

const router = express.Router();
router.get("/", async (req, res) => {
  var query = `SELECT * FROM klines_1h`
  try {
      const result = await pgClient.query(query)
      res.json(result.rows.map(x=>({
        open: x.open,
        close: x.close,
        high: x.high,
        low: x.low,
        timestamp: x.bucket
      })));
  }catch(err){
    console.log(err);
    res.status(500).send(err);
  }

});

export default router;
