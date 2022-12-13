const winston = require("winston")
const winstonDaily = require("winston-daily-rotate-file")
const moment = require("moment")
const path = require("path")
const fs = require("fs")
const { getAppDataPath } = require("./usrFunc")

require("../server/setup/config")

const timeStampFormat = () => {
  return moment().format("YYYY-MM-DD HH:mm:SS.SSS ZZ")
}

const appDataDirPath = getAppDataPath()

// Create appDataDir if not exist
if (!fs.existsSync(appDataDirPath)) {
  fs.mkdirSync(appDataDirPath)
}

if (!fs.existsSync(path.join(appDataDirPath, "log"))) {
  fs.mkdirSync(path.join(appDataDirPath, "log"))
}

if (!fs.existsSync(path.join(appDataDirPath, "log", "server"))) {
  fs.mkdirSync(path.join(appDataDirPath, "log", "server"))
}

if (!fs.existsSync(path.join(appDataDirPath, "log", "exception"))) {
  fs.mkdirSync(path.join(appDataDirPath, "log", "exception"))
}

//logger 설정
const logger = winston.createLogger({
  transports: [
    // new winstonDaily({
    // 	name: 'info-file',
    // 	filename: './log/server/%DATE%.log',
    // 	datePattern: 'YYYY-MM-DD',
    // 	colorize: false,
    // 	zippedArchive: true,
    // 	maxsize: '20m',
    // 	maxFiles: '14d',
    // 	level: 'debug',
    // 	showLevel: true,
    // 	json: false,
    // 	timestamp: timeStampFormat,
    // 	format: winston.format.printf(
    // 		info => `[${info.level.toUpperCase()}] - ${timeStampFormat()}\n${info.message}`
    // 	),
    // }),

    new winstonDaily({
      name: "info-file",
      filename:
        // process.env.NODE_ENV === "production"
        //   ? path.join(appDatatDirPath, "log/server/%DATE%.log")
        //   : "./log/server_dev/%DATE%.log",
        path.join(appDataDirPath, "log/server/%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      colorize: false,
      zippedArchive: true,
      maxsize: "20m",
      maxFiles: "14d",
      level: "info",
      showLevel: true,
      json: false,
      timestamp: timeStampFormat,
      format: winston.format.printf(
        info => `[${info.level.toUpperCase()}] - ${timeStampFormat()}\n${info.message}`
      )
    }),
    new winston.transports.Console({
      name: "debug-console",
      colorize: true,
      level: "debug",
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })
  ],
  exceptionHandlers: [
    new winstonDaily({
      name: "exception-file",
      filename:
        // process.env.NODE_ENV === "production"
        // ? path.join(appDatatDirPath, "log/exception/%DATE%.log")
        // : "./log/exception_dev/%DATE%.log",
        path.join(appDataDirPath, "log/exception/%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      colorize: false,
      zippedArchive: true,
      maxsize: "20m",
      maxFiles: "14d",
      level: "error",
      showLevel: true,
      json: false,
      timestamp: timeStampFormat,
      format: winston.format.printf(
        info =>
          `${timeStampFormat()} [${info.level.toUpperCase()}] - ${info.message} \n ${info.stack}`
      )
    }),
    new winston.transports.Console({
      name: "exception-console",
      colorize: true,
      level: "debug",
      showLevel: true,
      json: false,
      timestamp: timeStampFormat
    })
  ]
})

module.exports = logger
