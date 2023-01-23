import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import { useQuery } from "@apollo/client"
import { TRANSLATE_PAPAGO, ENG_TRANSLATE, KORTOENG_TRANSLATE, NEW_ZIP_CODE } from "../../../gql"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"


const FirstOrderTable = ({isModalVisible, handleOk, handleCancel, data}) => {

  console.log("data--***->", data)
  const tableRef = useRef()

  useEffect(() => {
                                          
    const table = document.querySelector("div.ant-modal-wrap > div > div.ant-modal-content > div.ant-modal-body > div > div > div > div > div > div > div > table")
    
    if(table){
      table.setAttribute("id", "table-to-xls")
    }
    
    if (tableRef.current) {
      const table = tableRef.current.querySelector("table")
      if(table){
        table.setAttribute("id", "table-to-xls")
      }
    }
  }, [isModalVisible])
  

  const rowData = []
  
  let i = 1
  for(const item of data){
    let j = 0
    for(const oItem of item.items){
      if(oItem.taobaoOrder && oItem.taobaoOrder.orders){
        
        if(oItem.taobaoOrder.orders[0]){
          oItem.taobaoOrder.order = oItem.taobaoOrder.orders[0]
        } else {
          // oItem.taobaoOrder.order = oItem.taobaoOrder.orders[0]
        }
        
      }
      rowData.push({
        ...item,
        row: i, 
        singleItem: oItem
        
      })
      j++
    }
    i++
  }

  console.log("rowData", rowData)
  

  const columns = [
    {
      title: "설명",
      width: 60,
    },
    {
      title: "발송타입",
      width: 30,
      render: () => "1"
    },
    {
      title: "제품명",
      width: 250,
      render:  (data, _, index) => {
        if(index > 5) {
          if(data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order){
            if(Array.isArray(data.singleItem.taobaoOrder.order)) {
              return (<KorTitle text={data.singleItem.taobaoOrder.order.productName} />)  
            }
            return (<KorTitle text={data.singleItem.taobaoOrder.order.productName} />)
            
          } else {
            return ""
          }
        }
        return ""
      }
    },
    {
      title: "제품브랜드",
      width: 60,
      render: () => "NOBRAND"
    },
    {
      title: "구매url",
      width: 60,
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.detail : ""
        }
        return ""
      }
    },
    {
      title: "이미지url",
      width: 60,
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.thumbnail : ""
        }
        return ""
      }
    },
    {
      title: "제품단가(위안)",
      width: 60,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.realPrice : ""
        }
        return ""
      }
    },
    {
      title: "신고수량",
      width: 60,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.quantity : ""
        }
        return ""
      }
    },
    {
      title: "색상",
      width: 60,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order && data.singleItem.taobaoOrder.order.option  &&
          data.singleItem.taobaoOrder.order.option[0]
          ? data.singleItem.taobaoOrder.order.option[0].value : ""
        }
        return ""
      }
    },
    {
      title: "사이즈",
      width: 60,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order && data.singleItem.taobaoOrder.order.option && data.singleItem.taobaoOrder.order.option[1] ? data.singleItem.taobaoOrder.order.option[1].value : ""
        }
        return ""
      }
    },
    {
      title: "중국택배운송장번호",
    },
    {
      title: "중국 사이트 주문 번호",
      width: 220,
      render: (data, _, index) => {
        if(index > 5) {
          return data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.orderNumber && `'${data.singleItem.taobaoOrder.orderNumber}`
        }
        return ""
      }
    },
    {
      title: "중국 구매사이트",
      width: 120,
      render: () => "taobao"
    },
    {
      title: "구매 결제수단",
      width: 120,
      render: () => "신용카드"
    },
    {
      title: "받는사람이름",
      width: 120,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return data.valid_number.name
        }
        return ""
      }
    },
    {
      title: "받는사람영문이름",
      width: 120,
    },
    {
      title: "받는사람우편번호",
      width: 120,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data, _, index) => {

        if(index > 5) {
          if(data.receiver.zipcode.length === 5){
            return (
              <div>
                {data.receiver.zipcode}
              </div>
            )
          } else {
            return (
              <NewZipCode address={data.receiver.address_full} zipcode={data.receiver.zipcode}/>
            )
          }
        }
        return ""
        
      }
    },
    {
      title: "받는사람주소",
      width: 250,
      render: (data, _, index) => {
        if(index > 5) {
          return data.receiver.address1
        }
        return ""
      }
    },
    {
      title: "상세주소",
      width: 250,
      render: (data, _, index) => {
        if(index > 5) {
          return data.receiver.address2
        }
        return ""
      }
    },
    {
      title: "통관종류",
      width: 30,
      render: () => "1"
    },
    {
      title: "개인통관번호",
      width: 150,
      render: (data, _, index) => {
        if(index > 5) {
          return data.valid_number.persEcm
        }
        return ""
      }
    },
    {
      title: "사업자통관부호",
      width: 30,
    },
    {
      title: "사업자등록번호",
      width: 30,
    },
    {
      title: "외국인등록번호",
      width: 30,
    },
    {
      title: "여권번호",
      width: 30,
    },
    {
      title: "받는사람전화",
      width: 150,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return data.valid_number.phone
        }
        return ""
      }
    },
    {
      title: "운송장 메모",
      width: 160,
      render: (data, _, index) => {
        if(index > 5) {
          let message = data.receiver.shipping_message
          if(message.includes("배송메세지 : ")){
            message = message.split("배송메세지 : ")[1]
          }
          if(message.includes(" (주문번호 :")){
            message = message.split(" (주문번호 :")[0]
          }
          if(message.includes("직접작성")){
            message = message.split("직접작성")[1]
          }
          return message
        } 
        return ""
      }
    },
    {
      title: "검수타입",
      width: 30,
      render: () => "1"
    },
    {
      title: "검수확인 메모",
      width: 30,
      render: () => "꼼꼼한 검수 부탁드립니다."
    },
    {
      title: "통관옵션",
      width: 30,
      render: () => "1"
    },
    {
      title: "배송타입",
      width: 30,
    },
    {
      title: "관부가세 납부자",
      width: 30,
    },
    {
      title: "포장서비스",
      width: 30,
    },
    {
      title: "포장서비스2",
      width: 30,
    },
    {
      title: "국내 판매사이트",
      width: 60,
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return data.market_id
        }
        return ""
      }
    },
    {
      title: "국내 사이트 주문 번호",
      width: 60,
      ellipsis: true,
      render: (data, _, index) => {
        if(index > 5) {
          return `'${data.market_order_info}`
        }
        return ""
      }
    },
    {
      title: "국내 판매단가",
    },
    {
      title: "국내 판매수량",
    },
  ]

  return (
    <Modal 
    style={{minWidth: "90%", overflowX: "hidden"}}
    title="배대지 주문등록 엑셀" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename={`퍼스트배대지 주문 신청서_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="신청"
            buttonText="엑셀 다운"
          />
      <TableContaniner>
        <Table 
        ref={tableRef}
        dataSource={[{},{},{},{},{},{},...rowData]}
        columns={columns}
        pagination={false}
        
        />
      </TableContaniner>
    </Modal>
  )
}

export default FirstOrderTable

const TableContaniner = styled.div`
  overflow: auto;
  height: 650px;
`
const KortoEngTitle = ({text}) => {
  const { loading, data } = useQuery(KORTOENG_TRANSLATE, {
    variables: {
      text
    }
  })

  
  if(loading){
    return (
      <div>{text}</div>
    )
  }
  
  if( data && data.KorToEngTranslate){
    return (
      <div>
      {data.KorToEngTranslate}
      </div>
    )
  }
  return (
    <div>{text}</div>
  )
}

const KorTitle = ({text}) => {
  const { loading, data } = useQuery(TRANSLATE_PAPAGO, {
    variables: {
      text
    }
  })

  
  if(loading){
    return (
      <div>{text}</div>
    )
  }
  
  if( data && data.TranslatePapago){
    return (
      <div>
      {data.TranslatePapago}
      </div>
    )
  }
  return (
    <div>{text}</div>
  )
}


const NewZipCode = ({address, zipcode}) => {
  const { loading, data } = useQuery(NEW_ZIP_CODE, {
    variables: {
      keyword: address
    }
  })

  if(loading){
    return zipcode
  }
  console.log("address", address)
  console.log("dat88888888a", data)
  if( data && data.NewZipCode){
    return (
      <div>
      {data.NewZipCode.length === 5 ? data.NewZipCode : zipcode}
      </div>
    )
  }
  return zipcode
}