import React, { useState, useEffect } from "react"
import styled from "styled-components"
import {
  Modal,
  Checkbox,
  Collapse,
  Select,
  message,
  Popconfirm,
  Input,
  Divider,
  InputNumber,
} from "antd"
import { EditOutlined } from "@ant-design/icons"
import { useMutation } from "@apollo/client"
import { UPLOAD_IMAGE } from "../../../gql"
const { Panel } = Collapse
const { Option } = Select

const OptionModal = ({
  notFree = false,
  USA,
  iHerb,
  isModalVisible,
  handleOk,
  handleCancel,
  option = [],
  prop = [],
  exchange,
  marginInfo,
  shippingWeightInfo,
}) => {
  const [options, setOptions] = useState(option)
  const [props, setProps] = useState(prop)

  const [visible, setVisible] = useState(false)
  const [mainImage, setMainImage] = useState("")
  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  useEffect(() => {
    console.log("여기 언제 타냐?111")
    if (shippingWeightInfo && shippingWeightInfo.length > 0) {
      setOptions(
        option.map((item) => {
          console.log("언제타냐 ㅑㅅ드", item)
          return {
            ...item,
            weight: item.weight ? item.weight : 1,
            weightPrice: item.weightPrice
              ? item.weightPrice
              : Number(
                  shippingWeightInfo.map((item) => item).sort((a, b) => a.title - b.title)[0].price
                ),
            salePrice: item.salePrice ? item.salePrice : getSalePrice(item.price, notFree ? 0 : 1),
          }
        })
      )
    }
  }, [option, shippingWeightInfo])

  useEffect(() => {
    console.log("여기 언제 타냐?222")
    setProps(
      prop.map((item) => {
        return {
          ...item,
          values: item.values.map((vItem) => {
            return {
              ...vItem,
              disabled: false,
            }
          }),
        }
      })
    )
  }, [prop])

  const handleOkButton = () => {
    console.log("handleOkButton", options)
    handleOk(options, props)
  }

  const handleChange1 = (index, e) => {
    const temp = props
    temp[index].korTypeName = e.target.value
    setProps([...temp])
  }

  const handleChange2 = (index, subIndex, e) => {
    console.log("index, subIndex", index, subIndex)
    const temp = props

    const propPath = `${temp[index].pid}:${temp[index].values[subIndex].vid}`
    temp[index].values[subIndex].korValueName = e.target.value
    console.log("propPath", propPath)
    setProps([...temp])

    let optionTemp = options.map((item) => {
      const tempAttribute = item.attributes.map((att, i) => {
        return {
          ...att,
          attributeValueName:
            item.propPath.includes(propPath) && index === i
              ? e.target.value
              : att.attributeValueName,
        }
      })

      let korValue = ""
      for (const attr of tempAttribute) {
        korValue += attr.attributeValueName + " "
      }
      // item.korValue = korValue.trim()
      console.log("korValue", korValue.trim())
      return {
        ...item,
        attributes: tempAttribute,
        korValue: korValue.trim(),
      }
    })

    // let optionTemp = options
    // for(const item of optionTemp){
    //   console.log("item---", item)
    //   if(item.propPath.includes(propPath)) {
    //     item.attributes[index].attributeValueName = e.target.value
    //   }
    //   let korValue = ""
    //   for(const attr of item.attributes){
    //     korValue += attr.attributeValueName + ' '
    //   }
    //   item.korValue = korValue.trim()

    // }
    setOptions(optionTemp)
  }

  const handleImageOK = (index, subIndex, image) => {
    const temp = props
    temp[index].values[subIndex].image = image
    console.log("temp", temp)
    setProps([...temp])
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = async () => {
      const response = await uploadImage({
        variables: {
          base64Image: reader.result,
        },
      })

      setMainImage(response.data.UploadImage)
    }
  }

  const getOptionName = (item) => {
    let optionName = ""
    for (const attr of item.attributes) {
      optionName += `${attr.attributeValueName} `
    }
    return optionName.trim()
  }

  const addPriceCalc = (wian, weightPrice, margin) => {
    const addPrice = -(
      ((exchange * margin + 11 * exchange) * Number(wian) +
        weightPrice * margin +
        11 * weightPrice) /
      (margin - 89)
    )
    return addPrice
  }

  const getSalePrice = (wian, shippingWeight) => {
    if (shippingWeightInfo.length === 0) {
      return
    }
    let weightPrice = 0
    let shippingArr = shippingWeightInfo.filter((item) => item.title >= shippingWeight)
    if (shippingArr.length > 0) {
      weightPrice = shippingArr[0].price
    } else {
      weightPrice = shippingWeightInfo[shippingWeightInfo.length - 1].price
    }
    let margin = 30
    let marginArr = marginInfo.filter((fItem) => fItem.title >= Number(wian))

    if (marginArr.length > 0) {
      margin = marginArr[0].price
    } else {
      margin = marginInfo[marginInfo.length - 1].price
    }
    let addPrice = addPriceCalc(wian, notFree ? 0 : weightPrice, margin)
    let salePrice =
      Math.ceil((Number(wian) * Number(exchange) + Number(addPrice) + Number(weightPrice)) * 0.1) *
      10

    return salePrice
  }
  const handleChange = (value) => {
    // setShppingPrice(index, value)
    const weightPriceTemp = shippingWeightInfo.filter((item) => item.title === value)
    const temp = options
    temp.map((item) => {
      item.weight = Number(value)
      item.weightPrice = Number(weightPriceTemp[0].price)
      item.salePrice = getSalePrice(item.price, Number(value))
    })
    setOptions([...temp])
  }

  const handleWeightChange = (index, value) => {
    const weightPriceTemp = shippingWeightInfo.filter((item) => item.title === value)
    const temp = options
    temp[index].weight = value
    temp[index].weightPrice = Number(weightPriceTemp[0].price)
    temp[index].salePrice = getSalePrice(temp[index].price, Number(value))
    setOptions([...temp])
  }
  const handleStockChange = (index, value) => {
    const temp = options
    temp[index].stock = value
    setOptions([...temp])
  }
  const handlePriceChange = (index, value) => {
    const temp = options
    temp[index].price = value
    temp[index].salePrice = getSalePrice(value, temp[index].weight)
    setOptions([...temp])
  }

  const handlePropCheckChange = (index, subIndex, checked) => {
    props[index].values[subIndex].disabled = !checked
    const propPath = `${props[index].pid}:${props[index].values[subIndex].vid}`
    const temp = options
    for (const item of temp) {
      // console.log("item.propPath", item.propPath)
      if (item.propPath.includes(propPath)) {
        item.active = checked
      }
    }
    setOptions([...temp])
  }

  const handleDisaledChange = (index, checked) => {
    const temp = options
    temp[index].disabled = !checked
    setOptions([...temp])
  }

  const handleSalePriceChange = (index, value) => {
    const temp = options
    temp[index].salePrice = value
    setOptions([...temp])
  }

  return (
    <Modal
      maskClosable={false}
      title="옵션 설정"
      visible={isModalVisible}
      onOk={handleOkButton}
      onCancel={handleCancel}
      width={1000}
    >
      <ModalContainer>
        <Divider
          orientation="left"
          style={{ color: "#512da8", fontWeight: "700", fontSize: "18px" }}
          dashed={true}
        >
          옵션 구성
        </Divider>
        {props.map((item, index) => {
          return (
            <Collapse
              key={item.pid}
              style={{ marginBottom: "5px" }}
              expandIconPosition="right"
              // collapsible="header"
            >
              <Panel
                header={
                  <Input
                    style={{ width: "200px" }}
                    value={item.korTypeName}
                    onChange={(e) => handleChange1(index, e)}
                  />
                }
              >
                <OptionSubTitleContainer>
                  <div></div>
                  <div>이미지</div>
                  <div>옵션명</div>
                </OptionSubTitleContainer>
                {item.values.map((value, subIndex) => {
                  return (
                    <OptionSubItemContainer key={value.vid}>
                      <Checkbox
                        checked={!value.disabled}
                        onChange={(e) => handlePropCheckChange(index, subIndex, e.target.checked)}
                      />
                      {value.image && (
                        <MainImageWrapper>
                          <OptionImage
                            src={
                              value.image && value.image.includes("http")
                                ? value.image
                                : `https:${value.image}`
                            }
                          />
                          <Modal
                            title="이미지 변경"
                            visible={visible}
                            onOk={() => {
                              handleImageOK(index, subIndex, mainImage)
                              setVisible(false)
                            }}
                            onCancel={() => setVisible(false)}
                          >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <ConfirmMainImage src={mainImage} />
                            </div>
                            <input type="file" onChange={handleFileChange} />
                            <Input
                              placeholder={"이미지 URL만 입력하세요."}
                              allowClear={true}
                              value={mainImage}
                              onChange={(e) => setMainImage(e.target.value)}
                            />
                          </Modal>
                          <MainImageModifyContianer className={"modify"}>
                            <div
                              className={"modify"}
                              style={{ cursor: "pointer", textAlign: "center" }}
                              onClick={() => {
                                setMainImage(
                                  value.image && value.image.includes("http")
                                    ? value.image
                                    : `https:${value.image}`
                                )
                                setVisible(true)
                              }}
                            >
                              <EditOutlined
                                className={"modify"}
                                style={{ color: "white", fontSize: "20px" }}
                              />
                            </div>
                          </MainImageModifyContianer>
                        </MainImageWrapper>
                      )}
                      {!value.image && (
                        <MainImageWrapper>
                          <EmptyImage />
                          <Modal
                            title="이미지 변경"
                            visible={visible}
                            onOk={() => {
                              handleImageOK(index, subIndex, mainImage)
                              setVisible(false)
                            }}
                            onCancel={() => setVisible(false)}
                          >
                            <div style={{ display: "flex", justifyContent: "center" }}>
                              <ConfirmMainImage src={mainImage} />
                            </div>
                            <input type="file" onChange={handleFileChange} />
                            <Input
                              placeholder={"이미지 URL만 입력하세요."}
                              allowClear={true}
                              value={mainImage}
                              onChange={(e) => setMainImage(e.target.value)}
                            />
                          </Modal>
                          <MainImageModifyContianer className={"modify"}>
                            <div
                              className={"modify"}
                              style={{ cursor: "pointer", textAlign: "center" }}
                              onClick={() => {
                                setMainImage(
                                  value.image && value.image.includes("https")
                                    ? value.image
                                    : `https:${value.image}`
                                )
                                setVisible(true)
                              }}
                            >
                              <EditOutlined
                                className={"modify"}
                                style={{ color: "white", fontSize: "20px" }}
                              />
                            </div>
                          </MainImageModifyContianer>
                        </MainImageWrapper>
                      )}
                      <OptionNameContainer>
                        <OptionLengthLabel>{`${value.korValueName.length}/25`}</OptionLengthLabel>
                        <Input
                          value={value.korValueName}
                          onChange={(e) => handleChange2(index, subIndex, e)}
                        />
                      </OptionNameContainer>
                    </OptionSubItemContainer>
                  )
                })}
              </Panel>
            </Collapse>
          )
        })}
        <Divider
          orientation="left"
          style={{ color: "#512da8", fontWeight: "700", fontSize: "18px", marginTop: "40px" }}
          dashed={true}
        >
          옵션 상세
        </Divider>
        {shippingWeightInfo.length > 0 && (
          <ShippingWeightContainer>
            <div>무게(배송비)</div>
            {!USA && (
              <Select
                size="large"
                bordered={false}
                defaultValue={`${
                  shippingWeightInfo[0].title
                }Kg (${shippingWeightInfo[0].price.toLocaleString("ko")}원)`}
                style={{ width: 180, border: "3px solid #512da8" }}
                onChange={handleChange}
              >
                {shippingWeightInfo
                  .map((item) => item)
                  .sort((a, b) => a.title - b.title)
                  .map((item, index) => (
                    <Option value={item.title}>{`${item.title}Kg (${item.price.toLocaleString(
                      "ko"
                    )}원)`}</Option>
                  ))}
              </Select>
            )}
            {USA && (
              <Select
                disabled={iHerb}
                size="large"
                bordered={false}
                defaultValue={`${shippingWeightInfo[0].title}LB (${Number(
                  shippingWeightInfo[0].price
                ).toLocaleString("ko")}원)`}
                style={{ width: 180, border: "3px solid #512da8" }}
                onChange={handleChange}
              >
                {shippingWeightInfo
                  .map((item) => item)
                  .sort((a, b) => a.title - b.title)
                  .map((item, index) => (
                    <Option value={item.title}>{`${item.title}LB (${Number(
                      item.price
                    ).toLocaleString("ko")}원)`}</Option>
                  ))}
              </Select>
            )}
          </ShippingWeightContainer>
        )}
        <OptionItemHeaderContainer>
          <div></div>
          <div>옵션명</div>
          <div>재고</div>
          <div>{USA ? (iHerb ? "원가" : "달러") : "위안"}</div>
          <div>무게</div>
          <div>판매가</div>
        </OptionItemHeaderContainer>
        {options
          .filter((item) => item.active)
          .map((item, index) => {
            return (
              <OptionItemContainer key={index}>
                <Checkbox
                  checked={!item.disabled}
                  onChange={(e) => handleDisaledChange(index, e.target.checked)}
                />
                <div>
                  {getOptionName(item)}
                  {/* {item.korValue} */}
                </div>
                <InputNumber
                  value={item.stock}
                  min={0}
                  onChange={(value) => handleStockChange(index, value)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
                {/* <div style={{textAlign: "center"}}>
              {item.price}
            </div> */}
                <InputNumber
                  value={item.price}
                  min={0}
                  onChange={(value) => handlePriceChange(index, value)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
                {shippingWeightInfo.length > 0 && !USA && (
                  <Select
                    size="middle"
                    bordered={false}
                    value={`${item.weight}Kg ${item.weightPrice.toLocaleString("ko")}원`}
                    style={{ width: 180, border: "3px solid #512da8" }}
                    onChange={(value) => handleWeightChange(index, value)}
                  >
                    {shippingWeightInfo
                      .map((item) => item)
                      .sort((a, b) => a.title - b.title)
                      .map((item, index) => (
                        <Option value={item.title}>{`${item.title}Kg (${item.price.toLocaleString(
                          "ko"
                        )}원)`}</Option>
                      ))}
                  </Select>
                )}
                {shippingWeightInfo.length > 0 && USA && (
                  <Select
                    disabled={iHerb}
                    size="middle"
                    bordered={false}
                    value={`${item.weight}LB ${item.weightPrice.toLocaleString("ko")}원`}
                    style={{ width: 180, border: "3px solid #512da8" }}
                    onChange={(value) => handleWeightChange(index, value)}
                  >
                    {shippingWeightInfo
                      .map((item) => item)
                      .sort((a, b) => a.title - b.title)
                      .map((item, index) => (
                        <Option value={item.title}>{`${item.title}LB (${Number(
                          item.price
                        ).toLocaleString("ko")}원)`}</Option>
                      ))}
                  </Select>
                )}
                <InputNumber
                  value={
                    item.salePrice
                      ? item.salePrice
                      : getSalePrice(item.price, notFree ? 0 : item.weight)
                  }
                  min={100}
                  step={100}
                  onChange={(value) => handleSalePriceChange(index, value)}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                />
              </OptionItemContainer>
            )
          })}
      </ModalContainer>
    </Modal>
  )
}

export default OptionModal

const ModalContainer = styled.div`
  min-height: 600px;
  max-height: 600px;
  overflow: auto;
`
const OptionSubTitleContainer = styled.div`
  height: 36px;
  text-align: center;
  background: #512da8;
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  & > :nth-child(1) {
    min-width: 20px;
    max-width: 20px;
  }
  & > :nth-child(2) {
    min-width: 100px;
    max-width: 100px;
    margin-left: 10px;
    margin-right: 10px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
`

const OptionSubItemContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(1) {
    min-width: 20px;
    max-width: 20px;
  }
  & > :nth-child(2) {
    min-width: 100px;
    max-width: 100px;
  }
  & > :nth-child(3) {
    width: 100%;
  }
`

const OptionImage = styled.img`
  width: 100px;
`
const EmptyImage = styled.div`
  min-width: 100px;
  min-height: 100px;
  background: lightgray;
`
const ConfirmMainImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 5px;
  margin-bottom: 10px;
`

const MainImageModifyContianer = styled.div`
  opacity: 0;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 3px;
  height: 40px;
  background: #512da8;
  color: white;
  display: flex;
  align-items: center;
  z-index: 10;
  & > :nth-child(n) {
    flex: 1;
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

const OptionItemContainer = styled.div`
  display: flex;
  align-items: center;
  border-top: 1px dashed #ebebeb;
  margin-bottom: 5px;

  & > :nth-child(1) {
    min-width: 20px;
    max-width: 20px;
  }
  & > :nth-child(2) {
    margin-left: 5px;
    width: 100%;
  }
  & > :nth-child(3) {
    margin-left: 5px;
    min-width: 100px;
    max-width: 100px;
  }
  & > :nth-child(4) {
    margin-left: 5px;
    min-width: 100px;
    max-width: 100px;
  }
  & > :nth-child(5) {
    margin-left: 10px;
    min-width: 130px;
    max-width: 130px;
  }
  & > :nth-child(6) {
    margin-left: 15px;
    min-width: 100px;
    max-width: 100px;
  }
`

const OptionItemHeaderContainer = styled(OptionItemContainer)`
  height: 40px;
  background: #512da8;
  color: white;
  border: none;
  justify-content: center;
  text-align: center;
`

const OptionNameContainer = styled.div`
  margin-left: 10px;
`

const OptionLengthLabel = styled.div`
  text-align: right;
  margin-bottom: 5px;
`

const ShippingWeightContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: -3px;
  & > :nth-child(1) {
    min-width: 100px;
    max-width: 100px;
  }
`
