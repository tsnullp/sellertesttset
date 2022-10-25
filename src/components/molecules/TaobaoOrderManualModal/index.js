import React, { useState } from 'react'
import { Modal, Input, notification } from 'antd'
import { useMutation } from "@apollo/client"
import { TAOBAO_ORDER_MANUAL } from "../../../gql"
import moment from "moment"
const { TextArea } = Input


const TaobaoOrderManualModal = ({userID, isModalVisible, handleOk, handleCancel}) => {
  const [value, setValue] = useState("")
  const [orderManual] = useMutation(TAOBAO_ORDER_MANUAL)
  const decodeUnicode = (unicodeString) => { 
    var r = /\\u([\d\w]{4})/gi; unicodeString = unicodeString.replace(r, function (match, grp) { return String.fromCharCode(parseInt(grp, 16)); } ); return unescape(unicodeString); 
  }

  const handleOkClick = async () => {
    
    if(value.length === 0) return
    try {
      const temp1 = value.split("var data = JSON.parse('")[1]
      const temp2 = temp1.split("');")[0].trim().replace(/\\/gi, "")
      
      const parser = JSON.parse(temp2)
    
      const {mainOrders} = parser
      const values = mainOrders.map(item => {
        const korTime = moment(item.orderInfo.createTime, "YYYY-MM-DD HH:mm:SS").add(1, "hour")
        // console.log("aaa11", item.statusInfo.text.replace(/u/gi, "\\u"))
        // const status =  decodeURIComponent(item.statusInfo.text)
        // console.log("status", status)
        // console.log("aaa22", decodeURIComponent(item.statusInfo.text.replace(/u/gi, "\\u")))
        // console.log("aaa22", String.fromCharCode(parseInt(item.statusInfo.text.replace(/u/gi, "\\u"))) )
       
        return {
          orderNumber: item.id,
          orderDate: korTime.format("YYYYMMDD"),
          orderTime: korTime.format("HHmmSS"),
          purchaseAmount: item.payInfo.actualFee,
          shippingFee: item.payInfo.postFees[0] ? item.payInfo.postFees[0].value.replace("uFFE5", "").trim() : "",
          quantity: item.subOrders[0].quantity,
          shippingStatus: decodeUnicode(item.statusInfo.text.replace(/u/gi, "\\u")),
          orders: item.subOrders.map(item => {
           
            return {
              id: item.itemInfo.id ? item.itemInfo.id : null,
              productName: decodeUnicode(item.itemInfo.title.replace(/u/gi, "\\u")),
              thumbnail: item.itemInfo.pic
                ? `https:${item.itemInfo.pic.split("_80x80.jpg")[0]}`
                : null,
              detail: item.itemInfo.itemUrl ? `https:${item.itemInfo.itemUrl}` : null,
              skuId: item.itemInfo.skuId,
              option: item.itemInfo.skuText ? item.itemInfo.skuText.map(skuItem => {
                return {
                  name: skuItem.name ? decodeUnicode(skuItem.name.replace(/u/gi, "\\u")) : "",
                  value: skuItem.value ? decodeUnicode(skuItem.value.replace(/u/gi, "\\u")) : "",
                  visible: skuItem.visible
                }
              }) : [],
              originalPrice: item.priceInfo.original ? item.priceInfo.original : null,
              realPrice: item.priceInfo.realTotal,
              quantity: item.quantity ? item.quantity : null
            }
          })
        }
      })
      console.log("values", values)
      const response = await orderManual({
        variables: {
          input: values,
          userID
        }
      })
      console.log("RESPONSE", response)
      if(response.data.TaobaoOrderManual){
        notification['success']({
          message: '타오바오 주문서 수집을 완료하였습니다.',
        });

        handleOk()
      } else {
        notification['error']({
          message: '타오바오 주문서 수집을 실패하였습니다.',
        });
      }
    } catch (e) {
      console.log("E",e)
      notification['error']({
        message: '타오바오 주문서 수집 에러.',
        description:
          <>
           <div>타오바오 주문서 소스가 맞는지 확인 바랍니다.</div>
           <div>{e.message}</div>
          </>
      });
    }
  }
  return (
    <Modal
      // width={800}

      title="타오바오 주문서 수동 수집"
      visible={isModalVisible} onOk={handleOkClick} onCancel={handleCancel}
    >
      <TextArea 
        rows={4} 
        allowClear
        placeHolder="타오바오 주문서 소스 입력"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
        }}
      />
    </Modal>
  )
}

export default TaobaoOrderManualModal


