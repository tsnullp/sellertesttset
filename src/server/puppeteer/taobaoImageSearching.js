const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const download = require("image-downloader")
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")
const fs = require("fs")
const { thumbImageParser } = require("../../lib/usrFunc")
const Market = require("../models/Market")
const Product = require("../models/Product")
const path = require("path")
const { getAppDataPath } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

const start = async (imageUrl, user) => {
  let productList = []

  const browser = await startBrowser(false)

  try {
    const page = await browser.newPage()

    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    const taobaoCookies = global.taobaoCookies

    if (taobaoCookies && Array.isArray(taobaoCookies)) {
      for (const item of taobaoCookies) {
        await page.setCookie(item)
      }
    }

    console.log("LOGIN1")

    await page.goto("https://s.taobao.com/search?q=", {
      waitUntil: "networkidle0"
    })
    console.log("LOGIN2")

    const accountInfo = await Market.findOne({
      userID: user.adminUser
    })

    if (!accountInfo.taobao) {
      return []
    }

    while (page.url().includes("login.taobao.com")) {
      console.log("LOGIN3")

      await taobaoLogin(page, accountInfo.taobao.loginID, accountInfo.taobao.password)
      await page.waitFor(1000)
    }

    console.log("LOGIN4")

    let i = 0
    while (i < 1000) {
      try {
        console.log("Input 기다리는중")
        await page.waitForSelector("input[type=file]", { timeout: 1000 })
        i = 1001
        console.log("Input 로드")
      } catch (e) {
        // console.log("input[type=file]", e)
        i++
        await page.waitFor(2000)
        await page.reload()
      }
    }

    const inputUploadHandle = await page.$("input[type=file]")

    const appDataDirPath = getAppDataPath()
    if (!fs.existsSync(appDataDirPath)) {
      fs.mkdirSync(appDataDirPath)
    }

    if (!fs.existsSync(path.join(appDataDirPath, "temp"))) {
      fs.mkdirSync(path.join(appDataDirPath, "temp"))
    }

    const options = {
      url: imageUrl,
      dest: path.join(appDataDirPath, "temp")
    }

    const { filename } = await download.image(options)

    inputUploadHandle.uploadFile(filename)
    console.log("Image 업로드")

    try {
      await page.waitForSelector("#imgsearch-itemlist", { timeout: 100000 })
      console.log("Image 찾기 완료")
    } catch (e) {
      console.log("waitForSelector", e)
      // await page.reload()
      // await start(imageUrl, user)
    }

    await scrollPageToBottom(page)
    // let data = await page.$("#imgsearch-itemlist")
    // const list = await page.evaluate(node => {
    //   console.log("node", node)
    // }, data)
    console.log("스크롤 다운 완료")
    productList = await page.$$eval(".item", element => {
      const returnValue = element
        .filter(item => item.querySelector(".title"))
        .map(item => {
          return {
            image: item.querySelector(".J_ItemPic.img").getAttribute("src"),
            detail: `https:${item.querySelector(".title > a").getAttribute("href")}`,
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
    console.log("1차 파싱 완료")

    const product = await Product.aggregate([
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

    for (const item of productList) {
      item.image = thumbImageParser(item.image)

      if (product.filter(savedItem => savedItem.basic.url === item.detail).length > 0) {
        item.registered = true
      } else {
        item.registered = false
      }
    }

    console.log("2차 파싱 완료")
    fs.unlinkSync(filename)
    console.log("파일 삭제")
    await page.goto("about:blank")
    console.log("page blank")
    await page.close()
    console.log("page 닫기")
    await browser.close()

    console.log("browser 닫기")
    return productList
  } catch (e) {
    console.log("imagesearch - ", e.message)
    if (browser) {
      await browser.close()
    }
    return []
  }
}

module.exports = start
