const DeliveryInfo = require("../models/DeliveryInfo")
const MarketOrder = require("../models/MarketOrder")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const start = async () => {
  try {
    let deliveryInfo = await DeliveryInfo.find()

    /*
    console.log(
      "오픈마켓주문번호 없는거 1",
      deliveryInfo.filter(item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0)
        .length
    )

    // 1. 오픈마켓주문번호가 없는걸 찾는다.
    for (const item of deliveryInfo.filter(
      item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0
    )) {
      if (item.userID.toString() === "5f0d5ff36fc75ec20d54c40b") {
        console.log("주문번호 -> ", {
          orderNo: item.orderNo,
          수취인이름: item.수취인이름,
          수취인연락처: item.수취인연락처,
          taobaoOrderNo: item.taobaoOrderNo
        })
      }

      // 주문번호 없는것과 마켓에서 개인통관고유번호가 같은것을 찾는다.
      const marketOrder = await MarketOrder.find({
        userID: ObjectId(item.userID),
        "overseaShippingInfoDto.personalCustomsClearanceCode": item.개인통관부호
      })

      // 찾은 결과가 한개이면
      if (marketOrder.length === 1) {
        const marketItem = marketOrder[0]

        const tempDelivery = await DeliveryInfo.find({
          userID: ObjectId(item.userID),
          개인통관부호: item.개인통관부호
        })
        for (const item of tempDelivery) {
          if (!item.오픈마켓주문번호 || item.오픈마켓주문번호.length === 0) {
            await DeliveryInfo.findOneAndUpdate(
              {
                _id: ObjectId(item._id)
              },
              {
                $set: {
                  오픈마켓주문번호: marketItem.orderId
                }
              }
            )
          }
        }

        // 마켓의 수취인 연락처와 이름을 업데이트 한다.
        await MarketOrder.findOneAndUpdate(
          {
            userID: ObjectId(marketItem.userID),
            orderId: marketItem.orderId
          },
          {
            $set: {
              "overseaShippingInfoDto.ordererPhoneNumber": item.수취인연락처,
              ordererName: item.수취인이름
            }
          }
        )
      }
    }

    // 다시 조회
    deliveryInfo = await DeliveryInfo.find()

    console.log(
      "오픈마켓주문번호 없는거 2",
      deliveryInfo.filter(item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0)
        .length
    )

    for (const item of deliveryInfo.filter(
      item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0
    )) {
      const marketOrder = await MarketOrder.find({
        userID: ObjectId(item.userID),
        "receiver.name": item.수취인이름,
        "receiver.postCode": item.수취인우편번호
      })

      if (marketOrder.length === 1) {
        const marketItem = marketOrder[0]

        // 오픈마켓주문번호를 업데이트 한다.
        const tempDelivery = await DeliveryInfo.find({
          userID: ObjectId(item.userID),
          수취인이름: marketItem.receiver.name,
          수취인우편번호: marketItem.receiver.postCode
        })
        for (const item of tempDelivery) {
          if (!item.오픈마켓주문번호 || item.오픈마켓주문번호.length === 0) {
            await DeliveryInfo.findOneAndUpdate(
              {
                _id: ObjectId(item._id)
              },
              {
                $set: {
                  오픈마켓주문번호: marketItem.orderId
                }
              }
            )
          }
        }

        // 마켓의 수취인 연락처와 이름을 업데이트 한다.
        await MarketOrder.findOneAndUpdate(
          {
            userID: ObjectId(marketItem.userID),
            orderId: marketItem.orderId
          },
          {
            $set: {
              "overseaShippingInfoDto.personalCustomsClearanceCode": item.개인통관부호,
              "overseaShippingInfoDto.ordererPhoneNumber": item.수취인연락처,
              ordererName: item.수취인이름
            }
          }
        )
      }
    }

    deliveryInfo = await DeliveryInfo.find()

    console.log(
      "오픈마켓주문번호 없는거 3",
      deliveryInfo.filter(item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0)
        .length
    )

    for (const item of deliveryInfo.filter(
      item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0
    )) {
      const marketOrder = await MarketOrder.find({
        userID: ObjectId(item.userID),
        "orderer.name": item.수취인이름,
        "receiver.postCode": item.수취인우편번호
      })

      // if (marketOrder.length === 2) {
      //   for (const item of marketOrder) {
      //     console.log("market", item)
      //   }
      // }
      if (marketOrder.length === 1) {
        const marketItem = marketOrder[0]

        // 오픈마켓주문번호를 업데이트 한다.
        const tempDelivery = await DeliveryInfo.find({
          userID: item.userID,
          수취인이름: marketItem.orderer.name
        })

        for (const item of tempDelivery) {
          if (!item.오픈마켓주문번호 || item.오픈마켓주문번호.length === 0) {
            await DeliveryInfo.findOneAndUpdate(
              {
                _id: ObjectId(item._id)
              },
              {
                $set: {
                  오픈마켓주문번호: marketItem.orderId
                }
              }
            )
          }
        }

        // 마켓의 수취인 연락처와 이름을 업데이트 한다.
        await MarketOrder.findOneAndUpdate(
          {
            userID: ObjectId(marketItem.userID),
            orderId: marketItem.orderId
          },
          {
            $set: {
              "overseaShippingInfoDto.personalCustomsClearanceCode": item.개인통관부호,
              "overseaShippingInfoDto.ordererPhoneNumber": item.수취인연락처,
              ordererName: item.수취인이름
            }
          }
        )
      }
    }

    deliveryInfo = await DeliveryInfo.find()

    console.log(
      "오픈마켓주문번호 없는거 4",
      deliveryInfo.filter(item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0)
        .length
    )

    // for (const item of deliveryInfo.filter(
    //   item => !item.오픈마켓주문번호 || item.오픈마켓주문번호.length == 0
    // )) {

    // }

    */
    for (const item of deliveryInfo) {
      for (const oItem of item.orderItems) {
        if (oItem.오픈마켓주문번호 && oItem.오픈마켓주문번호.length > 0) {
          for (const dItem of oItem.오픈마켓주문번호.split(",")) {
            console.log("dItem", dItem, item.orderNo)
            await MarketOrder.findOneAndUpdate(
              {
                userID: ObjectId(item.userID),
                orderId: dItem
              },
              {
                $set: {
                  deliveryOrderId: item.orderNo
                }
              }
            )
          }
        }
      }
    }
  } catch (e) {
    console.log("matchingOrderList", e)
  }
}

module.exports = start
