import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { Input, Button, BackTop } from "antd"
import { useMutation } from "@apollo/client"
import { GET_PROHIBIT } from "../../../gql"
import { async } from "q"

const BrandForm = ({ list, isProhibit = false }) => {
  const [search, setSearch] = useState("")
  const [data, setData] = useState(list)
  const [isLoading, setLoading] = useState(false)
  useEffect(() => {
    setData(list)
  }, [list])

  return (
    <Container>
      <InputContainer>
        <Input
          size="large"
          allowClear={true}
          addonBefore="검색어"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputContainer>
      <ItemContainer>
        {data
          .filter((item) => {
            if (search.length > 0) {
              if (item.word.includes(search)) {
                return true
              } else {
                return false
              }
            } else {
              return true
            }
          })
          .map((item) => (
            <Item key={item._id}>{item.word}</Item>
          ))}
        <BackTop />
      </ItemContainer>
    </Container>
  )
}

export default BrandForm

const Container = styled.div``

const InputContainer = styled.div`
  margin-bottom: 20px;
  display: flex;
  & > :nth-child(1) {
    width: 260px;
  }
  & > :nth-child(2) {
    margin-left: 10px;
  }
`

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const Item = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1.4;
  height: 60px;
  width: 100px;
  padding: 10px;
  border: 1px solid gray;
  margin-left: -1px;
  margin-top: -1px;
  &:hover {
    background: rgb(230, 255, 251);

    font-weight: 700;
    font-size: 16px;
  }
`
