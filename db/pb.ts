const data = [
    {
        data: "bct",
        type: "sell",
        price: "111"
    },
      {
        data: "bct",
        type: "sell",
        price: "111"
    },
      {
        data: "bct",
        type: "sell",
        price: "111"
    },
      {
        data: "bct",
        type: "sell",
        price: "111"
    },
    
    ];

const placeholders=[];
const values =[];
const query = `Insert into bctusdt (time,price) Values `
const value = ['bct','sell','111','bct','sell','111','bct','sell','111','bct','sell','111']
const req = 'insert into bctusdt (time , price) values (bct , sell , 111),(data2),(data3),(data4)]';
data.forEach((row,i)=>{
    const idx = i*3;
    placeholders.push(`($${idx+1},$${idx+2},$${idx+3})`)
    values.push(row.data,row.type,row.price)
})

console.log(query+`${placeholders.join(",")}`,values)
// console.log(data)