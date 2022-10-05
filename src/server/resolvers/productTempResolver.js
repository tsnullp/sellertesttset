const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const getTaobaoItem = require("../puppeteer/getTaobaoItemNewDetail")
const coupangDetailSingle = require("../puppeteer/coupangDetailSingle")
const moment = require("moment")
const { sleep } = require("../../lib/usrFunc")
const url = require("url")
const { Cafe24UploadImages } = require("../api/Market")
const { updateCoupang } = require("./marketAPIResolver")

const resolvers = {
  Query: {
    GetCoupangItemList1: async (
      parent,
      { url },
      { req, model: { Product, CoupangItem_copy1, Brand }, logger }
    ) => {
      try {
        if (url) {
          const coupangItemID = await coupangDetailSingle({ url })
          console.log("coupangItemID", coupangItemID)
          const list = await CoupangItem_copy1.aggregate([
            {
              $match: {
                _id: coupangItemID
              }
            },
            {
              $lookup: {
                from: "taobaoitems",
                let: { itemID: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$itemID", "$$itemID"]
                      }
                    }
                  }
                ],
                as: "taobaoItems"
              }
            }
          ])

          let brandList = await Brand.find(
            {
              brand: { $ne: null }
            },
            { brand: 1 }
          )

          let banList = await Brand.find(
            {
              userID: req.user.adminUser
            },
            { banWord: 1 }
          )

          list.forEach(item => {
            let titleArr = item.title.split(" ")
            titleArr = titleArr.map(tItem => {
              const brandArr = brandList.filter(item =>
                tItem.toUpperCase().includes(item.brand.toUpperCase())
              )
              const banArr = banList.filter(item =>
                tItem.toUpperCase().includes(item.banWord.toUpperCase())
              )
              return {
                word: tItem,
                brand: brandArr.length > 0 ? brandArr.map(item => item.brand) : [],
                ban: banArr.length > 0 ? banArr.map(item => item.banWord) : []
              }
            })
            item.titleArray = titleArr
          })

          return list
        } else {
          const product = await Product.aggregate([
            {
              $match: {
                userID: ObjectId(req.user.adminUser),
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
                "basic.naverID": 1
              }
            }
          ])

          const naverIDs = product.map(item => {
            return item.basic.naverID
          })

          const list = await CoupangItem_copy1.aggregate([
            {
              $match: {
                productId: { $nin: naverIDs },
                vendorName: {
                  $nin: ["미니투스", "널포인트", "메타트론"]
                }
              }
            },
            // {
            //   $sort: {
            //     lastUpdate: -1
            //   }
            // },
            // {
            //   $limit: 10000
            // },

            // {
            //   $lookup: {
            //     from: "products",
            //     localField: "productId",
            //     foreignField: "basic.naverID",
            //     as: "matched_product"
            //   }
            // },
            // {
            //   $match: { matched_product: { $eq: [] } }
            // },
            {
              $lookup: {
                from: "taobaoitems",
                let: { itemID: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$itemID", "$$itemID"]
                      }
                    }
                  }
                ],
                as: "taobaoItems"
              }
            },

            { $sample: { size: 1 } }
          ])

          let brandList = await Brand.find(
            {
              brand: { $ne: null }
            },
            { brand: 1 }
          )

          let banList = await Brand.find(
            {
              userID: req.user.adminUser
            },
            { banWord: 1 }
          )

          list.forEach(item => {
            let titleArr = item.title.split(" ")
            titleArr = titleArr.map(tItem => {
              const brandArr = brandList.filter(item =>
                tItem.toUpperCase().includes(item.brand.toUpperCase())
              )
              const banArr = banList.filter(item =>
                tItem.toUpperCase().includes(item.banWord.toUpperCase())
              )
              return {
                word: tItem,
                brand: brandArr.length > 0 ? brandArr.map(item => item.brand) : [],
                ban: banArr.length > 0 ? banArr.map(item => item.banWord) : []
              }
            })
            item.titleArray = titleArr
          })

          return list
        }
      } catch (e) {
        logger.error(`GetCoupangItemList: ${e.message}`)
        return []
      }
    }
  },
  Mutation: {
    UploadItemWinner1: async (
      parent,
      { _id, coupangID, title, detailUrl, subPrice, isClothes, isShoes },
      { req, model: { CoupangWinner, CoupangItem_copy1, Product, Basic, Market }, logger }
    ) => {
      try {
        let winnerItem = null
        let _coupangID = coupangID
        let _title = title
        let _detailUrl = detailUrl
        let _subPrice = subPrice
        let _isClothes = isClothes
        let _isShoes = isShoes
        if (_id) {
          winnerItem = await CoupangWinner.findOneAndUpdate(
            { _id },
            {
              $set: {
                state: 4
              }
            },
            { new: true }
          )

          _coupangID = winnerItem.CoupangID
          _title = winnerItem.title
          _detailUrl = winnerItem.detailUrl
          _subPrice = winnerItem.subPrice
          _isClothes = winnerItem.isClothes
          _isShoes = winnerItem.isShoes
        } else {
          winnerItem = await CoupangWinner.findOneAndUpdate(
            {
              userID: req.user.adminUser,
              CoupangID: _coupangID
            },
            {
              $set: {
                userID: req.user.adminUser,
                CoupangID: _coupangID,
                state: 1,
                title: _title,
                detailUrl: _detailUrl,
                subPrice: _subPrice,
                isClothes: _isClothes,
                isShoes: _isShoes,
                lastUpdate: moment().toDate()
              },
              $setOnInsert: {
                createdAt: moment().toDate()
              }
            },
            { new: true, upsert: true }
          )
        }

        setTimeout(async () => {
          try {
            console.log("쿠팡 업로드 시작", _coupangID)

            await coupangDetailSingle({ url: _detailUrl })
            await sleep(1000)
            const coupangItem = await CoupangItem_copy1.findOne({ _id: _coupangID })
            const marketItem = await Market.findOne({
              userID: req.user.adminUser
            })
            // console.log("coupangItem", coupangItem)
            // console.log("title", title)
            // console.log("detailUrl", detailUrl)
            // console.log("subPrice", subPrice)

            const urlObject = url.parse(coupangItem.detail, true)
            // const itemId = urlObject.query.itemId
            const productId = urlObject.pathname.replace("/vp/products/", "")

            const tempProduct = await Product.findOne({
              userID: req.user.adminUser,
              "basic.naverID": productId
            })

            if (tempProduct) {
              return false
            }

            const basicItem = await Basic.findOne({
              userID: req.user.adminUser
            })
            console.log("타오바오 크롤링 시작")
            const detailItem = await getTaobaoItem({ url: _detailUrl, userID: req.user.adminUser })
            detailItem.url = _detailUrl
            console.log("타오바오 크롤링 끝")
            // 옵션 HTML
            let optionHtml = ``
            for (const item of coupangItem.options.filter(item => {
              if (item.korTitle1 === "오류시 연락주세요") {
                return false
              }
              if (item.korTitle2 === "오류시 연락주세요") {
                return false
              }
              if (item.title === "오류시 연락주세요") {
                return false
              }

              return true
            }).filter((i, index) => index < 100)) {
              if (item.active && item.image) {
                optionHtml += `
            <p style="text-align: center;" >
            <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
            ${item.title ? item.title : coupangItem.title}
            </div>
            <img src="${item.image.replace(
              /492/gi,
              "800"
            )}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
            <p style="text-align: center;" >
            <br />
            </p>
            `
              }
            }

            let detailHtml = ``
            if (detailItem && Array.isArray(detailItem.content)) {
              for (const item of detailItem.content) {
                detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
              }
            }

            const product = {
              good_id: detailItem.good_id,
              naverID: productId,
              korTitle: _title,
              mainImages: coupangItem.mainImages,
              price:
                coupangItem.options[0].price + (coupangItem.options[0].shippingFee || 0) - subPrice,
              salePrice:
                coupangItem.options[0].price + (coupangItem.options[0].shippingFee || 0) - subPrice,
              topHtml: detailItem.topImage,
              isClothes: _isClothes,
              isShoes: _isShoes,
              clothesHtml: basicItem.clothImage,
              shoesHtml: basicItem.shoesImage,
              optionHtml: optionHtml,
              html: detailHtml,
              bottomHtml: basicItem.bottomImage,
              brand: detailItem.brand,
              manufacture: detailItem.manufacture,
              outboundShippingTimeDay: detailItem.shipping.outboundShippingTimeDay,
              deliveryChargeType: "FREE",
              deliveryCharge: 0,
              deliveryChargeOnReturn: detailItem.returnCenter.deliveryChargeOnReturn,
              cafe24_product_no: detailItem.cafe24_product_no,
              cafe24_mainImage: detailItem.cafe24_mainImage,
              coupang_productID: detailItem.coupang_productID,
              naverCategoryCode: detailItem.naverCategoryCode
            }

            const options = coupangItem.options
              .filter(item => item.image)
              .filter(item => {
                if (item.korTitle1 === "오류시 연락주세요") {
                  return false
                }
                if (item.korTitle2 === "오류시 연락주세요") {
                  return false
                }
                if (item.title === "오류시 연락주세요") {
                  return false
                }

                return true
              })
              .map((item, index) => {
                const attributes = []
                if (item.optionKey1 && item.optionTitle1) {
                  attributes.push({
                    attributeTypeName: item.optionKey1.slice(0, 30),
                    attributeValueName: item.optionTitle1.slice(0, 30)
                  })
                }
                if (item.optionKey2 && item.optionTitle2) {
                  attributes.push({
                    attributeTypeName: item.optionKey2.slice(0, 30),
                    attributeValueName: item.optionTitle2.slice(0, 30)
                  })
                }
                return {
                  key: index,
                  korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                  image: item.image,
                  price: item.price + (item.shippingFee || 0) - _subPrice,
                  productPrice:
                    Math.ceil((item.price + (item.shippingFee || 0) - _subPrice) * 1.3 * 0.1) * 10,
                  salePrice: item.price + (item.shippingFee || 0) - _subPrice,
                  stock: 20,
                  disabled: false,
                  active: item.active,
                  base: index === 0,
                  attributes
                }
              })

            for (const item of options) {
              if (item.image && item.image.length > 150) {
                const imagesResponse = await Cafe24UploadImages({
                  mallID: marketItem.cafe24.mallID,
                  images: [item.image]
                })

                if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                  item.image = imagesResponse.data.images[0].path
                }
                await sleep(1000)
              }
            }

            console.log("coupangItem", coupangItem.detail)

            const coupang = {
              displayCategoryCode: detailItem.categoryCode,
              vendorId: detailItem.vendorId,
              vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
              deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode,
              returnCenterCode: detailItem.returnCenter.returnCenterCode,
              returnChargeName: detailItem.returnCenter.shippingPlaceName,
              companyContactNumber: detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
              returnZipCode: detailItem.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
              returnAddress: detailItem.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
              returnAddressDetail: detailItem.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
              returnCharge: detailItem.returnCenter.returnCharge, // 반품배송비
              afterServiceInformation: detailItem.afterServiceInformation, // A/S안내
              afterServiceContactNumber: detailItem.afterServiceContactNumber, // A/S전화번호
              outboundShippingPlaceCode: detailItem.shipping.outboundShippingPlaceCode, // 출고지주소코드

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

            const productItem = await Product.findOneAndUpdate(
              {
                userID: req.user.adminUser,
                "basic.good_id": detailItem.good_id
              },
              {
                $set: {
                  isDelete: false,
                  basic: detailItem,
                  product,
                  options: detailItem.options,
                  coupang,
                  initCreatedAt: moment().toDate(),
                  isWinner: false
                }
              },
              {
                upsert: true,
                new: true
              }
            )

            const response = await updateCoupang({
              id: productItem._id,
              product,
              options,
              coupang,
              userID: req.user.adminUser,
              writerID: req.user.adminUser
            })
            console.log("productItem._id", productItem._id)
            console.log("response", response)
            console.log("winnerItem._id", winnerItem._id)
            if (response.coupang.code === null) {
              await CoupangWinner.findOneAndUpdate(
                {
                  _id: winnerItem._id
                },
                {
                  $set: {
                    state: 2,
                    error: null,
                    lastUpdate: moment().toDate()
                  }
                }
              )
            } else {
              await CoupangWinner.findOneAndUpdate(
                {
                  _id: winnerItem._id
                },
                {
                  $set: {
                    state: 3,
                    error: response.coupang.message,
                    lastUpdate: moment().toDate()
                  }
                }
              )
            }
          } catch (e) {
            console.log("error", e)
            await CoupangWinner.findOneAndUpdate(
              {
                _id: winnerItem._id
              },
              {
                $set: {
                  state: 3,
                  error: e.message,
                  lastUpdate: moment().toDate()
                }
              }
            )
            // if (page) {
            //   await page.goto("about:blank")
            //   await page.close()
            // }
            // if (browser) {
            //   await browser.close()
            // }
          }
        }, 2000)
      } catch (e) {
        logger.error(`UploadItemWinner: ${e}`)
        return false
      } finally {
        return true
      }
    }
  }
}

module.exports = resolvers
