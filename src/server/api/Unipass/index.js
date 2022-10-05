const axios = require("axios")
const convert = require("xml-js")

exports.customs = async ({persEcm, pltxNm = [], cralTelno}) => {
  if(!persEcm || persEcm.length === 0) {
    
    return null
  }

  try {
    let returnValue = null
    const key = "m240n231w043f310c060d000o0"
    for(const name of pltxNm){
      const response = await axios({
        url: `https://unipass.customs.go.kr:38010/ext/rest/persEcmQry/retrievePersEcm?crkyCn=${key}&persEcm=${persEcm}&pltxNm=${encodeURI(name)}&cralTelno=${cralTelno.replace(/-/gi, "")}`,
        method: "GET",
        responseType: "arraybuffer"
      })


      const result1 = JSON.parse(convert.xml2json(response.data.toString(), {compact: true, spaces: 4}));
     
      if(result1 && result1.persEcmQryRtnVo && result1.persEcmQryRtnVo.tCnt._text === "1"){
        returnValue = {
          name,
          persEcm
        }
        
        return returnValue
      }
    }
    
    return returnValue
  } catch (e) {
    console.log("eee====,",e )
    return null
  }
}