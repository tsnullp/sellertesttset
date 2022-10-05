import React from "react"
import { BasicForm } from "components"
import styled from "styled-components"
import { BASIC_IFNO } from "gql"
import { useQuery } from "@apollo/client"
import { Spin } from "antd"

const BasicSettingPage = () => {
  const { loading, error, data, refetch } = useQuery(BASIC_IFNO)

  if (error) {
    return <div>{error.message}</div>
  }

  if (loading || !data || !data.BasicInfo) {
    return (
      <SpinContainer>
        <Spin />
      </SpinContainer>
    )
  }

  return (
    <Container>
      <BasicForm basicItem={data.BasicInfo} refetch={refetch} />
    </Container>
  )
}

export default BasicSettingPage

const Container = styled.div`
  padding: 100px;
`

const SpinContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
