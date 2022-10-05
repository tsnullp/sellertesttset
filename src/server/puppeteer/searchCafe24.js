const MarketOrder = require("../models/MarketOrder")
const {Cafe24ListOrders} = require("../api/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")

const start = async ({userID, mallID}) => {
  
  const endDate = moment().format("YYYY-MM-DD")
  
  const startDate = moment().subtract(3, "month").format("YYYY-MM-DD")
  const response = await Cafe24ListOrders({
    mallID,
    orderState: "",
    startDate, endDate
  })

  

  for(const item of response){
    try {
      if(item.items[0].order_status === "N00"){
        continue
      }
      const date = moment(item.order_date).format("YYYYMMDD HHmmss")
  
      const temp = await MarketOrder.findOne({
        userID: ObjectId(userID),
        market: getMarketName(item.market_id),
        orderId: item.market_order_info
      })
  
     await MarketOrder.findOneAndUpdate(
        {
          userID: ObjectId(userID),
          market: getMarketName(item.market_id),
          orderId: item.market_order_info
        },
        {
          $set: {
            userID: ObjectId(userID),
            market: getMarketName(item.market_id),
            orderId: item.market_order_info,
            cafe24OrderID: item.market_order_info,
            orderer: {
              name: item.buyer.name,
              email: item.buyer.email,
              tellNumber: item.buyer.phone,
              hpNumber: item.buyer.cellphone,
              orderDate: moment(item.order_date).format("YYYYMMDD"),
              orderTime: moment(item.order_date).format("HHmmss")
            },
            paidAtDate: moment(item.payment_date).format("YYYYMMDD"),
            paidAtTime: moment(item.payment_date).format("HHmmss"),
  
            shippingPrice: item.shipping_fee ? Number(item.shipping_fee.replace(/,/gi, "")) : Number(item.actual_order_amount.shipping_fee.replace(/,/gi, "")),
  
            receiver: {
              name: item.receivers[0].name,
              tellNumber: item.receivers[0].phone,
              hpNumber: item.receivers[0].cellphone,
              addr: item.receivers[0].address_full,
              postCode: item.receivers[0].zipcode,
              parcelPrintMessage: item.receivers[0].shipping_message
            },
  
            orderItems: item.items.map(item => {
              return {
                title: item.product_name_default,
                option: item.option_value.replace("옵션=", ""),
                quantity: Number(item.quantity),
                salesPrice: Number(item.product_price.replace(/,/gi, "")),
                orderPrice: Number(item.product_price.replace(/,/gi, "")) * Number(item.quantity),
                discountPrice: Number(item.additional_discount_price.replace(/,/gi, "")) + Number(item.coupon_discount_price.replace(/,/gi, "")),
              }
            }),
            
            overseaShippingInfoDto: {
              personalCustomsClearanceCode:
                item.receivers[0].clearance_information,
              ordererPhoneNumber:
              item.receivers[0].cellphone,
            },
  
            saleType: getOrderState(item.items[0].order_status),
            deliveryCompanyName:
              temp && temp.deliveryCompanyName ? temp.deliveryCompanyName : "CJ 대한통운"
          }
        },
        { upsert: true }
      )
  
      
    } catch(e){
      console.log("ERROR", e)
      console.log("ERROR-ITME", item)
    }
    
  }
}

module.exports = start

const getMarketName = (market) => {
  switch(market){
    case "shopn":
      return "스마트스토어"
    case "gmarket":
      return "G마켓"
    case "auction":
      return "옥션"
    case "coupang":
      return "쿠팡"
    case "timon":
      return "티몬"
    case "inpark":
      return "인터파크"
    case "wemake":
      return "위메프"
    default:
      return market
    
  }
}

const getOrderState = (orderState) => {
  if(orderState.includes("N")){
    return 1
  }
  if(orderState.includes("C")){
    return 2
  }
  if(orderState.includes("R")){
    return 3
  }
  if(orderState.includes("E")){
    return 4
  }
}