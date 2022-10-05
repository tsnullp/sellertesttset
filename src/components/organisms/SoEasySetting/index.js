import React from "react"
import styled from "styled-components"
import { useQuery, useMutation } from "@apollo/client"
import { GET_SOEASY_PASSWORD, SET_SOEASY_PASSWORD } from "../../../gql"
import {Collapse, Input, Button, notification} from "antd"
import { useFormik } from "formik"


const { Panel } = Collapse

const SoEasySetting = () => {

  const { data } = useQuery(GET_SOEASY_PASSWORD)

  
  return (
    <Container>
      {data  && <PasswordForm email={data.GetSoEasyPasssword.email} password={data.GetSoEasyPasssword.password} />}
    </Container>
  )
}

export default SoEasySetting

const PasswordForm = ({email, password}) => {
  const [setPassword] = useMutation(SET_SOEASY_PASSWORD)

  const formik = useFormik({
    initialValues: {
      password
    },
    validate: values => {
      const errors ={}
      if(!values.password || values.password.length === 0){
        errors.password = "비밀번호를 입력해주세요"
      }
      return errors
    },
    onSubmit: async values => {
      console.log("values", values)
      const response = await setPassword({
        variables: {
          password: values.password
        }
      })
      console.log("response", response)
      if(response.data.SetSoEasyPassword){
        notification["success"]({
          message: "저장 하였습니다."
        })
      } else {
        notification["error"]({
          message: "저장에 실패하였습니다."
        })
      }
    }
  })

  return (
    <Collapse defaultActiveKey={"1"} expandIconPosition="left" style={{ marginBottom: "30px" }}>
        <Panel header="계정 설정" key="1">
         <ItemContainer>
            <div>아이디</div>
            <Input 
              disabled
              name="email"
              value={email}
            />
          </ItemContainer>
          <ItemContainer>
            <div>비밀번호</div>
            <div>
              
            <Input 
              name="password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
            />
            {formik.touched.password && formik.errors.password && (
                <ErrorMessage>{formik.errors.password}</ErrorMessage>
              )}
            </div>
          </ItemContainer>
          <ButtonContainer>
            <Button type="primary" onClick={formik.handleSubmit}>
                등록
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
  )
}
const Container = styled.div`
  padding: 20px;
`

const ItemContainer = styled.div`
  margin-left: 50px;
  margin-right: 50px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  &>:nth-child(1){
    min-width: 100px;
    max-width: 100px;
  }
  &>:nth-child(2){
    width: 100%;
  }
`

const ErrorMessage = styled.div`
  color: #ff545c;
  font-size: 13px;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-right: 50px;
  margin-top: 20px;
`