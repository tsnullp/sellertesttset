const mongoose = require("mongoose")
const moment = require("moment")

const TaobaoKeywordItem = mongoose.Schema({
  goodID: String,
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  image: String,
  detail: String,
  price: String,
  dealCnt: String,
  shop: String,
  location: String,
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  },
  keyword: String
})

module.exports = mongoose.model("TaobaoKeywordItem", TaobaoKeywordItem)
