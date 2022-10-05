import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import { useQuery } from "@apollo/client"
import { GET_MARKETORDER_INFO, GET_TAOBAOORDER_SIMPLE_INFO } from "../../../gql"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import {regExp_test} from "../../../lib/userFunc"
import "./style.css"

const CoolzikuConvertTable = ({isModalVisible, handleOk, handleCancel, data}) => {
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


  const columns = [
    {
      title: "묶음값",
      width: 30,
      render: (data, _, i) => {
        if(data["묶음값"]) {
          return data["묶음값"]
        }
        return i + 1
      }
    },
    {
      title: "배송방법 (AIR/SEA만 가능)",
      width: 80,
      render: () => "SEA"
    },
    {
      title: "성명(한글)",
      render: data => data.구매자이름
    },
    {
      title: "성명(영어)",
    },
    {
      title: "개인통관번호",
      render: data => data["구매자 개인통관부호"]
    },
    {
      title: "빈값(고정)",
    },
    {
      title: "핸드폰",
      render: data => data.연락처
    },
    {
      title: "용도구분",
      render: () => "개인"
    },
    {
      title: "우편번호",
      render: data => <GetAddrInfo orderId={data["오픈마켓 주문번호"].replace(/'/gi, "")} type="2" />
    },
    {
      title: "주소",
      render: data => <GetAddrInfo orderId={data["오픈마켓 주문번호"].replace(/'/gi, "")} type="1" />
    },
    {
      title: "상세주소",
      // render: data => data.연락처
    },
    {
      title: "영문 주소",
    },
    {
      title: "영문 상세주소",
    },
    {
      title: "배송시요청사항",
      render: data => <GetAddrInfo orderId={data["오픈마켓 주문번호"].replace(/'/gi, "")} type="3" />
    },
    {
      title: "쇼핑몰주소",
      render: () => "taobao.com"
    },
    {
      title: "주문번호 (Order No)",
      render: data => data["타오바오 주문번호"].includes("'") ? data["타오바오 주문번호"] : `'${data["타오바오 주문번호"]}`
    },
    {
      title: "상품명",
      render: data => regExp_test(data["상품명(1)"]).replace(/'/gi, "").replace(/\[/gi, "").replace(/\]/gi, "")
    },
    {
      title: "색상",
    },
    {
      title: "사이즈",
    },
    {
      title: "수량",
      render: data => data["아이템수량(1)"]
    },
    {
      title: "단가",
      render: data => data["물품가격(1)"]
    },
    {
      title: "이미지URL",
      render: data => <GetTaobaoOrderSimpleInfo orderId={data["타오바오 주문번호"].replace(/'/gi, "")} type="2" />
    },
    {
      title: "상품URL",
      render: data => <GetTaobaoOrderSimpleInfo orderId={data["타오바오 주문번호"].replace(/'/gi, "")} type="3" />
    },
    {
      title: "구매자 이름",
      render: data => data.구매자이름
    },
    {
      title: "배송사",
    },
    {
      title: "TRACKING#",
      render: data => data["중국 운송장번호"]
    },
    {
      title: "HS CODE (HS CODE 시트 참조)",
      render: data => data["HS CODE"]
    },
    {
      title: "물류센터 요청사항",
    },
    {
      title: "빈값(고정)",
    },
    {
      title: "자동포장신청(Y/N)",
      render: () => "N"
    },
    {
      title: "예치금자동결제(Y/N)",
      render: () => "N"
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
            filename={`꿀직구 주문 신청서_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="신청"
            buttonText="엑셀 다운"
          />
      <TableContaniner>
        <Table 
        ref={tableRef}
        dataSource={data}
        columns={columns}
        pagination={false}
        
        />
      </TableContaniner>
    </Modal>
  )
}

export default CoolzikuConvertTable

const TableContaniner = styled.div`
  overflow: auto;
  height: 650px;
`

const GetAddrInfo = ({orderId, type="1"}) => {
  
  const { loading, data } = useQuery(GET_MARKETORDER_INFO, {
    variables: {
      orderId
    }
  })

  const GetShippingMessage = shipping_message => {
    let message = shipping_message
    if(message.includes("배송메세지 : ")){
      message = message.split("배송메세지 : ")[1]
    }
    if(message.includes(" (주문번호 :")){
      message = message.split(" (주문번호 :")[0]
    }
    return message
  }
  
  if(loading) return <div></div>
  
  if( data && data.GetMarketOrderInfo){

    if(type === "1") {
      return (
        <div>
        {data.GetMarketOrderInfo.addr}
        </div>
      )
    } else if(type === "2"){
      return (
        <div>
        {data.GetMarketOrderInfo.postCode}
        </div>
      )
    } else if(type === "3"){
      return (
        <div>
        {GetShippingMessage(data.GetMarketOrderInfo.parcelPrintMessage)}
        </div>
      )
    }
    
  }

  return <div></div>
}



const GetTaobaoOrderSimpleInfo = ({orderId, type="1"}) => {

  const { loading, data } = useQuery(GET_TAOBAOORDER_SIMPLE_INFO, {
    variables: {
      orderId
    }
  })

  if(loading) return <div></div>
  
  if( data && data.GetTaobaoOrderSimpleInfo){

    if(type === "1") {

      //상품명
      return (
        <div>
        {data.GetTaobaoOrderSimpleInfo.productName}
        </div>
      )
    } else if(type === "2"){
      //썸네일
      return (
        <div>
        {data.GetTaobaoOrderSimpleInfo.thumbnail}
        </div>
      )
    } else if(type === "3"){
      // 상세주소
      return (
        <div>
        {data.GetTaobaoOrderSimpleInfo.detail}
        </div>
      )
    }
    
  }

  return <div></div>
}