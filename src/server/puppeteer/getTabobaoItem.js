const cheerio = require("cheerio")
const {
  checkStr,
  urlSize,
  trim,
  optionImageParser,
  thumbImageParser
} = require("../../lib/usrFunc")
const translate = require("./translate")
const Account = require("../models/Account")
const puppeteer = require("puppeteer")
const iPhonex = puppeteer.devices["iPhone X"]

let salePrice = null

const findTaobao = async ({ page, html, url }) => {
  const objItem = {
    imgs: [],
    title: "",
    price: 0,
    salePrice: 0,
    content: [],
    good_id: 0,
    option: [],
    attribute: [],
    error: false
  }
  objItem.good_id = getGoodid(url)
  try {
    objItem.title = await getTitle(page)
    objItem.imgs = await getSwiper(html, url)
    objItem.price = await getPrice(page, url)
    objItem.salePrice = await getSalePrice(page)
    objItem.content = await getContent(page, html, url)
    objItem.option = await getSku(page)
    objItem.attribute = await getAttribute(page)
    objItem.error = false
  } catch (err) {
    objItem.error = true
  }
  // console.log("objItem", objItem)
  return objItem
}

const findTianMao = async ({ page, html, url }) => {
  const objItem = {
    good_id: 0,
    imgs: [],
    title: "",
    price: "",
    content: []
  }
  try {
    objItem.good_id = getGoodid(url)
    objItem.title = await getTitle(page)
    objItem.imgs = await getSwiper(html, url)
    // objItem.price = await getPrice(page, url)
    // objItem.salePrice = await getSalePrice(page)
    objItem.content = await getContent(page, html, url)
    objItem.option = await getSku(page)
    objItem.error = false
  } catch (err) {
    objItem.error = err
  }

  return objItem
}

const getTitle = async page => {
  const t1 = ".tpl-wrapper > div > div > div > span"
  const t2 = ".tb-detail-hd > h1"
  const t3 = ".tb-main-title"
  let title

  try {
    title = await page.$eval(t3, ele => ele.innerHTML)
  } catch (err) {
    try {
      title = await page.$eval(t2, ele => ele.innerHTML)
    } catch (errmsg) {
      try {
        title = await page.$eval(t1, ele => ele.innerHTML)
      } catch (errmsg) {
        title = ""
      }
    }
  }
  return trim(title)
  // return await translate(page, trim(title))
}

const getSwiper = (html, url) => {
  let urls = []
  // urls = catchSwiper('.tb-thumb li .tb-pic a img', html)
  // urls = urlSize(urls, '50x50.jpg')
  if (/item.taobao.com/.test(url)) {
    urls = catchSwiper(".tb-thumb li .tb-pic a img", html)
    urls = urlSize(urls, "50x50.jpg")
  }
  if (/detail.tmall.com/.test(url)) {
    urls = catchSwiper("#J_UlThumb li a img", html)
    urls = urlSize(urls, "60x60q90.jpg")
  }

  urls = urls.map(item => thumbImageParser(item))
  return urls
}

const getPrice = async (page, url) => {
  let p1 = "#J_StrPrice > .tb-rmb-num"
  let price = 0

  if (/item.taobao.com/.test(url)) {
    p1 = "#J_StrPrice > .tb-rmb-num"
  }
  if (/detail.tmall.com/.test(url)) {
    p1 = ".tm-price"
  }

  try {
    await page.waitForSelector(p1)
    price = await page.$eval(p1, ele => {
      // console.log("ele", ele)
      return ele.textContent
    })
  } catch (e) {
    console.log("e1", p1, url)
    try {
      price = await page.$eval(`${p1} < font`, ele => ele.innerHTML)
    } catch (e) {
      console.log("e2", e)
      price = 0
    }
  }
  return price
}

const getSalePrice = async page => {
  if (salePrice === 0) return 0
  const p1 = "#J_PromoPriceNum"
  let price = ""
  try {
    await page.waitForSelector(p1, { timeout: 1000 })
    price = await page.$eval(p1, ele => ele.innerHTML)
  } catch (e) {
    try {
      price = await page.$eval(`${p1} < font`, ele => ele.innerHTML)
    } catch (e) {
      try {
        price = await page.$eval(`${p1} < font < font`, ele => ele.innerHTML)
      } catch (e) {
        price = 0
        salePrice = 0
      }
    }
  }
  return price
}

const getContent = async (page, html, url) => {
  let urls = []
  try {
    await page.waitForSelector("div > p > img")

    urls = await page.$$eval("div > p > img", element => {
      return element.map(item => {
        // const src = item.attribs["data-ks-lazyload"] || item.getAttribute("src")
        const src =
          item.dataset && item.dataset.ksLazyload ? item.dataset.ksLazyload : item.currentSrc
        return src
      })
    })
    // const htmlString = await page.$eval("#J_DivItemDesc", ele => ele.innerHTML)

    // urls = catchSwiper("#J_DivItemDesc", html, true)
  } catch (e) {
    console.log("url-----", url, e)
  }

  return urls
}

const catchSwiper = (ele, html, isContent) => {
  const $ = cheerio.load(html)
  let urls = []
  try {
    let elems = $(ele)
    elems.each(function(i, elem) {
      // if (isContent) console.log("elem222", elem)
      const src = elem.attribs["data-ks-lazyload"] || elem.attribs.src

      if (
        src &&
        checkStr(src, "top_1", false) &&
        checkStr(src, ".gif", false) &&
        checkStr(src, "video", false)
      ) {
        urls.push(src)
      }
    })
  } catch (err) {
    console.log("----", err)
  }
  return urls
}

const getGoodid = url => {
  let id = 0
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
  return id
}

// 获取规格
const getSku = async page => {
  try {
    const skuList = []
    await page.waitForSelector(".J_TSaleProp")
    let categoryGroup = await page.$$(".J_TSaleProp")

    try {
      if (categoryGroup.length === 1) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$("li")

        for (const category1 of categoryUL1LI1) {
          await category1.click()

          const key1 = await page.evaluate(el => el.getAttribute("data-value"), category1)
          const value1 = await page.evaluate(
            el => el.querySelector("a > span").innerText,
            category1
          )
          let image1 = await page.evaluate(
            el => el.querySelector("a").getAttribute("style"),
            category1
          )
          const price = await getPrice(page)

          const salePrice = await getSalePrice(page)

          const stock = await page.$eval("#J_SpanStock", ele => ele.innerText)

          const value = await translate(value1)

          skuList.push({
            key: key1,
            value,
            image: image1 && image1.length > 0 ? optionImageParser(image1) : "",
            price,
            salePrice,
            stock
          })
        }
      } else if (categoryGroup.length === 2) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$("li")

        let i = 0
        for (const category1 of categoryUL1LI1) {
          if (i > 0) {
            await category1.click()
          }

          i++
          const categoryUL2 = categoryGroup[1]
          const categoryUL2LI2 = await categoryUL2.$$("li")
          const key1 = await page.evaluate(el => el.getAttribute("data-value"), category1)
          const value1 = await page.evaluate(
            el => el.querySelector("a > span").innerText,
            category1
          )
          let image1 = await page.evaluate(
            el => el.querySelector("a").getAttribute("style"),
            category1
          )
          for (const category2 of categoryUL2LI2) {
            await category2.click()
            const key2 = await page.evaluate(el => el.getAttribute("data-value"), category2)
            const value2 = await page.evaluate(
              el => el.querySelector("a > span").innerText,
              category2
            )
            let image2 = await page.evaluate(
              el => el.querySelector("a").getAttribute("style"),
              category2
            )

            const price = await getPrice(page)

            const salePrice = await getSalePrice(page)

            const stock = await page.$eval("#J_SpanStock", ele => ele.innerText)

            const value = await translate(`${value1}, ${value2}`)
            skuList.push({
              key: `${key1}|${key2}`,
              value,
              image:
                image1 && image1.length > 0 ? optionImageParser(image1) : optionImageParser(image2),
              price,
              salePrice,
              stock
            })
          }
        }
      }
    } catch (e) {
      console.log("aaaaaaaa", e)
    }

    return skuList
  } catch (e) {}
}

const getAttribute = async page => {
  try {
    await page.waitForSelector("#attributes")

    const attributes = await page.$$eval(".attributes-list > li", elem => {
      const attrArr = elem.map(item => item.innerText)
      return attrArr
    })

    // const korattributes = await translate(page, attributes)
    const returnArr = []
    for (const item of attributes) {
      const attrArr = item.split(":")

      const translateAttr = await translate(item)

      const korAttrArr = translateAttr.split(":")
      returnArr.push({
        key: attrArr[0].trim(),
        value: attrArr[1].trim(),
        korKey: korAttrArr[0].trim(0),
        korValue: korAttrArr[1].trim(0)
      })
    }

    return returnArr
  } catch (e) {
    console.log("getAttribute", e)
  }
}

const find = async ({ browser, url, user }) => {
  const page = await browser.newPage()

  await page.emulate(iPhonex)

  const taobaoCookies = global.taobaoCookies
  if (taobaoCookies && Array.isArray(taobaoCookies)) {
    for (const item of taobaoCookies) {
      await page.setCookie(item)
    }
  }

  page.on("dialog", async dialog => {
    await dialog.accept()
  })

  await page.setJavaScriptEnabled(true)
  await page.goto(url, {
    waitUntil: "networkidle2"
  })

  await loginWindow(page, user)

  await page.waitFor(1000)

  const content = await page.content()

  let objItem
  if (url.includes("taobao.com")) {
    objItem = await findTaobao({ page, html: content, url })
  } else if (url.includes("tmall.com")) {
    objItem = await findTianMao({ page, html: content, url })
  } else {
    console.log("url invalid")
  }

  // await page.goto("about:blank")
  // await page.close()

  // console.log("objItem", objItem)

  objItem.korTitle = await translate(objItem.title)

  return objItem
}

module.exports = find

const loginWindow = async (page, user) => {
  try {
    await page.waitForSelector(".sufei-dialog-content > #sufei-dialog-content", { timeout: 5000 })

    // var frames = await page.frames()
    // console.log("frames", frames[1].name())
    // var myframe = frames.find(f => f.url().indexOf("https://detail.tmall.com") > -1)
    // myframe = frames[1]
    // console.log("myframe", myframe)
    // const iframe = await myframe.$("#sufei-dialog-content")

    // const iframe = await page.$(".sufei-dialog-content > iframe")
    // console.log("iframe", iframe)

    let iframeHandle = await page.$("#sufei-dialog-content")
    let frame = await iframeHandle.contentFrame()
    if (frame) {
      // const elementHandle = await page.$(
      //   ".sufei-dialog-content > iframe[id='sufei-dialog-content']"
      // )

      const accountInfo = await Account.findOne({
        userID: user && user.adminUser ? user.adminUser : "5f0d5ff36fc75ec20d54c40b",
        accountType: 1
      })

      await page.waitFor(1000 + Math.floor(Math.random() * 1000))

      const opts = {
        delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
      }

      await frame.waitForSelector("#fm-login-id")
      await frame.tap("#fm-login-id")
      await frame.type("#fm-login-id", accountInfo.loginID, opts)

      await frame.tap("#fm-login-password")
      await frame.type("#fm-login-password", accountInfo.password, opts)

      await page.waitFor(3000)
      await frame.waitForSelector("#nocaptcha-password")
      const slider = await frame.$eval("#nocaptcha-password", node => node.style)

      if (slider && Object.keys(slider).length) {
        await mouseSlide(frame)
      }

      let loginBtn = await frame.$(".fm-button.fm-submit.password-login")
      await loginBtn.click({
        delay: 20
      })
    }
  } catch (e) {
    console.log("loginWindow", e)
  }
}

const mouseSlide = async frame => {
  let bl = false
  while (!bl) {
    try {
      await frame.hover("#nc_1_n1z")
      await frame.mouse.down()

      await frame.mouse.move(2000, 0, {
        delay: 1000 + Math.floor(Math.random() * 10000) + 1000 + Math.floor(Math.random() * 10000)
      })

      await frame.waitFor(1000 + Math.floor(Math.random() * 1000))
      await frame.mouse.up()

      const slider_again = await frame.$eval(".nc-lang-cnt", node => node.textContent)
      console.log("slider_again", slider_again)
      if (slider_again === `验证通过`) {
        console.log("验证通过")
        return true
      } else {
        console.log("로그인 실패")

        bl = false
        await frame.waitFor(2000 + Math.floor(Math.random() * 1000))
      }
    } catch (e) {
      bl = false
      return false
    }
  }
}
