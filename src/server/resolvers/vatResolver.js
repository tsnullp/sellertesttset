const mongoose = require("mongoose")
const _ = require("lodash")
const ObjectId = mongoose.Types.ObjectId
const findExchange = require("../puppeteer/findExchange")
const searchCafe24OrderList = require("../puppeteer/searchCafe24OrderList")
const searchCafe24 = require("../puppeteer/searchCafe24")
const deliveryDestination = require("../puppeteer/deliveryDestination")
const searchTaobaoOrderList = require("../puppeteer/searchTaobaoOrderList")
const MarketOrder = require("../models/MarketOrder")
const { GetOrderSheet, GetOrderID } = require("../api/Market")

const resolvers = {
  Query: {
    BaedaegiList: async (
      parent, 
      {page = 1, perPage = 10, search = "", filterOption = 1},
      {req, model: {DeliveryInfo}, logger }
    ) => {
      try {

        if(filterOption === 2){
          const temp = await DeliveryInfo.aggregate([
            {
              $match: {
                "orderItems.오픈마켓주문번호": { "$exists": true },
                orderNo: {$ne: "JS-2005191901375150"},
                userID: ObjectId(req.user.adminUser),
              }
            },
            {
              $group: {
                _id: "$orderItems.오픈마켓주문번호",
                orderNo: { $addToSet: "$orderNo"},
                count: {$sum:1}
              }
            },
            {
              $match: {
                count: {
                  $gt: 1
                }
              }
            }
          ])
  
          let orderNoArr = []
          temp.filter(item => item._id[0].length > 0).forEach(item => {
            orderNoArr.push(...item.orderNo)
          })
          

          const deliveryInfo = await DeliveryInfo.aggregate([
            {
              $facet: {
                data: [
                  {
                    $match: {
                      orderNo: {$ne: "JS-2005191901375150"},
                      orderNo: {$in: orderNoArr},
                      userID: ObjectId(req.user.adminUser),
                      $or: [
                        { "orderNo": { $regex: `.*${search}.*` } },
                        { "수취인이름": { $regex: `.*${search}.*` } },
                        { "수취인연락처": { $regex: `.*${search}.*` } },
                        { "개인통관부호": { $regex: `.*${search}.*` } },
                        { "shippingNumber": { $regex: `.*${search}.*` } },
                        { "orderItems.taobaoOrderNo": { $regex: `.*${search}.*` } },
                        { "orderItems.오픈마켓주문번호": { $regex: `.*${search}.*` } },
                        { "orderItems.taobaoTrackingNo": { $regex: `.*${search}.*` } },
                      ],
                    }
                  },
                  {
                    $sort: {"orderItems.오픈마켓주문번호": -1}
                  },
                  {
                    $limit: (page - 1) * perPage + perPage
                  },
                  {
                    $skip: (page - 1) * perPage
                  },
                ],
                count: [
                  {
                    $match: {
                      orderNo: {$ne: "JS-2005191901375150"},
                      orderNo: {$in: orderNoArr},
                      userID: ObjectId(req.user.adminUser),
                      $or: [
                        { "orderNo": { $regex: `.*${search}.*` } },
                        { "수취인이름": { $regex: `.*${search}.*` } },
                        { "수취인연락처": { $regex: `.*${search}.*` } },
                        { "개인통관부호": { $regex: `.*${search}.*` } },
                        { "shippingNumber": { $regex: `.*${search}.*` } },
                      ],
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      count: {
                        $sum: 1
                      }
                    }
                  }
                ]
              }
            }
          ])
  
          
          return {
            count: deliveryInfo[0].count[0] ? deliveryInfo[0].count[0].count : 0,
            list: deliveryInfo[0].data.map(item => {
              return {
                ...item,
                orderItems: item.orderItems.map(orderItem => {
                  return {
                    ...orderItem,
                    marketOrderNumber: orderItem.오픈마켓주문번호
                  }
                }),
                customsCode: item.개인통관부호,
                weight: item.무게,
                shippingFee: item.배송비용,
                state: item.상태,
                name: item.수취인이름,
                phone: item.수취인연락처,
                address: item.수취인주소,
                markteName: item.오픈마켓명
              }
            })
          }
        }

        if(filterOption === 3){
          const temp = await DeliveryInfo.aggregate([
            {
              $match: {
                orderNo: {$ne: "JS-2005191901375150"},
                userID: ObjectId(req.user.adminUser),
              }
            },
            {
              $group: {
                _id: "$orderItems.오픈마켓주문번호",
                orderNo: { $addToSet: "$orderNo"},
                count: {$sum:1}
              }
            },
            {
              $match: {
                count: {
                  $gt: 1
                }
              }
            }
          ])
  
          
          let orderNoArr = []
          temp.filter(item => item._id[0].length === 0).forEach(item => {
            orderNoArr.push(...item.orderNo)
          })
          

          const deliveryInfo = await DeliveryInfo.aggregate([
            {
              $facet: {
                data: [
                  {
                    $match: {
                      orderNo: {$ne: "JS-2005191901375150"},
                      orderNo: {$in: orderNoArr},
                      userID: ObjectId(req.user.adminUser),
                      $or: [
                        { "orderNo": { $regex: `.*${search}.*` } },
                        { "수취인이름": { $regex: `.*${search}.*` } },
                        { "수취인연락처": { $regex: `.*${search}.*` } },
                        { "개인통관부호": { $regex: `.*${search}.*` } },
                        { "shippingNumber": { $regex: `.*${search}.*` } },
                        { "orderItems.taobaoOrderNo": { $regex: `.*${search}.*` } },
                        { "orderItems.오픈마켓주문번호": { $regex: `.*${search}.*` } },
                        { "orderItems.taobaoTrackingNo": { $regex: `.*${search}.*` } },
                      ],
                    }
                  },
                  {
                    $sort: {orderNo: -1}
                  },
                  {
                    $limit: (page - 1) * perPage + perPage
                  },
                  {
                    $skip: (page - 1) * perPage
                  },
                ],
                count: [
                  {
                    $match: {
                      orderNo: {$ne: "JS-2005191901375150"},
                      orderNo: {$in: orderNoArr},
                      userID: ObjectId(req.user.adminUser),
                      $or: [
                        { "orderNo": { $regex: `.*${search}.*` } },
                        { "수취인이름": { $regex: `.*${search}.*` } },
                        { "수취인연락처": { $regex: `.*${search}.*` } },
                        { "개인통관부호": { $regex: `.*${search}.*` } },
                        { "shippingNumber": { $regex: `.*${search}.*` } },
                      ],
                    }
                  },
                  {
                    $group: {
                      _id: null,
                      count: {
                        $sum: 1
                      }
                    }
                  }
                ]
              }
            }
          ])
  
          
          return {
            count: deliveryInfo[0].count[0] ? deliveryInfo[0].count[0].count : 0,
            list: deliveryInfo[0].data.map(item => {
              return {
                ...item,
                orderItems: item.orderItems.map(orderItem => {
                  return {
                    ...orderItem,
                    marketOrderNumber: orderItem.오픈마켓주문번호
                  }
                }),
                customsCode: item.개인통관부호,
                weight: item.무게,
                shippingFee: item.배송비용,
                state: item.상태,
                name: item.수취인이름,
                phone: item.수취인연락처,
                address: item.수취인주소,
                markteName: item.오픈마켓명
              }
            })
          }
        }
        
        const deliveryInfo = await DeliveryInfo.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    orderNo: {$ne: "JS-2005191901375150"},
                    userID: ObjectId(req.user.adminUser),
                    $or: [
                      { "orderNo": { $regex: `.*${search}.*` } },
                      { "수취인이름": { $regex: `.*${search}.*` } },
                      { "수취인연락처": { $regex: `.*${search}.*` } },
                      { "개인통관부호": { $regex: `.*${search}.*` } },
                      { "shippingNumber": { $regex: `.*${search}.*` } },
                      { "orderItems.taobaoOrderNo": { $regex: `.*${search}.*` } },
                      { "orderItems.오픈마켓주문번호": { $regex: `.*${search}.*` } },
                      { "orderItems.taobaoTrackingNo": { $regex: `.*${search}.*` } },
                    ],
                  }
                },
                {
                  $sort: {orderNo: -1}
                },
                {
                  $limit: (page - 1) * perPage + perPage
                },
                {
                  $skip: (page - 1) * perPage
                },
              ],
              count: [
                {
                  $match: {
                    userID: ObjectId(req.user.adminUser),
                    $or: [
                      { "orderNo": { $regex: `.*${search}.*` } },
                      { "수취인이름": { $regex: `.*${search}.*` } },
                      { "수취인연락처": { $regex: `.*${search}.*` } },
                      { "개인통관부호": { $regex: `.*${search}.*` } },
                      { "shippingNumber": { $regex: `.*${search}.*` } },
                    ],
                  }
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1
                    }
                  }
                }
              ]
            }
          }
        ])

        
        return {
          count: deliveryInfo[0].count[0] ? deliveryInfo[0].count[0].count : 0,
          list: deliveryInfo[0].data.map(item => {
            return {
              ...item,
              orderItems: item.orderItems.map(orderItem => {
                return {
                  ...orderItem,
                  marketOrderNumber: orderItem.오픈마켓주문번호
                }
              }),
              customsCode: item.개인통관부호,
              weight: item.무게,
              shippingFee: item.배송비용,
              state: item.상태,
              name: item.수취인이름,
              phone: item.수취인연락처,
              address: item.수취인주소,
              markteName: item.오픈마켓명
            }
          })
        }


      } catch(e) {
        logger.error(`BaedaegiList ${e.message}`)
        return {
          count: 0,
          list: []
        }
      }
    }
  },
  Mutation: {
    VatListType: async (
      parent,
      { startDate, endDate, search, userID },
      { req, model: { MarketOrder, DeliveryInfo }, logger }
    ) => {
      try {

        await findExchange()
        
        const user = userID ? ObjectId(userID ): ObjectId(req.user.adminUser)
        const match = {}

        if (startDate.length === 8 && endDate.length === 8) {
          match["paidAtDate"] = {
            $gte: startDate,
            $lte: endDate
          }
        } else if (startDate.length === 8) {
          match["paidAtDate"] = { $gte: startDate }
        } else if (endDate.length === 8) {
          match["paidAtDate"] = { $lte: endDate }
        }

        if (search.length > 0) {
          match[`$or`] = [
            { "orderItems.title": { $regex: `.*${search}.*` } },
            // { "orderItems.option": { $regex: `.*${search}.*` } },
            // { market: { $regex: `.*${search}.*` } },
            { orderId: { $regex: `.*${search}.*` } },
            { "receiver.name": { $regex: `.*${search}.*` } },
            { "receiver.hpNumber": { $regex: `.*${search}.*` } },
            { invoiceNumber: { $regex: `.*${search}.*` } },
            { "deliveryItem.shippingNumber": { $regex: `.*${search}.*` } },
            { "deliveryItem.수취인이름": { $regex: `.*${search}.*` } },
            { "deliveryItem.수취인연락처": { $regex: `.*${search}.*` } },
            { "deliveryItem.개인통관부호": { $regex: `.*${search}.*` } },
            { "deliveryItem.orderNo": { $regex: `.*${search}.*` } },
            { "deliveryItem.taobaoItem.orderNumber": { $regex: `.*${search}.*` } },
            // { "deliveryItem.taobaoItem.orders.productName": { $regex: `.*${search}.*` } }
          ]
        }

        const response = await MarketOrder.aggregate([
          {
            $match: {
              userID: user,
              saleType: 1,
              // orderId: "16000109912587"
            }
          },
          {
            $lookup: {
              from: "deliveryinfos",
              let: { orderId: "$orderId", isDelete: "$isDelete", userID: "$userID"},
              pipeline: [
                {
                  $unwind: "$orderItems"
                },
                { 
                  $match: { 
                    "isDelete": {$ne: true},
                    $expr: { $eq: ["$userID", "$$userID"] },
                    $expr: { $eq: ["$orderItems.오픈마켓주문번호", "$$orderId"] },
                    
                  } 
                }
              ],
              as: "deliveryItem"
            }
          },
          {
            $unwind: "$deliveryItem"
          },
          
          {
            $lookup: {
              from: "taobaoorders",
              let: { taobaoOrderNo: "$deliveryItem.orderItems.taobaoOrderNo" },
              pipeline: [{ $match: { $expr: { $eq: ["$orderNumber", "$$taobaoOrderNo"] } } }],
              as: "deliveryItem.taobaoItem"
            }
          },
          {
            $unwind: "$deliveryItem.taobaoItem"
          },
          {
            $match: {
              ...match,
              "deliveryItem.userID": user,
              "deliveryItem.taobaoItem.shippingStatus": { $ne: "交易关闭"},
              // "deliveryItem.taobaoItem.express.expressId": { $regex: `.*${search}.*` } ,
            }
          },
          {
            $lookup: {
              from: "exchangerates",
              let: { orderDate: "$deliveryItem.taobaoItem.orderDate" },
              pipeline: [{ $match: { $expr: { $eq: ["$날짜", "$$orderDate"] } } }],
              as: "deliveryItem.taobaoItem.exchange"
            }
          },
          {
            $unwind: "$deliveryItem.taobaoItem.exchange"
          },

          {
            $group: {
              _id: "$orderId",
              market: { $first: "$market" },
              orderId: { $first: "$orderId" },
              userID: { $first: "$userID" },
              cafe24OrderID: { $first: "$cafe24OrderID" },
              deliveryCompanyName: { $first: "$deliveryCompanyName" },
              orderItems: { $first: "$orderItems" },
              orderer: { $first: "$orderer" },
              overseaShippingInfoDto: { $first: "$overseaShippingInfoDto" },
              paidAtDate: { $first: "$paidAtDate" },
              paidAtTime: { $first: "$paidAtTime" },
              receiver: { $first: "$receiver" },
              saleType: { $first: "$saleType" },
              shippingPrice: { $first: "$shippingPrice" },
              invoiceNumber: { $first: "$invoiceNumber" },
              deliveryItem: { $addToSet: "$deliveryItem" }
            }
          },
          {
            $sort: {
              paidAtDate: 1,
              paidAtTime: 1
            }
          }
        ]).allowDiskUse(true)
      // console.log("response", response)
      // console.log("deliveryItem", response[0].deliveryItem)
        const allItems = await MarketOrder.aggregate([
          {
            $match: {
              userID: user,
              saleType: 1
            }
          },
          {
            $lookup: {
              from: "deliveryinfos",
              let: { orderId: "$orderId", userID: "$userID" },
              pipeline: [
                {
                  $unwind: "$orderItems"
                },
                { 
                  $match: { 
                    "isDelete": {$ne: true},
                    $expr: { $eq: ["$userID", "$$userID"] },
                    $expr: { $eq: ["$orderItems.오픈마켓주문번호", "$$orderId"] } 
                  } 
                }
              ],
              as: "deliveryItem"
            }
          },
          {
            $unwind: "$deliveryItem"
          },
          {
            $match: {
              "deliveryItem.isDelete": false,
              "deliveryItem.userID": user,
            }
          },
          {
            $lookup: {
              from: "taobaoorders",
              let: { taobaoOrderNo: "$deliveryItem.orderItems.taobaoOrderNo" },
              pipeline: [{ $match: { $expr: { $eq: ["$orderNumber", "$$taobaoOrderNo"] } } }],
              as: "deliveryItem.taobaoItem"
            }
          },
          {
            $unwind: "$deliveryItem.taobaoItem"
          },
          {
            $lookup: {
              from: "exchangerates",
              let: { orderDate: "$deliveryItem.taobaoItem.orderDate" },
              pipeline: [{ $match: { $expr: { $eq: ["$날짜", "$$orderDate"] } } }],
              as: "deliveryItem.taobaoItem.exchange"
            }
          },
          {
            $unwind: "$deliveryItem.taobaoItem.exchange"
          },
          {
            $group: {
              _id: "$orderId",
              market: { $first: "$market" },
              orderId: { $first: "$orderId" },
              userID: { $first: "$userID" },
              cafe24OrderID: { $first: "$cafe24OrderID" },
              deliveryCompanyName: { $first: "$deliveryCompanyName" },
              orderItems: { $first: "$orderItems" },
              orderer: { $first: "$orderer" },
              overseaShippingInfoDto: { $first: "$overseaShippingInfoDto" },
              paidAtDate: { $first: "$paidAtDate" },
              paidAtTime: { $first: "$paidAtTime" },
              receiver: { $first: "$receiver" },
              saleType: { $first: "$saleType" },
              shippingPrice: { $first: "$shippingPrice" },
              invoiceNumber: { $first: "$invoiceNumber" },
              deliveryItem: { $addToSet: "$deliveryItem" }
            }
          },
          {
            $project: {
              deliveryItem: 1
            }
          }
        ]).allowDiskUse(true)

        const deliverTemp = await DeliveryInfo.aggregate([
          {
            $match: {
              userID: user,
              isDelete: false
            }
          }
        ])

        let returnValue = response.map(orderItem => {

          return {
            ...orderItem,
            deliveryItem: _.uniqBy(
              orderItem.deliveryItem.map(item => {

                const savedDelivery = deliverTemp.filter(dItem => dItem.orderNo === item.orderNo)
                let orderItemLength = 1
                if(savedDelivery.length > 0){
                  orderItemLength = savedDelivery[0].orderItems.filter(fItem => fItem.오픈마켓주문번호 && fItem.오픈마켓주문번호.length > 0).length
                }
                console.log("item.orderNo,", item.orderNo, orderItemLength, item.배송비용, item.배송비용 / (orderItemLength > 0 ? orderItemLength : 1))
                return {
                  orderSeq: item.orderSeq,
                  orderNo: item.orderNo,
                  status: item.상태,
                  recipientName: item.수취인이름,
                  recipientPostNum: item.수취인우편번호,
                  recipientAddress: item.수취인주소,
                  recipientPhoneNumber: item.수취인연락처,
                  personalCustomsClearanceCode: item.개인통관부호,
                  weight: Number((item.무게 / (orderItemLength > 0 ? orderItemLength : 1)).toFixed(0)),
                  shipFee: Number((item.배송비용 / (orderItemLength > 0 ? orderItemLength : 1)).toFixed(0)),
                  deliveryCompanyName: orderItem.deliveryCompanyName,
                  shippingNumber:
                    orderItem.deliveryCompanyName === "경동택배"
                      ? orderItem.invoiceNumber
                      : item.shippingNumber,
                  customs: item.customs || [],
                  deliveryTracking: item.deliveryTracking || [],
                  taobaoItem: {
                    ...item.taobaoItem,
                    orders: item.taobaoItem.orders.filter(item => item.realPrice !== "0.00")
                  },
                  exchange: {
                    usdPrice: item.taobaoItem.exchange.USD_송금보내실때,
                    cnyPrice: item.taobaoItem.exchange.CNY_송금보내실때
                  }
                }
              }),
              // "taobaoItem.orderNumber"
              "orderSeq"
            )
          }
        })
        // returnValue = returnValue.map(orderItem => {
        //   return {
        //     ...orderItem,
        //     deliveryItem: _.uniqBy(
        //       orderItem.deliveryItem, "taobaoItem.orderNumber"
        //     )
        //   }
        // })
      //  console.log("returnValue", returnValue)
        const deleveryOrderNumber = []
        allItems.forEach(item => {
          const temp = []
          _.uniqBy(item.deliveryItem, "taobaoItem.orderNumber").forEach(dItem => {
            temp.push(dItem.taobaoItem.orderNumber)
          })
          deleveryOrderNumber.push(...temp)
        })
        
        const duplicateKey = {}

        returnValue.forEach((orderItem, row) => {
          orderItem.deliveryItem.forEach(item => {
            
            const orderCount = deleveryOrderNumber.filter(
              fItem => fItem === item.taobaoItem.orderNumber
            ).length
            const quantity = item.taobaoItem.orders.filter(item => item.realPrice !== "0.00").length
          
            if (orderCount !== 1) {
              if (!duplicateKey[item.taobaoItem.orderNumber]) {
                duplicateKey[item.taobaoItem.orderNumber] = row.toString()
              }
              const index = Number(duplicateKey[item.taobaoItem.orderNumber])

              let singleItem = item.taobaoItem.orders.filter(item => item.realPrice !== "0.00")[
                row % index
              ]

              if (!singleItem) {
                singleItem = item.taobaoItem.orders.filter(item => item.realPrice !== "0.00")[0]
              }

              item.taobaoItem.orders = [
                {
                  id: singleItem.id,
                  thumbnail: singleItem.thumbnail,
                  productName: singleItem.productName,
                  detail: singleItem.detail,
                  skuId: singleItem.skuId,
                  option: singleItem.option,
                  originalPrice: (Number(singleItem.originalPrice) / quantity).toFixed(2),
                  realPrice: (Number(singleItem.realPrice) / quantity).toFixed(2),
                  quantity: (singleItem.quantity / orderCount) * quantity
                }
              ]
              item.taobaoItem.purchaseAmount = Number(item.taobaoItem.purchaseAmount) / orderCount
              
              item.weight = item.weight / orderCount
              item.shipFee = item.shipFee / orderCount
            }
          })
        })
        
        return returnValue
      } catch (e) {
        logger.error(`VatListType ${e.message}`)
        return []
      }
    },
    GetDeliveryImage: async (
      parent,
      { shippingNumber, type = "customs" },
      { req, model: { DeliveryImage }, logger }
    ) => {
      try {
        const response = await DeliveryImage.findOne({
          shippingNumber
        })

        if (type === "customs") {
          return response.customsImage.toString("UTF-8")
        }
        if (type === "delivery") {
          return response.deliveryImage.toString("UTF-8")
        }

        return null
      } catch (e) {
        logger.error(`GetDeliveryImage ${e.message}`)
        return null
      }
    },
    VatSearch: async (
      parent, {}, {req, model:{Market},  logger} 
    ) => {
      try {

        setTimeout(async() => {
          try {
            console.log("환율 조회 시작")
            await findExchange()
          } catch (e) {
            console.log("fineExchange", e)
          } finally {
            console.log("환율 조회 끝")
          }
  
          const market = await Market.aggregate([
            {
              $match: {
                userID: ObjectId(req.user.adminUser)
              }
            }
          ])
        
          for (const item of market) {
            try {
              console.log("카페24 주문정보 수집 시작")
              if (item && item.cafe24 && item.cafe24.mallID && item.cafe24.mallID.length > 0 && item.cafe24.password && item.cafe24.password.length > 0) {
                // await searchCafe24OrderList({
                //   userID: item.userID,
                //   mallID: item.cafe24.mallID,
                //   password: item.cafe24.password
                // })
                await searchCafe24({
                  userID: item.userID,
                  mallID: item.cafe24.mallID,
                })
              }
            } catch (e) {
              console.log("searchcafe24OrderList", e)
            } finally {
              console.log("카페24 주문정보 수집 끝")
            }
        
            try {
              console.log("쿠팡 주문수집 주문아이디로")
              const temp = await MarketOrder.find(
                {
                  userID: item.userID,
                  market: "쿠팡"
                  // orderItems: { $size: 0}
                }
              ).sort({
                _id: -1
              })
              
              for(const marketItem of temp){
                
                const response = await GetOrderID({userID: item.userID, vendorId: item.coupang.vendorId, orderId: marketItem.orderId})
                
                if(response && response.code === 200){

                  let orderItemsArr = []
                  for(const responseItem of response.data){
                    
                   
                    for(const orderItem of responseItem.orderItems){
                      console.log("orderItem", orderItem)
                      orderItemsArr.push({
                        title: orderItem.vendorItemPackageName,
                        option: orderItem.sellerProductItemName,
                        quantity: orderItem.shippingCount,
                        salesPrice: orderItem.salesPrice,
                        orderPrice: orderItem.orderPrice,
                        discountPrice: orderItem.discountPrice,
                        sellerProductName: orderItem.sellerProductName,
                        vendorItemId: orderItem.vendorItemId,
                      })
                    }
                    
                  }

                  if(orderItemsArr.length > 0){
                      
                    await MarketOrder.findOneAndUpdate(
                      {
                        userID: item.userID,
                        orderId: marketItem.orderId
                      },
                      {
                        $set: {
                          orderItems: orderItemsArr
                        }
                      },
                      
                    )
                  }
                }
              }
            } catch (e) {
              console.log("GetOrderID",e)
            }

            try {
              console.log("쿠팡 주문수집 시작")
              const userID = item.userID
        
              for (const statusItem of [
                "ACCEPT",
                "INSTRUCT",
                "DEPARTURE",
                "DELIVERING",
                "FINAL_DELIVERY"
              ]) {
                // eslint-disable-next-line no-loop-func
                ;(async () => {
                  console.log(`${statusItem} 시작`)
                  let prevToken = "prev"
                  let nextToken = "next"
        
                  while (nextToken) {
                    try {
                     
                      const response = await GetOrderSheet({
                        userID,
                        vendorId: item.coupang.vendorId,
                        status: statusItem
                      })
                      
                      nextToken =
                        response.nextToken && response.nextToken.length > 0 ? response.nextToken : null
                      if (prevToken === nextToken) {
                        nextToken = null
                      } else {
                        prevToken = nextToken
                      }
                      
                      if(response.data){
                        for (const item of response.data) {
                          const temp = await MarketOrder.findOne({
                            userID: ObjectId(userID),
                            market: "쿠팡",
                            orderId: item.orderId
                          })
                          
                          console.log("item->", item.orderId)
             
                          if (!temp || temp.orderItems.length === 0) {
                            
                            await MarketOrder.findOneAndUpdate(
                              {
                                userID: ObjectId(userID),
                                market: "쿠팡",
                                orderId: item.orderId
                              },
                              {
                                $set: {
                                  userID: ObjectId(userID),
                                  market: "쿠팡",
                                  shipmentBoxId: item.shipmentBoxId,
                                  orderId: item.orderId,
                                  orderer: {
                                    name: item.orderer.name,
                                    email: item.orderer.email,
                                    hpNumber:
                                      temp && temp.orderer && temp.orderer.hpNumber
                                        ? temp.orderer.hpNumber
                                        : item.orderer.safeNumber,
                                    orderDate: item.orderedAt.split("T")[0].replace(/-/gi, ""),
                                    orderTime: item.orderedAt.split("T")[1].replace(/:/gi, "")
                                  },
                                  paidAtDate: item.paidAt.split("T")[0].replace(/-/gi, ""),
                                  paidAtTime: item.paidAt.split("T")[1].replace(/:/gi, ""),
          
                                  shippingPrice: item.shippingPrice + item.remotePrice,
          
                                  receiver: {
                                    name: item.receiver.name,
                                    hpNumber:
                                      temp && temp.receiver && temp.receiver.hpNumber
                                        ? temp.receiver.hpNumber
                                        : item.receiver.safeNumber,
                                    addr: `${item.receiver.addr1} ${item.receiver.addr2}`,
                                    postCode: item.receiver.postCode,
                                    parcelPrintMessage: item.parcelPrintMessage
                                  },
          
                                  orderItems: item.orderItems.map((item, i) => {
                                    return {
                                      image: "https://img.echosting.cafe24.com/thumb/44x44.gif",
                                      title: item.vendorItemPackageName,
                                      option: item.sellerProductItemName,
                                      quantity: item.shippingCount,
                                      salesPrice: item.salesPrice,
                                      orderPrice: item.orderPrice,
                                      discountPrice: item.discountPrice,
                                      sellerProductName: item.sellerProductName,
                                      productId: item.productId,
                                      vendorItemId: item.vendorItemId,
                                      orderType:
                                        temp && temp.orderItems[i] && temp.orderItems[i].orderType
                                          ? temp.orderItems[i].orderType
                                          : 1
                                    }
                                  }),
          
                                  overseaShippingInfoDto: {
                                    personalCustomsClearanceCode:
                                      temp &&
                                      temp.overseaShippingInfoDto.overseaShippingInfoDto &&
                                      temp.overseaShippingInfoDto.overseaShippingInfoDto
                                        .personalCustomsClearanceCode
                                        ? temp.overseaShippingInfoDto.overseaShippingInfoDto
                                            .personalCustomsClearanceCode
                                        : item.overseaShippingInfoDto.personalCustomsClearanceCode,
                                    ordererPhoneNumber:
                                      temp &&
                                      temp.overseaShippingInfoDto.overseaShippingInfoDto &&
                                      temp.overseaShippingInfoDto.overseaShippingInfoDto.ordererPhoneNumber
                                        ? temp.overseaShippingInfoDto.overseaShippingInfoDto
                                            .ordererPhoneNumber
                                        : item.overseaShippingInfoDto.ordererPhoneNumber
                                  },
          
                                  saleType:
                                    temp && temp.saleType
                                      ? temp.saleType
                                      : item.orderItems[0].canceled
                                      ? 2
                                      : 1,
          
                                  deliveryCompanyName:
                                  temp && temp.deliveryCompanyName === "경동택배"
                                      ? temp.deliveryCompanyName
                                      : item.deliveryCompanyName,
                                  invoiceNumber:
                                    temp && temp.deliveryCompanyName === "경동택배"
                                      ? temp.invoiceNumber
                                      : item.invoiceNumber
                                }
                              },
                              { upsert: true, new: true }
                            )
                          }
                        }
                      }
                      
                    } catch (e) {
                      console.log("while", e)
                      nextToken = null
                    }
                  }
                })()
                console.log(`${statusItem} 끝`)
              }
            } catch (e) {
              console.log("GetOrderSheet", e)
            } finally {
              console.log("쿠팡 주문수집 끝")
            }

            
        
            try {
              console.log("배대지 주문서 수집 시작", item)
              if (item && item.deliverySite && item.deliverySite.loginID && item.deliverySite.password) {
                await deliveryDestination({
                  userID: item.userID,
                  loginID: item.deliverySite.loginID,
                  password: item.deliverySite.password
                })
              }
            } catch (e) {
              console.log("deliveryDestination", e)
            } finally {
              console.log("배대지 주문서 수집 끝")
            }
        
            try {
              console.log("타오바오 주문서 수집 시작")
              if (item && item.taobao && item.taobao.loginID && item.taobao.password) {
                await searchTaobaoOrderList({
                  userID: item.userID,
                  loginID: item.taobao.loginID,
                  password: item.taobao.password
                })
              }
            } catch (e) {
              console.log("searchTaobaoOrderList", e)
            } finally {
              console.log("타오바오 주문서 수집 끝")
            }
          }
        }, 1000)
        
        
        return true
      } catch (e) {
        logger.error(`VatSearch ${e.message}`)
        return false
      }
    },
    TaobaoOrderBatch: async (
      parent, {}, {req, model:{Market},  logger} 
    ) => {
      try {
        setTimeout(async() => {
          
          const market = await Market.aggregate([
            {
              $match: {
                userID: ObjectId(req.user.adminUser)
              }
            }
          ])
        
          for (const item of market) {
        
            try {
              console.log("타오바오 주문서 수집 시작")
              if (item && item.taobao && item.taobao.loginID && item.taobao.password) {
                await searchTaobaoOrderList({
                  browserHidden: false,
                  userID: item.userID,
                  loginID: item.taobao.loginID,
                  password: item.taobao.password
                })
              }
            } catch (e) {
              console.log("searchTaobaoOrderList", e)
            } finally {
              console.log("타오바오 주문서 수집 끝")
            }
          }
        }, 1000)
        return true
      } catch (e){
        logger.error(`TaobaoOrderBatch ${e.message}`)
        return false
      }
    },
    TabaeOrderBatch: async (
      parent, {}, {req, model:{Market},  logger} 
    ) => {
      try {
        setTimeout(async() => {

          try {
            console.log("환율 조회 시작")
            await findExchange()
          } catch (e) {
            console.log("fineExchange", e)
          } finally {
            console.log("환율 조회 끝")
          }
          
          const market = await Market.aggregate([
            {
              $match: {
                userID: ObjectId(req.user.adminUser)
              }
            }
          ])
        
          for (const item of market) {
            try {
              console.log("배대지 주문서 수집 시작")
              if (item && item.deliverySite && item.deliverySite.loginID && item.deliverySite.password) {
                await deliveryDestination({
              
                  userID: item.userID,
                  loginID: item.deliverySite.loginID,
                  password: item.deliverySite.password
                })
              }
            } catch (e) {
              console.log("deliveryDestination", e)
            } finally {
              console.log("배대지 주문서 수집 끝")
            }
          }
        }, 1000)
        return true
      } catch (e) {
        logger.error(`TabaeOrderBatch ${e.message}`)
        return false
      }
    },
    BaedaegiItmeDelete: async (
      parent,
      {orderNumber, isDelete}, {req, model: {DeliveryInfo}, logger}
    ) => {
      try {
        await DeliveryInfo.findOneAndUpdate(
          {
            userID: req.user.adminUser,
            orderNo: orderNumber
          },
          {
            $set: {
              isDelete
            }
          }
        )
        return true
      } catch (e){
        logger.error(`BaedaegiItmeDelete ${e.message}`)
        return false
      }
    },
    BaedaegiItmeMarketOrderNoModify: async (
      parent,
      {orderNumber, marketNumber, index}, {req, model: {DeliveryInfo}, logger}
    ) => {
      try {
        const deliverInfo = await DeliveryInfo.findOne(
          {
            userID: req.user.adminUser,
            orderNo: orderNumber  
          }
        )

        deliverInfo.orderItems.forEach((item, i) => {
          if(i === index){
            item.오픈마켓주문번호 = marketNumber
          }
        })

        await DeliveryInfo.findOneAndUpdate(
          {
            userID: req.user.adminUser,
            orderNo: orderNumber
          },
          {
            $set: {
              orderItems: deliverInfo.orderItems
            }
          }
        )
        return true
      } catch (e){
        logger.error(`BaedaegiItmeDelete ${e.message}`)
        return false
      }
    },
    TaobaoOrderManual: async (
      parent, {input}, {req, model: {TaobaoOrder}, logger}
    ) => {
      try {
        for (const item of input){
          await TaobaoOrder.findOneAndUpdate(
            {
              orderNumber: item.orderNumber,
              userID: ObjectId(req.user.adminUser)
            },
            {
              $set: {
                orderNumber: item.orderNumber,
                userID: ObjectId(req.user.adminUser),
                orderDate: item.orderDate,
                orderTime: item.orderTime,
                orders: item.orders,
                purchaseAmount: item.purchaseAmount,
                shippingFee: item.shippingFee,
                quantity: item.quantity,
                shippingStatus: item.shippingStatus,
              }
            },
            { upsert: true }
          )
          
        }

        return true
      } catch (e) {
        logger.error(`TaobaoOrderManual ${e.message}`)
        return false
      }
    }
  }
}

module.exports = resolvers
