import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import { useQuery } from "@apollo/client"
import { TRANSLATE_PAPAGO, ENG_TRANSLATE, KORTOENG_TRANSLATE, NEW_ZIP_CODE } from "../../../gql"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"


const NewTabaeOrderTable = ({isModalVisible, handleOk, handleCancel, data}) => {

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
      title: "묶음번호",
      width: 60,
      
      render: (data) => data.row
    },
    {
      title: "자동결제 여부",
      width: 60,
      // ellipsis: true,
      render: () => "2"
    },
    {
      title: "바로포장 여부",
    },
    {
      title: "수취인(한글)",
      width: 120,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data) => data.valid_number.name
    },
    {
      title: "수취인(영어)",
      width: 120,
      textWrap: 'word-break',
      render: (data) => <KortoEngTitle text={data.valid_number.name} />
    },
    {
      title: "휴대폰 번호",
      width: 150,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data) => data.valid_number.phone
    },
    {
      title: "우편번호",
      width: 120,
      textWrap: 'word-break',
      ellipsis: true,
      render: (data) => {

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
    },
    {
      title: "수취인 주소",
      width: 250,
      render: (data) => data.receiver.address_full
    },
    {
      title: "수취인 주소(영문)",
      width: 230,
    },
    {
      title: "통관구분",
      width: 60,
      render: () => "1"
    },
    {
      title: "개인통관번호",
      width: 150,
      render: (data) => data.valid_number.persEcm
    },
    {
      title: "센터 요청사항",
      width: 130,
    },
    {
      title: "국내택배 요청사항",
      width: 160,
      render: (data) => {
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
    },
    {
      title: "통관품목 번호",
      width: 60,
      render:  (data) => data.singleItem && data.singleItem.category ? data.singleItem.category : ""
    },
    {
      title: "쇼핑몰 URL",
      width: 120,
      render: () => "taobao.com"
    },
    {
      title: "쇼핑몰 오더번호",
      width: 220,
 
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.orderNumber && `'${data.singleItem.taobaoOrder.orderNumber}`
    },
    {
      title: "상품명",
      width: 250,
      render:  (data) => {
        
        if(data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order){
          if(Array.isArray(data.singleItem.taobaoOrder.order)) {
            return (<KorTitle text={data.singleItem.taobaoOrder.order.productName} />)  
          }
          return (<KorTitle text={data.singleItem.taobaoOrder.order.productName} />)
          
        } else {
          return ""
        }
      }
    },
    {
      title: "브랜드",
    },
    {
      title: "색상",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order && data.singleItem.taobaoOrder.order.option  &&
      data.singleItem.taobaoOrder.order.option[0]
      ? data.singleItem.taobaoOrder.order.option[0].value : ""
    },
    {
      title: "사이즈",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order && data.singleItem.taobaoOrder.order.option && data.singleItem.taobaoOrder.order.option[1] ? data.singleItem.taobaoOrder.order.option[1].value : ""
    },
    {
      title: "수량",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.quantity : ""
    },
    {
      title: "단가",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.realPrice : ""
    },
    {
      title: "이미지URL",
      width: 60,
      ellipsis: true,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.thumbnail : ""
    },
    {
      title: "상품URL",
      width: 60,
      ellipsis: true,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.detail : ""
    },
    {
      title: "트래킹번호(중국 운송장번호)",
    },
    {
      title: "재고번호",
    },
    {
      title: "부가서비스",
      width: 60,
      ellipsis: true,
      render: () => "2"
    },
    {
      title: "화물 선착불 선불=1, 착불=0",
      width: 60,
      ellipsis: true,
      render: () => "0"
    },
    {
      title: "HS CODE",
      width: 60,
      ellipsis: true,
    },
    {
      title: "오픈마켓 이름",
      width: 60,
      ellipsis: true,
      render: (data) => data.market_id
    },
    {
      title: "오픈마켓 결제수단",
      width: 60,
      ellipsis: true,
    },
    {
      title: "오픈마켓 주문번호",
      width: 60,
      ellipsis: true,
      render: (data) => `'${data.market_order_info}`
    },
    {
      title: "오픈마켓 판매금액",
      width: 60,
      ellipsis: true,
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
            filename={`(뉴)타배 주문 신청서_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="신청"
            buttonText="엑셀 다운"
          />
      <TableContaniner>
        <Table 
        ref={tableRef}
        dataSource={rowData}
        columns={columns}
        pagination={false}
        
        />
      </TableContaniner>
    </Modal>
  )
}

export default NewTabaeOrderTable

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