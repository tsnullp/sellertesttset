const userResolver = require("./userResolver")
const categorySourcingResolver = require("./categorySourcingResolver")
const taobaoResolver = require("./taobaoResolver")
const { marketAPIResolver } = require("./marketAPIResolver")
const marketBasicResolver = require("./marketBasicResolver")
const productResolver = require("./productResolver")
const productTempResolver = require("./productTempResolver")
const keywordResolver = require("./keywordResolver")
const categoryResolver = require("./categoryResolver")
const marketAutoResolver = require("./marketAutoResolver")
const vatResolver = require("./vatResolver")
const cookieResolver = require("./cookieResolver")
const brandResolver = require("./brandResolver")
const translateResolver = require("./translateResolver")
const batchResolver = require("./batchResolver")
const mallResolver = require("./mallResolver")
const shippingPriceResolver = require("./shippingPriceResolver")
const lowestPriceResolver = require("./lowestPriceResolver")
const soEasyResolver = require("./soEasyResolver")
const auctionResolver = require("./auctionResolver")
const amazonResolver = require("./amazonResolver")
const aliExpressResolver = require("./aliExpressResolver")

module.exports = {
  Query: {
    ...userResolver.Query,
    ...categorySourcingResolver.Query,
    ...taobaoResolver.Query,
    ...marketAPIResolver.Query,
    ...marketBasicResolver.Query,
    ...productResolver.Query,
    ...productTempResolver.Query,
    ...keywordResolver.Query,
    ...categoryResolver.Query,
    ...marketAutoResolver.Query,
    ...vatResolver.Query,
    ...cookieResolver.Query,
    ...brandResolver.Query,
    ...translateResolver.Query,
    ...batchResolver.Query,
    ...mallResolver.Query,
    ...shippingPriceResolver.Query,
    ...lowestPriceResolver.Query,
    ...soEasyResolver.Query,
    ...auctionResolver.Query,
    ...amazonResolver.Query,
    ...aliExpressResolver.Query,

  },
  Mutation: {
    ...userResolver.Mutation,
    ...categorySourcingResolver.Mutation,
    ...taobaoResolver.Mutation,
    ...marketAPIResolver.Mutation,
    ...marketBasicResolver.Mutation,
    ...productResolver.Mutation,
    ...productTempResolver.Mutation,
    ...keywordResolver.Mutation,
    ...categoryResolver.Mutation,
    ...marketAutoResolver.Mutation,
    ...vatResolver.Mutation,
    ...cookieResolver.Mutation,
    ...brandResolver.Mutation,
    ...translateResolver.Mutation,
    ...batchResolver.Mutation,
    ...mallResolver.Mutation,
    ...shippingPriceResolver.Mutation,
    ...lowestPriceResolver.Mutation,
    ...soEasyResolver.Mutation,
    ...auctionResolver.Mutation,
    ...amazonResolver.Mutation,
    ...aliExpressResolver.Mutation,
  }
}
