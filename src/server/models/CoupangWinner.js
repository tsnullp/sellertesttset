const mongoose = require("mongoose")
const moment = require("moment")

const CoupangWinner = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId
  },
  writerID: {
    type: mongoose.Schema.Types.ObjectId
  },
  CoupangID: {
    type: mongoose.Schema.Types.ObjectId
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId
  },
  productNo: String, // 네이버
  shippingWeight: Number,
  state: Number, // 1: 준비중 2: 업로드 완료, 3: 에러 4: 재등록중
  title: String,
  detailUrl: String,
  html: String,
  detailImages: [String],
  sellerTags: [String],
  subPrice: Number,
  isClothes: Boolean,
  isShoes: Boolean,
  error: String,
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  },
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("CoupangWinner", CoupangWinner)
