const startBrowser = require("./startBrowser")
const ExchangeRate = require("../models/ExchangeRate")
const moment = require("moment")

const start = async () => {
  const toDayString = moment().format("YYYYMMDD")
  const todayUpdate = await ExchangeRate.countDocuments({
    날짜: toDayString,
  })

  if (todayUpdate > 0) {
    return
  }
  const browser = await startBrowser()
  const page = await browser.newPage()
  try {
    let end = false
    let index = 1
    while (!end) {
      end = await searchExchangePage({ page, index, type: "USD" })
      index++
    }
    end = false
    index = 1
    while (!end) {
      end = await searchExchangePage({ page, index, type: "CNY" })
      index++
    }
    end = false
    index = 1
    while (!end) {
      end = await searchExchangePage({ page, index, type: "JPY" })
      index++
    }
  } catch (e) {
    console.log("findExchange --", e)
    if (browser) {
      await browser.close()
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

module.exports = start

const searchExchangePage = async ({ page, index = 1, type = "USD" }) => {
  try {
    let marketindexCd = "FX_USDKRW"
    switch (type) {
      case "USD":
        marketindexCd = "FX_USDKRW"
        break
      case "CNY":
        marketindexCd = "FX_CNYKRW"
        break
      case "JPY":
        marketindexCd = "FX_JPYKRW"
        break
      default:
        break
    }
    await page.goto(
      `https://finance.naver.com/marketindex/exchangeDailyQuote.nhn?marketindexCd=${marketindexCd}&page=${index}`,
      {
        waituntil: "networkidle0",
      }
    )
    // body > div > table > tbody > tr:nth-child(1) > td.date
    const tbodys = await page.$$eval("tbody > tr", (element) => {
      return element.map((item) => {
        const 날짜 = item.querySelector("td:nth-child(1)").textContent.trim()
        const 매매기준율 = item.querySelector("td:nth-child(2)").textContent.trim()
        const 현찰사실때 = item.querySelector("td:nth-child(4)").textContent.trim()
        const 현찰파실때 = item.querySelector("td:nth-child(5)").textContent.trim()
        const 송금보내실때 = item.querySelector("td:nth-child(6)").textContent.trim()
        const 송금받으실때 = item.querySelector("td:nth-child(7)").textContent.trim()

        return {
          날짜,
          매매기준율,
          현찰사실때,
          현찰파실때,
          송금보내실때,
          송금받으실때,
        }
      })
    })

    let end = false

    let i = 0
    for (const item of tbodys) {
      const date = item.날짜.replace(".", "").replace(".", "")
      const day = moment(Number(date), "YYYYMMDD").day()
      const toDay = moment().format("YYYYMMDD")

      if (type === "USD") {
        if (date > "20200100") {
          await ExchangeRate.findOneAndUpdate(
            { 날짜: date },
            {
              $set: {
                날짜: date,
                USD_매매기준율: item.매매기준율,
                USD_현찰사실때: item.현찰사실때,
                USD_현찰파실때: item.현찰파실때,
                USD_송금보내실때: item.송금보내실때,
                USD_송금받으실때: item.송금받으실때,
              },
            },
            { upsert: true }
          )
          if (day === 5) {
            // 금요일
            const saturday = moment(Number(date), "YYYYMMDD").add(1, "days").format("YYYYMMDD")
            const sunday = moment(Number(date), "YYYYMMDD").add(2, "days").format("YYYYMMDD")

            await ExchangeRate.findOneAndUpdate(
              { 날짜: saturday },
              {
                $set: {
                  날짜: saturday,
                  USD_매매기준율: item.매매기준율,
                  USD_현찰사실때: item.현찰사실때,
                  USD_현찰파실때: item.현찰파실때,
                  USD_송금보내실때: item.송금보내실때,
                  USD_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
            await ExchangeRate.findOneAndUpdate(
              { 날짜: sunday },
              {
                $set: {
                  날짜: sunday,
                  USD_매매기준율: item.매매기준율,
                  USD_현찰사실때: item.현찰사실때,
                  USD_현찰파실때: item.현찰파실때,
                  USD_송금보내실때: item.송금보내실때,
                  USD_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
          }
          if (i === 0) {
            // 첫번째
            if (date < toDay) {
              await ExchangeRate.findOneAndUpdate(
                { 날짜: toDay },
                {
                  $set: {
                    날짜: toDay,
                    USD_매매기준율: item.매매기준율,
                    USD_현찰사실때: item.현찰사실때,
                    USD_현찰파실때: item.현찰파실때,
                    USD_송금보내실때: item.송금보내실때,
                    USD_송금받으실때: item.송금받으실때,
                  },
                },
                { upsert: true }
              )
            }
          }
        } else {
          console.log("END")
          end = true
        }
      } else if (type === "CNY") {
        if (date > "20200100") {
          await ExchangeRate.findOneAndUpdate(
            { 날짜: date },
            {
              $set: {
                날짜: date,
                CNY_매매기준율: item.매매기준율,
                CNY_현찰사실때: item.현찰사실때,
                CNY_현찰파실때: item.현찰파실때,
                CNY_송금보내실때: item.송금보내실때,
                CNY_송금받으실때: item.송금받으실때,
              },
            },
            { upsert: true }
          )
          if (day === 5) {
            // 금요일
            const saturday = moment(Number(date), "YYYYMMDD").add(1, "days").format("YYYYMMDD")
            const sunday = moment(Number(date), "YYYYMMDD").add(2, "days").format("YYYYMMDD")

            await ExchangeRate.findOneAndUpdate(
              { 날짜: saturday },
              {
                $set: {
                  날짜: saturday,
                  CNY_매매기준율: item.매매기준율,
                  CNY_현찰사실때: item.현찰사실때,
                  CNY_현찰파실때: item.현찰파실때,
                  CNY_송금보내실때: item.송금보내실때,
                  CNY_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
            await ExchangeRate.findOneAndUpdate(
              { 날짜: sunday },
              {
                $set: {
                  날짜: sunday,
                  CNY_매매기준율: item.매매기준율,
                  CNY_현찰사실때: item.현찰사실때,
                  CNY_현찰파실때: item.현찰파실때,
                  CNY_송금보내실때: item.송금보내실때,
                  CNY_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
          }

          if (index === 1 && i === 0) {
            // 첫번째

            if (date < toDay) {
              await ExchangeRate.findOneAndUpdate(
                { 날짜: toDay },
                {
                  $set: {
                    날짜: toDay,
                    CNY_매매기준율: item.매매기준율,
                    CNY_현찰사실때: item.현찰사실때,
                    CNY_현찰파실때: item.현찰파실때,
                    CNY_송금보내실때: item.송금보내실때,
                    CNY_송금받으실때: item.송금받으실때,
                  },
                },
                { upsert: true }
              )
            }
          }
        } else {
          console.log("END")
          end = true
        }
      } else if (type === "JPY") {
        if (date > "20200100") {
          await ExchangeRate.findOneAndUpdate(
            { 날짜: date },
            {
              $set: {
                날짜: date,
                JPY_매매기준율: item.매매기준율,
                JPY_현찰사실때: item.현찰사실때,
                JPY_현찰파실때: item.현찰파실때,
                JPY_송금보내실때: item.송금보내실때,
                JPY_송금받으실때: item.송금받으실때,
              },
            },
            { upsert: true }
          )
          if (day === 5) {
            // 금요일
            const saturday = moment(Number(date), "YYYYMMDD").add(1, "days").format("YYYYMMDD")
            const sunday = moment(Number(date), "YYYYMMDD").add(2, "days").format("YYYYMMDD")

            await ExchangeRate.findOneAndUpdate(
              { 날짜: saturday },
              {
                $set: {
                  날짜: saturday,
                  JPY_매매기준율: item.매매기준율,
                  JPY_현찰사실때: item.현찰사실때,
                  JPY_현찰파실때: item.현찰파실때,
                  JPY_송금보내실때: item.송금보내실때,
                  JPY_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
            await ExchangeRate.findOneAndUpdate(
              { 날짜: sunday },
              {
                $set: {
                  날짜: sunday,
                  JPY_매매기준율: item.매매기준율,
                  JPY_현찰사실때: item.현찰사실때,
                  JPY_현찰파실때: item.현찰파실때,
                  JPY_송금보내실때: item.송금보내실때,
                  JPY_송금받으실때: item.송금받으실때,
                },
              },
              { upsert: true }
            )
          }

          if (index === 1 && i === 0) {
            // 첫번째

            if (date < toDay) {
              await ExchangeRate.findOneAndUpdate(
                { 날짜: toDay },
                {
                  $set: {
                    날짜: toDay,
                    JPY_매매기준율: item.매매기준율,
                    JPY_현찰사실때: item.현찰사실때,
                    JPY_현찰파실때: item.현찰파실때,
                    JPY_송금보내실때: item.송금보내실때,
                    JPY_송금받으실때: item.송금받으실때,
                  },
                },
                { upsert: true }
              )
            }
          }
        } else {
          console.log("END")
          end = true
        }
      }
      i++
    }

    return end
  } catch (e) {
    console.log("searchExchangePage", e)
  }
}
