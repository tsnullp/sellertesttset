const mongoose = require("mongoose")

const KeywordFavoriteSchema = mongoose.Schema({
  keywordID: mongoose.Schema.Types.ObjectId,
  userID: mongoose.Schema.Types.ObjectId,
})

module.exports = mongoose.model("KeywordFavorite", KeywordFavoriteSchema)
