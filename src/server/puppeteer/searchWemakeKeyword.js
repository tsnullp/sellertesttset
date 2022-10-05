const axios = require("axios")

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
    
      isSearch = await searchWemake({ keyword })
      
      if (isSearch) {
        return await searchDetail({ url: `https://front.wemakeprice.com/product/${isSearch}?` })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchWemakeKeyword", e.message)
  } finally {
    
  }
}

const searchWemake = async ({ keyword }) => {
  try {
    
    const content = await axios.request({
      method: "GET",
      url: `https://search.wemakeprice.com/api/wmpsearch/api/v3.0/wmp-search/search.json?searchType=DEFAULT&search_cate=top&keyword=${encodeURI(keyword)}&isRec=1&_service=5&_type=3`,
      responseType: 'arraybuffer',
      responseEncoding: 'binary'
    })

    const jsObj = JSON.parse(content.data.toString())
    
    return jsObj.data.deals[0] ? jsObj.data.deals[0].link.value : null
    
  } catch (e) {
    console.log("searchWemake", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({  url }) => {
  try {

    const content = await axios.request({
      method: "GET",
      url, 
      responseType: 'arraybuffer',
      responseEncoding: 'binary'
    })

    const contentData = content.data.toString()
    const sDepth1Title = contentData.split(`"lcateNm":"`)[1].split(`",`)[0]
    const sDepth2Title = contentData.split(`"mcateNm":"`)[1].split(`",`)[0]
    const sDepth3Title = contentData.split(`"scateNm":"`)[1].split(`",`)[0]
    const sDepth4Title = contentData.split(`"dcateNm":"`)[1].split(`",`)[0]

    return {
      category1Name: sDepth1Title,
      category2Name: sDepth2Title,
      category3Name: sDepth3Title,
      category4Name: sDepth4Title
    }

  } catch (e) {
    console.log("searchDetail - Wemake", e)
  }
}
module.exports = start
