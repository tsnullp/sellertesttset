import React, { useState, useRef } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import {
  Input,
  Button,
  notification,
  Tooltip,
  message,
  Empty,
  Menu,
  Dropdown,
  Tag,
  Drawer,
  Checkbox,
  Image,
  Modal
} from "antd"
import {
  CommentOutlined,
  ShoppingCartOutlined,
  TaobaoCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  CopyrightOutlined,
  CheckOutlined,
  DoubleRightOutlined,
  DownOutlined,
  UpOutlined,
  QuestionCircleOutlined,
  ZoomInOutlined
} from "@ant-design/icons"
import { TAOBAO_IMAGE_LIST_URL, UPLOAD_ITEM_WINNER1 } from "../../../gql"
import { useMutation } from "@apollo/client"
import { isURL } from "../../../lib/userFunc"
import StartRatings from "react-star-ratings"

const { shell } = window.require("electron")

const ItemWinnerForm1 = ({ item, nextButtonClick, urlSearch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isLoading, setLoading] = useState(null)
  const [visibleReview, setVisibleReview] = useState(false)
  const [visibleInquire, setVisibleInquire] = useState(false)
  const [title, setTitle] = useState(
    item.vendorName ? item.title.replace(item.vendorName, "").trim() : item.title
  )
  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)
  const [selectedUrl, SetSelectedUrl] = useState(
    item.taobaoItems && item.taobaoItems.length > 0 ? item.taobaoItems[0].detail : ""
  )
  const [subPrice, setSubPrice] = useState(200)
  const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)
  const [uploadItem] = useMutation(UPLOAD_ITEM_WINNER1)
  const urlRef = useRef()

  const criteria = 4
  let dimensionArray2 = []
  dimensionArray2 = item.taobaoItems.reduce((array, number, index) => {
    const arrayIndex = Math.floor(index / criteria)
    if (!array[arrayIndex]) {
      array[arrayIndex] = []
    }
    array[arrayIndex] = [...array[arrayIndex], number]
    return array
  }, [])
  console.log("item", item)

  const handleImageClick = detail => {
    console.log("detail", detail)
    SetSelectedUrl(detail)
  }

  const optionPrice = options => {
    let minPrice =
      options.filter(item => item.price !== null)[0].price +
      (options.filter(item => item.price !== null)[0].shippingFee || 0)
    let maxPrice =
      options.filter(item => item.price !== null)[0].price +
      (options.filter(item => item.price !== null)[0].shippingFee || 0)
    options
      .filter(item => item.price !== null)
      .forEach(item => {
        if (item.price + item.shippingFee < minPrice) {
          minPrice = item.price + (item.shippingFee || 0)
        }
        if (item.price > maxPrice) {
          maxPrice = item.price + (item.shippingFee || 0)
        }
      })
    if (minPrice === maxPrice) {
      return `${minPrice.toLocaleString("ko")}원`
    } else {
      return `${minPrice.toLocaleString("ko")}~${maxPrice.toLocaleString("ko")}원`
    }
  }

  const optionAttribute = options => {
    const optionObj = {}
    options.forEach(item => {
      if (item.optionKey1 !== null && !optionObj[item.optionKey1]) {
        optionObj[item.optionKey1] = []
      }
      if (item.optionTitle1 !== null && !optionObj[item.optionKey1].includes(item.optionTitle1)) {
        optionObj[item.optionKey1].push(item.optionTitle1)
      }
      if (item.optionKey2 !== null && !optionObj[item.optionKey2]) {
        optionObj[item.optionKey2] = []
      }
      if (item.optionTitle2 !== null && !optionObj[item.optionKey2].includes(item.optionTitle2)) {
        optionObj[item.optionKey2].push(item.optionTitle2)
      }
    })
    const DropdownComponent = []
    for (const [key, value] of Object.entries(optionObj)) {
      DropdownComponent.push(
        <Dropdown
          overlay={
            <Menu>
              {value.map((item, i) => (
                <Menu.Item key={i}>{item}</Menu.Item>
              ))}
            </Menu>
          }
        >
          <div style={{ fontSize: "14px", color: "#512da8", fontWeight: "700", cursor: "pointer" }}>
            {key}
            <DownOutlined style={{ marginLeft: "5px" }} />
          </div>
        </Dropdown>
      )
    }

    if (Object.keys(optionObj).length > 0) {
      return (
        <div style={{ display: "flex" }}>
          <div style={{ fontSize: "13px", marginRight: "15px" }}>옵션속성:</div>
          <OptionAttributeContainer>{DropdownComponent}</OptionAttributeContainer>
        </div>
      )
    } else {
      return null
    }
  }

  const titleComponent = titleArray => {
    if(!Array.isArray(titleArray)){
      return
    }
    return (
      <TitleContainer>
        {titleArray.map((item, index) => {
          if (item.ban.length > 0) {
            return (
              <Tooltip
                key={index}
                title={
                  <>
                    <div>금지 단어</div>
                    <div>
                      {item.ban.map((item, i) => (
                        <Tag key={i} color="red">
                          {item.trim()}
                        </Tag>
                      ))}
                    </div>
                  </>
                }
              >
                <Tag color="red">{item.word}</Tag>
              </Tooltip>
            )
          } else if (item.brand.length > 0) {
            return (
              <Tooltip
                key={index}
                title={
                  <>
                    <div>브랜드 의심 단어</div>
                    <div>
                      {item.brand.map((item, i) => (
                        <Tag key={i} color="blue">
                          {item}
                        </Tag>
                      ))}
                    </div>
                  </>
                }
              >
                <Tag color="blue">{item.word}</Tag>
              </Tooltip>
            )
          } else {
            return <span key={index}>{item.word}</span>
          }
        })}
      </TitleContainer>
    )
  }
  return (
    <ContainerWrapper>
      <Container>
        <CoupangWrapper>
          <Modal
            title="쿠팡 상품 URL을 입력해주세요"
            visible={isModalVisible}
            onOk={() => {
              if (isURL && urlRef.current.state.value.includes("coupang.com")) {
                urlSearch(urlRef.current.state.value)
                setIsModalVisible(false)
              } else {
                message.error("잘못된 URL입니다.")
              }
            }}
            onCancel={() => setIsModalVisible(false)}
          >
            <Input allowClear size="large" ref={urlRef} />
          </Modal>
          <CoupangHederContainer>
            <div>
              쿠팡
              {item.vendorName ? (
                <span
                  style={{ cursor: "pointer", fontWeight: "700" }}
                  onClick={() =>
                    shell.openExternal(
                      `https://store.coupang.com/vp/vendors/${item.vendorID}/products`
                    )
                  }
                >{` (${item.vendorName})`}</span>
              ) : null}
            </div>
            <Tooltip title="쿠팡 상품 직접 입력">
              <Button
                danger
                shape="circle"
                icon={<ZoomInOutlined />}
                onClick={() => setIsModalVisible(true)}
              ></Button>
            </Tooltip>
          </CoupangHederContainer>
          <div
            style={{
              margin: "7px",
              width: "416px",
              marginLeft: "12px",
              boxShadow: "0 0 0 2px #c9c9c9 inset",
              background: "white",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between"
            }}
          >
            <div>{titleComponent(item.titleArray)}</div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "15px",
                  marginBottom: "15px"
                }}
              >
                <div>{optionAttribute(item.options)}</div>
                <div
                  style={{
                    fontSize: "17px",
                    fontWeight: "900",
                    textAlign: "right",

                    color: "#FF3377"
                  }}
                >
                  {optionPrice(item.options)}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ fontSize: "14px" }}>
                  {`판매자: `}
                  <span style={{ fontWeight: "900" }}>{`${
                    item.otherSellerCount ? item.otherSellerCount.toLocaleString("ko") : 1
                  }`}</span>
                </div>

                <Drawer
                  title="상품평"
                  placement="right"
                  closable={false}
                  onClose={() => setVisibleReview(false)}
                  visible={visibleReview}
                  key={"review"}
                  width={500}
                >
                  <iframe
                    height="100%"
                    width="90%"
                    title="리뷰"
                    src={`https://www.coupang.com/vp/product/reviews?productId=${item.productId}&page=1&size=500&sortBy=ORDER_SCORE_ASC&ratings=&q=&viRoleCode=3&ratingSummary=true`}
                  />
                </Drawer>
                <Tooltip title="상품평 보기">
                  <StartRatingContainer onClick={() => setVisibleReview(true)}>
                    <StartRatings
                      rating={((item.ratingAveragePercentage || 0) * 5) / 100}
                      starDimension="18px"
                      starSpacing="0"
                      starRatedColor="#FF9600"
                    />
                    <div>
                      {`상품평: `}
                      <span>{`${
                        item.ratingCount ? item.ratingCount.toLocaleString("ko") : 0
                      }`}</span>
                      {`개`}
                    </div>
                  </StartRatingContainer>
                </Tooltip>
                <Drawer
                  title="상품문의"
                  placement="right"
                  closable={false}
                  onClose={() => setVisibleInquire(false)}
                  visible={visibleInquire}
                  key={"inquire"}
                  width={500}
                >
                  <iframe
                    height="100%"
                    width="90%"
                    title="상품문의"
                    src={`https://www.coupang.com/vp/products/${item.productId}/inquiries?pageNo=1&isPreview=false`}
                  />
                </Drawer>

                <Tooltip title="상품문의 보기">
                  <Button
                    icon={<QuestionCircleOutlined />}
                    onClick={() => setVisibleInquire(true)}
                  ></Button>
                </Tooltip>
                <Tooltip title="쿠팡에서 보기">
                  <Button
                    icon={<CopyrightOutlined />}
                    onClick={() => shell.openExternal(item.detail)}
                  >
                    쿠팡
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
          <CoupangImageWarpper>
            <CoupangImageContainer>
              <Image.PreviewGroup>
                {item.mainImages.map((item, i) => (
                  <div key={i} style={{ margin: "7px", position: "relative" }}>
                    <Image
                      style={{ border: `2px solid ${i === 0 ? "#000000" : "#c9c9c9c9"}` }}
                      width={200}
                      height={200}
                      src={item.replace(/492/gi, "200")}
                      fallback={item}
                      preview={{
                        src: item.replace(/492/gi, "800")
                      }}
                    />
                    <DownloadContainer>
                      <a href={item} download>
                        <Tooltip title="이미지를 내컴퓨터에 저장">
                          <Button icon={<DownloadOutlined />} block>
                            다운
                          </Button>
                        </Tooltip>
                      </a>
                      <Tooltip title="이미지를 타오바오에서 검색">
                        <Button
                          loading={isLoading === item}
                          type="primary"
                          icon={<SearchOutlined />}
                          block
                          onClick={async () => {
                            setLoading(item)
                            const response = await imageListUrl({
                              variables: {
                                imageUrl: item
                              }
                            })

                            if (response && response.data.TaobaoImageListUrl) {
                              shell.openExternal(response.data.TaobaoImageListUrl.url)
                            } else {
                              notification["error"]({
                                message: "이미지 주소를 가져오는데 실패하였습니다."
                              })
                            }
                            setLoading(null)
                          }}
                        >
                          검색
                        </Button>
                      </Tooltip>
                    </DownloadContainer>
                  </div>
                ))}
              </Image.PreviewGroup>
            </CoupangImageContainer>
          </CoupangImageWarpper>
        </CoupangWrapper>

        <TaobaoWrapper>
          {dimensionArray2.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          {dimensionArray2.map((taobaoItems, index) => (
            <TaoboaItemContainer key={index}>
              {taobaoItems.map(taobaoItem => (
                <div key={taobaoItem._id}>
                  <TaobaoImageContaier>
                    <TaobaoImage
                      src={`${taobaoItem.image}_200x200.jpg`}
                      onError={`${taobaoItem.image}`}
                      onClick={() => handleImageClick(taobaoItem.detail)}
                      isSelected={taobaoItem.detail === selectedUrl}
                    />
                    {taobaoItem.detail === selectedUrl && <CheckBoxIcon />}
                  </TaobaoImageContaier>
                  <IndicatorContainer>
                    <div>
                      <ShopGrade
                        delivery={taobaoItem.shopGrade.delivery}
                        description={taobaoItem.shopGrade.description}
                        service={taobaoItem.shopGrade.service}
                      />
                    </div>
                    <div>
                      <div>
                        <ShoppingCartOutlined style={{ marginRight: "3px" }} />
                        {taobaoItem.dealCnt}
                      </div>
                      <div>
                        <CommentOutlined style={{ marginRight: "3px" }} />
                        {taobaoItem.commentCount}
                      </div>
                    </div>
                  </IndicatorContainer>
                  <ShopLevelContainer>
                    <div>
                      {taobaoItem.shopLevel.map((item, i) => (
                        <ShopLevel key={i} level={item} />
                      ))}
                    </div>
                    <Button
                      style={{
                        height: "20px",
                        fontSize: "12px",
                        // color: "#ff4400",
                        background: "#ff4400",
                        cursor: "pointer",
                        padding: "0 10px",
                        color: "white"
                      }}
                      icon={<TaobaoCircleOutlined style={{ color: "white" }} />}
                      onClick={() => shell.openExternal(taobaoItem.detail)}
                    >
                      타오바오
                    </Button>
                  </ShopLevelContainer>
                </div>
              ))}
            </TaoboaItemContainer>
          ))}
        </TaobaoWrapper>
      </Container>
      <div>
        <InputContainer>
          <div>
            <Input
              size="large"
              addonBefore="제목"
              placeholder="상품 제목을 선택해주세요."
              allowClear
              value={title}
              onChange={e => {
                setTitle(e.target.value)
              }}
              border={false}
              style={{
                marginBottom: "6px",
                border: "3px solid #512da8"
              }}
            />
            <Input
              size="large"
              addonBefore="주소"
              placeholder="등록할 상품을 선택해주세요."
              allowClear
              value={selectedUrl}
              border={false}
              onChange={e => {
                handleImageClick(e.target.value)
              }}
              style={{ border: "3px solid #512da8" }}
            />
          </div>
          <div style={{ width: "160px" }}>
            <Tooltip title="상세페이지에 의류 사이즈표 추가">
              <div>
                <Checkbox
                  style={{ padding: "15px", fontSize: "16px" }}
                  checked={clothes}
                  onChange={e => setClothes(e.target.checked)}
                >
                  의류
                </Checkbox>
              </div>
            </Tooltip>
            <Tooltip title="상세페이지에 신발 사이즈표 추가">
              <div>
                <Checkbox
                  style={{ padding: "15px", fontSize: "16px" }}
                  checked={shoes}
                  onChange={e => setShose(e.target.checked)}
                >
                  신발
                </Checkbox>
              </div>
            </Tooltip>
          </div>
          <div>
            <Tooltip title="쿠팡 판매금액에서 차감할 금액을 입력해주세요.">
              <Input
                addonBefore="차감액"
                size="large"
                border={false}
                style={{
                  marginBottom: "6px",
                  textAlign: "right",
                  border: "3px solid #512da8"
                }}
                value={subPrice.toLocaleString("ko")}
                onChange={e => {
                  let value = Number(e.target.value.replace(/,/gi, ""))
                  setSubPrice(value)
                }}
                onBlur={e => {
                  let value = Number(e.target.value.replace(/,/gi, ""))
                  if (value <= 100) {
                    setSubPrice(100)
                  } else {
                    setSubPrice(value)
                  }
                }}
                onKeyPress={event => {
                  if (
                    event.which &&
                    (event.which <= 47 || event.which >= 58) &&
                    event.which !== 8 &&
                    event.which !== 44
                  ) {
                    event.preventDefault()
                  }
                }}
              />
            </Tooltip>
            <StepperWrapper>
              <StepperContainer>
                <StepperTitle>100</StepperTitle>
                <div>
                  <div>
                    <Button
                      style={{ width: "40px", height: "24px", padding: "0" }}
                      onClick={() => setSubPrice(subPrice + 100)}
                    >
                      <UpOutlined />
                    </Button>
                  </div>
                  <div>
                    <Button
                      style={{ width: "40px", height: "23px", padding: "0", marginTop: "-1px" }}
                      onClick={() => {
                        if (subPrice - 100 >= 100) {
                          setSubPrice(subPrice - 100)
                        }
                      }}
                    >
                      <DownOutlined />
                    </Button>
                  </div>
                </div>
              </StepperContainer>
              <StepperContainer>
                <StepperTitle>1,000</StepperTitle>
                <div>
                  <div>
                    <Button
                      style={{ width: "40px", height: "24px", padding: "0" }}
                      onClick={() => setSubPrice(subPrice + 1000)}
                    >
                      <UpOutlined />
                    </Button>
                  </div>
                  <div>
                    <Button
                      style={{ width: "40px", height: "23px", padding: "0", marginTop: "-1px" }}
                      onClick={() => {
                        if (subPrice - 1000 >= 100) {
                          setSubPrice(subPrice - 1000)
                        }
                      }}
                    >
                      <DownOutlined />
                    </Button>
                  </div>
                </div>
              </StepperContainer>
            </StepperWrapper>
          </div>
          <NextButtonCointiner>
            <Tooltip title="등록하고 다음 상품 찾기">
              <Button
                type="primary"
                style={{ height: "100%", width: "100px", fontSize: "16px", fontWeight: "700" }}
                icon={<CheckOutlined style={{ fontSize: "16px" }} />}
                onClick={async () => {
                  if (subPrice < 0) {
                    message.warning("차감액을 0보다 큰 수를 입력해 주세요.")
                    return
                  }
                  if (!title || title.length === 0) {
                    message.warning("제목을 입력해 주세요.")
                    return
                  }
                  if (!selectedUrl || !isURL(selectedUrl)) {
                    message.warning("주소를 입력해 주세요.")
                    return
                  }
                  if (
                    !/detail.tmall.com/.test(selectedUrl) &&
                    !/item.taobao.com/.test(selectedUrl)
                  ) {
                    message.warning("올바른 주소를 입력해 주세요.")
                    return
                  }

                  console.log("AA", {
                    _id: item._id,
                    title,
                    detailUrl: selectedUrl,
                    subPrice
                  })

                  const response = await uploadItem({
                    variables: {
                      coupangID: item._id,
                      title,
                      detailUrl: selectedUrl,
                      subPrice,
                      isClothes: clothes,
                      isShoes: shoes
                    }
                  })

                  console.log("response", response)
                  nextButtonClick()
                }}
              >
                등록
              </Button>
            </Tooltip>
            <Tooltip title="등록 안하고 다음 상품 찾기">
              <Button
                style={{
                  height: "100%",
                  width: "100px",
                  background: "#ffff6b",
                  borderBottomWidth: "3px",
                  borderBottomColor: "#fdd835",
                  borderBottomStyle: "solid",
                  borderRightWidth: "3px",
                  borderRightColor: "#fdd835",
                  borderRightStyle: "solid",
                  fontSize: "16px",
                  fontWeight: "700"
                }}
                icon={<DoubleRightOutlined style={{ fontSize: "16px" }} />}
                onClick={nextButtonClick}
              >
                다음
              </Button>
            </Tooltip>
          </NextButtonCointiner>
        </InputContainer>
      </div>
    </ContainerWrapper>
  )
}

export default ItemWinnerForm1

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 1.6;
  & > :not(:last-child) {
    margin-right: 3px;
  }
`

const StartRatingContainer = styled.div`
  cursor: pointer;
  height: 22px;
  /* position: absolute;
  top: -25px;
  left: 0;
  right: 0; */
  display: flex;
  align-items: center;
  & > :first-child {
    padding-left: 10px;
  }
  & > :last-child {
    margin-left: 5px;
    font-size: 14px;
    span {
      font-weight: 900;
    }
  }
`

const StepperWrapper = styled.div`
  display: flex;
  align-items: center;
  & > :not(:last-child) {
    margin-right: 5px;
  }
`
const StepperTitle = styled.div`
  height: 46px;
  width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  border: 1px solid #d9d9d9;
  border-right: none;
  background: #fafafa;
`
const StepperContainer = styled.div`
  display: flex;
  align-items: center;
`

const OptionAttributeContainer = styled.div`
  display: flex;
  align-items: center;
  & > :not(:last-child) {
    margin-right: 20px;
  }
`
const ContainerWrapper = styled.div`
  min-height: calc(100vh - 80px);
  max-height: calc(100vh - 80px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  & > :first-child {
    overflow: auto;
    /* height: 100%; */
    min-height: calc(100vh - 80px - 115px);
    max-height: calc(100vh - 80px - 115px);
  }
  & > :last-child {
    padding-top: 5px;
    border-top: 5px solid #ff3377;
    /* background: rgba(256, 51, 119, 0.8); */
    max-height: 115px;
    min-height: 115px;
  }
`
const InputContainer = styled.div`
  display: flex;
  margin-left: 50px;
  margin-right: 50px;

  & > :first-child {
    width: 100%;
    margin-right: 10px;
  }
  & > :last-child {
    width: 230px;
  }
`

const Container = styled.div`
  display: flex;

  & > :first-child {
    /* margin-right: 20px; */
    min-width: 460px;
    max-width: 460px;
    margin: 0 auto;
  }
  & > :last-child {
    width: 100%;
  }
`

const CoupangHederContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  margin-left: 20px;
  margin-right: 20px;
  & > :nth-child(1) {
    font-size: 14px;
  }
  & > :nth-child(2) {
    width: 32px;
  }
`

const CoupangWrapper = styled.div`
  border-right: 4px solid #ff3377;
  background: rgba(255, 242, 0, 0.5);
  overflow: auto;
`

const NewButtonContainer = styled.div`
  top: 10px;
  right: 20px;
  width: 32px;
  height: 32px;
  background: red;
  cursor: pointer;
  display: block;
`
const CoupangImageWarpper = styled.div`
  /* display: flex;
  justify-content: center; */
  margin: 0 auto;
  margin-left: 5px;
  margin-right: 5px;
`
const CoupangImageContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  /* margin: -10px auto; */
  flex-wrap: wrap;
  /* justify-content: center; */
  /* align-items: flex-start; */
`

const DownloadContainer = styled.div`
  margin-top: 5px;
  display: flex;
  align-items: center;
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const TaobaoWrapper = styled.div`
  & > :not(:last-child) {
    margin-bottom: 15px;
  }
`
const TaoboaItemContainer = styled.div`
  display: flex;
  margin-top: 8px;
  justify-content: space-between;
  padding-left: 40px;
  padding-right: 40px;
`
const TaobaoImageContaier = styled.div`
  position: relative;
`
const TaobaoImage = styled.img`
  cursor: pointer;
  overflow: hidden;
  box-shadow: 0 0 0 1px #c9c9c9;
  border-radius: 5px;
  width: 200px;
  height: 200px;
  ${ifProp(
    "isSelected",
    css`
      box-shadow: 0 0 0 5px #9c27b0;
    `
  )};
`

const IndicatorContainer = styled.div`
  margin: 5px 5px;
  margin-bottom: 1px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;

  & > :nth-child(2) {
    display: flex;
    align-items: center;
    & > :not(:last-child) {
      margin-right: 5px;
    }
  }
`

const CheckBoxIcon = () => {
  return (
    <CheckBoxContainer>
      <CheckBoxWrapper>
        <CheckBoxIconContainer>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36.279"
            height="27.723"
            viewBox="0 0 36.279 27.723"
          >
            <path
              id="패스_1068"
              data-name="패스 1068"
              d="M-19682.666-20521.32l10.68,10.68,21.357-21.359"
              transform="translate(19684.787 20534.121)"
              fill="none"
              stroke="#fff"
              stroke-width="6"
            />
          </svg>
        </CheckBoxIconContainer>
      </CheckBoxWrapper>
    </CheckBoxContainer>
  )
}

const CheckBoxContainer = styled.div`
  position: absolute;
  /* top: 17px;
  right: 17px; */
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background: rgba(81, 45, 168, 0.5);
`
const CheckBoxWrapper = styled.div`
  position: relative;
`

const CheckBoxIconContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`

const ShopGrade = ({ delivery, description, service }) => {
  return (
    <ShopGradeContainer>
      <ShopGraph up={delivery > 0} />
      <ShopGraph up={description > 0} />
      <ShopGraph up={service > 0} />
    </ShopGradeContainer>
  )
}

const ShopGradeContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 10px;
  & > :nth-child(2) {
    margin-top: 2px;
    margin-bottom: 2px;
  }
`
const ShopGraph = styled.div`
  height: 2px;
  width: 100%;
  background: #00ba97;
  ${ifProp(
    "up",
    css`
      background: #ff4400;
    `
  )};
`

const ShopLevel = ({ level }) => {
  switch (level) {
    case "icon-supple-level-xin": // 빨간 하트
      return <div style={{ color: "red", fontSize: "16px" }}>♥︎</div>
    case "icon-supple-level-zuan": // 파란 다이아몬드
      return (
        <ShopLevelIcon src="https://gtms02.alicdn.com/tps/i3/TB1KxNsFVXXXXcKXpXXxPfUFXXX-16-16.gif" />
      )
    case "icon-supple-level-guan": // 파란 왕관
      return (
        <ShopLevelIcon src="https://gtms03.alicdn.com/tps/i4/TB17JRyFVXXXXXhXpXXxPfUFXXX-16-16.gif" />
      )
    case "icon-supple-level-jinguan": // 주황 왕관
      return (
        <ShopLevelIcon src="https://gtms04.alicdn.com/tps/i2/TB188JyFVXXXXcoXXXXxPfUFXXX-16-16.gif" />
      )
    default:
      return null
  }
}

const ShopLevelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & > :nth-child(1) {
    display: flex;
    align-items: center;
  }
`

const ShopLevelIcon = styled.img`
  width: 16px;
  height: 16px;
  margin-right: 2px;
`

const NextButtonCointiner = styled.div`
  margin-left: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const CoupangTitle = styled.div`
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 라인수 */
  -webkit-box-orient: vertical;
  word-wrap: break-word;
`
