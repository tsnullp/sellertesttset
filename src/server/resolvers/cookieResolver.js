const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const resolvers = {
  Query: {
    GetCookie: async (parent, {}, { req, model: { Cookie }, logger }) => {
      try {
        const response = await Cookie.findOne({
          userID: ObjectId(req.user.adminUser)
        })
        return response.cookie
      } catch (e) {
        logger.error(`GetCookie: ${e}`)
        return ""
      }
    }
  },
  Mutation: {
    SetCookie: async (parent, { cookie }, { req, model: { Cookie }, logger }) => {
      try {
        await Cookie.findOneAndUpdate(
          {
            userID: ObjectId(req.user.adminUser)
          },
          {
            $set: {
              userID: ObjectId(req.user.adminUser),
              cookie
            }
          },
          {
            upsert: true
          }
        )
        return true
      } catch (e) {
        logger.error(`SetCookie: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers
