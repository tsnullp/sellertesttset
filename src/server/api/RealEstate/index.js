const axios = require("axios")

exports.GetComplexNo = async ({lat, lng}) => {
  
  console.log("leftLon", Number(lng) - 0.44)
  console.log("rightLon", Number(lng) + 0.44)
  console.log("topLat", Number(lat) + 0.21)
  console.log("bottomLat", Number(lat) - 0.21)
  try {
    const response = await axios({
      url: `https://new.land.naver.com/api/complexes/single-markers/2.0?zoom=18&priceType=RETAIL&markerId&markerType&selectedComplexNo&selectedComplexBuildingNo&fakeComplexMarker&realEstateType=APT%3AABYG%3AJGC&tradeType=&tag=%3A%3A%3A%3A%3A%3A%3A%3A&rentPriceMin=0&rentPriceMax=900000000&priceMin=0&priceMax=900000000&areaMin=0&areaMax=900000000&oldBuildYears&recentlyBuildYears&minHouseHoldCount&maxHouseHoldCount&showArticle=false&sameAddressGroup=true&directions=&leftLon=${Number(lng) - 0.44}&rightLon=${Number(lng) + 0.44}&topLat=${Number(lat) + 0.21}&bottomLat=${Number(lat) - 0.21}`,
      method: "GET",
      responseType: "arraybuffer"
    })
    
    return JSON.parse(response.data.toString());
  } catch (e) {
    console.log("eee====,",e )
    return null
  }
}