const resolvers = {
  Query: {
    GetSoEasyPasssword: async (parent, {}, {req, model: {User}, logger}) => {
      try {
        
        const response = await User.findOne({
          _id: req.user._id
        })
        if(response){
          return {
            email: response.email,
            password: response.password
          }
        } else {
          return null
        }
      } catch (e) {
        logger.error(`GetSoEasyPasssword: ${e.message}`)
        return null
      }
    }
  },
  Mutation: {
    SetSoEasyPassword: async (parent, {password}, {req, model: {User}, logger}) => {
      try {
        await User.findOneAndUpdate(
          {
            _id: req.user._id
          }, 
          {
            $set: {
              password
            }
          }
        )
        return true
      } catch (e) {
        logger.error(`SetSoEasyPassword: ${e.message}`)
        return false
      }
    }
  }
}

module.exports = resolvers