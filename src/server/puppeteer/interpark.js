const startBrowser = require("./startBrowser")

const start = async ({ cafe24MallID, cafe24Password, userID, password }) => {
  const browser = await startBrowser(false)
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)
  try {
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    const interPartPage = await browser.newPage()
    await interPartPage.goto("https://seller.interpark.com/login", { waituntil: "networkidle0" })
    await interPartPage.tap("#memId")
    await interPartPage.type("#memId", userID, opts)
    await interPartPage.tap("#memPwd")
    await interPartPage.type("#memPwd", password, opts)
    await interPartPage.keyboard.press("Enter")
    await interPartPage.waitFor(2000)
    await interPartPage.reload()

    if (userID === "jym2228") {
      await interPartPage.goto("https://seller.interpark.com/login/auth-member", {
        waituntil: "networkidle0"
      })
      await interPartPage.click(
        "body > div > div > div > div > table > tbody > tr:nth-child(13) > td:nth-child(6) > button"
      )
    }

    await page.goto("https://eclogin.cafe24.com/Shop/", { waituntil: "networkidle0" })

    await page.tap("#mall_id")
    await page.type("#mall_id", cafe24MallID, opts)
    await page.tap("#userpasswd")
    await page.type("#userpasswd", cafe24Password, opts)
    await page.keyboard.press("Enter")

    await page.waitFor(5000)
    
    if (await page.$("#iptBtnEm")) {
      await page.click("#iptBtnEm")
      await page.waitFor(5000)
    }
    
    await page.waitForSelector("#QA_Lnb_Menu1553")
    await page.hover("#QA_Lnb_Menu1553")

    // await page.mouse.down()
    await page.click("#QA_Lnb_Menu1553")

    const marketPage = await browser.newPage()
    await page.waitFor(5000)

    await marketPage.goto(
      `https://${cafe24MallID}.shopcafe.cafe24.com/mp/product/front/manageList?page=${1}&search_sending_status[0]=send_status_W&search_sending_status[1]=send_status_F&search_sending_status[2]=send_status_T&market_select[]=inpark|${userID}&search_sending_status[]=send_status_W&search_sending_status[]=send_status_F&search_sending_status[]=send_status_T&search_status_code[]=ALL&search_status_code[]=S3&search_status_code[]=S6&search_status_code[]=S7&market_code_select=inpark&market_code[]=inpark&market_user_id[]=${userID}`,
      {
        waituntil: "networkidle0"
      }
    )

    const total = await marketPage.$eval(
      ".table-top-info > .top-txt-inline > .txt-inline > strong",
      el => el.innerText
    )

    const totalPage = Math.ceil(Number(total.replace(/,/gi, "") || 0) / 10)

    for (let i = 1; i <= totalPage; i++) {
      if (i !== 1) {
        await marketPage.goto(
          `https://${cafe24MallID}.shopcafe.cafe24.com/mp/product/front/manageList?page=${i}&search_sending_status[0]=send_status_W&search_sending_status[1]=send_status_F&search_sending_status[2]=send_status_T&market_select[]=inpark|${userID}&search_sending_status[]=send_status_W&search_sending_status[]=send_status_F&search_sending_status[]=send_status_T&search_status_code[]=ALL&search_status_code[]=S3&search_status_code[]=S6&search_status_code[]=S7&market_code_select=inpark&market_code[]=inpark&market_user_id[]=${userID}`,
          {
            waituntil: "networkidle0"
          }
        )
      }

      const productList = await getProductID({ page: marketPage })

      for (const item of productList) {
        if (item.length > 0) {
          await detailInterPark({ page: interPartPage, prd_no: item })
        }
      }
    }
    return
  } catch (e) {
    console.log("interpark===", e.message)
  } finally {
    await browser.close()
    console.log("끝")
  }
}

module.exports = start

const getProductID = async ({ page }) => {
  try {
    const productList = await page.$$eval(
      "#eMultiTable > tbody > tr > td > .om_product.hand",
      element => {
        return element.map(item => {
          return item.textContent
        })
      }
    )

    return productList.filter(item => item.length > 0)
  } catch (e) {
    console.log("getProductID", e.message)
    return []
  }
}

const detailInterPark = async ({ page, prd_no }) => {
  try {
    //https://seller.interpark.com/views/products/modify/

    await page.goto(`https://seller.interpark.com/views/products/modify/${prd_no}`, {
      waituntil: "networkidle0"
    })

    await page.click("#abroadBsYnStr")
    await page.waitFor(200)
    await page.$eval("#abroadBsYnChk", checks => (checks.checked = true))
    await page.$eval("#abroadBsYn", checks => (checks.value = "I"))
    
    await page.click(".uBlock.infoNotify")
    await page.waitFor(200)
    // await page.$eval("#allDetailSetting", checks => (checks.checked = true))
    // await page.$eval("#allDetailSetting", checks => (checks.value = true))
    
    await page.click("#registProductForm > div.uBlock.infoNotify.on > div.blockContent > div > div.uInputBox > div.uInputCheck > label > span")
    
    
    // await page.$eval("#abroadBsYn", checks => (checks.value = "I"))
    // await page.tap("#abroadBsYn", "I")
    // #abroadBsYnChk
    await page.waitFor(1000)
    await page.click(".uBtn.btnRegist")
    // await button.click()
    await page.waitFor(3000)
  } catch (e) {
    console.log("detailInterPark", e.message)
  }
}
