const download = require("image-downloader")
const FormData = require("form-data")
const fs = require("fs")
const path = require("path")
const { getAppDataPath } = require("../../lib/usrFunc")
const { ImageUpload, ImageList } = require("../api/Taobao")
const Product = require("../models/Product")
const mongoose = require("mongoose")
const ObjectId = mongoose.Types.ObjectId
const moment = require("moment")

const start = async ({ imageUrl, user }) => {
  let productList = []

  try {
    const appDataDirPath = getAppDataPath()
    if (!fs.existsSync(appDataDirPath)) {
      fs.mkdirSync(appDataDirPath)
    }

    if (!fs.existsSync(path.join(appDataDirPath, "temp"))) {
      fs.mkdirSync(path.join(appDataDirPath, "temp"))
    }

    const options = {
      url: imageUrl.split("?")[0],
      dest: path.join(appDataDirPath, "temp")
    }

    const { filename } = await download.image(options)

    const form = new FormData()
    form.append("imgfile", fs.createReadStream(filename), {
      filename,
      knownLength: fs.statSync(filename).size
    })
    const response = await ImageUpload({
      data: form,
      referer: "https://s.taobao.com/search",
      cookie:
        "t=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; _uab_collina=160708339975858614767474; enc=UTU%2FejFP6PhZJgzIF0dnKuwL8BSfgqMiD7TwcTuvv%2F6biI7qygM5ipTad4P2oCj4SP4PGgetRQrEQbf9kgiEDRvkagDoQS5gUDAieLvW%2FgI%3D; hng=CN%7Czh-CN%7CCNY%7C156; thw=cn; xlly_s=1; cna=j79NGCkRCxICAXmpnyfLoxWm; lgc=jts0509; tracknick=jts0509; v=0; cookie2=20e6b41826951fee39af21c40230bfce; _samesite_flag_=true; dnk=jts0509; alitrackid=world.taobao.com; lastalitrackid=world.taobao.com; _tb_token_=eebe18503be65; sgcookie=E100geRlKYW%2BXh%2FLmsM0L8P91VYK2ngHf0crhsJJe6nuhzUqFtPMP%2FWEFOooE33OJmcrwrN2yYmCTOqNjZHlapG1Tg%3D%3D; uc3=nk2=CccE4wq4pw%3D%3D&vt3=F8dCuAMvYU4R4HlZ6MU%3D&id2=UUphzWRZCaiqizmAkQ%3D%3D&lg2=WqG3DMC9VAQiUQ%3D%3D; csg=bf84e419; skt=79199763563e401b; existShop=MTYwODcyMDI2MQ%3D%3D; uc4=nk4=0%40C%2Fhu2h%2FMaWb%2FULRYtMmbtwes&id4=0%40U2grFntxu75mpt7f6fu8iZvRf8hIam6V; _cc_=VFC%2FuZ9ajQ%3D%3D; _m_h5_tk=0fb502c4e974e643e4e303db1cdadd5e_1608734679832; _m_h5_tk_enc=576de47c527221202ad7967f44437089; mt=ci=-1_0; JSESSIONID=A90AF504EAAD810ADA6BD35F964ED212; uc1=cookie14=Uoe0ZeVBkPjwfQ%3D%3D&cookie21=VFC%2FuZ9aj3yE&cart_m=0&cookie16=Vq8l%2BKCLySLZMFWHxqs8fwqnEw%3D%3D&existShop=false&pas=0; tfstk=c1llB3N9nossdi2mCQNSSI_gaotAaxfzbXljgj99kv_xPil4zsfR3OJsfEqoqXBC.; l=eBawkjkgOWQJM6VtBOfZourza7798IRfguPzaNbMiOCPONfev3BFWZ-DQzLwCnMNHsa2R38WwOn8B4TFbPlKJxpsw3k_J_DmndC..; isg=BDY2XtVNdWLF8gE9XGPnCYgRh2o4V3qRRKrZ5qAfdpm549d9COYAodBZ-6ePy3Kpt=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; _uab_collina=160708339975858614767474; enc=UTU%2FejFP6PhZJgzIF0dnKuwL8BSfgqMiD7TwcTuvv%2F6biI7qygM5ipTad4P2oCj4SP4PGgetRQrEQbf9kgiEDRvkagDoQS5gUDAieLvW%2FgI%3D; hng=CN%7Czh-CN%7CCNY%7C156; thw=cn; xlly_s=1; cna=j79NGCkRCxICAXmpnyfLoxWm; lgc=jts0509; tracknick=jts0509; v=0; cookie2=20e6b41826951fee39af21c40230bfce; _samesite_flag_=true; dnk=jts0509; alitrackid=world.taobao.com; lastalitrackid=world.taobao.com; _tb_token_=eebe18503be65; sgcookie=E100geRlKYW%2BXh%2FLmsM0L8P91VYK2ngHf0crhsJJe6nuhzUqFtPMP%2FWEFOooE33OJmcrwrN2yYmCTOqNjZHlapG1Tg%3D%3D; uc3=nk2=CccE4wq4pw%3D%3D&vt3=F8dCuAMvYU4R4HlZ6MU%3D&id2=UUphzWRZCaiqizmAkQ%3D%3D&lg2=WqG3DMC9VAQiUQ%3D%3D; csg=bf84e419; skt=79199763563e401b; existShop=MTYwODcyMDI2MQ%3D%3D; uc4=nk4=0%40C%2Fhu2h%2FMaWb%2FULRYtMmbtwes&id4=0%40U2grFntxu75mpt7f6fu8iZvRf8hIam6V; _cc_=VFC%2FuZ9ajQ%3D%3D; _m_h5_tk=0fb502c4e974e643e4e303db1cdadd5e_1608734679832; _m_h5_tk_enc=576de47c527221202ad7967f44437089; mt=ci=-1_0; JSESSIONID=A90AF504EAAD810ADA6BD35F964ED212; uc1=cookie14=Uoe0ZeVBkPjwfQ%3D%3D&cookie21=VFC%2FuZ9aj3yE&cart_m=0&cookie16=Vq8l%2BKCLySLZMFWHxqs8fwqnEw%3D%3D&existShop=false&pas=0; tfstk=c1llB3N9nossdi2mCQNSSI_gaotAaxfzbXljgj99kv_xPil4zsfR3OJsfEqoqXBC.; l=eBawkjkgOWQJM6VtBOfZourza7798IRfguPzaNbMiOCPONfev3BFWZ-DQzLwCnMNHsa2R38WwOn8B4TFbPlKJxpsw3k_J_DmndC..; isg=BDY2XtVNdWLF8gE9XGPnCYgRh2o4V3qRRKrZ5qAfdpm549d9COYAodBZ-6ePy3Kp"
    })
    // console.log("response", response)
    if (response.error === false) {
      //response.name 20210103
      const imageListResponse = await ImageList({
        tfsid: response.name,
        referer: `https://s.taobao.com/search?imgfile=&js=1&stats_click=search_radio_all%3A1&initiative_id=staobaoz_${moment().format(
          "YYYYMMDD"
        )}&ie=utf8&tfsid=${response.name}&app=imgsearch`,
        cookie:
          "t=17f720aab9b7ebb7885d62213546def4; _fbp=fb.1.1606865297671.2140592661; _uab_collina=160708339975858614767474; thw=cn; enc=N8mRI68%2Fet0iczcYgnerVbaKlGoXGY1iXrF5jkll9ec%2F1tg1nqZBbFovxOMaiC4mS%2FP2t8ek0bOOIEG2fd51n0TMSp8ySABkPdMvOYjO1io%3D; cookie2=21785ebb765546c1f9e4f0575f6eb95d; alitrackid=world.taobao.com; _samesite_flag_=true; hng=KR%7Czh-CN%7CKRW%7C410; lastalitrackid=world.taobao.com; v=0; cna=j79NGCkRCxICAXmpnyfLoxWm; lgc=jts0509; dnk=jts0509; tracknick=jts0509; xlly_s=1; sgcookie=E100nXaHnZa7X7soq%2FAoU8080KFKsIuXKWlmxFrykx9aHkPUcFyjBZY%2BfEC1YhmH2oUpllF77EVD3wGgmzXRWEhTjg%3D%3D; uc3=lg2=W5iHLLyFOGW7aA%3D%3D&nk2=CccE4wq4pw%3D%3D&id2=UUphzWRZCaiqizmAkQ%3D%3D&vt3=F8dCuAAkXzXJDsU6Z4o%3D; csg=4e29c30e; skt=4be8d976f5f57d44; existShop=MTYwOTU5MTAyMg%3D%3D; uc4=id4=0%40U2grFntxu75mpt7f6fu8iZvQ6w%2FE2sQ9&nk4=0%40C%2Fhu2h%2FMaWb%2FULRZb1dOb6X0; _cc_=U%2BGCWk%2F7og%3D%3D; _m_h5_tk=028f58891c6ab60ade985720e02d816f_1609617012972; _m_h5_tk_enc=e68ac7cae2cbb98bb71f8714b50449e7; mt=ci=-1_0; _tb_token_=ebe5eae753b18; JSESSIONID=66428A68E7D870BCB14F372F8382741B; x5sec=7b227061696c6974616f3b32223a223961363232373362333363333334633237333034326234396563393666383635434d537a78503846454d6a426e396a7a344b326335774561447a49794d44637a4d44417a4d7a6b774f4455374d673d3d227d; isg=BH9_AjM1HEfEOxhyjZC-XgkSDlUJZNMGZYmg6RFMGy51IJ-iGTRjVv0yYujeY6t-; l=eBawkjkgOWQJMVGsBOfanurza77OSIRYYuPzaNbMiOCP9BCB54qCWZ8XXJ86C3MNh6nHR38WwOnJBeYBcQAonxv92j-la_kmn; tfstk=c_4NBgZdxq2IZluf2Vg2ckeRyAVOwYN0_elSjo1e3xxbcffcIKhH5zlEGYQnj; uc1=cookie14=Uoe0ZNC760qBuw%3D%3D&cookie21=Vq8l%2BKCLiYYu&cart_m=0&pas=0&cookie16=U%2BGCWk%2F74Mx5tgzv3dWpnhjPaQ%3D%3D&existShop=false"
      })

      const temp1 = imageListResponse.split("g_page_config = ")
      if (temp1.length > 1) {
        const temp2 = temp1[1].split(";")[0]
        const imageListParser = JSON.parse(temp2)
        // console.log("imageListParser", imageListParser.mods.itemlist.data.collections[0].auctions)

        productList = imageListParser.mods.itemlist.data.collections[0].auctions.map(item => {
          return {
            image: `https:${item.pic_url}`,
            detail: `https:${item.detail_url}`,
            title: item.title,
            price: item.view_price,
            dealCnt: item.view_sales.replace("人付款", ""),
            shop: item.nick,
            location: item.item_loc,
            commentCount: item.comment_count
          }
        })
      }
      // productList.sort((a, b) => {
      //   return b.dealCnt - a.dealCnt
      // })

      const product = await Product.aggregate([
        {
          $match: {
            userID: ObjectId(user.adminUser),
            isDelete: false,
            product: { $ne: null },
            basic: { $ne: null },
            coupangUpdatedAt: { $ne: null },
            cafe24UpdatedAt: { $ne: null },
            "basic.naverID": { $ne: null }
          }
        },
        {
          $project: {
            basic: 1
          }
        }
      ])

      for (const item of productList) {
        if (product.filter(savedItem => savedItem.basic.url === item.detail).length > 0) {
          item.registered = true
        } else {
          item.registered = false
        }
      }
    }

    fs.unlinkSync(filename)
  } catch (e) {
    console.log("taobaoImageSearchingNew", e)
  } finally {
    return productList
  }
}

module.exports = start
