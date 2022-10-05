const mongoose = require("mongoose")
const moment = require("moment")

const OtherSellerHistorySchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId
  },
  itemId: Number,
  vendorItemId: Number,
  myPrice: Number,
  winnerPrice: Number,
  winnerVendorName: String,
  
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("OtherSellerHistory", OtherSellerHistorySchema)
