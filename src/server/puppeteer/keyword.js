const startBrowser = require("./startBrowser")
const axios = require("axios")
const qs = require("querystring")
const { sleep } = require("../../lib/usrFunc")

const relatedSimple = async ({ page, keyword }) => {
  try {
    const sellerboardCookies = global.sellerboardCookies

    if (sellerboardCookies && Array.isArray(sellerboardCookies)) {
      for (const item of sellerboardCookies) {
        await page.setCookie(item)
      }
    }

    await page.goto("https://www.sellerboard.co.kr/keyword/related", { waitUntil: "networkidle0" })

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2)
    }

    await page.tap("#keyword")
    await page.type("#keyword", keyword, opts)
    await page.keyboard.press(String.fromCharCode(13))
    await page.waitFor(1000)

    if (page.url().includes("account/login")) {
      await page.tap("#username")
      await page.type("#username", "jts0509", opts)
      await page.tap("#password")
      await page.type("#password", "xotjr313#!#", opts)

      await page.keyboard.press(String.fromCharCode(13))
      await page.waitFor(1000)

      await page.goto("https://www.sellerboard.co.kr/keyword/related", {
        waitUntil: "networkidle0"
      })
      await page.tap("#keyword")
      await page.type("#keyword", keyword, opts)
      await page.keyboard.press(String.fromCharCode(13))
      await page.waitFor(1000)

      const cookies2 = await page.cookies("https://www.sellerboard.co.kr")

      global.sellerboardCookies = cookies2
    }

    await page.waitForNavigation()
    await page.waitFor(3000)
    await page.waitForSelector(".cpac_keyword_card")

    await page.type("#keyword_clipboard", "")
    await page.click(
      "body > div > div.content-wrapper > section > div.container-fluid > div > div > div > div > div:nth-child(1) > form > button.btn.btn-dark.btn-sm"
    )

    await page.click(
      "body > div > div.content-wrapper > section > div.container-fluid > div > div > div > div > div:nth-child(2) > form > button.btn.btn-secondary.btn-sm"
    )

    const keywordResult = await page.$eval("#keyword_clipboard", elem => elem.value)

    return keywordResult.toString().split(",")
  } catch (e) {
    console.log("relatedSimple", e)
  }
}
const relatedKeywordOnly = async ({ keyword }) => {
  try {
    const browser = await startBrowser()
    const page = await browser.newPage()
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)

    const result = await relatedSimple({ page, keyword })
    await page.goto("about:blank")
    await page.close()
    await browser.close()
    return result
  } catch (e) {
    console.log("relatedKeywordonly", e)
    return []
  }
}

const relatedKeyword = async ({ keyword }) => {
  try {
    const keywordResult = await relatedKeywordOnly({ keyword })
    const arr = []
    const arrayPromises = keywordResult.map(async item => {
      await sleep(100 + Math.floor(Math.random() * 1000))
      const response = await searchViews({ keyword: item.trim() })
      arr.push(response)
    })
    await Promise.all(arrayPromises)

    return arr.map(item => {
      return {
        ...item,
        total: item.mpcqry + item.mmoqry,
        compete: (item.item_num / (item.mpcqry + item.mmoqry)).toFixed(3)
      }
    })
  } catch (e) {
    console.log("relatedKeyword", e)
  }
}

// const searchViews = async ({ keyword }) => {
//   try {
//     const form = new FormData()
//     form.append("keyword", qs.escape(keyword))
//     const response = await axios({
//       url: `http://www.keyword.gg/search/ajax_seller.php`,
//       method: "POST",
//       headers: { ...form.getHeaders(), "Content-Type": "application/x-www-form-urlencoded" },
//       data: form
//     })
//     console.log("response.data", response.data)
//     return response.data
//   } catch (e) {
//     console.log("searchView", e)
//   }
// }
const searchViews = async ({ keyword }) => {
  try {
    const response = await axios({
      url: `https://sellper.kr/api/stat?query=${qs.escape(keyword)}`,
      method: "GET"
    })
    return response.data
  } catch (e) {
    console.log("searchView", e)
  }
}

const searchSomeTrend = async ({ keyword }) => {
  try {
    const browser = await startBrowser()
    const page = await browser.newPage()
    await page.setViewport({
      height: 1080,
      width: 1290
    })
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)
    await page.goto("https://some.co.kr/analysis/keyword", { waitUntil: "networkidle0" })
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2)
    }

    await page.evaluate(selector => {
      document.querySelector(selector).value = ""
    }, "#searchKeyword")

    await page.type("#searchKeyword", keyword, opts)
    await page.keyboard.press(String.fromCharCode(13))
    await page.waitFor(1000)
    await page.waitForSelector(".issue-sentiment-image")
    await page.click(".issue-sentiment-image")
    await page.waitFor(1000)
    await page.waitForSelector("#issueSentimentRank0 > tr")
    const sentiment = await page.$$eval("#issueSentimentRank0 > tr", element => {
      return element.map(item => item.querySelector(".keywordText").textContent)
    })
    await page.goto("about:blank")
    await page.close()
    await browser.close()

    const arr = []

    const arrayPromises = sentiment.map(async item => {
      await sleep(100 + Math.floor(Math.random() * 1000))
      const response = await searchViews({ keyword: item.trim() })
      arr.push(response)
    })
    await Promise.all(arrayPromises)
    // for (const item of sentiment) {
    //   sleep(200)
    //   const response = await searchViews({ keyword: item.trim() })
    //   arr.push(response)
    // }
    // console.log("arr", arr)
    return arr.map(item => {
      return {
        ...item,
        total: item.mpcqry + item.mmoqry,
        compete: (item.item_num / (item.mpcqry + item.mmoqry)).toFixed(3)
      }
    })
  } catch (e) {
    console.log("searchSomeTrend", e)
  }
}

const searchSomeTrendOnly = async ({ keyword }) => {
  try {
    const browser = await startBrowser()
    const page = await browser.newPage()
    await page.setViewport({
      height: 1080,
      width: 1290
    })
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)
    await page.goto("https://some.co.kr/analysis/keyword", { waitUntil: "networkidle0" })
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2)
    }

    await page.evaluate(selector => {
      document.querySelector(selector).value = ""
    }, "#searchKeyword")

    await page.type("#searchKeyword", keyword, opts)
    await page.keyboard.press(String.fromCharCode(13))
    await page.waitFor(1000)
    await page.waitForSelector(".issue-sentiment-image")
    await page.click(".issue-sentiment-image")
    await page.waitFor(1000)
    await page.waitForSelector("#issueSentimentRank0 > tr")
    const sentiment = await page.$$eval("#issueSentimentRank0 > tr", element => {
      return element.map(item => item.querySelector(".keywordText").textContent)
    })
    await page.goto("about:blank")
    await page.close()
    await browser.close()

    return sentiment
  } catch (e) {
    console.log("searchSomeTrend", e)
    return []
  }
}

const searchCategoryKeyword = async ({ category }) => {
  try {
    const browser = await startBrowser()
    const page = await browser.newPage()
    await page.setViewport({
      height: 1080,
      width: 1290
    })
    await page.setDefaultNavigationTimeout(0)
    await page.setJavaScriptEnabled(true)
    await page.goto("https://itemscout.io/category", { waitUntil: "networkidle2" })
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2)
    }

    await page.type(".autocomplete-input", category, opts)
    await page.waitFor(1000)
    await page.keyboard.press("ArrowDown")
    await page.keyboard.press("Enter")
    await page.waitFor(2000)

    await page.click(".show-options")
    await page.waitForSelector(".show_options_modal")
    // PC 검색수
    await page.click(
      ".show_options_modal > .options-container > table > tr > td > label:nth-child(4)"
    )
    // 모바일 검색수
    await page.click(
      ".show_options_modal > .options-container > table > tr > td > label:nth-child(5)"
    )
    // PC클릭률
    await page.click(
      ".show_options_modal > .options-container > table > tr > td > label:nth-child(9)"
    )
    // 모바일클릭률
    await page.click(
      ".show_options_modal > .options-container > table > tr > td > label:nth-child(10)"
    )
    await page.click(".finish-btn")
    await page.waitFor(500)
    await page.click(".filter-by-group.group-blind-off")
    await page.waitFor(500)

    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)
    await page.keyboard.press("PageDown")
    await page.waitFor(100)

    // const scrollable_section = "#about-itemscout"

    // await page.evaluate(selector => {
    //   const scrollableSection = document.querySelector(selector)

    //   scrollableSection.scrollIntoView(true)
    // }, scrollable_section)

    const list = await page.$$eval(
      ".table-container > #keyword-table-scroll-wrapper > table > tbody > tr",
      element => {
        return element.map(item => {
          return {
            rank: item
              .querySelector("td:nth-child(2)")
              .innerText.trim()
              .replace(/\,/g, ""),
            keyword: item.querySelector("td:nth-child(3)").innerText.trim(),
            pc: item
              .querySelector("td:nth-child(5)")
              .innerText.trim()
              .replace(/\,/g, ""),
            mobile: item
              .querySelector("td:nth-child(6)")
              .innerText.trim()
              .replace(/\,/g, ""),
            total: item
              .querySelector("td:nth-child(7)")
              .innerText.trim()
              .replace(/\,/g, ""),
            product: item
              .querySelector("td:nth-child(8)")
              .innerText.trim()
              .replace(/\,/g, ""),
            compete: item
              .querySelector("td:nth-child(9)")
              .innerText.trim()
              .replace(/\,/g, ""),
            pcrate: item
              .querySelector("td:nth-child(10)")
              .innerText.trim()
              .replace(/\,/g, ""),
            mobilerate: item
              .querySelector("td:nth-child(11)")
              .innerText.trim()
              .replace(/\,/g, ""),
            adclickrate: item
              .querySelector("td:nth-child(12)")
              .innerText.trim()
              .replace(/\,/g, ""),
            adsclicks: item
              .querySelector("td:nth-child(13)")
              .innerText.trim()
              .replace(/\,/g, "")
          }
        })
      }
    )

    await page.goto("about:blank")
    await page.close()
    await browser.close()

    return list
  } catch (e) {
    console.log("searchCategoryKeyword", e)
  }
}
module.exports = {
  relatedSimple,
  relatedKeyword,
  relatedKeywordOnly,
  searchViews,
  searchSomeTrend,
  searchSomeTrendOnly,
  searchCategoryKeyword
}
