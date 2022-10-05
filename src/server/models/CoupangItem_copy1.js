const mongoose = require("mongoose")
const moment = require("moment")

const CoupangItem = mongoose.Schema({
  productId: String,
  vendorItemId: String,
  vendorName: String,
  vendorID: String,
  ratingCount: Number,
  ratingAveragePercentage: Number,
  otherSellerCount: Number,
  title: String,
  mainImages: [String],
  detail: String,
  options: [
    {
      key: String,
      optionKey1: String,
      optionTitle1: String,
      optionKey2: String,
      optionTitle2: String,
      title: String,
      price: Number,
      priceAmount: Number,
      shippingFee: Number,
      image: String,
      deliveryDay: Number,
      active: Boolean
    }
  ],
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  },
  sourcing: {
    type: Boolean,
    default: false
  },
  except: {
    type: Boolean,
    default: false
  },
  tfsid: String
})

module.exports = mongoose.model("CoupangItems_copy1", CoupangItem)
