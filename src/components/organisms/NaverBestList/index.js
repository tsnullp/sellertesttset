import React from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { useQuery } from "@apollo/client"
import { GET_NAVER_BEST } from "../../../gql"
import { Spin, Button } from "antd"
import { TaobaoCircleOutlined, ReloadOutlined } from "@ant-design/icons"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import smartStoreCategory from "../CategoryForm/category"

const url = require("url")
const path = require("path")
const { shell, remote } = window.require("electron")

const NaverBestList = () => {
  const { data, refetch, networkStatus } = useQuery(GET_NAVER_BEST, {
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
  
  if (data && data.GetNaverBest) {
    
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
          {data.GetNaverBest.map(item => (
            <NaverItem key={item.productID} {...item} />
          ))}
        </ListContainer>
      </>
    )
  }
  return null
}

export default NaverBestList

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
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
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

const NaverItem = ({
  mallNo,
  mallName,
  title,
  detail,
  price,
  shippingfee,
  image,
  productID,
  category1,
  category2,
  category3,
  category4,
  registered
}) => {
  const location = useLocation()
  const query = queryString.parse(location.search)
  const isDev = query && query.isDev === "true" ? true : false

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
        <ImageContainer>
          <Thumbnail src={image} alt={title} />
          <StoreName>{mallName}</StoreName>
          {registered && <OverlayText>등록됨</OverlayText>}
        </ImageContainer>

        <Category>{getCategory()}</Category>
        <Title onClick={() => shell.openExternal(detail)}>{title}</Title>
      </div>
      <div>
        <PriceContainer>
          <Price>{`${price}원`}</Price>
          <ShippingFee>{getShippingFee()}</ShippingFee>
        </PriceContainer>
        <TotalPriceContainer>
          <TotalPrice>{`${getTotlaPrice().toLocaleString("ko")}원`}</TotalPrice>
        </TotalPriceContainer>
        <Button
          block={true}
          type="primary"
          icon={<TaobaoCircleOutlined />}
          onClick={() => handleNewWindow()}
        >
          타오바오에서 찾기
        </Button>
      </div>
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  cursor: pointer;
  width: 200px;
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
  &:hover {
    border-color: #eee;
    box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.3);
  }
`

const ImageContainer = styled.div`
  position: relative;

  border: ${props => `2px solid ${props.theme.primaryDark}`};

  border-radius: 5px;
  overflow: hidden;
  width: 200px;
  height: 200px;
  margin: 0 auto;
`

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  transition: all ease 0.8s;
  &:hover {
    transform: scale(1.2);
  }
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
  margin-top: 5px;
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
  margin-top: 5px;
  font-size: 14px;
  line-height: 1.4;
  &:hover {
    text-decoration: underline;
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
  margin-top: 5px;
  margin-bottom: 5px;
`

const TotalPrice = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: #f24443;
`

const ShippingFee = styled.div`
  font-size: 13px;
`
