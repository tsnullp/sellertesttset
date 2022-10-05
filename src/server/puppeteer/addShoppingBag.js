const startBrowser = require("./startBrowser")
const taobaoLogin = require("./taobaoLogin")

const start = async ({ url, key1, key2 }) => {
  const browser = await startBrowser(false)
  const page = await browser.newPage()
  await page.setDefaultNavigationTimeout(0)
  await page.setJavaScriptEnabled(true)

  const taobaoCookies = global.taobaoCookies

  if (taobaoCookies && Array.isArray(taobaoCookies)) {
    for (const item of taobaoCookies) {
      await page.setCookie(item)
    }
  } else {
    //login.taobao.com/member/login.jhtml?redirectURL=http%3A%2F%2Fs.taobao.com%2Fsearch%3Fq%3D%26type%3Dp%26tmhkh5%3D%26spm%3Da21wu.241046-cn.a2227oh.d100%26from%3Dsea_1_placeholder%26catId%3D100&uuid=4a78e89e5afe13f5c94e856596805800

    await page.goto(`https://login.taobao.com/member/login.jhtml?redirectURL=${url}`, {
      waitUntil: "networkidle0"
    })
    await taobaoLogin(page, "jts0509", "xotjr313#!#")

    const cookies2 = await page.cookies("https://www.taobao.com")

    global.taobaoCookies = cookies2
  }

  // await page.goto(url, { waitUntil: "networkidle0" })

  try {
    await page.waitForSelector(".J_TSaleProp")
    let categoryGroup = await page.$$(".J_TSaleProp")

    try {
      if (categoryGroup.length === 1) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$("li")

        for (const category1 of categoryUL1LI1) {
          await category1.click()

          const keykey1 = await page.evaluate(el => el.getAttribute("data-value"), category1)

          if (keykey1.split(":")[1] === key1) {
            break
          }
        }
      } else if (categoryGroup.length === 2) {
        const categoryUL1 = categoryGroup[0]
        const categoryUL1LI1 = await categoryUL1.$$("li")

        let i = 0
        for (const category1 of categoryUL1LI1) {
          if (i > 0) {
            await category1.click()
          }

          i++

          const keykey1 = await page.evaluate(el => el.getAttribute("data-value"), category1)

          if (keykey1.split(":")[1] === key1) {
            break
          }
        }

        const categoryUL2 = categoryGroup[1]
        const categoryUL2LI2 = await categoryUL2.$$("li")
        for (const category2 of categoryUL2LI2) {
          await category2.click()
          const keykey2 = await page.evaluate(el => el.getAttribute("data-value"), category2)

          if (keykey2.split(":")[1] === key2) {
            break
          }
        }
      }
    } catch (e) {
      console.log("aaaaaaaa", e)
    }

    await page.waitFor(1000)
    let BasketBtn = await page.$("#J_LinkBasket")
    await BasketBtn.click({
      delay: 20
    })
  } catch (e) {}
}

module.exports = start
