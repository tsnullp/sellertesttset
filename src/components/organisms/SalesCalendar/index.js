import React, {useState, useRef, forwardRef, useImperativeHandle, useContext} from "react"
import styled from "styled-components"
import { Calendar, Button, Select } from "antd"
import { useQuery } from "@apollo/client"
import { SALES_CLENDAR, SALES_MONTH_CLENDAR } from "../../../gql"
import { UserContext } from "context/UserContext"
import {SalesDetailModal, UserSelect} from "components"
import moment from "moment"
import "moment/locale/ko"
moment.locale("ko")
const { Option } = Select

const SalesCalendar = () => {
  const { user } = useContext(UserContext)
  const [dateMode, setDateMode] = useState("day")
  const dateRef = useRef()
  const monthRef = useRef()
  const [selectUser, setSelectUser] = useState(null)

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setStartDate(null)
    setEndDate(null)
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setStartDate(null)
    setEndDate(null)
    setIsModalVisible(false);
  };

  const dateCellRender = value => {
    // console.log("value--", value)
    setDateMode("day")
    const today = moment().format("YYYYMMDD")

    if (today < value.format("YYYYMMDD")) {
      return null
    }

    const date = value.format("YYYYMMDD")

    
    return (
      <DateRender date={date} userID={selectUser} ref={dateRef}/>
    )
  }
  const monthCellRender = value => {
    setDateMode("month")
    const today = moment().format("YYYYMMDD")

    if (today < value.format("YYYYMMDD")) {
      return null
    }

    const date = value.format("YYYYMM")

    
    return (
      <MonthRender date={date} userID={selectUser} ref={monthRef}/>
    )
  }

  const handleSelectChange = (value) => {
    setSelectUser(value)
  }

  const onSelect = (value) => {
    let date
    if(dateMode === "day"){
      date = moment(value).format("YYYY-MM-DD")
    } else {
      date = moment(value).format("YYYY-MM")
    }
    
    console.log("date", date)
    setStartDate(date)
    setEndDate(date)
    showModal()
  }
  return (
    <Container>
      
      <CalendarContainer>
        <SelectContainer>
        {<UserSelect isRoot={true} handleSelectChange={handleSelectChange} userID={user.id} />}
        {startDate && <SalesDetailModal isModalVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel}
                startDate={startDate}
                endDate={endDate}
                userID={selectUser}
              /> }
        <Button 
          onClick={() => {
            if(dateMode === "day"){
              dateRef.current.dateSearch()
            } else if(dateMode === "month"){
              monthRef.current.monthSearch()
            }
          }}
        >검색</Button>
        </SelectContainer>
        <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} 
        onSelect={onSelect}
        />
      </CalendarContainer>
    </Container>
  )
}

export default SalesCalendar


const Container = styled.div`
  padding: 20px;
`

const CalendarContainer = styled.div`
  position: relative;
`
const SelectContainer = styled.div`
  position: absolute;
  left: 0;
  top: 0;
`
const DateRender = forwardRef(({date, userID}, ref) => {
  const { data, refetch } = useQuery(SALES_CLENDAR, {
      variables: {
        date,
        userID
      }
    })

  useImperativeHandle(ref, () => ({
    dateSearch() {
      console.log("adfalkhklh")
      refetch()
    },
  }))


  if(!data){
    return null
  }
  

  const {orderPriceAmount,orderPriceCount,
     discountPriceAmount, discountPriceCount,
      shippingFee, shippingCount,
      cancelPriceAmount, cancelPriceCount,
      returnPriceAmount, returnPriceCount} = data.SalesClendar
 
  return (
    <DateContainer>
      <div>
        <div style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#512da8"
        }}>{`매출 (${(orderPriceCount + shippingFee).toLocaleString("ko")})`}</div>
        <div>{`할인 (${discountPriceCount.toLocaleString("ko")})`}</div>
        {/* <div>배송</div> */}
        <div>{`취소 (${cancelPriceCount.toLocaleString("ko")})`}</div>
        <div>{`반품 (${returnPriceCount.toLocaleString("ko")})`}</div>
      </div>
      <div style={{
          textAlign: "right"
        }}>
        <div style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#512da8"
        }}>{`${(orderPriceAmount).toLocaleString("ko")}`}</div>
        <div>{`${discountPriceAmount.toLocaleString("ko")}`}</div>
        {/* <div>{`${shippingFee.toLocaleString("ko")}(${shippingCount})`}</div> */}
        <div>{`${cancelPriceAmount.toLocaleString("ko")}`}</div>
        <div>{`${returnPriceAmount.toLocaleString("ko")}`}</div>
      </div>
    </DateContainer>
  )
})

const DateContainer = styled.div`
  font-size: 12px;
  color: #A1A1A1;
  display: flex;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;
`

const MonthRender = forwardRef(({date, userID}, ref) => {
  
  const { data, refetch } = useQuery(SALES_MONTH_CLENDAR, {
      variables: {
        date,
        userID
      }
    })

  useImperativeHandle(ref, () => ({
    monthSearch() {
      refetch()
    },
  }))

  if(!data){
    return null
  }
   
  const {orderPriceAmount,orderPriceCount,
     discountPriceAmount, discountPriceCount,
      shippingFee, shippingCount,
      cancelPriceAmount, cancelPriceCount,
      returnPriceAmount, returnPriceCount} = data.SalesMonthClendar
  return (
    <DateContainer>
      <div>
        <div style={{
          fontSize: "14px",
          fontWeight: "700",
          color: "#512da8"
        }}>{`매출 (${orderPriceCount.toLocaleString("ko")})`}</div>
        {/* <div>{`할인 (${discountPriceCount.toLocaleString("ko")})`}</div> */}
        {/* <div>배송</div> */}
        <div>{`취소 (${cancelPriceCount.toLocaleString("ko")})`}</div>
        <div>{`반품 (${returnPriceCount.toLocaleString("ko")})`}</div>
      </div>
      <div style={{
          textAlign: "right"
        }}>
        <div style={{
          fontSize: "14px",
          fontWeight: "700"
        }}>{`${(orderPriceAmount - discountPriceAmount).toLocaleString("ko")}`}</div>
        {/* <div>{`${discountPriceAmount.toLocaleString("ko")}`}</div> */}
        {/* <div>{`${shippingFee.toLocaleString("ko")}(${shippingCount})`}</div> */}
        <div>{`${cancelPriceAmount.toLocaleString("ko")}`}</div>
        <div>{`${returnPriceAmount.toLocaleString("ko")}`}</div>
      </div>
    </DateContainer>
  )
})
