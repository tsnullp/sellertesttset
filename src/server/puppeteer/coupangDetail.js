const { CoupangSdp } = require("../api/Market")
const moment = require("moment")

const start = async ({url}) => {
  
  const options = []
  
  const response = await CoupangSdp({ url })
  
  if (!response) return
  try {
    const { title, ratingCount, ratingAveragePercentage } = response
    const otherSellerCount = response.otherSellerCount ? response.otherSellerCount : 0

    const mainImages = response.images.map(item => {
      return item.detailImage ? `https:${item.detailImage}` : `https:${item.origin}`
    })


    if (response && response.options) {
      const {
        // otherSellerCount = 0,
        optionRows,
        attributeVendorItemMap
      } = response.options

      // console.log("optionRows", optionRows)
      // console.log("attributeVendorItemMap", attributeVendorItemMap)

      if (optionRows.length === 1) {
        optionRows[0].attributes.forEach(attItem => {
          let active = !response.soldOut
          let price = null
          let priceAmount = null
          let image = null
          let diff = null
          let shippingFee = 0
          if (attributeVendorItemMap[attItem.valueId] && Array.isArray(attributeVendorItemMap[attItem.valueId].quantityBase) &&  attributeVendorItemMap[attItem.valueId].quantityBase.length > 0) {
            active = !attributeVendorItemMap[attItem.valueId].soldOut

            priceAmount = Number(
              attributeVendorItemMap[
                attItem.valueId
              ].quantityBase[0].priceList[0].priceAmount.replace(/,/gi, "")
            )
            
            try {
              price = Number(
                attributeVendorItemMap[attItem.valueId].quantityBase[0].price.salePrice.replace(
                  /,/gi,
                  ""
                )
              )
            } catch(e){
              price = Number(
                attributeVendorItemMap[attItem.valueId].quantityBase[0].price.couponPrice.replace(
                  /,/gi,
                  ""
                )
              )
             
            }

            if (attributeVendorItemMap[attItem.valueId].quantityBase[0].delivery.descriptions) {
              const deliveryDay = attributeVendorItemMap[
                attItem.valueId
              ].quantityBase[0].delivery.descriptions
                .split(">")[1]
                .split("<")[0]
              image = `https:${attributeVendorItemMap[attItem.valueId].images[0].detailImage}`
              diff = moment(deliveryDay, "M/D").diff(moment().toDate(), "days") + 1
            }

            if (
              attributeVendorItemMap[attItem.valueId].quantityBase[0].shippingFee
                .shippingFeeType === "NOT_FREE"
            ) {
              const message =
                attributeVendorItemMap[attItem.valueId].quantityBase[0].shippingFee.message
              shippingFee = Number(
                message
                  .replace("배송비", "")
                  .replace("원", "")
                  .replace(/,/gi, "")
                  .trim()
              )
            }
          }

          options.push({
            key: attItem.valueId,
            optionKey1: optionRows[0].name,
            optionTitle1: attItem.name,
            title: attItem.name,
            price,
            priceAmount,
            shippingFee,
            image,
            deliveryDay: diff,
            active
          })
        })
      } else if (optionRows.length === 2) {
        optionRows[0].attributes.forEach(attItem1 => {
          optionRows[1].attributes.forEach(attItem2 => {
            let active = !response.soldOut
            let price = null
            let priceAmount = null
            let image = null
            let diff = null
            let shippingFee = 0
            if (attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`]) {
              active = !attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`].soldOut
              price = 0
              try {
                price = Number(
                  attributeVendorItemMap[
                    `${attItem1.valueId}:${attItem2.valueId}`
                  ].quantityBase[0].price.salePrice.replace(/,/gi, "")
                )
              } catch(e){
               
                price = Number(
                  attributeVendorItemMap[
                    `${attItem1.valueId}:${attItem2.valueId}`
                  ].quantityBase[0].price.couponPrice.replace(/,/gi, "")
                )
              }
              priceAmount = 0

              try {
                priceAmount = Number(
                  attributeVendorItemMap[
                    `${attItem1.valueId}:${attItem2.valueId}`
                  ].quantityBase[0].priceList[0].priceAmount.replace(/,/gi, "")
                )
              } catch(e) {

                console.log("aa----", attributeVendorItemMap[
                  `${attItem1.valueId}:${attItem2.valueId}`
                ].quantityBase[0].priceList[0].priceAmount)
                
                priceAmount = Number(
                  attributeVendorItemMap[
                    `${attItem1.valueId}:${attItem2.valueId}`
                  ].quantityBase[0].priceList[0].couponPrice.replace(/,/gi, "")
                )
              }
              

              if (
                attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`].quantityBase[0]
                  .delivery.descriptions
              ) {
                const deliveryDay = attributeVendorItemMap[
                  `${attItem1.valueId}:${attItem2.valueId}`
                ].quantityBase[0].delivery.descriptions
                  .split(">")[1]
                  .split("<")[0]
                image = `https:${
                  attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`].images[0]
                    .detailImage
                }`
                diff = moment(deliveryDay, "M/D").diff(moment().toDate(), "days") + 1
              }

              if (
                attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`].quantityBase[0]
                  .shippingFee.shippingFeeType === "NOT_FREE"
              ) {
                const message =
                  attributeVendorItemMap[`${attItem1.valueId}:${attItem2.valueId}`].quantityBase[0]
                    .shippingFee.message
                shippingFee = Number(
                  message
                    .replace("배송비", "")
                    .replace("원", "")
                    .replace(/,/gi, "")
                    .trim()
                )
              }
            }
            options.push({
              key: `${attItem1.valueId}:${attItem2.valueId}`,
              optionKey1: optionRows[0].name,
              optionTitle1: attItem1.name,
              optionKey2: optionRows[1].name,
              optionTitle2: attItem2.name,
              title: `${attItem1.name} ${attItem2.name}`,
              price,
              priceAmount,
              shippingFee,
              image,
              deliveryDay: diff,
              active
            })
          })
        })
      }
    } else {
      let active = !response.soldOut
      let price = Number(response.quantityBase[0].price.salePrice.replace(/,/gi, ""))
      let priceAmount = Number(response.quantityBase[0].priceList[0].priceAmount.replace(/,/gi, ""))
      let image = mainImages[0]
      let diff = null
      let shippingFee = 0

      const deliveryDay = response.quantityBase[0].delivery.descriptions.split(">")[1].split("<")[0]

      diff = moment(deliveryDay, "M/D").diff(moment().toDate(), "days") + 1

      if (
        response.quantityBase[0].shippingFee &&
        response.quantityBase[0].shippingFee.shippingFeeType === "NOT_FREE"
      ) {
        const message = response.quantityBase[0].shippingFee.message
        shippingFee = Number(
          message
            .replace("배송비", "")
            .replace("원", "")
            .replace(/,/gi, "")
            .trim()
        )
      }

      options.push({
        key: response.itemId,
        title,
        price,
        priceAmount,
        shippingFee,
        image,
        deliveryDay: diff,
        active
      })
    }

    return {
      productId: response.productId,
      vendorItemId: response.vendorItemId,
      vendorName: response.vendor ? response.vendor.name : null,
      vendorID: response.vendor ? response.vendor.id : null,
      title,
      mainImages,
      detail: url,
      ratingCount: Number(ratingCount.replace(/,/gi, "")),
      ratingAveragePercentage,
      otherSellerCount,
      options
    }
  } catch (e) {
    console.log("daaa", e)
    return
  }
  
}

module.exports = start