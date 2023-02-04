const startBrowser = require("./startBrowser")
const DeliveryInfo = require("../models/DeliveryInfo")
const DeliveryImage = require("../models/DeliveryImage")
const MarketOrder = require("../models/MarketOrder")
const User = require("../models/User")
const Market = require("../models/Market")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")
const fs = require("fs")
const path = require("path")
const { getAppDataPath, imageEncodeToBase64, sleep } = require("../../lib/usrFunc")

const { Cafe24ListOrders, Cafe24RegisterShipments, Cafe24UpdateShipments } = require("../api/Market")
const _ = require("lodash")

let listDataArr = []

const start = async ({  userID, loginID, password }) => {
  const browser = await startBrowser(false)
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)
  try {

  
    // console.log("response------------", response)
    //response.market_order_info
  
    listDataArr = []
    await page.goto("https://www.tabae.co.kr/", { waituntil: "networkidle0" })

    await page.waitForSelector(
      ".login-area > div.inner > h3", { timeout: 120000 }
    )
    
    await page.waitFor(1000)

    let isNext = true
    let pageIndex = 1
    while(isNext) {
      await page.goto(`https://www.tabae.co.kr/Front/Acting/Order_L.asp?gMnu1=206&gMnu2=20601&sGo=${pageIndex}&sReqDvsCd=&sStateSeq=&sSvcDvsCd=&sBeginDt=&sEndDt=&sCtmsSameYn=&sFreightIvcYn=&sOrderNo=&sTrkNo=&sConsNmKr=&sProNm=&sProNo=&sIvcNo=&sMarketNm=&sMarketOrderNo=&sShopOrderNo=`, {
        waituntil: "networkidle0"
      })
      const table = await page.$$eval(
        "#frmList > .list-container > .project-con",
        element => {
          return element.map(ele => {
            return {
              orderNumber: ele.querySelector(".project-name > h4 > a").textContent.trim(),
              shippingNumber: ele.querySelector("strong.num").textContent.trim()
            }
          })
        }
      )
  
      if(!table || table.length === 0) {
        isNext = false
      }
      
      for (const tableItem of table) { 
        console.log("tableItem", tableItem)
        await searchDetailPage({ browser, tableItem, userID })
      }
      if (table && Array.isArray(table)) {
        listDataArr.push(...table)
      }
      pageIndex++
    }

  } catch (e) {
    console.log("searchDeliveryDestination", e)
    
    if (browser) {
      await browser.close()
    }
  } finally {
    if (browser) {
      await browser.close()
    }
  }
}

module.exports = start

const searchDetailPage = async ({ browser, tableItem, userID }) => {
  const page = await browser.newPage()
  try {

    await page.goto(
      `https://www.tabae.co.kr/Front/Acting/Order_V.asp?sOrderNo=${tableItem.orderNumber}`,
      {
        waituntil: "networkidle0"
      }
    )
    page.on("dialog", async dialog => {
      if (dialog) {
        await dialog.dismiss()
      }
    })

    await page.waitFor(1000)

    await page.waitForSelector(
      ".content > .service_area"
    )

    
    const 주문번호 = await page.$eval(
      "#wrapper > div.container > div:nth-child(2) > div > div > .content > .service_area > .service_inner:nth-child(1) > div",
      element => {
        return element.textContent.trim()
      }
    )

   
    const 상태 = await page.$eval(
      "#wrapper > div.container > div:nth-child(2) > div > div > .content > .service_area > .service_inner:nth-child(2) > div",
      element => {
        return element.textContent.trim()
      }
    )
    
    const 수취인주소 = await page.$eval(
      "#wrapper > div.container > div:nth-child(3) > div > div > .content > .service_area > .service_inner:nth-child(5) > div",
      element => {
        const postNumber = element.textContent.substr(1, 5).trim()
        return {
          postNumber,
          addr: element.textContent.replace(`(${postNumber})`, "").trim()
        }
      }
    )

    const 수취인이름 = await page.$eval(
      "#wrapper > div.container > div:nth-child(3) > div > div > .content > .service_area > .service_inner:nth-child(1) > div",
      element => {
        return element.textContent.split("/")[0].trim()
      }
    )

    const 수취인연락처 = await page.$eval(
      "#wrapper > div.container > div:nth-child(3) > div > div > .content > .service_area > .service_inner:nth-child(3) > div",
      element => {
        return element.textContent.trim()
      }
    )

    const 개인통관부호 = await page.$eval(
      "#wrapper > div.container > div:nth-child(3) > div > div > .content > .service_area > .service_inner:nth-child(2) > div",
      element => {
        return element.textContent
          .split(":")[1]
          .split("(")[0]
          .trim()
      }
    )

    
    const orderTables = await page.$$eval(
      "#wrapper > div.container > div:nth-child(4) > div > div > .content > ul > li",
      element => {
        
        return element
          .map(item => {
            return {
              trackingNo: item.querySelector("div > div.col > div > div > div > div:nth-child(1) > div").textContent.trim(),
              orderNo: item.querySelector("div > div.col > div > div > div > div:nth-child(2) > div").textContent.trim(),
              오픈마켓명: item.querySelector("div > div.col > div > div > div > div:nth-child(11) > div").textContent.trim(),
              오픈마켓주문번호: item.querySelector("div > div.col > div > div > div > div:nth-child(12) > div").textContent.trim().replace("'", "")
            }
          })
      }
    )

    let 무게 = "0"
    let 배송비용 = "0"
    try {
    
     
      await page.waitForSelector(
        "#wrapper > div.container > div:nth-child(5) > div:nth-child(2) > div > .content > .service_area > .service_inner:nth-child(1) > div",
        { timeout: 1000 }
      )
      let 결제정보 = await page.$eval(
        "#wrapper > div.container > div:nth-child(5) > div:nth-child(2) > div > .content > .service_area > .service_inner:nth-child(1) > div",
        element => {
          return element.textContent.trim()
        }
      )

      if(결제정보 && 결제정보.includes("총 결제 금액")){
        배송비용 = 결제정보.split("￦")[1].split("(")[0].replace(/,/gi, "").trim()
        무게 = 결제정보.split("적용무게 : ")[1].split("kg")[0].trim()
      }

      
    } catch (e) {

      // console.log("무슨에러??", e)
    }

    let customs = []
    let deliveryTracking = []


    const userGroup = await User.findOne({
      _id: ObjectId(userID)
    })

    if(userGroup && userGroup.group){
      const userGroups = await User.find({
        group: userGroup.group
      })

      const startDate = moment().subtract(2, "month").format("YYYY-MM-DD")
      const endDate = moment().format("YYYY-MM-DD")

      const promiseArr = userGroups.map(user => {
        return new Promise(async (resolve, reject) => {
          try {
            const market = await Market.findOne(
              {
                userID: ObjectId(user._id)
              }
            )             
            const cafe24OrderResponse = await Cafe24ListOrders({mallID : market.cafe24.mallID,
              orderState: "상품준비",
              startDate, endDate
            })
            
            const temp = await DeliveryInfo.findOne({
              userID: ObjectId(user._id),
              orderNo: 주문번호
            })
            const deliveySave = await DeliveryInfo.findOneAndUpdate(
              {
                userID: ObjectId(user._id),
                orderNo: 주문번호
              },
              {
                $set: {
                  userID: ObjectId(user._id),
                  orderSeq: tableItem.id,
                  orderNo: 주문번호,
                  상태,
                  수취인주소: 수취인주소.addr,
                  수취인우편번호: 수취인주소.postNumber,
                  수취인이름: 수취인이름,
                  수취인연락처,
                  개인통관부호,
                  orderItems: orderTables.map((item, i) => {
                    return {
                      taobaoTrackingNo: item.trackingNo.replace("Tracking# 등록", ""),
                      taobaoOrderNo:
                        temp && temp.orderItems[i] && temp.orderItems[i].taobaoOrderNo.length > 0
                          ? temp.orderItems[i].taobaoOrderNo
                          : item.orderNo,
                      오픈마켓주문번호:
                        temp && temp.orderItems[i] && temp.orderItems[i].오픈마켓주문번호.length > 0
                          ? temp.orderItems[i].오픈마켓주문번호
                          : item.오픈마켓주문번호
                    }
                  }),
                  무게: Number(무게),
                  배송비용: Number(배송비용),
                  shippingNumber: tableItem.shippingNumber,
                  customs,
                  deliveryTracking,
                  isDelete: 상태 === "포장요청오류" ? true : false
                }
              },
              { upsert: true, new:true }
            )
            
            if(tableItem.shippingNumber.indexOf(9) === 0 && deliveySave.orderItems){
              console.log("경동택배", 주문번호, tableItem.shippingNumber)
              for(const item of deliveySave.orderItems){
                console.log("item.오픈마켓주문번호", item.오픈마켓주문번호)
                await MarketOrder.findOneAndUpdate(
                  {
                    userID: ObjectId(user._id),
                    orderId: item.오픈마켓주문번호
                  },
                  {
                    $set: {
                      invoiceNumber: tableItem.shippingNumber,
                      deliveryCompanyName: "경동택배"
                    }
                  },
                  { upsert: true }
                )
              }
              
            }
        
            // if (customs && Array.isArray(customs) && customs.length > 0) {
            //   await DeliveryImage.findOneAndUpdate(
            //     {
            //       userID: ObjectId(userID),
            //       shippingNumber: tableItem.shippingNumber
            //     },
            //     {
            //       $set: {
            //         shippingNumber: tableItem.shippingNumber,
            //         customsImage: customsImageBase64
            //       }
            //     },
            //     { upsert: true }
            //   )
            // }
            // if (deliveryTracking && Array.isArray(deliveryTracking) && deliveryTracking.length > 0) {
            //   await DeliveryImage.findOneAndUpdate(
            //     {
            //       userID: ObjectId(userID),
            //       shippingNumber: tableItem.shippingNumber
            //     },
            //     {
            //       $set: {
            //         shippingNumber: tableItem.shippingNumber,
            //         deliveryImage: deliveryImageBase64
            //       }
            //     },
            //     { upsert: true }
            //   )
            // }
        
            const deliveryTemp = await DeliveryInfo.findOne({
              userID: ObjectId(user._id),
              orderNo: 주문번호
            })
         
            
            if (deliveryTemp && deliveryTemp.orderItems) {
              try {
        
                const tempOrderItmes = _.uniqBy(
                  deliveryTemp.orderItems, "오픈마켓주문번호"
                )
                
            
                console.log("tempOrderItmes", tempOrderItmes.length)
                for (const orderItem of deliveryTemp.orderItems) {
        
                  
        
                  const marketOrder = await MarketOrder.findOne({
                    userID: ObjectId(user._id),
                    orderId: orderItem.오픈마켓주문번호
                  })
        
                  if (marketOrder && marketOrder.deliveryCompanyName === "경동택배") {
                    await page.goto(
                      `https://kdexp.com/basicNewDelivery.kd?barcode=${marketOrder.invoiceNumber}`,
                      {
                        waituntil: "networkidle0"
                      }
                    )
        
                    const deliveryTrackingTemp = await page.$$eval("#result4 > tbody > tr", element => {
                      return element
                        .filter((item, i) => i > 0)
                        .map(ele => {
                          return {
                            stage: ele.querySelector("td:nth-child(4)").textContent.trim(),
                            processing: ele
                              .querySelector("td:nth-child(1)")
                              .textContent.replace(":00.0", "")
                              .trim(),
                            status: ele.querySelector("td:nth-child(3)").textContent.trim(),
                            store: ele.querySelector("td:nth-child(2)").textContent.trim()
                          }
                        })
                    })
        
                    deliveryTracking = deliveryTrackingTemp.map(item => {
                      return {
                        stage: item.stage,
                        processingDate: moment(item.processing, "YYYY-MM-DD HH:mm")
                          .format("YYYYMMDD HHmm")
                          .split(" ")[0],
                        processingTime: moment(item.processing, "YYYY-MM-DD HH:mm")
                          .format("YYYYMMDD HHmm")
                          .split(" ")[1],
                        status: item.status,
                        store: item.store
                      }
                    })
        
                    // if (
                    //   deliveryTracking &&
                    //   Array.isArray(deliveryTracking) &&
                    //   deliveryTracking.length > 0
                    // ) {
                    //   try {
                        
        
                    //     const appDataDirPath = getAppDataPath()
                    //     if (!fs.existsSync(appDataDirPath)) {
                    //       fs.mkdirSync(appDataDirPath)
                    //     }
        
                    //     if (!fs.existsSync(path.join(appDataDirPath, "tempDelivery"))) {
                    //       fs.mkdirSync(path.join(appDataDirPath, "tempDelivery"))
                    //     }
        
                    //     await page.screenshot({
                    //       fullPage: true,
                    //       path: `${path.join(appDataDirPath, "tempDelivery")}/${
                    //         tableItem.shippingNumber
                    //       }.jpeg`
                    //     })
        
                    //     deliveryImageBase64 = await imageEncodeToBase64(
                    //       `${path.join(appDataDirPath, "tempDelivery")}/${tableItem.shippingNumber}.jpeg`
                    //     )
        
                    //     fs.unlinkSync(
                    //       `${path.join(appDataDirPath, "tempDelivery")}/${tableItem.shippingNumber}.jpeg`
                    //     )
                    //   } catch (e) {
                    //     console.log("저장, ", e)
                    //   }
        
                    //   await DeliveryImage.findOneAndUpdate(
                    //     {
                    //       userID: ObjectId(userID),
                    //       shippingNumber: tableItem.shippingNumber
                    //     },
                    //     {
                    //       $set: {
                    //         shippingNumber: tableItem.shippingNumber,
                    //         deliveryImage: deliveryImageBase64
                    //       }
                    //     },
                    //     { upsert: true }
                    //   )
                    // }
                  }
                }
        
                for (const orderItem of tempOrderItmes) {
                  console.log("orderItem.오픈마켓명", orderItem.오픈마켓명)
                  if(orderItem.오픈마켓명 && orderItem.오픈마켓명 === "wemake"){
                    continue
                  }
                  console.log("cafe24OrderResponse", cafe24OrderResponse.length)
                  const tempCafe24Order = cafe24OrderResponse.filter(fItem => fItem.market_order_info === orderItem.오픈마켓주문번호)
                  console.log("tempCafe24Order", tempCafe24Order.length)
                  if(tempCafe24Order.length > 0){
                    const marketOrder = await MarketOrder.findOne({
                      userID: ObjectId(user._id),
                      orderId: orderItem.오픈마켓주문번호,
                    })
                    
                    if(!deliveryTemp.isDelete){
                      for(const item of tempCafe24Order){
                        try {
                          const response = await Cafe24RegisterShipments({
                            mallID: market.cafe24.mallID,
                            order_id: item.order_id,
                            tracking_no: tableItem.shippingNumber,
                            shipping_company_code: marketOrder && marketOrder.deliveryCompanyName === "경동택배" ? "0039" : "0006",
                            order_item_code: item.items.map(item => item.order_item_code),
                            shipping_code: item.receivers[0].shipping_code
                          })
                          console.log("resonse-->", response)
                          
                          await sleep(500)
                          const response1 = await Cafe24UpdateShipments({
                            mallID: market.cafe24.mallID,
                            input: [{
                              shipping_code: item.receivers[0].shipping_code,
                              order_id: item.order_id
                            }]
                          })
                          console.log("resonse1-->", response1)
                          await sleep(500)
                        } catch (e) {
                          console.log("에러", e)
                        }
                        
                      }
                    }
                    
                  }
                  
                }
        
              } catch (e) {}
            }

            resolve()
          } catch(e){
            reject(e)
          }
        })
      })

      await Promise.all(promiseArr)
    }


    

  } catch (e) {
    console.log("searchDetailPage", e)
  } finally {
    if (page) {
      await page.close()
    }
  }
}
