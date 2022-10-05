const startBrowser = require("./startBrowser")
const moment = require("moment")
const url = require("url")

const start = async ({keyword}) => {
  const browser = await startBrowser()
  const page = await browser.newPage()
  try {
    await page.setJavaScriptEnabled(true)
    
    const productList = []
    const pageIndex = [1, 2, 3]
    for(const i in pageIndex){
      const list = await getProductList({page, keyword, pageIndex: i+1})
      productList.push(
        ...list
      )
    }
    
    
    return productList
  } catch (e) {
    
  } finally {
    if (page) {
      await page.goto("about:blank")
      await page.close()
    }
    if (browser) {
      await browser.close()
    }
  }
}

module.exports = start

const getProductList = async ({page, keyword, pageIndex=1}) =>{
  try {
    await page.goto(`https://www.coupang.com/np/search?rocketAll=false&q=${keyword}&page=${pageIndex}&brand=&offerCondition=&filter=&availableDeliveryFilter=&filterType=&isPriceRange=false&priceRange=&minPrice=&maxPrice=&page=1&trcid=&traid=&filterSetByUser=true&channel=user&backgroundColor=&component=&rating=0&sorter=scoreDesc&listSize=72`, { waituntil: "networkidle0"})
                   
    const productList = await page.$$eval("#productList > li", element => {
      return element.map(ele => {
        let date = null
        if(ele.querySelector(
          ".delivery > .arrival-info"
        )){
          const tempDate = ele.querySelector(
            ".delivery > .arrival-info > em:nth-child(1)"
          ).textContent.trim()

          if(tempDate.split(" ").length > 1){
            const count = tempDate.split(" ").length
            date = tempDate.split(" ")[count]
          } else {
            
            date = tempDate
          }
        }
        return {

          link: `https://www.coupang.com${ele
            .querySelector("a")
            .getAttribute("href")
            .trim()}`,
          date,
          name: ele.querySelector(".name").textContent
        }
      })
    })
    // console.log("product----", productList)
    return productList.filter(item => {
      if(item.date){
        
        const diff = moment(item.date, "M/D").diff(moment().toDate(), "days") + 1
      
        if(diff > 7) return true
      }
      return false
    })
  } catch (e) {
    console.log("getProductList", e)
    return []
  }
  
}