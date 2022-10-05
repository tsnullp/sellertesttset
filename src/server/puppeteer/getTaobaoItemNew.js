const cheerio = require("cheerio")
const Market = require("../models/Market")
const Cookie = require("../models/Cookie")
const Account = require("../models/Account")
const Basic = require("../models/Basic")
const { Outbound, ReturnShippingCenter, CategoryPredict, CategoryMeta } = require("../api/Market")
const { checkStr, thumbImageParser, optionImageParser } = require("../../lib/usrFunc")
const {
  TaobaoDetailOption,
  TaobaoDetailImage,
  TMallOptionApi,
  ItemSKU
} = require("../api/Taobao")
const { korTranslate } = require("./translate")

let salePrice = null

const start = async ({ page, url, userID }) => {
  const ObjItem = {
    brand: "기타",
    good_id: "",
    title: "",
    mainImages: [],
    price: 0,
    salePrce: 0,
    content: [],
    options: [],
    attribute: [],
    shipping: {},
    returnCenter: {},
    vendorId: "",
    vendorUserId: "",
    invoiceDocument: "",
    maximumBuyForPerson: "",
    maximumBuyForPersonPeriod: "",
    cafe24_mallID: "",
    cafe24_shop_no: ""
  }

  try {
    // await page.setJavaScriptEnabled(true)

    const promiseArr = [
      new Promise(async (resolve, reject) => {
        try {
          await page.setJavaScriptEnabled(true)
          await page.goto(url, { waitUntil: "networkidle0" })

          // await loginWindow(page, userID)
          await page.waitFor(1000)

          const {
            itemId,
            brand,
            title,
            mainImages,
            content,
            price,
            skuQuantity,
            originalPrice,
            promotionPrice
          } = await getBasicInfo(page)

          ObjItem.good_id = itemId
          if (brand) {
            ObjItem.brand = brand
          }
          ObjItem.title = title
          ObjItem.price = price
          ObjItem.mainImages = mainImages
          ObjItem.content = content

          if (!ObjItem.mainImages || ObjItem.mainImages.length === 0) {
            ObjItem.mainImages = await getMainImage(page)
          }
          ObjItem.options = await getOptions({
            itemId,
            page,
            skuQuantity,
            originalPrice,
            promotionPrice,
            mainImage: ObjItem.mainImages[0]
          })

          ObjItem.salePrce = ObjItem.options[0] ? ObjItem.options[0].price : 0

          ObjItem.attribute = await getAttribute(page)
          let brandArr = ObjItem.attribute.filter(item => item.key === "品牌")
          if (brandArr.length > 0) {
            ObjItem.brand = await korTranslate(brandArr[0].value)
          }
          ObjItem.manufacture = ObjItem.brand
          const manufactureArr = ObjItem.attribute.filter(item => item.key === "生产企业")
          if (manufactureArr.length > 0) {
            ObjItem.manufacture = await korTranslate(manufactureArr[0].value)
          }
          if (!ObjItem.title || ObjItem.title.length === 0) {
            ObjItem.title = await getTitle(page)
          }

          ObjItem.korTitle = await korTranslate(ObjItem.title.trim())

          const {
            categoryCode,
            attributes,
            noticeCategories,
            requiredDocumentNames,
            certifications
          } = await getCategoryInfo({ userID, korTitle: ObjItem.korTitle })

          ObjItem.categoryCode = categoryCode
          ObjItem.attributes = attributes
          ObjItem.noticeCategories = noticeCategories
          ObjItem.requiredDocumentNames = requiredDocumentNames
          ObjItem.certifications = certifications

          resolve()
        } catch (e) {
          reject(e)
        }
      }),

      new Promise(async (resolve, reject) => {
        try {
          const {
            shipping,
            returnCenter,
            vendorId,
            vendorUserId,
            invoiceDocument,
            maximumBuyForPerson,
            maximumBuyForPersonPeriod,
            cafe24_mallID,
            cafe24_shop_no
          } = await getShippingInfo({ userID })
          ObjItem.shipping = shipping
          ObjItem.returnCenter = returnCenter
          ObjItem.vendorId = vendorId
          ObjItem.vendorUserId = vendorUserId
          ObjItem.invoiceDocument = invoiceDocument
          ObjItem.maximumBuyForPerson = maximumBuyForPerson
          ObjItem.maximumBuyForPersonPeriod = maximumBuyForPersonPeriod
          ObjItem.cafe24_mallID = cafe24_mallID
          ObjItem.cafe24_shop_no = cafe24_shop_no
          resolve()
        } catch (e) {
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const {
            afterServiceInformation,
            afterServiceContactNumber,
            topImage,
            bottomImage
          } = await getBasicItem({ userID })
          ObjItem.afterServiceInformation = afterServiceInformation
          ObjItem.afterServiceContactNumber = afterServiceContactNumber
          ObjItem.topImage = topImage
          ObjItem.bottomImage = bottomImage
          resolve()
        } catch (e) {
          reject()
        }
      })
    ]

    await Promise.all(promiseArr)
    // console.log("ObjItem", ObjItem.options)
  } catch (e) {
    console.log("taobaoDetailNew", e)
    return null
  } finally {
    return ObjItem
  }
}

module.exports = start

const getBasicInfo = async page => {
  const obj = {}
  try {
    const content = await page.content()
    if (/item.taobao.com/.test(page.url())) {
      // 타오바오

      obj.itemId = content
        .split("itemId           : '")[1]
        .split("',")[0]
        .trim()
      obj.sellerId = content
        .split("sellerId         : '")[1]
        .split("',")[0]
        .trim()
      obj.shopId = content
        .split("shopId           : '")[1]
        .split("',")[0]
        .trim()
      const auctionImage = content
        .split("auctionImages    : ")[1]
        .split("},")[0]
        .trim()

      obj.mainImages = JSON.parse(auctionImage).map(item => {
        return item
      })

      if (Array.isArray(obj.mainImages)) {
        obj.mainImages = obj.mainImages
          .filter(
            item =>
              checkStr(item, "top_1", false) &&
              checkStr(item, ".gif", false) &&
              checkStr(item, "video", false)
          )
          .map(item => {
            return thumbImageParser(item)
          })
      }

      const detailImageUrl = `http:${
        content
          .split("descUrl          : ")[1]
          .split("' ? '")[1]
          .split("' : '")[0]
      }`

      const response = await TaobaoDetailImage({ path: detailImageUrl })
      const detailHtml = response.replace("var desc='", "").replace("';", "")
      const $ = cheerio.load(detailHtml)
      $("img").each((i, elem) => {
        if (!obj.content) {
          obj.content = []
        }
        const image = $(elem).attr("src")
        if (!image.includes("160x160")) {
          obj.content.push($(elem).attr("src"))
        }
      })

      if (Array.isArray(obj.content)) {
        obj.content = obj.content
          .filter(
            item =>
              checkStr(item, "top_1", false) &&
              checkStr(item, ".gif", false) &&
              checkStr(item, "video", false)
          )
          .map(item => {
            return thumbImageParser(item)
          })
      }

      const cookies = await Cookie.find({}).sort({lastUpdate: -1})
      let parserReponse = {}
      for (const item of cookies) {
        const taobaoOtpion = await TaobaoDetailOption({
          sellerId: obj.sellerId,
          itemId: obj.itemId,
          referer: page.url(),

          cookie: item.cookie
          //"t=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; ucn=unsh; thw=cn; enc=N8mRI68%2Fet0iczcYgnerVbaKlGoXGY1iXrF5jkll9ec%2F1tg1nqZBbFovxOMaiC4mS%2FP2t8ek0bOOIEG2fd51n0TMSp8ySABkPdMvOYjO1io%3D; cookie2=21785ebb765546c1f9e4f0575f6eb95d; _samesite_flag_=true; hng=KR%7Czh-CN%7CKRW%7C410; xlly_s=1; _m_h5_tk=3be812ca23a01ec10e1821986d0619d9_1609443525261; _m_h5_tk_enc=18c266fb4d317544d8a494ca19dbba56; x5sec=7b2264657461696c736b69703b32223a226365643066326630316334633062306162363265383834643039616166623464434f62497550384645502f392f66752f734d756430514561447a49794d44637a4d44417a4d7a6b774f4455374d513d3d227d; tracknick=; _tb_token_=30698eb8a53ed; cna=j79NGCkRCxICAXmpnyfLoxWm; uc1=cookie14=Uoe0ZNJoXe5JqA%3D%3D; v=0; mt=ci%3D-1_0; isg=BLGxbPvgSq4ZwOaMj5qoKGsowDtLniUQRyO-N5PGrXiXutEM2-414F_T3Fbccr1I; l=eBawkjkgOWQJM9b0BOfwourza77OSIRAguPzaNbMiOCP_eCB5fbGWZ-e66Y6C3MNh6bHR38WwOn8BeYBcBdKnxv9robX_Ckmn; tfstk=cH1FBuMWAQj6Z4d7HBOrFqql4YQdae_l8f8XKTG5YffIs0vH0s4q2F455F8WD5vh."
        })
       
        parserReponse = JSON.parse(
          taobaoOtpion
            .replace("onSibRequestSuccess(", "")
            .replace(")", "")
            .replace(/;/gi, "")
        )

        if (parserReponse.code && parserReponse.code.code === 0) {
          break
        }
      }

      if (parserReponse.code && parserReponse.code.code === 0) {
        obj.skuQuantity = parserReponse.data.dynStock
        obj.originalPrice = parserReponse.data.originalPrice
        obj.promotionPrice = parserReponse.data.promotion
      }
    } else if (/detail.tmall.com/.test(page.url())) {
      // 티몰
      const tshopSetup = content
        .split("TShop.Setup(")[1]
        .split(")")[0]
        .trim()

      const tShopSetupObj = JSON.parse(tshopSetup)
      obj.itemId = tShopSetupObj.rateConfig.itemId
      obj.shopId = tShopSetupObj.rstShopId
      obj.price = tShopSetupObj.itemDO.reservePrice
      obj.title = tShopSetupObj.itemDO.title
      obj.brand = tShopSetupObj.itemDO.brand

      if (tShopSetupObj.propertyPics && tShopSetupObj.propertyPics.default) {
        obj.mainImages = tShopSetupObj.propertyPics.default.map(item => {
          return item
        })

        if (Array.isArray(obj.mainImages)) {
          obj.mainImages = obj.mainImages
            .filter(
              item =>
                checkStr(item, "top_1", false) &&
                checkStr(item, ".gif", false) &&
                checkStr(item, "video", false)
            )
            .map(item => {
              return thumbImageParser(item)
            })
        }
      }

      obj.skuMap = tShopSetupObj.valItemInfo.skuMap

      // 옵션가져오는거
      const initApi = `https:${tShopSetupObj.initApi}`
      // 상세이미지
      const detailImageUrl = `https:${tShopSetupObj.api.descUrl}`

      const response = await TaobaoDetailImage({ path: detailImageUrl })

      const detailHtml = response.replace("var desc='", "").replace("';", "")
      const $ = cheerio.load(detailHtml)
      $("img").each((i, elem) => {
        if (!obj.content) {
          obj.content = []
        }
        const image = $(elem).attr("src")
        if (!image.includes("160x160")) {
          obj.content.push($(elem).attr("src"))
        }
      })

      if (Array.isArray(obj.content)) {
        obj.content = obj.content
          .filter(
            item =>
              checkStr(item, "top_1", false) &&
              checkStr(item, ".gif", false) &&
              checkStr(item, "video", false)
          )
          .map(item => {
            return thumbImageParser(item)
          })
      }

      const cookies = await Cookie.find({}).sort({lastUpdate: -1})
      let optionResponse

      for (const item of cookies) {
        optionResponse = await TMallOptionApi({
          path: initApi,
          referer: "https://detail.tmall.com/",
          cookie: item.cookie
          // "t=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; ucn=unsh; thw=cn; enc=N8mRI68%2Fet0iczcYgnerVbaKlGoXGY1iXrF5jkll9ec%2F1tg1nqZBbFovxOMaiC4mS%2FP2t8ek0bOOIEG2fd51n0TMSp8ySABkPdMvOYjO1io%3D; cna=j79NGCkRCxICAXmpnyfLoxWm; v=0; cookie2=21785ebb765546c1f9e4f0575f6eb95d; _samesite_flag_=true; lgc=jts0509; dnk=jts0509; tracknick=jts0509; hng=KR%7Czh-CN%7CKRW%7C410; xlly_s=1; _m_h5_tk=3be812ca23a01ec10e1821986d0619d9_1609443525261; _m_h5_tk_enc=18c266fb4d317544d8a494ca19dbba56; _tb_token_=fe651b5f6778f; sgcookie=E100UrpQ5jfGnI8eJu7cwYgPfYn1WbVagnNJeDduFrF9i8xM6H%2FtS6c4Ws124AhYlga%2FamrrKCRxGBt97ttSpqTEAQ%3D%3D; unb=2207300339085; uc3=vt3=F8dCuAAlhr1ixodgah8%3D&lg2=U%2BGCWk%2F75gdr5Q%3D%3D&id2=UUphzWRZCaiqizmAkQ%3D%3D&nk2=CccE4wq4pw%3D%3D; csg=85fc7310; cookie17=UUphzWRZCaiqizmAkQ%3D%3D; skt=f7469b8beeaedaf8; existShop=MTYwOTQzNjU0NA%3D%3D; uc4=id4=0%40U2grFntxu75mpt7f6fu8iZvQ6ucCKAYD&nk4=0%40C%2Fhu2h%2FMaWb%2FULRZbmKuIXLI; _cc_=UtASsssmfA%3D%3D; _l_g_=Ug%3D%3D; sg=958; _nk_=jts0509; cookie1=BdS%2FtXhWEqadCcpzZxGKJEbBgAhyyRMkmWxwUd5gSfQ%3D; x5sec=7b2264657461696c736b69703b32223a2234306666303964376563643437313164373831326439633537313566383937634349476275503846454a692f6e75334f324e2f6d57526f504d6a49774e7a4d774d444d7a4f5441344e547378227d; mt=ci=0_1; uc1=cart_m=0&existShop=false&cookie15=UtASsssmOIJ0bQ%3D%3D&cookie16=UtASsssmPlP%2Ff1IHDsDaPRu%2BPw%3D%3D&pas=0&cookie14=Uoe0ZNJv71WqSQ%3D%3D&cookie21=UIHiLt3xSalX; isg=BAAA9m2oSy07sTcfpm3JizKn0YjSieRTDlxPRHqRv5uu9aEfIpr94g7MDUU1xZwr; l=eBawkjkgOWQJMO0-BOfZlurza779DIRfguPzaNbMiOCPOU5J53SCWZ-emoTvCnMNn6rvR38WwOn8B48i8yz10xv9-eGBs2JNMdTh.; tfstk=cDJFBmV5RTY6yuWSM96zNlm9ecDdaMxkYRSftQwzKvm0GY5NusV4yGmWfGS5kAfh."
        })

        if (optionResponse.defaultModel) {
          obj.skuMap = tShopSetupObj.valItemInfo.skuMap
          obj.skuQuantity = {}
          //optionResponse.defaultModel.inventoryDO.skuQuantity

          obj.originalPrice = {}
          obj.promotionPrice = {}
          //optionResponse.defaultModel.itemPriceResultDO.priceInfo

          for (const [key, value] of Object.entries(obj.skuMap)) {
            const tempKey = key.replace(/;/gi, "")

            if (optionResponse.defaultModel.inventoryDO.skuQuantity[value.skuId]) {
              obj.skuQuantity[tempKey] =
                optionResponse.defaultModel.inventoryDO.skuQuantity[value.skuId]
            }

            if (optionResponse.defaultModel.itemPriceResultDO.priceInfo[value.skuId]) {
              obj.originalPrice[tempKey] =
                optionResponse.defaultModel.itemPriceResultDO.priceInfo[value.skuId]
            }

            if (optionResponse.defaultModel.itemPriceResultDO.priceInfo[value.skuId]) {
              obj.promotionPrice[tempKey] =
                optionResponse.defaultModel.itemPriceResultDO.priceInfo[value.skuId].promotionList
            }
          }
          break
        }
      }
    }
  } catch (e) {
    console.log("getBasicInfo", e)
  } finally {
    return obj
  }
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
  return title.trim()
  // return await translate(page, trim(title))
}

const getMainImage = async page => {
  const returnArr = []
  try {
    const mainImage = await page.$eval("#J_ImgBooth", ele => {
      return ele.getAttribute("src").trim()
    })

    const subImages = await page.$$eval("#J_UlThumb > li", element => {
      return element.map(ele => {
        return ele.querySelector("a > img").getAttribute("src")
      })
    })

    returnArr.push(thumbImageParser(mainImage))
    returnArr.push(
      ...subImages
        .filter(
          item =>
            checkStr(item, "top_1", false) &&
            checkStr(item, ".gif", false) &&
            checkStr(item, "video", false)
        )
        .map(item => {
          return thumbImageParser(item)
        })
    )
  } catch (e) {
    console.log("getmainImage", e)
  } finally {
    return returnArr
  }
}
const getAttribute = async page => {
  const returnArr = []
  try {
    let seletor = ""
    if (/item.taobao.com/.test(page.url())) {
      seletor = ".attributes-list > li"
    } else if (/detail.tmall.com/.test(page.url())) {
      seletor = "#J_AttrUL > li"
    }

    const attributes = await page.$$eval(seletor, elem => {
      const attrArr = elem.map(item => item.innerText)
      return attrArr
    })
    for (const item of attributes) {
      let attrArr
      attrArr = item.split(":")

      if (attrArr.length === 2) {
        returnArr.push({
          key: attrArr[0].trim(),
          value: attrArr[1].trim()
        })
      } else {
        attrArr = item.split("：")
        if (attrArr.length === 2) {
          returnArr.push({
            key: attrArr[0].trim(),
            value: attrArr[1].trim()
          })
        }
      }
    }
    return returnArr
  } catch (e) {
    console.log("getAttribute", e)
  } finally {
    return returnArr
  }
}


const getOptions = async ({ page, itemId, skuQuantity, originalPrice, promotionPrice, mainImage }) => {
  try {
    let tempOption = []

    
    if (!skuQuantity) {
      
      console.log("itemId", itemId)
      const response = await ItemSKU({num_iid: itemId})
      
      const {prop, skus, sku_base} = response

      for(const item of prop) {
        for(const value of item.values){
          var regExp = /[A-Za-z0-9]/
            if(regExp.test(value.name)){
              value.korValue = value.name.trim()
            } else {
              value.korValue = await korTranslate(value.name.trim())
            }
        }
      }

      for(const sku of sku_base.skus){

        const propPath = sku.propPath.substring(1, sku.propPath.length -1)
        const propPathArr = propPath.split(";")
        let value = ``
        let korValue = ``
        let image = null
        for(const path of propPathArr){
          if(path.split(":").length === 2){
            const pid = path.split(":")[0]
            const vid = path.split(":")[1]
            const propsValue = prop.filter(item => item.pid === pid)[0].values.filter(item => item.vid === vid)[0]
            value += `${propsValue.name} `
            korValue += `${propsValue.korValue} `
            if(propsValue.image){
              image = `https:${propsValue.image}`
            }
          }
        }
        tempOption.push({
          key: sku.skuId,
          value: value.trim(),
          korValue: korValue.trim(),
          image,
          price: skus[sku.skuId].promotion_price ? skus[sku.skuId].promotion_price :skus[sku.skuId].price,
          stock: skus[sku.skuId].quantity,
          disabled: false,
          active: true
        })
      }

      
      return tempOption
    }

    const options = await page.$$eval(".J_TSaleProp", elem => {
      const optionsRootArray = []
      for (let rootIndex = 0; rootIndex < elem.length; rootIndex++) {
        const optionArray = []
        for (let index = 0; index < elem[rootIndex].querySelectorAll("ul > li").length; index++) {
          const key = elem[rootIndex].querySelectorAll("ul > li")[index].getAttribute("data-value")
          const value = elem[rootIndex].querySelectorAll("ul > li")[index].querySelector("a > span")
            .textContent

          const style = elem[rootIndex]
            .querySelectorAll("ul > li")
            [index].querySelector("a")
            .getAttribute("style")
          console.log("style", style)
          let image = null
          if (style && style.includes("background:url")) {
            image = `http:${
              style
                .replace("background:url(", "")
                .split("_30x30.jpg")[0]
                .split("_40x40q90.jpg")[0]
            }`
          }
          optionArray.push({
            key,
            value,
            image
          })
        }
        optionsRootArray.push(optionArray)
      }
      return optionsRootArray
    })
    
    if (options.length === 1) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )

      options[0].forEach(firstItem => {
        tempOption.push({
          key: firstItem.key,
          value: firstItem.value,
          korValue: firstItem.korValue,
          image: firstItem.image ? firstItem.image : mainImage
        })
      })
    } else if (options.length === 2) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[1].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )

      options[0].forEach(firstItem => {
        options[1].forEach(secondItem => {
          tempOption.push({
            key: `${firstItem.key}${secondItem.key}`,
            value: `${firstItem.value} ${secondItem.value}`,
            korValue: `${firstItem.korValue} ${secondItem.korValue}`,
            image: firstItem.image
              ? firstItem.image
              : secondItem.image
              ? secondItem.image
              : mainImage
          })
        })
      })
    } else if (options.length === 3) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[1].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[2].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      options[0].forEach(firstItem => {
        options[1].forEach(secondItem => {
          options[2].forEach(thirdItem => {
            tempOption.push({
              key: `${firstItem.key}${secondItem.key}${thirdItem.key}`,
              value: `${firstItem.value} ${secondItem.value} ${thirdItem.value}`,
              korValue: `${firstItem.korValue} ${secondItem.korValue} ${thirdItem.korValue}`,
              image: firstItem.image
                ? firstItem.image
                : secondItem.image
                ? secondItem.image
                : thirdItem.image
                ? thirdItem.image
                : mainImage
            })
          })
        })
      })
    }

    if (/item.taobao.com/.test(page.url())) {
      if (tempOption.length === 0) {
        tempOption = [
          {
            korValue: "단일상품",
            image: mainImage,
            stock: skuQuantity.stock ? skuQuantity.stock : 0,
            active: true,
            disabled: false,
            price:
              promotionPrice.promoData && promotionPrice.promoData.def
                ? promotionPrice.promoData.def[0].price
                : originalPrice.def
                ? originalPrice.def.price
                : 0
          }
        ].filter(item => item.stock > 0)
      } else {
        tempOption = tempOption
          .map(item => {
            let price = originalPrice[item.key].price
            if (promotionPrice.promoData[item.key]) {
              const promoData = Object.values(promotionPrice.promoData[item.key])
              price = promoData[promoData.length - 1].price
            }

            return {
              ...item,
              stock: skuQuantity.sku[item.key] ? skuQuantity.sku[item.key].stock : 0,
              price,
              disabled: false,
              active: true
            }
          })
          .filter(item => item.stock > 0)
      }
    } else if (/detail.tmall.com/.test(page.url())) {
      // skuQuantity, originalPrice, promotionPrice

      tempOption = tempOption
        .map(item => {
          return {
            ...item,
            stock: skuQuantity[item.key] ? skuQuantity[item.key].quantity : 0,
            price: promotionPrice[item.key]
              ? promotionPrice[item.key][promotionPrice[item.key].length - 1].price
              : originalPrice[item.key]
              ? originalPrice[item.key].price
              : 0,
            disabled: false,
            active: true
          }
        })
        .filter(item => item.stock > 0)
    }

    return tempOption
  } catch (e) {
    console.log("getOptios", e)
    return []
  }
}

const getOptionsTemp = async ({ url, page, skuQuantity, originalPrice, promotionPrice, mainImage }) => {
  try {
    if (!skuQuantity) {

      console.log("타오바오 옵션 실패")

      const op = await getSku(page, url)
      console.log("op", op)
      return op
     
    }

    const options = await page.$$eval(".J_TSaleProp", elem => {
      const optionsRootArray = []
      for (let rootIndex = 0; rootIndex < elem.length; rootIndex++) {
        const optionArray = []
        for (let index = 0; index < elem[rootIndex].querySelectorAll("ul > li").length; index++) {
          const key = elem[rootIndex].querySelectorAll("ul > li")[index].getAttribute("data-value")
          const value = elem[rootIndex].querySelectorAll("ul > li")[index].querySelector("a > span")
            .textContent

          const style = elem[rootIndex]
            .querySelectorAll("ul > li")
            [index].querySelector("a")
            .getAttribute("style")
          console.log("style", style)
          let image = null
          if (style && style.includes("background:url")) {
            image = `http:${
              style
                .replace("background:url(", "")
                .split("_30x30.jpg")[0]
                .split("_40x40q90.jpg")[0]
            }`
          }
          optionArray.push({
            key,
            value,
            image
          })
        }
        optionsRootArray.push(optionArray)
      }
      return optionsRootArray
    })
    let tempOption = []
    if (options.length === 1) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )

      options[0].forEach(firstItem => {
        tempOption.push({
          key: firstItem.key,
          value: firstItem.value,
          korValue: firstItem.korValue,
          image: firstItem.image ? firstItem.image : mainImage
        })
      })
    } else if (options.length === 2) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[1].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )

      options[0].forEach(firstItem => {
        options[1].forEach(secondItem => {
          tempOption.push({
            key: `${firstItem.key}${secondItem.key}`,
            value: `${firstItem.value} ${secondItem.value}`,
            korValue: `${firstItem.korValue} ${secondItem.korValue}`,
            image: firstItem.image
              ? firstItem.image
              : secondItem.image
              ? secondItem.image
              : mainImage
          })
        })
      })
    } else if (options.length === 3) {
      await Promise.all(
        options[0].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[1].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      await Promise.all(
        options[2].map(async item => {
          item.korValue = await korTranslate(item.value.trim())
        })
      )
      options[0].forEach(firstItem => {
        options[1].forEach(secondItem => {
          options[2].forEach(thirdItem => {
            tempOption.push({
              key: `${firstItem.key}${secondItem.key}${thirdItem.key}`,
              value: `${firstItem.value} ${secondItem.value} ${thirdItem.value}`,
              korValue: `${firstItem.korValue} ${secondItem.korValue} ${thirdItem.korValue}`,
              image: firstItem.image
                ? firstItem.image
                : secondItem.image
                ? secondItem.image
                : thirdItem.image
                ? thirdItem.image
                : mainImage
            })
          })
        })
      })
    }

    if (/item.taobao.com/.test(page.url())) {
      if (tempOption.length === 0) {
        tempOption = [
          {
            korValue: "단일상품",
            image: mainImage,
            stock: skuQuantity && skuQuantity.stock ? skuQuantity.stock : 0,
            active: true,
            disabled: false,
            price:
              promotionPrice.promoData && promotionPrice.promoData.def
                ? promotionPrice.promoData.def[0].price
                : originalPrice.def
                ? originalPrice.def.price
                : 0
          }
        ].filter(item => item.stock > 0)
      } else {
        tempOption = tempOption
          .map(item => {
            let price = originalPrice[item.key].price
            if (promotionPrice.promoData[item.key]) {
              const promoData = Object.values(promotionPrice.promoData[item.key])
              price = promoData[promoData.length - 1].price
            }

            return {
              ...item,
              stock: skuQuantity.sku[item.key] ? skuQuantity.sku[item.key].stock : 0,
              price,
              disabled: false,
              active: true
            }
          })
          .filter(item => item.stock > 0)
      }
    } else if (/detail.tmall.com/.test(page.url())) {
      // skuQuantity, originalPrice, promotionPrice

      tempOption = tempOption
        .map(item => {
          return {
            ...item,
            stock: skuQuantity && skuQuantity[item.key] ? skuQuantity[item.key].quantity : 0,
            price: promotionPrice[item.key]
              ? promotionPrice[item.key][promotionPrice[item.key].length - 1].price
              : originalPrice[item.key]
              ? originalPrice[item.key].price
              : 0,
            disabled: false,
            active: true
          }
        })
        .filter(item => item.stock > 0)
    }

    return tempOption
  } catch (e) {
    console.log("getOptios", e)
    return []
  }
}

const getSku = async (page, url) => {
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
          const price = await getPrice(page, url)

          const salePrice = await getSalePrice(page)

          let stock = 20
          try{
            stock = await page.$eval("#J_SpanStock", ele => ele.innerText)  
          } catch (e) {
            stock = await page.$eval("#J_EmStock", ele => ele.innerText.replace("库存", "").replace("件", ""))  
          }
          if(!stock || stock === "null") {
            stock = 20
          }

          const korValue = await korTranslate(value1)

          skuList.push({
            key: key1,
            value: value1,
            korValue,
            image: image1 && image1.length > 0 ? optionImageParser(image1) : "",
            price,
            salePrice,
            stock,
            active: true,
            disabled: false
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
            await category2.tap()
            
            await page.waitFor(1000)
            const key2 = await page.evaluate(el => el.getAttribute("data-value"), category2)
            const value2 = await page.evaluate(
              el => el.querySelector("a > span").innerText,
              category2
            )
            let image2 = await page.evaluate(
              el => el.querySelector("a").getAttribute("style"),
              category2
            )

            const price = await getPrice(page, url)

            const salePrice = await getSalePrice(page)
            let stock = 20
            try{
              stock = await page.$eval("#J_SpanStock", ele => ele.innerText)  
            } catch (e) {
              stock = await page.$eval("#J_EmStock", ele => ele.innerText.replace("库存", "").replace("件", ""))  
            }
            if(!stock || stock === "null") {
              stock = 20
            }
            const korValue = await korTranslate(`${value1}, ${value2}`)
            skuList.push({
              key: `${key1}|${key2}`,
              value: `${value1}, ${value2}`,
              korValue,
              image:
                image1 && image1.length > 0 ? optionImageParser(image1) : optionImageParser(image2),
              price,
              salePrice,
              stock,
              active: true,
              disabled: false
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
  if(price.includes("-")){
    return Number(price.split("-")[1].trim())
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

const getShippingInfo = async ({ userID }) => {
  const objItem = {
    shipping: {},
    returnCenter: {},
    vendorId: "",
    vendorUserId: "",
    invoiceDocument: "",
    maximumBuyForPerson: "",
    maximumBuyForPersonPeriod: "",
    cafe24_mallID: "",
    cafe24_shop_no: ""
  }
  if (!userID) {
    return objItem
  }
  try {
    const outbound = await Outbound({ userID })
    if (outbound && outbound.content.length > 0) {
      const temp = outbound.content.filter(item => item.usable === true)
      if (temp.length > 0) {
        objItem.shipping.outboundShippingPlaceCode = temp[0].outboundShippingPlaceCode
        objItem.shipping.shippingPlaceName = temp[0].shippingPlaceName
        objItem.shipping.placeAddresses = temp[0].placeAddresses
        objItem.shipping.remoteInfos = temp[0].remoteInfos
      }
    }
    const returnShippingCenter = await ReturnShippingCenter({ userID })

    if (returnShippingCenter && returnShippingCenter.data.content.length > 0) {
      const temp = returnShippingCenter.data.content.filter(item => item.usable === true)

      if (temp.length > 0) {
        objItem.returnCenter.returnCenterCode = temp[0].returnCenterCode
        objItem.returnCenter.shippingPlaceName = temp[0].shippingPlaceName
        objItem.returnCenter.deliverCode = temp[0].deliverCode
        objItem.returnCenter.deliverName = temp[0].deliverName
        objItem.returnCenter.placeAddresses = temp[0].placeAddresses
      }
    }

    const market = await Market.findOne({
      userID
    })

    if (market) {
      objItem.vendorId = market.coupang.vendorId
      objItem.vendorUserId = market.coupang.vendorUserId
      objItem.shipping.deliveryCompanyCode = market.coupang.deliveryCompanyCode
      objItem.shipping.deliveryChargeType = market.coupang.deliveryChargeType
      objItem.shipping.deliveryCharge = market.coupang.deliveryCharge || 0
      objItem.returnCenter.deliveryChargeOnReturn = market.coupang.deliveryChargeOnReturn || 0
      objItem.returnCenter.returnCharge = market.coupang.returnCharge || 0
      objItem.shipping.outboundShippingTimeDay = market.coupang.outboundShippingTimeDay || 0
      objItem.invoiceDocument = market.coupang.invoiceDocument
      objItem.maximumBuyForPerson = market.coupang.maximumBuyForPerson
      objItem.maximumBuyForPersonPeriod = market.coupang.maximumBuyForPersonPeriod
      objItem.cafe24_mallID = market.cafe24.mallID
      objItem.cafe24_shop_no = market.cafe24.shop_no
    }
  } catch (e) {
    console.log("getShippingInfo", e)
  } finally {
    return objItem
  }
}

const getCategoryInfo = async ({ userID, korTitle }) => {
  const objItem = {
    categoryCode: "",
    attributes: [],
    noticeCategories: [],
    requiredDocumentNames: "",
    certifications: ""
  }
  try {
    const recommendedResponse = await CategoryPredict({
      userID,
      productName: korTitle
    })

    objItem.categoryCode = recommendedResponse.data.predictedCategoryId

    const metaResponse = await CategoryMeta({
      userID,
      categoryCode: recommendedResponse.data.predictedCategoryId
    })

    objItem.attributes = metaResponse.data.attributes.map(item => {
      return {
        ...item,
        attributeValueName: `상세페이지 참조`
      }
    })

    objItem.noticeCategories = metaResponse.data.noticeCategories.map(item => {
      const noticeCategoryDetailNames = item.noticeCategoryDetailNames.map(item => {
        return {
          ...item,
          content: "상세페이지 참조"
        }
      })
      return {
        ...item,
        noticeCategoryDetailNames
      }
    })
    objItem.requiredDocumentNames = metaResponse.data.requiredDocumentNames
    objItem.certifications = metaResponse.data.certifications
  } catch (e) {
    console.log("getCategoryInfo", e)
  } finally {
    return objItem
  }
}

const getBasicItem = async ({ userID }) => {
  const objItem = {
    afterServiceInformation: "",
    afterServiceContactNumber: "",
    topImage: "",
    bottomImage: ""
  }
  try {
    const basic = await Basic.findOne({
      userID
    })
    if (basic) {
      objItem.afterServiceInformation = basic.afterServiceInformation
      objItem.afterServiceContactNumber = basic.afterServiceContactNumber
      objItem.topImage = basic.topImage
      objItem.bottomImage = basic.bottomImage
    }
  } catch (e) {
    console.log("getBasicItem", e)
  } finally {
    return objItem
  }
}


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
        // userID: user && user.adminUser ? user.adminUser : "5f0d5ff36fc75ec20d54c40b",
        userID: user,
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