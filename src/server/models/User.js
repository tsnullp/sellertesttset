const mongoose = require("mongoose")
const jsonwebtoken = require("jsonwebtoken")
require("../setup/config")

const UserSchema = mongoose.Schema({
  adminUser: {
    type: mongoose.Schema.Types.ObjectId
  },
  grade: {
    type: String
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  nickname: {
    type: String,
    trim: true
  },
  password:{
    type: String
  },
  admin: {
    type: Boolean,
    sparce: true
  },
  avatar: {
    type: String,
    sparce: true
  },
  providers: {
    type: [
      {
        provider: {
          type: String
        },
        id: {
          type: String
        },
        _id: false
      }
    ]
  }
})

// model methods
UserSchema.statics = {
  findByExternalID(provider, id) {
    return User.findOne({
      providers: {
        $elemMatch: { provider, id }
      }
    })
  },
  findByID(id) {
    return User.findOne({
      _id: id
    })
  },
  findByEmail(email) {
    return User.findOne({
      email
    })
  },
  newUserObj(provider, profile) {
    let newUser

    switch (provider) {
      case "google":
        newUser = {
          email: profile.emails[0].value,
          nickname: profile.name.givenName,
          providers: [
            {
              provider,
              id: profile.id
            }
          ],
          avatar: profile._json.picture
        }

        break

      default:
        break
    }

    return newUser
  },
  updateeUserObj(user, provider, profile) {
    let newUser = user

    switch (provider) {
      case "google":
        newUser = {
          email: profile.emails[0].value,
          nickname: profile.name.givenName,
          providers: [
            {
              provider,
              id: profile.id
            }
          ],
          avatar: profile._json.picture
        }

        break

      default:
        break
    }

    return newUser
  },
  createUser(provider, profile) {
    const newUser = this.newUserObj(provider, profile)
    if (newUser) {
      const user = new User(newUser)
      return user.save()
    }
    return null
  },
  updateUser(user, provider, profile) {
    const newUser = this.updateeUserObj(user, provider, profile)

    if (newUser) {
      const user = User.findOneAndUpdate(
        {
          email: newUser.email
        },
        {
          $set: {
            nickname: newUser.nickname,
            avatar: newUser.avatar
          }
        }
      )

      return user
    }
    return null
  },
  async findOrCreate(email, id, provider, profile) {
    try {
      let user

      if (email) user = await this.findByEmail(email)
      if (!user) user = await this.findByExternalID(provider, id)

      if (!user) {
        user = await this.createUser(provider, profile)
      } else {
        user = await this.updateUser(user, provider, profile)
      }

      const token = user.generateAuthToken()
      user.token = token
      return user
    } catch (e) {
      return Promise.reject(new Error(e))
    }
  },
  async findUser({ email }) {
    try {
      let user
      if (email) user = await this.findByEmail(email)
      if (user) {
        const token = user.generateAuthToken()
        user.token = token
      }

      return user
    } catch (e) {
      return Promise.reject(new Error(e))
    }
  }
}

// instance methods
UserSchema.methods = {
  toObj() {
    const userObj = this.toObject()

    return userObj
  },
  async generateAuthToken() {
    const user = this.toObj()
    const adminUser = await User.findOne({
      _id: user.adminUser
    })
    
    const token = jsonwebtoken.sign(
      {
        id: user._id,
        adminUser: adminUser ? adminUser._id : user._id,
        email: user.eamil,
        nickname: user.nickname,
        avatar: user.avatar,
        grade: user.grade,
        admin: !!user.admin
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "240h"
        // audience: process.env.JWT_AUDIENCE,
        // issuer: process.env.JWT_ISSUER
      }
    )

    return token
  }
}

// model
const User = mongoose.model("User", UserSchema)

module.exports = User
