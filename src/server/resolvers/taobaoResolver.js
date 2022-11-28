const taobaoImageSearching = require("../puppeteer/taobaoImageSearchingNew")
const taobaoKeywordSearching = require("../puppeteer/taobaoKeywordSearching")
const taobaoFavoriteSearching = require("../puppeteer/taobaoFavoriteSearching")
const findTaobaoDetailAPI = require("../puppeteer/getTaobaoItemAPI")
const getTaobaoItemNewDetail = require("../puppeteer/getTaobaoItemNewDetail")
const findTaobaoDetailAPIsimple = require("../puppeteer/getTaobaoItemAPIsimple")
const findAmazonDetailAPIsimple = require("../puppeteer/getAmazonItemAPIsimple")
const findTaobaoDetail = require("../puppeteer/getTaobaoItemNew")
const startBrowser = require("../puppeteer/startBrowser")
const taobaoLogin = require("../puppeteer/taobaoLogin")
const addShoppingBag = require("../puppeteer/addShoppingBag")
const taobaoKeywordPageSearching = require("../puppeteer/taobaoKeywordPageSearching")
const { googleTranslate, papagoTranslate, kakaoTranslate } = require("../puppeteer/translate")
const { makeTitle, getAppDataPath } = require("../../lib/usrFunc")
const searchNaverKeyword = require("../puppeteer/searchNaverKeyword")
const search11stKeyword = require("../puppeteer/search11stKeyword")
const searchLotteOnKeyword = require("../puppeteer/searchLotteOnKeyword")
const {getCoupangRelatedKeyword} = require("../puppeteer/keywordSourcing")
const cafe24 = require("../puppeteer/cafe24")
const interpark = require("../puppeteer/interpark")
const moment = require("moment")
const { searchKeywordCategory } = require("../puppeteer/categorySourcing")
const download = require("image-downloader")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const { ImageUpload, ImageList, TaobaoImageUpload, ItemSearchByImage } = require("../api/Taobao")
const { ProductDetails } = require("../api/Amazon")
const { iHerbCode, iHerbDetail } = require("../api/iHerb")
const { NaverKeywordInfo, NaverKeywordRel } = require("../api/Naver")
const { CategoryPredict } = require("../api/Market")
const Cookie = require("../models/Cookie")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const { updateCafe24 } = require("./marketAPIResolver")
const { sleep, AmazonAsin, regExp_test, DimensionArray } = require("../../lib/usrFunc")
const {
  CoupnagGET_PRODUCT_BY_PRODUCT_ID,
  CoupnagUPDATE_PRODUCT,
  CoupangAPPROVE_PRODUCT,
  CouapngDeleteProduct,
  CoupnagSTOP_PRODUCT_SALES_BY_ITEM,
} = require("../api/Market")
const _ = require("lodash")

const { getMainKeyword } = require("../puppeteer/keywordSourcing")

const resolvers = {
  Query: {
    searchTaobaoImage: async (parnet, { imageUrl }, { req, logger }) => {
      try {
        if (!imageUrl) {
          return []
        }
        console.log("searchTaobaoImage 호출", imageUrl)
        const list = await taobaoImageSearching({ imageUrl, user: req.user })

        return list
      } catch (e) {
        logger.error(`searchTaobaoImage: ${e.message}`)
        return []
      }
    },
    searchTaobaoKeyword: async (parnet, { keyword }, { req, logger }) => {
      try {
        if (!keyword) {
          return []
        }

        const list = await taobaoKeywordSearching(keyword, req.user)

        return list
      } catch (e) {
        logger.error(`searchTaobaoKeyword: ${e}`)
        return []
      }
    },
    searchTaobaoDetail: async (
      parent,
      { detailUrl, title, naverID, naverCategoryCode, naverCategoryName },
      { req, model: { Product, Brand }, logger }
    ) => {
      if (!req.user) {
        return null
      }

      try {
        let detailItem = await findTaobaoDetailAPI({
          cnTitle: title,
          url: detailUrl,
          userID: req.user.adminUser,
        })

        if (!detailItem.title) {
          return {
            good_id: null,
          }

          const browser = await startBrowser()
          const page = await browser.newPage()
          detailItem = await findTaobaoDetail({
            page,
            url: detailUrl,
            userID: req.user.adminUser,
          })
          if (page) {
            await page.goto("about:blank")
            await page.close()
          }
          if (browser) {
            await browser.close()
          }
        }

        if (!detailItem) {
          return {
            good_id: null,
          }
        }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = await Brand.find(
          {
            userID: req.user.adminUser,
          },
          { banWord: 1 }
        )

        let titleArr = []
        const korTitle = detailItem.korTitle ? detailItem.korTitle : ""

        titleArr = korTitle.split(" ")
        titleArr = titleArr.map((tItem) => {
          const brandArr = brandList.filter((item) =>
            tItem.toUpperCase().includes(item.brand.toUpperCase())
          )
          const banArr = banList.filter((item) =>
            tItem.toUpperCase().includes(item.banWord.toUpperCase())
          )
          return {
            word: tItem,
            brand: brandArr.length > 0 ? brandArr.map((item) => item.brand) : [],
            ban: banArr.length > 0 ? banArr.map((item) => item.banWord) : [],
          }
        })

        // 출고지
        // const outbound = await Outbound({ userID: req.user.adminUser })
        detailItem.url = detailUrl
        detailItem.naverID = naverID
        if (naverID) {
          detailItem.naverCategoryCode = naverCategoryCode
          detailItem.naverCategoryName = naverCategoryName
        }

        const product = await Product.findOneAndUpdate(
          {
            userID: req.user.adminUser,
            "basic.good_id": detailItem.good_id,
          },
          {
            $set: {
              isDelete: false,
              basic: detailItem,
              createdAt: moment().toDate(),
            },
          },
          {
            upsert: true,
            new: true,
          }
        )

        detailItem.titleArray = titleArr
        detailItem.id = product._id
        detailItem.cafe24_mallID = product.basic.cafe24_mallID ? product.basic.cafe24_mallID : null
        detailItem.cafe24_shop_no = product.basic.cafe24_shop_no
          ? product.basic.cafe24_shop_no
          : null
        detailItem.cafe24_product_no = product.basic.cafe24_product_no
          ? product.basic.cafe24_product_no
          : null
        detailItem.cafe24_mainImage = product.basic.cafe24_mainImage
          ? product.basic.cafe24_mainImage
          : null
        detailItem.coupang_productID = product.basic.coupang_productID
          ? product.basic.coupang_productID
          : null

        return detailItem
      } catch (e) {
        logger.error(`searchTaobaoDetail: ${e.message}`)
        // if (page) {
        //   await page.goto("about:blank")
        //   await page.close()
        // }
        // if (browser) {
        //   await browser.close()
        // }
        return {
          good_id: null,
        }
      } finally {
      }
    },
    favoriteSourcing: async (parent, {}, { req, model: { User, Product }, logger }) => {
      try {
        console.log("favoriteSourcing 호출")
        const response = await taobaoFavoriteSearching({ user: global.user })
      } catch (e) {
        logger.error(`favoriteSourcing: ${e.message}`)
      }
    },
    Test: async (parent, { keyword }, { req, model: { AmazonCollection, Product }, logger }) => {
      try {

        setTimeout(async() => {
          const products = await Product.aggregate([
            {
              $match: {
                "basic.content": ""
              }
            },
            {
              $sort:{
                _id: -1
              }
            }
          ])
          let i = 0
          for(const product of products){
            console.log("상품명--->", `${++i} / ${products.length} `, product.product.korTitle)
            let isSingle =
              product.basic.url.includes("iherb.com") && product.options.length === 1 ? true : false
            let html = ``
            for(const item of product.basic.content.filter(fItem => fItem && fItem.length > 0 && fItem.includes("http"))){
              html += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
            }
            const htmlContent = `${product.product.gifHtml ? product.product.gifHtml : ""}${product.product.topHtml}${
              product.product.isClothes && product.product.clothesHtml
                ? product.product.clothesHtml
                : ""
            }${
              product.product.isShoes && product.product.shoesHtml ? product.product.shoesHtml : ""
            }${product.product.optionHtml}${html}${product.product.bottomHtml}`
  
            const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
              userID: product.userID,
              productID: product.product.coupang.productID,
            })
  
            if (response && response.code === "SUCCESS") {
              for (const item of response.data.items) {
                for (const content of item.contents) {
                  content.contentDetails[0].content = htmlContent
                  // console.log("content.contentDetails[0].content", content.contentDetails[0].content)
                }
              }
  
              // console.log("response", response.data)
              const updateProduct = await CoupnagUPDATE_PRODUCT({
                userID: product.userID,
                product: response.data,
              })
  
              // console.log("response.data", response.data)
              // for (const item of response.data.items){
              //   console.log("item.vendorItemId", item.vendorItemId)
              //   const a = await CoupnagRESUME_PRODUCT_SALES_BY_ITEM({
              //     userID: user,
              //     vendorItemId: item.vendorItemId
              //   })
              //   console.log("*******", a)
              // }
              // console.log("updateProduct", updateProduct)
  
              const approveResponse = await CoupangAPPROVE_PRODUCT({
                userID: product.userID,
                sellerProductId: response.data.sellerProductId,
              })
              // console.log("approveResponse", approveResponse)
              if (updateProduct && updateProduct.code === "SUCCESS") {
                await Product.findOneAndUpdate(
                  {
                    userID: product.userID,
                    _id: ObjectId(product._id),
                  },
                  {
                    $set: {
                      "basic.content": product.basic.content.filter(fItem => fItem && fItem.length > 0 && fItem.includes("http")),
                      "product.html": html,
                    },
                  },
                  { new: true }
                )
              }
            }
  
            // 카페 24
            if (
              product.product.cafe24 &&
              product.product.cafe24.mallID &&
              product.product.cafe24.shop_no
            ) {
              product.product.cafe24_product_no = product.product.cafe24.product_no
              product.product.html = html
              const cafe24Response = await updateCafe24({
                id: product._id,
                isSingle,
                product: product.product,
                options: product.options,
                cafe24: {
                  mallID: product.product.cafe24.mallID,
                  shop_no: product.product.cafe24.shop_no,
                },
                userID: product.userID,
                writerID: product.writerID,
              })
           
            }
          }
          console.log("끝--->")
        }, 1000);
        return false

        await searchLotteOnKeyword({title: keyword})
        return

        let mainKeywordArray = []
        for(const item of keyword.split(" ")) {
          const relKeyword = await getCoupangRelatedKeyword({keyword: item})
          // console.log("relKeyword", relKeyword)

          for (const items of DimensionArray(relKeyword, 5)) {
            const response = await NaverKeywordRel({ keyword: items.join(",") })
            for (const item of items) {
              if (response && response.keywordList) {
                const keywordObj = _.find(response.keywordList, { relKeyword: item.replace(/ /gi, "") })
                if (keywordObj) {
                  mainKeywordArray.push({
                    ...keywordObj,
                    monthlyPcQcCnt: Number(keywordObj.monthlyPcQcCnt.toString().replace("< ", "")),
                    monthlyMobileQcCnt: Number(
                      keywordObj.monthlyMobileQcCnt.toString().replace("< ", "")
                    ),
                  })
                }
              }
            }
          }

          await sleep(200)
          
        }
        mainKeywordArray = mainKeywordArray.sort((a, b) =>  (b.monthlyPcQcCnt + b.monthlyMobileQcCnt) - (a.monthlyPcQcCnt + a.monthlyMobileQcCnt))
        mainKeywordArray = _.unionBy(mainKeywordArray, "relKeyword")
        .filter(item => item.monthlyPcQcCnt + item.monthlyPcQcCnt < 10000)
        .filter((item, index) => index < 20)
        .map(item => item.relKeyword)
        
        console.log("mainKeywordArray", mainKeywordArray, mainKeywordArray.length)
        return

        const amazonCollection = await AmazonCollection.aggregate([
          {
            $match: {
              isDelete: true,
            },
          },
        ])

        let amzonAsin = amazonCollection.map((item) => item.asin)
        console.log("amzonAsin", amzonAsin.length)
        const producttemp = await Product.aggregate([
          {
            $match: {
              isDelete: false,
              "basic.good_id": { $in: amzonAsin },
              userID: ObjectId("624fcac36397b5f40972ed81"),
            },
          },
        ])
        console.log("producttemp", producttemp[0].basic.good_id)
        console.log("producttemp", producttemp)
        return
        // const {recommendTrend: {tags}, relatedTags} = response11.pageProps.initialState
        // console.log("recommendTrend", tags)
        // console.log("relatedTags", relatedTags)
        // return

        const url =
          "https://www.iherb.com/pr/solgar-vitamin-d3-cholecalciferol-250-mcg-10-000-iu-120-softgels/36215"
        const asin = AmazonAsin(url)
        // await iHerbDetail({asin: asin})
        const host = url.replace(asin, "")
        console.log("rrr", asin)

        const response = await iHerbCode({ url })
        console.log("response", response)
        for (const item of response) {
          console.log("item-->", item)
          // await iHerbDetail({asin: item})
        }
        // const response = await ProductDetails({productId: asin})
        // console.log("response", response)

        return true

        // 끝
        const userID = ObjectId("61cd0b79d5ecd34d6cd5115d")

        const basic = await Basic.findOne({
          userID,
        })

        const product = await Product.aggregate([
          {
            $match: {
              userID,
            },
          },
        ])

        // const item = product[0]
        // console.log("item--", item._id)
        //   await Product.findOneAndUpdate(
        //     {
        //       _id: item._id
        //     },
        //     {
        //       $set: {
        //         "product.topHtml": basic.topImage,
        //         "product.bottomHtml": basic.bottomImage,
        //         "product.clothesHtml": item.product.isClothes ? basic.clothImage : item.product.clothesHtml,
        //         "product.shoesHtml": item.product.isShoes ? basic.shoesImage : item.product.shoesHtml,
        //       }
        //     }
        //   )
        for (const item of product) {
          console.log("item", item._id)

          // const htmlContent = `${item.product.topHtml}${
          //   item.product.isClothes && item.product.clothesHtml ? item.product.clothesHtml : ""
          // }${item.product.isShoes && item.product.shoesHtml ? item.product.shoesHtml : ""}${item.product.optionHtml}${
          //   html
          // }${item.product.bottomHtml}`

          const temp = await Product.findOneAndUpdate(
            {
              _id: item._id,
            },
            {
              $set: {
                "product.topHtml": basic.topImage,
                "product.bottomHtml": basic.bottomImage,
                "product.clothesHtml": item.product.isClothes
                  ? basic.clothImage
                  : item.product.clothesHtml,
                "product.shoesHtml": item.product.isShoes
                  ? basic.shoesImage
                  : item.product.shoesHtml,
              },
            },
            {
              new: true,
            }
          )

          if (temp.product.cafe24 && temp.product.cafe24.mallID && temp.product.cafe24.shop_no) {
            temp.product.cafe24_product_no = temp.product.cafe24.product_no

            const cafe24Response = await updateCafe24({
              id: temp._id,
              product: temp.product,
              options: temp.options,
              cafe24: {
                mallID: temp.product.cafe24.mallID,
                shop_no: temp.product.cafe24.shop_no,
              },
              userID: temp.userID,
              writerID: temp.writerID,
            })
            console.log("cafe24Response", cafe24Response)
          }
        }
        console.log("끝")
        return true
      } catch (e) {
        logger.error(`Test: ${e.message}`)
        return false
      }
    },
    GetTaobaoDetailAPI: async (parent, { url, title }, { req, logger }) => {
      try {
        console.log("url", url)
        let detailItem
        if (url.includes("amazon")) {
          detailItem = await findAmazonDetailAPIsimple({
            title,
            url,
            userID: req.user.adminUser,
          })
        } else {
          detailItem = await findTaobaoDetailAPIsimple({
            orginalTitle: title,
            url,
            userID: req.user.adminUser,
          })
        }

        // console.log("detailItem", detailItem)
        let titleArray = []
        const keywordResponse = await searchKeywordCategory({ keyword: detailItem.korTitle })
        if (keywordResponse.intersectionTerms) {
          titleArray.push(...keywordResponse.intersectionTerms.map((mItem) => regExp_test(mItem)))
        }
        if (keywordResponse.terms) {
          titleArray.push(...keywordResponse.terms.map((mItem) => regExp_test(mItem)))
        }
        detailItem.korTitle = titleArray.join(" ")

        return detailItem
      } catch (e) {
        logger.error(`GetTaobaoDetailAPI: ${e}`)
        return null
      }
    },
  },
  Mutation: {
    taobaoLogin: async (
      parent,
      { loginID, password },
      { req, model: { User, Account }, logger }
    ) => {
      if (!req.user) {
        return false
      }
      try {
        const browser = await startBrowser()
        const page = await browser.newPage()
        await page.goto("https://s.taobao.com/search?q=", { waitUntil: "networkidle2" })

        const result = await taobaoLogin(page, loginID, password)

        await browser.close()

        if (result) {
          await Account.findOneAndUpdate(
            {
              userID: req.user.adminUser,
            },
            {
              $set: {
                accountType: 1,
                loginID,
                password,
              },
            },
            { upsert: true }
          )
          return true
        } else {
          return false
        }
      } catch (e) {
        logger.error(`taobaoLogin: ${e}`)
        return false
      }
    },
    onceTaobaoLogin: async (parent, { loginID, password }, { req, model: { Account }, logger }) => {
      if (!req.user) {
        return false
      }

      const browser = await startBrowser()
      try {
        const promiseSellerBoard = new Promise(async (resolve, reject) => {
          try {
            const page2 = await browser.newPage()

            await page2.setDefaultNavigationTimeout(0)
            await page2.setJavaScriptEnabled(true)
            await page2.goto("https://www.sellerboard.co.kr/account/login/", {
              waitUntil: "networkidle2",
            })
            const opts = {
              delay: 6 + Math.floor(Math.random() * 2),
            }
            await page2.tap("#username")
            await page2.type("#username", "jts0509", opts)
            await page2.tap("#password")
            await page2.type("#password", "xotjr313#!#", opts)

            await page2.keyboard.press(String.fromCharCode(13))
            await page2.waitFor(1000)

            const cookies2 = await page2.cookies("https://www.sellerboard.co.kr")
            global.sellerboardCookies = cookies2
            await page2.goto("about:blank")
            await page2.close()
            resolve()
          } catch (e) {
            console.log("promiseSellerBoard--", e)
            reject(e)
          }
        })

        const promises = [promiseSellerBoard]

        await Promise.all(promises)

        await browser.close()

        return true
      } catch (e) {
        logger.error(`onceTaobaoLoin: ${e}`)
        if (browser) {
          await browser.close()
        }
        return false
      }
    },
    AddShoppingBag: async (parent, { url, key1, key2 }, { req, logger }) => {
      try {
        await addShoppingBag({ url, key1, key2 })
      } catch (e) {
        logger.error(`AddShoppingBag: ${e}`)
      }
    },
    TaobaoImageListUrl: async (parent, { imageUrl }, { req, model: { Market }, logger }) => {
      try {
        const market = await Market.findOne({
          userID: req.user.adminUser,
        })

        const today = moment().format("YYYYMMDD")

        const ApiNotUser = async () => {
          const appDataDirPath = getAppDataPath()
          if (!fs.existsSync(appDataDirPath)) {
            fs.mkdirSync(appDataDirPath)
          }

          if (!fs.existsSync(path.join(appDataDirPath, "temp"))) {
            fs.mkdirSync(path.join(appDataDirPath, "temp"))
          }

          const options = {
            url: imageUrl,
            dest: path.join(appDataDirPath, "temp"),
          }

          const { filename } = await download.image(options)

          const form = new FormData()
          form.append("imgfile", fs.createReadStream(filename), {
            filename,
            knownLength: fs.statSync(filename).size,
          })
          let response = null
          const cookies = await Cookie.aggregate([
            {
              $match: {
                name: { $ne: null },
                name: { $ne: "xman_t" },
              },
            },
            {
              $sort: {
                lastUpdate: -1,
              },
            },
          ])
          response = await ImageUpload({
            data: form,
            referer: "https://s.taobao.com/search",
            // cookie: {}
            cookie: cookies[0].cookie,
          })

          return {
            url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
            list: [],
          }

          for (const item of cookies) {
            try {
              response = await ImageUpload({
                data: form,
                referer: "https://s.taobao.com/search",
                // cookie: {}
                cookie: item.cookie,
              })
            } catch (e) {
              console.log("image", e)
            }

            console.log("response-->", response)
            return {
              url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
              list: [],
            }

            if (response && response.status === 1) {
              const imageListResponse = await ImageList({
                tfsid: response.name,
                referer: `https://s.taobao.com/search?imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_${moment().format(
                  "YYYYMMDD"
                )}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
                cookie: item.cookie,
              })
              console.log("imageListResponse ", imageListResponse)
              const temp1 = imageListResponse.split("g_page_config = ")
              if (temp1.length > 1) {
                try {
                  const temp2 = temp1[1].split(";")[0]
                  const imageListParser = JSON.parse(temp2)
                  // console.log("imageListParser", imageListParser.mods.itemlist.data.collections[0].auctions)

                  let productList = imageListParser.mods.itemlist.data.collections[0].auctions.map(
                    (item) => {
                      return {
                        pic_path: `https:${item.pic_url}`,
                        title: item.title,
                        price: item.view_price,
                        sold: item.view_sales.replace("人付款", ""),
                        shop: item.nick,
                        auctionURL: `https:${item.detail_url}`,
                        location: item.item_loc,
                        commentCount: item.comment_count,
                      }
                    }
                  )

                  console.log("productList", productList)
                  if (productList && productList.length > 0) {
                    return {
                      url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
                      list: productList,
                    }
                  }
                } catch (e) {
                  console.log("parseError", e)
                }
              }
            }
            return {
              url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
              list: [],
            }
            if (response && response.error === false) {
              if (
                market &&
                market.taobao &&
                market.taobao.imageKey &&
                market.taobao.imageKey.length > 0
              ) {
                imageResponse = await ItemSearchByImage({
                  img: response.name,
                  imageKey: market.taobao.imageKey,
                })
              }
              console.log("imageResponse -- ", imageResponse)
              if (imageResponse && imageResponse.ret_code === 0) {
                const image_ret_body = JSON.parse(imageResponse.ret_body)
                return {
                  url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${ret_body.image_name}&app=imgsearch`,
                  list: image_ret_body
                    ? image_ret_body.itemsArray.map((item) => {
                        console.log("item-->", item)
                        return {
                          pic_path: item.pic_path,
                          title: item.title,
                          price: item.priceWap,
                          sold: item.sold,
                          totalSold: item.totalSold,
                          commentCount: item.commentCount,
                          iconList: item.iconList,
                          auctionURL:
                            item.iconList === "tmall"
                              ? `https://detail.tmall.com/item.htm?id=${item.item_id}`
                              : `https://item.taobao.com/item.htm?id=${item.item_id}`,
                        }
                      })
                    : [],
                }
              } else {
                return null
                return {
                  url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
                  list: [],
                }
              }
            }
          }
        }

        return ApiNotUser()

        let imagePathResponse
        let imageResponse
        if (
          market &&
          market.taobao &&
          market.taobao.imageKey &&
          market.taobao.imageKey.length > 0
        ) {
          console.time("TaobaoImageUpload")
          imagePathResponse = await TaobaoImageUpload({
            img: imageUrl,
            imageKey: market.taobao.imageKey,
          })
          console.timeEnd("TaobaoImageUpload")
        }

        logger.error(`imageResponse: ${imagePathResponse}`)

        if (imagePathResponse && imagePathResponse.ret_code === 0) {
          const ret_body = JSON.parse(imagePathResponse.ret_body)
          // API 사용
          imageResponse = await ItemSearchByImage({
            img: ret_body.image_name,
            imageKey: market.taobao.imageKey,
          })

          if (imageResponse && imageResponse.ret_code === 0) {
            const image_ret_body = JSON.parse(imageResponse.ret_body)

            return {
              url: `https://s.taobao.com/search?q=&imgfile=&js=1&stats_click=search_radio_all%253A1&initiative_id=staobaoz_${today}&ie=utf8&tfsid=${ret_body.image_name}&app=imgsearch`,
              list: image_ret_body
                ? image_ret_body.itemsArray.map((item) => {
                    return {
                      pic_path: item.pic_path,
                      title: item.title,
                      price: item.priceWap,
                      sold: item.sold,
                      totalSold: item.totalSold,
                      commentCount: item.commentCount,
                      iconList: item.iconList,
                      auctionURL:
                        item.iconList === "tmall"
                          ? `https://detail.tmall.com/item.htm?id=${item.item_id}`
                          : `https://item.taobao.com/item.htm?id=${item.item_id}`,
                    }
                  })
                : [],
            }
          } else {
            return null
            return ApiNotUser()
          }
        } else {
          console.log("imagePathResponse 없음", imagePathResponse)
          console.log("market 없음", market)
          console.time("ApiNotUser")
          return null
          return ApiNotUser()
          console.timeEnd("ApiNotUser")
        }

        return null
      } catch (e) {
        logger.error(`TaobaoImageListUrl: ${e}`)
        return null
      }
    },
    GetTaobaoItem: async (parent, { orderNumber }, { req, model: { TaobaoOrder }, logger }) => {
      try {
        const taobao = await TaobaoOrder.findOne({
          orderNumber,
        })
        // 상품명, 색상, 사이즈, 수량, 단가, 이미지URL, 상품URL
        if (taobao) {
          const returnValue = {
            orderNumber: taobao.orderNumber,
            expressId: taobao.express ? taobao.express.expressId : null,
            orders: taobao.orders
              .filter((item) => item.skuId)
              .map((item) => {
                // console.log("item.options", item.option)
                return {
                  productName: item.productName,
                  thumbnail: item.thumbnail,
                  detail: item.detail,
                  realPrice: item.realPrice,
                  quantity: item.quantity,
                  option: item.option,
                }
              }),
          }
          // console.log("returnValue", returnValue)
          return returnValue
        } else {
          return null
        }

        console.log("taobao", taobao)
        return true
      } catch (e) {
        logger.error(`GetTaobaoItem: ${e}`)
        return null
      }
    },
    GetTaobaoDetailAPI: async (parent, { url, title }, { req, logger }) => {
      try {
        console.log("url", url)
        let detailItem
        if (url.includes("amazon")) {
          detailItem = await findAmazonDetailAPIsimple({
            title,
            url,
            userID: req.user.adminUser,
          })
        } else {
          // detailItem = await getTaobaoItemNewDetail({
          //   orginalTitle: title,
          //   url,
          //   userID: req.user.adminUser,
          // })
          // console.log("detailItem", detailItem)
          detailItem = await findTaobaoDetailAPIsimple({
            orginalTitle: title,
            url,
            userID: req.user.adminUser,
          })
        }
        // console.log("detailItem", detailItem)

        return detailItem
      } catch (e) {
        logger.error(`GetTaobaoDetailAPI: ${e}`)
        return null
      }
    },
  },
}

module.exports = resolvers
