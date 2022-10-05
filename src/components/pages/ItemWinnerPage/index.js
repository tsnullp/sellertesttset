import React from "react"
import { ItemWinnerForm } from "components"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { Spin } from "antd"
import { LoadingOutlined } from "@ant-design/icons"
import { useQuery } from "@apollo/client"
import { GET_COUPANG_ITEM_LIST } from "../../../gql"
import { useLocation } from "react-router-dom"
import queryString from "query-string"

const ItemWinnerPage = () => {
  const { data, refetch, networkStatus } = useQuery(GET_COUPANG_ITEM_LIST, {
    variables: {
      url: null
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      console.log("onCompleted")
    }
  })

  const location = useLocation()
  const query = queryString.parse(location.search)

  const newWindow = query && query.newWindow === "true" ? true : false

  const urlSearch = url => {
    console.log("url==", url)
    refetch({
      url
    })
  }
  const nextButtonClick = () => {
    refetch({
      url: null
    })
  }

  return (
    <>
      <Container newWindow={newWindow}>
        {(networkStatus === 1 || networkStatus === 2 || networkStatus === 4) && (
          <SpinContainer>
            <Spin
              style={{ color: "white", fontWeight: "700", fontSize: "16px" }}
              size="large"
              tip="새로운 상품을 찾고 있습니다..."
              indicator={
                <LoadingOutlined
                  style={{ fontSize: 48, marginBottom: "20px", color: "white" }}
                  spin
                />
              }
            />
          </SpinContainer>
        )}
        {data &&
          data.GetCoupangItemList.map(item => (
            <ItemWinnerForm
              key={item._id}
              item={item}
              nextButtonClick={nextButtonClick}
              urlSearch={urlSearch}
            />
          ))}
      </Container>
    </>
  )
}

export default ItemWinnerPage

const Container = styled.div`
  position: relative;
  height: 100%;
  ${ifProp(
    "newWindow",
    css`
      height: calc(100vh - 60px);
    `
  )};
`
const SpinContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
`
