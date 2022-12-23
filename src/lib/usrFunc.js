const path = require("path")
const probe = require("probe-image-size")
const imageToBase64 = require("image-to-base64")
const url = require("url")
const _ = require("lodash")

const trim = (str) => {
  try {
    str = str
      .replace(/<\/?.+?>/g, "")
      .replace(/^(\s|\u00A0)+/, "")
      .replace(/(\s|\u00A0)+$/, "")
  } catch (error) {}
  return str
}

const checkStr = (str, para, type) => {
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

const urlSize = (imgs, size) => {
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

const makeHttpUrl = (str) => {
  if (!isString(str)) return str
  if (!str.includes("https:")) {
    return `https:${str}`
  } else {
    const tempStr1 = str.split("https:")[1]
    return `https:${tempStr1}`
  }
}

const optionImageParser = (str) => {
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

const thumbImageParser = (str) => {
  if (!isString(str)) return str
  const tempStr1 = str.split(".jpg")[0]
  if (tempStr1.includes(".png")) {
    const tempStr2 = tempStr1.split(".png")[0]

    return makeHttpUrl(`${tempStr2}.png`)
  }

  return makeHttpUrl(`${tempStr1}.jpg`)
}

const isString = (x) => {
  return Object.prototype.toString.call(x) === "[object String]"
}

const taobaoDescUrlAddr = (str) => {
  const tempStr1 = stringParser(str, `descUrl          : location.protocol==='http:' ? '`, `' : '`)

  return `http:${tempStr1}`
}

const tmallDescUrlAddr = (str) => {
  const tempStr = stringParser(str, `"descUrl":"`, `","`)
  return `http:${tempStr}`
}

const stringParser = (str, startStr, endStr) => {
  if (!isString(str) || !isString(startStr) || !isString(endStr)) return null
  try {
    const tempStr1 = str.split(startStr)[1]
    const tempstr2 = tempStr1.split(endStr)[0]
    return tempstr2
  } catch (e) {
    console.log("stringParser", e)
  }
}

const sleep = (t) => {
  return new Promise((resolve) => setTimeout(resolve, t))
}

const regExp_test = (str) => {
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

const getAppDataPath = () => {
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

const getByte = (str) => {
  return str
    .split("")
    .map((s) => s.charCodeAt(0))
    .reduce((prev, c) => prev + (c === 10 ? 2 : c >> 7 ? 2 : 1), 0)
}

const imageCheck = (path) => {
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

function makeTitle(array) {
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

function ranking(array) {
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

const imageEncodeToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    imageToBase64(file) // Path to the image
      .then((response) => {
        // console.log(response); // "cGF0aC90by9maWxlLmpwZw=="
        resolve(response)
      })
      .catch((error) => {
        console.log(error) // Logs an error if there was one
        reject(error)
      })
  })
}

const isURL = (str) => {
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

const isPhoneNum = (phoneNum) => {
  var patternPhone = /01[016789]-[^0][0-9]{2,3}-[0-9]{3,4}/

  if (patternPhone.test(phoneNum)) {
    return true
  } else {
    return false
  }
}

const RandomWords = (words) => {
  if (!words || !Array.isArray(words) || words.length === 0) {
    return []
  }
  try {
    const permutation = (arr, selectNum) => {
      const result = []
      if (selectNum === 1) return arr.map((v) => [v])

      arr.forEach((v, idx, arr) => {
        const fixed = v
        const restArr = arr
        const permutationArr = permutation(restArr, selectNum - 1)
        const combineFix = permutationArr.map((v) => [fixed, ...v])
        result.push(...combineFix)
      })
      return result
    }

    return permutation(words, words.length)
  } catch (e) {
    console.log("RandomWords", e)
    return []
  }
}

const AmazonAsin = (addr) => {
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

const DimensionArray = (array, criteria = 1) => {
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

const CategroyCompare = (a, b) => {
  let totalScore = 0
  let score = 0
  try {
    for (const aItem of a) {
      totalScore += aItem.relevance
    }
    b.forEach((bItem, i) => {
      const index = _.findIndex(a, { id: bItem.id })
      if (index !== -1) {
        // console.log("기준", index, "대상", i)
        // console.log("index, ", a[index], bItem)

        if (index >= i) {
          // console.log("점수", a[index].relevance)
          score += a[index].relevance
        } else {
          score += bItem.relevance
          // console.log("점수", bItem.relevance)
        }
      }
    })
  } catch (e) {
    console.log("CategoryCompare", e)
  } finally {
    return score / totalScore
  }
}

const isNumber = (val) => {
  let s = val + "" // 문자열로 변환
  s = s.replace(/^\s*|\s*$/g, "") // 좌우 공백 제거
  if (s == "" || isNaN(s)) return false
  return true
}

const getPermutations = (arr, selectNumber) => {
  const results = []
  if (selectNumber === 1) return arr.map((el) => [el])
  // n개중에서 1개 선택할 때(nP1), 바로 모든 배열의 원소 return. 1개선택이므로 순서가 의미없음.

  arr.forEach((fixed, index, origin) => {
    const rest = [...origin.slice(0, index), ...origin.slice(index + 1)]
    // 해당하는 fixed를 제외한 나머지 배열
    const permutations = getPermutations(rest, selectNumber - 1)
    // 나머지에 대해서 순열을 구한다.
    const attached = permutations.map((el) => [fixed, ...el])
    //  돌아온 순열에 떼 놓은(fixed) 값 붙이기
    results.push(...attached)
    // 배열 spread syntax 로 모두다 push
  })

  return results // 결과 담긴 results return
}

const GetKeywordScore = (a, b) => {
  if (!a || !b) {
    return 0
  }
  let categoryCnt = 0
  let score1 = 0
  let score2 = 0
  let score3 = 0
  let score4 = 0
  if (a.category1) {
    categoryCnt += 1
    if (b.category1) {
      score1 = CategroyCompare(a.category1.categories, b.category1.categories)
    }
  }
  if (a.category2) {
    categoryCnt += 1
    if (b.category2) {
      score2 = CategroyCompare(a.category2.categories, b.category2.categories)
    }
  }
  if (a.category3) {
    categoryCnt += 1
    if (b.category3) {
      score3 = CategroyCompare(a.category3.categories, b.category3.categories)
    }
  }
  if (a.category4) {
    categoryCnt += 1
    if (b.category4) {
      score4 = CategroyCompare(a.category4.categories, b.category4.categories)
    }
  }

  return (score1 + score2 + score3 + score4) * (100 / categoryCnt)
}

const shuffle = (array) => {
  return array.sort(() => Math.random() - 0.5); 
}

const getCombineTileKeyword = (keyword, arr) => {
  let array = []
  for (const item of arr) {
    if(keyword === item){
      array.push(keyword)
    } else {
      array.push(`${keyword} ${item}`)
      array.push(`${item} ${keyword}`)
    }
  }
  return array
}

module.exports = {
  checkStr,
  getAppDataPath,
  regExp_test,
  sleep,
  tmallDescUrlAddr,
  taobaoDescUrlAddr,
  trim,
  urlSize,
  optionImageParser,
  makeHttpUrl,
  thumbImageParser,
  getByte,
  imageCheck,
  ranking,
  makeTitle,
  imageEncodeToBase64,
  isURL,
  isPhoneNum,
  RandomWords,
  AmazonAsin,
  DimensionArray,
  CategroyCompare,
  isNumber,
  getPermutations,
  GetKeywordScore,
  shuffle,
  getCombineTileKeyword
}
