const axios = require("axios")
const startBrowser = require("./startBrowser")
const request = require("request-promise-native")
const cheerio = require("cheerio")

const start = async ({ title }) => {
  if (!title) {
    return title
  }
  const browser = await startBrowser()
  const page = await browser.newPage()
  try {
    const titleArr = title.split(" ")
    let isSearch = null
    while (!isSearch) {
      titleArr.splice(titleArr.length - 1, 1)
      const keyword = titleArr.join(" ")
    
      isSearch = await searchLotteOn({ page, keyword })
      
      if (isSearch) {
        // const sitmNo = isSearch.split("sitmNo=")[1].split("&")[0]
        return await searchDetail({ sitmNo: isSearch })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchWemakeKeyword", e.message)
  } finally {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

const searchLotteOn = async ({ page, keyword }) => {
  try {
    // console.log("keyword", keyword)

    await page.goto(`https://www.lotteon.com/search/search/search.ecn?render=search&platform=pc&q=${encodeURI(keyword)}&mallId=1`)

    const productList = await page.$$eval(".srchProductList > li", element => {
      return element.map(ele => {
        return ele.querySelector(".srchGridProductUnit").getAttribute("data-ga-data")
    
      })
    })
    // console.log("productList", productList)
    let productArray = []
    for(const item of productList){
        const temp = JSON.parse(item.replace(/\'/g, `"`))
        // console.log("temp--", temp)
        if(temp.sfco_pd_lwst_mrgn_rt === "2"){
          productArray.push(temp.sitm_no)
        }
    }
    return productArray.length > 0 ? productArray[0] : null
    
  } catch (e) {
    console.log("searchLotteOn", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({ sitmNo }) => {
  try {
    console.log("sitmNo", sitmNo)
    const url = `https://pbf.lotteon.com/product/v2/detail/search/base/sitm/${sitmNo}?sitmNo=${sitmNo}&mall_no=1&isNotContainOptMapping=true`
    const content = await axios.get(
      url,
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
          referer: `https://www.lotteon.com/`,
        },
      }
    )
    const jsObj = content.data

    return {
      category1Name: jsObj.data.dispCategoryInfo.dispCatNm1.replace("/잡화", ""),
      category2Name: jsObj.data.dispCategoryInfo.dispCatNm2,
      category3Name: jsObj.data.dispCategoryInfo.dispCatNm3 ? jsObj.data.dispCategoryInfo.dispCatNm3 : null,
      category4Name: jsObj.data.dispCategoryInfo.dispCatNm4 ? jsObj.data.dispCategoryInfo.dispCatNm4 : null
    }

  } catch (e) {
    console.log("searchDetail - LotteOn", e)
  }
}
module.exports = start
