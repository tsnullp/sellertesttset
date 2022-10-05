import React, {useState} from "react"
import styled from "styled-components"
import { Table, Button, Checkbox, Input, InputNumber, Switch, message, notification, Image, Tooltip, Tag, Popconfirm} from "antd"
import {
  GET_LOWESTPRICE_LIST,
  GET_COUPANG_PRODUCT_LIST,
  TAOBAO_IMAGE_LIST_URL,
  SET_LOWPRICE_MANAGE,
  EXCEPT_PRODUCT,
  DELETE_COUPANG
} from "gql"
import {
  SearchOutlined,
  DownloadOutlined,
  TrophyFilled,
  ShoppingOutlined,
  UploadOutlined,
  SyncOutlined,
  MonitorOutlined,
  SmileTwoTone,
  FrownTwoTone,
  QuestionCircleOutlined,
  DeleteTwoTone
} from "@ant-design/icons"
import { useQuery, useMutation } from "@apollo/client"

const { shell } = window.require("electron")
const { Search } = Input

const LowestProduct = () => {
  
  const [search, setSearch] = useState("")
  const [notWinner, setNotWinner] = useState(true)
  const [isWinner, setWinner] = useState(false)
  const [isNaver, setNaver] = useState(false)
  const [isExcept, setExcept] = useState(false)
  const [isManage, setManage] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10
  })

  const [getCoupangProductList] = useMutation(GET_COUPANG_PRODUCT_LIST)
  const [exceptProduct] = useMutation(EXCEPT_PRODUCT)

  const { data, refetch, networkStatus } = useQuery(GET_LOWESTPRICE_LIST, {
    variables: {
      page: pagination.current,
      perPage: pagination.pageSize,
      search,
      notWinner,
      isWinner,
      isNaver,
      isExcept,
      isManage
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      setPagination({
        ...pagination,
        total: data.GetLowestPriceList.count
      })
    }
  })

  const [deleteCoupang] = useMutation(DELETE_COUPANG)
  const [isLoading, setLoading] = useState(null)

  const confirmCoupang = async data => {
    console.log("data--", data)
    setLoading(data.sellerProductId)
    const response = await deleteCoupang({
      variables: {
        coupangID: data.sellerProductId
      }
    })
    console.log("response", response)
    if (response.data.DeleteCoupang) {
      notification["success"]({
        message: "삭제하였습니다."
      })
      refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요."
      })
    }
    setLoading(null)
  }

  const handelExceptProduct = async (_id, isExcept) => {
    console.log("_id, isExcept", _id, isExcept)
    const response = await exceptProduct({
      variables: {
        _id, isExcept
      }
    })
    console.log("response", response)
    refetch()
    if(response.data.ExceptProduct){

      if(isExcept){
        notification["success"]({
          message: '제외 요청',
          description:
            <p>해당 상품을 제외하였습니다.</p>
        })
      } else {
        notification["success"]({
          message: '제외 해제 요청',
          description:
            <p>해당 상품을 제외 해제 하였습니다.</p>
        });
      }
    }  else {
      notification["error"]({
        message: '제외 요청',
        description:
          <p>제외 요청에 실패했습니다.</p>
      });
    }
  }
  const columns = [
    {
      title: "등록",
      dataIndex: "user",
      width: "100px",
      render: user => {
        if(user){
          return (
            <AvatarContainer>
              <Avatar src={user.avatar} />
              <NickName>{user.nickname}</NickName>
            </AvatarContainer>
          )
        } else {
          return null
        }
      }
    },
    {
      title: "상품명",
      // dataIndex: "sellerProductName",      
      render: data => (
        <span style={{fontWeight: "700", color:"#121212"}}>
          {data.sourcingType === 1 && <Tooltip title="아이템위너 매칭">
                <TrophyFilled
                  style={{
                    color: "#ffd700",
                    fontSize: "18px",
                    marginLeft: "-1px",
                    marginRight: "4px"
                  }}
                />
              </Tooltip>}
          {data.sourcingType === 2 && (
              <Tooltip title="네이버 쇼핑">
                <ShoppingOutlined
                  style={{
                    color: "#20C73D",
                    fontSize: "18px",
                    marginLeft: "-1px",
                    marginRight: "4px"
                  }}
                />
              </Tooltip>
            )}
          {data.sourcingType === 3 && (
              <Tooltip title="대량 등록">
                <UploadOutlined
                  style={{
                    color: "#d05ce3",
                    fontSize: "18px",
                    marginLeft: "-1px",
                    marginRight: "4px"
                  }}
                />
              </Tooltip>
            )}
          {data.sellerProductName}
        </span>
      )
    },
    {
      title: "관리 중",
      render: ({isExcept, items}) => {
        if(items.filter(item => item.isManage).length > 0){
          return (
            <SyncOutlined 
              style={{fontSize: "18px", color: "#FF3377"}}
            spin={!isExcept}
            />
          )
        } else {
          return null
        }
      }
    },
    {
      title: "제외",
      render: ({_id, isExcept}) => (
        <Switch 
          checked={isExcept}
          
          onChange={(checked) => {
            handelExceptProduct(_id, checked)

          }}
        />
      )
    },
    {
      title: "삭제",
      render: (data) => (
        <div>
          <Tooltip title="쿠팡 삭제">
            <Popconfirm
              title="쿠팡 상품을 삭제하시겠습니까？"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              cancelText="취소"
              okText="삭제"
              onConfirm={() => confirmCoupang(data)}
            >
              <ColumnContainer>
                <Tag
                  style={{
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                  icon={
                    <>
                      <img
                        width="16px"
                        src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                        alt="coupang"
                      />
                      <DeleteTwoTone
                        style={{ fontSize: "14px", color: "#FF3377", padding: "3px" }}
                      />
                    </>
                  }
                ></Tag>
              </ColumnContainer>
            </Popconfirm>
          </Tooltip>
        </div>
      )
    }
  ]
  console.log("data", data)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination(pagination)
  }
  return (
    <>
      <FilterContainer>
        <Button
          onClick={async() => await getCoupangProductList()}
          icon={<MonitorOutlined />}
        >수집</Button>
        <Checkbox style={{minWidth: "120px", marginLeft: "30px"}} onChange={(e) => setNotWinner(e.target.checked)} checked={notWinner}>위너 뺏긴 상품</Checkbox>
        <Checkbox style={{minWidth: "100px"}} onChange={(e) => setNaver(e.target.checked)} checked={isNaver}>네이버쇼핑</Checkbox>
        <Checkbox style={{minWidth: "100px"}} onChange={(e) => setWinner(e.target.checked)} checked={isWinner}>쿠팡</Checkbox>
        <Checkbox style={{minWidth: "100px"}} onChange={(e) => setManage(e.target.checked)} checked={isManage}>관리중</Checkbox>
        <Checkbox style={{minWidth: "100px", marginRight: "30px"}} onChange={(e) => setExcept(e.target.checked)} checked={isExcept}>제외</Checkbox>
        <Search
          allowClear={true}
          placeholder="제목을 입력하세요."
          size="large"
          onSearch={value => {
            setSearch(value)
            refetch()
          }}
          enterButton
        />
      </FilterContainer>
      
      <Table 
        columns={columns}
        rowKey={record => record._id}
        dataSource={data && data.GetLowestPriceList ? data.GetLowestPriceList.list : []}
        pagination={pagination}
        loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
        onChange={handleTableChange}
        expandable={{
          expandRowByClick:true, 
          rowExpandable: record => record.items.length > 0,
          // defaultExpandAllRows: true,
          expandedRowRender: record => {
            return (
              <OptionItemForm items={record.items.filter(item => item.status >= 1)} />
            )
            // return record.items.filter(item => item.status > 1).map(item => 
            //   <ItemsContainer key={item._id} >
            //     <div>{item.itemName}</div>
            //   </ItemsContainer>
            // )
          }
        }}
      />
    </>
  )
}

export default LowestProduct

const AvatarContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  color: lightgray;
`

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  margin-right: 5px;
  background: white;
`

const NickName = styled.div`
  color: gray;
  font-size: 11px;
  margin-bottom: 2px;
`


const OptionItemForm = ({items}) => {

  const [selected, setSelected] = useState(items.map(item => {
    let minPrice = item.minPrice ? item.minPrice : Math.ceil(((item.otherSeller[0].price - (item.otherSeller[0].price * 0.15)) * 0.1)) * 10
    let subPrice = item.salePrice - minPrice
    // 마진율
    let margin = item.margin
    // 최초 마진금액
    let marginPrice = Number((item.salePrice * (margin / 100)).toFixed(0))
    // 변경된 마진금액
    let subMarinPrice = marginPrice - subPrice
    // 변경된 마진율
    let subMargin = Number(((subMarinPrice / item.salePrice) * 100).toFixed(1))

    return {
      selected: false,
      isManage: item.isManage,
      minPrice,
      margin: subMargin
    }
  }))

  const [batchMargin, setBatchMargin] = useState(null)
  const [batchMinPrice, setBatchMinPrice] = useState(null)

  const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)
  const [setLowPrice] = useMutation(SET_LOWPRICE_MANAGE)
  const [isLoading, setLoading] = useState(null)

  const allChceckChange = (e) => {
    const temp = selected.map(item => {
      return {       
        ...item,
        selected: e.target.checked
      }
    })
    setSelected(temp)
  }

  const checkChange = (e, index) => {
    const temp = selected.map((item, i) => {
      return {
        ...item,
        selected: index === i ? e.target.checked : item.selected
      }
    })
    setSelected(temp)
  }

  const marginPriceChange = (value, index) => {
    const temp = selected.map((item, i) => {
      let salePrice = null
      let margin = null
      if(i === index){
        // 원래 마진 금액
        let marginPrice = items[index].minPrice
        let subPrice = value - marginPrice
        salePrice = items[index].salePrice - subPrice
        // 마진은?
        margin = Number(((subPrice / salePrice) * 100).toFixed(1))
      }
      return {
        ...item,
        minPrice: index === i ? salePrice : item.minPrice,
        margin: index === i ? margin : item.margin,
      }
    })
    setSelected(temp)
  }
  const minPriceChange = (value, index) => {
    const temp = selected.map((item, i) => {
      // let salePrice = null
      let subMargin = null
      if(i === index && items[index].margin){
        // 원래 판매가 - 최저 판매가 = 판매가 차액
        let subPrice = items[index].salePrice - value
        // 마진율
        let margin = items[index].margin
        // 최초 마진금액
        let marginPrice = Number((items[index].salePrice * (margin / 100)).toFixed(0))
        // 변경된 마진금액
        let subMarinPrice = marginPrice - subPrice
        // 변경된 마진율
        subMargin = Number(((subMarinPrice / value) * 100).toFixed(1))

      }
      return {
        ...item,
        minPrice: index === i ? value : item.minPrice,
        margin: index === i ? subMargin : item.margin
      }
    })
    setSelected(temp)
  }

  const switchChange = async (checked, index) => {
    const temp = selected.map((item, i) => {
      return {
        ...item,
        isManage: index === i ? checked : item.isManage
      }
    })
    setSelected(temp)

    const response = await setLowPrice({
      variables: {
        input: [{
          sellerProductItemId: items[index].sellerProductItemId,
          margin: items[index].margin ? selected[index].margin * 100 : null,
          minPrice: selected[index].minPrice,
          isManage: checked
        }]
      }
    })
    if(response.data.SetLowPriceManage){
      notification["success"]({
        message: '최저가 관리',
        description:
        checked ? <p>최저가 관리를 요청했습니다.</p> : <p>최저가 관리를 해제 요청했습니다.</p>
      });
    } else {
      notification["error"]({
        message: '최저가 관리',
        description:
          <p>최저가 관리에 실패했습니다.</p>
      });
    }

    
    
  }

  const batchMinPriceChange = (value) => {
    console.log("info", value)
    if(value) {
      if(selected.filter(item => item.selected).length > 0){
        const temp = selected.map((item, i) => {
          console.log("item.selectd", item.selected, value)
          return {
            ...item,
            minPrice: item.selected ? value : item.minPrice
          }
        })
        setSelected(temp)
        notification["info"]({
          message: '선택항목 일괄 변경 성공',
          description:
            <>
              <p>최저판매가를 일괄변경하였습니다.</p>
              <p>최종 최저판매가를 확인하여 적용하여주세요.</p>
            </>
        });

        setBatchMargin(null)
        setBatchMinPrice(null)
      } else {
        notification["warning"]({
          message: '선택항목 일괄 변경 실패',
          description:
            <>
              <p>선택된 항목이 없습니다.</p>
            </>
        });
      }
    } else {
      notification["error"]({
        message: '선택항목 일괄 변경 실패',
        description:
          <>
            <p>최저판매가를 입력해 주세요.</p>
          </>
      });
    }
   
    
  }

  const batchApply = async () => {
   
    if(selected.filter(item => item.selected).length > 0){
      const temp = selected.map((item, i) => {
        
        return {
          ...item,
          isManage: item.selected ? true : item.isManage
        }
      })
      setSelected(temp)

      const inputTemp = temp.map((item, index) => {
        return {
          ...item,
          index
        }
      }).filter(item => item.selected)
     
      const response = await setLowPrice({
        variables: {
          input: inputTemp.map(item => {
            return {
              sellerProductItemId: items[item.index].sellerProductItemId,
              margin: items[item.index].margin ? selected[item.index].margin * 100 : null,
              minPrice: selected[item.index].minPrice,
              isManage: true
            }
          })
        }
      })
      notification["info"]({
        message: '선택항목 일괄 최저가 관리',
        description:
          <p>최저가 관리를 요청했습니다.</p>
      });

      
    } else {
      notification["warning"]({
        message: '선택항목 일괄 변경 실패',
        description:
          <>
            <p>선택된 항목이 없습니다.</p>
          </>
      });
    }
  }
  return (
    <OptionsWrapper>
      <BatchContainer>
        {items.filter(item => item.margin).length > 0 && <InputContainer>
          <div>
            최저마진
          </div>
          <InputNumber 
            value={batchMargin}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={value => value.replace(/\$\s?|(,*)/g, "")}
            onChange={(value) => setBatchMargin(value)}
          />
        </InputContainer>}
        <InputContainer>
          <div>
            최저판매가
          </div>
          <InputNumber
            value={batchMinPrice}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            parser={value => value.replace(/\$\s?|(,*)/g, "")}
            onChange={(value) => setBatchMinPrice(value)}
          />
        </InputContainer>
        <div>
          <Button 
            onClick={() => batchMinPriceChange(batchMinPrice)}
          >선택항목 최저판매가 적용</Button>
        </div>
        <div>
          <Button type="primary"
            onClick={() => batchApply()}
          >선택항목 일괄 적용</Button>
        </div>
        
      </BatchContainer>
      <OptinosHeader>
        <Checkbox onChange={allChceckChange} />
        <div>이미지</div>
        <div>검색</div>
        <div>옵션ID</div>
        <div>옵션명</div>
        <div>위너</div>
        <div>판매가</div>
        <div>최저가(판매자)</div>
        {items.filter(item => item.margin).length > 0 && <><div>현재마진</div>
        <div>최저마진</div></>}
        <div>최저판매가</div>
        <div>관리</div>
        <div>수정</div>
      </OptinosHeader>
      <Image.PreviewGroup>
        {items.map((item, index) => {
          let marginPrice = null
          if(item.margin){
            marginPrice = Number((item.salePrice * (item.margin / 100)).toFixed(0))
          }
          
          return (
            <ItemsContainer key={item._id} >
              <Checkbox checked={selected[index].selected} onChange={(e) => checkChange(e, index)} />
              <Image 
                style={{border: "1px solid #EEF1F5"}}
                width={48}
                height={48}
                src={`https://thumbnail7.coupangcdn.com/thumbnails/remote/48x48ex/image/${item.cdnPath}`}
                preview={{
                  src: `https://thumbnail7.coupangcdn.com/thumbnails/remote/482x482ex/image/${item.cdnPath}`
                }}
              />
          
              <div>
                <div style={{marginRight: "5px", width: "45px"}}>
                  <a href={`https://thumbnail7.coupangcdn.com/thumbnails/remote/482x482ex/image/${item.cdnPath}`} download>
                    <Button icon={<DownloadOutlined />} block />
                  </a>
                </div>
                <div>
                  <Button
                    style={{width: "25px"}}
                    loading={isLoading === item}
                    type="primary"
                    icon={<SearchOutlined />}
                    block
                    onClick={async () => {
                      setLoading(item)
                      try {
                        const response = await imageListUrl({
                          variables: {
                            imageUrl: `https://thumbnail7.coupangcdn.com/thumbnails/remote/482x482ex/image/${item.cdnPath}`
                          }
                        })

                        if (response && response.data.TaobaoImageListUrl) {
                          shell.openExternal(response.data.TaobaoImageListUrl.url)
                        } else {
                          notification["error"]({
                            message: "이미지 주소를 가져오는데 실패하였습니다."
                          })
                        }
                      } catch (e) {
                        notification["error"]({
                          message: "이미지 주소를 가져오는데 실패하였습니다."
                        })
                      }
                      
                      setLoading(null)
                    }}
                  />
                </div>
              </div>
              <OptionID
              onClick={() => {
                shell.openExternal(
                  `https://www.coupang.com/vp/products/2071034509?vendorItemId=${item.vendorItemId}`
                )
              }}
              >{item.vendorItemId}</OptionID>
              <div>{item.itemName}</div>
              <div>
                {item.vendorItemId === item.otherSeller[0].vendorItemId && <SmileTwoTone twoToneColor="#fdd835" style={{fontSize: "18px"}}/>}
                {item.vendorItemId !== item.otherSeller[0].vendorItemId && <FrownTwoTone twoToneColor="#eb2f96" style={{fontSize: "18px"}}/>}
                {/* {item.status === 1 && <SmileTwoTone twoToneColor="#fdd835" style={{fontSize: "18px"}}/>}
                {item.status === 2 && <FrownTwoTone twoToneColor="#eb2f96" style={{fontSize: "18px"}}/>} */}
              </div>
              <div>{`${item.salePrice.toLocaleString("ko")}원`}</div>
              <div>{`${item.otherSeller[0].price.toLocaleString("ko")}원 (${item.otherSeller[0].vendorName})`}</div>
              {item.margin && 
                <>
                  <div>{marginPrice ? `${marginPrice.toLocaleString("ko")}원 (${item.margin}%)` : "?"}</div>
                  <div>
                    <InputNumber style={{width: "100%"}} disabled={!marginPrice} step={100}
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                      parser={value => value.replace(/\$\s?|(,*)/g, "")}
                      value={Number((selected[index].minPrice * (selected[index].margin / 100)).toFixed(0))}
                      onChange={value => marginPriceChange(value, index)}
                    />
                    <div>{`(${selected[index].margin}%)`}</div>
                  </div>
                </>
            }
              <div>
                <InputNumber step={100} min={0}
                  style={{width: "100%"}}
                  value={selected[index].minPrice}
                  onChange={value => minPriceChange(value, index)}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  parser={value => value.replace(/\$\s?|(,*)/g, "")}
                />
              </div>
              <div>
                <Switch defaultChecked={item.isManage}
                  checked={selected[index].isManage}
                  onClick={(checked) => {
                    if(checked){
                      if(!selected[index].minPrice){
                        message.warning('최저가를 입력해주세요!');
                      } else {
                        switchChange(checked, index)
                      }
                    } else {
                      switchChange(checked, index)
                    }
                  }}
                />
              </div>
              <div>
                {
                  selected[index].isManage && 
                  <Button
                  onClick={() => switchChange(true, index)}
                  >수정</Button>
                }
              </div>
            </ItemsContainer>
          )
        })}
      </Image.PreviewGroup>
    </OptionsWrapper>
  )
}


const BatchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  &>:nth-child(n){
    margin-left: 10px;
  }
  margin-bottom: 10px;
`

const InputContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;

  &>:nth-child(2){
    margin-left: 10px;
    min-width: 140px;
  }
`
const OptionsWrapper = styled.div`
  /* margin-top: 20px; */
  margin-bottom: 50px;
  max-height: 500px;
  overflow-y: auto;
`


const ItemsContainer = styled.div`
  display: flex;
  margin-top: 5px;
  padding-bottom: 5px;
  border-bottom: 1px dashed #C9C9C9;
  & > :nth-child(1) {
    min-width: 50px;
    max-width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  & > :nth-child(2) {
    min-width: 50px;
    max-width: 50px;
    margin-left: 20px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-child(3) {
    min-width: 50px;
    max-width: 50px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-child(4) {
    min-width: 90px;
    max-width: 90px;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-child(5) {
    width: 100%;
    display: flex;
    align-items: center;
  }
  & > :nth-child(6) {
    min-width: 50px;
    max-width: 50px;
    display: flex;
    align-items: center;
  }
  & > :nth-child(7) {
    min-width: 100px;
    max-width: 100px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  & > :nth-child(8) {
    min-width: 200px;
    max-width: 200px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  & > :nth-child(9) {
    min-width: 100px;
    max-width: 100px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  & > :nth-child(10) {
    min-width: 150px;
    max-width: 150px;
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-last-child(3) {
    min-width: 130px;
    max-width: 130px;
    margin-left: 10px;
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-last-child(2) {
    min-width: 50px;
    max-width: 50px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  & > :nth-last-child(1) {
    min-width: 50px;
    max-width: 50px;
    margin-left: 20px;
    margin-right: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`

const OptinosHeader = styled(ItemsContainer)`
  margin-top: 0;
  align-items: center;
  height: 45px;
  background: #EEF1F5;
`

const OptionID = styled.div`
  cursor: pointer;
  &:hover{
    text-decoration: underline;
    color: #512da8;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`

const ColumnContainer = styled.div`
  cursor: pointer;
  vertical-align: middle;
  display: table-cell;
`