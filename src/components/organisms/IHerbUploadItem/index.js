import React, { useState, useRef, forwardRef, useImperativeHandle } from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import {
  TitleArrayComponent,
  KeywordModal,
  MainImageModal,
  OptionModal,
  DetailFormModal,
  HighligthModal,
  TitleHighlightForm,
} from "components"
import { Alert, Skeleton, Image, Tooltip, Input, Tag, Button, Checkbox, Popconfirm } from "antd"
import { useQuery, NetworkStatus } from "@apollo/client"
import { GET_IHERB_DETAIL_API } from "../../../gql"
import { RedoOutlined, CloseOutlined } from "@ant-design/icons"
import { getByte } from "../../../lib/userFunc"

const { shell } = window.require("electron")

const IHerbUploadItem = forwardRef(({ asin, url, productName, onDelete, onComplete }, ref) => {
  const [item, setItem] = useState(null)
  const titleArrayRef = useRef()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isProhibitModalVisible, setIsProhibitModalVisible] = useState(false)
  const [isKorModalVisible, setIsKorModalVisible] = useState(false)
  const [isMainImageModalVisible, setMainImageModalVisible] = useState(false)
  const [isOptionModalVisible, setOptionModalVisible] = useState(false)
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)

  const [selectKeyword, SetSelectKeyword] = useState("")

  const { error, refetch, networkStatus } = useQuery(GET_IHERB_DETAIL_API, {
    variables: {
      url,
      title: productName,
    },
    // fetchPolicy: "network-only",
    // fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log("data", data)
      if (typeof onComplete === "function") {
        onComplete(asin)
      }
      if (data.GetiHerbDetailAPI && !data.GetiHerbDetailAPI.isRegister) {
        let tempHtml = ``
        tempHtml += `<hr >`

        if (Array.isArray(data.GetiHerbDetailAPI.content)) {
          for (const item of data.GetiHerbDetailAPI.content) {
            tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
          }
        }
        // tempHtml += `<br /><br />`
        // if(data.GetiHerbDetailAPI.description && data.GetiHerbDetailAPI.description.length > 0){
        //   tempHtml += `<h3>제품설명</h3>`
        //   tempHtml += `${data.GetiHerbDetailAPI.description}`
        //   tempHtml += `<br /><br />`
        // }
        tempHtml += `<div style="text-align: left; width: 100%; max-width: 800px; display: block; margin: 0 auto;">`
        if (data.GetiHerbDetailAPI.suggestedUse && data.GetiHerbDetailAPI.suggestedUse.length > 0) {
          tempHtml += `<h3 style="font-size: 20px; !important"><strong>제품 사용법</strong></h3>`
          tempHtml += `<div style="font-size: 15px !important">`
          tempHtml += `${data.GetiHerbDetailAPI.suggestedUse}`
          tempHtml += `<div>`
          tempHtml += `<br /><br />`
        }

        if (
          data.GetiHerbDetailAPI.supplementFacts &&
          data.GetiHerbDetailAPI.supplementFacts.length > 0
        ) {
          tempHtml += `<h3 style="font-size: 20px; !important"><strong>영양 성분 정보</strong></h3>`
          tempHtml += `<div style="font-size: 15px !important">`
          tempHtml += `${data.GetiHerbDetailAPI.supplementFacts}`
          tempHtml += `<div>`
          tempHtml += `<br /><br />`
        }

        if (data.GetiHerbDetailAPI.ingredients && data.GetiHerbDetailAPI.ingredients.length > 0) {
          tempHtml += `<h3 style="font-size: 20px; !important"><strong>포함된 다른 성분들</strong></h3>`
          tempHtml += `<div style="font-size: 15px !important">`
          tempHtml += `${data.GetiHerbDetailAPI.ingredients
            .replace(/알레르기/gi, "")
            .replace(/녹내장/gi, "")}`
          tempHtml += `<div>`
          tempHtml += `<br /><br />`
        }

        if (data.GetiHerbDetailAPI.warnings && data.GetiHerbDetailAPI.warnings.length > 0) {
          tempHtml += `<h3 style="font-size: 20px; !important"><strong>주의사항</strong></h3>`
          tempHtml += `<div style="font-size: 15px !important">`

          const warningArr = data.GetiHerbDetailAPI.warnings
            .split("</p>")
            .filter((fItem) => fItem && fItem.length > 0)
          const prohibitWord = [
            "효능",
            "처방약",
            "신장",
            "설사",
            "간질",
            "호르몬",
            "경련",
            "크론병",
            "두통",
            "고혈압",
            "디톡스",
            "뛰어난",
            "결핍",
            "갑상선",
            "녹내장",
            "호르몬",
            "황백",
            "제약",
            "오가닉",
          ]
          for (const warning of warningArr) {
            let isOk = true
            for (const pWord of prohibitWord) {
              if (warning.includes(pWord)) {
                isOk = false
              }
            }
            if (isOk) {
              tempHtml += warning
            }
          }

          tempHtml += `<div>`
          tempHtml += `<br /><br />`
        }

        tempHtml += `<h3 style="font-size: 20px; !important"><strong>면책사항</strong></h3>`
        tempHtml += `<div style="font-size: 15px !important">`
        tempHtml += `<p>저희는 고객님이 수령 제품과 100% 동일한 사진을 사이트에 반영하기 위해 노력을 하고 있습니다. 하지만, 제품 제조사가 포장 혹은 성분을 업데이트하는 경우 사이트의 정보 업데이트까지 시간이 소요될 수 있습니다. 제품의 포장은 다를 수 있지만, 제품의 신선도는 저희가 보장해드립니다. 적절한 제품 사용을 위해 제품 포장에 기입된 내용을 기준으로 사용하시길 권장해드립니다.</p>`
        tempHtml += `<div>`
        tempHtml += `<br /><br />`

        tempHtml += `</div>`
        tempHtml += `<br /><br />`

        setItem({
          ...data.GetiHerbDetailAPI,
          html: tempHtml,
          korTitle: data.GetiHerbDetailAPI.korTitle
            .replace(/유기농/gi, "")
            .replace(/인증/gi, "")
            .replace(/제약/gi, "")
            .split(" ")
            .filter((item) => item.trim().length > 0)
            .map((item) => item.trim())
            .join(" ")
            .trim(),
          options: data.GetiHerbDetailAPI.options.map((item) => {
            return {
              ...item,
              //weight: item.weight ? item.weight :  Number(data.GetiHerbDetailAPI.shippingWeightInfo.map(item => item).sort((a, b) => a.title - b.title)[0].title),
              weight: item.weight ? item.weight : null,
              weightPrice: item.price < 20000 ? 0 : 5000,
              salePrice: getSalePrice(
                item.price,
                item.weight
                  ? item.weight
                  : Number(
                      data.GetiHerbDetailAPI.shippingWeightInfo
                        .map((item) => item)
                        .sort((a, b) => a.title - b.title)[0].title
                    ),
                data.GetiHerbDetailAPI.shippingWeightInfo
                  .map((item) => item)
                  .sort((a, b) => a.title - b.title),
                data.GetiHerbDetailAPI.marginInfo,
                data.GetiHerbDetailAPI.exchange
              ),
            }
          }),
        })
      } else if (data.GetiHerbDetailAPI && data.GetiHerbDetailAPI.isRegister) {
        setItem({
          isRegister: data.GetiHerbDetailAPI.isRegister,
        })
      }
    },
  })

  const addPriceCalc = (wian, weightPrice, margin, exchange) => {
    const addPrice = -(
      ((margin + 11) * Number(wian) + weightPrice * margin + 11 * weightPrice) /
      (margin - 89)
    )
    return addPrice
  }

  const getSalePrice = (wian, shippingWeight, shippingInfo, marginInfo, exchange) => {
    if (shippingInfo.length === 0) {
      return
    }
    let weightPrice = 0

    if (wian < 20000) {
      weightPrice = 5000
    } else {
      weightPrice = 0
    }
    let margin = 30
    let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(wian))

    if (marginArr.length > 0) {
      margin = Number(marginArr[0].price)
    } else {
      margin = Number(marginInfo[marginInfo.length - 1].price)
    }
    let addPrice = addPriceCalc(wian, weightPrice, margin, exchange)
    let salePrice = Math.ceil((Number(wian) + Number(addPrice) + Number(weightPrice)) * 0.1) * 10

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

  const handleProhibitOk = () => {
    setIsProhibitModalVisible(false)
  }

  const handleProhibitCancel = () => {
    setIsProhibitModalVisible(false)
  }

  useImperativeHandle(ref, () => ({
    showData() {
      try {
        if (Number(item.options[0].stock) === 0) {
          return null
        }
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

  if (
    networkStatus === NetworkStatus.loading ||
    (networkStatus === NetworkStatus.refetch && !item)
  ) {
    return (
      <Container>
        <div>
          <AsinLabel
            onClick={() => {
              shell.openExternal(url)
            }}
          >
            <img
              src="https://s3.images-iherb.com/static/i/favicon-iherb/favicon.ico"
              width="16px"
              style={{ marginRight: "5px" }}
            />
            {asin}
          </AsinLabel>
          <Skeleton.Avatar shape={"square"} active size={200} />
        </div>
        <div>
          <Skeleton active />
        </div>
      </Container>
    )
  }
  if (error) {
    console.log("에러남", error)
    if (typeof onComplete === "function") {
      onComplete(asin)
    }
    return (
      <ContainerError>
        <AsinLabel
          onClick={() => {
            shell.openExternal(url)
          }}
        >
          {asin}
        </AsinLabel>
        <AuctinoForm
          asin={asin}
          onDelete={onDelete}
          refetch={() => {
            setItem(null)
            refetch()
          }}
        />
        <Alert
          style={{ margin: "20px" }}
          message="상품 가져오기 실패"
          description={<div style={{ maxWidth: "900px" }}>{error.message}</div>}
          type="error"
        />
      </ContainerError>
    )
  }

  if (!item) {
    if (typeof onComplete === "function") {
      onComplete(asin)
    }
    return (
      <ContainerError>
        <AsinLabel
          onClick={() => {
            shell.openExternal(url)
          }}
        >
          <img
            src="https://s3.images-iherb.com/static/i/favicon-iherb/favicon.ico"
            width="16px"
            style={{ marginRight: "5px" }}
          />
          {asin}
        </AsinLabel>
        <AuctinoForm
          asin={asin}
          onDelete={onDelete}
          refetch={() => {
            setItem(null)
            refetch()
          }}
        />
        <Alert
          style={{ margin: "20px" }}
          message="상품 가져오기 실패1"
          description={<div style={{ maxWidth: "900px" }}>{url}</div>}
          type="error"
          showIcon
        />
      </ContainerError>
    )
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

  if (isRegister) {
    if (typeof onComplete === "function") {
      onComplete(asin)
    }
    return (
      <ContainerError>
        <AsinLabel
          onClick={() => {
            shell.openExternal(url)
          }}
        >
          <img
            src="https://s3.images-iherb.com/static/i/favicon-iherb/favicon.ico"
            width="16px"
            style={{ marginRight: "5px" }}
          />
          {asin}
        </AsinLabel>
        <AuctinoForm
          asin={asin}
          onDelete={onDelete}
          refetch={() => {
            setItem(null)
            refetch()
          }}
        />
        <Alert
          type="warning"
          showIcon
          message="중복 상품"
          description={<div style={{ maxWidth: "900px" }}>{url}</div>}
        />
      </ContainerError>
    )
  }

  if (options.length === 0) {
    if (typeof onComplete === "function") {
      onComplete(asin)
    }
    return (
      <ContainerError>
        <AsinLabel
          onClick={() => {
            shell.openExternal(url)
          }}
        >
          {asin}
        </AsinLabel>
        <AuctinoForm
          asin={asin}
          onDelete={onDelete}
          refetch={() => {
            setItem(null)
            refetch()
          }}
        />
        <Alert
          type="error"
          showIcon
          message="상품 가져오기 실패 - 옵션 없음"
          description={<div style={{ maxWidth: "900px" }}>{url}</div>}
          type="error"
        />
      </ContainerError>
    )
  }

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

  return (
    <Container>
      <div>
        <AsinLabel
          onClick={() => {
            shell.openExternal(url)
          }}
        >
          {asin}
        </AsinLabel>
        {Number(options[0].stock) === 0 && <OutOfStockLable>품절</OutOfStockLable>}
        <AuctinoForm
          asin={asin}
          onDelete={onDelete}
          refetch={() => {
            setItem(null)
            refetch()
          }}
        />
        <Image
          width={200}
          // height={200}
          src={mainImages[0].replace("/l/", "/m/")}
          fallback={mainImages[0]}
        />
      </div>
      <ContentContainer>
        <div>
          <TtitlArrayFlex>
            <div>
              {isKorModalVisible && (
                <KeywordModal
                  isModalVisible={isKorModalVisible}
                  handleOk={handleOk}
                  handleCancel={handleCancel}
                  title={korTitle}
                  keyword={selectKeyword}
                  mainImages={mainImages}
                />
              )}
              <TitleArrayComponent
                title={korTitle}
                titleArray={korTitleArray}
                SetSelectKeyword={SetSelectKeyword}
                showModal={showKorModal}
                ref={titleArrayRef}
              />
            </div>
            <div>
              {isModalVisible && (
                <KeywordModal
                  isModalVisible={isModalVisible}
                  handleOk={handleOk}
                  handleCancel={handleCancel}
                  title={title}
                  keyword={selectKeyword}
                  mainImages={mainImages}
                />
              )}
              <TitleArrayComponent
                title={title}
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
              <div
                style={{ cursor: "pointer" }}
                onClick={() => {
                  SetSelectKeyword("")
                  showModal()
                }}
              >
                상품명
              </div>
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
        <PriceLabel>{`${item.options[0].salePrice.toLocaleString("ko")}원`}</PriceLabel>
        <BottomContainer>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            {isProhibitModalVisible && (
              <HighligthModal
                isModalVisible={isProhibitModalVisible}
                handleOk={handleProhibitOk}
                handleCancel={handleProhibitCancel}
                text={item.engSentence}
                seachWords={item.prohibitWord}
              />
            )}
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => setIsProhibitModalVisible(true)}
              style={{ marginRight: "8px" }}
            >
              금지성분
            </Button>
            <div>
              {prohibitWord.map((item) => {
                return (
                  <Tooltip title="금지성분 의심">
                    <Tag key={item} color="red">
                      {item}
                    </Tag>
                  </Tooltip>
                )
              })}
            </div>
          </div>
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
                  USA
                  iHerb
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

export default IHerbUploadItem

const AuctinoForm = ({ asin, onDelete, refetch }) => {
  return (
    <ActionButtonContainer>
      <Popconfirm
        title="다시 불러오겠습니까?"
        onConfirm={() => {
          if (typeof refetch === "function") {
            refetch()
          }
        }}
        okText="네"
        cancelText="아니오"
      >
        <Button size="small" type="primary" shape="circle" icon={<RedoOutlined />} />
      </Popconfirm>
      <Popconfirm
        title="삭제 하시겠습니까?"
        onConfirm={() => {
          if (typeof onDelete === "function") {
            onDelete(asin)
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
const ContainerError = styled.div`
  padding: 25px;
  padding-top: 30px;
  margin: 25px;
  border: 1px solid lightgray;
  border-bottom-width: 5px;
  border-right-width: 5px;
  border-bottom-color: ${(props) => props.theme.primaryDark};
  border-right-color: ${(props) => props.theme.primaryDark};
  position: relative;
`

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
  top: -5px;
  background: #458500;
  color: white;
  font-size: 13px;
  font-weight: 700;
  display: flex;
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
  justify-content: space-between;
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

const PriceLabel = styled.div`
  text-align: right;
  margin-top: 10px;
  margin-bottom: -10px;
  font-size: 20px;
  font-weight: 700;
  color: #ff3377;
`

const TtitlArrayFlex = styled.div`
  display: flex;
  align-items: flex-start;
  & > :nth-child(1) {
    margin-right: 10px;
  }
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
