const mongoose = require("mongoose")

mongoose.Promise = global.Promise

module.exports = async () => {
  try { 
    mongoose.connect(`mongodb://${encodeURIComponent("tsnullp")}:${encodeURIComponent("xotjr313#!#")}@tsnullp.chickenkiller.com:21210/?authSource=seller`, {
      dbName: "seller",
      useNewUrlParser: true,
      // useCreateIndex: true,
      useUnifiedTopology: true,
      // useFindAndModify: false
    })

    mongoose.connection.on("connected", function() {
      console.log(`Mongoose default connection is open to `)
    })
    mongoose.connection.on("error", function(err) {
      console.log(`Mongoose default connection has occured - ${err}`)
    })
    mongoose.connection.on("disconnected", function() {
      console.log("Mongoose default connection is disconnected ")
      mongoose.connect(`mongodb://${encodeURIComponent("tsnullp")}:${encodeURIComponent("xotjr313#!#")}@tsnullp.chickenkiller.com:21210/?authSource=seller`, {
      dbName: "seller",
      useNewUrlParser: true,
      // useCreateIndex: true,
      useUnifiedTopology: true,
      // useFindAndModify: false
    })
    })
  } catch (e) {
    console.log("Failed connection to MONGO DATABASE")
    console.error(e.message)
  }
}
