import React, { useState } from "react"
import styled from "styled-components"
import { Input, Spin, Button } from "antd"
import { useQuery } from "@apollo/client"
import { GET_KEYWORD } from "gql"
import { ReloadOutlined } from "@ant-design/icons"
import { regExp_test } from "../../../lib/userFunc"

const { Search } = Input

const KeywordTool1Form = () => {
  const [value, setValue] = useState("")
  const [keywords, setKeywords] = useState([])

  const handleChange = e => {
    setValue(e.target.value)
  }

  const handleTitleSplit = value => {
    const keywordArray = value.split(" ")
    const tempArray = []
    keywordArray.forEach(first => {
      keywordArray.forEach(second => {
        if (first === second) {
          tempArray.push(`${first}`)
        } else {
          tempArray.push(`${first} ${second}`)
        }
      })
    })
    setKeywords(tempArray)
  }
  return (
    <Container>
      <Search
        allowClear={true}
        size="large"
        value={value}
        onChange={handleChange}
        placeholder="분석할 상품명을 입력해 주세요."
        onSearch={value => handleTitleSplit(value)}
        enterButton
      />
      <KeywordList>
        <KeywordItemContainer>
          <div>키워드</div>
          <div>조회수</div>
          <div>상품수</div>
          <div>경쟁강도</div>
          <div>재조회</div>
        </KeywordItemContainer>
        {keywords
          .filter(item => regExp_test(item) && item.trim().length > 0)

          .map((item, i) => (
            <TableItemForm key={i} keyword={item} />
          ))}
      </KeywordList>
    </Container>
  )
}

export default KeywordTool1Form

const Container = styled.div`
  padding: 20px;
`

const KeywordList = styled.div`
  margin-top: 20px;
  margin-left: 50px;
`

const TableItemForm = ({ keyword }) => {
  const { data, refetch, networkStatus } = useQuery(GET_KEYWORD, {
    variables: {
      keyword
    },
    notifyOnNetworkStatusChange: true
  })

  return (
    <KeywordItemContainer>
      <div>{keyword}</div>
      <div>
        {networkStatus === 1 || networkStatus === 2 || networkStatus === 4 ? (
          <Spin />
        ) : Number.isInteger(data.GetKeyword.total) ? (
          data.GetKeyword.total.toLocaleString("ko")
        ) : (
          data.GetKeyword.total
        )}
      </div>
      <div>
        {networkStatus === 1 || networkStatus === 2 || networkStatus === 4 ? (
          <Spin />
        ) : Number.isInteger(data.GetKeyword.item_num) ? (
          data.GetKeyword.item_num.toLocaleString("ko")
        ) : (
          data.GetKeyword.item_num
        )}
      </div>
      <div>
        {networkStatus === 1 || networkStatus === 2 || networkStatus === 4 ? (
          <Spin />
        ) : Number.isInteger(data.GetKeyword.compete) ? (
          data.GetKeyword.compete.toLocaleString("ko")
        ) : (
          data.GetKeyword.compete
        )}
      </div>
      <Button
        icon={<ReloadOutlined />}
        onClick={() => {
          refetch()
        }}
      />
    </KeywordItemContainer>
  )
}

const KeywordItemContainer = styled.div`
  display: flex;
  font-size: 14px;
  align-items: center;
  margin-bottom: 10px;
  & > :nth-child(1) {
    width: 160px;
  }
  & > :nth-child(2) {
    width: 120px;
  }
  & > :nth-child(3) {
    width: 120px;
  }
  & > :nth-child(4) {
    width: 120px;
  }
  & > :nth-child(5) {
    width: 50px;
  }
`
