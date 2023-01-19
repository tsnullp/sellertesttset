import React, { useState, useEffect, useContext, useRef } from "react"
import {
  Table,
  Popconfirm,
  notification,
  Spin,
  Tooltip,
  Input,
  DatePicker,
  Image,
  Tag,
  BackTop,
  Button,
  Select,
  message,
  Switch,
} from "antd"
import {
  KeywordModal,
  TitleArrayComponent,
  MainImageModifyModal,
  DetailModifyModal,
  OptionModifyModal,
  UserSelect,

} from "components"
import styled from "styled-components"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_PRODUCT_LIST,
  DELETE_PRODUCT,
  DELETE_COUPANG,
  DELETE_CAFE24,
  MODIFY_PRODUCT_TITLE,
  GET_SHIPPINGPRICE,
  GET_USA_SHIPPINGPRICE,
  MODIFY_WEIGHT_PRICE,
  COUPANG_APPROVE,
  COUPANG_APPROVES,
  DELETE_SELECT_ROW,
} from "../../../gql"
import moment from "moment"
import { UserContext } from "context/UserContext"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import {
  ShoppingCartOutlined,
  DeleteTwoTone,
  QuestionCircleOutlined,
  TrophyFilled,
  ShoppingOutlined,
  CheckCircleTwoTone,
  CopyrightOutlined,
  EditTwoTone,
  CloseOutlined,
  CheckOutlined,
  EuroCircleOutlined,
} from "@ant-design/icons"
import url from "url"
import path from "path"
import "moment/locale/ko"

moment.locale("ko")
const { Option } = Select

const { shell, remote } = window.require("electron")

const { RangePicker } = DatePicker
const { Search } = Input

// const { remote, isDev } = window

const dateFormat = "YYYY-MM-DD"
const ProductList = () => {
  const { user } = useContext(UserContext)
  const location = useLocation()
  const query = queryString.parse(location.search)
  const [productList, setProductList] = useState([])
  const [isLoading, setLoading] = useState(null)
  const [listLoading, setListLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
  })
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [deleteProduct] = useMutation(DELETE_PRODUCT)
  const [deleteCoupang] = useMutation(DELETE_COUPANG)
  const [deleteCafe24] = useMutation(DELETE_CAFE24)
  const [coupangApprove] = useMutation(COUPANG_APPROVE)
  const [coupangApproves] = useMutation(COUPANG_APPROVES)
  const [deleteSelectRow] = useMutation(DELETE_SELECT_ROW)
  const [selectUser, setSelectUser] = useState(null)

  const [getShippingPrice] = useMutation(GET_SHIPPINGPRICE)
  const [getUSAShippingPrice] = useMutation(GET_USA_SHIPPINGPRICE)
  const [shippingPrice, SetShippingprice] = useState(200)
  const [usaShippingPrice, SetUSAShippingprice] = useState(200)

  const [selectedRow, setSelectedRow] = useState([])

  const [getProductList] = useMutation(GET_PRODUCT_LIST)

  const [notSales, setNotSales] = useState(false)

  // const { data, refetch, networkStatus } = useQuery(GET_PRODUCT_LIST, {
  //   variables: {
  //     page: pagination.current,
  //     perPage: pagination.pageSize,
  //     search,
  //     startDate,
  //     endDate,
  //     userID: selectUser
  //   },
  //   pollInterval: 60000,
  //   //fetchPolicy: "network-only",
  //   // fetchPolicy: "cache-and-network",
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data => {
  //     setPagination({
  //       ...pagination,
  //       total: data.ProductList.count
  //     })
  //   }
  // })

  useEffect(() => {
    try {
      setTimeout(async () => {
        const response = await getShippingPrice()
        console.log("response", response)
        const usaResponse = await getUSAShippingPrice()
        if (response.data.GetShippingPrice.length === 0) {
          message.error("추가금액과 배송비 설정이 되지 않았습니다.")
        }
        SetShippingprice(response.data.GetShippingPrice)
        SetUSAShippingprice(usaResponse.data.GetUSAShippingPrice)
      })
    } catch (e) {}
  }, [])

  const setMainImage = (_id, mainImage) => {
    setProductList(
      productList.map((item) => {
        if (item._id === _id) {
          item.mainImage = mainImage
        }
        return item
      })
    )
  }

  const isDev = query && query.isDev === "true" ? true : false

  useEffect(() => {
    // refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const confirmCoupang = async (data) => {
    setLoading(data._id)
    const response = await deleteCoupang({
      variables: {
        coupangID: data.coupang.productID,
      },
    })

    if (response.data.DeleteCoupang) {
      notification["success"]({
        message: "삭제하였습니다.",
      })
      // refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요.",
      })
    }
    setLoading(null)
  }
  const confirmCafe24 = async (data) => {
    setLoading(data._id)
    const response = await deleteCafe24({
      variables: {
        cafe24ID: data.cafe24.product_no,
        mallID: data.cafe24.mallID,
      },
    })

    if (response.data.DeleteCafe24) {
      notification["success"]({
        message: "삭제하였습니다.",
      })
      // refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요.",
      })
    }
    setLoading(null)
  }

  const confirmCoupangApprove = async (data) => {
    console.log("Dagta--->", data)

    const response = await coupangApprove({
      variables: {
        sellerProductId: data.productID,
      },
    })

    console.log("response", response)
    if (response.data.CoupangApprove) {
      notification["success"]({
        message: "승인요청하였습니다.",
      })
      // refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요.",
      })
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
    if (url.includes("iherb.com")) {
      return "https://s3.images-iherb.com/static/i/favicon-iherb/favicon.ico"
    }
    if (url.includes("aliexpress.com")) {
      return "https://ae01.alicdn.com/images/eng/wholesale/icon/aliexpress.ico"
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
    if (url.includes("iherb.com")) {
      return "iHerb"
    }
    if (url.includes("aliexpress.com")) {
      return "알리익스프레스"
    }
  }

  const columns = [
    {
      title: "등록",
      dataIndex: "user",
      width: "100px",
      render: (user) => {
        if (user) {
          return (
            <AvatarContainer>
              <Avatar src={user.avatar} />
              <NickName>{user.nickname}</NickName>
            </AvatarContainer>
          )
        } else {
          return null
        }
      },
    },
    {
      title: "이미지",
      dataIndex: "mainImage",

      render: (mainImage) => {
        let imageUrl = mainImage
        if (imageUrl && imageUrl.includes("alicdn.com")) {
          imageUrl = `${imageUrl}_150x150.jpg`
        } else if (imageUrl && imageUrl.includes("coupangcdn.com")) {
          imageUrl = imageUrl.replace(/492/gi, "150")
        }
        return (
          <ColumnContainer>
            <Image
              width={150}
              height={150}
              src={imageUrl}
              preview={{
                src: mainImage,
              }}
            />
          </ColumnContainer>
        )
      },
      width: "150px",
    },

    // {
    //   title: "카테고리",
    //   dataIndex: "",

    //   render: data => (
    //     <ColumnContainer>
    //       <>
    //         <Tooltip title="쿠팡" key={data._id}>
    //           <CategoryLabel>{data.coupang.displayCategoryName}</CategoryLabel>
    //         </Tooltip>
    //         {data.naverCategoryName && (
    //           <Tooltip title="네이버" key={data._id}>
    //             <CategoryLabel>{data.naverCategoryName}</CategoryLabel>
    //           </Tooltip>
    //         )}
    //       </>
    //     </ColumnContainer>
    //   ),
    //   width: "300px"
    // },
    {
      title: "상품명",
      dataIndex: "",

      render: (data) => {
        return (
          <ColumnContainer>
            <span>
              <Tag
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                }}
                icon={
                  <img
                    style={{ marginRight: "4px", width: "16px" }}
                    src={getMarketIcon(data.url)}
                    alt="taobao"
                  />
                }
                onClick={() => shell.openExternal(data.url)}
              >
                {getMarketName(data.url)}
              </Tag>
              {data.isWinner && (
                <Tooltip title="아이템위너 매칭">
                  <TrophyFilled
                    style={{
                      color: "#ffd700",
                      fontSize: "18px",
                      marginLeft: "-1px",
                      marginRight: "4px",
                    }}
                  />
                </Tooltip>
              )}
              {data.isNaver && (
                <Tooltip title="네이버 쇼핑">
                  <ShoppingOutlined
                    style={{
                      color: "#20C73D",
                      fontSize: "18px",
                      marginLeft: "-1px",
                      marginRight: "4px",
                    }}
                  />
                </Tooltip>
              )}
              {data.isSoEasy && (
                <Tooltip title="소이지">
                  <EuroCircleOutlined
                    style={{
                      color: "#FF5500",
                      fontSize: "18px",
                      marginLeft: "-1px",
                      marginRight: "4px",
                    }}
                  />
                </Tooltip>
              )}
              {data.isCoupang && (
                <Tooltip title="쿠팡 상점">
                  <CopyrightOutlined
                    style={{
                      color: "#530402",
                      fontSize: "18px",
                      marginLeft: "-1px",
                      marginRight: "4px",
                    }}
                  />
                </Tooltip>
              )}
            </span>
            <TitleArrayForm
              korTitle={data.korTitle}
              handleNewWindow={handleNewWindow}
              data={data}
              selectUser={selectUser}
            />
          </ColumnContainer>
        )
      },
    },

    {
      title: "판매가",
      width: 130,
      render: ({ _id, url, weight, weightPrice, options, coupang, cafe24 }) => {
        // console.log("url--->", url)
        // console.log("weight--->", weight)
        // console.log("weightPrice--->", weightPrice)
        if (options.length > 0) {
          let minPrice = options.filter((item) => item.salePrice !== null)[0]
            ? options.filter((item) => item.salePrice !== null)[0].salePrice
            : 0
          let maxPrice = options.filter((item) => item.salePrice !== null)[0]
            ? options.filter((item) => item.salePrice !== null)[0].salePrice
            : 0
          options
            .filter((item) => item.salePrice !== null)
            .forEach((item) => {
              if (item.salePrice < minPrice) {
                minPrice = item.salePrice
              }
              if (item.salePrice > maxPrice) {
                maxPrice = item.salePrice
              }
            })

          if (minPrice === maxPrice) {
            return (
              <>
                <WeightPriceForm
                  _id={_id}
                  isUSA={getMarketName(url) === "아마존"}
                  weight={weight}
                  weightPrice={weightPrice}
                  shippingPrice={shippingPrice}
                  usaShippingPrice={usaShippingPrice}
                  selectUser={selectUser}
                  status={coupang.status}
                  onlyCafe24={!coupang.productID && cafe24.product_no ? true : false}
                />
                <PriceLabel>{`${minPrice.toLocaleString("ko")}원`}</PriceLabel>
                <MainImageForm _id={_id} setRootMainImage={setMainImage} user={selectUser} />
                <DetailForm _id={_id} user={selectUser} />
                {/* {options[0].propPath && <OptionForm _id={_id} user={selectUser}/>} */}
              </>
            )
          } else {
            return (
              <>
                <WeightPriceForm
                  _id={_id}
                  isUSA={getMarketName(url) === "아마존"}
                  weight={weight}
                  weightPrice={weightPrice}
                  shippingPrice={shippingPrice}
                  usaShippingPrice={usaShippingPrice}
                  selectUser={selectUser}
                  status={coupang.status}
                  onlyCafe24={!coupang.productID && cafe24.product_no ? true : false}
                />
                <PriceLabel>{`${minPrice.toLocaleString("ko")}~${maxPrice.toLocaleString(
                  "ko"
                )}원`}</PriceLabel>

                <MainImageForm _id={_id} setRootMainImage={setMainImage} user={selectUser} />
                <DetailForm _id={_id} user={selectUser} />
                {/* {options[0].propPath && <OptionForm _id={_id} user={selectUser}/>} */}
              </>
            )
          }
        }

        // const temp = options.filter(item => item.active && !item.disabled && item.base)
        // let salePrice = 0
        // if (temp.length > 0) {
        //   salePrice = temp[0].salePrice || 0
        // } else {
        //   const temp = options.filter(item => item.active && !item.disabled)[0]
        //   if (temp && temp.salePrice) {
        //     salePrice = temp.salePrice || 0
        //   }
        // }
        // return <ColumnContainer>{salePrice.toLocaleString("ko")}</ColumnContainer>
      },
    },
    {
      title: "마켓",
      width: 20,
      dataIndex: "",
      render: (data) => {
        const marketIcon = []
        if (data.coupang.productID) {
          marketIcon.push(
            <Tooltip title={data.coupang.productID}>
              <Tag
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px",
                }}
                icon={
                  <img
                    width="16px"
                    src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                    alt="coupang"
                  />
                }
                onClick={() => {
                  if (data.options.length > 0) {
                    shell.openExternal(
                      `https://www.coupang.com/vp/products/2071034509?vendorItemId=${data.options[0].coupang_vendorItemId}`
                    )
                  }
                }}
              ></Tag>
            </Tooltip>
          )
        }
        if (data.cafe24.product_no) {
          marketIcon.push(
            <Tooltip title={data.cafe24.product_no}>
              <Tag
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "3px",
                }}
                icon={
                  <img
                    width="16px"
                    src="https://www.cafe24.com/wp-content/themes/cafe24/images/favicon.ico"
                    alt="coupang"
                  />
                }
                onClick={() => {
                  if (data.cafe24 && data.cafe24.mallID) {
                    shell.openExternal(
                      `http://tsnullp.cafe24.com/disp/admin/product/ProductRegister?product_no=${data.cafe24.product_no}`
                    )
                  }
                }}
              ></Tag>
            </Tooltip>
          )
        }
        return <ColumnContainer>{marketIcon}</ColumnContainer>
      },
    },
    {
      title: "상태",
      dataIndex: "coupang",

      render: (coupang) => {
        if (!coupang.status || coupang.status.length === 0) {
          return null
        }
        switch (coupang.status) {
          case "임시저장":
            return (
              <ColumnContainer>
                <Popconfirm
                  title="쿠팡 상품을 승인요청 하시겠습니까？"
                  icon={<QuestionCircleOutlined style={{ color: "blue" }} />}
                  cancelText="취소"
                  okText="승인"
                  onConfirm={() => confirmCoupangApprove(coupang)}
                >
                  <Tag
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "3px",
                    }}
                    icon={
                      <img
                        style={{ marginRight: "3px" }}
                        width="16px"
                        src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                        alt="coupang"
                      />
                    }
                  >
                    {coupang.status}
                  </Tag>
                </Popconfirm>
              </ColumnContainer>
            )
          case "승인완료":
            return (
              <ColumnContainer>
                <Tag
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px",
                  }}
                  color="blue"
                  icon={
                    <img
                      style={{ marginRight: "3px" }}
                      width="16px"
                      src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                      alt="coupang"
                    />
                  }
                >
                  {coupang.status}
                </Tag>
              </ColumnContainer>
            )
          case "승인반려":
            return (
              <ColumnContainer>
                <Tag
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px",
                  }}
                  color="magenta"
                  icon={
                    <img
                      style={{ marginRight: "3px" }}
                      width="16px"
                      src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                      alt="coupang"
                    />
                  }
                >
                  {coupang.status}
                </Tag>
              </ColumnContainer>
            )
          default:
            return (
              <ColumnContainer>
                <Tag
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "3px",
                  }}
                  icon={
                    <img
                      style={{ marginRight: "3px" }}
                      width="16px"
                      src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                      alt="coupang"
                    />
                  }
                >
                  {coupang.status}
                </Tag>
              </ColumnContainer>
            )
        }
      },
      width: "120px",
    },
    {
      title: "등록일",
      dataIndex: "createdAt",

      render: (createdAt) => (
        <ColumnContainer>
          <div>
            <div>{moment(Number(createdAt)).format("YYYY-MM-DD")}</div>
            <div>{moment(Number(createdAt)).format("HH:mm:ss")}</div>
          </div>
        </ColumnContainer>
      ),
      width: "120px",
    },

    {
      title: "삭제",
      dataIndex: "",
      key: "x",
      render: (data) => {
        if (isLoading === data._id) {
          return <Spin />
        } else {
          return (
            <>
              {data.coupang.productID && (
                <div>
                  <Popconfirm
                    title="쿠팡 상품을 삭제하시겠습니까？"
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    cancelText="취소"
                    okText="삭제"
                    onConfirm={() => confirmCoupang(data)}
                  >
                    <ColumnContainer>
                      <Tag
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        icon={
                          <>
                            <img
                              width="16px"
                              src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                              alt="coupang"
                            />
                            <DeleteTwoTone
                              style={{ fontSize: "14px", color: "#FF3377", padding: "3px" }}
                            />
                          </>
                        }
                      ></Tag>
                    </ColumnContainer>
                  </Popconfirm>
                </div>
              )}
              {data.cafe24.product_no > 0 && (
                <div>
                  <Popconfirm
                    title="카페24 상품을 삭제하시겠습니까？"
                    icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                    cancelText="취소"
                    okText="삭제"
                    onConfirm={() => confirmCafe24(data)}
                  >
                    <ColumnContainer>
                      <Tag
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                        icon={
                          <>
                            <img
                              width="16px"
                              src="https://www.cafe24.com/wp-content/themes/cafe24/images/favicon.ico"
                              alt="coupang"
                            />
                            <DeleteTwoTone style={{ fontSize: "14px", padding: "3px" }} />
                          </>
                        }
                      ></Tag>
                    </ColumnContainer>
                  </Popconfirm>
                </div>
              )}
            </>
          )
        }
      },
    },
  ]

  const handleTableChange = (pagination, filters, sorter) => {
    // this.fetch({
    //   sortField: sorter.field,
    //   sortOrder: sorter.order,
    //   pagination,
    //   ...filters,
    // });
    // refetch({
    //   variables: {
    //     page: pagination.current,
    //     perPage: 10
    //   }
    // })
    console.log("pagination", pagination)
    setPagination(pagination)
    handleSearch({ page: pagination })
  }

  const handleNewWindow = (data) => {
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
    console.log("여기???????????????", isDev)
    win.setAutoHideMenuBar(true)
    // win.loadURL(`http://localhost:3001#/productUploadWindow/${encodeURIComponent(detail)}`)
    if (isDev) {
      console.log("444-", `http://localhost:3001#/productUpdatedWindow/${data._id}?update=true`)
      win.loadURL(`http://localhost:3001#/productUpdatedWindow/${data._id}?update=true`)
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
        hash: `/productUpdatedWindow/${data._id}?update=true`,
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

  const handleSearch = async ({ searchKey, page }) => {
    setListLoading(true)
    setProductList([])
    // setPagination({
    //   current: 1,
    //   pageSize: 10,
    //   total: 0
    // })

    try {
      const response = await getProductList({
        variables: {
          page: page && page.current ? page.current : pagination.current,
          perPage: page && page.pageSize ? page.pageSize : pagination.pageSize,
          search: searchKey !== null && searchKey !== undefined ? searchKey : search,
          startDate,
          endDate,
          userID: selectUser,
          notSales,
        },
      })
      console.log("response.data.ProductList", response.data.ProductList)
      const { count, list } = response.data.ProductList
      setProductList(list)
      setPagination({
        current: page ? page.current : pagination.current,
        pageSize: page ? page.pageSize : pagination.pageSize,
        total: count,
        showSizeChanger: true,
      })
    } catch (e) {
      console.log("error", e)
    } finally {
      setListLoading(false)
    }
  }

  const handleSelectChange = async (value) => {
    setSelectUser(value)
    
    const response = await getShippingPrice({
      variables: {
        userID: value
      }
    })
    const usaResponse = await getUSAShippingPrice({
      variables: {
        userID: value
      }
    })
    if (response.data.GetShippingPrice.length === 0) {
      message.error("추가금액과 배송비 설정이 되지 않았습니다.")
    }
    
    SetShippingprice(response.data.GetShippingPrice)
    SetUSAShippingprice(usaResponse.data.GetUSAShippingPrice)
  }

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

  const confirmSelectedItemDelete = async () => {
    console.log("selectedRow", selectedRow)

    const response = await deleteSelectRow({
      variables: {
        userID: selectUser,
        input: selectedRow.map((item) => {
          console.log("ITEMM-", item)
          return {
            _id: item._id,
            coupangID: item.coupang && item.coupang.productID ? item.coupang.productID : null,
            cafe24ID: item.cafe24 ? item.cafe24.product_no : null,
            mallID: item.cafe24 ? item.cafe24.mallID : null,
          }
        }),
      },
    })

    if (response.data.DelleteSelectedRowItem) {
      notification["success"]({
        message: (
          <>
            <div>삭제 요청하였습니다.</div>
            <div>잠시 후 새로고침하세요.</div>
          </>
        ),
      })
      // refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요.",
      })
    }
  }

  const confirmSelectedItemApprove = async () => {
    console.log("selectedRow", selectedRow)
    const productID = selectedRow.map((item) => item.coupang.productID)

    const response = await coupangApproves({
      variables: {
        sellerProductId: productID,
      },
    })

    console.log("response", response)
    if (response.data.CoupangApproves) {
      notification["success"]({
        message: "승인요청하였습니다.",
      })
      // refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요.",
      })
    }
  }
  return (
    <Container>
      <BackTop />
      <TopContainer>
        <TotalCountLabel>
          총<span>{` ${(pagination.total || 0).toLocaleString("ko")}`}</span>
          개의 상품이 검색되었습니다.
        </TotalCountLabel>
      </TopContainer>
      <SearchContainer>
        {user &&
          <UserSelect handleSelectChange={handleSelectChange} userID={user.id} />}
        {!notSales && (
          <RangePicker
            // locale={{ lang: { locale: "ko_KR" } }}
            // defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
            allowClear={true}
            allowEmpty={[true, true]}
            placeholder={["시작일", "종료일"]}
            size={"large"}
            format={dateFormat}
            // value={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
            onChange={(value) => {
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
        )}
        <SwitchContainer>
          <Switch checked={notSales} onChange={(checked) => setNotSales(checked)} />
          <div>미판매</div>
        </SwitchContainer>
        <Search
          loading={listLoading}
          allowClear={true}
          placeholder="제목 또는 상품코드를 입력하세요."
          size="large"
          onSearch={(value) => {
            setSearch(value)
            handleSearch({ searchKey: value })
          }}
          enterButton
        />

        <Popconfirm
          title="선택 상품을 삭제하시겠습니까？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          cancelText="취소"
          okText="삭제"
          onConfirm={() => confirmSelectedItemDelete()}
        >
          <Button
            size="large"
            style={{ marginLeft: "10px" }}
            icon={<DeleteTwoTone style={{ fontSize: "18px", padding: "3px" }} />}
          >
            선택 삭제
          </Button>
        </Popconfirm>
        <Popconfirm
          title="선택 상품을 승인요청하시겠습니까？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          cancelText="취소"
          okText="승인요청"
          onConfirm={() => confirmSelectedItemApprove()}
        >
          <Button
            size="large"
            style={{ marginLeft: "10px" }}
            icon={<CheckCircleTwoTone style={{ fontSize: "18px", padding: "3px" }} />}
          >
            승인 요청
          </Button>
        </Popconfirm>
      </SearchContainer>
      <Image.PreviewGroup>
        <Table
          rowSelection={{
            type: "checkbox",
            ...rowSelection,
          }}
          columns={columns}
          rowKey={(record) => record._id}
          dataSource={productList}
          // dataSource={data && data.ProductList ? data.ProductList.list : []}
          pagination={pagination}
          loading={listLoading}
          // loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
          onChange={handleTableChange}
          expandable={{
            rowExpandable: (record) => record.options.length > 0,
            expandedRowRender: (record) => {
              return (
                <>
                  <TableHeader>
                    <div>쿠팡 옵션ID</div>
                    <div>카페24 옵션ID</div>
                    <div>옵션명</div>
                    <div>재고</div>
                    <div>가격</div>
                    <div>장바구니</div>
                  </TableHeader>
                  {record.options.map((item) => {
                    return (
                      <TableBody key={item.key}>
                        <Link
                          onClick={() =>
                            shell.openExternal(
                              `https://www.coupang.com/vp/products/2071034509?vendorItemId=${item.coupang_vendorItemId}`
                            )
                          }
                        >
                          {item.coupang_vendorItemId}
                        </Link>
                        <div>{item.cafe24_variant_code}</div>
                        <div>{item.korValue}</div>
                        <div>{item.stock.toLocaleString("ko")}</div>
                        <div>{item.salePrice.toLocaleString("ko")}</div>
                        <ShoppingCartOutlined style={{ fontSize: "18px" }} />
                      </TableBody>
                    )
                  })}
                </>
              )
            },
          }}
        />
      </Image.PreviewGroup>
    </Container>
  )
}

export default ProductList

const TitleArrayForm = ({ korTitle, handleNewWindow, data, selectUser }) => {
  const [modifyTitle, setModifyTitle] = useState(korTitle)
  const [isModify, setModify] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectKeyword, SetSelectKeyword] = useState("")
  const [modifyProductTitle] = useMutation(MODIFY_PRODUCT_TITLE)
  const [isLoading, setLoading] = useState(false)
  const titleArrayRef = useRef()

  const showModal = () => {
    setModify(true)
    setIsModalVisible(true)
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false)
    SetSelectKeyword("")
    setModifyTitle(`${modifyTitle} ${selectKeyword.join(" ")}`)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    SetSelectKeyword("")
  }

  const handleModifyCancle = () => {
    setModify(false)
    setModifyTitle(korTitle)
  }

  const handleModifyTitle = async () => {
    console.log("id", data._id, modifyTitle)
    setLoading(true)
    const response = await modifyProductTitle({
      variables: {
        id: data._id,
        title: modifyTitle,
        userID: selectUser,
      },
    })
    if (response.data.ModifyProductTitle) {
      setModify(false)
      setModifyTitle(response.data.ModifyProductTitle)
      notification["success"]({
        message: (
          <>
            <div>{response.data.ModifyProductTitle}</div>
            <div>상품명을 변경하였습니다.</div>
          </>
        ),
      })
    }
    console.log("response", response)
    setLoading(false)
  }

  return (
    <>
      <KeywordModal
        isModalVisible={isModalVisible}
        handleOk={handleOk}
        handleCancel={handleCancel}
        title={korTitle}
        keyword={selectKeyword}
      />
      <TitleArrayComponent
        title={korTitle}
        titleArray={data.titleArray}
        SetSelectKeyword={SetSelectKeyword}
        showModal={showModal}
        ref={titleArrayRef}
      />

      {!isModify && (
        <TitleLabel>
          <div onClick={() => handleNewWindow(data)}>{korTitle}</div>
          <EditTwoTone
            style={{ fontSize: "14px", marginLeft: "10px", cursor: "pointer", marginTop: "6px" }}
            onClick={() => setModify(true)}
          />
        </TitleLabel>
      )}
      {isModify && (
        <InputContainer>
          <Input
            allowClear
            addonBefore="제목"
            value={modifyTitle}
            onChange={(e) => {
              setModifyTitle(e.target.value)
            }}
            // onBlur={e=>{
            //   setRootTitle(index, e.target.value)
            // }}
            border={false}
            style={{
              width: "100%",
              marginBottom: "6px",
              border: "3px solid #512da8",
            }}
          />
          <Button
            icon={<CloseOutlined />}
            style={{ margin: "5px" }}
            danger
            shape="circle"
            onClick={handleModifyCancle}
          />
          <Button
            icon={<CheckOutlined />}
            loading={isLoading}
            style={{ marginTop: "5px", marginBottom: "5px" }}
            type="primary"
            shape="circle"
            onClick={handleModifyTitle}
          />
        </InputContainer>
      )}
    </>
  )
}
const Container = styled.div`
  /* padding: 10px; */

  & > :nth-child(1) {
    margin-bottom: 10px;
  }
`

const TableHeader = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  height: 35px;

  & > :nth-child(n) {
    font-size: 13px;
    background: ${(props) => props.theme.HighlightColor1};
    color: ${(props) => props.theme.grayfaColor};
  }
  & > :nth-child(1) {
    width: 180px;
  }
  & > :nth-child(2) {
    width: 180px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
  & > :nth-child(4) {
    width: 120px;
  }
  & > :nth-child(5) {
    width: 120px;
  }
  & > :nth-child(6) {
    width: 120px;
  }
`

const TableBody = styled(TableHeader)`
  margin-top: 5px;
  height: 20px;

  & > :nth-child(n) {
    font-size: 12px;
    background: transparent;
    color: ${(props) => props.theme.fontDefault};
  }
  & > :nth-child(1) {
    font-size: 10px;
  }
  & > :nth-child(2) {
    font-size: 10px;
  }
  & > :nth-child(3) {
    text-align: left;
    margin-left: 20px;
    margin-right: 20px;
  }
  & > :nth-child(4) {
  }
  & > :nth-child(5) {
  }
`

const Link = styled.div`
  cursor: pointer;
  font-size: 10px;
  color: blueviolet !important;
  &:hover {
    text-decoration: underline;
  }
`

const TitleLabel = styled.div`
  cursor: pointer;
  margin-top: 5px;
  /* vertical-align: text-bottom; */
  font-weight: 700;
  &:hover {
    text-decoration: underline;
    color: blueviolet;
  }
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
`

const ColumnContainer = styled.div`
  cursor: pointer;
  display: block;
  width: 100%;
`

const PriceLabel = styled.div`
  margin-top: 5px;
  text-align: right;
  color: #a1a1a1;
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

const TopContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 10px;
`
const TotalCountLabel = styled.div`
  font-size: 14px;

  & > span {
    font-size: 18px;
    font-weight: 700;
    color: #ff545c;
  }
`

const AvatarContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  color: lightgray;
`

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  margin-right: 5px;
  background: white;
`

const NickName = styled.div`
  color: gray;
  font-size: 11px;
  margin-bottom: 2px;
`
const TitleTag = styled(Tag)`
  cursor: pointer;
  &:hover {
    font-weight: 700;
  }
`
const InputContainer = styled.div`
  margin-top: 10px;
  display: flex;
`
const WeightPriceForm = ({
  _id,
  isUSA,
  weight,
  weightPrice,
  shippingPrice,
  usaShippingPrice,
  selectUser,
  status,
  onlyCafe24,
}) => {
  const [modifyWeight] = useMutation(MODIFY_WEIGHT_PRICE)

  const handleChange = async (id, value) => {
    console.log(`selected ${id}, ${value}`)
    // setShppingPrice(index, value)\\
    const response = await modifyWeight({
      variables: {
        userID: selectUser,
        id,
        weight: value,
      },
    })
    if (response && response.data.ModifyWeightPrice) {
      notification["success"]({
        message: (
          <>
            <div>{response.data.ModifyWeightPrice}</div>
            <div>가격을 변경하였습니다.</div>
          </>
        ),
      })
    }
    console.log("response", response)
  }

  let disabled = status !== "승인완료"
  if (onlyCafe24) {
    disabled = false
  }

  if (weightPrice) {
    if (isUSA) {
      return (
        <Select
          disabled={disabled}
          bordered={false}
          defaultValue={`${weight}LB (${weightPrice.toLocaleString("ko")}원)`}
          style={{ width: 180, border: "3px solid #512da8" }}
          onChange={(value) => handleChange(_id, value)}
        >
          {Array.isArray(usaShippingPrice) &&
            usaShippingPrice.map((item, index) => (
              <Option value={item.title}>{`${item.title}LB (${Number(item.price).toLocaleString(
                "ko"
              )}원)`}</Option>
            ))}
        </Select>
      )
    } else {
      return (
        <Select
          disabled={disabled}
          bordered={false}
          defaultValue={`${weight}Kg (${weightPrice.toLocaleString("ko")}원)`}
          style={{ width: 180, border: "3px solid #512da8" }}
          onChange={(value) => handleChange(_id, value)}
        >
          {Array.isArray(shippingPrice) &&
            shippingPrice.map((item, index) => (
              <Option value={item.title}>{`${item.title}Kg (${Number(item.price).toLocaleString(
                "ko"
              )}원)`}</Option>
            ))}
        </Select>
      )
    }

    // return (
    //   <div>{`${data.weightPrice.toLocaleString("ko")}원 (${data.weight}KG)`}</div>
    // )
  } else {
    return null
  }
}

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 5px;
  & > :nth-child(2) {
    margin-left: 5px;
    width: 45px;
  }
`

const MainImageForm = ({ _id, setRootMainImage, user }) => {
  const [isMainImageModalVisible, setMainImageModalVisible] = useState(false)

  const handleOkMainImae = (value) => {
    setMainImageModalVisible(false)
    // setMainImaes(value)
    // setRootMainImage(index, productNo, value)
    setRootMainImage(_id, value)
  }

  const handleCancelMainImae = () => {
    setMainImageModalVisible(false)
  }

  return (
    <div>
      <Button onClick={() => setMainImageModalVisible(true)}>메인이미지</Button>
      {isMainImageModalVisible && (
        <MainImageModifyModal
          isModalVisible={isMainImageModalVisible}
          handleOk={handleOkMainImae}
          handleCancel={handleCancelMainImae}
          _id={_id}
          user={user}
          // mainImages={mainImages}
        />
      )}
    </div>
  )
}

const DetailForm = ({ _id, user }) => {
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)

  const handleOkDetail = (detailHtml) => {
    setDetailModalVisible(false)
  }

  const handleCancelDetail = () => {
    setDetailModalVisible(false)
  }

  return (
    <div>
      <Button onClick={() => setDetailModalVisible(true)}>상세페이지</Button>
      {isDetailModalVisible && (
        <DetailModifyModal
          isModalVisible={isDetailModalVisible}
          handleOk={handleOkDetail}
          handleCancel={handleCancelDetail}
          _id={_id}
          user={user}
        />
      )}
    </div>
  )
}

const OptionForm = ({ _id, user }) => {
  const [isOptionModalVisible, setOptionModalVisible] = useState(false)

  const handleOkOption = (option, prop) => {
    setOptionModalVisible(false)
  }

  const handleCancelOption = () => {
    setOptionModalVisible(false)
  }

  return (
    <div>
      <Button onClick={() => setOptionModalVisible(true)}>옵션</Button>
      {isOptionModalVisible && (
        <OptionModifyModal
          isModalVisible={isOptionModalVisible}
          handleOk={handleOkOption}
          handleCancel={handleCancelOption}
          _id={_id}
          user={user}
        />
      )}
    </div>
  )
}
