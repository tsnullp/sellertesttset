const mongoose = require("mongoose")

const AccountSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId
  },
  accountType: {
    type: Number,
    default: 0 // 1. 타오바오
  },
  loginID: String,
  password: String,
  cookies: [
    {
      name: String,
      value: String,
      domain: String,
      path: String,
      expires: Number,
      size: Number,
      httpOnly: Boolean,
      secure: Boolean,
      session: Boolean
    }
  ]
})

module.exports = mongoose.model("Account", AccountSchema)
