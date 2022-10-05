const axios = require("axios")
const _ = require("lodash")

const find = async ({ url }) => {
  const list = []
  try {
    console.log("url", url)
    if(url.includes("https://smartstore.naver.com/")) {

      const content = await axios.get(url)

      const temp1 = content.data.split("window.__PRELOADED_STATE__=")[1]
      const temp2 = temp1.split("<span")[0].trim()
      const temp21 = temp2.split("</script>")[0].trim()
      
      const jsObj = JSON.parse(temp21)
      const {channel} = jsObj.smartStoreV2
  
      let simpleProducts = []
      
      const promiseArr = [
        new Promise(async (resolve, reject) => {
          try {
            const productPOPULAR = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=POPULAR&free=false&subscr=false&page=1&pageSize=40`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: url,
                  withCredentials: true,
                  Host: "smartstore.naver.com"
                },
              }
            )
            simpleProducts.push(...productPOPULAR.data.simpleProducts)
            resolve()
          } catch(e){
            reject(e)
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const productTOTALSALE = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&free=false&subscr=false&page=1&pageSize=40`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: url,
                  Host: "smartstore.naver.com",
                  withCredentials: true,
                },
              }
            )
            simpleProducts.push(...productTOTALSALE.data.simpleProducts)
            resolve()
          } catch(e){
            reject(e)
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const productRECENT = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=RECENT&free=false&subscr=false&page=1&pageSize=40`,
              {
                headers: {
                  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Host: "smartstore.naver.com",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: url,
                  withCredentials: true,
                },
              }
            )
            simpleProducts.push(...productRECENT.data.simpleProducts)
            resolve()
          } catch(e){
            reject(e)
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const productREVIEW = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=REVIEW&free=false&subscr=false&page=1&pageSize=40`,
              {
                headers: {
                  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Host: "smartstore.naver.com",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: url,
                  withCredentials: true,
                },
              }
            )
            simpleProducts.push(...productREVIEW.data.simpleProducts)
            resolve()
          } catch(e){
            reject(e)
          }
        }),
        new Promise(async (resolve, reject) => {
          try {
            const productSATISFACTION = await axios.get(
              `https://smartstore.naver.com/i/v1/stores/${channel.id}/categories/ALL/products?categoryId=ALL&categorySearchType=SATISFACTION&sortType=REVIEW&free=false&subscr=false&page=1&pageSize=40`,
              {
                headers: {
                  "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36",
                  "sec-fetch-site": "same-origin",
                  "sec-fetch-mode": "cors",
                  "Accept-Encoding": "gzip, deflate, br",
                  Connection: "keep-alive",
                  "Cache-Control": "no-cache",
                  Host: "smartstore.naver.com",
                  Pragma: "no-cache",
                  Expires: "0",
                  referer: url,
                  withCredentials: true,
                },
              }
            )
            simpleProducts.push(...productSATISFACTION.data.simpleProducts)
            resolve()
          } catch(e){
            reject(e)
          }
        }),
      ]
      
      await Promise.all(promiseArr)

      simpleProducts = _.uniqBy(simpleProducts, "id")


      for(const item of simpleProducts){
        try {
          const content = await axios.get(
            `https://smartstore.naver.com/i/v1/stores/${item.channel.channelNo}/products/${item.id}`,
            {
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36",
                "sec-fetch-site": "same-origin",
                "sec-fetch-mode": "cors",
                "Accept-Encoding": "gzip, deflate, br",
                Connection: "keep-alive",
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
                Expires: "0",
                referer: url,
              },
            }
          )

          if(content &&  content.data &&
            content.data.claimDeliveryInfo &&
            content.data.claimDeliveryInfo.overseasShipping === true &&
            // (content.data.originAreaInfo.originAreaCode === "0200037" ||
            //   content.data.originAreaInfo.content.includes("중국")) &&
            (!content.data.naverShoppingSearchInfo || !content.data.naverShoppingSearchInfo.brandId)){

              let sellerTags = []
              if (item.seoInfo && item.seoInfo.sellerTags) {
                sellerTags = item.seoInfo.sellerTags.map((item) => {
                  return item.text
                })
              } else if (content.data.seoInfo && content.data.seoInfo.sellerTags) {
                sellerTags = content.data.seoInfo.sellerTags.map((item) => {
                  return item.text
                })
              }
              let category1, category2, category3, category4

              const wholeCategoryId = item.category.wholeCategoryId.split(">")
              if (wholeCategoryId.length > 0) {
                category1 = wholeCategoryId[0]
              }
              if (wholeCategoryId.length > 1) {
                category2 = wholeCategoryId[1]
              }
              if (wholeCategoryId.length > 2) {
                category3 = wholeCategoryId[2]
              }
              if (wholeCategoryId.length > 3) {
                category4 = wholeCategoryId[3]
              }

              
              
              list.push({
                type: "ranking",
                displayName: channel.channelName,
                productNo: item.productNo,
                detailUrl: `${url}/products/${item.id}`,
                name: item.name
                  ? item.name
                      .replace(item.channel.channelName, "")
                      .replace("(", "")
                      .replace(")", "")
                      .replace("[", "")
                      .replace("]", "")
                      .replace("/", " ")
                      .trim()
                  : "",
                categoryId: item.category.categoryId,
                category1,
                category2,
                category3,
                category4,
                
                regDate: content.data.regDate,
                // category: item.simpleProduct.category,
                image: item.representativeImageUrl,
                // saleAmount: item.simpleProduct.saleAmount,
                sellerTags,
                reviewCount: item.reviewAmount.totalReviewCount,
                zzim: 0,
                purchaseCnt: item.saleAmount.cumulationSaleCount,
                recentSaleCount: item.saleAmount.recentSaleCount,
                
              })

            }

        } catch (e) {
          console.log("eee1", e)
        }
      }
     /* 
      const content = await axios.get(url)

      const temp1 = content.data.split("window.__PRELOADED_STATE__=")[1]
      const temp2 = temp1.split("<span")[0].trim()
      const temp21 = temp2.split("</script>")[0].trim()
      
      const jsObj = JSON.parse(temp21)
      
      const {id} = jsObj.smartStoreV2.channel
      const {channel} = jsObj.smartStoreV2
      // const rankingProducts = jsObj.smartStore.rankingProducts || []
      const rankingProducts = jsObj.widgetContents.promotionBannerWidget.A.data || []
      for(const item of rankingProducts){
        let sellerTags = []
        if(item.seoInfo && item.seoInfo.sellerTags){
          
          sellerTags = item.seoInfo.sellerTags.map(item => {
            return item.text
          })
        }
        list.push({
          type: "ranking",
          displayName: channel.channelName,
          productNo: item.productNo,
          detailUrl: `${url}/products/${item.id}`,
          name: item.name ? item.name.replace(item.channel.channelName, "")
          .replace("(", "")
          .replace(")", "")
          .replace("[", "")
          .replace("]", "")
          .replace("/", " ")
          .trim() : "",
          categoryId:item.category.categoryId,
          // category: item.simpleProduct.category,
          image: item.representativeImageUrl,
          // saleAmount: item.simpleProduct.saleAmount,
          sellerTags, 
          reviewCount: item.reviewAmount.totalReviewCount,
          zzim: 0,
          purchaseCnt: item.saleAmount.cumulationSaleCount,
        })
      }

      // await page.goto(`https://smartstore.naver.com/i/v1/stores/${id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&free=false&page=1&pageSize=40`, { waitUntil: "networkidle0" })

      // const productStr = await page.content()
      const productStr = await axios.get(`https://smartstore.naver.com/i/v1/stores/${id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&free=false&page=1&pageSize=40`)
      // console.log("productStr.data", productStr.data)
      // const temp3 = productStr.data.split(`<html><head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">`)[1]
      // const temp4 = temp3.split(`</pre></body></html>`)[0]
      // const productList = JSON.parse(temp4)
      
      for(const item of productStr.data.simpleProducts){
        
        let sellerTags = []
        if(item.seoInfo && item.seoInfo.sellerTags){
          
          sellerTags = item.seoInfo.sellerTags.map(item => {
            return item.text
          })
        }
        if(list.filter(fItem => fItem.productNo === item.id).length === 0){
          list.push({
            type: "salesOrder",
            displayName: item.channel.channelName,
            productNo: item.id,
            detailUrl: `${url}/products/${item.id}`,
            name: item.name,
            categoryId: item.category.categoryId,
            image: item.representativeImageUrl,
            // saleAmount: item.saleAmount,
            sellerTags,
            // reviewCount: item.item.reviewCount,
            reviewCount: item.reviewAmount.totalReviewCount,
            zzim: 0,
            purchaseCnt: item.saleAmount.cumulationSaleCount,
          })
        }
        
      }

     */
    } else if(url.includes("https://search.shopping.naver.com/")){
      await page.goto(`view-source:${url}`, { waitUntil: "networkidle0" })
      const content = await page.content()
      
      const temp1 = content.split(`"<span class="html-attribute-value">application/json</span>"&gt;</span>`)[1]
      
      const temp2 = temp1.split(`<span class="html-tag">`)[0]
      const jsonObj = JSON.parse(temp2)
      const products = jsonObj.props.pageProps.initialState.products.list
      for(const item of products){
        
        const { category1Id, category2Id, category3Id, category4Id} = item.item
        let categoryId = ''
        if(category1Id){
          categoryId = category1Id
        }
        if(category2Id){
          categoryId = category2Id
        }
        if(category3Id){
          categoryId = category3Id
        }
        if(category4Id){
          categoryId = category4Id
        }

        let mallName = item.item.mallName
        if(!mallName){
          if(item.item.mallInfoCache){
            mallName = item.item.mallInfoCache.name
          }
          
        }

        list.push({
          type: "list",
          productNo: item.item.mallProductId,
          displayName: mallName,
          detailUrl: item.item.mallProductUrl,
          name: item.item.productName,
          categoryId,
          image: item.item.imageUrl,
          sellerTags: [],
          reviewCount: item.item.reviewCount,
          zzim: item.item.keepCnt,
          purchaseCnt: item.item.purchaseCnt,
          recentSaleCount: item.item.recentSaleCount
        })
      }
    }
    
    // console.log("list", list)
  } catch (err) {
    console.log("Error", err)
    return list
  } finally {

    return list.sort((a, b) => b.recentSaleCount - a.recentSaleCount)
  }
}

module.exports = find