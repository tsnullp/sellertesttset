const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const Market = require("../models/Market")
const Product = require("../models/Product")
const TaobaoKeywordItem = require("../models/TaobaoKeywordItem")
const scrollPageToBottom = require("puppeteer-autoscroll-down")
const getTaobaoItemAuto = require("./getTaobaoItemAuto")
const qs = require("querystring")
const { checkStr, thumbImageParser } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const moment = require("moment")
const ObjectId = mongoose.Types.ObjectId

const start = async ({ keyword, userID, fromPage = 1, toPage = 10 }) => {
  const browser = await startBrowser(false)
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)
  try {
    const product = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(userID),
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
    const createdAt = moment().toDate()
    const taobaoCookies = global.taobaoCookies

    if (taobaoCookies && Array.isArray(taobaoCookies)) {
      for (const item of taobaoCookies) {
        await page.setCookie(item)
      }
    }

    const array = []

    for (let i = fromPage; i <= toPage; i++) {
      array.push(i)
    }

    console.log("array", array)

    for (const item of array) {
      await searchPage({ page, product, keyword, searchPage: item, userID, createdAt })
    }

    const taobaoItem = await TaobaoKeywordItem.aggregate([
      {
        $match: {
          itemID: { $ne: null },
          keyword,
          createdAt
        }
      }
    ])

    for (const item of taobaoItem) {
      const objItem = await getTaobaoItemAuto({
        url: item.detail
      })
    }
  } catch (e) {
    console.log("taobaoKeywordPageSearching", e.message)
  } finally {
    await browser.close()
  }
}

const searchPage = async ({ page, product, keyword, searchPage, userID, createdAt }) => {
  try {
    await page.goto(
      `https://s.taobao.com/search?q=${qs.escape(keyword)}&bcoffset=0&s=${(searchPage - 1) * 60}`,
      {
        waitUntil: "networkidle0"
      }
    )

    if (page.url().includes("login.taobao.com")) {
      const accountInfo = await Market.findOne({
        userID: userID
      })

      if (!accountInfo.taobao) {
        return []
      }

      await taobaoLogin(page, accountInfo.taobao.loginID, accountInfo.taobao.password)

      const cookies2 = await page.cookies("https://www.taobao.com")
      global.taobaoCookies = cookies2
    }

    await page.waitForSelector("#mainsrp-itemlist", { timeout: 0 })
    await scrollPageToBottom(page)

    let productList = []

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

        item.goodID = getGoodid(item.detail)

        if (product.filter(savedItem => savedItem.basic.url === item.detail).length > 0) {
          item.registered = true
        } else {
          item.registered = false
        }
        return item
      })

    for (const item of productList.filter(item => !item.registered)) {
      await TaobaoKeywordItem.findOneAndUpdate(
        {
          goodID: item.goodID
        },
        {
          $set: {
            ...item,
            createdAt,
            keyword
          }
        },
        { upsert: true }
      )
    }
    console.log("productList", productList)
  } catch (e) {
    console.log("searchPage", e.message)
  }
}

module.exports = start

const getGoodid = url => {
  let id = 0
  try {
    url = url.split("&")
    if (url.length) {
      for (let i = 0, len = url.length; i < len; i++) {
        if (checkStr(url[i], "id=", true)) {
          let idt = url[i].split("=")
          id = idt[1]
          return id
        }
      }
    }
  } catch (e) {
    console.log("getGoodid", e)
  }

  return id
}
