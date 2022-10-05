const axios = require("axios")
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

      isSearch = await searchGmarket({ keyword })

      if (isSearch) {
        return await searchDetail({ url: isSearch })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchGmarketKeyword", e.message)
  } finally {
  }
}

const searchGmarket = async ({ keyword }) => {
  try {
    const content = await axios.get(
      `https://browse.gmarket.co.kr/search?keyword=${encodeURI(keyword)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36",
        },
      }
    )

    const $ = cheerio.load(content.data.toString())

    const productList = []

    $(
      "#section__inner-content-body-container > div:nth-child(2) > .box__component.box__component-itemcard"
    ).each((i, element) => {
      productList.push($(element).find(".link__item").attr("href"))
    })

    return productList.length > 0 ? productList[0].replace("mitem", "item") : null
  } catch (e) {
    console.log("searchGmarket", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({ url }) => {
  try {
    const content = await axios.get(url)

    const temp1 = content.data.split("var goods = ")[1]
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
module.exports = start
