import React, { useState, useEffect, useRef } from "react"

import { TextEditor } from "components"
import {
  Collapse,
  Form,
  Input,
  InputNumber,
  Select,
  Cascader,
  Button,
  message,
  Tooltip,
  Switch,
  Tag,
  Table,
  Spin,
  Popconfirm,
  Modal,
  Checkbox,
  
} from "antd"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { useFormik } from "formik"
import CoupongCategory from "../../../server/models/CoupangCatetory"
import { useMutation, useQuery } from "@apollo/client"
import {
  CREATE_PRODUCT,
  CREATE_COUPANG,
  CREATE_CAFE24,
  GET_KEYWORD_VIEWS,
  RELATED_KEYWORD,
  SENTIMENT_RANK,
  SEARCH_TITLE,
  GET_COUPANG_CATEGORY_META,
  MUTATION_RELATED_KEYWORD_ONLY,
  SENTIMENT_RANK_ONLY,
  UPLOAD_IMAGE
} from "../../../gql"
import {arrayMoveImmutable} from "array-move"
import { SortableContainer, SortableElement } from "react-sortable-hoc"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
import {
  UndoOutlined,
  SwapRightOutlined,
  CheckOutlined,
  CloseOutlined,
  PlusOutlined,
  SaveOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons"
import { getByte, regExp_test } from "../../../lib/userFunc"
import "./style.css"
//https://item.taobao.com/item.htm?spm=a21wu.241046-cn.4691948847.237.41cab6cbhCW9oq&scm=1007.15423.84311.100200300000004&id=555312177177&pvid=c152114c-8b6d-4cdd-804b-dcb2809c3cd1
const { Search } = Input
const { Panel } = Collapse
const { TextArea } = Input
const { Option } = Select

const { shell } = window.require("electron")

let optionValueArray = []

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

let basicSubmitSuccess = null
let optionSubmitSuccess = null

const ProductUploadForm = ({ item, productUrl, update = false, handleDone, newWindow }) => {
  const [isBatch, setBatch] = useState(false)
  const [loading, setLoading] = useState(false)

  const [optionObj, setOptionObj] = useState(item.options)
  
  const [topHtmlL, setTopHtml] = useState("")
  const [optionHtmlL, setOptionHtml] = useState(item.optionHtml)
  const [detailHtmlL, setDetailHtml] = useState("")
  const [bottomHtmlL, setBottomHtml] = useState("")

  const [updateType, setUpdateType] = useState(100)
  console.log("aaa->", item)

  const optionRef = useRef(
    item.options.map(item => {
      return React.createRef()
    })
  )

  // useEffect(() => {
  //   setOptionHtml(item.optionHtml)
  // }, [item.optionHtml])

  useEffect(() => {
    if (item.options.filter(item => item.korKey).length > 0) {
      setBatch(true)
    }
    if (item.profit) {
      profit = item.profit
    }
    if (item.fees) {
      fees = item.fees
    }
    if (item.discount) {
      discount = item.discount
    }

    if (item.shippingFee) {
      shippingFee = item.shippingFee
    }
    if (item.exchange) {
      exchange = item.exchange
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const SubmitHandler =  () => {
    
    setLoading(true)
 
    
    console.log("SubmitHandler=-==")

    setTimeout(async() => {

      
      console.log("loading", loading)
      if(loading){
        console.log("loading...")
        return
      }
      message.loading({ content: "상품을 업로드 중입니다...", key: "createproduct" })
    
      const product = {
        good_id: basicSubmitSuccess.good_id,
        korTitle: basicSubmitSuccess.productName.trim(),
        mainImages: basicSubmitSuccess.mainImages,
        price: basicSubmitSuccess.price,
        salePrice: basicSubmitSuccess.salePrice,
        keyword: basicSubmitSuccess.keyword,
        topHtml: topHtmlL,
        isClothes: basicSubmitSuccess.isClothes,
        isShoes: basicSubmitSuccess.isShoes,
        clothesHtml: basicSubmitSuccess.clothesHtml,
        shoesHtml: basicSubmitSuccess.shoesHtml,
        optionHtml: optionHtmlL,
        html: detailHtmlL,
        bottomHtml: bottomHtmlL,
        brand: basicSubmitSuccess.brand, // 브랜드
        manufacture: basicSubmitSuccess.brand, // 제조사
        outboundShippingTimeDay: basicSubmitSuccess.shipping.outboundShippingTimeDay, // 기준출고일(일)
        deliveryChargeType: basicSubmitSuccess.shipping.deliveryChargeType, // 배송비 종류
        deliveryCharge: basicSubmitSuccess.shipping.deliveryCharge, // 기본배송비
        deliveryChargeOnReturn: basicSubmitSuccess.returnCenter.deliveryChargeOnReturn, // 초도반품배송비
        cafe24_product_no: basicSubmitSuccess.cafe24_product_no,
        cafe24_mainImage: basicSubmitSuccess.cafe24_mainImage,
        coupang_productID: basicSubmitSuccess.coupang_productID,
        naverCategoryCode: basicSubmitSuccess.naverCategoryCode,
        profit,
        fees,
        discount,
        shippingFee,
        exchange
      }

      const coupang = {
        displayCategoryCode: basicSubmitSuccess.categoryCode, // 노출카테고리코드
        displayCategoryName: basicSubmitSuccess.categoryName, // 노출카테고리코드

        vendorId: basicSubmitSuccess.vendorId, // 판매자ID

        deliveryCompanyCode: basicSubmitSuccess.shipping.deliveryCompanyCode, // 택배사 코드

        returnCenterCode: basicSubmitSuccess.returnCenter.returnCenterCode, // 반품지센터코드
        returnChargeName: basicSubmitSuccess.returnCenter.shippingPlaceName, // 반품지명
        companyContactNumber: basicSubmitSuccess.returnCenter.placeAddresses[0].companyContactNumber, // 반품지연락처
        returnZipCode: basicSubmitSuccess.returnCenter.placeAddresses[0].returnZipCode, // 반품지우편번호
        returnAddress: basicSubmitSuccess.returnCenter.placeAddresses[0].returnAddress, // 반품지주소
        returnAddressDetail: basicSubmitSuccess.returnCenter.placeAddresses[0].returnAddressDetail, // 반품지주소상세
        returnCharge: basicSubmitSuccess.returnCenter.returnCharge, // 반품배송비
        afterServiceInformation: basicSubmitSuccess.afterServiceInformation, // A/S안내
        afterServiceContactNumber: basicSubmitSuccess.afterServiceContactNumber, // A/S전화번호
        outboundShippingPlaceCode: basicSubmitSuccess.shipping.outboundShippingPlaceCode, // 출고지주소코드
        vendorUserId: basicSubmitSuccess.vendorUserId, // 실사용자아이디(쿠팡 Wing ID)

        invoiceDocument: basicSubmitSuccess.invoiceDocument,

        maximumBuyForPerson: basicSubmitSuccess.maximumBuyForPerson, // 인당 최대 구매수량
        maximumBuyForPersonPeriod: basicSubmitSuccess.maximumBuyForPersonPeriod, // 최대 구매 수량 기간

        notices: basicSubmitSuccess.noticeCategories[0].noticeCategoryDetailNames.map(item => {
          return {
            noticeCategoryName: basicSubmitSuccess.noticeCategories[0].noticeCategoryName, // 상품고시정보카테고리명
            noticeCategoryDetailName: item.noticeCategoryDetailName, // 상품고시정보카테고리상세명
            content: item.content // 내용
          }
        }),
        attributes: basicSubmitSuccess.attributes.map(item => {
          return {
            attributeTypeName: item.attributeTypeName, // 옵션타입명
            attributeValueName: item.attributeValueName, // 옵션값
            required: item.required
          }
        }),
        certifications: basicSubmitSuccess.certifications.map(item => {
          return {
            certificationType: item.certificationType,
            dataType: item.dataType,
            name: item.name,
            required: item.required
          }
        })
      }

      const cafe24 = {
        mallID: basicSubmitSuccess.cafe24_mallID,
        shop_no: basicSubmitSuccess.cafe24_shop_no
      }

      console.log("variables", {
        product,
        options: optionSubmitSuccess.map(item => {
          return {
            key: item.key,
            value: item.value,
            korKey: item.korKey,
            korValue: item.korValue,
            image: item.image,
            price: item.price,
            productPrice: item.productPrice,
            salePrice: item.salePrice,
            stock: item.stock,
            disabled: item.disabled,
            active: item.active,
            base: item.base,
            attributes: item.attributes.map(item => {
              return {
                attributeTypeName: item.attributeTypeName,
                attributeValueName: item.attributeValueName,
                required: item.required
              }
            })
          }
        }),
        coupang,
        cafe24
      })

      let response = null
      if (updateType === 100) {
        response = await setProduct({
          variables: {
            id: basicSubmitSuccess.id,
            product,
            options: optionSubmitSuccess.map(item => {
              return {
                key: item.key,
                value: item.value,
                korKey: item.korKey,
                korValue: item.korValue,
                image: item.image,
                price: item.price,
                productPrice: item.productPrice,
                salePrice: item.salePrice,
                stock: item.stock,
                disabled: item.disabled,
                active: item.active,
                base: item.base,
                attributes: item.attributes.map(item => {
                  return {
                    attributeTypeName: item.attributeTypeName,
                    attributeValueName: item.attributeValueName,
                    required: item.required
                  }
                }),
                cafe24_variant_code: item.cafe24_variant_code,
                coupang_sellerProductItemId: item.coupang_sellerProductItemId,
                coupang_vendorItemId: item.coupang_vendorItemId
              }
            }),
            coupang,
            cafe24
          }
        })
        setLoading(false)
        let coupagnSuccess = false
        let cafe24Sucess = false
        if (response.data.CreateProduct) {
          const { coupang, cafe24 } = response.data.CreateProduct
          if (coupang.code === "ERROR") {
            message.error({ content: `쿠팡 - ${coupang.message}`, key: "coupang", duration: 0 })
          } else {
            message.success({ content: "쿠팡 성공!", key: "coupang", duration: 5 })
            coupagnSuccess = true
          }
          if (cafe24.code === "ERROR") {
            message.error({ content: `카페24 - ${cafe24.message}`, key: "cafe24", duration: 0 })
          } else {
            message.success({ content: "카페24 성공!", key: "cafe24", duration: 5 })
            cafe24Sucess = true
          }

          if (coupagnSuccess && cafe24Sucess && handleDone) {
            handleDone()
          }

          if (coupagnSuccess && cafe24Sucess && newWindow) {
            setTimeout(() => {
              window.close()
            }, 1000)
            // fconst window = remote.getCurrentWindow()
          }
        } else {
          message.error({ content: "Error", key: "createproduct", duration: 0 })
        }
      } else if (updateType === 1) {
        // 쿠팡
        response = await setCoupang({
          variables: {
            id: basicSubmitSuccess.id,
            product,
            options: optionSubmitSuccess.map(item => {
              return {
                key: item.key,
                value: item.value,
                korKey: item.korKey,
                korValue: item.korValue,
                image: item.image,
                price: item.price,
                productPrice: item.productPrice,
                salePrice: item.salePrice,
                stock: item.stock,
                disabled: item.disabled,
                active: item.active,
                base: item.base,
                attributes: item.attributes.map(item => {
                  return {
                    attributeTypeName: item.attributeTypeName,
                    attributeValueName: item.attributeValueName,
                    required: item.required
                  }
                }),
                cafe24_variant_code: item.cafe24_variant_code,
                coupang_sellerProductItemId: item.coupang_sellerProductItemId,
                coupang_vendorItemId: item.coupang_vendorItemId
              }
            }),
            coupang
          }
        })
        setLoading(false)
        let coupagnSuccess = false

        if (response.data.CreateCoupang) {
          const { coupang } = response.data.CreateCoupang
          if (coupang.code === "ERROR") {
            message.error({ content: `쿠팡 - ${coupang.message}`, key: "coupang", duration: 0 })
          } else {
            message.success({ content: "쿠팡 성공!", key: "coupang", duration: 5 })
            coupagnSuccess = true
          }

          if (coupagnSuccess && handleDone) {
            handleDone()
          }

          if (coupagnSuccess && newWindow) {
            setTimeout(() => {
              window.close()
            }, 1000)
          }
        } else {
          message.error({ content: "Error", key: "createCoupang", duration: 0 })
        }
      } else if (updateType === 2) {
        // 카페24
        response = await setCafe24({
          variables: {
            id: basicSubmitSuccess.id,
            product,
            options: optionSubmitSuccess.map(item => {
              return {
                key: item.key,
                value: item.value,
                korKey: item.korKey,
                korValue: item.korValue,
                image: item.image,
                price: item.price,
                productPrice: item.productPrice,
                salePrice: item.salePrice,
                stock: item.stock,
                disabled: item.disabled,
                active: item.active,
                base: item.base,
                attributes: item.attributes.map(item => {
                  return {
                    attributeTypeName: item.attributeTypeName,
                    attributeValueName: item.attributeValueName,
                    required: item.required
                  }
                }),
                cafe24_variant_code: item.cafe24_variant_code,
                coupang_sellerProductItemId: item.coupang_sellerProductItemId,
                coupang_vendorItemId: item.coupang_vendorItemId
              }
            }),
            cafe24
          }
        })
        setLoading(false)
        let cafe24Sucess = false
        if (response.data.CreateCafe24) {
          const { cafe24 } = response.data.CreateCafe24
          if (cafe24.code === "ERROR") {
            message.error({ content: `카페24 - ${cafe24.message}`, key: "cafe24", duration: 0 })
          } else {
            message.success({ content: "카페24 성공!", key: "cafe24", duration: 5 })
            cafe24Sucess = true
          }

          if (cafe24Sucess && handleDone) {
            handleDone()
          }

          if (cafe24Sucess && newWindow) {
            setTimeout(() => {
              window.close()
            }, 1000)
            // fconst window = remote.getCurrentWindow()
          }
        } else {
          message.error({ content: "Error", key: "createcafe24", duration: 0 })
        }
      }

      basicSubmitSuccess = null
      optionSubmitSuccess = null
    }, 1000)

    
    
  }
  const OptionHandleSubmit = values => {
    optionSubmitSuccess = values
    console.log("옵션 끝", basicSubmitSuccess)
    if (basicSubmitSuccess && optionSubmitSuccess) {
      console.log("옵션에서 탐")
      SubmitHandler()
    }
  }

  let {
    id,
    brand,
    manufacture,
    good_id,
    title,
    korTitle,
    titleArray,
    productName,
    keyword,
    mainImages,
    prop,
    options,
    price,
    salePrice,
    content,
    topHtml,
    clothesHtml,
    isClothes,
    shoesHtml,
    isShoes,
    optionHtml,
    html,
    bottomHtml,
    categoryCode,
    attribute,
    attributes,
    noticeCategories,
    requiredDocumentNames,
    certifications,
    afterServiceInformation,
    afterServiceContactNumber,
    topImage,
    bottomImage,
    vendorId,
    vendorUserId,
    invoiceDocument,
    shipping,
    returnCenter,
    maximumBuyForPerson,
    maximumBuyForPersonPeriod,
    cafe24_mallID,
    cafe24_shop_no,
    cafe24_product_no,
    cafe24_mainImage,
    coupang_productID,
    naverCategoryCode,
    keywords
  } = item
  
  const updateTitle = () => {
    const htmlTitle = document.querySelector("title")
    htmlTitle.innerHTML = productName && productName !== "undefined" ? productName : korTitle
    if (options.length === 0) {
      alert("품절상품입니다.")
    }
  }
  useEffect(updateTitle, [productName])

  const isBase =
    options.filter(item => item.active && !item.disabled && item.base).length > 0 ? true : false
  let baseIndex = 0

  const OptionInit = () => {
    if (!isBase) {
      const inValidArr = []
      options
        // .filter(item => item.active && !item.disabled)
        .forEach((item, index) => {
          let salePrice = costAccounting(item.price, true)

          let minPassablePrice = 0
          let maxPassablePrice = 0
          if (salePrice > 0 && salePrice < 2000) {
            maxPassablePrice = Math.floor((salePrice + (salePrice * 100) / 100) * 0.1) * 10
          } else if (salePrice >= 2000 && salePrice < 10000) {
            minPassablePrice = Math.ceil((salePrice - (salePrice * 50) / 100) * 0.1) * 10
            maxPassablePrice = Math.floor((salePrice + (salePrice * 100) / 100) * 0.1) * 10 - 10
          } else if (salePrice >= 10000) {
            minPassablePrice = Math.ceil((salePrice - (salePrice * 50) / 100) * 0.1) * 10
            maxPassablePrice = Math.floor((salePrice + (salePrice * 50) / 100) * 0.1) * 10 - 10
          }
          const inValid = []
          options
            .filter(item => item.active && !item.disabled)
            .forEach((item1, index1) => {
              if (
                costAccounting(item1.price, true) < minPassablePrice ||
                costAccounting(item1.price, true) > maxPassablePrice
              ) {
                inValid.push(item1)
              }
            })
          inValidArr.push(inValid.length)
        })

      const minValue = Math.min.apply(null, inValidArr)

      baseIndex = inValidArr.indexOf(minValue)
    }
    options = options
      // .filter(item => item.active && !item.disabled)
      .map((item, index) => {
        // console.log(
        //   costAccounting(item.price, true) -
        //     costAccounting(item.price, true, true) -
        //     costAccounting(item.price, true) * (fees / 100)
        // )
        // console.log(costAccounting(item.price, true) * (fees / 100))

        if (update && (item.cafe24_product_no || item.coupang_productID)) {
          return {
            ...item,
            base: isBase ? item.base : index === baseIndex ? true : false
          }
        } else {
          return {
            ...item,
            // base: index === 0 ? true : false,
            salePrice: update
              ? item.salePrice
              : Math.ceil(costAccounting(item.price, true) * 0.1) * 10,

            productPrice: update
              ? item.productPrice
              : Math.ceil((costAccounting(item.price, true) / (1 - discount / 100)) * 0.1) * 10,
            expectPrice:
              costAccounting(item.price, true) -
              costAccounting(item.price, true, true) -
              costAccounting(item.price, true) * (fees / 100),
            base: isBase ? item.base : index === baseIndex ? true : false
          }
        }

        // item.salePrice = costAccounting(item.price, true)
        // item.productPrice = costAccounting(item.price, false)
      })
    setOptionObj(options)
  }
  useEffect(() => {
    OptionInit()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  
  const [setProduct] = useMutation(CREATE_PRODUCT)
  const [setCoupang] = useMutation(CREATE_COUPANG)
  const [setCafe24] = useMutation(CREATE_CAFE24)
  const formik = useFormik({
    initialValues: {
      id,
      brand,
      manufacture,
      good_id,
      title,
      korTitle,
      productName: productName && productName !== "undefined" ? productName : korTitle,
      keyword: keyword && Array.isArray(keyword) ? keyword : [],
      mainImages,
      prop,
      options,
      price,
      salePrice,
      content,
      topHtml,
      clothesHtml,
      isClothes,
      shoesHtml,
      isShoes,
      optionHtml,
      html,
      bottomHtml,
      categoryCode,
      attribute,
      noticeCategories,
      attributes,
      requiredDocumentNames,
      certifications,
      afterServiceInformation,
      afterServiceContactNumber,
      topImage,
      bottomImage,
      vendorId,
      vendorUserId,
      invoiceDocument,
      shipping,
      returnCenter,
      maximumBuyForPerson,
      maximumBuyForPersonPeriod,
      cafe24_mallID,
      cafe24_shop_no,
      cafe24_product_no,
      cafe24_mainImage,
      coupang_productID,
      naverCategoryCode
    },
    validate: values => {
      const errors = {}
      if (values.productName.trim().length === 0) {
        errors.productName = "상품명을 입력해 주세요."
      }
      if (values.productName.trim().length > 100) {
        errors.productName = "상품명이 100글자를 초과했습니다."
      }

      //       · 판매가 0원 ~ 2,000원 미만 : 0원 이상 ~ +100% 이하만 설정 가능

      // · 판매가 2,000원 ~ 10,000원 미만 : 판매가의 -50% 이상 ~ +100% 이하만 설정 가능

      // · 판매가 10,000원 이상 : 판매가의 -50% 이상 ~ 판매가의 +50% 이하만 설정 가능

      //  예) 판매가 10,000원일 경우, 옵션가 -5,000원 ~ +5,000원 이내로 설정 가능

      return errors
    },
    onValidationError: errorValues => {
      console.log("erorrValues", errorValues)
      alert("상품을 올리기 전 제목이나 옵션을 다시 한번 확인해주세요")
    },
    onSubmit: async values => {
      basicSubmitSuccess = values
      if (basicSubmitSuccess && optionSubmitSuccess ) {
        SubmitHandler()
      }
    }
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center"
  }

  // if (!good_id) {
  //   return <div>잠시 후 다시 시도 해 주세요</div>
  // }

  return (
    <Container>
      <Form
        {...layout}
        name="productregister"
        initialValues={formik.initialValues}
        onFinish={formik.submitForm}
      >
        {CategoryForm(formik, update)}
        {MainForm(formik)}
        {TitleForm(formik, keywords, titleArray)}
        {SearchForm(formik)}
        {OptionForm({
          formik,
          options: item.options,
          isBatch,
          setBatch,
          productUrl,
          shell,
          optionObj,
          setOptionObj,
          optionRef,
          OptionHandleSubmit
        })}
        {/* {formik.initialValues.prop && Array.isArray(formik.initialValues.prop) && formik.initialValues.prop.length > 0
        && OptionFromNew({
          formik,
          prop: item.prop,
          options: item.options,
          optionRef,
          OptionHandleSubmit
        })}
        {!formik.initialValues.prop && OptionForm({
          formik,
          options: item.options,
          isBatch,
          setBatch,
          productUrl,
          shell,
          optionObj,
          setOptionObj,
          optionRef,
          OptionHandleSubmit
        })} */}
        {!formik.initialValues.html || formik.initialValues.topHtml
          ? DetailFormNew({
              formik,
              update,
              isBatch,
              options: optionObj,
              topHtml: topHtmlL,
              setTopHtml,
              optionHtml: optionHtmlL,
              setOptionHtml,
              detailHtml: detailHtmlL,
              setDetailHtml,
              bottomHtml: bottomHtmlL,
              setBottomHtml,
              clothesHtml,
              isClothes,
              shoesHtml,
              isShoes
            })
          : DetailForm({ formik, update, isBatch, options: item.options })}
        {CategoryMetaForm(formik)}
        {ASForm(formik)}
        {ShippingForm(formik)}
        {ReturnCenterForm(formik)}
        {ProductInformationForm(formik)}
        {SubmitForm(
          formik,
          loading,
          setUpdateType,
          optionRef,
          basicSubmitSuccess,
          optionSubmitSuccess
        )}
      </Form>
    </Container>
  )
}

export default ProductUploadForm

const CategoryForm = (formik, update) => {
  const [getCategoryMeta] = useMutation(GET_COUPANG_CATEGORY_META)
  const fullCategory = value => {
    let category1, category2, category3, category4, category5, category6
    let category1Name, category2Name, category3Name, category4Name, category5Name, category6Name

    CoupongCategory.forEach((item1, i) => {
      if (item1.value === value) {
        category1 = CoupongCategory[i].value
        category1Name = CoupongCategory[i].label
        return
      }

      item1.children.forEach(item2 => {
        if (item2.value === value) {
          category1 = item1.value
          category1Name = item1.label
          category2 = item2.value
          category2Name = item2.label
          return
        }

        item2.children.forEach(item3 => {
          if (item3.value === value) {
            category1 = item1.value
            category1Name = item1.label
            category2 = item2.value
            category2Name = item2.label
            category3 = item3.value
            category3Name = item3.label
            return
          }

          item3.children.forEach(item4 => {
            if (item4.value === value) {
              category1 = item1.value
              category1Name = item1.label
              category2 = item2.value
              category2Name = item2.label
              category3 = item3.value
              category3Name = item3.label
              category4 = item4.value
              category4Name = item4.label
              return
            }
            item4.children.forEach(item5 => {
              if (item5.value === value) {
                category1 = item1.value
                category1Name = item1.label
                category2 = item2.value
                category2Name = item2.label
                category3 = item3.value
                category3Name = item3.label
                category4 = item4.value
                category4Name = item4.label
                category5 = item5.value
                category5Name = item5.label
                return
              }
              item5.children.forEach(item6 => {
                if (item6.value === value) {
                  category1 = item1.value
                  category1Name = item1.label
                  category2 = item2.value
                  category2Name = item2.label
                  category3 = item3.value
                  category3Name = item3.label
                  category4 = item4.value
                  category4Name = item4.label
                  category5 = item5.value
                  category5Name = item5.label
                  category6 = item6.value
                  category6Name = item6.label

                  return
                }
              })
            })
          })
        })
      })
    })

    let categroyArr = []
    let categoryName = ""
    if (category1) {
      categroyArr.push(category1)
      categoryName += category1Name
    }
    if (category2) {
      categroyArr.push(category2)
      categoryName += "-" + category2Name
    }
    if (category3) {
      categroyArr.push(category3)
      categoryName += "-" + category3Name
    }
    if (category4) {
      categroyArr.push(category4)
      categoryName += "-" + category4Name
    }
    if (category5) {
      categroyArr.push(category5)
      categoryName += "-" + category5Name
    }
    if (category6) {
      categroyArr.push(category6)
      categoryName += "-" + category6Name
    }

    if (categoryName !== formik.values.categoryName) {
      formik.setFieldValue("categoryName", categoryName)
    }

    return categroyArr
  }

  const onChange = async (value, selectedOptions) => {
    let categoryName = ""
    selectedOptions.forEach((item, index) => {
      categoryName += item.label
      if (index === selectedOptions.length - 1) {
        formik.values.categoryCode = item.value
      } else {
        categoryName += "-"
      }
    })
    formik.setFieldValue("categoryName", categoryName)
    try {
      const response = await getCategoryMeta({
        variables: {
          categoryCode: formik.values.categoryCode.toString()
        }
      })

      if (
        response &&
        response.data.GetCoupangCategoryMeta &&
        response.data.GetCoupangCategoryMeta.code === "SUCCESS"
      ) {
        const {
          attributes,
          certifications,
          noticeCategories,
          requiredDocumentNames
        } = response.data.GetCoupangCategoryMeta.data

        formik.setFieldValue(
          "attributes",
          attributes.map(item => {
            return {
              ...item,
              attributeValueName: `상세페이지 참조`
            }
          })
        )

        formik.setFieldValue(
          "noticeCategories",
          noticeCategories.map(item => {
            const noticeCategoryDetailNames = item.noticeCategoryDetailNames.map(item => {
              return {
                ...item,
                content: "상세페이지 참조"
              }
            })
            return {
              ...item,
              noticeCategoryDetailNames
            }
          })
        )

        formik.setFieldValue("requiredDocumentNames", requiredDocumentNames)
        formik.setFieldValue("certifications", certifications)
      }
    } catch (e) {
      console.log("error", e.message)
    }
  }
  const filter = (inputValue, path) => {
    return path.some(option => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1)
  }

  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>카테고리</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="category"
      >
        <AttributeDetailNamesContainer>
          <div>
            카테고리
            <RequirdIcon />
          </div>
          <Cascader
            size="large"
            disabled={update}
            defaultValue={fullCategory(formik.values.categoryCode)}
            options={CoupongCategory}
            onChange={onChange}
            showSearch={{ filter }}
            style={{ width: "100%" }}
            allowClear={false}
          />
        </AttributeDetailNamesContainer>
      </Panel>
    </Collapse>
  )
}

const titleComponent = (titleArray = []) => {
  return (
    <TitleContainer>
      {titleArray.map((item, index) => {
        if (item.brand.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <>
                  <div>브랜드 의심 단어</div>
                  <div>
                    {item.brand.map((item, i) => (
                      <Tag key={i} color="blue">
                        {item.trim()}
                      </Tag>
                    ))}
                  </div>
                </>
              }
            >
              <Tag color="blue">{item.word}</Tag>
            </Tooltip>
          )
        } else if (item.ban.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <>
                  <div>금지 단어</div>
                  <div>
                    {item.ban.map((item, i) => (
                      <Tag key={i} color="red">
                        {item}
                      </Tag>
                    ))}
                  </div>
                </>
              }
            >
              <Tag color="red">{item.word}</Tag>
            </Tooltip>
          )
        } else {
          return <span key={index}>{item.word}</span>
        }
      })}
    </TitleContainer>
  )
}

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

const TitleForm = (formik, keywords, titleArray) => {
  const [getRelatedKeyword] = useMutation(RELATED_KEYWORD)
  const [getSentimentKeyword] = useMutation(SENTIMENT_RANK)
  const [relatedData, setRelatedData] = useState([])
  const [sentimentdData, setSentimentData] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [isSentimentLoading, setSentimentLoading] = useState(false)
  const productName = formik.values.productName
  const [search, setSearch] = useState("")
  const [productArr, setProductArr] = useState([])
  const [clickValue, setClickValue] = useState("")

  const [tags, setTags] = useState(
    productName
      .split(" ")
      // .reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), [])
      .filter(item => regExp_test(item) && item.trim().length > 0)
      .map(item => item.replace(",", "").replace('"', ""))
  )

  const initProductArray = initValue => {
    setProductArr(initValue)
  }

  useEffect(() => {
    initProductArray(
      productName
        .split(" ")
        .reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), [])
        .filter(item => regExp_test(item) && item.trim().length > 0)
        .map(item => item.replace(",", ""))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const array = arrayMoveImmutable(tags, oldIndex, newIndex)
    handleTags(array)
  }

  const handleClose = (removedTag, index) => {
    tags.splice(index, 1)
    handleTags([...tags])
  }

  const handleTags = tags => {
    setTimeout(() => {
      formik.setFieldValue("productName", tags.join(" "))
      formik.values.productName = tags.join(" ")
    }, 300)

    setTags(tags)
  }

  const handleRelatedKeyword = async keyword => {
    setLoading(true)
    const response = await getRelatedKeyword({
      variables: {
        keyword
      }
    })
    setLoading(false)
    setRelatedData(response.data.RelatedKeyword)
  }

  const handleSentimentKeyword = async keyword => {
    setSentimentLoading(true)
    const response = await getSentimentKeyword({
      variables: {
        keyword
      }
    })

    setSentimentLoading(false)
    setSentimentData(response.data.SentimentRank)
  }

  const handleRepresentativeKeywordSelect = keyword => {
    setSearch(keyword)
    handleRelatedKeyword(keyword)
    handleSentimentKeyword(keyword)
  }

  const handleRelatedAdd = keyword => {
    handleTags([...tags, keyword])
  }

  return (
    <Collapse defaultActiveKey={["title"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상품명</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="title"
      >
        <>
          <div>
            <MainTitleImageContainer>
              <MainTitleImage src={formik.values.mainImages ? formik.values.mainImages[0] : null} />
              <div>
                <TitleButtonContainer>
                  <div>
                    <Button
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={() => {
                        handleTags([])
                      }}
                      style={{ marginRight: "5px" }}
                    >
                      상품명 전체 삭제
                    </Button>
                    <Button
                      size="small"
                      icon={<UndoOutlined />}
                      onClick={() => {
                        handleTags(
                          formik.initialValues.productName
                            .split(" ")
                            // .reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), [])
                            .filter(item => regExp_test(item) && item.trim().length > 0)
                            .map(item => item.replace(",", "").replace('"', ""))
                        )
                      }}
                    >
                      상품명 초기화
                    </Button>
                  </div>
                  <div>
                    <ChinaLabel>{formik.values.title}</ChinaLabel>
                    <ChinaLabel>{titleComponent(titleArray)}</ChinaLabel>
                  </div>
                </TitleButtonContainer>

                <AttributeDetailNamesContainer>
                  <div>
                    상품명
                    <RequirdIcon />
                    <div>{`${formik.values.productName.length}/100`}</div>
                  </div>
                  <KeywordList
                    tags={tags}
                    setTags={handleTags}
                    axis={"xy"}
                    onSortEnd={onSortEnd}
                    handleClose={handleClose}
                  />
                </AttributeDetailNamesContainer>
              </div>
            </MainTitleImageContainer>
            <ClickAbleContainer>
              {tags.map((item, i) => (
                <ClickItem
                  key={i}
                  onClick={() => {
                    setClickValue(item)
                  }}
                >
                  {item}
                </ClickItem>
              ))}
            </ClickAbleContainer>
            <div>
              <Collapse defaultActiveKey={["keyword2"]} style={{ marginTop: "20px" }}>
                {keywords && Array.isArray(keywords) && keywords.length > 0 && (
                  <Panel
                    header={
                      <HeaderContainer>
                        <HeaderSubTitle>네이버 상품명 빈도수 리스트</HeaderSubTitle>
                      </HeaderContainer>
                    }
                    key="keyword1"
                  >
                    <RecommendationContainer>
                      <FrequencyKeywordList keywords={keywords} handleKeyword={handleRelatedAdd} />
                    </RecommendationContainer>
                  </Panel>
                )}

                <Panel
                  header={
                    <HeaderContainer>
                      <HeaderSubTitle>네이버 상품명 빈도수 조회</HeaderSubTitle>
                    </HeaderContainer>
                  }
                  key="keyword2"
                >
                  <TitleKeywordList defaultValue={clickValue} handleKeyword={handleRelatedAdd} />
                </Panel>

                {/* <Panel
                  header={
                    <HeaderContainer>
                      <HeaderSubTitle>경쟁강도 조회</HeaderSubTitle>
                    </HeaderContainer>
                  }
                  key="keyword3"
                >
                  <ProductKeywordContainer>
                    <div>
                      <RepresentativeTitle>{"< 대표 키워드 선택 >"}</RepresentativeTitle>
                      <BasicNameContainer>
                        <RepresentativeKeywordList
                          keywords={productArr}
                          handleKeyword={handleRepresentativeKeywordSelect}
                        />
                      </BasicNameContainer>
                    </div>
                    <div>
                      <Search
                        size="large"
                        placeholder="연관 키워드 검색"
                        value={search}
                        onSearch={value => {
                          handleRelatedKeyword(value)
                          handleSentimentKeyword(value)
                        }}
                        onChange={e => {
                          setSearch(e.target.value)
                        }}
                        enterButton
                      />
                      <BasicNameContainer>
                        <RelatedKeywordList
                          data={relatedData}
                          isLoading={isLoading}
                          handleKeyword={handleRelatedAdd}
                        />
                      </BasicNameContainer>
                    </div>
                    <div>
                      <RepresentativeTitle>{"<감성 키워드>"}</RepresentativeTitle>
                      <BasicNameContainer>
                        <SentimentKeywordList
                          data={sentimentdData}
                          isLoading={isSentimentLoading}
                          handleKeyword={handleRelatedAdd}
                        />
                      </BasicNameContainer>
                    </div>
                  </ProductKeywordContainer>
                </Panel> */}
              </Collapse>
            </div>
          </div>
        </>
      </Panel>
    </Collapse>
  )
}

const ClickAbleContainer = styled.div`
  display: flex;
  justify-content: center;

  & > :not(:last-child) {
    margin-right: 10px;
  }
  width: 100%;
  border-top: 2px dashed gray;
  padding-top: 15px;
  margin-top: 20px;
`

const ClickItem = styled.div`
  cursor: pointer;
  font-size: 18px;
  font-weight: 700;
  border: 1px solid lightblue;
  border-right-width: 2px;
  border-bottom-width: 2px;
  border-radius: 3px;
  padding: 1px 5px;
  &:hover {
    background: skyblue;
  }
`
const SearchForm = formik => {
  const [getRelatedKeyword] = useMutation(MUTATION_RELATED_KEYWORD_ONLY)
  const [getSentimentKeyword] = useMutation(SENTIMENT_RANK_ONLY)
  const [relatedData, setRelatedData] = useState([])
  const [sentimentdData, setSentimentData] = useState([])
  const [tags, setTags] = useState(formik.values.keyword)
  const [isLoading, setLoading] = useState(false)
  const [isSentimentLoading, setSentimentLoading] = useState(false)
  const [search, setSearch] = useState("")

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const array = arrayMoveImmutable(tags, oldIndex, newIndex)
    handleTags(array)
  }

  const handleClose = (removedTag, index) => {
    tags.splice(index, 1)
    handleTags([...tags])
  }

  const handleTags = tags => {
    setTimeout(() => {
      formik.setFieldValue("keyword", tags)
      formik.values.keyword = tags
    }, 300)

    setTags(tags)
  }

  const handleRelatedKeyword = async keyword => {
    setLoading(true)
    const response = await getRelatedKeyword({
      variables: {
        keyword
      }
    })
    setLoading(false)
    setRelatedData(response.data.RelatedKeywordOnly)
  }

  const handleSentimentKeyword = async keyword => {
    setSentimentLoading(true)
    const response = await getSentimentKeyword({
      variables: {
        keyword
      }
    })

    setSentimentLoading(false)
    setSentimentData(response.data.SentimentRankOnly)
  }
  const handleRelatedAdd = keyword => {
    handleTags([...tags, keyword])
  }
  return (
    <Collapse defaultActiveKey="keyword" style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>검색어</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="keyword"
      >
        <>
          <TitleButtonContainer>
            <div style={{ marginBottom: "10px" }}>
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  handleTags([])
                }}
                style={{ marginRight: "5px" }}
              >
                전체 삭제
              </Button>
              <Button
                size="small"
                icon={<SaveOutlined />}
                onClick={() => {
                  handleTags(
                    formik.values.productName
                      .split(" ")
                      // .reduce((unique, item) => (unique.includes(item) ? unique : [...unique, item]), [])
                      .filter(item => regExp_test(item) && item.trim().length > 0)
                      .map(item => item.replace(",", "").replace('"', ""))
                  )
                }}
              >
                상풍명 복사
              </Button>
            </div>
          </TitleButtonContainer>
          <AttributeDetailNamesContainer>
            <div>
              태그
              <RequirdIcon />
              <div>{`${tags.length}/20`}</div>
            </div>
            <KeywordList
              tags={tags}
              setTags={handleTags}
              axis={"xy"}
              onSortEnd={onSortEnd}
              handleClose={handleClose}
            />
          </AttributeDetailNamesContainer>
          {/* <Collapse defaultActiveKey={"associatedSearch"} style={{ marginTop: "10px" }}>
            <Panel
              header={
                <HeaderContainer>
                  <HeaderSubTitle>검색어란?</HeaderSubTitle>
                </HeaderContainer>
              }
              key="keywordHelp"
            >
              <div style={{ textAlign: "center" }}>
                <p>
                  검색어 입력은 고객이 상품을 찾는 가장 기본적인 방법이지만 판매자가 가장 소홀하기
                  쉬운 부분이기도 합니다.
                </p>
                <p>
                  검색어는 카테고리, 상품명, 구매옵션/검색옵션과 함께 쿠팡 검색엔진이 내 상품을 찾는
                  중요한 정보입니다.
                </p>
                <p>제대로 된 검색어를 잘 입력하면 고객이 내 상품을 더 잘 찾을 수 있습니다.</p>
                <p>
                  형태, 소재, 스타일, 특징 등 내 상품을 찾을 때 필요한 단어를 최대 20개까지 입력할
                  수 있습니다. 단, 카테고리나 상품명을 중복 입력할 필요는 없습니다.
                </p>
                <p>
                  검색어하면 일단 뭔가 상상력을 발휘해서 기가 막힌 단어를 찾아내야 하는 것처럼
                  어렵게 생각하는 경향이 있어요.
                </p>
                <p>
                  고객들이 내 상품을 찾을 때 어떤 단어를 입력할까 고민드시죠? 우선 쿠팡에서 검증된
                  자동완성검색어와 연관검색어를 입력해보세요.{" "}
                </p>
                <p>
                  검색어를 입력할 때 검색창 아래로 보이는 단어인 ‘자동완성검색어’는 이미 쿠팡
                  고객들이 많이 찾아본 단어들이예요. 검색결과 아래 보이는 ‘연관검색어’도 마찬가지죠.
                </p>
                <p>
                  힘들게 새로운 걸 고민하지 마시고 이미 검증된 단어는 빠뜨리지 말고 입력해보세요.
                </p>
                <p>
                  바퀴신발을 팔던 판매자는 자동완성검색어에 나오는 ‘바퀴달린신발’을 추가한 후 주간
                  매출이 50% 이상 상승하기도 했답니다. 더 나아가 포털사이트에서 연관검색어를
                  찾아보는 것도 좋습니다.
                </p>
                <p>
                  그렇다고 타 브랜드나 연관성 없는 유행어를 넣으면 노출되지 않을 수 있으니
                  유의하시구요.
                </p>
              </div>
            </Panel>
            <Panel
              header={
                <HeaderContainer>
                  <HeaderSubTitle>연관검색어</HeaderSubTitle>
                </HeaderContainer>
              }
              key="associatedSearch"
            >
              <div>
                <Search
                  size="large"
                  placeholder="키워드 검색"
                  value={search}
                  onSearch={value => {
                    handleRelatedKeyword(value)
                    handleSentimentKeyword(value)
                  }}
                  onChange={e => {
                    setSearch(e.target.value)
                  }}
                  enterButton
                />
              </div>
              <div style={{ marginTop: "5px" }}>
                <div style={{ fontWeight: "700" }}>{"<연관 키워드>"}</div>
                {isLoading && <Spin />}
                {relatedData.map((item, index) => (
                  <TagLabel key={index} onClick={() => handleRelatedAdd(item)}>
                    {item}
                  </TagLabel>
                ))}
              </div>
              <div style={{ marginTop: "5px" }}>
                <div style={{ fontWeight: "700" }}>{"<감성 키워드>"}</div>
                {isSentimentLoading && <Spin />}
                {sentimentdData.map((item, index) => (
                  <TagLabel key={index} onClick={() => handleRelatedAdd(item)}>
                    {item}
                  </TagLabel>
                ))}
              </div>
            </Panel>
          </Collapse> */}
        </>
      </Panel>
    </Collapse>
  )
}
const TitleButtonContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 100px;
`
const RepresentativeTitle = styled.div`
  height: 40px;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  justify-content: center;
  align-items: center;
`

const TitleKeywordList = ({ defaultValue = "", handleKeyword }) => {
  const [value, setValue] = useState(defaultValue)
  const [data, setData] = useState([])
  const [searchTitle] = useMutation(SEARCH_TITLE)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setValue(defaultValue)
    handelSearch(defaultValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue])
  const handelSearch = async value => {
    if (value.length === 0) return
    setLoading(true)
    const response = await searchTitle({
      variables: {
        keyword: value
      }
    })
    console.log("respone,", response)
    if (response.data.searchTitle) {
      setData(response.data.searchTitle)
    }
    setLoading(false)
  }
  return (
    <>
      <Search
        size="large"
        placeholder="네이버 상품명 검색"
        value={value}
        onChange={e => setValue(e.target.value)}
        onSearch={value => {
          handelSearch(value)
        }}
        enterButton
      />
      {loading && <Spin />}
      <div style={{ marginTop: "5px" }}>
        {data.map((item, i) => (
          <TagLabel
            key={i}
            color="blue"
            style={{ marginBottom: "4px", cursor: "pointer" }}
            onClick={() => handleKeyword(item.name)}
          >
            {item.name}
          </TagLabel>
        ))}
      </div>
    </>
  )
}

const FrequencyKeywordList = ({ keywords, handleKeyword }) => {
  const Related = ({ item }) => {
    if (!item || !Array.isArray(item)) {
      return null
    }
    return item.map((item, j) => (
      <TagLabel
        key={item.name}
        color="blue"
        style={{ marginBottom: "4px", cursor: "pointer" }}
        onClick={() => handleKeyword(item.name)}
      >
        {item.name}
      </TagLabel>
    ))
  }

  if (keywords && Array.isArray(keywords)) {
    return keywords.map((item, index) => {
      return (
        <p key={item.keyword} style={{ marginBottom: "10px" }}>
          <TagLabelBold
            key={item.keyword}
            color="purple"
            style={{ marginBottom: "4px", cursor: "pointer" }}
            onClick={() => handleKeyword(item.keyword)}
          >
            {item.keyword}
          </TagLabelBold>
          {Related({ item: item.relatedKeyword })}
        </p>
      )
    })
  }
  return null
}

const TagLabel = styled.span`
  cursor: pointer;
  display: inline-block;
  padding: 5px;
  font-size: 18px;
  &:hover {
    color: blue;
    font-weight: 700;
  }
`

const TagLabelBold = styled(TagLabel)`
  color: blue;
  font-weight: 700;
`

const TableColumn = styled.div`
  text-align: right;
`
const TableColumnBold = styled(TableColumn)`
  font-weight: 700;
  color: #ff545c;
`

const RepresentativeKeywordList = ({ keywords, handleKeyword }) => {
  const { data, networkStatus } = useQuery(GET_KEYWORD_VIEWS, {
    variables: {
      keywords
    },
    fetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true
  })

  const columns = [
    {
      title: "키워드",
      dataIndex: "",
      render: data => {
        let color = "default"
        if (data.compete < 1 && data.compete > 0) {
          color = "volcano"
        } else if (data.compete < 10 && data.compete >= 1) {
          color = "purple"
        }
        return (
          <div>
            <Tag
              color={color}
              key={data.keyword}
              style={{
                userSelect: "none",
                padding: "4px",
                fontSize: "13px"
              }}
            >
              {data.keyword}
            </Tag>
          </div>
        )
      },
      width: "80px",
      sorter: true
    },
    // {
    //   title: "PC",
    //   dataIndex: "mpcqry",
    //   render: mpcqry => <div>{mpcqry.toLocaleString("ko")}</div>,
    //   width: "60px"
    // },
    // {
    //   title: "MOBILE",
    //   dataIndex: "mmoqry",
    //   render: mmoqry => <div>{mmoqry.toLocaleString("ko")}</div>,
    //   width: "60px"
    // },
    {
      title: "조회수",
      align: "right",
      dataIndex: "",
      render: data => (
        <Tooltip
          title={`PC: ${data.mpcqry.toLocaleString("ko")} MOBILE: ${data.mmoqry.toLocaleString(
            "ko"
          )}`}
        >
          <TableColumn>{data.total.toLocaleString("ko")}</TableColumn>
        </Tooltip>
      ),
      width: "80px",
      sorter: true
    },
    {
      title: "상품수",
      align: "right",
      dataIndex: "item_num",
      render: item_num => <TableColumn>{item_num.toLocaleString("ko")}</TableColumn>,
      width: "80px",
      sorter: true
    },
    {
      title: "경쟁강도",
      align: "right",
      dataIndex: "compete",
      render: compete => {
        if (compete < 1 && compete > 0) {
          return <TableColumnBold>{compete}</TableColumnBold>
        } else if (compete < 10 && compete >= 1) {
          return <ChinaLabel>{compete}</ChinaLabel>
        } else {
          return <TableColumn>{compete}</TableColumn>
        }
      },
      width: "80px",
      sorter: true
    }
  ]
  return (
    <Table
      style={{ cursor: "pointer" }}
      columns={columns}
      rowKey={record => record.keyword}
      dataSource={data && data.GetKeywordViews ? data.GetKeywordViews : []}
      loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      pagination={false}
      scroll={{ y: 320 }}
      onRow={(record, rowIndex) => {
        return {
          onClick: event => {
            handleKeyword(record.keyword)
          } // click row
        }
      }}
    />
  )
}

const RelatedKeywordList = ({ data, isLoading, handleKeyword }) => {
  const columns = [
    {
      title: "키워드",
      dataIndex: "",
      render: data => {
        let color = "default"
        if (data.compete < 1 && data.compete > 0) {
          color = "volcano"
        } else if (data.compete < 10 && data.compete >= 1) {
          color = "purple"
        }
        return (
          <div>
            <Tag
              color={color}
              key={data.keyword}
              style={{
                userSelect: "none",
                padding: "4px",
                fontSize: "13px"
              }}
            >
              {data.keyword}
            </Tag>
          </div>
        )
      },
      width: "80px",
      sorter: true
    },
    // {
    //   title: "PC",
    //   dataIndex: "mpcqry",
    //   render: mpcqry => <div>{mpcqry.toLocaleString("ko")}</div>,
    //   width: "60px",
    //   sort: true
    // },
    // {
    //   title: "MOBILE",
    //   dataIndex: "mmoqry",
    //   render: mmoqry => <div>{mmoqry.toLocaleString("ko")}</div>,
    //   width: "60px",
    //   sort: true
    // },
    {
      title: "조회수",
      align: "right",
      dataIndex: "",
      render: data => (
        <Tooltip
          title={`PC: ${data.mpcqry.toLocaleString("ko")} MOBILE: ${data.mmoqry.toLocaleString(
            "ko"
          )}`}
        >
          <TableColumn>{data.total.toLocaleString("ko")}</TableColumn>
        </Tooltip>
      ),
      width: "80px",
      sorter: true
    },
    {
      title: "상품수",
      align: "right",
      dataIndex: "item_num",
      render: item_num => <TableColumn>{item_num.toLocaleString("ko")}</TableColumn>,
      width: "80px",
      sorter: true
    },
    {
      title: "경쟁강도",
      align: "right",
      dataIndex: "compete",
      render: compete => {
        if (compete < 1 && compete > 0) {
          return <TableColumnBold>{compete}</TableColumnBold>
        } else if (compete < 10 && compete >= 1) {
          return <ChinaLabel>{compete}</ChinaLabel>
        } else {
          return <TableColumn>{compete}</TableColumn>
        }
      },
      width: "80px",
      sorter: true
    }
  ]
  return (
    <Table
      style={{ cursor: "pointer" }}
      columns={columns}
      rowKey={record => record.keyword}
      dataSource={data ? data : []}
      loading={isLoading}
      pagination={false}
      scroll={{ y: 320 }}
      onRow={(record, rowIndex) => {
        return {
          onClick: event => {
            handleKeyword(record.keyword)
          } // click row
        }
      }}
    />
  )
}

const SentimentKeywordList = ({ data, isLoading, handleKeyword }) => {
  const columns = [
    {
      title: "키워드",
      dataIndex: "",
      render: data => {
        let color = "default"
        if (data.compete < 1 && data.compete > 0) {
          color = "volcano"
        } else if (data.compete < 10 && data.compete >= 1) {
          color = "purple"
        }
        return (
          <div>
            <Tag
              color={color}
              key={data.keyword}
              style={{
                userSelect: "none",
                padding: "4px",
                fontSize: "13px"
              }}
            >
              {data.keyword}
            </Tag>
          </div>
        )
      },
      width: "80px",
      sorter: true
    },
    // {
    //   title: "PC",
    //   dataIndex: "mpcqry",
    //   render: mpcqry => <div>{mpcqry.toLocaleString("ko")}</div>,
    //   width: "60px",
    //   sort: true
    // },
    // {
    //   title: "MOBILE",
    //   dataIndex: "mmoqry",
    //   render: mmoqry => <div>{mmoqry.toLocaleString("ko")}</div>,
    //   width: "60px",
    //   sort: true
    // },
    {
      title: "조회수",
      align: "right",
      dataIndex: "",
      render: data => (
        <Tooltip
          title={`PC: ${data.mpcqry.toLocaleString("ko")} MOBILE: ${data.mmoqry.toLocaleString(
            "ko"
          )}`}
        >
          <TableColumn>{data.total.toLocaleString("ko")}</TableColumn>
        </Tooltip>
      ),
      width: "80px",
      sorter: true
    },
    {
      title: "상품수",
      align: "right",
      dataIndex: "item_num",
      render: item_num => <TableColumn>{item_num.toLocaleString("ko")}</TableColumn>,
      width: "80px",
      sortable: true
    },
    {
      title: "경쟁강도",
      align: "right",
      dataIndex: "compete",
      render: compete => {
        if (compete < 1 && compete > 0) {
          return <TableColumnBold>{compete}</TableColumnBold>
        } else if (compete < 10 && compete >= 1) {
          return <ChinaLabel>{compete}</ChinaLabel>
        } else {
          return <TableColumn>{compete}</TableColumn>
        }
      },
      width: "80px",
      sorter: true
    }
  ]
  return (
    <Table
      style={{ cursor: "pointer" }}
      columns={columns}
      rowKey={record => record.keyword}
      dataSource={data ? data : []}
      loading={isLoading}
      pagination={false}
      scroll={{ y: 320 }}
      onRow={(record, rowIndex) => {
        return {
          onClick: event => {
            handleKeyword(record.keyword)
          } // click row
        }
      }}
    />
  )
}

const KeywordList = SortableContainer(({ tags, setTags, handleClose }) => {
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState("")
  const inputRef = useRef()
  const editInputRef = useRef()

  const showInput = () => {
    setInputVisible(true)

    setTimeout(() => {
      inputRef.current.focus()
    }, 300)
  }

  const handleInputChange = e => {
    setInputValue(e.target.value)
  }

  const handleEditInputChange = e => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    const newTags = [...tags]
    newTags[editInputIndex] = editInputValue
    setTags(newTags)
    setEditInputValue("")
    setEditInputIndex(-1)
  }

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue])
    }

    setInputVisible(false)
    setInputValue("")
  }
  return (
    <TagTitleContainer>
      {tags.map((tag, index) => {
        return (
          <KeywordItem
            key={`tag-${index}`}
            tag={tag}
            index={index}
            sortIndex={index}
            i={index}
            handleClose={a => handleClose(a, index)}
            editInputRef={editInputRef}
            editInputIndex={editInputIndex}
            setEditInputIndex={setEditInputIndex}
            setEditInputValue={setEditInputValue}
            handleEditInputChange={handleEditInputChange}
            handleEditInputConfirm={handleEditInputConfirm}
            editInputValue={editInputValue}
          />
        )
      })}
      {inputVisible && (
        <div>
          <Input
            ref={inputRef}
            type="text"
            style={{
              width: "100px",
              marginRight: "8px",
              verticalAlign: "top",
              height: "37px",
              marginBottom: "8px"
            }}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={handleInputConfirm}
          />
        </div>
      )}
      {!inputVisible && (
        <div>
          <Tag
            style={{
              padding: "8px",
              fontSize: "15px",
              marginBottom: "8px",
              background: "#fff",
              borderStyle: "dashed",
              cursor: "pointer"
            }}
            onClick={showInput}
          >
            <PlusOutlined /> 키워드 추가
          </Tag>
        </div>
      )}
    </TagTitleContainer>
  )
})

const TagTitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`
const KeywordItem = SortableElement(
  ({
    tag,
    index,
    sortIndex,
    handleClose,
    editInputRef,
    editInputIndex,
    setEditInputIndex,
    setEditInputValue,
    handleEditInputChange,
    handleEditInputConfirm,
    editInputValue
  }) => {
    if (editInputIndex === sortIndex) {
      return (
        <div key={sortIndex}>
          <Input
            ref={editInputRef}
            style={{
              width: "100px",
              marginRight: "8px",
              verticalAlign: "top",
              height: "37px",
              marginBottom: "8px"
            }}
            value={editInputValue}
            onChange={handleEditInputChange}
            onBlur={handleEditInputConfirm}
            onPressEnter={handleEditInputConfirm}
          />
        </div>
      )
    }

    return (
      <div
        key={sortIndex}
        onDoubleClick={e => {
          setEditInputIndex(sortIndex)
          setEditInputValue(tag)

          setTimeout(() => {
            editInputRef.current.focus()
          }, 300)

          e.preventDefault()
        }}
      >
        <Tooltip title={tag} key={tag}>
          <Tag
            color="purple"
            style={{
              userSelect: "none",
              padding: "8px",
              fontSize: "15px",
              marginBottom: "8px",
              cursor: "pointer"
            }}
            key={tag}
            closable={true}
            onClose={() => handleClose(tag)}
          >
            <span>{tag}</span>
          </Tag>
        </Tooltip>
      </div>
    )
  }
)

const ProductKeywordContainer = styled.div`
  margin-top: 20px;
  display: flex;
  & > :nth-child(n) {
    flex: 1;
  }
  & > :nth-child(2) {
    margin-left: 20px;
    margin-right: 20px;
  }
`

const RecommendationContainer = styled(SimpleBar)`
  margin-top: 10px;
  border: ${props => `1px solid ${props.theme.borderColor}`};
  border-radius: 5px;
  overflow: hidden;
  height: 300px;
  overflow-y: auto;
  margin-bottom: 20px;
`

const BasicNameContainer = styled(SimpleBar)`
  border: ${props => `1px solid ${props.theme.borderColor}`};
  border-radius: 5px;
  overflow: hidden;
  height: 400px;
  overflow-y: auto;
`

const OptionFromNew = ({
  formik,
  prop,
  options,
  optionRef,
  OptionHandleSubmit
 }) => {
   
  return (
    <Collapse defaultActiveKey={["option"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>옵션</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="option"
      >
        <div>
          {prop.map(item => {
            return (
              <PropItemContainer key={item.pid}>
                <Input value={item.korTypeName} />
              
                <div>
                  {item.values.map(vItem => {
                    return (
                      <PorpItemContent key={vItem.vid}>
                        {vItem.image &&
                        <ConfirmMainImage src={vItem.image} 
                          width={200}
                        />
                        }
                        <Input 
                        allowClear={true}
                        value={vItem.korValueName}/>
                          
                        
                      </PorpItemContent>
                    )
                  })}
                </div>
              </PropItemContainer>
            )
          })}

          {options.map(item => {
            return (
              <PropOptionContainer key={item.key}>
              <div>{item.korValue}</div>
              <div>{item.price}</div>
              <div>{item.stock}</div>
              </PropOptionContainer>
            )
          })}
        </div>

      </Panel>
    </Collapse>
  )
 }


const PropOptionContainer = styled.div`
  display: flex;
  &>:nth-child(1){
    min-width: 300px;
    max-width: 300px;
    margin-right: 20px;
  }
  &>:nth-child(2){
    width: 100px;
    text-align: right;
  }
  &>:nth-child(3){
    width: 100px;
    text-align: right;
  }
`
const PropItemContainer = styled.div`
  display: flex;
  align-items: flex-start;
  &>:nth-child(1){
    min-width: 100px;
    max-width: 100px;
    margin-right: 20px;
  }
  &>:nth-child(2){
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  margin-bottom: 15px;
`

const PorpItemContent = styled.div`
  width: 220px;
  margin-right: 10px;
  margin-bottom: 10px;
`
const OptionForm = ({
  formik,
  options,
  isBatch,
  setBatch,
  productUrl,
  shell,
  optionObj,
  setOptionObj,
  optionRef,
  OptionHandleSubmit
}) => {
 
  const [before, setBefore] = useState("")
  const [after, setAfter] = useState("타입")
  const [visible, setVisible] = useState(false)
  const [optionImage, setOptionImage] = useState("")
  const [loadingBatch, setLoadingBatch] = useState(false)
  const [loadingInit, setLoadingInit] = useState(false)

  const [exchangePrice, setExchangePrice] = useState(exchange)
  const [shippingPrice, setShippingPrice] = useState(shippingFee)
  const [profitPrice, setProfitPrice] = useState(profit)
  const [discountPrice, setDiscountPrice] = useState(discount)
  const [feePrice, setFeePrice] = useState(fees)
  const [deliveryCharge, setDeliveryCharge] = useState(
    formik.values.shipping.deliveryChargeType === "NOT_FREE"
      ? formik.values.shipping.deliveryCharge
      : 0
  )

  const [salePrice, setSalePrice] = useState(0)
  const [minPassablePrice, setMinPassablePrice] = useState(0)
  const [maxPassablePrice, setMaxPassablePrice] = useState(0)

  const [optionObjState, setOptionObjState] = useState(optionObj)

  const [formLoad, setFormLoad] = useState(false)

  useEffect(() => {
    setFormLoad(true)
  }, [])
  useEffect(() => {
    if (exchange !== exchangePrice) {
      setExchangePrice(exchange)
    }
    if (shippingFee !== shippingPrice) {
      setShippingPrice(shippingFee)
    }
    if (profit !== profitPrice) {
      setProfitPrice(profit)
    }
    if (discount !== discountPrice) {
      setDiscountPrice(discount)
    }
    if (fees !== feePrice) {
      setFeePrice(fees)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchange, shippingFee, profit, discount, fees])

  const handleOptionSubmit = values => {
    if (optionValueArray.filter(item => item.key === values.key).length === 0) {
      optionValueArray.push(values)
    }

    if (optionValueArray.length === optionObj.length) {
      OptionHandleSubmit(optionValueArray)
    }
  }
  const caculateSalePrice = () => {
    if (optionObjState.filter(item => item.active === true && item.base).length === 0) {
      const salePriceTemp = costAccounting(
        optionObjState.filter(item => item.active === true && !item.disabled)[0].price,
        true
      )

      if (salePrice !== salePriceTemp) {
        setSalePrice(salePriceTemp)
      }
    } else {
      // const salePriceTemp = costAccounting(
      //   optionObj.filter(item => item.active === true && item.base)[0].price,
      //   true
      // )

      const salePriceTemp = optionObjState.filter(item => item.active === true && item.base)[0]
        .salePrice

      if (salePrice !== salePriceTemp) {
        setSalePrice(salePriceTemp)
      }
    }

    if (salePrice > 0 && salePrice < 2000) {
      const minPrice = Math.floor((salePrice + (salePrice * 100) / 100) * 0.1) * 10
      if (minPassablePrice !== minPrice) {
        setMinPassablePrice(minPrice)
      }
    } else if (salePrice >= 2000 && salePrice < 10000) {
      const minPrice = Math.ceil((salePrice - (salePrice * 50) / 100) * 0.1) * 10
      const maxPrice = Math.floor((salePrice + (salePrice * 100) / 100) * 0.1) * 10 - 10
      if (minPassablePrice !== minPrice) {
        setMinPassablePrice(minPrice)
      }
      if (maxPassablePrice !== maxPrice) {
        setMaxPassablePrice(maxPrice)
      }
    } else if (salePrice >= 10000) {
      const minPrice = Math.ceil((salePrice - (salePrice * 50) / 100) * 0.1) * 10
      const maxPrice = Math.floor((salePrice + (salePrice * 50) / 100) * 0.1) * 10 - 10
      if (minPassablePrice !== minPrice) {
        setMinPassablePrice(minPrice)
      }
      if (maxPassablePrice !== maxPrice) {
        setMaxPassablePrice(maxPrice)
      }
    }
  }
  useEffect(() => {
    caculateSalePrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })
  useEffect(() => {
    setOptionObjState(optionObj)
    // caculateSalePrice()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionObj])

  if (options.filter(item => item.active === true && !item.disabled).length === 0) {
    return
  }

  const getAlphabet = index => {
    const alphabet = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "R",
      "S",
      "T",
      "U",
      "V",
      "W",
      "X",
      "Y",
      "Z"
    ]
    const letter = alphabet[index % 25]
    let number = ""
    if (Math.floor(index / 25) > 0) {
      number = Math.floor(index / 25)
    }
    return `${letter}${number}`
  }

  const handleExchange = value => {
    exchange = value
    setTimeout(() => {
      setExchangePrice(value)
    }, 200)
  }
  const handleShipping = value => {
    shippingFee = value
    setTimeout(() => {
      setShippingPrice(
        value
        // +
        // (formik.values.shipping.deliveryChargeType === "NOT_FREE"
        //   ? formik.values.shipping.deliveryCharge
        //   : 0)
      )
    }, 200)
  }

  const handleProfit = value => {
    profit = value
    setTimeout(() => {
      setProfitPrice(value)
    }, 200)
  }
  const handleDiscount = value => {
    discount = value
    setTimeout(() => {
      setDiscountPrice(value)
    }, 200)
  }
  const handleFees = value => {
    fees = value
    setTimeout(() => {
      setFeePrice(value)
    }, 200)
  }

  return (
    <Collapse defaultActiveKey={["option"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>옵션</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="option"
      >
        <OptionTopContainer>
          <BasicPriceInfoContainer>
            <div>
              <ChinaLabel>환율</ChinaLabel>
              <InputNumber
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
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
                style={{ width: "100%" }}
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
              <ChinaLabel>기준금액</ChinaLabel>
              <InputNumber
                style={{ width: "100%" }}
                size="large"
                step={10}
                name="salePrice"
                value={salePrice}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                disabled={true}
              />
            </div>
            <div>
              <ChinaLabel>배송정책</ChinaLabel>
              <Select
                style={{ width: "100%" }}
                size="large"
                defaultValue={formik.values.shipping.deliveryChargeType}
                onChange={value => {
                  formik.setFieldValue("shipping.deliveryChargeType", value)

                  setDeliveryCharge(
                    value === "NOT_FREE" ? formik.values.shipping.deliveryCharge : 0
                  )
                }}
              >
                <Option value="FREE">무료배송</Option>
                <Option value="NOT_FREE">유료배송</Option>
              </Select>
            </div>
            {formik.values.shipping.deliveryChargeType === "NOT_FREE" && (
              <div>
                <ChinaLabel>국내배송비</ChinaLabel>
                <InputNumber
                  style={{ width: "100%" }}
                  size="large"
                  step={100}
                  name="shipping.deliveryCharge"
                  value={formik.values.shipping.deliveryCharge}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={value => value.replace(/\$\s?|(,*)/g, "")}
                  onChange={value => {
                    formik.setFieldValue("shipping.deliveryCharge", value)
                    setDeliveryCharge(value)
                  }}
                />
              </div>
            )}
          </BasicPriceInfoContainer>
          <OptionMenuContainer>
            <AlphabetContainer>
              <Input
                size="large"
                placeholder="앞 문자열"
                value={before}
                onChange={e => {
                  setBefore(e.target.value)
                }}
              />
              <Tooltip title="옵션명 일괄 적용">
                <Button
                  size="large"
                  type="primary"
                  icon={<SwapRightOutlined />}
                  loading={loadingBatch}
                  onClick={async () => {
                    setLoadingBatch(true)
                    setBatch(true)
                    const temp = optionObj.map((item, i) => {
                      return {
                        ...item,
                        korKey: `${before}${getAlphabet(i)}${after}`
                      }
                    })
                    setOptionObj(temp)
                    setLoadingBatch(false)
                  }}
                >
                  A-Z
                </Button>
              </Tooltip>
              <Input
                size="large"
                placeholder="뒷 문자열"
                value={after}
                onChange={e => {
                  setAfter(e.target.value)
                }}
              />
              <Tooltip title="옵션명 초기화">
                <Button
                  size="large"
                  icon={<UndoOutlined />}
                  loading={loadingInit}
                  onClick={async () => {
                    setLoadingInit(true)
                    setBatch(false)
                    const temp = optionObj.map((item, i) => {
                      return {
                        ...item,
                        korKey: null,
                        korValue: options[i].korValue
                      }
                    })
                    setOptionObj(temp)
                    setLoadingInit(false)
                  }}
                >
                  옵션명 초기화
                </Button>
              </Tooltip>
              {productUrl && productUrl !== undefined && (
                <>
                  <Button size="large" onClick={() => shell.openExternal(productUrl)}>
                    상품 보기
                  </Button>
                </>
              )}
            </AlphabetContainer>
          </OptionMenuContainer>
        </OptionTopContainer>
        <OptionContainer>
          {salePrice > 0 &&
            minPassablePrice > 0 &&
            maxPassablePrice > 0 &&
            formLoad &&
            optionObj.map((item, index) => {
             
              return (
                <OptionItemForm
                  key={item.key}
                  initOption={options}
                  optionItem={{
                    ...item,
                    attributes:
                      item.attributes && item.attributes.length > 0
                        ? item.attributes
                        : formik.values.attributes
                  }}
                  index={index}
                  setOptionImage={setOptionImage}
                  visible={visible}
                  setVisible={setVisible}
                  isBatch={isBatch}
                  minPassablePrice={minPassablePrice}
                  maxPassablePrice={maxPassablePrice}
                  optionImage={optionImage}
                  salePrice={salePrice}
                  exchangePrice={exchangePrice}
                  shippingPrice={shippingPrice}
                  profitPrice={profitPrice}
                  discountPrice={discountPrice}
                  feePrice={feePrice}
                  before={before}
                  after={after}
                  getAlphabet={getAlphabet}
                  optionObj={optionObj}
                  setOptionObj={setOptionObj}
                  deliveryCharge={deliveryCharge}
                  submitRef={optionRef.current[index]}
                  handleOptionSubmit={handleOptionSubmit}
                />
              )
            })}
        </OptionContainer>
      </Panel>
    </Collapse>
  )
}

const OptionItemForm = ({
  optionItem,
  index,
  initOption,
  setOptionImage,
  visible,
  setVisible,

  isBatch,
  minPassablePrice,
  maxPassablePrice,
  optionImage,
  salePrice,
  exchangePrice,
  shippingPrice,
  profitPrice,
  discountPrice,
  feePrice,
  before,
  after,
  getAlphabet,
  optionObj,
  setOptionObj,
  deliveryCharge,
  submitRef,
  handleOptionSubmit
}) => {
  const [baseSalePrice, setBaseSalePrice] = useState(salePrice)
  const [minimumPrice, setMinimumPrice] = useState(minPassablePrice)
  const [maximumPrice, setMaximumPricee] = useState(maxPassablePrice)
  const [totalOption, setTotalOption] = useState(optionObj)

  const [exchangeFee, setExchangeFee] = useState(exchangePrice)
  const [shippFee, setShipFee] = useState(shippingPrice)
  const [profitFee, setProfitFee] = useState(profitPrice)
  const [discountFee, setDiscountFee] = useState(discountPrice)
  const [feeFee, setFeeFee] = useState(feePrice)
  const [deliveryChargeFee, setDeliveryChargeFee] = useState(deliveryCharge)

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const formik = useFormik({
    initialValues: optionItem,
    validate: values => {
      const errors = {}

      if (
        isBatch &&
        values.active &&
        !values.disabled &&
        values.korKey &&
        values.korKey.length > 25
      ) {
        errors.korValue = "옵션명을 25글자 이내로 짧게 입력해주세요."
      }
      if (
        isBatch &&
        values.active &&
        !values.disabled &&
        (!values.korKey || values.korKey.length === 0)
      ) {
        errors.korValue = "옵션명을 입력해주세요."
      }
      if (
        !isBatch &&
        values.active &&
        !values.disabled &&
        values.korValue &&
        values.korValue.length > 25
      ) {
        errors.korValue = "옵션명을 25글자 이내로 짧게 입력해주세요."
      }
      if (
        !isBatch &&
        values.active &&
        !values.disabled &&
        (!values.korValue || values.korValue.length === 0)
      ) {
        errors.korValue = "옵션명을 입력해주세요."
      }

      // const salePrice = costAccounting(values.price, true)

      // optionItem.forEach(item => {
      //   if (item.base) {
      //     salePrice = item.salePrice
      //   }
      // })
      if (values.active && !values.disabled && baseSalePrice <= 0) {
        errors.salePrice = "가격을 설정하세요."
      }

      // let minPassablePrice = 0
      // let maxPassablePrice = 0
      // if (baseSalePrice > 0 && baseSalePrice < 2000) {
      //   maxPassablePrice = Math.floor((baseSalePrice + (baseSalePrice * 100) / 100) * 0.1) * 10
      // } else if (baseSalePrice >= 2000 && baseSalePrice < 10000) {
      //   minPassablePrice = Math.ceil((baseSalePrice - (baseSalePrice * 50) / 100) * 0.1) * 10
      //   maxPassablePrice = Math.floor((baseSalePrice + (baseSalePrice * 100) / 100) * 0.1) * 10 - 10
      // } else if (baseSalePrice >= 10000) {
      //   minPassablePrice = Math.ceil((baseSalePrice - (baseSalePrice * 50) / 100) * 0.1) * 10
      //   maxPassablePrice = Math.floor((baseSalePrice + (baseSalePrice * 50) / 100) * 0.1) * 10 - 10
      // }
      // console.log("baseSalePrice---", values.salePrice, minPassablePrice, maxPassablePrice)

      
      // if (
      //   (values.active && !values.disabled && values.salePrice < minPassablePrice) ||
      //   (values.active && !values.disabled && values.salePrice > maxPassablePrice)
      // ) {
      //   // console.log("baseSalePrice---", baseSalePrice, minPassablePrice, maxPassablePrice)
      //   errors.salePrice = "가격의 범위를 확인하세요."
      // }

      const duplication = totalOption.filter((item, i) => {
        if (isBatch) {
          if (
            values.active &&
            !values.disabled &&
            item.active &&
            !item.disabled &&
            item.korKey === values.korKey &&
            i !== index
          ) {
            return true
          } else {
            return false
          }
        } else {
          if (
            values.active &&
            !values.disabled &&
            item.active &&
            !item.disabled &&
            item.korValue === values.korValue &&
            i !== index
          ) {
            return true
          } else {
            return false
          }
        }
      }).length

      if (duplication > 0) {
        errors.korValue = "옵션명이 중복되었습니다."
      }

      if (values.base && (!values.active || values.disabled)) {
        errors.base = "기준 금액은 옵션표시가 활성화 되어야 합니다."
      }
      // optionObj.forEach((item1, index) => {
      // if (
      //   values.options.filter(
      //     (item2, i) =>
      //       index !== i &&
      //       item1.korValue === item2.korValue &&
      //       item1.active &&
      //       !item1.disabled &&
      //       item2.active &&
      //       !item2.disabled
      //   ).length > 0
      // ) {
      //   duplication += 1
      // }
      // if (duplication >= 1) {
      //   if (!errors.options) {
      //     errors.options = {}
      //   }
      //   errors.options[`korValue_${index}`] = "옵션명이 중복되었습니다."
      //   duplication = 0
      // }
      // })

      return errors
    },
    onSubmit: values => {
      if (typeof handleOptionSubmit === "function") {
        handleOptionSubmit(values)
      }
    }
  })
  // console.log("formik-", formik.values.price)
  useEffect(() => {
    if (baseSalePrice !== salePrice) {
      setBaseSalePrice(salePrice)
      formik.validateForm()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salePrice])

  useEffect(() => {
    // const salePrice = costAccounting(optionItem.salePrice, true)
    // if (formik.values.salePrice !== salePrice) {
    //   formik.setFieldValue("salePrice", salePrice)
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionItem])

  useEffect(() => {
    if (optionObj[index].base !== formik.values.base) {
      formik.setFieldValue("base", optionObj[index].base)
    }
    if (optionObj[index].korValue !== formik.values.korValue) {
      formik.setFieldValue("korValue", optionObj[index].korValue)
    }

    setTotalOption(optionObj)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionObj])

  useEffect(() => {
    if (minPassablePrice !== minimumPrice) {
      setMinimumPrice(minPassablePrice)
    }
    if (maxPassablePrice !== maximumPrice) {
      setMaximumPricee(maxPassablePrice)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minPassablePrice, maxPassablePrice])

  const changeSalePrice = () => {
    const salePrice = costAccounting(formik.values.price, true)
    const productPrice = costAccounting(formik.values.price, false)
    if (salePrice !== formik.values.salePrice) {
      if (formik.values.base) {
        let temp = [...optionObj]
        temp[index] = {
          ...formik.values,
          salePrice
        }
        setOptionObj(temp)
      }

      setTimeout(() => {
        formik.setFieldValue(`salePrice`, salePrice)
      }, 200)
    }
    if (productPrice !== formik.values.productPrice) {
      setTimeout(() => {
        formik.setFieldValue(`productPrice`, productPrice)
      }, 200)
    }

    // const tempPriofit =
    //   Math.ceil(
    //     (salePrice -
    //       costAccounting(formik.values.price, true, true) -
    //       costAccounting(formik.values.price, true) * (fees / 100)) *
    //       0.1
    //   ) *
    //     10 +
    //   deliveryCharge
    // setProfit(tempPriofit)
  }
  useEffect(() => {
    if (exchangeFee !== exchangePrice) {
      changeSalePrice()
      setExchangeFee(exchangePrice)
    }
    if (shippFee !== shippingPrice) {
      changeSalePrice()
      setShipFee(shippingPrice)
    }
    if (profitFee !== profitPrice) {
      changeSalePrice()
      setProfitFee(profitPrice)
    }
    if (discountFee !== discountPrice) {
      changeSalePrice()
      setDiscountFee(discountPrice)
    }
    if (feeFee !== feePrice) {
      changeSalePrice()
      setFeeFee(feePrice)
    }
    if (deliveryChargeFee !== deliveryCharge) {
      // changeSalePrice()
      setDeliveryChargeFee(deliveryCharge)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangePrice, shippingPrice, profitPrice, discountPrice, feePrice, deliveryCharge])

  useEffect(() => {
    if (isBatch) {
      formik.setFieldValue("korKey", `${before}${getAlphabet(index)}${after}`)
    } else {
      formik.setFieldValue(`korValue`, initOption[index].korValue)
      formik.setFieldValue(`korKey`, null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBatch])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const response = await uploadImage({
        variables: {
          base64Image: reader.result
        }
      })
      
      setOptionImage(response.data.UploadImage)
    }
  }
  
  return (
    <OptionItemContainer>
      <HiddenButton
        ref={submitRef}
        onClick={() => {
          const keys = Object.keys(formik.errors)
          if (keys && keys.length > 0) {
            // alert("옵션을 확인해 주세요")
            console.log("click", formik.errors)
            message.error({
              content: (
                <div>
                  <div>{formik.values.korValue}</div>
                  <ErrorMessage>{formik.errors[keys[0]]}</ErrorMessage>
                </div>
              ),
              key: `option_${index}`,
              duration: 20
            })
          } else {
            formik.handleSubmit()
          }
        }}
      />
      <div>
        <ChinaLabel>옵션 표시</ChinaLabel>
        <Switch
          checkedChildren={<CheckOutlined />}
          unCheckedChildren={<CloseOutlined />}
          name={`active`}
          checked={formik.values.active}
          disabled={formik.values.disabled}
          onChange={checked => {
            if (
              optionObj.filter(item => item.active && !item.disabled).length === 1 &&
              checked === false
            ) {
            } else {
              formik.setFieldTouched(`active`)
              formik.setFieldValue(`active`, checked)
              let temp = [...optionObj]
              temp[index] = {
                ...formik.values,
                active: checked
              }
              setOptionObj(temp)
            }
          }}
        />
      </div>
      <OptionImageWrapper>
        <OptionImage src={formik.values.image} />
        <OptionImageModifyContainer>
          <div
            style={{ cursor: "pointer", textAlign: "center" }}
            onClick={() => {
              setOptionImage(formik.values.image)
              setVisible(index)
            }}
          >
            <EditOutlined style={{ color: "white", fontSize: "20px" }} />
          </div>
        </OptionImageModifyContainer>
        <Modal
          wrapClassName={`optionImageModal_${index}`}
          title={`이미지 변경_${formik.values.korValue}`}
          visible={visible === index}
          onOk={() => {
            formik.setFieldValue(`image`, optionImage)
            let temp = [...optionObj]
            temp[index] = {
              ...formik.values,
              image: optionImage
            }
            setOptionObj(temp)
            setVisible(false)
          }}
          onCancel={() => setVisible(false)}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
          <ConfirmMainImage src={optionImage} />
          </div>
          <input type="file" onChange={handleFileChange}/>
          <Input
            placeholder={"이미지 URL만 입력하세요."}
            allowClear={true}
            value={optionImage}
            onChange={e => setOptionImage(e.target.value)}
          />
        </Modal>
      </OptionImageWrapper>
      <OptionRight>
        <ByteContainer>
          <ChinaLabel>{`${getByte(
            isBatch && formik.values.korKey ? formik.values.korKey : formik.values.korValue
          )}Byte`}</ChinaLabel>
          <ChinaLabel>{formik.values.value}</ChinaLabel>
        </ByteContainer>

        <InputContainer>
          <div>옵션명</div>
          <div>
            <InputOptionNameContainer>
              {isBatch && formik.values.korKey && (
                <div>
                  <Input
                    allowClear={true}
                    border={false}
                    size="large"
                    style={{
                      width: "100px",
                      boxShadow: "0 0 0 3px #512da8 inset"
                    }}
                    name={`korKey`}
                    value={formik.values.korKey}
                    disabled={formik.values.disabled || !formik.values.active}
                    onBlur={e => {
                      let temp = [...optionObj]
                      temp[index] = {
                        ...formik.values,
                        korKey: e.target.value
                      }
                      setOptionObj(temp)
                    }}
                    onChange={formik.handleChange}
                  />
                </div>
              )}
              <div>
                <Input
                  allowClear={true}
                  border={false}
                  size="large"
                  style={{ width: "100%", boxShadow: `0 0 0 ${isBatch ? 1 : 3}px #512da8 inset` }}
                  name={`korValue`}
                  value={formik.values.korValue}
                  disabled={formik.values.disabled || !formik.values.active}
                  onBlur={e => {
                    let temp = [...optionObj]
                    temp[index] = {
                      ...formik.values,
                      korValue: e.target.value
                    }
                    setOptionObj(temp)
                  }}
                  onChange={formik.handleChange}
                />
              </div>
            </InputOptionNameContainer>
            {formik.errors.korValue && <ErrorMessage>{formik.errors.korValue}</ErrorMessage>}
          </div>
        </InputContainer>

        <OptionAttributeContainer>
          <div>옵션속성</div>
          <div>
            {formik.values.attributes
              // .filter(item => item.required === "MANDATORY")
              .map((item, index) => {
           
                return (
                  
                    <InputContainer key={item.attributeTypeName}>
                      <OptionAttributeTitleContainer>
                        <div>{item.attributeTypeName}</div>
                        <div>{item.required === "MANDATORY" && <RequirdIcon />}</div>
                      </OptionAttributeTitleContainer>
                      <Input
                        size="small"
                        style={{ height: "30px", marginRight: "10px" }}
                        allowClear={true}
                        name={`attributes.${index}.attributeValueName`}
                        value={item.attributeValueName}
                        onChange={formik.handleChange}
                      />
                    </InputContainer>
                  )
                
              })}
          </div>
        </OptionAttributeContainer>
        <OptionStockAndPrice>
          <div>
            <ChinaLabel>
              {formik.values.stock ? formik.values.stock.toLocaleString("ko") : "0"}
            </ChinaLabel>
            <InputContainer>
              <div>재고</div>
              <InputNumber
                size="large"
                name={`stock`}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                value={formik.values.stock}
                disabled={formik.values.disabled || !formik.values.active}
                step={10}
                min={0}
                onChange={value => {
                  formik.setFieldValue(`stock`, value)
                }}
              />
            </InputContainer>
          </div>
          <div>
            <ChinaLabel>
              {formik.values.price ? formik.values.price.toLocaleString("ko") : ""}
            </ChinaLabel>
            <InputContainer>
              <div>판매가</div>
              <InputNumber
                size="large"
                name={`productPrice`}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                defaultValue={formik.values.productPrice}
                value={Math.ceil((formik.values.salePrice / (1 - discount / 100)) * 0.1) * 10}
                disabled={true}
                step={1000}
                min={0}
                onChange={value => {
                  formik.setFieldValue(`productPrice`, Math.ceil(value * 0.1) * 10)
                }}
              />
            </InputContainer>
          </div>
          <div>
            <ChinaLabel>{`할인가 범위: ${minimumPrice.toLocaleString(
              "ko"
            )}~${maximumPrice.toLocaleString("ko")}`}</ChinaLabel>
            <InputBoldContainer>
              <div>할인가</div>
              <div>
                <InputNumber
                  className="boldInput"
                  border={false}
                  size="large"
                  style={{
                    fontSize: "18px",
                    width: "100%",
                    boxShadow: "0 0 0 3px #512da8 inset"
                  }}
                  name={`salePrice`}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={value => value.replace(/\$\s?|(,*)/g, "")}
                  //value={costAccounting(item.price)}
                  value={Math.ceil(formik.values.salePrice * 0.1) * 10}
                  // defaultValue={defaultValue}
                  // value={defaultValue}
                  disabled={formik.values.disabled || !formik.values.active}
                  step={1000}
                  min={0}
                  // onBlur={e => {
                  //   const { value } = e.target
                  //   if (value < minPassablePrice) {
                  //     formik.setFieldValue(`options.${index}.salePrice`, minPassablePrice)
                  //   } else if (value > maxPassablePrice) {
                  //     formik.setFieldValue(`options.${index}.salePrice`, maxPassablePrice)
                  //   }
                  // }}
                  onChange={value => {
                    // if (value < minPassablePrice) {
                    //   formik.setFieldValue(`options.${index}.salePrice`, minPassablePrice)
                    // } else if (value > maxPassablePrice) {
                    //   formik.setFieldValue(`options.${index}.salePrice`, maxPassablePrice)
                    // } else {

                    // }
                    let temp = [...optionObj]
                    temp[index] = {
                      ...formik.values,
                      salePrice: Math.ceil(value * 0.1) * 10
                    }
                    setOptionObj(temp)
                    formik.setFieldValue(`salePrice`, Math.ceil(value * 0.1) * 10)
                  }}
                />

                <ChinaLabel>{`추가금액: ${(formik.values.salePrice - salePrice).toLocaleString(
                  "ko"
                )}`}</ChinaLabel>
                {formik.errors.salePrice && <ErrorMessage>{formik.errors.salePrice}</ErrorMessage>}
              </div>
            </InputBoldContainer>
          </div>
          <div>
            <ChinaLabel>{`예상 수수료: ${(
              Math.ceil(formik.values.salePrice * (fees / 100) * 0.1) * 10
            ).toLocaleString("ko")}`}</ChinaLabel>
            <InputContainer>
              <div>예상 수익</div>
              <InputNumberContainer
                warn={
                  Math.ceil(
                    (formik.values.salePrice -
                      formik.values.salePrice * (fees / 100) -
                      (formik.values.price * exchangePrice + shippingPrice)) *
                      0.1
                  ) *
                    10 +
                    deliveryChargeFee <
                  1000
                    ? true
                    : false
                }
              >
                <InputNumber
                  size="large"
                  style={{ textAlign: "right", width: "100%" }}
                  name={`expectPrice`}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={value => value.replace(/\$\s?|(,*)/g, "")}
                  // value={costAccounting(item.price)}
                  value={
                    Math.ceil(
                      (formik.values.salePrice -
                        formik.values.salePrice * (fees / 100) -
                        (formik.values.price * exchangePrice + shippingPrice)) *
                        0.1
                    ) *
                      10 +
                    deliveryChargeFee
                  }
                  // value={profit}
                  disabled={true}
                />
              </InputNumberContainer>
            </InputContainer>
          </div>
        </OptionStockAndPrice>
      </OptionRight>

      <OptionBaseContainer>
        <Button
          size="large"
          type={formik.values.base ? "primary" : "dashed"}
          danger
          onClick={() => {
            let temp = optionObj.map((item, i) => {
              return {
                ...item,
                base: i === index ? true : false
              }
            })
            setOptionObj(temp)
            // initOption.forEach((item, i) => {
            //   formik.setFieldTouched(`base`)
            //   formik.setFieldValue(`base`, false)
            //   // formik.values.options[i].base = false
            // })

            formik.setFieldValue(`base`, true)
            // // formik.values.options[index].base = true
            formik.validateForm()
          }}
        >
          기준금액
        </Button>
      </OptionBaseContainer>
    </OptionItemContainer>
  )
}
const OptionTopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  margin-left: 20px;
  margin-right: 20px;
  box-sizing: border-box;
  border-bottom: ${props => `3px dashed ${props.theme.borderColor}`};

  padding-bottom: 20px;
`
const BasicPriceInfoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  & > :nth-child(n) {
    margin-right: 10px;
    min-width: 110px;
    max-width: 110px;
  }
`

const MainForm = formik => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    const array = arrayMoveImmutable(formik.values.mainImages, oldIndex, newIndex)
    formik.setFieldValue("mainImages", array)
    formik.values.mainImages = array
  }

  const shouldCancelStart = e => {
    var targetEle = e
    if (!targetEle.id) {
      targetEle = e.target
    }

    if (targetEle.className === "modify" || targetEle.className instanceof SVGAnimatedString) {
      return true
    }
  }

  const handleDelete = index => {
    if (formik.values.mainImages.length <= 1) {
      message.error({
        content: `메인 이미지는 최소 한개 이상이여야 합니다.`,
        key: "mainImageDelete",
        duration: 5
      })
      return
    }
    const mainImages = [
      ...formik.values.mainImages.slice(0, index),
      ...formik.values.mainImages.slice(index + 1)
    ]
    formik.setFieldValue("mainImages", mainImages)
  }

  const handleOK = (index, mainImage) => {
    formik.setFieldValue(`mainImages.${index}`, mainImage)
  }

  return (
    <Collapse defaultActiveKey={["main"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>메인 이미지</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="main"
      >
        <MainImageList
          items={formik.values.mainImages}
          axis={"xy"}
          onSortEnd={onSortEnd}
          shouldCancelStart={shouldCancelStart}
          handleDelete={handleDelete}
          handleOK={handleOK}
        />
      </Panel>
    </Collapse>
  )
}

const ConfirmMainImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 5px;
  margin-bottom: 10px;
`
const MainImageList = SortableContainer(({ items, handleDelete, handleOK }) => {
  return (
    <MainImageContainer>
      <MainImageFirst />
      {items && items.map((value, index) => (
        // <MainImageFirst key={index} first={index === 0} index={index}>
        <MainImageItem
          key={index}
          index={index}
          i={index}
          url={value}
          handleDelete={handleDelete}
          handleOK={handleOK}
        />
        // </MainImageFirst>
      ))}
    </MainImageContainer>
  )
})

const MainImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  margin: 20px;
`

const MainImageItem = SortableElement(({ url, i, handleDelete, handleOK }) => {
  const [visible, setVisible] = useState(false)
  const [mainImage, setMainImage] = useState("")
  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const response = await uploadImage({
        variables: {
          base64Image: reader.result
        }
      })
      
      setMainImage(response.data.UploadImage)
    }
  }
  
  return (
    <ul style={{ zIndex: "10" }}>
      <MainImageWrapper>
        <MainImage src={url} alt={url} />
        <Modal
          title="이미지 변경"
          visible={visible}
          onOk={() => {
            handleOK(i, mainImage)
            setVisible(false)
          }}
          onCancel={() => setVisible(false)}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConfirmMainImage src={mainImage} />
          </div>
          <input type="file" onChange={handleFileChange}/>
          <Input
            placeholder={"이미지 URL만 입력하세요."}
            allowClear={true}
            value={mainImage}
            onChange={e => setMainImage(e.target.value)}
          />
        </Modal>
        <MainImageModifyContianer className={"modify"}>
          <div
            className={"modify"}
            style={{ cursor: "pointer", textAlign: "center" }}
            onClick={() => {
              setMainImage(url)
              setVisible(true)
            }}
          >
            <EditOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
          </div>
          <Popconfirm
            title="삭제하시겠습니까？"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            cancelText="취소"
            okText="삭제"
            onConfirm={() => handleDelete(i)}
          >
            <div className={"modify"} style={{ cursor: "pointer", textAlign: "center" }}>
              <DeleteOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
            </div>
          </Popconfirm>
        </MainImageModifyContianer>
      </MainImageWrapper>
    </ul>
  )
})

const OptionImageModifyContainer = styled.div`
  opacity: 0;
  position: absolute;
  left: 40px;
  right: 40px;
  bottom: 5px;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  z-index: 10;
  & > :nth-child(n) {
    flex: 1;
  }
`
const MainImageModifyContianer = styled.div`
  opacity: 0;
  position: absolute;
  left: 0;
  right: 20px;
  bottom: 3px;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  z-index: 10;
  & > :nth-child(n) {
    flex: 1;
  }
`
const MainImageFirst = styled.div`
  position: absolute;
  left: -3px;
  top: -3px;
  height: 166px;
  width: 166px;
  border-radius: 5px;
  border: ${props => `3px dashed ${props.theme.primaryDark}`};
  
  /* padding: 10px; */
  /* ${ifProp(
    "first",
    css`
      border-radius: 5px;
      border: ${props => `1px dashed ${props.theme.primaryDark}`};
    `
  )}; */
`

const OptionImageWrapper = styled.div`
  position: relative;
  &:hover {
    & > ${OptionImageModifyContainer} {
      opacity: 1;
    }
  }
`

const MainImageWrapper = styled.div`
  position: relative;
  &:hover {
    & > ${MainImageModifyContianer} {
      opacity: 1;
    }
  }
`
const MainImage = styled.img`
  cursor: pointer;
  min-width: 160px;
  max-width: 160px;
  min-height: 160px;
  max-height: 160px;
  margin-right: 20px;
`

const DetailFormNew = ({
  formik,
  update,
  isBatch,
  options,
  topHtml,
  setTopHtml,
  optionHtml,
  setOptionHtml,
  detailHtml,
  setDetailHtml,
  bottomHtml,
  setBottomHtml,
  clothesHtml,
  isClothes,
  shoesHtml,
  isShoes
}) => {
  
  useEffect(() => {  
    makeOptionHtml()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options)
  // 상단
  useEffect(() => {

    

    if (formik.values.topHtml) {
      if (formik.values.topHtml !== topHtml && topHtml.length === 0) {
        setTopHtml(formik.values.topHtml)
      }
    } else {
      if (formik.values.topImage !== topHtml) {
        setTopHtml(formik.values.topImage)
      }
    }

    

    // 상세
  if (formik.values.html) {
    if (formik.values.html !== detailHtml && detailHtml.length === 0) {
      setDetailHtml(formik.values.html)
    }
  } else {
    let tempHtml = ``
    tempHtml += `<hr >`
    formik.values.content &&
      Array.isArray(formik.values.content) &&
      formik.values.content.forEach(item => {
        tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
      })
    if (tempHtml !== detailHtml) {
      setDetailHtml(tempHtml)
    }
  }

  // 하단
  if (formik.values.bottomHtml) {
    if (formik.values.bottomHtml !== bottomHtml && bottomHtml.length === 0) {
      setBottomHtml(formik.values.bottomHtml)
    }
  } else {
    if (formik.values.bottomImage !== bottomHtml) {
      setBottomHtml(formik.values.bottomImage)
    }
  }
  
  }, [])

  // 옵션
  // if (formik.values.optionHtml) {
  //   if (formik.values.optionHtml !== optionHtml && optionHtml.length === 0) {
  //     setOptionHtml(formik.values.optionHtml)
  //   }
  // } else {

 
  const makeOptionHtml = async () => {
    let tempHtml = ``
    for (const item of options) {
      
      if (item.active && !item.disabled) {
        let value = ""
        if (item.korKey) {
          value = `<span style="color: #FFFB00;">${item.korKey}</span> : ${item.korValue}`
        } else {
          value = `${item.korValue}`
        }

        let optionImage = item.image
        if (optionImage && optionImage.includes("//img.alicdn.com/")) {
          optionImage = `${optionImage}_800x800.jpg`
        }
        tempHtml += `
        <p style="text-align: center;" >
        <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF !important; padding: 10px; border-radius: 15px;">
        ${value}
        </div>
        <img src="${optionImage}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
        <p style="text-align: center;" >
        <br />
        </p>
      `
      }
    }

    tempHtml += `<p style="text-align: center;" >`
    setOptionHtml(tempHtml)
  }

  

  if (isBatch) {
  } else {
    // tempHtml = optionHtml
    // formik.values.options.forEach((item, index) => {
    //   if(item.active && !item.disabled){
    //     tempHtml.replace(`<span style="color: #FFFB00;">${options[
    //       index
    //     ].korValue}</span>`, item.korValue)
    //   }
    // })
    // console.log("tempHtml", tempHtml)
  }
  // if (tempHtml !== optionHtml) {

  //   setOptionHtml(tempHtml)
  // }

  // if (tempHtml !== optionHtml && tempHtml.length > 0) {
  //   // formik.setFieldValue("optionHtml", tempHtml)
  //   // formik.values.optionHtml = html
  //   setOptionHtml(tempHtml)
  // } else {
  //   if (!optionHtml) {
  //     for (const item of formik.values.options) {
  //       if (item.active && !item.disabled) {
  //         let value = item.korValue

  //         value = `<span style="color: #FFFB00;">${item.korValue}</span>`

  //         tempHtml += `
  //         <p style="text-align: center;" >
  //         <div style="text-align: center; font-size: 20px; font-weight: 700; color: white; background: #0090FF; padding: 10px; border-radius: 15px;">
  //         ${value}
  //         </div>
  //         <img src="${item.image}_800x800.jpg" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
  //         <p style="text-align: center;" >
  //         <br />
  //         </p>
  //       `
  //       }
  //     }

  //     tempHtml += `<p style="text-align: center;" >`

  //     setOptionHtml(tempHtml)
  //   }
  // }
  // isLoading = true
  // }

  

  return (
    <Collapse defaultActiveKey={["detailPage"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상세페이지</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="detailPage"
      >
        <Collapse defaultActiveKey={[""]}>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>상단</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            key="top"
          >
            <TextEditor height={600} showHtml={true} html={topHtml} getHtmlValue={value=> {
              // formik.setFieldValue("topHtml", value)
              console.log("value", value)
              setTopHtml(value)
            }} />

          </Panel>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>의류 사이즈 표</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            extra={
              <Checkbox
                name="isClothes"
                checked={formik.values.isClothes}
                onChange={formik.handleChange}
              >
                포함
              </Checkbox>
            }
            key="clothes"
          >
            <TextEditor height={600} showHtml={true} disabled html={clothesHtml} />
          </Panel>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>신발 사이즈 표</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            extra={
              <Checkbox
                name="isShoes"
                checked={formik.values.isShoes}
                onChange={formik.handleChange}
              >
                포함
              </Checkbox>
            }
            key="shoes"
          >
            <TextEditor height={600} showHtml={true} disabled html={shoesHtml} />
          </Panel>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>옵션</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            key="option"
          >
            <TextEditor
              height={600}
              showHtml={true}
              disabled
              html={optionHtml}
              getHtmlValue={setOptionHtml}
            />
          </Panel>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>상세내용</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            key="detail"
          >
            <TextEditor showHtml={true} html={detailHtml} getHtmlValue={setDetailHtml} />
          </Panel>
          <Panel
            header={
              <HeaderContainer>
                <HeaderTitle>하단</HeaderTitle>
                <RequirdIcon />
              </HeaderContainer>
            }
            key="bottom"
          >
            <TextEditor
              height={600}
              showHtml={true}
              html={bottomHtml}
              getHtmlValue={setBottomHtml}
            />
          </Panel>
        </Collapse>
      </Panel>
    </Collapse>
  )
}

const DetailForm = ({ formik, update, isBatch, options }) => {
  // let initHtml = `<div style="text-align: center; margin: 0; padding: 0;>`
  // let initHtml = `<div style="text-align: center; margin: 0 auto; display: block; justify-conten: center;">`

  const [html, setHtml] = useState(null)
  let initHtml = ``
  let tempHtml = ``

  if (formik.values.html && update) {
    tempHtml = formik.values.html
  } else {
    if (formik.values.topImage) {
      tempHtml += `<img src="${formik.values.topImage}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
    }

    formik.values.options
      .filter(item => item.active && !item.disabled)
      .forEach((item, index) => {
        let value = item.korValue
        if (isBatch) {
          value = `${item.korValue} : ${options[index].korValue}`
        }
        tempHtml += `
          <p style="text-align: center;" >
          <div style="text-align: center; font-size: 20px; font-weight: 700; background: rgba(0, 144, 255, 0.5); padding: 10px; border-radius: 15px;">
          ${value}
          </div>
          <img src="${item.image}_800x800.jpg" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; " />
          <p style="text-align: center;" >
          <br />
          </p>
        `
      })
    tempHtml += `<p style="text-align: center;" >`
    formik.values.content &&
      Array.isArray(formik.values.content) &&
      formik.values.content.forEach(item => {
        tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
      })

    formik.values.attribute &&
      Array.isArray(formik.values.attribute) &&
      formik.values.attribute.forEach(item => {
        tempHtml += `<p>${item.korKey} : ${item.korValue}</p>`
      })

    if (formik.values.bottomImage) {
      tempHtml += `<img src="${formik.values.bottomImage}" style="width: 100%; display: block; margin: 0 auto; "/ />`
    }
  }

  if (tempHtml !== html) {
    formik.setFieldValue("html", tempHtml)
    // formik.values.html = html
    setHtml(tempHtml)
  }

  useEffect(() => {
    formik.setFieldValue("html", tempHtml)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // const [htmlValue, setHtmlValue] = useState(initHtml)

  const handleHtmlValue = html => {
    // setHtmlValue(html)
    console.log("html", html)
    setHtml(html)
    formik.setFieldValue("html", html)
    formik.values.html = html
  }

  return (
    <Collapse defaultActiveKey={["detail"]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상세페이지</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="detail"
      >
        <TextEditor
          showHtml={true}
          initHtml={initHtml}
          html={html}
          getHtmlValue={handleHtmlValue}
        />
      </Panel>
    </Collapse>
  )
}

const CategoryMetaForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>메타정보</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="meta"
      >
        {NoticesListForm(formik)}
        {AttributesListForm(formik)}
      </Panel>
    </Collapse>
  )
}

const NoticesListForm = formik => {
  const noticeCategory = formik.values.noticeCategories[0]

  return (
    <Collapse defaultActiveKey={[""]}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상품고시정보</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="notices"
      >
        {
          <NoticeListContainer>
            <NoticeCategoryNameLabel>{noticeCategory.noticeCategoryName}</NoticeCategoryNameLabel>
            <div>
              {noticeCategory.noticeCategoryDetailNames.map((item, i) => (
                <NoticeCategoryDetailNamesContainer key={i}>
                  <div>
                    {item.noticeCategoryDetailName}
                    {item.required === "MANDATORY" && <RequirdIcon />}
                  </div>
                  <Input
                    size="large"
                    name={`noticeCategories.${0}.noticeCategoryDetailNames.${i}.content`}
                    value={item.content}
                    // disabled={item.disabled}
                    onChange={e => {
                      formik.setFieldValue(
                        `noticeCategories.${0}.noticeCategoryDetailNames.${i}.content`,
                        e.target.value
                      )
                    }}
                  />
                </NoticeCategoryDetailNamesContainer>
              ))}
            </div>
          </NoticeListContainer>
        }
        {/* {formik.values.noticeCategories.map((item, index) => (
          <NoticeListContainer key={index}>
            <NoticeCategoryNameLabel>{item.noticeCategoryName}</NoticeCategoryNameLabel>
            <div>
              {item.noticeCategoryDetailNames.map((item, i) => (
                <NoticeCategoryDetailNamesContainer key={i}>
                  <div>
                    {item.noticeCategoryDetailName}
                    {item.required === "MANDATORY" && <RequirdIcon />}
                  </div>
                  <Input
                    name={`noticeCategories.${index}.noticeCategoryDetailNames.${i}.content`}
                    value={item.content}
                    // disabled={item.disabled}
                    onChange={e => {
                      formik.setFieldValue(
                        `noticeCategories.${index}.noticeCategoryDetailNames.${i}.content`,
                        e.target.value
                      )
                    }}
                  />
                </NoticeCategoryDetailNamesContainer>
              ))}
            </div>
          </NoticeListContainer>
        ))} */}
      </Panel>
    </Collapse>
  )
}

const NoticeListContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  & > :nth-child(1) {
    min-width: 100px;
    max-width: 100px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
  &:not(:last-child) {
    border-bottom: ${props => `1px solid ${props.theme.borderColor}`};
    padding-bottom: 20px;
  }
`

const NoticeCategoryNameLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
`

const NoticeCategoryDetailNamesContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  & > :nth-child(1) {
    min-width: 180px;
    max-width: 180px;
    text-align: right;
    margin-right: 20px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const AttributesListForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상품속성정보</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="attributes"
      >
        {formik.values.attributes.map((item, index) => {
          if (item.required === "MANDATORY") {
            return (
              <AttributeDetailNamesContainer key={index}>
                <div>
                  {item.attributeTypeName}
                  {item.required === "MANDATORY" && <RequirdIcon />}
                </div>
                <Input
                  size="large"
                  name={`attributes.${index}.attributeValueName`}
                  value={item.attributeValueName}
                  onChange={e => {
                    formik.setFieldValue(`attributes.${index}.attributeValueName`, e.target.value)
                  }}
                />
              </AttributeDetailNamesContainer>
            )
          } else {
            return (
              <AttributeDetailNamesContainer key={index}>
                <div>
                  {item.attributeTypeName}
                  {item.required === "MANDATORY" && <RequirdIcon />}
                </div>
                <Input
                  size="large"
                  name={`attributes.${index}.attributeValueName`}
                  value={item.attributeValueName}
                  // disabled={item.disabled}
                  onChange={e => {
                    formik.setFieldValue(`attributes.${index}.attributeValueName`, e.target.value)
                  }}
                />
              </AttributeDetailNamesContainer>
            )
          }
        })}
      </Panel>
    </Collapse>
  )
}

const MainTitleImageContainer = styled.div`
  display: flex;
  & > :nth-child(2) {
    width: 100%;
  }
`
const MainTitleImage = styled.img`
  min-width: 140px;
  max-width: 140px;
  min-height: 140px;
  max-height: 140px;
  border-radius: 5px;
  border: ${props => `2px solid ${props.theme.borderColor}`};
`
const AttributeDetailNamesContainer = styled.div`
  display: flex;

  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 80px;
    max-width: 80px;
    text-align: right;
    margin-right: 20px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const ASForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>A/S</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="as"
      >
        <>
          <AttributeDetailNamesContainer>
            <div>
              A/S안내
              <RequirdIcon />
            </div>
            <TextArea
              size="large"
              name={`afterServiceInformation`}
              value={formik.values.afterServiceInformation}
              onChange={formik.handleChange}
            />
          </AttributeDetailNamesContainer>
          <AttributeDetailNamesContainer>
            <div>
              A/S전화번호
              <RequirdIcon />
            </div>
            <Input
              size="large"
              name={`afterServiceContactNumber`}
              value={formik.values.afterServiceContactNumber}
              onChange={formik.handleChange}
            />
          </AttributeDetailNamesContainer>
        </>
      </Panel>
    </Collapse>
  )
}

const ShippingForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>배송</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="shipping"
      >
        <>
          <AttributeDetailNamesContainer>
            <div>
              출고지
              <RequirdIcon />
            </div>
            {formik.values.shipping.placeAddresses.length > 0 && (
              <div>
                {`[${formik.values.shipping.shippingPlaceName}]${formik.values.shipping.placeAddresses[0].returnAddress} ${formik.values.shipping.placeAddresses[0].returnAddressDetail}`}
              </div>
            )}
            {!formik.values.shipping ||
              !formik.values.shipping.returnCenterCode ||
              (formik.values.shipping.placeAddresses.length === 0 && (
                <ErrorMessage>쿠팡에 출고지를 입력해주세요</ErrorMessage>
              ))}
          </AttributeDetailNamesContainer>
          <AttributeDetailNamesContainer>
            <div>
              택배사
              <RequirdIcon />
            </div>
            <Select
              size="large"
              style={{ width: 200 }}
              defaultValue={formik.values.shipping.deliveryCompanyCode}
              placeholder="택배사를 선택해주세요"
              onChange={value => formik.setFieldValue("shipping.deliveryCompanyCode", value)}
            >
              <Option value="HYUNDAI">롯데택배</Option>
              <Option value="KGB">로젠택배</Option>
              <Option value="EPOST">우체국</Option>
              <Option value="HANJIN">한진택배</Option>
              <Option value="CJGLS">CJ대한통운</Option>
              <Option value="KDEXP">경동택배</Option>
              <Option value="DIRECT">업체직송</Option>
              <Option value="ILYANG">일양택배</Option>
              <Option value="CHUNIL">천일특송</Option>
              <Option value="AJOU">아주택배</Option>
              <Option value="CSLOGIS">SC로지스</Option>
              <Option value="DAESIN">대신택배</Option>
              <Option value="CVS">CVS택배 </Option>
              <Option value="HDEXP">합동택배</Option>
              <Option value="DHL">DHL</Option>
              <Option value="UPS">UPS</Option>
              <Option value="FEDEX">FEDEX</Option>
              <Option value="REGISTPOST">우편등기</Option>
              <Option value="EMS">우체국 EMS</Option>
              <Option value="TNT">TNT</Option>
              <Option value="USPS">USPS</Option>
              <Option value="IPARCEL">i-parcel</Option>
              <Option value="GSMNTON">GSM NtoN</Option>
              <Option value="SWGEXP">성원글로벌</Option>
              <Option value="PANTOS">범한판토스</Option>
              <Option value="ACIEXPRESS">ACI Express</Option>
              <Option value="DAEWOON">대운글로벌</Option>
              <Option value="AIRBOY">에어보이익스프레스</Option>
              <Option value="KGLNET">KGL네트웍스</Option>
              <Option value="KUNYOUNG">건영택배</Option>
              <Option value="SLX">SLX택배</Option>
              <Option value="HONAM">호남택배</Option>
              <Option value="LINEEXPRESS">LineExpress</Option>
              <Option value="TWOFASTEXP">2FastsExpress</Option>
              <Option value="HPL">한의사랑택배</Option>
              <Option value="GOODSTOLUCK">굿투럭</Option>
              <Option value="KOREXG">CJ대한통운특</Option>
              <Option value="HANDEX">한덱스</Option>
              <Option value="BGF">BGF</Option>
              <Option value="ECMS">ECMS익스프레스</Option>
              <Option value="WONDERS">원더스퀵</Option>
              <Option value="YONGMA">용마로지스</Option>
              <Option value="SEBANG">세방택배</Option>
              <Option value="NHLOGIS">농협택배</Option>
              <Option value="LOTTEGLOBAL">롯데글로벌</Option>
              <Option value="GSIEXPRESS">GSI익스프레스</Option>
              <Option value="EFS">EFS</Option>
              <Option value="DHLGLOBALMAIL">DHL GlobalMail</Option>
              <Option value="GPSLOGIX">GPS로직</Option>
              <Option value="CRLX">시알로지텍</Option>
              <Option value="BRIDGE">브리지로지스</Option>
              <Option value="HOMEINNOV">홈이노베이션로지스</Option>
              <Option value="CWAY">씨웨이</Option>
              <Option value="GNETWORK">자이언트</Option>
              <Option value="ACEEXP">ACE Express</Option>
              <Option value="WEVILL">우리동네택배</Option>
              <Option value="FOREVERPS">퍼레버택배</Option>
              <Option value="WARPEX">워펙스</Option>
              <Option value="QXPRESS">큐익스프레스</Option>
              <Option value="SMARTLOGISY">스마트로지스</Option>
              <Option value="LGE">LG전자</Option>
              <Option value="WINION">위니온</Option>
              <Option value="WINION2">위니온(에어컨)</Option>
            </Select>
          </AttributeDetailNamesContainer>
          <AttributeDetailNamesContainer>
            <div>
              배송비 종류
              <RequirdIcon />
            </div>
            <Select
              size="large"
              style={{ width: 200 }}
              defaultValue={formik.values.shipping.deliveryChargeType}
              onChange={value => formik.setFieldValue("shipping.deliveryChargeType", value)}
            >
              <Option value="FREE">무료배송</Option>
              <Option value="NOT_FREE">유료배송</Option>
            </Select>
          </AttributeDetailNamesContainer>
          {formik.values.shipping.deliveryChargeType === "NOT_FREE" && (
            <AttributeDetailNamesContainer>
              <div>
                기본배송비
                <RequirdIcon />
              </div>
              <InputNumber
                size="large"
                style={{ width: 200 }}
                step={100}
                name="shipping.deliveryCharge"
                value={formik.values.shipping.deliveryCharge}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => {
                  formik.setFieldValue("shipping.deliveryCharge", value)
                }}
              />
            </AttributeDetailNamesContainer>
          )}
          <AttributeDetailNamesContainer>
            <div>
              출고 소요기간
              <RequirdIcon />
            </div>
            <InputNumber
              size="large"
              style={{ textAlign: "right", width: "200px" }}
              name={`shipping.outboundShippingTimeDay`}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={value => value.replace(/\$\s?|(,*)/g, "")}
              value={formik.values.shipping.outboundShippingTimeDay}
              step={1}
              min={0}
              onChange={value => {
                formik.setFieldValue(`shipping.outboundShippingTimeDay`, value)
              }}
            />
          </AttributeDetailNamesContainer>
        </>
      </Panel>
    </Collapse>
  )
}
const ReturnCenterForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>반품/교환</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="returnCenter"
      >
        <>
          <AttributeDetailNamesContainer>
            <div>
              반품/교환지
              <RequirdIcon />
            </div>
            {formik.values.returnCenter.placeAddresses.length > 0 && (
              <div>
                {`[${formik.values.returnCenter.shippingPlaceName}]${formik.values.returnCenter.placeAddresses[0].returnAddress} ${formik.values.returnCenter.placeAddresses[0].returnAddressDetail}`}
              </div>
            )}
            {!formik.values.returnCenter ||
              !formik.values.returnCenter.returnCenterCode ||
              (formik.values.returnCenter.placeAddresses.length === 0 && (
                <ErrorMessage>쿠팡에 반품지를 입력해주세요</ErrorMessage>
              ))}
          </AttributeDetailNamesContainer>
          {formik.values.shipping.deliveryChargeType === "FREE" && (
            <AttributeDetailNamesContainer>
              <div>
                초도배송비(편도)
                <RequirdIcon />
              </div>
              <InputNumber
                size="large"
                style={{ textAlign: "right", width: "200px" }}
                name={`returnCenter.deliveryChargeOnReturn`}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                value={formik.values.returnCenter.deliveryChargeOnReturn}
                step={100}
                min={0}
                onChange={value => {
                  formik.setFieldValue(`returnCenter.deliveryChargeOnReturn`, value)
                }}
              />
            </AttributeDetailNamesContainer>
          )}
          <AttributeDetailNamesContainer>
            <div>
              반품배송비(편도)
              <RequirdIcon />
            </div>
            <InputNumber
              size="large"
              style={{ textAlign: "right", width: "200px" }}
              name={`returnCenter.returnCharge`}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={value => value.replace(/\$\s?|(,*)/g, "")}
              value={formik.values.returnCenter.returnCharge}
              step={100}
              min={0}
              onChange={value => {
                formik.setFieldValue(`returnCenter.returnCharge`, value)
              }}
            />
          </AttributeDetailNamesContainer>
        </>
      </Panel>
    </Collapse>
  )
}

const ProductInformationForm = formik => {
  return (
    <Collapse defaultActiveKey={[""]} style={{ marginBottom: "30px" }}>
      <Panel
        header={
          <HeaderContainer>
            <HeaderTitle>상품 주요정보</HeaderTitle>
            <RequirdIcon />
          </HeaderContainer>
        }
        key="information"
      >
        <>
          <AttributeDetailNamesContainer>
            <div>
              브랜드
              <RequirdIcon />
            </div>
            <Input
              size="large"
              name={`brand`}
              value={formik.values.brand}
              onChange={formik.handleChange}
            />
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              제조사
              <RequirdIcon />
            </div>
            <Input
              size="large"
              name={`manufacture`}
              value={formik.values.manufacture}
              onChange={formik.handleChange}
            />
          </AttributeDetailNamesContainer>
          <AttributeDetailNamesContainer>
            <div>
              인당 최대구매수량
              <RequirdIcon />
            </div>
            <FlexContainer>
              <InputNumber
                size="large"
                style={{ width: 100 }}
                step={1}
                min={1}
                name="maximumBuyForPersonPeriod	"
                value={formik.values.maximumBuyForPersonPeriod}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => formik.setFieldValue("maximumBuyForPersonPeriod	", value)}
              />

              <div>일 동안 1인당 최대</div>
              <InputNumber
                size="large"
                style={{ width: 100 }}
                step={1}
                min={0}
                name="maximumBuyForPerson"
                value={formik.values.maximumBuyForPerson}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => formik.setFieldValue("maximumBuyForPerson", value)}
              />
              <div>개 구매가능</div>
            </FlexContainer>
          </AttributeDetailNamesContainer>
        </>
      </Panel>
    </Collapse>
  )
}

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(n) {
    margin-right: 10px;
  }
`

const SubmitForm = (
  formik,
  loading,
  setUpdateType,
  optionRef,
  basicSubmitSuccess,
  optionSubmitSuccess
) => {
  return (
    <SubmitContainer>
      <div>
        {formik.values.coupang_productID && <div>{`쿠팡: ${formik.values.coupang_productID}`}</div>}
        {formik.values.cafe24_product_no && (
          <div>{`  카페24: ${formik.values.cafe24_product_no}`}</div>
        )}
      </div>
      <SumbitButtonContainer>
        <Tooltip title="쿠팡만 등록">
          <Button
            size="large"
            type="primary"
            danger
            htmlType="button"
            loading={loading}
            onClick={() => {
              const keys = Object.keys(formik.errors)
              if (keys && keys.length > 0) {
                console.log("click", formik.errors)
                message.error({
                  content: (
                    <div>
                      <ErrorMessage>{formik.errors[keys[0]]}</ErrorMessage>
                    </div>
                  ),
                  key: keys,
                  duration: 5
                })
              } else {
                basicSubmitSuccess = null
                optionSubmitSuccess = null
                optionValueArray = []
                setUpdateType(1)
                optionRef.current.forEach(item => {
                  item.current.click()
                })

                // formik.handleSubmit()
              }
            }}
          >
            쿠팡 등록
          </Button>
        </Tooltip>
        <Tooltip title="카페24만 등록">
          <Button
            size="large"
            danger
            htmlType="button"
            loading={loading}
            onClick={() => {
              const keys = Object.keys(formik.errors)
              if (keys && keys.length > 0) {
                console.log("click", formik.errors)
                alert("옵션을 확인해 주세요")
              } else {
                basicSubmitSuccess = null
                optionSubmitSuccess = null
                optionValueArray = []
                setUpdateType(2)
                optionRef.current.forEach(item => {
                  item.current.click()
                })

                // formik.handleSubmit()
              }
            }}
          >
            카페24 등록
          </Button>
        </Tooltip>
        <Tooltip title="쿠팡, 카페24 통합 등록">
          <Button
            size="large"
            type="primary"
            htmlType="button"
            loading={loading}
            onClick={() => {
              console.log("click", formik.errors)
              const keys = Object.keys(formik.errors)
              if (keys && keys.length > 0) {
                alert("옵션을 확인해 주세요")
              } else {
                basicSubmitSuccess = null
                optionSubmitSuccess = null
                optionValueArray = []
                setUpdateType(100)
                optionRef.current.forEach(item => {
                  item.current.click()
                })

                // formik.handleSubmit()
              }
            }}
          >
            상품 통합 등록
          </Button>
        </Tooltip>
      </SumbitButtonContainer>
    </SubmitContainer>
  )
}

const SumbitButtonContainer = styled.div`
  display: flex;
  & > :nth-child(1) {
    margin-right: 10px;
  }
  & > :last-child {
    margin-left: 120px;
  }
`
const Container = styled.div`
  box-sizing: border-box;
  padding: 50px;
`

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
`

const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`

const HeaderSubTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
`

const RequirdIcon = styled.div`
  display: inline-block;
  background-color: #ff545c;
  border-radius: 50%;
  vertical-align: middle;
  height: 6px;
  width: 6px;
  margin-left: 5px;
`

const OptionImage = styled.img`
  min-width: 160px;
  max-width: 160px;
  height: 160px;
  border-radius: 10px;
  border: ${props => `2px solid ${props.theme.borderColor}`};
  margin-left: 40px;
  margin-right: 40px;
`

const SubmitContainer = styled.div`
  height: 80px;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99999;
  border-top: 1px solid lightgray;
  box-shadow: 0 -4px 10px lightgray;
  background: white;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
`
const OptionMenuContainer = styled.div`
  margin-top: 23px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;

  box-sizing: border-box;
`
const AlphabetContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(n) {
    margin-left: 5px;
  }
  & > :nth-child(1) {
    width: 100px;
  }
  & > :nth-child(3) {
    width: 100px;
  }
`

const OptionContainer = styled(SimpleBar)`
  max-height: 800px;
  overflow: auto;
  margin-left: 20px;
  margin-right: 20px;
  box-sizing: border-box;

  max-width: 1600px;
  margin: 0 auto;
`
const OptionItemContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 25px;

  & > :nth-child(1) {
  }

  &:not(:last-child) {
    border-bottom: ${props => `1px solid ${props.theme.borderColor}`};
    padding-bottom: 25px;
  }
`

const OptionRight = styled.div`
  /* margin-left: 20px; */

  min-width: 1000px;
  max-width: 1000px;
`

const OptionBaseContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 40px;
`
const ByteContainer = styled.div`
  margin-left: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const OptionStockAndPrice = styled.div`
  display: flex;
  /* align-items: center; */
  /* justify-content: space-between; */
  margin-top: 10px;

  & > :nth-child(1) {
    min-width: 240px;
    max-width: 240px;
  }
  & > :nth-child(2) {
    min-width: 240px;
    max-width: 240px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
  & > :nth-child(4) {
    min-width: 240px;
    max-width: 240px;
  }
`

const ChinaLabel = styled.div`
  text-align: right;
  font-size: 13px;
  margin-bottom: 4px;
  color: ${props => props.theme.primaryDark};
`

const InputNumberContainer = styled.div`
  ${ifProp(
    "warn",
    css`
      border: ${props => `3px solid #ff545c`};
    `
  )};
`

const OptionAttributeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 6px;

  & > :nth-child(1) {
    min-width: 80px;
    max-width: 80px;
    text-align: right;
    margin-right: 20px;

    font-style: italic;
  }
  & > :nth-child(2) {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: 5px;
    padding-bottom: 15px;
    box-shadow: 0 0 0 2px #fff8d4 inset;
    background: #fafafa;
  }
`

const OptionAttributeTitleContainer = styled.div`
  display: flex;
  align-items: center;
  & > :first-child {
    width: 100%;
    text-align: right;
  }
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(1) {
    min-width: 80px;
    max-width: 80px;
    text-align: right;
    margin-right: 20px;
    margin-top: 6px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const InputOptionNameContainer = styled.div`
  display: flex;

  & > :not(:last-child) {
    margin-right: 14px;
  }
  & > :last-child {
    width: 100%;
  }
`

const InputBoldContainer = styled(InputContainer)`
  font-weight: 700;
  font-size: 15px;
  color: #ff545c;
  align-items: flex-start;
`
const ErrorMessage = styled.div`
  color: #ff545c;
  font-size: 13px;
  font-weight: 900;
`

const HiddenButton = styled.button`
  /* display: none; */
  opacity: 0;
`
