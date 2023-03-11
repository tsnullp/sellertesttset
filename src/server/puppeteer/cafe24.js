const startBrowser = require("./startBrowser")
const searchNaverKeyword = require("./searchNaverKeyword")
const searchInterParkKeyword = require("./searchInterParkKeyword")
const searchGmarketKeyword = require("./searchGmarketKeyword")
const searchAuctionKeyword = require("./searchAuctionKeyword")
const searchWemakeKeyword = require("./searchWemakeKeyword")
const searchLotteOnKeyword = require("./searchLotteOnKeyword")
const searchTmonKeyword = require("./searchTmonKeyword")
const search11stKeyword = require("./search11stKeyword")
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")

const start = async ({ mallID, password }) => {
  const browser = await startBrowser(false)
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)

  try {
    await page.goto("https://eclogin.cafe24.com/Shop/?mode=mp", { waituntil: "networkidle0" })

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2), //每个字母之间输入的间隔
    }

    await page.tap("#mall_id")
    await page.type("#mall_id", mallID, opts)
    await page.tap("#userpasswd")
    await page.type("#userpasswd", password, opts)
    await page.keyboard.press("Enter")

    await page.waitFor(5000)

    try {
      if (await page.$("#iptBtnEm")) {
        await page.click("#iptBtnEm")
        await page.waitFor(5000)
      }
    } catch {}

    try {
      if (await page.$(".btnClose.eClose")) {
        await page.click(".btnClose.eClose")
        await page.waitFor(5000)
      }
    } catch {}

    // await page.waitForSelector("#QA_Lnb_Menu1553")
    // await page.hover("#QA_Lnb_Menu1553")

    // // await page.mouse.down()
    // await page.click("#QA_Lnb_Menu1553")

    // const marketPage = await browser.newPage()

    // marketPage.on("dialog", async (dialog) => {
    //   if (dialog) {
    //     await dialog.dismiss()
    //   }
    // })

    await page.waitFor(5000)

    await page.goto(
      `https://mp.cafe24.com/mp/product/front/noSale?page=${1}`,
      {
        waituntil: "networkidle0",
      }
    )
    await page.waitFor(3000)
    const total = await page.$eval(
      ".table-top-info > .top-txt-inline > .txt-inline > strong",
      (el) => el.innerText
    )

    const totalPage = Math.ceil(Number(total.replace(/,/gi, "") || 0) / 10)
    for (let i = 1; i <= totalPage; i++) {
      console.log("Page", i , " / ", totalPage)
      try {
        if (i !== 1) {
          await page.goto(
            `https://mp.cafe24.com/mp/product/front/noSale?page=${i}`,
            {
              waituntil: "networkidle0",
            }
          )
        }

        const productList = await getProductID({ page: page })

        for (const item of productList) {
          try {
            if (item.length > 0) {
              await detailProduct({ mallID, page: page, prd_no: item })
            }
          } catch (e) {
            console.log("for Detail -", e)
          }
        }
      } catch (e) {
        console.log("for -", e)
      }
    }
  } catch (e) {
    console.log("cafe24===", e)
  } finally {
    await browser.close()
    console.log("끝")
  }
}

module.exports = start

const getProductID = async ({ page }) => {
  try {
    const productList = await page.$$eval("#eMultiTable > tbody > tr", (element) => {
      return element.map((item) => {
        return item.getAttribute("prd_no")
      })
    })

    return productList.filter((item) => item.length > 0)
  } catch (e) {
    console.log("getProductID", e.message)
    return []
  }
}

const detailProduct = async ({ mallID, page, prd_no }) => {
  try {
    await page.goto(
      `https://${mallID}.shopcafe.cafe24.com/mp/product/front/detail?product_no=${prd_no}`,
      { waituntil: "networkidle0" }
    )

    
    try {
      if (await page.$("#eDetailStep1 > div.modal-pop.notice-pop.modal-categoryUsed.active > div.modal-dialog > div > a")) {
        await page.click("#eDetailStep1 > div.modal-pop.notice-pop.modal-categoryUsed.active > div.modal-dialog > div > a")
      }
    } catch (e) {
      // console.log("e2", e)
    }

    try {
      if (await page.$(".modal-dialog > .modal-outer > div > .page-close.standardPopupClose")) {
        await page.click(".modal-dialog > .modal-outer > div > .page-close.standardPopupClose")
      }
    } catch (e) {
      // console.log("e2", e)
    }
    try {
      if (await page.$(".btnClose.imghostClose")) {
        await page.click(".btnClose.imghostClose")
      }
    } catch (e) {
      // console.log("e1", e)
    }
    
    try {
      if (await page.$("#set_auto_update")) {
        await page.click("#set_auto_update")
      }
    } catch (e) {
      // console.log("e3", e)
    }


   
    const title = await page.$eval("#wrap > div.mBandProductInfo > span", (elem) =>
      elem.innerText.split("/")[0].trim()
    )

    
    
    const categoryGruop = await page.$$(
      // "#wrap > div:nth-child(3) > div:nth-child(4) > div > table > tbody > tr"
      // ".mBoard > table > tbody > tr"
      "#wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr"
    )
    
    let naver, gmarket, auction, interpark, wemake, tmon, sk11st, lotteOn
    for (const item of categoryGruop) {
      await page.$eval("#eInputSearchCategory", (el) => (el.value = ""))
      // #wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr:nth-child(1) > td:nth-child(2) > img
      const market = await page.evaluate(
        (el) => el.querySelector("td:nth-child(2) > img").getAttribute("alt"),
        item
      )
      switch (market) {
        case "G마켓":
          gmarket = true
          break
        case "옥션":
          auction = true
          break
        case "스마트스토어":
          naver = true
          break
        case "인터파크":
          interpark = true
          break
        case "위메프":
          wemake = true
          break
        case "티몬":
          tmon = true
          break
        case "11번가":
          // sk11st = true
          break
        case "롯데ON":
          // lotteOn = true
          break
        default:
          break
      }
    }
    
    const category = await getCategory({
      title,
      naver,
      gmarket,
      auction,
      interpark,
      wemake,
      tmon,
      sk11st,
      lotteOn
    })
    console.log("category", category)
    let i = 0
    let passable = []
    for (const item of categoryGruop) {
      await page.$eval("#eInputSearchCategory", (el) => (el.value = ""))

      const market = await page.evaluate(
        (el) => el.querySelector("td > img").getAttribute("alt"),
        item
      )

      const categoryName = getCategoryName({ category, market })

      if (categoryName.length > 0) {
        await page.type("#eInputSearchCategory", categoryName)
        await page.keyboard.press("Enter")
        await page.waitFor(1000)
        
        await scrollPageToBottom(page)
        // #wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr:nth-child(1) > td.eTdMarketCategory > div:nth-child(2) > div.mBox.typeBg.gScroll.gDoubleBreak > ul > li:nth-child(1) > a
        const categories = await page.$$(
          `#wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr:nth-child(${
            i + 1
          }) > td.eTdMarketCategory > div:nth-child(2) > div.mBox.typeBg.gScroll.gDoubleBreak > ul > li > a`
        )

        let categoryClick = false
        for (const cItem of categories) {
          let category = await cItem.evaluate((el) => {
            // let elements = Array.from(el.querySelectorAll(".txtWarn"))
            // let links = elements.map(element => {
            //   return element.textContent
            // })
            // return links
            // el.querySelectorAll()
            return el.textContent
          }, cItem)
          category = category.replace(/> /gi, "")

          if (category === categoryName || category.includes(categoryName)) {
            categoryClick = true
            await cItem.click()
          }
        }

        // await page.click(
        //   `#wrap > div:nth-child(3) > div:nth-child(4) > div > table > tbody > tr:nth-child(${i +
        //     1}) > td.eTdMarketCategory > div:nth-child(2) > div.mBox.typeBg.gScroll.gDoubleBreak > ul > li > a`
        // )
        // #wrap > div:nth-child(3) > div:nth-child(4) > div > table > tbody > tr:nth-child(1)
        // > td.eTdMarketCategory > div:nth-child(2) > div.mBox.typeBg.gScroll.gDoubleBreak > ul > li:nth-child(3) > a
        await page.waitFor(1000)

        if (categoryClick) {
          passable.push(i)
        } else {
          if (market === "스마트스토어") {
            await page.click(
              `#wrap > div.section > div > div > div:nth-child(4) > div > table > tr:nth-child(${
                i + 1
              }) > td.eTdMarketCategory > div:nth-child(2) > div.mBox.typeBg.gScroll.gDoubleBreak > ul > li > a`
            )
            passable.push(i)
          } else {
            await page.click(
              `#wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr:nth-child(${
                i + 1
              }) > td.center > label > input`
            )
          }
        }
      } else {
        await page.click(
          `#wrap > div.section > div > div > div:nth-child(4) > div > table > tbody > tr:nth-child(${
            i + 1
          }) > td.center > label > input`
        )
      }

      i++
    }

    if (passable.length > 0) {
      await page.click(".eSendDirect")
      await page.waitFor(2000)
    }
  } catch (e) {
    console.log("detailProduct", e.message)
    return null
  }
}

const getCategory = async ({ title, naver, gmarket, auction, interpark, wemake, tmon, sk11st, lotteOn }) => {
  try {
    const category = {}

    const promiseArray = []
    if (naver) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            category.naver = await searchNaverKeyword({ title })
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (gmarket) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            category.gmarket = await searchGmarketKeyword({ title })
            // category.gmarket = await searchNaverKeyword({ title, mall: "24" })
            // if (!category.gmarket) {
            //   category.gmarket = await searchGmarketKeyword({ title })
            // }
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (auction) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            // category.auction = await searchAuctionKeyword({ title })
            category.auction = await searchNaverKeyword({ title, mall: "114" })
            if (!category.auction) {
              category.auction = await searchAuctionKeyword({ title })
            }
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (interpark) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            category.interpark = await searchInterParkKeyword({ title })
            // category.interpark = await searchNaverKeyword({ title, mall: "3" })
            // if (!category.interpark) {
            //   category.interpark = await searchInterParkKeyword({ title })
            // }
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (wemake) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            // category.wemake = await searchWemakeKeyword({ title })
            category.wemake = await searchNaverKeyword({ title, mall: "197023" })
            if (!category.wemake) {
              category.wemake = await searchWemakeKeyword({ title })
            }
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (tmon) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            // category.tmon = await searchTmonKeyword({ title })
            category.tmon = await searchNaverKeyword({ title, mall: "221844" })
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (sk11st) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            // category.sk11st = await search11stKeyword({ title })
            category.sk11st = await searchNaverKeyword({ title, mall: "17703" })
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    if (lotteOn) {
      promiseArray.push(
        new Promise(async (resolve, reject) => {
          try {
            category.lotteOn = await searchLotteOnKeyword({ title })
            // category.interpark = await searchNaverKeyword({ title, mall: "3" })
            // if (!category.interpark) {
            //   category.interpark = await searchInterParkKeyword({ title })
            // }
            resolve()
          } catch (e) {
            reject(e)
          }
        })
      )
    }
    await Promise.all(promiseArray)

    return category
  } catch (e) {
    console.log("getCategory", e.message)
    return null
  }
}

const getCategoryName = ({ category, market }) => {
  let categoryName = ""
  switch (market) {
    case "G마켓":
      if (category && category.gmarket && category.gmarket.category1Name) {
        categoryName = category.gmarket.category1Name
      }
      if (category && category.gmarket && category.gmarket.category2Name) {
        categoryName += ` ${category.gmarket.category2Name}`
      }
      if (category && category.gmarket && category.gmarket.category3Name) {
        categoryName += ` ${category.gmarket.category3Name}`
      }
      if (category && category.gmarket && category.gmarket.category4Name) {
        categoryName += ` ${category.gmarket.category4Name}`
      }
      break
    case "옥션":
      if (category && category.auction && category.auction.category1Name) {
        categoryName = category.auction.category1Name
      }
      if (category && category.auction && category.auction.category2Name) {
        categoryName += ` ${category.auction.category2Name}`
      }
      if (category && category.auction && category.auction.category3Name) {
        categoryName += ` ${category.auction.category3Name}`
      }
      if (category && category.auction && category.auction.category4Name) {
        categoryName += ` ${category.auction.category4Name}`
      }
      break
    case "스마트스토어":
      if (category && category.naver && category.naver.category1Name) {
        categoryName = category.naver.category1Name
      }
      if (category && category.naver && category.naver.category2Name) {
        categoryName += ` ${category.naver.category2Name}`
      }
      if (category && category.naver && category.naver.category3Name) {
        categoryName += ` ${category.naver.category3Name}`
      }
      if (category && category.naver && category.naver.category4Name) {
        categoryName += ` ${category.naver.category4Name}`
      }
      break
    case "인터파크":
      if (category && category.interpark && category.interpark.category1Name) {
        categoryName = category.interpark.category1Name
      }
      if (category && category.interpark && category.interpark.category2Name) {
        categoryName += ` ${category.interpark.category2Name}`
      }
      if (category && category.interpark && category.interpark.category3Name) {
        categoryName += ` ${category.interpark.category3Name}`
      }
      if (category && category.interpark && category.interpark.category4Name) {
        categoryName += ` ${category.interpark.category4Name}`
      }
      break
    case "위메프":
      if (category && category.wemake && category.wemake.category1Name) {
        categoryName = category.wemake.category1Name
      }
      if (category && category.wemake && category.wemake.category2Name) {
        categoryName += ` ${category.wemake.category2Name}`
      }
      if (category && category.wemake && category.wemake.category3Name) {
        categoryName += ` ${category.wemake.category3Name}`
      }
      if (category && category.wemake && category.wemake.category4Name) {
        categoryName += ` ${category.wemake.category4Name}`
      }
      break
    case "티몬":
      if (category && category.tmon && category.tmon.category1Name) {
        categoryName = category.tmon.category1Name
      }
      if (category && category.tmon && category.tmon.category2Name) {
        categoryName += ` ${category.tmon.category2Name}`
      }
      if (category && category.tmon && category.tmon.category3Name) {
        categoryName += ` ${category.tmon.category3Name}`
      }
      if (category && category.tmon && category.tmon.category4Name) {
        categoryName += ` ${category.tmon.category4Name}`
      }
      break
    case "11번가":
      if (category && category.sk11st && category.sk11st.category1Name) {
        categoryName = category.sk11st.category1Name
      }
      if (category && category.sk11st && category.sk11st.category2Name) {
        categoryName += ` ${category.sk11st.category2Name}`
      }
      if (category && category.sk11st && category.sk11st.category3Name) {
        categoryName += ` ${category.sk11st.category3Name}`
      }
      if (category && category.sk11st && category.sk11st.category4Name) {
        categoryName += ` ${category.sk11st.category4Name}`
      }
      break
    case "롯데ON":
      if (category && category.lotteOn && category.lotteOn.category1Name) {
        categoryName = category.lotteOn.category1Name
      }
      if (category && category.lotteOn && category.lotteOn.category2Name) {
        categoryName += ` ${category.lotteOn.category2Name}`
      }
      if (category && category.lotteOn && category.lotteOn.category3Name) {
        categoryName += ` ${category.lotteOn.category3Name}`
      }
      if (category && category.lotteOn && category.lotteOn.category4Name) {
        categoryName += ` ${category.lotteOn.category4Name}`
      }
      break
    default:
      break
  }
  return categoryName
}
