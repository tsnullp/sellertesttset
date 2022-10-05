const mongoose = require("mongoose")
const moment = require("moment")

const SellerBoardTokenSchema = mongoose.Schema({
  token: String,
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("SellerBoardToken", SellerBoardTokenSchema)
