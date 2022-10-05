const mongoose = require("mongoose")

const NaverMallFavorite = mongoose.Schema({
  mallID: mongoose.Schema.Types.ObjectId,
  userID: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model("NaverMallFavorite", NaverMallFavorite)