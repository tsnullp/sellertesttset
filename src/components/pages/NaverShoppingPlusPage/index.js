import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react"
import { Input, Button, message } from "antd"
import styled, { css } from "styled-components"
import { ifProp } from "styled-tools"
import { NaverStorePlusItem, SearchFilter, SourcingImageModal } from "components"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_NAVER_RECOMMEND_ITEM_LIST,
  GET_NAVER_ITEM_LIST,
  GET_NAER_SAVED_ITEM_LIST,
  GET_SHIPPINGPRICE,
  UPLOAD_NAVERPLUS_ITEM,
  GET_NAVER_FAVORITE_ITEM_LIST,
  GET_NAVER_JANPAN_ITEM_LIST,
  GET_NAVER_JANPAN_FAVORITE_ITEM_LIST,
  SET_NAVER_EXCEPT,
  SET_NAVER_ITEM_FAVORITE,
} from "gql"
import {
  ShopOutlined,
  CheckOutlined,
  RedoOutlined,
  ControlOutlined,
  StarOutlined,
} from "@ant-design/icons"
import { UserContext } from "context/UserContext"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const NaverShoppingPlusPage = () => {
  const [mode, setMode] = useState("1")
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [getNaverRecommend] = useMutation(GET_NAVER_RECOMMEND_ITEM_LIST)
  const [uploadNaverItem] = useMutation(UPLOAD_NAVERPLUS_ITEM)
  const [getShippingPrice] = useMutation(GET_SHIPPINGPRICE)
  const [getNaverSavedList] = useMutation(GET_NAER_SAVED_ITEM_LIST)
  const [getNaverFavoriteList] = useMutation(GET_NAVER_FAVORITE_ITEM_LIST)
  const [getNaverJanpanFavoriteList] = useMutation(GET_NAVER_JANPAN_FAVORITE_ITEM_LIST)
  const [getNaverList] = useMutation(GET_NAVER_ITEM_LIST)
  const [getNaverJanpanList] = useMutation(GET_NAVER_JANPAN_ITEM_LIST)

  const [setExcept] = useMutation(SET_NAVER_EXCEPT)
  const [setFavorite] = useMutation(SET_NAVER_ITEM_FAVORITE)

  const [shippingPrice, SetShippingrice] = useState(200)
  const [isProductImageModalVisible, setProductImageModalVisible] = useState(false)

  const [isRecommend, setRecommend] = useState(false)

  const [isModalVisible, setIsModalVisible] = useState(false)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  })

  const { user } = useContext(UserContext)

  const childRef = useRef()

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

  const handleRecommend = async () => {
    setMode("1")
    setRecommend(true)
    setList([])
    setLoading(true)

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

    console.log("response.data.GetNaverRecommendItemList", response.data.GetNaverRecommendItemList)
    setPagination(null)
    setList(response.data.GetNaverRecommendItemList || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleSavedItem = async () => {
    setMode("2")
    setRecommend(true)
    setList([])
    setLoading(true)

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

    const response = await getNaverSavedList({
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

    setPagination({
      ...pagination,
      total: response.data.GetNaverSavedItemList.length,
    })
    setList(response.data.GetNaverSavedItemList || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleNaverItem = async ({ page = 1, perPage = 200 }) => {
    setMode("3")
    setRecommend(true)
    setList([])
    setLoading(true)
    const sort = localStorage.getItem("sort") || "a"
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

    const response = await getNaverList({
      variables: {
        page,
        perPage,
        sort,
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
      // variables: {
      //   limit: step,
      //   regDay,
      //   minRecent,
      //   maxRecent,
      //   totalMinSale,
      //   totalMaxSale,
      //   category,
      //   minReview,
      //   maxReview,
      //   minPrice,
      //   maxPrice
      // }
    })
    console.log("response.data.GetNaverItemList", response.data.GetNaverItemList)

    setPagination({
      current: page,
      pageSize: perPage,
      total: response.data.GetNaverItemList.count,
    })
    setList(response.data.GetNaverItemList.list || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }
  const handleNaverJanpanItem = async ({ page = 1, perPage = 50 }) => {
    setMode("3")
    setRecommend(true)
    setList([])
    setLoading(true)
    const sort = localStorage.getItem("sort") || "a"
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

    const response = await getNaverJanpanList({
      variables: {
        page,
        perPage,
        sort,
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
      // variables: {
      //   limit: step,
      //   regDay,
      //   minRecent,
      //   maxRecent,
      //   totalMinSale,
      //   totalMaxSale,
      //   category,
      //   minReview,
      //   maxReview,
      //   minPrice,
      //   maxPrice
      // }
    })
    console.log("response.data.GetNaverJanpanItemList", response.data.GetNaverJanpanItemList)

    setPagination({
      current: page,
      pageSize: perPage,
      total: response.data.GetNaverJanpanItemList.count,
    })
    setList(response.data.GetNaverJanpanItemList.list || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }

  const handleNaverFavoriteItem = async () => {
    setMode("4")
    setRecommend(true)
    setList([])
    setLoading(true)

    const response = await getNaverFavoriteList()

    setPagination({
      page: 1,
      current: 1,
      total: response.data.GetNaverFavoriteItemList.length,
    })
    setList(response.data.GetNaverFavoriteItemList || [])
    setLoading(false)
    setTimeout(() => {
      // window.scrollTo(0, 0)
      if (childRef && childRef.current) {
        childRef.current.scrollTop()
      }
    }, 500)
  }
  const handleNaverJanpanFavoriteItem = async () => {
    setMode("5")
    setRecommend(true)
    setList([])
    setLoading(true)

    const response = await getNaverJanpanFavoriteList()

    setPagination({
      page: 1,
      current: 1,
      total: response.data.GetNaverJanpanFavoriteItemList.length,
    })
    setList(response.data.GetNaverJanpanFavoriteItemList || [])
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
    // if(!Array.isArray(val) || val.length === 0){
    //   setUploading(false)
    //   return
    // }

    const response = await uploadNaverItem({
      variables: {
        input: val,
      },
    })
    if (response.data.UploadNaverPlusItem) {
      if (isRecommend && mode === "1") {
        handleRecommend()
        setList([])
      }
      if (isRecommend && mode === "2") {
        handleSavedItem()
        setList([])
      }
      if (isRecommend && mode === "4") {
        handleNaverFavoriteItem()
        setList([])
      }
      if (isRecommend && mode === "5") {
        handleNaverJanpanFavoriteItem()
        setList([])
      }
      setList([])
      message.success("업로드 요청을 하였습니다.")
    } else {
      message.error("업로드 요청에 실패하였습니다.")
    }
    console.log("response", response)
    setUploading(false)
  }

  const handleOk = ({ value }) => {
    console.log("value", value)
    setIsModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  const handleTableChange = (pagination, filters, sorter) => {
    console.log("pagination", pagination)
    if (mode === "3") {
      handleNaverItem({ page: pagination.current, perPage: pagination.pageSize })
    }

    setPagination(pagination)
    // handleSearch({page:pagination})
  }

  const showProductImageModal = () => {
    setProductImageModalVisible(true)
  }

  const handleImageOk = async(selectedItems) => {
    setLoading(true)
    setProductImageModalVisible(false)
    try {

      const promiseArray = selectedItems.map(item => {
        return new Promise(async (resolve, reject) => {
          try {
            if(item.isChecked){
              // 즐겨찾기
              const response = await setFavorite({
                variables: {
                  productNo: item.productNo,
                  isFavorite: true,
                },
              })
             
            } else {
              const response = await setExcept({
                variables: {
                  productNo: item.productNo,
                  isDelete: true,
                },
              })
            }
            resolve()
          }catch(e){
            reject(e)
          }
        })
      })
      await Promise.all(promiseArray)
    } catch(e) {
      console.log("222", e)
    } finally{
      setLoading(false)
      handleNaverItem({ page: pagination.current, perPage: pagination.pageSize })
    }
  }

  const handleImageCancel = () => {
    setProductImageModalVisible(false)
  }

  return (
    <RootContainer>
      <SearchContainer>
        <div>
          <Button
            size="large"
            icon={<ControlOutlined />}
            width={60}
            onClick={() => setIsModalVisible(true)}
          >
            필터
          </Button>
          <SearchFilter
            isModalVisible={isModalVisible}
            handleOk={handleOk}
            handleCancel={handleCancel}
          />

          <Button
            size="large"
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

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleRecommend}
          >
            주간 베스트
          </Button>

          {user.id === "5f0d5ff36fc75ec20d54c40b" && (
            <Button
              style={{ marginLeft: "10px", marginRight: "3px" }}
              loading={loading}
              size="large"
              onClick={handleSavedItem}
            >
              주간베스트 +
            </Button>
          )}
          <Button
            size="large"
            loading={loading}
            icon={<ShopOutlined />}
            style={{
              background: "#00CCBB",
              borderBottomWidth: "3px",
              borderBottomColor: "#11AABB",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#00AABB",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverItem}
          >
            상품 소싱
          </Button>
            {isProductImageModalVisible && (
              <SourcingImageModal
                isModalVisible={isProductImageModalVisible}
                handleOk={handleImageOk}
                handleCancel={handleImageCancel}
                images={list.map((item) => {
                
                  return {
                    productNo: item.productNo,
                    image: item.image,
                    isChecked: item.isChecked,
                    name: item.name
                  }
                })}
              />
            )}
          {mode === "3" && list.length > 0 &&
           <Button
           size="large"
          border={false}
          style={{
            // border: "6px solid #512da8",
            background: "#512da8",
            color: "white",
          }}
          onClick={showProductImageModal}
          >전체 이미지</Button> }

          <Button
            size="large"
            loading={loading}
            icon={<StarOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverFavoriteItem}
          >
            올릴 상품
          </Button>

          <Button
            size="large"
            loading={loading}
            icon={<ShopOutlined />}
            style={{
              background: "#FF66cc",
              borderBottomWidth: "3px",
              borderBottomColor: "#FF3388",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#FF3388",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverJanpanItem}
          >
            상품 소싱 (일본)
          </Button>

          <Button
            size="large"
            loading={loading}
            icon={<StarOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverJanpanFavoriteItem}
          >
            올릴 상품 (일본)
          </Button>

          <Button
            style={{ marginLeft: "10px" }}
            size="large"
            onClick={() => {
              const temp = {
                index: 0,
                categoryId: null,
                detailUrl: null,
                displayName: "",
                image: null,
                isRegister: false,
                title: "제목없음",
                name: "",
                productNo: null,
                purchaseCnt: 0,
                recentSaleCount: 0,
                reviewCount: 0,
                sellerTags: [],
                titleArray: [],
                zzim: 0,
                type: "",
              }
              const data = childRef.current.getData()

              const tempList = data.map((item, index) => {
                return {
                  ...item,
                  name: !item.productNo ? item.title : item.name,
                  detail: !item.productNo ? item.detailUrl : item.detail,
                  index: index + 1,
                }
              })

              setList([temp, ...tempList])
            }}
          >
            +
          </Button>
        </div>
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
          }}
        >
          등록
        </Button>
      </SearchContainer>
      <CoupangStoreItemContainer>
        <NaverStorePlusItem
          list={list}
          loading={loading}
          ref={childRef}
          shippingPrice={shippingPrice}
          handleTableChange={handleTableChange}
          pagination={pagination}
          mode={mode}
        />
      </CoupangStoreItemContainer>
      <SearchContainer>
        <div>
          <Button
            size="large"
            icon={<ControlOutlined />}
            width={60}
            onClick={() => setIsModalVisible(true)}
          >
            필터
          </Button>
          <SearchFilter
            isModalVisible={isModalVisible}
            handleOk={handleOk}
            handleCancel={handleCancel}
          />

          <Button
            size="large"
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

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleRecommend}
          >
            주간 베스트
          </Button>

          {user.id === "5f0d5ff36fc75ec20d54c40b" && (
            <Button
              style={{ marginLeft: "10px" }}
              loading={loading}
              size="large"
              onClick={handleSavedItem}
            >
              주간베스트 +
            </Button>
          )}
          <Button
            size="large"
            loading={loading}
            icon={<ShopOutlined />}
            style={{
              background: "#00CCBB",
              borderBottomWidth: "3px",
              borderBottomColor: "#11AABB",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#00AABB",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverItem}
          >
            상품 소싱
          </Button>
          {mode === "3" && list.length > 0 &&
           <Button
           size="large"
          border={false}
          style={{
            // border: "6px solid #512da8",
            background: "#512da8",
            color: "white",
          }}
          onClick={showProductImageModal}
          >전체 이미지</Button> }
          <Button
            size="large"
            loading={loading}
            icon={<StarOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverFavoriteItem}
          >
            올릴 상품
          </Button>

          <Button
            size="large"
            loading={loading}
            icon={<ShopOutlined />}
            style={{
              background: "#FF66cc",
              borderBottomWidth: "3px",
              borderBottomColor: "#FF3388",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#FF3388",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverJanpanItem}
          >
            상품 소싱 (일본)
          </Button>

          <Button
            size="large"
            loading={loading}
            icon={<StarOutlined />}
            style={{
              background: "#ffff6b",
              borderBottomWidth: "3px",
              borderBottomColor: "#fdd835",
              borderBottomStyle: "solid",
              borderRightWidth: "3px",
              borderRightColor: "#fdd835",
              borderRightStyle: "solid",

              marginLeft: "3px",
              marginRight: "3px",
            }}
            onClick={handleNaverJanpanFavoriteItem}
          >
            올릴 상품 (일본)
          </Button>
          <Button
            style={{ marginLeft: "10px" }}
            size="large"
            onClick={() => {
              const temp = {
                index: 0,
                categoryId: null,
                detailUrl: null,
                displayName: "",
                image: null,
                isRegister: false,
                title: "제목없음",
                name: "",
                productNo: null,
                purchaseCnt: 0,
                recentSaleCount: 0,
                reviewCount: 0,
                sellerTags: [],
                titleArray: [],
                zzim: 0,
                type: "",
              }
              const data = childRef.current.getData()

              const tempList = data.map((item, index) => {
                return {
                  ...item,
                  name: !item.productNo ? item.title : item.name,
                  detail: !item.productNo ? item.detailUrl : item.detail,
                  index: index + 1,
                }
              })

              setList([temp, ...tempList])
            }}
          >
            +
          </Button>
        </div>
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
          }}
        >
          등록
        </Button>
      </SearchContainer>
    </RootContainer>
  )
}

export default NaverShoppingPlusPage

const RootContainer = styled.div`
  /* margin: 20px;
  margin-top: 10px;
  margin-bottom: 10px; */
  padding: 10px 20px;
  /* box-sizing: border-box;
  display: flex;
  
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
  } */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

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

const CoupangStoreItemContainer = styled(SimpleBar)`
  /* max-height: calc(100vh - 90px);
  min-height: calc(100vh - 90px);
background: red; */

  overflow-y: auto;
`
