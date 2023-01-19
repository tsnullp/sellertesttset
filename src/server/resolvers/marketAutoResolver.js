const cafe24 = require("../puppeteer/cafe24")
const cafe24Token = require("../puppeteer/cafe24Token")
const interpark = require("../puppeteer/interpark")
const Market = require("../models/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const resolvers = {
  Query: {},
  Mutation: {
    Cafe24Auto: async (parent, {}, { req, logger }) => {
      try {
        const market = await Market.aggregate([
          {
            $match: {
              userID: {
                $in: [ObjectId(req.user.adminUser)]
              }
            }
          }
        ])
       
        setTimeout(async() => {
          for (const item of market) {
            if (item && item.cafe24 && item.cafe24.mallID && item.cafe24.password) {
              await cafe24({ mallID: item.cafe24.mallID, password: item.cafe24.password })
            }
          }
        }, 3000)
        
        return true
      } catch (e) {
        logger.error(`Cafe24Auto: ${e}`)
        return false
      }
    },
    Cafe24Token: async (parent, {}, { req, logger }) => {
      try {
        cafe24Token()
        
        return true
      } catch (e) {
        logger.error(`Cafe24Token: ${e}`)
        return false
      }
    },
    InterparkAuto: async (parent, {}, { req, logger }) => {
      try {
        const market = await Market.aggregate([
          {
            $match: {
              userID: {
                $in: [ObjectId(req.user.adminUser)]
              }
            }
          }
        ])
        
        for (const item of market) {
          if (
            item &&
            item.cafe24 &&
            item.cafe24.mallID &&
            item.cafe24.password &&
            item.interpark &&
            item.interpark.userID &&
            item.interpark.password
          ) {
            await interpark({
              cafe24MallID: item.cafe24.mallID,
              cafe24Password: item.cafe24.password,
              userID: item.interpark.userID,
              password: item.interpark.password
            })
          }
        }
        return true
      } catch (e) {
        logger.error(`Cafe24Auto: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers
