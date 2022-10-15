const cron = require("node-cron")
const Market = require("../models/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const taobaoFavoriteSearching = require("../puppeteer/taobaoFavoriteSearching")
const findExchange = require("../puppeteer/findExchange")
const searchCafe24OrderList = require("../puppeteer/searchCafe24OrderList")
const deliveryDestination = require("../puppeteer/deliveryDestination")
const searchTaobaoOrderList = require("../puppeteer/searchTaobaoOrderList")

const MarketOrder = require("../models/MarketOrder")
const { GetOrderSheet } = require("../api/Market")

const setupSchedule = () => {
  // cron.schedule("0 * * * *", () => {
  // cron.schedule("0 0,2,4,6,8,10,12,14,16,18,20,22 * * *", () => {
  //   try {
  //     taobaoFavoriteSearching({ user: global.user })
  //   } catch (e) {
  //     console.log("setupSchedule - taobaoFavoriteSearching", e.message)
  //   }
  //   // CoupangStatusSearch()
  // })
  // // cron.schedule("0 0,2,4,6,8,10,12,14,16,18,20,22 * * *", () => {
  // // cron.schedule("0 0,3,6,9,12,15,18,21,23 * * *", () => {
  // //   VatSearch()
  // // })
  // setTimeout(()=> {
  // }, 5000)
}


module.exports = setupSchedule
