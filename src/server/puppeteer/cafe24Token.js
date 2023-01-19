const startBrowser = require("./startBrowser")
const Market = require("../models/Market")

const start = async () => {
  
  try {
    let urls = [
      "https://tsnullp.chickenkiller.com/cafe24/token1?mallid=tsnullp",
      "https://tsnullp.chickenkiller.com/cafe24/token1?mallid=jym28",
      "https://tsnullp.chickenkiller.com/cafe24/token1?mallid=metatron79",
      "https://tsnullp.chickenkiller.com/cafe24/token1?mallid=jym2228",
      "https://tsnullp.chickenkiller.com/cafe24/token1?mallid=disel39",
      "https://tsnullp.chickenkiller.com/cafe24/token2?mallid=tstwop",
      "https://tsnullp.chickenkiller.com/cafe24/token2?mallid=jym28jym28",
      "https://tsnullp.chickenkiller.com/cafe24/token2?mallid=tsonepoint",
      "https://tsnullp.chickenkiller.com/cafe24/token3?mallid=zitane41",
      "https://tsnullp.chickenkiller.com/cafe24/token3?mallid=jymjym28",
      "https://tsnullp.chickenkiller.com/cafe24/token3?mallid=tsthreepoint",
    ]

    for (const url of urls) {
      const browser = await startBrowser(false)
      const page = await browser.newPage()
      await page.setJavaScriptEnabled(true)
      await page.setDefaultNavigationTimeout(0)
      await page.goto(url, { waituntil: "networkidle0" })
      try {
        const mallID = url.split("=")[1]
        const market = await Market.findOne(
          {
            "cafe24.mallID": mallID
          }
        )
        if(market) {
          
  
          const opts = {
            delay: 6 + Math.floor(Math.random() * 2), //每个字母之间输入的间隔
          }
  
          await page.tap("#mall_id")
          await page.type("#mall_id", mallID, opts)
          await page.tap("#userpasswd")
          await page.type("#userpasswd", market.cafe24.password, opts)
          await page.keyboard.press("Enter")
  
          await page.waitFor(5000)
  
          try {
            if (await page.$("#iptBtnEm")) {
              await page.click("#iptBtnEm")
              await page.waitFor(8000)
            }
          } catch {}
        } 
       
      } catch (e) {
        console.log("??/", e)
      } finally {
        await browser.close()
      }
      
    }
  } catch(e) {
  console.log("aaa", e)
  }finally {
    
    console.log("끝")
  }
}

module.exports = start