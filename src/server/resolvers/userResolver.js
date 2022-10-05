const { authenticateGoogle, authenticateNaver } = require("./../setup/passport")

const resolvers = {
  Query: {
    hello: () => "world",
    getAccountList: async (parent, props, { req, model: { User }, logger }) => {
      try {
        const user = await User.find({
          adminUser: req.user.adminUser,
          grade: "2"
        })
        return user
      } catch (e) {
        logger.error(`getAccountList ${e.message}`)
        return []
      }
    }
  },
  Mutation: {
    isLogin: async (parent, props, { req, model: { User } }) => {
      if (req.user) {
        const user = await User.findOne({ _id: req.user.adminUser })

        switch (user.grade) {
          case "1":
            return {
              _id: user._id,
              adminUser: user._id,
              nickname: user.nickname,
              avatar: user.avatar,
              email: user.email,
              token: user.token,
              admin: user.admin,
              grade: user.grade
            }
          case "2": {
            const adminUser = await User.findOne({
              _id: user.adminUser
            })
            return {
              _id: user._id,
              adminUser: adminUser._id,
              nickname: user.nickname,
              avatar: user.avatar,
              email: user.email,
              token: user.token,
              admin: user.admin,
              grade: user.grade
            }
          }
          default:
            return {
              _id: user._id,
              adminUser: null,
              nickname: user.nickname,
              avatar: user.avatar,
              email: user.email,
              token: user.token,
              admin: user.admin,
              grade: user.grade
            }
        }
        // return await User.findUser(req.user)
      } else {
        return false
      }
    },
    authGoogle: async (parent, { input: { accessToken } }, { req, res, model: { User } }) => {
      req.body = {
        ...req.body,
        access_token: accessToken
      }

      try {
        const { data, info } = await authenticateGoogle(req, res)

        if (data) {
          // console.log("_json", data.profile._json)
          // console.log("profile", data.profile)

          const { id, email } = data.profile._json
          const user = await User.findOrCreate(email, id, "google", data.profile)

          switch (user.grade) {
            case "1":
              return {
                _id: user._id,
                adminUser: user._id,
                nickname: user.nickname,
                avatar: user.avatar,
                email: user.email,
                token: user.token,
                admin: user.admin,
                grade: user.grade,
                error: ""
              }
            case "2": {
              const adminUser = await User.findOne({
                _id: user.adminUser
              })
              return {
                _id: user._id,
                adminUser: adminUser._id,
                nickname: user.nickname,
                avatar: user.avatar,
                email: user.email,
                token: user.token,
                admin: user.admin,
                grade: user.grade,
                error: ""
              }
            }
            default:
              return {
                _id: user._id,
                adminUser: null,
                nickname: user.nickname,
                avatar: user.avatar,
                email: user.email,
                token: user.token,
                admin: user.admin,
                grade: user.grade,
                error: ""
              }
          }
        }
        if (info) {
          return {
            error: info.oauthError.data
          }
        }
        return Error("server error")
      } catch (error) {
        return error
      }
    },
    authNaver: async (parent, { input: { accessToken } }, { req, res }) => {
      req.query = {
        ...req.query,
        access_token: accessToken
      }

      try {
        const { data, info } = await authenticateNaver(req, res)

        if (data) {
        }
        if (info) {
          console.log(info)
          switch (info.code) {
            case "ETIMEDOUT":
              return new Error("Failed to reach Naver: Try Again")
            default:
              return new Error("something went wrong")
          }
        }
        return Error("server error")
      } catch (error) {
        return error
      }
    },
    addAccount: async (parent, { email }, { req, model: { User }, logger }) => {
      try {
        const user = await User.findOne({
          email,
          grade: null,
          adminUser: null
        })

        if (user) {
          await User.findOneAndUpdate(
            {
              email
            },
            {
              $set: {
                grade: "2",
                adminUser: req.user.adminUser
              }
            }
          )
          return true
        } else {
          return false
        }
      } catch (e) {
        logger.error(`addAccount ${e.message}`)
        return false
      }
    },
    deleteAccount: async (parent, { email }, { req, model: { User }, logger }) => {
      try {
        await User.findOneAndUpdate(
          {
            email,
            grade: "2",
            adminUser: req.user.adminUser
          },
          {
            $set: {
              grade: null,
              adminUser: null
            }
          }
        )
        return true
      } catch (e) {
        logger.error(`deleteAccount ${e.message}`)
        return false
      }
    }
  }
}

module.exports = resolvers
