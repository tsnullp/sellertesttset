const mongoose = require("mongoose")
const {
  CoupnagGET_PRODUCT_STATUS_HISTORY,
  CoupnagGET_PRODUCT_BY_PRODUCT_ID,
  CouapngDeleteProduct,
  Cafe24DeleteProduct,
  CoupnagSTOP_PRODUCT_SALES_BY_ITEM,
  Outbound,
  ReturnShippingCenter,
  Cafe24UploadImages,
  CoupangStoreProductList,
  Cafe24CountAllProducts,
  Cafe24ListAllProducts,
  CoupnagUPDATE_PRODUCT_PRICE_BY_ITEM,
  CoupnagRESUME_PRODUCT_SALES_BY_ITEM,
  CoupangAPPROVE_PRODUCT,
  CoupnagUPDATE_PRODUCT,
  CategoryPredict,
  CategoryMeta,
} = require("../api/Market")
const {
  NaverTitleQualityCheck,
  ShippingData,
  NaverKeywordInfo,
  NaverCatalog,
  NaverKeywordRel
} = require("../api/Naver")
const { GetNaverExcelItem } = require("../api/ExcelFile")
const { sleep, checkStr, AmazonAsin, ranking, DimensionArray } = require("../../lib/usrFunc")
const { updateCoupang, updateCafe24 } = require("./marketAPIResolver")

const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")
const cheerio = require("cheerio")
const { getKiprisWords } = require("./marketAPIResolver")
const { papagoTranslate, korTranslate, engTranslate, kortoEngTranslate } = require("../puppeteer/translate")
const { getCoupangRelatedKeyword } = require("../puppeteer/keywordSourcing")
const getTaobaoItem = require("../puppeteer/getTaobaoItemNewDetail")
const getTaobaoItemAPI = require("../puppeteer/getTaobaoItemAPI")
const coupangDetailSingle = require("../puppeteer/coupangDetailSingle")
const coupangDetail = require("../puppeteer/coupangDetail")
const searchCoupangKeword = require("../puppeteer/searchCoupangKeyword")
const getNaverShopping = require("../puppeteer/getNaverShopping")
const getNaverRecommendShopping = require("../puppeteer/getNaverRecommendShopping")
const Brand = require("../models/Brand")
const smartStoreCategory = require("../../components/organisms/CategoryForm/category")
const url = require("url")
const _ = require("lodash")


const resolvers = {
  Query: {
    TaobaoFavoriteList: async (
      parent,
      { page, perPage, search, startDate, endDate },
      { req, model: { Product }, logger }
    ) => {
      try {
        const match = {}
        if (startDate.length === 8 && endDate.length === 8) {
          match["dateString"] = {
            $gte: startDate,
            $lte: endDate,
          }
        } else if (startDate.length === 8) {
          match["dateString"] = { $gte: startDate }
        } else if (endDate.length === 8) {
          match["dateString"] = { $lte: endDate }
        }

        const product = await Product.aggregate([
          {
            $facet: {
              data: [
                {
                  $addFields: {
                    dateString: {
                      $dateToString: {
                        format: "%Y%m%d",
                        date: "$initCreatedAt",
                        timezone: "Asia/Seoul",
                      },
                    },
                  },
                },
                {
                  $match: {
                    userID: ObjectId(req.user.adminUser),
                    isDelete: false,
                    "basic.dataID": { $ne: null },
                    coupangUpdatedAt: { $exists: false },
                    cafe24UpdatedAt: { $exists: false },
                    $or: [{ "basic.korTitle": { $regex: `.*${search}.*` } }],
                    ...match,
                  },
                },
                {
                  $sort: { createdAt: -1, _id: -1 },
                },
                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
                {
                  $project: {
                    _id: 1,
                    basic: 1,
                    initCreatedAt: 1,
                  },
                },
              ],
              count: [
                {
                  $addFields: {
                    dateString: {
                      $dateToString: {
                        format: "%Y%m%d",
                        date: "$initCreatedAt",
                        timezone: "Asia/Seoul",
                      },
                    },
                  },
                },
                {
                  $match: {
                    userID: ObjectId(req.user.adminUser),
                    isDelete: false,
                    "basic.dataID": { $ne: null },
                    coupangUpdatedAt: { $exists: false },
                    cafe24UpdatedAt: { $exists: false },
                    $or: [{ "basic.korTitle": { $regex: `.*${search}.*` } }],
                    ...match,
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ])

        const data = product[0].data.map((item) => {
          return {
            _id: item._id,
            url: item.basic.url,
            korTitle: item.basic.korTitle,
            mainImage: item.basic.mainImages[0],
            createdAt: item.initCreatedAt,
          }
        })

        return {
          count: product[0].count[0] ? product[0].count[0].count : 0,
          list: data,
        }
      } catch (e) {
        logger.error(`TaobaoFavoriteList: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    ProductDetail: async (
      parent,
      { productID },
      { req, model: { Basic, Product, TaobaoDetail, Brand }, logger }
    ) => {
      try {
        const adminUser = req.user.adminUser
        const product = await Product.findOne({ _id: ObjectId(productID) })

        if (!product) {
          return null
        }

        const basic = await Basic.findOne({
          userID: adminUser,
        })

        const optionNameArr = []
        if (product.product.optionHtml) {
          const $ = cheerio.load(product.product.optionHtml)
          $("div").each((i, elem) => {
            const optionName = $(elem).text().trim()
            if (optionName && optionName.includes(":")) {
              optionNameArr.push({
                key: optionName.split(":")[0].trim(),
                value: optionName.split(":")[1].trim(),
              })
            } else {
              optionNameArr.push({
                key: null,
                value: optionName,
              })
            }
          })
        }

        if (product.options.length === 0) {
          const taobaoItem = await TaobaoDetail.findOne({
            good_id: product.basic.good_id,
          })
          if (taobaoItem && taobaoItem.options) {
            product.options = taobaoItem.options
          } else {
            product.options = product.basic.options.map((item) => {
              return {
                base: item.base,
                _id: item._id,
                key: item.key,
                value: item.value ? item.value : item.name,
                image: item.image,
                price: item.price,
                stock: item.stock,
                disabled:
                  item.disabled !== null && item.disabled !== undefined ? item.disabled : false,
                active: item.active !== null && item.active !== undefined ? item.active : true,
                korValue: item.korValue ? item.korValue : item.korName,
              }
            })
          }
        }

        for (const optionItem of product.options) {
          for (const nameItem of optionNameArr) {
            if (optionItem.korValue === nameItem.key) {
              optionItem.korKey = nameItem.key
              optionItem.korValue = nameItem.value
              break
            }
          }
        }

        await Promise.all(
          product.options
            .filter((item) => !item.korKey && item.korValue && item.korValue.includes("타입"))
            .map((item) => {
              return new Promise(async (resolve, reject) => {
                try {
                  item.korKey = item.korValue
                  item.korValue = await korTranslate(item.value)
                  resolve()
                } catch (e) {
                  reject()
                }
              })
            })
        )

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: adminUser,
            },
            { banWord: 1 }
          )
        }

        const korTitle = product.product.korTitle
          ? product.product.korTitle
          : product.basic.korTitle

        let titleArr = korTitle.split(" ")
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
        const reutrnValue = {
          id: product._id,
          brand: product.product && product.product.brand ? product.product.brand : "기타",
          manufacture:
            product.product && product.product.manufacture ? product.product.manufacture : "기타",
          good_id: product.product.good_id ? product.product.good_id : product.basic.good_id,
          title: product.basic.title,
          korTitle,
          titleArray: titleArr,
          price: product.basic.price,
          salePrice: product.basic.salePrice,
          keyword: product.product.keyword,
          mainImages:
            product.product && product.product.mainImages && product.product.mainImages.length > 0
              ? product.product.mainImages
              : product.basic.mainImages,
          content: product.basic.content,
          topHtml: product.product && product.product.topHtml ? product.product.topHtml : null,
          clothesHtml:
            product.product && product.product.clothesHtml
              ? product.product.clothesHtml
              : basic.clothImage,
          shoesHtml:
            product.product && product.product.shoesHtml
              ? product.product.shoesHtml
              : basic.shoesImage,
          isClothes:
            product.product && product.product.isClothes ? product.product.isClothes : false,
          isShoes: product.product && product.product.isShoes ? product.product.isShoes : false,
          optionHtml:
            product.product && product.product.optionHtml ? product.product.optionHtml : null,
          html: product.product && product.product.html ? product.product.html : null,
          bottomHtml:
            product.product && product.product.bottomHtml ? product.product.bottomHtml : null,
          options: product.options.map((item, index) => {
            return {
              key: item.key,
              value: item.value,
              korKey: item.korKey,
              korValue: item.korValue,
              image: item.image,
              price: item.price,
              productPrice: item.productPrice,
              salePrice: item.salePrice ? item.salePrice : item.price,
              stock: item.stock,
              disabled: item.disabled === undefined ? false : item.disabled,
              active: item.active === undefined ? true : item.active,
              base: item.base,
              attributes: item.attributes && Array.isArray(item.attributes) ? item.attributes : [],
              cafe24_variant_code: item.cafe24.variant_code,
              coupang_sellerProductItemId: item.coupang ? item.coupang.sellerProductItemId : null,
              coupang_vendorItemId: item.coupang ? item.coupang.vendorItemId : null,
            }
          }),
          attribute: product.basic.attribute,
          categoryCode: product.coupang.displayCategoryCode
            ? product.coupang.displayCategoryCode
            : product.basic.categoryCode,
          attributes: product.basic.attributes.map((item, index) => {
            return {
              attributeTypeName: item.attributeTypeName,
              attributeValueName:
                product.coupang && product.coupang.attributes && product.coupang.attributes[index]
                  ? product.coupang.attributes[index].attributeValueName
                  : item.attributeValueName,
              required: item.required,
              dataType: item.dataType,
              basicUnit: item.basicUnit,
              usableUnits: item.usableUnits,
              groupNumber: item.groupNumber,
              exposed: item.exposed,
            }
          }),
          noticeCategories: [
            {
              noticeCategoryName:
                product.coupang && product.coupang.notices[0]
                  ? product.coupang.notices[0].noticeCategoryName
                  : product.basic.noticeCategories[0]
                  ? product.basic.noticeCategories[0].noticeCategoryName
                  : "",
              noticeCategoryDetailNames: [
                {
                  noticeCategoryDetailName:
                    product.coupang && product.coupang.notices[0]
                      ? product.coupang.notices[0].noticeCategoryDetailName
                      : product.basic.noticeCategories[0]
                      ? product.basic.noticeCategories[0].noticeCategoryDetailNames[0]
                          .noticeCategoryDetailName
                      : "",
                  require: true,
                  content:
                    product.coupang && product.coupang.notices[0]
                      ? product.coupang.notices[0].content
                      : product.basic.noticeCategories[0]
                      ? product.basic.noticeCategories[0].noticeCategoryDetailNames[0].content
                      : "",
                },
              ],
            },
          ],
          requiredDocumentNames: product.basic.requiredDocumentNames,
          certifications: product.basic.certifications,
          afterServiceInformation:
            product.coupang && product.coupang.afterServiceInformation
              ? product.coupang.afterServiceInformation
              : product.basic.afterServiceInformation,
          afterServiceContactNumber:
            product.coupang && product.coupang.afterServiceContactNumber
              ? product.coupang.afterServiceContactNumber
              : product.basic.afterServiceContactNumber,
          topImage: basic.topImage,
          bottomImage: basic.bottomImage,
          vendorId:
            product.coupang && product.coupang.vendorId
              ? product.coupang.vendorId
              : product.basic.vendorId,
          vendorUserId:
            product.coupang && product.coupang.vendorUserId
              ? product.coupang.vendorUserId
              : product.basic.vendorUserId,
          shipping: {
            outboundShippingPlaceCode:
              product.coupang && product.coupang.outboundShippingPlaceCode
                ? product.coupang.outboundShippingPlaceCode
                : product.basic.shipping.outboundShippingPlaceCode,
            shippingPlaceName: product.basic.shipping.shippingPlaceName,
            placeAddresses: product.basic.shipping.placeAddresses,
            remoteInfos: product.basic.shipping.remoteInfos,
            deliveryCompanyCode:
              product.coupang && product.coupang.deliveryCompanyCode
                ? product.coupang.deliveryCompanyCode
                : product.basic.shipping.deliveryCompanyCode,
            deliveryChargeType:
              product.product && product.product.deliveryChargeType
                ? product.product.deliveryChargeType
                : product.basic.shipping.deliveryChargeType,
            deliveryCharge:
              product.product && product.product.deliveryCharge
                ? product.product.deliveryCharge
                : product.basic.shipping.deliveryCharge,
            outboundShippingTimeDay:
              product.product && product.product.outboundShippingTimeDay
                ? product.product.outboundShippingTimeDay
                : product.basic.shipping.outboundShippingTimeDay,
          },
          returnCenter: {
            deliveryChargeOnReturn:
              product.product && product.product.deliveryChargeOnReturn
                ? product.product.deliveryChargeOnReturn
                : product.basic.returnCenter.deliveryChargeOnReturn,
            returnCharge:
              product.coupang && product.coupang.returnCharge
                ? product.coupang.returnCharge
                : product.basic.returnCenter.returnCharge,
            returnCenterCode:
              product.coupang && product.coupang.returnCenterCode
                ? product.coupang.returnCenterCode
                : product.basic.returnCenter.returnCenterCode,
            shippingPlaceName: product.basic.returnCenter.shippingPlaceName,
            deliverCode: product.basic.returnCenter.deliverCode,
            deliverName: product.basic.returnCenter.deliverName,
            placeAddresses: product.basic.returnCenter.placeAddresses,
          },
          invoiceDocument:
            product.coupang && product.coupang.invoiceDocument
              ? product.coupang.invoiceDocument
              : product.basic.invoiceDocument,
          maximumBuyForPerson:
            product.coupang && product.coupang.maximumBuyForPerson
              ? product.coupang.maximumBuyForPerson
              : product.basic.maximumBuyForPerson,
          maximumBuyForPersonPeriod:
            product.coupang && product.coupang.maximumBuyForPersonPeriod
              ? product.coupang.maximumBuyForPersonPeriod
              : product.basic.maximumBuyForPersonPeriod,
          cafe24_mallID: product.basic.cafe24_mallID,
          cafe24_shop_no: product.basic.cafe24_shop_no,
          cafe24_product_no: product.product ? product.product.cafe24.product_no : "",
          cafe24_mainImage: product.product ? product.product.cafe24.mainImage : "",
          coupang_productID: product.product ? product.product.coupang.productID : "",
          naverCategoryCode: product.basic.naverCategoryCode,
          keywords: product.basic.keywords ? product.basic.keywords : [],
          exchange: product.product && product.product.exchange ? product.product.exchange : null,
          shippingFee:
            product.product && product.product.shippingFee ? product.product.shippingFee : null,
          profit: product.product && product.product.profit ? product.product.profit : null,
          discount: product.product && product.product.discount ? product.product.discount : null,
          fees: product.product && product.product.exchange ? product.product.fees : null,
        }
        return reutrnValue
      } catch (e) {
        logger.error(`ProductDetail: ${e}`)
        console.log("ppp=", e)
        return null
      }
    },
    ProductCountDaily: async (parent, { userID }, { req, model: { Product }, logger }) => {
      try {
        const user = userID ? ObjectId(userID) : ObjectId(req.user.adminUser)
        const product = await Product.aggregate([
          {
            $match: {
              userID: user,
              isDelete: false,
              product: { $ne: null },
              // coupangUpdatedAt: { $exists: true }, d
            },
          },
          {
            $project: {
              _id: 1,
              writerID: 1,
              createdAt: {
                $add: ["$createdAt", 9 * 60 * 60000],
              },
            },
          },
          {
            $group: {
              _id: {
                writerID: "$writerID",
                // month: { $month: "$coupangUpdatedAt" },
                // day: { $dayOfMonth: "$coupangUpdatedAt" },
                // year: { $year: "$coupangUpdatedAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: "users",
              localField: "_id.writerID",
              foreignField: "_id",
              as: "user",
            },
          },
          {
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
              "_id.day": 1,
            },
          },
        ])
        let total = 0

        return product.map((item, index) => {
          total += item.count
          return {
            year: item._id.year,
            month: item._id.month,
            day: item._id.day,
            count: item.count,
            subTotal: total,
            user:
              item.user && Array.isArray(item.user) && item.user.length > 0
                ? { ...item.user[0] }
                : null,
          }
        })
      } catch (e) {
        logger.error(`ProductCountDaily: ${e}`)
        return []
      }
    },
    CreateProductDetail: async (
      parient,
      { _id, naverID, naverCategoryCode, naverCategoryName },
      { req, model: { Basic, Market, Product, Brand, TaobaoDetail }, logger }
    ) => {
      try {
        const taobaoItem = await TaobaoDetail.findOne({ _id: ObjectId(_id) })

        if (!taobaoItem) {
          return null
        }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        const korTitle = taobaoItem.korTitle

        let titleArr = korTitle.split(" ")
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

        const detailItem = {
          good_id: taobaoItem.good_id,
          attribute: taobaoItem.attribute,
          attributes: taobaoItem.attributes,
          brand: taobaoItem.brand,
          categoryCode: taobaoItem.categoryCode,
          certifications: taobaoItem.certifications,
          content: taobaoItem.content,
          itemID: taobaoItem.itemID,
          korTitle: taobaoItem.korTitle,
          titleArray: titleArr,
          keyword: [],
          mainImages: taobaoItem.mainImages,
          manufacture: taobaoItem.manufacture,
          naverID: taobaoItem.naverID,
          noticeCategories: taobaoItem.noticeCategories,
          options: taobaoItem.options,
          price: taobaoItem.price,
          productTitle: taobaoItem.productTitle,
          requiredDocumentNames: taobaoItem.requiredDocumentNames,
          salePrice: taobaoItem.salePrice,
          title: taobaoItem.title,
          url: taobaoItem.url,
        }
        const basic = await Basic.findOne({
          userID: req.user.adminUser,
        })
        if (basic) {
          detailItem.afterServiceInformation = basic.afterServiceContactNumber
          detailItem.afterServiceContactNumber = basic.afterServiceContactNumber
          detailItem.topImage = basic.topImage
          detailItem.bottomImage = basic.bottomImage
          detailItem.clothImage = basic.clothImage
          detailItem.shoesImage = basic.shoesImage
        }

        if (naverID) {
          detailItem.naverCategoryCode = naverCategoryCode
          detailItem.naverCategoryName = naverCategoryName
        }

        const outbound = await Outbound({ userID: req.user.adminUser })
        if (outbound && outbound.content.length > 0) {
          const temp = outbound.content.filter((item) => item.usable === true)
          if (temp.length > 0) {
            if (!detailItem.shipping) {
              detailItem.shipping = {}
            }
            detailItem.shipping.outboundShippingPlaceCode = temp[0].outboundShippingPlaceCode
            detailItem.shipping.shippingPlaceName = temp[0].shippingPlaceName
            detailItem.shipping.placeAddresses = temp[0].placeAddresses
            detailItem.shipping.remoteInfos = temp[0].remoteInfos
          }
        }
        const returnShippingCenter = await ReturnShippingCenter({ userID: req.user.adminUser })
        if (returnShippingCenter && returnShippingCenter.data.content.length > 0) {
          const temp = returnShippingCenter.data.content.filter((item) => item.usable === true)
          if (temp.length > 0) {
            if (!detailItem.returnCenter) {
              detailItem.returnCenter = {}
            }
            detailItem.returnCenter.returnCenterCode = temp[0].returnCenterCode
            detailItem.returnCenter.shippingPlaceName = temp[0].shippingPlaceName
            detailItem.returnCenter.deliverCode = temp[0].deliverCode
            detailItem.returnCenter.deliverName = temp[0].deliverName
            detailItem.returnCenter.placeAddresses = temp[0].placeAddresses
          }
        }

        const market = await Market.findOne({
          userID: req.user.adminUser,
        })
        if (market) {
          detailItem.vendorId = market.coupang.vendorId
          detailItem.vendorUserId = market.coupang.vendorUserId
          detailItem.shipping.deliveryCompanyCode = market.coupang.deliveryCompanyCode
          detailItem.shipping.deliveryChargeType = market.coupang.deliveryChargeType
          detailItem.shipping.deliveryCharge = market.coupang.deliveryCharge || 0
          detailItem.returnCenter.deliveryChargeOnReturn =
            market.coupang.deliveryChargeOnReturn || 0
          detailItem.returnCenter.returnCharge = market.coupang.returnCharge || 0
          detailItem.shipping.outboundShippingTimeDay = market.coupang.outboundShippingTimeDay || 0
          detailItem.invoiceDocument = market.coupang.invoiceDocument
          detailItem.maximumBuyForPerson = market.coupang.maximumBuyForPerson
          detailItem.maximumBuyForPersonPeriod = market.coupang.maximumBuyForPersonPeriod
          detailItem.cafe24_mallID = market.cafe24.mallID
          detailItem.cafe24_shop_no = market.cafe24.shop_no
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

        detailItem.id = product._id

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
        logger.error(`CreateProductDetail: ${e.message}`)
        return {
          good_id: null,
        }
      }
    },
    GetCoupangItemList: async (
      parent,
      { url },
      { req, model: { Product, CoupangItem, Brand }, logger }
    ) => {
      try {
        if (url) {
          const coupangItemID = await coupangDetailSingle({ url })
          console.log("coupangItemID", coupangItemID)
          const list = await CoupangItem.aggregate([
            {
              $match: {
                _id: coupangItemID,
              },
            },
            {
              $lookup: {
                from: "taobaoitems",
                let: { itemID: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $eq: ["$itemID", "$$itemID"],
                      },
                    },
                  },
                ],
                as: "taobaoItems",
              },
            },
          ])

          let brandList = await Brand.find(
            {
              brand: { $ne: null },
            },
            { brand: 1 }
          )

          let banList = []
          if (
            req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
            req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
          ) {
            banList = await Brand.find(
              {
                userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
              },
              { banWord: 1 }
            )
          } else {
            banList = await Brand.find(
              {
                userID: req.user.adminUser,
              },
              { banWord: 1 }
            )
          }

          list.forEach((item) => {
            let titleArr = item.title.split(" ")
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
                "basic.naverID": { $ne: null },
              },
            },
            {
              $project: {
                "basic.naverID": 1,
              },
            },
          ])

          const naverIDs = product.map((item) => {
            return item.basic.naverID
          })

          const list = await CoupangItem.aggregate([
            {
              $match: {
                productId: { $nin: naverIDs },
                vendorName: {
                  $nin: ["미니투스", "널포인트", "메타트론"],
                },
              },
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
                        $eq: ["$itemID", "$$itemID"],
                      },
                    },
                  },
                ],
                as: "taobaoItems",
              },
            },

            { $sample: { size: 1 } },
          ])

          let brandList = await Brand.find(
            {
              brand: { $ne: null },
            },
            { brand: 1 }
          )

          let banList = []
          if (
            req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
            req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
          ) {
            banList = await Brand.find(
              {
                userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
              },
              { banWord: 1 }
            )
          } else {
            banList = await Brand.find(
              {
                userID: req.user.adminUser,
              },
              { banWord: 1 }
            )
          }

          list.forEach((item) => {
            let titleArr = item.title.split(" ")
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
            item.titleArray = titleArr
          })

          return list
        }
      } catch (e) {
        logger.error(`GetCoupangItemList: ${e.message}`)
        return []
      }
    },

    GetItemWinnerProcessingList: async (
      parent,
      { userID },
      { req, model: { CoupangWinner }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : ObjectId(req.user.adminUser)

      try {
        const winner = await CoupangWinner.aggregate([
          {
            $match: {
              userID: user,
              state: { $ne: 2 },
            },
          },
          {
            $sort: { createdAt: -1, _id: -1 },
          },

          {
            $lookup: {
              from: "coupangitems",
              localField: "CoupangID",
              foreignField: "_id",
              as: "coupangItem",
            },
          },
          // {
          //   $unwind: "$coupangItem"
          // }
          {
            $lookup: {
              from: "users",
              localField: "writerID",
              foreignField: "_id",
              as: "user",
            },
          },
        ])

        return winner.map((item) => {
          return {
            _id: item._id,
            state: item.state,
            createdAt: item.createdAt,
            lastUpdate: item.lastUpdate,
            taobaoUrl: item.detailUrl,
            title: item.title,
            kind: item.CoupangID ? "winner" : item.productNo ? "naver" : null,
            error: item.error,
            mainImges: item.coupangItem.length > 0 ? item.coupangItem[0].mainImages : [],
            coupangUrl: item.coupangItem.length > 0 ? item.coupangItem[0].detail : "",
            options: item.coupangItem.length > 0 ? item.coupangItem[0].options : [],
            user:
              item.user && Array.isArray(item.user) && item.user.length > 0
                ? {
                    ...item.user[0],
                  }
                : null,
          }
        })
      } catch (e) {
        logger.error(`GetItemWinnerProcessingList: ${e.message}`)

        return []
      }
    },
    EngTranslate: async (parent, { text }, { logger }) => {
      try {
        // return await engTranslate(text)
        return await papagoTranslate(text, "zh-CN", "en")
      } catch (e) {
        logger.error(`EngTranslate: ${e}`)
        return text
      }
    },
    KorToEngTranslate: async (parent, { text }, { logger }) => {
      try {
        return await papagoTranslate(text, "ko", "en")
      } catch (e) {
        logger.error(`EngTranslate: ${e}`)
        return text
      }
    },
    IsRegister: async (parent, { goodID }, { req, model: { Product }, logger }) => {
      try {
        console.log("goodID", goodID)
        if (!goodID || goodID.length === 0) {
          return false
        }

        const product = await Product.findOne({
          userID: ObjectId(req.user.adminUser),
          "basic.good_id": goodID,
          isDelete: false,
        })
        if (product) {
          return true
        } else {
          return false
        }
      } catch (e) {
        logger.error(`IsRegister: ${e}`)
        return false
      }
    },
    IsUSARegister: async (parent, { asin }, { req, model: { Product }, logger }) => {
      try {
        if (!asin || asin.length === 0) {
          return false
        }
        //B0019GE9HE
        const product = await Product.findOne({
          userID: ObjectId(req.user.adminUser),
          "options.key": asin,
          isDelete: false,
        })
        if (product) {
          return true
        } else {
          return false
        }
      } catch (e) {
        logger.error(`IsUSARegister: ${e}`)
        return false
      }
    },
    GetMainImages: async (parent, { _id }, { req, model: { Product }, logger }) => {
      try {
        const product = await Product.findOne({
          _id: ObjectId(_id),
          userID: req.user.adminUser,
        })
        if (product) {
          return product.product.mainImages
        } else {
          return []
        }
      } catch (e) {
        logger.error(`GetMainImages: ${e}`)
        return []
      }
    },
    GetDetailHtml: async (parent, { _id }, { req, model: { Product }, logger }) => {
      try {
        const product = await Product.findOne({
          _id: ObjectId(_id),
          userID: req.user.adminUser,
        })
        if (product) {
          return product.product.html
        } else {
          return ""
        }
      } catch (e) {
        logger.error(`GetMainImages: ${e}`)
        return ""
      }
    },
    GetOptions: async (
      parent,
      { _id },
      { req, model: { Product, ExchangeRate, ShippingPrice }, logger }
    ) => {
      try {
        const user = ObjectId(req.user.adminUser)
        const product = await Product.findOne({
          _id: ObjectId(_id),
          userID: user,
        })
        const exchange = await ExchangeRate.findOne().sort({ 날짜: -1 })

        const marginInfo = await ShippingPrice.aggregate([
          {
            $match: {
              userID: user,
              type: 1,
            },
          },
          {
            $sort: {
              title: 1,
            },
          },
        ])

        const shippingWeightInfo = await ShippingPrice.aggregate([
          {
            $match: {
              userID: user,
              type: 2,
            },
          },
          {
            $sort: {
              title: -1,
            },
          },
        ])
        // console.log("product", product)
        if (product) {
          //  console.log("product.options", product.options)
          return {
            option: product.options || [],
            prop: product.prop || [],
            exchange: Number(exchange.CNY_송금보내실때.replace(/,/gi, "") || 175) + 5,
            marginInfo,
            shippingWeightInfo,
          }
        } else {
          return null
        }
      } catch (e) {
        logger.error(`GetMainImages: ${e}`)
        return null
      }
    },
    GetNaverItemWithKeyword: async (
      parent,
      { category1, keyword },
      { req, model: { NaverFavoriteItem, Brand }, logger }
    ) => {
      try {
        const getCategoryCode = (category1) => {
          let categoryCode = ""
          switch (category1) {
            case "패션의류":
              categoryCode = "50000000"
              break
            case "패션잡화":
              categoryCode = "50000001"
              break
            case "화장품/미용":
              categoryCode = "50000002"
              break
            case "가구/인테리어":
              categoryCode = "50000004"
              break
            case "디지털/가전":
              categoryCode = "50000003"
              break
            case "생활/건강":
              categoryCode = "50000008"
              break
            case "스포츠/레저":
              categoryCode = "50000007"
              break
            case "식품":
              categoryCode = "50000006"
              break
            case "출산/육아":
              categoryCode = "100000008"
              break
          }
          return categoryCode
        }
        console.log("category1", category1)
        const naverItem = await NaverFavoriteItem.aggregate([
          {
            $match: {
              category1: getCategoryCode(category1),
              title: { $regex: `.*${keyword.replace(/|/gi, "")}.*` },
            },
          },
          {
            $sort: { purchaseCnt: -1, recentSaleCount: -1 },
          },
        ])

        // let brandList = await Brand.find(
        //   {
        //     brand: { $ne: null }
        //   },
        //   { brand: 1 }
        // )
        // let banList = []
        // if(req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" || req.user.adminUser.toString() === "5f1947bd682563be2d22f008"){
        //   banList = await Brand.find(
        //     {
        //       userID: {$in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"]}
        //     },
        //     { banWord: 1 }
        //   )
        // } else {
        //   banList = await Brand.find(
        //     {
        //       userID: req.user.adminUser
        //     },
        //     { banWord: 1 }
        //   )
        // }

        // for(const item of naverItem.filter(item => item ? true : false)) {

        //   let titleArr = item.name.split(" ")
        //   titleArr = titleArr.map(tItem => {
        //     const brandArr = brandList.filter(item =>
        //       tItem.toUpperCase().includes(item.brand.toUpperCase())
        //     )
        //     const banArr = banList.filter(item =>
        //       tItem.toUpperCase().includes(item.banWord.toUpperCase())
        //     )
        //     return {
        //       word: tItem,
        //       brand: brandArr.length > 0 ? brandArr.map(item => item.brand) : [],
        //       ban: banArr.length > 0 ? banArr.map(item => item.banWord) : []
        //     }
        //   })
        //   item.titleArray = titleArr
        // }

        return naverItem
        return naverItem.filter((item) => (item ? true : false))
      } catch (e) {
        logger.error(`GetNaverItemWithKeyword: ${e}`)
        return []
      }
    },
    GetNaverItemWithKeywordID: async (
      parent,
      { ids, keyword },
      { req, model: { NaverFavoriteItem, Brand }, logger }
    ) => {
      try {
        let naverItem = []
        if (ids && Array.isArray(ids)) {
          naverItem = await NaverFavoriteItem.aggregate([
            {
              $match: {
                _id: { $in: ids.map((item) => ObjectId(item)) },
              },
            },
            {
              $sort: { purchaseCnt: -1, recentSaleCount: -1 },
            },
          ])
        }
        if (keyword && keyword.length > 0) {
          let tempKeyword = keyword.replace(/ /gi, "")
          naverItem = await NaverFavoriteItem.aggregate([
            {
              $match: {
                // _id: { $in: ids.map((item) => ObjectId(item)) },
                title: { $regex: `.*${tempKeyword}.*` },
              },
            },
            {
              $sort: { purchaseCnt: -1, recentSaleCount: -1 },
            },
          ])
        }

        // let brandList = await Brand.find(
        //   {
        //     brand: { $ne: null }
        //   },
        //   { brand: 1 }
        // )
        // let banList = []
        // if(req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" || req.user.adminUser.toString() === "5f1947bd682563be2d22f008"){
        //   banList = await Brand.find(
        //     {
        //       userID: {$in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"]}
        //     },
        //     { banWord: 1 }
        //   )
        // } else {
        //   banList = await Brand.find(
        //     {
        //       userID: req.user.adminUser
        //     },
        //     { banWord: 1 }
        //   )
        // }

        // for(const item of naverItem.filter(item => item ? true : false)) {

        //   let titleArr = item.name.split(" ")
        //   titleArr = titleArr.map(tItem => {
        //     const brandArr = brandList.filter(item =>
        //       tItem.toUpperCase().includes(item.brand.toUpperCase())
        //     )
        //     const banArr = banList.filter(item =>
        //       tItem.toUpperCase().includes(item.banWord.toUpperCase())
        //     )
        //     return {
        //       word: tItem,
        //       brand: brandArr.length > 0 ? brandArr.map(item => item.brand) : [],
        //       ban: banArr.length > 0 ? banArr.map(item => item.banWord) : []
        //     }
        //   })
        //   item.titleArray = titleArr
        // }

        return naverItem
        return naverItem.filter((item) => (item ? true : false))
      } catch (e) {
        logger.error(`GetNaverItemWithKeywordID: ${e}`)
        return []
      }
    },
    GetNaverCatalogKeyword: async (parent, { catalog, keyword }, { logger }) => {
      try {
        const array = []
        const productList = await NaverCatalog({ catalog, keyword })
        const korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
        productList.forEach((item) => {
          const titleArray = item.productName.split(" ")
          titleArray.forEach((item) => {
            if (item.length > 1 && korean.test(item)) {
              array.push(item)
            }
          })
        })

        return ranking(array)
      } catch (e) {
        logger.error(`GetNaverCatalogKeyword: ${e}`)
        return []
      }
    },
  },
  Mutation: {
    ProductList: async (
      parent,
      { page, perPage, search, startDate, endDate, userID, notSales = true },
      { req, model: { Product, ShippingPrice, Brand, MarketOrder }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : ObjectId(req.user.adminUser)

      try {
        const marketOrder = await MarketOrder.aggregate([
          {
            $match: {
              userID: ObjectId(user),
              saleType: 1,
            },
          },
          {
            $unwind: "$orderItems",
          },
          {
            $project: {
              "orderItems.title": 1,
            },
          },
        ])

        const sellerProductNames = []
        for (const item of marketOrder) {
          sellerProductNames.push(item.orderItems.title)
        }

        // console.log("sellerProductNames", sellerProductNames)
        const match = {}
        if (startDate.length === 8 && endDate.length === 8) {
          match["dateString"] = {
            $gte: startDate,
            $lte: endDate,
          }
        } else if (startDate.length === 8) {
          match["dateString"] = { $gte: startDate }
        } else if (endDate.length === 8) {
          match["dateString"] = { $lte: endDate }
        }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        let product

        if (notSales) {
          product = await Product.aggregate([
            {
              $facet: {
                data: [
                  // {
                  //   $match: {
                  //     $text: { $search: search }
                  //   },
                  // },
                  {
                    $addFields: {
                      dateString: {
                        $dateToString: {
                          format: "%Y%m%d",
                          date: "$createdAt",
                          timezone: "Asia/Seoul",
                        },
                      },
                    },
                  },

                  {
                    $match: {
                      userID: user,
                      isDelete: false,
                      "product.korTitle": {
                        $nin: sellerProductNames.map((pName) => {
                          return `.*${pName}.*`
                        }),
                      },

                      createdAt: { $exists: true },
                      product: { $exists: true },

                      // { $regex: `.*${search}.*` },

                      // ...match
                    },
                  },

                  {
                    $sort: { createdAt: 1 },
                  },
                  {
                    $limit: (page - 1) * perPage + perPage,
                  },
                  {
                    $skip: (page - 1) * perPage,
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "writerID",
                      foreignField: "_id",
                      as: "user",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      basic: 1,
                      product: 1,
                      options: 1,
                      coupang: 1,
                      createdAt: 1,
                      isWinner: 1,
                      isNaver: 1,
                      user: 1,
                    },
                  },
                ],
                count: [
                  {
                    $addFields: {
                      dateString: {
                        $dateToString: {
                          format: "%Y%m%d",
                          date: "$createdAt",
                          timezone: "Asia/Seoul",
                        },
                      },
                    },
                  },
                  {
                    $match: {
                      userID: user,
                      isDelete: false,
                      // product: { $ne: null },
                      // createdAt: { $exists: true },
                      "product.korTitle": {
                        $nin: sellerProductNames.map((pName) => {
                          return `.*${pName}.*`
                        }),
                      },
                      createdAt: { $exists: true },
                      product: { $exists: true },
                      // $or: [
                      //   { "product.korTitle": { $regex: `.*${search}.*` } },
                      //   { "basic.korTitle": { $regex: `.*${search}.*` } },
                      //   // { "product.coupang.productID": search },
                      //   // { "options.coupang.vendorItemId": search }
                      // ],
                      // ...match
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      count: {
                        $sum: 1,
                      },
                    },
                  },
                ],
              },
            },
          ]).allowDiskUse(true)
        } else {
          product = await Product.aggregate([
            {
              $facet: {
                data: [
                  // {
                  //   $match: {
                  //     $text: { $search: search }
                  //   },
                  // },
                  {
                    $addFields: {
                      dateString: {
                        $dateToString: {
                          format: "%Y%m%d",
                          date: "$createdAt",
                          timezone: "Asia/Seoul",
                        },
                      },
                    },
                  },

                  {
                    $match: {
                      userID: user,
                      isDelete: { $ne: true },
                      // product: { $ne: null },
                      // createdAt: { $exists: true },
                      "product.korTitle": { $regex: `.*${search}.*` },
                      // "product.engSentence": { $regex: `.*${search}*` },
                      createdAt: { $exists: true },
                      product: { $exists: true },
                      // $or: [

                      //   { "product.korTitle": { $regex: `.*${search}.*` } },
                      //   { "basic.korTitle": { $regex: `.*${search}.*` } },
                      //   // { "product.coupang.productID": search },
                      //   // { "options.coupang.vendorItemId": search }
                      // ],
                      ...match,
                    },
                  },

                  {
                    $sort: { createdAt: -1 },
                  },
                  {
                    $limit: (page - 1) * perPage + perPage,
                  },
                  {
                    $skip: (page - 1) * perPage,
                  },
                  {
                    $lookup: {
                      from: "users",
                      localField: "writerID",
                      foreignField: "_id",
                      as: "user",
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      basic: 1,
                      product: 1,
                      options: 1,
                      coupang: 1,
                      createdAt: 1,
                      isWinner: 1,
                      isNaver: 1,
                      user: 1,
                    },
                  },
                ],
                count: [
                  {
                    $addFields: {
                      dateString: {
                        $dateToString: {
                          format: "%Y%m%d",
                          date: "$createdAt",
                          timezone: "Asia/Seoul",
                        },
                      },
                    },
                  },
                  {
                    $match: {
                      userID: user,
                      isDelete: { $ne: true },
                      // product: { $ne: null },
                      // createdAt: { $exists: true },
                      "product.korTitle": { $regex: `.*${search}.*` },
                      // "product.engSentence": { $regex: `.*${search}*` },
                      createdAt: { $exists: true },
                      product: { $exists: true },
                      // $or: [
                      //   { "product.korTitle": { $regex: `.*${search}.*` } },
                      //   { "basic.korTitle": { $regex: `.*${search}.*` } },
                      //   // { "product.coupang.productID": search },
                      //   // { "options.coupang.vendorItemId": search }
                      // ],
                      ...match,
                    },
                  },
                  {
                    $group: {
                      _id: null,
                      count: {
                        $sum: 1,
                      },
                    },
                  },
                ],
              },
            },
          ]).allowDiskUse(true)
        }

        const shippingPrice = await ShippingPrice.find({
          userID: req.user.adminUser,
          type: 2,
        }).sort({ title: 1 })

        const getWeight = (weightPrice) => {
          let weight = 0

          const shippingArr = shippingPrice.filter((item) => item.price >= weightPrice)
          if (shippingArr.length > 0) {
            weight = shippingArr[0].title
          }
          return weight
        }

        if (product && Array.isArray(product)) {
          const data = product[0].data
            .filter((item) => item.product !== undefined)
            .map((item) => {
              let titleArr = item.product.korTitle.split(" ")
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

              return {
                _id: item._id,
                url: item.basic.url,
                user:
                  item.user && Array.isArray(item.user) && item.user.length > 0
                    ? {
                        ...item.user[0],
                      }
                    : null,
                isWinner: item.isWinner ? item.isWinner : false,
                isNaver: item.isNaver ? item.isNaver : false,
                isCoupang: item.isCoupang ? item.isCoupang : false,
                weightPrice:
                  item.product && item.product.weightPrice ? item.product.weightPrice : null,
                weight:
                  item.product && item.product.weightPrice
                    ? getWeight(item.product.weightPrice)
                    : 0,
                titleArray: titleArr,
                korTitle:
                  item.product && item.product.korTitle
                    ? item.product.korTitle
                    : item.basic.korTitle,
                naverCategoryName: item.basic.naverCategoryName,
                mainImage:
                  item.product &&
                  item.product.mainImages &&
                  Array.isArray(item.product.mainImages) &&
                  item.product.mainImages.length > 0
                    ? item.product.mainImages[0]
                    : Array.isArray(item.basic.mainImages) &&
                      item.basic.mainImages.length > 0 &&
                      item.basic.mainImages[0]
                    ? item.basic.mainImages[0]
                    : item.options[0].image,
                cafe24: {
                  mallID: item.product && item.product.cafe24 ? item.product.cafe24.mallID : "",
                  shop_no: item.product && item.product.cafe24 ? item.product.cafe24.shop_no : 1,
                  product_no:
                    item.product && item.product.cafe24 ? item.product.cafe24.product_no : 0,
                  product_code:
                    item.product && item.product.cafe24 ? item.product.cafe24.product_code : "",
                  custom_product_code:
                    item.product && item.product.cafe24
                      ? item.product.cafe24.custom_product_code
                      : "",
                },
                coupang: {
                  productID:
                    item.product && item.product.coupang && item.product.coupang.productID
                      ? item.product.coupang.productID
                      : null,
                  status: item.product && item.product.coupang ? item.product.coupang.status : null,
                  displayCategoryCode:
                    item.coupang && item.coupang.displayCategoryCode
                      ? item.coupang.displayCategoryCode
                      : null,
                  displayCategoryName:
                    item.coupang && item.coupang.displayCategoryName
                      ? item.coupang.displayCategoryName
                      : null,
                },
                options:
                  item.options && Array.isArray(item.options)
                    ? item.options.map((Oitem, index) => {
                        return {
                          key: Oitem.key,
                          value: Oitem.value,
                          korValue: Oitem.korValue,
                          propPath: Oitem.propPath,
                          image: Oitem.image,
                          price: Oitem.price,
                          productPrice: Oitem.productPrice,
                          salePrice: Oitem.salePrice,
                          stock: Oitem.stock,
                          disabled: Oitem.disabled,
                          active: Oitem.active,
                          base: Oitem.base,
                          cafe24_variant_code: Oitem.cafe24 ? Oitem.cafe24.variant_code : null,
                          coupang_sellerProductItemId: Oitem.coupang
                            ? Oitem.coupang.sellerProductItemId
                            : null,
                          coupang_vendorItemId: Oitem.coupang ? Oitem.coupang.vendorItemId : null,
                          coupang_itemId: Oitem.coupang ? Oitem.coupang.itemId : null,
                        }
                      })
                    : [],
                createdAt: item.createdAt,
              }
            })

          setTimeout(async () => {
            let notApprovedProduct = []
            try {
              notApprovedProduct = await Product.aggregate([
                {
                  $match: {
                    userID: ObjectId(req.user.adminUser),
                    isDelete: false,
                    product: { $ne: null },
                    createdAt: { $exists: true },
                    "product.coupang": { $ne: null },
                    "product.coupang.status": {
                      $nin: ["승인완료", "승인반려", "상품삭제"],
                    },
                  },
                },
                {
                  $sort: {
                    _id: -1,
                  },
                },
                {
                  $project: {
                    _id: 1,
                    userID: 1,
                    product: 1,
                    options: 1,
                  },
                },
              ])
            } catch (e) {}

            for (const item of notApprovedProduct) {
              try {
                if (item.product && item.product.coupang && item.product.coupang.productID) {
                  const historyResponse = await CoupnagGET_PRODUCT_STATUS_HISTORY({
                    userID: item.userID,
                    productID: item.product.coupang.productID,
                  })

                  if (!item.product.coupang) {
                    item.product.coupang = {}
                  }
                  item.product.coupang.status =
                    historyResponse && historyResponse.data && historyResponse.data.length > 0
                      ? historyResponse.data[0].statusName
                      : null
                  item.product.coupang.statusHistory = historyResponse.data
                  const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
                    userID: item.userID,
                    productID: item.product.coupang.productID,
                  })

                  if (response && response.data && response.data.status) {
                    if (response.data.status === "APPROVED" || response.data.status === "DENIED") {
                      for (const ItemOption of item.options) {
                        if (!ItemOption.coupang) {
                          ItemOption.coupang = {}
                        }
                        ItemOption.coupang.sellerProductItemId = null
                        ItemOption.coupang.vendorItemId = null
                        ItemOption.coupang.itemId = null
                      }

                      response.data.items.forEach((optionItem, index) => {
                        for (const ItemOption of item.options) {
                          if (ItemOption.korValue === optionItem.itemName) {
                            if (!ItemOption.coupang) {
                              ItemOption.coupang = {}
                            }
                            ItemOption.coupang.sellerProductItemId = `${optionItem.sellerProductItemId}`
                            ItemOption.coupang.vendorItemId = `${optionItem.vendorItemId}`
                            ItemOption.coupang.itemId = `${optionItem.itemId}`
                          }
                        }
                      })
                    }
                    await Product.findOneAndUpdate(
                      {
                        userID: item.userID,
                        _id: item._id,
                      },
                      {
                        $set: {
                          // product: item.product,
                          "product.coupang": item.product.coupang,
                          options: item.options,
                        },
                      }
                    )
                  }
                }
              } catch (e) {
                console.log("notApprovedProduct--", e)
              }
            }
          }, 1000)
          return {
            count: product[0].count[0] ? product[0].count[0].count : 0,
            list: data,
          }
        } else {
          return {
            count: 0,
            list: [],
          }
        }
      } catch (e) {
        console.log("productList", e)
        logger.error(`ProductList: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    DeleteCoupangItem: async (
      parent,
      { userID, input },
      { model: { Product, CoupangProduct }, logger }
    ) => {
      let i = 1
      for (const item of input) {
        try {
          console.log("productName", i++, item.productName)

          // if (!product || product.length === 0) {
          //   console.log("없음")
          //   continue
          // }

          const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
            userID,
            // productID: product[0].product.coupang.productID
            productID: item.vendorInventoryId,
          })

          for (const item of response.data.items) {
            const resposne = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
              userID,
              vendorItemId: item.vendorItemId,
            })

            await sleep(100)
          }
          // if (product[0].options) {
          //   console.log("여기2")
          //   for (const item of product[0].options) {
          //     console.log("여기3", item.coupang)
          //     if (item.coupang && item.coupang.vendorItemId) {
          //       console.log("여기4")
          //       const resposne = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
          //         userID: req.user.adminUser,
          //         vendorItemId: item.coupang.vendorItemId
          //       })
          //       console.log("deleteItem", response)
          //     }
          //   }

          //   await sleep(1000)
          // }
          const coupnagResponse = await CouapngDeleteProduct({
            userID,
            productID: item.vendorInventoryId.toString(),
          })

          let couapngResult = false
          if (coupnagResponse && coupnagResponse.code && coupnagResponse.code === "SUCCESS") {
            couapngResult = true
          }

          if (couapngResult) {
            const temp = await Product.findOne({
              "product.coupang.productID": item.vendorInventoryId.toString(),
            })

            let isDelete = false
            if (temp && !temp.product.cafe24.product_no) {
              isDelete = true
            }

            await Product.findOneAndUpdate(
              {
                "product.coupang.productID": item.vendorInventoryId.toString(),
              },
              {
                $set: {
                  "product.coupang.productID": null,
                  isDelete,
                },
              }
            )

            await CoupangProduct.deleteOne({
              userID,
              sellerProductId: item.vendorInventoryId.toString(),
            })
          }
        } catch (e) {
          console.log("DeleteCoupangItem", e)
        }
      }

      console.log("끝")
      return true
    },
    DeleteProduct: async (
      parent,
      { coupangID, cafe24ID, mallID },
      { req, model: { Product }, logger }
    ) => {
      try {
        // const product1 = await Product.findOne({
        //   "product.coupang.productID": coupangID
        // })
        console.log("여기 타냐?")
        const product = await Product.aggregate([
          {
            $match: {
              "product.coupang.productID": coupangID,
            },
          },
        ])
        if (!product || product.length === 0) {
          return false
        }

        if (product[0].options) {
          for (const item of product[0].options) {
            if (item.coupang && item.coupang.vendorItemId) {
              await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
                userID: req.user.adminUser,
                vendorItemId: item.coupang.vendorItemId,
              })
            }
          }

          await sleep(1000)
        }

        const coupnagResponse = await CouapngDeleteProduct({
          userID: req.user.adminUser,
          productID: coupangID,
        })

        const cafe24Response = await Cafe24DeleteProduct({
          mallID,
          product_no: cafe24ID,
        })

        const couapngResult =
          coupangID === coupnagResponse && coupnagResponse.data && coupnagResponse.data.toString()
        const cafe24Result =
          `${cafe24ID}` === cafe24Response &&
          cafe24Response.data &&
          cafe24Response.data.product.product_no.toString()

        await Product.findOneAndUpdate(
          {
            "product.cafe24.product_no": cafe24ID,
            "product.coupang.productID": coupangID,
          },
          {
            $set: {
              isDelete: true,
            },
          }
        )
        return true
      } catch (e) {
        logger.error(`DeleteProduct: ${e}`)
        return false
      }
    },
    DeleteCoupang: async (
      parent,
      { coupangID },
      { req, model: { Product, CoupangProduct }, logger }
    ) => {
      try {
        const product = await Product.aggregate([
          {
            $match: {
              "product.coupang.productID": coupangID,
            },
          },
        ])

        if (!product || product.length === 0) {
          return false
        }

        const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID: req.user.adminUser,
          productID: product[0].product.coupang.productID,
        })

        for (const item of response.data.items) {
          const resposne = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
            userID: req.user.adminUser,
            vendorItemId: item.vendorItemId,
          })

          console.log("resposne", resposne)
          await sleep(100)
        }
        // if (product[0].options) {
        //   console.log("여기2")
        //   for (const item of product[0].options) {
        //     console.log("여기3", item.coupang)
        //     if (item.coupang && item.coupang.vendorItemId) {
        //       console.log("여기4")
        //       const resposne = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
        //         userID: req.user.adminUser,
        //         vendorItemId: item.coupang.vendorItemId
        //       })
        //       console.log("deleteItem", response)
        //     }
        //   }

        //   await sleep(1000)
        // }
        const coupnagResponse = await CouapngDeleteProduct({
          userID: req.user.adminUser,
          productID: coupangID,
        })

        let couapngResult = false
        if (coupnagResponse && coupnagResponse.code && coupnagResponse.code === "SUCCESS") {
          couapngResult = true
        }

        if (couapngResult) {
          const temp = await Product.findOne({
            "product.coupang.productID": coupangID,
          })

          let isDelete = false
          if (temp && !temp.product.cafe24.product_no) {
            isDelete = true
          }

          await Product.findOneAndUpdate(
            {
              "product.coupang.productID": coupangID,
            },
            {
              $set: {
                "product.coupang.productID": null,
                isDelete,
              },
            }
          )

          await CoupangProduct.deleteOne({
            userID: req.user.adminUser,
            sellerProductId: coupangID,
          })
        }

        return couapngResult
      } catch (e) {
        logger.error(`DeleteCoupang: ${e}`)
        return false
      }
    },
    DeleteCafe24: async (parent, { cafe24ID, mallID }, { req, model: { Product }, logger }) => {
      try {
        const cafe24Response = await Cafe24DeleteProduct({
          mallID,
          product_no: cafe24ID,
        })

        let cafe24Result = false

        if (cafe24Response && cafe24Response.message === null) {
          cafe24Result = true
        }

        if (cafe24Result) {
          const temp = await Product.findOne({
            "product.cafe24.product_no": cafe24ID,
            userID: req.user.adminUser,
          })

          let isDelete = false
          if (temp && !temp.product.coupang.productID) {
            isDelete = true
          }

          await Product.findOneAndUpdate(
            {
              "product.cafe24.product_no": cafe24ID,
              userID: req.user.adminUser,
            },
            {
              $set: {
                "product.cafe24.product_no": null,
                isDelete,
              },
            }
          )
        }

        return cafe24Result
      } catch (e) {
        logger.error(`DeleteProduct: ${e}`)
        return false
      }
    },
    DelleteSelectedRowItem: async (
      parent,
      { input, userID },
      { req, model: { Product, Market, TempProduct, AmazonCollection }, logger }
    ) => {
      try {
        //coupangID, cafe24ID, mallID
        const user = userID ? userID : req.user.adminUser

        setTimeout(async () => {
          const market = await Market.findOne({
            userID: ObjectId(user),
          })
          for (const item of input) {
            try {
             
              let product = await Product.aggregate([
                {
                  $match: {
                    _id: ObjectId(item._id),
                  },
                },
              ])
              if (item.coupangID) {
                product = await Product.aggregate([
                  {
                    $match: {
                      userID: ObjectId(user),
                      "product.coupang.productID": item.coupangID,
                    },
                  },
                ])
              } else if (item.cafe24ID) {
                product = await Product.aggregate([
                  {
                    $match: {
                      userID: ObjectId(user),
                      "product.cafe24.product_no": item.cafe24ID,
                    },
                  },
                ])
              }

              if (!product || product.length === 0) {
                console.log("여기 타냐?/")
                continue
              }

              if (item.coupangID) {
                const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
                  userID: ObjectId(user),
                  productID: product[0].product.coupang.productID,
                })

                if (response && response.data) {
                  for (const item of response.data.items) {
                    const resposne = await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
                      userID: ObjectId(user),
                      vendorItemId: item.vendorItemId,
                    })
                    console.log("resposne", resposne)
                    await sleep(100)
                  }
                }
              }

              let coupangDelete = false
              let cafe24Delete = true
              if (item.coupangID) {
                const coupnagResponse = await CouapngDeleteProduct({
                  userID: ObjectId(user),
                  productID: item.coupangID,
                })

                coupangDelete =
                  item.coupangID ===
                    (coupnagResponse && coupnagResponse.data && coupnagResponse.data.toString()) ||
                  coupnagResponse.data === null
              }

              if (item.cafe24ID) {
                await sleep(500)
                let cafe24Response = await Cafe24DeleteProduct({
                  mallID: market.cafe24.mallID,
                  product_no: item.cafe24ID,
                })
            
                await Product.findOneAndUpdate(
                  {
                    _id: product[0]._id,
                    userID: ObjectId(user),
                  },
                  {
                    $set: {
                      "product.cafe24": null,
                    },
                  }
                )

                cafe24Delete =
                  `${item.cafe24ID}` ===
                    (cafe24Response &&
                      cafe24Response.data &&
                      cafe24Response.data.product.product_no.toString()) ||
                  cafe24Response.data === null

                if (!cafe24Delete) {
                  cafe24Response = await Cafe24DeleteProduct({
                    mallID: market.cafe24.mallID,
                    product_no: product[0].product.cafe24.product_no,
                  })

                  cafe24Delete =
                    `${product[0].product.cafe24.product_no}` ===
                      (cafe24Response &&
                        cafe24Response.data &&
                        cafe24Response.data.product.product_no.toString()) ||
                    cafe24Response.data === null
                }
              }
              
            
              await Product.findOneAndUpdate(
                {
                  _id: product[0]._id,
                  userID: ObjectId(user),
                },
                {
                  $set: {
                    isDelete: true,
                  },
                }
              )

              await AmazonCollection.findOneAndUpdate(
                {
                  userID: ObjectId(product[0].userID),
                  asin: product[0].good_id,
                },
                {
                  $set: {
                    isDelete: true,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )

              await TempProduct.deleteOne({
                userID: ObjectId(product[0].userID),
                good_id: product[0].good_id,
              })

              // if (!item.coupangID && !item.cafe24ID) {
              //   console.log("쿠팡, 카페24 둘다 없음")
              //   await Product.findOneAndUpdate(
              //     {
              //       _id: product[0]._id,
              //     },
              //     {
              //       $set: {
              //         isDelete: true,
              //       },
              //     }
              //   )

              //   await AmazonCollection.findOneAndUpdate(
              //     {
              //       userID: ObjectId(product[0].userID),
              //       asin: product[0].good_id,
              //     },
              //     {
              //       $set: {
              //         isDelete: true,
              //       },
              //     },
              //     {
              //       upsert: true,
              //       new: true,
              //     }
              //   )

              //   await TempProduct.deleteOne({
              //     userID: ObjectId(product[0].userID),
              //     good_id: product[0].good_id,
              //   })
              // }

              // if (coupangDelete && cafe24Delete) {
              //   console.log("삭제", product[0]._id)
              //   await Product.findOneAndUpdate(
              //     {
              //       _id: product[0]._id,
              //     },
              //     {
              //       $set: {
              //         isDelete: true,
              //       },
              //     }
              //   )

              //   await AmazonCollection.findOneAndUpdate(
              //     {
              //       userID: ObjectId(product[0].userID),
              //       asin: product[0].good_id,
              //     },
              //     {
              //       $set: {
              //         isDelete: true,
              //       },
              //     },
              //     {
              //       upsert: true,
              //       new: true,
              //     }
              //   )

              //   await TempProduct.deleteOne({
              //     userID: ObjectId(product[0].userID),
              //     good_id: product[0].good_id,
              //   })
              // }
            } catch (e) {
              console.log("삭제", e)
            }
          }
        }, 1000)

        return true
      } catch (e) {
        return false
      }
    },
    DeleteFavoriteItem: async (parent, { id }, { model: { Product }, logger }) => {
      try {
        await Product.findOneAndUpdate(
          { _id: Object(id) },
          {
            $set: {
              isDelete: true,
            },
          }
        )
        return true
      } catch (e) {
        logger.error(`DeleteFavoriteItem: ${e}`)
        return false
      }
    },
    DeleteFavoriteAllItem: async (parent, {}, { req, model: { Product }, logger }) => {
      try {
        await Product.update(
          {
            userID: ObjectId(req.user.adminUser),
            isDelete: false,
            "basic.dataID": { $ne: null },
            coupangUpdatedAt: { $exists: false },
            cafe24UpdatedAt: { $exists: false },
          },
          {
            $set: {
              isDelete: true,
            },
          },
          {
            multi: true,
          }
        )
        return true
      } catch (e) {
        logger.error(`DeleteFavoriteItem: ${e}`)
        return false
      }
    },
    GetExcelNaver: async (parent, {}, { req, model: { Product }, logger }) => {
      try {
        let excelArray = []
        let _id = "5f7bcf3b7205fe471e23c23b"
        const folder = moment().format("YYYYMMDD_HHmmSS")
        const response = await GetNaverExcelItem({ productID: _id, folder })
        console.log("respose", response)
      } catch (e) {
        logger.error(`GetExcelNaver: ${e}`)
        return false
      }
    },
    UploadItemWinner: async (
      parent,
      { _id, coupangID, title, detailUrl, subPrice, isClothes, isShoes, userID },
      {
        req,
        model: { CoupangWinner, CoupangItem, Product, Basic, Market, ShippingPrice, ExchangeRate },
        logger,
      }
    ) => {
      const user = userID ? ObjectId(userID) : req.user.adminUser
      try {
        let winnerItem = null
        let _productNo = null
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
                state: 4,
              },
            },
            { new: true }
          )

          _productNo = winnerItem.productNo
          _coupangID = winnerItem.CoupangID
          _title = winnerItem.title
          _detailUrl = winnerItem.detailUrl
          _subPrice = winnerItem.subPrice
          _isClothes = winnerItem.isClothes
          _isShoes = winnerItem.isShoes
        } else {
          winnerItem = await CoupangWinner.findOneAndUpdate(
            {
              userID: user,
              CoupangID: _coupangID,
            },
            {
              $set: {
                userID: user,
                writerID: user,
                CoupangID: _coupangID,
                state: 1,
                title: _title,
                detailUrl: _detailUrl,
                subPrice: _subPrice,
                isClothes: _isClothes,
                isShoes: _isShoes,
                lastUpdate: moment().toDate(),
              },
              $setOnInsert: {
                createdAt: moment().toDate(),
              },
            },
            { new: true, upsert: true }
          )
        }

        setTimeout(async () => {
          try {
            if (winnerItem.productNo) {
              // 네이버 상품일 경우

              // 환율product.addPrice
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

              const marginInfo = await ShippingPrice.aggregate([
                {
                  $match: {
                    userID: user,
                    type: 1,
                  },
                },
                {
                  $sort: {
                    title: 1,
                  },
                },
              ])

              const shippingWeightInfo = await ShippingPrice.aggregate([
                {
                  $match: {
                    userID: user,
                    type: 2,
                  },
                },
                {
                  $sort: {
                    title: -1,
                  },
                },
              ])

              let weightPrice = 0
              let shippingArr = shippingWeightInfo.filter(
                (item) => item.title > winnerItem.shippingWeight
              )
              if (shippingArr > 0) {
                weightPrice = shippingArr[0].price
              } else {
                weightPrice = shippingWeightInfo[shippingWeightInfo.length - 1].price
              }

              const exchange = Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 175) + 5
              // const margin = marginInfo && Number(marginInfo.title) ? marginInfo.title : 30

              const addPriceCalc = (wian, weightPrice, margin) => {
                const addPrice = -(
                  ((exchange * margin + 11 * exchange) * Number(wian) +
                    weightPrice * margin +
                    11 * weightPrice) /
                  (margin - 89)
                )

                return addPrice
              }

              const marketItem = await Market.findOne({
                userID: user,
              })

              const basicItem = await Basic.findOne({
                userID: user,
              })

              console.log("타오바오 크롤링 시작1", winnerItem.detailUrl)
              let detailItem = null
              try {
                detailItem = await getTaobaoItemAPI({
                  url: winnerItem.detailUrl,
                  userID: user,
                  orginalTitle: winnerItem.title,
                })
              } catch (e) {
                logger.error(`getTaobaoItem: ${e}`)
              }

              if (!detailItem) {
                console.log("타오바오 크롤링 실패 1")
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 1",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                return false
              }
              // if(detailItem.title.length === 0){
              //   console.log("타오바오 크롤링 실패 2")
              //   await CoupangWinner.findOneAndUpdate(
              //     {
              //       _id: winnerItem._id
              //     },
              //     {
              //       $set: {
              //         state: 3,
              //         error: "타오바오 크롤링 실패 2",
              //         lastUpdate: moment().toDate()
              //       }
              //     }
              //   )
              //   return false
              // }

              if (detailItem.options.length === 0) {
                console.log("타오바오 크롤링 실패 3 2")
                console.log("--- ", detailItem)
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 3",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                return false
              }

              detailItem.url = winnerItem.detailUrl
              detailItem.naverID = winnerItem.productNo

              console.log("타오바오 크롤링 끝")

              let options = detailItem.options
                .filter((item) => item.image)
                .map((item, index) => {
                  let margin = 30
                  let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(item.price))

                  if (marginArr.length > 0) {
                    margin = marginArr[0].price
                  } else {
                    margin = marginInfo[marginInfo.length - 1].price
                  }

                  let addPrice = addPriceCalc(item.price, weightPrice, margin)

                  return {
                    margin,
                    weightPrice,
                    addPrice,
                    propPath: item.propPath,
                    key: item.key ? item.key : index,
                    // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                    korValue: item.korValue,
                    image: item.originImage ? item.originImage : item.image,
                    price: item.price,
                    productPrice:
                      Math.ceil(
                        (Number(item.price) * exchange + addPrice + weightPrice) * 1.3 * 0.1
                      ) * 10,
                    salePrice:
                      Math.ceil((Number(item.price) * exchange + addPrice + weightPrice) * 0.1) *
                      10,
                    stock: item.stock,
                    disabled: item.disabled,
                    active: item.active,
                    base: index === 0,
                    attributes: item.taobaoAttributes
                      ? item.taobaoAttributes.map((att) => {
                          return {
                            attributeTypeName: att.attributeTypeName,
                            attributeValueName: att.attributeValueName,
                          }
                        })
                      : item.attributes,
                  }
                })

              let duplication = false
              let optionValueArray = []
              for (const item of options) {
                if (optionValueArray.includes(item.korValue)) {
                  duplication = true
                }
                optionValueArray.push(item.korValue)

                if (item.korValue.length > 25) {
                  duplication = true
                }

                if (
                  item.attributes.filter((attrItem) => attrItem.attributeValueName.length > 30)
                    .length > 0
                ) {
                  duplication = true
                }

                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: marketItem.cafe24.mallID,
                    images: [item.image],
                  })

                  if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                    item.image = imagesResponse.data.images[0].path
                  }
                  await sleep(1000)
                }
              }

              if (duplication) {
                options = options.map((item, index) => {
                  delete item.attributes
                  return {
                    ...item,
                    korKey: `${getAlphabet(index)}타입`,
                  }
                })
              }

              // 옵션 HTML
              let optionHtml = ``
              if (detailItem.optionsImage && !duplication) {
                for (const item of detailItem.optionsImage.filter((i, index) => index < 100)) {
                  optionHtml += `<p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                ${item.korName}
                </div>
                <img src="${item.image}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                }
              } else {
                for (const item of options.filter((i, index) => index < 100)) {
                  item.attributes = null

                  if (item.active && item.image) {
                    optionHtml += `
                <p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
                </div>
                <img src="${
                  item.image
                }" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                  }
                }
              }

              let detailHtml = ``
              if (detailItem && Array.isArray(detailItem.content)) {
                for (const item of detailItem.content) {
                  detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
                }
              }

              // let addPrice = addPriceCalc(item.price)
              let margin = 30
              let maringArr = marginInfo.filter(
                (fItem) => fItem.title > Number(detailItem.options[0].price)
              )
              if (maringArr.length > 0) {
                margin = maringArr[0].price
              } else {
                margin = marginInfo[marginInfo.length - 1].price
              }

              let addPrice = addPriceCalc(detailItem.options[0].price, weightPrice, margin)

              const product = {
                addPrice,
                weightPrice,
                good_id: detailItem.good_id,
                naverID: _productNo,
                korTitle: _title.slice(0, 100),
                mainImages: detailItem.mainImages,
                price:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) *
                      1.3 *
                      0.1
                  ) * 10,
                salePrice:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) * 0.1
                  ) * 10,
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
                naverCategoryCode: detailItem.naverCategoryCode,
              }

              const coupang = {
                displayCategoryCode: detailItem.categoryCode,
                vendorId: detailItem.vendorId,
                vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
                deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode,
                returnCenterCode: detailItem.returnCenter.returnCenterCode,
                returnChargeName: detailItem.returnCenter.shippingPlaceName,
                companyContactNumber:
                  detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
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

                notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detailItem.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detailItem.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: user ? user : null,
                  "basic.good_id": detailItem.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID:
                      winnerItem && winnerItem.writerID
                        ? winnerItem.writerID
                        : user && user
                        ? req.user._id
                        : null,
                    basic: detailItem,
                    product,
                    prop: detailItem.prop ? detailItem.prop : [],
                    options: detailItem.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isNaver: true,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )

              const response = await updateCoupang({
                id: productItem._id,
                product,
                options,
                coupang,
                userID: user,
                writerID: user,
              })

              console.log("productItem._id", productItem._id)
              console.log("response", response)
              // console.log("winnerItem._id", winnerItem._id)
              if (response.coupang.code === null) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 2,
                      error: null,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              } else {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: response.coupang.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            } else {
              console.log("쿠팡 업로드 시작11", _coupangID)
              const coupangItem = await CoupangItem.findOne({ _id: _coupangID })

              await coupangDetailSingle({ url: coupangItem.detail })

              await sleep(1000)

              const marketItem = await Market.findOne({
                userID: user,
              })
              // console.log("coupangItem", coupangItem)
              // console.log("title", title)
              // console.log("detailUrl", detailUrl)
              // console.log("subPrice", subPrice)

              const urlObject = url.parse(coupangItem.detail, true)
              // const itemId = urlObject.query.itemId
              const productId = urlObject.pathname.replace("/vp/products/", "")

              const tempProduct = await Product.findOne({
                userID: user,
                "basic.naverID": productId,
              })

              if (!tempProduct) {
                console.log("tempProduct 없음", user, productId)
                // return false
              }

              const basicItem = await Basic.findOne({
                userID: user,
              })
              console.log("타오바오 크롤링 시작2", _detailUrl)
              const detailItem = await getTaobaoItem({ url: _detailUrl, userID: user })
              if (!detailItem || detailItem.title.length === 0) {
                return false
              }
              detailItem.url = _detailUrl
              detailItem.naverID = productId
              console.log("타오바오 크롤링 끝")
              console.log("detailItem", detailItem)
              // 옵션 HTML
              let optionHtml = ``
              // for (const item of coupangItem.options.filter(item => {
              //   if (item.korTitle1 === "오류시 연락주세요") {
              //     return false
              //   }
              //   if (item.korTitle2 === "오류시 연락주세요") {
              //     return false
              //   }
              //   if (item.title === "오류시 연락주세요") {
              //     return false
              //   }
              //   if( item.title.includes("오류")){
              //     return false
              //   }
              //   return true
              // })) {
              //   if (item.active && item.image) {
              //     optionHtml += `
              // <p style="text-align: center;" >
              // <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
              // ${item.title ? item.title : coupangItem.title}
              // </div>
              // <img src="${item.image.replace(
              //   /492/gi,
              //   "800"
              // )}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
              // <p style="text-align: center;" >
              // <br />
              // </p>
              // `
              //   }
              // }

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
                  coupangItem.options[0].price +
                  (coupangItem.options[0].shippingFee || 0) -
                  subPrice,
                salePrice:
                  coupangItem.options[0].price +
                  (coupangItem.options[0].shippingFee || 0) -
                  subPrice,
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
                naverCategoryCode: detailItem.naverCategoryCode,
              }

              const options = coupangItem.options
                .filter((item) => item.image)
                .filter((item) => {
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
                      attributeValueName: item.optionTitle1.slice(0, 30),
                    })
                  }
                  if (item.optionKey2 && item.optionTitle2) {
                    attributes.push({
                      attributeTypeName: item.optionKey2.slice(0, 30),
                      attributeValueName: item.optionTitle2.slice(0, 30),
                    })
                  }
                  return {
                    key: index,
                    // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                    korValue: item.title,
                    image: item.originImage ? item.originImage : item.image,
                    price: item.price + (item.shippingFee || 0) - _subPrice,
                    productPrice:
                      Math.ceil((item.price + (item.shippingFee || 0) - _subPrice) * 1.3 * 0.1) *
                      10,
                    salePrice: item.price + (item.shippingFee || 0) - _subPrice,
                    stock: 20,
                    disabled: false,
                    active: item.active,
                    base: index === 0,
                    attributes,
                  }
                })

              for (const item of options) {
                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: marketItem.cafe24.mallID,
                    images: [item.image],
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
                companyContactNumber:
                  detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
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

                notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detailItem.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detailItem.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: user,
                  "basic.good_id": detailItem.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID: winnerItem.writerID ? winnerItem.writerID : user,
                    basic: detailItem,
                    product,
                    options: detailItem.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isWinner: true,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )

              const response = await updateCoupang({
                id: productItem._id,
                product,
                options,
                coupang,
                userID: user,
                writerID: user,
              })
              console.log("productItem._id", productItem._id)
              console.log("response", response)
              console.log("winnerItem._id", winnerItem._id)
              if (response.coupang.code === null) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 2,
                      error: null,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              } else {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: response.coupang.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            }
          } catch (e) {
            console.log("error", e)
            await CoupangWinner.findOneAndUpdate(
              {
                _id: winnerItem._id,
              },
              {
                $set: {
                  state: 3,
                  error: e.message,
                  lastUpdate: moment().toDate(),
                },
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
        console.log(`UploadItemWinner: ${e}`)
        return false
      } finally {
        return true
      }
    },
    UploadNaverItemWinner: async (
      parent,
      { input },
      {
        req,
        model: { CoupangWinner, CoupangItem, Product, Basic, Market, ShippingPrice, ExchangeRate },
        logger,
      }
    ) => {
      try {
        setTimeout(async () => {
          for (const item of input) {
            const { _id, coupangID, title, detailUrl, subPrice, isClothes, isShoes, userID } = item
            const user = userID ? ObjectId(userID) : req.user.adminUser
            try {
              let winnerItem = null
              let _productNo = null
              let _coupangID = coupangID
              let _title = title
              let _detailUrl = detailUrl
              let _subPrice = subPrice
              let _isClothes = isClothes
              let _isShoes = isShoes
              let _sellerTags = []
              if (_id) {
                winnerItem = await CoupangWinner.findOneAndUpdate(
                  { _id },
                  {
                    $set: {
                      state: 4,
                    },
                  },
                  { new: true }
                )

                _productNo = winnerItem.productNo
                _coupangID = winnerItem.CoupangID
                _title = winnerItem.title
                _detailUrl = winnerItem.detailUrl
                _subPrice = winnerItem.subPrice
                _isClothes = winnerItem.isClothes
                _isShoes = winnerItem.isShoes
                _html = winnerItem.html
                _detailImages = winnerItem.detailImages
                _sellerTags = winnerItem.sellerTags
              } else {
                winnerItem = await CoupangWinner.findOneAndUpdate(
                  {
                    userID: user,
                    CoupangID: _coupangID,
                  },
                  {
                    $set: {
                      userID: user,
                      writerID: user,
                      CoupangID: _coupangID,
                      state: 1,
                      title: _title,
                      detailUrl: _detailUrl,
                      subPrice: _subPrice,
                      isClothes: _isClothes,
                      isShoes: _isShoes,
                      lastUpdate: moment().toDate(),
                    },
                    $setOnInsert: {
                      createdAt: moment().toDate(),
                    },
                  },
                  { new: true, upsert: true }
                )
              }

              try {
                if (winnerItem.productNo) {
                  // 네이버 상품일 경우

                  // 환율product.addPrice
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

                  const marginInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: user,
                        type: 1,
                      },
                    },
                    {
                      $sort: {
                        title: 1,
                      },
                    },
                  ])

                  const shippingWeightInfo = await ShippingPrice.aggregate([
                    {
                      $match: {
                        userID: user,
                        type: 2,
                      },
                    },
                    {
                      $sort: {
                        title: -1,
                      },
                    },
                  ])

                  let weightPrice = 0
                  let shippingArr = shippingWeightInfo.filter(
                    (item) => item.title >= winnerItem.shippingWeight
                  )

                  if (shippingArr.length > 0) {
                    weightPrice = shippingArr[shippingArr.length - 1].price
                  } else {
                    weightPrice = shippingWeightInfo[shippingWeightInfo.length - 1].price
                  }
                  console.log("winnerItem.shippingWeight", winnerItem.shippingWeight)
                  console.log("weightPrice", weightPrice)
                  const exchange =
                    Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 175) + 5
                  // const margin = marginInfo && Number(marginInfo.title) ? marginInfo.title : 30

                  const addPriceCalc = (wian, weightPrice, margin) => {
                    const addPrice = -(
                      ((exchange * margin + 11 * exchange) * Number(wian) +
                        weightPrice * margin +
                        11 * weightPrice) /
                      (margin - 89)
                    )

                    return addPrice
                  }

                  const marketItem = await Market.findOne({
                    userID: user,
                  })

                  const basicItem = await Basic.findOne({
                    userID: user,
                  })

                  console.log("타오바오 크롤링 시작5", winnerItem.detailUrl)
                  let detailItem = null
                  try {
                    detailItem = await getTaobaoItemAPI({
                      url: winnerItem.detailUrl,
                      userID: user,
                      orginalTitle: winnerItem.title,
                      detailImages: _detailImages
                    })
                  } catch (e) {
                    logger.error(`getTaobaoItem: ${e}`)
                    continue
                  }

                  if (!detailItem) {
                    console.log("타오바오 크롤링 실패 5")
                    await CoupangWinner.findOneAndUpdate(
                      {
                        _id: winnerItem._id,
                      },
                      {
                        $set: {
                          state: 3,
                          error: "타오바오 크롤링 실패 5",
                          lastUpdate: moment().toDate(),
                        },
                      }
                    )
                    continue
                  }
                  // if(detailItem.title.length === 0){
                  //   console.log("타오바오 크롤링 실패 2")
                  //   await CoupangWinner.findOneAndUpdate(
                  //     {
                  //       _id: winnerItem._id
                  //     },
                  //     {
                  //       $set: {
                  //         state: 3,
                  //         error: "타오바오 크롤링 실패 2",
                  //         lastUpdate: moment().toDate()
                  //       }
                  //     }
                  //   )
                  //   return false
                  // }

                  if (detailItem.options.length === 0) {
                    console.log("타오바오 크롤링 실패 3 1")
                    
                    await CoupangWinner.findOneAndUpdate(
                      {
                        _id: winnerItem._id,
                      },
                      {
                        $set: {
                          state: 3,
                          error: "타오바오 크롤링 실패 3",
                          lastUpdate: moment().toDate(),
                        },
                      }
                    )
                    continue
                  }

                  detailItem.url = winnerItem.detailUrl
                  detailItem.naverID = winnerItem.productNo

                  console.log("타오바오 크롤링 끝")

                  let options = detailItem.options
                    .filter((item) => item.image)
                    .map((item, index) => {
                      let margin = 30
                      let marginArr = marginInfo.filter(
                        (fItem) => fItem.title >= Number(item.price)
                      )

                      if (marginArr.length > 0) {
                        margin = marginArr[0].price
                      } else {
                        margin = marginInfo[marginInfo.length - 1].price
                      }

                      let addPrice = addPriceCalc(item.price, weightPrice, margin)

                      return {
                        margin,
                        weightPrice,
                        addPrice,
                        propPath: item.propPath,
                        key: item.key ? item.key : index,
                        // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                        korValue: item.korValue,
                        image: item.originImage ? item.originImage : item.image,
                        price: item.price,
                        productPrice:
                          Math.ceil(
                            (Number(item.price) * exchange + addPrice + weightPrice) * 1.3 * 0.1
                          ) * 10,
                        salePrice:
                          Math.ceil(
                            (Number(item.price) * exchange + addPrice + weightPrice) * 0.1
                          ) * 10,
                        stock: item.stock,
                        disabled: item.disabled,
                        active: item.active,
                        base: index === 0,
                        attributes: item.taobaoAttributes
                          ? item.taobaoAttributes.map((att) => {
                              return {
                                attributeTypeName: att.attributeTypeName,
                                attributeValueName: att.attributeValueName,
                              }
                            })
                          : item.attributes,
                      }
                    })

                  let duplication = false
                  let optionValueArray = []
                  for (const item of options) {
                    if (optionValueArray.includes(item.korValue)) {
                      duplication = true
                    }
                    optionValueArray.push(item.korValue)

                    if (item.korValue.length > 25) {
                      duplication = true
                    }

                    if (
                      item.attributes.filter((attrItem) => attrItem.attributeValueName.length > 30)
                        .length > 0
                    ) {
                      duplication = true
                    }

                    if (item.image && item.image.length > 150) {
                      const imagesResponse = await Cafe24UploadImages({
                        mallID: marketItem.cafe24.mallID,
                        images: [item.image],
                      })

                      if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                        item.image = imagesResponse.data.images[0].path
                      }
                      await sleep(1000)
                    }
                  }

                  if (duplication) {
                    options = options.map((item, index) => {
                      delete item.attributes
                      return {
                        ...item,
                        korKey: `${getAlphabet(index)}타입`,
                      }
                    })
                  }

                  let gifHtml = ``
                  if(detailItem.videoGif && detailItem.videoGif.length > 0 && detailItem.videoGif.includes("gif")){
                    gifHtml += `<p style="text-align: center;" >
                    <img src="${detailItem.videoGif}" style="max-width: 800px; display: block; margin: 0 auto; " />
                    </p>
                    `
                  }
                  // 옵션 HTML
                  let optionHtml = ``
                  if (detailItem.optionsImage && !duplication) {
                    for (const item of detailItem.optionsImage.filter((i, index) => index < 100)) {
                      optionHtml += `<p style="text-align: center;" >
                    <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                    ${item.korName}
                    </div>
                    <img src="${item.image}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                    <p style="text-align: center;" >
                    <br />
                    </p>
                    `
                    }
                  } else {
                    for (const item of options.filter((i, index) => index < 100)) {
                      item.attributes = null

                      if (item.active && item.image) {
                        optionHtml += `
                    <p style="text-align: center;" >
                    <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                    ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
                    </div>
                    <img src="${
                      item.image
                    }" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                    <p style="text-align: center;" >
                    <br />
                    </p>
                    `
                      }
                    }
                  }

                  let detailHtml = ``
                  if(detailItem && _html && _html.length > 0 ){
                    detailHtml = _html
                  } else {
                    if (detailItem && Array.isArray(detailItem.content)) {
                      for (const item of detailItem.content) {
                        detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
                      }
                    }
                  }
                  

                  // let addPrice = addPriceCalc(item.price)
                  let margin = 30
                  let maringArr = marginInfo.filter(
                    (fItem) => fItem.title > Number(detailItem.options[0].price)
                  )
                  if (maringArr.length > 0) {
                    margin = maringArr[0].price
                  } else {
                    margin = marginInfo[marginInfo.length - 1].price
                  }

                  let addPrice = addPriceCalc(detailItem.options[0].price, weightPrice, margin)
                
                  let sellerTags = _sellerTags
                  if(sellerTags.length === 0) {
                    sellerTags = await getRelatedKeyword(_title)
                    console.log("sellerTags : ", sellerTags)
                  }
                  
                  const product = {
                    addPrice,
                    weightPrice,
                    good_id: detailItem.good_id,
                    naverID: _productNo,
                    korTitle: _title.slice(0, 100),
                    mainImages: detailItem.mainImages,
                    price:
                      Math.ceil(
                        (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) *
                          1.3 *
                          0.1
                      ) * 10,
                    salePrice:
                      Math.ceil(
                        (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) *
                          0.1
                      ) * 10,
                    gifHtml,
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
                    naverCategoryCode: detailItem.naverCategoryCode,
                    keyword: sellerTags,
                  }

                  const coupang = {
                    displayCategoryCode: detailItem.categoryCode,
                    vendorId: detailItem.vendorId,
                    vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
                    deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode,
                    returnCenterCode: detailItem.returnCenter.returnCenterCode,
                    returnChargeName: detailItem.returnCenter.shippingPlaceName,
                    companyContactNumber:
                      detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
                    returnZipCode: detailItem.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
                    returnAddress: detailItem.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
                    returnAddressDetail:
                      detailItem.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
                    returnCharge: detailItem.returnCenter.returnCharge, // 반품배송비
                    afterServiceInformation: detailItem.afterServiceInformation, // A/S안내
                    afterServiceContactNumber: detailItem.afterServiceContactNumber, // A/S전화번호
                    outboundShippingPlaceCode: detailItem.shipping.outboundShippingPlaceCode, // 출고지주소코드

                    invoiceDocument: detailItem.invoiceDocument,

                    maximumBuyForPerson: detailItem.maximumBuyForPerson, // 인당 최대 구매수량
                    maximumBuyForPersonPeriod: detailItem.maximumBuyForPersonPeriod, // 최대 구매 수량 기간

                    notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map(
                      (item) => {
                        return {
                          noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                          noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                          content: item.content, // 내용
                        }
                      }
                    ),
                    attributes: detailItem.attributes.map((item) => {
                      return {
                        attributeTypeName: item.attributeTypeName, // 옵션타입명
                        attributeValueName: item.attributeValueName, // 옵션값
                      }
                    }),
                    certifications: detailItem.certifications.map((item) => {
                      return {
                        certificationType: item.certificationType,
                        dataType: item.dataType,
                        name: item.name,
                        required: item.required,
                      }
                    }),
                  }

                  const productItem = await Product.findOneAndUpdate(
                    {
                      userID: user ? user : null,
                      "basic.good_id": detailItem.good_id,
                    },
                    {
                      $set: {
                        isDelete: false,
                        writerID:
                          winnerItem && winnerItem.writerID
                            ? winnerItem.writerID
                            : user && user
                            ? req.user._id
                            : null,
                        basic: detailItem,
                        product,
                        prop: detailItem.prop ? detailItem.prop : [],
                        options: detailItem.options,
                        coupang,
                        initCreatedAt: moment().toDate(),
                        isNaver: true,
                      },
                    },
                    {
                      upsert: true,
                      new: true,
                    }
                  )

                  const cafe24Response = await updateCafe24({
                    id: productItem._id,
                    product,
                    prop: productItem.prop,
                    options,
                    cafe24: {
                      mallID: marketItem.cafe24.mallID,
                      shop_no: marketItem.cafe24.shop_no,
                    },
                    userID: user,
                    writerID: req.user._id,
                  })
                  console.log("cafe24Response", cafe24Response)

                  if (user.toString() === "5f1947bd682563be2d22f008" ||
                  user.toString() === "5f601bdf18d42d13d0d616d0"
                  ) {
                    await CoupangWinner.findOneAndUpdate(
                      {
                        _id: winnerItem._id,
                      },
                      {
                        $set: {
                          state: 2,
                          error: null,
                          lastUpdate: moment().toDate(),
                        },
                      }
                    )
                  } else {
                    const response = await updateCoupang({
                      id: productItem._id,
                      product,
                      options,
                      coupang,
                      userID: user,
                      writerID: user,
                    })

                    console.log("productItem._id", productItem._id)
                    console.log("response", response)
                    console.log("user", user)
                    // console.log("winnerItem._id", winnerItem._id)
                    if (response.coupang.code === null) {
                      await CoupangWinner.findOneAndUpdate(
                        {
                          _id: winnerItem._id,
                        },
                        {
                          $set: {
                            state: 2,
                            error: null,
                            lastUpdate: moment().toDate(),
                          },
                        }
                      )
                    } else {
                      await CoupangWinner.findOneAndUpdate(
                        {
                          _id: winnerItem._id,
                        },
                        {
                          $set: {
                            state: 3,
                            error: response.coupang.message,
                            lastUpdate: moment().toDate(),
                          },
                        }
                      )
                    }
                  }
                } else {
                  console.log("쿠팡 업로드 시작11", _coupangID)
                  const coupangItem = await CoupangItem.findOne({ _id: _coupangID })

                  await coupangDetailSingle({ url: coupangItem.detail })

                  await sleep(1000)

                  const marketItem = await Market.findOne({
                    userID: user,
                  })
                  // console.log("coupangItem", coupangItem)
                  // console.log("title", title)
                  // console.log("detailUrl", detailUrl)
                  // console.log("subPrice", subPrice)

                  const urlObject = url.parse(coupangItem.detail, true)
                  // const itemId = urlObject.query.itemId
                  const productId = urlObject.pathname.replace("/vp/products/", "")

                  const tempProduct = await Product.findOne({
                    userID: user,
                    "basic.naverID": productId,
                  })

                  if (!tempProduct) {
                    console.log("tempProduct 없음", user, productId)
                    // return false
                  }

                  const basicItem = await Basic.findOne({
                    userID: user,
                  })
                  console.log("타오바오 크롤링 시작2", _detailUrl)
                  const detailItem = await getTaobaoItem({ url: _detailUrl, userID: user })
                  if (!detailItem || detailItem.title.length === 0) {
                    return false
                  }
                  detailItem.url = _detailUrl
                  detailItem.naverID = productId
                  console.log("타오바오 크롤링 끝")
                  console.log("detailItem", detailItem)
                  // 옵션 HTML
                  let optionHtml = ``

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
                      coupangItem.options[0].price +
                      (coupangItem.options[0].shippingFee || 0) -
                      subPrice,
                    salePrice:
                      coupangItem.options[0].price +
                      (coupangItem.options[0].shippingFee || 0) -
                      subPrice,
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
                    naverCategoryCode: detailItem.naverCategoryCode,
                  }

                  const options = coupangItem.options
                    .filter((item) => item.image)
                    .filter((item) => {
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
                          attributeValueName: item.optionTitle1.slice(0, 30),
                        })
                      }
                      if (item.optionKey2 && item.optionTitle2) {
                        attributes.push({
                          attributeTypeName: item.optionKey2.slice(0, 30),
                          attributeValueName: item.optionTitle2.slice(0, 30),
                        })
                      }
                      return {
                        key: index,
                        // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                        korValue: item.title,
                        image: item.originImage ? item.originImage : item.image,
                        price: item.price + (item.shippingFee || 0) - _subPrice,
                        productPrice:
                          Math.ceil(
                            (item.price + (item.shippingFee || 0) - _subPrice) * 1.3 * 0.1
                          ) * 10,
                        salePrice: item.price + (item.shippingFee || 0) - _subPrice,
                        stock: 20,
                        disabled: false,
                        active: item.active,
                        base: index === 0,
                        attributes,
                      }
                    })

                  for (const item of options) {
                    if (item.image && item.image.length > 150) {
                      const imagesResponse = await Cafe24UploadImages({
                        mallID: marketItem.cafe24.mallID,
                        images: [item.image],
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
                    companyContactNumber:
                      detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
                    returnZipCode: detailItem.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
                    returnAddress: detailItem.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
                    returnAddressDetail:
                      detailItem.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
                    returnCharge: detailItem.returnCenter.returnCharge, // 반품배송비
                    afterServiceInformation: detailItem.afterServiceInformation, // A/S안내
                    afterServiceContactNumber: detailItem.afterServiceContactNumber, // A/S전화번호
                    outboundShippingPlaceCode: detailItem.shipping.outboundShippingPlaceCode, // 출고지주소코드

                    invoiceDocument: detailItem.invoiceDocument,

                    maximumBuyForPerson: detailItem.maximumBuyForPerson, // 인당 최대 구매수량
                    maximumBuyForPersonPeriod: detailItem.maximumBuyForPersonPeriod, // 최대 구매 수량 기간

                    notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map(
                      (item) => {
                        return {
                          noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                          noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                          content: item.content, // 내용
                        }
                      }
                    ),
                    attributes: detailItem.attributes.map((item) => {
                      return {
                        attributeTypeName: item.attributeTypeName, // 옵션타입명
                        attributeValueName: item.attributeValueName, // 옵션값
                      }
                    }),
                    certifications: detailItem.certifications.map((item) => {
                      return {
                        certificationType: item.certificationType,
                        dataType: item.dataType,
                        name: item.name,
                        required: item.required,
                      }
                    }),
                  }

                  const productItem = await Product.findOneAndUpdate(
                    {
                      userID: user,
                      "basic.good_id": detailItem.good_id,
                    },
                    {
                      $set: {
                        isDelete: false,
                        writerID: winnerItem.writerID ? winnerItem.writerID : user,
                        basic: detailItem,
                        product,
                        options: detailItem.options,
                        coupang,
                        initCreatedAt: moment().toDate(),
                        isWinner: true,
                      },
                    },
                    {
                      upsert: true,
                      new: true,
                    }
                  )

                  const response = await updateCoupang({
                    id: productItem._id,
                    product,
                    options,
                    coupang,
                    userID: user,
                    writerID: user,
                  })
                  console.log("productItem._id", productItem._id)
                  console.log("response", response)
                  console.log("winnerItem._id", winnerItem._id)
                  if (response.coupang.code === null) {
                    await CoupangWinner.findOneAndUpdate(
                      {
                        _id: winnerItem._id,
                      },
                      {
                        $set: {
                          state: 2,
                          error: null,
                          lastUpdate: moment().toDate(),
                        },
                      }
                    )
                  } else {
                    await CoupangWinner.findOneAndUpdate(
                      {
                        _id: winnerItem._id,
                      },
                      {
                        $set: {
                          state: 3,
                          error: response.coupang.message,
                          lastUpdate: moment().toDate(),
                        },
                      }
                    )
                  }
                }
              } catch (e) {
                console.log("error", e)
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: e.message,
                      lastUpdate: moment().toDate(),
                    },
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
            } catch (e) {
              logger.error(`UploadItemWinner: ${e}`)
              console.log(`UploadItemWinner: ${e}`)
              return false
            }
          }
        }, 1000)
        return true
      } catch (e) {
        console.log("eer", e)
        return false
      }
    },
    UploadItemWinnerList: async (
      parent,
      { input },
      { req, model: { CoupangWinner, CoupangItem, Product, Basic, Market }, logger }
    ) => {
      try {
        if (!req.user || !req.user.adminUser) {
          return false
        }
        for (const item of input) {
          let _title = item.title
          let _detailUrl = item.detailUrl
          let _subPrice = item.subPrice
          let _isClothes = item.isClothes
          let _isShoes = item.isShoes
          let _coupangID = null
          try {
            _coupangID = await coupangDetailSingle({ url: item.detail })
          } catch (e) {
            logger.error(`coupangDetailSingle: ${e}`)
          }

          try {
            let winnerItem = await CoupangWinner.findOneAndUpdate(
              {
                userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                CoupangID: _coupangID,
              },
              {
                $set: {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  writerID: req.user && req.user._id ? req.user._id : null,
                  CoupangID: _coupangID,
                  state: 1,
                  title: _title,
                  detailUrl: _detailUrl,
                  subPrice: _subPrice,
                  isClothes: _isClothes,
                  isShoes: _isShoes,
                  lastUpdate: moment().toDate(),
                },
                $setOnInsert: {
                  createdAt: moment().toDate(),
                },
              },
              { new: true, upsert: true }
            )

            item.coupangID = _coupangID
            item.winnerItem = winnerItem
          } catch (e) {
            logger.error(`winnerItem: ${e}`)
          }
        }

        setTimeout(async () => {
          for (const item of input) {
            // coupangURL
            let _title = item.title
            let _detailUrl = item.detailUrl
            let _subPrice = item.subPrice
            let _isClothes = item.isClothes
            let _isShoes = item.isShoes
            let winnerItem = item.winnerItem
            logger.error("item.winnerIitem", winnerItem)
            try {
              const coupangItem = await CoupangItem.findOne({ _id: item.coupangID })
              const marketItem = await Market.findOne({
                userID: req.user.adminUser,
              })

              const urlObject = url.parse(coupangItem.detail, true)
              // const itemId = urlObject.query.itemId
              const productId = urlObject.pathname.replace("/vp/products/", "")

              // const tempProduct = await Product.findOne({
              //   userID: req.user.adminUser,
              //   "basic.naverID": productId
              // })

              // if (tempProduct) {
              //   return false
              // }

              item.vendorName ? item.title.replace(item.vendorName, "").trim() : item.title
              const basicItem = await Basic.findOne({
                userID: req.user.adminUser,
              })
              console.log("타오바오 크롤링 시작3", _detailUrl)
              let detailItem = null
              try {
                detailItem = await getTaobaoItem({ url: _detailUrl, userID: req.user.adminUser })
              } catch (e) {
                logger.error(`getTaobaoItem: ${e}`)
              }

              if (!detailItem) {
                continue
              }
              if (detailItem.title.length === 0) {
                continue
              }
              detailItem.url = _detailUrl
              detailItem.naverID = productId

              logger.error("타오바오 크롤링 끝", detailItem)

              // 옵션 HTML
              let optionHtml = ``
              // for (const item of coupangItem.options.filter(item => {
              //   if (item.korTitle1 === "오류시 연락주세요") {
              //     return false
              //   }
              //   if (item.korTitle2 === "오류시 연락주세요") {
              //     return false
              //   }
              //   if (item.title === "오류시 연락주세요") {
              //     return false
              //   }
              //   if( item.title.includes("오류")){
              //     return false
              //   }
              //   return true
              // })) {
              //   if (item.active && item.image) {
              //     optionHtml += `
              // <p style="text-align: center;" >
              // <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
              // ${item.title ? item.title : coupangItem.title}
              // </div>
              // <img src="${item.image.replace(
              //   /492/gi,
              //   "800"
              // )}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
              // <p style="text-align: center;" >
              // <br />
              // </p>
              // `
              //   }
              // }

              let detailHtml = ``
              if (detailItem && Array.isArray(detailItem.content)) {
                for (const item of detailItem.content) {
                  detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
                }
              }

              const product = {
                good_id: detailItem.good_id,
                naverID: productId,
                korTitle: _title.slice(0, 100),
                mainImages: coupangItem.mainImages,
                price:
                  coupangItem.options[0].price +
                  (coupangItem.options[0].shippingFee || 0) -
                  item.subPrice,
                salePrice:
                  coupangItem.options[0].price +
                  (coupangItem.options[0].shippingFee || 0) -
                  item.subPrice,
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
                naverCategoryCode: detailItem.naverCategoryCode,
              }

              const options = coupangItem.options
                .filter((item) => item.image)
                .filter((item) => {
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
                      attributeValueName: item.optionTitle1.slice(0, 30),
                    })
                  }
                  if (item.optionKey2 && item.optionTitle2) {
                    attributes.push({
                      attributeTypeName: item.optionKey2.slice(0, 30),
                      attributeValueName: item.optionTitle2.slice(0, 30),
                    })
                  }
                  return {
                    key: index,
                    // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                    korValue: item.title,
                    image: item.originImage ? item.originImage : item.image,
                    price: item.price + (item.shippingFee || 0) - _subPrice,
                    productPrice:
                      Math.ceil((item.price + (item.shippingFee || 0) - _subPrice) * 1.3 * 0.1) *
                      10,
                    salePrice: item.price + (item.shippingFee || 0) - _subPrice,
                    stock: 20,
                    disabled: false,
                    active: item.active,
                    base: index === 0,
                    attributes,
                  }
                })

              for (const item of options) {
                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: marketItem.cafe24.mallID,
                    images: [item.image],
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
                companyContactNumber:
                  detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
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

                notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detailItem.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detailItem.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  "basic.good_id": detailItem.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID: req.user && req.user._id ? req.user._id : null,
                    basic: detailItem,
                    product,
                    options: detailItem.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isWinner: true,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )

              const response = await updateCoupang({
                id: productItem._id,
                product,
                options,
                coupang,
                userID: req.user.adminUser,
                writerID: req.user.adminUser,
              })

              console.log("productItem._id", productItem._id)
              console.log("response", response)
              // console.log("winnerItem._id", winnerItem._id)
              if (response.coupang.code === null) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 2,
                      error: null,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              } else {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: response.coupang.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            } catch (e) {
              console.log("error", e)
              logger.error(`UploadItemWinnerListFOR2: ${e}`)

              if (winnerItem && winnerItem._id) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: e.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            }
          }
        }, 1000)

        return true
      } catch (e) {
        logger.error(`UploadItemWinnerList: ${e}`)
        return false
      }
    },
    UploadItemNaverList: async (
      parent,
      { input },
      { req, model: { CoupangWinner, ShippingPrice, Product, Basic, Market, ExchangeRate }, logger }
    ) => {
      try {
        /// 네이버쇼핑으로 업로드
        if (!req.user || !req.user.adminUser) {
          return false
        }
        let isNaver = true
        for (const item of input) {
          let _title = item.title
          let _detailUrl = item.detailUrl
          let _shippingWeight = item.shippingWeight
          let _isClothes = item.isClothes
          let _isShoes = item.isShoes
          let _productNo = item.productNo
          let _html = item.html
          let _detailImages = item.detailImages
          let _sellerTags = item.sellerTags

          isNaver = item.isNaver
          try {
            let winnerItem = await CoupangWinner.findOneAndUpdate(
              {
                userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                productNo: _productNo,
                title: _title,
              },
              {
                $set: {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  writerID: req.user && req.user._id ? req.user._id : null,
                  productNo: _productNo,
                  state: 1,
                  title: _title,
                  detailUrl: _detailUrl,
                  html: _html,
                  detailImages: _detailImages,
                  shippingWeight: _shippingWeight,
                  isClothes: _isClothes,
                  isShoes: _isShoes,
                  sellerTags: _sellerTags,
                  lastUpdate: moment().toDate(),
                },
                $setOnInsert: {
                  createdAt: moment().toDate(),
                },
              },
              { new: true, upsert: true }
            )

            item.winnerItem = winnerItem
          } catch (e) {
            logger.error(`winnerItem: ${e}`)
          }
        }

        setTimeout(async () => {
          // 환율
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

          const marginInfo = await ShippingPrice.aggregate([
            {
              $match: {
                userID: req.user.adminUser,
                type: 1,
              },
            },
            {
              $sort: {
                title: 1,
              },
            },
          ])

          const shippingWeightInfo = await ShippingPrice.aggregate([
            {
              $match: {
                userID: req.user.adminUser,
                type: 2,
              },
            },
            {
              $sort: {
                title: 1,
              },
            },
          ])

          const exchange = Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 175) + 5
          // const margin = marginInfo && Number(marginInfo.title) ? marginInfo.title : 30

          const addPriceCalc = (wian, weightPrice, margin) => {
            const addPrice = -(
              ((exchange * margin + 11 * exchange) * Number(wian) +
                weightPrice * margin +
                11 * weightPrice) /
              (margin - 89)
            )
            return addPrice
          }

          for (const item of input) {
            let weightPrice = 0
            let shippingArr = shippingWeightInfo.filter(
              (fItem) => fItem.title >= item.shippingWeight
            )

            if (shippingArr.length > 0) {
              weightPrice = shippingArr[0].price
            } else {
              weightPrice = shippingWeightInfo[shippingWeightInfo.length - 1].price
            }

            let _title = item.title
            let _detailUrl = item.detailUrl

            let _isClothes = item.isClothes
            let _isShoes = item.isShoes
            let winnerItem = item.winnerItem
            let _productNo = item.productNo
            let _html = item.html
            let _detailImages = item.detailImages
           
            // logger.error("item.winnerIitem",winnerItem)
            try {
              const marketItem = await Market.findOne({
                userID: req.user.adminUser,
              })

              const basicItem = await Basic.findOne({
                userID: req.user.adminUser,
              })

              console.log("타오바오 크롤링 시작4", _detailUrl)
              let detailItem = null
              try {
                detailItem = await getTaobaoItemAPI({
                  url: _detailUrl,
                  userID: req.user.adminUser,
                  orginalTitle: _title,
                  detailImages: _detailImages
                })
              } catch (e) {
                logger.error(`getTaobaoItem: ${e}`)
              }
            
              // console.log("detailItem.prop", detailItem.prop)

              if (!detailItem) {
                console.log("타오바오 크롤링 실패 1")
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 1",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                continue
              }
              // if(detailItem.title.length === 0){
              //   console.log("타오바오 크롤링 실패 2")
              //   await CoupangWinner.findOneAndUpdate(
              //     {
              //       _id: winnerItem._id
              //     },
              //     {
              //       $set: {
              //         state: 3,
              //         error: "타오바오 크롤링 실패 2",
              //         lastUpdate: moment().toDate()
              //       }
              //     }
              //   )
              //   continue
              // }

              if (detailItem.options.length === 0) {
                console.log("타오바오 옵션 실패")
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 3",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                continue
              }

              detailItem.url = _detailUrl
              detailItem.naverID = _productNo

              console.log("타오바오 크롤링 끝")

              let options = detailItem.options
                .filter((item) => item.image)
                .map((item, index) => {
                  let margin = 30
                  let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(item.price))

                  if (marginArr.length > 0) {
                    margin = marginArr[0].price
                  } else {
                    margin = marginInfo[marginInfo.length - 1].price
                  }

                  let addPrice = addPriceCalc(item.price, weightPrice, margin)

                  return {
                    margin,
                    weightPrice,
                    addPrice,
                    propPath: item.propPath,
                    key: item.key ? item.key : index,
                    // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                    korValue: item.korValue,
                    image: item.originImage ? item.originImage : item.image,
                    price: item.price,
                    productPrice:
                      Math.ceil(
                        (Number(item.price) * exchange + addPrice + weightPrice) * 1.3 * 0.1
                      ) * 10,
                    salePrice:
                      Math.ceil((Number(item.price) * exchange + addPrice + weightPrice) * 0.1) *
                      10,
                    stock: item.stock,
                    disabled: item.disabled,
                    active: item.active,
                    base: index === 0,
                    attributes: item.taobaoAttributes
                      ? item.taobaoAttributes.map((att) => {
                          return {
                            attributeTypeName: att.attributeTypeName,
                            attributeValueName: att.attributeValueName,
                          }
                        })
                      : item.attributes,
                  }
                })

              let duplication = false
              let optionValueArray = []
              for (const item of options) {
                if (optionValueArray.includes(item.korValue)) {
                  duplication = true
                }
                optionValueArray.push(item.korValue)

                if (item.korValue.length > 25) {
                  duplication = true
                }

                if (
                  item.attributes.filter((attrItem) => attrItem.attributeValueName.length > 30)
                    .length > 0
                ) {
                  duplication = true
                }

                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: marketItem.cafe24.mallID,
                    images: [item.image],
                  })

                  if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                    item.image = imagesResponse.data.images[0].path
                  }
                  await sleep(1000)
                }
              }

              if (duplication) {
                options = options.map((item, index) => {
                  delete item.attributes
                  return {
                    ...item,
                    korKey: `${getAlphabet(index)}타입`,
                  }
                })
              }

              let gifHtml = ``
              if(detailItem.videoGif && detailItem.videoGif.length > 0 && detailItem.videoGif.includes("gif")){
                gifHtml += `<p style="text-align: center;" >
                <img src="${detailItem.videoGif}" style="max-width: 800px; display: block; margin: 0 auto; " />
                </p>
                `
              }
              // 옵션 HTML
              let optionHtml = ``
              if (detailItem.optionsImage && !duplication) {
                for (const item of detailItem.optionsImage.filter((i, index) => index < 100)) {
                  optionHtml += `
                <p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: black; background: #0090FF; padding: 10px; border-radius: 15px;">
                ${item.korName}
                </div>
                <img src="${item.image}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                }
              } else {
                for (const item of options.filter((i, index) => index < 100)) {
                  item.attributes = null
                  if (item.active && item.image) {
                    optionHtml += `
                <p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
                ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
                </div>
                <img src="${
                  item.image
                }" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                  }
                }
              }

              let detailHtml = ``

              if(detailItem && _html && _html.length > 0){
                detailHtml = _html
              } else {
                if (detailItem && Array.isArray(detailItem.content)) {
                  for (const item of detailItem.content) {
                    detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
                  }
                }
              }
              

              let margin = 30
              let maringArr = marginInfo.filter(
                (fItem) => fItem.title > Number(detailItem.options[0].price)
              )
              if (maringArr.length > 0) {
                margin = maringArr[0].price
              } else {
                margin = marginInfo[marginInfo.length - 1].price
              }

              let addPrice = addPriceCalc(detailItem.options[0].price, weightPrice, margin)

              let sellerTags = item.sellerTags.length > 0 ? item.sellerTags : []
              if(sellerTags.length === 0){
                sellerTags = await getRelatedKeyword(_title)
                console.log("sellerTags : ", sellerTags)
              }

              const product = {
                addPrice,
                weightPrice,
                good_id: detailItem.good_id,
                naverID: _productNo,
                korTitle: _title,
                mainImages: detailItem.mainImages,
                price:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) *
                      1.3 *
                      0.1
                  ) * 10,
                salePrice:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) * 0.1
                  ) * 10,
                gifHtml,
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
                naverCategoryCode: detailItem.naverCategoryCode,
                keyword: sellerTags,
              }

              const coupang = {
                displayCategoryCode: detailItem.categoryCode,
                vendorId: detailItem.vendorId,
                vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
                deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode,
                returnCenterCode: detailItem.returnCenter.returnCenterCode,
                returnChargeName: detailItem.returnCenter.shippingPlaceName,
                companyContactNumber:
                  detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
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

                notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detailItem.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detailItem.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  "basic.good_id": detailItem.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID: req.user && req.user._id ? req.user._id : null,
                    basic: detailItem,
                    product,
                    prop: detailItem.prop ? detailItem.prop : [],
                    options: detailItem.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isNaver: isNaver,
                    isCoupang: !isNaver,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )
              // console.log("detailItem.options", detailItem.options)
              // console.log("options", options)

              const cafe24Response = await updateCafe24({
                id: productItem._id,
                product,
                prop: productItem.prop,
                options,
                cafe24: {
                  mallID: marketItem.cafe24.mallID,
                  shop_no: marketItem.cafe24.shop_no,
                },
                userID: req.user.adminUser,
                writerID: req.user._id,
              })
              console.log("cafe24Response", cafe24Response)

              // console.log("winnerItem._id", winnerItem._id)
              if (req.user.adminUser.toString() === "5f1947bd682563be2d22f008" || req.user.adminUser.toString() === "5f601bdf18d42d13d0d616d0") {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 2,
                      error: null,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              } else {
                const response = await updateCoupang({
                  id: productItem._id,
                  product,
                  options,
                  coupang,
                  userID: req.user.adminUser,
                  writerID: req.user.adminUser,
                })

                console.log("productItem._id", productItem._id)
                console.log("response", response)

                if (response.coupang.code === null) {
                  await CoupangWinner.findOneAndUpdate(
                    {
                      _id: winnerItem._id,
                    },
                    {
                      $set: {
                        state: 2,
                        error: null,
                        lastUpdate: moment().toDate(),
                      },
                    }
                  )
                } else {
                  await CoupangWinner.findOneAndUpdate(
                    {
                      _id: winnerItem._id,
                    },
                    {
                      $set: {
                        state: 3,
                        error: response.coupang.message,
                        lastUpdate: moment().toDate(),
                      },
                    }
                  )
                }
              }
            } catch (e) {
              console.log("error", e)
              logger.error(`UploadItemWinnerListFOR2: ${e}`)

              if (winnerItem && winnerItem._id) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: e.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            }
          }
        }, 1000)

        return true
      } catch (e) {
        logger.error(`UploadItemWinnerList: ${e}`)
        return false
      }
    },
    UploadItemCoupangList: async (
      parent,
      { input },
      { req, model: { ShippingPrice, Product, Basic, Market, ExchangeRate, CoupangWinner }, logger }
    ) => {
      try {
        if (!req.user || !req.user.adminUser) {
          return false
        }
        for (const item of input) {
          let _title = item.title
          let _detailUrl = item.detailUrl
          let _shippingWeight = item.shippingWeight
          let _isClothes = item.isClothes
          let _isShoes = item.isShoes
          let _productNo = item.productNo

          try {
            let winnerItem = await CoupangWinner.findOneAndUpdate(
              {
                userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                productNo: _productNo,
                title: _title,
              },
              {
                $set: {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  writerID: req.user && req.user._id ? req.user._id : null,
                  productNo: _productNo,
                  state: 1,
                  title: _title,
                  detailUrl: _detailUrl,
                  shippingWeight: _shippingWeight,
                  isClothes: _isClothes,
                  isShoes: _isShoes,
                  lastUpdate: moment().toDate(),
                },
                $setOnInsert: {
                  createdAt: moment().toDate(),
                },
              },
              { new: true, upsert: true }
            )

            item.winnerItem = winnerItem
          } catch (e) {
            logger.error(`winnerItem: ${e}`)
          }
        }

        setTimeout(async () => {
          // 환율
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

          const marginInfo = await ShippingPrice.aggregate([
            {
              $match: {
                userID: req.user.adminUser,
                type: 1,
              },
            },
            {
              $sort: {
                title: 1,
              },
            },
          ])

          const shippingWeightInfo = await ShippingPrice.aggregate([
            {
              $match: {
                userID: req.user.adminUser,
                type: 2,
              },
            },
            {
              $sort: {
                title: 1,
              },
            },
          ])

          const exchange = Number(excahgeRate[0].CNY_송금보내실때.replace(/,/gi, "") || 175) + 5
          // const margin = marginInfo && Number(marginInfo.title) ? marginInfo.title : 30

          const addPriceCalc = (wian, weightPrice, margin) => {
            const addPrice = -(
              ((exchange * margin + 13 * exchange) * Number(wian) +
                weightPrice * margin +
                13 * weightPrice) /
              (margin - 87)
            )
            return addPrice
          }

          for (const item of input) {
            let weightPrice = 0
            let shippingArr = shippingWeightInfo.filter(
              (fItem) => fItem.title >= item.shippingWeight
            )

            if (shippingArr.length > 0) {
              weightPrice = shippingArr[0].price
            } else {
              weightPrice = shippingWeightInfo[shippingWeightInfo.length - 1].price
            }

            let _title = item.title
            let _detailUrl = item.detailUrl

            let _isClothes = item.isClothes
            let _isShoes = item.isShoes
            let winnerItem = item.winnerItem
            let _productNo = item.productNo
            // logger.error("item.winnerIitem",winnerItem)
            try {
              const marketItem = await Market.findOne({
                userID: req.user.adminUser,
              })

              const basicItem = await Basic.findOne({
                userID: req.user.adminUser,
              })

              console.log("타오바오 크롤링 시작5", _detailUrl)
              let detailItem = null
              try {
                detailItem = await getTaobaoItemAPI({
                  url: _detailUrl,
                  userID: req.user.adminUser,
                  orginalTitle: _title,
                })
              } catch (e) {
                logger.error(`getTaobaoItem: ${e}`)
              }

              if (!detailItem) {
                console.log("타오바오 크롤링 실패 1")
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 1",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                continue
              }
              // if(detailItem.title.length === 0){
              //   console.log("타오바오 크롤링 실패 2")
              //   await CoupangWinner.findOneAndUpdate(
              //     {
              //       _id: winnerItem._id
              //     },
              //     {
              //       $set: {
              //         state: 3,
              //         error: "타오바오 크롤링 실패 2",
              //         lastUpdate: moment().toDate()
              //       }
              //     }
              //   )
              //   continue
              // }

              if (detailItem.options.length === 0) {
                console.log("타오바오 옵션 실패")
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: "타오바오 크롤링 실패 3",
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
                continue
              }

              detailItem.url = _detailUrl
              detailItem.naverID = _productNo

              console.log("타오바오 크롤링 끝")

              let options = detailItem.options
                .filter((item) => item.image)
                .map((item, index) => {
                  let margin = 30
                  let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(item.price))

                  if (marginArr.length > 0) {
                    margin = marginArr[0].price
                  } else {
                    margin = marginInfo[marginInfo.length - 1].price
                  }

                  let addPrice = addPriceCalc(item.price, weightPrice, margin)

                  return {
                    margin,
                    weightPrice,
                    addPrice,
                    propPath: item.propPath,
                    key: item.key ? item.key : index,
                    // korValue: item.title ? item.title.slice(0, 30) : coupangItem.title.slice(0, 30),
                    korValue: item.korValue,
                    image: item.originImage ? item.originImage : item.image,
                    price: item.price,
                    productPrice:
                      Math.ceil(
                        (Number(item.price) * exchange + addPrice + weightPrice) * 1.3 * 0.1
                      ) * 10,
                    salePrice:
                      Math.ceil((Number(item.price) * exchange + addPrice + weightPrice) * 0.1) *
                      10,
                    stock: item.stock,
                    disabled: item.disabled,
                    active: item.active,
                    base: index === 0,
                    attributes: item.taobaoAttributes
                      ? item.taobaoAttributes.map((att) => {
                          return {
                            attributeTypeName: att.attributeTypeName,
                            attributeValueName: att.attributeValueName,
                          }
                        })
                      : item.attributes,
                  }
                })

              let duplication = false
              let optionValueArray = []
              for (const item of options) {
                if (optionValueArray.includes(item.korValue)) {
                  duplication = true
                }
                optionValueArray.push(item.korValue)

                if (item.korValue.length > 25) {
                  duplication = true
                }

                if (
                  item.attributes.filter((attrItem) => attrItem.attributeValueName.length > 30)
                    .length > 0
                ) {
                  duplication = true
                }

                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: marketItem.cafe24.mallID,
                    images: [item.image],
                  })

                  if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                    item.image = imagesResponse.data.images[0].path
                  }
                  await sleep(1000)
                }
              }

              if (duplication) {
                options = options.map((item, index) => {
                  delete item.attributes
                  return {
                    ...item,
                    korKey: `${getAlphabet(index)}타입`,
                  }
                })
              }

              // 옵션 HTML
              let optionHtml = ``
              if (detailItem.optionsImage && !duplication) {
                for (const item of detailItem.optionsImage.filter((i, index) => index < 100)) {
                  optionHtml += `<p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                ${item.korName}
                </div>
                <img src="${item.image}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                }
              } else {
                for (const item of options.filter((i, index) => index < 100)) {
                  item.attributes = null

                  if (item.active && item.image) {
                    optionHtml += `
                <p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
                ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
                </div>
                <img src="${
                  item.image
                }" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                <p style="text-align: center;" >
                <br />
                </p>
                `
                  }
                }
              }

              let detailHtml = ``

              if (detailItem && Array.isArray(detailItem.content)) {
                for (const item of detailItem.content) {
                  detailHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
                }
              }

              let margin = 30
              let maringArr = marginInfo.filter(
                (fItem) => fItem.title > Number(detailItem.options[0].price)
              )
              if (maringArr.length > 0) {
                margin = maringArr[0].price
              } else {
                margin = marginInfo[marginInfo.length - 1].price
              }

              let addPrice = addPriceCalc(detailItem.options[0].price, weightPrice, margin)

              const product = {
                addPrice,
                weightPrice,
                good_id: detailItem.good_id,
                naverID: _productNo,
                korTitle: _title,
                mainImages: detailItem.mainImages,
                price:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) *
                      1.3 *
                      0.1
                  ) * 10,
                salePrice:
                  Math.ceil(
                    (Number(detailItem.options[0].price) * exchange + addPrice + weightPrice) * 0.1
                  ) * 10,
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
                naverCategoryCode: detailItem.naverCategoryCode,
                keyword: item.sellerTags.length > 0 ? item.sellerTags : _title.split(" "),
              }

              const coupang = {
                displayCategoryCode: detailItem.categoryCode,
                vendorId: detailItem.vendorId,
                vendorUserId: detailItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
                deliveryCompanyCode: detailItem.shipping.deliveryCompanyCode,
                returnCenterCode: detailItem.returnCenter.returnCenterCode,
                returnChargeName: detailItem.returnCenter.shippingPlaceName,
                companyContactNumber:
                  detailItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
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

                notices: detailItem.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detailItem.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detailItem.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detailItem.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: req.user && req.user.adminUser ? req.user.adminUser : null,
                  "basic.good_id": detailItem.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID: req.user && req.user._id ? req.user._id : null,
                    basic: detailItem,
                    product,
                    prop: detailItem.prop ? detailItem.prop : [],
                    options: detailItem.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isCoupang: true,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )

              const response = await updateCoupang({
                id: productItem._id,
                product,
                options,
                coupang,
                userID: req.user.adminUser,
                writerID: req.user.adminUser,
              })

              console.log("productItem._id", productItem._id)
              console.log("response", response)
              // console.log("winnerItem._id", winnerItem._id)
              if (response.coupang.code === null) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 2,
                      error: null,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              } else {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: response.coupang.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            } catch (e) {
              console.log("error", e)
              logger.error(`UploadItemWinnerListFOR2: ${e}`)

              if (winnerItem && winnerItem._id) {
                await CoupangWinner.findOneAndUpdate(
                  {
                    _id: winnerItem._id,
                  },
                  {
                    $set: {
                      state: 3,
                      error: e.message,
                      lastUpdate: moment().toDate(),
                    },
                  }
                )
              }
            }
          }
        }, 1000)

        return true
      } catch (e) {
        logger.error(`UploadItemCoupangList: ${e}`)
        return false
      }
    },
    GetNaverStoreItemList: async (
      paretn,
      { url },
      { req, model: { Product, NaverItem, Brand }, logger }
    ) => {
      let naverItemList = []

      try {
        naverItemList = await getNaverShopping({ url })

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "62bd48f391d7fb85bcc54693"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008", "62bd48f391d7fb85bcc54693"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }
        // console.log("naverItemList", naverItemList.length)

        const promiseArray = naverItemList.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              let titleArr = item && item.name ? item.name.split(" ") : []
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
              if (titleArr && titleArr.length > 0) {
                item.titleArray = titleArr
              }

              item.isRegister = false
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)

        const productIDs = naverItemList.map((item) => {
          return `${item.productNo}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        naverItemList.forEach((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
            item.isRegister = true
          }
        })
      } catch (e) {
        logger.error(`GetNaverStoreItemList: ${e.message}`)
        console.log("GetNaverStoreItemList", e)
      } finally {
        return naverItemList
      }
    },
    GetNaverKeywordItemList: async (
      paretn,
      { keyword },
      { req, model: { Product, NaverItem, Brand }, logger }
    ) => {
      let naverItemList = []

      try {
        naverItemList = await NaverKeywordInfo({ keyword })

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8" ||
          req.user.adminUser.toString() === "62bd48f391d7fb85bcc54693"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "625f9ca226d0840a73e2dbb8",
                  "62bd48f391d7fb85bcc54693",
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }
        // console.log("naverItemList", naverItemList.length)

        const promiseArray = naverItemList.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              let titleArr = item && item.name ? item.name.split(" ") : []
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
              if (titleArr && titleArr.length > 0) {
                item.titleArray = titleArr
              }

              item.isRegister = false
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)

        const productIDs = naverItemList.map((item) => {
          return `${item.productNo}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        naverItemList.forEach((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
            item.isRegister = true
          }
        })
      } catch (e) {
        logger.error(`GetNaverKeywordItemList: ${e.message}`)
        console.log("GetNaverKeywordItemList", e)
      } finally {
        return naverItemList
      }
    },
    GetCoupangStoreItemListNew: async (
      paretn,
      { url },
      { req, model: { Product, NaverItem, Brand }, logger }
    ) => {
      let naverItemList = []

      try {
        const vendorId = url.split("vendors/")[1].split("/products")[0]
        const response = await CoupangStoreProductList({ vendorId, sortType: "BEST_SELLING" })
        if (response && response.code === "200") {
          response.data.products
            .filter((item) => item.adult === false && item.soldOut === false)
            .forEach((item) => {
              if (
                naverItemList.filter((fItem) => fItem.productId === item.productId).length === 0
              ) {
                naverItemList.push(item)
              }
            })
        }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "625f9ca226d0840a73e2dbb8",
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }
        // console.log("naverItemList", naverItemList.length)

        const promiseArray = naverItemList.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              let titleArr = item && item.title ? item.title.split(" ") : []
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
              if (titleArr && titleArr.length > 0) {
                item.titleArray = titleArr
              }

              item.isRegister = false
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)

        const productIDs = naverItemList.map((item) => {
          return `${item.productId}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        naverItemList = naverItemList.map((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productId.toString())
              .length > 0
          ) {
            item.isRegister = true
          }

          return {
            type: "coupang",
            productNo: item.productId,
            displayName: "",
            detailUrl: item.link,
            name: item.title.split(",")[0],
            image: `https://image6.coupangcdn.com/image/${item.imageUrl}`,
            titleArray: item.titleArray,
            isRegister: item.isRegister,
            sellerTags: [],
            reviewCount: item.reviewRatingCount,
            zzim: 0,
            purchaseCnt: 0,
            recentSaleCount: 0,
          }
        })
      } catch (e) {
        logger.error(`GetNaverStoreItemList: ${e.message}`)
        console.log("GetNaverStoreItemList", e)
      } finally {
        return naverItemList
      }
    },
    GetNaverRecommendItemList: async (
      parent,
      {
        limit = 10,
        category,
        regDay,
        minRecent,
        maxRecent,
        totalMinSale,
        totalMaxSale,
        minReview,
        maxReview,
        minPrice,
        maxPrice,
      },
      { req, model: { NaverMall, Product, Brand, NaverFavoriteItem }, logger }
    ) => {
      let naverItemList = []
      try {
        const match = {}

        if (category && category.length > 0) {
          match.category1 = {
            $in: category.split(","),
          }
        }

        if (regDay !== 300) {
          const recentDate = moment().add(-regDay, "days").format("YYYY-MM-DD")
          match.regDate = {
            $gte: recentDate,
          }
        }
        if (minRecent === 0 && maxRecent === 50) {
        } else if (minRecent === 0 && maxRecent < 50) {
          match.recentSaleCount = {
            $lte: maxRecent,
          }
        } else if (minRecent > 0 && maxRecent === 50) {
          match.recentSaleCount = {
            $gte: minRecent,
          }
        } else {
          match.recentSaleCount = {
            $gte: minRecent,
            $lte: maxRecent,
          }
        }

        if (totalMinSale === 0 && totalMaxSale === 100) {
        } else if (totalMinSale === 0 && totalMaxSale < 100) {
          match.purchaseCnt = {
            $lte: totalMaxSale,
          }
        } else if (totalMinSale > 0 && totalMaxSale === 100) {
          match.purchaseCnt = {
            $gte: totalMinSale,
          }
        } else {
          match.recentSaleCount = {
            $gte: totalMinSale,
            $lte: totalMaxSale,
          }
        }

        if (minReview === 0 && maxReview === 1000) {
        } else if (minReview === 0 && maxReview < 1000) {
          match.reviewCount = {
            $lte: maxReview,
          }
        } else if (minReview > 0 && maxReview === 1000) {
          match.reviewCount = {
            $gte: minReview,
          }
        } else {
          match.recentSaleCount = {
            $gte: minReview,
            $lte: maxReview,
          }
        }

        if (minPrice === 0 && maxPrice === 2000000) {
        } else if (minPrice === 0 && maxPrice < 2000000) {
          match.salePrice = {
            $lte: maxPrice,
          }
        } else if (minPrice > 0 && maxPrice === 2000000) {
          match.salePrice = {
            $gte: minPrice,
          }
        } else {
          match.recentSaleCount = {
            $gte: minPrice,
            $lte: maxPrice,
          }
        }

        const tempList = await NaverFavoriteItem.aggregate([
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 50000,
          },
          {
            $match: {
              ...match,
            },
          },
          {
            $sample: { size: limit },
          },
        ])

        const productIDs = tempList.map((item) => {
          return `${item.productNo}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        tempList.forEach((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
            item.isRegister = true
          } else {
            naverItemList.push(item)
          }
        })
        // const count = await NaverMall.countDocuments()

        // while(naverItemList.length < limit) {
        //   // const skip = Math.floor(Math.random() * count)
        //   // console.log("skip", skip)
        //   const tempList = []
        //   const naverMalls = await NaverMall.aggregate(
        //     [
        //       {
        //         $match: {
        //           seachLabel: 1
        //         }
        //       },
        //       { $sample: { size: limit } }
        //       // {
        //       //   $skip: skip
        //       // },
        //       // {
        //       //   $limit: limit
        //       // }
        //       // { $sample: { size: limit * 500 } },
        //       // { $sample: { size: limit * 100 } },
        //       // { $sample: { size: limit * 50 } },
        //       // { $sample: { size: limit * 10 } },
        //       // { $sample: { size: limit * 2} },
        //     ]
        //   )

        //   const recommendPromiseArray = naverMalls.map(item => {
        //     return new Promise(async (resolve, reject) => {
        //       try {

        //         const response = await getNaverRecommendShopping({url: item.mallPcUrl, category, regDay, minRecent, maxRecent, totalMinSale, totalMaxSale, minReview, maxReview, minPrice, maxPrice})
        //         if(Array.isArray(response) && response.length > 0) {

        //           for(const naverItem of response) {
        //             if(tempList.filter(fItem => fItem.productNo === naverItem.productNo).length === 0){
        //               tempList.push(naverItem)
        //             }
        //           }
        //           // naverItemList.push(...response)
        //         }

        //         resolve()
        //       }catch(e){
        //         reject(e)
        //       }
        //     })
        //   })

        //   await Promise.all(recommendPromiseArray)

        //   const productIDs = tempList.map(item => {
        //     return `${item.productNo}`
        //   })

        //   const products = await Product.aggregate([
        //     {
        //       $match: {
        //         userID: req.user.adminUser,
        //         "basic.naverID": {
        //           $in: productIDs
        //         }
        //       }
        //     },
        //     {
        //       $project: {
        //         "basic.naverID": 1
        //       }
        //     }
        //   ])

        //   tempList.forEach(item => {

        //     if(products.filter(fItem => fItem.basic.naverID.toString() === item.productNo.toString()).length > 0){
        //       item.isRegister = true
        //     } else {
        //       naverItemList.push(item)
        //     }
        //   })

        // }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        const promiseArray = naverItemList.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              let titleArr = item && item.name ? item.name.split(" ") : []
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
              if (titleArr && titleArr.length > 0) {
                item.titleArray = titleArr
              }

              item.isRegister = false
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)

        // const productIDs = naverItemList.map(item => {
        //   return `${item.productNo}`
        // })

        // const products = await Product.aggregate([
        //   {
        //     $match: {
        //       userID: req.user.adminUser,
        //       "basic.naverID": {
        //         $in: productIDs
        //       }
        //     }
        //   },
        //   {
        //     $project: {
        //       "basic.naverID": 1
        //     }
        //   }
        // ])

        // naverItemList.forEach(item => {

        //   if(products.filter(fItem => fItem.basic.naverID.toString() === item.productNo.toString()).length > 0){
        //     item.isRegister = true
        //   }
        // })
      } catch (e) {
        logger.error(`GetNaverRecommendItemList: ${e.message}`)
        console.log("GetNaverRecommendItemList", e)
      } finally {
        return naverItemList.sort((a, b) => {
          // return b.recentSaleCount - a.recentSaleCount
          return Math.random() - Math.random()
        })
      }
    },
    NaverRecommendItemList: async (
      parent,
      {},
      { req, model: { NaverMall, NaverFavoriteItem, Product, Brand }, logger }
    ) => {
      let naverItemList = []
      try {
        const naverMalls = await NaverMall.aggregate([
          {
            $match: {
              seachLabel: 1,
              productCount: { $gt: 0 },
            },
          },
        ])

        setTimeout(async () => {
          let i = 0
          for (const item of naverMalls) {
            console.log("mallName", `${++i} / ${naverMalls.length}`, item.mallName)
            const response = await getNaverRecommendShopping({
              url: item.mallPcUrl,
              category: "",
              regDay: 300,
              minRecent: 0,
              maxRecent: 50,
              totalMinSale: 0,
              totalMaxSale: 100,
              minReview: 0,
              maxReview: 1000,
              minPrice: 0,
              maxPrice: 2000000,
            })

            if (Array.isArray(response) && response.length > 0) {
              for (const naverItem of response) {
                try {
                  console.log("naverItem.name,", naverItem.name)
                  await NaverFavoriteItem.findOneAndUpdate(
                    {
                      // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                      productNo: naverItem.productNo,
                    },
                    {
                      $set: {
                        // userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
                        productNo: naverItem.productNo,
                        displayName: naverItem.displayName,
                        detailUrl: naverItem.detailUrl,
                        name: naverItem.name,
                        categoryId: naverItem.categoryId,
                        category1: naverItem.category1,
                        category2: naverItem.category2,
                        category3: naverItem.category3,
                        category4: naverItem.category4,
                        salePrice: Number(naverItem.salePrice) ? Number(naverItem.salePrice) : 0,
                        regDate: naverItem.regDate,
                        image: naverItem.image,
                        sellerTags: naverItem.sellerTags,
                        reviewCount: naverItem.reviewCount,
                        zzim: naverItem.zzim,
                        purchaseCnt: naverItem.purchaseCnt,
                        recentSaleCount: naverItem.recentSaleCount,
                        zzim: naverItem.zzim,
                        createdAt: moment().toDate(),
                      },
                    },
                    {
                      upsert: true,
                      new: true,
                    }
                  )
                } catch (e) {
                  console.log("error", e)
                }
              }
              // naverItemList.push(...response)
            }
          }
        }, 2000)
        return true
      } catch (e) {
        logger.error(`GetNaverRecommendItemList: ${e.message}`)
        console.log("GetNaverRecommendItemList", e)
      } finally {
        return naverItemList.sort((a, b) => {
          // return b.recentSaleCount - a.recentSaleCount
          return Math.random() - Math.random()
        })
      }
    },
    GetNaverSavedItemList: async (
      parent,
      {
        limit = 10,
        category,
        regDay,
        minRecent,
        maxRecent,
        totalMinSale,
        totalMaxSale,
        minReview,
        maxReview,
        minPrice,
        maxPrice,
      },
      { req, model: { NaverFavoriteItem, Product, Brand }, logger }
    ) => {
      let naverItemList = []
      const adminUser = "5f0d5ff36fc75ec20d54c40b"
      try {
        const match = {}

        if (category && category.length > 0) {
          match.category1 = {
            $in: category.split(","),
          }
        }

        if (regDay !== 300) {
          const recentDate = moment().add(-regDay, "days").format("YYYY-MM-DD")
          match.regDate = {
            $gte: recentDate,
          }
        }
        if (minRecent === 0 && maxRecent === 50) {
        } else if (minRecent === 0 && maxRecent < 50) {
          match.recentSaleCount = {
            $lte: maxRecent,
          }
        } else if (minRecent > 0 && maxRecent === 50) {
          match.recentSaleCount = {
            $gte: minRecent,
          }
        } else {
          match.recentSaleCount = {
            $gte: minRecent,
            $lte: maxRecent,
          }
        }

        if (totalMinSale === 0 && totalMaxSale === 100) {
        } else if (totalMinSale === 0 && totalMaxSale < 100) {
          match.purchaseCnt = {
            $lte: totalMaxSale,
          }
        } else if (totalMinSale > 0 && totalMaxSale === 100) {
          match.purchaseCnt = {
            $gte: totalMinSale,
          }
        } else {
          match.recentSaleCount = {
            $gte: totalMinSale,
            $lte: totalMaxSale,
          }
        }

        if (minReview === 0 && maxReview === 1000) {
        } else if (minReview === 0 && maxReview < 1000) {
          match.reviewCount = {
            $lte: maxReview,
          }
        } else if (minReview > 0 && maxReview === 1000) {
          match.reviewCount = {
            $gte: minReview,
          }
        } else {
          match.recentSaleCount = {
            $gte: minReview,
            $lte: maxReview,
          }
        }

        if (minPrice === 0 && maxPrice === 2000000) {
        } else if (minPrice === 0 && maxPrice < 2000000) {
          match.salePrice = {
            $lte: maxPrice,
          }
        } else if (minPrice > 0 && maxPrice === 2000000) {
          match.salePrice = {
            $gte: minPrice,
          }
        } else {
          match.recentSaleCount = {
            $gte: minPrice,
            $lte: maxPrice,
          }
        }

        const product = await NaverFavoriteItem.aggregate([
          {
            $match: {
              isRegisted: { $ne: true },
              isExcepted: { $ne: true },
              ...match,
            },
          },

          // {
          //   $match: {
          //     ...match
          //   }
          // },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1000,
          },
        ])

        const productIDs = product.map((item) => {
          return `${item.productNo}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: adminUser,
            },
            { banWord: 1 }
          )
        }

        const promises = product.map((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
            item.isRegister = true
          } else {
            let titleArr = item && item.name ? item.name.split(" ") : []
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

            if (titleArr && titleArr.length > 0) {
              item.titleArray = titleArr
            }

            item.isRegister = false

            naverItemList.push(item)
          }
        })

        await Promise.all(promises)

       
        return product
      } catch (e) {
        logger.error(`GetNaverSavedItemList: ${e.message}`)
        return []
      } finally {
        return naverItemList
      }
    },
    GetNaverFavoriteRecommendItemList: async (
      parent,
      {},
      { req, model: { NaverMall, NaverMallFavorite, Product, Brand }, logger }
    ) => {
      let naverItemList = []
      try {
        const favorite = await NaverMallFavorite.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
            },
          },
        ])

        const naverMalls = await NaverMall.aggregate([
          {
            $match: {
              _id: {
                $in: favorite.map((item) => item.mallID),
              },
            },
          },
          { $sample: { size: 10 } },
        ])

        const recommendPromiseArray = naverMalls.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              const response = await getNaverRecommendShopping({ url: item.mallPcUrl })
              if (Array.isArray(response) && response.length > 0) {
                naverItemList.push(...response)
              }
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })

        await Promise.all(recommendPromiseArray)
        // for(const item of naverMalls){
        //   const response = await getNaverRecommendShopping({url: item.mallPcUrl})

        //   if(Array.isArray(response) && response.length > 0) {
        //     naverItemList.push(...response)
        //   }
        // }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        const promiseArray = naverItemList.map((item) => {
          return new Promise(async (resolve, reject) => {
            try {
              let titleArr = item && item.name ? item.name.split(" ") : []
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
              if (titleArr && titleArr.length > 0) {
                item.titleArray = titleArr
              }

              item.isRegister = false
              resolve()
            } catch (e) {
              reject(e)
            }
          })
        })
        await Promise.all(promiseArray)

        const productIDs = naverItemList.map((item) => {
          return `${item.productNo}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        naverItemList.forEach((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
            item.isRegister = true
          }
        })
      } catch (e) {
        logger.error(`GetNaverRecommendItemList: ${e.message}`)
        console.log("GetNaverRecommendItemList", e)
      } finally {
        return naverItemList
      }
    },
    GetCoupangStoreItemList: async (
      parent,
      { url },
      { req, model: { Product, CoupangItem, Brand }, logger }
    ) => {
      const coupangItemList = []
      try {
        const itemList = []
        const vendorId = url.split("vendors/")[1].split("/products")[0]
        // const response1 = await CoupangStoreProductList({vendorId, sortType: "ACCURACY"})
        let response1 = []

        const response2 = await CoupangStoreProductList({ vendorId, sortType: "BEST_SELLING" })

        if (response2 && response2.code === "200") {
          response2.data.products
            .filter((item) => item.adult === false && item.soldOut === false)
            .forEach((item) => {
              if (itemList.filter((fItem) => fItem.productId === item.productId).length === 0) {
                itemList.push(item)
              }
            })
        }

        if (req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b") {
          response1 = await CoupangStoreProductList({ vendorId, sortType: "ACCURACY" })
          if (response1 && response1.code === "200") {
            response1.data.products
              .filter((item) => item.adult === false && item.soldOut === false)
              .forEach((item) => {
                if (itemList.filter((fItem) => fItem.productId === item.productId).length === 0) {
                  itemList.push(item)
                }
              })
          }
        }

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "625f9ca226d0840a73e2dbb8",
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        const promiseArray = itemList.map(async (item) => {
          return new Promise(async (resolve, reject) => {
            try {
              const response = await coupangDetail({ url: item.link })
              coupangItemList.push(response)
              resolve()
            } catch (e) {
              console.log("promiseArray", e)
              reject(e)
            }
          })
        })

        await Promise.all(promiseArray)

        const sortList = []

        coupangItemList.forEach((item) => {
          let titleArr = item && item.title ? item.title.split(" ") : []
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
          if (titleArr && titleArr.length > 0) {
            item.titleArray = titleArr
          }

          item.isRegister = false
        })

        const productIDs = coupangItemList.map((item) => {
          return `${item.productId}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        // 재정렬
        itemList.forEach((item) => {
          coupangItemList.forEach((fItem) => {
            if (item.productId === fItem.productId) {
              if (
                products.filter(
                  (item) => item.basic.naverID.toString() === fItem.productId.toString()
                ).length > 0
              ) {
                fItem.isRegister = true
              }
              sortList.push(fItem)
            }
          })
        })

        return {
          count: response2.data.itemTotalCount,
          list: sortList,
        }
      } catch (e) {
        logger.error(`GetCoupangStoreItemList: ${e.message}`)
        console.log("GetCoupangStoreItemList", e)
        return {
          count: 0,
          list: coupangItemList,
        }
      }
    },
    GetCoupangKeywordItemList: async (
      parent,
      { keyword },
      { req, model: { Product, Brand }, logger }
    ) => {
      const coupangItemList = []
      try {
        const productList = await searchCoupangKeword({ keyword })

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        const promiseArray = productList.map(async (item) => {
          // console.log("item.linkk",item)
          const response = await coupangDetail({ url: item.link })
          coupangItemList.push(response)
        })

        await Promise.all(promiseArray)

        const sortList = []

        coupangItemList.forEach((item) => {
          let titleArr = item && item.title ? item.title.split(" ") : []
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
          if (titleArr && titleArr.length > 0) {
            item.titleArray = titleArr
          }

          item.isRegister = false
        })

        const productIDs = coupangItemList.map((item) => {
          return `${item.productId}`
        })

        const products = await Product.aggregate([
          {
            $match: {
              "basic.naverID": {
                $in: productIDs,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])

        // 재정렬
        productList.forEach((item, index) => {
          if (index > 30) return
          coupangItemList.forEach((fItem) => {
            if (item.link === fItem.detail) {
              if (
                products.filter(
                  (item) => item.basic.naverID.toString() === fItem.productId.toString()
                ).length > 0
              ) {
                fItem.isRegister = true
              }
              sortList.push(fItem)
            }
          })
        })

        return {
          count: 0,
          list: sortList,
        }
      } catch (e) {
        logger.error(`GetCoupangKeywordItemList: ${e.message}`)

        return {
          count: 0,
          list: coupangItemList,
        }
      }
    },
    DeleteProcessItem: async (
      parent,
      { _id, userID },
      { req, model: { CoupangWinner }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : ObjectId(req.user.adminUser)
      try {
        await CoupangWinner.deleteOne({
          userID: user,
          _id,
        })
        return true
      } catch (e) {
        logger.error(`DeleteProcessItem: ${e.message}`)
        return false
      }
    },
    DuplicateProductList: async (parent, {}, { req, model: { Market, Product }, logger }) => {
      try {
        const market = await Market.findOne({
          userID: req.user.adminUser,
        })
        let mallID = market.cafe24.mallID

        let process = true
        let offset = 0
        let productList = []
        await (async () => {
          while (process) {
            try {
              const response = await Cafe24ListAllProducts({ mallID, offset })
              // console.log("Response length", response.data.products[0].product_name)
              productList.push(
                ...response.data.products.map((item) => {
                  return {
                    product_no: item.product_no,
                    product_name: item.product_name,
                  }
                })
              )
              offset += 100
              await sleep(500)
              console.log("offset", offset)
            } catch (e) {
              console.log("ddd", e)
              process = false
            }
          }
        })()
        for (const item of productList) {
          const duplication = productList.filter(
            (fItem) => fItem.product_name === item.product_name
          )
          if (duplication.length > 1) {
            for (const duplcateItem of duplication) {
              try {
                const item = await Product.findOne({
                  userID: req.user.adminUser,
                  "product.cafe24.product_no": duplcateItem.product_no,
                  isDelete: false,
                })

                if (!item) {
                  console.log("duplcateItem", duplcateItem)
                  const cafe24Response = await Cafe24DeleteProduct({
                    mallID,
                    product_no: duplcateItem.product_no,
                  })
                  if (cafe24Response) {
                    const temp = await Product.findOne({
                      "product.cafe24.product_no": duplcateItem.product_no,
                      userID: req.user.adminUser,
                    })

                    let isDelete = false
                    if (temp && !temp.product.coupang.productID) {
                      console.log("tempTitle", temp.product.korTitle)
                      isDelete = true
                    }
                    await Product.findOneAndUpdate(
                      {
                        "product.cafe24.product_no": duplcateItem.product_no,
                        userID: req.user.adminUser,
                      },
                      {
                        $set: {
                          "product.cafe24.product_no": null,
                          isDelete,
                        },
                      }
                    )
                  }
                }

                await sleep(500)
              } catch (e) {
                console.log("중복 아이템 삭제", e)
              }
            }
          }
        }

        console.log("productList", productList.length)
        // console.log("Response", response.data.products)
        return true
      } catch (e) {
        logger.error(`DuplicateProductList: ${e}`)
        console.log("DuplicateProductList", e)
        return false
      }
    },
    NaverShoppingUpload: async (parent, {}, { req, model: { Market, Product }, logger }) => {
      try {
        const market = await Market.findOne({
          userID: req.user.adminUser,
        })

        let mallID = market.cafe24.mallID
        let shop_no = market.cafe24.shop_no

        let process = true
        let offset = 0
        let productList = []
        await (async () => {
          while (process) {
            try {
              const response = await Cafe24ListAllProducts({ mallID, offset })
              // console.log("Response length", response.data.products[0].product_name)
              productList.push(
                ...response.data.products.map((item) => {
                  return {
                    product_no: item.product_no,
                    product_name: item.product_name,
                  }
                })
              )
              offset += 100
              await sleep(500)
              console.log("offset", offset)
            } catch (e) {
              console.log("ddd", e)
              process = false
            }
          }
        })()

        console.log("productList", productList.length)
        const products = await Product.aggregate([
          {
            $match: {
              userID: req.user.adminUser,
              isDelete: false,
              $or: [
                {
                  isNaver: true,
                },
                {
                  isSoEasy: true,
                },
              ],

              $or: [
                {
                  "product.cafe24.product_no": { $exists: false },
                },
                {
                  "product.cafe24.product_no": null,
                },
              ],
              "product.coupang.status": "승인완료",
            },
          },
          {
            $sort: {
              _id: -1,
            },
          },
        ])
        console.log("products", products.length)

        setTimeout(async () => {
          for (const item of products) {
            console.log("item.korTitle", item.product.korTitle)

            const tempFilter = productList.filter((fItem) => {
              if (fItem.product_name === item.product.korTitle) {
                return true
              }
              return false
            })
            if (tempFilter.length > 0) {
              const shop_no = tempFilter[0].shop_no
              const product_no = tempFilter[0].product_no
              const product_code = tempFilter[0].product_code

              if (!item.product.cafe24) {
                item.product.cafe24 = {}
              }
              item.product.cafe24.mallID = mallID
              item.product.cafe24.shop_no = shop_no
              item.product.cafe24.product_no = product_no
              item.product.cafe24.product_code = product_code

              await Product.findOneAndUpdate(
                {
                  _id: item._id,
                },
                {
                  $set: {
                    "product.cafe24": item.product.cafe24,
                  },
                }
              )
              console.log("product_no", product_no)
            } else {
              if (!item.product.mainImages) {
                item.product.mainImages = [item.options[0].image]
              }
              const cafe24Response = await updateCafe24({
                id: item._id,
                product: item.product,
                prop: item.prop,
                options: item.options,
                cafe24: {
                  mallID,
                  shop_no,
                },
                userID: req.user.adminUser,
                writerID: req.user._id,
              })
              // console.log("cafe24Response", cafe24Response)
              await sleep(500)
            }
          }

          // for(const item of productList){
          //   // console.log("item->", item)
          //   try {
          //     const product = await Product.findOne(
          //       {
          //         userID: req.user.adminUser,
          //         isDelete: false,
          //         "product.cafe24.product_no": item.product_no
          //       }
          //     )
          //     if(product) {
          //       product.product.cafe24_product_no = item.product_no
          //       await updateCafe24({
          //         id: product._id,
          //         product: product.product,
          //         options: product.options,
          //         cafe24: {
          //           mallID,
          //           shop_no
          //         },
          //         userID: req.user.adminUser,
          //         writerID: req.user._id
          //       })
          //       await sleep(500)
          //     }

          //   } catch(e){
          //     console.log("tempupdate", e)
          //   }

          // }
        }, 3000)
        return true
      } catch (e) {
        logger.error(`NaverShoppingUpload: ${e}`)
        console.log("NaverShoppingUpload", e)
        return false
      }
    },
    Cafe24Sync: async (parent, {}, { req, model: { Market, Product }, logger }) => {
      try {
        const market = await Market.findOne({
          userID: req.user.adminUser,
        })

        let mallID = market.cafe24.mallID
        let shop_no = market.cafe24.shop_no

        let process = true
        let offset = 0
        let productList = []
        await (async () => {
          while (process) {
            try {
              const response = await Cafe24ListAllProducts({ mallID, offset })
              // console.log("Response length", response.data.products[0].product_name)
              productList.push(
                ...response.data.products.map((item) => {
                  return {
                    product_no: item.product_no,
                    product_name: item.product_name,
                  }
                })
              )
              offset += 100
              await sleep(500)
              console.log("offset", offset)
              // process = false
            } catch (e) {
              console.log("ddd", e)
              process = false
            }
          }
        })()

        console.log("productList", productList.length)

        setTimeout(async () => {
          const product = productList[0]
          //  console.log("product", product)
          //  product.product_no = 12572
          //  product.product_name = "티슈리각형 catl eve리튬 인산철 자동차 시동배터리 블박보조배터리필요무관"
          // 12187
          for (const product of productList) {
            try {
              let item = await Product.findOne({
                userID: req.user.adminUser,
                "product.cafe24.product_no": product.product_no,
                isDelete: false,
              })

              if (!item) {
                item = await Product.findOne({
                  userID: req.user.adminUser,
                  "product.korTitle": product.product_name,
                  isDelete: false,
                })
              }

              if (!item) {
                const temp = await Product.aggregate([
                  {
                    $match: {
                      userID: req.user.adminUser,
                      "product.korTitle": { $regex: `.*${product.product_name}.*` },
                      isDelete: false,
                    },
                  },
                  {
                    $sort: {
                      _id: -1,
                    },
                  },
                ])

                if (temp && temp.length > 0) {
                  item = temp[0]
                }
                // item = await Product.findOne({
                //   userID: req.user.adminUser,
                //   "product.korTitle": product.product_name,
                //   isDelete: false
                // })

                if (item) {
                  if (!item.product.cafe24) {
                    item.product.cafe24 = {}
                  }
                  item.product.cafe24.product_no = product.product_no
                }
              }

              if (item) {
                console.log("product.product_no", product)
                item.product.cafe24_product_no = product.product_no
                // console.log("item.options", item.options)

                const cafe24Response = await updateCafe24({
                  id: item._id,
                  product: item.product,
                  prop: item.prop,
                  options: item.options,
                  cafe24: {
                    mallID,
                    shop_no,
                  },
                  userID: req.user.adminUser,
                  writerID: req.user._id,
                })
                // console.log("cafe24Response", cafe24Response)
              } else {
                console.log("없음", product.product_no)
                // await Cafe24DeleteProduct({
                //   mallID: mallID,
                //   product_no: product.product_no
                // })
              }

              await sleep(500)
            } catch (e) {
              console.log("eeee", e)
            }
          }

          console.log("끝---->")
        }, 3000)
        return true
      } catch (e) {
        logger.error(`Cafe24Sync: ${e}`)
        console.log("Cafe24Sync", e)
        return false
      }
    },
    DeleteBatch: async (parent, {}, { req, model: { Product }, logger }) => {
      try {
        const batchProduct = await Product.aggregate([
          {
            $match: {
              isBatch: true,
              isDelete: false,
            },
          },
        ])
        console.log("batchProduct", batchProduct.length)

        for (const productItem of batchProduct) {
          if (
            !productItem.product ||
            !productItem.product.coupang ||
            !productItem.product.coupang.productID
          ) {
            continue
          }

          if (productItem.options) {
            for (const item of productItem.options) {
              if (item.coupang && item.coupang.vendorItemId) {
                await CoupnagSTOP_PRODUCT_SALES_BY_ITEM({
                  userID: "5f0d5ff36fc75ec20d54c40b",
                  vendorItemId: item.coupang.vendorItemId,
                })
              }
            }

            await sleep(1000)
          }

          const coupnagResponse = await CouapngDeleteProduct({
            userID: "5f0d5ff36fc75ec20d54c40b",
            productID: productItem.product.coupang.productID,
          })

          const cafe24Response = await Cafe24DeleteProduct({
            mallID: productItem.product.cafe24.mallID,
            product_no: productItem.product.cafe24.product_no,
          })

          await Product.findOneAndUpdate(
            {
              "product.cafe24.product_no": productItem.product.cafe24.product_no,
              "product.coupang.productID": productItem.product.coupang.productID,
            },
            {
              $set: {
                isDelete: true,
              },
            }
          )
          console.log(productItem.product.korTitle, "삭제")

          // const couapngResult =
          // productItem.product.coupang.toString() === coupnagResponse && coupnagResponse.data && coupnagResponse.data.toString()
          // console.log("couapngResult", couapngResult)
          // const cafe24Result =
          //   `${productItem.product.cafe24.product_no}` === cafe24Response &&
          //   cafe24Response.data &&
          //   cafe24Response.data.product.product_no.toString()
          //   console.log("cafe24Result", cafe24Result)
          //   if(couapngResult && cafe24Result) {

          //   } else {
          //     console.log( productItem.product.korTitle, "삭제 실패")
          //   }
        }
        return true
      } catch (e) {
        logger.error(`DeleteBatch: ${e}`)
        console.log("DeleteBatch", e)
        return false
      }
    },
    ModifyWeightPrice: async (
      parent,
      { id, weight, userID },
      { req, model: { Product, ShippingPrice }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : req.user.adminUser
      try {
        let shippingPrice

        const product = await Product.findOne({
          userID: user,
          _id: ObjectId(id),
        })
        if (product.basic.url.includes("amazon")) {
          shippingPrice = await ShippingPrice.findOne({
            userID: user,
            type: 9,
            title: weight,
          })
        } else if (product.basic.url.includes("iherb")) {
          shippingPrice = await ShippingPrice.findOne({
            userID: user,
            type: 5,
            title: weight,
          })
        } else if (product.basic.url.includes("aliexpress")) {
          shippingPrice = await ShippingPrice.findOne({
            userID: user,
            type: 7,
            title: weight,
          })
        } else {
          shippingPrice = await ShippingPrice.findOne({
            userID: user,
            type: 2,
            title: weight,
          })
        }
        product.weightPrice = shippingPrice.price
        console.log("product.weightPrice ", product.weightPrice )
        const productResponse = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID: user,
          productID: product.product.coupang.productID,
        })

        for (const item of product.options) {
          if(productResponse && productResponse.data && productResponse.data.items){
            const filterArr = productResponse.data.items.filter(
              (fItem) => fItem.itemName === item.korValue || fItem.itemName === item.korKey
            )
  
            if (filterArr.length > 0) {
              const tempWeightPrice = item.weightPrice
  
              const response = await CoupnagUPDATE_PRODUCT_PRICE_BY_ITEM({
                userID: user,
                vendorItemId: filterArr[0].vendorItemId,
                price: item.salePrice + (shippingPrice.price - tempWeightPrice),
              })
  
               if (response && response.code === "SUCCESS") {
                product.product.weightPrice = shippingPrice.price
                item.weightPrice = shippingPrice.price
                item.salePrice = item.salePrice + (shippingPrice.price - tempWeightPrice)
                item.productPrice = item.productPrice + (shippingPrice.price - tempWeightPrice)
               }
            }
          }
          
          if( user.toString() === "5f1947bd682563be2d22f008" || user.toString() === "5f601bdf18d42d13d0d616d0"){
            product.product.weightPrice = shippingPrice.price
            item.salePrice = item.salePrice + (shippingPrice.price - item.weightPrice)
            item.productPrice = item.productPrice + (shippingPrice.price - item.weightPrice)
            item.weightPrice = shippingPrice.price
          }
          

        }

        await Product.findOneAndUpdate(
          {
            userID: user,
            _id: ObjectId(id),
          },
          {
            $set: {
              product: product.product,
              options: product.options,
            },
          }
        )

        if (
          product.product.cafe24 &&
          product.product.cafe24.mallID &&
          product.product.cafe24.shop_no
        ) {
          product.product.cafe24_product_no = product.product.cafe24.product_no

          const cafe24Response = await updateCafe24({
            id: product._id,
            product: product.product,
            options: product.options,
            cafe24: {
              mallID: product.product.cafe24.mallID,
              shop_no: product.product.cafe24.shop_no,
            },
            userID: user,
            writerID: user,
          })
          console.log("cafe24Response", cafe24Response)
        }

        return product.product.korTitle
      } catch (e) {
        logger.error(`ModifyWeightPrice: ${e}`)
        return null
      }
    },
    ModifyOptions: async (parent, { id, props, options }, { req, model: { Product }, logger }) => {
      try {
        // console.log("id", id)
        // console.log("props", props)
        // console.log("options", options)

        const product = await Product.findOne({
          userID: ObjectId(req.user.adminUser),
          _id: ObjectId(id),
        })
        const productResponse = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
          userID: user,
          productID: product.product.coupang.productID,
        })

        for (const item of options) {
        }
        return true
      } catch (e) {
        logger.error(`ModifyOptions: ${e}`)
        return false
      }
    },
    ModifyProductTitle: async (
      parent,
      { id, title, userID },
      { req, model: { Product }, logger }
    ) => {
      
      const user = userID ? ObjectId(userID) : req.user.adminUser
      try {
        console.log("id, title", id, title, user)
        const product = await Product.findOne({
          userID: user,
          _id: ObjectId(id),
        })
        if (product) {
          let isSingle =
            product.basic.url.includes("iherb.com") && product.options.length === 1 ? true : false
          console.log("있어", product.product.korTitle)
          const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
            userID: user,
            productID: product.product.coupang.productID,
          })
          console.log("respose", response)
          if (response && response.code === "SUCCESS") {
            response.data.sellerProductName = title
            // console.log("response", response.data)
            const updateProduct = await CoupnagUPDATE_PRODUCT({
              userID: user,
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
            console.log("updateProduct", updateProduct)
            await CoupangAPPROVE_PRODUCT({
              userID: user,
              sellerProductId: response.data.sellerProductId,
            })

            if (updateProduct && updateProduct.code === "SUCCESS") {
              await Product.findOneAndUpdate(
                {
                  userID: user,
                  _id: ObjectId(id),
                },
                {
                  $set: {
                    "product.korTitle": response.data.sellerProductName,
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
            product.product.korTitle = title
            const cafe24Response = await updateCafe24({
              id: product._id,
              isSingle,
              product: product.product,
              options: product.options,
              cafe24: {
                mallID: product.product.cafe24.mallID,
                shop_no: product.product.cafe24.shop_no,
              },
              userID: user,
              writerID: user,
            })
            // console.log("cafe24Response", cafe24Response)
          }

          return title
        }

        return null
      } catch (e) {
        logger.error(`ModifyProductTitle: ${e}`)
        return null
      }
    },
    ModifyProductMainImages: async (
      parent,
      { id, mainImages, userID },
      { req, model: { Product }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : req.user.adminUser
      try {
        console.log("id, mainImages", id, mainImages, user)
        const product = await Product.findOne({
          userID: user,
          _id: ObjectId(id),
        })
        if (product) {
          // 카페 24
          if (
            product.product.cafe24 &&
            product.product.cafe24.mallID &&
            product.product.cafe24.shop_no
          ) {
            product.product.cafe24_product_no = product.product.cafe24.product_no
            product.product.mainImages = mainImages
            const cafe24Response = await updateCafe24({
              id: product._id,
              product: product.product,
              options: product.options,
              cafe24: {
                mallID: product.product.cafe24.mallID,
                shop_no: product.product.cafe24.shop_no,
              },
              userID: user,
              writerID: user,
            })
            console.log("cafe24Response", cafe24Response)
          }
        }

        return true
        // return title
      } catch (e) {
        logger.error(`ModifyProductMainImages: ${e}`)
        return false
      }
    },
    ModifyProductHtml: async (
      parent,
      { id, html, userID },
      { req, model: { Product }, logger }
    ) => {
      const user = userID ? ObjectId(userID) : req.user.adminUser
      try {
        const product = await Product.findOne({
          userID: user,
          _id: ObjectId(id),
        })

        if (product) {
          let isSingle =
            product.basic.url.includes("iherb.com") && product.options.length === 1 ? true : false
          console.log("있어", product.product.korTitle)

          const htmlContent = `${product.product.gifHtml ? product.product.gifHtml : ""}${product.product.topHtml}${
            product.product.isClothes && product.product.clothesHtml
              ? product.product.clothesHtml
              : ""
          }${
            product.product.isShoes && product.product.shoesHtml ? product.product.shoesHtml : ""
          }${product.product.optionHtml}${html}${product.product.bottomHtml}`

          const response = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
            userID: user,
            productID: product.product.coupang.productID,
          })
          // console.log("respose", response)

          if (response && response.code === "SUCCESS") {
            for (const item of response.data.items) {
              for (const content of item.contents) {
                content.contentDetails[0].content = htmlContent
                console.log("content.contentDetails[0].content", content.contentDetails[0].content)
              }
            }

            // console.log("response", response.data)
            const updateProduct = await CoupnagUPDATE_PRODUCT({
              userID: user,
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
            console.log("updateProduct", updateProduct)

            const approveResponse = await CoupangAPPROVE_PRODUCT({
              userID: user,
              sellerProductId: response.data.sellerProductId,
            })
            console.log("approveResponse", approveResponse)
            if (updateProduct && updateProduct.code === "SUCCESS") {
              await Product.findOneAndUpdate(
                {
                  userID: user,
                  _id: ObjectId(id),
                },
                {
                  $set: {
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
              userID: user,
              writerID: user,
            })
            // console.log("cafe24Response", cafe24Response)
          }
        }

        return true
      } catch (e) {
        logger.error(`ModifyProductHtml: ${e}`)
        return false
      }
    },
    CoupangApprove: async (parent, { sellerProductId }, { req, model: { Product }, logger }) => {
      try {
        const response = await CoupangAPPROVE_PRODUCT({
          userID: req.user.adminUser,
          sellerProductId,
        })

        if (response && response.code === "SUCCESS") {
          const product = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
            userID: req.user.adminUser,
            productID: sellerProductId,
          })
          if (product && product.data && product.data.status) {
            await Product.findOneAndUpdate(
              {
                userID: req.user.adminUser,
                "product.coupang.productID": sellerProductId,
              },
              {
                $set: {
                  "product.coupang.status": product.data.statusName,
                },
              }
            )
          }
          return true
        } else {
          return flase
        }
      } catch (e) {
        logger.error(`CoupangArrpove: ${e}`)
        return false
      }
    },
    CoupangApproves: async (parent, { sellerProductId }, { req, model: { Product }, logger }) => {
      try {
        for (const item of sellerProductId) {
          const response = await CoupangAPPROVE_PRODUCT({
            userID: req.user.adminUser,
            sellerProductId: item,
          })

          if (response.code === "SUCCESS") {
            const product = await CoupnagGET_PRODUCT_BY_PRODUCT_ID({
              userID: req.user.adminUser,
              productID: item,
            })
            if (product && product.data && product.data.status) {
              await Product.findOneAndUpdate(
                {
                  userID: req.user.adminUser,
                  "product.coupang.productID": item,
                },
                {
                  $set: {
                    "product.coupang.status": product.data.statusName,
                  },
                }
              )
            }
          }
        }

        return true
      } catch (e) {
        logger.error(`CoupangArrpoves: ${e}`)
        return false
      }
    },
    UploadNaverPlusItem: async (
      parent,
      { input },
      { req, model: { Market, Basic, Product, TempProduct, AmazonCollection }, logger }
    ) => {
      try {
        setTimeout(async () => {
          const userID = req.user.adminUser
          const market = await Market.findOne({
            userID: req.user.adminUser,
          })

          let mallID = market.cafe24.mallID
          let shop_no = market.cafe24.shop_no

          const ObjItem = {}
          const promiseArr = [
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
                  cafe24_shop_no,
                } = await getShippingInfo({ Market, userID })
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
                  bottomImage,
                  clothImage,
                  shoesImage,
                } = await getBasicItem({ Basic, userID })
                ObjItem.afterServiceInformation = afterServiceInformation
                ObjItem.afterServiceContactNumber = afterServiceContactNumber
                ObjItem.topImage = topImage
                ObjItem.bottomImage = bottomImage
                ObjItem.clothImage = clothImage
                ObjItem.shoesImage = shoesImage
                resolve()
              } catch (e) {
                reject()
              }
            }),
          ]

          await Promise.all(promiseArr)
          // console.log("ObjItem", ObjItem)
          for (const detail of input) {
           

            
            try {

              let isUSA = false
              let isSingle = false
              let isShippingPrirce = false
              if (detail.detailUrl && (
                detail.detailUrl.includes("amazon.com") ||
                detail.detailUrl.includes("amazon.co.jp"))
              ) {
                isUSA = true
                isShippingPrirce = true
              }
              if (detail.detailUrl && (detail.detailUrl.includes("iherb.com"))) {
                isUSA = true
                isSingle = true
              }
              if (detail.detailUrl && (detail.detailUrl.includes("aliexpress.com"))) {
                isUSA = true
              }
            
              detail.url = detail.detailUrl
              detail.naverID = detail.productNo
              detail.good_id = isUSA ? AmazonAsin(detail.detailUrl) : getGoodid(detail.detailUrl)
            
              const {
                categoryCode,
                attributes,
                noticeCategories,
                requiredDocumentNames,
                certifications,
              } = await getCategoryInfo({ userID, korTitle: detail.title })
            
              detail.categoryCode = categoryCode
              detail.attributes = attributes
              detail.noticeCategories = noticeCategories
              detail.requiredDocumentNames = requiredDocumentNames
              detail.certifications = certifications

              if (!detail.brand) {
                detail.brand = "기타"
              }
              if (!detail.manufacture) {
                detail.manufacture = "기타"
              }

              let duplication = false
              let optionValueArray = []

              for (const item of detail.options.filter((item) => item.active && !item.disabled)) {
                if (optionValueArray.includes(item.korValue)) {
                  duplication = true
                }

                optionValueArray.push(item.korValue)

                if (item.korValue.length > 25) {
                  duplication = true
                }

                if (
                  item.attributes.filter((attrItem) => attrItem.attributeValueName.length > 30)
                    .length > 0
                ) {
                  duplication = true
                }

                if (item.image && item.image.length > 150) {
                  const imagesResponse = await Cafe24UploadImages({
                    mallID: market.cafe24.mallID,
                    images: [item.image],
                  })

                  if (imagesResponse && imagesResponse.data && imagesResponse.data.images) {
                    item.image = imagesResponse.data.images[0].path
                  }
                  await sleep(1000)
                }
              }

              if (duplication) {
                detail.options = detail.options.map((item, index) => {
                  delete item.attributes
                  return {
                    ...item,
                    korKey: `${getAlphabet(index)}타입`,
                  }
                })
              }

              let optionHtml = ``
              if (detail.prop && !duplication) {
                for (const item of detail.prop) {
                  for (const value of item.values.filter((i, index) => index < 100)) {
                    if (value.image) {
                      optionHtml += `<p style="text-align: center;" >
                    <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
                    ${value.korValueName}
                    </div>
                    <img src="${value.image}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
                    <p style="text-align: center;" >
                    <br />
                    </p>
                    `
                    }
                  }
                }
              } else {
                for (const item of detail.options.filter((i, index) => index < 100)) {
                  item.attributes = null
                  if (item.active && item.image) {
                    optionHtml += `
              <p style="text-align: center;" >
              <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
              ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
              </div>
              <img src="${
                item.image
              }" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
              <p style="text-align: center;" >
              <br />
              </p>
              `
                  }
                }
              }
            
              const product = {
                weightPrice: detail.options[0].weightPrice,
                good_id: detail.good_id,
                naverID: detail.productNo,
                korTitle: detail.title,
                mainImages: detail.mainImages,
                topHtml: ObjItem.topImage,
                isColothes: detail.isClothes,
                isShoes: detail.isShoes,
                clothesHtml: ObjItem.clothImage,
                shoesHtml: ObjItem.shoesImage,
                optionHtml: isUSA && detail.options.length === 1 ? "" : optionHtml,
                html: detail.html,
                bottomHtml: ObjItem.bottomImage,
                brand: detail.brand,
                manufacture: detail.manufacture,
                outboundShippingTimeDay: ObjItem.shipping.outboundShippingTimeDay,
                deliveryChargeType: "FREE",
                deliveryCharge: 0,
                deliveryChargeOnReturn: ObjItem.returnCenter.deliveryChargeOnReturn,
                naverCategoryCode: detail.categoryId,
                keyword:
                  detail.sellerTags && detail.sellerTags.length > 0
                    ? detail.sellerTags
                    : detail.title.split(" "),
                engSentence: detail.engSentence,
              }
             
              const coupang = {
                displayCategoryCode: detail.categoryCode,
                vendorId: ObjItem.vendorId,
                vendorUserId: ObjItem.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)
                deliveryCompanyCode: ObjItem.shipping.deliveryCompanyCode,
                returnCenterCode: ObjItem.returnCenter.returnCenterCode,
                returnChargeName: ObjItem.returnCenter.shippingPlaceName,
                companyContactNumber: ObjItem.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
                returnZipCode: ObjItem.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
                returnAddress: ObjItem.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
                returnAddressDetail: ObjItem.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
                returnCharge: ObjItem.returnCenter.returnCharge, // 반품배송비
                afterServiceInformation: ObjItem.afterServiceInformation, // A/S안내
                afterServiceContactNumber: ObjItem.afterServiceContactNumber, // A/S전화번호
                outboundShippingPlaceCode: ObjItem.shipping.outboundShippingPlaceCode, // 출고지주소코드

                invoiceDocument: ObjItem.invoiceDocument,

                maximumBuyForPerson: ObjItem.maximumBuyForPerson, // 인당 최대 구매수량
                maximumBuyForPersonPeriod: ObjItem.maximumBuyForPersonPeriod, // 최대 구매 수량 기간

                notices: detail.noticeCategories[0].noticeCategoryDetailNames.map((item) => {
                  return {
                    noticeCategoryName: detail.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
                    noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
                    content: item.content, // 내용
                  }
                }),
                attributes: detail.attributes.map((item) => {
                  return {
                    attributeTypeName: item.attributeTypeName, // 옵션타입명
                    attributeValueName: item.attributeValueName, // 옵션값
                  }
                }),
                certifications: detail.certifications.map((item) => {
                  return {
                    certificationType: item.certificationType,
                    dataType: item.dataType,
                    name: item.name,
                    required: item.required,
                  }
                }),
              }

              const productItem = await Product.findOneAndUpdate(
                {
                  userID: req.user.adminUser,
                  "basic.good_id": detail.good_id,
                },
                {
                  $set: {
                    isDelete: false,
                    writerID: req.user._id,
                    basic: detail,
                    product,
                    prop: detail.prop ? detail.prop : [],
                    options: detail.options,
                    coupang,
                    initCreatedAt: moment().toDate(),
                    isNaver: isUSA ? false : true,
                    isAutoPrice: isUSA,
                  },
                },
                {
                  upsert: true,
                  new: true,
                }
              )
              console.log("productItem", productItem._id)
              // await NaverFavoriteItem.findOneAndUpdate(
              //   {
              //     userID: req.user.adminUser,
              //     productNo: detail.productNo,
              //   },
              //   {
              //     $set: {
              //       isRegisted: true
              //     }
              //   }
              // )

              const response = await updateCoupang({
                id: productItem._id,
                product,
                options: detail.options,
                coupang,
                userID: req.user.adminUser,
                writerID: req.user._id,
              })
              console.log("response", response)
              const cafe24Response = await updateCafe24({
                id: productItem._id,
                isSingle: isSingle ? true : false,
                product,
                prop: detail.prop,
                options: detail.options,
                cafe24: {
                  mallID,
                  shop_no,
                },
                userID: req.user.adminUser,
                writerID: req.user._id,
              })
              console.log("cafe24Response", cafe24Response)

              if (isUSA) {
                await AmazonCollection.findOneAndUpdate(
                  {
                    userID: ObjectId(req.user.adminUser),
                    asin: detail.good_id,
                  },
                  {
                    $set: {
                      isDelete: true,
                    },
                  },
                  {
                    upsert: true,
                    new: true,
                  }
                )
                await TempProduct.deleteOne({
                  userID: ObjectId(req.user.adminUser),
                  good_id: detail.good_id,
                })
              }
            } catch (e) {
              logger.error(`UploadNaverPlusItem For: ${e}`)
            }
          }
        }, 3000)

        return true
      } catch (e) {
        logger.error(`UploadNaverPlusItem: ${e}`)
        return false
      }
    },
    SetNaverExcept: async (
      parent,
      { productNo, isDelete },
      { req, model: { NaverSaveItemFavorite }, logger }
    ) => {
      try {
        await NaverSaveItemFavorite.findOneAndUpdate(
          {
            userID: ObjectId(req.user.adminUser),
            productNo,
          },
          {
            $set: {
              userID: ObjectId(req.user.adminUser),
              productNo,
              isDelete,
            },
          },
          { upsert: true, new: true }
        )

        return true
      } catch (e) {
        logger.error(`SetNaverExcept: ${e}`)
        return false
      }
    },
    ExceptBrand: async (parent, {}, { req, model: { NaverFavoriteItem, Brand }, logger }) => {
      try {
        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )
        const naverItem = await NaverFavoriteItem.aggregate([
          {
            $match: {
              userID: ObjectId("5f0d5ff36fc75ec20d54c40b"),
              isExcepted: { $ne: true },
            },
          },
        ])
        console.log("naverItem", naverItem.length)
        for (const item of naverItem) {
          for (const name of item.name.split(" ")) {
            const brandFilter = brandList.filter((item) => item.brand === name)
            if (brandFilter.length > 0) {
              console.log("name--", item.name)
              console.log("name", name, brandFilter[0].brand)
            }
          }
        }
        return true
      } catch (e) {
        logger.error(`ExceptBrand: ${e}`)
        return false
      }
    },
    GetNaverItemList: async (
      parent,
      {
        page,
        perPage,
        sort,
        limit = 10,
        category,
        regDay,
        minRecent,
        maxRecent,
        totalMinSale,
        totalMaxSale,
        minReview,
        maxReview,
        minPrice,
        maxPrice,
      },
      { req, model: { NaverFavoriteItem, Product, NaverSaveItemFavorite, Brand }, logger }
    ) => {
      try {
        const match = {
          // originArea: {$regex: `.*중국.*`}
          $or: [{originArea: {$regex: `.*중국.*`}}, {originArea: {$regex: `.*CHINA.*`}}]
        }
        let sortValue = {
          
        }
        switch (sort) {
          case "a":
            sortValue = {
              createdAt: -1,
              recentSaleCount: -1
            }
            break
          case "b":
            sortValue = {
              regDate: -1,
              recentSaleCount: -1,
            }
            break
          case "c":
            sortValue = {
              purchaseCnt: -1,
              recentSaleCount: -1
            }
            break
          default:
            sortValue = {
              createdAt: -1,
              recentSaleCount: -1
            }
            break
        }

        if (category && category.length > 0) {
          match.category1 = {
            $in: category.split(","),
          }
        }

        if (regDay !== 300) {
          const recentDate = moment().add(-regDay, "days").format("YYYY-MM-DD")
          match.regDate = {
            $gte: recentDate,
          }
        }
        if (minRecent === 0 && maxRecent === 50) {
        } else if (minRecent === 0 && maxRecent < 50) {
          match.recentSaleCount = {
            $lte: maxRecent,
          }
        } else if (minRecent > 0 && maxRecent === 50) {
          match.recentSaleCount = {
            $gte: minRecent,
          }
        } else {
          match.recentSaleCount = {
            $gte: minRecent,
            $lte: maxRecent,
          }
        }

        if (totalMinSale === 0 && totalMaxSale === 100) {
        } else if (totalMinSale === 0 && totalMaxSale < 100) {
          match.purchaseCnt = {
            $lte: totalMaxSale,
          }
        } else if (totalMinSale > 0 && totalMaxSale === 100) {
          match.purchaseCnt = {
            $gte: totalMinSale,
          }
        } else {
          match.recentSaleCount = {
            $gte: totalMinSale,
            $lte: totalMaxSale,
          }
        }

        if (minReview === 0 && maxReview === 1000) {
        } else if (minReview === 0 && maxReview < 1000) {
          match.reviewCount = {
            $lte: maxReview,
          }
        } else if (minReview > 0 && maxReview === 1000) {
          match.reviewCount = {
            $gte: minReview,
          }
        } else {
          match.recentSaleCount = {
            $gte: minReview,
            $lte: maxReview,
          }
        }

        if (minPrice === 0 && maxPrice === 2000000) {
        } else if (minPrice === 0 && maxPrice < 2000000) {
          match.salePrice = {
            $lte: maxPrice,
          }
        } else if (minPrice > 0 && maxPrice === 2000000) {
          match.salePrice = {
            $gte: minPrice,
          }
        } else {
          match.recentSaleCount = {
            $gte: minPrice,
            $lte: maxPrice,
          }
        }

        const products = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isDelete: false,
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ]).allowDiskUse(true)
        const productItemId = products.map((item) => item.basic.naverID)
        const saveItem = await NaverSaveItemFavorite.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              // $or: [
              //   {
              //     isFavorite: {$ne: true},
              //     isDelete: {$ne: true}
              //   }
              // ]
            }
          },
        ])
        console.log("saveItem", saveItem.length)
        const saveItemId = saveItem.map(item => item.productNo)
        console.log("productItemId", productItemId.length)
        console.log("saveItemId", saveItemId.length)
      
        const naverItem = await NaverFavoriteItem.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    productNo: {
                      $nin: productItemId,
                    },
                    productNo: {
                      $nin: saveItemId
                    },
                    ...match,
                  },
                },
                
                // {
                //   $lookup: {
                //     from: "naversaveitemfavorites",
                //     let: { productNo: "$productNo" },
                //     pipeline: [
                //       {
                //         $match: {
                //           $expr: {
                //             $and: [
                //               {
                //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
                //               },
                //               {
                //                 $eq: ["$productNo", "$$productNo"],
                //               },
                //             ],
                //             // $eq: ["$productNo", "$$productNo"]
                //           },
                //         },
                //       },
                //     ],
                //     as: "favorite",
                //   },
                // },
                // {
                //   $unwind: {
                //     path: "$favorite",
                //     preserveNullAndEmptyArrays: true,
                //   },
                // },
                // {
                //   $match: {
                //     "favorite.isFavorite": { $ne: true },
                //     "favorite.isDelete": { $ne: true },
                //   },
                // },
                {
                  $sort: {
                    ...sortValue,
                  },
                },

                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    productNo: {
                      $nin: productItemId,
                    },
                    productNo: {
                      $nin: saveItemId
                    },
                    ...match,
                  },
                },

                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ]).allowDiskUse(true)
        
        console.log("---------")
        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8" ||
          req.user.adminUser.toString() === "62bd48f391d7fb85bcc54693"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008", "625f9ca226d0840a73e2dbb8", "62bd48f391d7fb85bcc54693"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        for (const item of naverItem[0].data) {
          if (item.favorite) {
            item.isFavorite = item.favorite.isFavorite
          } else {
            item.isFavorite = false
          }
          if (item.idDelete) {
            item.idDelete = item.favorite.idDelete
          } else {
            item.idDelete = false
          }
          let titleArr = item.name.split(" ")
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
          item.titleArray = titleArr
        }
        console.log("전체 : ", naverItem[0].count[0] ? naverItem[0].count[0].count : 0)
        return {
          count: naverItem[0].count[0] ? naverItem[0].count[0].count : 0,
          list: naverItem[0].data,
        }
      } catch (e) {
        logger.error(`GetNaverItemList: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    GetNaverJanpanItemList: async (
      parent,
      {
        page,
        perPage,
        sort,
        limit = 10,
        category,
        regDay,
        minRecent,
        maxRecent,
        totalMinSale,
        totalMaxSale,
        minReview,
        maxReview,
        minPrice,
        maxPrice,
      },
      { req, model: { NaverJapanItem, Product, Brand }, logger }
    ) => {
      try {
        const match = {}
        let sortValue = {}
        switch (sort) {
          case "a":
            sortValue = {
              createdAt: -1,
            }
            break
          case "b":
            sortValue = {
              regDate: -1,
            }
            break
          case "c":
            sortValue = {
              purchaseCnt: -1,
            }
            break
          default:
            sortValue = {
              createdAt: -1,
            }
            break
        }

        if (category && category.length > 0) {
          match.category1 = {
            $in: category.split(","),
          }
        }

        if (regDay !== 300) {
          const recentDate = moment().add(-regDay, "days").format("YYYY-MM-DD")
          match.regDate = {
            $gte: recentDate,
          }
        }
        if (minRecent === 0 && maxRecent === 50) {
        } else if (minRecent === 0 && maxRecent < 50) {
          match.recentSaleCount = {
            $lte: maxRecent,
          }
        } else if (minRecent > 0 && maxRecent === 50) {
          match.recentSaleCount = {
            $gte: minRecent,
          }
        } else {
          match.recentSaleCount = {
            $gte: minRecent,
            $lte: maxRecent,
          }
        }

        if (totalMinSale === 0 && totalMaxSale === 100) {
        } else if (totalMinSale === 0 && totalMaxSale < 100) {
          match.purchaseCnt = {
            $lte: totalMaxSale,
          }
        } else if (totalMinSale > 0 && totalMaxSale === 100) {
          match.purchaseCnt = {
            $gte: totalMinSale,
          }
        } else {
          match.recentSaleCount = {
            $gte: totalMinSale,
            $lte: totalMaxSale,
          }
        }

        if (minReview === 0 && maxReview === 1000) {
        } else if (minReview === 0 && maxReview < 1000) {
          match.reviewCount = {
            $lte: maxReview,
          }
        } else if (minReview > 0 && maxReview === 1000) {
          match.reviewCount = {
            $gte: minReview,
          }
        } else {
          match.recentSaleCount = {
            $gte: minReview,
            $lte: maxReview,
          }
        }

        if (minPrice === 0 && maxPrice === 2000000) {
        } else if (minPrice === 0 && maxPrice < 2000000) {
          match.salePrice = {
            $lte: maxPrice,
          }
        } else if (minPrice > 0 && maxPrice === 2000000) {
          match.salePrice = {
            $gte: minPrice,
          }
        } else {
          match.recentSaleCount = {
            $gte: minPrice,
            $lte: maxPrice,
          }
        }

        const products = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isDelete: false,
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])
        const productItemId = products.map((item) => item.basic.naverID)
        // const saveItem = await NaverSaveItemFavorite.aggregate([
        //   {
        //     $match: {
        //       userID: ObjectId(req.user.adminUser),
        //       $or: [
        //         {
        //           isFavorite: {$ne: true},
        //           isDelete: {$ne: true}
        //         }
        //       ]
        //     }
        //   },
        // ])
        // const saveItemId = saveItem.map(item => item.productNo)
        // console.log("productItemId", productItemId.length)
        // console.log("saveItemId", saveItemId.length)
       
        const naverItem = await NaverJapanItem.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    productNo: {
                      $nin: productItemId,
                    },
                    ...match,
                  },
                },
                {
                  $sort: {
                    ...sortValue,
                  },
                },
                {
                  $lookup: {
                    from: "naversaveitemfavorites",
                    let: { productNo: "$productNo" },
                    pipeline: [
                      {
                        $match: {
                          $expr: {
                            $and: [
                              {
                                $eq: ["$userID", ObjectId(req.user.adminUser)],
                              },
                              {
                                $eq: ["$productNo", "$$productNo"],
                              },
                            ],
                            // $eq: ["$productNo", "$$productNo"]
                          },
                        },
                      },
                    ],
                    as: "favorite",
                  },
                },
                {
                  $unwind: {
                    path: "$favorite",
                    preserveNullAndEmptyArrays: true,
                  },
                },
                {
                  $match: {
                    "favorite.isFavorite": { $ne: true },
                    "favorite.isDelete": { $ne: true },
                  },
                },
                // {
                //   $lookup: {
                //     from: "products",
                //     let: {
                //       productNo: "$productNo"
                //     },
                //     pipeline: [
                //       {
                //         $match: {
                //           $expr: {
                //             $and: [
                //               {
                //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
                //                 $eq: ["$basic.naverID", "$$productNo"]
                //               },
                //             ]
                //           }
                //         }
                //       },
                //       {
                //         $project: {_id: 1, "basic.naverID": 1}
                //       }
                //     ],
                //     as: "product"
                //   }
                // },
                // {
                //   $unwind: {
                //       path: "$product",
                //       preserveNullAndEmptyArrays: true
                //   }
                // },
                // {
                //   $match: {
                //     product: {
                //       $eq: null
                //     }
                //   }
                // },

                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    ...match,
                  },
                },

                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ]).allowDiskUse(true)
        
        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "625f9ca226d0840a73e2dbb8",
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        for (const item of naverItem[0].data) {
          if (item.favorite) {
            item.isFavorite = item.favorite.isFavorite
          } else {
            item.isFavorite = false
          }
          if (item.idDelete) {
            item.idDelete = item.favorite.idDelete
          } else {
            item.idDelete = false
          }
          let titleArr = item.name.split(" ")
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
          item.titleArray = titleArr
        }
        return {
          count: naverItem[0].count[0] ? naverItem[0].count[0].count : 0,
          list: naverItem[0].data,
        }
      } catch (e) {
        logger.error(`GetNaverJanpanItemList: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    GetNaverFavoriteItemList: async (
      parent,
      {},
      {
        req,
        model: { NaverFavoriteItem, NaverSaveItemFavorite, CoupangWinner, Product, Brand },
        logger,
      }
    ) => {
      try {
        const saveItem = await NaverSaveItemFavorite.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isFavorite: true,
              isDelete: { $ne: true },
            },
          },
          {
            $sort: { _id: -1 },
          },
        ])

        const saveItemId = saveItem.map((item) => item.productNo)
        console.log("saveItemId", saveItemId.length)

        const products = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              "basic.naverID": {
                $in: saveItemId,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])
        const products2 = await CoupangWinner.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              productNo: {
                $in: saveItemId,
              },
            },
          },
        ])
        let naverItem = await NaverFavoriteItem.aggregate([
          {
            $match: {
              productNo: { $in: saveItemId },
            },
          },

          // {
          //   $lookup: {
          //     from: "naversaveitemfavorites",
          //     let: {
          //       productNo: "$productNo"
          //     },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               {
          //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
          //                 // $eq: ["$productNo", "$$productNo"]
          //               },
          //               {
          //                 $eq: ["$productNo", "$$productNo"]
          //               },
          //             ]
          //           }
          //         }
          //       }
          //     ],
          //     as: "favorite"
          //   }
          // },
          // {
          //    $unwind: {
          //       path: "$favorite",
          //       preserveNullAndEmptyArrays: true
          //    }
          // },
          // {
          //   $match: {
          //     "favorite.isFavorite": true,
          //     "favorite.isDelete": {$ne: true}
          //   }
          // },
          // {
          //   $lookup: {
          //     from: "products",
          //     let: {
          //       productNo: "$productNo"
          //     },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               {
          //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
          //                 $eq: ["$basic.naverID", "$$productNo"]
          //               }
          //             ]
          //         }
          //       }
          //     },
          //     {
          //       $project: {_id: 1, "basic.naverID": 1}
          //     }
          //   ],
          //   as: "product"
          //   }
          // },
          // {
          //    $unwind: {
          //       path: "$product",
          //       preserveNullAndEmptyArrays: true
          //    }
          // },
          // {
          //   $match: {
          //     product: {
          //       $eq: null
          //     }
          //   }
          // },
          {
            $sort: {
              createdAt: -1
            }
          },
        ])
        console.log("naverItem11", naverItem.length)
        naverItem = naverItem.map((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
          } else if (
            products2.filter((fItem) => fItem.productNo.toString() === item.productNo.toString())
              .length > 0
          ) {
          } else {
            return item
          }
        })
        console.log("naverItem22", naverItem.length)
        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )
        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        for (const item of naverItem.filter((item) => (item ? true : false))) {
          if (item.favorite) {
            item.isFavorite = item.favorite.isFavorite
          } else {
            item.isFavorite = false
          }
          if (item.favorite) {
            item.isDelete = item.favorite.idDelete
          } else {
            item.isDelete = false
          }

          let titleArr = item.name.split(" ")
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
          item.titleArray = titleArr
        }

        return naverItem.filter((item) => (item ? true : false))
        // .filter((item, index) => index < 30)
      } catch (e) {
        logger.error(`GetNaverFavoriteItemList: ${e}`)
        return []
      }
    },
    GetSaledItemList: async (
      parent,
      {},
      {
        req,
        model: { MarketOrder, DeliveryInfo, TaobaoOrder, NaverFavoriteItem, NaverSaveItemFavorite, CoupangWinner, Product, Brand },
        logger,
      }
    ) => {
      try {

        const user =ObjectId(req.user.adminUser)

        const allItems = await MarketOrder.aggregate([
          {
            $addFields: {
              "orderItems.paidAtDate" : "$paidAtDate"
            }
          },
          {
            $match: {
              userID: user,
              saleType: 1,
            }
          }
        ])

        let orderItems = []
        allItems.forEach(item => {
          for(const orderItem of item.orderItems){
            const temp = _.find(orderItems, {title: orderItem.title})
            if(temp){
              if(temp.paidAtDate < orderItem.paidAtDate){
                orderItems.push({
                  title: orderItem.title,
                  paidAtDate: orderItem.paidAtDate
                })  
              } else {
                orderItems.push({
                  title: orderItem.title,
                  paidAtDate: temp.paidAtDate
                })
              }
            } else {
              orderItems.push({
                title: orderItem.title,
                paidAtDate: orderItem.paidAtDate
              })
            }
            
          }
        })

        // console.log("orderItems", orderItems)
        
        let productItems = []

        const promiseArr = orderItems.map(item => {
          return new Promise(async (resolve, reject) => {
            try {
              let productName = ``
              const nameArray = item.title
                  .split(" ")
                  .filter((item) => item.trim().length > 0)
    
              for (const item of nameArray) {
                productName += ` "${item}"`
              }
              const product = await Product.findOne({
                userID: ObjectId(user),
                $text: {
                  $search: productName.trim(),
                },
              }, 
              {
                _id: 1,
                "product.korTitle" : 1,
                "product.url" : 1,
                "product.mainImages" : 1,
                "product.options": 1,
                "product.keyword": 1,
                "product.weightPrice": 1,
                "basic.content": 1,
                "basic.url": 1,
                "basic.good_id": 1,
              })
              if(product && (product.basic.url.includes("taobao.com") || product.basic.url.includes("tmail.com"))){
                let image = null
                if(product.product.mainImages && Array.isArray(product.product.mainImages) && product.product.mainImages.length > 0){
                  image = product.product.mainImages[0]
                }
                if(!image) {
                  if(product.product.options && Array.isArray(product.product.options) && product.product.options.length > 0) {
                    image = product.product.options[0]
                  }
                }
                if(!image) {
                  if(product.basic.content && Array.isArray(product.basic.content) && product.basic.content.length > 0) {
                    image = product.basic.content[0]
                  }
                }
                productItems.push( {
                  _id: product._id.toString(),
                  detailUrl: product.basic.url,
                  name: product.product.korTitle,
                  image,
                  productNo: product.basic.good_id,
                  sellerTags: product.product.keyword,
                  weightPrice: product.product.weightPrice,
                  paidAtDate: item.paidAtDate
                })
              }
              resolve()
            } catch(e){
              reject(e)
            }
          })

        
        })
        await Promise.all(promiseArr)
        console.log("productItems", productItems.length)
        const rankingArr = ranking(productItems.map(item => item._id), 0)
        // console.log("rankingArr", rankingArr)
        const productList = []
        for(const item of rankingArr){
          const product = _.find(productItems, {_id: item.name})
          if(product){
            productList.push({
              name: product.name,
              detailUrl: product.detailUrl,
              image: product.image,
              productNo: product.productNo,
              sellerTags: product.sellerTags,
              purchaseCnt: item.count,
              isRegister: true,
              titleArray: [],
              reviewCount: 0,
              zzim: 0,
              recentSaleCount: 0,
              weightPrice: product.weightPrice,
              paidAtDate: product.paidAtDate
            })
          }
          
        }
        
        return productList.sort((a, b) => b.paidAtDate - a.paidAtDate)

        
      } catch (e) {
        logger.error(`GetNaverFavoriteItemList: ${e}`)
        return []
      }
    },
    SetNaverFavoriteItemDelete: async (
      prent, 
      {},
      {
        req,
        model : {NaverSaveItemFavorite},
        logger
      }
    ) => {
      try {
        await NaverSaveItemFavorite.update(
          {
            userID: req.user.adminUser
          },{
            isFavorite: false,
            isDelete: true
          }
        )
        return true
      } catch(e) {
        logger.error(`SetNaverFavoriteItemDelete: ${e}`)
        return false
      }
    },
    GetNaverJanpanFavoriteItemList: async (
      parent,
      {},
      {
        req,
        model: { NaverJapanItem, NaverSaveItemFavorite, CoupangWinner, Product, Brand },
        logger,
      }
    ) => {
      try {
        const saveItem = await NaverSaveItemFavorite.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              isFavorite: true,
              isDelete: { $ne: true },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
        ])

        const saveItemId = saveItem.map((item) => item.productNo)
        console.log("saveItemId", saveItemId.length)

        const products = await Product.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              "basic.naverID": {
                $in: saveItemId,
              },
            },
          },
          {
            $project: {
              "basic.naverID": 1,
            },
          },
        ])
        const products2 = await CoupangWinner.aggregate([
          {
            $match: {
              userID: ObjectId(req.user.adminUser),
              productNo: {
                $in: saveItemId,
              },
            },
          },
        ])
        let naverItem = await NaverJapanItem.aggregate([
          {
            $match: {
              productNo: { $in: saveItemId },
            },
          },
          // {
          //   $lookup: {
          //     from: "naversaveitemfavorites",
          //     let: {
          //       productNo: "$productNo"
          //     },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               {
          //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
          //                 // $eq: ["$productNo", "$$productNo"]
          //               },
          //               {
          //                 $eq: ["$productNo", "$$productNo"]
          //               },
          //             ]
          //           }
          //         }
          //       }
          //     ],
          //     as: "favorite"
          //   }
          // },
          // {
          //    $unwind: {
          //       path: "$favorite",
          //       preserveNullAndEmptyArrays: true
          //    }
          // },
          // {
          //   $match: {
          //     "favorite.isFavorite": true,
          //     "favorite.isDelete": {$ne: true}
          //   }
          // },
          // {
          //   $lookup: {
          //     from: "products",
          //     let: {
          //       productNo: "$productNo"
          //     },
          //     pipeline: [
          //       {
          //         $match: {
          //           $expr: {
          //             $and: [
          //               {
          //                 $eq: ["$userID", ObjectId(req.user.adminUser)],
          //                 $eq: ["$basic.naverID", "$$productNo"]
          //               }
          //             ]
          //         }
          //       }
          //     },
          //     {
          //       $project: {_id: 1, "basic.naverID": 1}
          //     }
          //   ],
          //   as: "product"
          //   }
          // },
          // {
          //    $unwind: {
          //       path: "$product",
          //       preserveNullAndEmptyArrays: true
          //    }
          // },
          // {
          //   $match: {
          //     product: {
          //       $eq: null
          //     }
          //   }
          // },
          // {
          //   $sort: {
          //     "favorite._id": -1
          //   }
          // },
        ])
        console.log("naverItem11", naverItem.length)
        naverItem = naverItem.map((item) => {
          if (
            products.filter((fItem) => fItem.basic.naverID.toString() === item.productNo.toString())
              .length > 0
          ) {
          } else if (
            products2.filter((fItem) => fItem.productNo.toString() === item.productNo.toString())
              .length > 0
          ) {
          } else {
            return item
          }
        })
        console.log("naverItem22", naverItem.length)
        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )
        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008" ||
          req.user.adminUser.toString() === "625f9ca226d0840a73e2dbb8"
        ) {
          banList = await Brand.find(
            {
              userID: {
                $in: [
                  "5f0d5ff36fc75ec20d54c40b",
                  "5f1947bd682563be2d22f008",
                  "625f9ca226d0840a73e2dbb8",
                ],
              },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }

        for (const item of naverItem.filter((item) => (item ? true : false))) {
          if (item.favorite) {
            item.isFavorite = item.favorite.isFavorite
          } else {
            item.isFavorite = false
          }
          if (item.favorite) {
            item.isDelete = item.favorite.idDelete
          } else {
            item.isDelete = false
          }

          let titleArr = item.name.split(" ")
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
          item.titleArray = titleArr
        }

        return naverItem.filter((item) => (item ? true : false))
      } catch (e) {
        logger.error(`GetNaverJanpanFavoriteItemList: ${e}`)
        return []
      }
    },

    SetNaverItemFavorite: async (
      parent,
      { productNo, isFavorite },
      { req, model: { NaverSaveItemFavorite }, logger }
    ) => {
      try {
        await NaverSaveItemFavorite.findOneAndUpdate(
          {
            userID: ObjectId(req.user.adminUser),
            productNo,
          },
          {
            $set: {
              userID: ObjectId(req.user.adminUser),
              productNo,
              isFavorite,
            },
          },
          { upsert: true, new: true }
        )
        return true
      } catch (e) {
        logger.error(`GetNaverItemList: ${e}`)
        return false
      }
    },
    QualityCheck: async (
      parent,
      { title, category1, category2, category3, category4 },
      { logger }
    ) => {
      try {
        const response = await NaverTitleQualityCheck({
          title,
          category1,
          category2,
          category3,
          category4,
        })
        console.log("response--", response)
        return response.result
      } catch (e) {
        logger.error(`QualityCheck: ${e}`)
        return false
      }
    },
    NaverShoppingData: async (
      parent,
      {},
      { model: { NaverFavoriteItem, Brand, NaverMainKeyword }, logger }
    ) => {
      try {
        const brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )

        const endDate = moment().add(-1, "days").format("YYYY-MM-DD")

        for (const category of smartStoreCategory) {
          let page = 1
          while (true) {
            const response = await ShippingData({
              category: category.카테고리코드,
              startDate: endDate,
              endDate,
              page: page++,
            })

            if (response && response.statusCode === 200) {
              if (response.ranks.length === 0) {
                break
              }
              for (const item of response.ranks.filter((rItem) => rItem.keyword.length > 1)) {
                try {
                  const naverItem = await NaverFavoriteItem.aggregate([
                    {
                      $match: {
                        // categoryId: category.카테고리코드,
                        title: { $regex: `.*${item.keyword}.*` },
                      },
                    },
                  ])
                  if (naverItem.length > 0) {
                    let purchaseCnt = 0
                    let recentSaleCount = 0

                    for (const nItem of naverItem) {
                      purchaseCnt += nItem.purchaseCnt
                      recentSaleCount += nItem.recentSaleCount
                    }
                    const brandArr = brandList.filter((fItem) => item.keyword.includes(fItem.brand))
                    console.log(
                      item.keyword,
                      purchaseCnt,
                      recentSaleCount,
                      brandArr.length > 0 ? true : false
                    )

                    await NaverMainKeyword.findOneAndUpdate(
                      {
                        // category: category.카테고리코드,
                        keyword: item.keyword,
                      },
                      {
                        $set: {
                          // category: `${category.대분류}/${category.중분류}/${category.소분류}${category.세분류.length > 0 ? `category.세분류` : ""}`,
                          // categoryCode: category.카테고리코드,
                          keyword: item.keyword,
                          productCount: naverItem.length,
                          purchaseCnt,
                          recentSaleCount,
                          isBrand: brandArr.length > 0 ? true : false,
                        },
                      },
                      {
                        upsert: true,
                      }
                    )
                  }
                } catch (e) {}
              }
            } else {
              break
            }
            await sleep(200)
          }

          console.log("-------------------------")
          console.log("끝", category)
          console.log("-------------------------")
          await sleep(1000)
        }

        console.log("끝")
        return true
      } catch (e) {
        logger.error(`NaverShoppingData: ${e}`)
        return false
      }
    },
    NaverMainKeyword: async (
      parent,
      { search, page = 1, perPage = 10, sort = "8", exceptBrand = false, categoryFilter = [] },
      { req, model: { NaverMainKeyword }, logger }
    ) => {
      try {
        const matchQuery = {}
        console.log("categoryFilter", categoryFilter)
        if (categoryFilter.length > 0) {
          matchQuery.category1 = { $in: categoryFilter }
        }
        if (exceptBrand) {
          matchQuery.isBrand = false
        }
        if (search && search.length > 0) {
          matchQuery.keyword = { $regex: `.*${search}.*` }
        }
        console.log("search", search)
        console.log("matchQuery", matchQuery)
        const sortQuery = {}
        switch (sort) {
          case "1": // 키워드
            sortQuery.keyword = 1
            break
          case "2": // 키워드
            sortQuery.keyword = -1
            break
          case "3": // 상품갯수
            sortQuery.productCount = 1
            break
          case "4": // 상품갯수
            sortQuery.productCount = -1
          case "5": // 6개월 판매 갯수
            break
            sortQuery.purchaseCnt = 1
            break
          case "6": // 6개월 판매 갯수
            sortQuery.purchaseCnt = -1
            break
          case "7": // 최근 판매 갯수
            sortQuery.recentSaleCount = 1
            break
          case "8": // 최근 판매 갯수
            sortQuery.recentSaleCount = -1
            break
          case "9": // 카테고리
            sortQuery.category1 = 1
            break
          case "10": // 카테고리
            sortQuery.category1 = -1
            break
          default:
            break
        }

        const keywords = await NaverMainKeyword.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $sort: {
                    ...sortQuery,
                  },
                },
                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ])

        return {
          count: keywords[0].count[0] ? keywords[0].count[0].count : 0,
          list: keywords[0].data,
        }
      } catch (e) {
        logger.error(`NaverMainKeyword: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    SourcingKeyword: async (
      parent,
      {
        search,
        page = 1,
        perPage = 10,
        sort = "",
        categoryFilter = [],
        minCount = 0,
        maxCount = 0,
        minProductCount = 0,
        maxProductCount = 0,
        minOverSeaProductCount = 0,
        maxOverSeaProductCount = 0,
        minCompetition = 0,
        maxCompetition = 0,
        minOverSeaCompetition = 0,
        maxOverSeaCompetition = 0,
        overSeaProductCount = 1,
      },
      { req, model: { DatalabKeyword, KeywordFavorite }, logger }
    ) => {
      try {
        // 키워드, 카테고리, 조회수, 상품수, 해외상품수, 해외상품비율, 경쟁강도, 해외경쟁강도
        const matchQuery = {}
        console.log("categoryFilter", categoryFilter)
        if (categoryFilter.length > 0) {
          matchQuery.category1Name = { $in: categoryFilter }
        }
        if (search && search.length > 0) {
          matchQuery.keyword = { $regex: `.*${search}.*` }
        }

        // 조회수
        if (minCount > 0 && maxCount > 0) {
          matchQuery.monthlyTotalCnt = { $gte: minCount, $lte: maxCount }
        } else if (minCount > 0) {
          matchQuery.monthlyTotalCnt = { $gte: minCount }
        } else if (maxCount > 0) {
          matchQuery.monthlyTotalCnt = { $lte: maxCount }
        }

        // 상품수
        if (minProductCount > 0 && maxProductCount > 0) {
          matchQuery.totalCount = { $gte: minProductCount, $lte: maxProductCount }
        } else if (minProductCount > 0) {
          matchQuery.totalCount = { $gte: minProductCount }
        } else if (maxProductCount > 0) {
          matchQuery.totalCount = { $lte: maxProductCount }
        }

        // 해외 상품수
        if (minOverSeaProductCount > 0 && maxOverSeaProductCount > 0) {
          matchQuery.overSeaCount = { $gte: minOverSeaProductCount, $lte: maxOverSeaProductCount }
        } else if (minOverSeaProductCount > 0) {
          matchQuery.overSeaCount = { $gte: minOverSeaProductCount }
        } else if (maxOverSeaProductCount > 0) {
          matchQuery.overSeaCount = { $lte: maxOverSeaProductCount }
        }

        // 경쟁강도
        if (minCompetition > 0 && maxCompetition > 0) {
          matchQuery.competitionIntensity = { $gte: minCompetition, $lte: maxCompetition }
        } else if (minCompetition > 0) {
          matchQuery.competitionIntensity = { $gte: minCompetition }
        } else if (maxCompetition > 0) {
          matchQuery.competitionIntensity = { $lte: maxCompetition }
        }

        // 해외 경쟁강도
        if (minOverSeaCompetition > 0 && maxOverSeaCompetition > 0) {
          matchQuery.overSeaCompetitionIntensity = {
            $gte: minOverSeaCompetition,
            $lte: maxOverSeaCompetition,
          }
        } else if (minOverSeaCompetition > 0) {
          matchQuery.overSeaCompetitionIntensity = { $gte: minOverSeaCompetition }
        } else if (maxOverSeaCompetition > 0) {
          matchQuery.overSeaCompetitionIntensity = { $lte: maxOverSeaCompetition }
        }

        if (overSeaProductCount >= 9) {
          matchQuery.overSeaProductCount = { $gte: overSeaProductCount }
        }

        console.log("search", search)
        console.log("matchQuery", matchQuery)
        const sortQuery = {}
        switch (sort) {
          case "1": // 키워드
            sortQuery.keyword = 1
            break
          case "2": // 키워드
            sortQuery.keyword = -1
            break
          case "3": // 조회수
            sortQuery.monthlyTotalCnt = 1
            break
          case "4": // 조회수
            sortQuery.monthlyTotalCnt = -1
            break
          case "5": // 상품갯수
            sortQuery.totalCount = 1
            break
          case "6": // 상품갯수
            sortQuery.totalCount = -1
            break
          case "7": // 해외상품수
            sortQuery.overSeaCount = 1
            break
          case "8": // 해외상품수
            sortQuery.overSeaCount = -1
            break
          case "9": // 해외상품비율
            sortQuery.overSeaRate = 1
            break
          case "10": // 해외상품비율
            sortQuery.overSeaRate = -1
            break
          case "11": // 경쟁강도
            sortQuery.competitionIntensity = 1
            break
          case "12": // 경쟁강도
            sortQuery.competitionIntensity = -1
            break
          case "13": // 해외경쟁강도
            sortQuery.overSeaCompetitionIntensity = 1
            break
          case "14": // 해외경쟁강도
            sortQuery.overSeaCompetitionIntensity = -1
            break
          case "15": // 카테고리
            sortQuery.category1Name = 1
            break
          case "16": // 카테고리
            sortQuery.category1Name = -1
            break
          case "17": // 1 페이지 단일상품 비율
            sortQuery.singleProductRate = 1
            break
          case "18": // 1 페이지 단일상품 비율
            sortQuery.singleProductRate = -1
            break
          case "19": // 1 페이지 판매 안된 상품 비율
            sortQuery.notSalesProductRate = 1
            break
          case "20": //1 페이지 판매 안된 상품 비율
            sortQuery.notSalesProductRate = -1
            break
          case "21": // 1 페이지 해외직구 상품 비율
            sortQuery.overSeaCountRate = 1
            break
          case "22": // 1 페이지 해외직구 상품 비율
            sortQuery.overSeaCountRate = -1
            break
          case "23": // 해외직구탭 1페이지 단일 상품 비율
            sortQuery.overSeaSingleProductRate = 1
            break
          case "24": // 해외직구탭 1페이지 단일 상품 비율
            sortQuery.overSeaSingleProductRate = -1
            break
          case "25": // 해외직구탭 1페이지 판매 안된 상품 비율
            sortQuery.overSeaNotSaleProductRate = 1
            break
          case "26": // 해외직구탭 1페이지 판매 안된 상품 비율
            sortQuery.overSeaNotSaleProductRate = -1
            break

          default:
            sortQuery.overSeaCompetitionIntensity = 1

            break
        }
        console.log("sortQuery", sortQuery)

        const favorite = await KeywordFavorite.find({
          userID: req.user.adminUser,
        })

        const keywords = await DatalabKeyword.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $sort: {
                    ...sortQuery,
                  },
                },
                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ])

        return {
          count: keywords[0].count[0] ? keywords[0].count[0].count : 0,
          list: keywords[0].data.map((item) => {

            item.overSeaRate = Number(item.overSeaRate.toFixed(3))
            item.competitionIntensity = Number(item.competitionIntensity.toFixed(3))
            item.overSeaCompetitionIntensity = Number(item.overSeaCompetitionIntensity.toFixed(3))
            item.overSeaCountRate = Number(item.overSeaCountRate.toFixed(3))
            item.singleProductRate = Number(item.singleProductRate.toFixed(3))
            item.notSalesProductRate = Number(item.notSalesProductRate.toFixed(3))
            item.overSeaSingleProductRate = Number(item.overSeaSingleProductRate.toFixed(3))
            item.overSeaNotSaleProductRate = Number(item.overSeaNotSaleProductRate.toFixed(3))
            const findFavorites = favorite.filter(
              (fItem) => fItem.keywordID.toString() === item._id.toString()
            )

            if (findFavorites.length > 0) {
              item.isFavorite = true
            } else {
              item.isFavorite = false
            }
            return item
          }),
        }
      } catch (e) {
        logger.error(`SourcingKeyword: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    MyFavoriteKeyword: async (
      parent,
      { page = 1, perPage = 10, sort = "", categoryFilter = [] },
      { req, model: { DatalabKeyword, KeywordFavorite }, logger }
    ) => {
      try {
        // 키워드, 카테고리, 조회수, 상품수, 해외상품수, 해외상품비율, 경쟁강도, 해외경쟁강도
        const matchQuery = {}
        console.log("categoryFilter", categoryFilter)
        if (categoryFilter.length > 0) {
          matchQuery.category1Name = { $in: categoryFilter }
        }

        const sortQuery = {}
        switch (sort) {
          case "1": // 키워드
            sortQuery.keyword = 1
            break
          case "2": // 키워드
            sortQuery.keyword = -1
            break
          case "3": // 조회수
            sortQuery.monthlyTotalCnt = 1
            break
          case "4": // 조회수
            sortQuery.monthlyTotalCnt = -1
            break
          case "5": // 상품갯수
            sortQuery.totalCount = 1
            break
          case "6": // 상품갯수
            sortQuery.totalCount = -1
            break
          case "7": // 해외상품수
            sortQuery.overSeaCount = 1
            break
          case "8": // 해외상품수
            sortQuery.overSeaCount = -1
            break
          case "9": // 해외상품비율
            sortQuery.overSeaRate = 1
            break
          case "10": // 해외상품비율
            sortQuery.overSeaRate = -1
            break
          case "11": // 경쟁강도
            sortQuery.competitionIntensity = 1
            break
          case "12": // 경쟁강도
            sortQuery.competitionIntensity = -1
            break
          case "13": // 해외경쟁강도
            sortQuery.overSeaCompetitionIntensity = 1
            break
          case "14": // 해외경쟁강도
            sortQuery.overSeaCompetitionIntensity = -1
            break
          case "15": // 카테고리
            sortQuery.category1Name = 1
            break
          case "16": // 카테고리
            sortQuery.category1Name = -1
            break
          case "17": // 1 페이지 단일상품 비율
            sortQuery.singleProductRate = 1
            break
          case "18": // 1 페이지 단일상품 비율
            sortQuery.singleProductRate = -1
            break
          case "19": // 1 페이지 판매 안된 상품 비율
            sortQuery.notSalesProductRate = 1
            break
          case "20": //1 페이지 판매 안된 상품 비율
            sortQuery.notSalesProductRate = -1
            break
          case "21": // 1 페이지 해외직구 상품 비율
            sortQuery.overSeaCountRate = 1
            break
          case "22": // 1 페이지 해외직구 상품 비율
            sortQuery.overSeaCountRate = -1
            break
          case "23": // 해외직구탭 1페이지 단일 상품 비율
            sortQuery.overSeaSingleProductRate = 1
            break
          case "24": // 해외직구탭 1페이지 단일 상품 비율
            sortQuery.overSeaSingleProductRate = -1
            break
          case "25": // 해외직구탭 1페이지 판매 안된 상품 비율
            sortQuery.overSeaNotSaleProductRate = 1
            break
          case "26": // 해외직구탭 1페이지 판매 안된 상품 비율
            sortQuery.overSeaNotSaleProductRate = -1
            break

          default:
            sortQuery.overSeaCompetitionIntensity = 1

            break
        }
        console.log("sortQuery", sortQuery)

        const favorite = await KeywordFavorite.find({
          userID: req.user.adminUser,
        })

        matchQuery._id = {
          $in: favorite.map((item) => item.keywordID),
        }
        const keywords = await DatalabKeyword.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $sort: {
                    ...sortQuery,
                  },
                },
                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ])

        return {
          count: keywords[0].count[0] ? keywords[0].count[0].count : 0,
          list: keywords[0].data.map((item) => {
            item.isFavorite = true
            return item
          }),
        }
      } catch (e) {
        logger.error(`MyFavoriteKeyword: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    NaverHealthFood: async (
      parent,
      { search, page = 1, perPage = 10, sort = "8", categoryFilter = [] },
      { req, model: { NaverHealthFoodItem, Brand }, logger }
    ) => {
      try {
        const matchQuery = {}
        console.log("categoryFilter", categoryFilter)
        if (categoryFilter.length > 0) {
          matchQuery.categoryId = { $in: categoryFilter }
        }

        if (search && search.length > 0) {
          matchQuery.title = { $regex: `.*${search}.*` }
        }
        console.log("search", search)
        console.log("matchQuery", matchQuery)
        const sortQuery = {}
        switch (sort) {
          case "1": // 키워드
            sortQuery.keyword = 1
            break
          case "2": // 키워드
            sortQuery.keyword = -1
            break
          case "3": // 상품갯수
            sortQuery.productCount = 1
            break
          case "4": // 상품갯수
            sortQuery.productCount = -1
          case "5": // 6개월 판매 갯수
            sortQuery.purchaseCnt = 1
            break
          case "6": // 6개월 판매 갯수
            sortQuery.purchaseCnt = -1
            break
          case "7": // 최근 판매 갯수
            sortQuery.recentSaleCount = 1
            break
          case "8": // 최근 판매 갯수
            sortQuery.recentSaleCount = -1
            break
          case "9": // 카테고리
            sortQuery.category1 = 1
            break
          case "10": // 카테고리
            sortQuery.category1 = -1
            break
          case "11": // 리뷰
            sortQuery.reviewCount = 1
            break
          case "12": // 리뷰
            sortQuery.reviewCount = -1
            break
          case "13": // 등록일
            sortQuery.regDate = 1
            break
          case "14": // 등록일
            sortQuery.regDate = -1
            break
          default:
            break
        }

        const healthFood = await NaverHealthFoodItem.aggregate([
          {
            $facet: {
              data: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $sort: {
                    ...sortQuery,
                  },
                },
                {
                  $limit: (page - 1) * perPage + perPage,
                },
                {
                  $skip: (page - 1) * perPage,
                },
              ],
              count: [
                {
                  $match: {
                    ...matchQuery,
                  },
                },
                {
                  $group: {
                    _id: null,
                    count: {
                      $sum: 1,
                    },
                  },
                },
              ],
            },
          },
        ])

        let brandList = await Brand.find(
          {
            brand: { $ne: null },
          },
          { brand: 1 }
        )
        let banList = []
        if (
          req.user.adminUser.toString() === "5f0d5ff36fc75ec20d54c40b" ||
          req.user.adminUser.toString() === "5f1947bd682563be2d22f008"
        ) {
          banList = await Brand.find(
            {
              userID: { $in: ["5f0d5ff36fc75ec20d54c40b", "5f1947bd682563be2d22f008"] },
            },
            { banWord: 1 }
          )
        } else {
          banList = await Brand.find(
            {
              userID: req.user.adminUser,
            },
            { banWord: 1 }
          )
        }
        let prohibitList = await Brand.find(
          {
            prohibit: { $ne: null },
          },
          { prohibit: 1 }
        )

        for (const item of healthFood[0].data) {
          let titleArr = item.name.split(" ")

          titleArr = titleArr.map((tItem) => {
            const brandArr = brandList.filter((item) =>
              tItem.toUpperCase().includes(item.brand.toUpperCase())
            )
            const banArr = banList.filter((item) =>
              tItem.toUpperCase().includes(item.banWord.toUpperCase())
            )
            const prohibitArr = prohibitList.filter((item) =>
              tItem.toUpperCase().includes(item.prohibit.toUpperCase())
            )
            return {
              word: tItem,
              brand: brandArr.length > 0 ? brandArr.map((item) => item.brand) : [],
              ban: banArr.length > 0 ? banArr.map((item) => item.banWord) : [],
              prohibit: banArr.length > 0 ? prohibitArr.map((item) => item.prohibit) : [],
            }
          })
          item.titleArray = titleArr
        }

        return {
          count: healthFood[0].count[0] ? healthFood[0].count[0].count : 0,
          list: healthFood[0].data,
        }
      } catch (e) {
        logger.error(`NaverMainKeyword: ${e}`)
        return {
          count: 0,
          list: [],
        }
      }
    },
    SetTaobaoUrl: async (
      parent,
      {_id, url},
      {req, model: {Product}, logger}
    ) => {
      try {
        if(!url || !url.includes("http")){
          return false
        }
        await Product.findOneAndUpdate(
          {_id},
          {
            $set: {
              "basic.url": url
            }
          }
        )
        return true
      } catch(e) {
        logger.error(`SetTaobaoUrl: ${e}`)
        return false
      }
    }
  },
}

module.exports = resolvers

const getAlphabet = (index) => {
  const alphabet = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ]
  const letter = alphabet[index % 25]
  let number = ""
  if (Math.floor(index / 25) > 0) {
    number = Math.floor(index / 25)
  }
  return `${letter}${number}`
}

const getShippingInfo = async ({ Market, userID }) => {
  const objItem = {
    shipping: {},
    returnCenter: {},
    vendorId: "",
    vendorUserId: "",
    invoiceDocument: "",
    maximumBuyForPerson: "",
    maximumBuyForPersonPeriod: "",
    cafe24_mallID: "",
    cafe24_shop_no: "",
  }
  if (!userID) {
    return objItem
  }
  try {
    const outbound = await Outbound({ userID })
    if (outbound && outbound.content.length > 0) {
      const temp = outbound.content.filter((item) => item.usable === true)
      if (temp.length > 0) {
        objItem.shipping.outboundShippingPlaceCode = temp[0].outboundShippingPlaceCode
        objItem.shipping.shippingPlaceName = temp[0].shippingPlaceName
        objItem.shipping.placeAddresses = temp[0].placeAddresses
        objItem.shipping.remoteInfos = temp[0].remoteInfos
      }
    }
    const returnShippingCenter = await ReturnShippingCenter({ userID })

    if (
      returnShippingCenter &&
      returnShippingCenter.data &&
      returnShippingCenter.data.content.length > 0
    ) {
      const temp = returnShippingCenter.data.content.filter((item) => item.usable === true)

      if (temp.length > 0) {
        objItem.returnCenter.returnCenterCode = temp[0].returnCenterCode
        objItem.returnCenter.shippingPlaceName = temp[0].shippingPlaceName
        objItem.returnCenter.deliverCode = temp[0].deliverCode
        objItem.returnCenter.deliverName = temp[0].deliverName
        objItem.returnCenter.placeAddresses = temp[0].placeAddresses
      }
    }

    const market = await Market.findOne({
      userID,
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
    certifications: "",
  }
  try {
    const recommendedResponse = await CategoryPredict({
      userID,
      productName: korTitle,
    })

    objItem.categoryCode = recommendedResponse.data.predictedCategoryId

    const metaResponse = await CategoryMeta({
      userID,
      categoryCode: recommendedResponse.data.predictedCategoryId,
    })

    objItem.attributes = metaResponse.data.attributes.map((item) => {
      return {
        ...item,
        attributeValueName: `상세페이지 참조`,
      }
    })

    objItem.noticeCategories = metaResponse.data.noticeCategories.map((item) => {
      const noticeCategoryDetailNames = item.noticeCategoryDetailNames.map((item) => {
        return {
          ...item,
          content: "상세페이지 참조",
        }
      })
      return {
        ...item,
        noticeCategoryDetailNames,
      }
    })
    objItem.requiredDocumentNames = metaResponse.data.requiredDocumentNames
    objItem.certifications = metaResponse.data.certifications
  } catch (e) {
    console.log("getCategoryInfo", e)
    logger.error("getCategoryInfo", e)
  } finally {
    return objItem
  }
}

const getBasicItem = async ({ Basic, userID }) => {
  const objItem = {
    afterServiceInformation: "",
    afterServiceContactNumber: "",
    topImage: "",
    bottomImage: "",
    clothImage: "",
    shoesImage: "",
  }
  try {
    const basic = await Basic.findOne({
      userID,
    })
    if (basic) {
      objItem.afterServiceInformation = basic.afterServiceInformation
      objItem.afterServiceContactNumber = basic.afterServiceContactNumber
      objItem.topImage = basic.topImage
      objItem.bottomImage = basic.bottomImage
      objItem.clothImage = basic.clothImage
      objItem.shoesImage = basic.shoesImage
    }
  } catch (e) {
    console.log("getBasicItem", e)
  } finally {
    return objItem
  }
}

const getGoodid = (url) => {
  
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


const getRelatedKeyword = async (title) => {
  return title.split(" ")
  let mainKeywordArray = []
  let brands = await Brand.find()
  brands = brands.map(item => item.brand)
  try {
    
    for(const item of title.split(" ").filter(item => item.length > 1)) {
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

    mainKeywordArray = mainKeywordArray.filter(item => {
      let contain = false
      for(const brand of brands){
        if(item.relKeyword.includes(brand)){
          contain = true
          break
        }
      }
      return !contain
    })

    mainKeywordArray = mainKeywordArray
    .filter((item, index) => index < 20)
    .map(item => item.relKeyword)
    

    return mainKeywordArray
  } catch (e){
    console.log("에러가??", e)
    return title.split(" ")
  }
}