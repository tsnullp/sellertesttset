import React, { useContext } from "react"
import styled from "styled-components"
import { NavMenu } from "components"
import NavRouter from "router/navRouter"
import { Result } from "antd"

import { UserContext } from "context/UserContext"
const HomePage = () => {
  const { user } = useContext(UserContext)

  if (user) {

    if (user.adminUser) {
      return (
        <Container>
          <NavMenu />
          <ContentPage>
            <NavRouter />
          </ContentPage>
          
        </Container>
      )
    } else {
      return <Result title="관리자의 승인을 대기중입니다." />
    }
  } else {
    return <Result status="warning" title="로그인 후 이용가능합니다." />
  }
}

export default HomePage

const Container = styled.div`
  display: flex;
`

const ContentPage = styled.div`
  width: 100%;

  border-left: ${props => `4px solid ${props.theme.primaryDark}`};
`
