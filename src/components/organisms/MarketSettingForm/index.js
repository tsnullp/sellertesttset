import React, { useState } from "react"
import styled from "styled-components"
import { Collapse, Form, Input, Button, Row, Col, notification, Select, InputNumber } from "antd"
import { useFormik } from "formik"
import {
  SET_TAOBAO_BASIC_INFO,
  SET_COUPANG_BASIC_INFO,
  SET_CAFE24_BASIC_INFO,
  SET_INTERPARK_BASIC_INFO,
  NAVERSHOPPING_UPLOAD,
  CAFE24_SYNC,
  CAFE24_AUTO,
  DUPLICATE_PRODUCT_LIST,
  INTERPARK_AUTO
} from "gql"
import { useMutation } from "@apollo/client"

const { shell } = window.require("electron")
const { Panel } = Collapse
const { Option } = Select

const MarketSettingForm = ({ item, refetch }) => {

  return (
    <Container>
      {TaobaoInfo({ item: item.taobao, refetch })}
      {CoupangInfo({ item: item.coupang, refetch })}
      {Cafe24Info({ item: item.cafe24, refetch })}
      {InterParkInfo({ item: item.interpark, refetch })}
    </Container>
  )
}

export default MarketSettingForm

const TaobaoInfo = ({ item, refetch }) => {
  const loginID = item ? item.loginID : "" 
  const password = item ? item.password : "" 
  const imageKey = item ? item.imageKey : "" 
  
  const [setTaobaoInfo] = useMutation(SET_TAOBAO_BASIC_INFO)

  const formik = useFormik({
    initialValues: {
      loginID,
      password,
      imageKey
    },
    validate: values => {
      const errors = {}
      if (!values.loginID || values.loginID.trim().length === 0) {
        errors.loginID = "아이디를 입력해주세요."
      }
      if (!values.password || values.password.trim().length === 0) {
        errors.password = "비밀번호를 입력해주세요."
      }
      return errors
    },
    onSubmit: async values => {
      const response = await setTaobaoInfo({
        variables: {
          loginID: values.loginID,
          password: values.password,
          imageKey: values.imageKey
        }
      })
      if (response.data.SetTaobaoBasicInfo) {
        refetch()
        notification["success"]({
          message: "저장 하였습니다."
        })
      } else {
        notification["error"]({
          message: "저장에 실패하였습니다."
        })
      }
    }
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center"
  }

  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={["taobao"]} style={{ marginBottom: "30px" }}>
        <Panel
          header={
            <HeaderContainer>
              <HeaderTitle>타오바오</HeaderTitle>
              <RequirdIcon />
            </HeaderContainer>
          }
          key="taobao"
        >
          <AttributeDetailNamesContainer>
            <div>
              아이디
              <RequirdIconSmall />
            </div>
            <div>
              <Input name="loginID" value={formik.values.loginID} onChange={formik.handleChange} />
              {formik.touched.loginID && formik.errors.loginID && (
                <ErrorMessage>{formik.errors.loginID}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              비밀번호
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {formik.touched.password && formik.errors.password && (
                <ErrorMessage>{formik.errors.password}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div style={{cursor: "pointer"}}
              onClick={() => {
                shell.openExternal("https://rapidapi.com/gabrielius.u/api/taobao-advanced/pricing")
              }}
            >
              이미지 API KEY
            </div>
            <div>
              <Input name="imageKey" value={formik.values.imageKey} onChange={formik.handleChange} />
            </div>
          </AttributeDetailNamesContainer>

          <ButtonContainer>
            <Button type="primary" htmlType="submit" className="login-form-button">
              저장
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}
const CoupangInfo = ({ item, refetch }) => {
  const vendorUserId = item ? item.vendorUserId : ""
  const vendorId = item ? item.vendorId : ""
  const accessKey = item ? item.accessKey : ""
  const secretKey = item ? item.secretKey : ""
  const deliveryCompanyCode = item ? item.deliveryCompanyCode : ""
  const deliveryChargeType = item ? item.deliveryChargeType : ""
  const deliveryCharge = item ? item.deliveryCharge : ""
  const deliveryChargeOnReturn = item ? item.deliveryChargeOnReturn : ""
  const returnCharge = item ? item.returnCharge : ""
  const outbound = item ? item.outbound : ""
  const returnShippingCenter = item ? item.returnShippingCenter : ""
  const outboundShippingTimeDay = item ? item.outboundShippingTimeDay : ""
  const invoiceDocument = item ? item.invoiceDocument : ""
  const maximumBuyForPerson = item ? item.maximumBuyForPerson : 0
  const maximumBuyForPersonPeriod = item ? item.maximumBuyForPersonPeriod : 1
 
  const [setCoupangInfo] = useMutation(SET_COUPANG_BASIC_INFO)

  const formik = useFormik({
    initialValues: {
      vendorUserId,
      vendorId,
      accessKey,
      secretKey,
      deliveryCompanyCode,
      deliveryChargeType,
      deliveryCharge: deliveryCharge || 0,
      deliveryChargeOnReturn: deliveryChargeOnReturn || 0,
      returnCharge: returnCharge || 0,
      outbound,
      returnShippingCenter,
      outboundShippingTimeDay,
      invoiceDocument,
      maximumBuyForPerson,
      maximumBuyForPersonPeriod
    },
    validate: values => {
      const errors = {}
      if (!values.vendorUserId || values.vendorUserId.trim().length === 0) {
        errors.vendorUserId = "쿠팡 Wing ID를 입력해 주세요."
      }
      if (!values.vendorId || values.vendorId.trim().length === 0) {
        errors.vendorId = "업체코드를 입력해 주세요."
      }
      if (!values.accessKey || values.accessKey.trim().length === 0) {
        errors.accessKey = "Access Key를 입력해 주세요."
      }
      if (!values.secretKey || values.secretKey.trim().length === 0) {
        errors.secretKey = "Secret Key를 입력해 주세요."
      }

      if (!values.outboundShippingTimeDay || values.outboundShippingTimeDay === 0) {
        errors.outboundShippingTimeDay = "기준출고일을 입력해 주세요."
      }

      if (!values.deliveryCompanyCode || values.deliveryCompanyCode.trim().length === 0) {
        errors.deliveryCompanyCode = "택배사를 선택해주세요."
      }
      if (!values.deliveryChargeType || values.deliveryChargeType.trim().length === 0) {
        errors.deliveryChargeType = "배송비 종류를 선택해주세요."
      }

      if (values.deliveryChargeType === "FREE") {
        if (!values.deliveryChargeOnReturn || values.deliveryChargeOnReturn === 0) {
          errors.deliveryChargeOnReturn = "초도반품배송비를 입력해 주세요."
        }
        if (!values.returnCharge || values.returnCharge === 0) {
          errors.returnCharge = "반품배송비를 입력해 주세요."
        }
      }

      if (values.deliveryChargeType === "NOT_FREE") {
        if (!values.deliveryCharge || values.deliveryCharge === 0) {
          errors.deliveryCharge = "기본배송비를 입력해 주세요."
        }
        if (!values.returnCharge || values.returnCharge === 0) {
          errors.returnCharge = "반품배송비를 입력해 주세요."
        }
      }

      if (!values.invoiceDocument || values.invoiceDocument.trim().length === 0) {
        errors.invoiceDocument = "인보이스영수증 URL주소를 입력해 주세요."
      }

      return errors
    },
    onSubmit: async values => {
      const response = await setCoupangInfo({
        variables: {
          vendorUserId: values.vendorUserId,
          vendorId: values.vendorId,
          accessKey: values.accessKey,
          secretKey: values.secretKey,
          deliveryCompanyCode: values.deliveryCompanyCode,
          deliveryChargeType: values.deliveryChargeType,
          deliveryCharge: values.deliveryCharge,
          deliveryChargeOnReturn: values.deliveryChargeOnReturn,
          returnCharge: values.returnCharge,
          outboundShippingTimeDay: values.outboundShippingTimeDay,
          invoiceDocument: values.invoiceDocument,
          maximumBuyForPerson: values.maximumBuyForPerson,
          maximumBuyForPersonPeriod: values.maximumBuyForPersonPeriod
        }
      })

      if (response.data.SetCoupangBasicInfo) {
        refetch()
        notification["success"]({
          message: "저장 하였습니다."
        })
      } else {
        notification["error"]({
          message: "저장에 실패하였습니다."
        })
      }
    }
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center"
  }
  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={["coupang"]} style={{ marginBottom: "30px" }}>
        <Panel
          header={
            <HeaderContainer>
              <HeaderTitle>쿠팡</HeaderTitle>
              <RequirdIcon />
            </HeaderContainer>
          }
          key="coupang"
        >
          <AttributeDetailNamesContainer>
            <div>
              쿠팡 Wing ID
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="vendorUserId"
                value={formik.values.vendorUserId}
                onChange={formik.handleChange}
              />
              {formik.touched.vendorUserId && formik.errors.vendorUserId && (
                <Row justify="center" align="middle" gutter={[24, 10]}>
                  <Col span={20} offset={4}>
                    <ErrorMessage>{formik.errors.vendorUserId}</ErrorMessage>
                  </Col>
                </Row>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              업체코드
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="vendorId"
                value={formik.values.vendorId}
                onChange={formik.handleChange}
              />
              {formik.touched.vendorId && formik.errors.vendorId && (
                <ErrorMessage>{formik.errors.vendorId}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              Access Key
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="accessKey"
                value={formik.values.accessKey}
                onChange={formik.handleChange}
              />
              {formik.touched.accessKey && formik.errors.accessKey && (
                <ErrorMessage>{formik.errors.accessKey}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              Secret Key
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="secretKey"
                value={formik.values.secretKey}
                onChange={formik.handleChange}
              />

              {formik.touched.secretKey && formik.errors.secretKey && (
                <ErrorMessage>{formik.errors.secretKey}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              기준출고일
              <RequirdIconSmall />
            </div>
            <div>
              <InputNumber
                style={{ width: 200 }}
                step={1}
                min={1}
                name="outboundShippingTimeDay"
                value={formik.values.outboundShippingTimeDay}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => {
                  formik.setFieldValue("outboundShippingTimeDay", value)
                }}
              />

              {formik.touched.outboundShippingTimeDay && formik.errors.outboundShippingTimeDay && (
                <ErrorMessage>{formik.errors.outboundShippingTimeDay}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              택배사
              <RequirdIconSmall />
            </div>
            <div>
              <Select
                style={{ width: 200 }}
                defaultValue={formik.values.deliveryCompanyCode}
                placeholder="택배사를 선택해주세요"
                onChange={value => formik.setFieldValue("deliveryCompanyCode", value)}
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

              {formik.touched.deliveryCompanyCode && formik.errors.deliveryCompanyCode && (
                <ErrorMessage>{formik.errors.deliveryCompanyCode}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              배송비 종류
              <RequirdIconSmall />
            </div>
            <div>
              <Select
                style={{ width: 200 }}
                defaultValue={formik.values.deliveryChargeType}
                onChange={value => formik.setFieldValue("deliveryChargeType", value)}
              >
                <Option value="FREE">무료배송</Option>
                <Option value="NOT_FREE">유료배송</Option>
              </Select>

              {formik.touched.deliveryChargeType && formik.errors.deliveryChargeType && (
                <ErrorMessage>{formik.errors.deliveryChargeType}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          {formik.values.deliveryChargeType === "FREE" && (
            <>
              <AttributeDetailNamesContainer>
                <div>
                  초도반품배송비(편도)
                  <RequirdIconSmall />
                </div>
                <div>
                  <InputNumber
                    style={{ width: 200 }}
                    step={100}
                    min={0}
                    name="deliveryChargeOnReturn"
                    value={formik.values.deliveryChargeOnReturn}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={value => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={value => formik.setFieldValue("deliveryChargeOnReturn", value)}
                  />
                  {formik.touched.deliveryChargeOnReturn &&
                    formik.errors.deliveryChargeOnReturn && (
                      <ErrorMessage>{formik.errors.deliveryChargeOnReturn}</ErrorMessage>
                    )}
                </div>
              </AttributeDetailNamesContainer>

              <AttributeDetailNamesContainer>
                <div>
                  반품배송비(편도)
                  <RequirdIconSmall />
                </div>
                <div>
                  <InputNumber
                    style={{ width: 200 }}
                    step={100}
                    min={0}
                    name="returnCharge"
                    value={formik.values.returnCharge}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={value => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={value => formik.setFieldValue("returnCharge", value)}
                  />
                  {formik.touched.returnCharge && formik.errors.returnCharge && (
                    <ErrorMessage>{formik.errors.returnCharge}</ErrorMessage>
                  )}
                </div>
              </AttributeDetailNamesContainer>
            </>
          )}
          {formik.values.deliveryChargeType === "NOT_FREE" && (
            <>
              <AttributeDetailNamesContainer>
                <div>
                  기본배송비
                  <RequirdIconSmall />
                </div>
                <div>
                  <InputNumber
                    style={{ width: 200 }}
                    step={100}
                    min={0}
                    name="deliveryCharge"
                    value={formik.values.deliveryCharge}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={value => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={value => {
                      formik.setFieldValue("deliveryCharge", value)
                    }}
                  />
                  {formik.touched.deliveryCharge && formik.errors.deliveryCharge && (
                    <ErrorMessage>{formik.errors.deliveryCharge}</ErrorMessage>
                  )}
                </div>
              </AttributeDetailNamesContainer>

              <AttributeDetailNamesContainer>
                <div>
                  반품배송비(편도)
                  <RequirdIconSmall />
                </div>
                <div>
                  <InputNumber
                    style={{ width: 200 }}
                    step={100}
                    min={0}
                    name="returnCharge"
                    value={formik.values.returnCharge}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={value => value.replace(/\$\s?|(,*)/g, "")}
                    onChange={value => formik.setFieldValue("returnCharge", value)}
                  />
                  {formik.touched.returnCharge && formik.errors.returnCharge && (
                    <ErrorMessage>{formik.errors.returnCharge}</ErrorMessage>
                  )}
                </div>
              </AttributeDetailNamesContainer>
            </>
          )}

          <AttributeDetailNamesContainer>
            <div>
              출고지
              <RequirdIconSmall />
            </div>
            {formik.values.outbound && (
              <div>
                <p>{`출고지 코드: ${formik.values.outbound.outboundShippingPlaceCode}`}</p>
                <p>{`출고지 이름: ${formik.values.outbound.shippingPlaceName}`}</p>
                {Array.isArray(formik.values.outbound.placeAddresses) &&
                  formik.values.outbound.placeAddresses.map((item, index) => (
                    <div key={index}>
                      <p>{`주소 타입: ${item.addressType}`}</p>
                      <p>{`국가 코드: ${item.countryCode}`}</p>
                      <p>{`전화번호: ${item.companyContactNumber}`}</p>
                      <p>{`우편번호: ${item.returnZipCode}`}</p>
                      <p>{`주소: ${item.returnAddress}`}</p>
                      <p>{`상세주소: ${item.returnAddressDetail}`}</p>
                    </div>
                  ))}
                {Array.isArray(formik.values.outbound.remoteInfo) &&
                  formik.values.outbound.remoteInfos.map((item, index) => (
                    <div key={index}>
                      <p>{`도서산간 배송정보 ID: ${item.remoteInfoId}`}</p>
                      <p>{`택배사 코드: ${item.deliveryCode}`}</p>
                      <p>{`제주 지역 배송비: ${item.jeju}`}</p>
                      <p>{`제주외지역 배송비: ${item.notJeju}`}</p>
                      <p>{`도서산간 배송정보 유효여부: ${item.usable}`}</p>
                    </div>
                  ))}
              </div>
            )}
            {!formik.values.outbound && (
              <ErrorMessage>
                <p>쿠팡에서 출고지를 등록해주세요.</p>
              </ErrorMessage>
            )}
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              반품지
              <RequirdIconSmall />
            </div>
            {formik.values.returnShippingCenter && (
              <div>
                <p>{`반품지 코드: ${formik.values.returnShippingCenter.returnCenterCode}`}</p>
                <p>{`반품지 이름: ${formik.values.returnShippingCenter.shippingPlaceName}`}</p>
                <p>{`택배사 코드: ${formik.values.returnShippingCenter.deliverCode}`}</p>
                <p>{`택배사명: ${formik.values.returnShippingCenter.deliverName}`}</p>
                {Array.isArray(formik.values.returnShippingCenter.placeAddresses) &&
                  formik.values.returnShippingCenter.placeAddresses.map((item, index) => (
                    <div key={index}>
                      <p>{`주소 타입: ${item.addressType}`}</p>
                      <p>{`국가 코드: ${item.countryCode}`}</p>
                      <p>{`전화번호: ${item.companyContactNumber}`}</p>
                      <p>{`우편번호: ${item.returnZipCode}`}</p>
                      <p>{`주소: ${item.returnAddress}`}</p>
                      <p>{`상세주소: ${item.returnAddressDetail}`}</p>
                    </div>
                  ))}
              </div>
            )}
            {!formik.values.returnShippingCenter && (
              <ErrorMessage>
                <p>쿠팡에서 반품지를 등록해주세요.</p>
              </ErrorMessage>
            )}
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              인보이스영수증
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="invoiceDocument"
                value={formik.values.invoiceDocument}
                onChange={formik.handleChange}
              />

              {formik.touched.invoiceDocument && formik.errors.invoiceDocument && (
                <ErrorMessage>{formik.errors.invoiceDocument}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              인당 최대구매수량
              <RequirdIconSmall />
            </div>
            <FlexContainer>
              <InputNumber
                style={{ width: 100 }}
                step={1}
                min={1}
                name="maximumBuyForPersonPeriod	"
                value={formik.values.maximumBuyForPersonPeriod}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => formik.setFieldValue("maximumBuyForPersonPeriod", value)}
              />

              <div>일 동안 1인당 최대</div>
              <InputNumber
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

          <ButtonContainer>
            <Button type="primary" htmlType="submit" className="login-form-button">
              저장
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}

const Cafe24Info = ({ item, refetch }) => {
  const mallID = item ? item.mallID : ""
  const shop_no = item ? item.shop_no : ""
  const password = item ? item.password : ""
  
  const [setCafe24Info] = useMutation(SET_CAFE24_BASIC_INFO)
  const [naverShoppingUpload] = useMutation(NAVERSHOPPING_UPLOAD)
  const [cafe24Sync] = useMutation(CAFE24_SYNC)
  const [cafe24Duplicate] = useMutation(DUPLICATE_PRODUCT_LIST)
  const [cafe24Auto] = useMutation(CAFE24_AUTO)
  const [naverLoading, setNaverLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [duplicateLoading, setDuplicateLoading] = useState(false)
  const [cafe24AutoLoading, setCafe24AutoLoading] = useState(false)

  const formik = useFormik({
    initialValues: {
      mallID,
      shop_no,
      password
    },
    validate: values => {
      const errors = {}
      if (!values.mallID || values.mallID.trim().length === 0) {
        errors.mallID = "몰 아이디를 입력해주세요."
      }
      if (!values.shop_no) {
        errors.shop_no = "멀티쇼핑몰 번호를 입력해주세요."
      }

      if (!values.password || values.password.trim().length === 0) {
        errors.password = "비밀번호를 입력해주세요."
      }

      return errors
    },
    onSubmit: async values => {
      const response = await setCafe24Info({
        variables: {
          mallID: values.mallID,
          password: values.password,
          shop_no: values.shop_no
        }
      })
      if (response.data.SetCafe24BasicInfo) {
        refetch()
        notification["success"]({
          message: "저장 하였습니다."
        })
      } else {
        notification["error"]({
          message: "저장에 실패하였습니다."
        })
      }
    }
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center"
  }

  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={["coupang"]} style={{ marginBottom: "30px" }}>
        <Panel
          header={
            <HeaderContainer>
              <HeaderTitle>카페24</HeaderTitle>
              <RequirdIcon />
            </HeaderContainer>
          }
          key="coupang"
        >
          <AttributeDetailNamesContainer>
            <div>
              몰 아이디
              <RequirdIconSmall />
            </div>
            <div>
              <Input name="mallID" value={formik.values.mallID} onChange={formik.handleChange} />
              {formik.touched.mallID && formik.errors.mallID && (
                <ErrorMessage>{formik.errors.mallID}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              비밀번호
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {formik.touched.password && formik.errors.password && (
                <ErrorMessage>{formik.errors.password}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              멀티쇼핑몰 번호
              <RequirdIconSmall />
            </div>
            <div>
              <InputNumber
                style={{ width: 200 }}
                step={1}
                min={1}
                name="shop_no"
                value={formik.values.shop_no}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={value => value.replace(/\$\s?|(,*)/g, "")}
                onChange={value => formik.setFieldValue("shop_no", value)}
              />
              {formik.touched.shop_no && formik.errors.shop_no && (
                <ErrorMessage>{formik.errors.shop_no}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <ButtonContainer>
          <Button
              danger
              htmlType="button"
              loading={naverLoading}
              onClick={async () => {
                setNaverLoading(true)
                try {
                  await naverShoppingUpload()
                } catch(e){

                } finally {
                  setNaverLoading(false)
                }
                
              }}
            >
              ⓵ 네이버쇼핑, 소이지 상품 카페24로 등록
            </Button>
            <Button
              danger
              htmlType="button"
              loading={syncLoading}
              onClick={async () => {
                setSyncLoading(true)
                try {
                  await cafe24Sync()
                } catch(e){

                } finally {
                  setSyncLoading(false)
                }
                
              }}
            >
              - 카페24 동기화
            </Button>
            <Button
              danger
              htmlType="button"
              loading={duplicateLoading}
              onClick={async () => {
                setDuplicateLoading(true)
                try {
                  await cafe24Duplicate()
                } catch(e){

                } finally {
                  setDuplicateLoading(false)
                }
                
              }}
            >
              ② 카페24 중복 제거
            </Button>
            <Button
              danger
              htmlType="button"
              loading={cafe24AutoLoading}
              onClick={async () => {
                
                setCafe24AutoLoading(true)
                try {
                  await cafe24Auto()
                } catch(e){

                } finally {
                  setCafe24AutoLoading(false)
                }
              }}
            >
              ③ 카페24 마켓 자동 연동 시작
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button">
              저장
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}

const InterParkInfo = ({ item, refetch }) => {
  const userID = item ? item.userID : ""
  const password = item ? item.password : ""
  
  const [setInterParkInfo] = useMutation(SET_INTERPARK_BASIC_INFO)
  const [interparkAuto] = useMutation(INTERPARK_AUTO)

  const formik = useFormik({
    initialValues: {
      userID,
      password
    },
    validate: values => {
      const errors = {}
      if (!values.userID || values.userID.trim().length === 0) {
        errors.userID = "몰 아이디를 입력해주세요."
      }
      if (!values.password || values.password.trim().length === 0) {
        errors.password = "비밀번호를 입력해주세요."
      }

      return errors
    },
    onSubmit: async values => {
      const response = await setInterParkInfo({
        variables: {
          userID: values.userID,
          password: values.password
        }
      })
      if (response.data.SetInterParkBasicInfo) {
        refetch()
        notification["success"]({
          message: "저장 하였습니다."
        })
      } else {
        notification["error"]({
          message: "저장에 실패하였습니다."
        })
      }
    }
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center"
  }

  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={["interpark"]} style={{ marginBottom: "30px" }}>
        <Panel
          header={
            <HeaderContainer>
              <HeaderTitle>인터파크</HeaderTitle>
              <RequirdIcon />
            </HeaderContainer>
          }
          key="interpark"
        >
          <AttributeDetailNamesContainer>
            <div>
              몰 아이디
              <RequirdIconSmall />
            </div>
            <div>
              <Input name="userID" value={formik.values.userID} onChange={formik.handleChange} />
              {formik.touched.userID && formik.errors.userID && (
                <ErrorMessage>{formik.errors.userID}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <AttributeDetailNamesContainer>
            <div>
              비밀번호
              <RequirdIconSmall />
            </div>
            <div>
              <Input
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
              />
              {formik.touched.password && formik.errors.password && (
                <ErrorMessage>{formik.errors.password}</ErrorMessage>
              )}
            </div>
          </AttributeDetailNamesContainer>

          <ButtonContainer>
            <Button
              danger
              htmlType="button"
              onClick={async () => {
                await interparkAuto()
              }}
            >
              ④ 인터파크 해외구매대행 자동 연동 시작
            </Button>
            <Button type="primary" htmlType="submit" className="login-form-button">
              저장
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}

const Container = styled.div`
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

const AttributeDetailNamesContainer = styled.div`
  display: flex;
  /* align-items: center; */

  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 180px;
    max-width: 180px;
    text-align: right;
    margin-right: 20px;
    margin-top: 4px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
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

const RequirdIconSmall = styled.div`
  display: inline-block;
  background-color: #ff545c;
  border-radius: 50%;
  vertical-align: middle;
  height: 4px;
  width: 4px;
  margin-left: 5px;
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const ErrorMessage = styled.div`
  color: #ff545c;
  font-size: 13px;
`

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(n) {
    margin-right: 10px;
  }
`
