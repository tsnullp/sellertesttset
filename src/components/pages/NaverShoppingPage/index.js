import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from "react"
import { Input, Button, Tabs, message, Popconfirm } from "antd"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { NaverStoreItem, SearchFilter } from "components"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_NAVER_STORE_ITEM_LIST,
  GET_NAVER_KEYWORD_ITEM_LIST,
  GET_NAVER_RECOMMEND_ITEM_LIST,
  GET_NAVER_FAVORITE_ITEM_LIST,
  GET_NAVER_FAVORITE_RECOMMEND_ITEM_LIST,
  GET_NAVER_MALL_LIST,
  SET_NAVER_FAVORITE,
  GET_NAVER_MALL_FAVORITE_LIST,
  UPLOAD_ITEM_NAVER_LIST,
  GET_SHIPPINGPRICE,
  GET_COUPANG_MALL_LIST,
  SET_COUPANG_FAVORITE,
  GET_COUPANGE_STORE_ITEM_LIST,
  SET_NAVER_FAVORITE_ITEM_DELETE
} from "gql"
import {
  CheckOutlined,
  StarOutlined,
  StarFilled,
  RedoOutlined,
  ShopOutlined,
  ControlOutlined,
} from "@ant-design/icons"

import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
const { Search } = Input
const { TabPane } = Tabs
const { shell } = window

const NaverShoppingPage = () => {
  const [mode, setMode] = useState("1")

  const [searchUrl, setSearchUrl] = useState("")
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [getNaverStore] = useMutation(GET_NAVER_STORE_ITEM_LIST)
  const [getNaverKeyword] = useMutation(GET_NAVER_KEYWORD_ITEM_LIST)
  const [getCoupangStore] = useMutation(GET_COUPANGE_STORE_ITEM_LIST)
  const [getNaverRecommend] = useMutation(GET_NAVER_RECOMMEND_ITEM_LIST)
  const [getNaverFavoriteList] = useMutation(GET_NAVER_FAVORITE_ITEM_LIST)
  const [getNaverFavoriteRecommend] = useMutation(GET_NAVER_FAVORITE_RECOMMEND_ITEM_LIST)
  const [uploadNaverItem] = useMutation(UPLOAD_ITEM_NAVER_LIST)
  const [getShippingPrice] = useMutation(GET_SHIPPINGPRICE)
  const [setNaverFavoriteItemDelete] = useMutation(SET_NAVER_FAVORITE_ITEM_DELETE)
  const [shippingPrice, SetShippingrice] = useState(200)

  const [isRecommend, setRecommend] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const childRef = useRef()
  const favoriteRef = useRef()

  useEffect(() => {
    try {
      setTimeout(async () => {
        const response = await getShippingPrice()
        if (response.data.GetShippingPrice.length === 0) {
          message.error("추가금액과 배송비 설정이 되지 않았습니다.")
        }
        SetShippingrice(response.data.GetShippingPrice)
      })
    } catch (e) {}
  }, [])

  const handleUrl = async (value) => {
    if (!value || value.length === 0) {
      return
    }

    if(mode !== "6"){
      setList([])
    }
    

    setLoading(true)
    console.log("value", value)
    if (value.includes("shopping.naver.com") || value.includes("smartstore.naver")) {
      setMode("1")
      setSearchUrl(value)

      const response = await getNaverStore({
        variables: {
          url: value,
        },
      })
      
      setList(response.data.GetNaverStoreItemList || [])
    } else if (value.includes("g_page_config")) {
      setMode("5")
      const temp1 = value.split("g_page_config = ")[1]
      const temp2 = temp1.split(";     g_srp_loadCss()")[0]

      const itemValue = JSON.parse(temp2)
      if (
        itemValue &&
        itemValue.mods &&
        itemValue.mods.itemlist &&
        itemValue.mods.itemlist.data &&
        itemValue.mods.itemlist.data.auctions
      ) {
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
        // console.log("auctions", auctions)
        const data = auctions
          .filter((item) => !item.detail_url.includes("click.simba"))
          .map((item) => {
            let image = null
            if (item.pic_url.includes("http")) {
              image = `${item.pic_url}_200x200.jpg`
            } else {
              image = `https:${item.pic_url}_200x200.jpg`
            }
            let detailUrl = null
            if (item.detail_url.includes("http")) {
              detailUrl = `${item.detail_url}`
            } else {
              detailUrl = `https:${item.detail_url}`
            }
            return {
              image,
              detailUrl,
              rawTitle: item.raw_title,
              name: "",
              good_id: item.nid,
            }
          })

        setList(data || [])
        setSearchUrl("")
      }
    } else if (value.includes("coupang.com")) {
      setMode("6")
      setSearchUrl(value)

      const response = await getCoupangStore({
        variables: {
          url: value,
        },
      })

      setList(response.data.GetCoupangStoreItemListNew || [])
    } else if (value && value.length > 0) {
      let dummyData = []
    
      if(mode === "6") {
    
        dummyData.push(...list)
      }
    
      setMode("6")
      setSearchUrl(value)

      const response = await getNaverKeyword({
        variables: {
          keyword: value,
        },
      })
      console.log("response", response)
      for(const item of response.data.GetNaverKeywordItemList){
        if(dummyData.filter(fItem => fItem.productNo.toString() === item.productNo.toString()).length === 0){
          dummyData.push(item)
        }
      }
      // dummyData.push(...response.data.GetNaverKeywordItemList)
      setList(dummyData)
    }

    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleRecommend = async () => {
    setMode("1")
    setRecommend(true)
    setList([])
    setLoading(true)
    setSearchUrl(null)

    const step = Number(localStorage.getItem("recommendLimit") || 10)
    const regDay = Number(localStorage.getItem("regDay") || 300)
    const minRecent = Number(localStorage.getItem("minRecent") || 1)
    const maxRecent = Number(localStorage.getItem("maxRecent") || 50)
    const totalMinSale = Number(localStorage.getItem("totalMinSale") || 0)
    const totalMaxSale = Number(localStorage.getItem("maxRtotalMaxSaleecent") || 100)
    const category = localStorage.getItem("filterCateory") || ""
    const minReview = Number(localStorage.getItem("minReview") || 1)
    const maxReview = Number(localStorage.getItem("maxReview") || 1000)
    const minPrice = Number(localStorage.getItem("minPrice") || 1)
    const maxPrice = Number(localStorage.getItem("maxPrice") || 2000000)

    const response = await getNaverRecommend({
      variables: {
        limit: step,
        regDay,
        minRecent,
        maxRecent,
        totalMinSale,
        totalMaxSale,
        category,
        minReview,
        maxReview,
        minPrice,
        maxPrice,
      },
    })

    setList(response.data.GetNaverRecommendItemList || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleSavedRecommend = async () => {
    setMode("4")
    setRecommend(true)
    setList([])
    setLoading(true)
    setSearchUrl(null)

    const response = await getNaverFavoriteList()

    setList(response.data.GetNaverFavoriteItemList || [])
    console.log("response.data.GetNaverFavoriteItemList", response.data.GetNaverFavoriteItemList)
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleFavoriteRecommend = async () => {
    setRecommend(true)
    setList([])
    setLoading(true)
    setSearchUrl(null)
    const response = await getNaverFavoriteRecommend()
    console.log("response", response)
    setList(response.data.GetNaverFavoriteRecommendItemList || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleUpload = async () => {
    setUploading(true)
    const val = childRef.current.showAlert()
    console.log("val", val)
    

    setSearchUrl("")
    const input = []
    for(const item of val) {

      input.push({
        productNo: item.productNo.toString(),
        title: item.title,
        detail: item.detail,
        detailUrl: item.detailUrl,
        shippingWeight: item.shippingWeight,
        isClothes: item.isClothes,
        isShoes: item.isShoes,
        sellerTags:
          item.sellerTags && Array.isArray(item.sellerTags) && item.sellerTags.length > 0
            ? item.sellerTags
            : item.keyword
            ? item.keyword
                .split(",")
                .filter((item) => item.trim().length > 0)
                .map((item) => item.trim())
            : [],
        isNaver: val.type !== "coupang" ? true : false,
        html: item.html && item.html.length > 0 ? item.html : null,
        detailImages: item.detailImages ? item.detailImages : []
      })
     
      if(item.subItems && Array.isArray(item.subItems) && item.subItems.length > 0) {
    
        for(const subItem of item.subItems){
   
          input.push({
            productNo: subItem.productNo.toString(),
            title: subItem.korTitle,
            detail: null,
            detailUrl: subItem.link,
            shippingWeight: subItem.shippingWeight,
            isClothes: subItem.isClothes,
            isShoes: subItem.isShoes,
            sellerTags: 
              subItem.sellerTags && Array.isArray(subItem.sellerTags) && subItem.sellerTags.length > 0
                ? subItem.sellerTags
                : subItem.keyword
                ? subItem.keyword
                    .split(",")
                    .filter((item) => item.trim().length > 0)
                    .map((item) => item.trim())
                : [],
            isNaver: false,
            html: null,
            detailImages: []
          })
        }
      }
    }

    console.log("input -- ", input)

    const response = await uploadNaverItem({
      variables: {
        input,
      },
    })
    if (response.data.UploadItemNaverList) {
      if (isRecommend && mode === "1") {
        handleRecommend()
      }
      if (isRecommend && mode === "4") {
        handleSavedRecommend()
      }
      message.success("업로드 요청을 하였습니다.")
      setList([])
    } else {
      message.error("업로드 요청에 실패하였습니다.")
    }
    console.log("response", response)
    setUploading(false)
  }

  const marketClick = (mallPcUrl) => {
    setRecommend(false)
    handleUrl(mallPcUrl)
  }

  const handleFavoriteChange = () => {
    if (favoriteRef && favoriteRef.current && favoriteRef.current.refetchList) {
      favoriteRef.current.refetchList()
    }
  }

  const handleOk = ({ value }) => {
    console.log("value", value)
    setIsModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return (
    <RootContainer>
      <Tabs defaultActiveKey="2">
        <TabPane
          tab={
            <span>
              <StarFilled
                style={{
                  fontSize: "18px",
                  color: "#ffd700",
                }}
              />
              즐겨찾기
            </span>
          }
          key="1"
        >
          <Button
            block
            icon={<StarOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid",
              marginBottom: "10px",
              marginLeft: "1px",
              marginRight: "1px",
            }}
            onClick={handleFavoriteRecommend}
          >
            주간 베스트
          </Button>

          <FavoriteList marketClick={marketClick} ref={favoriteRef} />
        </TabPane>
        <TabPane
          tab={
            <span>
              {/* <ShopOutlined
                style={{
                  fontSize: "18px",
                }}
              /> */}
              네이버
            </span>
          }
          key="2"
        >
          <Button icon={<ControlOutlined />} block={true} onClick={() => setIsModalVisible(true)}>
            필터
          </Button>
          <div
            style={{ marginTop: "5px", marginBottom: "5px" }}
          >
            <SearchFilter
              isModalVisible={isModalVisible}
              handleOk={handleOk}
              handleCancel={handleCancel}
            />
            <Button
              block={true}
              loading={loading}
              icon={<RedoOutlined />}
              style={{
                background: "#ffff6b",
                borderBottomWidth: "3px",
                borderBottomColor: "#fdd835",
                borderBottomStyle: "solid",
                borderRightWidth: "3px",
                borderRightColor: "#fdd835",
                borderRightStyle: "solid",
                marginBottom: "2px"
              }}
              onClick={handleRecommend}
            >
              베스트
            </Button>

            <Button
              block={true}
              loading={loading}
              // icon={<RedoOutlined />}
              type="primary"
              style={{
                // background: "#ffff6b",
                borderBottomWidth: "3px",
                // borderBottomColor: "#fdd835",
                borderBottomStyle: "solid",
                borderRightWidth: "3px",
                // borderRightColor: "#fdd835",
                borderRightStyle: "solid",
                marginBottom: "2px"
              }}
              onClick={handleSavedRecommend}
            >
              올릴상품 가져오기
            </Button>
            <Popconfirm
              title="올릴상품을 삭제합니다."
              onConfirm={async() => {
                setLoading(true)
                try {
                  const response = await setNaverFavoriteItemDelete()
                  if(response.data.SetNaverFavoriteItemDelete) {
                    message.success('올릴 상품을 삭제하였습니다.');
                  } else {
                    message.error('실패하였습니다.')
                  }
                } catch (e) {
                  message.error('실패하였습니다.')
                } finally {
                  setLoading(false)
                }
                
                
                
              }}
              okText="삭제"
              cancelText="취소"
            >
              <Button
                block={true}
                loading={loading}
                // icon={<RedoOutlined />}
                type="primary" danger
                style={{
                  // background: "#ffff6b",
                  borderBottomWidth: "3px",
                  // borderBottomColor: "#fdd835",
                  borderBottomStyle: "solid",
                  borderRightWidth: "3px",
                  // borderRightColor: "#fdd835",
                  borderRightStyle: "solid",
                  
                }}
                // onClick={handleSavedRecommend}
              >
                올릴상품 삭제
              </Button>
            </Popconfirm>
            
          </div>
          <MallList marketClick={marketClick} handleFavoriteChange={handleFavoriteChange} />
        </TabPane>
        <TabPane
          tab={
            <span>
              {/* <ShopOutlined
                style={{
                  fontSize: "18px",
                }}
              /> */}
              쿠팡
            </span>
          }
          key="3"
        >
          <CoupangMallList marketClick={marketClick} handleFavoriteChange={handleFavoriteChange} />
        </TabPane>
      </Tabs>

      <Container>
        <SearchContainer>
          <Button
            size="large"
            style={{
              height: "100%",
              width: "180px",
              fontSize: "16px",
              fontWeight: "700",
              marginRight: "10px",
            }}
            icon={<ShopOutlined />}
            onClick={() => {
              if (searchUrl.length > 0) {
                shell.openExternal(searchUrl)
              }
            }}
          >
            {`상점`}
          </Button>
          <Button
            size="large"
            style={{
              height: "100%",
              width: "180px",
              fontSize: "16px",
              fontWeight: "700",
              marginRight: "10px",
            }}
            onClick={() => setList([])}
          >
            리스트 초기화
          </Button>
          <Search
            loading={loading}
            allowClear={true}
            size="large"
            placeholder="네이버 판매자 상점 URL 또는 상품 키워드를 입력해주세요"
            onSearch={(value) => handleUrl(value)}
            enterButton
            value={searchUrl}
            onChange={(e) => setSearchUrl(e.target.value)}
          />
          <Button
            size="large"
            type="primary"
            style={{
              height: "100%",
              width: "100px",
              fontSize: "16px",
              fontWeight: "700",
              marginLeft: "10px",
            }}
            icon={<CheckOutlined style={{ fontSize: "16px" }} />}
            loading={uploading}
            onClick={async () => {
              handleUpload()
              // if (subPrice < 0) {
              //   message.warning("차감액을 0보다 큰 수를 입력해 주세요.")
              //   return
              // }
              // if (!title || title.length === 0) {
              //   message.warning("제목을 입력해 주세요.")
              //   return
              // }
              // if (!selectedUrl || !isURL(selectedUrl)) {
              //   message.warning("주소를 입력해 주세요.")
              //   return
              // }
              // if (
              //   !/detail.tmall.com/.test(selectedUrl) &&
              //   !/item.taobao.com/.test(selectedUrl)
              // ) {
              //   message.warning("올바른 주소를 입력해 주세요.")
              //   return
              // }
            }}
          >
            등록
          </Button>
        </SearchContainer>
        <CoupangStoreItemContainer>
          <NaverStoreItem
            list={list}
            loading={loading}
            mode={mode}
            ref={childRef}
            shippingPrice={shippingPrice}
          />
        </CoupangStoreItemContainer>
      </Container>
    </RootContainer>
  )
}

export default NaverShoppingPage

const RootContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  margin-top: 10px;
  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 220px;
    max-width: 220px;
    margin-left: 10px;
    margin-right: 10px;
    padding-right: 10px;
    border-right: 2px dashed #512da8;
  }
  & > :nth-child(2) {
    width: 100%;
    margin-right: 10px;
  }
`

const FavoriteContainer = styled(SimpleBar)`
  max-height: calc(100vh - 200px);
  min-height: calc(100vh - 200px);

  overflow-y: auto;
`
const Container = styled.div``

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`

const MallList = ({ marketClick, handleFavoriteChange }) => {
  const [list, setList] = useState([])
  const [selectedID, setSelectedID] = useState(null)
  const [filter, setFilter] = useState("")
  const { networkStatus, refetch } = useQuery(GET_NAVER_MALL_LIST, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setList(data.GetNaverMallList)
    },
  })
  const [setFavorite] = useMutation(SET_NAVER_FAVORITE)

  const handleSelect = (_id) => {
    setSelectedID(_id)
  }
  const handleFavorite = async (_id, isFavorite) => {
    await setFavorite({
      variables: {
        _id,
      },
    })
    const temp = list
    setList(
      temp.map((item) => {
        return {
          ...item,
          isFavorite: item._id === _id ? !isFavorite : item.isFavorite,
        }
      })
    )
    handleFavoriteChange()
  }
  if (networkStatus === 1 || networkStatus === 2 || networkStatus === 4) {
    return null
  }

  if (list) {
    return (
      <div>
        <FilterContainer>
          <Input allowClear value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button icon={<RedoOutlined />} onClick={() => refetch()} />
        </FilterContainer>
        <FavoriteContainer>
          {list
            .filter((item) => {
              if (filter.length > 0) {
                if (item.marketName && item.marketName.includes(filter)) {
                  return true
                }
              }
              return true
            })
            .map((item, index) => (
              <FavoriteItem
                key={index}
                isSelected={selectedID === item._id}
                onClick={() => {
                  handleSelect(item._id)
                  if (typeof marketClick === "function") {
                    marketClick(item.mallPcUrl)
                  }
                }}
              >
                {item.isFavorite && (
                  <FavoriteButton
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleFavorite(item._id, item.isFavorite)
                    }}
                  >
                    <StarFilled />
                  </FavoriteButton>
                )}
                {!item.isFavorite && (
                  <FavoriteButton
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleFavorite(item._id, item.isFavorite)
                    }}
                  >
                    <StarOutlined />
                  </FavoriteButton>
                )}
                {item.marketName}
              </FavoriteItem>
            ))}
        </FavoriteContainer>
      </div>
    )
  }
  return null
}

const CoupangMallList = ({ marketClick, handleFavoriteChange }) => {
  const [list, setList] = useState([])
  const [selectedID, setSelectedID] = useState(null)
  const [filter, setFilter] = useState("")
  const { networkStatus, refetch } = useQuery(GET_COUPANG_MALL_LIST, {
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      setList(data.GetCoupangMallList)
    },
  })
  const [setFavorite] = useMutation(SET_COUPANG_FAVORITE)

  const handleSelect = (_id) => {
    setSelectedID(_id)
  }
  const handleFavorite = async (_id, isFavorite) => {
    await setFavorite({
      variables: {
        _id,
      },
    })
    const temp = list
    setList(
      temp.map((item) => {
        return {
          ...item,
          isFavorite: item._id === _id ? !isFavorite : item.isFavorite,
        }
      })
    )
    handleFavoriteChange()
  }
  if (networkStatus === 1 || networkStatus === 2 || networkStatus === 4) {
    return null
  }

  if (list) {
    return (
      <div>
        <FilterContainer>
          <Input allowClear value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button icon={<RedoOutlined />} onClick={() => refetch()} />
        </FilterContainer>
        <FavoriteContainer>
          {list
            .filter((item) => {
              if (filter.length > 0) {
                if (item.marketName && item.marketName.includes(filter)) {
                  return true
                }
              }
              return true
            })
            .map((item, index) => (
              <FavoriteItem
                key={index}
                isSelected={selectedID === item._id}
                onClick={() => {
                  handleSelect(item._id)
                  if (typeof marketClick === "function") {
                    marketClick(item.mallPcUrl)
                  }
                }}
              >
                {item.isFavorite && (
                  <FavoriteButton
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleFavorite(item._id, item.isFavorite)
                    }}
                  >
                    <StarFilled />
                  </FavoriteButton>
                )}
                {!item.isFavorite && (
                  <FavoriteButton
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleFavorite(item._id, item.isFavorite)
                    }}
                  >
                    <StarOutlined />
                  </FavoriteButton>
                )}
                {item.marketName}
              </FavoriteItem>
            ))}
        </FavoriteContainer>
      </div>
    )
  }
  return null
}

const FavoriteList = forwardRef(({ marketClick }, ref) => {
  const [filter, setFilter] = useState("")
  const [selectedID, setSelectedID] = useState(null)
  const { loading, data, refetch } = useQuery(GET_NAVER_MALL_FAVORITE_LIST)
  const [setFavorite] = useMutation(SET_NAVER_FAVORITE)

  useImperativeHandle(ref, () => ({
    refetchList() {
      refetch()
    },
  }))

  const handleSelect = (_id) => {
    setSelectedID(_id)
  }

  const handleFavorite = async (_id) => {
    console.log("_id", _id)
    const response = await setFavorite({
      variables: {
        _id,
      },
    })

    refetch()
  }
  if (loading) {
    return null
  }

  if (data && data.GetNaverMallFavoriteList) {
    return (
      <div>
        <FilterContainer>
          <Input allowClear value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button icon={<RedoOutlined />} onClick={() => refetch()} />
        </FilterContainer>
        <FavoriteContainer>
          {data.GetNaverMallFavoriteList.filter((item) => {
            if (filter.length > 0) {
              if (item.marketName && item.marketName.includes(filter)) {
                return true
              }
              {
                return false
              }
            }
            return true
          }).map((item, index) => (
            <FavoriteItem
              key={index}
              isSelected={selectedID === item._id}
              onClick={() => {
                handleSelect(item._id)
                if (typeof marketClick === "function") {
                  marketClick(item.mallPcUrl)
                }
              }}
            >
              {item.isFavorite && (
                <FavoriteButton
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleFavorite(item._id)
                  }}
                >
                  <StarFilled />
                </FavoriteButton>
              )}
              {!item.isFavorite && (
                <FavoriteButton
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleFavorite(item._id)
                  }}
                >
                  <StarOutlined />
                </FavoriteButton>
              )}
              {item.marketName}
            </FavoriteItem>
          ))}
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
      background: rgba(233, 233, 123, 0.4);
    `
  )};

  cursor: pointer;
  &:hover {
    font-weight: 700;
    background: rgba(233, 233, 123, 0.2);
  }
  border-bottom: 1px solid #b2b3b3;
  display: flex;
  align-items: center;
  & > :nth-child(1) {
    min-width: 30px;
    max-width: 30px;
    font-size: 18px;
    color: #ffd700;
  }
  & > :nth-child(2) {
    width: 100%;
    line-height: 1.2;
    text-align: center;
    font-size: 14px;
  }
`

const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(1) {
    width: 100%;
  }
  & > :nth-child(2) {
    margin-left: 5px;
    min-width: 40px;
    max-width: 40px;
  }
`

const FavoriteButton = styled.div`
  padding: 5px;
`

const CoupangStoreItemContainer = styled.div`
  /* max-height: calc(100vh - 160px);
  min-height: calc(100vh - 160px);

  overflow-y: auto; */
`
