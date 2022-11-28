const {
  categorySourcing,
  keywordSourcing,
  searchShippingFee,
  titleSourcing,
  coupangStoreSourcing,
  naverStoreSourcing,
  searchKeywordCategory,
} = require("../puppeteer/categorySourcing")
const { getCoupangRelatedKeyword, getCoupangAutoKeyword } = require("../puppeteer/keywordSourcing")
const { NaverKeywordRel } = require("../api/Naver")
const mongoose = require("mongoose")
const { DimensionArray, GetKeywordScore, isNumber, regExp_test } = require("../../lib/usrFunc")
const ObjectId = mongoose.Types.ObjectId
const _ = require("lodash")

const resolvers = {
  Query: {
    searchCategory: async (parnet, { categoryID }, { req, logger }) => {
      try {
        if (!categoryID) {
          return []
        }
        const response = await categorySourcing({
          categoryID,
          userID: req.user.adminUser,
        })
        response.sort((a, b) => {
          return a.openDate > b.openDate ? -1 : a.openDate < b.openDate ? 1 : 0
        })

        return response
      } catch (e) {
        logger.error(`searchCategory: ${e.message}`)
        return []
      }
    },
    searchKeyword: async (parnet, { keyword }, { req, logger }) => {
      try {
        if (!keyword) {
          return []
        }
        const response = await keywordSourcing({
          keyword,
          userID: req.user ? req.user.adminUser : null,
        })
        response.sort((a, b) => {
          return a.openDate > b.openDate ? -1 : a.openDate < b.openDate ? 1 : 0
        })

        return response
      } catch (e) {
        logger.error(`searchKeyword: ${e}`)
        return []
      }
    },

    FindShippingFee: async (parent, { mallName, crUrl }, { logger }) => {
      try {
        if (mallName) {
          return 0
        }

        return await searchShippingFee({ url: crUrl })
      } catch (e) {
        logger.error(`FindShippingFee: ${e}`)
        return 0
      }
    },
    searchTitleWithKeyword: async (parent, { keywords }, { req, logger }) => {
      try {
        const arr = []

        for (const item of keywords) {
          const response = await titleSourcing({ keyword: item.trim() })

          arr.push({
            keyword: item,
            relatedKeyword: response,
          })
        }
        console.log("arr--", arr)
        return arr
      } catch (e) {
        logger.error(`searchTitle: ${e}`)
        return []
      }
    },

    GetNaverStore: async (parent, { url }, { req, logger }) => {
      try {
        await naverStoreSourcing({ url })
        return []
      } catch (e) {
        logger.error(`GetCoupnagStore: ${e}`)
        return []
      }
    },
    GetNaverBest: async (parent, {}, { req, model: { Product, NaverItem }, logger }) => {
      try {
        const product = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user_id),
              isDelete: false,
              product: { $ne: null },
              basic: { $ne: null },
              coupangUpdatedAt: { $ne: null },
              cafe24UpdatedAt: { $ne: null },
              "basic.naverID": { $ne: null },
            },
          },
          {
            $project: {
              basic: 1,
            },
          },
        ])
        const list = await NaverItem.aggregate([
          {
            $match: {
              category1: {
                $in: [
                  "패션의류",
                  "패션잡화",
                  "화장품/미용",
                  "디지털/가전",
                  "가구/인테리어",
                  "스포츠/레저",
                  "생활/건강",
                  "전체상품",
                ],
              },
            },
          },
          {
            $sort: {
              lastUpdate: -1,
            },
          },
          {
            $limit: 10000,
          },
          { $sample: { size: 300 } },
        ])
        list.forEach((item) => {
          if (product.filter((savedItem) => savedItem.basic.naverID === item.id).length > 0) {
            item.registered = true
          } else {
            item.registered = false
          }
        })

        return list
      } catch (e) {
        logger.error(`GetNaverBest: ${e}`)
        return []
      }
    },
    GetNaverFlashItem: async (parent, {}, { req, model: { Product, NaverItem }, logger }) => {
      try {
        const product = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isDelete: false,
              product: { $ne: null },
              basic: { $ne: null },
              coupangUpdatedAt: { $ne: null },
              cafe24UpdatedAt: { $ne: null },
              "basic.naverID": { $ne: null },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        const naverIDs = product.map((item) => {
          return item.basic.naverID
        })

        const list = await NaverItem.aggregate([
          {
            $match: {
              isTaobao: true,
              category1: {
                $in: [
                  "패션의류",
                  "패션잡화",
                  "화장품/미용",
                  "디지털/가전",
                  "가구/인테리어",
                  "스포츠/레저",
                  "생활/건강",
                  "전체상품",
                ],
              },
              productID: { $nin: naverIDs },
            },
          },
          {
            $lookup: {
              from: "taobaoitems",
              let: { itemID: "$_id" },
              pipeline: [{ $match: { $expr: { $eq: ["$itemID", "$$itemID"] } } }],

              as: "taobaoItem",
            },
          },
          {
            $match: {
              $expr: { $gt: [{ $size: "$taobaoItem" }, 0] },
              "taobaoItem.sourcing": true,
            },
          },
          {
            $sort: {
              lastUpdate: -1,
            },
          },
          // {
          //   $limit: 10000
          // },
          { $sample: { size: 50 } },
        ])

        list.forEach((item) => {
          if (
            product.filter(
              (savedItem) => savedItem.basic.naverID.toString() === item.productID.toString()
            ).length > 0
          ) {
            item.registered = true
          } else {
            item.registered = false
          }
        })

        return list
      } catch (e) {
        logger.error(`GetNaverFlashItem: ${e}`)
        return []
      }
    },
    GetNaverFlashDetail: async (
      parent,
      { itemID, detail },
      { req, model: { Product, TaobaoDetail }, logger }
    ) => {
      try {
        const detailItem = await TaobaoDetail.findOne(
          { itemID: Object(itemID), url: detail },
          { _id: 1, good_id: 1, mainImages: 1, options: 1, korTitle: 1 }
        )

        if (detailItem) {
          const product = await Product.aggregate([
            {
              $match: {
                userID: ObjectId(req.user.adminUser),
                isDelete: false,
                "basic.good_id": detailItem.good_id,
              },
            },
            {
              $project: {
                basic: 1,
              },
            },
          ])
          if (product.length > 0) {
            detailItem.registered = true
          } else {
            detailItem.registered = false
          }
        }

        return detailItem
      } catch (e) {
        logger.error(`GetNaverFlashDetail: ${e}`)
        return null
      }
    },
  },
  Mutation: {
    searchTitle: async (parent, { keyword }, { logger }) => {
      try {
        // const response = await titleSourcing({ keyword })
        let keywordArray = []

        const promiseArray = [
          new Promise(async (resolve, reject) => {
            try {
              const coupnagRelatedReponse = await getCoupnagRelatedKeyword({ keyword })
              keywordArray.push(...coupnagRelatedReponse)
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              const coupangAutoReponse = await getCoupangAutoKeyword({ keyword })
              keywordArray.push(...coupangAutoReponse)
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
        ]

        await Promise.all(promiseArray)
        return keywordArray.map((item) => {
          return {
            name: item,
            count: 0,
          }
        })
        return response
      } catch (e) {
        logger.error(`searchTitle: ${e}`)
        return []
      }
    },
    GetCoupangStore: async (parent, { url, sort }, { req, logger }) => {
      try {
        const list = await coupangStoreSourcing({ url, sort, user: req.user.adminUser })
        return list
      } catch (e) {
        logger.error(`GetCoupnagStore: ${e}`)
        return []
      }
    },
    SetisTaobaoItem: async (parent, { id }, { model: { NaverItem }, logger }) => {
      try {
        const temp = await NaverItem.findOne({ _id: ObjectId(id) })

        if (!temp) {
          return false
        }

        await NaverItem.findOneAndUpdate(
          { _id: ObjectId(id) },
          {
            $set: {
              isTaobao: !temp.isTaobao,
            },
          }
        )
        return true
      } catch (e) {
        logger.error(`SetisTaobaoItem: ${e}`)
        return false
      }
    },
    SearchCoupangRelatedKeywrod: async (parent, { keyword }, { logger }) => {
      try {
        return await getCoupangRelatedKeyword({ keyword })
      } catch (e) {
        logger.error(`SearchCoupangRelatedKeywrod: ${e}`)
        return []
      }
    },
    SearchCoupangAutoKeywrod: async (parent, { keyword }, { logger }) => {
      try {
        return await getCoupnagAutoKeyword({ keyword })
      } catch (e) {
        logger.error(`SearchCoupangAutoKeywrod: ${e}`)
        return []
      }
    },
    SearchNaverRelatedKeywrod: async (parent, { keyword }, { logger }) => {
      try {
        const response = await NaverKeywordRel({ keyword })
        return response.keywordList.map((item) => item.relKeyword)
      } catch (e) {
        logger.error(`SearchNaverRelatedKeywrod: ${e}`)
        return []
      }
    },
    SearchNaverProductKeywrod: async (parent, { keyword }, { logger }) => {
      try {
        const mainOrgResponse = await searchKeywordCategory({ keyword })
        let mainOrg = mainOrgResponse.cmpOrg

        let titleArray = []
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
        const exceptWord = ["당일방송", "정품", "국내AS", "가", "그", "있는"]

        for (const items of DimensionArray(mainOrgResponse.list, 10)) {
          const promiseArray = items.map((item, i) => {
            return new Promise(async (resolve, reject) => {
              try {
                const keywordResponse = await searchKeywordCategory({ keyword: item.productName })
                // console.log("keywordResponse", keywordResponse.nluTerms)
                if (keywordResponse.intersectionTerms) {
                  titleArray.push(
                    ...keywordResponse.intersectionTerms
                      .map((mItem) => regExp_test(mItem))
                      .filter(
                        (fItem) =>
                          fItem.length > 0 &&
                          !isNumber(fItem) &&
                          korean.test(fItem) &&
                          !exceptWord.includes(fItem)
                      )
                  )
                }
                if (keywordResponse.terms) {
                  titleArray.push(
                    ...keywordResponse.terms
                      .map((mItem) => regExp_test(mItem))
                      .filter(
                        (fItem) =>
                          fItem.length > 0 &&
                          !isNumber(fItem) &&
                          korean.test(fItem) &&
                          !exceptWord.includes(fItem)
                      )
                  )
                }
                resolve()
              } catch (e) {
                reject(e)
              }
            })
          })
          await Promise.all(promiseArray)
        }

        titleArray = _.uniq(titleArray)

        let keywordSocreArr = []

        for (const items of DimensionArray(titleArray, 10)) {
          const promiseArray = items.map((item, i) => {
            return new Promise(async (resolve, reject) => {
              try {
                const kewyordOrgResponse = await searchKeywordCategory({ keyword: item })

                let keywordOrg = kewyordOrgResponse.cmpOrg
                const score = GetKeywordScore(mainOrg, keywordOrg)
                if (score >= 50) {
                  keywordSocreArr.push({
                    keyword: item,
                    score,
                  })
                }
                resolve()
              } catch (e) {
                reject(e)
              }
            })
          })
          await Promise.all(promiseArray)
        }

        return keywordSocreArr.sort((a, b) => b.score - a.score).map((item) => item.keyword)
      } catch (e) {
        logger.error(`SearchNaverProductKeywrod: ${e}`)
        return []
      }
    },
    SearchNaverTagKeyword: async (parnet, { keyword }, { logger }) => {
      try {
        const mainOrgResponse = await searchKeywordCategory({ keyword })

        console.log("mainOrgResponse", mainOrgResponse)
        let manuTags = []
        mainOrgResponse.list.map((item) => {
          if (item.manuTag.length > 0) {
            manuTags.push(...item.manuTag.split(","))
          }
        })
        return _.uniq(manuTags)
      } catch (e) {
        logger.error(`SearchNaverTagKeyword: ${e}`)
        return []
      }
    },
    OptimizationProductName: async (paretn, { title }, { logger }) => {
      try {
        let titleArray = []
        const keywordResponse = await searchKeywordCategory({ keyword: title })
        if (keywordResponse.intersectionTerms) {
          titleArray.push(...keywordResponse.intersectionTerms.map((mItem) => regExp_test(mItem)))
        }
        if (keywordResponse.terms) {
          titleArray.push(...keywordResponse.terms.map((mItem) => regExp_test(mItem)))
        }

        return titleArray.join(" ")
      } catch (e) {
        logger.error(`OptimizationProductName: ${e}`)
        return title
      }
    },
  },
}

module.exports = resolvers
