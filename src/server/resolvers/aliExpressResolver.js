const findAliExpressDetailAPIsimple = require("../puppeteer/getAliExpressItemAPIsimple")
const {GetAliProduct} = require("../api/AliExpress")
const { AmazonAsin } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const resolvers = {
  Query: {
    GetAliExpressDetailAPI: async (parent, {url, title}, {req, model: {Product}, logger}) => {
      try {
        if(!url) {
          return null
        }
        const asin = AmazonAsin(url)
        if(!asin){
          return null
        }
        const product = await Product.findOne(
          {
            userID: ObjectId(req.user.adminUser),
            "basic.good_id": asin,
            isDelete: false
          }
        )
        if(product){
          return {
            isRegister: true
          }
        }
        const detailItem = await findAliExpressDetailAPIsimple({
          title,
          url,
          userID: req.user && req.user.adminUser ? req.user.adminUser : "5f0d5ff36fc75ec20d54c40b"
        })

        return detailItem
      } catch(e){
        logger.error(`GetAliExpressDetailAPI: ${e}`)
        return null
      }
    }
  },
  Mutation: {
    GetAliProduct: async (parent, {url}, {req, model: {}, logger}) => {
      try {
        const response = await GetAliProduct({url})
      
        const {descriptionModule, imageModule, priceModule, quantityModule, shippingModule, skuModule, specsModule, titleModule} = response.data

        console.log("descriptionModule - ", descriptionModule)
        console.log("imageModule - ", imageModule)
        console.log("priceModule - ", priceModule)
        console.log("quantityModule - ", quantityModule)
        console.log("shippingModule - ", shippingModule)
        console.log("skuModule - ", skuModule)
        console.log("specsModule - ", specsModule)
        console.log("titleModule - ", titleModule)
        return true
      } catch (e) {
        logger.error(`GetAliExpressDetailAPI: ${e}`)
        return null
      }
    }
  }
}

module.exports = resolvers