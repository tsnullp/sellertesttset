import React, { useState } from "react"
import styled from "styled-components"
import { TaobaoItemList } from "components"
import smartStoreCategory from "../CategoryForm/category"
import { Select, Button, Table, Tag, Tooltip, List, Space, Switch, notification, Spin } from "antd"
import {
  SearchOutlined,
  CalendarOutlined,
  TaobaoCircleOutlined,
  CommentOutlined,
  StarOutlined,
  AccountBookOutlined,
  ShoppingCartOutlined
} from "@ant-design/icons"
import { useQuery } from "@apollo/client"
import { GET_CATEGORY_KEYWORDS, SEARCH_KEYWORD, RELATED_KEYWORD_ONLY } from "../../../gql"
import moment from "moment"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { shell } = window.require("electron")
const { Option } = Select

const KeywordForm = () => {
  const [taobaotype, setTaobaotype] = useState("image")
  const [keyword, setKeyword] = useState(null)
  const [naverItem, setNaverItem] = useState(null)
  const [refetchItem, setRefetchItem] = useState(0)
  const [categoryObj, setCategoryObj] = useState({
    대분류: localStorage.getItem("대분류") || "패션의류",
    중분류: localStorage.getItem("중분류") || "",
    소분류: localStorage.getItem("소분류") || "",
    세분류: localStorage.getItem("세분류") || ""
  })

  const [category, setCategory] = useState(
    `${categoryObj.대분류.replace("/", "")}${categoryObj.중분류.replace(
      "/",
      ""
    )}${categoryObj.소분류.replace("/", "")}${categoryObj.세분류.replace("/", "")}`
  )

  const handleCategory = () => {
    setCategory(
      `${categoryObj.대분류.replace("/", "")}${categoryObj.중분류.replace(
        "/",
        ""
      )}${categoryObj.소분류.replace("/", "")}${categoryObj.세분류.replace("/", "")}`
    )
    setRefetchItem(refetchItem + 1)
  }

  const handleKeyword = value => {
    setKeyword(value)
    setTaobaotype("keyword")
  }

  const handleImage = value => {
    setNaverItem(value)
    setTaobaotype("image")
  }

  return (
    <>
      <CategoryForm
        handleCategory={handleCategory}
        categoryObj={categoryObj}
        setCategoryObj={setCategoryObj}
        category={category}
        setCategory={setCategory}
      />
      <Container>
        <KeywordList category={category} handleKeyword={handleKeyword} handleImage={handleImage} />
        <TaobaoItmeContainer>
          <TaobaoItemList
            {...naverItem}
            type={taobaotype}
            keyword={keyword}
            refetchItem={refetchItem}
          />
        </TaobaoItmeContainer>
      </Container>
    </>
  )
}

export default KeywordForm

const TaobaoItmeContainer = styled.div`
  box-sizing: border-box;
  border-left: ${props => `2px solid ${props.theme.primaryDark}`};
  margin-left: 20px;
  margin-right: 20px;
`

const Container = styled.div`
  box-sizing: border-box;

  display: flex;
  & > :nth-child(n) {
    flex: 1;
  }
`
const CategoryForm = ({ handleCategory, categoryObj, setCategoryObj, category, setCategory }) => {
  const 대분류 = smartStoreCategory.reduce(
    (unique, item) => (unique.includes(item["대분류"]) ? unique : [...unique, item["대분류"]]),
    []
  )

  let 중분류 = smartStoreCategory
    .filter(item => item["대분류"] === categoryObj["대분류"])
    .reduce(
      (unique, item) => (unique.includes(item["중분류"]) ? unique : [...unique, item["중분류"]]),
      []
    )

  let 소분류 = smartStoreCategory
    .filter(
      item => item["대분류"] === categoryObj["대분류"] && item["중분류"] === categoryObj["중분류"]
    )
    .reduce(
      (unique, item) => (unique.includes(item["소분류"]) ? unique : [...unique, item["소분류"]]),
      []
    )

  let 세분류 = smartStoreCategory
    .filter(
      item =>
        item.대분류 === categoryObj.대분류 &&
        item.중분류 === categoryObj.중분류 &&
        item.소분류 === categoryObj.소분류
    )
    .reduce(
      (unique, item) => (unique.includes(item["세분류"]) ? unique : [...unique, item["세분류"]]),
      []
    )

  const handleChange1 = value => {
    setCategoryObj({
      대분류: value,
      중분류: "",
      소분류: "",
      세분류: ""
    })
    localStorage.setItem("대분류", value)
    localStorage.removeItem("중분류")
    localStorage.removeItem("소분류")
    localStorage.removeItem("세분류")
    // setCategory(value)
  }

  const handleChange2 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: value,
      소분류: "",
      세분류: ""
    })
    localStorage.setItem("중분류", value)
    localStorage.removeItem("소분류")
    localStorage.removeItem("세분류")
    // setCategory(`${categoryObj.대분류}${value}`)
  }

  const handleChange3 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: categoryObj.중분류,
      소분류: value,
      세분류: ""
    })
    localStorage.setItem("소분류", value)
    localStorage.removeItem("세분류")
    // setCategory(`${categoryObj.대분류}${categoryObj.중분류}${value}`)
  }

  const handleChange4 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: categoryObj.중분류,
      소분류: categoryObj.소분류,
      세분류: value
    })
    localStorage.setItem("세분류", value)
    // setCategory(`${categoryObj.대분류}${categoryObj.중분류}${categoryObj.소분류}${value}`)
  }

  const Cagegory1 = () => {
    return 대분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory2 = () => {
    return 중분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory3 = () => {
    return 소분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory4 = () => {
    return 세분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  return (
    <CategoryContainer>
      <Select
        size="large"
        defaultValue={categoryObj.대분류}
        style={{ width: 160 }}
        onChange={handleChange1}
      >
        {Cagegory1()}
      </Select>
      <Select
        size="large"
        listHeight={600}
        value={categoryObj.중분류}
        style={{ width: 160 }}
        onChange={handleChange2}
        disabled={중분류.length === 0}
      >
        {Cagegory2()}
      </Select>
      <Select
        size="large"
        value={categoryObj.소분류}
        style={{ width: 160 }}
        onChange={handleChange3}
        disabled={소분류.length === 0}
      >
        {Cagegory3()}
      </Select>
      <Select
        size="large"
        value={categoryObj.세분류}
        style={{ width: 160 }}
        onChange={handleChange4}
        disabled={세분류.length === 0}
      >
        {Cagegory4()}
      </Select>
      <Button
        size="large"
        type="primary"
        icon={<SearchOutlined />}
        onClick={() => handleCategory()}
      >
        검색
      </Button>
    </CategoryContainer>
  )
}

const CategoryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  & > :not(:last-child) {
    margin-right: 10px;
  }
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: ${props => `1px solid ${props.theme.primaryDark}`};
`

const KeywordList = ({ category, handleKeyword, handleImage }) => {
  const { data, networkStatus } = useQuery(GET_CATEGORY_KEYWORDS, {
    variables: {
      category
    },
    notifyOnNetworkStatusChange: true
  })

  const columns = [
    {
      title: "순위",
      align: "right",
      dataIndex: "rank",
      render: rank => <div>{rank}</div>,
      width: "80px",
      sorter: {
        compare: (a, b) => a.rank - b.rank
      }
    },
    {
      title: "키워드",
      dataIndex: "",
      render: data => {
        let color = "default"
        if (data.compete < 1 && data.compete > 0) {
          color = "volcano"
        } else if (data.compete < 10 && data.compete >= 1) {
          color = "purple"
        }
        return (
          <div>
            <Tag
              color={color}
              key={data.keyword}
              style={{
                cursor: "pointer",
                userSelect: "none",
                padding: "4px",
                fontSize: "13px"
              }}
              onClick={() => handleKeyword(data.keyword)}
            >
              {data.keyword}
            </Tag>
          </div>
        )
      }
    },
    {
      title: "조회수",
      align: "right",
      dataIndex: "",
      render: data => (
        <Tooltip
          title={`PC: ${Number(data.pc).toLocaleString("ko")} MOBILE: ${Number(
            data.mobile
          ).toLocaleString("ko")}`}
        >
          <div>{Number(data.total).toLocaleString("ko")}</div>
        </Tooltip>
      ),
      width: "120px",
      sorter: {
        compare: (a, b) => a.total - b.total
      }
    },
    {
      title: "상품수",
      align: "right",
      dataIndex: "product",
      render: product => <div>{Number(product).toLocaleString("ko")}</div>,
      width: "120px",
      sorter: {
        compare: (a, b) => a.product - b.product
      }
    },
    {
      title: "경쟁강도",
      align: "right",
      dataIndex: "compete",
      render: compete => <div>{Number(compete).toLocaleString("ko")}</div>,
      width: "120px",
      sorter: {
        compare: (a, b) => a.compete - b.compete
      }
    }
    // {
    //   title: "PC클릭률",
    //   align: "right",
    //   dataIndex: "pcrate",
    //   render: pcrate => <div>{Number(pcrate).toLocaleString("ko")}</div>,
    //   width: "150px",
    //   sorter: {
    //     compare: (a, b) => a.pcrate - b.pcrate
    //   },
    //   fixed: true
    // },
    // {
    //   title: "모바일클릭률",
    //   align: "right",
    //   dataIndex: "mobilerate",
    //   render: mobilerate => <div>{Number(mobilerate).toLocaleString("ko")}</div>,
    //   width: "150px",
    //   sorter: {
    //     compare: (a, b) => a.mobilerate - b.mobilerate
    //   }
    // },
    // {
    //   title: "광고클릭경쟁률",
    //   align: "right",
    //   dataIndex: "adclickrate",
    //   render: adclickrate => <div>{Number(adclickrate).toLocaleString("ko")}</div>,
    //   width: "150px",
    //   sorter: {
    //     compare: (a, b) => a.adclickrate - b.adclickrate
    //   }
    // },
    // {
    //   title: "클릭대비광고단가",
    //   align: "right",
    //   dataIndex: "adsclicks",
    //   render: adsclicks => <div>{Number(adsclicks).toLocaleString("ko")}</div>,
    //   width: "150px",
    //   sorter: {
    //     compare: (a, b) => a.adsclicks - b.adsclicks
    //   }
    // }
  ]

  return (
    <Table
      style={{ cursor: "pointer" }}
      columns={columns}
      rowKey={record => record.keyword}
      dataSource={data && data.GetCategoryKeywords ? data.GetCategoryKeywords : []}
      loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      pagination={false}
      scroll={{ y: 760 }}
      expandable={{
        expandedRowRender: record => {
          return (
            <>
              <RepresentativeKeywordList keyword={record.keyword} handleKeyword={handleKeyword} />
              <NaverKeywordList keyword={record.keyword} handleImage={handleImage} />
            </>
          )
        }
      }}
    />
  )
}

const NaverKeywordList = ({ keyword, handleImage }) => {
  const [refetchItem, setRefetchItem] = useState(0)
  const [isUnsold, setUnsold] = useState(
    localStorage.getItem("unsold") === "true" || localStorage.getItem("unsold") === true
      ? true
      : false
  )
  const { error, data, networkStatus } = useQuery(SEARCH_KEYWORD, {
    variables: {
      keyword
    },
    notifyOnNetworkStatusChange: true
  })

  if (error) {
    return <div>{error.message}</div>
  }

  const handleNaverItem = item => {
    handleImage(item)
    setRefetchItem(refetchItem + 1)
  }

  const IconText = ({ icon, text }) => (
    <Space>
      {React.createElement(icon)}
      {text}
    </Space>
  )

  let result = []
  if (data && isUnsold) {
    result = data.searchKeyword
  } else if (data && !isUnsold) {
    result = data.searchKeyword.filter(
      item => !(item.reviewCount === "0" && item.purchaseCnt === "0")
    )
  }

  const unsoldOnChange = value => {
    setUnsold(value)
  }

  return (
    <NaverKeywordContainer>
      <CheckBoxContainer>
        <Switch
          checked={isUnsold === "true" || isUnsold === true ? true : false}
          onChange={unsoldOnChange}
        />
        <span>구매건수 없는 상품 포함</span>
      </CheckBoxContainer>
      <ListContainer>
        <List
          itemLayout="vertical"
          size="large"
          loading={networkStatus === 1 || networkStatus === 4}
          pagination={{
            onChange: page => {
              console.log(page)
            },
            pageSize: 5
          }}
          dataSource={result}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Tooltip title="리뷰건수" key={item.id}>
                  <span>
                    <IconText
                      icon={CommentOutlined}
                      text={Number(item.reviewCount).toLocaleString("ko")}
                      key="list-vertical-star-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="구매건수" key={item.id}>
                  <span>
                    <IconText
                      icon={StarOutlined}
                      text={Number(item.purchaseCnt).toLocaleString("ko")}
                      key="list-vertical-star-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="판매가" key={item.id}>
                  <span>
                    <IconText
                      icon={AccountBookOutlined}
                      text={Number(item.lowPrice).toLocaleString("ko")}
                      key="list-vertical-price-o"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="배송비" key={item.id}>
                  <span>
                    <IconText
                      icon={ShoppingCartOutlined}
                      text={Number(item.dlvry).toLocaleString("ko")}
                      key="list-vertical-dlvry"
                    />
                  </span>
                </Tooltip>,
                <Tooltip title="최종 판매가" key={item.id}>
                  <span>
                    <TotalPrice>{Number(item.price).toLocaleString("ko")}</TotalPrice>
                  </span>
                </Tooltip>
              ]}
              extra={
                <ExtraContainer>
                  <ImageContainer onClick={() => handleNaverItem(item)}>
                    <img width={160} height={160} alt={item.productName} src={item.imageUrl} />
                    {item.registered && <OverlayText>등록됨</OverlayText>}
                  </ImageContainer>
                  <Button
                    block={true}
                    type="primary"
                    icon={<TaobaoCircleOutlined />}
                    onClick={() => handleNaverItem(item)}
                  >
                    타오바오에서 찾기
                  </Button>
                </ExtraContainer>
              }
            >
              <List.Item.Meta
                avatar={<Logo src={item.logo} onerror="this.style.display='none';" />}
                title={
                  <Tooltip title="쇼핑몰" key={item.id}>
                    <ItemTitleLink
                      onClick={() => {
                        if (item.crUrl) {
                          shell.openExternal(item.crUrl)
                        } else {
                          notification["error"]({
                            message: "쇼핑몰 주소 없음"
                          })
                        }
                      }}
                    >
                      {item.mallName && item.mallName.length > 0 ? (
                        item.mallName
                      ) : (
                        <LowPriceConfirm>가격비교 -> 최저가 확인 필요</LowPriceConfirm>
                      )}
                    </ItemTitleLink>
                  </Tooltip>
                }
                description={
                  <Tooltip title="상품명" key={item.id}>
                    {item.productName}
                  </Tooltip>
                }
              />

              <TaobaoItmeSearchContainer>
                <Tooltip title="등록일" key={item.id}>
                  <Space>
                    <CalendarOutlined />
                    <OpenDate>
                      {moment(item.openDate, "YYYYMMDDhhmmss").format("YYYY.MM.DD")}
                    </OpenDate>
                    <OpenTime>{moment(item.openDate, "YYYYMMDDhhmmss").format("hh:mm")}</OpenTime>
                  </Space>
                </Tooltip>
              </TaobaoItmeSearchContainer>
            </List.Item>
          )}
        />
      </ListContainer>
    </NaverKeywordContainer>
  )
}

const ListContainer = styled(SimpleBar)`
  padding: 20px;
  height: 500px;
  overflow-y: auto;
`

const TotalPrice = styled.div`
  font-size: 16px;
  font-weight: 900;
  color: ${props => props.theme.primaryDark};
`

const OpenDate = styled.div`
  margin-right: 4px;
  text-align: center;
  color: #444444;
  font-weight: 700;
`

const OpenTime = styled.div`
  text-align: center;
  color: #444444;
`

const TaobaoItmeSearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  height: 30px;
`

const ItemTitleLink = styled.div`
  display: inline;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

const Logo = styled.img`
  min-width: 30px;
  max-width: 30px;
  min-height: 30px;
  max-height: 30px;
  border-radius: 50%;
`

const LowPriceConfirm = styled.div`
  color: #ff545c;
`

const ExtraContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: stretch;
`
const ImageContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${props => `2px solid ${props.theme.primaryDark}`};
  margin-bottom: 10px;
  border-radius: 5px;
  overflow: hidden;
`

const OverlayText = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 0, 0, 0.5); /* Black see-through */
  width: 100%;
  color: white;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
`

const CheckBoxContainer = styled.div`
  font-size: 13px;
  & > :nth-child(2) {
    margin-left: 5px;
  }
`
const NaverKeywordContainer = styled.div``

const RepresentativeKeywordList = ({ keyword, handleKeyword }) => {
  const { data } = useQuery(RELATED_KEYWORD_ONLY, {
    variables: {
      keyword
    },
    fetchPolicy: "cache-and-network"
  })

  if (data && data.RelatedKeywordOnly) {
    return (
      <TagContainer>
        {data.RelatedKeywordOnly.map((item, i) => (
          <Tag
            style={{ cursor: "pointer", marginBottom: "5px" }}
            color="processing"
            key={i}
            onClick={() => handleKeyword(item)}
          >
            {item}
          </Tag>
        ))}
      </TagContainer>
    )
  } else {
    return <Spin />
  }
}

const TagContainer = styled.div`
  padding: 10px;
`
