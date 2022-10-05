import React, { useState } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { useQuery, useMutation } from "@apollo/client"
import { GET_NAVER_FLASH_ITEM, GET_VAVER_FLASH_DETAIL, SET_ISTAOBAO_ITEM } from "../../../gql"
import { Spin, Button, Tabs, Tooltip, Switch } from "antd"
import {
  TaobaoCircleOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined
} from "@ant-design/icons"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import smartStoreCategory from "../CategoryForm/category"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { TabPane } = Tabs
const url = require("url")
const path = require("path")
const { shell, remote } = window.require("electron")

let profit = isNaN(Number(localStorage.getItem("profit")))
  ? 40
  : Number(localStorage.getItem("profit"))
let fees = isNaN(Number(localStorage.getItem("fees"))) ? 11 : Number(localStorage.getItem("fees"))
let discount = isNaN(Number(localStorage.getItem("discount")))
  ? 10
  : Number(localStorage.getItem("discount"))
let shipping = isNaN(Number(localStorage.getItem("shipping")))
  ? 7000
  : Number(localStorage.getItem("shipping"))
let exchange = isNaN(Number(localStorage.getItem("exchange")))
  ? 175
  : Number(localStorage.getItem("exchange"))

const costAccounting = (fee, sale = false, original = false) => {
  // 1. '타오바바' 결제수수료 3% 추가

  let cost = fee * 1.03
  // 2. '카드사별 브랜드 수수료' 1% 추가 ( ex . 마스터카드 )
  cost = cost * 1.01
  // 3. '전신환매도율' 적용 하여  기준환율  x1% ( 대략 ) 적용
  let exRate = exchange * 1.01
  // 4. 최종금액에 '카드사 해외이용 수수료 0.25% ' 추가
  cost = cost * exRate * 1.025

  if (original) {
    return Math.ceil((cost + shipping) * 0.1) * 10
  }
  if (sale) {
    return (
      Math.ceil(
        (cost + shipping) * ((Number(profit) - Number(discount) + Number(fees)) / 100 + 1) * 0.1
      ) * 10
    )
  } else {
    return Math.ceil((cost + shipping) * ((Number(profit) + Number(fees)) / 100 + 1) * 0.1) * 10
  }
}

const NaverFlashList = () => {
  const { data, refetch, networkStatus } = useQuery(GET_NAVER_FLASH_ITEM, {
    // fetchPolicy: "cache-and-network"
    notifyOnNetworkStatusChange: true
  })

  const location = useLocation()
  const query = queryString.parse(location.search)

  const newWindow = query && query.newWindow === "true" ? true : false

  if (networkStatus === 1 || networkStatus === 2 || networkStatus === 4) {
    return (
      <Container newWindow={newWindow}>
        <Spin />
      </Container>
    )
  }

  if (data && data.GetNaverFlashItem) {
    console.log("data--", data)
    return (
      <>
        <RefleshContainer>
          <Button
            icon={<ReloadOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid"
            }}
            onClick={() => refetch()}
          />
        </RefleshContainer>
        <ListContainer newWindow={newWindow}>
          {data.GetNaverFlashItem.map((item, index) => (
            <ItemTabContainer key={item.productID}>
              <NaverItem {...item} index={index} />
              <TaobaoItemForm item={item} />
            </ItemTabContainer>
          ))}
        </ListContainer>
      </>
    )
  }
  return null
}

export default NaverFlashList

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 80px);
  ${ifProp(
    "newWindow",
    css`
      height: calc(100vh - 60px);
    `
  )};
`
const RefleshContainer = styled.div`
  margin-top: 10px;
  margin-right: 60px;
  display: flex;
  justify-content: flex-end;
`

const ListContainer = styled.div`
  padding: 40px;
  padding-top: 10px;
  height: calc(100vh - 80px - 60px);
  overflow: auto;
  ${ifProp(
    "newWindow",
    css`
      height: calc(100vh - 60px);
    `
  )};
`

const ItemTabContainer = styled.div`
  display: flex;
  min-height: 818px;
  & > :nth-child(1) {
    /* margin-top: 55px; */
  }
  & > :nth-child(2) {
    margin-left: 20px;
    width: 100%;
  }

  border-radius: 10px;
  border: ${props => `2px solid ${props.theme.primaryDark}`};
  border-right-width: 10px;
  border-bottom-width: 15px;
  padding: 20px;
  margin-bottom: 40px;
`
const NaverItem = ({
  _id,
  mallNo,
  mallName,
  title,
  detail,
  price,
  shippingfee,
  image,
  otherImage,
  productID,
  category1,
  category2,
  category3,
  category4,
  registered,
  index,
  isTaobao
}) => {
  const [isTaobaoItem] = useMutation(SET_ISTAOBAO_ITEM)
  const location = useLocation()
  const query = queryString.parse(location.search)
  const isDev = query && query.isDev === "true" ? true : false

  const onCheckChagne = async checked => {
    console.log("_id", _id)
    await isTaobaoItem({
      variables: {
        id: _id
      }
    })
  }
  const getSelectedCategoryCode = () => {
    const selectedItem = smartStoreCategory.filter(
      item =>
        item.대분류 === category1 &&
        category1 &&
        item.중분류 === category2 &&
        category2 &&
        item.소분류 === category3 &&
        category3 &&
        item.세분류 === category4 &&
        category4
    )
    if (selectedItem.length === 1) {
      return selectedItem[0]["카테고리코드"]
    } else {
      return null
    }
  }

  const getCategory = () => {
    let str = ""
    if (category1 && category1.length > 0) {
      str += category1
    }
    if (category2 && category2.length > 0) {
      str += ` > ${category2}`
    }
    if (category3 && category3.length > 0) {
      str += ` > ${category3}`
    }
    if (category4 && category4.length > 0) {
      str += ` > ${category4}`
    }
    return str
  }

  const getShippingFee = () => {
    if (!shippingfee || shippingfee.length === 0) {
      return "무료배송"
    } else {
      return `${shippingfee}원`
    }
  }
  const getTotlaPrice = () => {
    let _price = Number(price.replaceAll(",", ""))
    let _shippingfee = Number(shippingfee.replaceAll(",", ""))
    return _price + _shippingfee
  }

  const handleNewWindow = () => {
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 800,
      height: 1000,
      frame: true,

      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false
      }
    })

    win.setAutoHideMenuBar(true)
    win.setTitle(title)
    if (isDev) {
      win.loadURL(
        `http://localhost:3001#/taobaoItemList?isDev=${isDev}&id=${productID}&imageUrl=${encodeURIComponent(
          image
        )}&best=true&price=${getTotlaPrice()}&mallName=${mallName}&crUrl=${detail}&productName=${title}&categoryCode=${getSelectedCategoryCode()}&newWindow=true&productUrl=${encodeURIComponent(
          detail
        )}`
      )
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/taobaoItemList?isDev=${isDev}&id=${productID}&imageUrl=${encodeURIComponent(
          image
        )}&best=true&price=${getTotlaPrice()}&mallName=${mallName}&crUrl=${detail}&productName=${title}&categoryCode=${getSelectedCategoryCode()}&newWindow=true&productUrl=${encodeURIComponent(
          detail
        )}`,
        protocol: "file:",
        slashes: true
      })
      win.loadURL(startUrl)
    }
  }

  return (
    <ItemContainer>
      <div>
        <ShopLabel>{`# ${index + 1}`}</ShopLabel>
        <TotalPriceContainer>
          <TotalPrice>{`${getTotlaPrice().toLocaleString("ko")}원`}</TotalPrice>
        </TotalPriceContainer>
        <ImageContainer>
          <Thumbnail src={image} alt={title} />
          <StoreName>{mallName}</StoreName>
          {registered && <OverlayText>등록됨</OverlayText>}
        </ImageContainer>

        <Category>{getCategory()}</Category>
        <Title onClick={() => shell.openExternal(detail)}>{title}</Title>
        {otherImage && Array.isArray(otherImage) && (
          <OtherImageContainer>
            {otherImage
              .filter((_, i) => i > 0)
              .map((item, index) => (
                <OtherImage key={index} src={item} />
              ))}
          </OtherImageContainer>
        )}
      </div>
      <div>
        <PriceContainer>
          <Price>{`${price}원`}</Price>
          <ShippingFee>{getShippingFee()}</ShippingFee>
        </PriceContainer>

        <Button
          block={true}
          type="primary"
          icon={<TaobaoCircleOutlined />}
          onClick={() => handleNewWindow()}
        >
          타오바오에서 찾기
        </Button>
      </div>
      <div>
        타오바오 상품이 아니면 제외 시켜 주세요.
        <div>
          <Switch
            defaultChecked={isTaobao}
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            onChange={onCheckChagne}
          ></Switch>
        </div>
      </div>
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  cursor: pointer;
  width: 300px;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 20px;

  padding-left: 40px;
  padding-right: 40px;
  padding-top: 10px;
  padding-bottom: 30px;
  box-sizing: border-box;
`

const ImageContainer = styled.div`
  position: relative;

  border: ${props => `2px solid ${props.theme.primaryDark}`};
  border-bottom-width: 8px;
  border-right-width: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  overflow: hidden;
  width: 296px;
  height: 384px;
  margin: 0 auto;
`

const Thumbnail = styled.img`
  transition: all ease 0.8s;
  &:hover {
    transform: scale(1.2);
  }
  perspective: 100px;
  position: absolute;
  left: -100%;
  right: -100%;
  top: -100%;
  bottom: -100%;
  margin: auto;
  min-height: 100%;
  min-width: 100%;
`

const OverlayText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 0, 0, 0.5); /* Black see-through */
  z-index: 100;
  width: 100%;
  color: white;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

const Category = styled.div`
  margin-top: 8px;
  color: #444444;
  line-height: 1.2;
`

const StoreName = styled.span`
  position: absolute;
  top: 2px;
  left: 2px;
  color: #474747;
  background: #ffff6b;
  border: 1px solid #fdd835;
  border-radius: 2px;
  padding: 2px;
`
const Title = styled.div`
  cursor: pointer;
  margin-top: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  &:hover {
    text-decoration: underline;
  }
`

const OtherImageContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
`
const OtherImage = styled.img`
  border-radius: 5px;
  min-width: 90px;
  max-width: 90px;
  min-height: 90px;
  max-height: 90px;
  margin-right: 5px;
  margin-bottom: 5px;
  &:nth-child(3n) {
    margin-right: 0;
  }
`
const PriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
  margin-bottom: 5px;
`

const Price = styled.div`
  font-size: 13px;
`

const TotalPriceContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  margin-bottom: 20px;
`

const TotalPrice = styled.div`
  font-size: 24px;
  font-weight: 900;
  color: #f24443;
  font-style: italic;
`

const ShippingFee = styled.div`
  font-size: 13px;
`

const TaobaoItemForm = ({ item }) => {
  const [tabIndex, setTabIndex] = useState(0)
  const [isLoad, setLoad] = useState(false)

  const originalPrice =
    (Number(item.price.replaceAll(",", "")) || 0) +
    (Number(item.shippingfee.replaceAll(",", "")) || 0)

  const { data } = useQuery(GET_VAVER_FLASH_DETAIL, {
    variables: {
      itemID: item.taobaoItem[tabIndex].itemID,
      detail: item.taobaoItem[tabIndex].detail
    },
    onCompleted: data => {
      if (tabIndex + 1 === item.taobaoItem.length) {
        setLoad(true)
      }
      if (!isLoad) {
        if (data && data.GetNaverFlashDetail) {
          if (
            data.GetNaverFlashDetail.options.filter(item => item.active && !item.disabled)
              .length === 0
          ) {
            if (tabIndex + 1 < item.taobaoItem.length) {
              setTabIndex(tabIndex + 1)
            }
          }
        } else if (data) {
          if (tabIndex + 1 < item.taobaoItem.length) {
            setTabIndex(tabIndex + 1)
          }
        } else {
          setLoad(true)
        }
      }
    }
  })

  const handleChange = key => {
    setTabIndex(Number(key))
  }
  const location = useLocation()
  const query = queryString.parse(location.search)
  const isDev = query && query.isDev === "true" ? true : false

  const getSelectedCategoryCode = () => {
    const selectedItem = smartStoreCategory.filter(
      cItem =>
        cItem.대분류 === (item.category1 ? item.category1 : "") &&
        cItem.중분류 === (item.category2 ? item.category2 : "") &&
        cItem.소분류 === (item.category3 ? item.category3 : "") &&
        cItem.세분류 === (item.category4 ? item.category4 : "")
    )

    if (selectedItem.length === 1) {
      return selectedItem[0]["카테고리코드"]
    } else {
      return null
    }
  }

  const getCategoryName = () => {
    let categoryName = ""
    if (item.category1) {
      categoryName += item.category1
    }
    if (item.category2) {
      categoryName += "-" + item.category2
    }
    if (item.category3) {
      categoryName += "-" + item.category3
    }
    if (item.category4) {
      categoryName += "-" + item.category4
    }
    return categoryName
  }

  const handleNewWindow = detail => {
    //darwin

    let detailUrl = encodeURIComponent(detail)

    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false
      }
    })
    win.setAutoHideMenuBar(true)

    if (isDev) {
      win.loadURL(
        `http://localhost:3001#/productUploadWindow/?detailUrl=${encodeURIComponent(
          detailUrl
        )}&productName=${item.title}&naverID=${
          item.productID
        }&naverCategoryCode=${getSelectedCategoryCode()}&productUrl=${item.detail}`
      )
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }

      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/productUploadWindow?detailUrl=${encodeURIComponent(detailUrl)}&productName=${
          item.title
        }&naverID=${item.productID}&naverCategoryCode=${getSelectedCategoryCode()}&productUrl=${
          item.detail
        }`,
        protocol: "file:",
        slashes: true
      })

      win.loadURL(startUrl)

      // win.loadURL(`file:///C:/Program%20Files/smartseller/resources/app/build/index.html#/productUpdatedWindow/${data._id}`);
    }
  }

  const handleSavedNewWindow = () => {
    if (!data || !data.GetNaverFlashDetail) {
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
        webSecurity: false
      }
    })
    win.setAutoHideMenuBar(true)

    if (isDev) {
      win.loadURL(
        `http://localhost:3001#/savedProductUploadWindow/?_id=${
          data.GetNaverFlashDetail._id
        }&productName=${item.title}&naverID=${
          item.productID
        }&naverCategoryName=${getCategoryName()}&naverCategoryCode=${getSelectedCategoryCode()}&productUrl=${
          item.detail
        }`
      )
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }
      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        hash: `/savedProductUploadWindow?_id=${data.GetNaverFlashDetail._id}&productName=${
          item.title
        }&naverID=${
          item.productID
        }&naverCategoryName=${getCategoryName()}&naverCategoryCode=${getSelectedCategoryCode()}&productUrl=${
          item.detail
        }`,
        protocol: "file:",
        slashes: true
      })

      win.loadURL(startUrl)

      // win.loadURL(`file:///C:/Program%20Files/smartseller/resources/app/build/index.html#/productUpdatedWindow/${data._id}`);
    }
  }

  return (
    <Tabs
      type="card"
      defaultActiveKey={0}
      activeKey={tabIndex.toString()}
      onChange={handleChange}
      tabBarExtraContent={
        <Button
          style={{
            borderBottomWidth: "5px",
            borderBottomColor: "#FF3377",
            borderBottomStyle: "solid",
            borderRightWidth: "5px",
            borderRightColor: "#FF3377",
            borderRightStyle: "solid"
          }}
          size="large"
          type="primary"
          danger
          onClick={handleSavedNewWindow}
        >{`${tabIndex + 1}번 올리기`}</Button>
      }
      size="large"
    >
      {item.taobaoItem.map((tItem, index) => (
        <TabPane tab={`${index + 1}번`} key={index}>
          <TaobaoItemContainer>
            <CenterLabel>{`${
              data && data.GetNaverFlashDetail && data.GetNaverFlashDetail.korTitle
                ? data.GetNaverFlashDetail.korTitle
                : ""
            }`}</CenterLabel>
            <CenterLabel>{`<옵션 이미지 (${
              data && data.GetNaverFlashDetail && data.GetNaverFlashDetail.options
                ? data.GetNaverFlashDetail.options.filter(item => item.active && !item.disabled)
                    .length
                : 0
            }개)>`}</CenterLabel>
          </TaobaoItemContainer>
          <TaobaoItemContainer>
            <MainImageContainer>
              <Tooltip title="URL로 올리기">
                <MainImage
                  src={`${tItem.image}_200x200.jpg`}
                  onClick={() => handleNewWindow(item.taobaoItem[tabIndex].detail)}
                />
              </Tooltip>
              {data && data.GetNaverFlashDetail && data.GetNaverFlashDetail.registered && (
                <OverlayText>등록됨</OverlayText>
              )}

              {data &&
                data.GetNaverFlashDetail &&
                data.GetNaverFlashDetail.mainImages.map((mItem, index) => (
                  <SubImage key={index} src={`${mItem}_200x200.jpg`} />
                ))}
            </MainImageContainer>
            <OptionContainer>
              {data &&
                data.GetNaverFlashDetail &&
                data.GetNaverFlashDetail.options
                  .filter(item => item.active && !item.disabled)
                  .map((oItem, index) => {
                    let isLowPrice = false
                    const salePrice = Math.ceil(costAccounting(oItem.price, true) * 0.1) * 10

                    if (originalPrice > salePrice) {
                      isLowPrice = true
                    }
                    return (
                      <OptionImageContainer key={index}>
                        <OptionImageWrap>
                          <OptionImage src={`${oItem.image}_120x120.jpg`} />\
                        </OptionImageWrap>
                        <OptionContent>
                          <div>
                            <OptionName>{oItem.korValue}</OptionName>
                            <OptionPrice>{`¥ ${oItem.price.toLocaleString("ko")}`}</OptionPrice>
                          </div>
                          <OptionSalePrice isLowPrice={isLowPrice}>
                            {`${salePrice.toLocaleString("ko")}원`}
                          </OptionSalePrice>
                        </OptionContent>
                      </OptionImageContainer>
                    )
                  })}
            </OptionContainer>
          </TaobaoItemContainer>
        </TabPane>
      ))}
    </Tabs>
  )
}

const TaobaoItemContainer = styled.div`
  display: flex;
  box-sizing: border-box;
  & > :nth-child(n) {
    flex: 1;
  }
`

const MainImageContainer = styled.div`
  padding-top: 40px;
  position: relative;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;

  & > :nth-child(1n) {
    margin-right: 10px;
    margin-bottom: 10px;
    transition: all ease 0.8s;
    &:hover {
      transform: rotate(5deg);
    }
  }
  margin-right: 20px;
  padding-left: 20px;
  border-left: ${props => `2px dotted ${props.theme.primaryDark}`};
`

const MainImage = styled.img`
  perspective: 100px;
  cursor: pointer;
  width: 200px;
  height: 200px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
  &:hover {
    border: ${props => `1px solid ${props.theme.primaryDark}`};
  }
`

const SubImage = styled.img`
  perspective: 100px;
  width: 200px;
  height: 200px;
  border-radius: 10px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
  border: ${props => `1px dotted ${props.theme.primaryDark}`};
  &:nth-child(2n) {
    margin-top: -30px;
  }
`

const OptionContainer = styled(SimpleBar)`
  max-height: 620px;
  flex: 1;
  overflow-y: auto;
  padding-left: 40px;
  border-left: ${props => `2px dotted ${props.theme.primaryDark}`};
`
const OptionImageContainer = styled.div`
  margin-top: 5px;
  display: flex;
  margin-bottom: 5px;
`

const OptionImageWrap = styled.div`
  overflow: hidden;
  min-width: 120px;
  max-width: 120px;
  min-height: 120px;
  max-height: 120px;
`
const OptionImage = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
  border: ${props => `1px dotted ${props.theme.primaryDark}`};
  overflow: hidden;
  perspective: 100px;
  transition: all ease 0.8s;
  &:hover {
    transform: scale(1.1);
  }
`
const OptionContent = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  margin-right: 40px;
  overflow: hidden;
`
const OptionName = styled.div``

const OptionPrice = styled.div`
  font-size: 12px;
  color: ${props => props.theme.primaryDark};
`

const OptionSalePrice = styled.div`
  font-size: 22px;

  text-align: right;
  font-style: italic;
  margin-right: 10px;

  ${ifProp(
    "isLowPrice",
    css`
      font-weight: 900;
      color: #f24443;
    `
  )};
`

const CenterLabel = styled.div`
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  margin-top: 5px;
  margin-bottom: 10px;

  max-height: 20px;
  white-space: normal;

  word-wrap: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ShopLabel = styled.div`
  font-size: 18px;
  font-style: italic;
  font-weight: 700;
  margin-bottom: -20px;
  color: ${props => props.theme.font77};
`
