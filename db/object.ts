const orderList = {
  "1": {
    trades: [
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      }
    ]
  },
  "2": {
    trades: [
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      }
    ]
  },
  "3": {
    trades: [
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "1123"
      },
      {
        orderId: "11"
      }
    ]
  },
}

export const mapOrder = (orderId: string): string | null => {
  for (const [userId, { trades }] of Object.entries(orderList)) {
    if (trades.some(trade => trade.orderId === orderId)) {
      return userId;
    }
  }
  return null;
}
const mapOrderIdtoUserId = (orderid: string) => {
  for (const [userId, { trades }] of Object.entries(orderList)) {
    if (trades.some(trade => trade.orderId === orderid)) {
      return userId;
    }
  }
  return null;
}
const userid = mapOrderIdtoUserId("11");
console.log(userid);

