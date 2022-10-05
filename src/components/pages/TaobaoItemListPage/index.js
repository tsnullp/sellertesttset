import React from "react"
import { TaobaoItemList } from "components"
import { useLocation } from "react-router-dom"
import queryString from "query-string"

const TaobaoItemListPage = () => {
  const location = useLocation()
  const query = queryString.parse(location.search)

  return <TaobaoItemList {...query} imageUrl={unescape(query.imageUrl)} />
}

export default TaobaoItemListPage
