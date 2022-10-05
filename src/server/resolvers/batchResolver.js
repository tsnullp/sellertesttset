const startBrowser = require("../puppeteer/startBrowser")
const getTaobaoItem = require("../puppeteer/getTaobaoItemNew")
const { updateCoupang, updateCafe24 } = require("./marketAPIResolver")
const moment = require("moment")

const resolvers = {
  Query: {
    
  },
  Mutation: {
    BatchTaobaoItem: async ( parent, {input}, {req, model: {Product, Basic}, logger}) => {
      
      try {


        const exchange = input[0].exchange
        const shippingFee = input[0].shippingFee
        const fees = input[0].fees
        const discount = input[0].discount
        const profit = input[0].profit

        const costAccounting = (fee, sale = false, original = false) => {
          // 1. '타오바바' 결제수수료 3% 추가
          let cost = fee * 1.03
          // 2. '카드사별 브랜드 수수료' 1% 추가 ( ex . 마스터카드 )
          cost = cost * 1.01
          // 3. '전신환매도율' 적용 하여  기준환율  x1% ( 대략 ) 적용
          let exRate = exchange * 1.01
          // 4. 최종금액에 '카드사 해외이용 수수료 0.25% ' 추가
          cost = cost * exRate * 1.025
        
          if (original) {
            return Math.ceil((cost + shippingFee) * 0.1) * 10
          }
          if (sale) {
            return (
              Math.ceil(
                (cost + shippingFee) * ((Number(profit) - Number(discount) + Number(fees)) / 100 + 1) * 0.1
              ) * 10
            )
          } else {
            return Math.ceil((cost + shippingFee) * ((Number(profit) + Number(fees)) / 100 + 1) * 0.1) * 10
          }
        }

        

        const basicItem = await Basic.findOne({
          userID: req.user.adminUser
        })

        setTimeout(async () => {
          const browser = await startBrowser()
          const page = await browser.newPage()
          try{
            for(const item of input){
              try {
                const detailItem = await getTaobaoItem({ page, url: item.detailUrl, userID: req.user.adminUser })
                
                detailItem.url = item.detailUrl

                let options = detailItem.options
                .filter(item => item.image)
                .map((item, index) => {
                  return {
                    key: item.key,
                    korValue: item.korValue,
                    image: item.image,
                    price: item.price,
                    productPrice: costAccounting(item.price, false),
                    salePrice: costAccounting(item.price, true),
                    stock: item.stock,
                    disabled: item.disabled,
                    active: item.active,
                    base: index === 0,
                  }
                })

                let duplication = false
                let optionValueArray = []
                for (const item of options) {
                  
                  if(optionValueArray.includes(item.korValue)){
                    duplication = true
                  }
                  optionValueArray.push(item.korValue)
                  
                  if(item.korValue.length > 25){
                    duplication = true
                  }

                  
                }
              
                if(duplication){
                  options = options.map((item, index) => {
                    return {
                      ...item,
                      korKey: `${getAlphabet(index)}타입`
                    }                  
                  })
                  
                }
                
                let optionHtml = ``
                for(const item of detailItem.options.filter((i, index) => index < 100)){
                  if (item.active && item.image) {
                    optionHtml += `
                <p style="text-align: center;" >
                <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
                ${item.korKey ? `${item.korKey}: ${item.korValue}` : item.korValue}
                </div>
                <img src="${item.image}_800x800.jpg" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
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
                
                
      
                if(options.length === 0){
                  continue
                }
                const product = {
                  good_id: detailItem.good_id,
                  korTitle: item.korTitle,
                  mainImages: detailItem.mainImages,
                  price: options[0].productPrice,
                  salePrice: options[0].salePrice,
                  topHtml:  detailItem.topImage,
                  isClothes: input.isClothes,
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
                // const cafe24 = {
                //   mallID: detailItem.cafe24_mallID,
                //   shop_no: detailItem.cafe24_shop_no
                // }
      
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
                      isBatch: true
                    }
                  },
                  {
                    upsert: true,
                    new: true
                  }
                )
      
                try {
                  const coupangResponse = await updateCoupang({
                    id: productItem._id,
                    product,
                    options,
                    coupang,
                    userID: req.user.adminUser,
                    writerID: req.user.adminUser
                  })
        
                  console.log("coupangResponse", coupangResponse)
    
                } catch(e){}
      
                
                // try {
                //   const cafe24Resnse = await updateCafe24({
                //     id: productItem._id,
                //     product,
                //     options,
                //     cafe24,
                //     userID: req.user.adminUser,
                //     writerID: req.user.adminUser
                //   })
        
                //   console.log("cafe24Resnse", cafe24Resnse)
                // } catch(e){}
                
              } catch(e){
                console.log("batch--", e)
              }
              
            }
          }finally {
            await browser.close()
          }
        }, 2000)

        
        return true
      } catch (e) {
        logger.error(`BatchTaobaoItem: ${e}`)
        return false
      }
    }
  }
}

module.exports = resolvers

const getAlphabet = index => {
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
    "Z"
  ]
  const letter = alphabet[index % 25]
  let number = ""
  if (Math.floor(index / 25) > 0) {
    number = Math.floor(index / 25)
  }
  return `${letter}${number}`
}