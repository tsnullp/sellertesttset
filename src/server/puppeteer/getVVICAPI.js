const axios = require("axios")
const cheerio = require("cheerio")
const { papagoTranslate } = require("./translate")
const ExchangeRate = require("../models/ExchangeRate")
const ShippingPrice = require("../models/ShippingPrice")
const Brand = require("../models/Brand")
const {Cafe24UploadLocalImages} = require("../api/Market/index")
const _ = require("lodash")

const start = async ({url, title, userID}) => {
    const ObjItem = {
      brand: "기타",
      manufacture: "기타",
      good_id: "",
      title: "",
      mainImages: [],
      price: 0,
      salePrice: 0,
      content: [],
      prop: [],
      options: [],
      keyword: [],
      exchange: "",
      marginInfo: [],
      shippingWeightInfo: [],
      detailUrl: url,
    }
 
    try {
      const promiseArr = [
        new Promise(async (resolve, reject) => {
          try {

            let content = await axios({
              url,
              method: "GET"
            })
        
            content = content.data.toString()
          
            const $ = cheerio.load(content)
        
            ObjItem.title = $(".detail-title").text()

            if (!title || title.length === 0) {
              ObjItem.korTitle = await papagoTranslate(ObjItem.title)
            } else {
              ObjItem.korTitle = title
            }
            

            let brandList = await Brand.find(
              {
                brand: { $ne: null },
              },
              { brand: 1 }
            )
  
            let banList = []
            if (
              userID.toString() === "5f0d5ff36fc75ec20d54c40b" ||
              userID.toString() === "5f1947bd682563be2d22f008" ||
              userID.toString() === "625f9ca226d0840a73e2dbb8" ||
              userID.toString() === "62bd48f391d7fb85bcc54693"
            ) {
              banList = await Brand.find(
                {
                  userID: {
                    $in: [
                      "5f0d5ff36fc75ec20d54c40b",
                      "5f1947bd682563be2d22f008",
                      "625f9ca226d0840a73e2dbb8",
                      "62bd48f391d7fb85bcc54693"
                    ],
                  },
                },
                { banWord: 1 }
              )
            } else {
              banList = await Brand.find(
                {
                  userID: userID,
                },
                { banWord: 1 }
              )
            }
  
            let korTitleArr = ObjItem.korTitle.split(" ")
  
            korTitleArr = korTitleArr.map((tItem) => {
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
  
            ObjItem.korTitleArray = korTitleArr
            
            $("#thumblist > .tb-thumb-item").each( (i, elem) => {
              let image = $(elem).find("img").attr("src")
              image = image.split("_60x60.jpg")[0]
              if(!image.includes("http")){
                image = `https:${image}`
              }
              
              ObjItem.mainImages.push(image)
            })
        
            

            let base64Images = ``
            for(let image of ObjItem.mainImages){
              const imageRespone = await axios({
                method: "GET",
                url: image,
                responseType: "arraybuffer"
              })
              const buffer = Buffer.from(imageRespone.data)
              const base64 = new Buffer(buffer).toString("base64")
              base64Images += `${base64}"PAPAGO_OCR"`
            }
            if(base64Images.length > 0) {
              const imageUrlResponse = await Cafe24UploadLocalImages({base64Images})
              console.log("imageUrlResponse", imageUrlResponse)
              if(imageUrlResponse && Array.isArray(imageUrlResponse)){
                ObjItem.mainImages = imageUrlResponse
              }
            }
            

            const keyword = []
            $(".keywords-list > a").each((i, elem) => {
              keyword.push($(elem).text().trim())
            })

            const keywordPromise = keyword.map(item => {
              return new Promise(async (resolve, reject) => {
                try {
                  const keywordKor = await papagoTranslate(item)
                  ObjItem.keyword.push(keywordKor)
                  resolve()
                } catch (e) {
                  reject(e)
                }
              })
            })
            await Promise.all(keywordPromise)
            console.log("ObjItem.keyword", ObjItem.keyword)

            const itemVidTemp1 = content.split("var ITEM_VID = '")[1]
            const itemVidTemp2 = itemVidTemp1.split("';")[0]
            
            ObjItem.good_id = itemVidTemp2
        
            const discountPriceTemp1 = content.split("var _DISCOUNTPRICE = '")[1]
            const discountPriceTemp2 = discountPriceTemp1.split("';")[0]
            ObjItem.price = Number(discountPriceTemp2) ? Number(discountPriceTemp2) : 0
            ObjItem.salePrice = ObjItem.price
        
            const scriptTemp1 = content.split(`<script type="text/x-handlebars-template" id="descTemplate">`)[1]
            const scriptTemp2 = scriptTemp1.split(`</script>`)[0].trim()
            
            const detail$ = cheerio.load(scriptTemp2)
            detail$("img").each( (i, elem) => {
              let image = detail$(elem).attr("src")
              if(!image.includes("http")){
                image = `https:${image}`
              }
              ObjItem.content.push(image)
            })

            base64Images = ``
            for(let image of ObjItem.content){
              const imageRespone = await axios({
                method: "GET",
                url: image,
                responseType: "arraybuffer"
              })
              const buffer = Buffer.from(imageRespone.data)
              const base64 = new Buffer(buffer).toString("base64")
              base64Images += `${base64}"PAPAGO_OCR"`
            }
            if(base64Images.length > 0){
              const contentUrlResponse = await Cafe24UploadLocalImages({base64Images})
              console.log("contentUrlResponse", contentUrlResponse)
              if(contentUrlResponse && Array.isArray(contentUrlResponse)){
                ObjItem.content = contentUrlResponse
              }
            }
            

        
        
            const temp1 = content.split("var _SKUMAP = '")[1]
            const temp2 = temp1.split("';")[0]
          
            const skumap = JSON.parse(temp2)


            const uniqColorPic = _.uniqBy(skumap, "color_pic")
            .filter(item => item.color_pic && item.color_pic.length > 0)
            .map(item => {
              return {
                originImage: item.color_pic.includes("http") ? item.color_pic : `https:${item.color_pic}`
              }
            })
        
            console.log("uniqColorPic", uniqColorPic)
            base64Images = ``
            for(let item of uniqColorPic){
              const imageRespone = await axios({
                method: "GET",
                url: item.originImage,
                responseType: "arraybuffer"
              })
              const buffer = Buffer.from(imageRespone.data)
              const base64 = new Buffer(buffer).toString("base64")
              base64Images += `${base64}"PAPAGO_OCR"`
            }

            if(base64Images.length > 0){
              const optionUrlResponse = await Cafe24UploadLocalImages({base64Images})
              console.log("optionUrlResponse", optionUrlResponse)
              if(optionUrlResponse && Array.isArray(optionUrlResponse)){
                optionUrlResponse.forEach((item, i) => {
                  uniqColorPic[i].image = item
                })
              }
            }
            console.log("uniqColorPic", uniqColorPic)
            for(const item of skumap){
              const findObj = _.find(uniqColorPic, {originImage: item.color_pic.includes("http") ? item.color_pic : `https:${item.color_pic}`})
              if(findObj){
                item.color_pic = findObj.image
                console.log("item.color_pic", item.color_pic)
              }
            }

            const soldoutTemp1 = content.split("var _SOLDOUT = '")[1]
            const soldoutTemp2 = soldoutTemp1.split("' ==")[0]
            // soldoutTemp2 1 = 판매중, 0 = 판매종료
         
            const soldOut = soldoutTemp2 === "1" ? false : true
            
            const sizeTemp1 = content.split("var _SIZE = '")[1]
            const sizeTemp2 = sizeTemp1.split("';")[0]
            const size = sizeTemp2.split(",")
            const sizeKor = []
            for(const item of size){
              const sizeName = await papagoTranslate(item)
              sizeKor.push(sizeName)
            }
            
            const sizeIdTemp1 = content.split("var _SIZEID = '")[1]
            const sizeIdTemp2 = sizeIdTemp1.split("';")[0]
            const sizeID = sizeIdTemp2.split(",")
        
            const colorTemp1 = content.split("var _COLOR = '")[1]
            const colorTemp2 = colorTemp1.split("';")[0]
            const color = colorTemp2.split(",")
            const colorKor = []
            for(const item of color){
              const colorName = await papagoTranslate(item)
              colorKor.push(colorName)
            }
        
            const colorIdTemp1 = content.split("var _COLORID = '")[1]
            const colorIdTemp2 = colorIdTemp1.split("';")[0]
            const colorID = colorIdTemp2.split(",")
            
            ObjItem.prop.push({
              pid: "COLOR",
              name: "COLOR",
              korTypeName: "색상",
              values: color.map((item, i) => {
                let colorSkus = skumap.filter(item => item.color_id === colorID[i])
                let image = null
                if(colorSkus.length > 0){
                  if(colorSkus[0].color_pic){              
                    image = colorSkus[0].color_pic.includes("http") ? colorSkus[0].color_pic :`https:${colorSkus[0].color_pic}`
                  } else {
                    image = ObjItem.mainImages[0]
                  }
                } else {
                  image = ObjItem.mainImages[0]
                }
                return {
                  vid: colorID[i],
                  name: item,
                  korValueName: colorKor[i],
                  image
                }
              })
            })
            ObjItem.prop.push({
              pid: "SIZE",
              name: "SIZE",
              korTypeName: "사이즈",
              values: size.map((item, i) => {        
                return {
                  vid: sizeID[i],
                  name: item,
                  korValueName: sizeKor[i],
        
                }
              })
            })
        
            
            for(const item of skumap) {
              try {
                let image = item.color_pic
                if(image && !image.includes("http")) {
                  image = `https:${image}`
                }
                if(!image) {
                  image = ObjItem.mainImages[0]
                }
          
                let colorKorName = null
                let sizeKorName = null
                let index = color.indexOf(item.color_name)
                if(index > -1){
                  colorKorName = colorKor[index]
                } else {
                  colorKorName = await papagoTranslate(item.color_name)
                }
                index = size.indexOf(item.size_name)
                if(index > -1){
                  sizeKorName = sizeKor[index]
                } else {
                  sizeKorName = await papagoTranslate(item.size_name)
                }
                
              ObjItem.options.push({
                  key: item.vid,
                  korKey: item.vid,
                  propPath: item.skuid,
                  price: item.discount_price + 2,
                  productPrice: item.discount_price + 2,
                  salePrice: item.discount_price + 2,
                  stock: soldOut ? 0 : ( item.sku_state === 5 ? 0 : 100),
                  image,
                  disabled: soldOut ? true : false,
                  active: soldOut ? false : true,
                  value: `${item.color_name} ${item.size_name}`,
                  korValue: `${colorKorName} ${sizeKorName}`,
                  attributes: [
                    {
                      attributeTypeName: "색상",
                      attributeValueName: colorKorName,
                    },
                    {
                      attributeTypeName: "사이즈",
                      attributeValueName: sizeKorName,
                    },
                  ]
                })
              } catch(e) {
                console.log("혹시???", e)
              }
              
            }
           
            resolve()
          } catch (e) {
            console.log("여기?", e)
            reject(e)
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const excahgeRate = await ExchangeRate.aggregate([
              {
                $match: {
                  CNY_송금보내실때: { $ne: null },
                },
              },
              {
                $sort: {
                  날짜: -1,
                },
              },
              {
                $limit: 1,
              },
            ])
  
            let marginInfo = await ShippingPrice.aggregate([
              {
                $match: {
                  userID,
                  type: 3,
                },
              },
              {
                $sort: {
                  title: 1,
                },
              },
            ])
  
            if (!marginInfo || marginInfo.length === 0) {
              marginInfo.push({
                title: 10,
                price: 30,
              })
            }
            let shippingWeightInfo = await ShippingPrice.aggregate([
              {
                $match: {
                  userID,
                  type: 2,
                },
              },
              {
                $sort: {
                  title: 1,
                },
              },
            ])
            if (!shippingWeightInfo || shippingWeightInfo.length === 0) {
              shippingWeightInfo.push({
                title: 1,
                price: 10000,
              })
            }
  
            const exchange = Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 1250) + 5
  
            ObjItem.exchange = exchange
            ObjItem.marginInfo = marginInfo
            ObjItem.shippingWeightInfo = shippingWeightInfo
  
            resolve()
          } catch (e) {
            reject(e)
          }
        }),
      ]

      await Promise.all(promiseArr)
    } catch(e) {
      console.log("getVVICAPI", e)
    } finally {
      // console.log("ObjItem", ObjItem)
      return ObjItem
    }
}

module.exports = start