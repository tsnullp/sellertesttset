const mongoose = require("mongoose")
const moment = require("moment")

const NaverItem = mongoose.Schema({
  mallNo: String,
  mallName: String,
  title: String,
  detail: String,
  price: String,
  shippingfee: String,
  image: String,
  productID: String,
  category1: String,
  category2: String,
  category3: String,
  category4: String,
  lastUpdate: {
    type: Date,
    default: () => moment().toDate()
  },
  sourcing: {
    type: Boolean,
    default: false
  },
  isTaobao: {
    type: Boolean,
    default: true
  },
  except: {
    type: Boolean,
    default: false
  }
})

module.exports = mongoose.model("NaverItem", NaverItem)
