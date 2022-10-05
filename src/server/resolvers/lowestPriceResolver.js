const {GetProductList, GetProductOptions, GetOtherSellers, UpdateProductPriceByItem} = require("../api/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")
const {sleep} = require("../../lib/usrFunc")
const CoupangProduct = require("../models/CoupangProduct")
const OtherSellerHistory = require("../models/OtherSellerHistory")

const resolvers = {
  Query: {
    GetLowestPriceList: async (parent, 
      {page = 1, perPage = 10, search = "",
      notWinner = true,
      isNaver = false,
      isWinner = false,
      isExcept = false,
      isManage = false}, 
      {req, model: {CoupangProduct}, logger}) => {
      try {

        let match = {}
        let sourcingType = []
        match.isExcept = {$ne: true}

        if(isExcept){
          match.isExcept = true
        }
    
        if(isWinner){
          sourcingType.push(1)
        }
        if(isNaver){
          sourcingType.push(2)
        }
        if(sourcingType.length > 0){
          match.sourcingType = {$in:sourcingType}
        }
        console.log("aaa", {
          userID: ObjectId(req.user.adminUser),
          statusName: "승인완료",
          "items.isManage": isManage ? isManage : {$ne: true},
          // "items.status": {$gte: 1},
          "items.status": notWinner ? 2 : {$gte: 1},
          $or: [
            { "sellerProductName": { $regex: `.*${search}.*` } },
          ],
          ...match
        }
      )
        const product = await CoupangProduct.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    userID: ObjectId(req.user.adminUser),
                    statusName: "승인완료",
                    "items.isManage": isManage ? isManage : {$ne: true},
                    // "items.status": {$gte: 1},
                    "items.status": notWinner ? 2 : {$gte: 1},
                    $or: [
                      { "sellerProductName": { $regex: `.*${search}.*` } },
                    ],
                    ...match
                  }
                },
                {
                  $lookup: {
                    from: "users",
                    localField: "writerID",
                    foreignField: "_id",
                    as: "user"
                  }
                },
                // {
                //   $unwind: "$items"
                // },
                {
                  $sort: { lastUpdate: -1 }
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
                    statusName: "승인완료",
                    "items.isManage": isManage,
                    "items.status": {$gt: 1},
                    $or: [
                      { "sellerProductName": { $regex: `.*${search}.*` } },
                    ],
                    ...match
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
        
       
        const data = product[0].data.map(item => {
          return {
            ...item,
            user: item.user && Array.isArray(item.user) && item.user.length > 0 ? {
              ...item.user[0]
            } : null,
          }
        })
         
        return {
          count: product[0].count[0] ? product[0].count[0].count : 0,
          list: data
        }
   
      } catch (e) {
        logger.error(`GetLowestPriceList: ${e}`)
        return {
          count: 0,
          list: []
        }
      }
    }
  },
  Mutation: {
    GetCoupangProductList: async (parent, {}, {req, model: {Market, CoupangProduct, Product}, logger}) => {
      try {
        const market = await Market.findOne(
          {userID: ObjectId(req.user.adminUser)}
        )

        await CoupangProduct.deleteMany({
          userID: req.user.adminUser
        })
        ;(async () => {
          let nextToken = 1
          while(nextToken){
            try {
              
              const response = await GetProductList({userID: req.user.adminUser, vendorId: market.coupang.vendorId, nextToken})
              
              // console.log("response", response)
              nextToken = response.nextToken && response.nextToken.length > 0 ? response.nextToken : null
              
              if(response.code === "SUCCESS"){
                for(const item of response.data){
                 
                  let product = await Product.findOne(
                    {
                      userID: req.user.adminUser,
                      "basic.naverID": item.productId
                    },
                    {
                      writerID: 1, isWinner: 1, isNaver: 1, isBatch: 1
                    }
                  )
                  if(!product){
                    product = await Product.findOne(
                      {
                        userID: req.user.adminUser,
                        "product.coupang.productID": item.sellerProductId
                      },
                      {
                        writerID: 1, isWinner: 1, isNaver: 1, isBatch: 1
                      }
                    )
                  }
              
                  let sourcingType = 0
                  if(product && product.isWinner){
                    sourcingType = 1
                  } else if(product && product.isNaver){
                    sourcingType = 2
                  } else if(product && product.isBatch){
                    sourcingType = 3
                  }
                 
                  await CoupangProduct.findOneAndUpdate(
                    {
                      userID: ObjectId(req.user.adminUser),
                      vendorId: item.vendorId,
                      sellerProductId: item.sellerProductId
                    },
                    {
                      $set: {
                        userID: req.user.adminUser,
                        ...item,
                        writerID: product && product.writerID ? product.writerID : null,
                        sourcingType,
                        lastUpdate: moment().toDate()
                      }
                    },
                    {
                      upsert: true, new: true
                    }
                  )

                  if(item.statusName === "승인완료"){
                    const options = await GetProductOptions({userID: req.user.adminUser, sellerProductId: item.sellerProductId})
                  
                    if(options.code === "SUCCESS"){
                      for(const item of options.data.items){

                        const savedCoupangOption = await CoupangProduct.aggregate([
                          {
                            $match: {
                              userID: ObjectId(req.user.adminUser)
                            }
                          },
                          {
                            $project: {
                              items: 1,
                       
                            }
                          },
                          {
                            "$unwind" : "$items",
                          },
                          {
                            $match: {
                              "items.sellerProductItemId": item.sellerProductItemId.toString()
                            }
                          }
                        ])
  
                        if(savedCoupangOption && savedCoupangOption.length > 0){
                          item.isManage = savedCoupangOption[0].items.isManage
                          item.margin = savedCoupangOption[0].items.margin
                          item.minPrice = savedCoupangOption[0].items.minPrice
                          item.costPrice = savedCoupangOption[0].items.costPrice
                        } else {
                          const savedOption = await Product.aggregate([
                            {
                              $match: {
                                userID: ObjectId(req.user.adminUser)
                              }
                            },
                            {
                              $project: {
                                options: 1,
                                isWinner: 1,
                              }
                            },
                            {
                              "$unwind" : "$options",
                            },
                            {
                              $match: {
                                "options.coupang.sellerProductItemId": item.sellerProductItemId.toString()
                              }
                            }
                          ])
                          
                          if(savedOption && savedOption.length > 0){
                            item.isManage = false
                            item.margin = savedOption[0].isWinner ? null : savedOption[0].options.margin
                            item.costPrice = savedOption[0].isWinner ? null : savedOption[0].options.price
                          }
                        }
                        
                        let status = 0;
                        let otherSeller = []
                        console.log("aaa---", {itemId: item.itemId, vendorItemId: item.vendorItemId})
                        const response = await GetOtherSellers({itemId: item.itemId, vendorItemId: item.vendorItemId})
                     
                        console.log("response = ", response.items)
                        if(response && response.totalCount > 1){
                          // 위너로 묶임
                          otherSeller = response.items.map((oItem, index) => {
                            let price = Number(oItem.price.replace(/,/gi, ""))
                            let shippingFee = 0
                            if(oItem.vendorItemId === item.vendorItemId){
                              status = index + 1
                            }
                            if(oItem.deliveryInfo && oItem.deliveryInfo.shippingFeeMessage){
                              shippingFee = Number(oItem.deliveryInfo.shippingFeeMessage
                                .replace("배송비", "")
                                .replace("원", "")
                                .replace("+", "")
                                .replace(/,/gi, "")
                                .trim())
                              // console.log("item.deliveryInfo", item.deliveryInfo, shippingFee)
                            }
                            return {
                              ...oItem,
                              price: price + shippingFee,
                              
                            }
                          })
                        }
  
                        item.cdnPath = item.images[0] && item.images[0].cdnPath ? item.images[0].cdnPath : null
                        item.otherSeller = otherSeller
                        item.status = status
                        item.lastUpdate = moment().toDate()
                        // return {
                        //   ...item,
                        //   cdnPath: item.images[0] && item.images[0].cdnPath ? item.images[0].cdnPath : null
                        // }
                      }
                    //  console.log("options.data.items", options.data.items)
                      await CoupangProduct.findOneAndUpdate(
                        {
                          userID: ObjectId(req.user.adminUser),
                          vendorId: item.vendorId,
                          sellerProductId: item.sellerProductId
                        },
                        {
                          $set: {
                            items: options.data.items
                          }
                        },
                        {
                          upsert: true
                        }
                      )
  
                      await sleep(5000)
                      // console.log("여기1", options.data.items.length)
                     
                    }
                  }
                  

                }
              }

              
            } catch (e) {
              console.log("nextToken ", e)
            }
          }

          
        })()
        console.log("끝")
        return true
      } catch(e){
        logger.error(`GetCoupangProductList ${e}`)
        return false
      }
    },
    SetLowPriceManage: async (parent, {input}, {req, model: {Market, CoupangProduct}, logger}) => {
      try {

        //607dec2fb8c8e84f6f8d3a36
        console.log("input", input.length)
        for(const item of input){
          console.log("item", item) 
          const OptionsItem = await CoupangProduct.updateOne(
            {
              userID: req.user.adminUser,
              "items.sellerProductItemId": item.sellerProductItemId
            },
            {
              $set: {
                "items.$.minPrice": item.minPrice,
                "items.$.minMagin:": item.margin,
                "items.$.isManage": item.isManage
              }
            }
          )
          console.log("OptionsItem", OptionsItem)
          await minPriceManager({userID: req.user.adminUser, sellerProductItemId: item.sellerProductItemId})
        }
        return true
      } catch(e) {
        logger.error(`SetLowPriceManage ${e}`)
        return false
      }
    },
    ExceptProduct: async (parent, {_id, isExcept}, {req, model: {CoupangProduct}, logger}) => {
      try {

        await CoupangProduct.findOneAndUpdate(
          {
            _id,
            userID: req.user.adminUser
          },
          {
            $set: {
              isExcept 
            }
          }
        )
        return true
      } catch (e) {
        logger.error(`ExceptProduct ${e}`)
        return false
      }
    },
    AutoPriceManage: async (parent, {}, {req, model: {CoupangProduct}, logger}) => {
      try {
        console.log("autoPricemanage", req.user.adminUser)

        setTimeout(async() => {
          return
          while(true){

            const product = await CoupangProduct.aggregate([
              {
                "$unwind" : "$items",
              },
              {
                $match: {
                  isExcept: {$ne: true},
                  "items.isManage": true
                }
              }
            ])
            console.log("스케줄 시작")
            for(const item of product){
              const optionItem = await CoupangProduct.aggregate([
                {
                  "$unwind" : "$items",
                },
                {
                  $match: {
                    "items._id": item.items._id
                  }
                }
              ])
            
    
              if(optionItem.length === 1 && !optionItem[0].isExcept && optionItem[0].items.isManage){
                await minPriceManager({userID: req.user.adminUser, sellerProductItemId: optionItem[0].items.sellerProductItemId})
                await sleep(1000)
              }
            }
            console.log("스케줄 끝")
            await sleep(1000 * 60 * 60)
          }
        }, 5000)
        
        return true
      } catch (e) {
        logger.error(`AutoPriceManage ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers

const minPriceManager = async ({userID, sellerProductItemId}) => {
  try {
    console.log("sellerProductItemId", sellerProductItemId)
    const optionsItem = await CoupangProduct.aggregate([
      {
        $unwind: "$items"
      },
      {
        $match: {
          "items.sellerProductItemId": Number(sellerProductItemId)
        }
      }
    ])

    const Deduction = 100
    for(const item of optionsItem){
      ;(async () => {
        if(item.items.minPrice <= item.items.salePrice){
          // 판매가격이 최저가보다 클 경우만
          let winnerProcess = 0
          // 가격을 내렸는데 위너가 될 경우
          let winnerCount = 1

          let process = true 
          let mySalePrice = item.items.salePrice
          let i = 0
          let isFirstWinner = false  // 첫 조회 위너 여부
          let isDown = false
          while (process){
            const response = await WinnerCheck({userID, itemId: item.items.itemId, sellerProductItemId: item.items.sellerProductItemId, vendorItemId: item.items.vendorItemId})

            if(!response){
              console.log("response 실패", response)
              process = false
              break
            }
            if(response.isWinner && response.totalCount <= 1) {
              // 단독 상품일 가능성 큼
              console.log("단독 상품")
              process = false
              break
            } 

            if(item.items.minPrice > response.winnerPrice){
              console.log("더이상 가격 못 낮춤")
              process = false
              break
            }

            // console.log("respnse", response)
            
            let estimatedPrice = 0
            
            
            
            // 가격을 낮춰서 위너가 된 경우 winnerProcess = 1
            // 위너
            if(response.isWinner && response.adjustment){
              if(i === 0){
                // 첫 조회에서 위너
                isFirstWinner = true
              }

              if(isFirstWinner && !isDown){
                // 가격 업
                if(response.otherSeller.length > 1){ 
                  if(i===0){
                    estimatedPrice = response.otherSeller[1].price
                  } else {
                    estimatedPrice = response.winnerPrice + Deduction
                  }
                  
                  console.log("가격 업", estimatedPrice)
                } else {
                  console.log("두번째 위너 - 두번째 위너 없음")
                  process = false
                }
               
              } else {
                // 첫 조회에서 위너가 아닌 경우 .. 가격 다운으로 위너를 만들었다
                console.log("가격 다운으로 위너 성공")
                if(isDown){
                  console.log("가격 다운 해서 위너 됨")
                  process = false
                }
                process = false
              }
           

            } else {
              if(!response.adjustment){
                console.log("가격조정 필요 없음")
                await CoupangProduct.updateOne(
                  {
                    userID: ObjectId(userID),
                    "items.sellerProductItemId": Number(item.items.sellerProductItemId)
                  },
                  {
                    $set: {
                      "items.$.status": response.isWinner ? 1 : 2,
                      "items.$.lastUpdate": moment().toDate(),
                    }
                  }
                )
                process = false
              } else {
                if(i === 0){
                  isFirstWinner = false
                }
                isDown = true
                // 위너가 아니므로 가격을 낮춘다
                if(!isFirstWinner && mySalePrice >= response.winnerPrice){
                  // 위너 금액보다 내 금액이 높으면
                  estimatedPrice = response.winnerPrice - Deduction
                } else {
                  // 위너 금액보다 내 금액이 낮으면
                  estimatedPrice = mySalePrice - Deduction
                }
                console.log("가격 다운", estimatedPrice)
              }
      
              
            }

            if(estimatedPrice > 0){
              mySalePrice = estimatedPrice
  
              let marginPrice = mySalePrice * item.items.margin / 100
              let marginSubPrice = marginPrice - (mySalePrice - estimatedPrice)
              let predictionMargin = Number((marginSubPrice / estimatedPrice * 100).toFixed(1))
              
              const changePriceResponse = await UpdateProductPriceByItem({userID, vendorItemId: item.items.vendorItemId, price: estimatedPrice})
              if(changePriceResponse.code === "SUCCESS"){
                await CoupangProduct.updateOne(
                  {
                    userID: ObjectId(userID),
                    "items.sellerProductItemId": Number(item.items.sellerProductItemId)
                  },
                  {
                    $set: {
                      "items.$.margin": item.items.margin ? predictionMargin : null,
                      "items.$.salePrice": estimatedPrice,
                      "items.$.status": response.isWinner ? 1 : 2,
                      "items.$.lastUpdate": moment().toDate(),
                    }
                  }
                )
              }

              console.log("response.isWinner",  response.isWinner ? 1 : 2, item.items.sellerProductItemId)
            }

            
            
           
            if(item.items.minPrice >= mySalePrice){
              console.log("최저가에 도달해서 끝")
              process = false
            }

            i++
            await sleep(20000)

            if(winnerCount > 1){
              console.log("끝이야", winnerCount)
              process = false
              break
            }

          }
          console.log("끝")
        } else {
          console.log("최저가에 도달했어요")
        }
      })()
    }
    
  } catch(e){
    console.log("minPriceManager", e)
  } finally {
    return true
  }
}

const WinnerCheck = async ({userID, itemId, sellerProductItemId, vendorItemId}) => {
  try {
    const response = await GetOtherSellers({itemId, vendorItemId})
    if(!response){
      return null
    }
    
    const otherSeller = response.items.map(item => {
      let price = Number(item.price.replace(/,/gi, ""))
      let shippingFee = 0
      if(item.deliveryInfo && item.deliveryInfo.shippingFeeMessage){
        shippingFee = Number(item.deliveryInfo.shippingFeeMessage
          .replace("배송비", "")
          .replace("원", "")
          .replace("+", "")
          .replace(/,/gi, "")
          .trim())
      }
      return {
        vendorName: item.vendorName,
        vendorItemId: item.vendorItemId,
        selected: item.selected,
        price: price + shippingFee
      }
    })


    await CoupangProduct.updateOne(
      {
        userID: ObjectId(userID),
        "items.sellerProductItemId":sellerProductItemId
      },
      {
        $set: {
          "items.$.lastUpdate": moment().toDate(),
          "items.$.otherSeller": otherSeller,
        }
      }
    )
 

    if(response && response.totalCount > 0){
      // 위너의 가겨
      let winnerSalePrice = Number(response.items[0].price.replace(/,/gi, ""))
      let shippingFee = 0
      let secondSalePrice = 0
      let secondShippingFee = 0
      if(response.items[0].deliveryInfo && response.items[0].deliveryInfo.shippingFeeMessage){
        shippingFee = Number(response.items[0].deliveryInfo.shippingFeeMessage
          .replace("배송비", "")
          .replace("원", "")
          .replace("+", "")
          .replace(/,/gi, "")
          .trim())
      }
      if(response.totalCount > 1){
        if(response.items[1].deliveryInfo && response.items[1].deliveryInfo.shippingFeeMessage){
          secondShippingFee = Number(response.items[1].deliveryInfo.shippingFeeMessage
            .replace("배송비", "")
            .replace("원", "")
            .replace("+", "")
            .replace(/,/gi, "")
            .trim())
        }
      }
      let winnerPrice = winnerSalePrice + shippingFee
      let secondPrice = secondSalePrice + secondShippingFee
      
      let adjustment = response.totalCount === 1 ? false : (response.items[0].vendorItemId === vendorItemId ? false : true)
      if(response.totalCount === 1){
        // 내가 위너이면 가격조정 필요없음
        adjustment = false
      } else {
        // if(response.items[0].vendorItemId === vendorItemId){
        //   // 내가 위너이면 가격조정 필요없음
        //   adjustment = false
        // } else {
          
        // }
        if(response.items[0].vendorName === "널포인트" ||
            response.items[0].vendorName === "미니투스" ||
            response.items[0].vendorName === "메타트론(metatron)" ){
              adjustment = false
          }
      }

      
      for(const item of response.items){
        if(item.vendorItemId === vendorItemId){
          let myPrice = Number(item.price.replace(/,/gi, ""))
          let myShippingFee = 0
          if(item.deliveryInfo && item.deliveryInfo.shippingFeeMessage){
            myShippingFee = Number(item.deliveryInfo.shippingFeeMessage
              .replace("배송비", "")
              .replace("원", "")
              .replace("+", "")
              .replace(/,/gi, "")
              .trim())
          }
          await OtherSellerHistory.create(
            {
              userID,
              itemId,
              vendorItemId,
              myPrice: myPrice + myShippingFee,
              winnerPrice,
              winnerVendorName: response.items[0].vendorName
            }
          )
        }
      }
      return {
        isWinner: response.totalCount === 1 ? true : (response.items[0].vendorItemId === vendorItemId ? true : false),
        vendorName: response.items[0].vendorName,
        winnerPrice,
        secondPrice,
        adjustment,
        totalCount: response.totalCount,
        otherSeller
      }
    } else {
      return {
        isWinner: true,
        vendorName: null,
        winnerPrice: null,
        secondPrice: null,
        adjustment: false,
        totalCount: 0,
        otherSeller
      }
    }
  } catch (e) {
    console.log("winnerCheck", e)
    return null
  }
}