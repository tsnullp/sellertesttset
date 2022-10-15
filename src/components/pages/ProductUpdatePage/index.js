import React from "react"
import { ProductUploadForm } from "components"
import { useParams, useLocation } from "react-router-dom"
import queryString from "query-string"
import { PRODUCT_DETAIL } from "gql"
import { useQuery } from "@apollo/client"
import styled from "styled-components"
import { Spin } from "antd"

const ProductUpdatePage = () => {
  const { ID } = useParams()
  const location = useLocation()
  const query = queryString.parse(location.search)
  const { loading, data } = useQuery(PRODUCT_DETAIL, {
    variables: {
      productID: ID
    },
    
  })
  
  let update = true
  if (query && query.update && query.update === "false") {
    update = false
  }

  if (loading || !data || !data.ProductDetail) {
    return (
      <LoadingContainer>
        <Spin />
      </LoadingContainer>
    )
  }
  console.log("data", data)
  return <ProductUploadForm item={data.ProductDetail} update={update} newWindow={true} />
}

export default ProductUpdatePage

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`
