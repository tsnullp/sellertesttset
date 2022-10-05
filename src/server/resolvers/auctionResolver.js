const startBrowser = require("../puppeteer/startBrowser")
const {GetComplexNo} = require("../api/RealEstate")

const resolvers = {
  Query: {},
  Mutation: {
    AuctionList: async (parent, {}, {logger}) => {
      try {
        const browser = await startBrowser(false)
        const page = await browser.newPage()
        await page.setDefaultNavigationTimeout(0)
        await page.setJavaScriptEnabled(true)

        await page.goto("https://www.bossauction.co.kr/auction/search2.html?page=1&gbn=auction&listnum=20&srcType=%EC%A2%85%ED%95%A9&sday_s=&sday_e=&syear=&sno=&sgubn=&sido1=&gugun1=&dong1=&bunji=&court1=&damdang1=&yongdoarea=&yongdoarea_txt=&addr=&gamMin=0&gamMax=160000000&lowMin=0&lowMax=0&gamyear=&larea_min=&larea_max=&barea_min=&barea_max=&bsyear=&beyear=&eng=12%2C15&uchal_min=&uchal_max=&gamdb_min=&gamdb_max=&sagunname=&use1%5B%5D=01", {
            waitUntil: "networkidle0"
          })
        await page.waitForSelector("#printarea")

        const total = await page.$eval(
          ".total",
          el => el.innerText
        )
        
        
        const table = await page.$$eval("#printarea > tbody > tr", element => {
          return element.map(ele => {
            const temp1 = ele.querySelector("tr > td:nth-child(3) > p:nth-child(1)").textContent
            const temp2 = ele.querySelector("tr > td:nth-child(3) > p:nth-child(2)").textContent
            const temp3 = ele.querySelector("tr > td:nth-child(3) > p:nth-child(3)").textContent
            const temp4 = temp3.split(" ")[1].split("㎡")[0]
            const temp5 = temp3.split("(")[1].split("평")[0]
            let competitive = false
            try {
              const temp6 = ele.querySelector("tr > td:nth-child(3) > p:nth-child(4)").textContent
              if(temp6.includes("대항력")){
                competitive = true
              }
            } catch (e){}
            
            
            return {
              id: ele.querySelector("tr > td:nth-child(1) > input").getAttribute("id").replace("chkpno_", ""),
              image: ele.querySelector("tr > td:nth-child(2) > .photo > div > .img > img:nth-child(1)").getAttribute("src"),
              법원: temp1.split(" ")[0],
              사건번호: temp1.split("계 ")[1],
              물건종류: temp2.split("] ")[0].split("[")[1],
              addres: temp2.split("] ")[1],
              감정가: Number(ele.querySelector("tr > td:nth-child(4) > p:nth-child(1)").textContent.replace(/,/gi, "")),
              최저가: Number(ele.querySelector("tr > td:nth-child(4) > p:nth-child(2)").textContent.replace(/,/gi, "")),
              매각기일: ele.querySelector("tr > td:nth-child(5)").textContent.split("(")[0],
              competitive,
              area1: Number(temp4),
              area2: Number(temp5),
            }
          })
        })
        console.log("table", table)
        
        await getDetail({page, id: table[0].id})
        // await getDetail({page, id: "798275"})
        return false
      } catch (e){
        logger.error(`AuctionList: ${e}`)
        return false
      }
    }
  }
}


const getDetail = async ({page, id}) => {

  await page.goto(
    `https://www.bossauction.co.kr/auction/view.html?product_id=${id}`,
    {
      waituntil: "networkidle0"
    }
  )

  const priceM = await page.$$eval("#aptm > tbody > tr", element => {
    return element.map(ele => {
      const area = ele.querySelector("tr > td:nth-child(2)").innerText
      const area1 = Number(area.split(" ")[0])
      const area2 = Number(area.split("(")[1].split("평")[0])
      return {
        name: ele.querySelector("tr > td:nth-child(1)").innerText,
        area1,
        area2,
        contractDate: ele.querySelector("tr > td:nth-child(3)").innerText + ele.querySelector("tr > td:nth-child(4)").innerText,
        floor: ele.querySelector("tr > td:nth-child(5)").innerText,
        mPrice: ele.querySelector("tr > td:nth-child(6)").innerText,
        rPrice: ele.querySelector("tr > td:nth-child(7)").innerText,

      }
    })
  })

  console.log("priceM", priceM)

  const priceJ = await page.$$eval("#aptj > tbody > tr", element => {
    return element.map(ele => {
      const area = ele.querySelector("tr > td:nth-child(3)").innerText
      const area1 = Number(area.split(" ")[0])
      const area2 = Number(area.split("(")[1].split("평")[0])
      return {
        name: ele.querySelector("tr > td:nth-child(1)").innerText,
        area1,
        area2,
        contractDate: ele.querySelector("tr > td:nth-child(4)").innerText + ele.querySelector("tr > td:nth-child(5)").innerText,
        floor: ele.querySelector("tr > td:nth-child(6)").innerText,
        jPrice: ele.querySelector("tr > td:nth-child(7)").innerText,

      }
    })
  })

  console.log("priceJ", priceJ)
  
  // const priceTable = await page.$$eval(".aside > #noprint > dl:nth-child(6) > dd", element => {
  //   console.log("elemrnt", element.length)
  //   return element.map(ele => {
  //     return {
  //       href: ele.querySelector("a").getAttribute("href"),
  //       name: ele.querySelector("a").innerText
  //     }
  //   })
  // })

  // console.log("priceTable", priceTable)
  // const tempPriceTable = priceTable.filter(item => item.name === "NAVER시세")
  // const naverInfo = tempPriceTable.length > 0 ? tempPriceTable[0] : null
  // if(naverInfo){
  //   const lat = naverInfo.href.split(",")[0].split("=")[1]
  //   const lng = naverInfo.href.split(",")[1].split(",")[0]
  //   console.log("lat lng", lat, lng)
  //   const complex = await GetComplexNo({lat, lng})
  //   console.log("complex", complex)
  // }

  

}
module.exports = resolvers
