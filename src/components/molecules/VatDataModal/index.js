import React, {useEffect, useState } from 'react'
import {Modal, Card, Form, Input, Button, Divider, DatePicker, TimePicker, Segmented, Switch, notification} from "antd"
import { useQuery, useMutation } from "@apollo/client"
import { GET_MARKET_ORDER, GET_DELIVERY_ORDER, GET_TAOBAO_ORDER, SET_MARKET_ORDER, SET_DELIVERY_ORDER, SET_TAOBAO_ORDER } from "gql"
import styled from "styled-components"
import { MinusCircleOutlined, PlusOutlined, RedoOutlined} from '@ant-design/icons'
import _ from "lodash"
import moment from 'moment';


const VatDataModal = ({userID, orderId, isModalVisible, handleOk, handleCancel}) => {
  
  const [orderID, setOrderID ] = useState(orderId)
  const [taobaoOrderNo, setTaobaoOrderNo] = useState([])
  const [marketOrderFields, setMarketOrderFields] = useState([])
  const [deliveryOrderFields, setDeliveryOrderFields] = useState([])
  const [taobaoOrderFields, setTaobaoOrderFields] = useState([])
 
  useEffect(() => {
    setOrderID(orderId)
  }, [orderId])

  const {refetch: marketRefetch} = useQuery(GET_MARKET_ORDER, {
    variables: {
      orderId: orderID,
      userID
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      
      setMarketOrderFields([
        {
          name: "market",
          value: data.GetMarketOrder.market
        },
        {
          name: "orderId",
          value: data.GetMarketOrder.orderId
        },
        {
          name: "cafe24OrderID",
          value: data.GetMarketOrder.cafe24OrderID
        },
        {
          name: "orderer.name",
          value: data.GetMarketOrder.orderer.name
        },
        {
          name: "orderer.email",
          value: data.GetMarketOrder.orderer.email
        },
        {
          name: "orderer.tellNumber",
          value: data.GetMarketOrder.orderer.tellNumber
        },
        {
          name: "orderer.hpNumber",
          value: data.GetMarketOrder.orderer.hpNumber
        },
        {
          name: "orderer.orderDate",
          value: moment(data.GetMarketOrder.orderer.orderDate, "YYYY-MM-DD")
        },
        {
          name: "orderer.orderTime",
          value: moment(data.GetMarketOrder.orderer.orderTime, "HH:mm:SS")
        },
        {
          name: "paidAtDate",
          value: moment(data.GetMarketOrder.paidAtDate, "YYYY-MM-DD")
        },
        {
          name: "paidAtTime",
          value: moment(data.GetMarketOrder.paidAtTime, "HH:mm:SS")
        },
        {
          name: "shippingPrice",
          value: data.GetMarketOrder.shippingPrice
        },
        {
          name: "receiver.name",
          value: data.GetMarketOrder.receiver.name
        },
        {
          name: "receiver.tellNumber",
          value: data.GetMarketOrder.receiver.tellNumber
        },
        {
          name: "receiver.hpNumber",
          value: data.GetMarketOrder.receiver.hpNumber
        },
        {
          name: "receiver.addr",
          value: data.GetMarketOrder.receiver.addr
        },
        {
          name: "receiver.postCode",
          value: data.GetMarketOrder.receiver.postCode
        },
        {
          name: "receiver.parcelPrintMessage",
          value: data.GetMarketOrder.receiver.parcelPrintMessage
        },
        {
          name: "orderItems",
          value: data.GetMarketOrder.orderItems.map(item => {
            return {
              title: item.title,
              option: item.option,
              quantity: item.quantity,
              salesPrice: item.salesPrice,
              orderPrice: item.orderPrice,
              discountPrice: item.discountPrice,
              sellerProductName: item.sellerProductName,
              productId: item.productId,
              vendorItemId: item.vendorItemId,
              deliveryOrderId: item.deliveryOrderId,
            }
          }),
        },
        {
          name: "overseaShippingInfoDto.personalCustomsClearanceCode",
          value: data.GetMarketOrder.overseaShippingInfoDto.personalCustomsClearanceCode
        },
        {
          name: "overseaShippingInfoDto.ordererPhoneNumber",
          value: data.GetMarketOrder.overseaShippingInfoDto.ordererPhoneNumber
        },
        {
          name: "overseaShippingInfoDto.ordererName",
          value: data.GetMarketOrder.overseaShippingInfoDto.ordererName
        },
        {
          name: "saleType",
          value: data.GetMarketOrder.saleType
        },
        {
          name: "deliveryCompanyName",
          value: data.GetMarketOrder.deliveryCompanyName
        },
        {
          name: "invoiceNumber",
          value: data.GetMarketOrder.invoiceNumber
        },
        {
          name: "deliveryOrderId",
          value: data.GetMarketOrder.deliveryOrderId
        },
      ])
      
    },
  })

  const {refetch: deliveryRefetch} = useQuery(GET_DELIVERY_ORDER, {
    variables: {
      orderId: orderID,
      userID
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {

      let taobaoOrderNumberTemp = []
      setDeliveryOrderFields([
        {
          name: "deliveryInfo",
          value: data.GetDeliveryOrder.map(item => {
            return {
              orderSeq: item.orderSeq,
              orderNo: item.orderNo,
              name: item.name,
              hp: item.hp,
              address: item.address,
              zipCode: item.zipCode,
              PCCode: item.PCCode,
              status: item.status,
              shippingNumber: item.shippingNumber,
              shippingPrice: item.shippingPrice,
              weight: item.weight,
              isDelete: item.isDelete,
              orderItems: item.orderItems.map(orderItem => {
                if(!taobaoOrderNumberTemp.includes(orderItem.taobaoOrderNo)){
                  taobaoOrderNumberTemp.push(orderItem.taobaoOrderNo)
                }
                return {
                  orderId: orderItem.orderId,
                  taobaoOrderNo: orderItem.taobaoOrderNo,
                  taobaoTrackingNo: orderItem.taobaoTrackingNo
                }
              })
            }
          })
        }
      ])

      setTaobaoOrderNo(taobaoOrderNumberTemp)

    },
  })

  const {refetch: taobaoRefetch} = useQuery(GET_TAOBAO_ORDER, {
    variables: {
      taobaoOrderNo,
      userID
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      console.log("GET_TAOBAO_ORDER", data)
      setTaobaoOrderFields([
        {
          name: "taobaoInfo",
          value: data.GetTaobaoOrder.map(item => {
            return {
              orderNumber: item.orderNumber,
              orderDate: moment(item.orderDate, "YYYY-MM-DD"),
              orderTime: moment(item.orderTime, "HH:mm:SS"),
              purchaseAmount: item.purchaseAmount,
              shippingFee: item.shippingFee,
              orders: item.orders.filter(fItem => fItem.realPrice !== "0.00").map(orderItem => {
                return {
                  detail: orderItem.detail,
                  id: orderItem.id,
                  originalPrice: orderItem.originalPrice,
                  productName: orderItem.productName,
                  quantity: orderItem.quantity,
                  realPrice: orderItem.realPrice,
                  skuId: orderItem.skuId,
                  thumbnail: orderItem.thumbnail,
                  option: orderItem.option.map(optionItem => {
                    return {
                      name: optionItem.name,
                      value: optionItem.value,
                      visible: optionItem.visible
                    }
                  })
                }
              })
            }
          })
        }
      ])
    }
  })

  // console.log("data--->>", data)
  return (
    <Modal
    title={orderId}
    style={{minWidth: "90%", overflowX: "hidden", padding: 0}}
    visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}
    >
      <FormContainer >
        {marketOrderFields.length > 0 &&
        <Card type="inner" title="마켓 주문정보" hoverable bordered={false}
          style={ { background: "#f5f5f5" }}
          extra={<Button type="primary" shape="circle" icon={<RedoOutlined />} onClick={() => marketRefetch()} />}
        >
        <MarketOrderForm 
          refetch={marketRefetch}
          userID={userID}
          orderID={orderId}
          fields={marketOrderFields}
          onChange={(newFields) => {
            setMarketOrderFields(newFields)
          }}
        />
        </Card>}
        <Card type="inner" title="배대지 주문서" hoverabl
        extra={<Button type="primary" shape="circle" icon={<RedoOutlined />} onClick={() => deliveryRefetch()} />}
        e>
        <DeliveryOrderForm
          refetch={deliveryRefetch}
          userID={userID}
          fields={deliveryOrderFields}
          marketOrderFields={marketOrderFields}
          onChange={(newFields) => {
            setDeliveryOrderFields(newFields)
          }}
        />
        </Card>

        <Card type="inner" title="공급처 주문서" hoverable
        style={ { background: "#f5f5f5" }}
        extra={<Button type="primary" shape="circle" icon={<RedoOutlined />} onClick={() => taobaoRefetch()} />}
        >
        <TaobaoOrderForm
          refetch={taobaoRefetch}
          userID={userID}
          fields={taobaoOrderFields}
          deliveryOrderFields={deliveryOrderFields}
          onChange={(newFields) => {
            setTaobaoOrderFields(newFields)
          }}
        />
        </Card>
        
      </FormContainer>
    </Modal>
  )
}

export default VatDataModal 
 
const FormContainer = styled.div`
  display: flex;    

  & > :nth-child(n) {
    width: 100%;
  }                                                                   
`

const MarketOrderForm = ( {refetch, orderID, userID, onChange, fields}) => {
  
  const [setMarketOrder] = useMutation(SET_MARKET_ORDER)
  const onFinish = async(values) => {
    console.log('Success:', values);
   
    try {
      const response = await setMarketOrder({
        variables: {
          orderId: orderID,
          userID,
          input: {
            market: values.market,
            orderId: values.orderId,
            cafe24OrderID: values.cafe24OrderID,
            orderer: {
              name: values["orderer.name"],
              email: values["orderer.email"],
              tellNumber: values["orderer.tellNumber"],
              hpNumber: values["orderer.hpNumber"],
              orderDate: moment(values["orderer.orderDate"]).format("YYYYMMDD"),
              orderTime: moment(values["orderer.orderTime"]).format("HHmmSS"),
            },
            paidAtDate: moment(values.paidAtDate).format("YYYYMMDD"),
            paidAtTime: moment(values.paidAtTime).format("HHmmSS"),
            shippingPrice: values.shippingPrice,
            receiver: {
              name: values["receiver.name"],
              tellNumber: values["receiver.tellNumber"],
              hpNumber: values["receiver.hpNumber"],
              addr: values["receiver.addr"],
              postCode: values["receiver.postCode"],
              parcelPrintMessage: values["receiver.parcelPrintMessage"],
            },
            orderItems: values.orderItems.filter(fItem => fItem.orderPrice).map(item => {
              return {
                title: item.title,
                option: item.option,
                quantity: Number(item.quantity) || 0,
                salesPrice: Number(item.salesPrice) || 0,
                orderPrice: Number(item.orderPrice) || 0,
                discountPrice: Number(item.discountPrice) || 0,
                sellerProductName: item.sellerProductName,
                productId: item.productId,
                vendorIteId: item.vendorIteId,
                deliveryOrderId: item.deliveryOrderId
              }
            }),
            overseaShippingInfoDto: {
              personalCustomsClearanceCode: values["overseaShippingInfoDto.personalCustomsClearanceCode"],
              ordererPhoneNumber: values["overseaShippingInfoDto.ordererPhoneNumber"],
              ordererName: values["overseaShippingInfoDto.ordererName"],
            },
            saleType: Number(values.saleType),
            deliveryCompanyName: values.deliveryCompanyName,
            invoiceNumber: values.invoiceNumber,
            deliveryOrderId: values.deliveryOrderId,
          }
        }
      })
      console.log("response--", response)
      if(response && response.data.SetMarketOrder) {
        notification["success"]({
          message: '마켓 주문정보 저장 성공',
        })
        refetch()
      } else {
        notification["error"]({
          message: '마켓 주문정보 저장 실패',
        })
      }
      
    } catch(e) {
      notification["error"]({
        message: '마켓 주문정보 저장 실패',
        description: e
      });
      
    }
    
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo)
    try {
      notification["error"]({
        message: '마켓 주문정보 저장 실패',
        description: errorInfo.errorFields[0].errors[0]
      });
    } catch(e){}
  }

  return (
    <Form 
      name="MarketOrder"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      fields={fields}
      onFieldsChange={(_, allFields) => {
        onChange(allFields)
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      scrollToFirstError={true}
    >
      <Form.Item
        label="마켓"
        name="market"
        >
        <Input />
      </Form.Item>

      <Form.Item
        label="마켓 주문번호"
        name="orderId"
        required
        >
        <Input />
      </Form.Item>

      <Form.Item
        label="카페24 주문번호"
        name="cafe24OrderID"
        
        >
        <Input />
      </Form.Item>

      <Divider>주문자 정보</Divider>
        
        <Form.Item
          label="주문자명"
          name="orderer.name"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="주문자 이메일"
          name="orderer.email"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="주문자 전화번호"
          name="orderer.tellNumber"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="주문자 핸드폰번호"
          name="orderer.hpNumber"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="주문자 주문일"
          name="orderer.orderDate"
          >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label="주문자 주문시간"
          name="orderer.orderTime"
          >
          <TimePicker format="HH:mm:ss" />
        </Form.Item>

      <Divider />

      <Form.Item
        label="결제일"
        name="paidAtDate"
        >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item
        label="결제시간"
        name="paidAtTime"
        >
        <TimePicker format="HH:mm:ss" />
      </Form.Item>

      <Form.Item
        label="배송비"
        name="shippingPrice"
        >
        <Input />
      </Form.Item>

      <Divider>수취인 정보</Divider>

        <Form.Item
          label="수취인 이름"
          name="receiver.name"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="수취인 전화번호"
          name="receiver.tellNumber"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="수취인 핸드폰번호"
          name="receiver.hpNumber"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="수취인 주소"
          name="receiver.addr"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="수취인 우편번호"
          name="receiver.postCode"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="배송 메시지"
          name="receiver.parcelPrintMessage"
          >
          <Input />
        </Form.Item>

      <Divider />

      
      <Form.List name="orderItems">
        {(orderFields, {add, remove}) => (
          <div  style={{display: "flex", justifyContent: "center"}}>
            <div style={{width: "80%", }}>
            { orderFields.map((orderField, index) => {
               return  (
                <div key={orderField.key} >
                  <RemoveItemContainer>
                    <Divider>{`주문 상품 (${orderField.key + 1})`}
                    </Divider>
                    <MinusCircleOutlined onClick={() => remove(orderField.name)} />
                  </RemoveItemContainer>
                  <Form.Item
                    required
                    label="주문 상품명"
                    name={[orderField.name, 'title']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="주문 옵션"
                    name={[orderField.name, 'option']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    required
                    label="주문 수량"
                    name={[orderField.name, 'quantity']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    required
                    label="상품 가격"
                    name={[orderField.name, 'salesPrice']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    required
                    label="결제 가격"
                    name={[orderField.name, 'orderPrice']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="할인 가격"
                    name={[orderField.name, 'discountPrice']}
                    >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    label="sellerProductName"
                    name={[orderField.name, 'sellerProductName']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="productId"
                    name={[orderField.name, 'productId']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="vendorItemId"
                    name={[orderField.name, 'vendorItemId']}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="배대지 주문번호"
                    name={[orderField.name, 'deliveryOrderId']}
                    >
                    <Input />
                  </Form.Item>


                  </div>
                )
            })}

              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                주문상품 추가
              </Button>
            </div>
          </div>
        )}
        
      </Form.List>

      <Divider>해외배송정보</Divider>
        <Form.Item
          label="개인통관번호"
          name="overseaShippingInfoDto.personalCustomsClearanceCode"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="통관번호용 핸드폰번호"
          name="overseaShippingInfoDto.ordererPhoneNumber"
          >
          <Input />
        </Form.Item>
        <Form.Item
          label="통관용 구매자"
          name="overseaShippingInfoDto.ordererName"
          >
          <Input />
        </Form.Item>
        <Divider />

        <Form.Item
          label="판매 상태"
          name="saleType"
          >
          <Segmented options={[
            {
              label: "주문",
              value: "1"
            },
            {
              label: "취소",
              value: "2"
            },
            {
              label: "반품",
              value: "3"
            },
          ]}/>
        </Form.Item>

        <Form.Item
          required
          label="택배사"
          name="deliveryCompanyName"
          rules={[{ required: true, message: '택배사를 입력해주세요!!' }]}
          >
          <Input />
        </Form.Item>

        <Form.Item
          label="송장번호"
          name="invoiceNumber"
          >
          <Input />
        </Form.Item>

        <Form.Item
          label="배대지 주문번호"
          name="deliveryOrderId"
          >
          <Input />
        </Form.Item>

    
      <Divider />

      <Form.Item
        wrapperCol={{
          offset: 0,
          span: 24,
        }}
      >
        <Button size="large" block type="primary" htmlType="submit">
          저장
        </Button>
      </Form.Item>

    </Form>
  )
}

const DeliveryOrderForm = ( {refetch, userID, onChange, fields, index, marketOrderFields}) => {
  const [setDeliveryOrder] = useMutation(SET_DELIVERY_ORDER)

  const onFinish = async(values) => {
    console.log('Success:', values);
    try {

     
      const response = await setDeliveryOrder({
        variables: {
          userID,
          input: values.deliveryInfo.map(item => {
            return {
              orderSeq: item.orderSeq,
              orderNo: item.orderNo,
              status: item.status,
              address: item.address,
              zipCode: item.zipCode,
              name: item.name,
              hp: item.hp,
              PCCode: item.PCCode,
              orderItems: item.orderItems.map(orderItem => {
                return {
                  taobaoTrackingNo: orderItem.taobaoTrackingNo,
                  taobaoOrderNo: orderItem.taobaoOrderNo,
                  orderId: orderItem.orderId
                }
              }),
              weight: Number(item.weight),
              shippingPrice: Number(item.shippingPrice),
              shippingNumber: item.shippingNumber,
              isDelete: item.isDelete ? true: false
            }
          })
        }
      })
      console.log("response--", response)
      if(response && response.data.SetDeliveryOrder) {
        notification["success"]({
          message: '배대지 주문서 저장 성공',
        });
       
        refetch()
      } else {
        notification["error"]({
          message: '배대지 주문서 저장 실패',
        });
       
      }
      
    } catch(e) {
      console.log("배대지 주문서 저장 실패", e)
    
      notification["error"]({
        message: '배대지 주문서 저장 실패',
        description: e
      });
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    try {
      notification["error"]({
        message: '배대지 주문서 저장 실패',
        description: errorInfo.errorFields[0].errors[0]
      });
    } catch(e){}
    
  }

  return (
    <Form 
      name="DeliveryOrder"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      fields={fields}
      onFieldsChange={(_, allFields) => {
        onChange(index, allFields)
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      scrollToFirstError={true}
    >
      <Form.List name="deliveryInfo">
      {(fields, {add, remove}, {errors}) => (
        <>
          {fields.map((field, index) => {
            
            return (
              <div key={index}>
                <RemoveItemContainer>
                  <Divider>{`배대지 주문서 (${index + 1})`}
                  </Divider>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </RemoveItemContainer>
                <Form.Item
                  label="배대지 Seq"
                  name={[field.name, "orderSeq"]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  required
                  label="배대지 주문번호"
                  name={[field.name, "orderNo"]}
                  rules={[{ required: true, message: '배대지 주문번호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>

                <Divider>수취인 정보</Divider>

                <Form.Item
                  required
                  label="수취인"
                  name={[field.name, "name"]}
                  rules={[{ required: true, message: '수취인 이름을 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  required
                  label="핸드폰번호"
                  name={[field.name, "hp"]}
                  rules={[{ required: true, message: '핸드폰 번호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  required
                  label="주소"
                  name={[field.name, "address"]}
                  rules={[{ required: true, message: '주소를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  required
                  label="우편번호"
                  name={[field.name, "zipCode"]}
                  rules={[{ required: true, message: '우편번호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  required
                  label="개인통관부호"
                  name={[field.name, "PCCode"]}
                  rules={[{ required: true, message: '개인통관부호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>

                <Form.List name={[field.name, "orderItems"]}>
                  {(orderFields, {add, remove}) => (
                    <div  style={{background: "rgba(223, 128, 255, 0.2)", padding:"20px"}}>
                      {/* <div style={{width: "80%"}}> */}
                      {orderFields.map((orderField, index) => {
  
                        return (
                          <div key={orderField.key} >
                        
                              <RemoveItemContainer>
                                <Divider>{`주문 상품 (${index + 1})`}
                                </Divider>
                                <MinusCircleOutlined onClick={() => remove(orderField.name)} />
                              </RemoveItemContainer>
                              
                              <Form.Item
                                required
                                label="오픈마켓 주문번호"
                                name={[orderField.name, "orderId"]}
                                rules={[{ required: true, message: '오픈마켓 주문번호를 입력해주세요!!' }]}
                                >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                required
                                label="공급처 주문번호"
                                name={[orderField.name, "taobaoOrderNo"]}
                                rules={[{ required: true, message: '공급처 주문번호를 입력해주세요!!' }]}
                                >
                                <Input />
                              </Form.Item>
                              <Form.Item
                                label="공급처 트래킹번호"
                                name={[orderField.name, "taobaoTrackingNo"]}
                                >
                                <Input />
                              </Form.Item>
                        
                          </div>
                        )
                      })}

                      <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                        주문상품 추가
                      </Button>
                    {/* </div> */}
                    </div>
                    )}
                    
                </Form.List>

              



                <Divider />

                <Form.Item
                  label="출고상태"
                  name={[field.name, "status"]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                required
                  label="송장번호"
                  name={[field.name, "shippingNumber"]}
                  rules={[{ required: true, message: '송장번호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="베송비"
                  name={[field.name, "shippingPrice"]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="배송무게"
                  name={[field.name, "weight"]}
                  >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="삭제"
                  name={[field.name, "isDelete"]}
                  >
                  <Switch />
                </Form.Item>

              </div>
            )
          })}
          <Button
            type="dashed"
            block
            onClick={() => {
              const orderId = _.find(marketOrderFields, {name: "orderId"})
              const ordererName = _.find(marketOrderFields, {name: "orderer.name"})
              const ordererTellNumber = _.find(marketOrderFields, {name: "orderer.tellNumber"})
              const receiverAddr = _.find(marketOrderFields, {name: "receiver.addr"})
              const receiverPostCode = _.find(marketOrderFields, {name: "receiver.postCode"})
              const personalCustomsClearanceCode = _.find(marketOrderFields, {name: "overseaShippingInfoDto.personalCustomsClearanceCode"})
              
              add({
                orderNo: orderId.value,
                name: ordererName.value,
                hp: ordererTellNumber.value,
                address: receiverAddr.value,
                zipCode: receiverPostCode.value,
                PCCode: personalCustomsClearanceCode.value ? personalCustomsClearanceCode.value : "P",
                orderItems: [{
                  orderId: orderId.value
                }],
                shippingPrice: 0
              })
            }}
           
            icon={<PlusOutlined />}
          >
            배대지 주문서 추가
          </Button>
        </>
      )}
      </Form.List>
    
      <Divider />

      <Form.Item
        wrapperCol={{
          offset: 0,
          span: 24,
        }}
      >
        <Button size="large"  block type="primary" htmlType="submit">
          저장
        </Button>
      </Form.Item>


    </Form>
  )
}

const TaobaoOrderForm = ( {userID, refetch, onChange, fields, deliveryOrderFields, index}) => {
  const [setTaobaoOrder] = useMutation(SET_TAOBAO_ORDER)
  const onFinish = async (values) => {
    console.log('Success:', values);
    try {

      const response = await setTaobaoOrder({
        variables: {
          userID,
          input: values.taobaoInfo.map(item => {
            return {
              orderNumber: item.orderNumber,
              orderDate: moment(item.orderDate).format("YYYYMMDD"),
              orderTime: moment(item.orderTime).format("HHmmSS"),
              purchaseAmount: item.purchaseAmount,
              shippingFee: item.shippingFee,
              orders: item.orders.map(order => {
                return {
                  productName: order.productName,
                  thumbnail: order.thumbnail,
                  detail: order.detail,
                  originalPrice: order.originalPrice,
                  realPrice: order.realPrice,
                  quantity: order.quantity,
                  option: order.option.map(op => {
                    return {
                      name: op.name,
                      value: op.value,
                      visible: op.visible
                    }
                  })
                }

              })
            }
          })
        }
      })
      console.log("response--", response)
      if(response && response.data.SetTaobaoOrder) {
        notification["success"]({
          message: '공급처 주문서 저장 성공',
        });
        
        refetch()
      } else {
        notification["error"]({
          message: '공급처 주문서 저장 실패',
        });
        
      }
      
    } catch(e) {
      console.log("공급처 주문서 저장 실패", e)
      
      notification["error"]({
        message: '공급처 주문서 저장 실패',
        description: e
      });
    }
  }

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    try {
      notification["error"]({
        message: '공급처 주문서 저장 실패',
        description: errorInfo.errorFields[0].errors[0]
      });
    } catch(e){}
  }

  return (
    <Form 
      name="TaobaoOrder"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      fields={fields}
      onFieldsChange={(_, allFields) => {
        onChange(index, allFields)
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      scrollToFirstError={true}
    >
      <Form.List name="taobaoInfo">
      {(fields, {add, remove}) => (
        <>
          {fields.map((field, index) => {
            
            return (
              <div key={index}>
                <RemoveItemContainer>
                  <Divider>{`공급처 주문서 (${index + 1})`}
                  </Divider>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                </RemoveItemContainer>
                <Form.Item
                  label="주문번호"
                  name={[field.name, "orderNumber"]}
                  rules={[{ required: true, message: '공급처 주문번호를 입력해주세요!!' }]}
                  >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="주문일"
                  name={[field.name, "orderDate"]}
                  rules={[{ required: true, message: '주문일을 입력해주세요!!' }]}
                  >
                 <DatePicker format="YYYY-MM-DD" />
                </Form.Item>
                <Form.Item
                  label="주문시간"
                  name={[field.name, "orderTime"]}
                  rules={[{ required: true, message: '주문시간을 입력해주세요!!' }]}
                  >
                 <TimePicker format="HH:mm:ss" />
                </Form.Item>
              
                

                  <Form.Item
                    label="주문금액"
                    name={[field.name, "purchaseAmount"]}
                    rules={[{ required: true, message: '주문금액을 입력해주세요!!' }]}
                    >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="배송비"
                    name={[field.name, "shippginFee"]}
                    >
                    <Input />
                  </Form.Item>

                <Form.List name={[field.name, "orders"]}>
                  {(orderFields, {add, remove}) => (
                    <div style={{background: "rgba(223, 128, 255, 0.2)", padding:"20px"}}>
                    {orderFields.map((orderField, index) => {
                      
                      return (
                        <div key={orderField.key} >
                         
                          <RemoveItemContainer>
                            <Divider>{`주문 상품 (${index + 1})`}
                            </Divider>
                            <MinusCircleOutlined onClick={() => remove(orderField.name)} />
                          </RemoveItemContainer>
                          
                          <Form.List name={[orderField.name, "option"]}
                            
                          >
                            {(optionFields, {add, remove}) => (
                              <div style={{width: "95%", background: "#ffeed6", padding: "15px"}}>
                              {optionFields.map((optionField, index) => {
                                return (
                                  <div key={optionField.key} style={{display: "flex", justifyContent: "center"}}

                                  >
                                    <div style={{width: "100%"}}>
                                      <RemoveItemContainer>
                                        <Divider>{`옵션 (${index + 1})`}
                                        </Divider>
                                        <MinusCircleOutlined onClick={() => remove(optionField.name)} />
                                      </RemoveItemContainer>
                                      <Form.Item
                                        label="옵션속성"
                                        name={[optionField.name, "name"]}
                                        rules={[{ required: true, message: '옵션속성을 입력해주세요!!' }]}
                                        >
                                        <Input />
                                      </Form.Item>
                                      <Form.Item
                                        label="옵션명"
                                        name={[optionField.name, "value"]}
                                        rules={[{ required: true, message: '옵션명을 입력해주세요!!' }]}
                                        >
                                        <Input />
                                      </Form.Item>
                                      <Form.Item
                                        label="visible"
                                        name={[optionField.name, "visible"]}
                                        >
                                        <Input />
                                      </Form.Item>

                                      
                                      
                                      
                                    </div>
                                  </div>
                                )
                              })}
                              
                              <Button
                                type="dashed"
                                block
                                onClick={() => add()}
                              
                                icon={<PlusOutlined />}
                              >
                                옵션 추가
                              </Button>
                               
                              </div>
                            )}
                            
                          </Form.List>
                         
                          <Divider />
 
                          <Form.Item
                            label="id"
                            name={[orderField.name, "id"]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="skuId"
                            name={[orderField.name, "skuId"]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="상품명"
                            name={[orderField.name, "productName"]}
                            rules={[{ required: true, message: '상품명을 입력해주세요!!' }]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="수량"
                            name={[orderField.name, "quantity"]}
                            rules={[{ required: true, message: '수량을 입력해주세요!!' }]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="원래가격"
                            name={[orderField.name, "originalPrice"]}
                           
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="판매가격"
                            name={[orderField.name, "realPrice"]}
                            rules={[{ required: true, message: '판매가격을 입력해주세요!!' }]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="상세페이지"
                            name={[orderField.name, "detail"]}
                            rules={[{ required: true, message: '상세페이지 URL을 입력해주세요!!' }]}
                            >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            label="썸네일"
                            name={[orderField.name, "thumbnail"]}
                            >
                            <Input />
                          </Form.Item>
                        </div>
                      )
                    }
                    )}

                      <Button type="dashed" onClick={() => {

                        add({
                          quantity: "1",
                          option: [{
                            name: "option"
                          }]                          
                        })
                      }} block icon={<PlusOutlined />}>
                        주문상품 추가
                      </Button>

                    </div>
                    )}
                    
                </Form.List>

              
                <Divider />


              

              </div>
            )
          })}

      
        

        <Button
          type="dashed"
          block
          onClick={() => {
           
            let orderid = null
            if(deliveryOrderFields && deliveryOrderFields[0] && deliveryOrderFields[0].value &&
              deliveryOrderFields[0].value[0] && deliveryOrderFields[0].value[0].orderItems  && deliveryOrderFields[0].value[0].orderItems[0]
              ) {
                orderid = deliveryOrderFields[0].value[0].orderItems[0].taobaoOrderNo
              }

            add({
              orderNumber: orderid,
              shippginFee: "0",
              orders: [{
                quantity: "1",
                option: [{
                  name: "option"
                }]
              }]
            })
          }}
          
          icon={<PlusOutlined />}
        >
          공급처 주문서 추가
        </Button>
        </>
      )}
      </Form.List>
    

      <Divider />

      <Form.Item
        wrapperCol={{
          offset: 0,
          span: 24,
        }}
      >
        <Button size="large" block type="primary" htmlType="submit">
          저장
        </Button>
      </Form.Item>


    </Form>
  )
}

const RemoveItemContainer = styled.div`
  display: flex;
  align-items: center;
  margin-right: 50px;
  &>:nth-child(1){
    width: 100%;
  }
  &>:nth-child(2){
    min-width: 50px;
    max-width: 50px;
    &:hover {
      cursor: pointer;
    }
  }
`