window.ipcRenderer = require("electron").ipcRenderer
window.shell = require("electron").shell
window.remote = require("electron").remote
window.isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true") : false