const {
  CategoryPredict,
  CategorySearch,
  DisplayCategories,
  Outbound,
  CategoryMeta,
  CoupnagSTOP_PRODUCT_SALES_BY_ITEM,
  CoupnagRESUME_PRODUCT_SALES_BY_ITEM,
  CoupnagCreateProduct,
  CoupnagUpdateProduct,
  Cafe24CreateProduct,
  Cafe24UpdateProduct,
  Cafe24UploadImages,
  Cafe24ListAllOrigin,
  Cafe24CreateProductsOption,
  Cafe24DeleteProductsVariants,
  Cafe24UpdateProductsOption,
  Cafe24DeleteProductsOption,
  Cafe24ListProductsVariants,
  Cafe24UpdateProductsVariants,
  Cafe24UpdateProductsVariantsInventories,
  CoupnagGET_PRODUCT_BY_PRODUCT_ID,
  CoupnagUPDATE_PRODUCT_PRICE_BY_ITEM,
  CoupnagUPDATE_PRODUCT_QUANTITY_BY_ITEM,
  Cafe24CreateCategory,
  Cafe24ListOrders,
  Cafe24ListAllOrders,
  Cafe24CountAllOrders,
  Cafe24RegisterShipments,
  Cafe24UpdateShipments,
  Cafe24UploadLocalImage,
  Cafe24BoardList,
  Cafe24BoardPosts
} = require("../api/Market")
const { customs } = require("../api/Unipass")
const { TrademarkGeneralSearchService } = require("../api/Kipris")
const { newAddressPostZip } = require("../api/NewAddress")
const moment = require("moment")
const { regExp_test, sleep, imageCheck, isPhoneNum } = require("../../lib/usrFunc")
const smartStoreCategory = require("../../components/organisms/CategoryForm/category")
const Product = require("../models/Product")
const Basic = require("../models/Basic")
const CategoryInfo = require("../models/CategoryInfo")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const marketAPIResolver = {
  Query: {
    GetMarketOrderInfo: async (parent, { orderId }, { req, model: { MarketOrder }, logger }) => {
      try {
        const order = await MarketOrder.findOne({
          orderId,
        })

        if (order) {
          return {
            addr: order.receiver.addr,
            postCode: order.receiver.postCode,
            parcelPrintMessage: order.receiver.parcelPrintMessage,
          }
        }
        return null
      } catch (e) {
        logger.error(`GetMarketOrderInfo: ${e}`)
        return null
      }
    },
    GetTaobaoOrderSimpleInfo: async (
      parent,
      { orderId },
      { req, model: { TaobaoOrder }, logger }
    ) => {
      try {
        const order = await TaobaoOrder.findOne({
          orderNumber: orderId,
        })

        if (order) {
          return {
            productName: order.orders[0].productName,
            thumbnail: order.orders[0].thumbnail,
            detail: order.orders[0].detail,
          }
        }
        return null
      } catch (e) {
        logger.error(`TaobaoOrderSimpleInfo: ${e}`)
        return null
      }
    },
    CoupangRecommendedCategory: async (parent, { productName }, { req, logger }) => {
      try {
        const response = await CategoryPredict({ userID: req.user.adminUser, productName })

        return response
      } catch (e) {
        logger.error(`CoupangRecommendedCategory: ${e}`)
        return {
          code: 0,
          message: null,
          data: null,
        }
      }
    },
    CoupangCategorySearch: async (parent, { displayCategoryCode }, { req, logger }) => {
      try {
        const response = await CategorySearch({
          userID: req.user ? req.user.adminUser : "5f0d5ff36fc75ec20d54c40b",
          displayCategoryCode,
        })
        // const response = await DisplayCategories()

        // response.data.child.map(item => {
        //   console.log("child", item)
        // })

        return response
      } catch (e) {
        logger.error(`CoupangCategorySearch: ${e}`)
        return {
          code: 0,
          message: null,
          data: null,
        }
      }
    },
    CoupangDisplayCategoryes: async (parent, {}, { req, logger }) => {
      try {
        const response = await DisplayCategories({ userID: "5f0d5ff36fc75ec20d54c40b" })

        let options = response.data.child
          .filter((item) => item.status === "ACTIVE")
          .map((item) => {
            const child1 = item.child
              .filter((item) => item.status === "ACTIVE")
              .map((item) => {
                const child2 = item.child
                  .filter((item) => item.status === "ACTIVE")
                  .map((item) => {
                    const child3 = item.child
                      .filter((item) => item.status === "ACTIVE")
                      .map((item) => {
                        const child4 = item.child
                          .filter((item) => item.status === "ACTIVE")
                          .map((item) => {
                            const child5 = item.child
                              .filter((item) => item.status === "ACTIVE")
                              .map((item) => {
                                return {
                                  value: item.displayItemCategoryCode,
                                  label: item.name,
                                }
                              })
                            return {
                              value: item.displayItemCategoryCode,
                              label: item.name,
                              child: child5,
                            }
                          })
                        return {
                          value: item.displayItemCategoryCode,
                          label: item.name,
                          child: child4,
                        }
                      })
                    return {
                      value: item.displayItemCategoryCode,
                      label: item.name,
                      child: child3,
                    }
                  })
                return {
                  value: item.displayItemCategoryCode,
                  label: item.name,
                  child: child2,
                }
              })
            return {
              value: item.displayItemCategoryCode,
              label: item.name,
              child: child1,
            }
          })

        return options
      } catch (e) {
        logger.error(`CoupangDisplayCategoryes: ${e}`)
        return []
      }
    },
    CoupangOutbound: async (parent, {}, { req, logger }) => {
      try {
        const response = await Outbound({ userID: req.user.adminUser })
        console.log("reponse", response)
      } catch (e) {
        logger.error(`CoupangOutbound: ${e}`)
        return false
      }
    },
    CoupangCategoryMeta: async (parent, { categoryCode }, { req, logger }) => {
      try {
        if (!categoryCode) {
          return false
        }
        const response = await CategoryMeta({ userID: req.user.adminUser, categoryCode })

        return response
      } catch (e) {
        logger.error(`CoupangCategoryMeta: ${e}`)
        return false
      }
    },
    Cafe24OriginType: async (parent, { offset }, { logger }) => {
      try {
        const aa = await Cafe24ListAllOrigin({ mallID: "tsnullp", offset })
        return aa.origin
      } catch (e) {
        logger.error(`Cafe24OriginType: ${e}`)
        return false
      }
    },
    CoupangGET_PRODUCT_BY_PRODUCT_ID: async (parent, { productID }, { req }) => {
      try {
        const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID: req.user.adminUser,
          productID,
        })

        return response
      } catch (e) {
        console.log("CoupangGET_PRODUCT_BY_PRODUCT_ID", e)
        return false
      }
    },
    ListAllOrders: async (
      parent,
      { orderState, userID },
      { req, model: { Market, Product, DeliveryInfo, MarketOrder, OrderList }, logger }
    ) => {
      const list = []
      try {
        const user = userID ? userID : req.user.adminUser
        const market = await Market.findOne({
          userID: user,
        })
        const endDate = moment().format("YYYY-MM-DD")

        const startDate = moment().subtract(2, "month").format("YYYY-MM-DD")

        let response = await Cafe24ListOrders({
          mallID: market.cafe24.mallID,
          orderState,
          startDate,
          endDate,
        })
        console.log("response-->", response)

        if (orderState === "상품준비") {
          for (const item of response) {
            try {
              item.items = item.items.filter((iItem) => {
                if (iItem.order_status === "NOO") {
                  return false
                }
                if (iItem.open_market_status.includes("취소")) {
                  return false
                }
                if (iItem.open_market_status.includes("환불")) {
                  return false
                }
                return true
              })

              if (
                item.items.length === 0 ||
                item.items[0].order_status === "N00" ||
                item.items[0].open_market_status.includes("취소") ||
                item.items[0].open_market_status.includes("환불")
              ) {
                continue
              }

              const temp = await MarketOrder.findOne({
                userID: ObjectId(user),
                market: getMarketName(item.market_id),
                orderId: item.market_order_info,
              })

              await MarketOrder.findOneAndUpdate(
                {
                  userID: ObjectId(user),
                  market: getMarketName(item.market_id),
                  orderId: item.market_order_info,
                },
                {
                  $set: {
                    userID: ObjectId(user),
                    market: getMarketName(item.market_id),
                    orderId: item.market_order_info,
                    cafe24OrderID: item.market_order_info,
                    orderer: {
                      name: item.buyer.name,
                      email: item.buyer.email,
                      tellNumber: item.buyer.phone,
                      hpNumber: item.buyer.cellphone,
                      orderDate: moment(item.order_date).format("YYYYMMDD"),
                      orderTime: moment(item.order_date).format("HHmmss"),
                    },
                    paidAtDate: moment(item.payment_date).format("YYYYMMDD"),
                    paidAtTime: moment(item.payment_date).format("HHmmss"),

                    shippingPrice: Number(item.actual_order_amount.shipping_fee.replace(/,/gi, "")),

                    receiver: {
                      name: item.receivers[0].name,
                      tellNumber: item.receivers[0].phone,
                      hpNumber: item.receivers[0].cellphone,
                      addr: item.receivers[0].address_full,
                      postCode: item.receivers[0].zipcode,
                      parcelPrintMessage: item.receivers[0].shipping_message,
                    },

                    orderItems: item.items.map((item) => {
                      return {
                        title: item.product_name_default,
                        option: item.option_value.replace("옵션=", ""),
                        quantity: Number(item.quantity),
                        salesPrice: Number(item.product_price.replace(/,/gi, "")),
                        orderPrice: Number(item.product_price.replace(/,/gi, "")),
                        discountPrice:
                          Number(item.additional_discount_price.replace(/,/gi, "")) +
                          Number(item.coupon_discount_price.replace(/,/gi, "")),
                      }
                    }),

                    overseaShippingInfoDto: {
                      personalCustomsClearanceCode: item.receivers[0].clearance_information,
                      ordererPhoneNumber: item.receivers[0].cellphone,
                    },

                    saleType: getOrderState(item.items[0].order_status),
                    deliveryCompanyName:
                      temp && temp.deliveryCompanyName ? temp.deliveryCompanyName : "CJ 대한통운",
                  },
                },
                { upsert: true }
              )
            } catch (e) {
              console.log("ERROR", e)
              console.log("ERROR-ITME", item)
            }
            // console.log("item.market_order_info", item.market_order_info)

            const deliveryInfo = await DeliveryInfo.aggregate([
              {
                $match: {
                  userID: ObjectId(user),
                  "orderItems.오픈마켓주문번호": { $regex: `.*${item.market_order_info}.*` },
                },
              },
              //   {
              //     $lookup: {
              //       from: "marketorders",
              //       localField: "orderItems.오픈마켓주문번호",
              //       foreignField: "orderId",
              //       as: "marketOrder"
              //     }
              //   },
              //  {
              //    $unwind: "$marketOrder"
              //  },
            ])

            let taobaoOrderNumber = null
            let shippingNumber = null
            let deliveryCompanyName = "CJ 대한통운"
            let marketOrder = null

            if (deliveryInfo.length > 0) {
              shippingNumber = deliveryInfo[0].shippingNumber
              marketOrder = await MarketOrder.findOne({
                orderId: item.market_order_info,
              })

              if (marketOrder && marketOrder.invoiceNumber) {
                shippingNumber = marketOrder.invoiceNumber
                deliveryCompanyName = "경동택배"
              }
            }

            // if(item.market_order_info === "3531505752"){
            // console.log("deliveryInfo", deliveryInfo)

            // }

            // // Cafe24RegisterShipments

            if (shippingNumber) {
              const shipment = await Cafe24RegisterShipments({
                mallID: market.cafe24.mallID,
                order_id: item.order_id,
                tracking_no: shippingNumber,
                shipping_company_code:
                  deliveryCompanyName === "CJ 대한통운"
                    ? "0006"
                    : deliveryCompanyName === "경동택배"
                    ? "0039"
                    : null,
                order_item_code: item.items.map((item) => item.order_item_code),
                shipping_code: item.receivers[0].shipping_code,
              })

              if (shipment && shipment.message === null) {
                const updateShipment = await Cafe24UpdateShipments({
                  mallID: market.cafe24.mallID,
                  input: [
                    {
                      shipping_code: item.receivers[0].shipping_code,
                      order_id: item.order_id,
                    },
                  ],
                })
              }
              await sleep(500)
            } else {
            }
          }

          // 한번더 불러온다
          response = await Cafe24ListOrders({
            mallID: market.cafe24.mallID,
            orderState,
            startDate,
            endDate,
          })
        }

        const promiseArray = response
          .filter((item) => {
            item.items = item.items.filter((iItem) => {
              if (iItem.order_status === "NOO") {
                return false
              }
              if (iItem.open_market_status.includes("취소")) {
                return false
              }
              if (iItem.open_market_status.includes("환불")) {
                return false
              }
              return true
            })

            if (
              item.items.length === 0 ||
              item.items[0].order_status === "N00" ||
              item.items[0].open_market_status.includes("취소") ||
              item.items[0].open_market_status.includes("환불")
            ) {
              return false
            }
            return true
          })
          .map((item) => {
            // console.log("item.-->", item.receivers)
            // for(const option of item.items){
            //   const product = await Product.findOne(
            //     {
            //       "product.korTitle": option.product_name_default
            //     }
            //   )
            //   if(product){
            //     option.url = product.basic.url
            //   }
            // }
            // list.push(item)
            return new Promise(async (resolve, reject) => {
              try {
                let i = 0
                for (const option of item.items) {
                  let productName = ``
                  const nameArray = option.product_name_default
                    .split(" ")
                    .filter((item) => item.trim().length > 0)

                  for (const item of nameArray) {
                    productName += ` "${item}"`
                  }

                  option.product_price = Number(option.product_price) + Number(option.option_price)
                  option.option_value = option.option_value.split("=")[1]

                  const product = await Product.findOne({
                    userID: ObjectId(user),
                    $text: {
                      $search: productName.trim(),
                    },
                    // "product.korTitle": option.product_name_default
                  })

                  if (product) {
                    let optionValue = ""

                    for (const item of option.options.filter(
                      (item) => item.option_value.option_text !== "종류"
                    )) {
                      optionValue += ` ${item.option_value.option_text}`
                    }
                    optionValue = optionValue.trim()
                    // console.log("options", option.options)
                    // console.log("optionValue", optionValue)
                    // console.log("option.option_value", option.option_value)

                    option.url = product.basic.url
                    const matchItem = product.options.filter((item) => {
                      // let optionValue = ""
                      // const optionValues = option.option_value_default ? option.option_value_default.splilt(",") : []
                      // for(const item of optionValues){
                      //   optionValue += ` ${item.splilt("=")[1].trim()}`
                      // }

                      // console.log("optionValue = ", optionValue.trim())
                      if (
                        // option.variant_code === item.cafe24.variant_code &&

                        item.korValue === option.option_value ||
                        item.korKey === option.option_value ||
                        (item.korValue
                          ? regExp_test(
                              item.korValue
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            )
                          : null) === option.option_value ||
                        (item.korValue
                          ? regExp_test(
                              item.korValue
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            ).replace(/ /g, "")
                          : null) === option.option_value ||
                        (item.korKey
                          ? regExp_test(
                              item.korKey
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            )
                          : null) === option.option_value ||
                        (item.korKey
                          ? regExp_test(
                              item.korKey
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            ).replace(/ /g, "")
                          : null) === option.option_value
                      ) {
                        return true
                      }

                      if (
                        item.korValue === optionValue ||
                        item.korKey === optionValue ||
                        (item.korValue
                          ? regExp_test(
                              item.korValue
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            )
                          : null) === optionValue ||
                        (item.korValue
                          ? regExp_test(
                              item.korValue
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            ).replace(/ /g, "")
                          : null) === optionValue ||
                        (item.korKey
                          ? regExp_test(
                              item.korKey
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            )
                          : null) === optionValue ||
                        (item.korKey
                          ? regExp_test(
                              item.korKey
                                .replace("(", "")
                                .replace(")", "")
                                .replace("[", "")
                                .replace("]", "")
                                .replace("【", "")
                                .replace("】", "")
                                .replace("/", "")
                                .replace(",", "")
                                .replace(".", "")
                                .replace("*", "")
                            ).replace(/ /g, "")
                          : null) === optionValue
                      ) {
                        return true
                      }

                      return false
                    })

                    if (matchItem.length > 0) {
                      option.productID = product._id
                      option.isMatch = true
                      option.image = matchItem[0].image
                      option.sellerProductItemId = matchItem[0].coupang
                        ? matchItem[0].coupang.sellerProductItemId
                        : matchItem[0].coupang.sellerProductItemId
                      option.vendorItemId = matchItem[0].coupang
                        ? matchItem[0].coupang.vendorItemId
                        : matchItem[0].coupang.vendorItemId
                      option.itemId = matchItem[0].coupang
                        ? matchItem[0].coupang.itemId
                        : matchItem[0].coupang.itemId
                      option.korValue = matchItem[0] ? matchItem[0].korValue : null
                      option.value = matchItem[0] ? matchItem[0].value : null
                      if (
                        product.basic.options.filter((fItem) => fItem.key === matchItem[0].key)
                          .length > 0
                      ) {
                        option.value = product.basic.options.filter(
                          (fItem) => fItem.key === matchItem[0].key
                        )[0].value
                      }
                    } else {
                      option.productID = product._id
                      option.isMatch = false
                      option.image = product.options.length > 0 ? product.options[0].image : null
                      option.sellerProductItemId =
                        product.options.length > 0 && product.options[0].coupang
                          ? product.options[0].coupang.sellerProductItemId
                          : null
                      option.vendorItemId =
                        product.options.length > 0 && product.options[0].coupang
                          ? product.options[0].coupang.vendorItemId
                          : null
                      option.itemId =
                        product.options.length > 0 && product.options[0].coupang
                          ? product.options[0].coupang.itemId
                          : null
                      option.korValue =
                        product.options.length > 0 && product.options[0].coupang
                          ? product.options[0].korValue
                          : null
                    }
                    //cafe24: { variant_code: 'P0000QMP000R' }
                    // console.log("product.options", product.options)
                    
                    item.createdAt = product.createdAt
                    const orderCount = await MarketOrder.find({
                      userID: ObjectId(user),
                      saleType: 1,
                      $text: {
                        $search: productName.trim(),
                      }
                    })
                    item.orderCount = orderCount.length
                  }
                }

                item.order_price_amount = item.actual_order_amount.payment_amount

                item.receiver = {
                  ...item.receivers[0],
                }
                item.buyer = {
                  name: item.buyer.name,
                  phone: item.buyer.phone,
                }
                item.valid_number = {
                  checkUnipass: false,
                }
                if (isPhoneNum(item.buyer.cellphone)) {
                  item.valid_number.phone = item.buyer.cellphone
                } else if (isPhoneNum(item.buyer.phone)) {
                  item.valid_number.phone = item.buyer.phone
                } else if (isPhoneNum(item.receiver.cellphone)) {
                  item.valid_number.phone = item.receiver.cellphone
                } else if (isPhoneNum(item.receiver.phone)) {
                  item.valid_number.phone = item.receiver.phone
                }

                const response = await customs({
                  persEcm: item.receiver.clearance_information
                    ? item.receiver.clearance_information.toUpperCase()
                    : item.receiver.clearance_information,
                  pltxNm: [item.receiver.name, item.buyer.name],
                  cralTelno: item.valid_number.phone,
                })

                const deliveryInfo = await DeliveryInfo.aggregate([
                  {
                    $match: {
                      userID: req.user.adminUser,
                      "orderItems.오픈마켓주문번호": { $regex: `.*${item.market_order_info}.*` },
                    },
                  },
                ])

                if (deliveryInfo.length > 0) {
                  let i = 0
                  // console.log("deliveryInfo[0].orderItems", deliveryInfo[0].orderItems)
                  item.orderSeq = deliveryInfo[0].orderSeq
                  for (const option of item.items) {
                    if (deliveryInfo[0].orderItems[i]) {
                      option.taobaoOrderNumber = deliveryInfo[0].orderItems[i].taobaoOrderNo
                    }
                    i++
                  }

                  item.delivery_id = deliveryInfo[0].orderNo
                  item.shipping = {
                    shippingNumber: deliveryInfo[0].shippingNumber,
                    deliveryCompanyName: "CJ 대한통운",
                    shipping_code: item.receivers[0].shipping_code,
                  }

                  const marketOrder = await MarketOrder.findOne({
                    orderId: item.market_order_info,
                  })

                  if (marketOrder && marketOrder.invoiceNumber) {
                    item.shipping = {
                      shippingNumber: marketOrder.invoiceNumber,
                      deliveryCompanyName: "경동택배",
                      shipping_code: item.receivers[0].shipping_code,
                    }
                  }
                }
                if (response) {
                  item.valid_number.name = response.name
                  item.valid_number.persEcm = response.persEcm
                  item.valid_number.checkUnipass = true
                } else {
                  item.valid_number.name = item.buyer.name
                  item.valid_number.persEcm = item.receiver.clearance_information
                    ? item.receiver.clearance_information.toUpperCase()
                    : item.receiver.clearance_information
                  item.valid_number.checkUnipass = false
                  // 개인통관번호 일치하지 않으면

                  if (deliveryInfo.length > 0) {
                    item.valid_number.name = deliveryInfo[0].수취인이름
                    item.valid_number.persEcm = deliveryInfo[0].개인통관부호
                    item.valid_number.phone = deliveryInfo[0].수취인연락처
                    item.valid_number.checkUnipass = true
                  }
                }
                list.push(item)
                resolve()
              } catch (e) {
                reject(e)
              }
            })
          })

        await Promise.all(promiseArray)

        // for(const item of list){
        //   await OrderList.findOneAndUpdate(
        //     {
        //       userID: req.user.adminUser,
        //       market_id: item.market_id,
        //       market_order_info: item.market_order_info
        //     },
        //     {
        //       $set: {
        //         ...item,
        //         order_date_date: moment(item.order_date)
        //       }
        //     },
        //     { upsert: true, new: true }
        //   )
        // }

        return list.sort((a, b) => {
          const aDate = moment(a.order_date).format("YYYYMMDDHHSSmm")
          const bDate = moment(b.order_date).format("YYYYMMDDHHSSmm")
          return bDate - aDate
        })
      } catch (e) {
        console.log("ListAllOrders", e)
        return list
      }
    },
    SalesClendar: async (parent, { date, userID }, { req, model: { Market }, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser
        const market = await Market.findOne({ userID: user })
        const stringDate = moment(date, "YYYYMMDD").format("YYYY-MM-DD")
        if(!market) {
          return null
        }
        const response = await Cafe24ListAllOrders({
          mallID: market.cafe24.mallID,
          startDate: stringDate,
          endDate: stringDate,
        })

        let orderPriceAmount = 0 // 총 금액
        let orderPriceCount = 0 // 총 금액
        let discountPriceAmount = 0 // 할인 금액
        let discountPriceCount = 0 // 할인 금액
        let shippingFee = 0
        let shippingCount = 0
        let cancelPriceAmount = 0
        let cancelPriceCount = 0
        let returnPriceAmount = 0
        let returnPriceCount = 0
        for (const item of response) {
          // console.log("item", item.market_order_info)
          orderPriceAmount +=
            (Number(item.actual_order_amount.order_price_amount) || 0) +
            (Number(item.shipping_fee) || 0)
          orderPriceCount += 1
          discountPriceAmount +=
            (Number(item.actual_order_amount.order_price_amount) || 0) -
            (Number(item.actual_order_amount.payment_amount) || 0)
          if (
            (Number(item.actual_order_amount.order_price_amount) || 0) -
            (Number(item.actual_order_amount.payment_amount) > 0 || 0)
          ) {
            discountPriceCount += 1
          }
          shippingFee += Number(item.shipping_fee) || 0
          if (Number(item.shipping_fee) > 0 || 0) {
            shippingCount += 1
          }

          // let optionLength = item.items.length
          // let cancelLength = 0
          for (const option of item.items) {
            if (option.order_status.includes("C") || option.order_status.includes("R")) {
              // console.log("item.order_status ---->", option.order_status, option.product_price)
              cancelPriceAmount += Number(option.product_price)
              cancelPriceCount += 1
              // cancelLength += 1
            }
            if (option.order_status.includes("R")) {
              // console.log("item.order_status ---->", option.order_status, option.product_price)
              returnPriceAmount += Number(option.product_price)
              returnPriceCount += 1
              // cancelLength += 1
            }
          }
          // if(optionLength === cancelLength) {
          //   cancelPriceAmount -= Number(item.shipping_fee)
          // }

          // console.log("itme.payment_date", moment(item.payment_date).format("YYYYMMDD"))
          // console.log("itme.order_price_amount", item.order_price_amount)
          // console.log("itme.shipping_fee", item.shipping_fee)
        }

        return {
          orderPriceAmount,
          orderPriceCount,
          discountPriceAmount,
          discountPriceCount,
          shippingFee,
          shippingCount,
          cancelPriceAmount,
          cancelPriceCount,
          returnPriceAmount,
          returnPriceCount,
        }
      } catch (e) {
        console.log("SalesClendar", e)
        return null
      }
    },
    SalesMonthClendar: async (parent, { date, userID }, { req, model: { Market }, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser
        const market = await Market.findOne({ userID: user })

        const stringDate = moment(date, "YYYYMM").format("YYYY-MM")

        const response = await Cafe24ListAllOrders({
          mallID: market.cafe24.mallID,
          startDate: `${stringDate}-01`,
          endDate: `${stringDate}-31`,
        })

        let orderPriceAmount = 0 // 총 금액
        let orderPriceCount = 0 // 총 금액
        let discountPriceAmount = 0 // 할인 금액
        let discountPriceCount = 0 // 할인 금액
        let shippingFee = 0
        let shippingCount = 0
        let cancelPriceAmount = 0
        let cancelPriceCount = 0
        let returnPriceAmount = 0
        let returnPriceCount = 0
        for (const item of response) {
          // console.log("item", item.market_order_info)
          orderPriceAmount +=
            (Number(item.actual_order_amount.order_price_amount) || 0) +
            (Number(item.shipping_fee) || 0)
          orderPriceCount += 1
          discountPriceAmount +=
            (Number(item.actual_order_amount.order_price_amount) || 0) -
            (Number(item.actual_order_amount.payment_amount) || 0)
          if (
            (Number(item.actual_order_amount.order_price_amount) || 0) -
              (Number(item.actual_order_amount.payment_amount) || 0) >
            0
          ) {
            discountPriceCount += 1
          }
          shippingFee += Number(item.shipping_fee) || 0
          if ((Number(item.shipping_fee) || 0) > 0) {
            shippingCount += 1
          }

          // let optionLength = item.items.length
          // let cancelLength = 0
          for (const option of item.items) {
            if (option.order_status.includes("C") || option.order_status.includes("R")) {
              // console.log("item.order_status ---->", option.order_status, option.product_price)
              cancelPriceAmount += Number(option.product_price)
              cancelPriceCount += 1
              // cancelLength += 1
            }
            if (option.order_status.includes("R")) {
              // console.log("item.order_status ---->", option.order_status, option.product_price)
              returnPriceAmount += Number(option.product_price)
              returnPriceCount += 1
              // cancelLength += 1
            }
          }
          // if(optionLength === cancelLength) {
          //   cancelPriceAmount -= Number(item.shipping_fee)
          // }

          // console.log("itme.payment_date", moment(item.payment_date).format("YYYYMMDD"))
          // console.log("itme.order_price_amount", item.order_price_amount)
          // console.log("itme.shipping_fee", item.shipping_fee)
        }
        // console.log("-----", orderPriceAmount, discountPriceAmount, shippingFee, cancelPriceAmount, returnPriceAmount)

        return {
          orderPriceAmount,
          orderPriceCount,
          discountPriceAmount,
          discountPriceCount,
          shippingFee,
          shippingCount,
          cancelPriceAmount,
          cancelPriceCount,
          returnPriceAmount,
          returnPriceCount,
        }
        return true
      } catch (e) {
        console.log("SalesClendar", e)
        return null
      }
    },
    SalesDetail: async (
      parent,
      { startDate, endDate, userID },
      { req, model: { Market }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : ObjectId(req.user.adminUser)
      try {
        const market = await Market.findOne({ userID: user })
        const response = await Cafe24ListAllOrders({
          mallID: market.cafe24.mallID,
          startDate,
          endDate,
        })

        let returnValue = []
        for (const item of response) {
          
          returnValue.push({
            market_id: item.market_id,
            market_order_info: item.market_order_info,
            payment_amount:
            (Number(item.actual_order_amount.order_price_amount) || 0) + (Number(item.final_shipping_fee) || 0),
            items: item.items.map((item) => {
              return {
                product_name: item.product_name,
                option_value: item.option_value.replace("옵션=", ""),
                quantity: Number(item.quantity) || 0,
                order_status: item.order_status,
                prooduct_price: Number(item.product_price) || 0,
              }
            }),
          })
        }
        return returnValue
      } catch (e) {
        logger.error(`SalesDetail: ${e.message} - ${e}`)
        return []
      }
    },
    OrderCount: async (parent, { orderState }, { req, model: { Market }, logger }) => {
      try {
        // const market = await Market.findOne({userID: req.user.adminUser})
        const endDate = moment().format("YYYY-MM-DD")
        const startDate = moment().subtract(90, "days").format("YYYY-MM-DD")
        console.log("orderState", orderState)
        const response = await Cafe24CountAllOrders({
          // mallID : market.cafe24.mallID,
          mallID: "tsnullp",
          orderState,
          startDate,
          endDate,
        })

        return response.data.count
        return 0
      } catch (e) {
        console.log("SalesClendar", e)
        return 0
      }
    },
    NewZipCode: async (parent, { keyword }, { req, logger }) => {
      try {
        const response = await newAddressPostZip({ keyword })

        if (response && response.results && response.results.common.errorMessage === "정상") {
          if (response.results.juso.length > 0) {
            return response.results.juso[0].zipNo
          }
        }
        return ""
      } catch (e) {
        console.log("NewZipCode", e)
        return null
      }
    },
    TabaeDelay: async (parent, {}, { req, model: { Market, DeliveryInfo }, logger }) => {
      try {
        const user = req.user ? req.user.adminUser : ObjectId("5f0d5ff36fc75ec20d54c40b")
        const market = await Market.findOne({
          userID: user,
        })
        const endDate = moment().format("YYYY-MM-DD")
        const startDate = moment().subtract(90, "days").format("YYYY-MM-DD")
        let response = await Cafe24ListOrders({
          mallID: market.cafe24.mallID,
          orderState: "준비지시중",
          startDate,
          endDate,
        })

        const marketOrder = response.map((item) => item.market_order_info)
        const delivery1 = await DeliveryInfo.aggregate([
          {
            $match: {
              userID: user,
              isDelete: false,
              상태: "접수대기",
              "orderItems.오픈마켓주문번호": {
                $in: marketOrder,
              },
            },
          },
          {
            $lookup: {
              from: "taobaoorders",
              localField: "orderItems.taobaoOrderNo",
              foreignField: "orderNumber",
              as: "taobaoOrder",
            },
          },
          {
            $unwind: "$taobaoOrder",
          },
          {
            $sort: {
              "taobaoOrder.orderDate": 1,
              "taobaoOrder.orderTime": 1,
            },
          },
          {
            $limit: 5,
          },
        ])
        const delivery2 = await DeliveryInfo.aggregate([
          {
            $match: {
              userID: user,
              isDelete: false,
              상태: "접수신청",
              "orderItems.오픈마켓주문번호": {
                $in: marketOrder,
              },
            },
          },
          {
            $lookup: {
              from: "taobaoorders",
              localField: "orderItems.taobaoOrderNo",
              foreignField: "orderNumber",
              as: "taobaoOrder",
            },
          },
          {
            $unwind: "$taobaoOrder",
          },
          {
            $sort: {
              "taobaoOrder.orderDate": 1,
              "taobaoOrder.orderTime": 1,
            },
          },
          {
            $limit: 5,
          },
        ])

        const data = []

        for (const item of delivery1) {
          data.push({
            type: 1,
            orderNo: item.orderNo,
            name: item.수취인이름,
            phone: item.수취인연락처,
            orderNumber: item.taobaoOrder ? item.taobaoOrder.orderNumber : null,
            orderDate: item.taobaoOrder ? item.taobaoOrder.orderDate : null,
            orderTime: item.taobaoOrder ? item.taobaoOrder.orderTime : null,
            thumbnail: item.taobaoOrder ? item.taobaoOrder.orders[0].thumbnail : null,
          })
        }
        for (const item of delivery2) {
          data.push({
            type: 2,
            orderNo: item.orderNo,
            name: item.수취인이름,
            phone: item.수취인연락처,
            orderNumber: item.taobaoOrder ? item.taobaoOrder.orderNumber : null,
            orderDate: item.taobaoOrder ? item.taobaoOrder.orderDate : null,
            orderTime: item.taobaoOrder ? item.taobaoOrder.orderTime : null,
            thumbnail: item.taobaoOrder ? item.taobaoOrder.orders[0].thumbnail : null,
          })
        }

        return data
      } catch (e) {
        logger.error(`TabaeDelay: ${e}`)
        return []
      }
    },
    Cafe24Boards: async (parent, {userID}, {req, model: {User, Market}, logger}) => {
      try {

        const user = userID ? userID : req.user.adminUser
      //  const user = "5f6040f67f596146ccf2fb3a" 
        const userModel = await User.findOne(
          {
            $match: {
              userID: user
            }
          }
        )
        const userGroup = await User.aggregate([
          {
            $match: {
              group: userModel.group
            }
          }
        ])

        for(const item of userGroup){
          const market = await Market.findOne(
            {
              userID: item._id
            }
          )
          const mallID = market.cafe24.mallID

          const response = await Cafe24BoardList({mallID})

          // console.log("response", response.data.boards)

          for(const board of response.data.boards.filter(fItem => fItem.board_type !== 1)){
            // for(const board of response.data.boards){
            const articlesResponse = await Cafe24BoardPosts({mallID, board_no: board.board_no})
            
            if(articlesResponse.data.articles.length > 0){
              console.log("board", board.board_type, board.board_no)
              console.log("articlesResponse", articlesResponse.data.articles)
            }
          }
        }

        
        return true
      } catch (e){
        logger.error(`Cafe24Boards: ${e}`)
        return []
      }
    }
  },
  Mutation: {
    CreateProduct: async (parent, { id, product, options, coupang, cafe24 }, { req, logger }) => {
      const returnMessage = {
        coupang: {
          code: null,
          message: null,
        },
        cafe24: {
          code: null,
          message: null,
        },
      }
      try {
        if (!product || !options) {
          return {
            coupang: {
              code: "ERROR",
              message: "상품 등록 오류 - 잘못된 상품입니다.",
            },
          }
        }

        const coupangResponse = await updateCoupang({
          id,
          product,
          options,
          coupang,
          userID: req.user.adminUser,
          writerID: req.user.adminUser,
        })
        const cafe24Resnse = await updateCafe24({
          id,
          product,
          options,
          cafe24,
          userID: req.user.adminUser,
          writerID: req.user.adminUser,
        })

        returnMessage.coupang = coupangResponse
        returnMessage.cafe24 = cafe24Resnse
      } catch (e) {
        logger.error(`CreateProduct: ${e.message} - ${e}`)

        return false
      } finally {
        return returnMessage
      }
    },
    CreateCoupang: async (parent, { id, product, options, coupang }, { req, logger }) => {
      console.log("쿠팡 타냐?")
      const returnMessage = {
        coupang: {
          code: null,
          message: null,
        },
      }
      try {
        if (!product || !options) {
          return {
            coupang: {
              code: "ERROR",
              message: "상품 등록 오류 - 잘못된 상품입니다.",
            },
          }
        }

        const coupangResponse = await updateCoupang({
          id,
          product,
          options,
          coupang,
          userID: req.user.adminUser,
        })
        console.log("coupangResponse", coupangResponse)
        returnMessage.coupang = coupangResponse
      } catch (e) {
        logger.error(`CreateCoupang: ${e.message} - ${e}`)
        console.log("CreateCoupang -- ", e)
        return false
      } finally {
        return returnMessage
      }
    },
    CreateCafe24: async (parent, { id, product, options, cafe24 }, { req, logger }) => {
      const returnMessage = {
        coupang: {
          code: null,
          message: null,
        },
      }
      try {
        if (!product || !options) {
          return {
            coupang: {
              code: "ERROR",
              message: "상품 등록 오류 - 잘못된 상품입니다.",
            },
          }
        }

        const cafe24Resnse = await updateCafe24({
          id,
          product,
          options,
          cafe24,
          userID: req.user.adminUser,
          writerID: req.user.adminUser,
        })

        returnMessage.cafe24 = cafe24Resnse
      } catch (e) {
        logger.error(`CreateCoupang: ${e.message} - ${e}`)
        console.log("CreateCoupang -- ", e)
        return false
      } finally {
        return returnMessage
      }
    },
    CreateCategory: async (
      paret,
      { mallID, userID },
      { req, model: { Market, CategoryInfo }, logger }
    ) => {
      try {
        // const market = await Market.findOne(
        //   {
        //     userID: req.user.adminUser
        //   }
        // )

        const 대분류 = smartStoreCategory.reduce(
          (unique, item) =>
            unique.includes(item["대분류"]) ? unique : [...unique, item["대분류"]],
          []
        )

        for (const 대분류아이템 of 대분류) {
          const categoryNo1 = await Cafe24CreateCategoryFun(mallID, 1, 대분류아이템)

          let 중분류 = smartStoreCategory
            .filter((item) => item["대분류"] === 대분류아이템)
            .reduce(
              (unique, item) =>
                unique.includes(item["중분류"]) ? unique : [...unique, item["중분류"]],
              []
            )

          for (const 중분류아이템 of 중분류) {
            const categoryNo2 = await Cafe24CreateCategoryFun(mallID, categoryNo1, 중분류아이템)
            let 소분류 = smartStoreCategory
              .filter((item) => item["대분류"] === 대분류아이템 && item["중분류"] === 중분류아이템)
              .reduce(
                (unique, item) =>
                  unique.includes(item["소분류"]) ? unique : [...unique, item["소분류"]],
                []
              )

            for (const 소분류아이템 of 소분류) {
              if (소분류아이템.length > 0) {
                const categoryNo3 = await Cafe24CreateCategoryFun(mallID, categoryNo2, 소분류아이템)

                let categoryCode = getSelectedCategoryCode(
                  대분류아이템,
                  중분류아이템,
                  소분류아이템,
                  ""
                )
                if (categoryCode) {
                  if (소분류아이템.length > 0) {
                    await CategoryInfo.findOneAndUpdate(
                      {
                        userID: ObjectId(userID),
                        naverCode: categoryCode,
                      },
                      {
                        $set: {
                          cafe24Code: categoryNo3,
                        },
                      },
                      { upsert: true }
                    )
                  } else {
                    await CategoryInfo.findOneAndUpdate(
                      {
                        userID: ObjectId(userID),
                        naverCode: categoryCode,
                      },
                      {
                        $set: {
                          cafe24Code: categoryNo2,
                        },
                      },
                      { upsert: true }
                    )
                  }
                } else {
                  let 세분류 = smartStoreCategory
                    .filter(
                      (item) =>
                        item.대분류 === 대분류아이템 &&
                        item.중분류 === 중분류아이템 &&
                        item.소분류 === 소분류아이템
                    )
                    .reduce(
                      (unique, item) =>
                        unique.includes(item["세분류"]) ? unique : [...unique, item["세분류"]],
                      []
                    )

                  for (const 세분류아이템 of 세분류) {
                    let categoryCode = getSelectedCategoryCode(
                      대분류아이템,
                      중분류아이템,
                      소분류아이템,
                      세분류아이템
                    )
                    if (categoryCode) {
                      if (세분류아이템.length > 0) {
                        const categoryNo4 = await Cafe24CreateCategoryFun(
                          mallID,
                          categoryNo3,
                          세분류아이템
                        )
                        await CategoryInfo.findOneAndUpdate(
                          {
                            userID: ObjectId(userID),
                            naverCode: categoryCode,
                          },
                          {
                            $set: {
                              cafe24Code: categoryNo4,
                            },
                          },
                          { upsert: true }
                        )
                      } else {
                        await CategoryInfo.findOneAndUpdate(
                          {
                            userID: ObjectId(userID),
                            naverCode: categoryCode,
                          },
                          {
                            $set: {
                              cafe24Code: categoryNo3,
                            },
                          },
                          { upsert: true }
                        )
                      }
                    }
                  }
                }
              }
            }
          }
        }

        // console.log("대분류", 대분류)
        // console.log("중분류", 중분류)
        // console.log("소분류", 소분류)
        // console.log("세분류", 세분류)

        return true
      } catch (e) {
        logger.error(`CreateCategory: ${e}`)
        return false
      }
    },
    GetCoupangCategoryMeta: async (parent, { categoryCode }, { req, logger }) => {
      try {
        if (!categoryCode) {
          return false
        }
        console.log("categoryCode", categoryCode)
        const response = await CategoryMeta({ userID: req.user.adminUser, categoryCode })

        return response
      } catch (e) {
        logger.error(`CoupangCategoryMeta: ${e}`)
        return false
      }
    },
    GetKiprisWord: async (parent, { search }, { req, logger }) => {
      try {
        const response = await getKiprisWords(search)

        return response
      } catch (e) {
        logger.error(`GetKiprisWord: ${e}`)
        return null
      }
    },
    UnipassValid: async (parent, { name, customID, phone }, { logger }) => {
      try {
        const response = await customs({
          persEcm: customID,
          pltxNm: [name],
          cralTelno: phone,
        })
        if (response) {
          return true
        } else {
          return false
        }
      } catch (e) {
        logger.error(`UnipassValid: ${e}`)
        return false
      }
    },
    SetOrderShipping: async (parent, { input }, { req, model: { Market }, logger }) => {
      try {
        const market = await Market.findOne({
          userID: req.user.adminUser,
        })

        const shipment = await Cafe24UpdateShipments({
          mallID: market.cafe24.mallID,
          input: input,
        })

        return true
      } catch (e) {
        logger.error(`SetOrderShipping: ${e}`)
        return false
      }
    },
    UploadImage: async (parent, { base64Image }, { logger }) => {
      try {
        const response = await Cafe24UploadLocalImage({ base64Image })
        console.log("response--", response)
        // if(response && response.message === null){
        //   return response.data.images[0].path
        // }
        if (response) {
          return response
        }
        return null
      } catch (e) {
        logger.error(`UploadImage: ${e}`)
        return null
      }
    },
  },
}

const Cafe24CreateCategoryFun = async (mallID, categoryNo, categoryName) => {
  console.log("mallID", mallID, categoryNo, categoryName)
  const payload = {
    shop_no: 1,
    request: {
      parent_category_no: categoryNo,
      category_name: categoryName,
      display_type: "A",
      use_display: "T",
      use_main: "T",
      soldout_product_display: "B",
      sub_category_product_display: "T",
      hashtag_product_display: "F",
      // hash_tags: ["tag1", "tag2"],
      product_display_scope: "A",
      product_display_type: "U",
      product_display_key: "A",
      product_display_sort: "D",
      product_display_period: "W",
      normal_product_display_type: null,
      normal_product_display_key: null,
      normal_product_display_sort: null,
      normal_product_display_period: null,
      recommend_product_display_type: null,
      recommend_product_display_key: null,
      recommend_product_display_sort: null,
      recommend_product_display_period: null,
      new_product_display_type: null,
      new_product_display_key: null,
      new_product_display_sort: null,
      new_product_display_period: null,
    },
  }

  const response = await Cafe24CreateCategory({ mallID, payload })
  console.log("response", response)
  await sleep(500)
  return response.data.category.category_no
}

const getSelectedCategoryCode = (대분류아이템, 중분류아이템, 소분류아이템, 세분류아이템) => {
  const selectedItem = smartStoreCategory.filter(
    (item) =>
      item.대분류 === 대분류아이템 &&
      item.중분류 === 중분류아이템 &&
      item.소분류 === 소분류아이템 &&
      item.세분류 === 세분류아이템
  )
  if (selectedItem.length === 1) {
    return selectedItem[0]["카테고리코드"]
  } else {
    return null
  }
}

const updateCoupang = async ({
  id,
  product,
  options,
  coupang,
  userID,
  writerID,
  isShippingPrirce = false,
}) => {
  const returnMessage = {
    coupang: {
      code: null,
      message: null,
    },
  }
  console.log("userID, writerID", userID, writerID)

  if (userID.toString() === "5f1947bd682563be2d22f008" || userID.toString() === "5f601bdf18d42d13d0d616d0") {
    // 투포인트, 메타트론
    return
  }
  try {
    const basic = await Basic.findOne({
      userID,
    })

    let coupangProduct = null
    let coupangProductResponse = null
    let checkMainImage = []
    let searchTags = []

    const tempProduct = await Product.findOne({
      userID: ObjectId(userID),
      _id: ObjectId(id),
      isDelete: false,
    })

    if (tempProduct) {
      if (
        tempProduct.product &&
        tempProduct.product.coupang &&
        tempProduct.product.coupang.productID
      ) {
        product.coupang_productID = tempProduct.product.coupang.productID
      }

      tempProduct.options.forEach((tItem, index) => {
        if (options[index]) {
          options[index].coupang = tItem.coupang
          options[index].cafe24 = tItem.cafe24
        }
      })

      product.coupang = tempProduct.product.coupang
    }

    let tempCoupangResonse = null
    if (product.coupang_productID) {
      tempCoupangResonse = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
        userID,
        productID: product.coupang_productID,
      })
    }

    if (
      tempCoupangResonse &&
      tempCoupangResonse.data &&
      Array.isArray(tempCoupangResonse.data.items)
    ) {
      tempCoupangResonse.data.items.forEach((item) => {
        for (const oItem of options) {
          if (oItem.korValue === item.itemName || oItem.korKey === item.itemName) {
            oItem.coupang.sellerProductItemId = `${item.sellerProductItemId}`
            oItem.coupang.vendorItemId = `${item.vendorItemId}`
            oItem.coupang.itemId = `${item.itemId}`
          }
        }
      })
    }

    if (product.keyword && Array.isArray(product.keyword) && product.keyword.length > 0) {
      searchTags = product.keyword
        .filter((item) => item.length > 0)
        .map((item) => regExp_test(item.replace(/【/gi, "").replace(/】/gi, "")))
    } else {
      searchTags = [
        ...regExp_test(product.korTitle)
          .split(" ")
          .filter((item) => item.length > 0)
          .map((item) => item.replace(/【/gi, "").replace(/【/gi, "")),
      ]
    }
    searchTags = searchTags
      .filter((item) => item.length > 0 && item.length < 20)
      .map((item) => regExp_test(item))

    const salePrice = options
      .filter((item) => item.active && !item.disabled)
      .filter((i, index) => index < 100)[0].salePrice

    console.log("salePrice", salePrice)

    console.log("searchTags", searchTags)

    let minSalePrice = salePrice
    options
      .filter((item) => item.active && !item.disabled)
      .filter((i, index) => index < 100)
      .map((item) => {
        if (item.salePrice < minSalePrice) {
          minSalePrice = item.salePrice
        }
      })
    const htmlContent = `${product.gifHtml ? producth.gifHtml: ""}${product.topHtml}${
      product.isClothes && product.clothesHtml ? product.clothesHtml : ""
    }${product.isShoes && product.shoesHtml ? product.shoesHtml : ""}${product.optionHtml}${
      product.html
    }${product.bottomHtml}`

    if (Array.isArray(product.mainImage)) {
      for (const item of product.mainImages) {
        try {
          const image = await imageCheck(item)

          if (image.width >= 500 && image.height >= 500) {
            checkMainImage.push(item)
          }
        } catch (e) {
          // checkMainImage.push(item)
          console.log("checkImage", e.message)
        }
      }
    }

    if (basic && basic.kiprisInter) {
      const kiprise = await getKiprisWords(product.korTitle)
      let tempKorTitleArray = product.korTitle.split(" ")
      let tempKorTitle = ""
      let kipriseAray = kiprise.filter((item) => item.result === true)
      for (const item of kipriseAray) {
        while (tempKorTitleArray.indexOf(item.search) !== -1) {
          tempKorTitleArray.splice(tempKorTitleArray.indexOf(item.search), 1)
        }
      }
      tempKorTitle = tempKorTitleArray.join(" ")
      product.korTitle = tempKorTitle
    }

    if (product.coupang_productID) {
      for (const item of options) {
        try {
          if (item.active && !item.disabled) {
            // 판매 중지 처리 한다
            const response = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
              userID,
              vendorItemId: item.coupang.vendorItemId,
            })
            console.log("판매 중지 아이템 결과", response)
          }
        } catch (e) {
          console.log("판매 중지 처리 ", e.message)
        }
      }
      console.log("여기1")
      // 수정
      let shipping_price = 0
      options
        .filter((item) => item.active && !item.disabled)
        .filter((i, index) => index < 100)
        .map((item) => {
          if (item.weightPrice > shipping_price) {
            shipping_price = item.weightPrice
          }
        })

      console.log("shipping_price", shipping_price)
      coupangProduct = {
        // ...coupang,
        sellerProductId: product.coupang_productID,
        displayCategoryCode: coupang.displayCategoryCode,
        sellerProductName: product.korTitle, // 등록상품명
        vendorId: coupang.vendorId,
        saleStartedAt: `${moment().format("yyyy-MM-DD")}T${moment().format("hh:mm:ss")}`, // 판매시작일시
        saleEndedAt: "2099-12-31T12:00:00", // 판매종료일시
        displayProductName: product.korTitle, // 등록상품명
        brand: product.brand, // 브랜드
        manufacture: product.manufacture, // 제조사
        deliveryMethod: "AGENT_BUY", // 배송방법
        deliveryCompanyCode: coupang.deliveryCompanyCode,
        deliveryChargeType: isShippingPrirce ? "NOT_FREE" : product.deliveryChargeType,
        deliveryCharge: isShippingPrirce ? shipping_price : product.deliveryCharge,
        freeShipOverAmount: 0, // 무료배송을 위한 조건 금액
        deliveryChargeOnReturn:
          product.deliveryChargeOnReturn > minSalePrice / 2
            ? Math.floor((minSalePrice / 2) * 0.1) * 10
            : product.deliveryChargeOnReturn,
        remoteAreaDeliverable: "Y", // 도서산간 배송여부
        unionDeliveryType: "NOT_UNION_DELIVERY", // 묶음 배송여부
        returnCenterCode: coupang.returnCenterCode,
        returnChargeName: coupang.returnChargeName,
        companyContactNumber: coupang.companyContactNumber,
        returnZipCode: coupang.returnZipCode,
        returnAddress: coupang.returnAddress,
        returnAddressDetail: coupang.returnAddressDetail,
        returnCharge:
          coupang.returnCharge > minSalePrice / 2
            ? Math.floor((minSalePrice / 2) * 0.1) * 10
            : coupang.returnCharge,
        afterServiceInformation: coupang.afterServiceInformation,
        afterServiceContactNumber: coupang.afterServiceContactNumber,
        outboundShippingPlaceCode: coupang.outboundShippingPlaceCode,
        vendorUserId: coupang.vendorUserId,
        requested: true, // 자동승인요청여부
        requiredDocuments: [
          {
            templateName: "인보이스영수증(해외구매대행 선택시)",
            // templateName: "MANDATORY_OVERSEAS_PURCH",
            vendorDocumentPath: coupang.invoiceDocument, // 구비서류벤더경로
          },
        ],
        items: options
          .filter((item) => item.active && !item.disabled)
          .filter((i, index) => index < 100)
          .map((item) => {
            return {
              sellerProductItemId: item.coupang_sellerProductItemId
                ? item.coupang_sellerProductItemId
                : item.coupang.sellerProductItemId,
              vendorItemId: item.coupang_vendorItemId
                ? item.coupang_vendorItemId
                : item.coupang.vendorItemId,
              itemName: item.korKey ? item.korKey : item.korValue, //업체상품옵션명
              originalPrice: item.productPrice, //할인율기준가 (정가표시)
              salePrice: item.salePrice, //판매가격
              maximumBuyCount: item.stock, //판매가능수량
              maximumBuyForPerson: coupang.maximumBuyForPerson, // 인당 최대 구매 수량
              maximumBuyForPersonPeriod: coupang.maximumBuyForPersonPeriod, // 최대 구매 수량 기간
              outboundShippingTimeDay: product.outboundShippingTimeDay, //기준출고일(일)
              unitCount: 0, // 단위수량
              adultOnly: "EVERYONE", // 19세이상
              taxType: "TAX", // 과세여부
              parallelImported: "NOT_PARALLEL_IMPORTED", // 병행수입여부
              overseasPurchased: "OVERSEAS_PURCHASED", // 해외구매대행여부
              pccNeeded: true, // PCC(개인통관부호) 필수/비필수 여부
              externalVendorSku: item.key, // 판매자상품코드 (업체상품코드)
              barcode: "",
              emptyBarcode: true,
              emptyBarcodeReason: "상품확인불가_구매대행상품",
              // modelNo: product.good_id,
              certifications: Array.isArray(coupang.certifications)
                ? coupang.certifications
                    .filter((item) => item.required === "required")
                    .map((item) => {
                      return {
                        certifications: item.certificationType,
                        certificationCode: "",
                      }
                    })
                : [],

              searchTags,
              images: (() => {
                let itemImage = item.image
                if (itemImage.includes("//img.alicdn.com/")) {
                  itemImage = `${item.image}_500x500.jpg`
                }
                const representation = {
                  imageOrder: 0,
                  imageType: "REPRESENTATION",
                  vendorPath: itemImage,
                }
                const detail = checkMainImage.map((item, index) => {
                  return {
                    imageOrder: index + 1,
                    imageType: "DETAIL",
                    vendorPath: itemImage,
                  }
                })
                return [representation, ...detail].filter(item => !item.vendorPath.includes("undefind"))
              })(),
              notices: coupang.notices,
              attributes:
                item.attributes && item.attributes.length > 0
                  ? item.attributes.map((attr, index) => {
                      if (attr.attributeValueName === "상세페이지 참조") {
                        if (index === 0) {
                          return {
                            attributeTypeName: attr.attributeTypeName,
                            attributeValueName: item.korKey ? item.korKey : item.korValue,
                          }
                        } else {
                          return {
                            attributeTypeName: attr.attributeTypeName,
                            attributeValueName: attr.attributeValueName,
                          }
                        }
                      } else {
                        return attr
                      }
                    })
                  : coupang.attributes.map((attr, index) => {
                      if (index === 0) {
                        return {
                          attributeTypeName: attr.attributeTypeName,
                          attributeValueName: item.korKey ? item.korKey : item.korValue,
                        }
                      } else {
                        return {
                          attributeTypeName: attr.attributeTypeName,
                          attributeValueName: attr.attributeValueName,
                        }
                      }
                    }),
              contents: [
                {
                  contentsType: "HTML",
                  contentDetails: [
                    {
                      content: htmlContent,
                      detailType: "TEXT",
                    },
                  ],
                },
              ],
              // requiredDocuments: [
              //   {
              //     templateName: "인보이스영수증(해외구매대행 선택시)",
              //     vendorDocumentPath: coupang.invoiceDocument
              //   }
              // ],
              offerCondition: "NEW", // 상품상태
              manufacture: product.manufacture, // 제조사
            }
          }),
      }
      // console.log("coupangProduct", coupangProduct)

      if (
        coupangProduct.items.filter((item) => {
          if (item.vendorItemId && item.vendorItemId !== null && item.vendorItemId !== "null") {
            return true
          }
          return false
        }).length === 0
      ) {
        console.log("여기????1-1")
        return {
          coupang: {
            code: "ERROR",
            message: `상품 수정 오류 - 아직 등록처리가 안된 상품입니다. 등록처리 완료 후 다시 시도해 주세요`,
          },
        }
      }
      console.log("여기2")
      try {
        coupangProductResponse = await CoupnagUpdateProduct({
          userID,
          product: coupangProduct,
        })

        console.log("coupangProductResponse", coupangProductResponse)
      } catch (e) {
        console.log("e-----", e)
      }

      if (!product.coupang) {
        product.coupang = {}
      }

      if (coupangProduct.sellerProductId) {
        const CoupangResonse = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID,
          productID: coupangProduct.sellerProductId,
        })

        if (CoupangResonse && CoupangResonse.data && Array.isArray(CoupangResonse.data.items)) {
          CoupangResonse.data.items.forEach((item) => {
            for (const oItem of options) {
              if (oItem.korValue === item.itemName || oItem.korKey === item.itemName) {
                oItem.coupang.sellerProductItemId = `${item.sellerProductItemId}`
                oItem.coupang.vendorItemId = `${item.vendorItemId}`
                oItem.coupang.itemId = `${item.itemId}`
              }
            }
          })
        }
      }

      for (const item of options.filter((item) => item.active && !item.disabled)) {
        try {
          if (
            item.coupang.vendorItemId !== "null" &&
            item.coupang.vendorItemId !== null &&
            item.coupang.vendorItemId
          ) {
            const response = await CoupnagUPDATE_PRODUCT_PRICE_BY_ITEM({
              userID,
              vendorItemId: item.coupang.vendorItemId,
              price: item.salePrice,
            })

            console.log(" ** 가격 ** ", response)
          }
        } catch (e) {}
      }
      console.log(" *** 쿠팡 옵션 가격 업데이트 완료 *** ")

      for (const item of options.filter((item) => item.active && !item.disabled)) {
        try {
          if (
            item.coupang.vendorItemId !== "null" &&
            item.coupang.vendorItemId !== null &&
            item.coupang.vendorItemId
          ) {
            const response = await CoupnagUPDATE_PRODUCT_QUANTITY_BY_ITEM({
              userID,
              vendorItemId: item.coupang_vendorItemId,
              quantity: item.stock,
            })
            console.log(" ** 수량 ** ", response)
          }
        } catch (e) {}
      }
      console.log(" *** 쿠팡 옵션 수량 업데이트 완료 *** ")
      for (const item of options.filter((item) => item.active && !item.disabled)) {
        try {
          console.log(" item.coupang_vendorItemId", item.coupang_vendorItemId)
          if (
            item.coupang.vendorItemId !== "null" &&
            item.coupang.vendorItemId !== null &&
            item.coupang.vendorItemId
          ) {
            const response = await CoupnagRESUME_PRODUCT_SALES_BY_ITEM({
              userID,
              vendorItemId: item.coupang.vendorItemId,
            })
            console.log(" ** 판매재게 ** ", response)
          }
        } catch (e) {
          console.log("판매재개 --", e)
        }
      }
      console.log(" *** 쿠팡 판매 재게 완료 *** ")
    } else {
      // 생성
      let shipping_price = 0
      options
        .filter((item) => item.active && !item.disabled)
        .filter((i, index) => index < 100)
        .map((item) => {
          if (item.weightPrice > shipping_price) {
            shipping_price = item.weightPrice
          }
        })
      coupangProduct = {
        // ...coupang,
        displayCategoryCode: coupang.displayCategoryCode,
        sellerProductName: product.korTitle, // 등록상품명
        vendorId: coupang.vendorId,
        saleStartedAt: `${moment().format("yyyy-MM-DD")}T${moment().format("hh:mm:ss")}`, // 판매시작일시
        saleEndedAt: "2099-12-31T12:00:00", // 판매종료일시
        displayProductName: product.korTitle, // 등록상품명
        brand: product.brand, // 브랜드
        manufacture: product.manufacture, // 제조사
        deliveryMethod: "AGENT_BUY", // 배송방법
        deliveryCompanyCode: coupang.deliveryCompanyCode,
        deliveryChargeType: isShippingPrirce ? "NOT_FREE" : product.deliveryChargeType,
        deliveryCharge: isShippingPrirce ? shipping_price : product.deliveryCharge,
        freeShipOverAmount: 0, // 무료배송을 위한 조건 금액
        deliveryChargeOnReturn:
          product.deliveryChargeOnReturn > minSalePrice / 2
            ? Math.floor((minSalePrice / 2) * 0.1) * 10
            : product.deliveryChargeOnReturn,
        remoteAreaDeliverable: "Y", // 도서산간 배송여부
        unionDeliveryType: "NOT_UNION_DELIVERY", // 묶음 배송여부
        returnCenterCode: coupang.returnCenterCode,
        returnChargeName: coupang.returnChargeName,
        companyContactNumber: coupang.companyContactNumber,
        returnZipCode: coupang.returnZipCode,
        returnAddress: coupang.returnAddress,
        returnAddressDetail: coupang.returnAddressDetail,
        returnCharge:
          coupang.returnCharge > minSalePrice / 2
            ? Math.floor((minSalePrice / 2) * 0.1) * 10
            : coupang.returnCharge,
        afterServiceInformation: coupang.afterServiceInformation,
        afterServiceContactNumber: coupang.afterServiceContactNumber,
        outboundShippingPlaceCode: coupang.outboundShippingPlaceCode,
        vendorUserId: coupang.vendorUserId,
        requested: writerID.toString() === "5f0d5ff36fc75ec20d54c40b" ? true : false, // 자동승인요청여부
        requiredDocuments: [
          {
            templateName: "인보이스영수증(해외구매대행 선택시)",
            // templateName: "MANDATORY_OVERSEAS_PURCH",
            vendorDocumentPath: coupang.invoiceDocument, // 구비서류벤더경로
          },
        ],
        items: options
          .filter((item) => item.active && !item.disabled)
          .filter((i, index) => index < 100)
          .map((item) => {
            return {
              itemName: item.korKey ? item.korKey : item.korValue, //업체상품옵션명
              originalPrice: item.productPrice, //할인율기준가 (정가표시)
              salePrice: item.salePrice, //판매가격
              maximumBuyCount: item.stock, //판매가능수량
              maximumBuyForPerson: coupang.maximumBuyForPerson, // 인당 최대 구매 수량
              maximumBuyForPersonPeriod: coupang.maximumBuyForPersonPeriod, // 최대 구매 수량 기간
              outboundShippingTimeDay: product.outboundShippingTimeDay, //기준출고일(일)
              unitCount: 0, // 단위수량
              adultOnly: "EVERYONE", // 19세이상
              taxType: "TAX", // 과세여부
              parallelImported: "NOT_PARALLEL_IMPORTED", // 병행수입여부
              overseasPurchased: "OVERSEAS_PURCHASED", // 해외구매대행여부
              pccNeeded: true, // PCC(개인통관부호) 필수/비필수 여부
              externalVendorSku: item.key, // 판매자상품코드 (업체상품코드)
              barcode: "",
              emptyBarcode: true,
              emptyBarcodeReason: "상품확인불가_구매대행상품",
              // modelNo: product.good_id,
              certifications: coupang.certifications
                .filter((item) => item.required === "required")
                .map((item) => {
                  return {
                    certifications: item.certificationType,
                    certificationCode: "",
                  }
                }),

              searchTags,
              images: (() => {
                const representation = {
                  imageOrder: 0,
                  imageType: "REPRESENTATION",
                  vendorPath: item.image.includes("noimage.jpg")
                    ? product.mainImages[0]
                    : item.image,
                }

                const detail = checkMainImage.map((item, index) => {
                  return {
                    imageOrder: index + 1,
                    imageType: "DETAIL",
                    vendorPath: { item },
                  }
                })
                return [representation, ...detail].filter(item => !item.vendorPath.includes("undefind"))
              })(),
              notices: coupang.notices,
              attributes:
                item.attributes && item.attributes.length > 0
                  ? item.attributes.map((attr, index) => {
                      if (attr.attributeValueName === "상세페이지 참조") {
                        if (index === 0) {
                          return {
                            attributeTypeName: attr.attributeTypeName,
                            attributeValueName: item.korKey ? item.korKey : item.korValue,
                          }
                        } else {
                          return {
                            attributeTypeName: attr.attributeTypeName,
                            attributeValueName: attr.attributeValueName,
                          }
                        }
                      } else {
                        return attr
                      }
                    })
                  : coupang.attributes.map((attr, index) => {
                      if (index === 0) {
                        return {
                          attributeTypeName: attr.attributeTypeName,
                          attributeValueName: item.korKey ? item.korKey : item.korValue,
                        }
                      } else {
                        return {
                          attributeTypeName: attr.attributeTypeName,
                          attributeValueName: attr.attributeValueName,
                        }
                      }
                    }),
              // attributes: coupang.attributes.map((attr, index) => {
              //   if (index === 0) {
              //     return {
              //       attributeTypeName: attr.attributeTypeName,
              //       attributeValueName: item.korKey ? item.korKey : item.korValue
              //     }
              //   } else {
              //     return {
              //       attributeTypeName: attr.attributeTypeName,
              //       attributeValueName: attr.attributeValueName
              //     }
              //   }
              // }),
              contents: [
                {
                  contentsType: "HTML",
                  contentDetails: [
                    {
                      content: htmlContent,
                      detailType: "TEXT",
                    },
                  ],
                },
              ],
              // requiredDocuments: [
              //   {
              //     templateName: "인보이스영수증(해외구매대행 선택시)",
              //     vendorDocumentPath: coupang.invoiceDocument
              //   }
              // ],
              offerCondition: "NEW", // 상품상태
              manufacture: product.manufacture, // 제조사
            }
          }),
      }
      // console.log("coupangProduct", coupangProduct.items)

      try {
        coupangProductResponse = await CoupnagCreateProduct({
          userID,
          product: coupangProduct,
        })
      } catch (e) {
        console.log("ERR)R)))))", coupangProduct)
        return {
          coupang: {
            code: "ERROR",
            message: `상품 등록 오류 - ${e.message}`,
          },
        }
      }
    }

    // for (const item of coupangProduct.items) {
    //   console.log("attributes", item.attributes)
    // }

    if (!product.coupang_productID && !coupangProductResponse.data) {
      returnMessage.coupang.code = "ERROR"
      returnMessage.coupang.message = coupangProductResponse.message
      return returnMessage
    } else {
      if (!product.coupang) {
        product.coupang = {}
      }

      if (coupangProductResponse.code === "SUCCESS") {
        product.coupang.productID = `${coupangProductResponse.data}`

        let response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID,
          productID: coupangProductResponse.data,
        })

        if (response && response.data && Array.isArray(response.data.items)) {
          response.data.items.forEach((item, index) => {
            if (!options[index].coupang) {
              options[index].coupang = {}
            }
            for (const oItem of options) {
              if (oItem.korValue === item.itemName || oItem.korKey === item.itemName) {
                oItem.coupang.sellerProductItemId = `${item.sellerProductItemId}`
                oItem.coupang.vendorItemId = `${item.vendorItemId}`
                oItem.coupang.itemId = `${item.itemId}`
              }
            }
            // options[index].coupang.sellerProductItemId = `${item.sellerProductItemId}`
            // options[index].coupang.vendorItemId = `${item.vendorItemId}`
            // options[index].coupang.itemId = `${item.itemId}`
          })
        }
      } else {
        product.coupang.message = coupangProductResponse.message
      }

      const productTemp = await Product.findOne({ _id: id, isDelete: false })

      if (productTemp) {
        product.cafe24 = productTemp.product.cafe24
      }

      await Product.findOneAndUpdate(
        {
          userID: ObjectId(userID),
          _id: ObjectId(id),
        },
        {
          $set: {
            writerID: tempProduct ? tempProduct.writerID : writerID,
            product,
            options,
            coupang,
            createdAt:
              productTemp && productTemp.createdAt ? productTemp.createdAt : moment().toDate(),
            coupangUpdatedAt:
              productTemp && productTemp.coupangUpdatedAt
                ? productTemp.coupangUpdatedAt
                : moment().toDate(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      )
    }
  } catch (e) {
    console.log("updateCoupang", e)
  } finally {
    return returnMessage
  }
}

const updateCafe24 = async ({
  id,
  isSingle,
  isShippingPrirce,
  product,
  prop,
  options,
  cafe24,
  userID,
  writerID,
}) => {
  const returnMessage = {
    cafe24: {
      code: null,
      message: null,
    },
  }

  let shipping_price = 0
  let optionValue = options
    .filter((item) => item.active && !item.disabled)
    .filter((i, index) => index < 100)
    .map((item) => {
      if (item.weightPrice > shipping_price) {
        shipping_price = item.weightPrice
      }
      return item
    })

  try {
    let baseIndex = 0
    let inValidArr = []
    
    optionValue.forEach((item) => {
      let salePrice = item.salePrice

      let minPassablePrice = Math.ceil((salePrice - (salePrice * 50) / 100) * 0.1) * 10
      let maxPassablePrice = Math.floor((salePrice + (salePrice * 50) / 100) * 0.1) * 10 - 10

      const inValid = []

      optionValue
        .filter((item) => item.active && !item.disabled)
        .forEach((item1) => {
          if (item1.price < minPassablePrice || item1.price > maxPassablePrice) {
            inValid.push(item1)
          }
        })
      inValidArr.push(inValid.length)
    })
    
    const minValue = Math.min.apply(null, inValidArr)
    baseIndex = inValidArr.indexOf(minValue)

    let basePrice = options[0].salePrice
    let minPrice = basePrice - basePrice * 0.5
    let maxPrice = basePrice + basePrice * 0.5



    optionValue
      .filter((item) => item.active && !item.disabled)
      .map((item, index) => {
        if (index === baseIndex) {
          item.base = true
          basePrice = item.salePrice
          minPrice = basePrice - basePrice * 0.5
          maxPrice = basePrice + basePrice * 0.5
        } else {
          item.base = false
        }
      })

    console.log("baseIndex", baseIndex)
    console.log("basePrice", basePrice)
    console.log("minPrice", minPrice)
    console.log("maxPrice", maxPrice)
    console.log("수정전", options.filter((item) => item.active && !item.disabled).length)

    
    optionValue.map((item) => {
      if (item.salePrice >= minPrice && item.salePrice <= maxPrice) {
        item.active = true
      } else {
        item.active = false
      }
    })

    console.log("수정후", options.filter((item) => item.active && !item.disabled).length)


    const basic = await Basic.findOne({
      userID,
    })

    let searchTags = []

    const tempProduct = await Product.findOne({
      userID: ObjectId(userID),
      _id: ObjectId(id),
      isDelete: false,
    })

    if (tempProduct) {
      tempProduct.options.forEach((tItem, index) => {
        if (tItem.cafe24 && options[index]) {
          options[index].cafe24 = tItem.cafe24
        }
      })
      if (tempProduct.product.cafe24) {
        product.cafe24 = tempProduct.product.cafe24
      }
    }

    if (product.keyword && Array.isArray(product.keyword) && product.keyword.length > 0) {
      searchTags = product.keyword.map((item) => regExp_test(item.replace(/ /gi, "")))
    } else {
      searchTags = [...regExp_test(product.korTitle).split(" ")]
    }

    searchTags = searchTags.filter((item, i) => i < 5)

    const htmlContent = `${product.gifHtml ? product.gifHtml : ""}${product.topHtml}${
      product.isClothes && product.clothesHtml ? product.clothesHtml : ""
    }${product.isShoes && product.shoesHtml ? product.shoesHtml : ""}${product.optionHtml}${
      product.html
    }${product.bottomHtml}`

    //
    let cafe24Product = null
    // let mainImage = product.cafe24_mainImage ? product.cafe24_mainImage : null
    let mainImage = null

    if (!product.cafe24) {
      product.cafe24 = {}
    }
    console.log("cafe24", cafe24)
    if (!mainImage) {
      const imagesResponse = await Cafe24UploadImages({
        mallID: cafe24.mallID,
        // images: [...product.mainImages, ...options.map(item => item.image)]
        images:
          product.mainImages && product.mainImages.length > 0
            ? [product.mainImages[0]]
            : [optionValue[0].image],
      })

      imagesResponse &&
        imagesResponse.data &&
        imagesResponse.data.images &&
        imagesResponse.data.images.forEach((item, index) => {
          if (index === 0) {
            mainImage = item.path
              .replace(`http://${cafe24.mallID}.cafe24.com`, "")
              .replace(`https://${cafe24.mallID}.cafe24.com`, "")

            if (mainImage.includes(cafe24.mallID)) {
              mainImage = mainImage.split(cafe24.mallID)[1]
            }
            product.cafe24.mainImage = mainImage
          }
        })
    }

    let otherImage = []
    try {
      otherImage = [
        ...product.mainImages.filter((item, index) => index > 0),
        // ...options.map(item => `${item.image}_800x800.jpg`)
      ]
    } catch (e) {}

    if (otherImage.length > 20) {
      otherImage = otherImage.filter((item, index) => {
        if (index < 20) {
          return true
        } else {
          return false
        }
      })
    }

    let cafe24response = null
    let cafe24Option = null

    const categoryInfo = await CategoryInfo.findOne({
      userID: ObjectId(userID),
      naverCode: product.naverCategoryCode,
    })

    let add_category_no = null
    if (categoryInfo && categoryInfo.cafe24Code) {
      add_category_no = [
        {
          category_no: categoryInfo.cafe24Code,
          recommend: "F",
          new: "T",
        },
      ]
    }

    let price = 0
    let retail_price = 0
    if (optionValue.filter((item) => item.active && !item.disabled && item.base).length === 0) {
      price = optionValue.filter((item) => item.active && !item.disabled)[0].salePrice
      retail_price = optionValue.filter((item) => item.active && !item.disabled)[0].productPrice
    } else {
      price = optionValue.filter((item) => item.active && !item.disabled && item.base)[0].salePrice
      retail_price = optionValue.filter((item) => item.active && !item.disabled && item.base)[0]
        .productPrice
    }

    if (!price) {
      price = optionValue[0].salePrice
      retail_price = optionValue[0].productPrice
    }
    console.log("price", price)
    if (!price) {
      await Product.findOneAndUpdate(
        {
          _id: ObjectId(id),
          userID,
        },
        {
          $set: {
            isDelete: true,
          },
        }
      )
      return
    }

    if (basic && basic.kiprisInter) {
      const kiprise = await getKiprisWords(product.korTitle)
      let tempKorTitleArray = product.korTitle.split(" ")
      let tempKorTitle = ""
      let kipriseAray = kiprise.filter((item) => item.result === true)
      for (const item of kipriseAray) {
        while (tempKorTitleArray.indexOf(item.search) !== -1) {
          tempKorTitleArray.splice(tempKorTitleArray.indexOf(item.search), 1)
        }
      }
      tempKorTitle = tempKorTitleArray.join(" ")
      product.korTitle = tempKorTitle
    }

    //// 카페 24 ////

    let cafe24ProductsVariants = null
    // console.log("product.cafe24_product_no", product.cafe24_product_no)

    if (product.cafe24_product_no) {
      otherImage = [
        ...product.mainImages.filter((item, index) => index > 0),
        ...optionValue.map((item) => {
          if (item.image.includes("//img.alicdn.com/")) {
            return `${item.image}_800x800.jpg`
          } else {
            return item.image
          }
        }),
      ]

      if (otherImage.length > 20) {
        otherImage = otherImage.filter((item, index) => {
          if (index < 20) {
            return true
          } else {
            return false
          }
        })
      }

      if (isSingle) {
        otherImage = []
      }

      console.log("price", price)
      console.log("retail_price", retail_price)
      // 수정
      cafe24Product = {
        shop_no: cafe24.shop_no,
        request: {
          display: "T", // 진열상태
          selling: isSingle ? (options[0].stock === 0 ? "F" : "T") : "T", // 판매상태
          product_condition: "N", // 상품상태
          add_category_no,
          custom_product_code: product.good_id, // 자체상품 코드
          product_name: product.korTitle, // 상품명
          price, // 상품 판매가
          retail_price, // 상품 소비자가
          supply_price: 0, // 상품 공급가
          // has_option: isSingle ? "F" : "T", // 옵션 사용여부
          options:
            !optionValue.filter((item) => item.active && !item.disabled)[0].korKey &&
            prop &&
            Array.isArray(prop) &&
            prop.length > 0 &&
            (optionValue.filter((item) => item.active && !item.disabled)[0].korKey === null ||
              (optionValue.filter((item) => item.active && !item.disabled)[0].korKey &&
              optionValue.filter((item) => item.active && !item.disabled)[0].korKey.length === 0))
              ? prop.map((item) => {
                  return {
                    name: item.korTypeName,
                    value: item.values.map((valueItem) => valueItem.korValueName),
                  }
                })
              : [
                  {
                    name: "종류",
                    value: optionValue
                      .filter((item) => item.active && !item.disabled)
                      .filter((i, index) => index < 100)
                      .map((item) => regExp_test(item.korKey ? item.korKey : item.korValue)),
                  },
                ],
          // options: [
          //   {
          //     name: "종류",
          //     value: options
          //       .filter(item => item.active && !item.disabled)
          //       .map(item => regExp_test(item.korKey ? item.korKey : item.korValue))
          //   }
          // ],
          product_weight: "1.00", // 상품 중량
          description: htmlContent, // 상품상세설명
          // summary_description: product.korTitle, // 상품요약설명
          simple_description: product.korTitle, // 상품간략설명
          product_tag: searchTags.join(), // 상품검색어
          payment_info: "상세페이지 참조", // 상품결제안내
          shipping_info: "상세페이지 참조", // 상품배송안내
          exchange_info: "상세페이지 참조", // 교환/반품안내
          service_info: "상세페이지 참조", // 서비스문의/안내
          shipping_scope: "A", // 배송정보
          shipping_method: "01", // 배송방법
          shipping_fee_by_product: "F", // 개별배송여부
          shipping_area: "국내", // 배송지역
          shipping_period: {
            // 배송기간
            minimum: product.outboundShippingTimeDay,
            maximum: product.outboundShippingTimeDay,
          },
          shipping_fee_type: isShippingPrirce
            ? "R"
            : product.deliveryChargeType === "FREE"
            ? "T"
            : "R", // 배송비 타입
          shipping_rates: [
            {
              shipping_fee: isShippingPrirce ? shipping_price : product.deliveryCharge, // 배송비
            },
          ],
          prepaid_shipping_fee: "P", // 배송비 선결제 설정
          detail_image: mainImage, // 상세이미지
          image_upload_type: "A", // 이미지 업로드 타입
          buy_limit_by_product: "T",
          buy_limit_type: "F",
          repurchase_restriction: "F",
          single_purchase_restriction: "F",
          buy_unit_type: "O",
          buy_unit: 1,
          order_quantity_limit_type: "O",
          minimum_quantity: 1,
          maximum_quantity: 1,
          points_by_product: "F",
          // points_setting_by_payment: "B",
          origin_classification: "T", // 원산지
          origin_place_no: 264,
          made_in_code: "CN",
          tax_type: "A",
          tax_amount: 10,
          additional_image: otherImage,
          adult_certification: "F", // 성인인증
        },
      }
      

      if (isSingle) {
        delete cafe24Product.request.options
      }

      // console.log("cafe24Product---", cafe24Product.request)

      cafe24response = await Cafe24UpdateProduct({
        mallID: cafe24.mallID,
        payload: cafe24Product,
        product_no: product.cafe24_product_no,
      })
      // console.log("cafe24response", cafe24response)
      // console.log("**** 제품업데이트 ****")
      // const productTemp = await Product.findOne({
      //   userID,
      //   _id: id
      // })

      if (!isSingle) {
        await Cafe24DeleteProductsOption({
          mallID: cafe24.mallID,
          product_no: product.cafe24_product_no,
        })

        // console.log("**** 옵션삭제 ****", cafe24response)

        if (cafe24response && cafe24response.data && cafe24response.data.product) {
          cafe24ProductsVariants = await Cafe24ListProductsVariants({
            mallID: cafe24.mallID,
            product_no: cafe24response.data.product.product_no,
          })
        }

        // options.map(item => {
        //   if (!item.cafe24) {
        //     item.cafe24 = {}
        //   }
        // })
        // console.log("options", options)
        // cafe24Option = {
        //   shop_no: cafe24.shop_no,
        //   has_option: "T",
        //   request: options
        //     .filter(item => {
        //       if(item.cafe24_variant_code){
        //         return true
        //       }
        //       if(item.cafe24 && item.cafe24.variant_code){
        //         return true
        //       }
        //       console.log("item.cafe24", item.cafe24)
        //       return false
        //     })
        //     .map((item, index) => {
        //       return {
        //         variant_code: item.cafe24_variant_code ? item.cafe24_variant_code : item.cafe24.variant_code,
        //         // custom_variant_code: options[index].key,
        //         display: "T",
        //         selling: "T",
        //         additional_amount: item.salePrice - price,
        //         quantity: item.stock,
        //         use_inventory: "T",
        //         important_inventory: "A",
        //         inventory_control_type: "A",
        //         display_soldout: "T",
        //         safety_inventory: 0
        //       }
        //     })
        // }
        console.log("isSingle", isSingle)
        cafe24Option = {
          shop_no: cafe24.shop_no,
          request: {
            has_option: isSingle ? "F" : "T",
            option_type: "T",
            option_list_type: "S",
            options:
              !optionValue.filter((item) => item.active && !item.disabled)[0].korKey &&
              prop &&
              Array.isArray(prop) &&
              prop.length > 0
                ? prop.map((item) => {
                    return {
                      option_name: item.korTypeName,
                      option_value: item.values.map((valueItem) => {
                        return {
                          option_text: regExp_test(valueItem.korValueName),
                        }
                      }),
                      option_display_type: "S",
                    }
                  })
                : [
                    {
                      option_name: "종류",
                      option_value: optionValue
                        .filter((item) => item.active && !item.disabled)
                        .map((item, index) => {
                          return {
                            option_text: regExp_test(item.korKey ? item.korKey : item.korValue),
                          }
                        }),
                      option_display_type: "S",
                    },
                  ],
          },
        }
        // console.log("cafe24Option", cafe24Option)

        const createProductsOptionResponse = await Cafe24CreateProductsOption({
          mallID: cafe24.mallID,
          payload: cafe24Option,
          product_no: cafe24response.data ? cafe24response.data.product.product_no : product.cafe24_product_no,
        })

        // console.log("**** 옵션 업데이트 ****")
        // console.log("createProductsOptionResponse", createProductsOptionResponse)
        cafe24ProductsVariants = await Cafe24ListProductsVariants({
          mallID: cafe24.mallID,
          product_no: cafe24response.data ? cafe24response.data.product.product_no : product.cafe24_product_no,
        })
        // console.log("cafe24ProductsVariants", cafe24ProductsVariants)
        cafe24ProductsVariants.data.variants.forEach((item) => {
          // console.log(" item ", item)
          const optionName = item.options && item.options.length > 0 ? item.options[0].value : null

          options.forEach((oItem) => 
          {
            // console.log(" oItem ", oItem)
            if (
              regExp_test(oItem.korValue) === optionName ||
              regExp_test(oItem.korKey) === optionName
            ) {
              oItem.cafe24_variant_code = item.variant_code
            }
          })
        })
      }
    } else {
      // 생성

      otherImage = [
        ...product.mainImages.filter((item, index) => index > 0),
        ...optionValue.map((item) => {
          if (item.image.includes("//img.alicdn.com/")) {
            return `${item.image}_800x800.jpg`
          } else {
            return item.image
          }
        }),
      ].filter(item => !item.includes("undefind"))

      if (otherImage.length > 20) {
        otherImage = otherImage.filter((item, index) => {
          if (index < 20) {
            return true
          } else {
            return false
          }
        })
      }

      if (isSingle) {
        otherImage = []
      }

      // console.log("options-->", options)
      cafe24Product = {
        shop_no: cafe24.shop_no,
        request: {
          display: "T", // 진열상태
          selling: "T", // 판매상태
          product_condition: "N", // 상품상태
          add_category_no,
          custom_product_code: product.good_id, // 자체상품 코드
          product_name: product.korTitle, // 상품명
          price, // 상품 판매가
          retail_price, // 상품 소비자가
          supply_price: 0, // 상품 공급가
          has_option: isSingle ? "F" : "T", // 옵션 사용여부
          options:
            !optionValue.filter((item) => item.active && !item.disabled)[0].korKey &&
            prop &&
            Array.isArray(prop) &&
            prop.length > 0 &&
            (optionValue.filter((item) => item.active && !item.disabled)[0].korKey === null ||
              (optionValue.filter((item) => item.active && !item.disabled)[0].korKey &&
              optionValue.filter((item) => item.active && !item.disabled)[0].korKey.length === 0))
              ? prop.map((item) => {
                  return {
                    name: item.korTypeName,
                    value: item.values
                      .filter((valueItem) => {
                        const temp = item.values.filter(
                          (vItem) => vItem.korValueName.trim() === valueItem.korValueName.trim()
                        )

                        if (temp.length > 1) {
                          return false
                        }
                        return true
                      })
                      .map((valueItem) => regExp_test(valueItem.korValueName)),
                  }
                })
              : [
                  {
                    name: "종류",
                    value: optionValue
                      .filter((item) => item.active && !item.disabled)
                      .filter((valueItem) => {
                        if (valueItem.korKey) {
                          return true
                        }
                        const temp = optionValue.filter(
                          (vItem) =>
                            vItem.korValue.toString().trim() ===
                            valueItem.korValue.toString().trim()
                        )
                        if (temp.length > 1) {
                          return false
                        }
                        return true
                      })
                      .map((item) => {
                        return regExp_test(item.korKey ? item.korKey : item.korValue)
                      }),
                  },
                ],
          // options: [
          //   {
          //     name: "종류",
          //     value: options
          //       .filter(item => item.active && !item.disabled)
          //       .filter((i, index) => index < 100)
          //       .map(item => regExp_test(item.korKey ? item.korKey : item.korValue))
          //   }
          // ],
          product_weight: "1.00", // 상품 중량
          description: htmlContent, // 상품상세설명
          // summary_description: product.korTitle, // 상품요약설명
          simple_description: product.korTitle, // 상품간략설명
          product_tag: searchTags.join(), // 상품검색어
          payment_info: "상세페이지 참조", // 상품결제안내
          shipping_info: "상세페이지 참조", // 상품배송안내
          exchange_info: "상세페이지 참조", // 교환/반품안내
          service_info: "상세페이지 참조", // 서비스문의/안내
          shipping_scope: "A", // 배송정보
          shipping_method: "01", // 배송방법
          shipping_fee_by_product: "F", // 개별배송여부
          shipping_area: "국내", // 배송지역
          shipping_period: {
            // 배송기간
            minimum: product.outboundShippingTimeDay,
            maximum: product.outboundShippingTimeDay,
          },
          shipping_fee_type: isShippingPrirce
            ? "R"
            : product.deliveryChargeType === "FREE"
            ? "T"
            : "R", // 배송비 타입
          shipping_rates: [
            {
              shipping_fee: isShippingPrirce ? shipping_price : product.deliveryCharge, // 배송비
            },
          ],
          prepaid_shipping_fee: "P", // 배송비 선결제 설정
          detail_image: mainImage, // 상세이미지
          image_upload_type: "A", // 이미지 업로드 타입
          buy_limit_by_product: "T",
          buy_limit_type: "F",
          repurchase_restriction: "F",
          single_purchase_restriction: "F",
          buy_unit_type: "O",
          buy_unit: 1,
          order_quantity_limit_type: "O",
          minimum_quantity: 1,
          maximum_quantity: 1,
          points_by_product: "F",
          // points_setting_by_payment: "B",
          origin_classification: "T", // 원산지
          origin_place_no: 264,
          made_in_code: "CN",
          tax_type: "A",
          tax_amount: 10,
          additional_image: otherImage,
          adult_certification: "F", // 성인인증
        },
      }

      if (isSingle) {
        delete cafe24Product.request.options
      }

      cafe24response = await Cafe24CreateProduct({
        mallID: cafe24.mallID,
        payload: cafe24Product,
      })
      if (!cafe24response || !cafe24response.data) {
        console.log("cafe24reaponse", cafe24response)
        console.log("cafe24.mallID", cafe24.mallID)
        console.log("cafe24Product", cafe24Product)

        for (const item of cafe24Product.request.options) {
          console.log("ITE0--->", item)
        }
      }

      if (!isSingle) {
        cafe24ProductsVariants = await Cafe24ListProductsVariants({
          mallID: cafe24.mallID,
          product_no: cafe24response.data.product.product_no,
        })

        cafe24ProductsVariants.data.variants.forEach((item) => {
          let optionName = ""
          let i = 0
          for (const optionItem of item.options) {
            if (i === 0) {
              optionName += optionItem.value
            } else {
              optionName += ` ${optionItem.value}`
            }
            i++
          }

          options.forEach((oItem) => {
            if (
              regExp_test(oItem.korValue) === optionName ||
              oItem.korValue === optionName ||
              regExp_test(oItem.korKey) === optionName ||
              oItem.korKey === optionName
            ) {
              oItem.cafe24_variant_code = item.variant_code
            }
          })
        })
      }

      // cafe24Option = {
      //   shop_no: cafe24.shop_no,
      //   request: {
      //     has_option: "T",
      //     option_type: "T",
      //     option_list_type: "S",
      //     options: [
      //       {
      //         option_name: "종류",
      //         option_value: options
      //           .filter(item => item.active && !item.disabled)
      //           .map((item, index) => {
      //             return {
      //               option_text: regExp_test(item.korKey ? item.korKey : item.korValue)
      //             }
      //           }),
      //         option_display_type: "S"
      //       }
      //     ]
      //   }
      // }
      // console.log("payload--", {
      //   mallID: cafe24.mallID,
      //   payload: cafe24Option,
      //   product_no: cafe24response.data.product.product_no
      // })
      // await Cafe24CreateProductsOption({
      //   mallID: cafe24.mallID,
      //   payload: cafe24Option,
      //   product_no: cafe24response.data.product.product_no
      // })
    }
    //////////////////////////
    if (!cafe24response.data) {
      returnMessage.cafe24.code = "ERROR"
      returnMessage.cafe24.message = cafe24response.message

      return returnMessage
    }

    product.cafe24.mallID = cafe24.mallID
    product.cafe24.shop_no = cafe24response.data.product.shop_no
    product.cafe24.product_no = cafe24response.data.product.product_no
    product.cafe24.product_code = cafe24response.data.product.product_code
    product.cafe24.custom_product_code = cafe24response.data.product.custom_product_code

    cafe24ProductsVariants = await Cafe24ListProductsVariants({
      mallID: cafe24.mallID,
      product_no: cafe24response.data.product.product_no,
    })

    options.map((item, i) => {
      if (!item.cafe24) {
        item.cafe24 = {}
      }
      if (
        isSingle &&
        cafe24ProductsVariants.data &&
        Array.isArray(cafe24ProductsVariants.data.variants) &&
        cafe24ProductsVariants.data.variants.length > i
      ) {
        item.cafe24.variant_code = cafe24ProductsVariants.data.variants[i].variant_code
      }
    })

    const cafe24ProductVariantsPayload = {
      shop_no: cafe24.shop_no,
      request: optionValue
        .filter((item) => {
          if (item.cafe24_variant_code) {
            return true
          }
          if (item.cafe24 && item.cafe24.variant_code) {
            return true
          }

          return false
        })
        .map((item, index) => {
          
          return {
            variant_code: item.cafe24_variant_code
              ? item.cafe24_variant_code
              : item.cafe24.variant_code,
            // custom_variant_code: options[index].key,
            display: "T",
            selling: "T",
            additional_amount: item.salePrice - price,
            quantity: item.stock,
            use_inventory: "T",
            important_inventory: "A",
            inventory_control_type: "A",
            display_soldout: "T",
            safety_inventory: 0,
          }
        }),
    }
    // console.log("cafe24ProductVariantsPayload", cafe24ProductVariantsPayload)
    if (!isSingle) {
      // console.log("cafe24ProductVariantsPayload", cafe24ProductVariantsPayload.request)
      const variantsResponse = await Cafe24UpdateProductsVariants({
        mallID: cafe24.mallID,
        payload: cafe24ProductVariantsPayload,
        product_no: cafe24response.data.product.product_no,
      })
      // console.log("variantsResponse", variantsResponse)
      if (variantsResponse && variantsResponse.data && variantsResponse.data.variants) {
        variantsResponse.data.variants.forEach((item) => {

          // console.log("item--", item)
          optionValue
            .filter((item) => item.cafe24_variant_code)
            .forEach((oItem) => {
              oItem.cafe24.variant_code = item.variant_code
            })
        })
      } else {
      }
    }

    for (const item of optionValue) {
      if (item.cafe24.variant_code) {
        await Cafe24UpdateProductsVariantsInventories({
          mallID: cafe24.mallID,
          payload: {
            shop_no: cafe24.shop_no,
            request: {
              use_inventory: "T",
              display_soldout: "T",
              quantity: item.stock,
            },
          },
          product_no: cafe24response.data.product.product_no,
          variant_code: item.cafe24.variant_code,
        })
        
        await sleep(500)
      }
    }

    const productTemp = await Product.findOne({ _id: id, isDelete: false })

    if (productTemp) {
      product.coupang = productTemp.product.coupang
    }

    await Product.findOneAndUpdate(
      {
        userID,
        _id: id,
      },
      {
        $set: {
          writerID: tempProduct ? tempProduct.writerID : writerID,
          product,
          options,
          createdAt:
            productTemp && productTemp.createdAt ? productTemp.createdAt : moment().toDate(),
          cafe24UpdatedAt:
            productTemp && productTemp.cafe24UpdatedAt
              ? productTemp.cafe24UpdatedAt
              : moment().toDate(),
        },
      },
      {
        upsert: true,
      }
    )
  } catch (e) {
    console.log("updateCafe24", e)
  } finally {
    return returnMessage
  }
}
const getKiprisWords = async (title) => {
  let result = []
  try {
    const promiseArray = title
      .split(" ")
      .filter((item) => item.length > 0)
      .map((item) => {
        return new Promise(async (resolve, reject) => {
          try {
            const response = await TrademarkGeneralSearchService({
              search: item.replace("(", "").replace(")", "").replace("[", "").replace("]", ""),
            })

            result.push(response)
            resolve()
          } catch (e) {
            console.log("error", e)
            reject(e)
          }
        })
      })
    await Promise.all(promiseArray)
  } catch (e) {
    console.log("getKiprisWords", e)
  } finally {
    return result
  }
}
module.exports = {
  marketAPIResolver,
  updateCoupang,
  updateCafe24,
  getKiprisWords,
}

const getMarketName = (market) => {
  switch (market) {
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
  if (orderState.includes("N")) {
    return 1
  }
  if (orderState.includes("C")) {
    return 2
  }
  if (orderState.includes("R")) {
    return 3
  }
  if (orderState.includes("E")) {
    return 4
  }
}
