const startBrowser = require("./startBrowser")
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")
const { korTranslate } = require("./translate")
const { checkStr, thumbImageParser } = require("../../lib/usrFunc")
const { Outbound, ReturnShippingCenter } = require("../api/Market")
const Market = require("../models/Market")
const puppeteer = require("puppeteer")
const iPhonex = puppeteer.devices["iPhone X"]

const find = async ({ url, user, headless = false }) => {
  const browser = await startBrowser(headless)
  const page = await browser.newPage()

  await page.setViewport({
    height: 2000,
    width: 375,
    isMobile: true,
    hasTouch: true
  })
  await page.emulate(iPhonex)
  await page.setJavaScriptEnabled(true)

  await page.goto(url, { waitUntil: "networkidle0" })
  await page.waitFor(1000)

  try {
    const frames = await page.frames()
    const slideFrame = frames.find(f => f.url().indexOf("https://h5api.m.taobao.com") > -1)
    if (slideFrame) {
      const newPage = await browser.newPage()
      await newPage.setJavaScriptEnabled(true)
      await newPage.goto(page.url(), { waitUntil: "networkidle0" })
      await newPage.waitFor(1000)
      const newFrames = await newPage.frames()

      const slideFrame = newFrames.find(f => f.url().indexOf("https://h5api.m.taobao.com") > -1)
      if (slideFrame) {
        const origin = await slideFrame.$("#nc_1_n1t")
        const originBox = await origin.boundingBox()
        const element = await slideFrame.$("#nc_1_n1z")
        await element.hover()
        await newPage.mouse.down()
        await newPage.mouse.move(originBox.x + originBox.width, 0, {
          delay: 5000 + Math.floor(Math.random() * 10000) + 1500 + Math.floor(Math.random() * 10000)
        })
        await newPage.mouse.up()
        await newPage.waitFor(2000)
        await page.reload()
        await newPage.close()
      }
    }
  } catch (e) {
    console.log("ㅇㅕ기 타냐?", e)
  }

  try {
    const selector = ".modal-sku-title-quantity"
    await page.waitForSelector(selector, { timeout: 1000 })
  } catch (e) {
    console.log("title--timeout", e.message)

    const accountInfo = await Market.findOne({
      userID: user.adminUser
    })

    var frames = await page.frames()
    const loginFrame = frames.find(
      f => f.url().indexOf("https://login.m.taobao.com/login.htm") > -1
    )

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }
    await loginFrame.tap("#fm-login-id")
    await loginFrame.type("#fm-login-id", "", opts)
    await loginFrame.type("#fm-login-id", accountInfo.taobao.loginID, opts)
    await loginFrame.waitFor(1000)
    await loginFrame.tap("#fm-login-password")
    await loginFrame.type("#fm-login-password", "", opts)
    await loginFrame.type("#fm-login-password", accountInfo.taobao.password, opts)

    await page.keyboard.press(String.fromCharCode(13))

    await page.waitFor(2000 + Math.floor(Math.random() * 1000))
  }

  await page._client.send("Emulation.setEmitTouchEventsForMouse", {
    enabled: true
  })

  const ObjItem = {
    brand: "",
    good_id: "",
    title: "",
    mainImages: [],
    price: 0,
    salePrice: 0,
    content: [],
    options: [],
    attribute: [],
    shipping: {},
    returnCenter: {},
    vendorId: null,
    invoiceDocument: null,
    maximumBuyForPerson: 0,
    maximumBuyForPersonPeriod: 1,
    error: false
  }

  try {
    ObjItem.mainImages = await getMainImage(page)
  } catch (e) {
    console.log("getMainImage--", e)
  }
  try {
    // const promiseGoodID = async () => {
    //   console.log("여기 안타나 ? 1")
    //   ObjItem.good_id = await getGoodid(url)
    //   console.log("여기 안타나 ? 2")
    // }

    const promiseGoodID = new Promise(async (resolve, reject) => {
      try {
        ObjItem.good_id = await getGoodid(url)
        resolve()
      } catch (e) {
        console.log("promiseGoodID--", e)
        reject(e)
      }
    })

    const promiseTitle = new Promise(async (resolve, reject) => {
      try {
        const { title, korTitle, quantity } = await getTitle(page)
        ObjItem.title = title
        ObjItem.korTitle = korTitle
        ObjItem.quantity = quantity
        resolve()
      } catch (e) {
        console.log("promiseTitle--", e)
        reject(e)
      }
    })
    const promisePrice = new Promise(async (resolve, reject) => {
      try {
        ObjItem.price = await getPrice(page)
        resolve()
      } catch (e) {
        console.log("promisePrice--", e)
        reject(e)
      }
    })
    const promiseSalePrice = new Promise(async (resolve, reject) => {
      try {
        ObjItem.salePrice = await getSalePrice(page)
        resolve()
      } catch (e) {
        console.log("promiseSalePrice--", e)
        reject(e)
      }
    })

    // const promiseMainImages = new Promise(async resolve => {
    //   ObjItem.mainImages = await getMainImage(page)
    //   resolve()
    // })

    const promiseOtions = new Promise(async (resolve, reject) => {
      try {
        ObjItem.options = await getSku(page)
        resolve()
      } catch (e) {
        console.log("promiseOtions--", e)
        reject(e)
      }
    })

    const promiseAttribute = new Promise(async (resolve, reject) => {
      try {
        ObjItem.attribute = await getAttribute(page)
        resolve()
      } catch (e) {
        console.log("promiseAttribute--", e)
        reject(e)
      }
    })

    const promiseContent = new Promise(async (resolve, reject) => {
      try {
        ObjItem.content = await getContent(page)
        resolve()
      } catch (e) {
        console.log("promiseContent--", e)
        reject(e)
      }
    })

    const promiseOutBound = new Promise(async (resolve, reject) => {
      try {
        const outbound = await Outbound({ userID: user.adminUser })
        if (outbound && outbound.content.length > 0) {
          const temp = outbound.content.filter(item => item.usable === true)
          if (temp.length > 0) {
            ObjItem.shipping.outboundShippingPlaceCode = temp[0].outboundShippingPlaceCode
            ObjItem.shipping.shippingPlaceName = temp[0].shippingPlaceName
            ObjItem.shipping.placeAddresses = temp[0].placeAddresses
            ObjItem.shipping.remoteInfos = temp[0].remoteInfos
          }
        }
        const returnShippingCenter = await ReturnShippingCenter({ userID: user.adminUser })

        if (returnShippingCenter && returnShippingCenter.data.content.length > 0) {
          const temp = returnShippingCenter.data.content.filter(item => item.usable === true)

          if (temp.length > 0) {
            ObjItem.returnCenter.returnCenterCode = temp[0].returnCenterCode
            ObjItem.returnCenter.shippingPlaceName = temp[0].shippingPlaceName
            ObjItem.returnCenter.deliverCode = temp[0].deliverCode
            ObjItem.returnCenter.deliverName = temp[0].deliverName
            ObjItem.returnCenter.placeAddresses = temp[0].placeAddresses
          }
        }

        const market = await Market.findOne({
          userID: user.adminUser
        })
        if (market) {
          ObjItem.vendorId = market.coupang.vendorId
          ObjItem.vendorUserId = market.coupang.vendorUserId
          ObjItem.shipping.deliveryCompanyCode = market.coupang.deliveryCompanyCode
          ObjItem.shipping.deliveryChargeType = market.coupang.deliveryChargeType
          ObjItem.shipping.deliveryCharge = market.coupang.deliveryCharge || 0
          ObjItem.returnCenter.deliveryChargeOnReturn = market.coupang.deliveryChargeOnReturn || 0
          ObjItem.returnCenter.returnCharge = market.coupang.returnCharge || 0
          ObjItem.shipping.outboundShippingTimeDay = market.coupang.outboundShippingTimeDay || 0
          ObjItem.invoiceDocument = market.coupang.invoiceDocument
          ObjItem.maximumBuyForPerson = market.coupang.maximumBuyForPerson
          ObjItem.maximumBuyForPersonPeriod = market.coupang.maximumBuyForPersonPeriod
          ObjItem.cafe24_mallID = market.cafe24.mallID
          ObjItem.cafe24_shop_no = market.cafe24.shop_no
        }
        resolve()
      } catch (e) {
        console.log("promiseOutBound--", e)
        reject(e)
      }
    })

    const promises = [
      promiseGoodID,
      promiseTitle,
      promisePrice,
      promiseSalePrice,
      // promiseMainImages,
      promiseOtions,
      promiseAttribute,
      promiseContent,
      promiseOutBound
    ]

    await Promise.all(promises)
  } catch (err) {
    ObjItem.error = true
    console.log("Error", err)
  } finally {
    await browser.close()
  }

  return ObjItem
}

module.exports = find

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

const getTitle = async page => {
  const selector = ".title"
  const quantitySelector = ".modal-sku-title-quantity"
  let title
  let korTitle
  let quantity
  try {
    await page.waitForSelector(selector)
    title = await page.$eval(selector, elem => elem.innerText)
    korTitle = await korTranslate(title.trim())
    await page.waitForSelector(quantitySelector)
    quantity = await page.$eval(quantitySelector, elem => elem.textContent.replace(/[^0-9]/g, ""))
  } catch (e) {
    console.log("getTitle", e)
  }

  return {
    title,
    korTitle,
    quantity
  }
}

const getPrice = async page => {
  let price = ""

  const selector = "div.extra-price"
  try {
    await page.waitForSelector(selector)
    price = await page.$eval(selector, element => {
      return element.innerText.replace("￥", "")
    })
  } catch (e) {
    console.log("getPrice", e)
  }

  return price.trim().replace("价格", "")
}

const getSalePrice = async page => {
  let price = ""
  const selector = ".prices > .price"
  try {
    await page.waitForSelector(selector)
    price = await page.$eval(selector, element => element.innerHTML)
  } catch (e) {
    console.log("getSalePrice", e)
  }

  return price.trim()
}
const getMainImage = async page => {
  const selector = "img.mui-lazy.slick-image"
  let images = []
  try {
    await page.waitForSelector(selector, {})

    const imageElements = await page.$$(selector)
    const box = await page.$(".carousel")
    const bounding_box = await box.boundingBox()
    let i = 0
    for (const imageElem of imageElements) {
      try {
        if (i > 0) {
          await page.mouse.move(
            bounding_box.x + bounding_box.width - 20,
            bounding_box.y + bounding_box.height / 2
          )

          page.mouse.down().catch(e => e)

          page.mouse
            .move(20, bounding_box.y + bounding_box.height / 2, {
              // delay: 1000 + Math.floor(Math.random() * 10000) + 1000 + Math.floor(Math.random() * 10000)
              delay: 1000 + Math.floor(Math.random() * 1000)
            })
            .catch(e => e)

          page.mouse.up().catch(e => e)

          await page.waitFor(300)
        }

        await page.waitFor(1000)
        let src = await page.evaluate(el => el.getAttribute("src"), imageElem)

        images.push(thumbImageParser(src))
        i++
      } catch (e) {
        console.log("mainImage----", e)
      }
    }

    return images
  } catch (e) {
    console.log("getMainImage", e)
  }

  return images
}

const getSku = async page => {
  const selector = "div.modal-sku-content"
  const skuList = []
  try {
    await page.waitForSelector(selector, { timeout: 5000 })

    const box = await page.$(".sku")
    const bounding_box = await box.boundingBox()
    const yPosition = bounding_box.y + bounding_box.height
    await page.evaluate(yPosition => window.scroll(0, yPosition + 100), yPosition)
    await page.tap(".sku > .card-subtitle")

    await page.waitFor(600)
    let categoryGroup = await page.$$(selector)

    try {
      if (categoryGroup.length === 1) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$(".modal-sku-content-item")

        for (const category1 of categoryUL1LI1) {
          await category1.tap()

          await page.waitFor(600)

          const key1 = await page.evaluate(el => el.getAttribute("data-vid"), category1)

          const className = await page.evaluate(el => el.getAttribute("class"), category1)

          const value1 = await page.$eval(".modal-sku-title-selected-text", el => el.innerText)

          const price = await page.$eval("div.modal-sku-title-price", el => el.innerText)

          const stock = await page.$eval(".modal-sku-title-quantity", ele => ele.innerText)

          let value = value1
          if (value.includes("：")) {
            value = value1.split("：")[1]
          }

          const image1 = await page.$eval(".modal-sku-image > img", el => el.getAttribute("src"))

          skuList.push({
            key: key1,
            value,

            image: image1 && image1.length > 0 ? thumbImageParser(image1) : "",
            price: typeof Number(price) === "number" && isFinite(Number(price)) ? Number(price) : 0,
            stock: Number(stock.replace(/[^0-9]/g, "")),
            disabled: className.includes("disable") ? true : false,
            active: true
          })
        }
      } else if (categoryGroup.length === 2) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$(".modal-sku-content-item")

        let i = 0
        let tempImage = null
        for (const category1 of categoryUL1LI1) {
          await category1.tap()
          await page.waitFor(600)
          const categoryUL2 = categoryGroup[1]
          const categoryUL2LI2 = await categoryUL2.$$(".modal-sku-content-item")
          const className1 = await page.evaluate(el => el.getAttribute("class"), category1)
          const key1 = await page.evaluate(el => el.getAttribute("data-vid"), category1)

          const image2 = await page.$eval(".modal-sku-image > img", el => el.getAttribute("src"))
          if (i === 0) {
            tempImage = image2
          }

          i++
          for (const category2 of categoryUL2LI2) {
            const className2 = await page.evaluate(el => el.getAttribute("class"), category2)

            await category2.tap()
            await page.waitFor(600)
            // await category1.tap()
            // await page.waitFor(600)
            // await category1.tap()

            const key2 = await page.evaluate(el => el.getAttribute("data-vid"), category2)

            const value2 = await page.$eval(".modal-sku-title-selected-text", el => el.innerText)
            const price = await page.$eval("div.modal-sku-title-price", el => el.innerText)
            const stock = await page.$eval(".modal-sku-title-quantity", ele => ele.innerText)

            const image3 = await page.$eval(".modal-sku-image > img", el => el.getAttribute("src"))

            let value = value2
            if (value.includes("：")) {
              value = value2.split("：")[1]
            }

            let image = null
            if (tempImage === image2) {
              image = image3
            } else {
              image = image2
            }
            skuList.push({
              key: `${key1}|${key2}`,
              value,

              image: image && image.length > 0 ? thumbImageParser(image) : "",
              price:
                typeof Number(price) === "number" && isFinite(Number(price)) ? Number(price) : 0,
              stock: Number(stock.replace(/[^0-9]/g, "")),
              disabled:
                className1.includes("disable") || className2.includes("disable") ? true : false,
              active: true
            })
            await category2.tap()
          }
        }
      } else if (categoryGroup.length === 3) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$(".modal-sku-content-item")

        let i = 0
        let tempImage = null
        for (const category1 of categoryUL1LI1) {
          await category1.tap()
          await page.waitFor(600)
          const categoryUL2 = categoryGroup[1]
          const categoryUL2LI2 = await categoryUL2.$$(".modal-sku-content-item")
          const className1 = await page.evaluate(el => el.getAttribute("class"), category1)
          const key1 = await page.evaluate(el => el.getAttribute("data-vid"), category1)

          const image2 = await page.$eval(".modal-sku-image > img", el => el.getAttribute("src"))
          if (i === 0) {
            tempImage = image2
          }

          i++
          for (const category2 of categoryUL2LI2) {
            const className2 = await page.evaluate(el => el.getAttribute("class"), category2)

            await category2.tap()
            await page.waitFor(600)

            const categoryUL3 = categoryGroup[2]
            const categoryUL3LI3 = await categoryUL3.$$(".modal-sku-content-item")

            const value2 = await page.$eval(".modal-sku-title-selected-text", el => el.innerText)

            const key2 = await page.evaluate(el => el.getAttribute("data-vid"), category2)
            const image3 = await page.$eval(".modal-sku-image > img", el => el.getAttribute("src"))

            for (const category3 of categoryUL3LI3) {
              const className3 = await page.evaluate(el => el.getAttribute("class"), category3)

              await category3.tap()
              await page.waitFor(600)

              const value3 = await page.$eval(".modal-sku-title-selected-text", el => el.innerText)
              const price = await page.$eval("div.modal-sku-title-price", el => el.innerText)
              const stock = await page.$eval(".modal-sku-title-quantity", ele => ele.innerText)

              const key3 = await page.evaluate(el => el.getAttribute("data-vid"), category3)
              const image4 = await page.$eval(".modal-sku-image > img", el =>
                el.getAttribute("src")
              )

              let value = value3
              if (value.includes("：")) {
                value = value3.split("：")[1]
              }

              let image = null
              if (tempImage === image2) {
                image = image3
              } else if (tempImage === image3) {
                image = image4
              } else {
                image = image2
              }
              skuList.push({
                key: `${key1}|${key2}|${key3}`,
                value,

                image: image && image.length > 0 ? thumbImageParser(image) : "",
                price:
                  typeof Number(price) === "number" && isFinite(Number(price)) ? Number(price) : 0,
                stock: Number(stock.replace(/[^0-9]/g, "")),
                disabled:
                  className1.includes("disable") ||
                  className2.includes("disable") ||
                  className3.includes("disable")
                    ? true
                    : false,
                active: true
              })
              await category3.tap()
            }
            await category2.tap()
          }
        }
      }

      await page.tap(".modal-close-btn")

      const promiseOptionTranslate = item =>
        new Promise(async resolve => {
          item.korValue = await korTranslate(item.value)
          resolve()
        })

      const promises = skuList.map(promiseOptionTranslate)
      await Promise.all(promises)
    } catch (e) {
      console.log("getSku1", e)
    }

    return skuList
  } catch (e) {
    console.log("getSku2")
  }

  return skuList
}

const getAttribute = async page => {
  const selector = ".product-row > .product-item"
  await page.waitFor(1000)
  let attribures = []
  try {
    await page.waitForSelector(selector)

    attribures = await page.$$eval(selector, element => {
      return element.map(item => {
        const productK = item.querySelector(".product-k").textContent
        const productV = item.querySelector(".product-v").textContent

        return {
          key: productK,
          value: productV
        }
      })
    })

    const promiseAttributeTranslate = item =>
      new Promise(async resolve => {
        item.korKey = await korTranslate(item.key)
        item.korValue = await korTranslate(item.value)

        resolve()
      })

    const promises = attribures.map(promiseAttributeTranslate)
    await Promise.all(promises)
  } catch (e) {
    console.log("getAttribute", e)
  }
  return attribures
}

// const getContent1 = async (browser, url, user) => {
//   const page = await browser.newPage()
//   await page.setJavaScriptEnabled(true)

//   const taobaoCookies = global.taobaoCookies
//   if (taobaoCookies && Array.isArray(taobaoCookies)) {
//     for (const item of taobaoCookies) {
//       await page.setCookie(item)
//     }
//   } else {
//     await page.goto("https://login.taobao.com/member/login.jhtml", { waitUntil: "networkidle0" })
//     const accountInfo = await Account.findOne({
//       userID: user.adminUser,
//       accountType: 1
//     })
//     if (!accountInfo) {
//       return []
//     }

//     await taobaoLogin(page, accountInfo.loginID, accountInfo.password)
//   }

//   await page.goto(url, { waitUntil: "networkidle0" })
//   let urls = []
//   try {
//     await page.waitForSelector("div > p > img")

//     urls = await page.$$eval("div > p > img", element => {
//       return element.map(item => {
//         // const src = item.attribs["data-ks-lazyload"] || item.getAttribute("src")
//         const src =
//           item.dataset && item.dataset.ksLazyload ? item.dataset.ksLazyload : item.currentSrc
//         return src
//       })
//     })
//     // const htmlString = await page.$eval("#J_DivItemDesc", ele => ele.innerHTML)

//     // urls = catchSwiper("#J_DivItemDesc", html, true)
//   } catch (e) {
//     console.log("url-----", url, e)
//   }

//   await page.close()

//   return urls
// }

const getContent = async page => {
  const selector = ".desc-item.desc-img > img"
  let contents = []

  try {
    await page.waitForSelector(selector)
    await scrollPageToBottom(page)
    await page.waitFor(1000)
    contents = await page.$$eval(selector, element => {
      return element.map(item => {
        return item.getAttribute("src")
      })
    })
    contents = contents.map(item => thumbImageParser(item))
  } catch (e) {
    console.log("getContent", e)
  }
  return contents
}

// https://m.intl.taobao.com/detail/detail.html?id=562077473615&spm=a21wu.241046-cn.4691948847.191.41cab6cb9fifTS&scm=1007.15423.84311.100200300000004&pvid=ca0faac9-dfdf-4d6f-b189-c643cb95d526
