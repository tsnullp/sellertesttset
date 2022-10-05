import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import { useQuery } from "@apollo/client"
import { ENG_TRANSLATE, KORTOENG_TRANSLATE, NEW_ZIP_CODE } from "../../../gql"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"


const TabaeOrderTable = ({isModalVisible, handleOk, handleCancel, data}) => {

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
      title: "묶음값",
      width: 30,
      render: (data) => data.row
    },
    {
      title: "배송지",
      width: 80,
      render: () => "WEI-해운"
      
    },
    {
      title: "성명(한글)",
      width: 60,
      render: (data) => data.valid_number.name
    },
    {
      title: "성명(영어)",
      width: 60,
      render: (data) => <KortoEngTitle text={data.valid_number.name} />
    },
    {
      title: "개인통관번호",
      width: 100,
      render: (data) => data.valid_number.persEcm
    },
    {
      title: "빈값(고정)",
      width: 30,
    },
    {
      title: "핸드폰",
      width: 100,
      render: (data) => data.valid_number.phone
    },
    {
      title: "용도구분",
      width: 40,
      render: () => "개인"
    },
    {
      title: "우편번호",
      width: 60,
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
      title: "주소",
      width: 250,
      render: (data) => data.receiver.address_full
    },
    {
      title: "영문 주소",
      width: 30,
    },
    {
      title: "배송시요청사항",
      width: 60,
      render: (data) => {
        let message = data.receiver.shipping_message
        if(message.includes("배송메세지 : ")){
          message = message.split("배송메세지 : ")[1]
        }
        if(message.includes(" (주문번호 :")){
          message = message.split(" (주문번호 :")[0]
        }
        return message
      }
    },
    {
      title: "주문번호(Order No)",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.orderNumber && `'${data.singleItem.taobaoOrder.orderNumber}`
    },
    {
      title: "상품명(영문)",
      width: 250,
      render:  (data) => {
        
        if(data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order){
          if(Array.isArray(data.singleItem.taobaoOrder.order)) {
            return (<EngTitle text={data.singleItem.taobaoOrder.order.productName} />)  
          }
          return (<EngTitle text={data.singleItem.taobaoOrder.order.productName} />)
          
        } else {
          return ""
        }
      }
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
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.thumbnail : ""
    },
    {
      title: "상품URL",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.taobaoOrder && data.singleItem.taobaoOrder.order ? data.singleItem.taobaoOrder.order.detail : ""
    },
    {
      title: "TRACKING#",
      width: 30
    },
    {
      title: "빈값",
      width: 30,
    },
    {
      title: "품목번호",
      width: 60,
      render: (data) => data.singleItem && data.singleItem.category ? data.singleItem.category : ""
    },
    {
      title: "빈값",
      width: 30,
    },
    {
      title: "예치금자동결제",
      width: 60,
      render: () => "N"
    },
    {
      title: "부가서비스",
      width: 30,
    },
    {
      title: "오픈마켓명",
      width: 60,
      render: (data) => data.market_id
    },
    {
      title: "판매금액",
      width: 30,
    },
    {
      title: "중국결제수단",
      width: 30,
    },
    {
      title: "오픈마켓주문번호",
      width: 60,
      render: (data) => `'${data.market_order_info}`
    },
    {
      title: "HS_CODE",
      width: 30,
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
            filename={`타배 주문 신청서_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
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

export default TabaeOrderTable

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

const EngTitle = ({text}) => {
  const { loading, data } = useQuery(ENG_TRANSLATE, {
    variables: {
      text
    }
  })

  
  if(loading){
    return (
      <div>{text}</div>
    )
  }
  
  if( data && data.EngTranslate){
    return (
      <div>
      {data.EngTranslate}
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