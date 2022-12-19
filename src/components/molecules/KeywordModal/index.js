import React, { useState, useEffect, useRef } from "react"
import { TitleHighlightForm } from "components"
import { Modal, Input, Tag, Spin, Button, Tooltip } from "antd"
import {
  SEARCH_COUPANG_RELATED_KEYWORD,
  SEARCH_COUPANG_AUTO_KEYWORD,
  SEARCH_NAVER_RELATED_KEYWORD,
  SEARCH_NAVER_PRODUCT_KEYWORD,
  SEARCH_NAVER_TAG_KEYWORD,
  OPTIMIZATION_PRODUCT_NAME,
  GET_NAVER_CATALOG_KEYWORD,
  GET_COMBINE_TITLE

} from "../../../gql"
import { useQuery, useMutation } from "@apollo/client"
import styled from "styled-components"
import { SortableContainer, SortableElement } from "react-sortable-hoc"

import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const { Search } = Input

const KeywordModal = ({
  isModalVisible,
  handleOk,
  handleCancel,
  title,
  keyword,
  mainImages = [],
  spec = [],
  detailUrl,
  keywordTag = false,
}) => {
  const [search, setSearch] = useState(keyword)

  const [naverProductLoading, setNaverProductLoading] = useState(false)
  const [naverTagLoading, setNaverTagLoading] = useState(false)
  const [couapngRelatedLoading, setCouapngRelatedLoading] = useState(false)
  const [searchCouapngRelatedKeyword] = useMutation(SEARCH_COUPANG_RELATED_KEYWORD)
  const [searchCouapngAutoKeyword] = useMutation(SEARCH_COUPANG_AUTO_KEYWORD)
  const [searchNaverRelatedKeyword] = useMutation(SEARCH_NAVER_RELATED_KEYWORD)
  const [searchNaverProductKeyword] = useMutation(SEARCH_NAVER_PRODUCT_KEYWORD)
  const [searchNaverTagKeyword] = useMutation(SEARCH_NAVER_TAG_KEYWORD)
  const [optimizationProductName] = useMutation(OPTIMIZATION_PRODUCT_NAME)
  const [getCombineTitle] = useMutation(GET_COMBINE_TITLE)

  const [loading, setLoading] = useState(false)
  const [optimizationLoading, setOptimizationLoading] = useState(false)
  const [combineLoading, setCombineLoading] = useState(false)
  const [coupangRelatedKeyword, setCoupangRelatedKeyword] = useState([])
  const [coupangAutoKeyword, setCoupangAutoKeyword] = useState([])
  const [naverRelatedKeyword, setNaverRelatedKeyword] = useState([])
  const [naverPorductKeyword, setNaverProductdKeyword] = useState([])
  const [naverTagKeyword, setNaverTagKeyword] = useState([])
  const [combineKeyword, SetCombineKeyword] = useState([])

  const [selectedKeywords, SetKeyword] = useState([])

  const handelSearch = async (value) => {
    if (value.length === 0) return
    setLoading(true)

    const promiseArray = [
      new Promise(async (resolve, reject) => {
        setCouapngRelatedLoading(true)
        try {
          const coupangRelatedKeywordResponse = await searchCouapngRelatedKeyword({
            variables: {
              keyword: value,
            },
          })
          if (coupangRelatedKeywordResponse.data.SearchCoupangRelatedKeywrod) {
            setCoupangRelatedKeyword(coupangRelatedKeywordResponse.data.SearchCoupangRelatedKeywrod)
          }
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          setCouapngRelatedLoading(false)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const coupangAutoKeywordResponse = await searchCouapngAutoKeyword({
            variables: {
              keyword: value,
            },
          })
          if (coupangAutoKeywordResponse.data.SearchCoupangAutoKeywrod) {
            setCoupangAutoKeyword(coupangAutoKeywordResponse.data.SearchCoupangAutoKeywrod)
          }
          resolve()
        } catch (e) {
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        try {
          const naverRelatedKeywordResponse = await searchNaverRelatedKeyword({
            variables: {
              keyword: value,
            },
          })
          if (naverRelatedKeywordResponse.data.SearchNaverRelatedKeywrod) {
            setNaverRelatedKeyword(naverRelatedKeywordResponse.data.SearchNaverRelatedKeywrod)
          }
          resolve()
        } catch (e) {
          reject(e)
        }
      }),
      new Promise(async (resolve, reject) => {
        setNaverProductLoading(true)
        try {
          const naverProductKeywordResponse = await searchNaverProductKeyword({
            variables: {
              keyword: value,
            },
          })
          if (naverProductKeywordResponse.data.SearchNaverProductKeywrod) {
            setNaverProductdKeyword(naverProductKeywordResponse.data.SearchNaverProductKeywrod)
          }
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          setNaverProductLoading(false)
        }
      }),
      new Promise(async (resolve, reject) => {
        setNaverTagLoading(true)
        try {
          const naverTagKeywordResponse = await searchNaverTagKeyword({
            variables: {
              keyword: value,
            },
          })
          if (naverTagKeywordResponse.data.SearchNaverTagKeyword) {
            setNaverTagKeyword(naverTagKeywordResponse.data.SearchNaverTagKeyword)
          }
          resolve()
        } catch (e) {
          reject(e)
        } finally {
          setNaverTagLoading(false)
        }
      }),
    ]

    // const response = await searchTitle({
    //   variables: {
    //     keyword: value
    //   }
    // })

    // if (response.data.searchTitle) {
    //   setData(response.data.searchTitle)
    // }
    await Promise.all(promiseArray)
    setLoading(false)
  }
  useEffect(() => {
    setSearch(keyword)
    if (keyword && keyword.length > 0 && search !== keyword) {
      // handelSearch(keyword)
    }
  }, [keyword])

  useEffect(() => {
    if (title && title.length > 0) {
      SetKeyword(title)
    }
  }, [title])

  const handleKeyword = (value) => {
    if (keywordTag) {
      if (selectedKeywords && selectedKeywords.length > 0) {
        SetKeyword(`${selectedKeywords}, ${value}`)
      } else {
        SetKeyword(`${value}`)
      }
    } else {
      SetKeyword(`${selectedKeywords} ${value}`)
    }
  }

  const InputChange = (e) => {
    SetKeyword(e.target.value)
  }

  const handleOptimization = async () => {
    try {
      setOptimizationLoading(true)
      const response = await optimizationProductName({
        variables: {
          title: selectedKeywords,
        },
      })
      console.log("response", response)
      if (response.data.OptimizationProductName) {
        SetKeyword(response.data.OptimizationProductName)
      }
    } catch (e) {
    } finally {
      setOptimizationLoading(false)
    }
  }

  const handleCombineTitle = async () => {
    try {
      setCombineLoading(true)
      const response = await getCombineTitle({
        variables: {
          title: selectedKeywords
        }
      })
      if (response.data.GetCombineTitleKeyword) {
        SetCombineKeyword(response.data.GetCombineTitleKeyword)
      }
    } catch(e){
      
    } finally {
      setCombineLoading(false)
    }
    
  }

  return (
    <Modal
      width={1600}
      title={
        <OriginalTitleContainer>
          {title &&
            title
              .split(" ")
              .filter((item) => item.length > 0)
              .map((item, i) => {
                return (
                  <OrginalTtitleKeyword
                    key={i}
                    onClick={() => {
                      setSearch(item)
                      // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item}`)
                    }}
                  >
                    {item}
                  </OrginalTtitleKeyword>
                )
              })}
        </OriginalTitleContainer>
      }
      visible={isModalVisible}
      onOk={() => handleOk(selectedKeywords)}
      onCancel={handleCancel}
      maskClosable={false}
      zIndex={1000}
    >
      <ModalContent>
        <div>
          {mainImages.length > 0 && (
            <MainImageContent>
              {mainImages.map((item) => (
                <img style={{ display: "block", marginBottom: "5px" }} src={item} width={200} />
              ))}
            </MainImageContent>
          )}
        </div>
        <div>
          <SearchContainer>
            <div>
              <Search
                block={true}
                value={search}
                allowClear={true}
                placeholder="키워드를 입력하세요."
                onSearch={(value) => {
                  handelSearch(value)
                  // refetch()
                }}
                onChange={(e) => setSearch(e.target.value)}
                enterButton
                loading={loading}
              />
            </div>
          </SearchContainer>
          <TitleHighlightForm text={selectedKeywords} />
          <InputContainer>
            <Input allowClear={true} value={selectedKeywords} onChange={InputChange} />
            <Button loading={optimizationLoading} onClick={handleOptimization}>
              최적화
            </Button>
            <Button loading={combineLoading} onClick={handleCombineTitle}>상품명 조회수</Button>
          </InputContainer>
          
          <KeywordResultContainer>
            <SearchKeywordContainer>
                <SearchKeywordTitle>상품명 조합 키워드</SearchKeywordTitle>
                <SearchKeywordContent>
                  <KeywordLabelContainer>
                    {combineLoading && (
                      <SpinContainer>
                        <div>
                          <Spin />
                        </div>
                      </SpinContainer>
                    )}
                    {!combineLoading &&
                      combineKeyword
                        .filter((item) => item.keyword.trim().length > 0)
                        .map((item, i) => {
                          return (
                            <Tooltip  key={i}  title={`${item.count.toLocaleString("ko")}`}>
                              <KeywordLabel onClick={() => handleKeyword(item.keyword)}>
                                {item.keyword.trim()}
                              </KeywordLabel>
                            </Tooltip>
                          )
                        })}
                  </KeywordLabelContainer>
                </SearchKeywordContent>
              </SearchKeywordContainer>
              
            
            {detailUrl && detailUrl.includes("https://cr.shopping.naver.com/adcr.nhn") && (
              <SearchKeywordContainer>
                <SearchKeywordTitle>카달로그 추천 키워드</SearchKeywordTitle>
                <SearchKeywordContent>
                  <KeywordLabelContainer>
                    {CatalogKeyword({
                      url: detailUrl,
                      keyword: title,
                      handleKeyword: handleKeyword,
                    })}
                  </KeywordLabelContainer>
                </SearchKeywordContent>
              </SearchKeywordContainer>
            )}
            {spec && spec.length > 0 && (
              <SearchKeywordContainer>
                <SearchKeywordTitle>속성 사양</SearchKeywordTitle>
                <SearchKeywordContent>
                  <KeywordLabelContainer>
                    {spec
                      .filter((item) => item.attrValue.trim().length > 0)
                      .map((item, i) => {
                        return (
                          <KeywordLabel
                            key={i}
                            onClick={() => handleKeyword(item.attrValue.trim())}
                          >
                            {item.attrValue.trim()}
                          </KeywordLabel>
                        )
                      })}
                  </KeywordLabelContainer>
                </SearchKeywordContent>
              </SearchKeywordContainer>
            )}
            <SearchKeywordContainer>
              <SearchKeywordTitle>쿠팡 연관 키워드</SearchKeywordTitle>
              <SearchKeywordContent>
                <KeywordLabelContainer>
                  {couapngRelatedLoading && (
                    <SpinContainer>
                      <div>
                        <Spin />
                      </div>
                    </SpinContainer>
                  )}
                  {!couapngRelatedLoading &&
                    coupangRelatedKeyword
                      .filter((item) => item.trim().length > 0)
                      .map((item, i) => {
                        return (
                          <KeywordLabel key={i} onClick={() => handleKeyword(item)}>
                            {item.trim()}
                          </KeywordLabel>
                        )
                      })}
                </KeywordLabelContainer>
              </SearchKeywordContent>
            </SearchKeywordContainer>
            <SearchKeywordContainer>
              <SearchKeywordTitle>쿠팡 자동완성 키워드</SearchKeywordTitle>
              <SearchKeywordContent>
                <KeywordLabelContainer>
                  {coupangAutoKeyword
                    .filter((item) => item.trim().length > 0)
                    .map((item, i) => {
                      return (
                        <KeywordLabel key={i} onClick={() => handleKeyword(item)}>
                          {item.trim()}
                        </KeywordLabel>
                      )
                    })}
                </KeywordLabelContainer>
              </SearchKeywordContent>
            </SearchKeywordContainer>
            <SearchKeywordContainer>
              <SearchKeywordTitle>네이버 상품 키워드</SearchKeywordTitle>
              <SearchKeywordContent>
                <KeywordLabelContainer>
                  {naverProductLoading && (
                    <SpinContainer>
                      <div>
                        <Spin />
                      </div>
                    </SpinContainer>
                  )}
                  {!naverProductLoading &&
                    naverPorductKeyword
                      .filter((item) => item.trim().length > 0)
                      .map((item, i) => {
                        return (
                          <KeywordLabel key={i} onClick={() => handleKeyword(item)}>
                            {item.trim()}
                          </KeywordLabel>
                        )
                      })}
                </KeywordLabelContainer>
              </SearchKeywordContent>
            </SearchKeywordContainer>
            <SearchKeywordContainer>
              <SearchKeywordTitle>네이버 태그 키워드</SearchKeywordTitle>
              <SearchKeywordContent>
                <KeywordLabelContainer>
                  {naverTagLoading && (
                    <SpinContainer>
                      <div>
                        <Spin />
                      </div>
                    </SpinContainer>
                  )}
                  {!naverTagLoading &&
                    naverTagKeyword
                      .filter((item) => item.trim().length > 0)
                      .map((item, i) => {
                        return (
                          <KeywordLabel key={i} onClick={() => handleKeyword(item)}>
                            {item.trim()}
                          </KeywordLabel>
                        )
                      })}
                </KeywordLabelContainer>
              </SearchKeywordContent>
            </SearchKeywordContainer>
            <SearchKeywordContainer>
              <SearchKeywordTitle>네이버 검색 광고 키워드</SearchKeywordTitle>
              <SearchKeywordContent>
                <KeywordLabelContainer>
                  {naverRelatedKeyword
                    .filter((item) => item.trim().length > 0)
                    .map((item, i) => {
                      return (
                        <KeywordLabel key={i} onClick={() => handleKeyword(item)}>
                          {item.trim()}
                        </KeywordLabel>
                      )
                    })}
                </KeywordLabelContainer>
              </SearchKeywordContent>
            </SearchKeywordContainer>
          </KeywordResultContainer>
        </div>
      </ModalContent>
    </Modal>
  )
}

export default KeywordModal

const KeywordResultContainer = styled(SimpleBar)`
  margin-top: 15px;
  max-height: 500px;
  overflow-y: auto;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
`

const KeywordLabelContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  box-sizing: border-box;
`

const KeywordLabel = styled.div`
  cursor: pointer;
  font-size: 13px;
  padding: 6px 12px;
  margin-bottom: 4px;
  margin-right: 4px;
  &:hover {
    font-weight: 700;
    /* font-size: 14px; */
  }
  box-sizing: border-box;
`
const OriginalTitleContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  & > :nth-child(n) {
    margin-right: 4px;
    margin-bottom: 2px;
  }
`

const OrginalTtitleKeyword = styled.div`
  cursor: pointer;
  &:hover {
    font-weight: 700;
  }
`

const ModalContent = styled.div`
  padding: auto 50px;
  display: flex;
  & > :nth-child(1) {
    margin-right: 20px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const MainImageContent = styled(SimpleBar)`
  max-height: 500px;
  overflow-y: auto;
  max-width: 200px;
  min-width: 200px;
`
const KeywordList = SortableContainer(({ tags, setTags, handleClose }) => {
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState("")
  const inputRef = useRef()
  const editInputRef = useRef()

  const showInput = () => {
    setInputVisible(true)

    setTimeout(() => {
      inputRef.current.focus()
    }, 300)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleEditInputChange = (e) => {
    setEditInputValue(e.target.value)
  }

  const handleEditInputConfirm = () => {
    const newTags = [...tags]
    newTags[editInputIndex] = editInputValue
    setTags(newTags)
    setEditInputValue("")
    setEditInputIndex(-1)
  }

  const handleInputConfirm = () => {
    if (inputValue && tags.indexOf(inputValue) === -1) {
      setTags([...tags, inputValue])
    }

    setInputVisible(false)
    setInputValue("")
  }
  return (
    <TagTitleContainer>
      {tags.map((tag, index) => {
        return (
          <KeywordItem
            key={`tag-${index}`}
            tag={tag}
            index={index}
            sortIndex={index}
            i={index}
            handleClose={(a) => handleClose(a, index)}
            editInputRef={editInputRef}
            editInputIndex={editInputIndex}
            setEditInputIndex={setEditInputIndex}
            setEditInputValue={setEditInputValue}
            handleEditInputChange={handleEditInputChange}
            handleEditInputConfirm={handleEditInputConfirm}
            editInputValue={editInputValue}
          />
        )
      })}
    </TagTitleContainer>
  )
})

const TagTitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  z-index: 10;
`

const KeywordItem = SortableElement(
  ({
    tag,
    index,
    sortIndex,
    handleClose,
    editInputRef,
    editInputIndex,
    setEditInputIndex,
    setEditInputValue,
    handleEditInputChange,
    handleEditInputConfirm,
    editInputValue,
  }) => {
    return (
      <div
        style={{ zIndex: "100" }}
        key={sortIndex}
        onDoubleClick={(e) => {
          setEditInputIndex(sortIndex)
          setEditInputValue(tag)

          setTimeout(() => {
            editInputRef.current.focus()
          }, 300)

          e.preventDefault()
        }}
      >
        <Tag
          color="purple"
          style={{
            userSelect: "none",
            padding: "4px",
            fontSize: "11px",
            marginBottom: "4px",
            cursor: "pointer",
          }}
          key={tag}
          closable={true}
          onClose={() => handleClose(tag)}
        >
          <span>{tag}</span>
        </Tag>
      </div>
    )
  }
)

const SelectedKeywrodContainer = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
  display: flex;
  z-index: 10px;
  & > :nth-child(1) {
    width: 100%;
  }
  /* &>:nth-child(2){
    min-width: 80px;
    max-width: 80px;
  } */
`

const SearchKeywordContainer = styled.div`
  display: flex;
  & > :nth-child(1) {
    max-width: 160px;
    min-width: 160px;
  }
  & > :nth-child(2) {
    width: 100%;
  }
`

const SearchKeywordTitle = styled.div`
  background: #525f78;
  color: white;
  font-size: 12px;
  font-weight: 700;
  min-height: 43px;
  line-height: 41px;
  padding-left: 15px;
  margin-top: -1px;
`

const SearchKeywordContent = styled.div`
  border: 1px solid lightgray;
  margin-top: -1px;
  line-height: 23px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  vertical-align: top;
  color: #202022;
`

const SearchContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`

const SpinContainer = styled.div`
  width: 100%;
  height: 23px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const InputContainer = styled.div`
  display: flex;
  & > :nth-child(1) {
    width: 100%;
  }
  & > :nth-child(2) {
    margin-left: 10px;
    min-width: 80px;
    max-width: 80px;
  }
`

const CatalogKeyword = ({ url, keyword, handleKeyword }) => {
  const temp1 = url.split("nvMid=")[1]
  const temp2 = temp1.split("&")[0]

  const { loading, data } = useQuery(GET_NAVER_CATALOG_KEYWORD, {
    variables: {
      catalog: temp2,
      keyword,
    },
  })

  if (loading) {
    return (
      <SpinContainer>
        <div>
          <Spin />
        </div>
      </SpinContainer>
    )
  }
  if (data && data.GetNaverCatalogKeyword) {
    return data.GetNaverCatalogKeyword.map((item, i) => {
      return (
        <KeywordLabel key={i} onClick={() => handleKeyword(item.name)}>
          {item.name.trim()}
        </KeywordLabel>
      )
    })
  }
  return null
}
