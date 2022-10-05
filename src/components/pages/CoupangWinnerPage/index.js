import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react"
import { Input, Button, Tabs, BackTop, message } from "antd"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { CoupangWinnerItem } from "components"
import { useQuery, useMutation } from "@apollo/client"
import { GET_COUPANG_STORE_ITEM_LIST,  GET_COUPANG_KEYWORD_ITEM_LIST, GET_COUPANG_MALL_LIST, SET_COUPANG_FAVORITE, GET_COUPANG_MALL_FAVORITE_LIST, UPLOAD_ITEM_WINNER_LIST, GET_SUBPRICE, } from "gql"
import {CheckOutlined, StarOutlined, StarFilled, RedoOutlined, ShopOutlined, TrophyFilled} from "@ant-design/icons"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
const { Search } = Input
const { TabPane } = Tabs
const { shell} = window

const CoupangWinnerPage = () => {
  const [searchUrl, setSearchUrl] = useState("")
  const [count, setCount] = useState(0)
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [getCoupangStore] = useMutation(GET_COUPANG_STORE_ITEM_LIST)
  const [getCoupangKeyword] = useMutation(GET_COUPANG_KEYWORD_ITEM_LIST)
  const [uploadWinner] = useMutation(UPLOAD_ITEM_WINNER_LIST)
  const [getSubPrice] = useMutation(GET_SUBPRICE)
  const [subPrice, SetSubPrice] = useState(200)


  const childRef = useRef()
  const favoriteRef = useRef()

  useEffect(() => {
    try {
      setTimeout(async() => {
        const response = await getSubPrice()
        SetSubPrice(response.data.GetSubPrice)
      })
    } catch (e){
    }
  }, [])


  const handleUrl = async value => {
    setList([])
    setCount(0)
    setLoading(true)
    setSearchUrl(value)
    if(value.includes("http")){
      const response = await getCoupangStore({
        variables: {
          url: value
        }
      })
      console.log("response", response)
      setCount(response.data.GetCoupangStoreItemList.count)
      setList(response.data.GetCoupangStoreItemList.list || [])
    } else {
      const response = await getCoupangKeyword({
        variables: {
          keyword: value
        }
      })
      console.log("response", response)
      setCount(response.data.GetCoupangKeywordItemList.count)
      setList(response.data.GetCoupangKeywordItemList.list || [])
    }
    
    setLoading(false)
    setTimeout(() => {
      console.log("여기여기", childRef.current)
      // window.scrollTo(0, 0)
      if(childRef && childRef.current){
        childRef.current.scrollTop()
      }
      
    }, 500)
  }

  const handleUpload = async() => {
    setUploading(true)
    const val = childRef.current.showAlert()
    console.log("val", val)
    const response = await uploadWinner({
      variables: {
        input: val.map(item => {
          return {
            title: item.title,
            detail: item.detail,
            detailUrl: item.detailUrl,
            subPrice: item.subPrice,
            isClothes: item.isClothes,
            isShoes: item.isShoes,
          }
        })
      }
    })
    if(response.data.UploadItemWinnerList){
      message.success("업로드 요청을 하였습니다.")
      setList([])
      setCount(0)
    } else {
      message.error("업로드 요청에 실패하였습니다.")
    }
    console.log("response", response)
    setUploading(false)
  }

  const marketClick = (mallPcUrl) => {
    handleUrl(mallPcUrl)
  }

  const handleFavoriteChange = () => {
    if(favoriteRef && favoriteRef.current && favoriteRef.current.refetchList){
      favoriteRef.current.refetchList()
    }
  }
  
  return (
    <RootContainer>
      <Tabs defaultActiveKey="2">
        <TabPane
          tab={<span >
            <StarFilled style={{
              fontSize: "18px",
              color: "#ffd700"
            }}/>
            즐겨찾기</span>}
          key="1"
        >
            <FavoriteList marketClick={marketClick}
           ref={favoriteRef}
            />

        </TabPane>
        <TabPane
        tab={<span >
          <ShopOutlined 
          style={{
            fontSize: "18px",
            
          }}
          />
          전체</span>}
        key="2"
        >
          <MallList marketClick={marketClick}
             handleFavoriteChange={handleFavoriteChange}
            />
        </TabPane>
      </Tabs>
      
      <Container>
        <SearchContainer>
          <Button
            size="large"
            style={{ height: "100%", width: "180px", fontSize: "16px", fontWeight: "700", marginRight: "10px" }}
            icon={<ShopOutlined />}
            onClick={() => {
              if(searchUrl.length > 0){
                shell.openExternal(searchUrl)
              }
            }}
          >
            {`상점(${count.toLocaleString("ko")})`}
          </Button>
          <Search
            loading={loading}
            allowClear={true}
            size="large"
            placeholder="쿠팡 판매자 상점 URL 또는 상품 키워드를 입력해주세요"
            onSearch={value => handleUrl(value)}
            enterButton
            value={searchUrl}
            onChange={e => setSearchUrl(e.target.value)}
          />
          <Button
            size="large"
            type="primary"
            style={{ height: "100%", width: "100px", fontSize: "16px", fontWeight: "700", marginLeft: "10px" }}
            icon={<TrophyFilled style={{ fontSize: "16px" }} />}
            loading={uploading}
            onClick={async () => {

              handleUpload()

            }}
          >
            위너
         </Button>
        
        </SearchContainer>
        <CoupangStoreItemContainer>
          <CoupangWinnerItem count={count} list={list} loading={loading} ref={childRef} subPrice={subPrice}/>
        </CoupangStoreItemContainer>
      </Container>
      
    </RootContainer>
  )
}

export default CoupangWinnerPage

const RootContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  & > :nth-child(1){
    min-width: 200px;
    max-width: 200px;
    margin-left: 10px;
    margin-right: 10px;
    padding-right: 10px;
    border-right: 2px dashed #512da8;
  }
  & > :nth-child(2){
    width: 100%;
    margin-right: 10px;
  }
`

const FavoriteContainer = styled(SimpleBar)`
  max-height: calc(100vh - 200px);
  min-height: calc(100vh - 200px);

  overflow-y: auto; 
`
const Container = styled.div`

`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`

const MallList = ({marketClick, handleFavoriteChange}) => {
  const [list, setList] = useState([])
  const [selectedID, setSelectedID] = useState(null)
  const [filter, setFilter] = useState("")
  const { networkStatus, data, refetch } = useQuery(GET_COUPANG_MALL_LIST,
    {
      notifyOnNetworkStatusChange: true,
      onCompleted: data => {
        setList(data.GetCoupangMallList)
      }
    }
    )
  const [setFavorite] = useMutation(SET_COUPANG_FAVORITE)

  const handleSelect = (_id) => {
    setSelectedID(_id)
  }
  const handleFavorite = async (_id, isFavorite) => {

    await setFavorite({
      variables: {
        _id
      },
      
    })
    const temp = list
    setList(temp.map(item => {
      return {
        ...item,
        isFavorite: item._id === _id ? !isFavorite : item.isFavorite
      }
    }))
    handleFavoriteChange()
  }
  if (networkStatus === 1 || networkStatus === 2 || networkStatus === 4) {
    return null
  }
 
  if (list) {
    return (
      <div>
        <FilterContainer>
          <Input 
            allowClear
            value={filter} 
            onChange={e => setFilter(e.target.value)}/>
          <Button
            icon={<RedoOutlined />} 
            onClick={() => refetch()}
          />
        </FilterContainer>
        <FavoriteContainer>
        {list.filter(item => {
          if(filter.length > 0){
            if(item.marketName && item.marketName.includes(filter)) {
              return true
            } {
              return false
            }
          }
          return true
        }).map((item, index) => 
          <FavoriteItem key={index}
            isSelected={selectedID === item._id}
            onClick={() => {
              handleSelect(item._id)
              if(typeof marketClick === "function"){
                marketClick(item.mallPcUrl)
              }
            }}
          >          
            {item.isFavorite && 
              <FavoriteButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleFavorite(item._id, item.isFavorite)
              }}
              >
                <StarFilled />
              </FavoriteButton>}
            {!item.isFavorite && 
              <FavoriteButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleFavorite(item._id, item.isFavorite)
              }}
              >
               <StarOutlined />
              </FavoriteButton>}
            {item.marketName}
          </FavoriteItem>
        )}
        </FavoriteContainer>
      </div>
    )
    
  }
  return null
}

const FavoriteList = forwardRef(({marketClick}, ref) => {
  const [filter, setFilter] = useState("")
  const [selectedID, setSelectedID] = useState(null)
  const { loading, data, refetch } = useQuery(GET_COUPANG_MALL_FAVORITE_LIST)
  const [setFavorite] = useMutation(SET_COUPANG_FAVORITE)

  useImperativeHandle(ref, () => ({
    refetchList() {
      refetch()
    }
  }));

  const handleSelect = (_id) => {
    setSelectedID(_id)
  }

  const handleFavorite = async (_id) => {
    console.log("_id", _id)
    const response = await setFavorite({
      variables: {
        _id
      }
    })
   
    refetch()
  }
  if (loading) {
    return null
  }
  
  if (data && data.GetCoupangMallFavoriteList) {
    return (
      <div>
        <FilterContainer>
          <Input 
            allowClear
            value={filter} 
            onChange={e => setFilter(e.target.value)}/>
          <Button
            icon={<RedoOutlined />} 
            onClick={() => refetch()}
          />
        </FilterContainer>
        <FavoriteContainer>
        {data.GetCoupangMallFavoriteList.filter(item => {
          if(filter.length > 0){
            if(item.marketName && item.marketName.includes(filter)) {
              return true
            } {
              return false
            }
          }
          return true
        }).map((item, index) => 
          <FavoriteItem key={index}
            isSelected={selectedID === item._id}
            onClick={() => {
              handleSelect(item._id)
              if(typeof marketClick === "function"){
                marketClick(item.mallPcUrl)
              }
            }}
          >          
            {item.isFavorite && 
              <FavoriteButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleFavorite(item._id)
              }}
              >
                <StarFilled />
              </FavoriteButton>}
            {!item.isFavorite && 
              <FavoriteButton
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleFavorite(item._id)
              }}
              >
               <StarOutlined />
              </FavoriteButton>}
            {item.marketName}
          </FavoriteItem>
        )}
        </FavoriteContainer>
      </div>
    )
    
  }
  return null
})

const FavoriteItem = styled.div`
  padding-top: 8px;
  padding-bottom: 8px;
  
  ${ifProp(
    "isSelected",
    css`
      background: rgba(233, 233, 123, 0.4)
    `
  )};

  cursor: pointer;
  &:hover{
    font-weight: 700;
    background: rgba(233,233,123,0.2);
  }
  border-bottom: 1px solid #b2b3b3;
  display: flex;
  align-items: center;
  &>:nth-child(1){
    min-width: 30px;
    max-width: 30px;
    font-size: 18px;
    color: #ffd700;
  }
  &>:nth-child(2){
    width: 100%;
    line-height: 1.2;
    text-align: center;
    font-size: 14px;
  }
`

const FilterContainer = styled.div`
 
  display: flex;
  align-items: center;
  &>:nth-child(1){
    width: 100%;
  }
  &>:nth-child(2){
    margin-left: 5px;
    min-width: 40px;
    max-width: 40px;
  }
`

const FavoriteButton = styled.div`
  padding: 5px;
`

const CoupangStoreItemContainer = styled(SimpleBar)`
  max-height: calc(100vh - 160px);
  min-height: calc(100vh - 160px);

  overflow-y: auto;
`