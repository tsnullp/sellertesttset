const puppeteer = require("puppeteer")
const iPhonex = puppeteer.devices["iPhone X"]

const login = async (page, username, password) => {
  try {
    await page.setViewport({
      height: 2000,
      width: 375,
      isMobile: true,
      hasTouch: true
    })
    await page.emulate(iPhonex)
    await page.setJavaScriptEnabled(true)
    await page._client.send("Emulation.setEmitTouchEventsForMouse", {
      enabled: true
    })
    await page.goto("https://login.m.taobao.com/login.htm", { waitUntil: "networkidle0" })

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    await page.waitForSelector("#login-form", { timeout: 60000 })

    await page.tap("#fm-login-id")
    await page.type("#fm-login-id", username, opts)

    await page.tap("#fm-login-password")
    await page.type("#fm-login-password", password, opts)

    let loginBtn = await page.$(".fm-button.fm-submit.password-login")
    await loginBtn.click({
      delay: 20
    })
    await page.waitFor(1000 + Math.floor(Math.random() * 1000))
    return true
  } catch (e) {
    console.log("login", e)
    return false
  }
}

module.exports = login
