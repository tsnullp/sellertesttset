import React, { useState } from "react"

import { Collapse, Form, Input, Button } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import styled from "styled-components"
import { useMutation } from "@apollo/client"
import { TAOBAO_LOGIN } from "gql"

const { Panel } = Collapse

const TaobaoLoginForm = () => {
  const [loading, setLoading] = useState(false)
  const [isTaobaoLoginded, setTaobaoLoginged] = useState(
    localStorage.getItem("taobao_logined") || false
  )
  const [taobaoLogin] = useMutation(TAOBAO_LOGIN)

  const initialValues = {
    loginID: "",
    password: ""
  }

  const genExtra = () => {
    if (isTaobaoLoginded) {
      return <SuccessCircle />
    } else {
      return <DisableCircle />
    }
  }

  const layout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 8
    }
  }

  const onFinish = async values => {
    setLoading(true)
    const response = await taobaoLogin({
      variables: {
        loginID: values.loginID,
        password: values.password
      }
    })

    setLoading(false)
    if (response.data.taobaoLogin) {
      localStorage.setItem("taobao_logined", true)
      setTaobaoLoginged(true)
    } else {
      localStorage.setItem("taobao_logined", false)
      setTaobaoLoginged(false)
    }
  }

  const onFinishFailed = errorInfo => {
    console.log("Failed:", errorInfo)
  }

  return (
    <>
      <Collapse defaultActiveKey={["1"]} expandIconPosition="left">
        <Panel header="타오바오 로그인 정보" key="1" extra={genExtra()}>
          <Form
            {...layout}
            name="taobaologin"
            initialValues={initialValues}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="아이디"
              name="loginID"
              rules={[{ required: true, message: "아이디를 입력해 주세요!" }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} />
            </Form.Item>
            <Form.Item
              label="비밀번호"
              name="password"
              rules={[{ required: true, message: "비밀번호를 입력해 주세요!" }]}
            >
              <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                span: 32,
                offset: 8
              }}
            >
              <Button
                loading={loading}
                type="primary"
                htmlType="submit"
                className="login-form-button"
              >
                로그인
              </Button>
            </Form.Item>
          </Form>
        </Panel>
      </Collapse>
    </>
  )
}

export default TaobaoLoginForm

const SuccessCircle = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.theme.primaryLight};
  border-radius: 50%;
  box-shadow: 0 0 10px #ff3377;
`

const DisableCircle = styled.div`
  width: 14px;
  height: 14px;
  background: #a1a1a1;
  border-radius: 50%;
`
