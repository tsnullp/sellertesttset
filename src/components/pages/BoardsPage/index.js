import React from "react"
import { useQuery } from "@apollo/client"
import { CAFE24_BOARDS } from "../../../gql"


const BoardsPage = () => {
  const { data, refetch } = useQuery(CAFE24_BOARDS)
  console.log("data", data)

  return (
    <div>adsfasdf</div>
  )
}

export default BoardsPage
