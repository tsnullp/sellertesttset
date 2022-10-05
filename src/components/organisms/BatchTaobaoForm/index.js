import React, {useState} from "react"
import { Input, message, Spin, Tag, InputNumber, Checkbox, Button, BackTop } from 'antd'
import styled from "styled-components"
import { useQuery, useMutation } from "@apollo/client"
import { TRANSLATE_PAPAGO, BATCH_TAOBAO_ITEM } from "gql"
import { useFormik } from "formik"
const { Search, TextArea } = Input
const { shell } = window.require("electron")

let profit = isNaN(Number(localStorage.getItem("profit")))
  ? 40
  : Number(localStorage.getItem("profit"))
let fees = isNaN(Number(localStorage.getItem("fees"))) ? 11 : Number(localStorage.getItem("fees"))
let discount = isNaN(Number(localStorage.getItem("discount")))
  ? 10
  : Number(localStorage.getItem("discount"))
let shippingFee = isNaN(Number(localStorage.getItem("shipping")))
  ? 7000
  : Number(localStorage.getItem("shipping"))
let exchange = isNaN(Number(localStorage.getItem("exchange")))
  ? 175
  : Number(localStorage.getItem("exchange"))

  const costAccounting = (fee, sale = false, original = false) => {
    // 1. '타오바바' 결제수수료 3% 추가
    let cost = fee * 1.03
    // 2. '카드사별 브랜드 수수료' 1% 추가 ( ex . 마스터카드 )
    cost = cost * 1.01
    // 3. '전신환매도율' 적용 하여  기준환율  x1% ( 대략 ) 적용
    let exRate = exchange * 1.01
    // 4. 최종금액에 '카드사 해외이용 수수료 0.25% ' 추가
    cost = cost * exRate * 1.025
  
    if (original) {
      return Math.ceil((cost + shippingFee) * 0.1) * 10
    }
    if (sale) {
      return (
        Math.ceil(
          (cost + shippingFee) * ((Number(profit) - Number(discount) + Number(fees)) / 100 + 1) * 0.1
        ) * 10
      )
    } else {
      return Math.ceil((cost + shippingFee) * ((Number(profit) + Number(fees)) / 100 + 1) * 0.1) * 10
    }
  }
  
const BatchTaobaoForm = () => {  

  const [beforeText, setBeforeText] = useState("")
  const [exchangePrice, setExchangePrice] = useState(exchange)
  const [shippingPrice, setShippingPrice] = useState(shippingFee)
  const [profitPrice, setProfitPrice] = useState(profit)
  const [discountPrice, setDiscountPrice] = useState(discount)
  const [feePrice, setFeePrice] = useState(fees)

  const [clothes, setClothes] = useState(false)
  const [shoes, setShose] = useState(false)

  const [isLoading, setLoading] = useState(false)

  const [batchTaobao] = useMutation(BATCH_TAOBAO_ITEM)

  const formik = useFormik({
    initialValues: {
      data: []
    },
    onSubmit: async values => {
      console.log("value", values)
      if(values.data.length === 0){
        message.warning("업로드할 상품이 존재하지 않습니다.")
        return
      }
      try {
  
        const response = await batchTaobao({
          variables: {
            input: values.data.filter(item => item.checked).map(item => {
              let korTitle = item.korTitle
              if(beforeText.length > 0 && !korTitle.includes(beforeText)){
                korTitle = `${beforeText} ${item.korTitle}`
              }

              return {
                detailUrl: item.detailUrl,
                korTitle,
                profit: profitPrice,
                fees: feePrice,
                discount: discountPrice,
                shippingFee: shippingPrice,
                exchange: exchangePrice,
                isClothes: clothes,
                isShoes: shoes
              }
            })
          }
        })
        console.log("response.", response)
        if(response.data.BatchTaobaoItem){
          message.success("업로드 요청 중입니다.")
          setBeforeText("")
          setClothes(false)
          setShose(false)
          formik.setFieldValue("data", [])
        } else {
          message.error("업로드 요청에 실패하였습니다.")
          
        }
      } catch (e) {
        console.log("ee", e)
      }
      
    }
  })

  const onLoaded = () => {
    if(formik.values.data.length === 0){
      return true
    }
    const total = formik.values.data.filter(item => item.checked).length
    const checkedData = formik.values.data.filter(item => item.checked && item.korTitle && item.korTitle.length > 0).length
    
    if(total === checkedData){
      return false
    }
    return true
  }
  const onSearch = async value => {
    
    try {
      if(value.includes("g_page_config")){
        const temp1 = value.split("g_page_config = ")[1]
        const temp2 = temp1.split(";     g_srp_loadCss()")[0]
        
        const itemValue = JSON.parse(temp2)
        if(itemValue && itemValue.mods && itemValue.mods.itemlist && itemValue.mods.itemlist.data && itemValue.mods.itemlist.data.auctions){

          const auctions = itemValue.mods.itemlist.data.auctions
          
          
          // const response = await translate({
          //   variables: {
          //     text: auctions.map(item => item.raw_title)
          //   }
          // })
          // console.log("response", response)
          // if(response.length === auctions.length){
          //  auctions.forEach((item, i) =>
          //  item.korTitle = response.data.TranslatePapago[i]
          //  )
          // }
          console.log("auctions", auctions)
          formik.setFieldValue("data", auctions.filter(item => !item.detail_url.includes("click.simba")).map(item => {
            let picUrl = null
            if(item.pic_url.includes("http")){
              picUrl = `${item.pic_url}_200x200.jpg`
            } else {
              picUrl = `https:${item.pic_url}`
            }
            let detailUrl = null
            if(item.detail_url.includes("http")){
              detailUrl = `${item.detail_url}`
            } else {
              detailUrl = `https:${item.detail_url}`
            }
            return {
              checked: true,
              picUrl,
              detailUrl,
              rawTitle: item.raw_title,
              isTmail: item.shopcard.isTmall,
              korTitle: "",
              viewPrice: item.view_price
            }
          }))
          
        }
      }
    } catch (e) {
      console.log("error,",e)
      message.error("올바르지 않는 소스형식입니다.")
    } finally {
      
    }
  }
 
  const handleExchange = value => {
    exchange = value
    setExchangePrice(value)
  }
  const handleShipping = value => {
    shippingFee = value
    setShippingPrice(value)
  }
  const handleProfit = value => {
    profit = value
    setProfitPrice(value)
  }
  const handleDiscount = value => {
    discount = value
    setDiscountPrice(value)
  }
  const handleFees = value => {
    fees = value
    setFeePrice(value)
  }

  return (
    <Container>
      <BackTop />
      <Search 
        size="large"
        placeholder="소스를 넣어주세요" 
        allowClear
        onSearch={onSearch} 
        enterButton />
      <BasicPriceInfoContainer>
        <BasicPriceContainer>
          <div>
              <ChinaLabel>키워드 추가</ChinaLabel>
              <Input
                style={{ width: "100%" }}
                size="large"
                step={10} 
                value={beforeText}
                onChange={(e) => {
                  setBeforeText(e.target.value)
                }}
              />
            </div>
          <div>
              <ChinaLabel>환율</ChinaLabel>
              <InputNumber
                style={{ width: "100px" }}
                size="large"
                step={10}
                name="exchange"
                value={exchange}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={handleExchange}
              />
            </div>
            <div>
              <ChinaLabel>해외 배송비</ChinaLabel>
              <InputNumber
                style={{ width: "100px" }}
                size="large"
                step={100}
                name="shipping"
                value={shippingPrice}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={handleShipping}
              />
            </div>

            <div>
              <ChinaLabel>마진율</ChinaLabel>
              <InputNumber
                style={{ width: "100px" }}
                size="large"
                min={1}
                max={1000}
                name="profit"
                value={profit}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={handleProfit}
              />
            </div>

            <div>
              <ChinaLabel>할인율</ChinaLabel>
              <InputNumber
                style={{ width: "100px" }}
                size="large"
                min={1}
                max={1000}
                name="discount"
                value={discount}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={handleDiscount}
              />
            </div>
            <div>
              <ChinaLabel>수수료</ChinaLabel>
              <InputNumber
                style={{ width: "100px" }}
                size="large"
                step={1}
                name="fees"
                value={fees}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={handleFees}
              />
            </div>
            <div>
                <Checkbox
                  style={{ padding: "15px", fontSize: "16px" }}
                  checked={clothes}
                  onChange={e => setClothes(e.target.checked)}
                >
                  의류
                </Checkbox>
              </div>
              <div>
                <Checkbox
                  style={{ padding: "15px", fontSize: "16px" }}
                  checked={shoes}
                  onChange={e => setShose(e.target.checked)}
                >
                  신발
                </Checkbox>
              </div>
              </BasicPriceContainer>
              <Button
                size="large"
                style={{width: "200px"}}
                loading={isLoading}
                type="primary"
                htmlType="submit"
                onClick={formik.handleSubmit}
                disabled={onLoaded()}
            >
              업로드
            </Button>
      </BasicPriceInfoContainer>
      <TableRowContainer>
        
        {formik.values.data.map((item, index) => 
          <TableRow key={index} index={index} item={item} formik={formik}/>
          )}
      </TableRowContainer>
    </Container>
  )
}

export default BatchTaobaoForm

const Container = styled.div`
  padding: 20px;
`

const BasicPriceInfoContainer = styled.div`
  display: flex;
  margin: 10px;
  justify-content: space-between;
  align-items: flex-end;
`

const BasicPriceContainer = styled.div`
  display: flex;
  align-items: flex-end;
  &>:not(:last-child){
    margin-right: 10px;
  }
`

const ChinaLabel = styled.div`
  text-align: right;
  font-size: 13px;
  margin-bottom: 4px;
  color: ${props => props.theme.primaryDark};
`

const TableRowContainer = styled.div`
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
`

const TaobaoImageContaier = styled.div`
  position: relative;
  cursor: pointer;
`

const Thumbnail = styled.img`
  width: 200px;
`

const TableRow = ({item, index, formik}) => {
  
  const {networkStatus, refetch, data} = useQuery(TRANSLATE_PAPAGO, {
    variables: {
      text: item.rawTitle
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: data=> {
      
      formik.setFieldValue(`data.${index}.korTitle`, data.TranslatePapago)
    }
  })

  
  return (
    <TableRowItmeContainer>
      <TaobaoImageContaier
        onClick={() => {
          formik.setFieldValue(`data.${index}.checked`, !formik.values.data[index].checked)
        }}
      >
      <Thumbnail src={item.picUrl} alt={item.picUrl}/>
      {item.checked && <CheckBoxIcon />}
      </TaobaoImageContaier>
      <div>
        <div>
          <Tag
              style={{
                display: "inline-flex",
                justifyContent: "flex-end",
                alignItems: "center",
                cursor: "pointer"
              }}
              icon={
                <img
                  style={{ marginRight: "4px" }}
                  src={item.isTmall ? "https://img.alicdn.com/tfs/TB1XlF3RpXXXXc6XXXXXXXXXXXX-16-16.png" :  "https://img.alicdn.com/tfs/TB1VlKFRpXXXXcNapXXXXXXXXXX-16-16.png"}
                  alt="taobao"
                />
              }
              onClick={() => shell.openExternal(item.detailUrl)}
            >
              {item.isTmall ? "티몰" : "타오바오"}
            </Tag>
            <Tag
              style={{
                display: "inline-flex",
                justifyContent: "flex-end",
                alignItems: "center",
                cursor: "pointer"
              }}
              icon={
                <img
                  style={{ marginRight: "4px", width: "16px" }}
                  src={"https://papago.naver.com/favicon.ico"}
                  alt="taobao"
                />
              }
              onClick={() => refetch()}
            >
              번역
            </Tag>
            <div style={{marginTop: "2px", marginBottom: "2px"}}>{item.rawTitle}</div>
            {(networkStatus === 1 || networkStatus === 2 || networkStatus === 4) && <Spin />}
            {(networkStatus === 7 || networkStatus === 8) &&
            <>
              <TextArea
                size="large"
                rows={4}
                name={`data.${index}.korTitle`}
                value={formik.values.data[index].korTitle}
                onChange={e => {
                  formik.setFieldValue(`data.${index}.korTitle`, e.target.value)
                }}
              />
              
              </>
            }
            </div>
        <PriceLabel>
          {`${costAccounting(formik.values.data[index].viewPrice, true).toLocaleString("ko")}~`}

        </PriceLabel>
        {/* <InputNumber
            size="large"
            name={`item.${index}.viewPrice`}
            // value={formik.values.data[index].viewPrice}
            value={costAccounting(formik.values.data[index].viewPrice, true)}
            onChange={value=> {
              formik.setFieldValue(`data.${index}.viewPrice`, value)
            }}
          /> */}
      </div>
    </TableRowItmeContainer>
  )
}

const TableRowItmeContainer = styled.div`
  margin: 10px;
  margin-bottom: 20px;
  display: flex;
  /* flex: 0.6; */
  &>:nth-child(2){
    margin-top: 10px;
    margin-left: 10px;
    margin-bottom: 10px;
    min-width: 250px;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
`

const PriceLabel = styled.div`
  font-size: 18px;
  font-weight: 900;
  color: ${props => props.theme.primaryDark};
  text-align: right;
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
  background: rgba(0, 0, 240, 0.2);
`
const CheckBoxWrapper = styled.div`
  position: relative;
`

const CheckBoxIconContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
`