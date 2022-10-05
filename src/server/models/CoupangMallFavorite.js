const mongoose = require("mongoose")

const CoupangMallFavorite = mongoose.Schema({
  mallID: mongoose.Schema.Types.ObjectId,
  userID: mongoose.Schema.Types.ObjectId
})

module.exports = mongoose.model("CoupangMallFavorite", CoupangMallFavorite)