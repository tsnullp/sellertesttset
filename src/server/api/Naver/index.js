const axios = require("axios")
const CryptoJS = require("crypto-js")
const _ = require("lodash")

exports.NaverTitleQualityCheck = async ({ title, category1, category2, category3, category4 }) => {
  try {
    const response = await axios({
      url: `https://sell.smartstore.naver.com/api/product/shared/product-search-quality-check?_action=productSearchQualityCheck&category1Id=${category1}&category2Id=${category2}&category3Id=${category3}&category4Id=${category4}&prodNm=${encodeURIComponent(
        title
      )}`,
      method: "GET",
      headers: {
        // 'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        // 'Accept': '*/*',
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        referer: `https://sell.smartstore.naver.com/`,
        Cookie: `NNB=TBVBMDWO2HDF6; NV_WETR_LOCATION_RGN_M="MDIxMzUxMDU="; NRTK=ag#all_gr#4_ma#-2_si#-1_en#-2_sp#0; lastDeliveryMethod=DELIVERY; lastDeliveryCompanyCode=CJGLS; ASID=79a99f27000001763e3d75b30000004d; NDARK=N; NV_WETR_LAST_ACCESS_RGN_M="MDIxMzUxMDU="; MM_NEW=1; NFS=2; _ga_N90K8EJMQ3=GS1.1.1638332250.2.0.1638332250.0; nx_ssl=2; BMR=s=1638928771366&r=https%3A%2F%2Fm.blog.naver.com%2FPostView.naver%3FisHttpsRedirect%3Dtrue%26blogId%3Dspson0153%26logNo%3D221590065734&r2=https%3A%2F%2Fwww.google.com%2F; site_preference=NORMAL; _ga=GA1.2.574648830.1606969859; page_uid=hkD/zwprvhGssC6ncr4ssssstEZ-494554; nid_inf=107955612; NID_AUT=F07hB+JNTvsXIYsZxxrMXWrhfX1v29b4w1MKCr0qTTAOLMj0d7fZcEW0GjBbVgCy; NID_JKL=HcJi+Ojd1fHJ0oU5mMhSpRWMO7DjtW3eyn66JsWhBas=; NSI=TS004LoJX9OiZmUgOEcxbBVoJ7KRQ3btaShITwE5; NID_SES=AAABnX+sjcOHOEL7tVjCk6QKtvhrFUajfpf3zWN485GQ1+WFwsVkADXBKQ032zZxJ+978Xp18qidQ4ld/tMFrXJNaSt3nnVcJabuPSCboIHVDVrmKxGEphtps47Eeh3xt8ToVVVA4no4ghNaeP8fMwL16jYFqH6ymX+90AHF/5gMMVJGVkbH+JlzckjqMGlK88fZMCATOwy6Lv+D+330U9hUD/LGDU6NsW2a1yKSR1/AHAm963ahsHOwbotlWmiGzi1qfZadGNX2rOXXRz36xzDMmsrUhOqaZI/TGOrUqz2YxkKkrd/g1a0WKvyd+jJtvJkW+gYgblEtMuUbai7PSAhp19vY1Iym11VX2EpU99/pegWX2nkdcxxUUXa9Nefevo44w6EGkTrZo75HG7f9v31/9/Fp0CFega2S1jVdmhTVzQk3FmpRPi2DSIwI2imR7ePF80s8AE2NVr06D4uPYK8ETy/n+8DqHSVsrBhYNp0df4xJG4k2ai+1IjEpPqMZHe39nK8rMg2Chs8Yr3X9ppXu2ExvZF8SlJ8H65GDybPIr72Z; _ga_7VKFYR6RV1=GS1.1.1639557109.983.1.1639557114.55`,
      },
      responseType: "arraybuffer",
    })
    return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("CoupangStoreProductList", e)
    return null
  }
}

exports.ShippingData = async ({ category, startDate, endDate, page = 1 }) => {
  try {
    const response = await axios({
      url: `https://datalab.naver.com/shoppingInsight/getCategoryKeywordRank.naver`,
      method: "POST",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Accept': '*/*',
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        Expires: "0",
        referer: `https://datalab.naver.com/shoppingInsight/sCategory.naver`,
      },
      responseType: "arraybuffer",
      params: {
        cid: category,
        startDate,
        endDate,
        page,
      },
    })
    return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("ShippingData", e)
    return null
  }
}

exports.NaverKeywordInfo = async ({ keyword }) => {
  try {
    // const mallResponse = await axios({
    //   url: `https://search.shopping.naver.com/api/filter/mall?query=${encodeURI(
    //     keyword
    //   )}&mallFilterSection=OVERSEAS&isQuerySearch=true&isDisplayCategory=false`,

    //   method: "GET",
    //   headers: {
    //     "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    //     // 'Accept': '*/*',
    //     "User-Agent":
    //       "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
    //     "sec-fetch-site": "same-origin",
    //     "sec-fetch-mode": "cors",
    //     "Accept-Encoding": "gzip, deflate, br",
    //     Connection: "keep-alive",
    //     "Cache-Control": "no-cache",
    //     Pragma: "no-cache",
    //     Expires: "0",
    //     referer: `https://search.shopping.naver.com/`,
    //   },
    //   responseType: "arraybuffer",
    // })
    // const mallResult = JSON.parse(mallResponse.data.toString())
    // let mall = ``
    // mallResult.filterValues.forEach((item) => {
    //   mall += `${item.value}+`
    // })

    const response1 = await axios({
      // url: `https://search.shopping.naver.com/_next/data/l89Tmk2pgXIDsjDeSpkjP/search/all.json?query=${encodeURI(keyword)}`,
      // url: `https://search.shopping.naver.com/api/search/all?sort=rel&pagingIndex=1&pagingSize=80&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${encodeURI(
      //   keyword
      // )}&iq=&eq=&xq=&agency=true`,
      // url: `https://search.shopping.naver.com/api/search/all?sort=date&pagingIndex=1&pagingSize=40&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${encodeURI(keyword)}&iq=&eq=&xq=&agency=true&mall=197023+221844+613264+1243359+114+17703+3+24`,
      url: `https://search.shopping.naver.com/api/search/all?sort=review&pagingIndex=1&pagingSize=40&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${encodeURI(keyword)}&iq=&eq=&xq=&agency=true&mall=197023+221844+613264+1243359+114+17703+3+24`,
      
      method: "GET",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Accept': '*/*',
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
      responseType: "arraybuffer",
    })
    // console.log("response1.data.toString(),", response1.data.toString())
    const result1 = JSON.parse(response1.data.toString())
    let products1 = []
    if(result1 && result1.shoppingResult && Array.isArray(result1.shoppingResult.products)){
      for(const item of result1.shoppingResult.products){
        item.productName = item.productName.split("{")[0]
      }
      products1 = _.uniqBy(result1.shoppingResult.products, "productName")
    }
    

    const response2 = await axios({
      // url: `https://search.shopping.naver.com/api/search/all?sort=rel&pagingIndex=1&pagingSize=80&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${encodeURI(
      //   keyword
      // )}&iq=&eq=&xq=&agency=true&mall=197023+221844+613264+1243359+114+17703+3+24`,
      url: `https://search.shopping.naver.com/api/search/all?sort=date&pagingIndex=1&pagingSize=40&viewType=list&productSet=total&deliveryFee=&deliveryTypeValue=&frm=NVSHATC&query=${encodeURI(keyword)}&iq=&eq=&xq=&agency=true&mall=197023+221844+613264+1243359+114+17703+3+24`,
      // ur: `https://search.shopping.naver.com/api/search/all?agency=true&frm=NVSHTTL&mall=24 17703 114 1243359 3 613264 221844 197023&origQuery=${encodeURI(keyword)}&pagingIndex=1&pagingSize=40&productSet=total&query=${encodeURI(keyword)}&sort=date&timestamp=&viewType=list`,
      method: "GET",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Accept': '*/*',
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
      responseType: "arraybuffer",
    })
    const result2 = JSON.parse(response2.data.toString())

    let products2 = []
    if(result2 && result2.shoppingResult && Array.isArray(result2.shoppingResult.products)){
      for(const item of result2.shoppingResult.products){
        item.productName = item.productName.split("{")[0]
      }
      products2 = _.uniqBy(result2.shoppingResult.products, "productName")
    }
    
    const productResult = _.uniqBy([...products1, ...products2], "productName")

    let returnData = []

    for(const item of productResult.filter(fItem => fItem.brand === "")){
      const { category1Id, category2Id, category3Id, category4Id } = item
      let categoryId = ""
      if (category1Id) {
        categoryId = category1Id
      }
      if (category2Id) {
        categoryId = category2Id
      }
      if (category3Id) {
        categoryId = category3Id
      }
      if (category4Id) {
        categoryId = category4Id
      }

      // if(item.mallPcUrl.includes("naver.com")){
      //   console.log("mallPcUrl", item.mallPcUrl)
      // }
      returnData.push({
        type: "list",
        productNo:
          item.mallProductId && item.mallProductId.length > 0 ? item.mallProductId : item.id,
        displayName: item.mallName,
        detailUrl:
          item.mallProductUrl && item.mallProductUrl.length > 0 ? item.mallProductUrl : item.crUrl,
        name: item.productName.split("{")[0].trim(),
        categoryId,
        image: item.imageUrl,
        sellerTags: [],
        reviewCount: item.reviewCount,
        zzim: item.keepCnt || 0,
        purchaseCnt: item.purchaseCnt,
      })
    }

    return returnData
    // return productResult.filter(fItem => fItem.brand === "").map((item) => {
    //   const { category1Id, category2Id, category3Id, category4Id } = item
    //   let categoryId = ""
    //   if (category1Id) {
    //     categoryId = category1Id
    //   }
    //   if (category2Id) {
    //     categoryId = category2Id
    //   }
    //   if (category3Id) {
    //     categoryId = category3Id
    //   }
    //   if (category4Id) {
    //     categoryId = category4Id
    //   }

    //   return {
    //     type: "list",
    //     productNo:
    //       item.mallProductId && item.mallProductId.length > 0 ? item.mallProductId : item.id,
    //     displayName: item.mallName,
    //     detailUrl:
    //       item.mallProductUrl && item.mallProductUrl.length > 0 ? item.mallProductUrl : item.crUrl,
    //     name: item.productName.split("{")[0].trim(),
    //     categoryId,
    //     image: item.imageUrl,
    //     sellerTags: [],
    //     reviewCount: item.reviewCount,
    //     zzim: item.keepCnt || 0,
    //     purchaseCnt: item.purchaseCnt,
    //   }
    // })
    // return JSON.parse(response.data.toString())
  } catch (e) {
    console.log("NaverKeywordInfo", e)
    return null
  }
}

exports.NaverKeywordRel = async ({ keyword }) => {
  try {
    const method = "GET"
    const api_url = "/keywordstool"
    const timestamp = Date.now() + ""
    const accessKey = "01000000006efb6afaca2d8a26090491141ea2a9bf8f580af6f998aa7db6599fb747def271"
    const secretKey = "AQAAAABu+2r6yi2KJgkEkRQeoqm/qjYU5KwW9QuEz2Cgh/jDvQ=="
    const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey)
    hmac.update(timestamp + "." + method + "." + api_url)
    const hash = hmac.finalize()
    hash.toString(CryptoJS.enc.Base64)

    const response = await axios({
      url: `https://api.naver.com/keywordstool?hintKeywords=${encodeURI(
        keyword.replace(/ /gi, "")
      )}&showDetail=1`,
      method,
      headers: {
        "X-Timestamp": timestamp,
        "X-API-KEY": accessKey,
        "X-API-SECRET": secretKey,
        "X-CUSTOMER": "2537298",
        "X-Signature": hash.toString(CryptoJS.enc.Base64),
        // "Content-Type": "text/json;charset=UTF-8",
        // "Content-Length": Buffer.byteLength(strjson, "utf8"),
        // Authorization: authorization,
        // "X-EXTENDED-TIMEOUT": 90000
      },
    })

    return response.data
  } catch (e) {
    // console.log("NaverKeywordRel", e)
    return null
  }
}

exports.NaverCatalog = async ({ catalog, keyword }) => {
  try {
    const response = await axios({
      url: `https://search.shopping.naver.com/api/catalog/${catalog}/products?arrivingTomorrow=false&cardPrice=false&deliveryToday=false&isNPayPlus=false&lowestPrice&nvMid=${catalog}&onlyBeautyWindow=false&page=1&pageSize=20&pr=PC&sort=LOW_PRICE&withFee=true&isManual=false&exposeAreaName=SELLER_BY_PRICE&catalogType=DEFAULT&inflow=slct&query=${encodeURI(
        keyword
      )}`,

      method: "GET",
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        // 'Accept': '*/*',
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
      responseType: "arraybuffer",
    })
    const result = JSON.parse(response.data.toString())
    return result.result.products
  } catch (e) {
    console.log("NaverCatalog", e)
    return null
  }
}
