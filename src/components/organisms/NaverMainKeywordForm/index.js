import React, { useState, useEffect } from "react"
import { Table, Input, Tag, Tooltip, BackTop, Spin } from "antd"
import { useQuery, useMutation } from "@apollo/client"
import { NAVER_MAIN_KEYWORD, KORTOCN, GET_NAVER_ITEM_WITH_KEYWORD } from "../../../gql"
import styled from "styled-components"

const { Search } = Input
const { shell } = window.require("electron")

const NaverMainKeywordForm = () => {
  const [search, setSearch] = useState("")
  const [keywordList, setKeywordtList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [naverMainKeyword] = useMutation(NAVER_MAIN_KEYWORD)
  const [kortoCN] = useMutation(KORTOCN)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 30,
  })

  useEffect(() => {
    handleSearch({ searchKey: "" })
  }, [])
  const handleSearch = async ({ searchKey, exceptBrand, categoryFilter, sort, page }) => {
    try {
      setListLoading(true)
      const response = await naverMainKeyword({
        variables: {
          page: page && page.current ? page.current : pagination.current,
          perPage: page && page.pageSize ? page.pageSize : pagination.pageSize,
          search: searchKey !== null && searchKey !== undefined ? searchKey : search,
          sort,
          categoryFilter: categoryFilter ? categoryFilter : [],
          exceptBrand,
        },
      })
      console.log("response", response)
      const { count, list } = response.data.NaverMainKeyword
      setKeywordtList(list)
      setPagination({
        current: page ? page.current : pagination.current,
        pageSize: page ? page.pageSize : pagination.pageSize,
        total: count,
      })
    } catch (e) {
      console.log("eee", e)
    } finally {
      setListLoading(false)
    }
  }

  const columns = [
    {
      title: "키워드",
      key: "keyword",
      sorter: true,
      filters: [
        {
          text: "브랜드 제외",
          value: "brand",
        },
      ],
      render: (data) => {
        return (
          <SourcingContainer>
            {data.keyword}
            {data.isBrand ? (
              <Tooltip key={data.keyword} title="브랜드 의심 키워드">
                <BrandTagContainer>B</BrandTagContainer>
              </Tooltip>
            ) : (
              ""
            )}
          </SourcingContainer>
        )
      },
    },
    {
      title: "카테고리",
      key: "category",
      width: 160,
      sorter: true,
      filters: [
        {
          text: "패션의류",
          value: "패션의류",
        },
        {
          text: "패션잡화",
          value: "패션잡화",
        },
        {
          text: "화장품/미용",
          value: "화장품/미용",
        },
        {
          text: "가구/인테리어",
          value: "가구/인테리어",
        },
        {
          text: "디지털/가전",
          value: "디지털/가전",
        },
        {
          text: "생활/건강",
          value: "생활/건강",
        },
        {
          text: "스포츠/레저",
          value: "스포츠/레저",
        },
        {
          text: "식품",
          value: "식품",
        },
        {
          text: "출산/육아",
          value: "출산/육아",
        },
      ],
      render: (data) => {
        return <div>{data.category1}</div>
      },
    },
    {
      title: "상품소싱",
      width: 420,
      render: (data) => {
        return (
          <SourcingContainer>
            <TagContainer
              color="#96E827"
              style={{ color: "black", fontWeight: 700 }}
              onClick={() =>
                shell.openExternal(
                  `https://pandarank.net/search/detail?keyword=${data.keyword}&channel=user`
                )
              }
            >
              키워드 분석
            </TagContainer>
            <TagContainer
              color="green"
              style={{ fontWeight: 700 }}
              onClick={() =>
                shell.openExternal(
                  `https://search.shopping.naver.com/search/all?query=${data.keyword}`
                )
              }
            >
              네이버 쇼핑
            </TagContainer>
            <TagContainer
              color="red"
              style={{ fontWeight: 700 }}
              onClick={() =>
                shell.openExternal(
                  `https://www.coupang.com/np/search?component=&q=${data.keyword}&channel=user`
                )
              }
            >
              쿠팡
            </TagContainer>

            <TagContainer
              color="orange"
              style={{ fontWeight: 700 }}
              onClick={async () => {
                const response = await kortoCN({ variables: { text: data.keyword } })

                if (response && response.data && response.data.KorToCn) {
                  shell.openExternal(`https://s.taobao.com/search?q=${response.data.KorToCn}`)
                }
              }}
            >
              Taobao
            </TagContainer>
            <TagContainer
              color="orange"
              style={{ fontWeight: 700 }}
              onClick={() =>
                shell.openExternal(
                  `https://ko.aliexpress.com/af/%25EB%2583%2589%25EC%259E%25A5%25EA%25B3%25A0.html?d=y&origin=n&SearchText=${data.keyword}`
                )
              }
            >
              알리
            </TagContainer>
          </SourcingContainer>
        )
      },
    },
    {
      title: "상품갯수",
      key: "productCount",
      width: 180,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.productCount.toLocaleString("ko")}</NumberCell>
      },
    },
    {
      title: "6개월 판매 갯수",
      key: "purchaseCnt",
      width: 180,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.purchaseCnt.toLocaleString("ko")}</NumberCell>
      },
    },
    {
      title: "최근 3일 판매 갯수",
      key: "recentSaleCount",
      width: 180,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.recentSaleCount.toLocaleString("ko")}</NumberCell>
      },
    },
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
    if (filters.keyword && filters.keyword.length === 1) {
      if (filters.keyword[0] === "brand") {
        exceptBrand = true
      }
    }
    let categoryFilter = []
    if (filters.category && filters.category.length > 0) {
      categoryFilter = filters.category
    }

    console.log("categoryFIlter", categoryFilter)
    let sort = "6"

    if (sorter) {
      switch (sorter.columnKey) {
        case "category":
          switch (sorter.order) {
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
          switch (sorter.order) {
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
          switch (sorter.order) {
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
          switch (sorter.order) {
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
          switch (sorter.order) {
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
      }
    }

    setPagination(pagination)
    handleSearch({ sort, exceptBrand, categoryFilter, page: pagination })
  }

  return (
    <>
      <BackTop />
      <Search
        loading={listLoading}
        allowClear={true}
        placeholder="키워드를 입력하세요."
        size="large"
        onSearch={(value) => {
          setSearch(value)
          handleSearch({ searchKey: value })
        }}
        enterButton
        style={{ marginBottom: "15px" }}
      />
      <Table
        columns={columns}
        rowKey={(data) => data._id}
        dataSource={keywordList}
        pagination={pagination}
        loading={listLoading}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender: (data) => {
            return <ExpandableNaverShopping category1={data.category1} keyword={data.keyword} />
          },
        }}
      />
    </>
  )
}

export default NaverMainKeywordForm

const ExpandableNaverShopping = ({ category1, keyword }) => {
  console.log("여기 타냐 ? ", category1, keyword)
  const { data } = useQuery(GET_NAVER_ITEM_WITH_KEYWORD, {
    variables: {
      category1,
      keyword,
    },
  })
  console.log("data", data)
  if (data) {
    return (
      <NaverShoppingWrapper>
        {data.GetNaverItemWithKeyword.map((item, index) => {
          return <NaverShoppingItem key={index} {...item} />
        })}
      </NaverShoppingWrapper>
    )
  } else {
    return <Spin />
  }
}

const NaverShoppingWrapper = styled.div`
  padding-top: 20px;
  padding-bottom: 20px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  row-gap: 30px;
  column-gap: 10px;
`

const NaverShoppingItem = ({
  image,
  name,
  detailUrl,
  displayName,
  purchaseCnt,
  recentSaleCount,
  reviewCount,
}) => {
  return (
    <NaverShoppingItemContainer>
      <Thumbnail src={`${image}?type=f200`} onClick={() => shell.openExternal(detailUrl)} />
      <ShoppingInfoContainer>
        <Tag color="blue">{displayName}</Tag>
        <CountContainer>
          <Tag color="green">{purchaseCnt.toLocaleString("ko")}</Tag>
          <Tag color="purple">{recentSaleCount.toLocaleString("ko")}</Tag>
        </CountContainer>
      </ShoppingInfoContainer>
      <div>{name}</div>
    </NaverShoppingItemContainer>
  )
}

const NaverShoppingItemContainer = styled.div``

const ShoppingInfoContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  margin-bottom: 5px;
`

const CountContainer = styled.div`
  display: flex;
  align-items: center;
`
const Thumbnail = styled.img`
  cursor: pointer;
`

const NumberCell = styled.div`
  text-align: right;
`

const SourcingContainer = styled.div`
  display: flex;
  align-items: center;
`

const BrandTagContainer = styled.div`
  font-weight: 900;
  margin-left: 5px;
  padding: 0 4px;
  border: 1px solid lightgray;
  border-radius: 2px;
`
const TagContainer = styled(Tag)`
  cursor: pointer;
  margin-right: 14px;
`
