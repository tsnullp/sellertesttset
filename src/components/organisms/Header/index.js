import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { Logo, LoginStatus } from "components"
const { ipcRenderer } = window

const Header = () => {
  const [message, setMessage] = useState("")

  useEffect(() => {
    ipcRenderer.on("message", (e, text) => {
      console.log("text", text)
      setMessage(text)
    })
  }, [])

  return (
    <HeaderContainer>
      <LogoContainer>
        <Logo />
        <div>
          {`ver.${process.env.REACT_APP_VERSION}  `}
          <span>{message}</span>
        </div>
      </LogoContainer>
      <LoginStatus />
    </HeaderContainer>
  )
}

export default Header

const HeaderContainer = styled.div`
  padding-left: 40px;
  padding-right: 40px;
  height: 80px;
  background: ${props => props.theme.primaryDark};
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LogoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  & > :nth-child(2) {
    margin-left: 10px;
    color: white;
    font-size: 16px;
    span {
      margin-left: 10px;
      font-size: 13px;
    }
  }
`
