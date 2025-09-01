import express from "express";

const router = express.Router();

// In-memory balances per userId
//  { "uuid-123": { usdBalance : 1000  } }
const balances: Record<string, any> = {};

// GET /balance
router.get("/", (req, res) => {
  const  {userId}  = req.body;

  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId query parameter is required" });
  }

  const usd_balance = balances[userId];
  console.log(usd_balance);
  if (!usd_balance) {
    return res.status(404).json({ error: "Balance not found for this user" });
  }

  res.json(usd_balance);
});

// Helper function (to be called in auth.ts on registration)
export const initBalanceForUser = (userId: string) => {
  balances[userId] = { usd_balance:  500000  }; // default starting balance
};
export const updateBalanceForClosedOrder = (userId:string,pnl:number) => {
  let userBalance = balances[userId];
  userBalance.usd_balance += pnl;
}
export const updateBalanceForUser = (
  userId:string,
  token :string ,
  price : number ,
  leverage:number,
  margin: number,
  type : "buy" | "sell",
)=>{

      let userBalance = balances[userId];
      console.log("type of trade",margin/1e2);
      
      if (type === "buy"){
        // deduct user balance
        // 1 . get margin 
        userBalance.usd_balance -= (margin/1e2);
        console.log('stock buy worth',margin);

      }
      if (type === "sell"){
        userBalance.usd_balance -= (margin/1e2);
      }
//   // BUY-SELL WITHOUT LEVERAGE 
//     // if (!leverage){

//     // }
//     const userBalance = balances[userId]
//     let qty = Math.trunc(margin)
// if (type === "buy") {
//     // Deduct USD
//     userBalance.usd.qty -= ;

//     // Add token
//     if (!userBalance[token]) {
//       userBalance[token] = { qty: 0, type: "buy" };
//     }
//     userBalance[token].qty += margin;
//     userBalance[token].type = "buy";
//   }

//   if (type === "sell") {
//     // Add USD
//     userBalance.usd.qty +=  (margin/1e2);

//     // Deduct token
//     if (!userBalance[token]) {
//       userBalance[token] = { qty: 0, type: "sell" };
//     }
//     userBalance[token].qty -= margin;
//     if (userBalance[token].qty < 0) userBalance[token].qty = 0;
//     userBalance[token].type = "sell";
//   }

}

export default router;
