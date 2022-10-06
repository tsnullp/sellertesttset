const startBrowser = require("./startBrowser")
const Product = require("../models/Product")
const qs = require("querystring")
const { ranking, sleep } = require("../../lib/usrFunc")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")
const axios = require("axios")

let productList = []
let product = []

const categorySourcing = async ({ categoryID, userID }) => {
  try {
    productList = []
    product = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(userID),
          isDelete: false,
          product: { $ne: null },
          basic: { $ne: null },
          coupangUpdatedAt: { $ne: null },
          cafe24UpdatedAt: { $ne: null },
          "basic.naverID": { $ne: null },
        },
      },
      {
        $project: {
          basic: 1,
        },
      },
    ])
    const browser = await startBrowser()
    await search({ browser, categoryID })
    await browser.close()

    return productList
  } catch (e) {}

  // console.log("productList -- ", productList)
}

const keywordSourcing = async ({ keyword, userID }) => {
  try {
    productList = []

    product = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(userID),
          isDelete: false,
          product: { $ne: null },
          basic: { $ne: null },
          coupangUpdatedAt: { $ne: null },
          cafe24UpdatedAt: { $ne: null },
          "basic.naverID": { $ne: null },
        },
      },
      {
        $project: {
          basic: 1,
        },
      },
    ])
    const browser = await startBrowser()
    await searchKey({ browser, keyword })

    await browser.close()

    // console.log("productList -- ", productList)

    return productList
  } catch (e) {}
}

const search = async ({ browser, categoryID }) => {
  const pageArr1 = []
  const pageArr2 = []
  for (let i = 1; i < 11; i++) {
    pageArr1.push(i)
  }
  for (let i = 11; i < 21; i++) {
    pageArr2.push(i)
  }

  const arrayPromises1 = pageArr1.map(async (item) => {
    try {
      const page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item,
      })
    } catch (e) {
      console.log("categorySourcing_promises1 - ", e.message)
    }

    // page = null
    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  const arrayPromises2 = pageArr2.map(async (item) => {
    try {
      const page = await browser.newPage()
      await searchCategory({
        page,
        categoryID,
        index: item,
      })
    } catch (e) {
      console.log("categorySourcing_promises2 - ", e.message)
    }

    // page = null
    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  await Promise.all(arrayPromises1)
  await Promise.all(arrayPromises2)
}

const searchKey = async ({ browser, keyword }) => {
  const pageArr1 = []
  const pageArr2 = []
  for (let i = 1; i < 11; i++) {
    pageArr1.push(i)
  }
  for (let i = 11; i < 21; i++) {
    pageArr2.push(i)
  }

  const arrayPromises1 = pageArr1.map(async (item) => {
    let page = await browser.newPage()
    await searchKeyword({
      page,
      keyword,
      index: item,
    })

    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  const arrayPromises2 = pageArr2.map(async (item) => {
    let page = await browser.newPage()
    await searchKeyword({
      page,
      keyword,
      index: item,
    })

    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  await Promise.all(arrayPromises1)
  await Promise.all(arrayPromises2)
}

const searchKeyword = async ({ page, keyword, index = 1 }) => {
  try {
    await page.setDefaultNavigationTimeout(0)
    const URL = `https://search.shopping.naver.com/search/all?sort=rel&pagingIndex=${index}&pagingSize=40&viewType=list&productSet=overseas&deliveryFee=&deliveryTypeValue=&frm=NVSHOVS&query=${qs.escape(
      keyword
    )}&origQuery=${qs.escape(keyword)}&iq=&eq=&xq=&window=`
    //const URL = `http://search.shopping.naver.com/search/all?sort=rel&pagingIndex=${index}&pagingSize=80&productSet=overseas&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${qs.escape(
    //keyword
    //)}&origQuery=${qs.escape(keyword)}&iq=&eq=&xq=`
    await page.goto(URL, { waitUntil: "networkidle0" })

    const data = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script"))
        .filter((elem) => elem.type === "application/json")
        .map((elem) => elem.textContent)
    )

    const filterData = data.filter((item) => item !== null)

    if (filterData.length !== 1) {
      return
    }

    const response = filterData[0]

    const resObj = JSON.parse(response)
    const { list } = resObj.props.pageProps.initialState.products
    // console.log('json = ', list)

    // let dummyData = list.filter(({ item }) => item.openDate >= agoMonth).map(({ item }) => {
    let dummyData = list
      .filter(({ item }) => item.mallName && item.mallName.trim() !== "aliexpress")
      // .filter(({ item }) => !(item.reviewCount === "0" && item.purchaseCnt === "0"))
      .map(({ item }) => {
        let mallName = null
        let logo = null
        if (item.mallInfoCache && item.mallInfoCache.mallLogos) {
          mallName = item.mallInfoCache.name
          logo = item.mallInfoCache.mallLogos.FORYOU
        }

        return {
          imageUrl: item.imageUrl,
          productName: item.productName,
          // openDate: moment(item.openDate, "YYYYMMDDhhmmss").format("YYYY.MM.DD"),
          openDate: item.openDate,
          reviewCount: item.reviewCount,
          hit: item.hit,
          purchaseCnt: item.purchaseCnt,
          lowPrice: item.lowPrice,
          dlvry: item.deliveryFeeContent,
          dlvryCont: item.dlvryCont,
          price: (Number(item.lowPrice) || 0) + (Number(item.deliveryFeeContent) || 0),
          category4Id: item.category4Id,
          category1Name: item.category1Name,
          category2Name: item.category2Name,
          category3Name: item.category3Name,
          category4Name: item.category4Name,
          rank: item.rank,

          // mallId: item.mallId,
          // mallNo: item.mallNo,
          id: item.id,
          mallName: mallName,
          logo: logo,
          crUrl: item.crUrl,
          mallInfoCache: item.mallInfoCache,
          lowMallList: item.lowMallList,
        }
      })

    if (dummyData.length > 0) {
      dummyData.forEach((item) => {
        if (product.filter((savedItem) => savedItem.basic.naverID === item.id).length > 0) {
          item.registered = true
        } else {
          item.registered = false
        }

        const duplication = productList.filter((pItem) => pItem.id === item.id)
        if (duplication.length === 0) {
          delete item.mallInfoCache
          delete item.lowMallList
          // console.log(`${categoryID} - ${index} page => ${item.제목}`)

          productList.push(item)
        } else {
          return
        }
      })

      // console.log('productList=', index, productList.length)
      await page.goto("about:blank")
      await page.close()

      //Math.floor(Math.random() * 10) * 5000 + Math.floor(Math.random() * 1000)
    }
  } catch (e) {
    console.log("searchKeyword ->", e)
  }
}
const searchCategory = async ({ page, categoryID, index = 1 }) => {
  try {
    await page.setDefaultNavigationTimeout(0)

    const URL = `https://search.shopping.naver.com/search/category?catId=${categoryID}&frm=NVSHOVS&pagingIndex=${index}&pagingSize=80&productSet=overseas&query&sort=rel&timestamp=&viewType=list`
    // await page.goto(URL, { waitUntil: 'domcontentloaded' })
    await page.goto(URL, { waitUntil: "networkidle0" })

    const data = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script"))
        .filter((elem) => elem.type === "application/json")
        .map((elem) => elem.textContent)
    )

    const filterData = data.filter((item) => item !== null)

    if (filterData.length !== 1) {
      return
    }

    const response = filterData[0]

    const resObj = JSON.parse(response)
    const { list } = resObj.props.pageProps.initialState.products
    // console.log('json = ', list)

    // let dummyData = list.filter(({ item }) => item.openDate >= agoMonth).map(({ item }) => {

    let dummyData = list
      .filter(({ item }) => item.mallName.trim() !== "aliexpress")
      // .filter(({ item }) => !(item.reviewCount === "0" && item.purchaseCnt === "0"))
      .map(({ item }) => {
        let mallName = null
        let logo = null
        if (item.mallInfoCache && item.mallInfoCache.mallLogos) {
          mallName = item.mallInfoCache.name
          logo = item.mallInfoCache.mallLogos.FORYOU
        }

        return {
          imageUrl: item.imageUrl,
          productName: item.productName,
          // openDate: moment(item.openDate, "YYYYMMDDhhmmss").format("YYYY.MM.DD"),
          openDate: item.openDate,
          reviewCount: item.reviewCount,
          hit: item.hit,
          purchaseCnt: item.purchaseCnt,
          lowPrice: item.lowPrice,
          dlvry: item.deliveryFeeContent,
          dlvryCont: item.dlvryCont,
          price: (Number(item.lowPrice) || 0) + (Number(item.deliveryFeeContent) || 0),
          category4Id: item.category4Id,
          category1Name: item.category1Name,
          category2Name: item.category2Name,
          category3Name: item.category3Name,
          category4Name: item.category4Name,
          rank: item.rank,

          // mallId: item.mallId,
          // mallNo: item.mallNo,
          id: item.id,
          mallName: mallName,
          logo: logo,
          crUrl: item.crUrl,
          mallInfoCache: item.mallInfoCache,
          lowMallList: item.lowMallList,
        }
      })

    if (dummyData.length > 0) {
      dummyData.forEach((item) => {
        if (product.filter((savedItem) => savedItem.basic.naverID === item.id).length > 0) {
          item.registered = true
        } else {
          item.registered = false
        }

        const duplication = productList.filter((pItem) => pItem.id === item.id)
        if (duplication.length === 0) {
          delete item.mallInfoCache
          delete item.lowMallList
          // console.log(`${categoryID} - ${index} page => ${item.제목}`)

          productList.push(item)
        } else {
          return
        }
      })

      // console.log('productList=', index, productList.length)
      // await page.goto("about:blank")
      // await page.close()

      //Math.floor(Math.random() * 10) * 5000 + Math.floor(Math.random() * 1000)
    }

    await page.goto("about:blank")
    await page.close()
  } catch (e) {
    console.log("searchCategory ->", e)
  }

  //I will leave this as an excercise for you to
  //  write out to FS...
}

const searchShippingFee = async ({ url }) => {
  try {
    if (!url || url.length === 0) return 0
    if (!url.includes("search.shopping.naver.com")) {
      return 0
    }
    const browser = await startBrowser(true)
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: "networkidle0" })

    const selector = ".del_price_info > em"
    await page.waitForSelector(selector)
    const lowPrice = await page.$eval(selector, (elem) => elem.innerText)

    // browser.close()
    return Number(lowPrice.replace(",", ""))
  } catch (e) {
    console.log(`searchLowPrice - `, e.message)
    return 0
  }
}

const titleSourcing = async ({ keyword, slow = false }) => {
  productList = []
  const browser = await startBrowser()
  const array = []
  try {
    if (slow) {
      await searchTitleSlow({ browser, keyword })
    } else {
      await searchTitle({ browser, keyword })
    }

    const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
    productList.forEach((item) => {
      const titleArray = item.productName.split(" ")
      titleArray.forEach((item) => {
        if (item.length > 1 && korean.test(item)) {
          array.push(item)
        }
      })
    })

    // console.log("array", array)
  } catch (e) {
  } finally {
    await browser.close()
    return ranking(array)
  }
}

const searchTitleSlow = async ({ browser, keyword }) => {
  productList = []
  const pageArr1 = []
  const pageArr2 = []
  const pageArr3 = []
  const pageArr4 = []
  for (let i = 1; i < 6; i++) {
    pageArr1.push(i)
  }
  for (let i = 6; i < 11; i++) {
    pageArr2.push(i)
  }
  for (let i = 11; i < 16; i++) {
    pageArr3.push(i)
  }
  for (let i = 16; i < 21; i++) {
    pageArr4.push(i)
  }

  const arrayPromises1 = pageArr1.map(async (item) => {
    let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      await page.goto("about:blank")
      await page.close()
    }
  })

  const arrayPromises2 = pageArr2.map(async (item) => {
    let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      await page.goto("about:blank")
      await page.close()
    }
  })

  const arrayPromises3 = pageArr3.map(async (item) => {
    let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      await page.goto("about:blank")
      await page.close()
    }
  })

  const arrayPromises4 = pageArr4.map(async (item) => {
    let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      await page.goto("about:blank")
      await page.close()
    }
  })
  await sleep(2000)
  await Promise.all(arrayPromises1)
  await sleep(2000)
  await Promise.all(arrayPromises2)
  await sleep(2000)
  await Promise.all(arrayPromises3)
  await sleep(2000)
  await Promise.all(arrayPromises4)
  await sleep(2000)
}

const searchTitle = async ({ browser, keyword }) => {
  const pageArr1 = []
  const pageArr2 = []
  for (let i = 1; i < 11; i++) {
    pageArr1.push(i)
  }
  for (let i = 11; i < 21; i++) {
    pageArr2.push(i)
  }

  const arrayPromises1 = pageArr1.map(async (item) => {
    // let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        // page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      // await page.goto("about:blank")
      // await page.close()
    }

    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  const arrayPromises2 = pageArr2.map(async (item) => {
    // let page = await browser.newPage()
    try {
      await searchKeywordTitle({
        // page,
        keyword,
        index: item,
      })
    } catch (e) {
    } finally {
      // await page.goto("about:blank")
      // await page.close()
    }

    // await sleep(500 + Math.floor(Math.random() * 1000))
  })

  await Promise.all(arrayPromises1)
  await Promise.all(arrayPromises2)
}

const searchKeywordTitle = async ({ page, keyword, index = 1 }) => {
  try {
    const content = await axios.get(
      `https://search.shopping.naver.com/api/search/all?sort=rel&pagingIndex=${index}&pagingSize=40&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHOVS&query=${qs.escape(
        keyword
      )}&origQuery=${qs.escape(keyword)}&iq=&eq=&xq=&window=`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
          referer: `https://search.shopping.naver.com/`,
        },
      }
    )

    const jsObj = content.data
    const list = jsObj.shoppingResult.products

    // let dummyData = list.filter(({ item }) => item.openDate >= agoMonth).map(({ item }) => {
    let dummyData = list.map((item) => {
      let manuTag = item.manuTag ? item.manuTag.replace(/,/gi, " ") : ""

      return {
        productName: `${item.productName} ${manuTag}`,
        id: item.id,
      }
    })

    if (dummyData.length > 0) {
      dummyData.forEach((item) => {
        const duplication = productList.filter((pItem) => pItem.id === item.id)
        if (duplication.length === 0) {
          productList.push(item)
        } else {
          return
        }
      })

      // console.log('productList=', index, productList.length)
      // await page.goto("about:blank")
      // await page.close()

      //Math.floor(Math.random() * 10) * 5000 + Math.floor(Math.random() * 1000)
    }
  } catch (e) {
    console.log("searchKeywordTitle ->", e)
  }
}

const coupangStoreSourcing = async ({ url, sort, userID }) => {
  const browser = await startBrowser()
  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    await page.goto(url, { waitUntil: "networkidle0" })

    // 1. 쿠팡 랭킹순
    // 4. 최신순
    // 5. 판매량순
    let index = 1
    if (sort === "latest") {
      index = 4
    } else if (sort === "sale") {
      index = 5
    }

    if (index > 1) {
      await page.click(`#sortingFilter > li:nth-child(${index}) > a`)
    }

    await page.waitFor(1000)

    await {scrollPageToBottom}(page)

    await page.waitFor(1000)

    productList = await page.$$eval("#product-list > li", (element) => {
      return element.map((item) => {
        const detail = item.querySelector("a").getAttribute("href")
        return {
          detail,
          productID: detail.split("vendorItemId=")[1],
          delivery: item.querySelector(".delivery-badge")
            ? item.querySelector(".delivery-badge").textContent
            : "",
          image: `https:${item.querySelector("img").getAttribute("src")}`,
          title: item.querySelector(".title").textContent,
          discount: item.querySelector(".price-discount-percent")
            ? item.querySelector(".price-discount-percent").textContent
            : "",
          productPrice: item.querySelector(".product-price-info > del")
            ? item.querySelector(".product-price-info > del").textContent
            : "",
          salePrice: item.querySelector(".price-value")
            ? item.querySelector(".price-value").textContent
            : "",
        }
      })
    })

    await page.goto("about:blank")
    await page.close()
  } catch (e) {
  } finally {
    await browser.close()

    const product = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(userID),
          isDelete: false,
          product: { $ne: null },
          basic: { $ne: null },
          coupangUpdatedAt: { $ne: null },
          cafe24UpdatedAt: { $ne: null },
          "basic.naverID": { $ne: null },
        },
      },
      {
        $project: {
          basic: 1,
        },
      },
    ])

    productList.forEach((item) => {
      if (product.filter((savedItem) => savedItem.basic.naverID === item.id).length > 0) {
        item.registered = true
      } else {
        item.registered = false
      }
    })

    return productList
  }
}

const naverStoreSourcing = async ({ url }) => {
  const browser = await startBrowser(false)
  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    await page.goto(url, { waitUntil: "networkidle0" })

    // #content > div._3OGRS37K57 > div._3sHwb3LZdd > ul
    productList = await page.$$eval("._3sHwb3LZdd > ._3ba8S41U2S > ._1RT6khg3UQ", (element) => {
      return element.map((item) => {
        const detail = `https://smartstore.naver.com${item.querySelector("a").getAttribute("href")}`
        const productID = detail.split("products/")[1]

        return {
          detail,
          productID,
          image: item.querySelector("img").getAttribute("src"),
          title: item.querySelector("._2lLEGeuRvN").textContent,
          salePrice: item.querySelector("._2zBwQnZPh0")
            ? item.querySelector("._2zBwQnZPh0").textContent
            : "",
        }
      })
    })

    for (const item of productList) {
      let shippingfee = ""
      try {
        shippingfee = await naverShippingFee(item.detail)
      } catch (e) {
      } finally {
        item.shippingfee = shippingfee
      }
    }

    await page.goto("about:blank")
    await page.close()
  } catch (e) {
  } finally {
    await browser.close()
    return productList
  }
}

const naverShippingFee = async (url) => {
  //class="_1_wrVRMvuL"

  let shippingfee = ""
  const browser = await startBrowser(false)
  try {
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    await page.goto(url, { waitUntil: "networkidle0" })

    shippingfee = await page.$eval("._1_wrVRMvuL", (element) => {
      return element.innerText
    })

    await page.goto("about:blank")
    await page.close()
  } catch (e) {
  } finally {
    await browser.close()
    return shippingfee
  }
}

const searchKeywordCategory = async ({ keyword }) => {
  let productList = []
  try {
    const content = await axios.get(
      `https://msearch.shopping.naver.com/api/search/all?query=${encodeURI(
        keyword
      )}&cat_id=&frm=NVSHATC&productSet=total&`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Mobile Safari/537.36",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
          referer: `https://msearch.shopping.naver.com/search/all`,
        },
      }
    )

    const jsObj = content.data
    const { intersectionTerms, terms, products, cmpOrg, nluTerms } = jsObj.shoppingResult
    if (products && Array.isArray(products)) {
      // let dummyData = list.filter(({ item }) => item.openDate >= agoMonth).map(({ item }) => {
      let dummyData = products.map((item) => {
        let manuTag = item.manuTag ? item.manuTag.replace(/,/gi, " ") : ""

        return {
          manuTag: item.manuTag,
          productName: `${item.productName}`,
          id: item.id,
        }
      })

      if (dummyData.length > 0) {
        dummyData.forEach((item) => {
          const duplication = productList.filter((pItem) => pItem.id === item.id)
          if (duplication.length === 0) {
            productList.push(item)
          } else {
            return
          }
        })
      }
    }

    return {
      list: productList,
      cmpOrg,
      nluTerms,
      intersectionTerms,
      terms,
    }
  } catch (e) {
    console.log("keyword", keyword)
    // console.log("searchKeywordTitle ->", e)
    return {
      list: productList,
      cmpOrg: null,
      nluTerms: null,
      intersectionTerms: null,
      terms: null,
    }
  }
}

module.exports = {
  categorySourcing,
  keywordSourcing,
  searchShippingFee,
  titleSourcing,
  coupangStoreSourcing,
  naverStoreSourcing,
  searchKeywordCategory,
}
