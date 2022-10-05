const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")
const { TaobaoOrderList, TaobaoTrade } = require("../api/Taobao")
const TaobaoOrder = require("../models/TaobaoOrder")
const moment = require("moment")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId

let totalPage = 1

const start = async ({ browserHidden = true, userID, loginID, password }) => {
  totalPage = 1
  let currentPage = 1
  const browser = await startBrowser(browserHidden)
  const page = await browser.newPage()
  try {
    await page.goto(
      "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm",
      { waituntil: "networkidle0" }
    )

    await page.waitFor(5000)
    while (page.url().includes("login.taobao.com")) {
      await taobaoLogin(page, loginID, password)
      await page.waitFor(1000)
    }

    console.log("로그인 끝", page.url())
    await page.waitFor(3000)
    const cookies2 = await page.cookies("https://buyertrade.taobao.com/")

    let cookie = ""
    for (const item of cookies2) {
      cookie += `${item.name}=${item.value}; `
    }
    // let cookie =
    //   "thw=kr; cna=j79NGCkRCxICAXmpnyfLoxWm; t=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; lgc=jts0509; tracknick=jts0509; enc=UTU%2FejFP6PhZJgzIF0dnKuwL8BSfgqMiD7TwcTuvv%2F6biI7qygM5ipTad4P2oCj4SP4PGgetRQrEQbf9kgiEDRvkagDoQS5gUDAieLvW%2FgI%3D; ucn=unsh; hng=US%7Czh-CN%7CUSD%7C840; xlly_s=1; _m_h5_tk=0499e5b37c649310412b34d76592912a_1608359873668; _m_h5_tk_enc=3e9d7b16490e5fb343cbb12874388695; v=0; cookie2=208e05b86eeff9f6f26f295c7eb4b197; _tb_token_=e48e83b530a6; _samesite_flag_=true; unb=2207300339085; cookie17=UUphzWRZCaiqizmAkQ%3D%3D; dnk=jts0509; _l_g_=Ug%3D%3D; sg=958; _nk_=jts0509; cookie1=BdS%2FtXhWEqadCcpzZxGKJEbBgAhyyRMkmWxwUd5gSfQ%3D; mt=ci=1_1; sgcookie=E100VoNnsFXf3wnBZgQ8hTAbX1%2FqRBxutIws7weVWkPoeq0H3Q0gTtcnGUKMV8Jgy%2FYMslDIeIKyou%2B1LnC6PphRzw%3D%3D; uc1=cookie15=URm48syIIVrSKA%3D%3D&existShop=false&cookie21=URm48syIZx9a&cookie14=Uoe0ZeFDL7%2BsdQ%3D%3D&cookie16=VT5L2FSpNgq6fDudInPRgavC%2BQ%3D%3D&pas=0&cart_m=0; uc3=nk2=CccE4wq4pw%3D%3D&id2=UUphzWRZCaiqizmAkQ%3D%3D&lg2=VT5L2FSpMGV7TQ%3D%3D&vt3=F8dCuAJ9fnuVz728Cmw%3D; csg=e4178fda; skt=921e876160d4ce9f; existShop=MTYwODM1NDc3OQ%3D%3D; uc4=nk4=0%40C%2Fhu2h%2FMaWb%2FULRYsCvMxrF%2B&id4=0%40U2grFntxu75mpt7f6fu8iZvRew9BaMj8; _cc_=VT5L2FSpdA%3D%3D; tfstk=cwscBo28BQGI4QTlRotfKtf9LAwdat029dRA4g1N4mB6q7CX3sqxz2l5z0vPiG31.; l=eBawkjkgOWQJMjjUBO5aourza77TZQAf1rVzaNbMiIncC6dhsRpZBstQKslxdpxRRWXVGuLB4QJoyueTsFna-PBjnNJGVj2-AKspIeTC.; isg=BICAeHXxy547ObefJu1JC7InUQhSCWTTvfybhPoTBxvGdSOfohuAYhqDjcW1Qxyr"

    // let cookie =
    //   "_fbp=fb.1.1599705465269.2075035590; UM_distinctid=17475f3653f108-04b8be64ee59c5-333769-1fa400-17475f36540cd; enc=EWihQc%2B79sUf0sZY2qArNMtPLj7mX4IvOBpBBCrP3gyHdbpyKlpENH7CV24uMdFPvqh8%2F7uFwGo0N%2BOtxdgQmYXkJX1AUdJcjF3WEBM02BM%3D; t=f22340a501812114334ecde770bb13cc; thw=cn; _bl_uid=Uqkn3gq174OoLyvIkkmR1y93keaa; cna=d3/gF1z51H4CAXmpn+Bvt2As; hng=KR%7Czh-CN%7CKRW%7C410; lgc=metatron79; tracknick=metatron79; ucn=center; cookie2=1f1e54a09b1aa862f4b487350082336e; v=0; _samesite_flag_=true; dnk=metatron79; _tb_token_=363fe5b39dbb1; sgcookie=E100zwiGTUMLwUM3yLGnm2A94jeuPN%2F%2Fa0%2BiQF9WmFmtSz94hbJSZx53s0MrsZ7Nf7MsqX06DDAJmNzcjpMR1nFrFw%3D%3D; unb=2208585006918; uc3=nk2=DlV9M8rmUZy47w%3D%3D&lg2=VFC%2FuZ9ayeYq2g%3D%3D&vt3=F8dCuAJ9f%2F3NbOvcJR0%3D&id2=UUphwoIRVeVOSVXg6A%3D%3D; csg=11e55335; cookie17=UUphwoIRVeVOSVXg6A%3D%3D; skt=62c05279650ffcf6; existShop=MTYwODM2MDc4MA%3D%3D; uc4=nk4=0%40DDCmDbuAEZ7BKQHXIzlX44SNWI0s&id4=0%40U2grGRoA2Mml%2FRyXzzVorCWrusn49U7F; _cc_=W5iHLLyFfA%3D%3D; _l_g_=Ug%3D%3D; sg=985; _nk_=metatron79; cookie1=AHxKFaH23bPDTJigRdgb6UI7vG%2F372x5fa%2FEFGTZ5oE%3D; xlly_s=1; _m_h5_tk=9e1b1a05c00143fa6867194aba1f36d9_1608371612105; _m_h5_tk_enc=adc71f5529a6fdf6bb6523585f4bd396; mt=ci=0_1; uc1=cookie14=Uoe0ZeFAAcN7RQ%3D%3D&pas=0&cookie15=UtASsssmOIJ0bQ%3D%3D&cart_m=0&cookie21=V32FPkk%2FhSg%2F&cookie16=WqG3DMC9UpAPBHGz5QBErFxlCA%3D%3D&existShop=false; tfstk=cKeFBuOaK9BE-2k5MvMyN3sjw4pda3q3qdojt7MSJ_GP9E3musjXycDlgcoSkOch.; l=eBL0J7sHOC5feu1MBO5Z-urza779wBOffsPzaNbMiInca6CP6w2oaNQ2dluDJdtjQt50OetrJmGnAREp8faU-A9EAIZii8nBhnvD5e1..; isg=BOTkVaXeZ4rNL5Mkvz4i8rrYteLWfQjni7xwIf4CQa-0qYNzJoxLdvVHaRmxcUA_"

    console.log("cookie", cookie.trim())
    while (currentPage <= totalPage) {
      console.log("currentPage", `${currentPage}/${totalPage}`)
      await searchOrderListWithPage({ userID, currentPage, cookie })
      currentPage++
    }
  } catch (e) {
    console.log("searchTaobaoOrderList -- ", e)
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

const searchOrderListWithPage = async ({ userID, currentPage, cookie }) => {
  try {
    const response = await TaobaoOrderList({
      pageNum: currentPage,
      referer: "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm",
        
      cookie: cookie.trim()
    })
    console.log("responseresponse", response)
    totalPage = response.page.totalPage

    for (const item of response.mainOrders) {
      const korTime = moment(item.orderInfo.createTime, "YYYY-MM-DD HH:mm:SS").add(1, "hour")

      // item.id  // 주문번호

      const trade = await TaobaoTrade({
        id: item.id,
        referer:
          "https://buyertrade.taobao.com/trade/itemlist/list_bought_items.htm?spm=a1z0d.6639537.1997525045.2.3c357484qDbjEx",
        cookie: cookie.trim()
      })

      const temp = await TaobaoOrder.findOne({
        orderNumber: item.id,
        userID: ObjectId(userID)
      })

      if (temp) {
        await TaobaoOrder.findOneAndUpdate(
          {
            orderNumber: item.id,
            userID: ObjectId(userID)
          },
          {
            $set: {
              shippingStatus: item.statusInfo.text,
              express: trade
            }
          },
          { upsert: true }
        )
      } else {
        await TaobaoOrder.findOneAndUpdate(
          {
            orderNumber: item.id,
            userID: ObjectId(userID)
          },
          {
            $set: {
              orderNumber: item.id,
              userID: ObjectId(userID),
              orderDate: korTime.format("YYYYMMDD"),
              orderTime: korTime.format("HHmmSS"),
              orders: item.subOrders.map(item => {
                return {
                  id: item.itemInfo.id ? item.itemInfo.id : null,
                  productName: item.itemInfo.title,
                  thumbnail: item.itemInfo.pic
                    ? `https:${item.itemInfo.pic.split("_80x80.jpg")[0]}`
                    : null,
                  detail: item.itemInfo.itemUrl ? `https:${item.itemInfo.itemUrl}` : null,
                  skuId: item.itemInfo.skuId,
                  option: item.itemInfo.skuText ? item.itemInfo.skuText : [],
                  originalPrice: item.priceInfo.original,
                  realPrice: item.priceInfo.realTotal,
                  quantity: item.quantity ? item.quantity : null
                }
              }),
              purchaseAmount: item.payInfo.actualFee,
              shippingFee: item.payInfo.postFees[0].value.replace("￥", "").trim(),
              quantity: item.subOrders[0].quantity,
              shippingStatus: item.statusInfo.text,
              express: trade
            }
          },
          { upsert: true }
        )
      }

      //交易关闭 거래소폐쇄
    }
  } catch (e) {
    console.log("searchOrderListWithPage", e)
  }
}
