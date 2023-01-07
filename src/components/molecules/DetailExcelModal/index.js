import React, {useEffect, useRef} from 'react'
import { Table, Modal } from "antd"
import styled from "styled-components"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"

const DetailExcelModal = ({isModalVisible, handleOk, handleCancel, data}) => {

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
      title: "아이디",
      key: "아이디",
      render: data => data._id
    },
    {
      title: "상세페이지 원본",
      key: "상세페이지원본",
      render: data => data.content
    },
    {
      title: "상세페이지 번역",
      key: "상세페이지 번역",
    },
  ]

  return (
    <Modal 
    style={{minWidth: "90%", overflowX: "hidden"}}
    title="상세페이지 엑셀" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename={`상세페이지 로우데이터_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="신청"
            buttonText="엑셀 다운"
          />
      <TableContaniner>
        <Table 
        ref={tableRef}
        dataSource={data}
        columns={columns}
        pagination={false}
        rowKey={record => record._id}
        />
      </TableContaniner>
    </Modal>
  )
}

export default DetailExcelModal

const TableContaniner = styled.div`
  overflow: auto;
  height: 650px;
`

