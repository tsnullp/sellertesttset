const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const Market = require("../models/Market")
const Product = require("../models/Product")
const scrollPageToBottom = require("puppeteer-autoscroll-down")
const { cnTranslate } = require("./translate")
const qs = require("querystring")
const { thumbImageParser } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const { js1, js3, js4, js5 } = require("./exec")

let productList = []
let product = []

const start = async (keyword, user) => {
  try {
    product = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(user.adminUser),
          isDelete: false,
          product: { $ne: null },
          basic: { $ne: null },
          coupangUpdatedAt: { $ne: null },
          cafe24UpdatedAt: { $ne: null },
          "basic.naverID": { $ne: null }
        }
      },
      {
        $project: {
          basic: 1
        }
      }
    ])
    const browser = await startBrowser(false)
    const page = await browser.newPage()

    await page.evaluate(js1)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))

    await page.evaluate(js3)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))
    await page.evaluate(js4)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))
    await page.evaluate(js5)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))

    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    const taobaoCookies = global.taobaoCookies

    if (taobaoCookies && Array.isArray(taobaoCookies)) {
      for (const item of taobaoCookies) {
        await page.setCookie(item)
      }
    }

    const cnKeyword = await cnTranslate(keyword.trim())

    await page.goto(`https://s.taobao.com/search?q=${qs.escape(cnKeyword)}&bcoffset=0&s=0`, {
      waitUntil: "networkidle0"
      // referer: "https://world.taobao.com/"
    })

    if (page.url().includes("login.taobao.com")) {
      const accountInfo = await Market.findOne({
        userID: user.adminUser
      })

      if (!accountInfo.taobao) {
        return []
      }

      await taobaoLogin(page, accountInfo.taobao.loginID, accountInfo.taobao.password)

      const cookies2 = await page.cookies("https://www.taobao.com")
      global.taobaoCookies = cookies2
    }

    try {
      await page.waitForSelector("#mainsrp-itemlist", { timeout: 0 })
    } catch (e) {
      console.log("waitForSelector", e)
      // await page.reload()
      // start(imageUrl, user)
    }

    await scrollPageToBottom(page)
    // let data = await page.$("#imgsearch-itemlist")
    // const list = await page.evaluate(node => {
    //   console.log("node", node)
    // }, data)

    productList = await page.$$eval(".items > div", element => {
      const returnValue = element
        .filter(item => item.querySelector(".title"))
        .map(item => {
          return {
            image: item.querySelector(".J_ItemPic.img").getAttribute("src"),
            detail: item.querySelector(".title > a").getAttribute("href"),
            title: item.querySelector(".title").innerText.trim(),
            price: item.querySelector(".price > strong")
              ? item.querySelector(".price > strong").innerText.trim()
              : "",
            dealCnt: item.querySelector(".deal-cnt")
              ? item
                  .querySelector(".deal-cnt")
                  .innerText.trim()
                  .replace("人付款", "")
              : "",
            shop: item.querySelector(".shop").textContent.trim(),
            location: item.querySelector(".location").textContent.trim()
          }
        })
      return returnValue
    })

    productList = productList
      .filter(item => !item.detail.includes("https:"))
      .map(item => {
        item.image = thumbImageParser(item.image)

        if (!item.image.includes("https:")) {
          item.image = `https:${item.image}`
        }
        if (!item.detail.includes("https:")) {
          item.detail = `https:${item.detail}`
        }
        if (product.filter(savedItem => savedItem.basic.url === item.detail).length > 0) {
          item.registered = true
        } else {
          item.registered = false
        }
        return item
      })

    await browser.close()
  } catch (e) {
    console.log("keywordearch", e)
  }

  return productList
}
module.exports = start
