const mongoose = require("mongoose")
const moment = require("moment")

const TaobaoDetail = mongoose.Schema({
  itemID: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  url: String,
  naverID: String,
  brand: String,
  manufacture: String,
  good_id: String,
  title: String,
  korTitle: String,
  productTitle: String,
  price: String,
  salePrice: String,
  mainImages: [String],
  content: [String],
  options: [
    {
      key: String,
      value: String,
      korValue: String,
      price: String,
      stock: String,
      image: String,
      disabled: Boolean,
      active: Boolean
    }
  ],
  attribute: [
    {
      key: String,
      value: String,
      korKey: String,
      korValue: String
    }
  ],
  categoryCode: Number,
  attributes: [
    {
      attributeTypeName: String,
      attributeValueName: String,
      required: String,
      dataType: String,
      basicUnit: String,
      usableUnits: [String],
      groupNumber: String,
      exposed: String
    }
  ],
  noticeCategories: [
    {
      noticeCategoryName: String,
      noticeCategoryDetailNames: [
        {
          noticeCategoryDetailName: String,
          required: String,
          content: String
        }
      ]
    }
  ],
  requiredDocumentNames: [
    {
      templateName: String,
      required: String
    }
  ],
  certifications: [
    {
      certificationType: String,
      name: String,
      dataType: String,
      required: String
    }
  ],
  createdAt: {
    type: Date,
    default: () => moment().toDate()
  }
})

module.exports = mongoose.model("TaobaoDetail", TaobaoDetail)
