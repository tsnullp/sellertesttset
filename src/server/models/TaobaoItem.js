const mongoose = require("mongoose")
const moment = require("moment")

const TaobaoItem = mongoose.Schema({
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  marketType: Number, // 1. 네이버 2. 쿠팡
  index: {
    type: Number,
    default: 0
  },
  image: String,
  detail: String,
  price: String,
  dealCnt: String,
  shop: String,
  location: String,
  commentCount: String,
  shopGrade: {
    description: Number,
    service: Number,
    delivery: Number
  },
  shopLevel: [
    {
      String
    }
  ],
  isTmall: Boolean,
  sourcing: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("TaobaoItem", TaobaoItem)
