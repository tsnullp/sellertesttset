import React, { useState, useRef, useEffect, useContext } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import moment from "moment"
import { VATLIST, GET_DELIVERY_IMAGE, VAT_SEARCH, TAOBAO_ORDER_BATCH, SYNC_DELIVERY_ORDER } from "../../../gql"
import { useMutation } from "@apollo/client"
import { Table, Popover, Radio, Button, Input, DatePicker, message } from "antd"
import { FileImageOutlined, ClockCircleOutlined } from "@ant-design/icons"
import { UserContext } from "context/UserContext"
import {UserSelect, VatDataModal} from "components"
import "moment/locale/ko"
import ReactHTMLTableToExcel from "react-html-table-to-excel"
import "./style.css"

const { RangePicker } = DatePicker
const { Search } = Input
moment.locale("ko")
const { shell } = window.require("electron")

const dateFormat = "YYYY-MM-DD"

const ExplainingDataForm = () => {
  const { user } = useContext(UserContext)
  const [radio, setRadio] = useState("vatDetail")
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [vatList, SetVatList] = useState([])
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const tableRef = useRef()
  const [getList] = useMutation(VATLIST)
  const [vatSearch] = useMutation(VAT_SEARCH)
  const [taobaoOrder] = useMutation(TAOBAO_ORDER_BATCH)
  const [syncDeliveryOrder] = useMutation(SYNC_DELIVERY_ORDER)
  const [selectUser, setSelectUser] = useState(null)
  const [isModalVisible, setModalVisible] = useState(false)
  const [selectedOrderID, setSelectdOrderID] = useState(null)
  // useEffect(() => {
  //   if (data && data.VatListType) {
  //     data.VatListType.forEach(item => {
  //       const temp = []
  //       _.uniqBy(item.deliveryItem, "taobaoItem.orderNumber").forEach(dItem => {
  //         temp.push(dItem.taobaoItem.orderNumber)
  //       })
  //       deleveryArray.push(...temp)
  //     })
  //     setDeleveryOrderNumber(deleveryArray)
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data])

  const handleRadioChange = e => {
    if (vatList.length > 0) {
      setLoading(true)
      const dataSource = vatList
      SetVatList([])

      setTimeout(() => {
        SetVatList(dataSource)
        setLoading(false)
      }, 1000)
    }

    setRadio(e.target.value)
  }

  useEffect(() => {
    const table = document.querySelector(".ant-table-body > table")
    if(table){
      table.setAttribute("id", "table-to-xls")
    }
    
    if (tableRef.current) {
      const table = tableRef.current.querySelector("table")
      if(table){
        table.setAttribute("id", "table-to-xls")
      }
    }
  }, [vatList])

  const shippingStatus = shippingStatus => {
    switch (shippingStatus) {
      case "交易关闭":
        return "거래중단"
      case "买家已付款":
        return "결제완료"
      case "卖家已发货":
        return "발송처리"
      case "物流运输中":
        return "배송중"
      case "快件已签收":
        return "수령완료"
      case "交易成功":
        return "거래완료"
      case "快件已揽收":
        return "화물수거"
      default:
        return shippingStatus
    }
  }

  const isChina = (detail) => {
    let isCny = true 
    if(detail && (detail.includes("aliexpress.com") || detail.includes("iherb.com") || detail.includes("amazon"))){
      isCny = false
    }
    return isCny
  }
  const costAccounting = ({detail, purchaseAmount, cnyPrice, usdPrice}) => {
    
    const isCny = isChina(detail)
    
    // 1. '타오바바' 결제수수료 3% 추가
    let purchaseAmountTemp = purchaseAmount.replace(/,/gi, "")
    if(!isNaN(Number(purchaseAmount.replace(/,/gi, "")))){
      purchaseAmountTemp = Number(purchaseAmountTemp)
    } else {
      purchaseAmountTemp =  parseFloat(purchaseAmountTemp)
    }

    let cost = purchaseAmountTemp * 1.03
    
    // 2. '카드사별 브랜드 수수료' 1% 추가 ( ex . 마스터카드 )

    // 4. 최종금액에 '카드사 해외이용 수수료 0.25% ' 추가
    cost = cost * 1.05

    let usdExchange = 0
    if(isCny) {
      usdExchange = Number(cnyPrice.replace(/,/gi, "")) / Number(usdPrice.replace(/,/gi, ""))
    } else {
      usdExchange = Number(usdPrice.replace(/,/gi, "")) / Number(usdPrice.replace(/,/gi, ""))
    } 

    const usdExchangePrice = usdExchange * cost * 1.01
    
    // 3. '전신환매도율' 적용 하여  기준환율  x1% ( 대략 ) 적용
    let exRate = Number(usdPrice.replace(/,/gi, "")) * 1.01
    
    const korPrice = usdExchangePrice * exRate

    return korPrice
  }

  const estimatedSettlementAmount = (market, orderPrice) => {
    let fees = 0
    switch (market) {
      case "쿠팡":
        fees = 0.11
        break
      case "인터파크":
        fees = 0.13
        break
      case "옥션":
        fees = 0.13
        break
      case "G마켓":
        fees = 0.13
        break
      case "스마트스토어":
        fees = 0.048
        break
      default:
        break
    }
    return orderPrice - orderPrice * fees - orderPrice * fees * 0.1
  }

  let columns = []

  const vatColumns = [
    {
      title: (
        <div>
          <CellCenter>고객</CellCenter>
          <CellCenter>구매일자</CellCenter>
        </div>
      ),
      // fixed: "left",
      align: "center",
      width: "100px",
      render(data) {
        return {
          children: (
            <div>
              <CellCenter>{moment(data.paidAtDate, "YYYYMMDD").format("YYYY-MM-DD")}</CellCenter>
              <CellCenter>{moment(data.paidAtTime, "HHmmSS").format("HH:mm:SS")}</CellCenter>
            </div>
          )
        }
      }
    },
    {
      title: "마켓명",
      dataIndex: "market",
      align: "center",
      width: "80px",
      render: market => <div>{market}</div>
    },
    {
      title: "주문번호",
      dataIndex: "orderId",
      align: "center",
      width: "100px",
      render: orderId => <div style={{ fontSize: "10px" }}>{`'${orderId}`}</div>
    },
    {
      title: "수취인",
      dataIndex: "deliveryItem",
      align: "center",
      width: "100px",
      render: deliveryItem =>
        deliveryItem.map((item, i) => <CellCenter key={i}>{item.recipientName}</CellCenter>)
    },
    {
      title: "구입처",
      align: "center",
      width: "100px",
      render: data => <CellCenter>타오바오</CellCenter>
    },
    {
      title: "품목",
      dataIndex: "orderItems",
      align: "center",
      width: "260px",
      ellipsis: true,
      render: orderItems => {
        return orderItems.map((item, i) => (
          <CellLeft key={i} style={{ height: "40px" }}>
            {item.title}
          </CellLeft>
        ))
      }
    },
    {
      title: "오더넘버",
      dataIndex: "deliveryItem",
      width: "120px",
      align: "center",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ fontSize: "10px", height: "40px" }}>
            {`'${item.taobaoItem.orderNumber}`}
          </CellCenter>
        ))
    },
    {
      title: (
        <div>
          <CellCenter>고객</CellCenter>
          <CellCenter>결제금액</CellCenter>
        </div>
      ),
      dataIndex: "orderItems",
      align: "center",
      width: "80px",
      render: orderItems => {
        return orderItems.map((item, i) => (
          <CellRight key={i} style={{ height: "40px" }}>
            {(item.salesPrice * item.quantity ).toLocaleString("ko")}
          </CellRight>
        ))
      }
    },
    {
      title: "배송비",
      align: "center",
      width: "80px",
      dataIndex: "shippingPrice",
      render: shippingPrice => <CellRight>{shippingPrice.toLocaleString("ko")}</CellRight>
    },
    {
      title: (
        <div>
          <CellCenter>구매</CellCenter>
          <CellCenter>대행일자</CellCenter>
        </div>
      ),
      align: "center",
      width: "100px",
      render: data => {
        let taobaoOrderNumber = null
        return data.deliveryItem.map((item, i) => {
          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          return (
            <div key={i}>
            <CellCenter>
              {moment(item.taobaoItem.orderDate, "YYYYMMDD").format("YYYY-MM-DD")}
            </CellCenter>
            <CellCenter>
              {moment(item.taobaoItem.orderTime, "HHmmSS").format("HH:mm:SS")}
            </CellCenter>
          </div>
          )
        })
      }
        
    },
    {
      title: "사용카드",
      align: "center",
      width: "100px",
      render: data => <CellCenter></CellCenter>
    },
    {
      title: (
        <div>
          <CellCenter>구매금액</CellCenter>
          <CellCenter>(원화환산)</CellCenter>
        </div>
      ),
      dataIndex: "deliveryItem",
      width: "100px",
      align: "center",
      render: deliveryItem => {
        let taobaoOrderNumber = null

        return deliveryItem.map((item, i) => {

          let detail = "taobao"
          try {
            detail = item.taobaoItem.orders[0].detail
          } catch (e){

          }

          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          const korPrice = costAccounting({
            detail,
            purchaseAmount: item.taobaoItem.purchaseAmount,
            cnyPrice: item.exchange.cnyPrice,
            usdPrice: item.exchange.usdPrice
          }
            
            
          )
          return (
            <CellRight key={i} style={{ height: "40px" }}>{`${Math.floor(korPrice).toLocaleString(
              "ko"
            )}`}</CellRight>
          )
        })
      }

      
    },
    // {
    //   title: "국내배송비",
    //   align: "center",
    //   width: "100px",
    //   dataIndex: "deliveryItem",
    //   render: deliveryItem =>
    //     deliveryItem.map((item, i) => (
    //       <CellRight key={i} style={{ height: "40px" }}>
    //         {item.shipFee.toLocaleString("ko")}
    //       </CellRight>
    //     ))GetNaverRecommendItemList
    {
      title: (
        <div>
          <CellCenter>구매금액</CellCenter>
          <CellCenter>수수료</CellCenter>
        </div>
      ),
      align: "center",
      width: "100px",

      render: data => {
        let custPrice = 0
        let shipFee = 0
        let korPrice = 0

        let taobaoOrderNumber = null

        data.orderItems.forEach(item => {
          custPrice += item.salesPrice * item.quantity
        })
        custPrice = (custPrice) + data.shippingPrice
        data.deliveryItem.forEach(item => {
          // shipFee += item.shipFee
        })

        data.deliveryItem.forEach(item => {
          let detail = "taobao"
          try {
            detail = item.taobaoItem.orders[0].detail
          } catch (e){

          }
          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          korPrice += costAccounting({
            detail,
            purchaseAmount: item.taobaoItem.purchaseAmount,
            cnyPrice: item.exchange.cnyPrice,
            usdPrice: item.exchange.usdPrice
          })
        })
        return (
          <CellRight style={{ height: "40px" }}>
            {Math.ceil(custPrice - korPrice - shipFee).toLocaleString("ko")}
          </CellRight>
        )
      }
    },
    {
      title: "운송사",
      align: "center",
      width: "100px",
      dataIndex: "deliveryItem",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ height: "40px" }}>
            {item.deliveryCompanyName}
          </CellCenter>
        ))
    },
    {
      title: "송장번호",
      align: "center",
      width: "140px",
      dataIndex: "deliveryItem",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ height: "40px" }}>
            {item.shippingNumber}
          </CellCenter>
        ))
    }
  ]

  const vatPlusColumns = [
    {
      title: (
        <div>
          <CellCenter>고객</CellCenter>
          <CellCenter>구매일자</CellCenter>
        </div>
      ),
      // fixed: "left",
      align: "center",
      width: "100px",
      render(data) {
        return {
          children: (
            <div>
              <CellCenter>{moment(data.paidAtDate, "YYYYMMDD").format("YYYY-MM-DD")}</CellCenter>
              <CellCenter>{moment(data.paidAtTime, "HHmmSS").format("HH:mm:SS")}</CellCenter>
            </div>
          )
        }
      }
    },
    {
      title: "마켓명",
      dataIndex: "market",
      align: "center",
      width: "80px",
      render: market => <div>{market}</div>
    },
    {
      title: "주문번호",
      dataIndex: "orderId",
      align: "center",
      width: "100px",
      render: orderId => <div style={{ fontSize: "10px" }}>{`'${orderId}`}</div>
    },
    {
      title: "수취인",
      dataIndex: "deliveryItem",
      align: "center",
      width: "100px",
      render: deliveryItem =>
        deliveryItem.map((item, i) => <CellCenter key={i}>{item.recipientName}</CellCenter>)
    },
    {
      title: "구입처",
      align: "center",
      width: "100px",
      render: data => <CellCenter>타오바오</CellCenter>
    },
    {
      title: "품목",
      dataIndex: "orderItems",
      align: "center",
      width: "260px",
      ellipsis: true,
      render: orderItems => {
        return orderItems.map((item, i) => (
          <CellLeft key={i} style={{ height: "40px" }}>
            {item.title}
          </CellLeft>
        ))
      }
    },
    {
      title: "오더넘버",
      dataIndex: "deliveryItem",
      width: "120px",
      align: "center",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ fontSize: "10px", height: "40px" }}>
            {`'${item.taobaoItem.orderNumber}`}
          </CellCenter>
        ))
    },
    {
      title: (
        <div>
          <CellCenter>고객</CellCenter>
          <CellCenter>결제금액</CellCenter>
        </div>
      ),
      dataIndex: "orderItems",
      align: "center",
      width: "80px",
      render: orderItems => {
        return orderItems.map((item, i) => (
          <CellRight key={i} style={{ height: "40px" }}>
            {(item.salesPrice * item.quantity ).toLocaleString("ko")}
          </CellRight>
        ))
      }
    },
    {
      title: "배송비",
      align: "center",
      width: "80px",
      dataIndex: "shippingPrice",
      render: shippingPrice => <CellRight>{shippingPrice.toLocaleString("ko")}</CellRight>
    },
    {
      title: (
        <div>
          <CellCenter>구매</CellCenter>
          <CellCenter>대행일자</CellCenter>
        </div>
      ),
      align: "center",
      width: "100px",
      render: data => {
        let taobaoOrderNumber = null
        return data.deliveryItem.map((item, i) => {
          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          return (
            <div key={i}>
            <CellCenter>
              {moment(item.taobaoItem.orderDate, "YYYYMMDD").format("YYYY-MM-DD")}
            </CellCenter>
            <CellCenter>
              {moment(item.taobaoItem.orderTime, "HHmmSS").format("HH:mm:SS")}
            </CellCenter>
          </div>
          )
        })
      }
        
    },
    {
      title: "사용카드",
      align: "center",
      width: "100px",
      render: data => <CellCenter></CellCenter>
    },
    {
      title: (
        <div>
          <CellCenter>구매금액</CellCenter>
          <CellCenter>(원화환산)</CellCenter>
        </div>
      ),
      dataIndex: "deliveryItem",
      width: "100px",
      align: "center",
      render: deliveryItem => {
        let taobaoOrderNumber = null

        return deliveryItem.map((item, i) => {
          let detail = "taobao"
          try {
            detail = item.taobaoItem.orders[0].detail
          } catch (e){

          }
          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          const korPrice = costAccounting({
            detail,
            purchaseAmount: item.taobaoItem.purchaseAmount,
            cnyPrice: item.exchange.cnyPrice,
            usdPrice: item.exchange.usdPrice
          })
          return (
            <CellRight key={i} style={{ height: "40px" }}>{`${Math.floor(korPrice).toLocaleString(
              "ko"
            )}`}</CellRight>
          )
        })
      }

      
    },
    {
      title: "국내배송비",
      align: "center",
      width: "100px",
      dataIndex: "deliveryItem",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellRight key={i} style={{ height: "40px" }}>
            {item.shipFee.toLocaleString("ko")}
          </CellRight>
        ))
    },
    {
      title: (
        <div>
          <CellCenter>구매금액</CellCenter>
          <CellCenter>수수료</CellCenter>
        </div>
      ),
      align: "center",
      width: "100px",

      render: data => {
        let custPrice = 0
        let shipFee = 0
        let korPrice = 0

        let taobaoOrderNumber = null

        data.orderItems.forEach(item => {
          custPrice += item.salesPrice * item.quantity
        })
        custPrice = (custPrice) + data.shippingPrice
        data.deliveryItem.forEach(item => {
          shipFee += item.shipFee
        })

        data.deliveryItem.forEach(item => {
          let detail = "taobao"
          try {
            detail = item.taobaoItem.orders[0].detail
          } catch (e){

          }
          if(item.taobaoItem.orderNumber === taobaoOrderNumber){
            return null
          } 
          taobaoOrderNumber = item.taobaoItem.orderNumber

          korPrice += costAccounting({
            detail,
            purchaseAmount: item.taobaoItem.purchaseAmount,
            cnyPrice: item.exchange.cnyPrice,
            usdPrice: item.exchange.usdPrice
          })
        })
        return (
          <CellRight style={{ height: "40px" }}>
            {Math.ceil(custPrice - korPrice - shipFee).toLocaleString("ko")}
          </CellRight>
        )
      }
    },
    {
      title: "운송사",
      align: "center",
      width: "100px",
      dataIndex: "deliveryItem",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ height: "40px" }}>
            {item.deliveryCompanyName}
          </CellCenter>
        ))
    },
    {
      title: "송장번호",
      align: "center",
      width: "140px",
      dataIndex: "deliveryItem",
      render: deliveryItem =>
        deliveryItem.map((item, i) => (
          <CellCenter key={i} style={{ height: "40px" }}>
            {item.shippingNumber}
          </CellCenter>
        ))
    }
  ]
  
  const ModalClick = orderId => {
    setSelectdOrderID(orderId)
    setModalVisible(true)
  }
  const vatDetailColumns = [
    {
      title: (
        <div>
          <CellCenter>고객</CellCenter>
          <CellCenter>구매일자</CellCenter>
        </div>
      ),
      fixed: "left",
      align: "center",
      width: "100px",
      render: data => (
        <ModalLink onClick={() => {
          ModalClick(data.orderId)
          }}>
          <CellCenter>{moment(data.paidAtDate, "YYYYMMDD").format("YYYY-MM-DD")}</CellCenter>
          <CellCenter>{moment(data.paidAtTime, "HHmmSS").format("HH:mm:SS")}</CellCenter>
        </ModalLink>
      )
    },
    {
      title: "마켓 주문 정보",

      children: [
        {
          title: "마켓명",
          dataIndex: "market",
          align: "center",
          width: "80px",
          render(market, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                }
              },
              children: <div>{market}</div>
            }
          }
        },
        {
          title: "주문번호",
          dataIndex: "orderId",
          align: "center",
          width: "100px",
          render(orderId, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                }
              },
              children: <div style={{ fontSize: "10px" }}>{`'${orderId}`}</div>
            }
          }
        },
        {
          title: "품목",
          dataIndex: "orderItems",
          align: "center",
          children: [
            {
              title: "상품명",
              dataIndex: "orderItems",
              align: "center",
              width: "260px",
              ellipsis: true,
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellLeft key={i} style={{ height: "40px" }}>
                      {item.title}
                    </CellLeft>
                  ))
                }
              }
            },
            {
              title: "옵션",
              dataIndex: "orderItems",
              align: "center",
              width: "100px",
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellLeft key={i} style={{ height: "40px" }}>
                      {item.option}
                    </CellLeft>
                  ))
                }
              }
            },
            {
              title: "수량",
              dataIndex: "orderItems",
              align: "center",
              width: "30px",
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellRight key={i} style={{ height: "40px" }}>
                      {item.quantity}
                    </CellRight>
                  ))
                }
              }
            },
            {
              title: "상품금액",
              dataIndex: "orderItems",
              align: "center",
              width: "80px",
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellRight key={i} style={{ height: "40px" }}>
                      {(item.salesPrice).toLocaleString("ko")}
                    </CellRight>
                  ))
                }
              }
            },
            {
              title: "결제금액",
              dataIndex: "orderItems",
              align: "center",
              width: "80px",
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellRightBold key={i} style={{ height: "40px" }}>
                      {(item.salesPrice * item.quantity).toLocaleString("ko")}
                    </CellRightBold>
                  ))
                }
              }
            },
            {
              title: "할인금액",
              dataIndex: "orderItems",
              align: "center",
              width: "80px",
              render(orderItems, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: orderItems.map((item, i) => (
                    <CellRight key={i} style={{ height: "40px" }}>
                      {(item.discountPrice * item.quantity).toLocaleString("ko")}
                    </CellRight>
                  ))
                }
              }
            }
          ]
        },
        {
          title: "배송비",
          align: "center",
          width: "80px",
          dataIndex: "shippingPrice",
          render(shippingPrice, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                }
              },
              children: <CellRightBold>{shippingPrice.toLocaleString("ko")}</CellRightBold>
            }
          }
        },
        {
          title: "주문자정보",
          align: "center",
          children: [
            {
              title: "주문자명",
              align: "center",
              dataIndex: "orderer",
              width: "80px",
              render(orderer, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: <CellCenter>{orderer.name}</CellCenter>
                }
              }
            },
            {
              title: "연락처",
              align: "center",
              width: "150px",
              dataIndex: "orderer",
              render(orderer, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: <CellCenter>{orderer.hpNumber}</CellCenter>
                }
              }
            }
          ]
        },
        {
          title: "수취인정보",
          align: "center",
          children: [
            {
              title: "수취인명",
              align: "center",
              width: "80px",
              dataIndex: "receiver",
              render(receiver, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: <CellCenter>{receiver.name}</CellCenter>
                }
              }
            },
            {
              title: "연락처",
              align: "center",
              width: "150px",
              dataIndex: "receiver",
              render(receiver, _, row) {
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(223, 128, 255,0.1)" : "rgba(223, 128, 255,0.2)"
                    }
                  },
                  children: <CellCenter>{receiver.hpNumber}</CellCenter>
                }
              }
            }
          ]
        }
      ]
    },
    {
      title: "구매대행 주문 정보",
      children: [
        {
          title: "주문번호",
          dataIndex: "deliveryItem",
          width: "170px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <CellCenter key={i} style={{ height: "40px" }}>
                    {`'${item.taobaoItem.orderNumber}`}
                  </CellCenter>
                )
              })
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>구매</CellCenter>
              <CellCenter>대행일자</CellCenter>
            </div>
          ),
          align: "center",
          width: "100px",
          render(data, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: data.deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <div key={i}>
                    <CellCenter>
                      {moment(item.taobaoItem.orderDate, "YYYYMMDD").format("YYYY-MM-DD")}
                    </CellCenter>
                    <CellCenter>
                      {moment(item.taobaoItem.orderTime, "HHmmSS").format("HH:mm:SS")}
                    </CellCenter>
                  </div>
                )
              })
            }
          }
        },
        {
          title: "품목",
          children: [
            {
              title: "이미지",
              dataIndex: "deliveryItem",
              align: "center",
              width: "60px",
              render(deliveryItem, _, row) {
                let taobaoOrderNumber = null
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                    }
                  },
                  children: deliveryItem.map((item, i) => {
                    if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                      return null
                    } 
                    taobaoOrderNumber = item.taobaoItem.orderNumber
                    return (
                      <div key={i}>
                        {item.taobaoItem.orders.map((item, j) => (
                          <CellCenter key={j}>
                            <ThumbnailImg src={`${item.thumbnail}_40x40.jpg`} />
                          </CellCenter>
                        ))}
                      </div>
                    )
                  })
                }
              }
            },
            {
              title: "상품명",
              dataIndex: "deliveryItem",
              align: "center",
              width: "400px",
              render(deliveryItem, _, row) {
                let taobaoOrderNumber = null
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                    }
                  },
                  children: deliveryItem.map((item, i) => {
                    if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                      return null
                    } 
                    taobaoOrderNumber = item.taobaoItem.orderNumber
                    return (
                      <div key={i} >
                        {item.taobaoItem.orders.map((item, j) => (
                          <TaobaoTitle key={j} onClick={() => shell.openExternal(item.detail)}>
                            <CellLeft style={{ height: "40px" }}>{`${item.productName}`}</CellLeft>
                            <CellLeft>
                              {item.option.length > 9 &&
                                item.option.map((item, i) => <span key={i}>{item.value}</span>)}
                            </CellLeft>
                          </TaobaoTitle>
                        ))}
                      </div>
                    )
                  })
                }
              }
            },
            {
              title: "수량",
              dataIndex: "deliveryItem",
              align: "center",
              width: "60px",
              render(deliveryItem, _, row) {
                let taobaoOrderNumber = null
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                    }
                  },
                  children: deliveryItem.map((item, i) => {
                    if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                      return null
                    } 
                    taobaoOrderNumber = item.taobaoItem.orderNumber
                    return (
                      <div key={i}>
                        {item.taobaoItem.orders.map((item, j) => (
                          <CellRight key={j} style={{ height: "40px" }}>
                            {item.quantity}
                          </CellRight>
                        ))}
                      </div>
                    )
                  })
                }
              }
            },
            {
              title: "판매금액",
              dataIndex: "deliveryItem",
              width: "100px",
              align: "center",
              render(deliveryItem, _, row) {
                let taobaoOrderNumber = null
                return {
                  props: {
                    style: {
                      background:
                        row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                    }
                  },
                  children: deliveryItem.map((item, i) => {
                    if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                      return null
                    } 
                    let detail = "taobao"
                    try {
                      detail = item.taobaoItem.orders[0].detail
                    } catch (e){

                    }
                    let currency = isChina(detail) ? "￥" : "$"
                    taobaoOrderNumber = item.taobaoItem.orderNumber
                    return (
                      <div key={i}>
                        {item.taobaoItem.orders.map((item, j) => (
                            <CellRight key={j} style={{ height: "40px" }}>
                              {`${currency}${item.realPrice}`}
                            </CellRight>
                          ))}
                      </div>
                    )
                  })
                }
              }
            }
          ]
        },
        {
          title: "구매금액",
          dataIndex: "deliveryItem",
          width: "100px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                let detail = "taobao"
                try {
                  detail = item.taobaoItem.orders[0].detail
                } catch (e){

                }
                let currency = isChina(detail) ? "￥" : "$"
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <CellRight
                    key={i}
                    style={{ height: "40px" }}
                  >{`${currency}${item.taobaoItem.purchaseAmount}`}</CellRight>
                )
              })
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>구매금액</CellCenter>
              <CellCenter>수수료포함</CellCenter>
            </div>
          ),
          dataIndex: "deliveryItem",
          width: "100px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                let detail = "taobao"
                try {
                  detail = item.taobaoItem.orders[0].detail
                } catch (e){

                }
                let currency = isChina(detail) ? "￥" : "$"
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <CellRight key={i} style={{ height: "40px" }}>{`${currency}${(
                    Number(item.taobaoItem.purchaseAmount.replace(/,/gi, "")) * 1.03
                  ).toFixed(2)}`}</CellRight>
                )
              })
            }
          }
        },
        {
          title: "CNY환율",
          dataIndex: "deliveryItem",
          width: "100px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <CellRight key={i} style={{ height: "40px" }}>
                    {Number(item.exchange.cnyPrice.replace(/,/gi, "")).toLocaleString("ko")}
                  </CellRight>
                )
              })
            }
          }
        },
        {
          title: "USD환율",
          dataIndex: "deliveryItem",
          width: "100px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                taobaoOrderNumber = item.taobaoItem.orderNumber
                return (
                  <CellRight key={i} style={{ height: "40px" }}>
                    {Number(item.exchange.usdPrice.replace(/,/gi, "")).toLocaleString("ko")}
                  </CellRight>
                )
              })
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>구매금액</CellCenter>
              <CellCenter>(원화환산)</CellCenter>
            </div>
          ),
          dataIndex: "deliveryItem",
          width: "100px",
          align: "center",
          render(deliveryItem, _, row) {
            let taobaoOrderNumber = null
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => {

                
                let detail = "taobao"
                try {
                  detail = item.taobaoItem.orders[0].detail
                } catch (e){

                }
                
                if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                  return null
                } 
                taobaoOrderNumber = item.taobaoItem.orderNumber
                
                const korPrice = costAccounting({
                  detail,
                  purchaseAmount: item.taobaoItem.purchaseAmount,
                  cnyPrice: item.exchange.cnyPrice,
                  usdPrice: item.exchange.usdPrice
                })
                return (
                  <CellRightBold key={i} style={{ height: "40px" }}>{`${Math.floor(
                    korPrice
                  ).toLocaleString("ko")}`}</CellRightBold>
                )
              })
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>거래상태</CellCenter>
              <CellCenter>배송상태</CellCenter>
            </div>
          ),
          dataIndex: "deliveryItem",
          width: "200px",
          align: "center",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(255, 102, 102,0.1)" : "rgba(255, 102, 102,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <div key={i}>
                  <ExpressStatusContainer>
                    <div>{shippingStatus(item.taobaoItem.shippingStatus)}</div>
                    <div>
                      <ExpressPopUp express={item.taobaoItem.express} />
                    </div>
                  </ExpressStatusContainer>
                  <ExpressStartEnd
                    express={item.taobaoItem.express}
                    shippingStatus={item.taobaoItem.shippingStatus}
                  />
                </div>
              ))
            }
          }
        }
      ]
    },
    {
      title: "배송대행지 정보",
      children: [
        {
          title: "무게",
          align: "center",
          width: "50px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CellRight key={i} style={{ height: "40px" }}>{`${item.weight.toLocaleString(
                  "ko"
                )}KG`}</CellRight>
              ))
            }
          }
        },
        {
          title: "국내배송비",
          align: "center",
          width: "100px",
          // dataIndex: "deliveryItem",
          render(data, _, row) {
            // console.log("data.orderItems", data)
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: data.deliveryItem.map((item, i) => (
                <CellRightBold key={i} style={{ height: "40px" }}>
                  {(item.shipFee).toLocaleString("ko")}
                </CellRightBold>
              ))
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>배대지</CellCenter>
              <CellCenter>주문번호</CellCenter>
            </div>
          ),
          align: "center",
          width: "100px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CellCenter key={i} style={{ height: "40px" }}>
                  {item.orderNo}
                </CellCenter>
              ))
            }
          }
        },
        {
          title: "수취인",
          align: "center",
          width: "100px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CellCenter key={i} style={{ height: "40px" }}>
                  {item.recipientName}
                </CellCenter>
              ))
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>수취인</CellCenter>
              <CellCenter>핸드폰번호</CellCenter>
            </div>
          ),
          align: "center",
          width: "160px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CellCenter key={i} style={{ height: "40px" }}>
                  {item.recipientPhoneNumber}
                </CellCenter>
              ))
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>개인통관</CellCenter>
              <CellCenter>고유번호</CellCenter>
            </div>
          ),
          align: "center",
          width: "120px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CellCenter key={i} style={{ height: "40px" }}>
                  {item.personalCustomsClearanceCode}
                </CellCenter>
              ))
            }
          }
        },
        {
          title: (
            <div>
              <CellCenter>수취인</CellCenter>
              <CellCenter>주소</CellCenter>
            </div>
          ),
          align: "center",
          width: "260px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <div key={i}>
                  <CellLeft>{`(${item.recipientPostNum})`}</CellLeft>
                  <CellLeft>{item.recipientAddress}</CellLeft>
                </div>
              ))
            }
          }
        },
        {
          title: "통관",
          dataIndex: "deliveryItem",
          width: "300px",
          align: "center",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <CustomsStartEnd
                  key={i}
                  customs={item.customs}
                  status={item.status}
                  shippingNumber={item.shippingNumber}
                />
              ))
            }
          }
        },
        {
          title: "국내배송",
          align: "center",
          width: "300px",
          dataIndex: "deliveryItem",
          render(deliveryItem, _, row) {
            return {
              props: {
                style: {
                  background: row % 2 === 0 ? "rgba(0, 153, 255,0.1)" : "rgba(0, 153, 255,0.2)"
                }
              },
              children: deliveryItem.map((item, i) => (
                <DeliveryStartEnd
                  key={i}
                  deliveryTracking={item.deliveryTracking}
                  shippingNumber={item.shippingNumber}
                />
              ))
            }
          }
        }
      ]
    },
    {
      title: "정산",

      children: [
        {
          title: (
            <div>
              <CellCenter>정산</CellCenter>
              <CellCenter>예정금액</CellCenter>
            </div>
          ),
          align: "center",
          width: "80px",
          fixed: "right",
          render: data => {
            let orderPrice = 0

            data.orderItems.forEach(item => {
              orderPrice += item.salesPrice * item.quantity
            })
            return (
              <CellRight style={{ height: "40px" }}>
                {Math.ceil(
                  estimatedSettlementAmount(data.market, (orderPrice)) + data.shippingPrice
                ).toLocaleString("ko")}
              </CellRight>
            )
          }
        },
        {
          title: "수익금",
          align: "center",
          width: "80px",
          fixed: "right",
          render: data => {
            let orderPrice = 0
            data.orderItems.forEach(item => {
              orderPrice += item.salesPrice * item.quantity
            })
            const settlementAmount =
              estimatedSettlementAmount(data.market, (orderPrice )) + data.shippingPrice
            let korPrice = 0
            let shipFee = 0
            let taobaoOrderNumber = null

            
            let detail = "taobao"
            data.deliveryItem.forEach(item => {

              
              try {
                detail = item.taobaoItem.orders[0].detail
              } catch (e){

              }

              shipFee += item.shipFee
              
              if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                return
              } 
              taobaoOrderNumber = item.taobaoItem.orderNumber

              korPrice += costAccounting({
                detail,
                purchaseAmount: item.taobaoItem.purchaseAmount,
                cnyPrice: item.exchange.cnyPrice,
                usdPrice: item.exchange.usdPrice
              })
              
            })
            return (
              <CellRightBold style={{ height: "40px" }} undetermined={isChina(detail) && shipFee === 0} isMinus={Math.ceil(settlementAmount - korPrice - shipFee) <= 0}>
                {Math.ceil(settlementAmount - korPrice - shipFee).toLocaleString("ko")}
              </CellRightBold>
            )
          }
        },
        {
          title: "수익률",
          align: "center",
          width: "80px",
          fixed: "right",
          render: data => {
            let orderPrice = 0
            data.orderItems.forEach(item => {
              orderPrice += item.orderPrice * item.quantity
            })
            const settlementAmount = Math.ceil(
              estimatedSettlementAmount(data.market, (orderPrice)) + data.shippingPrice
            )
            let korPrice = 0
            let shipFee = 0
            let taobaoOrderNumber = null
            let detail = "taobao"
            data.deliveryItem.forEach(item => {

             
              try {
                detail = item.taobaoItem.orders[0].detail
              } catch (e){

              }

              shipFee += item.shipFee

              if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                return
              } 
              taobaoOrderNumber = item.taobaoItem.orderNumber

              korPrice += costAccounting({
                detail,
                purchaseAmount: item.taobaoItem.purchaseAmount,
                cnyPrice: item.exchange.cnyPrice,
                usdPrice: item.exchange.usdPrice
              })
              
            })

            const profit = settlementAmount - korPrice - shipFee

            return (
              <CellRight style={{ height: "40px" }} undetermined={isChina(detail) && shipFee === 0} isMinus={((profit / ((orderPrice ) + data.shippingPrice)) * 100) <= 0}>
                {`${((profit / ((orderPrice ) + data.shippingPrice)) * 100).toFixed(2)}%`}
              </CellRight>
            )
          }
        }
      ]
    }
  ]
  if (radio === "vat") {
    columns = vatColumns
  } else if (radio === "vat+") {
    columns = vatPlusColumns
  }  else if (radio === "vatDetail") {
    columns = vatDetailColumns
  }

  const handleSelectChange = (value) => {
    setSelectUser(value)
  }

  const handleOk = () => {
    setModalVisible(false)
  }
  return (
    <Container>
      {isModalVisible && selectedOrderID && (
        <VatDataModal 
          isModalVisible={isModalVisible}
          userID={selectUser ? selectUser : user.id}
          orderId={selectedOrderID}
          handleOk={handleOk}
          handleCancel={handleOk}
        />
      )}
      <SearchContainer>
        <RangePicker
          // locale={{ lang: { locale: "ko_KR" } }}
          // defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
          allowClear={true}
          allowEmpty={[true, true]}
          placeholder={["시작일", "종료일"]}
          size={"large"}
          format={dateFormat}
          // value={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
          onChange={value => {
            if (!value) {
              setStartDate("")
              setEndDate("")
            }
            if (value && value[0]) {
              setStartDate(value[0].format("YYYYMMDD"))
            } else {
              setStartDate("")
            }

            if (value && value[1]) {
              setEndDate(value[1].format("YYYYMMDD"))
            } else {
              setEndDate("")
            }
          }}
        />
        <Search
          allowClear={true}
          placeholder="상품명, 수취인, 전화번호, 통관번호, 송장번호 등등..."
          size="large"
          onSearch={async value => {
            setSearch(value)
            setLoading(true)
            try {
              const response = await getList({
                variables: {
                  startDate,
                  endDate,
                  search: value,
                  userID: selectUser
                },
                context:{timeout: 1000000 }
              })
              console.log("VatListType--", response)
              if (response && response.data && response.data.VatListType) {
                SetVatList(response.data.VatListType)
              }
            } catch (e) {
              console.log("eee", e)
            } finally {
              setLoading(false)
            }
          }}
          enterButton
        />
      </SearchContainer>
      <FilterContainer>
        
        <Radio.Group
          options={[
            {
              label: "부가세신고자료",
              value: "vat"
            },
            {
              label: "부가세신고자료(배대지)",
              value: "vat+"
            },
            {
              label: "소명자료",
              value: "vatDetail"
            }
          ]}
          onChange={handleRadioChange}
          value={radio}
          optionType="button"
          buttonStyle="solid"
        />
        <div>
          
        {<UserSelect handleSelectChange={handleSelectChange} userID={user.id} />}

          <Button type="primary"
            style={{
              marginRight: "5px"
            }}
            icon={<ClockCircleOutlined />}
            onClick={async () => {
              const response = await vatSearch()
              console.log("response", response)
              message.success("데이터 수집을 시작합니다.")
            }}
          >수집</Button>

          <Button type="primary"
          loading={syncLoading}
            style={{
              marginRight: "5px"
            }}
            icon={<ClockCircleOutlined />}
            onClick={async () => {
              try {
                setSyncLoading(true)
                const response = await syncDeliveryOrder()
                console.log("response", response)
                if(response.data.SyncDeliveryOrder) {
                  message.success("계정별 배대지 동기화를 완료하였습니다.")
                } else {
                  message.error("계정별 배대지 동기화를 실해하였습니다.")
                }
              } catch(e){
                message.error("계정별 배대지 동기화를 실해하였습니다.")
              } finally {
                setSyncLoading(false)
              }
              
              
            }}
          >배대지 동기화</Button>

          
          <Button type="primary"
            style={{
              marginRight: "5px"
            }}
            icon={<ClockCircleOutlined />}
            onClick={async () => {
              const response = await taobaoOrder()
              console.log("response", response)
              message.success("데이터 수집을 시작합니다.")
            }}
          >타오바오 주문 수집</Button>
          <ReactHTMLTableToExcel
            id="test-table-xls-button"
            className="download-table-xls-button"
            table="table-to-xls"
            filename="table"
            sheet="소명자료"
            buttonText="엑셀 다운"
          />
        </div>
      </FilterContainer>
      <Table
        ref={tableRef}
        className={radio}
        size="small"
        columns={columns}
        bordered
        loading={loading}
        dataSource={vatList}
        pagination={{
          hideOnSinglePage: true,
          pageSize: vatList.length
        }}
        scroll={{ x: 600, y: 590 }}
        // sticky={true}
        summary={pageData => {
          let totalOrderPrice = 0
          let totalShippingPrice = 0
          let totalTaobaoPurchaseAmount = 0
          let totalQuantity = 0
          let totalSalePrice = 0
          let totalDiscountPrice = 0
          let totalTaobaoQuantity = 0
          let totalRealPrice = 0
          let totalTaoboaCnyPurchaseAmount = 0
          let totalCnyExchange = 0
          let totalUsdExchange = 0
          let totalKorShipFee = 0
          let totalSettlementAmount = 0
          pageData.forEach(({ shippingPrice, orderItems, deliveryItem, market }) => {
            totalShippingPrice += shippingPrice
            orderItems.forEach(item => {
              
              totalOrderPrice += item.salesPrice * item.quantity
              totalQuantity += item.quantity
              totalSalePrice += ( item.salesPrice  )
              totalDiscountPrice += item.discountPrice

              totalSettlementAmount += estimatedSettlementAmount(market, item.salesPrice * item.quantity)
            })
            let taobaoOrderNumber = null
            deliveryItem.forEach(item => {

              let detail = "taobao"
              try {
                detail = item.taobaoItem.orders[0].detail
              } catch (e){

              }

              totalKorShipFee += item.shipFee
              if(item.taobaoItem.orderNumber === taobaoOrderNumber){
                return
              } 
              taobaoOrderNumber = item.taobaoItem.orderNumber

              totalTaobaoPurchaseAmount += costAccounting({
                detail,
                purchaseAmount:  item.taobaoItem.purchaseAmount,
                cnyPrice: item.exchange.cnyPrice,
                usdPrice: item.exchange.usdPrice
              })
              totalCnyExchange += Number(item.exchange.cnyPrice.replace(/,/gi, ""))
              totalUsdExchange += Number(item.exchange.usdPrice.replace(/,/gi, ""))
              totalTaoboaCnyPurchaseAmount += Number(
                item.taobaoItem.purchaseAmount.replace(/,/gi, "")
              )
              
              item.taobaoItem.orders.forEach(item => {
                totalTaobaoQuantity += Number(item.quantity)
                totalRealPrice += Number(item.realPrice.replace(/,/gi, ""))
              })
            })
          })
          if (radio === "vat") {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={6}>
                  <CellCenter>Total</CellCenter>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{pageData.length.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalOrderPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalShippingPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <CellRight>
                    {Math.floor(totalTaobaoPurchaseAmount).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                {/* <Table.Summary.Cell>
                  <CellRight>{Math.floor(totalKorShipFee).toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell> */}
                <Table.Summary.Cell>
                  <CellRightBold>
                    {Math.ceil(
                      totalOrderPrice + totalShippingPrice - totalTaobaoPurchaseAmount
                      // -totalKorShipFee
                    ).toLocaleString("ko")}
                  </CellRightBold>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
            )
          } else  if (radio === "vat+") {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={6}>
                  <CellCenter>Total</CellCenter>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{pageData.length.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalOrderPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalShippingPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <CellRight>
                    {Math.floor(totalTaobaoPurchaseAmount).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{Math.floor(totalKorShipFee).toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRightBold>
                    {Math.ceil(
                      totalOrderPrice + totalShippingPrice - totalTaobaoPurchaseAmount
                      -totalKorShipFee
                    ).toLocaleString("ko")}
                  </CellRightBold>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
              </Table.Summary.Row>
            )
          } else if (radio === "vatDetail") {
            return (
              <Table.Summary.Row>
                <Table.Summary.Cell colSpan={5}>
                  <CellCenter>Total</CellCenter>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalQuantity.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalSalePrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalOrderPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalDiscountPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalShippingPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <CellRight>{totalTaobaoQuantity.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalRealPrice.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>{totalTaoboaCnyPurchaseAmount.toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>
                    {Number((totalTaoboaCnyPurchaseAmount * 1.03).toFixed(2)).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>

                <Table.Summary.Cell>
                  <CellRight>
                    {Number((totalCnyExchange / pageData.length).toFixed(2)).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>
                    {Number((totalUsdExchange / pageData.length).toFixed(2)).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRight>
                    {Math.floor(totalTaobaoPurchaseAmount).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <CellRight>{Math.floor(totalKorShipFee).toLocaleString("ko")}</CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell />
                <Table.Summary.Cell>
                  <CellRight>
                    {Math.ceil((totalSettlementAmount) + totalShippingPrice).toLocaleString("ko")}
                  </CellRight>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRightBold>
                    {Math.ceil(
                      (totalSettlementAmount ) +
                        totalShippingPrice -
                        totalTaobaoPurchaseAmount -
                        totalKorShipFee
                    ).toLocaleString("ko")}
                  </CellRightBold>
                </Table.Summary.Cell>
                <Table.Summary.Cell>
                  <CellRightBold>{`${(
                    (((totalSettlementAmount )+
                      totalShippingPrice -
                      totalTaobaoPurchaseAmount -
                      totalKorShipFee) /
                      (totalOrderPrice + totalShippingPrice)) *
                    100
                  ).toFixed(2)}%`}</CellRightBold>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            )
          }
        }}
      />
    </Container>
  )
}

export default ExplainingDataForm

const Container = styled.div`
  padding: 40px;

  & > :nth-child(1) {
    margin-bottom: 10px;
  }

  max-width: 1570px;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 300px;
    margin-right: 20px;
  }
`

const ThumbnailImg = styled.img`
  display: block;
  max-width: 40px;
  max-height: 40px;
`

const CellLeft = styled.div`
  display: flex;
  align-items: center;
  text-align: left;
`

const CellCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

const CellRight = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;

  ${ifProp(
    "undetermined",
    css`
      font-style: italic;
      color: gray;
    `
  )};
  ${ifProp(
    "isMinus",
    css`
      color: #FF3377;
    `
  )};
`

const CellRightBold = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-weight: 900;
  font-size: 16px;
  ${ifProp(
    "undetermined",
    css`
      font-style: italic;
      color: gray;
    `
  )};
  ${ifProp(
    "isMinus",
    css`
      color: #FF3377;
    `
  )};
`

const ExpressPopUp = ({ express }) => {
  const [visible, setVisible] = useState(false)

  return (
    <Popover
      placement="leftTop"
      title={`${express && express.expressName ? express.expressName : ""}(${express && express.expressId ? express.expressId : ""})`}
      trigger="click"
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      content={
        express && express.address
          ? express.address.map((item, i) => (
              <ContentPopUp key={i}>
                <div>{item.place}</div>
                <div>{item.time}</div>
              </ContentPopUp>
            ))
          : null
      }
    >
      <ExporessButton>(배송조회)</ExporessButton>
    </Popover>
  )
}

const ExporessButton = styled.div`
  cursor: pointer;
  color: violet;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
  }
`

const ContentPopUp = styled.div`
  min-width: 500px;
  max-width: 700px;
  max-height: 300px;
  overflow: auto;
  &:not(:last-child) {
    border-bottom: 1px solid lightgray;
    margin-bottom: 5px;
    padding-bottom: 5px;
  }
`

const ExpressStartEnd = ({ express, shippingStatus }) => {
  let startDate = ""
  let endDate = ""
  startDate =
    express && Array.isArray(express.address) && express.address.length > 0
      ? express.address[express.address.length - 1].time
      : ""
  if (shippingStatus === "快件已签收" || shippingStatus === "交易成功") {
    endDate =
      express && Array.isArray(express.address) && express.address.length > 0
        ? express.address[0].time
        : ""
  }
  return (
    <ExpressDateContainer>
      <div>
        {startDate.split(" ").map((item, i) => (
          <ExpressDateLabel key={i}>{item}</ExpressDateLabel>
        ))}
      </div>
      <div>>></div>
      <div>
        {endDate.split(" ").map((item, i) => (
          <ExpressDateLabel key={i}>{item}</ExpressDateLabel>
        ))}
      </div>
    </ExpressDateContainer>
  )
}

const ExpressDateContainer = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed lightgray;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  & > :nth-child(1) {
    flex: 1;
  }
  & > :nth-child(2) {
    flex: 0.6;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-child(3) {
    flex: 1;
  }
`
const ExpressDateLabel = styled.div`
  font-size: 12px;
  text-align: right;
`

const ExpressStatusContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const CustomsStartEnd = ({ customs, status, shippingNumber }) => {
  const startObj =
    customs && Array.isArray(customs) && customs.length > 0 ? customs[customs.length - 1] : {}

  let endObj = customs && Array.isArray(customs) && customs.length > 0 ? customs[0] : {}

  return (
    <>
      <ExpressStatusContainer>
        <StatusTitle>
          {endObj.processingStage
            ? endObj.processingStage
            : startObj.processingStage
            ? startObj.processingStage
            : status}
        </StatusTitle>
        <CustomsPopup customs={customs} />
        <DeliverImagePopup type="customs" shippingNumber={shippingNumber} />
      </ExpressStatusContainer>
      <ExpressDateContainer>
        <div>
          {startObj.processingStage && (
            <>
              <div>{startObj.processingStage}</div>
              <div>{moment(startObj.processingDate, "YYYYMMDD").format("YYYY-MM-DD")}</div>
              <div>{moment(startObj.processingTime, "HHmmSS").format("HH:mm:SS")}</div>
            </>
          )}
        </div>
        <div>>></div>
        <div>
          {endObj.processingStage && (
            <>
              <div>{endObj.processingStage}</div>
              <div>{moment(endObj.processingDate, "YYYYMMDD").format("YYYY-MM-DD")}</div>
              <div>{moment(endObj.processingTime, "HHmmSS").format("HH:mm:SS")}</div>
            </>
          )}
        </div>
      </ExpressDateContainer>
    </>
  )
}

const DeliveryStartEnd = ({ deliveryTracking, shippingNumber }) => {
  const startObj =
    deliveryTracking && Array.isArray(deliveryTracking) && deliveryTracking.length > 0
      ? deliveryTracking[0]
      : {}

  let endObj =
    deliveryTracking && Array.isArray(deliveryTracking) && deliveryTracking.length > 0
      ? deliveryTracking.filter(item => item.stage === "배달완료").length > 0
        ? deliveryTracking.filter(item => item.stage === "배달완료")[0]
        : {}
      : {}

  return (
    <>
      <ExpressStatusContainer>
        <StatusTitle>
          {endObj.stage ? endObj.stage : startObj.stage ? startObj.stage : "상품 인수 대기"}
        </StatusTitle>
        <DeliveryPopup deliveryTracking={deliveryTracking} shippingNumber={shippingNumber} />
        <DeliverImagePopup type="delivery" shippingNumber={shippingNumber} />
      </ExpressStatusContainer>
      <ExpressDateContainer>
        <div>
          {startObj.stage && (
            <>
              <div>{startObj.stage}</div>
              <div>{moment(startObj.processingDate, "YYYYMMDD").format("YYYY-MM-DD")}</div>
              <div>{moment(startObj.processingTime, "HHmm").format("HH:mm")}</div>
            </>
          )}
        </div>
        <div>>></div>
        <div>
          {endObj.stage && (
            <>
              <div>{endObj.stage}</div>
              <div>{moment(endObj.processingDate, "YYYYMMDD").format("YYYY-MM-DD")}</div>
              <div>{moment(endObj.processingTime, "HHmm").format("HH:mm")}</div>
            </>
          )}
        </div>
      </ExpressDateContainer>
    </>
  )
}

const StatusTitle = styled.div`
  min-height: 16px;
  max-height: 16px;
`

const CustomsPopup = ({ customs }) => {
  const [visible, setVisible] = useState(false)

  return (
    <Popover
      placement="left"
      title={`통관조회`}
      trigger="click"
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      content={customs.map((item, i) => (
        <ContentPopUp key={i}>
          <div>{item.processingStage}</div>
          <div>{`${moment(item.processingDate, "YYYYMMDD").format("YYYY-MM-DD")} ${moment(
            item.processingTime,
            "HHmmSS"
          ).format("HH:mm:SS")}`}</div>
        </ContentPopUp>
      ))}
    >
      <ExporessButton>(통관조회)</ExporessButton>
    </Popover>
  )
}

const DeliveryPopup = ({ deliveryTracking, shippingNumber }) => {
  const [visible, setVisible] = useState(false)

  return (
    <Popover
      placement="left"
      title={`배송조회 (${shippingNumber})`}
      trigger="click"
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      content={deliveryTracking.map((item, i) => (
        <ContentPopUp key={i}>
          <div>{item.stage}</div>
          <div>{`${moment(item.processingDate, "YYYYMMDD").format("YYYY-MM-DD")} ${moment(
            item.processingTime,
            "HHmm"
          ).format("HH:mm")}`}</div>
          <div>{item.status}</div>
          <div>{item.store}</div>
        </ContentPopUp>
      ))}
    >
      <ExporessButton>(배송조회)</ExporessButton>
    </Popover>
  )
}

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`

const DeliverImagePopup = ({ type, shippingNumber }) => {
  const [visible, setVisible] = useState(false)
  const [imageBase64, setIamgeBase64] = useState("")
  const [getDeliveryImage] = useMutation(GET_DELIVERY_IMAGE)

  const getIamge = async () => {
    const response = await getDeliveryImage({
      variables: {
        type,
        shippingNumber
      }
    })
    if (response && response.data && response.data.GetDeliveryImage) {
      setIamgeBase64(response.data.GetDeliveryImage)
    }
  }
  useEffect(() => {
    if (visible && !imageBase64) {
      getIamge()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  return (
    <Popover
      placement="left"
      trigger="click"
      visible={visible}
      onVisibleChange={() => setVisible(!visible)}
      content={<DeliveryImage src={`data:image/jpg;base64,${imageBase64}`} />}
    >
      <div>
        <FileImageOutlined style={{ fontSize: "14px", cursor: "pointer" }} />
      </div>
    </Popover>
  )
}

const DeliveryImage = styled.img`
  width: 100%;
`

const TaobaoTitle = styled.div`
  cursor: pointer;
  &:hover{
    text-decoration: underline;
  }
`

const ModalLink = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline
  }
`