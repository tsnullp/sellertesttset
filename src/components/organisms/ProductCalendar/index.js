import React, { useState, useContext}  from "react"
import styled from "styled-components"
import { Calendar, Badge, Button, Select } from "antd"
import { PRODUCT_COUNT_DAILY } from "../../../gql"
import { useQuery } from "@apollo/client"
import { UserContext } from "context/UserContext"
import {UserSelect} from "components"
import {
  TrophyOutlined,
  LikeOutlined,
  SmileOutlined,
  MehOutlined,
  FrownOutlined,
  DislikeOutlined,
  ReloadOutlined,
  FireOutlined,
  CoffeeOutlined
} from "@ant-design/icons"
import moment from "moment"
import "moment/locale/ko"
moment.locale("ko")
const { Option } = Select

const ProductCalendar = () => {
  const { user } = useContext(UserContext)
  const [selectUser, setSelectUser] = useState(null)
  const { data, refetch } = useQuery(PRODUCT_COUNT_DAILY, {
  //  fetchPolicy: "network-only"
    variables: {
      userID: selectUser
    }
  })
  console.log("user", user)
  console.log("data", data)
  const getIcon = total => {
    if (total > 500) {
      return <CoffeeOutlined />
    } else if (total > 300) {
      return <FireOutlined />
    } else if (total > 200) {
      return <TrophyOutlined />
    } else if (total > 100) {
      return <LikeOutlined />
    } else if (total > 33) {
      return <SmileOutlined />
    } else if (total > 10) {
      return <MehOutlined />
    } else {
      return <FrownOutlined />
    }
  }

  const dateCellRender = value => {
    if (!data || !data.ProductCountDaily) {
      return
    }
    const today = moment().format("YYYYMMDD")

    if (today < value.format("YYYYMMDD")) {
      return null
    }
    const year = Number(value.format("YYYY"))
    const month = Number(value.format("M"))
    const day = Number(value.format("D"))

    const itemArray = data.ProductCountDaily.filter(
      item => item.year === year && item.month === month && item.day === day
    )
    
    console.log("itemArray.",itemArray)
    if (itemArray.length > 0) {
      const item = itemArray[0]
      let totalItem = {
        count: 0,
        subTotal: 0
      }
      itemArray.map(item => {
        totalItem.count += item.count
        totalItem.subTotal = item.subTotal
      })

      return (
        <ul>
         
          <li style={{ fontSize: "20px" }}>
          {getIcon(totalItem.count)}
          {itemArray.filter(item => item.user).map((item, index) => {
              return (
                <span style={{
                  fontSize:"12px", fontWeight: "500"
                }}>{` ${item.user.nickname} ${item.count}`}</span>
              )
            })}
          </li>
          <li>
            <Badge
              status={"success"}
              text={
                <span style={{ fontSize: "18px", fontWeight: "700" }}>{`${totalItem.count.toLocaleString(
                  "ko"
                )}`}
                 
                </span>
              }
            />
          </li>
          <li>
            <Badge
              status={"warning"}
              text={
                <span style={{ fontSize: "16px" }}>{`${totalItem.subTotal.toLocaleString("ko")}`}</span>
              }
            />
          </li>
        </ul>
      )
    } else {
      return (
        <ul>
          <li style={{ fontSize: "20px" }}>
            <DislikeOutlined />
          </li>
          <li>
            <Badge status={"error"} text={<span style={{ fontSize: "18px" }}>0</span>} />
          </li>
        </ul>
      )
    }
  }

  const monthCellRender = value => {
    if (!data || !data.ProductCountDaily) {
      return
    }
    const today = moment().format("YYYYMMDD")

    if (today < value.format("YYYYMMDD")) {
      return null
    }

    const year = Number(value.format("YYYY"))
    const month = Number(value.format("M"))

    const itemArray = data.ProductCountDaily.filter(
      item => item.year === year && item.month === month
    )
    let total = 0
    itemArray.forEach(item => (total += item.count))
    return total.toLocaleString("ko")
  }

  const handleSelectChange = (value) => {
    setSelectUser(value)
  }

  return (
    <Container>
      <CalendarContainer>
        <SelectContainer>
        {<UserSelect isRoot={true} handleSelectChange={handleSelectChange} userID={user.id} />}
          <Button 
            onClick={() => refetch()}
          >검색</Button>
        </SelectContainer>
        
        <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
      </CalendarContainer>
    </Container>
  )
}

export default ProductCalendar

const Container = styled.div`
  padding: 20px;
  
`

const CalendarContainer = styled.div`
  position: relative;
`

const SelectContainer = styled.div`
  position: absolute;
  left: 0;
  top: 12px;
`