const mongoose = require("mongoose")

const DeliveryImageSchma = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId
  },
  shippingNumber: String,
  customsImage: Buffer,
  deliveryImage: Buffer
})

module.exports = mongoose.model("DeliveryImage", DeliveryImageSchma)
