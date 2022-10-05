import React, { useState, useEffect } from "react"
import { Table, Input, Tag, Segmented, BackTop, Spin, InputNumber, Progress, Tooltip } from "antd"
import { useQuery, useMutation } from "@apollo/client"
import {
  SOURCING_KEYWORD,
  KORTOCN,
  GET_NAVER_KEYWORD_ITEM_ID,
  SET_FAVORITE_KEYWORD,
} from "../../../gql"
import styled from "styled-components"
import { StarOutlined, StarFilled } from "@ant-design/icons"
const { Search } = Input
const { shell } = window.require("electron")

const SourcingKeyword = () => {
  const [search, setSearch] = useState("")
  const [keywordList, setKeywordtList] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const [sourcingKeyword] = useMutation(SOURCING_KEYWORD)
  const [setFavoriteKeyword] = useMutation(SET_FAVORITE_KEYWORD)
  const [kortoCN] = useMutation(KORTOCN)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 100,
  })

  const [minCount, setMinCount] = useState(0)
  const [maxCount, setMaxCount] = useState(5000)
  const [minProductCount, setMinProductCount] = useState(0)
  const [maxProductCount, setMaxProductCount] = useState(2000)
  const [minOverSeaProductCount, setMinOverSeaProductCount] = useState(0)
  const [maxOverSeaProductCount, setMaxOverSeaProductCount] = useState(2000)
  const [minCompetition, setMinCompetition] = useState(0)
  const [maxCompetition, setMaxCompetition] = useState(1)
  const [minOverSeaCompetition, setMinOverSeaCompetition] = useState(0)
  const [maxOverSeaCompetition, setMaxOverSeaCompetition] = useState(1)
  const [overSeaProductCount, setOverSeaProductCount] = useState(1)

  const [countVisible, setCountVisible] = useState(false)
  const [productVisible, setProductVisible] = useState(false)
  const [competitionVisible, setCompetitionVisible] = useState(false)
  const [overSeaProductVisible, setOverSeaProductVisible] = useState(false)
  const [overSeaCompetitionVisible, setOverSeaCompetitionVisible] = useState(false)

  const [saveSort, setSaveSort] = useState(null)
  const [saveCategory, setSaveCategoryt] = useState([])
  useEffect(() => {
    handleSearch({ searchKey: "" })
  }, [])
  const handleSearch = async ({ searchKey, categoryFilter, sort, page }) => {
    try {
      setListLoading(true)

      console.log("aaaa--", {
        page: page && page.current ? page.current : pagination.current,
        perPage: page && page.pageSize ? page.pageSize : pagination.pageSize,
        search: searchKey !== null && searchKey !== undefined ? searchKey : search,
        sort,
        categoryFilter: categoryFilter ? categoryFilter : [],
        minCount,
        maxCount,
        minProductCount,
        maxProductCount,
        minOverSeaProductCount,
        maxOverSeaProductCount,
        minCompetition,
        maxCompetition,
        minOverSeaCompetition,
        maxOverSeaCompetition,
        overSeaProductCount,
      })
      const response = await sourcingKeyword({
        variables: {
          page: page && page.current ? page.current : pagination.current,
          perPage: page && page.pageSize ? page.pageSize : pagination.pageSize,
          search: searchKey !== null && searchKey !== undefined ? searchKey : search,
          sort,
          categoryFilter: categoryFilter ? categoryFilter : [],
          minCount,
          maxCount,
          minProductCount,
          maxProductCount,
          minOverSeaProductCount,
          maxOverSeaProductCount,
          minCompetition,
          maxCompetition,
          minOverSeaCompetition,
          maxOverSeaCompetition,
          overSeaProductCount,
        },
      })
      console.log("response1", response)
      const { count, list } = response.data.SourcingKeyword
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

  const hadleFavorite = ({ _id, isFavorite }) => {
    const temp = keywordList.map((item) => {
      if (item._id === _id) {
        item.isFavorite = isFavorite
      }
      return item
    })
    setKeywordtList(temp)
  }

  const columns = [
    {
      title: (
        <StarFilled
          style={{
            color: "#fdd835",
            fontSize: "20px",
          }}
        />
      ),
      fixed: "left",
      width: 40,
      render: (data) => {
        if (data.isFavorite) {
          return (
            <StarFilled
              style={{
                cursor: "pointer",
                color: "#fdd835",
                fontSize: "20px",
              }}
              onClick={async () => {
                hadleFavorite({ _id: data._id, isFavorite: false })
                await setFavoriteKeyword({
                  variables: {
                    keywordID: data._id,
                    favorite: false,
                  },
                })
              }}
            />
          )
        } else {
          return (
            <StarOutlined
              style={{
                cursor: "pointer",
                color: "#fdd835",
                fontSize: "20px",
              }}
              onClick={async () => {
                hadleFavorite({ _id: data._id, isFavorite: true })
                await setFavoriteKeyword({
                  variables: {
                    keywordID: data._id,
                    favorite: true,
                  },
                })
              }}
            />
          )
        }
      },
    },
    {
      title: <TitleLable>키워드</TitleLable>,
      key: "keyword",
      sorter: true,
      width: 160,
      fixed: "left",
      // filters: [
      //   {
      //     text: "브랜드 제외",
      //     value: "brand",
      //   },
      // ],
      render: (data) => {
        return (
          <div>
            <SourcingContainer>{data.keyword}</SourcingContainer>
            <NluTermsContainer>
              {data.nluTerms.map((item, i) => (
                <div key={i}>{item.keyword}</div>
              ))}
            </NluTermsContainer>
          </div>
        )
      },
    },

    {
      title: <TitleLable>카테고리</TitleLable>,
      key: "category",
      width: 120,
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
        return (
          <>
            <div>{data.category1Name}</div>
            <CattegoryContainer>
              <div>{data.category2Name}</div>
              <div>{data.category3Name}</div>
              <div>{data.category4Name}</div>
            </CattegoryContainer>
          </>
        )
      },
    },
    {
      title: <TitleLable>상품소싱</TitleLable>,
      width: 160,
      render: (data) => {
        return (
          <>
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
            </SourcingContainer>
            <SourcingContainer>
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
            </SourcingContainer>
            <SourcingContainer>
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
                color="#e6370f"
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
          </>
        )
      },
    },
    {
      title: <TitleLable>조회수</TitleLable>,
      key: "monthlyCount",
      width: 140,
      sorter: true,
      render: (data) => {
        return (
          <GraphContainer>
            <Tooltip
              title={`PC: ${data.monthlyPcQcCnt.toLocaleString(
                "ko"
              )} / MOBILE: ${data.monthlyMobileQcCnt.toLocaleString("ko")}`}
            >
              <Progress
                type="dashboard"
                width={50}
                strokeWidth={10}
                percent={100}
                success={{ percent: (data.monthlyPcQcCnt / data.monthlyTotalCnt) * 100 }}
                format={() => data.monthlyTotalCnt.toLocaleString("ko")}
              />
            </Tooltip>
          </GraphContainer>
        )
      },
    },

    {
      title: (
        <TitleLable>
          <div>해외직구</div>
          <div>비율</div>
        </TitleLable>
      ),
      key: "overSeaRate",
      width: 140,
      sorter: true,
      render: (data) => {
        return (
          <GraphContainer>
            <Tooltip
              title={`전체: ${data.totalCount.toLocaleString(
                "ko"
              )} / 해외직구: ${data.overSeaCount.toLocaleString("ko")}`}
            >
              <Progress
                type="dashboard"
                width={50}
                strokeWidth={10}
                percent={Number((data.overSeaRate * 100).toFixed(0))}
                // success={{ percent: (data.monthlyPcQcCnt / data.monthlyTotalCnt) * 100 }}
              />
            </Tooltip>
          </GraphContainer>
        )
      },
    },
    {
      title: (
        <TitleLable>
          <div>1페이지</div>
          <div>단일</div>
          <div>상품 비율</div>
        </TitleLable>
      ),
      key: "singleProductRate",
      width: 140,
      sorter: true,
      render: (data) => {
        if (data.singleProduct !== null) {
          return (
            <GraphContainer>
              <Tooltip
                title={`전체: ${
                  data.totalCount > 40 ? 40 : data.totalCount
                } / 단일상품: ${data.singleProduct.toLocaleString("ko")}`}
              >
                <Progress
                  type="dashboard"
                  width={50}
                  strokeWidth={10}
                  percent={Number(data.singleProductRate * 100).toFixed(0)}
                  // success={{ percent: data.notSalesProductRate * 100 }}
                />
              </Tooltip>
            </GraphContainer>
          )
        } else {
          return <GraphContainer>-</GraphContainer>
        }
      },
    },
    {
      title: (
        <TitleLable>
          <div>1페이지</div>
          <div>판매 안된</div>
          <div>상품 비율</div>
        </TitleLable>
      ),
      key: "notSalesProductRate",
      width: 140,
      sorter: true,
      render: (data) => {
        if (data.notSalesProduct !== null) {
          return (
            <GraphContainer>
              <Tooltip
                title={`전체: ${
                  data.totalCount > 40 ? 40 : data.totalCount
                } / 미판매상품: ${data.notSalesProduct.toLocaleString("ko")}`}
              >
                <Progress
                  type="dashboard"
                  width={50}
                  strokeWidth={10}
                  percent={Number(data.notSalesProductRate * 100).toFixed(0)}
                />
              </Tooltip>
            </GraphContainer>
          )
        } else {
          return "-"
        }
      },
    },
    {
      title: (
        <TitleLable>
          <div>1페이지</div>
          <div>해외직구</div>
          <div>상품 비율</div>
        </TitleLable>
      ),
      key: "overSeaCountRate",
      width: 140,
      sorter: true,
      render: (data) => {
        if (data.overSeaProduct !== null) {
          return (
            <GraphContainer>
              <Tooltip
                title={`전체: ${
                  data.totalCount > 40 ? 40 : data.totalCount
                } / 해외직구상품: ${data.overSeaProduct.toLocaleString("ko")}`}
              >
                <Progress
                  type="dashboard"
                  width={50}
                  strokeWidth={10}
                  percent={Number(data.overSeaCountRate * 100).toFixed(0)}
                />
              </Tooltip>
            </GraphContainer>
          )
        } else {
          return "-"
        }
      },
    },

    {
      title: (
        <TitleLable>
          <div>해외직구탭</div>
          <div>1페이지</div>
          <div>단일 상품 비율</div>
        </TitleLable>
      ),
      key: "overSeaSingleProductRate",
      width: 140,
      sorter: true,
      render: (data) => {
        if (data.overSeaProduct !== null) {
          return (
            <GraphContainer>
              <Tooltip
                title={`${
                  data.totalCount > 40 ? 40 : data.totalCount
                } / ${data.overSeaProduct.toLocaleString("ko")}`}
              >
                <Progress
                  type="dashboard"
                  width={50}
                  strokeWidth={10}
                  percent={Number(data.overSeaSingleProductRate * 100).toFixed(0)}
                />
              </Tooltip>
            </GraphContainer>
          )
        } else {
          return "-"
        }
      },
    },
    {
      title: (
        <TitleLable>
          <div>해외직구탭</div>
          <div>1페이지</div>
          <div>판매 안된 상품 비율</div>
        </TitleLable>
      ),
      key: "overSeaNotSaleProductRate",
      width: 140,
      sorter: true,
      render: (data) => {
        if (data.overSeaNotSalesProduct !== null) {
          return (
            <GraphContainer>
              <Tooltip
                title={`${
                  data.totalCount > 40 ? 40 : data.totalCount
                } / ${data.overSeaNotSalesProduct.toLocaleString("ko")}`}
              >
                <Progress
                  type="dashboard"
                  width={50}
                  strokeWidth={10}
                  percent={Number(data.overSeaNotSaleProductRate * 100).toFixed(0)}
                />
              </Tooltip>
            </GraphContainer>
          )
        } else {
          return "-"
        }
      },
    },

    {
      title: (
        <TitleLable>
          <div>전체</div>
          <div>상품갯수</div>
        </TitleLable>
      ),
      key: "totalCount",
      width: 140,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.totalCount.toLocaleString("ko")}</NumberCell>
      },
    },
    {
      title: (
        <TitleLable>
          <div>해외직구</div>
          <div>상품갯수</div>
        </TitleLable>
      ),
      key: "overSeaCount",
      width: 140,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.overSeaCount.toLocaleString("ko")}</NumberCell>
      },
    },
    {
      title: (
        <TitleLable>
          <div>전체</div>
          <div>경쟁강도</div>
        </TitleLable>
      ),
      key: "competitionIntensity",
      width: 140,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.competitionIntensity.toLocaleString("ko")}</NumberCell>
      },
    },
    {
      title: (
        <TitleLable>
          <div>해외직구</div>
          <div>경쟁강도</div>
        </TitleLable>
      ),
      key: "overSeaCompetitionIntensity",
      width: 140,
      sorter: true,
      render: (data) => {
        return <NumberCell>{data.overSeaCompetitionIntensity.toLocaleString("ko")}</NumberCell>
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
              sort = "15"
              break
            case "descend":
              sort = "16"
              break
            default:
              break
          }
          break
        case "kewyord": // 키워드
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
        case "monthlyCount": // 조회수
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
        case "totalCount": // 전체 상품갯수
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
        case "overSeaCount": // 해외직구 상품갯수
          switch (sorter.order) {
            case "ascend":
              sort = "7"
              break
            case "descend":
              sort = "8"
              break
            default:
          }
          break
        case "overSeaRate": // 해외직구 상품비율
          switch (sorter.order) {
            case "ascend":
              sort = "9"
              break
            case "descend":
              sort = "10"
              break
            default:
          }
          break
        case "competitionIntensity": // 전체 경쟁강도
          switch (sorter.order) {
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
        case "overSeaCompetitionIntensity": // 해외직구 경쟁강도
          switch (sorter.order) {
            case "ascend":
              sort = "13"
              break
            case "descend":
              sort = "14"
              break
            default:
          }
          break
        case "singleProductRate": // 1 페이지 단일상품 비율
          switch (sorter.order) {
            case "ascend":
              sort = "17"
              break
            case "descend":
              sort = "18"
              break
            default:
          }
          break
        case "notSalesProductRate": // 1 페이지 판매 안된 상품 비율
          switch (sorter.order) {
            case "ascend":
              sort = "19"
              break
            case "descend":
              sort = "20"
              break
            default:
          }
          break
        case "overSeaCountRate": // 1 페이지 해외직구 상품 비율
          switch (sorter.order) {
            case "ascend":
              sort = "21"
              break
            case "descend":
              sort = "22"
              break
            default:
          }
          break
        case "overSeaSingleProductRate": // 해외직구탭 1페이지 단일 상품 비율
          switch (sorter.order) {
            case "ascend":
              sort = "23"
              break
            case "descend":
              sort = "24"
              break
            default:
          }
          break
        case "overSeaNotSaleProductRate": // 해외직구탭 1페이지 판매 안된 상품 비율
          switch (sorter.order) {
            case "ascend":
              sort = "25"
              break
            case "descend":
              sort = "26"
              break
            default:
          }
          break
        default:
          break
      }
    }
    console.log("sort", sort)
    setSaveSort(sort)
    setSaveCategoryt(categoryFilter)
    setPagination(pagination)
    handleSearch({ sort, categoryFilter, page: pagination })
  }

  return (
    <Container>
      <BackTop />

      <FilterContainer>
        <FilterFlex>
          <FitlerSegment>
            <div>총 검색수</div>
            <div>
              <Segmented
                defaultValue={"0~5000"}
                options={[
                  {
                    label: "전체",
                    value: "0~0",
                  },
                  {
                    label: "0~5,000",
                    value: "0~5000",
                  },
                  {
                    label: "500~5,000",
                    value: "500~5000",
                  },
                  {
                    label: "0~10,000",
                    value: "0~10000",
                  },
                  {
                    label: "5,000~10,000",
                    value: "5000~10000",
                  },
                  {
                    label: "직접입력",
                    value: "0",
                  },
                ]}
                onChange={(value) => {
                  if (value === "0") {
                    setCountVisible(true)
                  } else {
                    setCountVisible(false)
                    const temp = value.split("~")
                    setMinCount(Number(temp[0]))
                    setMaxCount(Number(temp[1]))
                  }
                }}
              />
            </div>
            {countVisible && (
              <InputNumberContainer>
                <InputNumber
                  min={0}
                  defaultValue={minCount}
                  placeholder="최소"
                  onChange={(value) => setMinCount(value)}
                />
                <div>~</div>
                <InputNumber
                  min={0}
                  defaultValue={maxCount}
                  placeholder="최대"
                  onChange={(value) => setMaxCount(value)}
                />
              </InputNumberContainer>
            )}
          </FitlerSegment>
          <Search
            loading={listLoading}
            allowClear={true}
            placeholder="키워드를 입력하세요."
            size="middle"
            onSearch={(value) => {
              setSearch(value)
              handleSearch({ searchKey: value, sort: saveSort, categoryFilter: saveCategory })
            }}
            enterButton
          />
        </FilterFlex>

        <FilterFlex>
          <FitlerSegment>
            <div>상품수</div>
            <div>
              <Segmented
                defaultValue={"0~2000"}
                options={[
                  {
                    label: "전체",
                    value: "0~0",
                  },
                  {
                    label: "0~1,000",
                    value: "0~1000",
                  },
                  {
                    label: "0~2,000",
                    value: "0~2000",
                  },
                  {
                    label: "0~5,000",
                    value: "0~5000",
                  },
                  {
                    label: "0~10,000",
                    value: "0~10000",
                  },
                  {
                    label: "직접입력",
                    value: "0",
                  },
                ]}
                onChange={(value) => {
                  if (value === "0") {
                    setProductVisible(true)
                  } else {
                    setProductVisible(false)
                    const temp = value.split("~")
                    setMinProductCount(Number(temp[0]))
                    setMaxProductCount(Number(temp[1]))
                  }
                }}
              />
            </div>
            {productVisible && (
              <InputNumberContainer>
                <InputNumber
                  min={0}
                  defaultValue={minProductCount}
                  placeholder="최소"
                  onChange={(value) => setMinProductCount(value)}
                />
                <div>~</div>
                <InputNumber
                  min={0}
                  defaultValue={maxProductCount}
                  placeholder="최대"
                  onChange={(value) => setMaxProductCount(value)}
                />
              </InputNumberContainer>
            )}
          </FitlerSegment>
          <FitlerSegment>
            <div>해외 상품수</div>
            <div>
              <Segmented
                defaultValue={"0~2000"}
                options={[
                  {
                    label: "전체",
                    value: "0~0",
                  },
                  {
                    label: "0~1,000",
                    value: "0~1000",
                  },
                  {
                    label: "0~2,000",
                    value: "0~2000",
                  },
                  {
                    label: "0~5,000",
                    value: "0~5000",
                  },
                  {
                    label: "0~10,000",
                    value: "0~10000",
                  },
                  {
                    label: "직접입력",
                    value: "0",
                  },
                ]}
                onChange={(value) => {
                  console.log("value--", value)
                  if (value === "0") {
                    setOverSeaProductVisible(true)
                  } else {
                    setOverSeaProductVisible(false)
                    const temp = value.split("~")
                    setMinOverSeaProductCount(Number(temp[0]))
                    setMaxOverSeaProductCount(Number(temp[1]))
                  }
                }}
              />
            </div>
            {overSeaProductVisible && (
              <InputNumberContainer>
                <InputNumber
                  min={0}
                  defaultValue={minOverSeaProductCount}
                  placeholder="최소"
                  onChange={(value) => setMinOverSeaProductCount(value)}
                />
                <div>~</div>
                <InputNumber
                  min={0}
                  defaultValue={maxOverSeaProductCount}
                  placeholder="최대"
                  onChange={(value) => setMaxOverSeaProductCount(value)}
                />
              </InputNumberContainer>
            )}
          </FitlerSegment>
        </FilterFlex>

        <FilterFlex>
          <FitlerSegment>
            <div>경쟁강도</div>
            <div>
              <Segmented
                defaultValue={"0~1"}
                options={[
                  {
                    label: "전체",
                    value: "0~0",
                  },
                  {
                    label: "0~1",
                    value: "0~1",
                  },
                  {
                    label: "0~2",
                    value: "0~2",
                  },
                  {
                    label: "0~5",
                    value: "0~5",
                  },
                  {
                    label: "0~10",
                    value: "0~10",
                  },
                  {
                    label: "직접입력",
                    value: "0",
                  },
                ]}
                onChange={(value) => {
                  if (value === "0") {
                    setCompetitionVisible(true)
                  } else {
                    setCompetitionVisible(false)
                    const temp = value.split("~")
                    setMinCompetition(Number(temp[0]))
                    setMaxCompetition(Number(temp[1]))
                  }
                }}
              />
            </div>
            {competitionVisible && (
              <InputNumberContainer>
                <InputNumber
                  min={0}
                  defaultValue={minCompetition}
                  placeholder="최소"
                  onChange={(value) => setMinCompetition(value)}
                />
                <div>~</div>
                <InputNumber
                  min={0}
                  defaultValue={maxCompetition}
                  placeholder="최대"
                  onChange={(value) => setMaxCompetition(value)}
                />
              </InputNumberContainer>
            )}
          </FitlerSegment>
          <FitlerSegment>
            <div>해외 경쟁강도</div>
            <div>
              <Segmented
                defaultValue={"0~1"}
                options={[
                  {
                    label: "전체",
                    value: "0~0",
                  },
                  {
                    label: "0~1",
                    value: "0~1",
                  },
                  {
                    label: "0~2",
                    value: "0~2",
                  },
                  {
                    label: "0~5",
                    value: "0~5",
                  },
                  {
                    label: "0~10",
                    value: "0~10",
                  },
                  {
                    label: "직접입력",
                    value: "0",
                  },
                ]}
                onChange={(value) => {
                  if (value === "0") {
                    setOverSeaCompetitionVisible(true)
                  } else {
                    setOverSeaCompetitionVisible(false)
                    const temp = value.split("~")
                    setMinOverSeaCompetition(Number(temp[0]))
                    setMaxOverSeaCompetition(Number(temp[1]))
                  }
                }}
              />
            </div>
            {overSeaCompetitionVisible && (
              <InputNumberContainer>
                <InputNumber
                  min={0}
                  defaultValue={minOverSeaCompetition}
                  placeholder="최소"
                  onChange={(value) => setMinOverSeaCompetition(value)}
                />
                <div>~</div>
                <InputNumber
                  min={0}
                  defaultValue={maxOverSeaCompetition}
                  placeholder="최대"
                  onChange={(value) => setMaxOverSeaCompetition(value)}
                />
              </InputNumberContainer>
            )}
          </FitlerSegment>
          <FitlerSegment>
            <div>1P 해외 상품수</div>
            <div>
              <Segmented
                defaultValue={"1"}
                options={[
                  {
                    label: "전체",
                    value: "0",
                  },
                  {
                    label: "1 이상",
                    value: "1",
                  },
                  {
                    label: "5 이상",
                    value: "5",
                  },
                  {
                    label: "10 이상",
                    value: "10",
                  },
                  {
                    label: "20 이상",
                    value: "20",
                  },
                ]}
                onChange={(value) => {
                  setOverSeaProductCount(Number(value))
                }}
              />
            </div>
          </FitlerSegment>
        </FilterFlex>
      </FilterContainer>
      <Table
        size="small"
        width={1000}
        columns={columns}
        rowKey={(data) => data._id}
        dataSource={keywordList}
        pagination={pagination}
        loading={listLoading}
        onChange={handleTableChange}
        expandable={{
          expandedRowRender: (data) => {
            return (
              <ExpandableNaverShopping
                // ids={data.products}
                keyword={data.keyword}
              />
            )
          },
        }}
        scroll={{ x: 400, y: 830 }}
      />
    </Container>
  )
}

export default SourcingKeyword

const Container = styled.div`
  overflow: auto;
  max-width: 1500px;
`
const ExpandableNaverShopping = ({ ids, keyword }) => {
  // console.log("ids", ids)
  const { data } = useQuery(GET_NAVER_KEYWORD_ITEM_ID, {
    variables: {
      ids,
      keyword,
    },
  })
  console.log("data", data)
  if (data) {
    return (
      <NaverShoppingWrapper>
        {data.GetNaverItemWithKeywordID.map((item, index) => {
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
  margin-right: 25px;
`

const SourcingContainer = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 14px;
  color: #121212;
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
  margin-right: 10px;
  margin-bottom: 5px;
`

const FilterContainer = styled.div`
  padding: 15px;
  background: #dddddd;
`

const FilterFlex = styled.div`
  display: flex;
  margin-bottom: 10px;
  width: 100%;
  & > :nth-child(n) {
    width: 50%;
  }
`
const FitlerSegment = styled.div`
  display: flex;
  align-items: center;
  & > :nth-child(1) {
    min-width: 100px;
    max-width: 100px;
  }
`

const InputNumberContainer = styled.div`
  display: flex;
  align-items: center;
`

const CattegoryContainer = styled.div`
  font-size: 10px;
`

const TitleLable = styled.div`
  text-align: center;
  font-size: 12px;
  color: #484848;
  font-weight: 700;
`

const GraphContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
`

const NluTermsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  & > :not(:last-child) {
    margin-right: 4px;
  }
`
