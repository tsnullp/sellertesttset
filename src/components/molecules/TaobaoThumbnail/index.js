import React, { useState } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { Button } from "antd"
import { TaobaoOutlined, SelectOutlined } from "@ant-design/icons"

const { shell, remote, isDev } = window

const TaobaoThumbnail = ({ costAccounting, price, detail, images, option }) => {
  const [index, setIndex] = useState(0)

  const bigImages = [...images, ...option.map(item => item.image)]

  const handleNewWindow = () => {
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      height: 600,
      width: 800,
      frame: true,
      webPreferences: {
        nodeIntegration: true
      }
    })    
    win.loadURL(
      isDev
        ? "http://localhost:3001#/productUploadWindow"
        : `file://${__dirname}/app.html#/productUploadWindow`
    )
  }

  return (
    <Container>
      <div>
        <Thumbanil src={`${bigImages[index]}_200x200.jpg`}></Thumbanil>
        <OtherImageContainer>
          {images.map((item, i) => (
            <OtherImage
              key={i}
              src={`${images[i]}_30x30.jpg`}
              isSelected={index === i}
              onClick={() => setIndex(i)}
            />
          ))}
        </OtherImageContainer>
      </div>
      <div>
        <OptionContainer>
          {option.length === 0 && (
            <OptionContent>
              <OptionImage
                src={`${bigImages[0]}_40x40.jpg`}
                isSelected={index === images.length}
                onClick={() => setIndex(images.length)}
              />
              <div>
                <OptionName>{""}</OptionName>
                <PriceAndStockConatiner>
                  <Pirce>
                    <span>¥</span>
                    {Number(price).toLocaleString("ko")}
                  </Pirce>
                  {/* <StockLabel>{""}</StockLabel> */}
                </PriceAndStockConatiner>
              </div>
              <FinalCost>
                <span>\</span>
                {costAccounting(price).toLocaleString("ko")}
              </FinalCost>
            </OptionContent>
          )}
          {option.map((item, i) => (
            <OptionContent key={i}>
              {item.image.length === 0 && <OptionNoneImage></OptionNoneImage>}
              {item.image.length > 0 && (
                <OptionImage
                  src={`${item.image}_40x40.jpg`}
                  isSelected={index === images.length + i}
                  onClick={() => setIndex(images.length + i)}
                />
              )}
              <div>
                <OptionName>{item.name}</OptionName>
                <PriceAndStockConatiner>
                  <Pirce>
                    <span>¥</span>
                    {Number(item.price).toLocaleString("ko")}
                  </Pirce>
                  {/* <StockLabel>{`재고: ${Number(item.stock).toLocaleString("ko")}`}</StockLabel> */}
                </PriceAndStockConatiner>
              </div>
              <FinalCost>
                <span>\</span>
                {costAccounting(item.price).toLocaleString("ko")}
              </FinalCost>
            </OptionContent>
          ))}
        </OptionContainer>

        <ActionContainer>
          <Button icon={<TaobaoOutlined />} onClick={() => shell.openExternal(detail)}>
            TAOBAO
          </Button>
          <Button icon={<SelectOutlined />} type="primary" onClick={handleNewWindow}>
            상품 올리기
          </Button>
        </ActionContainer>
      </div>
    </Container>
  )
}

export default TaobaoThumbnail

const Container = styled.div`
  padding: 10px;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  & > :nth-child(1) {
    margin-right: 20px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
  padding-bottom: 20px;
  border-bottom: ${props => `1px solid ${props.theme.borderColor}`};
`
const Thumbanil = styled.img`
  min-width: 200px;
  max-width: 200px;
  height: 200px;
  border: ${props => `1.5px solid ${props.theme.primaryDark}`};
`

const OtherImageContainer = styled.div`
  display: flex;

  & > :not(:last-child) {
    margin-right: 4px;
  }
`

const OtherImage = styled.img`
  cursor: pointer;
  width: 30px;
  height: 30px;
  border: ${props => `1px solid ${props.theme.borderColor}`};
  ${ifProp(
    "isSelected",
    css`
      border: ${props => `1px solid ${props.theme.primaryDark}`};
    `
  )};
`

const OptionContainer = styled.div`
  overflow-y: auto;
  height: 200px;
`
const OptionContent = styled.div`
  display: flex;

  align-items: center;
  & > :nth-child(2) {
    min-width: 100px;
    max-width: 100px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
  border-bottom: ${props => `1px solid ${props.theme.borderColor}`};
`

const OptionNoneImage = styled.img`
  margin-right: 10px;
  min-width: 35px;
  max-width: 35px;
  min-height: 35px;
  max-height: 35px;
  background: ${props => props.theme.borderColor};
  border: ${props => `1px solid ${props.theme.borderColor}`};
`
const OptionImage = styled.img`
  margin-right: 10px;
  cursor: pointer;
  width: 35px;
  height: 35px;
  border: ${props => `1px solid ${props.theme.borderColor}`};
  ${ifProp(
    "isSelected",
    css`
      border: ${props => `1px solid ${props.theme.primaryDark}`};
    `
  )};
`

const OptionName = styled.div`
  font-size: 10px;
  color: ${props => props.theme.borderColor};
  display: block;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const PriceAndStockConatiner = styled.div`
  display: flex;
  justify-content: space-between;
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

const FinalCost = styled.div`
  text-align: right;
  font-size: 20px;
  font-weight: 900;
  color: ${props => props.theme.primaryDark};
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
`
