import React from "react"
import { FIND_SHIPPING_FEE } from "gql"
import { useQuery } from "@apollo/client"
import styled from "styled-components"

const FindLowPrice = ({ price = 0, mallName, crUrl }) => {
  const { loading, error, data } = useQuery(FIND_SHIPPING_FEE, {
    variables: {
      mallName,
      crUrl
    }
  })

  if (loading || error) {
    return <LowPrice>{`\\ ${Number(price).toLocaleString("ko")}`}</LowPrice>
  }

  if (data && data.FindShippingFee) {
    return (
      <LowPrice>{`\\ ${(Number(price) + data.FindShippingFee).toLocaleString("ko")}`}</LowPrice>
    )
  }
  return <LowPrice>{`\\ ${Number(price).toLocaleString("ko")}`}</LowPrice>
}
export default FindLowPrice

const LowPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
  text-align: center;
  span {
    font-size: 14px;
    font-weight: 500;
    color: #121212;
  }
`
