import React from "react"
import styled from "styled-components"
import {LowestProduct} from "components"

const LowPricePage = () => {
  return (
    <Container>
      <LowestProduct />
    </Container>
  )
}

export default LowPricePage

const Container = styled.div`
  padding: 20px;
`