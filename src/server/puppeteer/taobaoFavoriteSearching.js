const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const {scrollPageToBottom} = require("puppeteer-autoscroll-down")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const Market = require("../models/Market")
const Cookie = require("../models/Cookie")
const Basic = require("../models/Basic")
const Product = require("../models/Product")
const { js1, js3, js4, js5 } = require("./exec")
const getTaobaoItem = require("./getTaobaoItemNew")

const { CategoryPredict, CategoryMeta } = require("../api/Market")
const { sleep } = require("../../lib/usrFunc")
const moment = require("moment")

let productList = []
const start = async ({ user }) => {
  if (!user) return

  const browser = await startBrowser()
  const page = await browser.newPage()

  try {
    await page.evaluate(js1)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))
    await page.evaluate(js3)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))
    await page.evaluate(js4)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))
    await page.evaluate(js5)
    await page.waitFor(500 + Math.floor(Math.random() * 1000))

    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    // const taobaoCookies = global.taobaoCookies
    
    // if (taobaoCookies && Array.isArray(taobaoCookies)) {
    //   for (const item of taobaoCookies) {
    //     await page.setCookie(item)
    //     cookieTemp += `${item}; `
    //   }
    // }
    

    await page.goto("https://shoucang.taobao.com/item_collect.htm", { waitUntil: "networkidle0" })

    if (page.url().includes("login.taobao.com")) {
      const accountInfo = await Market.findOne({
        userID: user.adminUser
      })

      if (!accountInfo.taobao) {
        return []
      }

      await taobaoLogin(page, accountInfo.taobao.loginID, accountInfo.taobao.password)
    }
    console.log("로그인완료")
    await sleep(1000)

    // await page.click(".fav-show-list")

    let hidefocus = ""

    let paging = 1
    while (!hidefocus.includes("void()")) {
      hidefocus = await nextPage({ page, paging })
      paging++
      console.log("hidefoucs", hidefocus)
    }


    let cookieTemp = ``
    const cookies2 = await page.cookies("https://item.taobao.com")
    
    for (const item of cookies2) {
      cookieTemp += `${item.name}=${item.value}; `
    }
    
    if(cookieTemp.length > 0){
      console.log("user.adminUser", user.adminUser)
      
      await Cookie.findOneAndUpdate(
        {
          userID: user.adminUser
        },
        {
          $set: {
            cookie: cookieTemp.trim()
          }
        },
        {
          upsert: true
        }
      )
    }

    const productTemp = await Product.aggregate([
      {
        $match: {
          userID: ObjectId(user.adminUser)
          // isDelete: false
          // product: { $ne: null },
          // basic: { $ne: null },
          // coupangUpdatedAt: { $ne: null },
          // cafe24UpdatedAt: { $ne: null },
          // "basic.naverID": { $ne: null }
        }
      },
      {
        $project: {
          basic: 1
        }
      }
    ])
    for (const item of productList) {
      if (
        productTemp.filter(
          pItem => pItem.basic && pItem.basic.dataID && pItem.basic.dataID === item.dataID
        ).length > 0
      ) {
        
        continue
      }
      await sleep(1000)
      let detailItem = null
      try {
        console.log("PRODUCT-ITEM", item)
        detailItem = await getTaobaoItem({ page, url: item.detail, userID: user.adminUser })
      } catch (e) {
        console.log("GETTAOBAOITEM - ", e.message)
        continue
      }
      console.log("detailITem, 성공")

      detailItem.url = item.detail
      detailItem.dataID = item.dataID

      const productObj = {
        good_id: detailItem.good_id,
        korTitle: detailItem.korTitle.trim(),
        mainImages: detailItem.mainImages,

        brand: detailItem.brand, // 브랜드
        manufacture: detailItem.brand, // 제조사
        outboundShippingTimeDay: detailItem.shipping.outboundShippingTimeDay, // 기준출고일(일)
        deliveryChargeType: detailItem.shipping.deliveryChargeType, // 배송비 종류
        deliveryCharge: detailItem.shipping.deliveryCharge, // 기본배송비
        deliveryChargeOnReturn: detailItem.returnCenter.deliveryChargeOnReturn, // 초도반품배송비
        cafe24_product_no: detailItem.cafe24_product_no,
        cafe24_mainImage: detailItem.cafe24_mainImage,
        coupang_productID: detailItem.coupang_productID,
        naverCategoryCode: detailItem.naverCategoryCode
      }
      const coupang = {
        displayCategoryCode: detailItem.categoryCode, // 노출카테고리코드

        vendorId: detailItem.vendorId, // 판매자ID

        deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode, // 택배사 코드

        returnCenterCode: detailItem.returnCenter.returnCenterCode, // 반품지센터코드
        returnChargeName: detailItem.returnCenter.shippingPlaceName, // 반품지명
        companyContactNumber: detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
        returnZipCode: detailItem.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
        returnAddress: detailItem.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
        returnAddressDetail: detailItem.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
        returnCharge: detailItem.returnCenter.returnCharge, // 반품배송비
        afterServiceInformation: detailItem.afterServiceInformation, // A/S안내
        afterServiceContactNumber: detailItem.afterServiceContactNumber, // A/S전화번호
        outboundShippingPlaceCode: detailItem.shipping.outboundShippingPlaceCode, // 출고지주소코드
        vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)

        invoiceDocument: detailItem.invoiceDocument,

        maximumBuyForPerson: detailItem.maximumBuyForPerson, // 인당 최대 구매수량
        maximumBuyForPersonPeriod: detailItem.maximumBuyForPersonPeriod, // 최대 구매 수량 기간

        notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map(item => {
          return {
            noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
            noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
            content: item.content // 내용
          }
        }),
        attributes: detailItem.attributes.map(item => {
          return {
            attributeTypeName: item.attributeTypeName, // 옵션타입명
            attributeValueName: item.attributeValueName // 옵션값
          }
        }),
        certifications: detailItem.certifications.map(item => {
          return {
            certificationType: item.certificationType,
            dataType: item.dataType,
            name: item.name,
            required: item.required
          }
        })
      }

      await Product.findOneAndUpdate(
        {
          userID: user.adminUser,
          "basic.good_id": detailItem.good_id
        },
        {
          $set: {
            isDelete: false,
            basic: detailItem,
            product: productObj,
            options: detailItem.options,
            coupang,
            initCreatedAt: moment().toDate()
          }
        },
        {
          upsert: true,
          new: true
        }
      )
    }
    
  } catch (e) {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
    console.log("taobaoFavoriteSearching - ", e)
  } finally {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

const nextPage = async ({ page, paging }) => {
  try {
    if (paging > 1) {
      await page.click(".dpl-paginator-next")
      await sleep(1000)
    }
    await scrollPageToBottom(page, 250, 150)
    await sleep(1000)

    const productTemp = await page.$$eval("#fav-list > ul > li", element => {
      const returnValue = element.map(item => {
        return {
          dataID: item.getAttribute("data-id"),

          detail: `https:${item.querySelector(".img-controller-img-link").getAttribute("href")}`
        }
      })

      return returnValue
    })

    //.dpl-paginator-next
    productList.push(...productTemp)

    const hidefocus = await page.$eval(".dpl-paginator-next", elem => {
      return elem.getAttribute("href")
    })
    return hidefocus
  } catch (e) {
    // console.log("nextPage", e)
    return "void()"
  }
}

module.exports = start
