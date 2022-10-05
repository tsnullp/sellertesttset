import React from "react"
import { SourcingKeyword, NaverMainKeywordForm, MyFavoriteKeyword } from "components"
import styled from "styled-components"
import { Tabs } from "antd"
import { StarFilled } from "@ant-design/icons"

const { TabPane } = Tabs

const NaverMainKeywordPage = () => {
  return (
    <Container>
      <Tabs defaultActiveKey="1">
        <TabPane tab="키워드 소싱" key="1">
          <SourcingKeyword />
        </TabPane>
        <TabPane
          tab={
            <span>
              <StarFilled
                style={{
                  color: "#fdd835",
                  fontSize: "20px",
                }}
              />
              내 키워드
            </span>
          }
          key="2"
        >
          <MyFavoriteKeyword />
        </TabPane>
        <TabPane tab="데이터 랩" key="3">
          <NaverMainKeywordForm />
        </TabPane>
      </Tabs>
    
    </Container>
  )
}

export default NaverMainKeywordPage

const Container = styled.div`
  padding: 10px 40px;
`
