import React, { useContext, useEffect } from "react"
import { UserContext } from "context/UserContext"
import styled from "styled-components"
import { useMutation } from "@apollo/client"
import { AUTH_GOOGLE, ISLOGIN, ONCE_TAOBAO_LOGIN, AUTO_PRICE_MANAGE } from "gql"
import { Menu, Dropdown } from "antd"

const { ipcRenderer, isDev} = window

const LoginStatus = () => {
  const { user, action } = useContext(UserContext)
  const [authGoogle] = useMutation(AUTH_GOOGLE)
  const [isLoginCheck] = useMutation(ISLOGIN)
  const [taobaoLogin] = useMutation(ONCE_TAOBAO_LOGIN)
  const [autoPrice] = useMutation(AUTO_PRICE_MANAGE)

  useEffect(() => {
    const userConfirm = async token => {
      const response = await authGoogle({
        variables: {
          input: {
            accessToken: token
          }
        }
      })
    
      action.login(response.data.authGoogle)
      try {
        window.location.reload()
      } catch (e){
        console.log("window.location", e)
        try {
          document.location.reload()
        } catch (e) {
          console.log("document.location", e)
        }
      }
      

    }

    if (ipcRenderer) {
      ipcRenderer.on("googlelogin-reply", (event, arg) => {
        userConfirm(arg.access_token)
      })
    }

    // const onceLogin = async () => {
    //   await taobaoLogin()
    // }
    // const onceExcute = async () => {
    //   await autoPrice()
    // }

    // onceExcute()
    if (!isDev) {
      // onceLogin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const IsLogin = async () => {
    const response = await isLoginCheck()

    // action.login(response.data.isLogin)
  }

  if (!user) {
    const token = localStorage.getItem("token")

    if (token) {
      IsLogin()
    }
  }

  const menu = (
    <Menu>
      <Menu.Item
      onClick={() => {
        console.log("11")
        action.logout()
        try {
          console.log("22")
          window.location.reload()
          console.log("33")
        } catch (e){
          console.log("window.location", e)
          try {
            console.log("44")
            document.location.reload()
          } catch (e) {
            console.log("document.location", e)
          }
        }
      }}
      >
        <div >로그아웃</div>
      </Menu.Item>
    </Menu>
  )

  return (
    <>
      {!user && (
        <LoginButton
          onClick={() => {
            ipcRenderer.send("googlelogin")
          }}
        >
          시작하기
        </LoginButton>
      )}
      {user && (
        <div>
          <Dropdown overlay={menu}>
            <AvatarContainer>
              <Avatar src={user.avatar} />
              <NickName>{user.nickname}</NickName>
            </AvatarContainer>
          </Dropdown>
        </div>
      )}
    </>
  )
}

export default LoginStatus

const LoginButton = styled.div`
  cursor: pointer;
  font-size: 14px;
  color: white;
`

const AvatarContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  color: lightgray;
`

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  margin-right: 5px;
  background: white;
`

const NickName = styled.div`
  color: lightgray;
  font-size: 11px;
  margin-bottom: 2px;
`
