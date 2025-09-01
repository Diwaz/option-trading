// server.js
import { createClient } from 'redis';
import WebSocket, { WebSocketServer } from "ws";

// This array will ONLY store clients that have successfully subscribed.
// set avoid storing dublicates
let subscribedUsers = new Set<WebSocket>(); 

interface Ticker {
  symbol: string,
  buyPrice: number,
  sellPrice: number,
  decimals: number
}

interface priceUpdates {
  buyPrice:number,
  sellPrice:number,
  symbol:string,
  decimals: number
}
interface marketData {
  price_updates: priceUpdates;
}

let marketData = {
   price_updates: [
    {
      symbol: "BTC",
      buyPrice: 1002000000, // decimal is 4
      sellPrice: 1000000000,
      decimals: 4,
    },
    {
      symbol: "SOL",
      buyPrice: 2000000,
      sellPrice: 1900000,
      decimals: 4,
    },
    {
      symbol: "ETH",
      buyPrice: 44000000,
      sellPrice: 43900000,
      decimals: 4,
    }
  ]
};

function updatePrice(symbol: string, newBuy: number, newSell: number) {
  const entry:priceUpdates | undefined = marketData.price_updates.find(item => item.symbol === symbol);

  if (entry) {
    entry.buyPrice = newBuy;
    entry.sellPrice = newSell;
  } else {
    // optional: add new symbol if not found
    marketData.price_updates.push({
      symbol,
      buyPrice: newBuy,
      sellPrice: newSell,
      decimals: 4
    });
  }
}
const subscribeToRedis = async () => {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const subscriber = client.duplicate();
  await subscriber.connect();

  // Subscribe to the 'btcusdt' channel on Redis
  await subscriber.subscribe('tradeData', (message) => {
    const dataJSON: Ticker = JSON.parse(message);
    // console.log(`[Redis] Received:`,dataJSON); // Log message from Redis
    updatePrice(dataJSON.symbol, dataJSON.buyPrice, dataJSON.sellPrice)
    // console.log(marketData);

    // Send the message to every client in our Set of subscribers
    subscribedUsers.forEach((ws) => {
      // Ensure the client is still connected before sending
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(marketData));
      }
    });
  });
};

// Start the Redis subscription logic
subscribeToRedis().catch(console.error);

// Create a new WebSocket server on port 8080.
const wss = new WebSocketServer({ port: 8080 });
console.log(" WebSocket server started on ws://localhost:8080");

wss.on('connection', function connection(ws:WebSocket) {


  subscribedUsers.add(ws);


  ws.on('close', () => {
    console.log(' A client has disconnected.');

    // 4. Remove the disconnected client from the Set of subscribers
    subscribedUsers.delete(ws);

    console.log(`Removed subscriber. Remaining subscribers: ${subscribedUsers.size}`);
  });

  ws.on('error', console.error);
});
