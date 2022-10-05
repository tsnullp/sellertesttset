const mongoose = require("mongoose")

const ShippingPrice = mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
  },
  type: Number, // 1. 추가금액, 2. 배송비, 3. 마진율, 4. 미국 아이허브 금액별 마진율, 5, 미국 아이허브 배송비,
  // 6. 알리익스프레스 금액별 마진율, 7, 알리익스프레스 배송비
  // 8. 아마존 금액별 마진율, 9, 아마존 배송비
  // 10. 아마존 일본 금액별 마진율, 11. 아마존 일본 배송비
  title: Number,
  price: Number,
})

module.exports = mongoose.model("ShippingPrice", ShippingPrice)
