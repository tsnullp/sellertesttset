import React from "react"
import styled from "styled-components"
import { useQuery } from "@apollo/client"
import { TABAE_DELAY } from "../../../gql"
import { Divider, Image, Spin } from 'antd'
import moment from "moment"

const TabaeDelayForm = () => {

  const { loading, data } = useQuery(TABAE_DELAY)

  
  return (
    <>
    <Divider>발송지연 TOP 5</Divider>
    <Container>
      {loading && <Spin />}
      {data && data.TabaeDelay.filter(item => item.type === 1).map(item => <ItemComponent key={item.orderNo} item={item} />)}
    </Container>
    <Divider style={{marginTop: "20px"}}>입고지연 TOP 5</Divider>
    <Container>
      {loading && <Spin />}
      {data && data.TabaeDelay.filter(item => item.type === 2).map(item => <ItemComponent key={item.orderNo} item={item} />)}
    </Container>
    </>

  )
}

export default TabaeDelayForm

const ItemComponent = ({item}) => {
  return (
    <div style={{padding: "20px"}}>
      <Image src={item.thumbnail} width={200} height={200}/>
      <div>{item.orderNo}</div>
      <div>{item.orderNumber}</div>
      <div>{item.name}</div>
      <div>{item.phone}</div>
      <div>{moment(item.orderDate, "YYYYMMDD").format("YYYY-MM-DD")}</div>
      <div>{moment(item.orderTime, "HHmmSS").format("HH:mm:SS")}</div>
    </div>
  )
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

