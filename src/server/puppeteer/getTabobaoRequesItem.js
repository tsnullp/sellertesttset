const axios = require("axios")
const cheerio = require("cheerio")
const iconv = require("iconv-lite")
const { checkStr, trim, optionImageParser, thumbImageParser } = require("../../lib/usrFunc")

const findTaobao = async ({ page, html, url }) => {
  const objItem = {
    imgs: [],
    good_id: 0,
    option: [],
    error: false
  }
  try {
    objItem.good_id = getGoodid(url)
    objItem.imgs = await getSwiper(html, url)
    objItem.option = await getSku(page, html, url)
    objItem.error = false
  } catch (err) {
    objItem.error = true
  }
  // console.log("objItem", objItem)
  return objItem
}

const getSwiper = (html, url) => {
  let urls = []

  if (/item.taobao.com/.test(url)) {
    urls = catchSwiper(".tb-thumb li .tb-pic a img", html)
    // urls = urlSize(urls, "50x50.jpg")
  }
  if (/detail.tmall.com/.test(url)) {
    urls = catchSwiper("#J_UlThumb li a img", html)
    // urls = urlSize(urls, "60x60q90.jpg")
  }

  urls = urls.map(item => thumbImageParser(item))
  return urls
}

const catchSwiper = (ele, html, isContent) => {
  const $ = cheerio.load(html)
  let urls = []
  try {
    let elems = $(ele)
    elems.each(function(i, elem) {
      // if (isContent) console.log("elem222", elem)

      let src = elem.attribs["data-ks-lazyload"] || elem.attribs["data-src"]
      if (src) {
        src = thumbImageParser(src)
      }

      if (
        src &&
        checkStr(src, "top_1", false) &&
        checkStr(src, ".gif", false) &&
        checkStr(src, "video", false)
      ) {
        urls.push(src)
      }
    })
    // if (!Array.isArray(elems)) {
    // 	// elems = Object.values(elems)
    // 	Object.keys(elems).map(function(key) {
    // 		if (isContent) console.log(`elem111--${key}`, elems[key])
    // 		const imgTag = elems[key]
    // 		const src = imgTag.attribs && imgTag.attribs.src ? imgTag.attribs.src : null

    // 		if (
    // 			src &&
    // 			checkStr(src, 'top_1', false) &&
    // 			checkStr(src, '.gif', false) &&
    // 			checkStr(src, 'video', false)
    // 		) {
    // 			urls.push(src)
    // 		}
    // 	})
    // } else {
    // 	elems.each(function(i, elem) {
    // 		if (isContent) console.log('elem222', elem)
    // 		const src = elem.attribs['data-ks-lazyload'] || elem.attribs.src

    // 		if (
    // 			src &&
    // 			checkStr(src, 'top_1', false) &&
    // 			checkStr(src, '.gif', false) &&
    // 			checkStr(src, 'video', false)
    // 		) {
    // 			urls.push(src)
    // 		}
    // 	})
    // }
  } catch (err) {
    console.log("----", err)
  }
  return urls
}

const getGoodid = url => {
  let id = 0
  url = url.split("&")
  if (url.length) {
    for (let i = 0, len = url.length; i < len; i++) {
      if (checkStr(url[i], "id=", true)) {
        let idt = url[i].split("=")
        id = idt[1]
        return id
      }
    }
  }
  return id
}

// 获取规格
const getSku = async (page, html, goodPage) => {
  const $ = cheerio.load(html)
  const value2label = {}
  const imageLabel = {}
  $(".J_TSaleProp li").each(function(i, elem) {
    const value = $(this).attr("data-value")
    const imgae = $(this)
      .find("a")
      .attr("style")
    const label = $(this)
      .find("span")
      .text()
    value2label[value] = label
    imageLabel[value] = optionImageParser(imgae)
  })

  // console.log("values2Label", value2label)
  // console.log("imageLabel", imageLabel)

  // 预定义结果 skuList = [{name,skuId,stock},{name,skuId,stock}]
  const skuList = []
  let skuMaps
  if (/item.taobao.com/.test(goodPage)) {
    skuMaps = html.match(/skuMap[\s]+:[\s]+{[\S]+[\s]+,propertyMemoMap/)

    if (skuMaps) {
      skuMaps = trim(skuMaps[0])

      skuMaps = skuMaps.slice(13, -16)
      skuMaps = JSON.parse(skuMaps)
    }
  }
  if (/detail.tmall.com/.test(goodPage)) {
    skuMaps = html.match(/"skuMap":{[\S]+,"salesProp"/)
    if (skuMaps) {
      skuMaps = JSON.parse(skuMaps[0].slice(9, -12))
    }
  }

  const getValue = key => {
    if (!value2label) return null

    let image = null
    try {
      let keykey = key
      keykey = keykey.slice(1, -1)
      if (value2label[keykey]) {
        image = value2label[keykey]
      } else {
        if (keykey.includes(";")) {
          const keyArr = keykey.split(";")
          if (value2label[keyArr[0]]) {
            image = value2label[keyArr[0]]
          } else if (value2label[keyArr[1]]) {
            image = value2label[keyArr[1]]
          }
        }
      }
    } catch (e) {
      console.log("value2label", e)
    }

    return image
  }

  const getImage = key => {
    if (!imageLabel) return ""

    let image = ""
    try {
      let keykey = key
      keykey = keykey.slice(1, -1)

      if (imageLabel[keykey]) {
        image = imageLabel[keykey]
      } else {
        if (keykey.includes(";")) {
          const keyArr = keykey.split(";")
          if (imageLabel[keyArr[0]]) {
            image = imageLabel[keyArr[0]]
          } else if (imageLabel[keyArr[1]]) {
            image = imageLabel[keyArr[1]]
          }
        }
      }
    } catch (e) {
      console.log("getImage", e)
    }

    return image
  }

  if (skuMaps) {
    for (const key of Object.keys(skuMaps)) {
      // Object.keys(skuMaps).map(async key => {
      const keyArray = key.split(";")
      let name = ""
      keyArray.map(i => {
        if (i.length > 0 && value2label[i]) {
          if (name.length > 0) {
            name += ", "
          }
          name += value2label[i]
        }
      })

      if (getValue(key))
        skuList.push({
          name,
          korName: "",
          key: key,
          image: getImage(key),
          skuId: skuMaps[key].skuId,
          stock: skuMaps[key].stock,
          price: skuMaps[key].price
        })
    }

    return skuList
  }

  return []
}

const find = async ({ page, url }) => {
  const config = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.140 Safari/537.36 Edge/17.17134"
    },
    responseType: "arraybuffer"
  }

  const { data } = await axios.get(url, config)
  const contents = iconv.decode(data, "EUC-CN").toString()
  let objItem = await findTaobao({ page, html: contents, url })

  return objItem
}

module.exports = find
