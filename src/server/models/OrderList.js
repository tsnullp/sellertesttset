const mongoose = require("mongoose")
const moment = require("moment")

const OrderListSchema = mongoose.Schema({
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      index: true
    },
    market_id: String,
    market_order_info: String,
    buyer_name: String,
    buyer_phone: String,
    paid: String,
    order_date: String,
    order_date_date: Date,
    order_price_amount: String,
    cancel_date: String,
    buyer: {
      name: String,
      phone: String,
    },
    receiver: {
      name: String,
      phone: String,
      zipcode: String,
      address1: String,
      address2: String,
      address_full: String,
      shipping_message: String,
      clearance_information: String,
    },
    items: [{
      url: String,
      item_no: String,
      quantity: String,
      custom_product_code: String,
      option_value: String,
      product_name: String,
      product_price: String,
      status_text: String,
      image: String,
      sellerProductItemId: String,
      vendorItemId: String,
      itemId: String
    }],
    valid_number: {
      name: String,
      persEcm: String,
      phone: String,
      checkUnipass: Boolean
    }
})

module.exports = mongoose.model("OrderList", OrderListSchema)