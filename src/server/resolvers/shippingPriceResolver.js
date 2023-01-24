const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const resolvers = {
  Query: {
    GetAddPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 1,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetAddPriceList: ${e}`)
        return []
      }
    },
    GetIherbAddPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 4,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetAddPriceList: ${e}`)
        return []
      }
    },
    GetAliAddPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 6,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetAddPriceList: ${e}`)
        return []
      }
    },
    GetAmazonJPAddPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 10,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetAddPriceList: ${e}`)
        return []
      }
    },
    GetShippingPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 2,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPriceList: ${e}`)
        return []
      }
    },
    GetIherbShippingPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 5,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPriceList: ${e}`)
        return []
      }
    },

    GetAliShippingPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 7,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPriceList: ${e}`)
        return []
      }
    },
    GetAmazonJPShippingPriceList: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 11,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPriceList: ${e}`)
        return []
      }
    },
    GetMargin: async (parent, {}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              type: 3,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list[0].title
      } catch (e) {
        logger.error(`GetMargin: ${e}`)
        return 0
      }
    },
  },
  Mutation: {
    SetAddPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 1,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetIherbAddPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 4,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetAliAddPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 6,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetAmazonJPAddPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 10,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    DeleteAddPrice: async (parent, { _id }, { req, model: { ShippingPrice }, logger }) => {
      try {
        await ShippingPrice.deleteOne({
          _id,
          userID: req.user.adminUser,
        })
        return true
      } catch (e) {
        logger.error(`DeleteAddPrice: ${e}`)
        return false
      }
    },
    SetShippingPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
              type: 2,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 2,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetIherbShippingPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
              type: 5,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 5,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetAliShippingPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
              type: 7,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 7,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    SetAmazonJPShippingPrice: async (
      parent,
      { _id, title, price },
      { req, model: { ShippingPrice }, logger }
    ) => {
      try {
        if (_id) {
          await ShippingPrice.findOneAndUpdate(
            {
              _id,
              userID: req.user.adminUser,
              type: 11,
            },
            {
              $set: {
                title,
                price,
              },
            }
          )
        } else {
          await ShippingPrice.create({
            userID: req.user.adminUser,
            type: 11,
            title,
            price,
          })
        }
        return true
      } catch (e) {
        logger.error(`SetAddPrice: ${e}`)
        return false
      }
    },
    DeleteShippingPrice: async (parent, { _id }, { req, model: { ShippingPrice }, logger }) => {
      try {
        await ShippingPrice.deleteOne({
          _id,
          userID: req.user.adminUser,
          // type: 2
        })
        return true
      } catch (e) {
        logger.error(`DeleteAddPrice: ${e}`)
        return false
      }
    },
    GetShippingPrice: async (parent, {userID}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser
        console.log("user", user)
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: ObjectId(user),
              type: 2,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPrice: ${e}`)
        return []
      }
    },
    GetUSAShippingPrice: async (parent, {userID}, { req, model: { ShippingPrice }, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser
        const list = await ShippingPrice.aggregate([
          {
            $match: {
              userID: ObjectId(user),
              type: 5,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])
        return list
      } catch (e) {
        logger.error(`GetShippingPrice: ${e}`)
        return []
      }
    },
    SetMargin: async (parent, { margin }, { req, model: { ShippingPrice }, logger }) => {
      try {
        await ShippingPrice.findOneAndUpdate(
          {
            userID: req.user.adminUser,
            type: 3,
          },
          {
            $set: {
              userID: req.user.adminUser,
              type: 3,
              title: margin,
            },
          },
          { upsert: true, new: true }
        )

        return true
      } catch (e) {
        logger.error(`SetMargin: ${e}`)
        return false
      }
    },
    DeleteAllWeight: async (parent, {userID}, {req, model: {ShippingPrice}, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser

        await ShippingPrice.deleteMany({
          userID: ObjectId(user),
          type: 2
        })

        return true
      } catch (e) {
        logger.error(`DeleteAllWeight: ${e}`)
        return false
      }
    },
    SetAllWeight: async (parent, {userID, input}, {req, model: {ShippingPrice}, logger }) => {
      try {
        const user = userID ? userID : req.user.adminUser
        for(const item of input) {
          try {
            await ShippingPrice.findOneAndUpdate(
              {
                userID: ObjectId(user),
                type: 2,
                title: Number(item.weight)
              },
              {
                $set: {
                  userID: ObjectId(user),
                  type: 2,
                  title: Number(item.weight.replace("kg", "").replace("KG", "")),
                  price: Number(item.price.replace(/,/, "")),
                }
              },
              {
                upsert: true, new: true
              }
            )
          } catch (e){
            console.log("000", e)
          }
        }
        return true
      } catch (e) {
        logger.error(`SetAllWeight: ${e}`)
        return false
      }
    }
  },
}

module.exports = resolvers
