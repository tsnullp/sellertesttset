import React from "react"
import { UserProvider } from "./context/UserContext"
import client from "./client/apolloClient"
import { ApolloProvider } from "@apollo/client"
import RootRouter from "./router/rootRouter"
import { ConfigProvider } from "antd"
import koKR from "antd/es/locale/ko_KR"

import "./App.less"
import "antd/dist/antd.css"
import "./styles/antd.css"
import { ThemeProvider, createGlobalStyle } from "styled-components"
import theme from "styles/theme"
import reset from "styles/reset"
// const { ipcRenderer } = require("electron")

const GlobalStyle = createGlobalStyle`
  ${reset}
`

function App() {
  //  const pp = electron.puppeteerLunch
  return (
    <ConfigProvider locale={koKR}>
      <UserProvider>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <RootRouter />
          </ThemeProvider>
        </ApolloProvider>
      </UserProvider>
    </ConfigProvider>
  )
}

export default App
