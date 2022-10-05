const startBrowser = require("./startBrowser")
const searchNaverKeyword = require("./searchNaverKeyword")
const scrollPageToBottom = require("puppeteer-autoscroll-down")
const { korTranslate, googleTranslate, papagoTranslate, kakaoTranslate } = require("./translate")
const { checkStr, thumbImageParser, makeTitle } = require("../../lib/usrFunc")
const puppeteer = require("puppeteer")

const iPhonex = puppeteer.devices["iPhone X"]

const find = async ({ url, headless = false }) => {
  const browser = await startBrowser(headless)
  const page = await browser.newPage()

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
    error: false
  }

  try {
    await page.setViewport({
      height: 2000,
      width: 375,
      isMobile: true,
      hasTouch: true
    })
    await page.emulate(iPhonex)
    await page.setJavaScriptEnabled(true)

    console.log("detailURL", url)
    await page.goto(url.replace("comment", ""), { waitUntil: "networkidle0" })
    await page.waitFor(1000)

    try {
      const selector = ".modal-sku-title-quantity"
      await page.waitForSelector(selector, { timeout: 1000 })
    } catch (e) {
      console.log("title--timeout", e.message)

      var frames = await page.frames()
      const loginFrame = frames.find(
        f => f.url().indexOf("https://login.m.taobao.com/login.htm") > -1
      )

      const opts = {
        delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
      }
      await loginFrame.tap("#fm-login-id")
      await loginFrame.type("#fm-login-id", "", opts)
      await loginFrame.type("#fm-login-id", "jts0509", opts)
      await loginFrame.waitForTimeout(1000)
      await loginFrame.tap("#fm-login-password")
      await loginFrame.type("#fm-login-password", "", opts)
      await loginFrame.type("#fm-login-password", "xotjr313#!#", opts)

      await page.keyboard.press(String.fromCharCode(13))

      await page.waitFor(2000 + Math.floor(Math.random() * 1000))
    }

    await page._client.send("Emulation.setEmitTouchEventsForMouse", {
      enabled: true
    })

    ObjItem.mainImages = await getMainImage(page)
    if (!ObjItem.mainImages) {
      if (browser) {
        await browser.close()
      }
      return null
    }
    ObjItem.good_id = await getGoodid(url)
    const titleObj = await getTitle(page)
    if (titleObj) {
      const { title, korTitle, quantity, categoryCode } = titleObj
      ObjItem.title = title
      ObjItem.korTitle = korTitle
      ObjItem.quantity = quantity
      ObjItem.categoryCode = categoryCode
      if (!korTitle) {
        // if (page) {
        //   await page.goto("about:blank")
        //   await page.close()
        // }
        if (browser) {
          await browser.close()
        }
        return null
      }
    }

    ObjItem.price = await getPrice(page)
    ObjItem.salePrice = await getSalePrice(page)
    ObjItem.options = await getSku(page)
    if (!ObjItem.options) {
      if (browser) {
        await browser.close()
      }
      return null
    }
    ObjItem.attribute = await getAttribute(page)
    ObjItem.content = await getContent(page)
  } catch (e) {
    console.log("getTaobaoIitem---", e.message)
  } finally {
    if (browser) {
      await browser.close()
    }
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
    const { korTitle, categoryCode } = await getTitleAndCategory(title.trim())

    await page.waitForSelector(quantitySelector)
    quantity = await page.$eval(quantitySelector, elem => elem.textContent.replace(/[^0-9]/g, ""))
    if (!title || title.length === 0) {
      return null
    }
    return {
      title,
      korTitle,
      quantity,
      categoryCode
    }
  } catch (e) {
    console.log("getTitle", e.message)
    return null
  }
}

const getTitleAndCategory = async title => {
  const cnText = title
    .replace(",", "")
    .replace("[", "")
    .replace("]", "")
    .replace("交易快照", "")
  let response1, response2, response3
  const google = async () => {
    response1 = await googleTranslate(cnText)
  }
  const papago = async () => {
    response2 = await papagoTranslate(cnText)
  }
  const kakao = async () => {
    response3 = await kakaoTranslate(cnText)
  }
  const promises = [google(), papago(), kakao()]

  await Promise.all(promises)

  const arr = []
  if (response1) {
    arr.push(...response1.split(" "))
  }
  if (response2) {
    arr.push(...response2.split(" "))
  }
  if (response3) {
    arr.push(...response3.split(" "))
  }
  const korTitle = makeTitle(arr)
  const categoryObj = await searchNaverKeyword({ korTitle })
  console.log("categoryObj", categoryObj)
  let categoryCode = null
  if (categoryObj && categoryObj.category4Code) {
    categoryCode = categoryObj.category4Code
  }
  if (categoryObj && categoryObj.category3Code) {
    categoryCode = categoryObj.category3Code
  }
  if (categoryObj && categoryObj.category2Code) {
    categoryCode = categoryObj.category2Code
  }
  if (categoryObj && categoryObj.category1Code) {
    categoryCode = categoryObj.category1Code
  }

  return {
    korTitle,
    categoryCode
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
    console.log("getPrice", e.message)
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
    console.log("getMainImage", e.message)
    return null
  }
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
            await category1.tap()
            await page.waitFor(600)
            await category1.tap()

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
      console.log("getSku1", e.message)
      return null
    }

    return skuList
  } catch (e) {
    console.log("getSku2", e.message)
    return null
  }
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
    console.log("getAttribute", e.message)
    return null
  }
  return attribures
}

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
    console.log("getContent", e.message)
    return null
  }
  return contents
}
