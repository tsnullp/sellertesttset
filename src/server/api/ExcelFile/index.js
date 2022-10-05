const Product = require("../../models/Product")
const download = require("image-downloader")
const fs = require("fs")
const path = require("path")
const { getAppDataPath } = require("../../../lib/usrFunc")

exports.GetNaverExcelItem = async ({ productID, folder }) => {
  const productItem = await Product.findOne({
    _id: productID
  })
  if (!productItem) {
    return null
  }

  const appDataDirPath = getAppDataPath()
  if (!fs.existsSync(appDataDirPath)) {
    fs.mkdirSync(appDataDirPath)
  }
  if (!fs.existsSync(path.join(appDataDirPath, "excel"))) {
    fs.mkdirSync(path.join(appDataDirPath, "excel"))
  }
  if (!fs.existsSync(path.join(appDataDirPath, "excel", folder))) {
    fs.mkdirSync(path.join(appDataDirPath, "excel", folder))
  }
  if (!fs.existsSync(path.join(appDataDirPath, "excel", folder, "images"))) {
    fs.mkdirSync(path.join(appDataDirPath, "excel", folder, "images"))
  }

  const { _id, basic, product, options, coupang } = productItem

  let i = 0
  let mainImageFile = ""
  let otherImageFile = ""
  console.log("폴더 -- ", path.join(appDataDirPath, folder))
  for (let item of product.mainImages) {
    try {
      const downoptions = {
        url: item,
        dest: path.join(appDataDirPath, "excel", folder, "images")
      }
      const { filename } = await download.image(downoptions)
      if (i === 0) {
        mainImageFile = filename.replace(
          path.join(appDataDirPath, "excel", folder, "images") + "/",
          ""
        )
      } else {
        if (otherImageFile.length === 0) {
          otherImageFile += filename.replace(
            path.join(appDataDirPath, "excel", folder, "images") + "/",
            ""
          )
        } else {
          otherImageFile += `,${filename.replace(
            path.join(appDataDirPath, "excel", folder, "images") + "/",
            ""
          )}`
        }
      }
      i++
    } catch (e) {
      console.log("down", e.message)
    }
  }

  const htmlContent = `${product.topHtml}${product.optionHtml}${product.html}${product.bottomHtml}`
  let price = 0
  let stock = 0
  if (options.filter(item => item.active && !item.disabled && item.base).length === 0) {
    price = options.filter(item => item.active && !item.disabled)[0].salePrice
    stock = options.filter(item => item.active && !item.disabled)[0].stock
  } else {
    price = options.filter(item => item.active && !item.disabled && item.base)[0].salePrice
    stock = options.filter(item => item.active && !item.disabled && item.base)[0].stock
  }
  let optionName = ""
  let optionPrice = ""
  let optionStock = ""
  options
    .filter(item => item.active && !item.disabled)
    .map(item => {
      if (optionName.length === 0) {
        optionName += item.korValue
        optionPrice += price - item.salePrice
        optionStock += item.stock
      } else {
        optionName += `,${item.korValue}`
        optionPrice += `,${price - item.salePrice}`
        optionStock += `,${item.stock}`
      }
    })
  const obj = {
    상품상태: "신상품",
    카테고리ID: basic.naverCategoryCode,
    상품명: product.korTitle,
    판매가: price,
    재고수량: stock,
    "A/S 안내내용": coupang.afterServiceInformation,
    "A/S 전화번호": coupang.afterServiceContactNumber,
    "대표 이미지 파일명": mainImageFile,
    "추가 이미지 파일명": otherImageFile,
    "상품 상세정보": htmlContent,
    "판매자 상품코드": basic.good_id,
    "판매자 바코드": _id,
    제조사: basic.manufacture,
    브랜드: basic.brand,
    제조일자: "",
    유효일자: "",
    부가세: "과세상품",
    "미성년자 구매": "Y",
    "구매평 노출여부": "Y",
    "원산지 코드": "0200037",
    수입사: "자체공급",
    "복수원산지 여부": "N",
    배송방법: "택배",
    "배송비 유형": product.deliveryChargeType === "FREE" ? "무료" : "유료",
    기본배송비: product.deliveryChargeType === "FREE" ? "0" : product.deliveryCharge,
    "배송비 결제방식": "선결제",
    "조건부무료-상품판매가합계": "",
    "수량별부과-수량": "",
    반품배송비: product.deliveryChargeOnReturn,
    교환배송비: product.deliveryChargeOnReturn * 2,
    "지역별 차등배송비 정보": "",
    별도설치비: "N",
    "판매자 특이사항": "",
    "즉시할인 값": "",
    "즉시할인 단위": "",
    "복수구매할인 조건 값": "",
    "복수구매할인 조건 단위": "",
    "복수구매할인 값": "",
    "복수구매할인 단위": "",
    "상품구매시 포인트 지급 값": "",
    "상품구매시 포인트 지급 단위": "",
    "텍스트리뷰 작성시 지급 포인트": "",
    "포토/동영상 리뷰 작성시 지급 포인트": "",
    "한달사용 텍스트리뷰 작성시 지급 포인트": "",
    "한달사용 포토/동영상리뷰 작성시 지급 포인트": "",
    "톡톡친구/스토어찜고객 리뷰 작성시 지급 포인트": "",
    "무이자 할부 개월	사은품": "",
    옵션형태: "단독형",
    옵션명: "종류",
    옵션값: optionName,
    옵션가: optionPrice,
    "옵션 재고수량": optionStock,
    추가상품명: "",
    추가상품값: "",
    추가상품가: "",
    "추가상품 재고수량": "",
    "상품정보제공고시 품명": "",
    "상품정보제공고시 모델명": "",
    "상품정보제공고시 인증허가사항": "",
    "상품정보제공고시 제조자": "",
    "스토어찜회원 전용여부": "N",
    "문화비 소득공제": "",
    ISBN: "",
    독립출판: ""
  }
  return obj
}
