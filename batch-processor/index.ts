// consumer.js
import { createClient } from "redis";
import { InfluxDB, Point } from '@influxdata/influxdb-client'

const token = process.env.DB_CONNECTION_STRING;
const url = 'http://localhost:8086';
const org = `super30`;
const bucket = `prod_data_opt`;

const client = new InfluxDB({ url, token });
const redis = createClient({ url: "redis://localhost:6379" });


redis.on("error", (err) => console.error("Redis Client Error", err));

await redis.connect();
interface KlineData {
  token: string,
  count: number,
  openingPrice: string,
  closingPrice: string,
  high: number,
  low: number

}
let tradeCollection: any[] = [];
let KlineSeries : KlineData[]=[];

// Consumer loop: keeps filling tradeCollection
async function consumeQueue(queueName: string) {
  while (true) {
    const data = await redis.brPop(queueName, 0);
   
    if (data) {
      const { element } = data;
      try {
        const trade = JSON.parse(element); // ensure JSON
        tradeCollection.push(trade);
      } catch (err) {
        console.error("Invalid JSON:", err);
      }
    }
  }
}

// Start consuming
consumeQueue("kline");

// Process every 15 sec
setInterval(() => {
  if (tradeCollection.length > 0) {
    // Cut out everything collected in last 15s
    const batch = tradeCollection.splice(0, tradeCollection.length);

    // Example processing:
    const token = batch[0]?.s;
    const openingPrice = batch[0]?.p;
    const closingPrice = batch[batch.length - 1]?.p;
    const high = Math.max(...batch.map((t) => t.p));
    const low = Math.min(...batch.map((t) => t.p));

    // console.log("Batch (15s):", {
    //   count: batch.length,
    //   openingPrice,
    //   closingPrice,
    //   high,
    //   low,
    // });
    // processedBatch.push()
     const klineData: KlineData = {
      token: token,
      count: batch.length,
      openingPrice,
      closingPrice,
      high,
      low,
    };

    KlineSeries.push(klineData);

    console.log(KlineSeries);
    dbWriter(klineData);
    queryData();

    // Now tradeCollection is empty, ready for next 15s
  } else {
    console.log("No trades in this 15s window");
  }
}, 15_000);

const dbWriter = async (trade:KlineData) => {

  // your trade data
   const writeClient = client.getWriteApi(org, bucket, 'ns'); // precision ns
  

  // create point
  const point = new Point('kline') // measurement name
    .tag('token', trade.token)
    .intField('count', trade.count)
    .floatField('openingPrice', parseFloat(trade.openingPrice))
    .floatField('closingPrice', parseFloat(trade.closingPrice))
    .floatField('high', trade.high)
    .floatField('low', trade.low);

  // write point
  writeClient.writePoint(point);

  try {
    await writeClient.flush(); // ensure flush to DB
    console.log("Data written to InfluxDB");
  } catch (err) {
    console.error(" Write error:", err);
  } finally {
    writeClient.close().then(() => console.log("✦ Writer closed"));
  }
};
const queryData = async () => {
    const queryClient = client.getQueryApi(org);
 const fluxQuery = `
from(bucket: "${bucket}")
  |> range(start: -10m)
  |> filter(fn: (r) => r._measurement == "kline")
  |> filter(fn: (r) => r.token == "BTCUSDT")
  |> pivot(rowKey:["_time"], columnKey:["_field"], valueColumn:"_value")
`;


  console.log("🔍 Running query...");
  await queryClient.queryRows(fluxQuery, {
    next: (row: any, tableMeta: any) => {
      const obj = tableMeta.toObject(row);
      console.log(obj);
    },
    error: (error: any) => {
      console.error('Query error:', error);
    },
    complete: () => {
      console.log(' Query completed');
    },
  });
};
