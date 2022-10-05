import React, { useState } from "react"
import { Input } from "antd"
import styled from "styled-components"
import { ProductUploadPage } from "components"
import { useLocation } from "react-router-dom"
import queryString from "query-string"

const { Search } = Input
const TaobaoProductUploadPage = () => {
  const [url, setUrl] = useState(null)
  const [title, setTitle] = useState(null)
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const query = queryString.parse(location.search)

  const handleChange = e => {
    setUrl(e.target.value)
  }

  const handleTitleChange = e => {
    setTitle(e.target.value)
  }

  const handelUrl = value => {
    setUrl(null)
    if (value.length > 0) {
      setTimeout(() => {
        setUrl(value)
      }, 500)
    }
  }
  const handleDone = () => {
    setUrl(null)
    if (query && query.newWindow === "true") {
      setTimeout(() => {
        window.close()
      }, 2000)
    }
  }

  const dataLoading = loading => {
    setLoading(loading)
  }
  return (
    <>
      <Container>
        <Input
          allowClear={true}
          size="large"
          value={title}
          onChange={handleTitleChange}
          placeholder="실패시 타오바오 상품명을 입력해주세요"
          style={{marginBottom: "10px"}}
        />
        <Search
          allowClear={true}
          size="large"
          value={url}
          onChange={handleChange}
          placeholder="타오바오 상품 상세페이지 URL을 입력해주세요"
          onSearch={value => handelUrl(value)}
          enterButton
          loading={loading}
        />
      </Container>
      {url && <ProductUploadPage url={url} title={title} handleDone={handleDone} dataLoading={dataLoading} />}
    </>
  )
}

export default TaobaoProductUploadPage

const Container = styled.div`
  margin-top: 30px;
  margin-bottom: 30px;
  padding-left: 50px;
  padding-right: 50px;
`
