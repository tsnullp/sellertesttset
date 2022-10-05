import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { useQuery, useMutation } from "@apollo/client"
import { BAEDAEGI_LIST, BAEDAEGI_ITEM_DELETE, BAEDAEGI_ITEM_MARKETORDER_MODIFY, TABAE_ORDER_BATCH } from "../../../gql"
import { Table, Switch, notification, Input, Button, Radio } from "antd"
import {
  EditTwoTone,
  CloseOutlined,
  CheckOutlined
} from "@ant-design/icons"

const { shell } = window.require("electron")
const { Search } = Input

const BaedaegiForm = () => {
  const [radio, setRadio] = useState(1)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })
  const [search, setSearch] = useState("")
  const [tabaeOrder] = useMutation(TABAE_ORDER_BATCH)
  const { loading, data, refetch, networkStatus } = useQuery(BAEDAEGI_LIST,{
    variables: {
      page: pagination.current,
      perPage: pagination.pageSize,
      search,
      filterOption: radio
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      setPagination({
        ...pagination,
        total: data.BaedaegiList.count
      })
    }
  })
  console.log("BAEDAEGI_LIST", data)
  const columns = [
    {
      title: "배대지 주문번호",
      render: (data) => {
        return (
          <div style={{cursor: "pointer"}} 
          onClick={() => {
            if(data.orderSeq){
              shell.openExternal(`https://tabae.co.kr/Front/Acting/Acting_V.asp?shStatSeq=0&ORD_SEQ=${data.orderSeq}`)
            }
          }}>{data.orderNo}</div>
        )
      }
    },
    {
      title: "상태",
      render: (data) => {
        return (
          <div>{data.state}</div>
        )
      }
    },
    {
      title: "타오바오 주문번호",
      render: (data) => {
        return (
          data.orderItems.map((item, i) => {
            return (
              <div key={i}>
                {item.taobaoOrderNo}
              </div>
            )
          })
        )
      }
    },
    {
      title: "타오바오 트래킹번호",
      render: (data) => {
        return (
          data.orderItems.map((item, i) => {
            return (
              <div key={i}>
                {item.taobaoTrackingNo}
              </div>
            )
          })
        )
      }
    },
    {
      title: "주문자",
      render: (data) => {
        return (
          <div>{data.name}</div>
        )
      }
    },
    {
      title: "마켓 주문번호",
      width: 500,
      render: (data) => {
        return (
          data.orderItems.map((item, i) => {
            return (
              <MarketOrderNoForm key={i} data={data} index={i} item={item}/>
            )
          })
        )
      }
    },
    {
      title: "삭제",
      render: (data) => <DeleteForm data={data} />
    }
  ]

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination)
  }

  const radioChange = e => {
    console.log('radio checked', e.target.value);
    setRadio(e.target.value);
  }

  return (
    <Container>
      <SearchContainer>
        <div>
          <Radio.Group onChange={radioChange} value={radio}>
            <Radio value={1}>전체</Radio>
            <Radio value={2}>마켓 주문번호 중복</Radio>
            <Radio value={3}>마켓 주문번호 없음</Radio>
          </Radio.Group>
        </div>
        <Button onClick={async () => {
          const response = await tabaeOrder()
          console.log("response", response)
          // message.success("데이터 수집을 시작합니다.")
          notification['success']({
            message: '배대지 주문서 수집을 시작합니다.',
            description:
              <>
                <div>이 작업은 오래 걸립니다.</div>
              </>
          });
        }}>배대지 수집</Button>
        <Search
          allowClear={true}
          placeholder="검색어를 입력하세요."
          // size="large"
          onSearch={value => {
            setSearch(value)
            refetch()
          }}
          enterButton
        />
        
      </SearchContainer>
      
    <Table 
      columns={columns}
      dataSource={data && data.BaedaegiList ? data.BaedaegiList.list : []}
      pagination={pagination}
      loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      onChange={handleTableChange}
      />
    </Container>
  )
}

export default BaedaegiForm

const MarketOrderNoForm = ({data, index, item}) => {
  const [modifyTitle, setModifyTitle] = useState(item.marketOrderNumber)
  const [isModify, setModify] = useState(false)
  const [orderNumber, setOrderNumber] = useState(item.marketOrderNumber)
  const [modifyOrderNumber] = useMutation(BAEDAEGI_ITEM_MARKETORDER_MODIFY)

  const handleModifyCancle = () => {
    setModify(false)
    setOrderNumber(item.marketOrderNumber)
  }

  const handleModifyOrderNumber = async () => {
    console.log("id", data.orderNo, orderNumber)
    const response = await modifyOrderNumber({
      variables: {
        orderNumber: data.orderNo,
        marketNumber: orderNumber,
        index
      }
    })
    if(response.data.BaedaegiItmeMarketOrderNoModify) {

      setModify(false)
      setModifyTitle(orderNumber)
      notification["success"]({
        message: (
          <>
          <div>{data.orderNo}</div>
          <div>주문번호를 변경하였습니다.</div>
          </>
        )
      })
    }
    // console.log("response", response)
  }

  if(!isModify){
    return (
      <OrderNumberContainer>
        <div style={{color: "#512da8"}}>
          {modifyTitle}
        </div>
        <EditTwoTone style={{ fontSize: "14px", marginLeft: "10px", cursor: "pointer", marginTop: "6px"}}
          onClick={() => setModify(true)}
        />
    </OrderNumberContainer>
    )
  } else {
    return (
      <InputContainer>
        <Input 
          allowClear
          
          addonBefore="주문번호"
          value={orderNumber}
          onChange={e => {
            setOrderNumber(e.target.value)
          }}
          // onBlur={e=>{
          //   setRootTitle(index, e.target.value)
          // }}
          border={false}
          style={{
            marginBottom: "6px",
            border: "3px solid #512da8"
          }}
        />
        <Button icon={<CloseOutlined />} 
          style={{margin: "5px"}}  
          danger shape="circle"
          onClick={handleModifyCancle}
        />
        <Button icon={<CheckOutlined />}
          style={{marginTop: "5px", marginBottom: "5px"}}  
          type="primary" shape="circle"
          onClick={handleModifyOrderNumber}
        />
      </InputContainer>
    )
  }

  return null
  
}
const DeleteForm = ({data}) => {
  

  const [deleteItem] = useMutation(BAEDAEGI_ITEM_DELETE)
  
  const [loading, setLoading] = useState(false)
  const [isDelete, setDelete] = useState(data.isDelete)

  
  const onChange = async (checked) => {
    setLoading(true)
    console.log(`switch to ${checked} ${data.orderNo}`)
    const response = await deleteItem({
      variables: {
        orderNumber: data.orderNo,
        isDelete: checked
      }
    })
    
    if(response.data.BaedaegiItmeDelete){
      notification["success"]({
        message: `주문번호 ${data.orderNo}`
      })
      setDelete(checked)
    } else {
      notification["error"]({
        message: `주문번호 ${data.orderNo} 실패하였습니다.`
      })
    }
    setLoading(false)

  }
  return (
    <Switch checked={isDelete} onChange={onChange} loading={loading}/>
  )
}

const Container = styled.div`
  padding: 20px;
`

const OrderNumberContainer = styled.div`
  display: flex;
`

const InputContainer = styled.div`
  /* margin-top: 10px; */
  display: flex;
`

const SearchContainer = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  &>:nth-child(1){
    min-width: 500px;
    max-width: 500px;
    display: flex;
    justify-content: center;
  }
  &>:nth-child(2){
    min-width: 100px;
    max-width: 100px;
    margin-right: 10px;
  }
  &>:nth-child(3){
    width: 100%;
  }
`