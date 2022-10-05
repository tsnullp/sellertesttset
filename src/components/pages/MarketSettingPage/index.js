import React from "react"
import { MARKET_BASIC_IFNO } from "gql"
import { useQuery } from "@apollo/client"
import { Spin } from "antd"
import styled from "styled-components"
import { MarketSettingForm } from "components"

const MarketSettingPage = () => {
  const { loading, error, data, refetch } = useQuery(MARKET_BASIC_IFNO)

  if (error) {
    return <div>{error.message}</div>
  }

  if (loading || !data || !data.MarketBasicInfo) {
    return (
      <SpinContainer>
        <Spin />
      </SpinContainer>
    )
  }
  console.log("data", data)
  return (
    <>
      <MarketSettingForm item={data.MarketBasicInfo} refetch={refetch} />
    </>
  )
}

export default MarketSettingPage

const SpinContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
