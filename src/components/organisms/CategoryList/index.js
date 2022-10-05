import React, { useState, useEffect } from "react"

import { SEARCH_CATEGORY } from "gql"
import { useQuery } from "@apollo/client"
import { TaobaoItemList } from "components"
import { List, Space, Button, Tooltip } from "antd"
import {
  CalendarOutlined,
  TaobaoCircleOutlined,
  CommentOutlined,
  StarOutlined,
  AccountBookOutlined,
  ShoppingCartOutlined,
  ExportOutlined
} from "@ant-design/icons"
import styled from "styled-components"
import moment from "moment"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
const url = require("url")
const path = require("path")

const { shell, remote } = window.require("electron")

const CategoryList = ({ categoryCode, research, isUnsold }) => {
  const [naverItem, setNaverItem] = useState(null)
  const [refetchItem, setRefetchItem] = useState(0)
  const location = useLocation()
  const query = queryString.parse(location.search)
  const { error, data, refetch, networkStatus } = useQuery(SEARCH_CATEGORY, {
    variables: {
      categoryID: categoryCode.toString()
    },
    notifyOnNetworkStatusChange: true
  })

  const isDev = query && query.isDev === "true" ? true : false

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [research])

  if (error) {
    return <div>{error.message}</div>
  }

  const handleNaverItem = item => {
    setNaverItem(item)
    setRefetchItem(refetchItem + 1)
  }
  const handleNewWindow = item => {
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
    win.setTitle(item.productName)
    if (isDev) {
      win.loadURL(
        `http://localhost:3001#/taobaoItemList?isDev=${isDev}&id=${
          item.id
        }&imageUrl=${encodeURIComponent(item.imageUrl)}&keyword=${item.keyword}&price=${
          item.price
        }&mallName=${item.mallName}&crUrl=${item.crUrl}&productName=${
          item.productName
        }&categoryCode=${categoryCode}`
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
        hash: `/taobaoItemList?isDev=${isDev}&id=${item.id}&imageUrl=${encodeURIComponent(
          item.imageUrl
        )}&keyword=${item.keyword}&price=${item.price}&mallName=${item.mallName}&crUrl=${
          item.crUrl
        }&productName=${item.productName}&categoryCode=${categoryCode}`,
        protocol: "file:",
        slashes: true
      })
      win.loadURL(startUrl)
    }
  }

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  )

  let result = []
  if (data && isUnsold) {
    result = data.searchCategory
  } else if (data && !isUnsold) {
    result = data.searchCategory.filter(
      item => !(item.reviewCount === "0" && item.purchaseCnt === "0")
    )
  }

  return (
    <Container>
      <ListContainer>
        <List
          itemLayout="vertical"
          size="large"
          loading={networkStatus === 1 || networkStatus === 4}
          pagination={{
            onChange: page => {
              console.log(page)
            },
            pageSize: 20
          }}
          dataSource={result}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Tooltip title="리뷰건수" key={item.id}>
                  <span>
                    <IconText
                      icon={CommentOutlined}
                      text={Number(item.reviewCount).toLocaleString("ko")}
                      key="list-vertical-star-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="구매건수" key={item.id}>
                  <span>
                    <IconText
                      icon={StarOutlined}
                      text={Number(item.purchaseCnt).toLocaleString("ko")}
                      key="list-vertical-star-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="판매가" key={item.id}>
                  <span>
                    <IconText
                      icon={AccountBookOutlined}
                      text={Number(item.lowPrice).toLocaleString("ko")}
                      key="list-vertical-price-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="배송비" key={item.id}>
                  <span>
                    <IconText
                      icon={ShoppingCartOutlined}
                      text={Number(item.dlvry).toLocaleString("ko")}
                      key="list-vertical-dlvry"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="최종 판매가" key={item.id}>
                  <span>
                    <TotalPrice>{Number(item.price).toLocaleString("ko")}</TotalPrice>
                  </span>
                </Tooltip>
              ]}
              extra={
                <ExtraContainer>
                  <ImageContainer onClick={() => handleNaverItem(item)}>
                    <img width={160} height={160} alt={item.productName} src={item.imageUrl} />
                    {item.registered && <OverlayText>등록됨</OverlayText>}
                  </ImageContainer>

                  <ButtonContent>
                    <Button
                      block={true}
                      type="primary"
                      icon={<TaobaoCircleOutlined />}
                      onClick={() => handleNaverItem(item)}
                    >
                      타오바오에서 찾기
                    </Button>
                    <Tooltip title="새창에서 찾기" key={item.id}>
                      <NewWindowIcon onClick={() => handleNewWindow(item)}>
                        <ExportOutlined style={{ marginRight: "0" }} />
                      </NewWindowIcon>
                    </Tooltip>
                  </ButtonContent>
                </ExtraContainer>
              }
            >
              <List.Item.Meta
                avatar={<Logo src={item.logo} onerror="this.style.display='none';" />}
                title={
                  <Tooltip title="쇼핑몰" key={item.id}>
                    <ItemTitleLink onClick={() => shell.openExternal(item.crUrl)}>
                      {item.mallName && item.mallName.length > 0 ? (
                        item.mallName
                      ) : (
                        <LowPriceConfirm>가격비교 -> 최저가 확인 필요</LowPriceConfirm>
                      )}
                    </ItemTitleLink>
                  </Tooltip>
                }
                description={
                  <Tooltip title="상품명" key={item.id}>
                    {item.productName}
                  </Tooltip>
                }
              />

              <TaobaoItmeSearchContainer>
                <Tooltip title="등록일" key={item.id}>
                  <Space>
                    <CalendarOutlined />
                    <OpenDate>
                      {moment(item.openDate, "YYYYMMDDhhmmss").format("YYYY.MM.DD")}
                    </OpenDate>
                    <OpenTime>{moment(item.openDate, "YYYYMMDDhhmmss").format("hh:mm")}</OpenTime>
                  </Space>
                </Tooltip>
              </TaobaoItmeSearchContainer>
            </List.Item>
          )}
        />
      </ListContainer>
      <TaobaoItmeContainer>
        <TaobaoItemList {...naverItem} categoryCode={categoryCode} refetchItem={refetchItem} />
      </TaobaoItmeContainer>
    </Container>
  )
}

export default CategoryList

const Container = styled.div`
  box-sizing: border-box;
  display: flex;

  & > :nth-child(1) {
    width: 50%;
    padding-left: 30px;
    padding-right: 30px;
  }
  & > :nth-child(2) {
    width: 50%;
  }
`

const ListContainer = styled(SimpleBar)`
  padding-top: 20px;
  padding-bottom: 20px;
  height: calc(100vh - 210px);
  overflow-y: auto;
`

const TotalPrice = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: ${props => props.theme.primaryDark};
`

const ExtraContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
`
const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${props => `2px solid ${props.theme.primaryDark}`};
  margin-bottom: 10px;
  border-radius: 5px;
  overflow: hidden;
`

const OverlayText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 0, 0, 0.5); /* Black see-through */
  width: 100%;
  color: white;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

const OpenDate = styled.div`
  margin-right: 4px;
  text-align: center;
  color: #444444;
  font-weight: 700;
`

const OpenTime = styled.div`
  text-align: center;
  color: #444444;
`

const TaobaoItmeSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 30px;
`
const TaobaoItmeContainer = styled.div`
  box-sizing: border-box;
  border-left: ${props => `2px solid ${props.theme.primaryDark}`};
  margin-left: 20px;
  margin-right: 20px;
`

const ItemTitleLink = styled.div`
  display: inline;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

const Logo = styled.img`
  min-width: 30px;
  max-width: 30px;
  min-height: 30px;
  max-height: 30px;
  border-radius: 50%;
`

const LowPriceConfirm = styled.div`
  color: #ff545c;
`

const ButtonContent = styled.div`
  display: flex;
  align-items: center;
  min-width: 160px;
  max-width: 160px;
`
const NewWindowIcon = styled.div`
  margin-left: 5px;
  min-width: 30px;
  max-width: 30px;
  min-height: 30px;
  max-height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;

  /* padding: 10px; */
  cursor: pointer;
  border-radius: 50%;

  &:hover {
    background: ${props => props.theme.primaryLight};
    box-shadow: 0 0 0.1em, 0 0 0.3em;
  }
`
