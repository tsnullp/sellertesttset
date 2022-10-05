import React from "react"
import { NaverHealthFoodForm} from "components"
import styled from "styled-components"

const HealthFoodPage = () => {
  return (
    <Container>
      <NaverHealthFoodForm />
    </Container>
  )
}

export default HealthFoodPage

const Container = styled.div`
  padding: 10px 40px;
`