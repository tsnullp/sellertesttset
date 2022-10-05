const resolvers = {
  Query: {
    GetBrandList: async (parent, {}, { req, model: { Brand }, logger }) => {
      try {
        const brand = await Brand.find({ brand: { $ne: null } }, { brand: 1 })
        const banWord = await Brand.find({ userID: req.user.adminUser }, { banWord: 1 })
        const prohibit = await Brand.find({ prohibit: { $ne: null } }, { prohibit: 1 })
        return {
          brand: brand.map(item => {
            return {
              _id: item._id,
              word: item.brand
            }
          }),
          banWord: banWord.map(item => {
            return {
              _id: item._id,
              word: item.banWord
            }
          }),
          prohibit: prohibit.map(item => {
            return {
              _id: item._id,
              word: item.prohibit
            }
          }),
        }
      } catch (e) {
        logger.error(`GetBrandList: ${e}`)
        return {
          brand: [],
          banWord: []
        }
      }
    }
  },
  Mutation: {
    UpdateBanWord: async (parent, { _id, word }, { req, model: { Brand }, logger }) => {
      try {
        console.log("_id", _id)
        if (!_id) {
          await Brand.create({
            userID: req.user.adminUser,
            banWord: word
          })
        } else {
          await Brand.findOneAndUpdate(
            {
              userID: req.user.adminUser,
              _id
            },
            {
              $set: {
                userID: req.user.adminUser,
                banWord: word
              }
            }
          )
        }

        return true
      } catch (e) {
        logger.error(`UpdateBanWord: ${e}`)
        return false
      }
    },
    DeleteBanWord: async (parent, { _id }, { req, model: { Brand }, logger }) => {
      try {
        await Brand.deleteOne({
          userID: req.user.adminUser,
          _id
        })
        return true
      } catch (e) {
        logger.error(`UpdateBanWord: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers
