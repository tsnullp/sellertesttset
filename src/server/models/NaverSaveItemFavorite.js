const mongoose = require("mongoose")

const NaverSaveItemFavorite = mongoose.Schema({
  userID: mongoose.Schema.Types.ObjectId,
  productNo: String,
  isFavorite: Boolean,
  isDelete: Boolean
})

module.exports = mongoose.model("NaverSaveItemFavorite", NaverSaveItemFavorite)