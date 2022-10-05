import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import {
  Divider,
  Tooltip,
  Input,
  Tag,
  Image,
  Button,
  Table,
  Checkbox,
  Spin,
  message,
  BackTop,
} from "antd"
import {
  DownloadOutlined,
  CloseOutlined,
  SearchOutlined,
  StarOutlined,
  StarFilled,
  DeleteOutlined,
  DeleteFilled,
} from "@ant-design/icons"
import { useQuery, useMutation } from "@apollo/client"
import {
  TAOBAO_IMAGE_LIST_URL,
  TRANSLATE_PAPAGO,
  GET_TAOBAO_DETAIL_API,
  SET_NAVER_EXCEPT,
  SET_NAVER_ITEM_FAVORITE,
} from "../../../gql"
import { useLocation } from "react-router-dom"
import { UserContext } from "context/UserContext"
import queryString from "query-string"
import {
  KeywordModal,
  TitleArrayComponent,
  TaobaoImageSearchButton,
  MainImageModal,
  OptionModal,
  DetailFormModal,
} from "components"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { shell } = window.require("electron")

const NaverStorePlusItem = forwardRef(
  ({ loading, list, shippingPrice, handleTableChange, pagination, mode }, ref) => {
    const [data, setData] = useState([])
    const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)

    const location = useLocation()
    const query = queryString.parse(location.search)

    const newWindow = query && query.newWindow === "true" ? true : false

    useImperativeHandle(ref, () => ({
      getData() {
        return data
      },
      showAlert() {
        console.log("data", data)
        return data
          .filter((item) => item.detailUrl && item.detailUrl.length > 0)
          .filter((item) => item.options && item.options.length > 0)
          .map((item) => {
            return {
              categoryId: item.categoryId,
              content: item.content,
              detail: item.detail,
              detailUrl: item.detailUrl,
              html: item.html,
              isClothes: item.isClothes,
              isShoes: item.isShoes,
              mainImages: item.mainImages,
              options: item.options.map((item) => {
                return {
                  key: item.key,
                  propPath: item.propPath,
                  value: item.value,
                  korKey: item.korKey,
                  korValue: item.korValue,
                  image: item.image,
                  price: item.price,
                  productPrice: item.productPrice ? item.productPrice : item.salePrice,
                  salePrice: item.salePrice,
                  weightPrice: item.weightPrice,
                  stock: item.stock,
                  disabled: item.disabled,
                  active: item.active,
                  base: item.base,
                  attributes: item.attributes.map((aItem) => {
                    return {
                      attributeTypeName: aItem.attributeTypeName,
                      attributeValueName: aItem.attributeValueName,
                    }
                  }),
                  cafe24_variant_code: item.cafe24_variant_code,
                  coupang_sellerProductItemId: item.coupang_sellerProductItemId,
                  coupang_vendorItemId: item.coupang_vendorItemId,
                }
              }),
              productNo: item.productNo,
              prop: item.prop.map((item) => {
                return {
                  korTypeName: item.korTypeName,
                  name: item.naem,
                  pid: item.pid,
                  values: item.values
                    .filter((vItem) => !vItem.disabled)
                    .map((vItem) => {
                      return {
                        image: vItem.image,
                        korValueName: vItem.korValueName,
                        name: vItem.name,
                        vid: vItem.vid,
                      }
                    }),
                }
              }),
              sellerTags: item.sellerTags,
              title: item.title,
              type: item.type,
            }
          })

        return data.filter((item) => item.detailUrl && item.detailUrl.length > 0)
      },
      scrollTop() {
        let list = document.getElementById("listcontainer")
        if (list) {
          list.scrollIntoView()
        }
      },
    }))

    const setTitle = (index, productNo, title) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            console.log("item.index", item, index)
            if (item.index === index) {
              item.title = title
            }
          } else {
            if (item.productNo === productNo) {
              item.title = title
            }
          }

          return item
        })
      )
    }
    const setDetailUrl = (index, productNo, url) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.detailUrl = url
            }
          } else {
            if (item.productNo === productNo) {
              item.detailUrl = url
            }
          }
          return item
        })
      )
    }

    const setClothes = (index, productNo, clothes) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.isClothes = clothes
            }
          } else {
            if (item.productNo === productNo) {
              item.isClothes = clothes
            }
          }
          return item
        })
      )
    }
    const setShoes = (index, productNo, shoes) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.isShoes = shoes
            }
          } else {
            if (item.productNo === productNo) {
              item.isShoes = shoes
            }
          }
          return item
        })
      )
    }

    const setMainImage = (index, productNo, mainImages) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.mainImages = mainImages
            }
          } else {
            if (item.productNo === productNo) {
              item.mainImages = mainImages
            }
          }

          return item
        })
      )
    }

    const setOptions = (index, productNo, options) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.options = options
            }
          } else {
            if (item.productNo === productNo) {
              item.options = options
            }
          }
          return item
        })
      )
    }
    const setProp = (index, productNo, prop) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.prop = prop
            }
          } else {
            if (item.productNo === productNo) {
              item.prop = prop
            }
          }
          return item
        })
      )
    }

    const setContent = (index, productNo, content) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.content = content
            }
          } else {
            if (item.productNo === productNo) {
              item.content = content
            }
          }
          return item
        })
      )
    }

    const setHtml = (index, productNo, html) => {
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.html = html
            }
          } else {
            if (item.productNo === productNo) {
              item.html = html
            }
          }
          return item
        })
      )
    }

    const setRootExcept = (index, productNo, isDelete) => {
      // console.log("index, productNo", index, productNo)
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.isDelete = isDelete
            }
          } else {
            if (item.productNo === productNo) {
              item.isDelete = isDelete
            }
          }
          return item
        })
      )
    }
    const setRootFavorite = (index, productNo, isFavorite) => {
      // console.log("index, productNo", index, productNo)
      setData(
        data.map((item) => {
          if (!productNo) {
            if (item.index === index) {
              item.isFavorite = isFavorite
            }
          } else {
            if (item.productNo === productNo) {
              item.isFavorite = isFavorite
            }
          }
          return item
        })
      )
    }

    useEffect(() => {
      setData(
        list.map((item) => {
          return {
            ...item,
            title: item.name,
            detail: item && item.detailUrl ? item.detailUrl : "",
            detailUrl: item && item.detail ? item.detail : "",
            isClothes: item.isClothes,
            isShoes: item.isShoes,
            shippingWeight: shippingPrice[0].title,
          }
        })
      )
    }, [list])

    const columns = [
      {
        render: (data, _, index) => {
          return (
            <NaverItem
              key={index}
              {...data}
              mode={mode}
              imageListUrl={imageListUrl}
              index={index}
              setRootTitle={setTitle}
              setRootDetailUrl={setDetailUrl}
              setRootShoes={setShoes}
              setRootClothes={setClothes}
              shippingPrice={shippingPrice}
              setRootMainImage={setMainImage}
              setRootOptions={setOptions}
              setRootProp={setProp}
              setRootContent={setContent}
              setRootHtml={setHtml}
              setRootExcept={setRootExcept}
              setRootFavorite={setRootFavorite}
            />
          )
        },
      },
    ]

    let paginationValue = {}
    if (mode === "1") {
      paginationValue = false
    } else {
      paginationValue = {
        position: ["topRight", "bottomRight"],
        ...pagination,
      }
    }
    return (
      <ListContainer newWindow={newWindow}>
        <BackTop />
        <Table
          scrollToFirstRowOnChange={true}
          showHeader={false}
          columns={columns}
          dataSource={data.filter((item) => !item.except)}
          loading={loading}
          pagination={paginationValue}
          onChange={handleTableChange}
        />
        {/* {data.map((item, index) => {

        return (
          <NaverItem key={index} {...item} imageListUrl={imageListUrl} index={index}
            setRootTitle={setTitle} 
            setRootDetailUrl={setDetailUrl}
            setRootShoes={setShoes}
            setRootClothes={setClothes}
            shippingPrice={shippingPrice}
            setRootMainImage={setMainImage}
            setRootOptions={setOptions}
            setRootProp={setProp}
            setRootContent={setContent}
            setRootHtml={setHtml}
          />
        )
      })} */}
        {/* {loading && <SpinContainer>
        <Spin
          style={{ color: "white", fontWeight: "700", fontSize: "16px" }}
          size="large"
          tip="새로운 상품을 소싱하고 있습니다...이 작업은 시간이 걸릴수도 있습니다...."
          indicator={
            <LoadingOutlined
              style={{ fontSize: 48, marginBottom: "20px", color: "white" }}
              spin
            />
          }
        />
      </SpinContainer>} */}
      </ListContainer>
    )
  }
)

export default NaverStorePlusItem

const ListContainer = styled.div`
  /* min-height: calc(100vh - 150px);
  ${ifProp(
    "newWindow",
    css`
      min-height: calc(100vh - 130px);
    `
  )};
  position: relative;
  & > div {
    margin-bottom: 40px;
  } */
`

const NaverItem = ({
  mode,
  isRegister,
  isFavorite,
  isDelete,
  type,
  image,
  sellerTags,
  displayName,
  shippingPrice,
  productNo,
  categoryId,
  category1,
  category2,
  category3,
  category4,
  vendorName,
  detail,
  title,
  titleArray,
  imageListUrl,
  index,
  reviewCount,
  zzim,
  purchaseCnt,
  recentSaleCount,
  setRootTitle,
  setRootDetailUrl,
  setRootClothes,
  setRootShoes,
  detailUrl,
  isClothes,
  isShoes,
  setRootMainImage,
  setRootOptions,
  setRootProp,
  setRootContent,
  setRootHtml,
  setRootExcept,
  setRootFavorite,
}) => {
  const [taobaoList, setTaobaoList] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modifyTitle, setModifyTitle] = useState(
    displayName && title ? title.replace(displayName, "").trim() : title
  )
  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)
  const [selectedUrl, SetSelectedUrl] = useState("")
  const [selectKeyword, SetSelectKeyword] = useState("")

  const [isTaobaoDetailLoading, setTaobaoDetailLoading] = useState(false)
  const [existTaobaoDetail, setExistTaobaoDetail] = useState(false)
  const [getTaobaoDetail] = useMutation(GET_TAOBAO_DETAIL_API)

  const titleArrayRef = useRef()

  const [isMainImageModalVisible, setMainImageModalVisible] = useState(false)
  const [isOptionModalVisible, setOptionModalVisible] = useState(false)
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)

  const [mainImages, setMainImaes] = useState([])
  const [option, setOption] = useState([])
  const [prop, setProp] = useState([])
  const [content, setContent] = useState([])
  const [html, setHtml] = useState([])

  const [exchange, setExchange] = useState("")
  const [marginInfo, setMarginInfo] = useState([])
  const [shippingWeightInfo, setShippingWeightInfo] = useState([])

  const [setExcept] = useMutation(SET_NAVER_EXCEPT)
  const [setFavorite] = useMutation(SET_NAVER_ITEM_FAVORITE)

  const { user } = useContext(UserContext)

  useEffect(() => {
    const tempTitle = (displayName && title ? title.replace(displayName, "").trim() : title) || ""
    const tempTitleArr = tempTitle.split(" ").filter((item) => {
      if (item.length === 0) {
        return false
      }
      const tempArr = titleArray.filter((fItme) => {
        if (fItme.word === item && fItme.ban.includes(item)) {
          return true
        }
        return false
      })
      if (tempArr.length > 0) {
        return false
      }
      return true
    })
    const modify = tempTitleArr.join(" ")

    setModifyTitle(modify)
  }, [title])

  useEffect(() => {
    SetSelectedUrl(detailUrl)
  }, [detailUrl])

  useEffect(() => {
    setClothes(isClothes)
  }, [isClothes])

  useEffect(() => {
    setShose(isShoes)
  }, [isShoes])

  const getPurchaseLable = ({
    reviewCount = 0,
    zzim = 0,
    purchaseCnt = 0,
    recentSaleCount = 0,
  }) => {
    return (
      <PurchaseContainer>
        <PurchaseItem>
          <PurchaseCount>{`${reviewCount.toLocaleString("ko")}`}</PurchaseCount>
          <PurchaseTitle>리뷰</PurchaseTitle>
        </PurchaseItem>
        <PurchaseItem>
          <PurchaseCount>{`${zzim.toLocaleString("ko")}`}</PurchaseCount>
          <PurchaseTitle>찜</PurchaseTitle>
        </PurchaseItem>
        <PurchaseItem>
          <PurchaseCount>{`${purchaseCnt.toLocaleString("ko")}`}</PurchaseCount>
          <PurchaseTitle>최근 6개월</PurchaseTitle>
        </PurchaseItem>
        <PurchaseItemColor>
          <PurchaseCount>{`${recentSaleCount.toLocaleString("ko")}`}</PurchaseCount>
          <PurchaseTitle>최근 3일</PurchaseTitle>
        </PurchaseItemColor>
      </PurchaseContainer>
    )
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false)
    SetSelectKeyword("")
    setModifyTitle(`${selectKeyword}`)
    setRootTitle(index, productNo, `${selectKeyword}`)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    SetSelectKeyword("")
  }

  const selectItem = ({ url }) => {
    SetSelectedUrl(url)
    setRootDetailUrl(index, productNo, url)
  }

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

  const getTaobaoItem = async () => {
    setExistTaobaoDetail(false)
    if (selectedUrl.length === 0) {
      message.error("타오바오 상세페이지를 확인해 주세요.")
      return
    }
    try {
      setTaobaoDetailLoading(true)
      const response = await getTaobaoDetail({
        variables: {
          url: selectedUrl,
          title: modifyTitle,
        },
      })
      console.log("response", response)
      if (response && response.data && response.data.GetTaobaoDetailAPI) {
        setExistTaobaoDetail(true)
        // taobaoDetail = response.data.GetTaobaoDetailAPI
        setMainImaes(response.data.GetTaobaoDetailAPI.mainImages)
        setRootMainImage(index, productNo, response.data.GetTaobaoDetailAPI.mainImages)
        setOption(
          response.data.GetTaobaoDetailAPI.options.map((item) => {
            return {
              ...item,
              weight: item.weight ? item.weight : 1,
              weightPrice: Number(
                response.data.GetTaobaoDetailAPI.shippingWeightInfo.sort(
                  (a, b) => a.title - b.title
                )[0].price
              ),
              salePrice: getSalePrice(
                item.price,
                1,
                response.data.GetTaobaoDetailAPI.shippingWeightInfo.sort(
                  (a, b) => a.title - b.title
                ),
                response.data.GetTaobaoDetailAPI.marginInfo,
                mode === "5"
                  ? response.data.GetTaobaoDetailAPI.exchange / 100
                  : response.data.GetTaobaoDetailAPI.exchange
              ),
            }
          })
        )
        setRootOptions(
          index,
          productNo,
          response.data.GetTaobaoDetailAPI.options.map((item) => {
            return {
              ...item,
              weight: item.weight ? item.weight : 1,
              weightPrice: Number(
                response.data.GetTaobaoDetailAPI.shippingWeightInfo.sort(
                  (a, b) => a.title - b.title
                )[0].price
              ),
              salePrice: getSalePrice(
                item.price,
                1,
                response.data.GetTaobaoDetailAPI.shippingWeightInfo.sort(
                  (a, b) => a.title - b.title
                ),
                response.data.GetTaobaoDetailAPI.marginInfo,
                mode === "5"
                  ? response.data.GetTaobaoDetailAPI.exchange / 100
                  : response.data.GetTaobaoDetailAPI.exchange
              ),
            }
          })
        )
        setProp(response.data.GetTaobaoDetailAPI.prop)
        setRootProp(index, productNo, response.data.GetTaobaoDetailAPI.prop)
        setContent(response.data.GetTaobaoDetailAPI.content)
        setRootContent(index, productNo, response.data.GetTaobaoDetailAPI.content)

        let tempHtml = ``
        tempHtml += `<hr >`
        if (Array.isArray(response.data.GetTaobaoDetailAPI.content)) {
          for (const item of response.data.GetTaobaoDetailAPI.content) {
            tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
          }
        }
        setHtml(tempHtml)
        setRootHtml(index, productNo, tempHtml)

        setExchange(
          mode === "5"
            ? response.data.GetTaobaoDetailAPI.exchange / 100
            : response.data.GetTaobaoDetailAPI.exchange
        )
        setMarginInfo(response.data.GetTaobaoDetailAPI.marginInfo)
        setShippingWeightInfo(response.data.GetTaobaoDetailAPI.shippingWeightInfo)
      }
    } catch (e) {
      console.log("errpr", e)
    } finally {
      setTaobaoDetailLoading(false)
    }
  }

  const handleOkMainImae = (value) => {
    setMainImageModalVisible(false)
    setMainImaes(value)
    setRootMainImage(index, productNo, value)
  }
  const handleOkOption = (option, prop) => {
    setOptionModalVisible(false)
    setOption(option)
    setRootOptions(index, productNo, option)
    setProp(prop)
    setRootProp(index, productNo, prop)
  }
  const handleOkDetail = (detailHtml) => {
    setDetailModalVisible(false)
    setHtml(detailHtml)
    setRootHtml(index, productNo, detailHtml)
  }

  const handleCancelMainImae = () => {
    setMainImageModalVisible(false)
  }
  const handleCancelOption = () => {
    setOptionModalVisible(false)
  }
  const handleCancelDetail = () => {
    setDetailModalVisible(false)
  }

  const handleExcept = async (isDelete) => {
    setRootExcept(index, productNo, isDelete)
    const response = await setExcept({
      variables: {
        productNo,
        isDelete,
      },
    })
    console.log("response", response)
  }

  const handleFavorite = async (isFavorite) => {
    setRootFavorite(index, productNo, isFavorite)
    const response = await setFavorite({
      variables: {
        productNo,
        isFavorite: true,
      },
    })
    console.log("response", response)
    // if (response.data.SetNaverItemFavorite) {

    // }
  }
  return (
    <div>
      <Divider orientation="left">{`${displayName}`}</Divider>
      <ContentContainer isRegister={isRegister}>
        {image && (
          <div>
            <Image
              width={232}
              height={232}
              src={`${image}?type=f232_232`}
              preview={{
                src: image,
              }}
            />
            <DownloadContainer>
              <a href={image} download>
                <Tooltip title="이미지를 내컴퓨터에 저장">
                  <Button icon={<DownloadOutlined />} block>
                    다운
                  </Button>
                </Tooltip>
              </a>
              <TaobaoImageSearchButton
                image={`${image}?type=f200`}
                title={title}
                selectItem={selectItem}
                searchClick={(list) => {
                  setTaobaoList(list)
                  if (titleArrayRef) {
                    titleArrayRef.current.getKiprisSearch()
                  }
                }}
              />
            </DownloadContainer>
          </div>
        )}
        <ItemContent>
          <div>
            <div>
              <TitleArrayContainer>
                <Button
                  onClick={() => {
                    if (detail) {
                      shell.openExternal(detail)
                    }
                  }}
                >
                  상세
                </Button>
                {title && (
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SearchOutlined />}
                    onClick={() =>
                      shell.openExternal(
                        `https://search.shopping.naver.com/search/all?query=${title}`
                      )
                    }
                  ></Button>
                )}
                <TitleArrayComponent
                  title={title}
                  titleArray={titleArray}
                  SetSelectKeyword={SetSelectKeyword}
                  showModal={showModal}
                  ref={titleArrayRef}
                />

                {mode === "3" && isFavorite && productNo && (
                  <StarFilled
                    style={{
                      fontSize: "36px",
                      cursor: "pointer",
                      color: "#fdd835",
                      marginRight: "20px",
                      padding: "10px",
                    }}
                    onClick={() => handleFavorite(false)}
                  />
                )}
                {mode === "3" && !isFavorite && productNo && (
                  <StarOutlined
                    style={{
                      fontSize: "36px",
                      cursor: "pointer",
                      marginRight: "20px",
                      padding: "10px",
                    }}
                    onClick={() => handleFavorite(true)}
                  />
                )}

                {(mode === "3" || mode === "4") && productNo && isDelete && (
                  <DeleteFilled
                    style={{
                      fontSize: "36px",
                      cursor: "pointer",
                      color: "#FF3377",
                      marginRight: "20px",
                      padding: "10px",
                    }}
                    onClick={() => handleExcept(false)}
                  />
                )}
                {(mode === "3" || mode === "4") && !isDelete && productNo && (
                  <DeleteOutlined
                    style={{
                      fontSize: "36px",
                      cursor: "pointer",
                      marginRight: "20px",
                      padding: "10px",
                    }}
                    onClick={() => handleExcept(true)}
                  />
                )}

                {/* <Button
                icon={<StarOutlined />}
                style={{
                  background: "#ffff6b",
                  borderBottomWidth: "3px",
                  borderBottomColor: "#fdd835",
                  borderBottomStyle: "solid",
                  borderRightWidth: "3px",
                  borderRightColor: "#fdd835",
                  borderRightStyle: "solid",
                  marginBottom: "10px",
                  marginLeft: "1px",
                  marginRight: "1px",
                }}
                onClick={() => {
                  const value = {
                    type,
                    productNo,
                    displayName,
                    detailUrl,
                    title: modifyTitle,
                    categoryId,
                    image,
                    sellerTags,
                    reviewCount,
                    zzim,
                    purchaseCnt,
                    recentSaleCount
                  }
                  console.log("VALUE", value)
                }}
                /> */}
              </TitleArrayContainer>
            </div>
            <TitleKeywordContainer>
              <Input
                size="large"
                addonBefore="상품명"
                placeholder="상품 제목을 선택해주세요."
                allowClear
                value={modifyTitle}
                onChange={(e) => {
                  setModifyTitle(e.target.value)
                }}
                onBlur={(e) => {
                  setRootTitle(index, productNo, e.target.value)
                }}
                border={false}
                style={{
                  border: "3px solid #512da8",
                }}
              />
              <KeywordModal
                isModalVisible={isModalVisible}
                handleOk={handleOk}
                handleCancel={handleCancel}
                title={title}
                keyword={selectKeyword}
                categoryId={categoryId}
                category1={category1}
                category2={category2}
                category3={category3}
                category4={category4}
              />
              <Button
                border={false}
                style={{
                  // border: "6px solid #512da8",
                  background: "#512da8",
                  color: "white",
                  height: "46px",
                }}
                onClick={showModal}
              >
                키워드
              </Button>
            </TitleKeywordContainer>
            {mode !== "3" && (
              <TitleKeywordContainer>
                <Input
                  size="large"
                  addonBefore="URL"
                  placeholder="등록할 상품의 상세주소를 입력해 주세요."
                  allowClear
                  value={selectedUrl}
                  border={false}
                  onChange={(e) => {
                    SetSelectedUrl(e.target.value)
                  }}
                  onBlur={(e) => {
                    setRootDetailUrl(index, productNo, e.target.value)
                  }}
                  disabled={isRegister}
                  style={{ border: "3px solid #512da8" }}
                />
                <Button
                  border={false}
                  loading={isTaobaoDetailLoading}
                  style={{
                    // border: "6px solid #512da8",
                    background: "#512da8",
                    color: "white",
                    height: "46px",
                  }}
                  onClick={getTaobaoItem}
                >
                  디테일
                </Button>
              </TitleKeywordContainer>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
              <div style={{ minWidth: "100px" }}>
                {getPurchaseLable({ reviewCount, zzim, purchaseCnt, recentSaleCount })}
              </div>
              <div style={{ display: "flex" }}>
                <div style={{ display: "flex", marginRight: "20px" }}>
                  <div>
                    <Checkbox
                      style={{ padding: "15px", fontSize: "16px" }}
                      checked={clothes}
                      onChange={(e) => {
                        setClothes(e.target.checked)
                        setRootClothes(index, productNo, e.target.checked)
                      }}
                    >
                      의류
                    </Checkbox>
                  </div>
                  <div>
                    <Checkbox
                      style={{ padding: "15px", fontSize: "16px" }}
                      checked={shoes}
                      onChange={(e) => {
                        setShose(e.target.checked)
                        setRootShoes(index, productNo, e.target.checked)
                      }}
                    >
                      신발
                    </Checkbox>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}></div>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: "13px" }}>
            {sellerTags &&
              Array.isArray(sellerTags) &&
              sellerTags.map((item, index) => (
                <div
                  key={index}
                  style={{ marginRight: "5px", color: "#c6a700" }}
                >{`#${item} `}</div>
              ))}
          </div>
          {isTaobaoDetailLoading && !existTaobaoDetail && (
            <DetailButtonContainer>
              <Spin />
            </DetailButtonContainer>
          )}
          <DetailButtonContainer>
            {mainImages && mainImages.length > 0 && (
              <>
                <Button onClick={() => setMainImageModalVisible(true)}>메인이미지</Button>
                <MainImageModal
                  isModalVisible={isMainImageModalVisible}
                  handleOk={handleOkMainImae}
                  handleCancel={handleCancelMainImae}
                  mainImages={mainImages}
                />
              </>
            )}
            {option && option.length > 0 && (
              <>
                <Button onClick={() => setOptionModalVisible(true)}>옵션</Button>
                <OptionModal
                  isModalVisible={isOptionModalVisible}
                  handleOk={handleOkOption}
                  handleCancel={handleCancelOption}
                  option={option}
                  prop={prop}
                  exchange={mode === "5" ? exchange / 100 : exchange}
                  marginInfo={marginInfo}
                  shippingWeightInfo={shippingWeightInfo}
                />
              </>
            )}
            {content && content.length > 0 && (
              <>
                <Button onClick={() => setDetailModalVisible(true)}>상세페이지</Button>
                <DetailFormModal
                  isModalVisible={isDetailModalVisible}
                  handleOk={handleOkDetail}
                  handleCancel={handleCancelDetail}
                  content={content}
                />
              </>
            )}
          </DetailButtonContainer>
        </ItemContent>
      </ContentContainer>

      {taobaoList && taobaoList.length > 0 && (
        <Wrapper>
          <CloseButtonContainer>
            <Button shape="circle" icon={<CloseOutlined />} onClick={() => setTaobaoList([])} />
          </CloseButtonContainer>
          <TaobaoListWarpper>
            <TaobaoImageContainer>
              {taobaoList.map((item, index) => (
                <ItemContainer key={item.num_iid}>
                  <div>
                    <Tooltip title="선택">
                      <ItemImageContainer
                        onClick={() => {
                          selectItem({ url: item.auctionURL })
                          setTaobaoList([])
                        }}
                      >
                        <ItemImage src={item.pic_path} alt={item.title} />
                      </ItemImageContainer>
                    </Tooltip>
                    {index < 6 && <TitleComponent item={item} />}
                    {index >= 6 && <TitleComponent item={item} />}
                  </div>
                  <PriceSalesContainer>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      {item.iconList === "tmall" && (
                        <img
                          src="https://img.alicdn.com/tfs/TB1XlF3RpXXXXc6XXXXXXXXXXXX-16-16.png"
                          style={{ marginRight: "5px", width: "16px", height: "16px" }}
                        />
                      )}
                      <Tooltip title={`${Number(item.price * 175).toLocaleString("ko")}원`}>
                        <PriceLabel>{`¥${item.price}`}</PriceLabel>
                      </Tooltip>
                    </div>
                    <Tooltip
                      title={
                        <div>
                          <div>{`최근 판매: ${Number(item.sold).toLocaleString("ko")}`}</div>
                          <div>{` 총 판매: ${Number(item.totalSold).toLocaleString("ko")}`}</div>
                          <div>{`리뷰: ${Number(item.commentCount).toLocaleString("ko")}`}</div>
                        </div>
                      }
                    >
                      <SalesLabel>{`${Number(item.sold).toLocaleString("ko")}/${Number(
                        item.totalSold
                      ).toLocaleString("ko")}(${Number(item.commentCount).toLocaleString(
                        "ko"
                      )})`}</SalesLabel>
                    </Tooltip>
                  </PriceSalesContainer>
                </ItemContainer>
              ))}
            </TaobaoImageContainer>
          </TaobaoListWarpper>
        </Wrapper>
      )}
    </div>
  )
}

const ItemContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const TitleArrayContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 53px;
    max-width: 53px;
    margin-right: 10px;
  }
  & > :nth-child(2) {
    min-width: 33px;
    max-width: 33px;
    margin-right: 20px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
`
const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 1.6;
  & > :not(:last-child) {
    margin-right: 3px;
  }
`

const ContentContainer = styled.div`
  display: flex;

  & > :nth-child(1) {
    margin-right: 20px;
  }
  & > :last-child {
    width: 100%;
  }

  ${ifProp(
    "isRegister",
    css`
      background: rgba(255, 0, 0, 0.2);
    `
  )};
`
const ImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* align-items: center; */
  margin-left: -12px;
`
const DownloadContainer = styled.div`
  margin-top: 5px;
  display: flex;
  align-items: center;
  & > :nth-child(n) {
    flex: 1;
  }
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const TitleKeywordContainer = styled.div`
  display: flex;
  align-items: stretch;
  margin-bottom: 6px;
  & > :nth-child(1) {
    width: 100%;
  }
  & > :nth-child(2) {
    min-width: 80px;
    max-width: 80px;
    margin-left: 5px;
  }
`
const TitleSpan = styled.span`
  cursor: pointer;
  &:hover {
    font-weight: 700;
  }
`

const TitleTag = styled(Tag)`
  cursor: pointer;
  &:hover {
    font-weight: 700;
  }
`

const Wrapper = styled.div`
  position: relative;
`
const TaobaoListWarpper = styled(SimpleBar)`
  max-height: 340px;
  margin-top: 20px;
  margin-left: 10px;
  margin-right: 10px;
  padding: 20px 0 20px 0;
  border: 3px solid #ff3377;
`

const CloseButtonContainer = styled.div`
  position: absolute;
  top: 5px;
  right: 15px;
  z-index: 100;
`
const TaobaoImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`

const ItemContainer = styled.div`
  padding: 6px;
  margin-bottom: 20px;
  width: 208px;
  height: 310px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ItemImageContainer = styled.div`
  overflow: hidden;
  border: 2px solid lightgray;
  &:hover {
    border: 2px solid #512da8;
  }
`
const ItemImage = styled.img`
  width: 100%;
  height: 222px;
  cursor: pointer;
  transition: all ease 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`

const Title = styled.div`
  font-size: 11px;
  line-height: 1.2;
  margin-top: 8px;
  margin-bottom: 8px;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

const PriceSalesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const PriceLabel = styled.div`
  color: #f40;
  font-weight: 700;
  font-size: 16px;
`
const SalesLabel = styled.div``

const TitleKorComponent = ({ item }) => {
  const [title, setTitle] = useState(item.title)
  const { networkStatus, refetch, data } = useQuery(TRANSLATE_PAPAGO, {
    variables: {
      text: item.title,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setTitle(data.TranslatePapago)
    },
  })

  return (
    <Tooltip title={item.title}>
      <Title
        onClick={() => {
          shell.openExternal(item.auctionURL)
        }}
      >
        {title}
      </Title>
    </Tooltip>
  )
}

const TitleComponent = ({ item }) => {
  const [title, setTitle] = useState(item.title)
  // const {networkStatus, refetch, data} = useQuery(TRANSLATE_PAPAGO, {
  //   variables: {
  //     text: item.title
  //   },
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data=> {
  //     setTitle(data.TranslatePapago)
  //   }
  // })

  return (
    // <Tooltip title={item.title}>
    <Title
      onClick={() => {
        shell.openExternal(item.auctionURL)
      }}
    >
      {title}
    </Title>
    // </Tooltip>
  )
}

const PurchaseContainer = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
`

const PurchaseItem = styled.div`
  cursor: pointer;
  width: 90px;
  height: 90px;
  border-radius: 5px;
  border: 1px solid #ededed;
  margin-right: 6px;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  box-shadow: 2px 2px 2px #ebebeb;
`
const PurchaseItemColor = styled(PurchaseItem)`
  background: #ffe95c;
`
const PurchaseTitle = styled.div`
  text-align: center;
  font-size: 14px;
  margin-top: 12px;
  color: #666666;
`

const PurchaseCount = styled.div`
  text-align: center;
  font-size: 22px;
  font-weight: 700;
`

const DetailButtonContainer = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  & > :nth-child(n) {
    margin-left: 5px;
  }
`
