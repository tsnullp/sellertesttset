const searchNaverKeyword = require("../puppeteer/searchNaverKeyword")
const searchInterParkKeyword = require("../puppeteer/searchInterParkKeyword")
const searchGmarketKeyword = require("../puppeteer/searchGmarketKeyword")
const searchAuctionKeyword = require("../puppeteer/searchAuctionKeyword")
const searchWemakeKeyword = require("../puppeteer/searchWemakeKeyword")
const searchTmonKeyword = require("../puppeteer/searchTmonKeyword")

const resolvers = {
  Query: {
    GetNaverCategory: async (parent, {title}, {req, logger}) => {
      try {
        let categoryArray = []

        for(const item of title) {
          let categoryName = ``
          const naverCategory = await searchNaverKeyword({ title: item })
          if(naverCategory){
            if(naverCategory.category4Name){
              categoryName = naverCategory.category4Name
            } else {
              categoryName = naverCategory.category3Name            
            }
          }
          categoryArray.push(
            {
              title: item,
              categoryName
            }
          )
        }

        return categoryArray
      } catch (e) {
        logger.error(`GetNaverCategory: ${e}`)
        return []
      }
  
  
  
    }
  },
  Mutation: {
    GetCategoryWithTitle: async (parent, { title }, { req, logger }) => {
      try {
        const category = {}

        await Promise.all([
          new Promise(async (resolve, reject) => {
            try {
              category.naver = await searchNaverKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              category.interpark = await searchInterParkKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              category.gmarket = await searchGmarketKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              category.auction = await searchAuctionKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              category.wemaek = await searchWemakeKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
          new Promise(async (resolve, reject) => {
            try {
              category.tmon = await searchTmonKeyword({ title })
              resolve()
            } catch (e) {
              reject(e)
            }
          }),
        ])

        console.log("category", category)
        // const naverResponse = await searchNaverKeyword({ title })
        // console.log("naverResponse", naverResponse)
        // const interParkResponse = await searchInterParkKeyword({ title })
        // console.log("interParkResponse", interParkResponse)
        // const gmarketResponse = await searchGmarketKeyword({ title })
        // console.log("gmarketResponse", gmarketResponse)
        // const auctionKeyword = await searchAuctionKeyword({ title })
        // console.log("auctionKeyword", auctionKeyword)
        return true
      } catch (e) {
        logger.error(`GetCategoryWithTitle: ${e}`)
        return false
      }
    },   
  }
}

module.exports = resolvers
