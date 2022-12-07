const translate = require("translate")
const startBrowser = require("./startBrowser")
const axios = require("axios")
const User = require("../models/User")
const { shuffle } = require("../../lib/usrFunc")

const korTranslate = async (text, userID) => {
  try {
    let rapidapiKey = "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153"

    if(userID) {
      const groupUser = await User.find(
        {
          group: "3"
        }
      )
      const userIDs = groupUser.map(item => item._id.toString())
   
      if(userIDs.includes(userID.toString())) {
        rapidapiKey = "96094e22damsh219d03f44d64534p10e61fjsn90302b426d60"
      }
    }
    
    const options = {
      method: "GET",
      url: "https://nlp-translation.p.rapidapi.com/v1/translate",
      params: { text, to: "ko", from: "zh-CN",
      protected_words: "s;m;l;xl;xxl;xxxl;xxxxl;S;M;L;XL;XXL;XXXL;XXXXL;斤"
    },
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": rapidapiKey,
      },
    }
    let status = 429
    while(status === 429) {
      const response = await axios({
        ...options,
      })
      status = response.data.status
      console.log("response.data", response.data)
      if (response.data && response.data.status === 200) {
        return response.data.translated_text.ko
      }
    }
    

    return text
  } catch (e) {
    console.log("korTranslate2", e.message)
    return text
  }

  try {
    translate.engine = "google"
    translate.key = "AIzaSyBRobv1Hj0jvNvnWgDbzVoylKrqifQo_SA"
    translate.from = "zh"
    translate.to = "ko"
    const korText = await translate(text)

    return korText
  } catch (e) {
    try {
      const options = {
        method: "GET",
        url: "https://nlp-translation.p.rapidapi.com/v1/translate",
        params: { text, to: "ko", from: "zh-CN" },
        headers: {
          "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
          "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
        },
      }
      const response = await axios({
        ...options,
      })

      if (response.data && response.data.status === 200) {
        return response.data.translated_text.ko
      }

      return text
    } catch (e) {
      console.log("korTranslate2", e.message)
      return text
    }
  }
}

const engTranslate = async (text) => {
  try {
    translate.engine = "google"
    translate.key = "AIzaSyBRobv1Hj0jvNvnWgDbzVoylKrqifQo_SA"
    translate.from = "zh"
    translate.to = "en"
    const korText = await translate(text)
    return korText
  } catch (e) {
    try {
      const options = {
        method: "GET",
        url: "https://nlp-translation.p.rapidapi.com/v1/translate",
        params: { text, to: "en", from: "zh-CN" },
        headers: {
          "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
          "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
        },
      }
      const response = await axios({
        ...options,
      })

      if (response.data && response.data.status === 200) {
        return response.data.translated_text.en
      }
      return text
    } catch (e) {
      console.log("korTranslate2", e.message)
      return text
    }
  }
}

const cnTranslate = async (text) => {
  // translate.engine = "google"
  // translate.key = "AIzaSyBRobv1Hj0jvNvnWgDbzVoylKrqifQo_SA"
  // translate.from = "ko"
  // translate.to = "zh"
  // const korText = await translate(text)
  // return korText

  try {
    const options = {
      method: "GET",
      url: "https://nlp-translation.p.rapidapi.com/v1/translate",
      params: { text, to: "zh-CN", from: "ko" },
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
      },
    }
    const response = await axios({
      ...options,
    })

    if (response.data && response.data.status === 200) {
      return response.data.translated_text["zh-CN"]
    }
    return null
  } catch (e) {
    console.log("cnTranslate", e.message)
    return null
  }
}

const kortoEngTranslate = async (text) => {
  try {
    translate.engine = "google"
    translate.key = "AIzaSyBRobv1Hj0jvNvnWgDbzVoylKrqifQo_SA"
    translate.from = "ko"
    translate.to = "en"
    const korText = await translate(text)

    return korText
  } catch (e) {
    try {
      const options = {
        method: "GET",
        url: "https://nlp-translation.p.rapidapi.com/v1/translate",
        params: { text, to: "en", from: "ko" },
        headers: {
          "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
          "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
        },
      }
      const response = await axios({
        ...options,
      })

      if (response.data && response.data.status === 200) {
        return response.data.translated_text.en
      }
      return text
    } catch (e) {
      console.log("ItemDetails", e.message)
      return text
    }
  }
}

const EngtoKorTranslate = async (text) => {
  try {
    const options = {
      method: "GET",
      url: "https://nlp-translation.p.rapidapi.com/v1/translate",
      params: { text, to: "ko" },
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
      },
    }
    const response = await axios({
      ...options,
    })

    if (response.data && response.data.status === 200) {
      return response.data.translated_text.ko
    }
    return text
  } catch (e) {
    console.log("EngtoKorTranslate", e.message)
    return text
  }
}

const JPtoKorTranslate = async (text) => {
  try {
    const options = {
      method: "GET",
      url: "https://nlp-translation.p.rapidapi.com/v1/translate",
      params: { text, to: "ko", from: "ja" },
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": "932f64e27amsh78cdad966b2c2c0p129e12jsn92420146f153",
      },
    }
    const response = await axios({
      ...options,
    })

    if (response.data && response.data.status === 200) {
      return response.data.translated_text.ko
    }
    return text
  } catch (e) {
    console.log("EngtoKorTranslate", e.message)
    return text
  }
}

const googleTranslate = async (text) => {
  const browser = await startBrowser()
  try {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(true)

    await page.goto(
      `https://translate.google.co.kr/?hl=ko&sl=zh-CN&tl=ko&text=${text}&op=translate`,
      { waituntil: "networkidle0" }
    )
    const selector = ".tlid-translation.translation"
    await page.waitForSelector(selector, { timeout: 2000 })
    const title = await page.$eval(selector, (elem) => elem.textContent)
    return title
  } catch (e) {
    // console.log("googoeTranslate", e.message)
    return await korTranslate(text)
  } finally {
    await browser.close()
  }
}

const papagoTranslate = async (text, source="zh-CN", target="ko") => {
 let clients = [
   {
     clientID: "HgpYPNhPhbJSuOqeOlQc",
     clientSecret: "Oei1APoKJf"
   },
   {
    clientID: "loau89IOS5kuMyXY1lkq",
    clientSecret: "HUYOMW5Q5Z"
  },
  {
    clientID: "YBx8bP0T7C3xN_6u2S3Y",
    clientSecret: "MjUPMYMGVx"
  },
  {
    clientID: "VCpdZ6RMqCkmJbclnYOy",
    clientSecret: "6tdrxp94bh"
  },
  {
    clientID: "MC5JthhRd_poRD7ApTjs",
    clientSecret: "F0zxL8yunI"
  },

  {
    clientID: "hUH0Bku23NDgXb_iZ0n9",
    clientSecret: "kMqyrlQuX8"
  },
  {
    clientID: "hX4kZEA_NTClzeGC58XO",
    clientSecret: "AnZ33WURoD"
  },
  {
    clientID: "e9wVLMuHdOfZAyKN7Ev1",
    clientSecret: "8KL3UaRVUg"
  },
  {
    clientID: "EQjbKEDRORlP1p9i9h56",
    clientSecret: "kjZSqKOcF8"
  },
  {
    clientID: "6wW10rqmzJgtx2F_FwVX",
    clientSecret: "AAUnFvqvzE"
  },
  {
    clientID: "wlEuP824T_bZTGmdELmS",
    clientSecret: "qSd4ngm_Qn"
  },
  {
    clientID: "2GpXnBjlXBurytrs3QPx",
    clientSecret: "MUyckmGgvM"
  },
  {
    clientID: "r2p4hvYWqJWCRWF6d3vV",
    clientSecret: "S8ZTUrl6FT"
  },
  {
    clientID: "OHHQnEqPCeQhXNN7JqEU",
    clientSecret: "dz3MN03h_V"
  },
  {
    clientID: "pfuPqrqjwvVpXqn7o941",
    clientSecret: "cH70bBydwZ"
  },
 ]
 try {
  clients = shuffle(clients)

  for(const client of clients) {
    const response = await axios({
      url: "https://openapi.naver.com/v1/papago/n2mt",
      method: "POST",
      data: {
        source,
        target,
        text
      },
      headers: {
        "X-Naver-Client-Id": client.clientID,
        "X-Naver-Client-Secret": client.clientSecret
      }
    })
    // console.log("response,", response.data.message.result)
    if(response && response.data.message.result){
      // console.log("response.message.result.translatedText", response.data.message.result.translatedText)
      return response.data.message.result.translatedText
    }
  }

 } catch(e) {
   console.log("errir-->", e)
   return text
 }
}

const papagoTranslateNew = async (text) => {
  const browser = await startBrowser()
  try {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(true)

    await page.goto(`http://www.multranslator.com/`, {
      waituntil: "networkidle0",
    })

    await page.select("#rootSourceLanguage", "zh-CN")
    await page.type("#sourceTextarea", text)
    await page.click(".Mtl-Translate-Button")
    await page.waitFor(2000)

    const selector = ".Mtl-Target-Box-Papago > div > textarea"
    await page.waitForSelector(selector, { timeout: 5000 })

    const title = await page.$eval(selector, (elem) => elem.value)
    // console.log("title", title.split("♣").length)
    return title
  } catch (e) {
    console.log("papagoTranslate", e.message)
    return null
  } finally {
    await browser.close()
  }
}

const kakaoTranslate = async (text) => {
  const browser = await startBrowser()
  try {
    const page = await browser.newPage()
    await page.setJavaScriptEnabled(true)

    await page.goto(`https://translate.kakao.com/`, {
      waituntil: "networkidle0",
    })
    await page.type("#query", text)
    await page.waitFor(1000)
    const selector = "#result"
    await page.waitForSelector(selector, { timeout: 5000 })
    const title = await page.$eval(selector, (elem) => elem.innerText)
    return title
  } catch (e) {
    console.log("kakaoTranslate", e.message)
    return null
  } finally {
    await browser.close()
  }
}

module.exports = {
  korTranslate,
  engTranslate,
  cnTranslate,
  kortoEngTranslate,
  googleTranslate,
  papagoTranslate,
  kakaoTranslate,
  papagoTranslateNew,
  EngtoKorTranslate,
}
