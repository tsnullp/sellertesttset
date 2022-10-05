const axios = require("axios")
const { sleep } = require("../../lib/usrFunc")
const start = async ({ title }) => {
  if (!title) {
    return title
  }

  try {
    const titleArr = title.split(" ")
    let isSearch = null
    while (!isSearch) {
      titleArr.splice(titleArr.length - 1, 1)
      const keyword = titleArr.join(" ")

      isSearch = await searchTmon({ keyword })

      if (isSearch) {
        return await searchDetail({ url: isSearch })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchTmonKeyword", e.message)
  } finally {
  }
}

const searchTmon = async ({ keyword }) => {
  try {
    await sleep(3000)
    const content = await axios.request({
      method: "GET",
      url: `http://search.tmon.co.kr/api/search/v4/deals?keyword=${encodeURI(
        keyword
      )}&mainDealOnly=true&optionDealOnly=false&page=1&showFilter=true&size=60&sortType=POPULAR&thr=hs&useTypoCorrection=true`,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })

    const jsObj = JSON.parse(content.data.toString())

    return jsObj.data.searchDeals[0].extraDealInfo.detailUrl
  } catch (e) {
    console.log("searchTmon", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({ page, url }) => {
  try {
    const content = await axios.request({
      method: "GET",
      url,
      responseType: "arraybuffer",
      responseEncoding: "binary",
    })

    const contentData = content.data.toString()
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
module.exports = start
