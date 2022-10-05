import React from "react"
import { Modal } from 'antd';
import { useQuery } from "@apollo/client"
import { SALES_DETAIL } from "../../../gql"
import styled from "styled-components"
import { Tag } from 'antd'

const SalesDetailModal = ({isModalVisible, handleOk, handleCancel, userID, startDate, endDate}) => {
  const { data } = useQuery(SALES_DETAIL, {
    variables: {
      startDate: startDate.length === 7 ? `${startDate}-01` : startDate,
      endDate: endDate.length === 7 ? `${endDate}-31` : endDate,
      userID
    }
  })
  console.log("----, data,", data)
  
  return (
    <Modal 
    width={800} 
    title={startDate} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
      <>
        <TotalPercentContainer>
          {getTotalPercent(data ? data.SalesDetail : [])}
        </TotalPercentContainer>
        <Container>
        {data && data.SalesDetail && data.SalesDetail.map(item => {
          return (
            <ItemConainer key={item.market_order_info}>
              <div>
                {getMarketIcon(item.market_id)}
              </div>
              
              <div>
              {item.items.map((item, i) => {
                return (
                  <ItemNameContainer key={i}>
                    <div>
                      {getOrderState(item.order_status)}
                      {item.product_name}
                      <OptionValue>{`(${item.option_value})`}</OptionValue>
                    </div>
                    {item.quantity === 1 && <div>{item.quantity}</div>}
                    {item.quantity > 1 && <div style={{fontWeight: "700", color: "#FF5500"}}>{item.quantity}</div>}
                  </ItemNameContainer>
                )
              })}
              </div>
              <div>{
                item.items[0].order_status.includes("N") ?
                item.payment_amount.toLocaleString("ko") : "-"
                }</div>
            </ItemConainer>
          )
        })}
      </Container>
      </>
    </Modal>
  )
}

export default SalesDetailModal

const TotalPercentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 3px solid  #DDDDDD;

`
const Container = styled.div`
  max-height: 600px;
  overflow-y: auto;
  color: #A1A1A1;
`

const ItemConainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  padding-bottom: 6px;
  &>:nth-child(1){
    min-width: 20px;
    max-width: 20px;
    margin-top: 7px;
  }
  &>:nth-child(2){
    width: 100%;
    margin-left: 10px;
    margin-right: 30px;
  }
  
  &>:nth-child(3){
    text-align: right;
    min-width: 50px;
    max-width: 50px;
  }

  border-bottom: 1px solid lightgray;
`

const ItemNameContainer = styled.div`
  display: flex;
  &>:nth-child(1){
    width: 100%;
  }
  &>:nth-child(2){
    min-width: 20px;
    max-width: 20px;
    text-align: right;
  }

`

const OptionValue = styled.span`
  font-size: 12px;
  color: #512da8;
`
const getMarketIcon = (market_id) => {
  
  switch (market_id){
    case "shopn": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_shopn.gif" alt="네이버쇼핑" />
      )
    case "gmarket": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_gmarket.gif" alt="G마켓" />
      )
    case "auction": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_auction.gif" alt="옥션" />
      )
    case "coupang": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_coupang.gif" alt="쿠팡" />
      )
    case "timon": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_timon.gif" alt="티몬" />
      )
    case "inpark": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_inpark.gif" alt="인터파크" />
      )
    case "wemake": 
      return (
        <img src="https://img.echosting.cafe24.com/icon/ico_route_wemake.gif" alt="위메프" />
      )
    default:
      return (
        <div>{market_id}</div>
      )
  }
}

const getOrderState = (orderState) => {
  if(orderState.includes("N")){
    return null
  }
  if(orderState.includes("C")){
    return <Tag color="#FF9A00">취소</Tag>
  }
  if(orderState.includes("R")){
    return <Tag color="#FF3377">반품</Tag>
  }
  if(orderState.includes("E")){
    return <Tag color="#9c27b0">교환</Tag>
  }
}

const getTotalPercent = (data) => {
  let totalCount = 0
  let shopnCount = 0
  let gmarketCount = 0
  let auctionCount = 0
  let coupangCount = 0
  let timonCount = 0
  let inpartCount = 0
  let wemakeCount = 0
  for(const item of data) {
    switch (item.market_id){
      case "shopn": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            shopnCount += Number(option.quantity) 
          }
        }
        break
      case "gmarket": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            gmarketCount += Number(option.quantity) 
          }
        }
        break
      case "auction": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            auctionCount += Number(option.quantity) 
          }
        }
        break
      case "coupang": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            coupangCount += Number(option.quantity) 
          }
        }
        break
      case "timon": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            timonCount += Number(option.quantity) 
          }
        }
        break
      case "inpark": 
        for(const option of item.items){
          if(option.order_status.includes("N")){
            inpartCount += Number(option.quantity) 
          }
        }
        break
      case "wemake": 
        for(const optioin of item.items){
          if(optioin.order_status.includes("N")){
            wemakeCount += Number(optioin.quantity) 
          }
        }
        break
      default:
        break
    }
  }

  totalCount = shopnCount + gmarketCount + auctionCount + coupangCount + timonCount + inpartCount + wemakeCount

  let PercentForm = []
  if(shopnCount > 0){   
    PercentForm.push(
      <PercentItemContainer>
        <div>
          <img src="https://img.echosting.cafe24.com/icon/ico_route_shopn.gif" alt="네이버쇼핑" />
        </div>
        <div>{`${shopnCount.toLocaleString("ko")}(${(shopnCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(gmarketCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_gmarket.gif" alt="G마켓" />
        </div>
        <div>{`${gmarketCount.toLocaleString("ko")}(${(gmarketCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(auctionCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_auction.gif" alt="옥션" />
        </div>
        <div>{`${auctionCount.toLocaleString("ko")}(${(auctionCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(coupangCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_coupang.gif" alt="쿠팡" />
        </div>
        <div>{`${coupangCount.toLocaleString("ko")}(${(coupangCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(timonCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_timon.gif" alt="티몬" />
        </div>
        <div>{`${timonCount.toLocaleString("ko")}(${(timonCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(inpartCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_inpark.gif" alt="인터파크" />
        </div>
        <div>{`${inpartCount.toLocaleString("ko")}(${(inpartCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(wemakeCount > 0){
    PercentForm.push(
      <PercentItemContainer>
        <div>
        <img src="https://img.echosting.cafe24.com/icon/ico_route_wemake.gif" alt="위메프" />
        </div>
        <div>{`${wemakeCount.toLocaleString("ko")}(${(wemakeCount / totalCount * 100).toFixed(1)})%`}</div>
      </PercentItemContainer>
    )
  }
  if(totalCount) {
    PercentForm.push(
      <PercentItemContainer>
        <div style={{
          fontSize: "40px",
          fontWeight: "900",
          color: "#FF3377"
        }}>
          {totalCount.toLocaleString("Ko")}
        </div>
      </PercentItemContainer>
    )
  }
  console.log("tatoaCoutn", totalCount)
  return PercentForm
}

const PercentItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100px;
  &:not(:last-child){
    border-right: 1px solid #512da8;
  }
`
