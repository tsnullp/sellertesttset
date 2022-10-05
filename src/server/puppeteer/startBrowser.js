const puppeteer = require("puppeteer-extra")
// add stealth plugin and use defaults (all evasion techniques)
const StealthPlugin = require("puppeteer-extra-plugin-stealth")
const os = require("os")
const path = require("path")

const logger = require("../../lib/logger")

const startBrowser = async (headless = true) => {
  try {
    let executablePath = null
    if (os.platform() === "darwin") {
      executablePath =
        "../../../node_modules/puppeteer/.local-chromium/mac-818858/chrome-mac/Chromium.app/Contents/MacOS/Chromium"
    } else {
      executablePath =
        "../../../node_modules/puppeteer/.local-chromium/win64-818858/chrome-win/chrome.exe"
    }

    puppeteer.use(StealthPlugin())
    const browser = await puppeteer.launch({
      headless,
      executablePath: path.join(__dirname, executablePath),
      defaultViewport: null
    })

    return browser
  } catch (e) {
    logger.error(`os.arch(), ${e.message}`)
    return null
  }
}

module.exports = startBrowser
