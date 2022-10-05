
const axios = require("axios")
const request = require("request-promise-native")
const cheerio = require("cheerio")

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

      isSearch = await searchInterPark({ keyword })
      if (isSearch) {
        return await searchDetail({ url: isSearch })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchNaverKeyword", e.message)
  } finally {
    
  }
}

const searchInterPark = async ({ keyword }) => {
  try {
    
    const content = await request({
      method: "GET",
      url: `http://isearch.interpark.com/isearch?q=${encodeURI(keyword)}`,
    })
    
    const $ = cheerio.load(content)
    const productList = []
     $("#_SHOPListLi").children("li").each((i, element) => {
      productList.push($(element).find("a").attr("href"))
    })

    return productList.length > 0 ? productList[0] : null
  } catch (e) {
    console.log("searchInterPark", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({ url }) => {
  try {
    
    const content = await axios.get(url)
    
    const temp1 = content.data.split("var displayPathInfo = ")[1]
    const temp2 = temp1.split(";")[0]
    const temp3 = `{${temp2.replace("{", "").replace("}", "").trim()}}`.replace(/'/g, "\"")
    .replace("dispNm1", "\"dispNm1\"")
    .replace("dispNm2", "\"dispNm2\"")
    .replace("dispNm3", "\"dispNm3\"")
    .replace("dispNm4", "\"dispNm4\"")
    .replace("\"null\"", "null")
    
    const jsObj = JSON.parse(temp3)

    return {
      category1Name: jsObj.dispNm1,
      category2Name: jsObj.dispNm2,
      category3Name: jsObj.dispNm3,
      category4Name: jsObj.dispNm4
    }
    
  } catch (e) {
    console.log("searchDetail - InterPark", e)
  }
}
module.exports = start
