import React from "react"
import { ProductList, ItemWinnerProcessingList, DetailPageList } from "components"
import { Tabs } from "antd"
import { CheckCircleOutlined, ClockCircleOutlined, FileImageOutlined } from "@ant-design/icons"
const { TabPane } = Tabs

const ProductPage = () => {
  return (
    <Tabs defaultActiveKey="1" style={{ padding: "20px 40px" }}>
      <TabPane
        tab={
          <span>
            <CheckCircleOutlined style={{ fontSize: "16px", color: "gray" }} />
            상품 관리
          </span>
        }
        key="1"
      >
        <ProductList />
      </TabPane>
      <TabPane
        tab={
          <span>
            <ClockCircleOutlined style={{ fontSize: "16px", color: "red" }} />
            등록중인 상품
          </span>
        }
        key="2"
      >
        <ItemWinnerProcessingList />
      </TabPane>
      <TabPane
        tab={
          <span>
            <FileImageOutlined style={{ fontSize: "16px", color: "orange" }} />
            상세페이지
          </span>
        }
        key="3"
      >
        <DetailPageList />
      </TabPane>
    </Tabs>
  )
}

export default ProductPage
