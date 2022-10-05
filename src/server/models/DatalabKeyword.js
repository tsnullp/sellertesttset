const mongoose = require("mongoose")

const DatalabKeyword = mongoose.Schema({
  keyword: String,
  isBrand: Boolean,
  nluTerms: [
    {
      keyword: String,
      keywordType: String,
    },
  ],
  category1Name: String,
  category2Name: String,
  category3Name: String,
  category4Name: String,
  category1Code: String,
  category2Code: String,
  category3Code: String,
  category4Code: String,
  totalCount: Number,
  overSeaCount: Number,
  overSeaRate: Number,
  monthlyPcQcCnt: Number,
  monthlyMobileQcCnt: Number,
  monthlyTotalCnt: Number,
  competitionIntensity: Number,
  overSeaCompetitionIntensity: Number,
  overSeaProduct: Number, // 1페이지 해외상품수
  singleProduct: Number, // 1페이지 단일상점
  notSalesProduct: Number, // 1페이지 네이버 쇼핑중 판매량 없는 건수
  overSeaCountRate: Number, // 1페이지 해외상품 비율
  singleProductRate: Number, // 1페이지 단일상품 비율
  notSalesProductRate: Number, // 1페이지 판매 안된 상품 비율
  overSeaNotSalesProduct: Number, // 해외직구 탭 1페이지 판매 안된 상품
  overSeaSingleProductRate: Number, // 1페이지 단일상품 비율
  overSeaNotSaleProductRate: Number, // 해외직구 탭 1페이지 판매 안된 상품 비율
  products: [mongoose.Schema.Types.ObjectId],
  productCount: Number,
  purchaseCnt: Number,
  recentSaleCount: Number,

  kewwordType: {
    default: 1,
    type: Number, // 1. 데이터랩, 2. 팔린상품, 3. 팔린 키워드
  },
})

module.exports = mongoose.model("DatalabKeyword", DatalabKeyword)
