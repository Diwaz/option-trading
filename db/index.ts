// 1. Import the libraries you need
// - `pg` is the PostgreSQL client for Node.js
// - `redis` is the Redis client
// - `DbMessage` is your own type definition for messages in the queue
import { Client } from 'pg';
import { createClient } from 'redis';

// 2. Configure PostgreSQL connection
//    - You need database credentials: user, host, db name, password, port.
//    - Create a new client instance and connect.
const pg = new Client({
    user: 'postgres',         // PostgreSQL username
    host: 'localhost',         // where the DB server is running
    database: 'postgres',   // your DB name
    password: 'admin', // password
    port: 5432,                // default PostgreSQL port
});
pg.connect(); // Establish connection

// 3. Create an async function (entry point for your app)
async function main (){
    const redis = createClient();
    await redis.connect();
    while(true){
        const response = await redis.brPop("kline",0);
        if(response){
            const {element} = response;
            try {
                const trade = JSON.parse(element);
                console.log(trade.p);
                const price = trade.p;
                const timestamp = new Date(trade.T);
                const query = 'INSERT INTO BTCUSDT (time, price) VALUES ($1, $2)';
                // TODO: How to add volume?
                console.log('val,query',timestamp,price);
                const values = [timestamp, price];
                await pg.query(query, values);
            }catch {    
                    console.error("Invalid JSON:", element);
            }
        }
    }
}
main();
    // 4. Connect to Redis
    //    - Create a client
    //    - Call `.connect()` (async)

    // 5. Start a loop to process messages from Redis queue
    //    - Here you keep listening forever
    //    - `rPop` removes the last item from the list/queue in Redis
        // Try to get a message from Redis

            // No message in queue
            // -> You could `await new Promise(r => setTimeout(r, 100));` 
            //    to avoid busy loop, but here it's left blank.
            // 6. Parse the message into your type
            //    - Messages are stored as JSON strings in Redis

            // 7. Decide what to do based on the message type

                // Extract fields from message
                // 8. Build an SQL INSERT query
                //    - Use parameterized queries ($1, $2, …) for safety (avoids SQL injection)
                
                // 9. Create the values array that matches $1, $2
                //    - timestamp = $1
                //    - price = $2
                // TODO: If you also have `volume`, add it to both the query and values array.

                // 10. Execute query
// 11. Call the main function to start everything