const {
  relatedKeyword,
  relatedKeywordOnly,
  searchViews,
  searchSomeTrend,
  searchSomeTrendOnly,
  searchCategoryKeyword,
} = require("../puppeteer/keyword")
const { sleep } = require("../../lib/usrFunc")
const startBrowser = require("../puppeteer/startBrowser")
const smartStoreCategory = require("../../components/organisms/CategoryForm/category")
const _ = require("lodash"
)
const resolvers = {
  Query: {
    RelatedKeywordsOnly: async (parent, { keywords }, { logger }) => {
      try {
        const arr = []

        const browser = await startBrowser()
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0)
        await page.setJavaScriptEnabled(true)

        const sellerboardCookies = global.sellerboardCookies

        if (sellerboardCookies && Array.isArray(sellerboardCookies)) {
          for (const item of sellerboardCookies) {
            await page.setCookie(item)
          }
        } else {
          await page.goto("https://www.sellerboard.co.kr/account/login/", {
            waitUntil: "networkidle0",
          })

          const opts = {
            delay: 6 + Math.floor(Math.random() * 2),
          }
          await page.tap("#username")
          await page.type("#username", "jts0509", opts)
          await page.tap("#password")
          await page.type("#password", "xotjr313#!#", opts)

          await page.keyboard.press(String.fromCharCode(13))
          await page.waitFor(1000)
          const cookies2 = await page.cookies("https://www.sellerboard.co.kr")

          global.sellerboardCookies = cookies2
        }

        await page.goto("about:blank")
        await page.close()
        await browser.close()

        const promiseFun = async (item) => {
          const response = await relatedKeywordOnly({ page, keyword: item.trim() })

          arr.push({
            keyword: item,
            relatedKeyword:
              response && Array.isArray(response) ? response.filter((item) => item.length > 0) : [],
          })
        }

        const arrayPromises = keywords.map(promiseFun)
        await Promise.all(arrayPromises)

        return arr
        // return arr.map(item => {
        //   return {
        //     ...item,
        //     total: item.mpcqry + item.mmoqry,
        //     compete: (item.item_num / (item.mpcqry + item.mmoqry)).toFixed(3)
        //   }
        // })
      } catch (e) {
        logger.error(`RelatedKeywordsOnly: ${e}`)
        return []
      }
    },

    GetKeywordViews: async (parent, { keywords }, { logger }) => {
      try {
        const arr = []
        const arrayPromises = keywords.map(async (item) => {
          await sleep(100 + Math.floor(Math.random() * 1000))
          const response = await searchViews({ keyword: item.trim() })
          arr.push(response)
        })
        await Promise.all(arrayPromises)
        return arr.map((item) => {
          return {
            ...item,
            total: item.mpcqry + item.mmoqry,
            compete: (item.item_num / (item.mpcqry + item.mmoqry)).toFixed(3),
          }
        })
      } catch (e) {
        logger.error(`GetKeywordViews: ${e}`)
        return []
      }
    },
    GetCategoryKeywords: async (parent, { category }, { logger }) => {
      try {
        const response = await searchCategoryKeyword({ category })
        return response
      } catch (e) {
        logger.error(`GetKeywordViews: ${e}`)
        return []
      }
    },
    RelatedKeywordOnly: async (parent, { keyword }, { logger }) => {
      try {
        const browser = await startBrowser()
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0)
        await page.setJavaScriptEnabled(true)

        const sellerboardCookies = global.sellerboardCookies

        if (sellerboardCookies && Array.isArray(sellerboardCookies)) {
          for (const item of sellerboardCookies) {
            await page.setCookie(item)
          }
        } else {
          await page.goto("https://www.sellerboard.co.kr/account/login/", {
            waitUntil: "networkidle0",
          })

          const opts = {
            delay: 6 + Math.floor(Math.random() * 2),
          }
          await page.tap("#username")
          await page.type("#username", "jts0509", opts)
          await page.tap("#password")
          await page.type("#password", "xotjr313#!#", opts)

          await page.keyboard.press(String.fromCharCode(13))
          await page.waitFor(1000)
          const cookies2 = await page.cookies("https://www.sellerboard.co.kr")

          global.sellerboardCookies = cookies2
        }
        await browser.close()

        const response = await relatedKeywordOnly({ keyword })
        return response
      } catch (e) {
        logger.error(`RelatedKeywordOnly: ${e}`)
        return []
      }
    },
    GetKeyword: async (parent, { keyword }, { logger }) => {
      try {
        const response = await searchViews({ keyword: keyword.trim() })
        return {
          keyword,
          item_num: response.item_num,
          mpcqry: response.mpcqry,
          mmoqry: response.mmoqry,
          total: response.mpcqry + response.mmoqry,
          compete: (response.item_num / (response.mpcqry + response.mmoqry)).toFixed(3),
        }
      } catch (e) {
        logger.error(`GetKeyword: ${e}`)
        return null
      }
    },
    GetCategorySales: async (parent, {sort}, {model: {NaverFavoriteItem}, logger}) => {

      let sortQuery = null
      switch(sort){
        case "1":
          sortQuery = {count: -1}
          break
        case "2":
          sortQuery = {count: 1}
          break
        case "3":
          sortQuery = {purchaseCnt: -1}
          break
        case "4":
          sortQuery = {purchaseCnt: 1}
          break
        case "5":
          sortQuery = {recentSaleCount: -1}
          break
        case "6":
          sortQuery = {recentSaleCount: 1}
          break
        default:
          sortQuery = {count: -1}
          break
      }
      try {
        let favoriteItems = await NaverFavoriteItem.aggregate([
          {
            $match: {
              // originArea: {$regex: `.*중국.*`}
              $or: [{originArea: {$regex: `.*중국.*`}}, {originArea: {$regex: `.*CHINA.*`}}]
            }
          },
          {
            $group: {
              _id: "$categoryId",
              count: {$sum: 1},
              purchaseCnt: {$sum: "$purchaseCnt"},
              recentSaleCount: {$sum: "$recentSaleCount"},
            }
          },
          {
            $sort: sortQuery
          }
          
          ])
          
        favoriteItems = favoriteItems.map(item => {
          try {
            const category = _.find(smartStoreCategory, {"카테고리코드": Number(item._id)})
        
            if(category){
              return {
                ...item,
               category1: category.대분류, 
               category2: category.중분류, 
               category3: category.소분류, 
               category4: category.세분류, 
              }
            } else {
              return item
            }
          } catch(e){
            return item
          }
          
          
        })
        return favoriteItems
      } catch (e) {
        logger.error(`GetCategorySales: ${e}`)
        return []
      }
    }
  },
  Mutation: {
    RelatedKeyword: async (parent, { keyword }, { logger }) => {
      try {
        const response = await relatedKeyword({ keyword })

        return response
      } catch (e) {
        logger.error(`RelatedKeyword: ${e}`)
        return []
      }
    },
    SentimentRank: async (parent, { keyword }, { logger }) => {
      try {
        const response = await searchSomeTrend({ keyword })

        return response
      } catch (e) {
        logger.error(`RelatedKeyword: ${e}`)
        return []
      }
    },
    RelatedKeywordOnly: async (parent, { keyword }, { logger }) => {
      try {
        const response = await relatedKeywordOnly({ keyword })

        return response
      } catch (e) {
        logger.error(`RelatedKeyword: ${e}`)
        return []
      }
    },
    SentimentRankOnly: async (parent, { keyword }, { logger }) => {
      try {
        const response = await searchSomeTrendOnly({ keyword })

        return response
      } catch (e) {
        logger.error(`RelatedKeyword: ${e}`)
        return []
      }
    },
    SetFavoriteKeyword: async (
      parent,
      { keywordID, favorite },
      { req, model: { KeywordFavorite }, logger }
    ) => {
      try {
        if (favorite) {
          await KeywordFavorite.create({
            userID: req.user.adminUser,
            keywordID,
          })
        } else {
          await KeywordFavorite.deleteOne({
            userID: req.user.adminUser,
            keywordID,
          })
        }

        return true
      } catch (e) {
        logger.error(`SetFavoriteKeyword: ${e}`)
        return false
      }
    },
   
  },
}

module.exports = resolvers
