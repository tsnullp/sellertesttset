import React, { useEffect, useState, useRef } from "react"
import styled from "styled-components"
import {
  ExcelImport,
  AmazonUploadItem,
  AmazonCollectionItem,
  IHerbUploadItem,
  IHerbCollectionItem,
  AliUploadItem,
  AliCollectionItem,
  TaobaoUploadItem,
  TaobaoCollectionItem,
} from "components"
import { Input, message, Button, Skeleton, BackTop, Tooltip } from "antd"
import { AmazonAsin } from "../../../lib/userFunc"
import {
  UPLOAD_NAVERPLUS_ITEM,
  GET_USA_SHIPPINGPRICE,
  GET_AMAZONCOLLECTION,
  GET_IHERB_OPTION_PID,
} from "gql"
import { useMutation } from "@apollo/client"
import { CloudUploadOutlined, CloudDownloadOutlined } from "@ant-design/icons"
const _ = require("lodash")
const { Search } = Input
const { shell } = window.require("electron")

const AmazonUploadPage = () => {
  const [searchLoading, setSearchLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadData, setUploadData] = useState([])
  const [isLoading, setLoading] = useState(false)
  const searchRef = useRef()
  const AmazonRef = useRef([])
  const [getShippingPrice] = useMutation(GET_USA_SHIPPINGPRICE)

  const [uploadNaverItem] = useMutation(UPLOAD_NAVERPLUS_ITEM)
  const [getAmazonCollection] = useMutation(GET_AMAZONCOLLECTION)
  const [getIherbOptionPid] = useMutation(GET_IHERB_OPTION_PID)

  useEffect(() => {
    try {
      // setTimeout(async() => {
      //   const response = await getShippingPrice()
      //   if(response.data.GetUSAShippingPrice.length  === 0){
      //     message.error("추가금액과 배송비 설정이 되지 않았습니다.")
      //   }
      // })
    } catch (e) {}
  }, [])

  const handleDelete = (asin) => {
    console.log("asin", asin)
    const temp = uploadData.filter((item) => item.asin !== asin)
    setUploadData(temp)
    message.success(`[${asin}] 삭제하였습니다.`)
  }

  const handleComplete = (asin) => {
    try {
      console.log("handleComplete", asin)
      if (uploadData.filter((item) => item.isSuspense).length === 0) {
        return
      }
      const suspense = uploadData.filter((item) => item.asin !== asin && item.isSuspense)
      let suspenseAsin = null
      if (suspense.length > 0) {
        suspenseAsin = suspense[0].asin
        console.log("suspenseAsin", suspenseAsin)
      }

      const temp = uploadData.map((item) => {
        console.log("item.asin", item.asin)
        if (item.asin === asin) {
          item.isSuspense = false
        }
        if (suspenseAsin && item.asin === suspenseAsin) {
          item.isSuspense = false
        }
        return item
      })

      setUploadData(temp)

      // if(suspenseAsin){
      //   const temp = uploadData.map(item => {
      //     if(item.asin === suspenseAsin){
      //       item.isSuspense = false
      //     }
      //     return item
      //   })
      //   setUploadData(temp)
      // }
    } catch (e) {
      console.log("handleComplete", asin, e)
    }
  }

  const handleExcel = (value) => {
    const data = value
      .filter((item) => item.URL && item.URL.length > 0 && AmazonAsin(item.URL))
      .map((item, index) => {
        return {
          asin: AmazonAsin(item.URL),
          url: item.URL,
          productName: item.상품명 && item.상품명.length > 0 ? item.상품명 : null,
          isSuspense: index < 4 ? false : true,
        }
      })
    const uniqData = _.uniqBy(data, "asin")

    setUploadData([...uniqData, ...uploadData])
  }
  const onSearch = async (value, e) => {
    
    setSearchLoading(true)
    try {
      // setUploadData([
      //   {
      //     asin: "B002J0PDZG",
      //     url: "https://www.amazon.com/Country-Life-Vitamin-Non-fish-Softgels/dp/B002J0PDZG/ref=sr_1_39?crid=1ANS7H7VZKGOX&keywords=vitamin+d&qid=1648453027&sprefix=v%2Caps%2C909&sr=8-39",
      //     isSuspense: true
      //   },
      //   {
      //     asin: "B076JTQR66",
      //     url: "https://www.amazon.com/Vitamin-000-Weekly-Supplement-Strengthen/dp/B076JTQR66/ref=sr_1_41?crid=1ANS7H7VZKGOX&keywords=vitamin+d&qid=1648453027&sprefix=v%2Caps%2C909&sr=8-41",
      //     isSuspense: true
      //   }
      // ])
      // return
      console.log(value)
      if (value.length === 0) {
        return
      }
      // if(!value.includes("https://www.amazon.com/") || !value.includes("iherb.com/")){
      //   message.error('아마존 또는 아이허브 상품 URL을 입력해 주세요.')
      //   return
      // }
      const asin = AmazonAsin(value)
      if (!asin) {
        message.error("수집할수 없는 상품 URL입니다..")
        return
      }

      if (uploadData.filter((item) => item.asin === asin).length > 0) {
        message.warning("중복 상품이 존재합니다.")
        return
      }
      const suspense = uploadData.filter((item) => item.isSuspense)
      let marketType = 0
      // marketType 1: 아마존, 2: 아이허브, 3: 알리익스프레스, 4: 타오바오, 5: 티몰
      if (
        value.includes("https://www.amazon.com/") ||
        value.includes("https://www.amazon.co.jp/")
      ) {
        marketType = 1

        setUploadData([
          {
            asin,
            url: value,
            isSuspense: suspense.length > 0 ? true : false,
            marketType,
          },
          ...uploadData,
        ])
      } else if (value.includes("iherb.com/")) {
        marketType = 2
        console.log("value", value)
        try {
          const response = await getIherbOptionPid({
            variables: {
              url: value,
            },
          })

          setUploadData([
            ...response.data.GetiHerbOptionPid.map((item) => {
              return {
                asin: item.asin,
                url: item.url,
                isSuspense: suspense.length > 0 ? true : false,
                marketType,
              }
            }),
            ...uploadData,
          ])
        } catch (e) {
          console.log("error ->", e)
        }
      } else if (value.includes("aliexpress.com")) {
        marketType = 3

        setUploadData([
          {
            asin,
            url: value,
            isSuspense: suspense.length > 0 ? true : false,
            marketType,
          },
          ...uploadData,
        ])
      } else if (value.includes("https://item.taobao.com")) {
        marketType = 4

        setUploadData([
          {
            asin,
            url: value,
            isSuspense: suspense.length > 0 ? true : false,
            marketType,
          },
          ...uploadData,
        ])
      } else if (value.includes("https://detail.tmall.com")) {
        marketType = 5
      
        setUploadData([
          {
            asin,
            url: value,
            isSuspense: suspense.length > 0 ? true : false,
            marketType,
          },
          ...uploadData,
        ])
      } else if (value.includes("vvic.com")) {
        marketType = 6
        setUploadData([
          {
            asin,
            url: value,
            isSuspense: suspense.length > 0 ? true : false,
            marketType,
          },
          ...uploadData,
        ])
      }

      if (e) {
        searchRef.current.handleReset(e)
      }
    } catch (e) {
    } finally {
      setSearchLoading(false)
    }
  }

  const handleDownload = async () => {
    try {
      setLoading(true)
      const response = await getAmazonCollection()
      console.log("response---", response)

      if (response.data.GetAmazonCollection.length === 0) {
        message.info("수집된 상품이 없습니다.")
      } else {
        const collectionData = response.data.GetAmazonCollection.filter(
          (item) => Array.isArray(item.options) && item.options.length > 0
        ).map((item) => {
          let marketType = 0
          if (item.detailUrl.includes("https://www.amazon.com/")) {
            marketType = 1
          } else if (item.detailUrl.includes("iherb.com/")) {
            marketType = 2
          } else if (item.detailUrl.includes("aliexpress.com/")) {
            marketType = 3
          } else if (item.detailUrl.includes("taobao.com/")) {
            marketType = 4
          } else if (item.detailUrl.includes("tmall.com/")) {
            marketType = 5
          }
          return {
            ...item,
            asin: item.good_id,
            isCollection: true,
            marketType,
          }
        })
        setUploadData([...collectionData])
      }
    } catch (e) {
      console.log("handleDownload", e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <BackTop />
      <TextAreaContainer>
        <div>
          <Input.Group compact>
            <Search
              loading={searchLoading}
              size="large"
              style={{ width: "1000px" }}
              addonBefore={"URL"}
              placeholder={"상세페이지 URL을 입력해주세요."}
              onSearch={onSearch}
              allowClear
              ref={searchRef}
            />
            <Tooltip title="URL(핈수), 상품명(선택)">
              <ExcelButtonContainer>
                <ExcelImport size="large" title="엑셀" onSuccess={handleExcel} />
              </ExcelButtonContainer>
            </Tooltip>
            <UploadContainer>
              <Button
                loading={isLoading}
                size="large"
                icon={<CloudDownloadOutlined />}
                onClick={handleDownload}
              >
                불러오기
              </Button>
            </UploadContainer>
            <UploadContainer>
              <Button
                type="primary"
                loading={uploading}
                size="large"
                icon={<CloudUploadOutlined />}
                onClick={async () => {
                  setUploading(true)
                  try {
                    let input = []
                    console.log("uploadData", uploadData)
                    uploadData.map((item) => {
                      const value = AmazonRef.current[item.asin].showData()
                      console.log("VALUE---", value)
                      if (value) {
                        input.push({
                          content: value.content,
                          detailUrl: value.detailUrl,
                          html: value.html,
                          isClothes: value.clothes ? value.clothes : false,
                          isShoes: value.shoes ? value.shoes : false,
                          mainImages: value.mainImages,
                          options: value.options,
                          prop: value.prop,
                          sellerTags:
                            value.keyword && !Array.isArray(value.keyword)
                              ? value.keyword
                                  .split(",")
                                  .filter((item) => item && item.trim().length > 0)
                                  .map((item) => item.trim())
                              : value.keyword,
                          title: value.korTitle,
                          engSentence: value.engSentence,
                        })
                      }
                    })

                    const response = await uploadNaverItem({
                      variables: {
                        input,
                      },
                    })
                    console.log("response", response)
                    if (response.data.UploadNaverPlusItem) {
                      setUploadData([])
                    }
                  } catch (e) {
                    console.log("responseError", e)
                  } finally {
                    setUploading(false)
                  }
                }}
              >
                업로드
              </Button>
            </UploadContainer>
          </Input.Group>
        </div>
      </TextAreaContainer>
      {uploadData.map((item) => {
        console.log("item--", item)
        if (item.isSuspense) {
          return (
            <Container key={item.asin} spinning={true} delay={500}>
              <div>
                <AsinLabel
                  onClick={() => {
                    shell.openExternal(item.url)
                  }}
                >
                  {item.asin}
                </AsinLabel>
                <Skeleton.Avatar shape={"square"} size={200} />
              </div>
              <div>
                <Skeleton />
              </div>
            </Container>
          )
        } else if (item.isCollection) {
          switch (item.marketType) {
            case 1:
              return (
                <AmazonCollectionItem
                  key={item.good_id}
                  collection={item}
                  ref={(el) => (AmazonRef.current[item.good_id] = el)}
                  onDelete={handleDelete}
                />
              )
            case 2:
              return (
                <IHerbCollectionItem
                  key={item.good_id}
                  collection={item}
                  ref={(el) => (AmazonRef.current[item.good_id] = el)}
                  onDelete={handleDelete}
                />
              )
            case 3:
              return (
                <AliCollectionItem
                  key={item.good_id}
                  collection={item}
                  ref={(el) => (AmazonRef.current[item.good_id] = el)}
                  onDelete={handleDelete}
                />
              )
            case 4:
            case 5:
            case 6:
              return (
                <TaobaoCollectionItem
                  key={item.good_id}
                  collection={item}
                  ref={(el) => (AmazonRef.current[item.good_id] = el)}
                  onDelete={handleDelete}
                />
              )
            default:
              return null
          }
        } else {
          switch (item.marketType) {
            case 1:
              return (
                <AmazonUploadItem
                  key={item.asin}
                  ref={(el) => (AmazonRef.current[item.asin] = el)}
                  asin={item.asin}
                  url={item.url}
                  productName={item.productName}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              )
            case 2:
              return (
                <IHerbUploadItem
                  key={item.asin}
                  ref={(el) => (AmazonRef.current[item.asin] = el)}
                  asin={item.asin}
                  url={item.url}
                  productName={item.productName}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              )
            case 3:
              return (
                <AliUploadItem
                  key={item.asin}
                  ref={(el) => (AmazonRef.current[item.asin] = el)}
                  asin={item.asin}
                  url={item.url}
                  productName={item.productName}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              )
            case 4:
            case 5:
            case 6:
              return (
                <TaobaoUploadItem
                  key={item.asin}
                  ref={(el) => (AmazonRef.current[item.asin] = el)}
                  asin={item.asin}
                  url={item.url}
                  productName={item.productName}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                />
              )
            default:
              return null
          }

          // return null
        }
      })}
    </>
  )
}

export default AmazonUploadPage

const TextAreaContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const ExcelButtonContainer = styled.div`
  margin-left: 15px;
`

const UploadContainer = styled.div`
  margin-left: 15px;
`

const Container = styled.div`
  padding: 20px;
  padding-top: 30px;
  margin: 20px;
  border: 1px solid lightgray;
  border-bottom-width: 3px;
  border-right-width: 3px;
  border-bottom-color: ${(props) => props.theme.primaryDark};
  border-right-color: ${(props) => props.theme.primaryDark};
  position: relative;
  display: flex;
  & > :nth-child(1) {
    max-width: 200px;
    min-width: 200px;
  }
  & > :nth-child(2) {
    width: 100%;
    margin-left: 20px;
  }
`

const AsinLabel = styled.div`
  cursor: pointer;
  padding: 8px 10px;
  position: absolute;
  left: -5px;
  top: -5px;
  background: ${(props) => props.theme.chatMyMessage};
  color: ${(props) => props.theme.font66};
  font-size: 13px;
  font-weight: 700;
`
