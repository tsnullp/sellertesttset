const mongoose = require("mongoose")
const moment = require("moment")

const CoupangProductSchema = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId
  },
  writerID: {
    type: mongoose.Schema.Types.ObjectId
  },
  sourcingType: Number, // 1. 위너, 2. 네이버, 3. 대량
  sellerProductId: Number,
  sellerProductName: String,
  displayCategoryCode: Number,
  categoryId: Number,
  vendorId: String,
  statusName: String,
  isExcept: Boolean,
  items: [
    {
      isManage: {
        type: Boolean,
        default: false,
      },
      sellerProductItemId: Number,
      vendorItemId: Number,
      itemId: Number,
      itemName: String,
      cdnPath: String,
      originalPrice: Number,
      salePrice: Number,
      status: Number, // 0, 위너로 안묶임, 1, 위너 1등, 2, 위너 2등...
      costPrice: Number, // 원가
      minPrice: Number,  // 최저가
      margin: Number,  // 마진율
      minMagin: Number,  // 최저마진
      otherSeller: [{
        vendorName: String,
        vendorItemId: Number,
        selected: Boolean,
        price: Number,

      }],
      lastUpdate: {
        type: Date,
        default: () => moment().toDate()
      },
    }
  ],
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  },
})

module.exports = mongoose.model("CoupangProduct", CoupangProductSchema)
