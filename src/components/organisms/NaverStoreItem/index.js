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
  Select,
  Checkbox,
  BackTop,
  Spin,
  message,
  Collapse
} from "antd"
import {
  DownloadOutlined,
  LoadingOutlined,
  CloseOutlined,
  DeleteOutlined,
  DeleteFilled,
  CopyOutlined,
  FileExcelOutlined
} from "@ant-design/icons"
import { useQuery, useMutation } from "@apollo/client"
import {
  TAOBAO_IMAGE_LIST_URL,
  TRANSLATE_PAPAGO,
  SET_NAVER_EXCEPT,
  OPTIMIZATION_PRODUCT_NAME,
} from "../../../gql"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import {
  KeywordModal,
  TitleArrayComponent,
  TaobaoImageSearchButton,
  ProductImageModal,
  SourcingTable,
  ExcelImport,
  DetailFormModal,
  SimilarProductModal
} from "components"
import { RandomWords, AmazonAsin } from "../../../lib/userFunc"
import { CopyToClipboard } from "react-copy-to-clipboard"

import _ from "lodash"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { Panel } = Collapse;
const { Option } = Select
const { shell } = window.require("electron")

const NaverStoreItem = forwardRef(({ loading, list, shippingPrice, mode }, ref) => {
  const [data, setData] = useState([])
  const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)
  const [optimizationProductName] = useMutation(OPTIMIZATION_PRODUCT_NAME)
  const [optimizationLoading, setOptimizationLoading] = useState(false)
  const location = useLocation()
  const query = queryString.parse(location.search)
  const [before, setBefore] = useState("")
  const [keywordTag, setKeywordTag] = useState("")
  const [word, setWord] = useState("")
  const newWindow = query && query.newWindow === "true" ? true : false
  const [isProductImageModalVisible, setProductImageModalVisible] = useState(false)
  const [isKeywordModalVisible, setKeywordModalVisible] = useState(false)

  const [isExcelModalVisible, setIsExcelModalVisible] = useState(false)

  const [setExcept] = useMutation(SET_NAVER_EXCEPT)

  const showExcelModal = () => {
    setIsExcelModalVisible(true)
  }

  const handleExcelOk = () => {
    setIsExcelModalVisible(false)
    
  }

  const handleExcelCancel = () => {
    setIsExcelModalVisible(false)
  }

  useImperativeHandle(ref, () => ({
    showAlert() {
      setBefore("")
      setWord("")
      if(mode === "7") {
        // 나의 팔린 아이템
        return data.map(item => {
          return {
            ...item,
            saled: true
          }
        })
      } else {
        return data.filter(
          (item) =>
            item.isChecked &&
            item.detailUrl &&
            item.detailUrl.length > 0 &&
            item.title &&
            item.title.length > 0
        )
      }
      
    },
    scrollTop() {
      let list = document.getElementById("listcontainer")
      if (list) {
        list.scrollIntoView()
      }
    },
  }))

  const setRigister = (index, register) => {
    setData(
      data.filter(item => item.isChecked).map((item, i) => {
        if (i === index) {
          item.isRegister = register
        }
        return item
      })
    )
  }
  const setTitle = (index, title) => {
    setData(
      data.filter(item => item.isChecked).map((item, i) => {
        if (i === index) {
          item.title = title
        }
        return item
      })
    )
  }

  const setBeforeTitle = (title) => {
    setData(
      data
      .filter(item => item.isChecked).map((item) => {
        item.title = `${title} ${item.title}`
        return item
      })
    )
  }

  const handleOptimization = async () => {
    try {
      setOptimizationLoading(true)
      const tempData = data.filter(item => item.isChecked)
      for (const item of tempData) {
        if (item.title && item.title.length > 0) {
          const response = await optimizationProductName({
            variables: {
              title: item.title,
            },
          })
          console.log("response", response)
          if (response.data.OptimizationProductName) {
            item.title = response.data.OptimizationProductName
          }
        }
        
        if(item.subItems && item.subItems.length > 0){
          for(const subItem of item.subItems) {
            if (subItem.korTitle && subItem.korTitle.length > 0) {
              const response = await optimizationProductName({
                variables: {
                  title: subItem.korTitle,
                },
              })
              console.log("responseSUB", response)
              if (response.data.OptimizationProductName) {
                subItem.korTitle = response.data.OptimizationProductName
              }
            }
          }
        }
      }
      setData(tempData)
    } catch (e) {
      console.log("handleOptimization", e)
    } finally {
      setOptimizationLoading(false)
    }
  }

  const setRandomTitle = (words) => {
    console.log("words.length", words.length)
    if (data.length > words.length) {
      message.error("조합할 키워드 갯수가 부족합니다.")
      return
    }
    setData(
      data.map((item) => {
        let randNum = Math.floor(Math.random() * (words.length - 0 + 1)) + 0
        const titles = data.map((item) => item.title)
        while (titles.includes(words[randNum])) {
          randNum = Math.floor(Math.random() * (words.length - 0 + 1)) + 0
        }
        item.title = words[randNum]

        // item.title = `${title} ${item.title}`
        // console.log("item.title", item.title)
        return item
      })
    )
  }

  const setWeightPrice = (title) => {
    setData(
      data
      .filter(item => item.isChecked).map((item) => {
        item.shippingWeight = title
        return item
      })
    )
  }

  const setDetailUrl = (index, url) => {
    setData(
      data
      .filter(item => item.isChecked).map((item, i) => {
        if (i === index) {
          item.detailUrl = url
        }
        return item
      })
    )
  }
  const setKeyword = (index, keyword) => {
    setData(
      data
      .filter(item => item.isChecked)
      .map((item, i) => {
        if (i === index) {
          item.keyword = keyword
        }
        return item
      })
    )
  }

  const setClothes = (index, clothes) => {
    setData(
      data
      .filter(item => item.isChecked)
      .map((item, i) => {
        if (i === index) {
          item.isClothes = clothes
        }
        return item
      })
    )
  }
  const setShoes = (index, shoes) => {
    setData(
      data
      .filter(item => item.isChecked)
      .map((item, i) => {
        if (i === index) {
          item.isShoes = shoes
        }
        return item
      })
    )
  }

  const setShppingPrice = (index, value) => {
    setData(
      data.filter(item => item.isChecked)
      .map((item, i) => {
        if (i === index) {
          item.shippingWeight = value
        }
        return item
      })
    )
  }

  const setSubItems = (index, items) => {
    
    setData(
      data.filter(item => item.isChecked)
      .map((item, i) => {
        if (i === index) {
          item.subItems = items.filter(item => item.link)
        }
        return item
      })
    )
  }
  const setRootExcept = (index, productNo, isDelete) => {
    // console.log("index, productNo", index, productNo)
    setData(
      data
      .filter(item => item.isChecked).map((item) => {
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

  const setHtml = (index, productNo, html) => {
    console.log("index, productNo", index, productNo, html)
    setData(
      data.filter(item => item.isChecked)
      .map((item, i) => {
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

  useEffect(() => {
    setData(
      list.map((item) => {
        return {
          ...item,
          isChecked: true,
          title: item.name,
          detail: item && item.detailUrl ? item.detailUrl : "",
          detailUrl:
            mode === "5" || mode === "7"
              ? item && item.detailUrl
                ? item.detailUrl
                : ""
              : item && item.detail
              ? item.detail
              : "",
          isClothes: false,
          isShoes: false,
          shippingWeight: shippingPrice[0].title,
          subItems: item.subItems ? item.subItems : []
        }
      })
    )
  }, [list])

  const showProductImageModal = () => {
    setProductImageModalVisible(true)
  }

  const handleOk = (selectedItems) => {
    setProductImageModalVisible(false)
    
    const checkImage = selectedItems.filter((item) => item.isChecked)
    let temp = data.map((item) => {
      if (checkImage.filter((fItem) => fItem.image === item.image).length > 0) {
        item.isChecked = true
      } else {
        item.isChecked = false
        
      }
      return item
    })
    
    setData(
      temp
    )
  }

  const handleCancel = () => {
    setProductImageModalVisible(false)
  }

  const showKeywordModal = () => {
    setKeywordModalVisible(true)
  }
  const handleKeywordOk = (selectedKeywords) => {
    setKeywordModalVisible(false)
    setKeywordTag(selectedKeywords)
  }
  const handleKeywordCancel = () => {
    setKeywordModalVisible(false)
  }

  const addKeywordTags = () => {
    console.log("keywordTag", keywordTag)
    let tempKeyword = keywordTag
    if(!tempKeyword.includes(",")){
      tempKeyword = keywordTag.split(" ").join(",")
    }
    setData(
      data.map((item) => {
        item.keyword = tempKeyword
        return item
      })
    )
  }

  const handleExcel = async (value) => {

    
    let tempData = []
    let registerData = []
    for(const item of data) {
      try {
        let tempValues = value.filter(item => item.번호)
        .filter(fItem => fItem.소싱여부 && fItem.소싱여부.toString().length > 0)
        .filter(fItem => fItem.번호.toString() === item.productNo.toString() )
        if(tempValues.length > 0) {
         
         
          if(tempValues[0].소싱여부 && tempValues[0].소싱여부.toString().length > 0){
       
            item.detailUrl = tempValues[0]["소싱주소"]
            item.title = tempValues[0]["상품명"].toString()
            item.shippingWeight = tempValues[0]["무게"]

            registerData.push(item)

          } else {
            const response = await setExcept({
              variables: {
                productNo: item.productNo,
                isDelete: true,
              },
            })

            if (response.data.SetNaverExcept) {
              item.isDelete = true
            }
          }
          

        }
      } catch(e){
        console.log("에러00", e)
      }

      tempData.push(item)
    }
    
    let notRegisterData = []
    for (const item of value.filter(item => item.번호).filter(fItem => fItem.소싱여부 && fItem.소싱여부.toString().length > 0)){
      try {
        if(registerData.filter(fItem => fItem.productNo.toString() === item.번호.toString()).length === 0){
          let tempWeight = item["무게"]
          let tempShippWeight = shippingPrice.filter(fItem => Number(fItem.title) >= Number(tempWeight))
          if(tempShippWeight.length > 0){
            tempWeight = tempShippWeight[0].title
          }
          
          let html = ``
          let detailImages = []
          if(item["번역이미지주소"] && Array.isArray(item["번역이미지주소"].split("#")) && item["번역이미지주소"].split("#").length > 0){
            detailImages = item["번역이미지주소"].split("#")
            if(detailImages.length > 0){
              html += `<hr >`
            }
            for(const item of detailImages.filter(item => item.length > 0 && item.includes("http"))){
              html += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
            }
          }

          notRegisterData.push({
            isChecked: true,
            type: "salesOrder",
            detailUrl: item["소싱주소"],
            title: item["상품명"],
            shippingWeight: tempWeight,
            productNo: item["번호"],
            detail: item[`소싱상품주소`],
            image: item["대상이미지주소"] ? item["대상이미지주소"].split("?")[0] : null,
            categoryId: item["카테고리"] ? item["카테고리"] : "",
            sellerTags: item["태그"] ? item["태그"].split(",") : [],
            keyword: item["태그"] ? item["태그"] : "",
            isClothes: false,
            isShoes: false,
            detailImages,
            html
          })
        }
      } catch(e){
        console.log("??", e)
      }
      
    }
    let dummyData = []
    console.log("notRegisterData", notRegisterData)
    for(const item of [...tempData, ...notRegisterData]){
      if(dummyData.filter(fItem => fItem.productNo.toString() === item.productNo.toString()).length === 0){
        dummyData.push(item)
      }
    }
    setData(
      dummyData
    )
    // const data = value
    //   .filter((item) => item.URL && item.URL.length > 0 && AmazonAsin(item.URL))
    //   .map((item, index) => {
    //     return {
    //       asin: AmazonAsin(item.URL),
    //       url: item.URL,
    //       productName: item.상품명 && item.상품명.length > 0 ? item.상품명 : null,
    //       isSuspense: index < 4 ? false : true,
    //     }
    //   })
    // const uniqData = _.uniqBy(data, "asin")

    // setUploadData([...uniqData, ...uploadData])
  }

  return (
    <>
      <BackTop />
      <div style={{display: "flex", alignItems: "center"}}>

      {isExcelModalVisible && (
          <SourcingTable
            isModalVisible={isExcelModalVisible}
            handleOk={handleExcelOk}
            handleCancel={handleExcelCancel}
            data={data}
          />
        )}

        <div style={{marginRight: "10px", width: "120px"}}>
        <Button 
          icon={<FileExcelOutlined />}
          style={{ background: "green", color: "white", marginBottom: "5px" }}
          onClick={() => {
            showExcelModal()
          }}
        >
          내보내기
        </Button>
        <ExcelImport size="middle" title="가져오기"
          onSuccess={handleExcel}
        />
        
        </div>
        <div style={{width: "100%"}}>
          <div style={{ display: "flex", justifyContent: "flex-end" }} >
            {isProductImageModalVisible && (
              <ProductImageModal
                isModalVisible={isProductImageModalVisible}
                handleOk={handleOk}
                handleCancel={handleCancel}
                images={data.map((item) => {
                  return {
                    image: item.image,
                    isChecked: item.isChecked,
                  }
                })}
              />
            )}
            <Button
              border={false}
              style={{
                // border: "6px solid #512da8",
                background: "#512da8",
                color: "white",
              }}
              onClick={showProductImageModal}
            >
              전체 이미지
            </Button>
            <Input
              style={{ marginLeft: "5px", width: "280px" }}
              addonBefore={"접두어"}
              value={before}
              onChange={(e) => setBefore(e.target.value)}
            />
            <Button
              style={{ marginLeft: "5px" }}
              onClick={() => {
                console.log("before", before)
                setBeforeTitle(before)
              }}
            >
              추가
            </Button>

            <Input
              style={{ marginLeft: "5px" }}
              addonBefore={"상품명"}
              placeholder={"컴마(,)로 구분"}
              value={word}
              onChange={(e) => setWord(e.target.value)}
            />
            <Button
              style={{ marginLeft: "5px" }}
              onClick={() => {
                const words = RandomWords(
                  word
                    .trim()
                    .split(",")
                    .map((item) => item.trim())
                )
                setRandomTitle(words)
              }}
            >
              조합
            </Button>

            <Button
              style={{ marginLeft: "5px" }}
              loading={optimizationLoading}
              onClick={handleOptimization}
            >
              상품명 최적화
            </Button>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
        <div style={{ display: "flex", width: "100%" }}>
          <Input
            // style={{ width: "100%" }}
            addonBefore={"태그"}
            value={keywordTag}
            onChange={(e) => setKeywordTag(e.target.value)}
          />
          {isKeywordModalVisible && (
            <KeywordModal
              isModalVisible={isKeywordModalVisible}
              handleOk={handleKeywordOk}
              handleCancel={handleKeywordCancel}
              keywordTag={true}
              // title={title}
              // keyword={selectKeyword}
              // mainImages={[image]}
              // detailUrl={detail}
            />
          )}
          <Button style={{ marginLeft: "5px" }} onClick={showKeywordModal}>
            검색
          </Button>
          <Button style={{ marginLeft: "5px" }} onClick={addKeywordTags}>
            태그 추가
          </Button>
        </div>
        {shippingPrice && shippingPrice.length > 0 && (
          <Select
            size="small"
            bordered={false}
            defaultValue={`${shippingPrice[0].title}Kg (${shippingPrice[0].price.toLocaleString(
              "ko"
            )}원)`}
            style={{ width: "214px", border: "3px solid #512da8", marginLeft: "10px" }}
            onChange={setWeightPrice}
          >
            {shippingPrice.map((item, index) => (
              <Option key={index} value={item.title}>{`${item.title}Kg (${item.price.toLocaleString(
                "ko"
              )}원)`}</Option>
            ))}
          </Select>
        )}
      </div>
        </div>
      </div>
      <ListContainer newWindow={newWindow}>
        <Image.PreviewGroup>
          {data
            .filter((item) => item.isChecked)
            .map((item, index) => {
              return (
                <NaverItem
                  key={index}
                  {...item}
                  waitTime={index}
                  mode={mode}
                  imageListUrl={imageListUrl}
                  index={index}
                  setRootRegister={setRigister}
                  setRootTitle={setTitle}
                  setRootDetailUrl={setDetailUrl}
                  setRootKeyword={setKeyword}
                  setRootShoes={setShoes}
                  setRootClothes={setClothes}
                  shippingPrice={shippingPrice}
                  setShppingPrice={setShppingPrice}
                  setRootExcept={setRootExcept}
                  setRootHtml={setHtml}
                  setRootSubItems={setSubItems}
                />
              )
            })}
        </Image.PreviewGroup>
        {loading && (
          <SpinContainer>
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
          </SpinContainer>
        )}
      </ListContainer>
    </>
  )
})

export default NaverStoreItem

const SpinContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: -100px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
`

const ListContainer = styled.div`
  margin-top: 10px;
  /* min-height: calc(100vh - 150px);
  ${ifProp(
    "newWindow",
    css`
      min-height: calc(100vh - 130px);
    `
  )};
  position: relative; */
  & > div {
    margin-bottom: 40px;
  }
`

const NaverItem = ({
  mode,
  good_id,
  waitTime,
  isRegister,
  type,
  image,
  sellerTags,
  displayName = "",
  shippingWeight,
  shippingPrice,
  weightPrice, // 등록된 상품 무게 가격
  productId,
  vendorName,
  isDelete,
  productNo,
  detail,
  rawTitle,
  title,
  titleArray = [],
  imageListUrl,
  index,
  reviewCount,
  zzim,
  purchaseCnt,
  recentSaleCount,
  setRootRegister,
  setRootTitle,
  setRootDetailUrl,
  setRootKeyword,
  setRootClothes,
  setRootShoes,
  detailUrl,
  isClothes,
  isShoes,
  setShppingPrice,
  setRootExcept,
  keyword,
  detailImages = [],
  setRootHtml,
  setRootSubItems
}) => {
  const [hidden, setHidden] = useState(true)
  const [taobaoList, setTaobaoList] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modifyTitle, setModifyTitle] = useState(
    displayName && title ? title.replace(displayName, "").trim() : title
  )
  const [keywordTag, setKeywordTag] = useState(keyword)
  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)
  const [selectedUrl, SetSelectedUrl] = useState("")
  const [selectKeyword, SetSelectKeyword] = useState("")

  const [setExcept] = useMutation(SET_NAVER_EXCEPT)
  const [isDetailModalVisible, setDetailModalVisible] = useState(false)
  const [html, setHtml] = useState([])

  const [isSimilarVisible, setSImilarVaisble] = useState(false)

  const [subItems, setSubItems] = useState([])

  const [before, setBefore] = useState("")
  const [word, setWord] = useState("")

  const [isSubKeywordModalVisible, setSubKeywordModalVisible] = useState(false)


  // const {} = useQuery(ISREGISTER, {
  //   variables: {
  //     goodID: good_id
  //   },
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data=> {

  //     setRootRegister(index, data.IsRegister)
  //   }
  // })

  const titleArrayRef = useRef()

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

    if (tempTitleArr.length > 0) {
      const modify = tempTitleArr.join(" ")

      setModifyTitle(modify)
    }
  }, [title])

  useEffect(() => {
    setKeywordTag(sellerTags.join())
    setRootKeyword(index, sellerTags.join())
  }, [sellerTags])
  useEffect(() => {
    if (mode !== "6") {
      SetSelectedUrl(detailUrl)
    }
  }, [detailUrl])

  useEffect(() => {
    setClothes(isClothes)
  }, [isClothes])

  useEffect(() => {
    setShose(isShoes)
  }, [isShoes])

  useEffect(() => {
    setKeywordTag(keyword)
  }, [keyword])

  useEffect(() => {
    if (mode === "5" || mode === "6") {
      setTimeout(() => {
        setHidden(false)
      }, waitTime)
    }
  }, [])

  const handleChange = (value) => {
    // setShppingPrice(index, value)
    setTimeout(() => {
      setShppingPrice(index, value)
    }, 300)
  }

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
    let str = ``
    if (reviewCount > 0) {
      str += `리뷰: (${reviewCount.toLocaleString("ko")}) `
    }
    if (purchaseCnt > 0) {
      if (recentSaleCount > 0) {
        str += `구매건수[최근]: (${purchaseCnt.toLocaleString(
          "ko"
        )} / [${recentSaleCount.toLocaleString("ko")}]) `
      } else {
        str += `구매건수: (${purchaseCnt.toLocaleString("ko")}) `
      }
    }

    if (zzim > 0) {
      str += `찜: (${zzim.toLocaleString("ko")}) `
    }
    return str
  }

  const getTotalPurchaseLable = (purchaseCnt) => {
    return (
      <PurchaseContainer>
        <PurchaseItemColor>
          <PurchaseCount>{`${purchaseCnt.toLocaleString("ko")}`}</PurchaseCount>
          <PurchaseTitle>총 판매 건수</PurchaseTitle>
        </PurchaseItemColor>
      </PurchaseContainer>
    )
  }

  let typeStr = ""
  switch (type) {
    case "ranking":
      typeStr = "최근 판매"
      break
    case "salesOrder":
      typeStr = "누적 판매"
      break
    default:
      typeStr = "리스트"
  }

  const showModal = () => {
    setIsModalVisible(true)
  }

  const showSubModal = () => {
    setSubKeywordModalVisible(true)
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false)
    SetSelectKeyword("")
    setModifyTitle(`${selectKeyword}`)
    setRootTitle(index, `${selectKeyword}`)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    SetSelectKeyword("")
  }

  const selectItem = ({ url }) => {
    SetSelectedUrl(url)
    setRootDetailUrl(index, url)
  }

  const handleExcept = async (isDelete) => {
    const response = await setExcept({
      variables: {
        productNo,
        isDelete,
      },
    })
    console.log("response", response)
    if (response.data.SetNaverExcept) {
      setRootExcept(index, productNo, isDelete)
    }
  }

  const getImageUrl = (image) => {
    if (image && image.includes("https://shopping-phinf.pstatic.net/")) {
      return image
    }
    if (image && image.includes("img.alicdn.com")) {
      return `${image}_200x200.jpg`
    }
    return `${image}?type=f232_232`
  }

  const handleOkDetail = (detailHtml) => {
    setDetailModalVisible(false)
    setHtml(detailHtml)
    setRootHtml(index, productNo, detailHtml)
  }
  const handleCancelDetail = () => {
    setDetailModalVisible(false)
  }

  const handleSimilarOk = (items) => {
    const getShippingWeight = (price) => {
      const temp = shippingPrice.filter((item) => item.price === price)
      if (temp.length > 0) {
        return temp[0].title
      } else {
        return shippingPrice[0].title
      }
    }

    setSImilarVaisble(false)
    const temp = items.map(item => {

      let shippingWeightValue = null
      if(mode === "7") {
        shippingWeightValue = getShippingWeight(weightPrice)
      } else {
        shippingWeightValue = shippingWeight ? shippingWeight : shippingPrice[0].title
      }
      return {
        ...item,
        productNo: AmazonAsin(item.link),
        isClothes: false,
        isShoes: false,
        keyword: keywordTag,
        shippingWeight: shippingWeightValue,
      }
    })
    setSubItems(temp)
    setRootSubItems(index, temp)
  }

  const handleSimilarCancel = () => {
    setSImilarVaisble(false)
  }

  const setSubRootTitle = (index, title) => {
    setSubItems(subItems.map((item, i) => {
      if(i == index) {
        item.korTitle = title
      }
      return item
    }))
  }
  const setSubRootDetailUrl = (index, url) => {
    setSubItems(subItems.map((item, i) => {
      if(i == index) {
        item.link = url
      }
      return item
    }))
  }
  const setSubRootKeyword = (subIndex, keyword) => {
    const temp = subItems.map((item, i) => {
      if(i == subIndex) {
        item.keyword = keyword
      }
      return item
    })
    setSubItems(temp)
    setRootSubItems(index, temp)
  }
  const setSubRootClothes = (subIndex, isClothes) => {
    const temp = subItems.map((item, i) => {
      if(i == subIndex) {
        item.isClothes = isClothes
      }
      return item
    })
    setSubItems(temp)
    setRootSubItems(index, temp)
  }
  const setSubRootShoes = (subIndex, isShoes) => {
    const temp = subItems.map((item, i) => {
      if(i == subIndex) {
        item.isShoes = isShoes
      }
      return item
    })
    setSubItems(temp)
    setRootSubItems(index, temp)
  }
  const setSubRootShippingPrice = (subIndex, shippingPrice) => {
    console.log("subIndex, shippingPrice", subIndex, shippingPrice)
    const temp = subItems.map((item, i) => {
      if(i == subIndex) {
        item.shippingWeight = shippingPrice
      }
      return item
    })
    setSubItems(temp)
    setRootSubItems(index, temp)
  }

  const setRandomTitle = (words) => {
    console.log("words.length", words.length)
    if (subItems.length > words.length) {
      message.error("조합할 키워드 갯수가 부족합니다.")
      return
    }
    setSubItems(
      subItems.map((item) => {
        let randNum = Math.floor(Math.random() * (words.length - 0 + 1)) + 0
        const titles = subItems.map((item) => item.title)
        while (titles.includes(words[randNum])) {
          randNum = Math.floor(Math.random() * (words.length - 0 + 1)) + 0
        }
        item.korTitle = `${before} ${words[randNum]}`

        // item.title = `${title} ${item.title}`
        // console.log("item.title", item.title)
        return item
      })
    )
  }
  
  const setBeforeTitle = (title) => {
    setSubItems(
      subItems
      .map((item) => {
        item.korTitle = `${title} ${item.korTitle}`
        return item
      })
    )
  }

  const handleSubOk = (selectKeyword) => {
    setSubKeywordModalVisible(false)
    console.log("selectKeyword", selectKeyword)
    setWord(`${word} ${selectKeyword.split(" ").join(", ")}`)

  }

  const handleSubMainKeywordOk = (mainKeywrod) => {
    setSubKeywordModalVisible(false)
    setBefore(mainKeywrod)
  }

  const handleSubCancel = () => {
    setSubKeywordModalVisible(false)
  }

  const getShippingDefaultValue = (price) => {
    const temp = shippingPrice.filter((item) => item.price === price)
    if (temp.length > 0) {
      return `${temp[0].title}Kg (${temp[0].price.toLocaleString("ko")}원)`
    } else {
      return `${shippingPrice[0].title}Kg (${shippingPrice[0].price.toLocaleString("ko")}원)`
    }
  }


  if(mode === "7"){
    return (
      <div>
        <ContentContainer isRegister={isRegister}>
          <div style={{width: "232px"}}>
            <Image
              width={232}
              height={232}
              src={getImageUrl(image)}
             
            />
            {isSimilarVisible && <SimilarProductModal 
              isModalVisible={isSimilarVisible}
              handleOk={handleSimilarOk}
              handleCancel={handleSimilarCancel}
              url={selectedUrl}
              image={image}
            />}
            {selectedUrl && (selectedUrl.includes("taobao") || selectedUrl.includes("tmaill")) && <Button blcok type="primary" block danger style={{marginTop: "10px"}}
              onClick={() => setSImilarVaisble(true)}
            >유사상품 찾기</Button>}
          </div>
          <ItemContent>
            <div>
              <div style={{fontSize: "16px", marginBottom: "10px"}}>
                {title}
              </div>
              <Input
                  size="large"
                  addonBefore={<div 
                    style={{cursor: "pointer"}}
                    onClick={() => {
                    if(selectedUrl && selectedUrl.includes("taobao") || selectedUrl.includes("tmaill")){
                      shell.openExternal(selectedUrl)
                    }
                  }}>주소</div>}
                  placeholder="등록할 상품의 상세주소를 입력해 주세요."
                  allowClear
                  value={selectedUrl}
                  border={false}
                  onChange={(e) => {
                    SetSelectedUrl(e.target.value)
                  }}
                  disabled={isRegister}
                  style={{ border: "3px solid #512da8", marginBottom: "10px" }}
                />
              <div style={{fontSize: "16px", marginBottom: "10px"}}
              >{keywordTag}</div>
              <div style={{ minWidth: "100px" }}>
                {getTotalPurchaseLable(purchaseCnt)}
              </div>
            </div>
            <div style={{fontSize: "18px", marginBottom: "10px", textAlign: "right"}}>
              {getShippingDefaultValue(weightPrice)}
            </div>
          </ItemContent>

        </ContentContainer>
        {subItems.length > 0 && <div style={{marginTop: "25px"}}>
          
          <Collapse defaultActiveKey={productNo}>
            <Panel header={`[유사 상품] ${modifyTitle} - (${subItems.filter(item => item.link).length}개)`} key={productNo}>
  
            <SubTitleCombainContainer>
              <Input
                style={{ marginLeft: "5px", width: "280px" }}
                addonBefore={"접두어"}
                value={before}
                onChange={(e) => setBefore(e.target.value)}
              />
              <Button
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  console.log("before", before)
                  setBeforeTitle(before)
                }}
              >
                추가
              </Button>
  
              <Input
                style={{ marginLeft: "5px" }}
                addonBefore={"상품명 조합"}
                placeholder={"컴마(,)로 구분"}
                value={word}
                onChange={(e) => setWord(e.target.value)}
              />
              <Button
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  const words = RandomWords(
                    word
                      .trim()
                      .split(",")
                      .map((item) => item.trim())
                  )
                  setRandomTitle(words)
                }}
              >
                조합
              </Button>
  
              {isSubKeywordModalVisible && (
                <KeywordModal
                  isModalVisible={isSubKeywordModalVisible}
                  handleOk={handleSubOk}
                  handleMainKeywrodOk={handleSubMainKeywordOk}
                  handleCancel={handleSubCancel}
                  title={title}
                  // keyword={selectKeyword}
                  // mainImages={[image]}
                  // detailUrl={detail}
                />
              )}
              <Button
                border={false}
                // size="small"
                style={{
                  // border: "6px solid #512da8",
                  background: "#512da8",
                  color: "white",
                  marginLeft: "5px"
                }}
                onClick={showSubModal}
              >
                키워드
              </Button>
              
              </SubTitleCombainContainer>
            {
              subItems.map((item, i) => {
                return (
                  <NaverSubItem 
                    {...item}
                    key={i} 
                    mode={mode}
                    image={item.image}
                    index={i}
                    setRootTitle={setSubRootTitle}
                    setRootDetailUrl={setSubRootDetailUrl}
                    setRootKeyword={setSubRootKeyword}
                    setRootClothes={setSubRootClothes}
                    setRootShoes={setSubRootShoes}
                    setRootShippingPrice={setSubRootShippingPrice}
                    detailUrl={item.link}
                    title={item.korTitle ? item.korTitle : item.title}
                    shippingPrice={shippingPrice}
                    shippingWeight={item.shippingWeight}
                  />
                )
              })
            }
            </Panel>
        </Collapse>
        </div>}
     
      </div>
    )
  } else {
    return (
      <div>
        
        <ContentContainer isRegister={isRegister}>
          <div>
            <Image
              width={232}
              height={232}
              src={getImageUrl(image)}
              preview={{
                src: image,
              }}
            />
            <DownloadContainer>
              <CopyToClipboard text={image} onCopy={() => message.success("복사하였습니다.")}>
                {/* <a href={image} download> */}
  
                <Tooltip title="이미지주소를 클립보드에 저장">
                  <Button icon={<CopyOutlined />} block>
                    복사
                  </Button>
                </Tooltip>
                {/* </a> */}
              </CopyToClipboard>
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
            {isSimilarVisible && <SimilarProductModal 
              isModalVisible={isSimilarVisible}
              handleOk={handleSimilarOk}
              handleCancel={handleSimilarCancel}
              url={selectedUrl}
              image={image}
            />}
            {selectedUrl && (selectedUrl.includes("taobao") || selectedUrl.includes("tmaill")) && <Button type="primary" block danger style={{marginTop: "10px"}}
              onClick={() => setSImilarVaisble(true)}
            >유사상품 찾기</Button>}
          </div>
          <ItemContent>
            <div>
              <div>
                <TitleArrayContainer>
                  <Button onClick={() => shell.openExternal(detail)}>상세</Button>
                  <TitleArrayComponent
                    title={title}
                    titleArray={titleArray}
                    SetSelectKeyword={SetSelectKeyword}
                    showModal={showModal}
                    ref={titleArrayRef}
                  />
  
                  {(mode === "3" || mode === "4") && productNo && isDelete && (
                    <DeleteFilled
                      style={{
                        fontSize: "36px",
                        cursor: "pointer",
                        color: "#FF3377",
                        marginRight: "20px",
                      }}
                      onClick={() => handleExcept(false)}
                    />
                  )}
                  {(mode === "3" || mode === "4") && !isDelete && productNo && (
                    <DeleteOutlined
                      style={{ fontSize: "36px", cursor: "pointer", marginRight: "20px" }}
                      onClick={() => handleExcept(true)}
                    />
                  )}
                </TitleArrayContainer>
              </div>
  
              <TitleKeywordContainer>
                <Input
                  size="large"
                  addonBefore="제목"
                  placeholder="상품 제목을 선택해주세요."
                  allowClear
                  value={modifyTitle}
                  onChange={(e) => {
                    setModifyTitle(e.target.value)
                  }}
                  onBlur={(e) => {
                    setRootTitle(index, e.target.value)
                  }}
                  border={false}
                  style={{
                    border: "3px solid #512da8",
                  }}
                />
                {isModalVisible && (
                  <KeywordModal
                    isModalVisible={isModalVisible}
                    handleOk={handleOk}
                    handleCancel={handleCancel}
                    title={title}
                    keyword={selectKeyword}
                    mainImages={[image]}
                    detailUrl={detail}
                    displayName={displayName}
                  />
                )}
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
  
              <Input
                size="large"
                addonBefore="주소"
                placeholder="등록할 상품의 상세주소를 입력해 주세요."
                allowClear
                value={selectedUrl}
                border={false}
                onChange={(e) => {
                  SetSelectedUrl(e.target.value)
                }}
                onBlur={(e) => {
                  setRootDetailUrl(index, e.target.value)
                }}
                disabled={isRegister}
                style={{ border: "3px solid #512da8" }}
              />
              <Input
                style={{ marginTop: "5px" }}
                addonBefore="태그"
                placeholder="쿠팡 검색어. 미입력시 상품명으로 대체. 컴마로 구분"
                allowClear
                value={keywordTag}
                onChange={(e) => {
                  // handleKeyword(e.target.value)
                  setKeywordTag(e.target.value)
                }}
                onBlur={(e) => {
                  setRootKeyword(index, e.target.value)
                }}
              />
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
                  {mode !== "5"
                    ? getPurchaseLable({ reviewCount, zzim, purchaseCnt, recentSaleCount })
                    : null}
                </div>
                <div>
                  <div style={{display: "flex", justifyContent: "flex-end", marginBottom: "10px"}}>
                    <Button onClick={() => setDetailModalVisible(true)}>상세페이지</Button>
                      {isDetailModalVisible && <DetailFormModal
                        isModalVisible={isDetailModalVisible}
                        handleOk={handleOkDetail}
                        handleCancel={handleCancelDetail}
                        content={detailImages}
                        html={html}
                      />}
                  </div>
                <div style={{ display: "flex" }}>
                  <div style={{ display: "flex", marginRight: "20px" }}>
                    <div>
                      <Checkbox
                        style={{ padding: "15px", fontSize: "16px" }}
                        checked={clothes}
                        onChange={(e) => {
                          setClothes(e.target.checked)
                          setRootClothes(index, e.target.checked)
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
                          setRootShoes(index, e.target.checked)
                        }}
                      >
                        신발
                      </Checkbox>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginRight: "10px", fontSize: "16px" }}>무게 (배송비)</div>
                    <ShippingForm
                      shippingWeight={shippingWeight}
                      shippingPrice={shippingPrice}
                      handleChange={handleChange}
                    />
                  </div>
                </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", fontSize: "13px", marginTop: "5px"  }}>
              {sellerTags &&
                Array.isArray(sellerTags) &&
                sellerTags.map((item, index) => (
                  <div
                    key={index}
                    style={{ marginRight: "5px", color: "#c6a700" }}
                  >{`#${item} `}</div>
                ))}
            </div>
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
        {subItems.length > 0 && <div style={{marginTop: "25px"}}>
          
          <Collapse defaultActiveKey={productNo}>
            <Panel header={`[유사 상품] ${modifyTitle} - (${subItems.filter(item => item.link).length}개)`} key={productNo}>
  
            <SubTitleCombainContainer>
              <Input
                style={{ marginLeft: "5px", width: "280px" }}
                addonBefore={"접두어"}
                value={before}
                onChange={(e) => setBefore(e.target.value)}
              />
              <Button
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  console.log("before", before)
                  setBeforeTitle(before)
                }}
              >
                추가
              </Button>
  
              <Input
                style={{ marginLeft: "5px" }}
                addonBefore={"상품명 조합"}
                placeholder={"컴마(,)로 구분"}
                value={word}
                onChange={(e) => setWord(e.target.value)}
              />
              <Button
                style={{ marginLeft: "5px" }}
                onClick={() => {
                  const words = RandomWords(
                    word
                      .trim()
                      .split(",")
                      .map((item) => item.trim())
                  )
                  setRandomTitle(words)
                }}
              >
                조합
              </Button>
  
              {isSubKeywordModalVisible && (
                <KeywordModal
                  isModalVisible={isSubKeywordModalVisible}
                  handleOk={handleSubOk}
                  handleMainKeywrodOk={handleSubMainKeywordOk}
                  handleCancel={handleSubCancel}
                  title={title}
                  // keyword={selectKeyword}
                  // mainImages={[image]}
                  // detailUrl={detail}
                />
              )}
              <Button
                border={false}
                // size="small"
                style={{
                  // border: "6px solid #512da8",
                  background: "#512da8",
                  color: "white",
                  marginLeft: "5px"
                }}
                onClick={showSubModal}
              >
                키워드
              </Button>
              
              </SubTitleCombainContainer>
            {
              subItems.map((item, i) => {
                return (
                  <NaverSubItem 
                    {...item}
                    key={i} 
                    mode={mode}
                    image={item.image}
                    index={i}
                    setRootTitle={setSubRootTitle}
                    setRootDetailUrl={setSubRootDetailUrl}
                    setRootKeyword={setSubRootKeyword}
                    setRootClothes={setSubRootClothes}
                    setRootShoes={setSubRootShoes}
                    setRootShippingPrice={setSubRootShippingPrice}
                    detailUrl={item.link}
                    title={item.korTitle ? item.korTitle : item.title}
                    shippingPrice={shippingPrice}
                    shippingWeight={item.shippingWeight}
                  />
                )
              })
            }
            </Panel>
        </Collapse>
        </div>}
      </div>
    )
  }
  
}

const ShippingForm = ({ shippingWeight, shippingPrice, handleChange }) => {

  const [lshippingWeight, setlshippingWeight] = useState(shippingWeight)
  const [lshippingPrice, setlshippingPrice] = useState(shippingPrice)

  useEffect(() => {
    if(shippingWeight !== lshippingWeight) {
      
      setlshippingWeight(shippingWeight)
    }
  }, [shippingWeight])
  useEffect(() => {
    
    setlshippingPrice(shippingPrice)
  }, [shippingPrice])
  const getDefaultValue = () => {
    const temp =  _.find(lshippingPrice, {title: lshippingWeight})

    // const temp = lshippingPrice.filter((item) => item.title === lshippingWeight)
    if (temp) {
      return `${temp.title}Kg (${temp.price.toLocaleString("ko")}원)`
    } else {
      return `${lshippingPrice[0].title}Kg (${lshippingPrice[0].price.toLocaleString("ko")}원)`
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
      {lshippingPrice.map((item, index) => (
        <Option key={index} value={item.title}>{`${item.title}Kg (${item.price.toLocaleString(
          "ko"
        )}원)`}</Option>
      ))}
    </Select>
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
  margin-left: 20px;
  margin-right: 20px;
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

const TitleForm = ({
  index,
  mode,
  rawTitle,
  modifyTitle,
  title,
  setModifyTitle,
  setRootTitle,
  isModalVisible,
  handleOk,
  handleCancel,
  selectKeyword,
  showModal,
}) => {
  // const {refetch, networkStatus} = useQuery(TRANSLATE_PAPAGO, {
  //   variables: {
  //     text: rawTitle
  //   },
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data=> {
  //     setModifyTitle(data.TranslatePapago)
  //     setRootTitle(index, data.TranslatePapago)
  //     // formik.setFieldValue(`data.${index}.korTitle`, data.TranslatePapago)
  //   }
  // })

  return (
    <TitleKeywordContainer>
      <Input
        size="large"
        addonBefore="제목"
        placeholder="상품 제목을 선택해주세요."
        allowClear
        value={modifyTitle}
        onChange={(e) => {
          setModifyTitle(e.target.value)
        }}
        onBlur={(e) => {
          setRootTitle(index, e.target.value)
        }}
        border={false}
        style={{
          border: "3px solid #512da8",
        }}
      />
      {(mode === "5" || mode === "6") && (
        <Button
          style={{
            height: "46px",
            marginRight: "5px",
          }}
          icon={<img src={"https://papago.naver.com/favicon.ico"} alt="taobao" />}
          // onClick={() => refetch()}
        ></Button>
      )}
      {isModalVisible && (
        <KeywordModal
          isModalVisible={isModalVisible}
          handleOk={handleOk}
          handleCancel={handleCancel}
          title={title}
          keyword={selectKeyword}
        />
      )}
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
  )
}


const NaverSubItem = ({
  mode,
  waitTime,
  isRegister,
  type,
  image,
  sellerTags = [],
  displayName = "",
  shippingWeight,
  shippingPrice,
  isDelete,
  productNo,
  detail,
  title,
  titleArray = [],
  index,
  setRootTitle,
  setRootDetailUrl,
  setRootKeyword,
  setRootClothes,
  setRootShoes,
  setRootShippingPrice,
  detailUrl,
  isClothes,
  isShoes,
  setShppingPrice,
  setRootExcept,
  keyword,

  detailImages = [],
  setRootHtml
}) => {
  const [hidden, setHidden] = useState(true)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modifyTitle, setModifyTitle] = useState(
    displayName && title ? title.replace(displayName, "").trim() : title
  )
  const [keywordTag, setKeywordTag] = useState(keyword)
  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)
  const [selectedUrl, SetSelectedUrl] = useState("")
  const [selectKeyword, SetSelectKeyword] = useState("")
  const [optimizationProductName] = useMutation(OPTIMIZATION_PRODUCT_NAME)
  const [optimizationLoading, setOptimizationLoading] = useState(false)
  // const {} = useQuery(ISREGISTER, {
  //   variables: {
  //     goodID: good_id
  //   },
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data=> {

  //     setRootRegister(index, data.IsRegister)
  //   }
  // })

  const titleArrayRef = useRef()

  // useEffect(() => {
  //   const tempTitle = (displayName && title ? title.replace(displayName, "").trim() : title) || ""
  //   const tempTitleArr = tempTitle.split(" ").filter((item) => {
  //     if (item.length === 0) {
  //       return false
  //     }

  //     const tempArr = titleArray.filter((fItme) => {
  //       if (fItme.word === item && fItme.ban.includes(item)) {
  //         return true
  //       }
  //       return false
  //     })
  //     if (tempArr.length > 0) {
  //       return false
  //     }
  //     return true
  //   })

  //   if (tempTitleArr.length > 0) {
  //     const modify = tempTitleArr.join(" ")

  //     setModifyTitle(modify)
  //   }
  // }, [title])

  useEffect(() => {
    setModifyTitle(title)
  }, [title])

  useEffect(() => {
    if (mode !== "6") {
      SetSelectedUrl(detailUrl)
    }
  }, [detailUrl])

  useEffect(() => {
    setClothes(isClothes)
  }, [isClothes])

  useEffect(() => {
    setShose(isShoes)
  }, [isShoes])

  useEffect(() => {
    setKeywordTag(keyword)
  }, [keyword])

  useEffect(() => {
    if (mode === "5" || mode === "6") {
      setTimeout(() => {
        setHidden(false)
      }, waitTime)
    }
  }, [])

  const handleChange = (value) => {
    setTimeout(() => {
      setRootShippingPrice(index, value)
    }, 200)
    
  }


  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false)
    SetSelectKeyword("")
    setModifyTitle(`${selectKeyword}`)
    setRootTitle(index, `${selectKeyword}`)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    SetSelectKeyword("")
  }

 
  const getImageUrl = (image) => {
    if (image && image.includes("https://shopping-phinf.pstatic.net/")) {
      return image
    }
    return `${image}?type=f232_232`
  }

  const handleOptimization = async () => {
    try {
      let tempArr = modifyTitle.split(" ")
      tempArr = tempArr.filter((v, i) => tempArr.indexOf(v) === i)
      setModifyTitle(tempArr.join(" "))
      setRootTitle(tempArr.join(" "))
      // setOptimizationLoading(true)
      // const response = await optimizationProductName({
      //   variables: {
      //     title: modifyTitle,
      //   },
      // })
      // console.log("response", response)
      // if (response.data.OptimizationProductName) {
      //   setModifyTitle(response.data.OptimizationProductName)
      //   setRootTitle(index, response.data.OptimizationProductName)
      // }
    } catch (e) {
    } finally {
      setOptimizationLoading(false)
    }
  }


  return (
    <SubItemContainer>
      <SubContentContainer>
        <div>
          <Image
            width={232}
            height={232}
            src={getImageUrl(image)}
            preview={{
              src: image,
            }}
          />
        </div>
        <ItemContent>
          <div>
            <TitleKeywordContainer>
              <Input
                size="large"
                addonBefore="제목"
                placeholder="상품 제목을 선택해주세요."
                allowClear
                value={modifyTitle}
                onChange={(e) => {
                  setModifyTitle(e.target.value)
                }}
                onBlur={(e) => {
                  setRootTitle(index, e.target.value)
                }}
                border={false}
                style={{
                  border: "3px solid #512da8",
                }}
              />
              {isModalVisible && (
                <KeywordModal
                  isModalVisible={isModalVisible}
                  handleOk={handleOk}
                  handleCancel={handleCancel}
                  title={modifyTitle}
                  // keyword={selectKeyword}
                  // mainImages={[image]}
                  // detailUrl={detail}
                />
              )}
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
              <Button size="large" loading={optimizationLoading} onClick={handleOptimization}
                style={{marginLeft: "5px", height: "46px",}}
              >
                중복제거
              </Button>
            </TitleKeywordContainer>

            <Input
              size="large"
              addonBefore="주소"
              placeholder="등록할 상품의 상세주소를 입력해 주세요."
              allowClear
              value={selectedUrl}
              border={false}
              onChange={(e) => {
                SetSelectedUrl(e.target.value)
              }}
              onBlur={(e) => {
                setRootDetailUrl(index, e.target.value)
              }}
              disabled={isRegister}
              style={{ border: "3px solid #512da8" }}
            />
            <Input
              style={{ marginTop: "5px" }}
              addonBefore="태그"
              placeholder="쿠팡 검색어. 미입력시 상품명으로 대체. 컴마로 구분"
              allowClear
              value={keywordTag}
              onChange={(e) => {
                // handleKeyword(e.target.value)
                setKeywordTag(e.target.value)
              }}
              onBlur={(e) => {
                setRootKeyword(index, e.target.value)
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "10px",
                fontSize: "14px",
              }}
            >
             
              <div>
                
                <div style={{ display: "flex" }}>
                  <div style={{ display: "flex", marginRight: "20px" }}>
                    <div>
                      <Checkbox
                        style={{ padding: "15px", fontSize: "16px" }}
                        checked={clothes}
                        onChange={(e) => {
                          setClothes(e.target.checked)
                          setRootClothes(index, e.target.checked)
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
                          setRootShoes(index, e.target.checked)
                        }}
                      >
                        신발
                      </Checkbox>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ marginRight: "10px", fontSize: "16px" }}>무게 (배송비)</div>
                    <ShippingForm
                      shippingWeight={shippingWeight}
                      shippingPrice={shippingPrice}
                      handleChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </ItemContent>
      </SubContentContainer>

   
    </SubItemContainer>
  )
}

const SubItemContainer = styled.div`
  border-left-style: solid;
  border-left-width: 20px;
  border-left-color: #FF3377;
  margin-top: 10px;
  border-top-left-radius: 15px;
  border-bottom-left-radius: 15px;

  border-top-style: dashed;
  border-top-width: 1px;
  border-top-color: #FF3377;
  border-bottom-style: dashed;
  border-bottom-width: 1px;
  border-bottom-color: #FF3377;

  border-right-style: solid;
  border-right-width: 2px;
  border-right-color: #FF3377;

  padding-top: 10px;
  

`

const SubContentContainer = styled.div`
  display: flex;
  
  margin-right: 20px;
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

const SubTitleCombainContainer = styled.div`
  display: flex;
`