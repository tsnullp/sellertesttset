import React, { useEffect } from "react"
import { ProductUploadForm } from "components"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import { SEARCH_TAOBAO_DETAIL } from "gql"
import { useQuery } from "@apollo/client"
import styled from "styled-components"
import { Spin, message } from "antd"

const ProductUploadPage = ({ url, title, handleDone, dataLoading }) => {
  const location = useLocation()
  const query = queryString.parse(location.search)
  
  if (typeof dataLoading === "function") {
    dataLoading(true)
  }
  let detailUrl = url ? url : query.detailUrl

  let categoryName = ""
  if (localStorage.getItem("대분류")) {
    categoryName += localStorage.getItem("대분류")
  }
  if (localStorage.getItem("중분류")) {
    categoryName += "-" + localStorage.getItem("중분류")
  }
  if (localStorage.getItem("소분류")) {
    categoryName += "-" + localStorage.getItem("소분류")
  }
  if (localStorage.getItem("세분류")) {
    categoryName += "-" + localStorage.getItem("세분류")
  }

  const { loading, error, data, refetch } = useQuery(SEARCH_TAOBAO_DETAIL, {
    variables: {
      detailUrl: unescape(detailUrl),
      title,
      naverID: query.naverID ? query.naverID : null,
      naverCategoryCode: query.naverCategoryCode ? Number(query.naverCategoryCode) : null,
      naverCategoryName: categoryName
    },
    context: { timeout: 50000 },
    notifyOnNetworkStatusChange: true
  })
  
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  if (error) {
    if (typeof dataLoading === "function") {
      dataLoading(false)
    }
    return (
      <>
        {message.error("데이터를 불러오지 못했습니다. 타오바오 상품 중문명을 입력후 다시 시도해 주세요.")}
        <div>{error.message}</div>
      </>
    )
  }

  if (loading || !data || !data.searchTaobaoDetail) {
    return (
      <LoadingContainer>
        <Spin />
      </LoadingContainer>
    )
  }

  if (typeof dataLoading === "function") {
    dataLoading(false)
  }
  console.log("data--", data)
  return (
    <ProductUploadForm
      item={{ productName: query.productName, naverID: query.naverID, ...data.searchTaobaoDetail }}
      productUrl={unescape(query.productUrl)}
      handleDone={handleDone}
      newWindow={handleDone ? false : true}
    />
  )
}

export default ProductUploadPage

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
