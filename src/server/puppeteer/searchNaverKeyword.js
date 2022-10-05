const axios = require("axios")
const _ = require("lodash")
const {sleep} = require("../../lib/usrFunc")

const start = async ({ title, endSearch = true, mall = "" }) => {
  if (!title) {
    return title
  }

  try {
    const titleArr = title.replace("섹시한", "").replace("19금", "").split(" ")
    if (endSearch) {
      let i = 0
      let isSearch = null
      while (!isSearch) {
        await sleep(500)
        if(i !== 0){
          titleArr.splice(titleArr.length - 1, 1)
        }
        
        const keyword = titleArr.join(" ")

        isSearch = await searchNaver({ keyword, mall })
        if (isSearch) {
          return isSearch
        }

        if (keyword.length === 0) {
          isSearch = true
        }
        i++
      }
      return null
    } else {
      return await searchNaver({ keyword: titleArr.join(" "), mall })
    }
  } catch (e) {
    console.log("searchNaverKeyword", e.message)
  } finally {
  }
}

const searchNaver = async ({ keyword, mall }) => {
  try {
    const content = await axios.get(
      `https://search.shopping.naver.com/api/search/all?query=${encodeURI(
        keyword
      )}&cat_id=&frm=NVSHATC&mall=${mall}`,
      {
        headers: {
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
      }
    )

    const jsObj = content.data

    const catId = jsObj.cmpResult.catId

    const list = jsObj.shoppingResult.products

    let findObj = _.find(list, { category4Id: catId })

    if (!findObj) {
      findObj = _.find(list, { category3Id: catId })
    }

    if (findObj) {
      switch (mall) {
        case "24": // 지마켓
          return await searchGmarketDetail({ url: findObj.mallProductUrl })
        case "114": // 옥션
          return await searchAuctionDetail({ url: findObj.mallProductUrl })
        case "3": // 인터파크
          return await searchInterParkDetail({ url: findObj.mallProductUrl })
        case "197023": // 위메프
          return await searchWemakeDetail({ url: findObj.mallProductUrl })
        case "221844": // 티몬
          return await searchTmonDetail({ url: findObj.mallProductUrl })
        case "17703": // 11 번가
          return await search11stDetail({ url: findObj.mallProductUrl })
        default:
          break
      }
      return {
        category1Name: findObj.category1Name,
        category2Name: findObj.category2Name,
        category3Name: findObj.category3Name,
        category4Name: findObj.category4Name,
        category1Code: findObj.category1Id,
        category2Code: findObj.category2Id,
        category3Code: findObj.category3Id,
        category4Code: findObj.category4Id,
      }
    } else {
      return null
    }
  } catch (e) {
    // console.log("==============", keyword)
    // console.log("searchNaver", e)
    return false
  } finally {
  }
}

module.exports = start

const searchGmarketDetail = async ({ url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `http://item.gmarket.co.kr/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }
    console.log("searchGmarketDetail contentData", contentData)
    const temp1 = contentData.split("var goods = ")[1]
    const temp2 = temp1.split(";")[0]

    const jsObj = JSON.parse(temp2)

    return {
      category1Name: jsObj && jsObj.GdlcName ? jsObj.GdlcName : null,
      category2Name: jsObj && jsObj.GdmcName ? jsObj.GdmcName : null,
      category3Name: jsObj && jsObj.GdscName ? jsObj.GdscName : null,
      category4Name: null,
    }
  } catch (e) {
    console.log("searchDetail - Gmarket", e)
  }
}

const searchAuctionDetail = async ({ url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `http://corners.auction.co.kr/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }

    const temp1 = contentData.split(`<meta name="description" content="`)[1]
    const temp2 = temp1.split(`">`)[0]
    const temp3 = temp2.split("&gt;")
    if (temp3 && temp3[0] && temp3[0].includes(". ")) {
      temp3[0] = temp3[0].split(". ")[1]
    }
    if (temp3 && temp3[0] && temp3[0].includes(": ")) {
      temp3[0] = temp3[0].split(": ")[1]
    }
    if (temp3 && temp3[0] && temp3[0].includes("VIP 이상")) {
      temp3[0] = null
    }
    if (temp3 && temp3[0] && temp3[0].includes("할인")) {
      temp3[0] = null
    }

    return {
      category1Name: temp3 && temp3[0] ? temp3[0] : null,
      category2Name: temp3 && temp3[1] ? temp3[1] : null,
      category3Name: temp3 && temp3[2] ? temp3[2] : null,
      category4Name: null,
    }
  } catch (e) {
    console.log("searchDetail Auction", e)
  }
}

const searchInterParkDetail = async ({ url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `https://shopping.interpark.com/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }
    console.log("searchInterParkDetail contentData", contentData)
    const temp1 = contentData.split("var displayPathInfo = ")[1]
    const temp2 = temp1.split(";")[0]
    const temp3 = `{${temp2.replace("{", "").replace("}", "").trim()}}`
      .replace(/'/g, '"')
      .replace("dispNm1", '"dispNm1"')
      .replace("dispNm2", '"dispNm2"')
      .replace("dispNm3", '"dispNm3"')
      .replace("dispNm4", '"dispNm4"')
      .replace('"null"', "null")

    const jsObj = JSON.parse(temp3)

    return {
      category1Name: jsObj.dispNm1,
      category2Name: jsObj.dispNm2,
      category3Name: jsObj.dispNm3,
      category4Name: jsObj.dispNm4,
    }
  } catch (e) {
    console.log("searchDetail - InterPark", e)
  }
}

const searchWemakeDetail = async ({ url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `https://front.wemakeprice.com/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }

    const sDepth1Title = contentData.split(`"lcateNm":"`)[1].split(`",`)[0]
    const sDepth2Title = contentData.split(`"mcateNm":"`)[1].split(`",`)[0]
    const sDepth3Title = contentData.split(`"scateNm":"`)[1].split(`",`)[0]
    const sDepth4Title = contentData.split(`"dcateNm":"`)[1].split(`",`)[0]

    return {
      category1Name: sDepth1Title,
      category2Name: sDepth2Title,
      category3Name: sDepth3Title,
      category4Name: sDepth4Title,
    }
  } catch (e) {
    console.log("searchDetail - Wemake", e)
  }
}

const searchTmonDetail = async ({ page, url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `https://www.tmon.co.kr/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }

    const sDepth1Title = contentData.split("sDepth1Title : '")[1].split("',")[0]
    const sDepth2Title = contentData.split("sDepth2Title : '")[1].split("',")[0]
    const sDepth3Title = contentData.split("sDepth3Title : '")[1].split("',")[0]
    const sDepth4Title = contentData.split("sDepth4Title : '")[1].split("',")[0]

    return {
      category1Name: sDepth1Title,
      category2Name: sDepth2Title,
      category3Name: sDepth3Title,
      category4Name: sDepth4Title,
    }
  } catch (e) {
    console.log("searchDetail - Tmon", e)
  }
}

const search11stDetail = async ({ url }) => {
  try {
    let content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })
    let contentData = content.data.toString()
    if (contentData.includes("location.href=")) {
      let tmonUlr = `https://www.11st.co.kr/${
        contentData.split("location.href='")[1].split("';</script>")[0]
      }`

      content = await axios.request({
        method: "GET",
        url: tmonUlr,
        responseType: "arraybuffer",
        responseEncoding: "binary",
      })
      contentData = content.data.toString()
    }

    const temp1 = contentData.split(`var categoryInfo = `)[1]
    const temp2 = temp1.split(`;`)[0]
    const temp3 = JSON.parse(temp2)

    return {
      category1Name: temp3 && temp3.cat2 ? temp3.cat2 : null,
      category2Name: temp3 && temp3.cat3 ? temp3.cat3 : null,
      category3Name: temp3 && temp3.cat4 ? temp3.cat4 : null,
      category4Name: null,
    }
  } catch (e) {
    console.log("searchDetail Auction", e)
  }
}
