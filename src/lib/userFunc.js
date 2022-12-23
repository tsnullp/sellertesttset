const path = require("path")
const probe = require("probe-image-size")
const translate = require("translate")
const url = require("url")

export const trim = (str) => {
  try {
    str = str
      .replace(/<\/?.+?>/g, "")
      .replace(/^(\s|\u00A0)+/, "")
      .replace(/(\s|\u00A0)+$/, "")
  } catch (error) {}
  return str
}

export const checkStr = (str, para, type) => {
  if (type) {
    if (str.includes(para)) {
      return true
    } else {
      return false
    }
  } else {
    if (!str.includes(para)) {
      return true
    } else {
      return false
    }
  }
}

export const urlSize = (imgs, size) => {
  if (!imgs.length) {
    return imgs
  }
  for (let i = 0, len = imgs.length; i < len; i++) {
    if (checkStr(imgs[i], size, true)) {
      imgs[i] = imgs[i].replace(size, "400x400.jpg")
    }
  }
  return imgs
}

export const makeHttpUrl = (str) => {
  if (!isString(str)) return str
  if (!str.includes("https:")) {
    return `https:${str}`
  } else {
    const tempStr1 = str.split("https:")[1]
    return `https:${tempStr1}`
  }
}

export const optionImageParser = (str) => {
  if (!isString(str)) return str
  if (str.length === 0) return str
  try {
    const tempStr1 = str.split("(")[1]
    const tempStr2 = tempStr1.split(".jpg")[0]
    const returnStr = `${tempStr2}.jpg`

    return makeHttpUrl(returnStr)
  } catch (e) {
    console.log("optionImageParser -- ", str, e)
    return str
  }
}

export const thumbImageParser = (str) => {
  if (!isString(str)) return str
  const tempStr1 = str.split(".jpg")[0]
  if (tempStr1.includes(".png")) {
    const tempStr2 = tempStr1.split(".png")[0]

    return makeHttpUrl(`${tempStr2}.png`)
  }

  return makeHttpUrl(`${tempStr1}.jpg`)
}

export const isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]"
}

export const taobaoDescUrlAddr = (str) => {
  const tempStr1 = stringParser(str, `descUrl          : location.protocol==='http:' ? '`, `' : '`)

  return `http:${tempStr1}`
}

export const tmallDescUrlAddr = (str) => {
  const tempStr = stringParser(str, `"descUrl":"`, `","`)
  return `http:${tempStr}`
}

export const stringParser = (str, startStr, endStr) => {
  if (!isString(str) || !isString(startStr) || !isString(endStr)) return null
  try {
    const tempStr1 = str.split(startStr)[1]
    const tempstr2 = tempStr1.split(endStr)[0]
    return tempstr2
  } catch (e) {
    console.log("stringParser", e)
  }
}

export const sleep = (t) => {
  return new Promise((resolve) => setTimeout(resolve, t))
}

export const regExp_test = (str) => {
  //함수를 호출하여 특수문자 검증 시작.
  try {
    // eslint-disable-next-line no-useless-escape
    var regExp = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi
    if (regExp.test(str)) {
      var t = str.replace(regExp, "")
      //특수문자를 대체. ""

      return t
      //특수문자 제거. ==>20171031
    } else {
      return str
    }
  } catch (e) {
    return str
  }
}

export const getAppDataPath = () => {
  switch (process.platform) {
    case "darwin": {
      return path.join(process.env.HOME, "Library", "Application Support", "smartseller")
    }
    case "win32": {
      return path.join(process.env.APPDATA, "smartseller")
    }
    case "linux": {
      return path.join(process.env.HOME, ".smartseller")
    }
    default: {
      console.log("Unsupported platform!")
      process.exit(1)
    }
  }
}

export const getByte = (str) => {
  if (!str) {
    return str
  }
  return str
    .split("")
    .map((s) => s.charCodeAt(0))
    .reduce((prev, c) => prev + (c === 10 ? 2 : c >> 7 ? 2 : 1), 0)
}

export const imageCheck = (path) => {
  return new Promise((resolve, reject) => {
    probe(path)
      .then((result) => {
        resolve({
          width: result.width,
          height: result.heigh,
        })
      })
      .catch((e) => reject(e))
  })
}

export function makeTitle(array) {
  if (!Array.isArray(array)) {
    return array
  }
  const res = array
    .filter((item) => regExp_test(item) && item.trim().length > 0)
    .reduce((t, a) => {
      if (t[a]) {
        t[a]++
      } else {
        t[a] = 1
      }
      return t
    }, {})

  let title = ""
  for (const [key, value] of Object.entries(res)) {
    console.log(`${key}: ${value}`)
    if (title.length === 0) {
      title += key
    } else {
      title += ` ${key}`
    }
  }
  console.log("titile", title)
  return title
}

export function ranking(array) {
  if (!Array.isArray(array)) {
    return []
  }
  const res = array.reduce((t, a) => {
    if (t[a]) {
      t[a]++
    } else {
      t[a] = 1
    }
    return t
  }, {})

  const arrayValue = Object.keys(res).map((item) => {
    return {
      name: item,
      count: res[item],
    }
  })
  const sortArray = arrayValue.sort((a, b) => b.count - a.count)

  return sortArray.filter((item) => item.count >= 3)
}

export const korTranslate = async (text) => {
  translate.engine = "google"
  translate.key = "AIzaSyCLyVMgHOR6dSy5VkQNHX2wzw8bTm107cw"
  translate.from = "zh"
  translate.to = "ko"
  const korText = await translate(text)
  return korText
}

export const isURL = (str) => {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ) // fragment locator
  return pattern.test(str)
}

export const isPhoneNum = (phoneNum) => {
  var patternPhone = /01[016789]-[^0][0-9]{2,3}-[0-9]{3,4}/

  if (patternPhone.test(phoneNum)) {
    return true
  } else {
    return false
  }
}

export const RandomWords = (words) => {
  if (!words || !Array.isArray(words) || words.length === 0) {
    return []
  }
  try {
    const permutation = (arr, selectNum) => {
      const result = []

      if (selectNum === 1) return arr.map((v) => [v])

      arr.forEach((v, idx, arr) => {
        if (result.length > 5000) {
          return false
        }

        const fixed = v
        const restArr = arr.filter((_, index) => index !== idx)
        const permutationArr = permutation(restArr, selectNum - 1)
        const combineFix = permutationArr.map((v) => [fixed, ...v])
        result.push(...combineFix)
      })
      return result
    }

    const result = permutation(words, words.length)

    return result.map((item) => {
      // item.join()
      // console.log("ITEM", item)
      return item.join(" ")
    })
  } catch (e) {
    console.log("RandomWords", e)
    return []
  }
}

export const AmazonAsin = (addr) => {
  try {
    if (!addr) {
      return null
    }
    if (addr.includes("amazon.com") || addr.includes("amazon.co.jp")) {
      const q1 = url.parse(addr, true)
      const temp1 = q1.pathname.split("/dp/")
      const temp2 = temp1[temp1.length - 1]
      const temp3 = temp2.split("/")[0]
      return temp3
    } else if (addr.includes("iherb.com")) {
      const tmepUrl = addr.split("?")[0]
      const q1 = url.parse(tmepUrl, true)
      const temp1 = q1.pathname.split("/")[q1.pathname.split("/").length - 1]
      return temp1
    } else if (addr.includes("aliexpress.com")) {
      const tmepUrl = addr.split(".html")[0]
      const q1 = url.parse(tmepUrl, true)
      const temp1 = q1.pathname.split("/")[q1.pathname.split("/").length - 1]
      return temp1
    } else if (addr.includes("taobao.com")) {
      const q1 = url.parse(addr, true)
      return q1.query.id
    } else if (addr.includes("tmall.com")) {
      const q1 = url.parse(addr, true)
      return q1.query.id
    } else if (addr.includes("vvic.com")) {
      const tmepUrl = addr.split("?")[0]
      const q1 = url.parse(tmepUrl, true)
      const temp1 = q1.pathname.split("/")[q1.pathname.split("/").length - 1]
      return temp1
    }

    return null
  } catch (e) {
    console.log("AmazonAsin", e)
    return null
  }
}

export const OverText = (text, overLength) => {
  let firstText = text
  let searchText = null
  try {
    for (let i = 0; i < text.length; i++) {
      firstText = text.substr(0, i + 1)
      if (getByte(firstText) > 50) {
        firstText = text.substr(0, i)
        searchText = text.substr(i, text.length)
        break
      }
    }
    return {
      firstText,
      searchText,
    }
  } catch (e) {
    console.log("OverText", e)
    return {
      firstText,
      searchText: null,
    }
  }
}

export const DimensionArray = (array, criteria = 1) => {
  try {
    if (!Array.isArray(array)) {
      return array
    }
    return array.reduce((array, number, index) => {
      const arrayIndex = Math.floor(index / criteria)
      if (!array[arrayIndex]) {
        array[arrayIndex] = []
      }
      array[arrayIndex] = [...array[arrayIndex], number]
      return array
    }, [])
  } catch (e) {
    console.log("DimensionArray", e)
    return array
  }
}
