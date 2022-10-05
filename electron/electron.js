const { app, BrowserWindow, ipcMain, dialog, session } = require("electron")
const log = require("electron-log")
const { autoUpdater } = require("electron-updater")
const url = require("url")
const path = require("path")
const os = require("os")
const isDev = require("electron-is-dev")
const puppeteer = require("puppeteer-electron")
const database = require("../src/server/setup/database")
const express = require("../src/server/setup/express")
const schedule = require("../src/server/setup/schedule")
const ElectronGoogleOAuth2 = require("@getstation/electron-google-oauth2").default

require("events").EventEmitter.defaultMaxListeners = 0

let win
autoUpdater.logger = log
autoUpdater.logger.transports.file.level = "info"
log.info("App starting...")

const createWindow = async () => {
  win = new BrowserWindow({
    width: 1800,
    height: 1000,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      // preload: path.resolve(`${__dirname}/preload.js`)
      preload: __dirname + "/preload.js",
      webSecurity: false,
      contextIsolation: false
    },
  })
  win.setAutoHideMenuBar(true)
  if (isDev) {
    win.loadURL("http://localhost:3001")
    // win.webContents.openDevTools()
  } else {
    // win.loadURL(`${path.join(__dirname, "../../build/index.html")}`)
    const startUrl = url.format({
      pathname: path.join(__dirname, "../build/index.html"),
      protocol: "file:",
      slashes: true,
    })
    win.loadURL(startUrl)
  }
  // win.loadURL(
  //   isDev ? "http://localhost:3001" : `file://${path.join(__dirname, "../build/index.html")}`
  // )
  win.once("ready-to-show", () => win.show())
  win.on("close", () => {
    win = null
  })
}

app.whenReady().then(() => {
  createWindow()
  // console.log("getFeedUrl ", autoUpdater.getFeedURL())
  // autoUpdater.setFeedURL(autoUpdater.getFeedURL())

  autoUpdater.checkForUpdates()
  try {
    database()
    express()
    schedule()
  } catch (e) {
    console.log("err-->", e)
  }

  // setInterval(() => {
  //   autoUpdater.checkForUpdates()
  // }, 1000 * 60 * 60)

  // session.defaultSession.cookies
  //   .get({ url: "https://www.taobao.com" })
  //   .then(cookies => {
  //     let cookie = ""
  //     for (const item of cookies) {
  //       cookie += `${item.name}=${item.value}; `
  //     }
  //     console.log("cookies", cookie)
  //   })
  //   .catch(error => {
  //     console.log("error", error)
  //   })
})

// 모든 윈도우가 닫히면 종료된다.
app.on("window-all-closed", () => {
  // macOS에서는 사용자가 명확하게 Cmd + Q를 누르기 전까지는
  // 애플리케이션이나 메뉴 바가 활성화된 상태로 머물러 있는 것이 일반적입니다.
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // macOS에서는 dock 아이콘이 클릭되고 다른 윈도우가 열려있지 않았다면
  // 앱에서 새로운 창을 다시 여는 것이 일반적입니다.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

ipcMain.on("googlelogin", (event) => {
  const myApiOauth = new ElectronGoogleOAuth2(
    "116979256625-26drs3mrh0t4tvqh3hk9sup4cvol5hhh.apps.googleusercontent.com",
    "FkhkpEt9JbZsGPgg-7uvYSSN",
    ["https://www.googleapis.com/auth/userinfo.email"]
  )

  myApiOauth.openAuthWindowAndGetTokens().then((token) => {
    // use your token.access_token
    console.log("token", token)
    event.sender.send("googlelogin-reply", token)
  })
})
ipcMain.on("handel-click", (e) => {
  puppeteerLunch()
})

const puppeteerLunch = async () => {
  const app = await puppeteer.launch({ headless: false }) // default is true
  const pages = await app.pages()
  const [page] = pages
  await page.goto("https://bing.com")

  setTimeout(async () => await app.close(), 5000)
}

const sendStatusToWindow = (text) => {
  log.info(text)
  console.log(text)
  win.webContents.send("message", text)
}

autoUpdater.on("checking-for-update", () => {
  sendStatusToWindow("Checking for update...")
})
autoUpdater.on("update-available", (info) => {
  sendStatusToWindow("Update available.")
})
autoUpdater.on("update-not-abailable", (info) => {
  sendStatusToWindow("Updata not abailable.")
})
autoUpdater.on("error", (err) => {
  // sendStatusToWindow("Error in auto-update. " + err)
})
autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond
  log_message = log_message + " - Downloaded " + progressObj.percent + "%"
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")"
  sendStatusToWindow(log_message)
})
autoUpdater.on("update-downloaded", (event, releaseNotes, releaseName) => {
  sendStatusToWindow("Update downloaded")

  // autoUpdater.quitAndInstall()

  const dialogOpts = {
    type: "info",
    buttons: ["업데이트"],
    defaultId: 0,
    title: "업데이트가 있습니다. 프로그램을 업데이트 하세요.",
    message: process.platform === "win32" ? releaseNotes : releaseName,
  }
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall()
  })
})

// app.on("ready", async () => {
//   // createDefaultUpdateWindow()
//   autoUpdater.checkForUpdates()
// })
