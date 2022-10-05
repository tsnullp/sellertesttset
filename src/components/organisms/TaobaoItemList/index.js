import React, { useState, useEffect } from "react"
import { SEARCH_TAOBAO_IMAGE, SEARCH_TAOBAO_KEYWORD } from "gql"
import { useQuery } from "@apollo/client"
import { List, InputNumber, Button } from "antd"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { TaobaoOutlined, SelectOutlined } from "@ant-design/icons"
import { FindLowPrice } from "components"
import { ShopOutlined, AimOutlined, StarOutlined } from "@ant-design/icons"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const url = require("url")
const path = require("path")
const { shell, remote } = window.require("electron")

const TaobaoItemList = props => {
  const location = useLocation()
  const query = queryString.parse(location.search)
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 })

  const {
    type = "image",
    best = "false",
    id,
    imageUrl,
    keyword,
    price,
    mallName,
    crUrl,
    productName,
    categoryCode,
    refetchItem = 0
  } = props

  const updateTitle = () => {
    const htmlTitle = document.querySelector("title")
    htmlTitle.innerHTML = productName
  }
  useEffect(updateTitle, [productName])

  const isDev = query && query.isDev === "true" ? true : false
  const newWindow = query && query.newWindow === "true" ? true : false
  let productUrl = query && query.productUrl ? query.productUrl : encodeURIComponent(crUrl)
  let profitValue = isNaN(Number(localStorage.getItem("profit")))
    ? 40
    : Number(localStorage.getItem("profit"))
  let feesValue = isNaN(Number(localStorage.getItem("fees")))
    ? 11
    : Number(localStorage.getItem("fees"))
  let discountValue = isNaN(Number(localStorage.getItem("discount")))
    ? 10
    : Number(localStorage.getItem("discount"))
  let shippingValue = isNaN(Number(localStorage.getItem("shipping")))
    ? 7000
    : Number(localStorage.getItem("shipping"))
  let exchangeValue = isNaN(Number(localStorage.getItem("exchange")))
    ? 175
    : Number(localStorage.getItem("exchange"))

  const [exchangeRate, setExchangeRate] = useState(exchangeValue)
  const [profit, setProfit] = useState(profitValue)
  const [discount, setDiscount] = useState(discountValue)
  const [fees, setFees] = useState(feesValue)
  const [shippingFee, setShippingFee] = useState(shippingValue)

  let QUERY_STRING = SEARCH_TAOBAO_IMAGE

  const variables = {}
  if (type === "image") {
    QUERY_STRING = SEARCH_TAOBAO_IMAGE
    variables.imageUrl = imageUrl
  } else if (type === "keyword") {
    QUERY_STRING = SEARCH_TAOBAO_KEYWORD
    variables.keyword = keyword
  }

  const { loading, error, data } = useQuery(QUERY_STRING, {
    variables
    // etchPolicy: "cache-and-network"
  })

  useEffect(() => {
    // refetch()
    setWindowPosition({ x: 0, y: 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refetchItem])

  const handleNewWindow = (detail, crUrl) => {
    let detailUrl = detail
    if (type === "image") {
      detailUrl = encodeURIComponent(detail)
    } else if (type === "keyword") {
      detailUrl = encodeURIComponent(detail)
    }

    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      x: windowPosition.x,
      y: windowPosition.y,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false
      }
    })
    win.setAutoHideMenuBar(true)

    // // win.loadURL(`http://localhost:3001#/productUploadWindow/${encodeURIComponent(detail)}`)
    // win.loadURL(
    //   isDev
    //     ? `http://localhost:3001#/productUploadWindow/${encodeURIComponent(
    //         detail
    //       )}?productName=${productName}&naverID=${id}`
    //     : `file://${__dirname}/app.html#/productUploadWindow/${encodeURIComponent(
    //         detail
    //       )}?productName=${productName}&naverID=${id}`
    // )

    if (isDev) {
      win.loadURL(
        `http://localhost:3001#/productUploadWindow/?detailUrl=${encodeURIComponent(
          detailUrl
        )}&productName=${productName}&naverID=${id}&naverCategoryCode=${categoryCode}&productUrl=${productUrl}`
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
        hash: `/productUploadWindow?detailUrl=${encodeURIComponent(
          detailUrl
        )}&productName=${productName}&naverID=${id}&naverCategoryCode=${categoryCode}&productUrl=${productUrl}`,
        protocol: "file:",
        slashes: true
      })
      console.log("startUrl", startUrl)
      win.loadURL(startUrl)

      // win.loadURL(`file:///C:/Program%20Files/smartseller/resources/app/build/index.html#/productUpdatedWindow/${data._id}`);
    }

    const [x, y] = win.getPosition()
    setWindowPosition({ x: x + 100, y: y + 50 })
  }

  const costAccounting = fee => {
    // 1. '타오바바' 결제수수료 3% 추가
    let cost = fee * 1.03
    // 2. '카드사별 브랜드 수수료' 1% 추가 ( ex . 마스터카드 )
    cost = cost * 1.01
    // 3. '전신환매도율' 적용 하여  기준환율  x1% ( 대략 ) 적용
    let exRate = exchangeRate * 1.01
    // 4. 최종금액에 '카드사 해외이용 수수료 0.25% ' 추가
    cost = cost * exRate * 1.025

    return (
      <div>
        {`${(
          Math.ceil(
            (cost + shippingFee) *
              ((Number(profit) - Number(discount) + Number(fees)) / 100 + 1) *
              0.1
          ) * 10
        ).toLocaleString("ko")}`}
        <span>{`(${Math.ceil(cost + shippingFee).toLocaleString("ko")})`}</span>
      </div>
    )
  }

  const handleExchangeChange = value => {
    setExchangeRate(value)
  }
  const handleProfitChange = value => {
    setProfit(value)
  }
  const handleDiscounthange = value => {
    setDiscount(value)
  }
  const handleFeesthange = value => {
    setFees(value)
  }
  const handelShippinChainge = value => {
    setShippingFee(value)
  }
  if (error) {
    return <div>{error.message}</div>
  }

  let result = []
  if (type === "image") {
    result = data && data.searchTaobaoImage ? data.searchTaobaoImage : []
  } else if (type === "keyword") {
    result = data && data.searchTaobaoKeyword ? data.searchTaobaoKeyword : []
  }

  return (
    <Container>
      <TopItemContainer>
        {imageUrl && <NaverImage src={imageUrl} alt={imageUrl}></NaverImage>}
        <TopRightContainer>
          <InputContainer>
            <InputNumerContainer>
              <Label>환율: </Label>
              <InputNumber
                defaultValue={exchangeRate}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                step={10}
                onChange={handleExchangeChange}
              />
            </InputNumerContainer>
            <InputNumerContainer>
              <Label>마진율: </Label>
              <InputNumber
                defaultValue={profit}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                step={5}
                onChange={handleProfitChange}
              />
            </InputNumerContainer>
          </InputContainer>
          <InputContainer>
            <InputNumerContainer>
              <Label>할인율: </Label>
              <InputNumber
                defaultValue={discount}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                step={5}
                onChange={handleDiscounthange}
              />
            </InputNumerContainer>
            <InputNumerContainer>
              <Label>수수료: </Label>
              <InputNumber
                defaultValue={fees}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                step={5}
                onChange={handleFeesthange}
              />
            </InputNumerContainer>
          </InputContainer>
          <InputContainer>
            <InputNumerContainer>
              <Label>배송비: </Label>
              <InputNumber
                defaultValue={shippingFee}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                step={100}
                onChange={handelShippinChainge}
              />
            </InputNumerContainer>
            {type === "image" && best === "false" && (
              <InputNumerContainer>
                <Label>가격: </Label>
                <FindLowPrice price={price} mallName={mallName} crUrl={crUrl} />
                {/* <LowPrice>{`\\ ${Number(price).toLocaleString("ko")}`}</LowPrice> */}
              </InputNumerContainer>
            )}
            {type === "image" && best === "true" && (
              <InputNumerContainer>
                <Label>가격: </Label>
                <LowPrice>{`\\ ${Number(price).toLocaleString("ko")}`}</LowPrice>
              </InputNumerContainer>
            )}
          </InputContainer>
        </TopRightContainer>
      </TopItemContainer>

      <ListContainer newWindow={newWindow}>
        <List
          loading={loading}
          dataSource={result}
          renderItem={item => (
            <ListItemContainer>
              <ImageContainer>
                <ThumbnailImage src={`${item.image}_120x120.jpg`}></ThumbnailImage>
                {item.registered && <OverlayText>등록됨</OverlayText>}
              </ImageContainer>
              {/* <TaobaoThumbnail
                costAccounting={costAccounting}
                price={item.price}
                detail={item.detail}
                images={[item.image, ...item.detailItem.imgs]}
                option={item.detailItem.option}
              ></TaobaoThumbnail> */}
              <ContentContainer>
                <div>
                  <CostContainer>
                    <Pirce>
                      <span>¥</span>
                      {item.price}
                    </Pirce>
                    <div>
                      <span style={{ marginRight: "5px" }}>
                        <StarOutlined />
                      </span>
                      {item.dealCnt}
                    </div>
                  </CostContainer>
                  <ShopLocation>
                    <div>
                      <span style={{ marginRight: "5px" }}>
                        <ShopOutlined />
                      </span>
                      {item.shop}
                    </div>
                    <div>
                      <span style={{ marginRight: "5px" }}>
                        <AimOutlined />
                      </span>
                      {item.location}
                    </div>
                  </ShopLocation>
                  <FinalCostContainer>
                    <FinalCost>
                      <span>\</span>
                      {costAccounting(item.price)}
                    </FinalCost>
                  </FinalCostContainer>
                </div>
                <ActionContainer>
                  <Button icon={<TaobaoOutlined />} onClick={() => shell.openExternal(item.detail)}>
                    TAOBAO
                  </Button>
                  <Button
                    icon={<SelectOutlined />}
                    type="primary"
                    onClick={() => handleNewWindow(item.detail, item.crUrl)}
                  >
                    상품 올리기
                  </Button>
                </ActionContainer>
              </ContentContainer>
            </ListItemContainer>
          )}
        />
      </ListContainer>
    </Container>
  )
}

export default TaobaoItemList

const Container = styled.div`
  margin-left: 20px;
  margin-right: 20px;

  box-sizing: border-box;
`
const ListContainer = styled(SimpleBar)`
  padding-right: 20px;
  margin-top: 20px;
  height: calc(100vh - 360px);
  overflow-y: auto;
  box-sizing: border-box;
  ${ifProp(
    "newWindow",
    css`
      height: calc(100vh - 160px);
    `
  )};
`

const TopItemContainer = styled.div`
  padding-top: 10px;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border-bottom: ${props => `1px solid ${props.theme.primaryDark}`};
`

const TopRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const InputContainer = styled.div`
  display: flex;
  & > :nth-child(1) {
    margin-right: 20px;
  }
`

const NaverImage = styled.img`
  width: 100px;
  height: 100px;
  border: ${props => `2px solid ${props.theme.primaryDark}`};
  border-radius: 5px;
`

const ListItemContainer = styled.div`
  display: flex;
  margin-bottom: 40px;

  & > :nth-child(2) {
    width: 100%;
  }
`

const CostContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`

const ShopLocation = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: space-between;

  & > :nth-child(1) {
    font-size: 13px;
  }

  & > :nth-child(2) {
    font-size: 13px;
    color: ${props => props.theme.secondaryDark};
  }
`

const InputNumerContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  & > :nth-child(2) {
    width: 100%;
  }
`

const Label = styled.div`
  min-width: 50px;
  max-width: 50px;
  font-size: 14px;
  font-weight: 500;
  color: #121212;
`

const LowPrice = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #ff5000;
  text-align: center;
  span {
    font-size: 14px;
    font-weight: 500;
    color: #121212;
  }
`

const ImageContainer = styled.div`
  position: relative;
  margin-right: 20px;
  cursor: pointer;
  min-width: 160px;
  max-width: 160px;
  height: 160px;
  border: ${props => `2px solid ${props.theme.primaryDark}`};
  border-radius: 5px;
  overflow: hidden;
`

const ThumbnailImage = styled.img`
  width: 100%;
  height: 100%;
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

const Pirce = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #ff5000;
  span {
    font-weight: 500;
    font-size: 11px;
  }
`

const ActionContainer = styled.div`
  margin-top: 4px;
  display: flex;

  justify-content: space-between;
  align-items: center;

  margin-bottom: 10px;

  & > :nth-child(1) {
    margin-right: 5px;
  }
`

const FinalCostContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`

const FinalCost = styled.div`
  display: flex;
  align-items: flex-end;
  text-align: right;
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.primaryDark};
  span {
    font-weight: 500;
    font-size: 11px;
  }
  & > :nth-child(2) {
    margin-left: 3px;
    margin-right: 3px;
  }
`

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`
