const startBrowser = require("./startBrowser")
const MarketOrder = require("../models/MarketOrder")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")

const start = async ({ userID, mallID, password }) => {
  const browser = await startBrowser()
  const page = await browser.newPage()
  await page.setJavaScriptEnabled(true)
  try {
    await page.goto("https://eclogin.cafe24.com/Shop/", { waituntil: "networkidle0" })

    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    await page.tap("#mall_id")
    await page.type("#mall_id", mallID, opts)
    await page.tap("#userpasswd")
    await page.type("#userpasswd", password, opts)
    await page.keyboard.press("Enter")
    await page.waitFor(5000)

    if (await page.$("#iptBtnEm")) {
      await page.click("#iptBtnEm")
      await page.waitFor(5000)
    }
    const createdAtFrom = moment().add(-60, "days")

    const createdAtTo = moment()

    await page.goto(
      `https://${mallID}.cafe24.com/admin/php/shop1/s_new/order_list.php?page=1&rows=20&searchSorting=order_desc&isBusanCall=&isChinaCall=&orderCallnum=&cticall=&realclick=T&tabclick=F&MSK[]=order_id&MSV[]=&orderStatusPayment=all&date_type=order_date&btnDate=9999&product_search_type=product_name&find_option=product_no&order_product_name=&order_product_code=&order_product_no=&order_product_text=&order_set_product_no=&layer_order_product_code=&layer_order_product_opt_id=&popup_item_code=&popup_product_code=&payed=&payed_sql_version=&bank_info=&memberType=1&group_no=&isMemAuth=&isBlackList=&isFirstOrder=&isPointfyUsedMember=&shipment_type=all&bunch=&shippedAgain=&shipmentMessage=&delivSeperated=&isReservedOrder=&isSubscriptionOrder=&paystandard=choice&product_total_price1=&product_total_price2=&item_count_start=&item_count_end=&orderPathType=A&search_SaleOpenMarket[]=cafe24&search_SaleOpenMarket[]=mobile&search_SaleOpenMarket[]=mobile_d&search_SaleOpenMarket[]=NCHECKOUT&search_SaleOpenMarket[]=gmarket&search_SaleOpenMarket[]=auction&search_SaleOpenMarket[]=sk11st&search_SaleOpenMarket[]=shopn&search_SaleOpenMarket[]=inpark&search_SaleOpenMarket[]=coupang&search_SaleOpenMarket[]=kakao&search_SaleOpenMarket[]=womanstalk&search_SaleOpenMarket[]=tenten&search_SaleOpenMarket[]=wemake&search_SaleOpenMarket[]=melchi&search_SaleOpenMarket[]=halfclub&search_SaleOpenMarket[]=boribori&search_SaleOpenMarket[]=ogage&search_SaleOpenMarket[]=moongori&search_SaleOpenMarket[]=shopeesg&search_SaleOpenMarket[]=shopeeid&search_SaleOpenMarket[]=shopeemy&search_SaleOpenMarket[]=shopeetw&search_SaleOpenMarket[]=shopeeth&search_SaleOpenMarket[]=shopeeph&search_SaleOpenMarket[]=shoplist&search_SaleOpenMarket[]=brich&search_SaleOpenMarket[]=zigzag&search_SaleOpenMarket[]=ably&search_SaleOpenMarket[]=timon&search_SaleOpenMarket[]=musinsa&search_SaleOpenMarket[]=wizwid&search_SaleOpenMarket[]=hottracks&search_SaleOpenMarket[]=akmall&search_SaleOpenMarket[]=daisomall&search_SaleOpenMarket[]=lfmall&search_SaleOpenMarket[]=styleshare&search_SaleOpenMarket[]=aland&search_SaleOpenMarket[]=rakutenkr&search_SaleOpenMarket[]=cjmall&search_SaleOpenMarket[]=lotteon&search_SaleOpenMarket[]=himart&search_SaleOpenMarket[]=tofkof&search_SaleOpenMarket[]=lazadaph&search_SaleOpenMarket[]=lazadath&search_SaleOpenMarket[]=lazadasg&search_SaleOpenMarket[]=lazadaid&search_SaleOpenMarket[]=lazadamy&search_SaleOpenMarket[]=11st&search_SaleOpenMarket[]=11st&mkSaleType=M&mkSaleTypeChg=&inflowPathType=A&inflowPathDetail=0000000000000000000000000000000000&paymethodType=A&paymentMethod[]=cash&paymentMethod[]=card&paymentMethod[]=tcash&paymentMethod[]=icash&paymentMethod[]=cell&paymentMethod[]=deferpay&paymentMethod[]=cvs&paymentMethod[]=point&paymentMethod[]=mileage&paymentMethod[]=deposit&paymentMethod[]=etc&pgListType=A&pgList[]=inicis&pgList[]=etc&paymentInfo=&discountMethod=&shop_no_order=1&delvReady=&delvCancel=&orderStatusNotPayCancel=N&orderStatusCancel=N&orderSearchCancelStatus=&orderStatusExchange=N&orderSearchExchangeStatus=&orderStatusReturn=N&orderStatusRefund=N&orderSearchRefundStatus=&orderSearchShipStatus=&orderStatus[]=all&orderStatus[]=N10&orderStatus[]=N20&orderStatus[]=N22&orderStatus[]=N21&orderStatus[]=N30&orderStatus[]=N40&RefundType=&RefundSubType=&sc_id=&second_shipping_company_id=&HopeShipCompanyId=all&post_express_flag=&tabStatus=&paymethod_total_count=&search_invoice_print_flag=all&search_is_escrow_shipping_registered=all&search_print_second_invoice=all&incoming=&is_purchased=&order_fail_code=&isBlackOrder=&start_date=${createdAtFrom.format(
        "YYYY-MM-DD"
      )}&year1=${createdAtFrom.format("YYYY")}&month1=${createdAtFrom.format(
        "MM"
      )}&day1=${createdAtFrom.format("DD")}&start_time=00:00:00&end_date=${createdAtTo.format(
        "YYYY-MM-DD"
      )}&year2=${createdAtTo.format("YYYY")}&month2=${createdAtTo.format(
        "MM"
      )}&day2=${createdAtTo.format("DD")}&end_time=23:59:59&realclick=T`,
      {
        waituntil: "networkidle0"
      }
    )

    const total = await page.$eval("#tabNumber > div > div > p > strong", el => el.innerText)

    const totalPage = Math.ceil(Number(total.replace(/,/gi, "") || 0) / 20)

    for (let i = 1; i <= totalPage; i++) {
      console.log("Page", i)
      try {
        if (i !== 1) {
         
          await page.goto(
            `https://${mallID}.cafe24.com/admin/php/shop1/s_new/order_list.php?page=${i}&rows=20&searchSorting=order_desc&isBusanCall=&isChinaCall=&orderCallnum=&cticall=&realclick=T&tabclick=F&MSK[]=order_id&MSV[]=&orderStatusPayment=all&date_type=order_date&btnDate=9999&product_search_type=product_name&find_option=product_no&order_product_name=&order_product_code=&order_product_no=&order_product_text=&order_set_product_no=&layer_order_product_code=&layer_order_product_opt_id=&popup_item_code=&popup_product_code=&payed=&payed_sql_version=&bank_info=&memberType=1&group_no=&isMemAuth=&isBlackList=&isFirstOrder=&isPointfyUsedMember=&shipment_type=all&bunch=&shippedAgain=&shipmentMessage=&delivSeperated=&isReservedOrder=&isSubscriptionOrder=&paystandard=choice&product_total_price1=&product_total_price2=&item_count_start=&item_count_end=&orderPathType=A&search_SaleOpenMarket[]=cafe24&search_SaleOpenMarket[]=mobile&search_SaleOpenMarket[]=mobile_d&search_SaleOpenMarket[]=NCHECKOUT&search_SaleOpenMarket[]=gmarket&search_SaleOpenMarket[]=auction&search_SaleOpenMarket[]=sk11st&search_SaleOpenMarket[]=shopn&search_SaleOpenMarket[]=inpark&search_SaleOpenMarket[]=coupang&search_SaleOpenMarket[]=kakao&search_SaleOpenMarket[]=womanstalk&search_SaleOpenMarket[]=tenten&search_SaleOpenMarket[]=wemake&search_SaleOpenMarket[]=melchi&search_SaleOpenMarket[]=halfclub&search_SaleOpenMarket[]=boribori&search_SaleOpenMarket[]=ogage&search_SaleOpenMarket[]=moongori&search_SaleOpenMarket[]=shopeesg&search_SaleOpenMarket[]=shopeeid&search_SaleOpenMarket[]=shopeemy&search_SaleOpenMarket[]=shopeetw&search_SaleOpenMarket[]=shopeeth&search_SaleOpenMarket[]=shopeeph&search_SaleOpenMarket[]=shoplist&search_SaleOpenMarket[]=brich&search_SaleOpenMarket[]=zigzag&search_SaleOpenMarket[]=ably&search_SaleOpenMarket[]=timon&search_SaleOpenMarket[]=musinsa&search_SaleOpenMarket[]=wizwid&search_SaleOpenMarket[]=hottracks&search_SaleOpenMarket[]=akmall&search_SaleOpenMarket[]=daisomall&search_SaleOpenMarket[]=lfmall&search_SaleOpenMarket[]=styleshare&search_SaleOpenMarket[]=aland&search_SaleOpenMarket[]=rakutenkr&search_SaleOpenMarket[]=cjmall&search_SaleOpenMarket[]=lotteon&search_SaleOpenMarket[]=himart&search_SaleOpenMarket[]=tofkof&search_SaleOpenMarket[]=lazadaph&search_SaleOpenMarket[]=lazadath&search_SaleOpenMarket[]=lazadasg&search_SaleOpenMarket[]=lazadaid&search_SaleOpenMarket[]=lazadamy&search_SaleOpenMarket[]=11st&search_SaleOpenMarket[]=11st&mkSaleType=M&mkSaleTypeChg=&inflowPathType=A&inflowPathDetail=0000000000000000000000000000000000&paymethodType=A&paymentMethod[]=cash&paymentMethod[]=card&paymentMethod[]=tcash&paymentMethod[]=icash&paymentMethod[]=cell&paymentMethod[]=deferpay&paymentMethod[]=cvs&paymentMethod[]=point&paymentMethod[]=mileage&paymentMethod[]=deposit&paymentMethod[]=etc&pgListType=A&pgList[]=inicis&pgList[]=etc&paymentInfo=&discountMethod=&shop_no_order=1&delvReady=&delvCancel=&orderStatusNotPayCancel=N&orderStatusCancel=N&orderSearchCancelStatus=&orderStatusExchange=N&orderSearchExchangeStatus=&orderStatusReturn=N&orderStatusRefund=N&orderSearchRefundStatus=&orderSearchShipStatus=&orderStatus[]=all&orderStatus[]=N10&orderStatus[]=N20&orderStatus[]=N22&orderStatus[]=N21&orderStatus[]=N30&orderStatus[]=N40&RefundType=&RefundSubType=&sc_id=&second_shipping_company_id=&HopeShipCompanyId=all&post_express_flag=&tabStatus=&paymethod_total_count=&search_invoice_print_flag=all&search_is_escrow_shipping_registered=all&search_print_second_invoice=all&incoming=&is_purchased=&order_fail_code=&isBlackOrder=&start_date=${createdAtFrom.format(
              "YYYY-MM-DD"
            )}&year1=${createdAtFrom.format("YYYY")}&month1=${createdAtFrom.format(
              "MM"
            )}&day1=${createdAtFrom.format("DD")}&start_time=00:00:00&end_date=${createdAtTo.format(
              "YYYY-MM-DD"
            )}&year2=${createdAtTo.format("YYYY")}&month2=${createdAtTo.format(
              "MM"
            )}&day2=${createdAtTo.format("DD")}&end_time=23:59:59&realclick=T`,
            {
              waituntil: "networkidle0"
            }
          )
        }
        const tableArr = await page.$$eval("#searchResultList > table > tbody", element => {
          let i = 0
          return element.map(ele => {
            try {
              return {
                cafe24OrderID: ele.getAttribute("order_id"),
                orderNum: ele.getAttribute("order_id")
                  ? ele
                      .querySelector("tr > .orderNum")
                      .textContent.trim()
                      .split("(")[1]
                      .split(")")[0]
                  : null,
                productName: ele.getAttribute("order_id")
                  ? ele.querySelector(`tr > td > #eProductName${i++}`).textContent.trim()
                  : null,
                cancel: ele.getAttribute("order_id")
                  ? ele.querySelector("tr:nth-child(1) > td:nth-child(15)").textContent.trim()
                  : 0,
                exchange: ele.getAttribute("order_id")
                  ? ele.querySelector("tr:nth-child(1) > td:nth-child(16)").textContent.trim()
                  : 0,
                return: ele.getAttribute("order_id")
                  ? ele.querySelector("tr:nth-child(1) > td:nth-child(17)").textContent.trim()
                  : 0
              }
            } catch(e){
              console.log("e",e )
              return null
            }
            
          })
        })

        for (const item of tableArr) {
          
          await productDetail({ page, userID, mallID, item })
        }
      } catch (e) {
        console.log("for -", e)
      }
    }
  } catch (e) {
    console.log("searchCafe24OrderList", e)
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

const productDetail = async ({ page, userID, mallID, item }) => {
  try {
    // console.log(
    //   "page---<",
    //   `https://${mallID}.cafe24.com/admin/php/s_new/order_detail.php?order_id=${item.cafe24OrderID}&menu_no=74`
    // )
    if (!item || !item.cafe24OrderID) {
      return
    }
    await page.goto(
      `https://${mallID}.cafe24.com/admin/php/s_new/order_detail.php?order_id=${item.cafe24OrderID}&menu_no=74`,
      { waituntil: "networkidle0" }
    )

    page.on("dialog", async dialog => {
      if (dialog) {
        await dialog.dismiss()
      }
    })
 
    const market = await page.$eval(
      "#frm > div.mFixNav > div > div.gLeft > ul:nth-child(1) > li",
      el => el.textContent ? el.textContent.replace("주문경로/유입경로 :", "").trim() : null
    )
   
    const 주문일자 = await page.$eval(
      "#frm > div.mFixNav > div > div.gLeft > ul:nth-child(2) > li:nth-child(2)",
      el => el.textContent ? el.textContent.replace("주문일자 : ", "").trim() : null
    )
    
    let 주문내역 = []
    // 취소
    // #tabNumber > div.mBoard.typeOrder.gScroll.gCellSingle > table > tbody
    try {
      
      let 주문내역temp = await page.$$eval(
        "#QA_detail1 > #tabNumber > .mBoard > table > tbody > tr",
        element => {
          
          try {
            return element.map(ele => {
              try {
                let image = ele
                  .querySelector("td:nth-child(4) > div > div > span > img")
                  .getAttribute("src")
                if (!image.includes("http")) {
                  image = `https:${image}`
                }
                return {
                  image,
                  title: ele.querySelector("td:nth-child(4) > div > p > a > span").textContent,
                  option: ele
                    .querySelector("td:nth-child(4) > div > ul > span")
                    .textContent.split(":")[1]
                    .trim(),
                  quantity: ele.querySelector("td:nth-child(5)").textContent,
                  price: ele.querySelector("td:nth-child(6)").textContent.trim(),
                  purchaseAmount: ele.querySelector("td:nth-child(7)").textContent.trim(),
                  discountedAmount: ele.querySelector("td:nth-child(8)").textContent.trim(),
                  shippingFee: ele
                    .querySelector("td:nth-child(9)")
                    .textContent.replace("(기본)", "")
                    .replace("(개별)", "")
                    .trim(),
                  orderType: 1
                }
              } catch (e) {
                console.lot("-----", e)
              }
            })
          } catch(e){
            console.log("a-a-a-", e)
          }
        }
      )

      if(!주문내역temp){
        주문내역temp = await page.$$eval(
          "#QA_detail1 > #tabNumber > .mBoard > table > tbody > tr:nth-child(1)",
          element => {
            
            try {
              return element.map(ele => {
                try {
                  let image = ele
                    .querySelector("td:nth-child(4) > div > div > span > img")
                    .getAttribute("src")
                  if (!image.includes("http")) {
                    image = `https:${image}`
                  }
                  return {
                    image,
                    title: ele.querySelector("td:nth-child(4) > div > p > a > span").textContent,
                    option: ele
                      .querySelector("td:nth-child(4) > div > ul > span")
                      .textContent.split(":")[1]
                      .trim(),
                    quantity: ele.querySelector("td:nth-child(5)").textContent,
                    price: ele.querySelector("td:nth-child(6)").textContent.trim(),
                    purchaseAmount: ele.querySelector("td:nth-child(7)").textContent.trim(),
                    discountedAmount: ele.querySelector("td:nth-child(8)").textContent.trim(),
                    shippingFee: ele
                      .querySelector("td:nth-child(9)")
                      .textContent.replace("(기본)", "")
                      .replace("(개별)", "")
                      .trim(),
                    orderType: 1
                  }
                } catch (e) {
                  console.lot("-----", e)
                }
              })
            } catch(e){
              console.log("a-a-a-", e)
            }
          }
        ) 
      }
      
      if (주문내역temp && 주문내역temp.filter(item => item !== null).length > 0) {
        주문내역.push(...주문내역temp)
      }
    } catch (e) {
      console.log("aaa", e)
    }

    if (item.cancel !== "0") {
      await page.click("#QA_detail1 > div.mTab.typeSub.eTab > ul > li:nth-child(2) > a")
      await page.waitFor(2000)
      const 주문내역temp = await page.$$eval(
        "#QA_detail1 > #tabCancel > .mBoard > table > tbody > tr",
        element => {
          return element.map(ele => {
            let image = ele
              .querySelector("td:nth-child(3) > div > div > span > img")
              .getAttribute("src")
            if (!image.includes("http")) {
              image = `https:${image}`
            }
            return {
              image,
              title: ele.querySelector("td:nth-child(3) > div > p > a > span").textContent,
              option: ele
              .querySelector("td:nth-child(3) > div > ul > span") ? ele
                .querySelector("td:nth-child(3) > div > ul > span")
                .textContent.split(":")[1]
                .trim() : null,
              quantity: ele.querySelector("td:nth-child(4)").textContent,
              price: ele
              .querySelector("td:nth-child(5)") ? ele
                .querySelector("td:nth-child(5)")
                .textContent.split("(")[0]
                .trim() : null,
              purchaseAmount: ele
              .querySelector("td:nth-child(5)") ? ele
                .querySelector("td:nth-child(5)")
                .textContent.split("(")[1]
                .replace(")", "")
                .trim() : null,
              discountedAmount: ele.querySelector("td:nth-child(6)").textContent.trim(),
              orderType: 2
            }
          })
        }
      )
      
      주문내역.push(...주문내역temp)
    }
    if (item.return !== "0") {
      await page.click("#QA_detail1 > div.mTab.typeSub.eTab > ul > li:nth-child(4) > a")
      await page.waitFor(2000)
      const 주문내역temp = await page.$$eval(
        "#QA_detail1 > #tabReturn > .mBoard > table > tbody",
        element => {
          return element.map(ele => {
            let image = ele
              .querySelector("td:nth-child(4) > div > div > span > img")
              .getAttribute("src")
            if (!image.includes("http")) {
              image = `https:${image}`
            }
            return {
              image,
              title: ele.querySelector("td:nth-child(4) > div > p > a > span").textContent,
              option: ele
              .querySelector("td:nth-child(4) > div > ul > span").textContent ? ele
                .querySelector("td:nth-child(4) > div > ul > span")
                .textContent.split(":")[1]
                .trim() : null,
              quantity: ele.querySelector("td:nth-child(5)").textContent,
              price: ele
              .querySelector("td:nth-child(6)").textContent ? ele
                .querySelector("td:nth-child(6)")
                .textContent.split("(")[0]
                .trim() : null,
              purchaseAmount: ele
              .querySelector("td:nth-child(6)").textContent ? ele
                .querySelector("td:nth-child(6)")
                .textContent.split("(")[1]
                .replace(")", "")
                .trim() : null,
              discountedAmount: ele.querySelector("td:nth-child(7)").textContent ? ele.querySelector("td:nth-child(7)").textContent.trim() : null,
              orderType: 3
            }
          })
        }
      )
     
      주문내역.push(...주문내역temp)
    }

    // const 상품구매금액 = await page.$eval(
    //   "#payInfoDetail > .detailView > ul > li:nth-child(1) > span",
    //   element => {
    //     return element.innerText.trim()
    //   }
    // )

    // const 실결제금액 = await page.$eval(
    //   "#payInfoDetail > .detailView > ul > li:nth-child(3) > span",
    //   element => {
    //     return element.innerText.trim()
    //   }
    // )

    const 배송비 = await page.$eval(
      "#payInfoDetail > .detailView >  div > div > table:nth-child(1) > thead > tr > th:nth-child(1) > strong",
      element => {
        return element.innerText.trim()
      }
    )

    // const 할인액 = await page.$eval(
    //   "#payInfoDetail > .detailView >  div > div > table.gDivision > thead > tr > th:nth-child(2) > strong",
    //   element => {
    //     return element.innerText.trim()
    //   }
    // )

    // const 결제자 = await page.$eval(
    //   "#QA_detail8 > .mBoard > table > tbody > tr:nth-child(1) > td",
    //   element => {
    //     return element.innerText.trim()
    //   }
    // )

    const 결제일 = await page.$eval(
      "#QA_detail8 > .mBoard > table > tbody > tr:last-child > td",
      element => {
        return element.innerText
          .replace("신용카드 결제 : ", "")
          .replace("휴대폰결제 : ", "")
          .replace("휴대폰결제 결제 : ", "")
          .replace("휴대폰결제결제 : ", "")
          .replace("계좌이체 결제 : ", "")
          .replace("기타 선불금 결제 : ", "")
          .split("/")[0]
          .trim()
      }
    )

    const 주문자명 = await page.$eval(
      "#QA_detail4 > .mBoard > table > tbody > tr:nth-child(1) > td",
      element => {
        return element.textContent.split("(비회원)")[0].trim()
      }
    )

    const 주문자휴대전화 = await page.$eval(
      "#QA_detail4 > .mBoard > table > tbody > tr:nth-child(3) > td",
      element => {
        return element.textContent.replace("SMS", "").trim()
      }
    )

    const 주문자전화 = await page.$eval(
      "#QA_detail4 > .mBoard > table > tbody > tr:nth-child(2) > td:nth-child(2)",
      element => {
        return element.textContent.trim()
      }
    )

    const 주문자이메일 = await page.$eval(
      "#QA_detail4 > .mBoard > table > tbody > tr:nth-child(2) > td:nth-child(4)",
      element => {
        return element.textContent.replace("MAIL", "").trim()
      }
    )

    const QA_detail = await page.$$("#QA_detail5 > div.mBoard > table > tbody > tr")

    const 수령자명 = await page.$eval(
      "#QA_detail5 > .mBoard > table > tbody > tr:nth-child(2) > td",
      element => {
        return element.textContent.trim().replace("수령자정보수정", "")
      }
    )

    const 수령자일반전화 = await page.$eval(
      "#QA_detail5 > .mBoard > table > tbody > tr:nth-child(3) > td:nth-child(2)",
      element => {
        return element.textContent.trim()
      }
    )

    const 수령자휴대전화 = await page.$eval(
      "#QA_detail5 > .mBoard > table > tbody > tr:nth-child(3) > td:nth-child(4)",
      element => {
        return element.textContent.replace("SMS", "").trim()
      }
    )
    let 통관번호 = ""
    if (QA_detail.length === 6) {
      통관번호 = await page.$eval(
        "#QA_detail5 > .mBoard > table > tbody > tr:nth-child(4) > td",
        element => {
          return element.textContent.replace("개인통관고유부호 /", "").trim()
        }
      )
    }
    if (!통관번호) {
      통관번호 = ""
    }

    const 배송지주소 = await page.$eval(
      `#QA_detail5 > .mBoard > table > tbody > tr:nth-child(${QA_detail.length - 1}) > td`,
      element => {
        return {
          postNum: element.textContent
            .split(")")[0]
            .replace("(", "")
            .trim(),
          address: element.textContent.split(")")[1].trim()
        }
      }
    )

    const 배송메시지 = await page.$eval(
      `#QA_detail5 > .mBoard > table > tbody > tr:nth-child(${QA_detail.length - 0}) > td`,
      element => {
        return element.querySelector("#DeliveryMemo").value
      }
    )

    const temp = await MarketOrder.findOne({
      userID: ObjectId(userID),
      market,
      orderId: item.orderNum
    })

    console.log("item.orderNum", item.orderNum)
    console.log("주문내역", 주문내역)
    await MarketOrder.findOneAndUpdate(
      {
        userID: ObjectId(userID),
        market,
        orderId: item.orderNum
      },
      {
        $set: {
          userID: ObjectId(userID),
          market,
          orderId: item.orderNum,
          cafe24OrderID: item.cafe24OrderID,
          orderer: {
            name: temp && temp.orderer && temp.orderer.name ? temp.orderer.name : 주문자명,
            email: temp && temp.orderer && temp.orderer.email ? temp.orderer.email : 주문자이메일,
            tellNumber:
              temp && temp.orderer && temp.orderer.tellNumber
                ? temp.orderer.tellNumber
                : 주문자전화,
            hpNumber:
              temp && temp.orderer && temp.orderer.hpNumber
                ? temp.orderer.hpNumber
                : 주문자휴대전화,
            orderDate:
              temp && temp.orderer && temp.orderer.orderDate
                ? temp.orderer.orderDate
                : 주문일자.split(" ")[0].replace(/-/gi, ""),
            orderTime:
              temp && temp.orderer && temp.orderer.orderTime
                ? temp.orderer.orderTime
                : 주문일자.split(" ")[1].replace(/:/gi, "")
          },
          paidAtDate: 결제일.split(" ")[0].replace(/-/gi, ""),
          paidAtTime: 결제일.split(" ")[1].replace(/:/gi, ""),

          shippingPrice: Number(배송비.replace(/,/gi, "")),

          receiver: {
            name: temp && temp.receiver && temp.receiver.name ? temp.receiver.name : 수령자명,
            tellNumber:
              temp && temp.receiver && temp.receiver.tellNumber
                ? temp.receiver.tellNumber
                : 수령자일반전화,
            hpNumber:
              temp && temp.receiver && temp.receiver.hpNumber
                ? temp.receiver.hpNumber
                : 수령자휴대전화,
            addr:
              temp && temp.receiver && temp.receiver.addr ? temp.receiver.addr : 배송지주소.address,
            postCode:
              temp && temp.receiver && temp.receiver.postCode
                ? temp.receiver.postCode
                : 배송지주소.postNum,
            parcelPrintMessage:
              temp && temp.receiver && temp.receiver.parcelPrintMessage
                ? temp.receiver.parcelPrintMessage
                : 배송메시지
          },

          orderItems: 주문내역
          .filter(item => item !== null).length === 0 ? 
            temp.orderItems
          : 주문내역
            .filter(item => item !== null)
            .map(item => {
              return {
                image: item.image,
                title: item.title,
                option: item.option,
                quantity: Number(item.quantity.replace(/,/gi, "")),
                salesPrice: Number(item.price.replace(/,/gi, "")),
                orderPrice: Number(item.purchaseAmount.replace(/,/gi, "")),
                discountPrice: Number(item.discountedAmount.replace(/,/gi, "")),
                orderType: item.orderType
              }
            }),

          overseaShippingInfoDto: {
            personalCustomsClearanceCode:
              temp &&
              temp.overseaShippingInfoDto &&
              temp.overseaShippingInfoDto.personalCustomsClearanceCode
                ? temp.overseaShippingInfoDto.personalCustomsClearanceCode
                : 통관번호,
            ordererPhoneNumber:
              temp && temp.overseaShippingInfoDto && temp.overseaShippingInfoDto.ordererPhoneNumber
                ? temp.overseaShippingInfoDto.ordererPhoneNumber
                : 수령자휴대전화
          },

          saleType:
            item.cancel === "0" && item.return === "0" && item.exchange === "0"
              ? 1
              : item.cancel !== "0"
              ? 2
              : !item.return !== "0"
              ? 3
              : 4,
          deliveryCompanyName:
            temp && temp.deliveryCompanyName ? temp.deliveryCompanyName : "CJ 대한통운"
        }
      },
      { upsert: true }
    )
  } catch (e) {
    console.log("productDetail", e)
  }
}
