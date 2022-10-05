import React, { useEffect } from "react"
import { ProductUploadForm } from "components"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import { CREATE_PRODUCT_DETAIL } from "gql"
import { useQuery } from "@apollo/client"
import styled from "styled-components"
import { Spin } from "antd"

const SavedProductUploadPage = ({ _id, naverCategoryCode, naverCategoryName }) => {
  const location = useLocation()
  const query = queryString.parse(location.search)

  const { loading, error, data, refetch } = useQuery(CREATE_PRODUCT_DETAIL, {
    variables: {
      _id: query._id,
      naverID: query.naverID ? query.naverID : null,
      naverCategoryCode: query.naverCategoryCode ? Number(query.naverCategoryCode) : null,
      naverCategoryName: query.naverCategoryName
    },
    context: { timeout: 50000 },
    notifyOnNetworkStatusChange: true
  })

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  if (error) {
    return <div>{error.message}</div>
  }
  console.log("dtaat", data)
  if (loading || !data || !data.CreateProductDetail) {
    return (
      <LoadingContainer>
        <Spin />
      </LoadingContainer>
    )
  }

  return (
    <ProductUploadForm
      item={{ productName: query.productName, naverID: query.naverID, ...data.CreateProductDetail }}
      productUrl={unescape(query.productUrl)}
      newWindow={true}
    />
  )
}

export default SavedProductUploadPage

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
