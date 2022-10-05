const mongoose = require("mongoose")
const moment = require("moment")

const CoupangMall = mongoose.Schema({
  mallPcUrl: String,
  itemCount: Number,
  marketName: String,
  businessName: String,
  representativeName: String,
  csTell: String,
  businessNo: String,
  businessAddress: String,
  mailOrderNo: String,
  email: String,
  address: String,
  isDelete: Boolean,
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  },
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("CoupangMall", CoupangMall)
