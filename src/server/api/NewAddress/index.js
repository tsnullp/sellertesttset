const axios = require("axios")

exports.newAddressPostZip = async ({keyword}) => {
  

  try {
    
    const key = "U01TX0FVVEgyMDE3MDQwODA4NTY0ODIwNDQ5"
    const response = await axios({
      url: `https://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${key}&currentPage=1&countPerPage=10&keyword=${encodeURI(keyword)}&resultType=json`,
      method: "GET",
      responseType: "arraybuffer"
    })
    
    return JSON.parse(response.data.toString());
  } catch (e) {
    console.log("eee====,",e )
    return null
  }
}