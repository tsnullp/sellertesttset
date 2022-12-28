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
  const browser = await startBrowser()
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)
  try {

  
    // console.log("response------------", response)
    //response.market_order_info
  
    listDataArr = []
    await page.goto("https://www.tabae.co.kr/", { waituntil: "networkidle0" })

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    await page.tap("#sMemId")
    await page.type("#sMemId", loginID, opts)
    await page.tap("#sMemPw")
    await page.type("#sMemPw", password, opts)
    await page.keyboard.press("Enter")
    await page.waitFor(1000)

    await page.goto("https://www.tabae.co.kr/Front/Member/MyPage.asp", {
      waituntil: "networkidle0"
    })

    let pageArr = []
    for (let i = 1; i < 100; i++) {
      if ((i > 1) & (i % 10 === 1)) {
        pageArr.push("▶")
      } else {
        pageArr.push(i.toString())
      }
    }

    for (const pageItem of pageArr) {
      console.log("gotoNextPage 시작", pageItem)
      await gotoNextPage({ browser, page, pageIndex: pageItem, userID })
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

const gotoNextPage = async ({ browser, page, pageIndex, userID }) => {
  try {
    const pages = await page.$$(".paging > a")

    let serachPage = false

    for (const pageA of pages) {
      try {
        const aText = await page.evaluate(el => el.textContent.trim(), pageA)

        if (aText === pageIndex) {
          serachPage = true
          await pageA.click()
          break
        }
      } catch(e){
        console.log("aText", e)
      }
      
    }
    if (!serachPage) {
      return
    }

    await page.waitFor(4000)
    await page.waitForSelector(
      "#frmSearch > .t_board.mt20 > .board_list > tbody > tr:nth-child(odd)"
    )
    const table = await page.$$eval(
      "#frmSearch > .t_board.mt20 > .board_list > tbody > tr:nth-child(odd)",
      element => {
        return element.map(ele => {
          
          return {
            id: ele.querySelector("tr > td:nth-child(1) > .input_chk").value,
            orderNumber: ele.querySelector("tr > td:nth-child(1) > a") ? ele.querySelector("tr > td:nth-child(1) > a").textContent : "",
            shippingNumber: ele
            .querySelector("tr > td:nth-child(7) > a:nth-child(5)") && ele
            .querySelector("tr > td:nth-child(7) > a:nth-child(5)").textContent && ele
            .querySelector("tr > td:nth-child(7) > a:nth-child(5)").textContent.trim().length > 0 ? ele
              .querySelector("tr > td:nth-child(7) > a:nth-child(5)")
              .textContent.trim() :
               ( ele
              .querySelector("tr > td:nth-child(7) > a:nth-child(2)")
              ? ele
              .querySelector("tr > td:nth-child(7) > a:nth-child(2)").textContent.trim()  : 
              (ele
                .querySelector("tr > td:nth-child(7) > a:last-child").textContent.trim())
              )
          }
        })
      }
    )
    
    for (const tableItem of table) { 
      console.log("tableItem", tableItem)
      await searchDetailPage({ browser, tableItem, userID })
    }
    if (table && Array.isArray(table)) {
      listDataArr.push(...table)
    }
  } catch (e) {
    console.log("error", e)
    
  }
}

const searchDetailPage = async ({ browser, tableItem, userID }) => {
  const page = await browser.newPage()
  try {
    let customsImageBase64 = null
    let deliveryImageBase64 = null
    await page.goto(
      `https://www.tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${tableItem.id}`,
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
      "#frmSearch > div.order_table > table > tbody > tr > td:nth-child(2) > span"
    )
    const 주문번호 = await page.$eval(
      "#frmSearch > div.order_table > table > tbody > tr > td:nth-child(2) > span",
      element => {
        return element.textContent.trim()
      }
    )

    const 상태 = await page.$eval(
      "#frmSearch > div.order_table > table > tbody > tr > td:nth-child(4)",
      element => {
        return element.textContent.trim()
      }
    )
    
    const 수취인주소 = await page.$eval(
      "#AreaStep2 > div.order_table > table > tbody > tr:nth-child(1) > td",
      element => {
        const postNumber = element.textContent.substr(0, 5).trim()
        return {
          postNumber,
          addr: element.textContent.replace(postNumber, "").trim()
        }
      }
    )

    const 수취인이름 = await page.$eval(
      "#AreaStep2 > div.order_table > table > tbody > tr:nth-child(2) > td:nth-child(2)",
      element => {
        return element.textContent.trim()
      }
    )

    const 수취인연락처 = await page.$eval(
      "#AreaStep2 > div.order_table > table > tbody > tr:nth-child(3) > td:nth-child(2)",
      element => {
        return element.textContent.trim()
      }
    )

    const 개인통관부호 = await page.$eval(
      "#AreaStep2 > div.order_table > table > tbody > tr:nth-child(3) > td:nth-child(4)",
      element => {
        return element.textContent
          .replace("개인통관고유부호", "")
          .replace("주민등록번호", "")
          .trim()
      }
    )
    const AreaStep3 = await page.$$("#AreaStep3 > div.order_table > table > tbody > tr")

    const orderTables = await page.$$eval(
      "#AreaStep3 > div.order_table > table > tbody",
      element => {
        
        return element
          .filter((item, i) => i === 0)
          .map(item => {
        

            let trackingNo = []
            let orderNo = []
            let 오픈마켓주문번호 = []
            let 오픈마켓명 = []
            for (let i = 1; i < 5; i++) {
              let trackingTitle = item.querySelectorAll(
                `tr > td:not(:first-child) > table > tbody > tr:nth-child(${i}) > th`
              )
              for (let ii = 0; ii < trackingTitle.length; ++ii) {
                if (trackingTitle[ii].textContent.trim() === "TRACKING NO") {
                  const trackingNoNode = item.querySelectorAll(
                    `tr > td:not(:first-child) > table > tbody > tr:nth-child(${i}) > td`
                  )
                  trackingNo.push(trackingNoNode[ii].textContent.trim())
                }
              }
            }
            for (let i = 1; i < 5; i++) {
              let orderTitle = item.querySelectorAll(
                `tr > td:not(:first-child) > table > tbody > tr:nth-child(${i}) > th`
              )
              for (let ii = 0; ii < orderTitle.length; ++ii) {
                if (orderTitle[ii].textContent.trim() === "오더번호 NO") {
                  const orderNoNode = item.querySelectorAll(
                    `tr > td:not(:first-child) > table > tbody > tr:nth-child(${i}) > td`
                  )
                  orderNo.push(orderNoNode[ii].textContent.trim().replace("'", ""))
                }
              }
            }

            let 마켓명Node = item.querySelectorAll(
              `tr > td:not(:first-child) > table > tbody > tr:nth-last-child(4) > td`
            )
            for (let ii = 0; ii < 마켓명Node.length; ++ii) {
              오픈마켓명.push(마켓명Node[ii].textContent.trim())
            }

            let 주문번호Node = item.querySelectorAll(
              `tr > td:not(:first-child) > table > tbody > tr:nth-last-child(3) > td`
            )
            for (let ii = 0; ii < 주문번호Node.length; ++ii) {
              오픈마켓주문번호.push(주문번호Node[ii].textContent.trim().replace("'", ""))
            }

            return {
              trackingNo,
              orderNo,
              오픈마켓명,
              오픈마켓주문번호
            }
          })
      }
    )

    const orderItems = []
    orderTables.forEach(item => {
      for (let i = 0; i < item.trackingNo.length; i++) {
        orderItems.push({
          trackingNo: item.trackingNo && item.trackingNo[i] ? item.trackingNo[i] : "",
          orderNo: item.orderNo && item.orderNo[i] ? item.orderNo[i] : "",
          오픈마켓명:
            item.오픈마켓명 && item.오픈마켓명[i] ? item.오픈마켓명[i] : "",
          오픈마켓주문번호:
            item.오픈마켓주문번호 && item.오픈마켓주문번호[i] ? item.오픈마켓주문번호[i] : ""
        })
      }
    })
    // console.log("orderItems", orderItems)
    let 무게 = "0"
    let 배송비용 = "0"
    try {
      await page.waitForSelector(
        "#AreaStep3 > div:nth-child(10) > table > tbody > tr:nth-child(1) > td > span:nth-child(2)",
        { timeout: 1000 }
      )
      무게 = await page.$eval(
        "#AreaStep3 > div:nth-child(10) > table > tbody > tr:nth-child(1) > td > span:nth-child(2)",
        element => {
          return element.textContent.replace("kg", "").trim()
        }
      )
      배송비용 = await page.$eval(
        "#AreaStep3 > div:nth-child(10) > table > tbody > tr:nth-child(2) > td > label.bold",
        element => {
          return element.textContent
            .split(":")[1]
            .split("(")[0]
            .replace(/,/gi, "")
            .replace("원", "")
            .trim()
        }
      )

      console.log("배송비용", 배송비용)
      for(const item of orderTables){
        console.log("item", item)
      }
    } catch (e) {}

    

    await page.goto(
      `https://tabae.co.kr/Library/Html/DlvrShKr_S.asp?IVC_NO=${tableItem.shippingNumber}`,
      {
        waituntil: "networkidle0"
      }
    )
    let customs = []
    let deliveryTracking = []
    
    
    try {
      let customsTemp = await page.$$eval(
        "#pop_wrap > div.t_board > div > table > tbody > tr",
        element => {
          return element
            .filter((item, i) => i > 1)
            .map(ele => {
              try {
                return {
                  first: ele.querySelector("td:nth-last-child(3)").textContent.trim(),
                  second: ele.querySelector("td:nth-last-child(2)").textContent.trim(),
                  third: ele.querySelector("td:nth-last-child(1)").textContent.trim()
                }
              } catch (e) {
                return null
              }
            })
        }
      )

      customsTemp = customsTemp.filter(item => item !== null)

      for (let i = 0; i < customsTemp.length / 2; i++) {
        customs.push({
          processingStage: customsTemp[i * 2].first,
          numerOfPackaging: customsTemp[i * 2].second,
          inOutPprocessingDate:
            customsTemp[i * 2 + 1].third.length > 0
              ? moment(customsTemp[i * 2 + 1].third, "YYYY.MM.DD A HH:mm")
                  .format("YYYYMMDD HHmmSS")
                  .split(" ")[0]
              : "",
          inOutPprocessingTime:
            customsTemp[i * 2 + 1].third.length > 0
              ? moment(customsTemp[i * 2 + 1].third, "YYYY.MM.DD A HH:mm")
                  .format("YYYYMMDD HHmmSS")
                  .split(" ")[1]
              : "",
          processingDate:
            customsTemp[i * 2 + 1].first.length > 0
              ? moment(customsTemp[i * 2 + 1].first, "YYYY.MM.DD A HH:mm")
                  .format("YYYYMMDD HHmmSS")
                  .split(" ")[0]
              : "",
          processingTime:
            customsTemp[i * 2 + 1].first.length > 0
              ? moment(customsTemp[i * 2 + 1].first, "YYYY.MM.DD A HH:mm")
                  .format("YYYYMMDD HHmmSS")
                  .split(" ")[1]
              : "",
          weight: customsTemp[i * 2 + 1].second,
          content: customsTemp[i * 2 + 1].third
        })
      }

      // try {
      //   if (customsTemp && customsTemp.length > 0) {
          

      //     const appDataDirPath = getAppDataPath()
      //     if (!fs.existsSync(appDataDirPath)) {
      //       fs.mkdirSync(appDataDirPath)
      //     }

      //     if (!fs.existsSync(path.join(appDataDirPath, "tempCustoms"))) {
      //       fs.mkdirSync(path.join(appDataDirPath, "tempCustoms"))
      //     }

      //     await page.screenshot({
      //       fullPage: true,
      //       path: `${path.join(appDataDirPath, "tempCustoms")}/${tableItem.shippingNumber}.jpeg`
      //     })

      //     customsImageBase64 = await imageEncodeToBase64(
      //       `${path.join(appDataDirPath, "tempCustoms")}/${tableItem.shippingNumber}.jpeg`
      //     )

      //     fs.unlinkSync(
      //       `${path.join(appDataDirPath, "tempCustoms")}/${tableItem.shippingNumber}.jpeg`
      //     )
      //   }
      // } catch (e) {
      //   console.log("저장, ", e)
      // }
    } catch (e) {
      console.log("무슨 에러? ", e)
    }

    try {
      await page.goto(
        `https://tabae.co.kr/Library/Html/TrackingSearch_S.asp?sDComp=CJ&sTrkNo=${tableItem.shippingNumber}`,
        {
          waituntil: "networkidle0"
        }
      )

      const deliveryTrackingTemp = await page.$$eval(
        "#tabContents > ul > li.first.focus > div > div:nth-child(2) > div > table > tbody > tr",
        element => {
          return element
            .filter((item, i) => i > 0)
            .map(ele => {
              return {
                stage: ele.querySelector("td:nth-child(1)").textContent.trim(),
                processing: ele.querySelector("td:nth-child(2)").textContent.trim(),
                status: ele.querySelector("td:nth-child(3)").textContent.trim(),
                store: ele.querySelector("td:nth-child(4)").textContent.trim()
              }
            })
        }
      )

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

      // try {
      //   if (deliveryTracking && deliveryTracking.length > 0) {
          

      //     const appDataDirPath = getAppDataPath()
      //     if (!fs.existsSync(appDataDirPath)) {
      //       fs.mkdirSync(appDataDirPath)
      //     }

      //     if (!fs.existsSync(path.join(appDataDirPath, "tempDelivery"))) {
      //       fs.mkdirSync(path.join(appDataDirPath, "tempDelivery"))
      //     }

      //     await page.screenshot({
      //       fullPage: true,
      //       path: `${path.join(appDataDirPath, "tempDelivery")}/${tableItem.shippingNumber}.jpeg`
      //     })

      //     deliveryImageBase64 = await imageEncodeToBase64(
      //       `${path.join(appDataDirPath, "tempDelivery")}/${tableItem.shippingNumber}.jpeg`
      //     )

      //     fs.unlinkSync(
      //       `${path.join(appDataDirPath, "tempDelivery")}/${tableItem.shippingNumber}.jpeg`
      //     )
      //   }
      // } catch (e) {
      //   console.log("저장, ", e)
      // }
    } catch (e) {}

    // console.log(
    //   "orderItems",
    //   orderItems.map((item, i) => {
    //     return {
    //       taobaoTrackingNo: item.trackingNo.replace("Tracking# 등록", ""),
    //       taobaoOrderNo: item.orderNo,
    //       오픈마켓주문번호:
    //         temp && temp.orderItems[i] && temp.orderItems[i].오픈마켓주문번호.length > 0
    //           ? temp.orderItems[i].오픈마켓주문번호
    //           : item.오픈마켓주문번호
    //     }
    //   })
    // )


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
                  orderItems: orderItems.map((item, i) => {
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
        
                  if(orderItem.오픈마켓명 && orderItem.오픈마켓명 === "wemake"){
                    continue
                  }
                  // console.log("cafe24OrderResponse", cafe24OrderResponse)
                  const tempCafe24Order = cafe24OrderResponse.filter(fItem => fItem.market_order_info === orderItem.오픈마켓주문번호)
                  
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
