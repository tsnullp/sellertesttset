import React, {useEffect, useRef, useState} from 'react'
import { Table, Modal, Spin } from "antd"
import styled from "styled-components"
import { useQuery } from "@apollo/client"
import { GET_NAVER_CATEGORY } from "../../../gql"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import moment from "moment"
import "./style.css"
import _ from "lodash"

const TitleExcelModal = ({isModalVisible, handleOk, handleCancel, data}) => {
  const [categoryNames, setCategoryNames] = useState([])
  const [loading, setLoading] = useState(true)
  useQuery(GET_NAVER_CATEGORY, {
    variables: {
      title: data.map(item => item.korTitle)
    },
    onCompleted: categorys=> {
      
      setLoading(false)
      setCategoryNames(categorys.GetNaverCategory.map(item => {
        return {
          title: item.title,
          categoryName: item.categoryName
        }
      }))
    }
  }) 

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

  console.log("data---", data)
  const columns = [
    {
      title: "셀러아이디",
      key: "셀러아이디",
      render: data => data._id
    },
    {
      title: "네이버아이디",
      key: "네이버아이디",
      render: data => data.naverID
    },
    {
      title: "메인이미지",
      key: "메인이미지",
      ellipsis: true,
      render: data => {
        let mainImage = ``
        data.mainImages.map(item => {
          if(mainImage.length > 0) {
            mainImage += `#${item}`
          } else {
            mainImage += `${item}`
          }
        })
        return mainImage
      }
    },
    {
      title: "중국상품명",
      key: "중국상품명",
      ellipsis: true,
      render: data => data.title
    },
    {
      title: "상품명",
      key: "상품명",
      ellipsis: true,
      render: data => data.korTitle
    },
    {
      title: "카테고리",
      key: "카테고리",
      ellipsis: true,
      render: data => {
        const findObj = _.find(categoryNames, {title: data.korTitle})
        if(findObj){
          return findObj.categoryName
        }
        return <Spin />
      }
    },
    {
      title: "옵션명",
      key: "옵션명",
      ellipsis: true,
      render: data => {
        let optionName = ``
        data.options.map(item => {
          if(optionName.length > 0) {
            optionName += `#${item.korValue.replace(/ /gi, "")}`
          } else {
            optionName += `${item.korValue.replace(/ /gi, "")}`
          }
        })
        return optionName
      }
    },
    {
      title: "상세페이지",
      key: "상세페이지",    
      ellipsis: true, 
      render: data => {
        let contentUrl = ``
        data.content.map(item => {
          if(contentUrl.length > 0) {
            contentUrl += `#${item}`
          } else {
            contentUrl += `${item}`
          }
        })
        return contentUrl
      }
    },
    {
      title: "속성",
      key: "속성",    
      ellipsis: true, 
      render: data => {
        let attr = ``
        if(data.attribute && Array.isArray(data.attribute)){
          data.attribute.map(item => {
            if(attr.length > 0) {
              attr += `#${item.korValue.replace(/ /gi, "")}`
            } else {
              attr += `${item.korValue.replace(/ /gi, "")}`
            }
          })
        }
        
        return attr
      }
    },
    {
      title: "수정상품명",
      key: "수정상품명",    
      ellipsis: true,  
    },
    {
      title: "쇼핑렌즈",
      key: "쇼핑렌즈",    
      ellipsis: true,  
    },
  ]

  return (
    <Modal 
    style={{minWidth: "90%", overflowX: "hidden"}}
    title="상세페이지 엑셀" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      {!loading && <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename={`상품명 로우데이터_${moment().format("YYYY-MM-DD HH:mm:SS")}`}
            sheet="상품명"
            buttonText="엑셀 다운"
          />}
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

export default TitleExcelModal

const TableContaniner = styled.div`
  overflow: auto;
  height: 650px;
`