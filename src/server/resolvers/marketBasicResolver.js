const { Outbound, ReturnShippingCenter } = require("../api/Market")
const resolvers = {
  Query: {
    MarketBasicInfo: async (parent, {}, { req, model: { Market }, logger }) => {
      try {
        if (!req.user) {
          return {
            taobao: null,
            coupang: null,
            cafe24: null,
            interpark: null
          }
        }

        const market = await Market.findOne({
          userID: req.user.adminUser
        })

        const outbound = await Outbound({ userID: req.user.adminUser })

        const returnShippingCenter = await ReturnShippingCenter({ userID: req.user.adminUser })

        const outboundObj = {}
        if (outbound && outbound.content.length > 0) {
          const temp = outbound.content.filter(item => item.usable === true)
          if (temp.length > 0) {
            outboundObj.outboundShippingPlaceCode = temp[0].outboundShippingPlaceCode
            outboundObj.shippingPlaceName = temp[0].shippingPlaceName
            outboundObj.placeAddresses = temp[0].placeAddresses
            outboundObj.remoteInfos = temp[0].remoteInfos
          }
        }
        const returnShippingCenterObj = {}
        if (returnShippingCenter && returnShippingCenter.data.content.length > 0) {
          const temp = returnShippingCenter.data.content.filter(item => item.usable === true)

          if (temp.length > 0) {
            returnShippingCenterObj.returnCenterCode = temp[0].returnCenterCode
            returnShippingCenterObj.shippingPlaceName = temp[0].shippingPlaceName
            returnShippingCenterObj.deliverCode = temp[0].deliverCode
            returnShippingCenterObj.deliverName = temp[0].deliverName
            returnShippingCenterObj.placeAddresses = temp[0].placeAddresses
          }
        }

        if (market) {
          market.coupang.outbound = outboundObj
          market.coupang.returnShippingCenter = returnShippingCenterObj
          return market
        } else {
          return {
            taobao: null,
            coupang: null,
            cafe24: null,
            interpark: null
          }
        }
      } catch (e) {
        logger.error(`CoupangBasicInfo: ${e}`)
        return {
          taobao: null,
          coupang: null,
          cafe24: null,
          interpark: null
        }
      }
    },

    BasicInfo: async (parent, {}, { req, model: { Basic }, logger }) => {
      let returnValue = {
        topImage: null,
        bottomImage: null,
        clothImage: null,
        shoesImage: null,
        afterServiceInformation: null,
        afterServiceContactNumber: null
      }
      try {
        if (!req.user) {
          return returnValue
        }

        const basic = await Basic.findOne({
          userID: req.user.adminUser
        })

        if (basic) {
          return basic
        } else {
          return returnValue
        }
      } catch (e) {
        logger.error(`BasicInfo: ${e}`)
        return returnValue
      }
    },
   
  },
  Mutation: {
    SetTaobaoBasicInfo: async (
      parent,
      { loginID, password, imageKey },
      { req, model: { Market }, logger }
    ) => {
      try {
        if (!req.user) {
          return false
        }
        await Market.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              taobao: {
                loginID,
                password,
                imageKey
              }
            }
          },
          { upsert: true }
        )
        return true
      } catch (e) {
        logger.error(`SetTaobaoBasicInfo: ${e}`)
        return false
      }
    },
    SetCoupangBasicInfo: async (
      parent,
      {
        vendorUserId,
        vendorId,
        accessKey,
        secretKey,
        deliveryCompanyCode,
        deliveryChargeType,
        deliveryCharge,
        deliveryChargeOnReturn,
        returnCharge,
        outboundShippingTimeDay,
        invoiceDocument,
        maximumBuyForPerson,
        maximumBuyForPersonPeriod
      },
      { req, model: { Market }, logger }
    ) => {
      try {
        if (!req.user) {
          return false
        }

        await Market.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              coupang: {
                vendorUserId,
                vendorId,
                accessKey,
                secretKey,
                deliveryCompanyCode,
                deliveryChargeType,
                deliveryCharge,
                deliveryChargeOnReturn,
                returnCharge,
                outboundShippingTimeDay,
                invoiceDocument,
                maximumBuyForPerson,
                maximumBuyForPersonPeriod
              }
            }
          },
          { upsert: true }
        )
        return true
      } catch (e) {
        logger.error(`SetCoupangBasicInfo: ${e}`)
        return false
      }
    },
    SetCafe24BasicInfo: async (
      parent,
      { mallID, password, shop_no },
      { req, model: { Market }, logger }
    ) => {
      try {
        if (!req.user) {
          return false
        }
        await Market.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              cafe24: {
                mallID,
                password,
                shop_no
              }
            }
          },
          { upsert: true }
        )
        return true
      } catch (e) {
        logger.error(`BasicInfo: ${e}`)
        return false
      }
    },
    SetInterParkBasicInfo: async (
      parent,
      { userID, password },
      { req, model: { Market }, logger }
    ) => {
      try {
        if (!req.user) {
          return false
        }
        await Market.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              interpark: {
                userID,
                password
              }
            }
          },
          { upsert: true }
        )
        return true
      } catch (e) {
        logger.error(`SetInterParkBasicInfo: ${e}`)
        return false
      }
    },
    SetBasicInfo: async (
      parent,
      {
        afterServiceInformation,
        afterServiceContactNumber,
        topImage,
        bottomImage,
        clothImage,
        shoesImage,
        kiprisInter
      },
      { req, model: { Basic }, logger }
    ) => {
      try {
        if (!req.user) {
          return false
        }

        await Basic.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              afterServiceInformation,
              afterServiceContactNumber,
              topImage,
              bottomImage,
              clothImage,
              shoesImage,
              kiprisInter
            }
          },
          {
            upsert: true
          }
        )
        return true
      } catch (e) {
        logger.error(`SetBasicInfo: ${e}`)
        return false
      }
    },
    GetSubPrice: async (parent, {}, { req, model: {Basic}, logger}) => {
      try {
        const basic = await Basic.findOne(
          {
            userID: req.user.adminUser
          }
        )

        return basic && basic.subPrice && basic.subPrice > 0 ? basic.subPrice : 500
      } catch (e) {
        logger.error(`GetSubPrice: ${e}`)
        return 500
      }
    },
    SetSubPrice: async (parent, {subPrice}, {req, model: {Basic}, logger} ) => {
      try {
        await Basic.findOneAndUpdate(
          {
            userID: req.user.adminUser
          },
          {
            $set: {
              subPrice
            }
          }
        )
        return true
      } catch(e) {
        logger.error(`SetSubPrice: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers
