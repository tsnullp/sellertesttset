import React from "react"
import { Table, BackTop } from "antd"
import { useQuery } from "@apollo/client"
import { CATEGORY_SALES } from "../../../gql"
import styled from "styled-components"
const { shell } = window.require("electron")

const CategorySalesForm = () => {
  const { data , networkStatus, refetch} = useQuery(CATEGORY_SALES,{
    variables: {
      sort: "1"
    },
    notifyOnNetworkStatusChange: true
  })

  const columns = [
    {
      title: "카테고리",
      width: "460px",
      render: data => {
        let category = ``
        if(data.category1){
          category += `${data.category1}`
        }
        if(data.category2){
          category += ` > ${data.category2}`
        }
        if(data.category3){
          category += ` > ${data.category3}`
        }
        if(data.category4){
          category += ` > ${data.category4}`
        }
        return <CategoryLabel
          onClick={() => shell.openExternal(`https://search.shopping.naver.com/search/category?catId=${data._id}&frm=NVSHOVS&origQuery&pagingIndex=1&pagingSize=40&productSet=overseas&query&sort=rel&timestamp=&viewType=list`)}
        >{category.length>0? category : data._id}</CategoryLabel>
      }
    },
    {
      title: "판매 상품 수",
      align: "right",
      width: "160px",
      dataIndex: "count",
      key: "count",
      render: count => <div>{count.toLocaleString("ko")}</div>,
      sorter: {
        compare: (a, b) => a.count - b.count
      }
    },
    {
      title: "6개월 판매 건수",
      align: "right",
      width: "160px",
      dataIndex: "purchaseCnt",
      key: "purchaseCnt",
      render: purchaseCnt => <div>{purchaseCnt.toLocaleString("ko")}</div>,
      sorter: {
        compare: (a, b) => a.purchaseCnt - b.purchaseCnt
      }
    },
    {
      title: "최근 3일 판매 건수",
      align: "right",
      width: "160px",
      dataIndex: "recentSaleCount",
      key: "recentSaleCount",
      render: recentSaleCount => <div>{recentSaleCount.toLocaleString("ko")}</div>,
      sorter: {
        compare: (a, b) => a.recentSaleCount - b.recentSaleCount
      }
    },
    {
      title: ""
      
    }
  ]

  const handleTableChange = (pagination, filters, sorter) => {
    
    let sort = null
    if (sorter) {
      switch (sorter.columnKey) {
        case "count":
          switch (sorter.order) {
            case "ascend":
              sort = "1"
              break
            case "descend":
              sort = "2"
              break
            default:
              break
          }
          break
        case "purchaseCnt":
          switch (sorter.order) {
            case "ascend":
              sort = "3"
              break
            case "descend":
              sort = "4"
              break
            default:
              break
          }
          break
        case "recentSaleCount":
          switch (sorter.order) {
            case "ascend":
              sort = "5"
              break
            case "descend":
              sort = "6"
              break
            default:
              break
          }
          break
      }
    }
    console.log("sort--?", sort)
    refetch({variables: {sort}})
  }
  return (
    <>
    <BackTop />
    <Table
      style={{ cursor: "pointer" }}
      rowKey={(data) => data._id}
      columns={columns}
      dataSource={data && data.GetCategorySales ? data.GetCategorySales : []}
      loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      pagination={false}
      //onChange={handleTableChange}
    />
    </>
  )
}

export default CategorySalesForm

const CategoryLabel = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`