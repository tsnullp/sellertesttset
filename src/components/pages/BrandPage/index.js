import React from "react"
import { useQuery } from "@apollo/client"
import { GET_BRAND_LIST } from "../../../gql"
import { BrandForm, BanForm } from "components"
import { Tabs } from "antd"
import { AppleOutlined, StopOutlined, ExclamationCircleFilled } from "@ant-design/icons"
const { TabPane } = Tabs

const BrandPage = () => {
  const { data, refetch } = useQuery(GET_BRAND_LIST)
  console.log("data", data)

  return (
    <Tabs defaultActiveKey="1" style={{ padding: "20px 40px" }}>
      <TabPane
        tab={
          <span>
            <AppleOutlined style={{ fontSize: "20px", color: "gray" }} />
            브랜드
          </span>
        }
        key="1"
      >
        <BrandForm list={data && data.GetBrandList ? data.GetBrandList.brand : []} />
      </TabPane>
      <TabPane
        tab={
          <span>
            <StopOutlined style={{ fontSize: "16px", color: "red" }} />
            금지 단어
          </span>
        }
        key="2"
      >
        <BanForm
          list={data && data.GetBrandList ? data.GetBrandList.banWord : []}
          refetch={refetch}
        />
      </TabPane>
      <TabPane
        tab={
          <span>
            <ExclamationCircleFilled style={{ fontSize: "16px", color: "#ffd700" }} />
            금지 성분
          </span>
        }
        key="3"
      >
        <BrandForm
          list={data && data.GetBrandList ? data.GetBrandList.prohibit : []}
          isProhibit={true}
          refetch={refetch}
        />
      </TabPane>
    </Tabs>
  )
}

export default BrandPage
