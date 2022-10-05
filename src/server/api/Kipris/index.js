const axios = require("axios")
const convert = require("xml-js")
const Brand = require("../../models/Brand")

exports.TrademarkGeneralSearchService = async ({ search }) => {


  const key = "5Ww4mt2IpPejQOBfQxIWjcHtWlZ2kpMtDXReBxPCdFo="
    try {
      
      const resonse = await axios({
        url: `http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getWordSearch?searchString=${encodeURI(search)}&searchRecentYear=0&ServiceKey=${key}`,
        method: "GET",
        responseType: "arraybuffer"
      })
      
      const result1 = JSON.parse(convert.xml2json(resonse.data.toString(), {compact: true, spaces: 4}));
      
      const titleMatch = (title, search) => {
        return title && title.split(" ").filter(item => item === search).length > 0 ? true : false
      }
      if(result1.response && result1.response.body && result1.response.body.items && Array.isArray(result1.response.body.items.item)){
        const items = result1.response.body.items.item.filter(item => {
          
          if((item.applicationStatus._text === "등록" || item.applicationStatus._text === "출원") && titleMatch(item.title._text, search)
          
          ){
            // console.log("item", item)
            return true
          }
          return false
        })
        if(items.length > 0){
          // await Brand.findOneAndUpdate(
          //   {
          //     kipris: search
          //   },
          //   {
          //     $set: {
          //       kipris: search
          //     }
          //   },
          //   { upsert: true, new: true }
          // )
          return {
            search,
            title: items[0].title._text,
            result: true,
            message: null
          }
        }
      }
      if(result1.response.header.resultMsg._text !== 'Limited Number Of Service Request Exceeds Error.'){
        // await Brand.deleteOne({
        //   kipris: search
        // })
      }
      return {
        search,
        result: false,
        meesage: result1.response.header.resultMsg
      }
    } catch (e) {
      console.log("kipris", e)
      return {
        search,
        result: false,
        message: e
      }
    }
    
  // if(brand){
  //   return {
  //     search,
  //     result: true,
  //     message: "DB"
  //   }
  // } else {
    
  // }
  
  
}