const findAmazonDetailAPIsimple = require("../puppeteer/getAmazonItemAPIsimple")
const findiHerbDetailAPIsimple = require("../puppeteer/getiHerbItemAPIsimple")
const prohibit = require("../models/prohibit")
const { GetProhibits } = require("../api/Amazon")
const { iHerbCode } = require("../api/iHerb")
const tesseract = require("node-tesseract-ocr")
const { AmazonAsin } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const { trimEnd } = require("lodash")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")

const resolvers = {
  Query: {
    GetAmazonDetailAPI: async (parent, { url, title }, { req, model: { Product }, logger }) => {
      try {
        console.log("url", url)
        if (!url) {
          return null
        }
        const asin = AmazonAsin(url)
        if (!asin) {
          return null
        }
        const product = await Product.findOne({
          userID: ObjectId(req.user.adminUser),
          "options.key": asin,
          isDelete: false,
        })
        if (product) {
          return {
            isRegister: true,
          }
        }
        const detailItem = await findAmazonDetailAPIsimple({
          title,
          url,
          userID: req.user && req.user.adminUser ? req.user.adminUser : "5f0d5ff36fc75ec20d54c40b",
        })

        return detailItem
      } catch (e) {
        logger.error(`GetAmazonDetailAPI: ${e}`)
        return null
      }
    },
    GetiHerbDetailAPI: async (parent, { url, title }, { req, model: { Product }, logger }) => {
      try {
        console.log("url", url)
        if (!url) {
          return null
        }
        const asin = AmazonAsin(url)
        if (!asin) {
          return null
        }
        const product = await Product.findOne({
          userID: ObjectId(req.user.adminUser),
          "options.key": asin,
          isDelete: false,
        })
        if (product) {
          console.log("product", product._id)
          return {
            isRegister: true,
          }
        }
        let detailItem = await findiHerbDetailAPIsimple({
          title,
          url,
          userID: req.user && req.user.adminUser ? req.user.adminUser : "5f0d5ff36fc75ec20d54c40b",
        })

        return detailItem
      } catch (e) {
        logger.error(`GetiHerbDetailAPI: ${e}`)
        return null
      }
    },
    GetProhibit: async (parent, { asin }, { req, model: { TempProduct, Brand }, logger }) => {
      try {
        let prohibitList = await Brand.find(
          {
            prohibit: { $ne: null },
          },
          { prohibit: 1 }
        )

        const tempProduct = await TempProduct.findOne({
          userID: ObjectId(req.user.adminUser),
          good_id: asin,
        })

        if (tempProduct) {
          let engSentence = tempProduct.engSentence
          let prohibitWord = tempProduct.prohibitWord

          try {
            const promiseArray = tempProduct.mainImages.map((item) => {
              return new Promise(async (resolve, reject) => {
                try {
                  const text = await tesseract.recognize(item)
                  engSentence += `${text} `
                  resolve()
                } catch (e) {
                  console.log("recognize", item)
                  console.log("recognize", e)
                  reject(e)
                }
              })
            })

            await Promise.all(promiseArray)
          } catch (e) {
            console.log("----", e)
          }

          // for(const item of tempProduct.content){
          //   try{
          //     const text = await tesseract.recognize(item)
          //     engSentence += `${text} `
          //   }catch(e) {
          //     console.log("recognize", item)
          //     console.log("recognize", e)
          //   }
          // }

          for (const item1 of prohibitList) {
            if (engSentence.toUpperCase().includes(item1.prohibit.toUpperCase())) {
              if (!prohibitWord.includes(item1.prohibit)) {
                prohibitWord.push(item1.prohibit)
              }
            }
          }

          return {
            prohibitWord,
            engSentence,
          }
        }

        return null
      } catch (e) {
        logger.error(`GetProhibit: ${e}`)
        return null
      }
    },
  },
  Mutation: {
    GetOcrData: async (parent, { url }, { req, model: { Brand }, logger }) => {
      try {
        // const config = {
        //   lang: "eng",
        //   oem: 3,
        //   psm: 3,
        // }
        // tesseract.recognize("http://www.musicscore.co.kr/sample/samp7ys7f3ij9wkjid8eujfhsiud843dsijfowejfisojf3490fi0if0sjk09jkr039uf90u/8u4ojsjdjf430foeid409ijef923jerojfgojdofj894jjdsf934f90f40ufj390rfjds/sample_63000/sample_3zICj22vAF2018111620349.jpg", config)
        // .then((text) => { console.log("Result:", text) })
        // .catch((error) => { console.log("error", error.message) })

        // const img = "https://m.media-amazon.com/images/I/81ahj1+V-EL.jpg"
        // const img = "https://m.media-amazon.com/images/I/61+-TpstvmL.jpg"
        const text = await tesseract.recognize(url)
        const prohibitArray = []
        const prohibits = await Brand.find({ prohibit: { $ne: null } }, { prohibit: 1 })

        for (const item of prohibits) {
          if (text.includes(item.prohibit)) {
            console.log("===", item.prohibit)
            prohibitArray.push(item.prohibit)
          }
        }
        console.log("test==", text)
        return {
          text,
          prohibit: prohibitArray,
        }
      } catch (e) {
        console.log("GetOcrData==", e)
        logger.error(`GetOcrData: ${e}`)
        return {
          text: null,
          prohibit: [],
        }
      }
    },
    GetAmazonCollection: async (
      parent,
      {},
      {
        req,
        model: { Product, TempProduct, AmazonCollection, ExchangeRate, ShippingPrice, Brand },
        logger,
      }
    ) => {
      try {
        const excahgeRate = await ExchangeRate.aggregate([
          {
            $match: {
              CNY_송금보내실때: { $ne: null },
            },
          },
          {
            $sort: {
              날짜: -1,
            },
          },
          {
            $limit: 1,
          },
        ])

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "62707ad073dd9253ac84bfbd" ||
          req.user.adminUser.toString() === "62bd48f391d7fb85bcc54693"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "62707ad073dd9253ac84bfbd",
                  "62bd48f391d7fb85bcc54693"
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }
        // const marginInfo = await ShippingPrice.aggregate([
        //   {
        //     $match: {
        //       userID: ObjectId(req.user.adminUser),
        //       type: 4,
        //     }
        //   }, {
        //     $sort: {
        //       title: 1
        //     }
        //   }
        // ])

        // const shippingWeightInfo = await ShippingPrice.aggregate([
        //   {
        //     $match: {
        //       userID: ObjectId(req.user.adminUser),
        //       type: 5,
        //     }
        //   }, {
        //     $sort: {
        //       title: 1
        //     }
        //   }
        // ])

        // // let prohibitList = await Brand.find(
        // //   {
        // //     prohibit: { $ne: null }
        // //   },
        // //   { prohibit: 1 }
        // // )

        // const exchange = Number(excahgeRate[0].USD_송금보내실때.replace(/,/gi, "") || 1250) + 5

        const tempProduct1 = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isDelete: false,
              $or: [
                {
                  "basic.url": { $regex: `.*amazon.com.*` },
                },
                {
                  "basic.url": { $regex: `.*iherb.com.*` },
                },
                {
                  "basic.url": { $regex: `.*aliexpress.com.*` },
                },
                {
                  "basic.url": { $regex: `.*vvic.com.*` },
                },
              ],
            },
          },
          { $unwind: "$options" },
          {
            $project: {
              options: {
                key: 1,
              },
            },
          },
        ])
        const tempProduct2 = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isDelete: false,
              $or: [
                {
                  "basic.url": { $regex: `.*taobao.com.*` },
                },
                {
                  "basic.url": { $regex: `.*tmall.com.*` },
                },
                {
                  "basic.url": { $regex: `.*aliexpress.com.*` },
                },
                {
                  "basic.url": { $regex: `.*vvic.com.*` },
                },
              ],
            },
          },
          {
            $project: {
              basic: {
                good_id: 1,
              },
            },
          },
        ])
        let asinArr1 = tempProduct1.map((item) => item.options.key)
        let asinArr2 = tempProduct2.map((item) => item.basic.good_id)

        const tempArr = await TempProduct.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              good_id: { $nin: [...asinArr1, ...asinArr2] },
            },
          },
        ])

        const list = []

        const tempArr2 = []

        for (const item of tempArr) {
          if (!item.good_id || item.good_id.length === 0) {
            continue
          }
          if (item.options.length === 0) {
            await AmazonCollection.findOneAndUpdate(
              {
                userID: ObjectId(req.user.adminUser),
                asin: item.good_id,
              },
              {
                $set: {
                  isDelete: true,
                },
              },
              {
                upsert: true,
              }
            )
            await TempProduct.deleteOne({
              userID: ObjectId(req.user.adminUser),
              good_id: item.good_id,
            })
            continue
          }

          if (item.deliverDate) {
            let day = moment(item.deliverDate).diff(moment(), "days") + 1
            if (day > 20) {
              await AmazonCollection.findOneAndUpdate(
                {
                  userID: ObjectId(req.user.adminUser),
                  asin: item.good_id,
                },
                {
                  $set: {
                    isDelete: true,
                  },
                },
                {
                  upsert: true,
                }
              )
              await TempProduct.deleteOne({
                userID: ObjectId(req.user.adminUser),
                good_id: item.good_id,
              })
              continue
            }
          }
          if (item.options.filter((fItem) => fItem.stock !== 0).length === 0) {
            console.log("품절", item.good_id)
            await AmazonCollection.findOneAndUpdate(
              {
                userID: ObjectId(req.user.adminUser),
                asin: item.good_id,
              },
              {
                $set: {
                  isDelete: true,
                },
              },
              {
                upsert: true,
              }
            )
            await TempProduct.deleteOne({
              userID: ObjectId(req.user.adminUser),
              good_id: item.good_id,
            })
            continue
          }
          if (item.prohibitWord && item.prohibitWord.length > 0) {
            let isDelete = false
            for (const word of item.prohibitWord) {
              if (word.length > 3) {
                isDelete = true
              }
            }
            if (isDelete) {
              console.log("3333", item.good_id)
              await AmazonCollection.findOneAndUpdate(
                {
                  userID: ObjectId(req.user.adminUser),
                  asin: item.good_id,
                },
                {
                  $set: {
                    isDelete: true,
                  },
                },
                {
                  upsert: true,
                }
              )
              await TempProduct.deleteOne({
                userID: ObjectId(req.user.adminUser),
                good_id: item.good_id,
              })
              continue
            }
          }

          tempArr2.push(item)
        }
        const promiseArray = tempArr2
          // .filter(async (fItem) => {
          //   if (!fItem.good_id || fItem.good_id.length === 0) {
          //     return false
          //   }
          //   if (fItem.options.length === 0) {
          //     console.log("1111")
          //     await AmazonCollection.findOneAndUpdate(
          //       {
          //         userID: ObjectId(req.user.adminUser),
          //         asin: fItem.good_id,
          //       },
          //       {
          //         $set: {
          //           isDelete: true,
          //         },
          //       },
          //       {
          //         upsert: true,
          //       }
          //     )
          //     await TempProduct.deleteOne({
          //       userID: ObjectId(req.user.adminUser),
          //       good_id: fItem.good_id,
          //     })
          //     return false
          //   }
          //   if (fItem.options[0].stock === 0) {
          //     console.log("2222")
          //     console.log("품절", fItem.good_id)
          //     await AmazonCollection.findOneAndUpdate(
          //       {
          //         userID: ObjectId(req.user.adminUser),
          //         asin: fItem.good_id,
          //       },
          //       {
          //         $set: {
          //           isDelete: true,
          //         },
          //       },
          //       {
          //         upsert: true,
          //       }
          //     )
          //     await TempProduct.deleteOne({
          //       userID: ObjectId(req.user.adminUser),
          //       good_id: fItem.good_id,
          //     })
          //     return false
          //   }
          //   if (fItem.prohibitWord.length > 0) {
          //     let isDelete = false
          //     for (const word of fItem.prohibitWord) {
          //       if (word.length > 3) {
          //         isDelete = true
          //       }
          //     }
          //     if (isDelete) {
          //       console.log("3333", fItem.good_id)
          //       await AmazonCollection.findOneAndUpdate(
          //         {
          //           userID: ObjectId(req.user.adminUser),
          //           asin: fItem.good_id,
          //         },
          //         {
          //           $set: {
          //             isDelete: true,
          //           },
          //         },
          //         {
          //           upsert: true,
          //         }
          //       )
          //       await TempProduct.deleteOne({
          //         userID: ObjectId(req.user.adminUser),
          //         good_id: fItem.good_id,
          //       })
          //       return false
          //     }
          //   }

          //   return true
          // })
          .map((item) => {
            // console.log("item-->", item.good_id)
            return new Promise(async (resolve, reject) => {
              try {
                let marginInfo = []
                let shippingWeightInfo = []
                let exchange = 0

                if (item.detailUrl.includes("iherb.com")) {
                  marginInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 4,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                  shippingWeightInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 5,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])

                  if (marginInfo.length === 0) {
                    marginInfo.push({
                      title: 10,
                      price: 20,
                    })
                  }
                  if (!shippingWeightInfo || shippingWeightInfo.length === 0) {
                    shippingWeightInfo.push({
                      title: 1,
                      price: 10000,
                    })
                  }
                } else if (item.detailUrl.includes("aliexpress.com")) {
                  marginInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 6,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                  shippingWeightInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 7,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])

                  if (marginInfo.length === 0) {
                    marginInfo.push({
                      title: 10,
                      price: 30,
                    })
                  }
                  if (!shippingWeightInfo || shippingWeightInfo.length === 0) {
                    shippingWeightInfo.push({
                      title: 1,
                      price: 10000,
                    })
                  }
                } else if (item.detailUrl.includes("amazon.com")) {
                  exchange = Number(excahgeRate[0].USD_송금보내실때.replace(/,/gi, "") || 1250) + 5
                  marginInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 8,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                  shippingWeightInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 9,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                } else if (
                  item.detailUrl.includes("taobao.com") ||
                  item.detailUrl.includes("tmall.com") ||
                  item.detailUrl.includes("vvic.com")
                ) {
                  exchange = Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 1250) + 5
                  marginInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 1,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                  shippingWeightInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: ObjectId(req.user.adminUser),
                        type: 2,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])
                }

                item.isRegister = false
                item.exchange = exchange
                item.marginInfo = marginInfo
                item.shippingWeightInfo = shippingWeightInfo

                let engSentence = item.engSentence
                let prohibitWord = item.prohibitWord

                let titleArr = item.korTitle.split(" ")
                titleArr = titleArr.map((tItem) => {
                  const brandArr = brandList.filter((item) =>
                    tItem.toUpperCase().includes(item.brand.toUpperCase())
                  )
                  const banArr = banList.filter((item) =>
                    tItem.toUpperCase().includes(item.banWord.toUpperCase())
                  )
                  return {
                    word: tItem,
                    brand: brandArr.length > 0 ? brandArr.map((item) => item.brand) : [],
                    ban: banArr.length > 0 ? banArr.map((item) => item.banWord) : [],
                  }
                })
                item.titleArray = titleArr

                // for(const item1 of item.mainImages.filter(item => item !== null)){
                //   try{
                //     const text = await tesseract.recognize(item1)
                //     engSentence += `${text} `
                //   }catch(e) {
                //     console.log("recognize", item1)
                //     console.log("recognize", e)
                //   }

                // }
                // for(const item1 of item.content){
                //   try{
                //     const text = await tesseract.recognize(item1)
                //     engSentence += `${text} `
                //   }catch(e) {
                //     console.log("recognize", item1)
                //     console.log("recognize", e)
                //   }
                // }

                // for(const item1 of prohibitList){
                //   if(engSentence.toUpperCase().includes(item1.prohibit.toUpperCase())){
                //     if(!prohibitWord.includes(item1.prohibit)){
                //       prohibitWord.push(item1.prohibit)
                //     }
                //   }
                // }

                // item.prohibitWord = prohibitWord
                // item.engSentence = engSentence
                list.push(item)
                resolve()
              } catch (e) {
                reject(e)
              }
            })
          })
        // for(const item of tempArr.filter(fItem => fItem.options.length > 0)){

        // }
        await Promise.all(promiseArray)

        return (
          list
            // .filter(
            //   (fItem) => fItem.options && fItem.options.length > 0 && fItem.options[0].stock !== 0
            // )
            // .filter((fItem) => {
            //   let isDelete = false
            //   for (const word of fItem.prohibitWord) {
            //     if (word.length > 3) {
            //       isDelete = true
            //     }
            //   }
            //   if (isDelete) {
            //     return false
            //   }
            //   return true
            // })
            .sort((a, b) => a.lastUpdate - b.lastUpdate)
        )
      } catch (e) {
        logger.error(`GetAmazonCollection: ${e}`)
        return []
      }
    },
    DeleteAmazonCollection: async (
      parent,
      { asin },
      { req, model: { TempProduct, AmazonCollection }, logger }
    ) => {
      try {
        console.log("여기 타냐")
        if (!asin) {
          return false
        }
        await AmazonCollection.findOneAndUpdate(
          {
            userID: ObjectId(req.user.adminUser),
            asin,
          },
          {
            $set: {
              isDelete: true,
            },
          },
          {
            upsert: true,
            new: true,
          }
        )
        await TempProduct.deleteOne({
          userID: ObjectId(req.user.adminUser),
          good_id: asin,
        })

        return true
      } catch (e) {
        logger.error(`DeleteAmazonCollection: ${e}`)
        return false
      }
    },
    GetiHerbOptionPid: async (parent, { url }, { req, model: {}, logger }) => {
      try {
        const asin = AmazonAsin(url)
        if (!asin) {
          return null
        }
        const host = url.split("?")[0].replace(`/${asin}`, "/")
        const response = await iHerbCode({ url })

        return response.map((item) => {
          return {
            asin: item,
            url: `${host}${item}`,
          }
        })
      } catch (e) {
        logger.error(`GetiHerbOptionPid: ${e}`)
        const asin = AmazonAsin(url)
        if (!asin) {
          return null
        }
      }
    },
  },
}

module.exports = resolvers
