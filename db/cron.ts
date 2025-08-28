import { Client } from 'pg'; 

const client = new Client({
    user: 'optionTradTest',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5430,
});
client.connect();
//15 seconds
const SECONDS_IN_DAY= 86400;
const SECONDS_IN_MIN= 60;

async function refreshViewsFTSeconds() {

    await client.query('REFRESH MATERIALIZED VIEW klines_15s');

    console.log("Materialized views refreshed successfully for 15secs");
}
// 30 seconds
async function refreshViewsTSeconds() {

    await client.query('REFRESH MATERIALIZED VIEW klines_30s');

    console.log("Materialized views refreshed successfully for 30secs");
}
async function refreshViewsMinutes() {
    
    await client.query('REFRESH MATERIALIZED VIEW klines_1m');
    
    console.log("Materialized views refreshed successfully for 1m");
}
async function refreshViewsFMinutes() {

    await client.query('REFRESH MATERIALIZED VIEW klines_5m');

    console.log("Materialized views refreshed successfully for 5m");
}

async function refreshViewsHour() {

    await client.query('REFRESH MATERIALIZED VIEW klines_1h');

    console.log("Materialized views refreshed successfully for 1 hour");
}



async function refreshViewsDay() {

    await client.query('REFRESH MATERIALIZED VIEW klines_1d');

    console.log("Materialized views refreshed successfully for a Day");
}

async function refreshViewsWeek() {
    await client.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log("Materialized views refreshed successfully for a Week");
}

refreshViewsFTSeconds().catch(console.error);
refreshViewsTSeconds().catch(console.error);
refreshViewsMinutes().catch(console.error);
refreshViewsFMinutes().catch(console.error);
refreshViewsHour().catch(console.error);
refreshViewsDay().catch(console.error);
refreshViewsWeek().catch(console.error);

setInterval(() => {
    refreshViewsFTSeconds()
}, 1000 * 15);


setInterval(() => {
    refreshViewsTSeconds()
}, 1000 * 30 );


setInterval(() => {
    refreshViewsMinutes()
}, 1000 * SECONDS_IN_MIN );


setInterval(() => {
    refreshViewsFMinutes()
}, 1000 * SECONDS_IN_MIN * 15 );

setInterval(() => {
    refreshViewsHour()
}, 1000 * SECONDS_IN_MIN * 60);

setInterval(() => {
    refreshViewsDay()
}, 1000 * SECONDS_IN_DAY );

setInterval(() => {
    refreshViewsWeek()
}, 1000 * SECONDS_IN_DAY *7 );