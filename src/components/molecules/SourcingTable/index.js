import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import { useQuery } from "@apollo/client"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"


const SourcingTable = ({isModalVisible, handleOk, handleCancel, data}) => {

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
      title: "번호",
      // width: 100,
      render: (data) => data.productNo
    },
    {
      title: "타겟이미지",
    },
    {
      title: "소싱이미지",
    },
    {
      title: "상품명",
      // width: 100,
      render: (data) => data.title
    },
    {
      title: "소싱여부",
      render: () => 1
    },
    {
      title: "무게문의여부",
      render: () => ""
    },
    {
      title: "무게",
      width: 30,
      render: (data) => data.shippingWeight
    },
    {
      title: "무게답변1"
    },
    {
      title: "무게답변원문",
    },
    {
      title: "태그",
      width: 400,
      render: (data) => data.keyword
    },
    {
      title: "속성",
    
    },
    {
      title: "소싱상품주소",
      // width: 100,
      render: (data) => data.detail
    },
    {
      title: "대상이미지주소",
      // width: 100,
      render: (data) => data.image
    },
    {
      title: "소싱주소",
    },
    {
      title: "번역이미지주소"
    },
    
    

  ]
  return (
    <Modal 
    style={{minWidth: "90%", overflowX: "hidden"}}
    title="소싱 리스트 엑셀" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename={`셀러 소싱 리스트_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="소싱"
            buttonText="엑셀 다운"
          />
      <TableContaniner>
        <Table 
        ref={tableRef}
        dataSource={data.filter(item => item.isChecked)}
        columns={columns}
        pagination={false}
        
        />
      </TableContaniner>
    </Modal>
  )
}

export default SourcingTable

const TableContaniner = styled.div`
  overflow: auto;
  height: 650px;
`
