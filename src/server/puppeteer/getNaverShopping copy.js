const startBrowser = require("./startBrowser")

const find = async ({ url }) => {
  const browser = await startBrowser(true)
  const page = await browser.newPage()
  const list = []
  try {
    console.log("url", url)
    if(url.includes("https://smartstore.naver.com/")) {
      await page.goto(`view-source:${url}`, { waitUntil: "networkidle0" })

      const content = await page.content()

      const temp1 = content.split("window.__PRELOADED_STATE__=")[1]
      const temp2 = temp1.split("<span")[0].trim()
      
      const jsObj = JSON.parse(temp2)
      
      const {id} = jsObj.smartStore.channel
      const {store} = jsObj.smartStore
      const rankingProducts = jsObj.smartStore.rankingProducts || []
      for(const item of rankingProducts){
        let sellerTags = []
        if(item.seoInfo && item.seoInfo.sellerTags){
          
          sellerTags = item.seoInfo.sellerTags.map(item => {
            return item.text
          })
        }
        list.push({
          type: "ranking",
          displayName: store.displayName,
          productNo: item.productNo,
          detailUrl: `${url}/products/${item.productNo}`,
          name: item.simpleProduct.name,
          categoryId:item.simpleProduct.category.categoryId,
          // category: item.simpleProduct.category,
          image: item.simpleProduct.representativeImageUrl,
          // saleAmount: item.simpleProduct.saleAmount,
          sellerTags, 
          reviewCount: item.simpleProduct.reviewAmount.totalReviewCount,
          zzim: 0,
          purchaseCnt: item.simpleProduct.saleAmount.cumulationSaleCount,
        })
      }

      await page.goto(`https://smartstore.naver.com/i/v1/stores/${id}/categories/ALL/products?categoryId=ALL&categorySearchType=STDCATG&sortType=TOTALSALE&free=false&page=1&pageSize=40`, { waitUntil: "networkidle0" })

      const productStr = await page.content()

      const temp3 = productStr.split(`<html><head></head><body><pre style="word-wrap: break-word; white-space: pre-wrap;">`)[1]
      const temp4 = temp3.split(`</pre></body></html>`)[0]
      const productList = JSON.parse(temp4)
      
      for(const item of productList.simpleProducts){
        
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
          purchaseCnt: item.item.purchaseCnt
        })
      }
    }
    
    // console.log("list", list)
  } catch (err) {
    console.log("Error", err)
    return list
  } finally {
    await browser.close()
    return list
  }
}

module.exports = find