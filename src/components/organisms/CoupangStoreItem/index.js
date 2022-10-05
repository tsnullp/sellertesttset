import React, {useState, useEffect, useRef, forwardRef, useImperativeHandle} from "react"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { Divider, Tooltip, Input, Tag, Image, Button,Dropdown, Drawer, Menu, Select, Checkbox, BackTop, notification, Spin } from "antd"
import { DownloadOutlined, SearchOutlined, DownOutlined, QuestionCircleOutlined, CopyrightOutlined, UpOutlined, LoadingOutlined } from "@ant-design/icons"
import { useMutation } from "@apollo/client"
import { TAOBAO_IMAGE_LIST_URL } from "../../../gql"
import StartRatings from "react-star-ratings"
import { useLocation } from "react-router-dom"
import {KeywordModal, TitleArrayComponent, TaobaoImageSearchButton} from "components"
import queryString from "query-string"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { Option } = Select
const { shell } = window.require("electron")

const CoupangStoreItem = forwardRef(({ loading, count, list, subPrice, shippingPrice }, ref, ) => {
  const [data, setData] = useState([])
  const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)
 

  const location = useLocation()
  const query = queryString.parse(location.search)

  const newWindow = query && query.newWindow === "true" ? true : false

  useImperativeHandle(ref, () => ({
    showAlert() {
      return data.filter(item => item.detailUrl && item.detailUrl.length > 0)
    },
    scrollTop() {
      let list = document.getElementById("listcontainer")
      if(list){
        list.scrollIntoView()
      }
    }
  }));



  const setTitle = (index, title) => { 
    setData(data.map((item, i) => {
      if(i === index){
        item.title = title
      }
      return item
    }))
  }
  const setDetailUrl = (index, url) => { 
    setData(data.map((item, i) => {
      if(i === index){
        item.detailUrl = url
      }
      return item
    }))
  }

  const setClothes = (index, clothes) => { 
    setData(data.map((item, i) => {
      if(i === index){
        item.isClothes = clothes
      }
      return item
    }))
  }
  const setShoes = (index, shoes) => { 
    setData(data.map((item, i) => {
      if(i === index){
        item.isShoes = shoes
      }
      return item
    }))
  }

  const setShppingPrice = (index, value) => { 
    setData(data.map((item, i) => {
      if(i === index){
        item.shippingWeight = value
      }
      return item
    }))
  }


  useEffect(() => {
    
    setData(list.map(item => {
      return {
        ...item,
        title: item && item.title && item.vendorName ? item.title.replace(item.vendorName, "").trim() : "",
        detail: item && item.detail ? item.detail : "",
        detailUrl: item && item.detailUrl ? item.detailUrl : "",
        isClothes: false,
        isShoes: false,
        shippingWeight: shippingPrice[0].title
      }
    }))
   
    
  }, [list])
  
  return (
    <ListContainer newWindow={newWindow} id="listcontainer">
      <BackTop />
      {data.map((item, index) => {
        return (
          <CoupangItem key={index} {...item} imageListUrl={imageListUrl} index={index}
          setRootTitle={setTitle} 
          setRootDetailUrl={setDetailUrl}
          setRootShoes={setShoes}
          setRootClothes={setClothes}
          shippingPrice={shippingPrice}
          setShppingPrice={setShppingPrice}
        />
        )
      })}
      {loading && <SpinContainer>
        <Spin
          style={{ color: "white", fontWeight: "700", fontSize: "16px" }}
          size="large"
          tip="새로운 상품을 찾고 있습니다..."
          indicator={
            <LoadingOutlined
              style={{ fontSize: 48, marginBottom: "20px", color: "white" }}
              spin
            />
          }
        />
      </SpinContainer>}
     
    </ListContainer>
  )
  
  
})

export default CoupangStoreItem

const SpinContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  background: rgba(0, 0, 0, 0.6);
`

const ListContainer = styled.div`
  min-height: calc(100vh - 150px);
  ${ifProp(
    "newWindow",
    css`
      min-height: calc(100vh - 130px);
    `
  )};
  position: relative;
  & > div {
    margin-bottom: 40px;
  }
`

const CoupangItem = ({ isRegister, productId, vendorName, vendorID, ratingCount, ratingAveragePercentage,
  otherSellerCount, detail, mainImages, options, title, titleArray, imageListUrl, index, 
  setRootTitle, setRootDetailUrl, setRootClothes, setRootShoes, setRootSubPrice,
  detailUrl, subPrice, isClothes, isShoes, shippingPrice, setShppingPrice
}) => {
  const [isLoading, setLoading] = useState(null)
  const [visibleReview, setVisibleReview] = useState(false)
  const [visibleInquire, setVisibleInquire] = useState(false)

  const [modifyTitle, setModifyTitle] = useState(
    vendorName ? title.replace(vendorName, "").trim() : title
  )
  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)
  const [selectedUrl, SetSelectedUrl] = useState("")
  const [deductedAmount, SetDeductedAmount] = useState(200)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectKeyword, SetSelectKeyword] = useState("")

  const titleArrayRef = useRef()

  useEffect(() => {
    setModifyTitle(title)
  }, [title])

  useEffect(() => {
    SetSelectedUrl(detailUrl)
  }, [detailUrl])

  useEffect(() => {  
    SetDeductedAmount(subPrice)
  }, [subPrice])

  useEffect(() => {
    setClothes(isClothes)
  }, [isClothes])

  useEffect(() => {
    setShose(isShoes)
  }, [isShoes])

  const handleChange = (value) => {
    console.log(`selected ${value}`);
    setShppingPrice(index, value)
  }
 

  const showModal = () => {
    setIsModalVisible(true);
  }

  const handleOk = (selectKeyword) => {
    setIsModalVisible(false);
    SetSelectKeyword("")
    setModifyTitle(`${modifyTitle} ${selectKeyword.join(" ")}`)
  }

  const handleCancel = () => {
    setIsModalVisible(false);
    SetSelectKeyword("")
  }

  const selectItem = ({url}) => {
    SetSelectedUrl(url)
    setRootDetailUrl(index, url)
  }

  const optionPrice = options => {
    if(!options || !Array.isArray(options)){
      return
    }
   
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

  const optionOriginalPrice = options => {
    if(!options || !Array.isArray(options)){
      return
    }

    const originalPrice = (price) => {
      let op = price - (price * 0.11) - ((price * 0.1) * 0.1)
      return op
    }
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
      return `(${originalPrice(minPrice).toLocaleString("ko")}원)`
    } else {
      return `(${originalPrice(minPrice).toLocaleString("ko")}~${originalPrice(maxPrice).toLocaleString("ko")}원)`
    }
  }

  const optionsImage = options => {
    if(!options || !Array.isArray(options)){
      return
    }
    
    const images = []
    
    options.forEach(item => {
      
      if(item.image){
        if(!images.includes(item.image)){
          images.push(item.image)
        }
        
      }
      
    })
    
    return images.map((item, i) =>

        <Image
          key={i}
          width={50}
          height={50}
          src={item.replace(/492/gi, "50")}
          fallback={item}
          preview={{
            src: item.replace(/492/gi, "800")
          }}
        />
      
    )
   
  }
  const optionAttribute = options => {
    if(!options || !Array.isArray(options)) {
      return
    }
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
  
  return (
    <div>
      <Divider>{isRegister ? "등록됨" : index + 1}</Divider>
      <TopContainer>
        <div
          style={{
            // margin: "7px",
            minWidth: "400px",
            maxWidth: "400px",
            boxShadow: "0 0 0 2px #c9c9c9 inset",
            background: "white",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: isRegister ? "rgba(255,0,0, 0.3)" : "none"
          }}
        >
          <KeywordModal isModalVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} title={title} keyword={selectKeyword}/>
          <TitleArrayComponent title={title} titleArray={titleArray} SetSelectKeyword={SetSelectKeyword} showModal={showModal} ref={titleArrayRef}/>
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
              <div>{optionAttribute(options)}</div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "900",
                  textAlign: "right",
                  color: "#FF3377"
                }}
              >
                <Tooltip title="판매가">
                  {optionPrice(options)}
                </Tooltip>
                <Tooltip title="수수료 제외가">
                  <span style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    textAlign: "right",
                    color: "#444444"
                  }}>
                    {optionOriginalPrice(options)}
                  </span>
                </Tooltip>
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
                  otherSellerCount ? otherSellerCount.toLocaleString("ko") : 1
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
                  src={`https://www.coupang.com/vp/product/reviews?productId=${productId}&page=1&size=500&sortBy=ORDER_SCORE_ASC&ratings=&q=&viRoleCode=3&ratingSummary=true`}
                />
              </Drawer>
              <Tooltip title="상품평 보기">
                <StartRatingContainer onClick={() => setVisibleReview(true)}>
                  <StartRatings
                    rating={((ratingAveragePercentage || 0) * 5) / 100}
                    starDimension="18px"
                    starSpacing="0"
                    starRatedColor="#FF9600"
                  />
                  <div>
                    {`상품평: `}
                    <span>{`${
                      ratingCount ? ratingCount.toLocaleString("ko") : 0
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
                  src={`https://www.coupang.com/vp/products/${productId}/inquiries?pageNo=1&isPreview=false`}
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
                  onClick={() => shell.openExternal(detail)}
                >
                  쿠팡
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
        
        <div style={{
          marginLeft: "20px",
          width: "100%"
        }}>
          <div>
            <Input
              size="large"
              addonBefore="제목"
              placeholder="상품 제목을 선택해주세요."
              allowClear
              value={modifyTitle}
              onChange={e => {
                setModifyTitle(e.target.value)
              }}
              onBlur={e=>{
                setRootTitle(index, e.target.value)
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
              placeholder="등록할 상품의 상세주소를 입력해 주세요."
              allowClear
              value={selectedUrl}
              border={false}
              onChange={e => {
                SetSelectedUrl(e.target.value)
              }}
              onBlur={e=>{
                setRootDetailUrl(index, e.target.value)
              }}
              disabled={isRegister}
              style={{ border: "3px solid #512da8" }}
            />
          </div>
        
        <InputContainer>
          
          <div style={{ display: "flex" }}>
            <div>
              <Checkbox
                style={{ padding: "15px", fontSize: "16px" }}
                checked={clothes}
                onChange={e => {
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
                onChange={e => {
                  setShose(e.target.checked)
                  setRootShoes(index, e.target.checked)
                }}
              >
                신발
              </Checkbox>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center"}}>
            <div style={{marginRight: "10px", fontSize: "16px"}}>무게 (배송비)</div>
            <Select size="large" bordered={false} defaultValue={`${shippingPrice[0].title}Kg (${shippingPrice[0].price.toLocaleString("ko")}원)`} style={{ width: 180, border: "3px solid #512da8" }} onChange={handleChange}>
              {
                shippingPrice.map((item, index) =>
                <Option value={item.title}>{`${item.title}Kg (${item.price.toLocaleString("ko")}원)`}</Option>  
                )
              }
            </Select>
          </div>
          
          
         
        </InputContainer>
        </div>
      </TopContainer>
      
      <OptionsImagesContainer>
        <Image.PreviewGroup>
          {optionsImage(options)}
        </Image.PreviewGroup>
      </OptionsImagesContainer>
      <ImageContainer>
        <Image.PreviewGroup>
        {mainImages && Array.isArray(mainImages) && mainImages.map((item, i) => (
          <div key={i} style={{ margin: "10px", position: "relative" }}>
          <Image
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
            <TaobaoImageSearchButton image={item} title={title} selectItem={selectItem} searchClick={() => {
            titleArrayRef.current.getKiprisSearch()
          }} />
            
          </DownloadContainer>
        </div>
        ))}
        </Image.PreviewGroup>
      </ImageContainer>
    </div>
  )
}

const TopContainer = styled.div`
  display: flex;
`
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
  & > :nth-child(n){
    flex: 1;
  }
  & > :not(:last-child) {
    margin-right: 10px;
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
const OptionAttributeContainer = styled.div`
  display: flex;
  & > :not(:last-child) {
    margin-right: 20px;
  }
`

const InputContainer = styled.div`
  display: flex;

  width: 100%;

  margin-right: 20px;
  & > :first-child {
    width: 100%;
    margin-right: 10px;
    
  }
  & > :last-child {
    min-width: 290px;
    max-width: 290px;
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

const OptionsImagesContainer = styled(SimpleBar)`
  display: flex;
  width: 100%;
  height: 50px;
  overflow-x: auto;
  overflow-y: hidden;
  margin-top: 5px;
  margin-bottom: 5px;

`