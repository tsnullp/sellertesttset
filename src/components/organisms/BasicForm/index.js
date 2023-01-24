import React, { useState, useEffect } from "react"
import {
  Collapse,
  Form,
  Popconfirm,
  message,
  Input,
  InputNumber,
  Button,
  notification,
  Row,
  Col,
  Modal,
  Divider,
} from "antd"
import { useQuery, useMutation } from "@apollo/client"
import {
  SET_BASIC_INFO,
  GET_COOKIE,
  SET_COOKIE,
  GET_ACCOUNT_LIST,
  ADD_ACCOUNT,
  DELETE_ACCOUNT,
  GET_SUBPRICE,
  SET_SUBPRICE,
  GET_ADDPRICE_LIST,
  GET_IHERB_ADDPRICE_LIST,
  GET_ALI_ADDPRICE_LIST,
  GET_AMAZON_JP_ADDPRICE_LIST,
  SET_ADDPRICE,
  SET_IHERB_ADDPRICE,
  SET_ALI_ADDPRICE,
  SET_AMAZON_JP_ADDPRICE,
  DELETE_ADDPRICE,
  GET_SHIPPINGPRICE_LIST,
  GET_IHERB_SHIPPINGPRICE_LIST,
  GET_ALI_SHIPPINGPRICE_LIST,
  GET_AMAZON_JP_SHIPPINGPRICE_LIST,
  SET_IHERB_SHIPPINGPRICE,
  SET_ALI_SHIPPINGPRICE,
  SET_SHIPPINGPRICE,
  SET_AMAZON_JP_SHIPPINGPRICE,
  DELETE_SHIPPINGPRICE,
  GET_MARGIN,
  SET_MARGIN,
  DELETE_ALL_WEIGHT,
  SET_ALL_WEIGHT
} from "../../../gql"
import { useFormik } from "formik"
import styled from "styled-components"
import { TextEditor, ExcelImport } from "components"
import { DeleteOutlined, CheckOutlined } from "@ant-design/icons"
import Checkbox from "antd/lib/checkbox/Checkbox"

const { TextArea } = Input
const { Panel } = Collapse

const BasicForm = ({ basicItem, refetch }) => {
  return [PriceForm(), DetailForm(basicItem, refetch), AccountQuery(), CookieQuery()]
}

const PriceForm = () => {
  const [loading, setLoading] = useState(false)
  const [getSubPrice] = useMutation(GET_SUBPRICE)
  const [setSubPrice] = useMutation(SET_SUBPRICE)
  const [subPrice, SetSubPrice] = useState(200)

  useEffect(() => {
    try {
      setTimeout(async () => {
        const response = await getSubPrice()
        SetSubPrice(response.data.GetSubPrice)
      }, 200)
    } catch (e) {}
  }, [])

  const initialValues = {
    profit: localStorage.getItem("profit") || 40,
    fees: localStorage.getItem("fees") || 11,
    discount: localStorage.getItem("discount") || 10,
    shipping: localStorage.getItem("shipping") || 7000,
    exchange: localStorage.getItem("exchange") || 175,
  }

  const layout = {
    labelCol: {
      span: 7,
    },
    wrapperCol: {
      span: 12,
    },
  }

  const onFinish = async (values) => {
    setLoading(true)
    localStorage.setItem("profit", values.profit)
    localStorage.setItem("fees", values.fees)
    localStorage.setItem("discount", values.discount)
    localStorage.setItem("shipping", values.shipping)
    localStorage.setItem("exchange", values.exchange)
    await setSubPrice({
      variables: {
        subPrice,
      },
    })
    setLoading(false)
  }

  const info = () => {
    message.info("저장하였습니다.")
  }
  console.log("subPrice:", subPrice)
  return (
    <Collapse defaultActiveKey={""} expandIconPosition="left" style={{ marginBottom: "30px" }}>
      <Panel header="금액 설정" key="1">
        <Form {...layout} initialValues={initialValues} onFinish={onFinish}>
          <Form.Item label="마진율" name="profit" rules={[{ required: true }]}>
            <InputNumber min={1} max={1000} />
          </Form.Item>
          <Form.Item label="할인율" name="discount" rules={[{ required: true }]}>
            <InputNumber min={1} max={1000} />
          </Form.Item>
          <Form.Item label="수수료" name="fees" rules={[{ required: true }]}>
            <InputNumber min={1} max={1000} />
          </Form.Item>
          <Form.Item label="배대지 배송비" name="shipping" rules={[{ required: true }]}>
            <InputNumber parser={(value) => value.replace(/\$\s?|(,*)/g, "")} />
          </Form.Item>
          <Form.Item label="환율" name="exchange" rules={[{ required: true }]}>
            <InputNumber parser={(value) => value.replace(/\$\s?|(,*)/g, "")} />
          </Form.Item>
          <Form.Item label="차감액" rules={[{ required: true }]}>
            <InputNumber
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              value={subPrice}
              onChange={(value) => {
                SetSubPrice(value)
              }}
            />
          </Form.Item>
          <Form.Item
            wrapperCol={{
              span: 0,
              offset: 20,
            }}
          >
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              className="login-form-button"
              onClick={info}
            >
              저장
            </Button>
          </Form.Item>
        </Form>
        <Divider orientation="left">네이버 쇼핑 마진율 (타오바오)</Divider>
        <AddPricQuery />
        <Divider orientation="left">배송비 (타오바오)</Divider>
        <ShippingPriceQuery />

        <Divider orientation="left">마진율 (아이허브)</Divider>
        <AddIherbPricQuery />

        <Divider orientation="left">배송비 (아이허브)</Divider>
        <IherbShippingPriceQuery />

        <Divider orientation="left">마진율 (알리익스프레스)</Divider>
        <AddAliPricQuery />

        <Divider orientation="left">배송비 (알리익스프레스)</Divider>
        <AliShippingPriceQuery />

        <Divider orientation="left">마진율 (아마존 일본)</Divider>
        <AddAmazonJPPricQuery />

        <Divider orientation="left">배송비 (아마존 일본)</Divider>
        <AmazonJPShippingPriceQuery />
      </Panel>
    </Collapse>
  )
}

const MarginQuery = () => {
  const { loading, data, refetch } = useQuery(GET_MARGIN)
  console.log("data", data)
  if (loading) {
    return null
  }
  if (data && data.GetMargin >= 0) {
    return <MarginForm item={data.GetMargin} refetch={refetch} />
  }
  return null
}

const MarginForm = ({ item, refetch }) => {
  const [setMargin] = useMutation(SET_MARGIN)
  const [value, setValue] = useState(item)
  return (
    <MarginInputContainer>
      <div>마진율</div>
      <InputNumber
        style={{ width: "100%" }}
        placeholder="마진률을 설정해주세요"
        value={value}
        onChange={(value) => setValue(value)}
        step={10}
      />
      <Button
        type="primary"
        onClick={async () => {
          const response = await setMargin({
            variables: {
              margin: value,
            },
          })
          if (response.data.SetMargin) {
            refetch()
            message.info("저장")
          } else {
            message.error("실패")
          }
        }}
      >
        저장
      </Button>
    </MarginInputContainer>
  )
}

const MarginInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  & > :nth-child(1) {
    width: 60px;
  }
  & > :nth-child(2) {
    min-width: 100px;
    max-width: 100px;
    margin-left: 10px;
    margin-right: 10px;
  }
  & > :nth-child(3) {
    width: 100px;
  }
`
const AddPricQuery = () => {
  const { loading, data, refetch } = useQuery(GET_ADDPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetAddPriceList) {
    return <AddPriceForm items={data.GetAddPriceList} refetch={refetch} />
  }
  return null
}
const AddAmazonJPPricQuery = () => {
  const { loading, data, refetch } = useQuery(GET_AMAZON_JP_ADDPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetAmazonJPAddPriceList) {
    return <AddAmazonJPPriceForm items={data.GetAmazonJPAddPriceList} refetch={refetch} />
  }
  return null
}

const AddIherbPricQuery = () => {
  const { loading, data, refetch } = useQuery(GET_IHERB_ADDPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetIherbAddPriceList) {
    return <AddIherbPriceForm items={data.GetIherbAddPriceList} refetch={refetch} />
  }
  return null
}

const AddAliPricQuery = () => {
  const { loading, data, refetch } = useQuery(GET_ALI_ADDPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetAliAddPriceList) {
    return <AddAliPriceForm items={data.GetAliAddPriceList} refetch={refetch} />
  }
  return null
}

const AddPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [yuan, setYuan] = useState(0)
  const [price, setPrice] = useState(0)

  const [addPrice] = useMutation(SET_ADDPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setYuan(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addPrice({
      variables: {
        title: yuan,
        price,
      },
    })
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)

    if (response.data.SetAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AddPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="마진율 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>위안</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="위안 금액을 입력해 주세요"
                value={yuan}
                onChange={(value) => setYuan(value)}
                step={10}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>마진율</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="마진율을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}
const AddAmazonJPPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [yuan, setYuan] = useState(0)
  const [price, setPrice] = useState(0)

  const [addPrice] = useMutation(SET_AMAZON_JP_ADDPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setYuan(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addPrice({
      variables: {
        title: yuan,
        price,
      },
    })
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)

    if (response.data.SetAmazonJPAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AddAmazonJPPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="마진율 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>위안</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="엔화 금액을 입력해 주세요"
                value={yuan}
                onChange={(value) => setYuan(value)}
                step={10}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>마진율</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="마진율을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}

const AddPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addPrice] = useMutation(SET_ADDPRICE)
  const [deletePrice] = useMutation(DELETE_ADDPRICE)

  const handleModify = async (item) => {
    console.log("item---", item)
    const response = await addPrice({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })

    if (response.data.SetAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deletePrice({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteAddPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="위안"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="마진율"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}
const AddAmazonJPPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addPrice] = useMutation(SET_AMAZON_JP_ADDPRICE)
  const [deletePrice] = useMutation(DELETE_ADDPRICE)

  const handleModify = async (item) => {
    console.log("item---", item)
    const response = await addPrice({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })

    if (response.data.SetAmazonJPAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deletePrice({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteAddPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="엔"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="마진율"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}

const AddIherbPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [yuan, setYuan] = useState(0)
  const [price, setPrice] = useState(0)

  const [addPrice] = useMutation(SET_IHERB_ADDPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setYuan(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addPrice({
      variables: {
        title: yuan,
        price,
      },
    })
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)

    if (response.data.SetIherbAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AddUSAPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="마진율 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>원화</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="원화 금액을 입력해 주세요"
                value={yuan}
                onChange={(value) => setYuan(value)}
                step={10}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>마진율</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="마진율을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}

const AddAliPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [yuan, setYuan] = useState(0)
  const [price, setPrice] = useState(0)

  const [addPrice] = useMutation(SET_ALI_ADDPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setYuan(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addPrice({
      variables: {
        title: yuan,
        price,
      },
    })
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)

    if (response.data.SetAliAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setYuan(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AddUSAPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="마진율 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>원화</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="원화 금액을 입력해 주세요"
                value={yuan}
                onChange={(value) => setYuan(value)}
                step={10}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>마진율</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="마진율을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}

const AddUSAPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addPrice] = useMutation(SET_ADDPRICE)
  const [deletePrice] = useMutation(DELETE_ADDPRICE)

  const handleModify = async (item) => {
    console.log("item---", item)
    const response = await addPrice({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })

    if (response.data.SetAddPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deletePrice({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteAddPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="원화"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="마진율"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}

const ShippingPriceQuery = () => {
  const { loading, data, refetch } = useQuery(GET_SHIPPINGPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetShippingPriceList) {
    return <ShippingPriceForm items={data.GetShippingPriceList} refetch={refetch} />
  }
  return null
}
const ShippingPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [weight, setWeight] = useState(0)
  const [price, setPrice] = useState(0)

  const [addShipping] = useMutation(SET_SHIPPINGPRICE)
  const [deleteAllWeight] = useMutation(DELETE_ALL_WEIGHT)
  const [setAllWeight] = useMutation(SET_ALL_WEIGHT)

  const showModal = () => {
    setIsModalVisible(true)
    setWeight(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addShipping({
      variables: {
        title: weight,
        price,
      },
    })
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)
    
    if (response.data.SetShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)
  }

  const handleExcel = async(value) => {
    console.log("value--", value)
    const response = await setAllWeight({
      variables: {
        input: value.map(item => {
          return {
            weight: item.무게.toString(),
            price: item.비용.toString()
          }
        })
      }
    })
    console.log("response", response)
    if (response.data.SetAllWeight) {
      refetch()
    } else {
      message.error("실패하였습니다.")
    }
  }

  const deleteAllConfirm = async () => {
    const response = await deleteAllWeight()

    if (response.data.DeleteAllWeight) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <>
      <WeightButtonContainer>
        <ExcelImport size="middle" title="(무게, 비용) 불러오기" onSuccess={handleExcel} />
        <Popconfirm
          title="삭제하시겠습니까?"
          onConfirm={deleteAllConfirm}
          okText="예"
          cancelText="아니오"
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>전체삭제</Button>
        </Popconfirm>
      </WeightButtonContainer>
      {items.map((item, index) => (
        <ShippingdPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="배송비 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>무게(KG)</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="무게(KG)를 입력해 주세요"
                value={weight}
                onChange={(value) => setWeight(value)}
                step={1}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>금액</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="금액을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}
const ShippingdPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addShipping] = useMutation(SET_SHIPPINGPRICE)
  const [deleteShipping] = useMutation(DELETE_SHIPPINGPRICE)

  const handleModify = async (item) => {
    const response = await addShipping({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })
    
    if (response.data.SetShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deleteShipping({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteShippingPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="무게(KG)"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="금액"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}

const IherbShippingPriceQuery = () => {
  const { loading, data, refetch } = useQuery(GET_IHERB_SHIPPINGPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetIherbShippingPriceList) {
    return <IherbShippingPriceForm items={data.GetIherbShippingPriceList} refetch={refetch} />
  }
  return null
}
const IherbShippingPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [weight, setWeight] = useState(0)
  const [price, setPrice] = useState(0)

  const [addShipping] = useMutation(SET_IHERB_SHIPPINGPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setWeight(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addShipping({
      variables: {
        title: weight,
        price,
      },
    })
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)

    if (response.data.SetIherbShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <IherbShippingdPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="배송비 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>무게(LB)</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="무게(LB)를 입력해 주세요"
                value={weight}
                onChange={(value) => setWeight(value)}
                step={1}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>금액</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="금액을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}
const IherbShippingdPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addShipping] = useMutation(SET_IHERB_SHIPPINGPRICE)
  const [deleteShipping] = useMutation(DELETE_SHIPPINGPRICE)

  const handleModify = async (item) => {
    const response = await addShipping({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })

    if (response.data.SetAliShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deleteShipping({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteShippingPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="무게(KG)"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="금액"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}

const AliShippingPriceQuery = () => {
  const { loading, data, refetch } = useQuery(GET_ALI_SHIPPINGPRICE_LIST)
  if (loading) {
    return null
  }
  if (data && data.GetIherbShippingPriceList) {
    return <AliShippingPriceForm items={data.GetAliShippingPriceList} refetch={refetch} />
  }
  return null
}
const AliShippingPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [weight, setWeight] = useState(0)
  const [price, setPrice] = useState(0)

  const [addShipping] = useMutation(SET_ALI_SHIPPINGPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setWeight(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addShipping({
      variables: {
        title: weight,
        price,
      },
    })
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)

    if (response.data.SetAliShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AliShippingdPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="배송비 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>무게(KG)</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="무게(KG)를 입력해 주세요"
                value={weight}
                onChange={(value) => setWeight(value)}
                step={1}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>금액</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="금액을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}
const AliShippingdPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addShipping] = useMutation(SET_ALI_SHIPPINGPRICE)
  const [deleteShipping] = useMutation(DELETE_SHIPPINGPRICE)

  const handleModify = async (item) => {
    const response = await addShipping({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })
   
    if (response.data.SetAliShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deleteShipping({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteShippingPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="무게(KG)"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="금액"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}
const AmazonJPShippingPriceQuery = () => {
  const { loading, data, refetch } = useQuery(GET_AMAZON_JP_SHIPPINGPRICE_LIST)
  if (loading) {
    return null
  }

  if (data && data.GetAmazonJPShippingPriceList) {
    return <AmazonJPShippingPriceForm items={data.GetAmazonJPShippingPriceList} refetch={refetch} />
  }
  return null
}
const AmazonJPShippingPriceForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [weight, setWeight] = useState(0)
  const [price, setPrice] = useState(0)

  const [addShipping] = useMutation(SET_AMAZON_JP_SHIPPINGPRICE)

  const showModal = () => {
    setIsModalVisible(true)
    setWeight(0)
    setPrice(0)
  }

  const handleOk = async () => {
    const response = await addShipping({
      variables: {
        title: weight,
        price,
      },
    })
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)

    if (response.data.SetAmazonJPShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setWeight(0)
    setPrice(0)
  }

  return (
    <>
      {items.map((item, index) => (
        <AmazonJPShippingdPriceItemForm key={index} item={item} refetch={refetch} />
      ))}
      <ButtonContainer>
        <Modal title="배송비 설정" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
          <InputContainer>
            <InputItemContainer>
              <div style={{ width: "60px" }}>무게(KG)</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="무게(KG)를 입력해 주세요"
                value={weight}
                onChange={(value) => setWeight(value)}
                step={1}
              />
            </InputItemContainer>
            <InputItemContainer>
              <div style={{ width: "80px" }}>금액</div>
              <InputNumber
                style={{ width: "100%" }}
                placeholder="금액을 입력해 주세요"
                value={price}
                onChange={(value) => setPrice(value)}
                step={1000}
              />
            </InputItemContainer>
          </InputContainer>
        </Modal>
        <Button type="primary" onClick={showModal}>
          추가
        </Button>
      </ButtonContainer>
    </>
  )
}
const AmazonJPShippingdPriceItemForm = ({ item, refetch }) => {
  const [title, setTitle] = useState(item.title)
  const [price, setPrice] = useState(item.price)

  const [addShipping] = useMutation(SET_AMAZON_JP_SHIPPINGPRICE)
  const [deleteShipping] = useMutation(DELETE_SHIPPINGPRICE)

  const handleModify = async (item) => {
    const response = await addShipping({
      variables: {
        _id: item._id,
        title: item.title,
        price: item.price,
      },
    })

    if (response.data.SetAmazonJPShippingPrice) {
      refetch()
      message.info("성공")
    } else {
      message.error("실패")
    }
  }

  const confirm = async (_id) => {
    const response = await deleteShipping({
      variables: {
        _id,
      },
    })

    if (response.data.DeleteShippingPrice) {
      refetch()
      message.info("삭제 하였습니다.")
    } else {
      message.error("삭제에 실패하였습니다.")
    }
  }

  return (
    <AddPriceContainer>
      <Input
        addonBefore="무게(KG)"
        value={title.toLocaleString("ko")}
        onChange={(e) => {
          setTitle(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Input
        addonBefore="금액"
        value={price.toLocaleString("ko")}
        onChange={(e) => {
          setPrice(Number(e.target.value.replace(/,/gi, "")))
        }}
      />
      <Button
        type="primary"
        icon={<CheckOutlined />}
        onClick={() =>
          handleModify({
            _id: item._id,
            title,
            price,
          })
        }
      >
        수정
      </Button>
      <Popconfirm
        title="삭제하시겠습니까?"
        onConfirm={() => confirm(item._id)}
        okText="예"
        cancelText="아니오"
      >
        <Button type="primary" danger icon={<DeleteOutlined />}>
          삭제
        </Button>
      </Popconfirm>
    </AddPriceContainer>
  )
}

const AddPriceContainer = styled.div`
  margin-left: 100px;
  margin-right: 100px;
  margin-bottom: 10px;
  display: flex;
  & > :nth-child(1) {
    min-width: 140px;
    max-width: 140px;
  }
  & > :nth-child(2) {
    width: 100%;
    margin-left: 10px;
    margin-right: 10px;
  }
  & > :nth-child(3) {
    min-width: 80px;
    max-width: 80px;
    margin-right: 10px;
  }
  & > :nth-child(4) {
    min-width: 80px;
    max-width: 80px;
  }
`
const InputContainer = styled.div`
  display: flex;
  & > :nth-child(1) {
    min-width: 140px;
    max-width: 140px;
    margin-right: 10px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`
const InputItemContainer = styled.div`
  display: flex;
  align-items: center;
`
const DetailForm = (basicItem, refetch) => {
  const {
    afterServiceInformation,
    afterServiceContactNumber,
    topImage,
    bottomImage,
    clothImage,
    shoesImage,
    kiprisInter,
  } = basicItem

  const [setBasicInfo] = useMutation(SET_BASIC_INFO)

  const formik = useFormik({
    initialValues: {
      afterServiceInformation,
      afterServiceContactNumber,
      topImage,
      bottomImage,
      clothImage,
      shoesImage,
      kiprisInter,
    },
    validate: (values) => {
      const errors = {}
      if (!values.afterServiceInformation || values.afterServiceInformation.trim().length === 0) {
        errors.afterServiceInformation = "A/S안내를 입력해 주세요."
      }
      if (
        !values.afterServiceContactNumber ||
        values.afterServiceContactNumber.trim().length === 0
      ) {
        errors.afterServiceContactNumber = "A/S전화번호를 입력해 주세요."
      }
      return errors
    },
    onSubmit: async (values) => {
      const response = await setBasicInfo({
        variables: {
          afterServiceInformation: values.afterServiceInformation,
          afterServiceContactNumber: values.afterServiceContactNumber,
          topImage: values.topImage,
          bottomImage: values.bottomImage,
          clothImage: values.clothImage,
          shoesImage: values.shoesImage,
          kiprisInter: values.kiprisInter,
        },
      })

      if (response.data.SetBasicInfo) {
        refetch()
        notification["success"]({
          message: "기본정보를 저장하였습니다.",
        })
      } else {
        notification["error"]({
          message: "기본정보를 저장하는데 실패하였습니다.",
        })
      }
    },
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center",
  }

  const handleTopImage = (html) => {
    formik.setFieldValue("topImage", html)
  }
  const handleClothImage = (html) => {
    formik.setFieldValue("clothImage", html)
  }
  const handleShoesImage = (html) => {
    formik.setFieldValue("shoesImage", html)
  }
  const handleBottomImage = (html) => {
    formik.setFieldValue("bottomImage", html)
  }
  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={""} expandIconPosition="left" style={{ marginBottom: "30px" }}>
        <Panel header="기본 설정" key="2">
          <Row justify="center" align="middle" gutter={[24, 8]}>
            <Col span={4}>
              <LabelContainer>
                <LabelTitle>등록시 상표권 연동</LabelTitle>
                <RequirdIconSmall />
              </LabelContainer>
            </Col>
            <Col span={20}>
              <Checkbox
                name="kiprisInter"
                checked={formik.values.kiprisInter}
                onChange={formik.handleChange}
              >
                상표권 키워드 삭제
              </Checkbox>
            </Col>
          </Row>

          <Row justify="center" align="middle" gutter={[24, 8]}>
            <Col span={4}>
              <LabelContainer>
                <LabelTitle>A/S안내</LabelTitle>
                <RequirdIconSmall />
              </LabelContainer>
            </Col>
            <Col span={20}>
              <TextArea
                name="afterServiceInformation"
                value={formik.values.afterServiceInformation}
                onChange={formik.handleChange}
              />
            </Col>
          </Row>
          {formik.touched.afterServiceInformation && formik.errors.afterServiceInformation && (
            <Row justify="center" align="middle" gutter={[24, 10]}>
              <Col span={20} offset={4}>
                <ErrorMessage>{formik.errors.afterServiceInformation}</ErrorMessage>
              </Col>
            </Row>
          )}

          <Row justify="center" align="middle" gutter={[24, 8]}>
            <Col span={4}>
              <LabelContainer>
                <LabelTitle>A/S전화번호</LabelTitle>
                <RequirdIconSmall />
              </LabelContainer>
            </Col>
            <Col span={20}>
              <Input
                name="afterServiceContactNumber"
                value={formik.values.afterServiceContactNumber}
                onChange={formik.handleChange}
              />
            </Col>
          </Row>
          {formik.touched.afterServiceContactNumber && formik.errors.afterServiceContactNumber && (
            <Row justify="center" align="middle" gutter={[24, 10]}>
              <Col span={20} offset={4}>
                <ErrorMessage>{formik.errors.afterServiceContactNumber}</ErrorMessage>
              </Col>
            </Row>
          )}

          <LabelContainer1>
            <LabelTitle>상단 이미지</LabelTitle>
          </LabelContainer1>

          <TextEditor
            height={600}
            showHtml={true}
            html={formik.values.topImage}
            getHtmlValue={handleTopImage}
          />
          <LabelContainer1>
            <LabelTitle>의류 사이즈표</LabelTitle>
          </LabelContainer1>

          <TextEditor
            height={600}
            showHtml={true}
            html={formik.values.clothImage}
            getHtmlValue={handleClothImage}
          />
          <LabelContainer1>
            <LabelTitle>신발 사이즈표</LabelTitle>
          </LabelContainer1>

          <TextEditor
            height={600}
            showHtml={true}
            html={formik.values.shoesImage}
            getHtmlValue={handleShoesImage}
          />
          <LabelContainer1>
            <LabelTitle>하단 이미지</LabelTitle>
          </LabelContainer1>

          <TextEditor
            height={600}
            showHtml={true}
            html={formik.values.bottomImage}
            getHtmlValue={handleBottomImage}
          />

          <ButtonContainer>
            <Button type="primary" htmlType="submit" className="login-form-button">
              등록
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}

const CookieQuery = () => {
  const { loading, data } = useQuery(GET_COOKIE)
  console.log("data", data)
  if (loading) {
    return null
  }
  if (data && data.GetCookie) {
    return <CookieForm basicItem={data} />
  }
  return null
}
const CookieForm = ({ basicItem }) => {
  const [setCookie] = useMutation(SET_COOKIE)
  const formik = useFormik({
    initialValues: {
      cookie: basicItem.GetCookie,
    },
    onSubmit: async (values) => {
      const response = await setCookie({
        variables: {
          cookie: values.cookie,
        },
      })

      if (response.data.SetCookie) {
        notification["success"]({
          message: "쿠키정보를 저장하였습니다.",
        })
      } else {
        notification["error"]({
          message: "쿠키정보를 저장하는데 실패하였습니다.",
        })
      }
    },
  })

  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 20 },
    justify: "center",
  }

  return (
    <Form {...layout} initialValues={formik.initialValues} onFinish={formik.handleSubmit}>
      <Collapse defaultActiveKey={""} expandIconPosition="left" style={{ marginBottom: "30px" }}>
        <Panel header="쿠키 설정" key="2">
          <Row justify="center" align="middle" gutter={[24, 8]}>
            <Col span={4}>
              <LabelContainer>
                <LabelTitle>쿠키</LabelTitle>
                <RequirdIconSmall />
              </LabelContainer>
            </Col>
            <Col span={20}>
              <TextArea
                rows={5}
                name="cookie"
                value={formik.values.cookie}
                onChange={formik.handleChange}
              />
            </Col>
          </Row>
          <ButtonContainer>
            <Button type="primary" htmlType="submit" className="login-form-button">
              등록
            </Button>
          </ButtonContainer>
        </Panel>
      </Collapse>
    </Form>
  )
}

const AccountQuery = () => {
  const { loading, data, refetch } = useQuery(GET_ACCOUNT_LIST)
  if (loading) {
    return null
  }
  if (data && data.getAccountList) {
    return <AccountForm items={data.getAccountList} refetch={refetch} />
  }
  return null
}

const AccountForm = ({ items, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [email, setEmail] = useState("")

  const [addAccount] = useMutation(ADD_ACCOUNT)
  const [deleteAccount] = useMutation(DELETE_ACCOUNT)

  const showModal = () => {
    setIsModalVisible(true)
    setEmail("")
  }

  const handleOk = async () => {
    const response = await addAccount({
      variables: {
        email,
      },
    })
    setIsModalVisible(false)
    setEmail("")

    if (response.data.addAccount) {
      refetch()
      message.info("계정을 추가 하였습니다.")
    } else {
      message.error("계정을 추가에 실패하였습니다.")
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setEmail("")
  }
  const confirm = async (deleteEmail) => {
    const response = await deleteAccount({
      variables: {
        email: deleteEmail,
      },
    })

    if (response.data.deleteAccount) {
      refetch()
      message.info("계정을 삭제 하였습니다.")
    } else {
      message.error("계정삭제에 실패하였습니다.")
    }
  }
  return (
    <Collapse defaultActiveKey={""} expandIconPosition="left" style={{ marginBottom: "30px" }}>
      <Panel header="계정 관리" key="2">
        {items.map((item, index) => (
          <AccountItemContainer key={index}>
            <Input addonBefore={item.nickname} value={item.email} disabled />
            <Popconfirm
              title="삭제하시겠습니까?"
              onConfirm={() => confirm(item.email)}
              okText="예"
              cancelText="아니오"
            >
              <Button>삭제</Button>
            </Popconfirm>
          </AccountItemContainer>
        ))}
        <ButtonContainer>
          <Modal title="계정 추가" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
            <Input
              placeholder="구글 아이디를 입력해주세요."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Modal>
          <Button type="primary" onClick={showModal}>
            추가
          </Button>
        </ButtonContainer>
      </Panel>
    </Collapse>
  )
}

// const EtcForm = ()
export default BasicForm

const AccountItemContainer = styled.div`
  display: flex;
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

const LabelContainer = styled.div`
  display: flex;
  /* justify-content: flex-end; */
  align-items: center;
`

const LabelContainer1 = styled.div`
  display: flex;
  /* justify-content: flex-end; */
  align-items: center;
  margin-top: 20px;
  margin-bottom: 10px;
`

const LabelTitle = styled.div`
  text-align: right;
  font-size: 14px;
`

const ErrorMessage = styled.div`
  color: #ff545c;
  font-size: 13px;
`

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
`

const WeightButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
  &>:nth-child(1){
    margin-right: 10px;
  }
`