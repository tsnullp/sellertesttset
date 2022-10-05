const login = async (page, username, password) => {
  //login.taobao.com

  try {
    // const taobaoCookies = global.taobaoCookies

    // if (taobaoCookies && Array.isArray(taobaoCookies)) {
    //   for (const item of taobaoCookies) {
    //     await page.setCookie(item)
    //   }

    //   return true
    // }

    if (!username || !password) return null

    await inputLogin(page, username, password)

    // while (!sliderSuccess) {
    //   await page.reload({ waitUntil: ["networkidle0", "domcontentloaded"] })

    //   sliderSuccess = await inputLogin(page, username, password)
    // }
    // await page.waitFor(1000 + Math.floor(Math.random() * 2000))
    // await page.tap('##nc_1_n1z');
    let loginBtn = await page.$(".fm-button.fm-submit.password-login")
    await loginBtn.click({
      delay: 20
    })

    await page.waitFor(2000 + Math.floor(Math.random() * 1000))
    // await page.waitForNavigation({ timeout: 1000000 })
    // const error = await page.$eval(".error", node => node.textContent)
    // if (error) {
    //   console.log("确保账户安全重新入输入")
    //   return false
    // }

    let title = await page.title()
    let i = 0
    while (title === "security-X5") {
      if (i > 10) {
        return
      }
      await mouseSlide(page)
      title = await page.title()
      i++
    }

    const cookies2 = await page.cookies("https://www.taobao.com")
    global.taobaoCookies = cookies2

    return true
  } catch (e) {
    console.log("taobaoLogin", e)
    return false
  }
}

const mouseSlide1 = async page => {
  let bl = false
  while (!bl) {
    try {
      await page.hover("#nc_1_n1z")
      await page.mouse.down()
      await page.mouse.move(2000, 0, {
        delay: 1000 + Math.floor(Math.random() * 1000)
      })
      await page.mouse.up()

      const slider_again = await page.$eval(".nc-lang-cnt", node => node.textContent)
      console.log("slider_again", slider_again)
      if (slider_again !== "验证通过") {
        bl = false
        await page.waitFor(1000 + Math.floor(Math.random() * 1000))
        break
      }

      console.log("验证通过")
      return 1
    } catch (e) {
      console.log("error :slide login False", e)
      bl = false
      break
    }
  }
}

const mouseSlide = async page => {
  let bl = false
  while (!bl) {
    try {
      await page.hover("#nc_1_n1z")
      await page.mouse.down()

      await page.mouse.move(2000, 0, {
        delay: 1000 + Math.floor(Math.random() * 10000) + 1000 + Math.floor(Math.random() * 10000)
      })

      await page.waitFor(1000 + Math.floor(Math.random() * 1000))
      await page.mouse.up()

      const slider_again = await page.$eval(".nc-lang-cnt", node => node.textContent)
      console.log("slider_again", slider_again)
      if (slider_again === `验证通过`) {
        console.log("验证通过")
        return true
      } else {
        console.log("로그인 실패")

        bl = false
        await page.waitFor(2000 + Math.floor(Math.random() * 1000))
        await page.reload()
      }
    } catch (e) {
      bl = false
      return false
    }
  }
}

const inputLogin = async (page, username, password) => {
  // try {
  //   // await page.evaluate(js1)
  //   // await page.waitFor(500 + Math.floor(Math.random() * 1000))
  //   // await page.evaluate(js3)
  //   // await page.waitFor(500 + Math.floor(Math.random() * 1000))
  //   // await page.evaluate(js4)
  //   // await page.waitFor(500 + Math.floor(Math.random() * 1000))
  //   // await page.evaluate(js5)
  //   // await page.waitFor(500 + Math.floor(Math.random() * 1000))

  //   // await page.evaluate(() => {
  //   //   window.navigator.chrome = { runtime: {} }
  //   // })
  //   // await page.evaluate(() => {
  //   //   Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] })
  //   // })
  //   await page.evaluate(() => {
  //     Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5, 6] })
  //   })
  //   await page.evaluate(() => {
  //     Object.defineProperties(navigator, { webdriver: { get: () => false } })
  //   })
  // } catch (e) {
  //   console.log("evalute ->", e)
  // }

  try {
    const opts = {
      delay: 6 + Math.floor(Math.random() * 2) //每个字母之间输入的间隔
    }

    await page.waitForSelector("#login-form", { timeout: 60000 })

    await page.tap("#fm-login-id")
    await page.type("#fm-login-id", "", opts)
    await page.type("#fm-login-id", username, opts)
    await page.waitFor(1000)
    await page.tap("#fm-login-password")
    await page.type("#fm-login-password", "", opts)
    await page.type("#fm-login-password", password, opts)

    await page.waitForSelector("#nocaptcha-password")
    const slider = await page.$eval("#nocaptcha-password", node => node.style)
    console.log("slider--", slider)
    if (slider && Object.keys(slider).length) {
      await mouseSlide(page)
    }
  } catch (e) {}
}
module.exports = login
