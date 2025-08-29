// server.js
import { createClient } from 'redis';
import WebSocket, { WebSocketServer } from 'ws';
import type {Trade} from '../poller-be/index';

// This array will ONLY store clients that have successfully subscribed.
let subscribedUsers = new Set(); // Using a Set is better to prevent duplicates.
interface spreadData {
  s: String,
  bid: number,
  ask: number,

}
const subscribeToRedis = async () => {
  const client = createClient({ url: 'redis://localhost:6379' });
  await client.connect();

  const subscriber = client.duplicate();
  await subscriber.connect();

  // Subscribe to the 'btcusdt' channel on Redis
  await subscriber.subscribe('tradeData', (message) => {
    const dataJSON:Trade = JSON.parse(message);
    // console.log(`[Redis] Received:`,dataJSON); // Log message from Redis
    console.log(message);
    // const spreadData: spreadData = {
    //   bid : dataJSON.p * 1.02,
    //   ask : dataJSON.p * 0.98,
    //   s : dataJSON.s
    // }  
    
    // Send the message to every client in our Set of subscribers
    subscribedUsers.forEach((ws) => {
      // Ensure the client is still connected before sending
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  });
};

// Start the Redis subscription logic
subscribeToRedis().catch(console.error);

// Create a new WebSocket server on port 8080.
const wss = new WebSocketServer({ port: 8080 });
console.log("🚀 WebSocket server started on ws://localhost:8080");

wss.on('connection', function connection(ws) {
  console.log('🎉 A new client connected!');
  ws.send(JSON.stringify({ message: 'Welcome! Please send a SUBSCRIBE message.' }));

  ws.on('message', function message(data) {
    try {
      // 1. Always parse incoming messages from clients
      const incomingMessage = JSON.parse(data.toString());
      console.log('📥 Received message:', incomingMessage);

      // 2. Check the message type for a subscription request
      if (incomingMessage.type === 'SUBSCRIBE' && incomingMessage.data?.stock === 'btcusdt') {
        console.log('✅ Client subscribed to btcusdt');
        
        // 3. Add this specific client (ws) to the Set of subscribers
        subscribedUsers.add(ws); 
        
        ws.send(JSON.stringify({ status: 'success', message: 'You are now subscribed to btcusdt.' }));
      } else {
        ws.send(JSON.stringify({ status: 'error', message: 'Invalid message format or stock.' }));
      }
    } catch (error) {
      console.error('Failed to parse message or invalid JSON format.');
      ws.send(JSON.stringify({ status: 'error', message: 'Invalid JSON format.' }));
    }
  });

  ws.on('close', () => {
    console.log(' A client has disconnected.');
    
    // 4. Remove the disconnected client from the Set of subscribers
    subscribedUsers.delete(ws); 
    
    console.log(`Removed subscriber. Remaining subscribers: ${subscribedUsers.size}`);
  });
  
  ws.on('error', console.error);
});