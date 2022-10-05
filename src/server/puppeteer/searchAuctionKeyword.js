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

      isSearch = await searchAuction({ keyword })
      if (isSearch) {
        const itemNo = isSearch.split("itemNo=")[1].split("&keyword=")[0]
        return await searchDetail({ url: `http://itempage3.auction.co.kr/DetailView.aspx?itemno=${itemNo}`  })
      }

      if (keyword.length === 0) {
        isSearch = true
      }
    }
    return null
  } catch (e) {
    console.log("searchAuctionKeyword", e.message)
  } finally {
  
  }
}

const searchAuction = async ({ keyword }) => {
  try {

    const content = await axios.get(`http://browse.auction.co.kr/search?keyword=${encodeURI(keyword)}`)
    
    const $ = cheerio.load(content.data)
    
    const productList = []
    
     $("#section--inner_content_body_container > div > .component.component--item_card.type--general > .itemcard")
      .each((i, element) => { 
    
        productList.push($(element).find(".link--itemcard  ").attr("href"))
    })
    
    
    return productList.length > 0 ? productList[0] : null

    
  } catch (e) {
    console.log("searchAuction", e.message)
    return false
  } finally {
  }
}

const searchDetail = async ({ url }) => {
  try {
    
    const content = await axios.request({
      method: "GET",
      url, 
      responseType: 'arraybuffer',
      responseEncoding: 'binary'
    })
   
    const temp1 = content.data.toString().split(`<meta name="description" content="`)[1]
    const temp2 = temp1.split(`">`)[0]
    const temp3 = temp2.split("&gt;")
    if(temp3 && temp3[0] && temp3[0].includes(". ")){
      temp3[0] = temp3[0].split(". ")[1]
    }
    if(temp3 && temp3[0] && temp3[0].includes(": ")){
      temp3[0] = temp3[0].split(": ")[1]
    }
    if(temp3 && temp3[0] && temp3[0].includes("VIP 이상")){
      temp3[0] = null
    }
    if(temp3 && temp3[0] && temp3[0].includes("할인")){
      temp3[0] = null
    }
    
    return {
      category1Name: temp3 && temp3[0] ? temp3[0] : null,
      category2Name: temp3 && temp3[1] ? temp3[1] : null,
      category3Name: temp3 && temp3[2] ? temp3[2] : null,
      category4Name: null
    }
    
  } catch (e) {
    console.log("searchDetail Auction", e)
  }
}
module.exports = start
