import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import {
  TitleArrayComponent,
  KeywordModal,
  MainImageModal,
  OptionModal,
  DetailFormModal,
  TitleHighlightForm,
} from "components"
import { Image, Input, Button, Checkbox, Popconfirm, Select } from "antd"
import { useMutation } from "@apollo/client"
import { DELETE_AMAZON_COLLECTION } from "../../../gql"
import { CloseOutlined } from "@ant-design/icons"
import { getByte } from "../../../lib/userFunc"

const { shell } = window.require("electron")
const { Option } = Select

const TaobaoCollectionItem = forwardRef(({ collection, onDelete }, ref) => {
  const [item, setItem] = useState(collection)
  const titleArrayRef = useRef()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isKorModalVisible, setIsKorModalVisible] = useState(false)
  const [isMainImageModalVisible, setMainImageModalVisible] = useState(false)
  const [isOptionModalVisible, setOptionModalVisible] = useState(false)
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)

  const [selectKeyword, SetSelectKeyword] = useState("")

  useEffect(() => {
    let tempHtml = ``
    tempHtml += `<hr >`
    if (Array.isArray(collection.content)) {
      for (const item of collection.content) {
        tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
      }
    }
    console.log("collection", collection)
    setItem({
      ...collection,
      html: tempHtml,
      options: collection.options.map((item) => {
        return {
          ...item,
          weight: item.weight ? item.weight : null,
          weightPrice: Number(
            collection.shippingWeightInfo.sort((a, b) => a.title - b.title)[0].price
          ),
          salePrice: getSalePrice(
            item.price,
            1,
            collection.shippingWeightInfo.map((item) => item).sort((a, b) => a.title - b.title),
            collection.marginInfo,
            collection.exchange
          ),
        }
      }),
    })
  }, [collection])

  const addPriceCalc = (wian, weightPrice, margin, exchange) => {
    const addPrice = -(
      ((exchange * margin + 11 * exchange) * Number(wian) +
        weightPrice * margin +
        11 * weightPrice) /
      (margin - 89)
    )
    return addPrice
  }

  const getSalePrice = (wian, shippingWeight, shippingInfo, marginInfo, exchange) => {
    if (shippingInfo.length === 0) {
      return
    }
    let weightPrice = 0
    let shippingArr = shippingInfo.filter((item) => item.title >= shippingWeight)

    if (shippingArr.length > 0) {
      weightPrice = shippingArr[0].price
    } else {
      weightPrice = shippingInfo[shippingInfo.length - 1].price
    }
    let margin = 30
    let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(wian))

    if (marginArr.length > 0) {
      margin = marginArr[0].price
    } else {
      margin = marginInfo[marginInfo.length - 1].price
    }
    let addPrice = addPriceCalc(wian, weightPrice, margin, exchange)
    let salePrice =
      Math.ceil((Number(wian) * Number(exchange) + Number(addPrice) + Number(weightPrice)) * 0.1) *
      10

    return salePrice
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const showKorModal = () => {
    setIsKorModalVisible(true)
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false)
    setIsKorModalVisible(false)
    SetSelectKeyword("")
    handleTitle(selectKeyword)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setIsKorModalVisible(false)
    SetSelectKeyword("")
  }

  useImperativeHandle(ref, () => ({
    showData() {
      try {
        return {
          content: item.content,
          detailUrl: item.detailUrl,
          html: item.html,
          clothes: item.clothes,
          shoes: item.shoes,
          mainImages: item.mainImages,
          keyword: item.keyword,
          korTitle: item.korTitle,
          engSentence: item.engSentence,
          prop: item.prop.map((item) => {
            return {
              korTypeName: item.korTypeName,
              name: item.name,
              pid: item.pid,
              values: item.values.map((val) => {
                return {
                  image: val.image,
                  korValueName: val.korValueName,
                  name: val.name,
                  vid: val.vid,
                }
              }),
            }
          }),
          options: item.options.map((item) => {
            return {
              active: item.active,
              disabled: item.disabled,
              key: item.key,
              korValue: item.korValue,
              image: item.image,
              price: Number(item.price),
              productPrice: item.salePrice,
              propPath: item.propPath,
              salePrice: item.salePrice,
              stock: Number(item.stock),
              value: item.value,
              weightPrice: item.weightPrice,
              attributes: item.attributes.map((attr) => {
                return {
                  attributeTypeName: attr.attributeTypeName,
                  attributeValueName: attr.attributeValueName,
                }
              }),
            }
          }),
        }
      } catch (e) {
        return null
      }
    },
  }))

  const handleMainImages = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      mainImages: value,
    })
  }

  const handleOptions = (value, prop) => {
    if (!item) {
      return
    }
    console.log("handleOptions", item)
    console.log("options", value)
    setItem({
      ...item,
      options: value,
      prop,
    })
  }

  const handleHtml = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      html: value,
    })
  }

  const handleClothes = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      clothes: value,
    })
  }
  const handleShoes = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      shoes: value,
    })
  }

  const handleOkMainImae = (value) => {
    setMainImageModalVisible(false)
    handleMainImages(value)
    // setRootMainImage(index, productNo, value)
  }

  const handleCancelMainImae = () => {
    setMainImageModalVisible(false)
  }

  const handleOkOption = (option, prop) => {
    setOptionModalVisible(false)
    console.log("OK OPTION", option)
    handleOptions(option, prop)
  }

  const handleOkDetail = (detailHtml) => {
    setDetailModalVisible(false)
    handleHtml(detailHtml)
  }

  const handleCancelOption = () => {
    setOptionModalVisible(false)
  }
  const handleCancelDetail = () => {
    setDetailModalVisible(false)
  }

  const {
    isRegister,
    korTitle,
    title,
    titleArray,
    korTitleArray,
    mainImages,
    options,
    prop,
    keyword,
    exchange,
    marginInfo,
    shippingWeightInfo,
    prohibitWord,
    html,
    clothes,
    shoes,
  } = item

  console.log("ite--", item)
  const handleTitle = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      korTitle: value,
    })
  }
  const handleKeyword = (value) => {
    if (!item) {
      return
    }
    setItem({
      ...item,
      keyword: value,
    })
  }

  const handleChange = (value) => {
    const shippintWeight = shippingWeightInfo[value - 1]
    setItem({
      ...collection,
      options: collection.options.map((item) => {
        return {
          ...item,
          weight: Number(shippintWeight.title),
          weightPrice: Number(shippintWeight.price),
          salePrice: getSalePrice(
            item.price,
            Number(shippintWeight.title),
            collection.shippingWeightInfo.map((item) => item).sort((a, b) => a.title - b.title),
            collection.marginInfo,
            collection.exchange
          ),
        }
      }),
    })
  }
  return (
    <Container>
      <div>
        <AsinLabel
          onClick={() => {
            shell.openExternal(collection.detailUrl)
          }}
        >
          <img
            src={
              collection.detailUrl.includes("taobao")
                ? "https://img.alicdn.com/tfs/TB1VlKFRpXXXXcNapXXXXXXXXXX-16-16.png"
                : "https://img.alicdn.com/tfs/TB1XlF3RpXXXXc6XXXXXXXXXXXX-16-16.png"
            }
            width="16px"
            style={{ marginRight: "5px" }}
          />
          {collection.good_id}
        </AsinLabel>
        {item.purchaseLimitNumMax === 1 && <OutOfStockLable>특가상품</OutOfStockLable>}
        <AuctionForm asin={collection.good_id} onDelete={onDelete} />
        <Image
          width={200}
          // height={200}
          src={mainImages[0]}
          fallback="data:image/png;base64,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"
        />
      </div>
      <ContentContainer>
        <div>
          <TtitlArrayFlex>
            <div>
              {isModalVisible && (
                <KeywordModal
                  isModalVisible={isModalVisible}
                  handleOk={handleOk}
                  handleCancel={handleCancel}
                  title={korTitle}
                  keyword={selectKeyword}
                  mainImages={mainImages}
                  spec={item.spec}
                />
              )}
              <TitleArrayComponent
                title={korTitle}
                titleArray={titleArray}
                SetSelectKeyword={SetSelectKeyword}
                showModal={showModal}
                ref={titleArrayRef}
              />
            </div>
          </TtitlArrayFlex>
          <TitleHighlightForm text={korTitle} />

          <ProductTitleLength>
            <ProductTitleWarning isWarning={getByte(korTitle) > 50 ? true : false}>
              {getByte(korTitle)}
            </ProductTitleWarning>
            {`byte / `}
            <ProductTitleWarning isWarning={korTitle.length > 100 ? true : false}>
              {korTitle.length}
            </ProductTitleWarning>
            {`글자`}
          </ProductTitleLength>
          <Input
            style={{ marginTop: "5px" }}
            size="large"
            addonBefore={
              item.mainKeyword && item.mainKeyword.length > 0 ? (
                <>
                  <div
                    onClick={() => {
                      SetSelectKeyword(item.mainKeyword)
                      showModal()
                    }}
                    style={{ cursor: "pointer", background: "#d05ce3", color: "white" }}
                  >
                    {item.mainKeyword}
                  </div>
                </>
              ) : (
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    SetSelectKeyword("")
                    showModal()
                  }}
                >
                  상품명
                </div>
              )
            }
            placeholder="등록할 상품명을 입력해 주세요."
            allowClear
            value={korTitle}
            onChange={(e) => {
              handleTitle(e.target.value)
            }}
          />
          <Input
            style={{ marginTop: "5px" }}
            addonBefore="검색어"
            placeholder="쿠팡 검색어. 미입력시 상품명으로 대체. 컴마로 구분"
            allowClear
            value={keyword}
            onChange={(e) => {
              handleKeyword(e.target.value)
            }}
          />
        </div>
        <BottomContainer>
          <div>
            <ClothesShoesContainer>
              <Checkbox
                style={{ padding: "15px", fontSize: "16px" }}
                checked={clothes}
                onChange={(e) => {
                  handleClothes(e.target.checked)
                }}
              >
                의류
              </Checkbox>
              <Checkbox
                style={{ padding: "15px", fontSize: "16px" }}
                checked={shoes}
                onChange={(e) => {
                  handleShoes(e.target.checked)
                }}
              >
                신발
              </Checkbox>
              <ShippingForm
                shippingWeight={Number(item.options[0].weight ? item.options[0].weight : 1)}
                shippingPrice={shippingWeightInfo}
                handleChange={handleChange}
              />
            </ClothesShoesContainer>
            <DetailButtonContainer>
              <Button onClick={() => setMainImageModalVisible(true)}>메인 이미지</Button>
              {isMainImageModalVisible && (
                <MainImageModal
                  isModalVisible={isMainImageModalVisible}
                  handleOk={handleOkMainImae}
                  handleCancel={handleCancelMainImae}
                  mainImages={mainImages}
                />
              )}

              <Button onClick={() => setOptionModalVisible(true)}>옵션</Button>
              {isOptionModalVisible && (
                <OptionModal
                  isModalVisible={isOptionModalVisible}
                  handleOk={handleOkOption}
                  handleCancel={handleCancelOption}
                  option={item.options}
                  prop={item.prop}
                  exchange={item.exchange}
                  marginInfo={item.marginInfo}
                  shippingWeightInfo={item.shippingWeightInfo}
                />
              )}
              <Button onClick={() => setDetailModalVisible(true)}>상세 페이지</Button>
              {isDetailModalVisible && (
                <DetailFormModal
                  isModalVisible={isDetailModalVisible}
                  handleOk={handleOkDetail}
                  handleCancel={handleCancelDetail}
                  // content={content}
                  html={html}
                />
              )}
            </DetailButtonContainer>
          </div>
        </BottomContainer>
      </ContentContainer>
    </Container>
  )
})

export default TaobaoCollectionItem

const AuctionForm = ({ asin, onDelete }) => {
  const [deleteAmazon] = useMutation(DELETE_AMAZON_COLLECTION)
  return (
    <ActionButtonContainer>
      <Popconfirm
        title="삭제 하시겠습니까?"
        onConfirm={async () => {
          if (typeof onDelete === "function") {
            const response = await deleteAmazon({
              variables: {
                asin,
              },
            })
            console.log("deleteAmazon", response)
            if (response.data.DeleteAmazonCollection) {
              onDelete(asin)
            }
          }
        }}
        okText="네"
        cancelText="아니오"
      >
        <Button size="small" type="primary" danger icon={<CloseOutlined />} />
      </Popconfirm>
    </ActionButtonContainer>
  )
}

const Container = styled.div`
  padding: 25px;
  padding-top: 30px;
  margin: 25px;
  border: 1px solid lightgray;
  border-bottom-width: 5px;
  border-right-width: 5px;
  border-bottom-color: ${(props) => props.theme.primaryDark};
  border-right-color: ${(props) => props.theme.primaryDark};
  position: relative;
  display: flex;
  & > :nth-child(1) {
    max-width: 200px;
    min-width: 200px;
  }
  & > :nth-child(2) {
    width: 100%;
    margin-left: 20px;
  }
`

const ActionButtonContainer = styled.div`
  z-index: 100;
  position: absolute;
  top: 3px;
  right: 3px;
  display: flex;
  & > :nth-child(n) {
    margin-left: 10px;
  }
`

const AsinLabel = styled.div`
  cursor: pointer;
  padding: 8px 10px;
  position: absolute;
  left: -5px;
  top: -10px;
  background: white;
  border: 1px solid lightgray;
  color: #e6370f;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
`

const ContentContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
`

const ClothesShoesContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 5px;
  & > :nth-child(n) {
    margin-left: 5px;
  }
`

const DetailButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  & > :nth-child(n) {
    margin-left: 5px;
  }
`

const BottomContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
`

const ProductTitleWarning = styled.span`
  ${ifProp(
    "isWarning",
    css`
      color: #ff3377;
      font-weight: 700;
    `
  )};
`

const ProductTitleLength = styled.div`
  margin-top: -10px;
  text-align: right;
  margin-bottom: 3px;
  color: #484848;
  font-size: 13px;
`

const DeliverContainer = styled.div`
  margin-top: 5px;
  font-size: 12px;
  color: #666666;
`
const DeliverDay = styled.div`
  font-size: 50px;
  font-weight: 900;
  color: #ff3377;
  margin-left: 20px;
`

const TtitlArrayFlex = styled.div`
  display: flex;
  align-items: flex-end;
  & > :nth-child(1) {
    margin-right: 10px;
  }
`

const DeliverCompany = styled.div`
  color: "#a1a1a1";
  font-size: 14px;
`

const DeliverWarpper = styled.div`
  display: flex;
  margin-left: 20px;
  align-items: flex-end;
`

const OutOfStockLable = styled.div`
  margin-left: 10px;
  font-size: 16px;
  font-weight: 700;
  background: #ff3377;
  padding: 8px 10px;
  position: absolute;
  left: -10px;
  top: 30px;
  color: white;
  text-align: center;
  z-index: 1000;
`

const ShippingForm = ({ shippingWeight, shippingPrice, handleChange }) => {
  const getDefaultValue = () => {
    const temp = shippingPrice.filter((item) => item.title === shippingWeight.toString())
    if (temp.length > 0) {
      return `${temp[0].title}Kg (${temp[0].price.toLocaleString("ko")}원)`
    } else {
      return `${shippingPrice[0].title}Kg (${shippingPrice[0].price.toLocaleString("ko")}원)`
    }
  }

  return (
    <Select
      size="large"
      bordered={false}
      // defaultValue={`${shippingPrice[0].title}Kg (${shippingPrice[0].price.toLocaleString("ko")}원)`}
      value={getDefaultValue()}
      style={{ width: 180, border: "3px solid #512da8" }}
      onChange={handleChange}
    >
      {shippingPrice.map((item, index) => (
        <Option key={index} value={item.title}>{`${item.title}Kg (${item.price.toLocaleString(
          "ko"
        )}원)`}</Option>
      ))}
    </Select>
  )
}
