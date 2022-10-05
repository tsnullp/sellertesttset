import React, {useState, useEffect} from "react"
import {TitleArrayComponent} from "components"
import {Table, Input, Tag, Tooltip, BackTop, Spin} from "antd"
import { useMutation } from "@apollo/client"
import { NAVER_HEALTHFOOD } from "../../../gql"
import styled from "styled-components"
import moment from "moment"
import category from "../CategoryForm/category"

const { Search } = Input
const { shell } = window.require("electron")

const NaverHealthFoodForm = () => {
  const [search, setSearch] = useState("")
  const [healthFoodList, setHealthFoodList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [naverHealthFood] = useMutation(NAVER_HEALTHFOOD)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30
  })

  useEffect(() => {
    handleSearch({searchKey: ""})

  }, [])
  const handleSearch = async ({searchKey, categoryFilter, sort, page}) => {
    try {
 
      setListLoading(true)
      const response = await naverHealthFood({
        variables: {
          page: page && page.current ? page.current : pagination.current,
          perPage: page && page.pageSize? page.pageSize : pagination.pageSize,
          search: searchKey !== null && searchKey !== undefined ? searchKey : search,
          sort,
          categoryFilter: categoryFilter ? categoryFilter: [],
          
        }
      })
      console.log("response", response)
      const {count, list} = response.data.NaverHealthFood
      setHealthFoodList(list)
      setPagination({
        current: page ? page.current : pagination.current,
        pageSize: page ? page.pageSize : pagination.pageSize,
        total: count
      })
    } catch(e){
      console.log("eee", e)
    } finally {
      setListLoading(false)
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0;
    }
    
  }
  
  const columns = [
    {
      title: "카테고리",
      key: "category",
      width: 160,
      sorter: true,
      filters: category.filter(item => 
        item.중분류 === "건강식품" && (
          item.소분류 === "비타민제" || item.소분류 === "영양제"
        )
      ).map(item => {
        return {
          text: item.세분류,
          value: item.카테고리코드.toString(),
        }
      }),
      render: data => {
        let categoryName = ""
        const categoryArr = category.filter(item => item.카테고리코드.toString() === data.categoryId)

        if(categoryArr.length === 1) {
          categoryName = categoryArr[0]["세분류"]
        }
        
        return (
          <div>{categoryName}</div>
        )
      }
    },
    {
      title: "이미지",
      render: data => {
        return (
          <ImageView src={`${data.image}?type=f180_180`} alt={data.image}
            onClick={() => shell.openExternal(data.image)}
          />
        )
      }
    },
    {
      title: "상품명",
      render: data => {
        return (
          <TitleContainer>
            <div
              onClick={() => shell.openExternal(data.detailUrl)}
            >
              <TitleArrayComponent title={data.name} titleArray={data.titleArray} />
            </div>
            <div style={{display: "flex", flexWrap: "wrap", fontSize: "13px", marginTop: "10px"}}>
              {data.sellerTags && Array.isArray(data.sellerTags) && data.sellerTags.map((item, index) => 
                <div key={index} style={{marginRight: "5px", color: "#c6a700"}}>{`#${item} `}</div>
              )}
          </div>
          </TitleContainer>
        )
      }
    },
    
    {
      title: "6개월",
      key: "purchaseCnt",
      width: 80,
      sorter: true,
      render: data => {
        return (
          <NumberCell>
            {data.purchaseCnt.toLocaleString("ko")}
          </NumberCell>
        )
      }
    },
    {
      title: "3일",
      key: "recentSaleCount",
      width: 80,
      sorter: true,
      render: data => {
        return (
          <NumberCell>
            {Number(data.recentSaleCount).toLocaleString("ko")}
          </NumberCell>
        )
      }
    },
    {
      title: "리뷰",
      key: "reviewCount",
      width: 80,
      sorter: true,
      render: data => {
        return (
          <NumberCell>
            {Number(data.reviewCount).toLocaleString("ko")}
          </NumberCell>
        )
      }
    },
    {
      title: "등록일",
      key: "regDate",
      width: 120,
      sorter: true,
      render: data => {
        return (
          moment(data.regDate).format("YYYY.MM.DD")
        )
      }
    }
  ]

  const handleTableChange = (pagination, filters, sorter) => {
    // this.fetch({
    //   sortField: sorter.field,
    //   sortOrder: sorter.order,
    //   pagination,
    //   ...filters,
    // });
    // refetch({
    //   variables: {
    //     page: pagination.current,
    //     perPage: 10
    //   }
    // })
    console.log("pagination", pagination)
    console.log("sorter", sorter)
    console.log("filters", filters)

    let exceptBrand = false
    if(filters.keyword && filters.keyword.length === 1){
      if(filters.keyword[0] === "brand"){
        exceptBrand = true
      }
    }
    let categoryFilter = []
    if(filters.category && filters.category.length > 0){
      categoryFilter = filters.category
    }
    
    console.log("categoryFIlter", categoryFilter)
    let sort = "6"

    if(sorter){
      switch(sorter.columnKey){
        case "category":
            switch(sorter.order){
              case "ascend":
                sort = "9"
              break
                case "descend":
                sort = "10"
                break
              default:
                break
            }
          break
        case "kewyord":
          switch(sorter.order){
            case "ascend":
              sort = "1"
            break
              case "descend":
              sort = "2"
              break
            default:
              break
          }
        break
        case "productCount":
          switch(sorter.order){
            case "ascend":
              sort = "3"
            break
              case "descend":
              sort = "4"
              break
            default:
              break
          }
        break
        case "purchaseCnt":
          switch(sorter.order){
            case "ascend":
              sort = "5"
            break
              case "descend":
              sort = "6"
              break
            default:
              break
          }
        break
        case "recentSaleCount":
          switch(sorter.order){
            case "ascend":
              sort = "7"
            break
              case "descend":
              sort = "8"
              break
            default:
              break
          }
        break
        case "reviewCount":
          switch(sorter.order){
            case "ascend":
              sort = "11"
            break
              case "descend":
              sort = "12"
              break
            default:
              break
          }
        break
        case "regDate":
          switch(sorter.order){
            case "ascend":
              sort = "13"
            break
              case "descend":
              sort = "14"
              break
            default:
              break
          }
        break
      }
    }
    


    setPagination(pagination)
    handleSearch({sort, exceptBrand, categoryFilter, page:pagination})
    

  }

  return (
    <>
    <BackTop />
    <Search    
      loading={listLoading}
      allowClear={true}
      placeholder="키워드를 입력하세요."
      size="large"
      onSearch={value => {
        setSearch(value)
        handleSearch({searchKey: value})
      }}
      enterButton
      style={{marginBottom: "15px"}}
        />
    <Table 
      columns={columns}
      rowKey={data => data._id}
      dataSource={healthFoodList}
      pagination={pagination}
      loading={listLoading}
      onChange={handleTableChange}
      scroll={{
        scrollToFirstRowOnChange: true
      }}
    />
    </>
  )
}

export default NaverHealthFoodForm




const NumberCell = styled.div`
  text-align: right;
`

const ImageView = styled.img`
  cursor: pointer;
  width: 180px;
  height: 180px;
  border: 1px solid lightgray;
`

const TitleContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
`