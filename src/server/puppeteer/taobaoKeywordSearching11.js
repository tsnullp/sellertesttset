const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const Market = require("../models/Market")
const Product = require("../models/Product")
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")
const { cnTranslate } = require("./translate")
const qs = require("querystring")
const { thumbImageParser } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const iconv = require("iconv-lite")
const puppeteer = require("puppeteer")
const iPhonex = puppeteer.devices["iPhone X"]
const {
  js1,
  // js2,
  js3,
  js4,
  js5
} = require("./exec")
let productList = []
let product = []

const start = async (keyword, user) => {
  try {
    // product = await Product.aggregate([
    //   {
    //     $match: {
    //       userID: ObjectId(user.adminUser),
    //       isDelete: false,
    //       product: { $ne: null },
    //       basic: { $ne: null },
    //       coupangUpdatedAt: { $ne: null },
    //       cafe24UpdatedAt: { $ne: null },
    //       "basic.naverID": { $ne: null }
    //     }
    //   },
    //   {
    //     $project: {
    //       basic: 1
    //     }
    //   }
    // ])

    const browser = await startBrowser(false)
    const page = await browser.newPage()
    await page.setViewport({
      height: 2000,
      width: 375,
      isMobile: true,
      hasTouch: true
    })
    await page.emulate(iPhonex)
    await page.setJavaScriptEnabled(true)
    await page._client.send("Emulation.setEmitTouchEventsForMouse", {
      enabled: true
    })

    try {
      // console.log("1")
      await page.evaluate(js1)
      // console.log("2")
      await page.waitFor(500 + Math.floor(Math.random() * 1000))
      // console.log("3")
      await page.evaluate(js3)
      // console.log("4")

      await page.waitFor(500 + Math.floor(Math.random() * 1000))
      // console.log("5")
      await page.evaluate(js4)
      // console.log("6")
      await page.waitFor(500 + Math.floor(Math.random() * 1000))
      // console.log("7")
      await page.evaluate(js5)
      // console.log("8")
      await page.waitFor(500 + Math.floor(Math.random() * 1000))
      // console.log("9")
    } catch (e) {
      console.log("evalute ->", e)
    }

    await page.goto(
      `https://login.m.taobao.com/login_oversea.htm?spm=a2141.8294648.toolbar.3&redirectURL=https://m.intl.taobao.com/search/search.html?spm=a2141.8294648.toolbar.2`,
      {
        waitUntil: "networkidle0"
        // referer: "https://world.taobao.com/"
      }
    )
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    await page.waitForSelector("#login-form", { timeout: 60000 })

    await page.tap("#fm-login-id")
    await page.type("#fm-login-id", "jts0509", opts)

    await page.tap("#fm-login-password")
    await page.type("#fm-login-password", "xotjr313#!#", opts)

    let loginBtn = await page.$(".fm-button.fm-submit.password-login")
    await loginBtn.click({
      delay: 20
    })

    await page.waitFor(1000 + Math.floor(Math.random() * 1000))

    const cnKeyword = await cnTranslate(keyword.trim())

    await page.type("input[type=search]", cnKeyword)
    await page.keyboard.press("Enter")
    await page.waitFor(2000)
    await page.waitForSelector("#list")
    await scrollPageToBottom(page)

    productList = await page.$$eval("#list > div > a", element => {
      console.log("element", element)
      const returnValue = element.map(item => {
        console.log("item", item)
        return {
          detail: item.getAttribute("href"),
          image: item.querySelector("img").getAttribute("src"),
          title: item.querySelector("div > div:nth-child(1) > h2").innerText.trim(),
          price: item
            .querySelector("div > div:nth-child(2) > div > span:nth-child(2)")
            .innerText.trim(),
          dealCnt: item
            .querySelector("div >div:nth-child(2) > div > span:nth-child(4)")
            .innerText.trim()
            .replace("人付款", ""),

          shop: "",
          location: ""
        }
      })
      return returnValue
    })

    productList.forEach(item => {
      item.image = thumbImageParser(item.image)

      if (!item.detail.includes("https:")) {
        item.detail = `https:${item.detail}`
      }
      if (product.filter(savedItem => savedItem.basic.url === item.detail).length > 0) {
        item.registered = true
      } else {
        item.registered = false
      }
    })

    console.log("productList", productList)
    // await browser.close()
  } catch (e) {
    console.log("keywordearch", e)
  }

  return productList
}
module.exports = start
