const cron = require("node-cron")
const Market = require("../models/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const taobaoFavoriteSearching = require("../puppeteer/taobaoFavoriteSearching")
const findExchange = require("../puppeteer/findExchange")
const searchCafe24OrderList = require("../puppeteer/searchCafe24OrderList")
const deliveryDestination = require("../puppeteer/deliveryDestination")
const searchTaobaoOrderList = require("../puppeteer/searchTaobaoOrderList")

const MarketOrder = require("../models/MarketOrder")
const { GetOrderSheet } = require("../api/Market")

const setupSchedule = () => {
  // cron.schedule("0 * * * *", () => {
  // cron.schedule("0 0,2,4,6,8,10,12,14,16,18,20,22 * * *", () => {
  //   try {
  //     taobaoFavoriteSearching({ user: global.user })
  //   } catch (e) {
  //     console.log("setupSchedule - taobaoFavoriteSearching", e.message)
  //   }
  //   // CoupangStatusSearch()
  // })
  // // cron.schedule("0 0,2,4,6,8,10,12,14,16,18,20,22 * * *", () => {
  // // cron.schedule("0 0,3,6,9,12,15,18,21,23 * * *", () => {
  // //   VatSearch()
  // // })
  // setTimeout(()=> {
  // }, 5000)
}

const VatSearch = async () => {
  if (!global.user) {
    return
  }
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
        userID: ObjectId(global.user.adminUser),
      },
    },
  ])

  for (const item of market) {
    try {
      console.log("카페24 주문정보 수집 시작")
      if (item && item.cafe24 && item.cafe24.mallID && item.cafe24.password) {
        await searchCafe24OrderList({
          userID: item.userID,
          mallID: item.cafe24.mallID,
          password: item.cafe24.password,
        })
      }
    } catch (e) {
      console.log("searchcafe24OrderList", e)
    } finally {
      console.log("카페24 주문정보 수집 끝")
    }

    try {
      console.log("쿠팡 주문수집 시작")
      const userID = item.userID

      for (const statusItem of [
        "ACCEPT",
        "INSTRUCT",
        "DEPARTURE",
        "DELIVERING",
        "FINAL_DELIVERY",
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
                status: statusItem,
              })
              nextToken =
                response.nextToken && response.nextToken.length > 0 ? response.nextToken : null
              if (prevToken === nextToken) {
                nextToken = null
              } else {
                prevToken = nextToken
              }
              console.log("nextToke", nextToken)
              for (const item of response.data) {
                const temp = await MarketOrder.findOne({
                  userID: ObjectId(userID),
                  market: "쿠팡",
                  orderId: item.orderId,
                })
                console.log("item->", item.orderId)
                if (!temp) {
                  await MarketOrder.findOneAndUpdate(
                    {
                      userID: ObjectId(userID),
                      market: "쿠팡",
                      orderId: item.orderId,
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
                          orderTime: item.orderedAt.split("T")[1].replace(/:/gi, ""),
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
                          parcelPrintMessage: item.parcelPrintMessage,
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
                                : 1,
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
                              : item.overseaShippingInfoDto.ordererPhoneNumber,
                        },

                        saleType:
                          temp && temp.saleType
                            ? temp.saleType
                            : item.orderItems[0].canceled
                            ? 2
                            : 1,

                        deliveryCompanyName:
                          temp.deliveryCompanyName === "경동택배"
                            ? temp.deliveryCompanyName
                            : item.deliveryCompanyName,
                        invoiceNumber:
                          temp.deliveryCompanyName === "경동택배"
                            ? temp.invoiceNumber
                            : item.invoiceNumber,
                      },
                    },
                    { upsert: true }
                  )
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
      console.log("배대지 주문서 수집 시작")
      if (item && item.deliverySite && item.deliverySite.loginID && item.deliverySite.password) {
        await deliveryDestination({
          userID: item.userID,
          loginID: item.deliverySite.loginID,
          password: item.deliverySite.password,
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
          password: item.taobao.password,
        })
      }
    } catch (e) {
      console.log("searchTaobaoOrderList", e)
    } finally {
      console.log("타오바오 주문서 수집 끝")
    }
  }
}

module.exports = setupSchedule
