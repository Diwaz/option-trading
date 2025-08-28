import { InfluxDB, Point } from '@influxdata/influxdb-client'

const token = process.env.DB_CONNECTION_STRING;
const url = 'http://localhost:8086';
const org = `super30`;
const bucket = `opt-trad`;

const client = new InfluxDB({ url, token });

const dbWriter = async () => {
  const writeClient = client.getWriteApi(org, bucket, 'ns'); // precision ns

  // your trade data
  const trade = {
    token: "BTCUSDT",
    count: 68,
    openingPrice: "111710.88000000",
    closingPrice: "111707.47000000",
    high: 111710.88,
    low: 111707.47,
  };

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
    console.log(" Data written to InfluxDB");
  } catch (err) {
    console.error("Write error:", err);
  } finally {
    writeClient.close().then(() => console.log("✦ Writer closed"));
  }
};
