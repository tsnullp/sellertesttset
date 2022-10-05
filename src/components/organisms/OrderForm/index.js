import React, { useState, useEffect } from "react"
import styled from "styled-components"
import {
  TabaeCategory,
  TabaeOrderTable,
  CoolzikuOrderTable,
  TaobaoOrderModal,
  TaobaoOrderManualModal,
  ExcelImport,
  CoolzikuConvertTable,
} from "components"
import { useQuery, useMutation } from "@apollo/client"
import {
  Table,
  Button,
  BackTop,
  Checkbox,
  Input,
  Divider,
  Switch,
  message,
  notification,
  Image,
  Tooltip,
  Tag,
  Popconfirm,
} from "antd"
import {
  LIST_ALL_ORDER,
  GET_TAOBAOITEM,
  UNIPASSVALID,
  TAOBAO_ORDER_BATCH,
  TABAE_ORDER_BATCH,
  SET_ORDER_SHIPPING,
} from "gql"

import moment from "moment"
import { isPhoneNum } from "../../../lib/userFunc"
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  EnterOutlined,
  CalendarOutlined,
} from "@ant-design/icons"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import url from "url"
import path from "path"

const { shell, remote } = window.require("electron")

const OrderForm = ({ orderState }) => {
  const [itemData, setItemData] = useState([])
  const [selectedRow, setSelectedRow] = useState([])
  const [tabaeOrderExcel, setTaeOrderExcel] = useState([])
  const [taobaoOrder] = useMutation(TAOBAO_ORDER_BATCH)
  const [tabaeOrder] = useMutation(TABAE_ORDER_BATCH)
  const [setOrderShipping] = useMutation(SET_ORDER_SHIPPING)

  const [isTaobaoOrderModalVisible, setTaobaoOrderModalVisible] = useState(false)
  const [isCoolzikcuConvertModalVisible, setCoolzikcuConvertModalVisible] = useState(false)
  const [isCoolzikudalVisible, setCoolzikuModalVisible] = useState(false)

  const { data, refetch, networkStatus } = useQuery(LIST_ALL_ORDER, {
    variables: {
      orderState,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setItemData(data.ListAllOrders)
    },
  })
  console.log("data-->", data)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const showCoolzikcuModal = () => {
    setCoolzikuModalVisible(true)
  }

  const handleOk = () => {
    setIsModalVisible(false)
    setCoolzikcuConvertModalVisible(false)
    setCoolzikuModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setCoolzikcuConvertModalVisible(false)
    setCoolzikuModalVisible(false)
  }

  const handleProdcutData = (i, values) => {
    const temp = itemData.map((item, index) => {
      if (index === i) {
        return {
          ...item,
          valid_number: {
            ...values,
          },
        }
      }
      return item
    })
    setItemData(temp)
  }

  const handleTaobaoOrderNumber = (i, j, taobaoOrder) => {
    console.log("taobaoOrderNumber", i, j, taobaoOrder)
    const temp = itemData.map((item, index) => {
      if (index === i) {
        const tempItem = item.items.map((item, index) => {
          let tempTaobaoOrder = item.taobaoOrder ? item.taobaoOrder : []
          console.log("item.taobaoOrder", item)
          if (index === j) {
            tempTaobaoOrder = taobaoOrder
          }
          return {
            ...item,
            taobaoOrder: tempTaobaoOrder,
          }
        })

        return {
          ...item,
          items: tempItem,
        }
      }
      return item
    })
    setItemData(temp)
  }

  const handleTabaeCategroyChange = (i, j, category) => {
    const temp = itemData.map((item, index) => {
      if (index === i) {
        const tempItem = item.items.map((item) => {
          return {
            ...item,
            category,
          }
        })

        return {
          ...item,
          items: tempItem,
        }
      }
      return item
    })
    setItemData(temp)
  }
  const getMarketIcon = ({ market_id, market_order_info, order_date, delivery_id, orderSeq }) => {
    const date = moment(order_date).format("YYYY-MM-DD (HH:mm)")

    switch (market_id) {
      case "shopn":
        return (
          <>
            <IconDateContainer>
              <div>
                <img
                  src="https://img.echosting.cafe24.com/icon/ico_route_shopn.gif"
                  alt="네이버쇼핑"
                />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "gmarket":
        return (
          <>
            <IconDateContainer>
              <div>
                <img
                  src="https://img.echosting.cafe24.com/icon/ico_route_gmarket.gif"
                  alt="G마켓"
                />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "auction":
        return (
          <>
            <IconDateContainer>
              <div>
                <img src="https://img.echosting.cafe24.com/icon/ico_route_auction.gif" alt="옥션" />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "coupang":
        return (
          <>
            <IconDateContainer>
              <div>
                <img src="https://img.echosting.cafe24.com/icon/ico_route_coupang.gif" alt="쿠팡" />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "timon":
        return (
          <>
            <IconDateContainer>
              <div>
                <img src="https://img.echosting.cafe24.com/icon/ico_route_timon.gif" alt="티몬" />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "inpark":
        return (
          <>
            <IconDateContainer>
              <div>
                <img
                  src="https://img.echosting.cafe24.com/icon/ico_route_inpark.gif"
                  alt="인터파크"
                />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      case "wemake":
        return (
          <>
            <IconDateContainer>
              <div>
                <img
                  src="https://img.echosting.cafe24.com/icon/ico_route_wemake.gif"
                  alt="위메프"
                />
              </div>
              <div>{market_order_info}</div>
            </IconDateContainer>
            <MarketOrderLabel>
              <CalendarOutlined
                style={{ fontSize: "16px", marginRight: "5px", color: "#d05ce3" }}
              />
              {date}
            </MarketOrderLabel>
            {delivery_id && (
              <IconDateContainer
                onClick={() => {
                  console.log("orderSeq", orderSeq)
                  if (orderSeq) {
                    shell.openExternal(
                      `https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${orderSeq}`
                    )
                  }
                }}
              >
                <img src="http://tabae.co.kr/Image/Common/favicon.ico" width="16px" />
                <div>{delivery_id}</div>
              </IconDateContainer>
            )}
          </>
        )
      default:
        return <div>{market_id}</div>
    }
  }

  const columns = [
    {
      title: "마켓",
      width: 180,
      render: (data) => {
        return getMarketIcon(data)
      },
    },
    {
      title: "상품",
      render: (data, _, row) => {
        return data.items.map((item, index) => {
          return (
            <ProductForm
              row={row}
              index={index}
              item={item}
              handleTaobaoOrderNumber={handleTaobaoOrderNumber}
              handleTabaeCategroyChange={handleTabaeCategroyChange}
            />
          )
        })
      },
    },
    {
      title: "수량",
      dataIndex: "items",
      widht: "30",
      render: (items) => {
        return items.map((item, index) => {
          if (Number(item.quantity) > 1) {
            return <QuantityLabel key={index}>{item.quantity}</QuantityLabel>
          } else {
            return (
              <div key={index} style={{ fontSize: "80px", fontWeight: "900", color: "#A1A1A1" }}>
                {item.quantity}
              </div>
            )
          }
        })
      },
    },
    {
      title: "가격",
      dataIndex: "items",
      width: 100,
      render: (items) => {
        return items.map((item, index) => {
          return <div key={index}>{item.product_price.toLocaleString("ko")}</div>
        })
      },
    },
    {
      title: "주문자/수령자",
      width: 200,
      render: (data) => {
        return (
          <div>
            <div>{data.buyer.name}</div>
            <div>{data.buyer.phone}</div>
            <div>{data.receiver.name}</div>
            <div>{data.receiver.phone}</div>
            <div>{data.receiver.address_full}</div>
          </div>
        )
      },
    },
    {
      title: "개인통관번호",
      width: 200,
      render: (data, _, index) => {
        return (
          <CustomCodeForm
            index={index}
            setItemData={handleProdcutData}
            checkUnipass={data.valid_number.checkUnipass}
            name={data.valid_number ? data.valid_number.name : null}
            persEcm={data.valid_number ? data.valid_number.persEcm : null}
            phone={data.valid_number ? data.valid_number.phone : null}
            phoneValid={isPhoneNum(data.valid_number ? data.valid_number.phone : null)}
            shipping_message={data.receiver ? data.receiver.shipping_message : null}
          />
        )
      },
    },

    (() => {
      if (orderState === "상품준비") {
        return {}
      }
      return {
        title: "운송장번호",
        width: 200,
        dataIndex: "shipping",
        render: (shipping) => {
          if (shipping) {
            if (shipping.deliveryCompanyName === "CJ 대한통운") {
              return (
                <ShippingContainer>
                  <img
                    src="https://www.cjlogistics.com/static/pc/global/template/images/logo/cj.ico"
                    width="14px"
                  />
                  <div>{shipping.shippingNumber}</div>
                </ShippingContainer>
              )
            } else if (shipping.deliveryCompanyName === "경동택배") {
              return (
                <ShippingContainer>
                  <img src="https://kdexp.com/resources/img/ci/ci.ico" width="14px" />
                  <div>{shipping.shippingNumber}</div>
                </ShippingContainer>
              )
            } else {
              return <div>{shipping.shippingNumber}</div>
            }
          } else {
            return null
          }
        },
      }
    })(),
  ]

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows)
      setSelectedRow(selectedRows)
      // console.log("itemData", itemData)
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === 'Disabled User',
    //   // Column configuration not to be checked
    //   name: record.name,
    // }),
  }

  const handleExcel = (value) => {
    console.log("value", value)
    setTaeOrderExcel(value)
    setCoolzikcuConvertModalVisible(true)
  }

  return (
    <div>
      <ButtonContainer>
        {/* {isCoolzikcuConvertModalVisible && 
        <CoolzikuConvertTable
        isModalVisible={isCoolzikcuConvertModalVisible} handleOk={handleOk} handleCancel={handleCancel} data={tabaeOrderExcel}
        />
        }
        <ExcelImport
          size="middle"
          onSuccess={handleExcel}
          title={"타배 주문서 -> 꿀직구 주문서"}
        /> */}

        <Button
          onClick={async () => {
            const response = await taobaoOrder()

            // message.success("데이터 수집을 시작합니다.")
            notification["success"]({
              message: "타오바오 주문서 수집을 시작합니다.",
              description: (
                <>
                  <div>타오바오 로그인을 확인해주세요.</div>
                  <div>파란 크롬이 종료되면 수집이 끝납니다.</div>
                  <div>상황에 따라 주문서 수집이 실패할 수 있습니다.</div>
                </>
              ),
            })
          }}
        >
          타오바오 수집(자동)
        </Button>

        <Button
          onClick={() => {
            setTaobaoOrderModalVisible(true)
          }}
        >
          타오바오 수집(수동)
        </Button>
        {isTaobaoOrderModalVisible && (
          <TaobaoOrderManualModal
            isModalVisible={isTaobaoOrderModalVisible}
            handleOk={() => setTaobaoOrderModalVisible(false)}
            handleCancel={() => setTaobaoOrderModalVisible(false)}
          />
        )}

        {isModalVisible && (
          <TabaeOrderTable
            isModalVisible={isModalVisible}
            handleOk={handleOk}
            handleCancel={handleCancel}
            data={selectedRow}
          />
        )}
        {(orderState === "상품준비" || orderState === "배송지시" || orderState === "배송중") && (
          <Button
            style={{ background: "green", color: "white" }}
            onClick={() => {
              console.log("itemData", itemData)
              console.log("selectedRow", selectedRow)

              let temp = selectedRow.map((item) => {
                return itemData.filter(
                  (fItem) => fItem.market_order_info === item.market_order_info
                )[0]
              })
              setSelectedRow(temp)

              showModal()
            }}
          >
            타배 엑셀생성
          </Button>
        )}

        {isCoolzikudalVisible && (
          <CoolzikuOrderTable
            isModalVisible={isCoolzikudalVisible}
            handleOk={handleOk}
            handleCancel={handleCancel}
            data={selectedRow}
          />
        )}

        {/* {orderState === "상품준비" && <Button onClick={() => {
          console.log("itemData", itemData)
          console.log("selectedRow", selectedRow)

          let temp = selectedRow.map(item => {
            return (
              itemData.filter(fItem => fItem.market_order_info === item.market_order_info)[0]
            )
          })
          setSelectedRow(temp)
          
          showCoolzikcuModal()
        }}>꿀직구 엑셀생성</Button>} */}
        {orderState === "배송지시" && (
          <Button
            onClick={async () => {
              console.log("itemData", itemData)
              console.log("selectedRow", selectedRow)
              //setOrderShipping

              const value = selectedRow.map((item) => {
                return {
                  order_id: item.order_id,
                  deliveryCompanyName: item.shipping.deliveryCompanyName,
                  shippingNumber: item.shipping.shippingNumber,
                  order_item_code: item.items.map((iItem) => iItem.order_item_code),
                  shipping_code: item.shipping.shipping_code,
                }
              })
              console.log("value---", value)
              const response = await setOrderShipping({
                variables: {
                  input: value,
                },
              })
              console.log("response--", response)
            }}
          >
            배송중 처리
          </Button>
        )}

        {/* <TabaeOrderTable 
        isModalVisible={isModalVisible} 
        handleOk={handleOk}
        handleCancel={handleCancel} 
        data={selectedRow}/> */}

        <Button
          type="primary"
          onClick={async () => {
            const response = await tabaeOrder()
            console.log("response", response)
            // message.success("데이터 수집을 시작합니다.")
            notification["success"]({
              message: "배대지 주문서 수집을 시작합니다.",
              description: (
                <>
                  <div>이 작업은 오래 걸립니다.</div>
                </>
              ),
            })
          }}
        >
          배대지 수집
        </Button>
      </ButtonContainer>
      <BackTop />
      <Table
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
        columns={columns}
        rowKey={(record) => record.market_order_info}
        dataSource={itemData}
        pagination={false}
        loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      />
    </div>
  )
}

export default OrderForm

const ButtonContainer = styled.div`
  margin-bottom: 20px;
  margin-right: 50px;
  display: flex;
  justify-content: flex-end;
  & > :not(:last-child) {
    margin-right: 30px;
  }
`
const IconDateContainer = styled.div`
  margin-top: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  & > :nth-child(2) {
    font-size: 14px;
    /* font-weight: 700; */
    margin-left: 5px;
    margin-top: -5px;
  }
`

const MarketOrderLabel = styled.div`
  margin-top: 4px;
  margin-left: 18x;
  display: inline-block;
  font-size: 13px;

  color: #a1a1a1;
`
const ProductForm = ({ row, index, item, handleTaobaoOrderNumber, handleTabaeCategroyChange }) => {
  const [getTaobao] = useMutation(GET_TAOBAOITEM)
  const [taobaoOrder, setTaobaoOrder] = useState(null)
  const [tempTaobaoOrder, setTempTaobaoOrder] = useState(null)
  const [orderNumber, setOrderNumber] = useState(item.taobaoOrderNumber)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const [isSearching, setSearching] = useState(false)

  const location = useLocation()
  const query = queryString.parse(location.search)

  const isDev = query && query.isDev === "true" ? true : false

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = (value) => {
    console.log("value--->", value)
    setIsModalVisible(false)
    setTempTaobaoOrder(null)
    setTaobaoOrder(value)
    handleTaobaoOrderNumber(row, index, value)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setTempTaobaoOrder(null)
  }

  useEffect(() => {
    // const getTaobaoOrder = async (orderNumber) => {
    //   if(item.taobaoOrderNumber && item.taobaoOrderNumber.length) {
    //     const response = await getTaobao(
    //       {
    //         variables: {
    //           orderNumber
    //         }
    //       }
    //     )
    //     if(response.data.GetTaobaoItem) {
    //       setTaobaoOrder(response.data.GetTaobaoItem)
    //       handleTaobaoOrderNumber(row, index, orderNumber)
    //     }
    //   }
    // }
    // getTaobaoOrder(item.taobaoOrderNumber)
  }, [item.taobaoOrderNumber])
  const handleTaobaoOrders = async (orderNumber) => {
    if (!orderNumber || orderNumber.length === 0) {
      setTaobaoOrder(null)
      handleTaobaoOrderNumber(row, index, null)
    } else {
      setSearching(true)
      try {
        const response = await getTaobao({
          variables: {
            orderNumber,
          },
        })
        if (response.data.GetTaobaoItem) {
          console.log("response.data.GetTaobaoItem", response.data.GetTaobaoItem)

          if (response.data.GetTaobaoItem.orders.length > 1) {
            setTempTaobaoOrder(response.data.GetTaobaoItem)
            showModal()
          } else {
            setTaobaoOrder(response.data.GetTaobaoItem)
            handleTaobaoOrderNumber(row, index, response.data.GetTaobaoItem)
          }
        } else {
          notification["error"]({
            message: "주문서를 업데이트해주세요",
            description: "타오바오에서 주문서 내역을 찾을 수 없습니다.",
          })
          setTaobaoOrder(null)
        }
        console.log("response---", response)
      } catch (e) {
      } finally {
        setSearching(false)
      }
    }
  }

  const handleCategroyChange = (value) => {
    handleTabaeCategroyChange(row, index, value[value.length - 1])
  }

  const handleNewWindow = (productID) => {
    if (!productID) {
      notification["warning"]({
        message: "상품정보를 찾지 못하였습니다.",
      })
      return
    }
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false,
      },
    })
    win.setAutoHideMenuBar(true)
    // win.loadURL(`http://localhost:3001#/productUploadWindow/${encodeURIComponent(detail)}`)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/productUpdatedWindow/${productID}?update=true`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }

      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        // pathname: path.join(__dirname, "../../index.html"),
        hash: `/productUpdatedWindow/${productID}?update=true`,
        protocol: "file:",
        slashes: true,
      })

      // win.loadURL(`bulid/index.html#/productUpdatedWindow/${data._id}`)
      //  win.loadURL(`file://${__dirname}/app/build/index.html#/productUpdatedWindow/${data._id}`)
      // win.loadFile(path.join(dirpath, `resources/app/bulid/index.html`))
      win.loadURL(startUrl)

      // win.loadURL(`file:///C:/Program%20Files/smartseller/resources/app/build/index.html#/productUpdatedWindow/${data._id}`);
    }
  }

  const getMarketIcon = (url) => {
    if (!url) {
      return ""
    }
    if (url.includes("tmall")) {
      return "https://img.alicdn.com/tfs/TB1XlF3RpXXXXc6XXXXXXXXXXXX-16-16.png"
    }
    if (url.includes("taobao")) {
      return "https://img.alicdn.com/tfs/TB1VlKFRpXXXXcNapXXXXXXXXXX-16-16.png"
    }
    if (url.includes("amazon")) {
      return "/amazonfavicon.ico"
    }
  }

  const getMarketName = (url) => {
    if (!url) {
      return ""
    }
    if (url.includes("tmall")) {
      return "티몰"
    }
    if (url.includes("taobao")) {
      return "타오바오"
    }
    if (url.includes("amazon")) {
      return "아마존"
    }
  }

  return (
    <ProductContainer key={index}>
      <div style={{ display: "flex" }}>
        <div>
          <Image width={164} height={164} src={item.isMatch ? item.image : null} />
        </div>
        <ProductTitleContainer>
          <TaobaoNumberContainer>
            <div style={{ display: "flex" }}>
              <Tag
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                icon={
                  <img style={{ marginRight: "4px" }} src={getMarketIcon(item.url)} alt="taobao" />
                }
                onClick={() => {
                  if (item.url) {
                    shell.openExternal(item.url)
                  }
                }}
              >
                {getMarketName(item.url)}
              </Tag>
              <Input
                placeholder="타오바오 주문번호 등록"
                style={{
                  width: "200px",
                }}
                // defaultValue={item.taobaoOrderNumber}
                value={orderNumber}
                size="small"
                allowClear={true}
                onChange={(e) => {
                  if (e.target.value.length === 0) {
                    handleTaobaoOrders("")
                  }
                  setOrderNumber(e.target.value)
                }}
              />
              <Button
                loading={isSearching}
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  handleTaobaoOrders(orderNumber)
                }}
              >
                검색
              </Button>
            </div>
            {item.vendorItemId && (
              <div>
                <Tag
                  style={{
                    width: "100%",
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px",
                    cursor: "pointer",
                    background: item.isMatch ? "none" : "#EDEDED",
                  }}
                  icon={
                    <img
                      width="16px"
                      src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                      alt="coupang"
                      style={{ marginRight: "10px" }}
                    />
                  }
                  onClick={() => {
                    if (item.vendorItemId > 0) {
                      shell.openExternal(
                        `https://www.coupang.com/vp/products/2071034509?vendorItemId=${item.vendorItemId}`
                      )
                    }
                  }}
                >{` 쿠팡상세`}</Tag>
              </div>
            )}
            {tempTaobaoOrder && (
              <TaobaoOrderModal
                isModalVisible={isModalVisible}
                handleOk={handleOk}
                handleCancel={handleCancel}
                taobaoOrder={tempTaobaoOrder}
              />
            )}
          </TaobaoNumberContainer>
          <TabaeCategory categoryChange={handleCategroyChange} />
          <ProductName onClick={() => handleNewWindow(item.productID)}>
            {item.product_name}
          </ProductName>
          <OptionLabel>{`(${item.option_value})`}</OptionLabel>
          {item.korValue && item.isMatch && (
            <OptionValueLabel>{`${item.korValue}`}</OptionValueLabel>
          )}
          {item.value && item.isMatch && <OptionValueLabel>{`${item.value}`}</OptionValueLabel>}
        </ProductTitleContainer>
      </div>
      {taobaoOrder && (
        <>
          <Divider orientation="left" plain>
            타오바오
          </Divider>
          <TaobaoOrderList index={index} taobaoOrder={taobaoOrder} />
        </>
      )}
    </ProductContainer>
  )
}
const ProductContainer = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ProductTitleContainer = styled.div`
  /* display: flex; */
  margin-left: 20px;
  width: 100%;
  & > :nth-child(n) {
    margin-bottom: 5px;
  }
`
const OptionLabel = styled.div`
  color: #ff3377;
  font-weight: 700;
`

const OptionValueLabel = styled.div`
  color: #a1a1a1;
`

const QuantityLabel = styled.div`
  color: #ff3377;
  font-weight: 900;
  font-size: 80px;
`

const TaobaoNumberContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const ShippingContainer = styled.div`
  display: flex;
  align-items: center;
  & > :last-child {
    margin-left: 5px;
  }
`
const CustomCodeForm = ({
  index,
  setItemData,
  checkUnipass,
  name,
  persEcm,
  phone,
  phoneValid,
  shipping_message,
}) => {
  // const [isValidPhone, setValidPhone] = useState(isPhoneNum(phone))

  const [unipassValid] = useMutation(UNIPASSVALID)

  const handleUserNameChagne = async (e) => {
    const value = {
      checkUnipass,
      name,
      persEcm,
      phone,
      phoneValid,
    }

    switch (e.target.name) {
      case "name":
        value.name = e.target.value
        break
      case "persEcm":
        value.persEcm = e.target.value
        break
      case "phone":
        value.phone = e.target.value
        value.phoneValid = isPhoneNum(e.target.value)
        break
      default:
        break
    }

    setItemData(index, value)
  }
  const handleBlur = async (e) => {
    const value = {
      checkUnipass,
      name,
      persEcm,
      phone,
      phoneValid,
    }

    const checkUnipassFun = async ({ name, persEcm, phone }) => {
      const response = await unipassValid({
        variables: {
          name,
          customID: persEcm,
          phone,
        },
      })
      return response.data.UnipassValid
    }
    switch (e.target.name) {
      case "name":
        value.name = e.target.value
        value.checkUnipass = await checkUnipassFun(value)
        break
      case "persEcm":
        value.persEcm = e.target.value
        value.checkUnipass = await checkUnipassFun(value)
        break
      case "phone":
        value.phone = e.target.value
        value.phoneValid = isPhoneNum(e.target.value)
        break
      default:
        break
    }

    setItemData(index, value)
  }

  const GetShippingMessage = (shipping_message) => {
    let message = shipping_message
    if (message.includes("배송메세지 : ")) {
      message = message.split("배송메세지 : ")[1]
    }
    if (message.includes(" (주문번호 :")) {
      message = message.split(" (주문번호 :")[0]
    }
    return message
  }

  return (
    <div>
      <Input
        name="name"
        value={name}
        placeholder="이름 입력"
        allowClear={true}
        // prefix={!formik.values.userName || formik.errors.userName ? <ExclamationCircleFilled style={{color: "#FF5500"}} /> : <CheckCircleFilled  style={{color: "#00CCBB", fontWeight: "700"}} />}
        onChange={handleUserNameChagne}
        onBlur={handleBlur}
        prefix={
          checkUnipass ? (
            <CheckCircleFilled style={{ color: "#00CCBB", fontWeight: "700" }} />
          ) : (
            <ExclamationCircleFilled style={{ color: "#FF5500" }} />
          )
        }
      />
      <Input
        name="persEcm"
        value={persEcm}
        placeholder="통관번호 입력"
        allowClear={true}
        onChange={handleUserNameChagne}
        onBlur={handleBlur}
        prefix={
          checkUnipass ? (
            <CheckCircleFilled style={{ color: "#00CCBB", fontWeight: "700" }} />
          ) : (
            <ExclamationCircleFilled style={{ color: "#FF5500" }} />
          )
        }
      />
      <Input
        name="phone"
        value={phone}
        placeholder="핸드폰번호 입력"
        allowClear={true}
        onChange={handleUserNameChagne}
        prefix={
          phoneValid ? (
            <CheckCircleFilled style={{ color: "#00CCBB", fontWeight: "700" }} />
          ) : (
            <ExclamationCircleFilled style={{ color: "#FF5500" }} />
          )
        }
      />
      <div style={{ marginTop: "5px" }}>{GetShippingMessage(shipping_message)}</div>
    </div>
  )
}

const TaobaoOrderList = ({ index, taobaoOrder }) => {
  return (
    <TaobaoOrderWapper>
      <EnterIcon>
        <EnterOutlined />
      </EnterIcon>
      <TaobaoOrderContainer>
        <div style={{ display: "flex" }}>
          <div>{`오더번호: ${taobaoOrder.orderNumber}`}</div>
          {taobaoOrder.expressId && (
            <div style={{ marginLeft: "20px" }}>{`트래킹번호: ${taobaoOrder.expressId}`}</div>
          )}
        </div>
        {taobaoOrder.orders.map((item, index) => {
          return (
            <TaobaoIamgeAndContent key={index}>
              <Image width={74} height={74} src={item.thumbnail} />
              <div>
                <div>{item.productName}</div>
                <div>
                  {item.option.map((oItme, index) => {
                    return <div key={index}>{`${oItme.name}: ${oItme.value}`}</div>
                  })}
                </div>
              </div>
              <div>{item.quantity}</div>
              <div>{item.realPrice}</div>
            </TaobaoIamgeAndContent>
          )
        })}
      </TaobaoOrderContainer>
    </TaobaoOrderWapper>
  )
}

const TaobaoOrderWapper = styled.div`
  display: flex;
  & > :nth-child(1) {
    min-width: 50px;
    max-width: 50px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const EnterIcon = styled.div`
  transform: rotate(180deg);
  transform: rotateY(180deg);
  display: flex;
  justify-content: center;
  align-items: center;
`
const TaobaoOrderContainer = styled.div`
  background: rgba(255, 255, 0, 0.2);
  padding: 5px;
  padding-left: 15px;
  padding-right: 15px;
`
const TaobaoIamgeAndContent = styled.div`
  display: flex;
  margin-top: 20px;
  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 74px;
    max-width: 74px;
  }
  & > :nth-child(2) {
    width: 100%;
    margin-left: 15px;
  }
  & > :nth-child(3) {
    width: 20px;
    text-align: right;
  }
  & > :nth-child(4) {
    width: 50px;
    margin-left: 15px;
    text-align: right;
  }
`

const ProductName = styled.div`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`
