import React, { useState, useContext } from "react"
import styled from "styled-components"
import { Menu, Divider } from "antd"
import {
  TrophyFilled,
  EyeOutlined,
  ShopOutlined,
  SettingOutlined,
  ExportOutlined,
  ThunderboltOutlined,
  ShoppingOutlined,
  AppleOutlined,
  TaobaoOutlined,
  ProfileOutlined,
  CalendarOutlined,
  StarOutlined,
  CopyrightOutlined,
  FireOutlined,
  UploadOutlined,
  FileExcelOutlined,
  LineChartOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  GiftOutlined,
  DisconnectOutlined,
} from "@ant-design/icons"
import { UserContext } from "context/UserContext"

const url = require("url")
const path = require("path")
const { SubMenu } = Menu
const { remote, isDev } = window

const NavMenu = () => {
  const [current, setCurrnet] = useState(1)
  const { user } = useContext(UserContext)

  const handleClick = (e) => {
    setCurrnet(e.key)
  }
  const handleHomeNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleItemWinnerNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/coupangWinner?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/coupangWinner?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleItemWinnerNewWindow1 = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/itemWinnerWindow1?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/itemWinnerWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleNaverMainKeywordNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/naverMainKeywordWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/naverMainKeywordWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleHealthFoodNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/healthFoodWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/healthFoodWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleAmazonUploadNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/amazonUploadWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/amazonUploadWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleNaverShoppingNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/naverShoppingWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/naverShoppingWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleNaverShoppingPlusNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/naverShoppingPlusWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/naverShoppingWindowPlus?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleCategoryNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/categoryWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/categoryWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleNaverFlashNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/naverFlashWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/naverFlashWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleNaverBestNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/naverBestWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/naverBestWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleKeywordNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/keywordWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/keywordWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleTaobaoFavoriteNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/taobaoFavoitedWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/taobaoFavoitedWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleTaobaoProductUploadNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/taobaoProductUploadWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/taobaoProductUploadWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleCoupangStoreNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/coupangStoreWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/coupangStoreWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleProductManageNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/productmanageWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/productmanageWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleProductCalendarNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/productCalendarWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/productCalendarWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleOrderNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/orderWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/orderWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleExplainingDataNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/explainingDataWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/explainingDataWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleSalesNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/salesWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/salesWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleLowPriceNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/lowPriceWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/lowPriceWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }
  const handleBrandNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/brandWindow?isDev=${isDev}`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/brandWindow?isDev=${isDev}`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  const handleBatchTaobaoNewWindow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/batch_taobaoWindow?isDev=${isDev}&newWindow=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/batch_taobaoWindow?isDev=${isDev}&newWindow=true`,
        protocol: "file:",
        slashes: true,
      })
      win.loadURL(startUrl)
    }
  }

  return (
    <Container>
      <Menu
        // theme={this.state.theme}
        onClick={handleClick}
        style={{ width: 220 }}
        defaultOpenKeys={["sub1", "sub11", "sub2", "sub3"]}
        selectedKeys={[current]}
        mode="inline"
      >
        <SubMenu
          style={{ fontSize: "18px" }}
          key="sub1"
          icon={<EyeOutlined style={{ fontSize: "18px" }} />}
          title="소싱"
        >
          <Menu.Item
            key="9"
            onClick={() => (window.location.hash = `#/naverMainKeyword?isDev=${isDev}`)}
          >
            <ItemContainer>
              <QuestionCircleOutlined
                style={{ color: "#268DFF", fontSize: "18px", fontWeight: "700" }}
              />
              <MenuTitle>아이템 발굴</MenuTitle>

              <NewWindowIcon onClick={handleNaverMainKeywordNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item
            key="8"
            onClick={() => (window.location.hash = `#/amazonUpload?isDev=${isDev}`)}
          >
            <ItemContainer>
              <GiftOutlined style={{ color: "#FD9907", fontSize: "18px", fontWeight: "700" }} />
              <MenuTitle>상품등록</MenuTitle>

              <NewWindowIcon onClick={handleAmazonUploadNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item key="7" onClick={() => (window.location.hash = `#/healthfood?isDev=${isDev}`)}>
            <ItemContainer>
              <DisconnectOutlined style={{ fontSize: "18px", fontWeight: "700" }} />
              <MenuTitle>건기식 발굴</MenuTitle>

              <NewWindowIcon onClick={handleHealthFoodNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item
            key="10"
            onClick={() => (window.location.hash = `#/naverShopping?isDev=${isDev}`)}
          >
            <ItemContainer>
              <ShoppingOutlined style={{ color: "#20C73D", fontSize: "18px" }} />
              <MenuTitle>네이버 쇼핑</MenuTitle>

              <NewWindowIcon onClick={handleNaverShoppingNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>

          <Menu.Item
            key="100"
            onClick={() => (window.location.hash = `#/naverShoppingPlus?isDev=${isDev}`)}
          >
            <ItemContainer>
              <ShoppingOutlined style={{ color: "#20C73D", fontSize: "18px" }} />
              <MenuTitle>네이버 쇼핑 +</MenuTitle>

              <NewWindowIcon onClick={handleNaverShoppingPlusNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item
            key="18"
            onClick={() => (window.location.hash = `#/coupangStore?isDev=${isDev}`)}
          >
            <ItemContainer>
              <CopyrightOutlined style={{ color: "#530402", fontSize: "18px" }} />
              <MenuTitle>쿠팡 상점</MenuTitle>
              <NewWindowIcon onClick={handleCoupangStoreNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item
            key="11"
            onClick={() => (window.location.hash = `#/coupangWinner?isDev=${isDev}`)}
          >
            <ItemContainer>
              <TrophyFilled style={{ color: "#ffd700", fontSize: "18px" }} />
              <MenuTitle>아이템위너 매칭</MenuTitle>

              <NewWindowIcon onClick={handleItemWinnerNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          {/* {user.id === "5f0d5ff36fc75ec20d54c40b" && (
            <Menu.Item
              key="111"
              onClick={() => (window.location.hash = `#/itemWinner1?isDev=${isDev}`)}
            >
              <ItemContainer>
                <TrophyFilled style={{ color: "#ffd700", fontSize: "18px" }} />
                <MenuTitle>아이템템위너 1</MenuTitle>
                <NewWindowIcon onClick={handleItemWinnerNewWindow1}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          )} */}
          {/* <Menu.Item
            key="12"
            onClick={() => (window.location.hash = `#/naverFlash?isDev=${isDev}`)}
          >
            <ItemContainer>
              <ThunderboltOutlined style={{ color: "#FF3377", fontSize: "18px" }} />
              <MenuTitle>베스트 상품</MenuTitle>
              <NewWindowIcon onClick={handleNaverFlashNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item key="13" onClick={() => (window.location.hash = `#/naverBest?isDev=${isDev}`)}> */}
          {/* <ItemContainer>
              <FireOutlined style={{ color: "#DB2E1E", fontSize: "18px" }} />
              <MenuTitle>금주의 핫템</MenuTitle>
              <NewWindowIcon onClick={handleNaverBestNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer> */}
          {/* </Menu.Item> */}
          {/* <Menu.Item key="14" onClick={() => (window.location.hash = `#/category?isDev=${isDev}`)}>
            <ItemContainer>
              <ClusterOutlined style={{ color: "#1190FF", fontSize: "18px" }} />
              <MenuTitle>카테고리</MenuTitle>
              <NewWindowIcon onClick={handleCategoryNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item> */}
          {/* <Menu.Item key="15" onClick={() => (window.location.hash = `#/keyword?isDev=${isDev}`)}>
            <ItemContainer>
              <KeyOutlined style={{ color: "#9c27b0", fontSize: "18px" }} />
              <MenuTitle>키워드</MenuTitle>
              <NewWindowIcon onClick={handleKeywordNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item> */}
          <Menu.Item key="16" onClick={() => (window.location.hash = `#/product?isDev=${isDev}`)}>
            <ItemContainer>
              <TaobaoOutlined style={{ color: "#FF5500", fontSize: "18px" }} />
              <MenuTitle>타오바오</MenuTitle>
              <NewWindowIcon onClick={handleTaobaoProductUploadNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          {/* <Menu.Item
            key="17"
            onClick={() => (window.location.hash = `#/taobaofavorite?isDev=${isDev}`)}
          >
            <ItemContainer>
              <StarOutlined style={{ color: "#FF9A00", fontSize: "18px" }} />
              <MenuTitle>즐겨찾기</MenuTitle>
              <NewWindowIcon onClick={handleTaobaoFavoriteNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item> */}
        </SubMenu>
        {user.id === "5f0d5ff36fc75ec20d54c40b" && (
          <SubMenu
            style={{ fontSize: "18px" }}
            key="sub11"
            icon={<UploadOutlined style={{ fontSize: "18px" }} />}
            title="일괄등록"
          >
            <Menu.Item
              key="11-1"
              onClick={() => (window.location.hash = `#/batch_taobao?isDev=${isDev}`)}
            >
              <ItemContainer>
                <ThunderboltOutlined style={{ color: "#FF3377", fontSize: "18px" }} />
                <MenuTitle>상품검색</MenuTitle>

                <NewWindowIcon onClick={handleBatchTaobaoNewWindow}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          </SubMenu>
        )}
        <SubMenu
          style={{ fontSize: "18px" }}
          key="sub2"
          icon={<ShopOutlined style={{ fontSize: "18px" }} />}
          title="상품관리"
        >
          {(user.grade === "1" || user.id === "603de5004f06203d14d09186") && (
            <Menu.Item key="20" onClick={() => (window.location.hash = `#/order?isDev=${isDev}`)}>
              <ItemContainer>
                <RocketOutlined style={{ color: "#0288D1", fontSize: "20px" }} />
                <MenuTitle>배송관리</MenuTitle>
                <NewWindowIcon onClick={handleOrderNewWindow}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          )}
          <Menu.Item
            key="21"
            onClick={() => (window.location.hash = `#/productmanage?isDev=${isDev}`)}
          >
            <ItemContainer>
              <ProfileOutlined style={{ color: "#EC407A", fontSize: "18px" }} />
              <MenuTitle>상품관리</MenuTitle>
              <NewWindowIcon onClick={handleProductManageNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          <Menu.Item
            key="22"
            onClick={() => (window.location.hash = `#/productCalendar?isDev=${isDev}`)}
          >
            <ItemContainer>
              <CalendarOutlined style={{ color: "#388E3C", fontSize: "18px" }} />
              <MenuTitle>상품달력</MenuTitle>
              <NewWindowIcon onClick={handleProductCalendarNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          {user.grade === "1" && (
            <Menu.Item key="26" onClick={() => (window.location.hash = `#/sales?isDev=${isDev}`)}>
              <ItemContainer>
                <LineChartOutlined style={{ color: "#0288D1", fontSize: "18px" }} />
                <MenuTitle>매출달력</MenuTitle>
                <NewWindowIcon onClick={handleSalesNewWindow}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          )}
          {(user.grade === "1" || user.id === "603de5004f06203d14d09186") && (
            <Menu.Item
              key="23"
              onClick={() => (window.location.hash = `#/explainingData?isDev=${isDev}`)}
            >
              <ItemContainer>
                <FileExcelOutlined style={{ color: "#EA80FC", fontSize: "18px" }} />
                <MenuTitle>소명자료</MenuTitle>
                <NewWindowIcon onClick={handleExplainingDataNewWindow}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          )}
          <Menu.Item key="24" onClick={() => (window.location.hash = `#/brand?isDev=${isDev}`)}>
            <ItemContainer>
              <AppleOutlined style={{ color: "#FF1744", fontSize: "18px" }} />
              <MenuTitle>브랜드/금지단어</MenuTitle>
              <NewWindowIcon onClick={handleBrandNewWindow}>
                <ExportOutlined style={{ marginRight: "0" }} />
              </NewWindowIcon>
            </ItemContainer>
          </Menu.Item>
          {user.id === "5f0d5ff36fc75ec20d54c40b" && (
            <Menu.Item
              key="25"
              onClick={() => (window.location.hash = `#/lowPrice?isDev=${isDev}`)}
            >
              <ItemContainer>
                <LineChartOutlined style={{ fontSize: "18px" }} />
                <MenuTitle>최적가 관리</MenuTitle>
                <NewWindowIcon onClick={handleLowPriceNewWindow}>
                  <ExportOutlined style={{ marginRight: "0" }} />
                </NewWindowIcon>
              </ItemContainer>
            </Menu.Item>
          )}
        </SubMenu>
        {/* <SubMenu
          style={{ fontSize: "18px" }}
          key="sub3"
          icon={<SettingOutlined style={{ fontSize: "18px" }} />}
          title="키워드 두구"
        >
          <Menu.Item key="31" onClick={() => (window.location.hash = "#/keywordtool1")}>
            키워드 1
          </Menu.Item>
        </SubMenu> */}

        <SubMenu
          style={{ fontSize: "18px" }}
          key="sub4"
          icon={<SettingOutlined style={{ fontSize: "18px" }} />}
          title="설정"
        >
          {user.grade === "1" && (
            <Menu.Item key="41" onClick={() => (window.location.hash = "#/basicSetting")}>
              기본설정
            </Menu.Item>
          )}
          {user.grade === "1" && (
            <Menu.Item key="42" onClick={() => (window.location.hash = "#/marketSetting")}>
              마켓설정
            </Menu.Item>
          )}
          <Menu.Item key="43" onClick={() => (window.location.hash = "#/soEasySetting")}>
            SOEASY
          </Menu.Item>
        </SubMenu>
      </Menu>
      {/* <Divider /> */}
    </Container>
  )
}

export default NavMenu

const Container = styled.div`
  width: 220px;
  height: 100%;
  /* height: calc(100vh - 80px); */
`

const MenuTitle = styled.div`
  text-align: left;
  width: 100%;
  font-size: 14px;
  margin-left: -5px;
`
const ItemContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > :nth-child(1) {
    max-width: 20px;
    min-width: 20px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

const NewWindowIcon = styled.div`
  min-width: 30px;
  max-width: 30px;
  min-height: 30px;
  max-height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  /* padding: 10px; */
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    background: ${(props) => props.theme.primaryLight};
    box-shadow: 0 0 0.1em, 0 0 0.3em;
  }
`

const ExtensionContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
`

const ExtensionIcon = styled.img`
  width: 20px;
  margin-right: 5px;
`
const ExtensionIconSub = styled.img`
  width: 18px;
  margin-right: 5px;
`

const ExtensionItemContainer = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  margin-left: 40px;
  cursor: pointer;
`