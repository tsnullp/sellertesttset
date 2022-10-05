import React, { useState } from "react"
import styled from "styled-components"
import { Tooltip, Button, notification, Drawer } from "antd"
import { SearchOutlined } from "@ant-design/icons"
import { useMutation } from "@apollo/client"
import { TAOBAO_IMAGE_LIST_URL, TRANSLATE_PAPAGO } from "../../../gql"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
// import { useQuery } from "@apollo/client"
const { shell } = window.require("electron")

const TaobaoImageSearchButton = ({ image, title, selectItem, searchClick }) => {
  const [isLoading, setLoading] = useState(null)
  const [imageListUrl] = useMutation(TAOBAO_IMAGE_LIST_URL)
  const [visible, setVisible] = useState(false)
  const [list, setList] = useState([])
  const onClose = () => {
    setVisible(false)
    setList([])
  }

  const handleItemClick = ({ url }) => {
    if (typeof selectItem === "function") {
      selectItem({ url })
    }
  }

  return (
    <Tooltip title="이미지를 타오바오에서 검색">
      <Button
        loading={isLoading === image}
        type="primary"
        icon={<SearchOutlined />}
        block
        onClick={async () => {
          setLoading(image)
          try {
            const response = await imageListUrl({
              variables: {
                imageUrl: image,
              },
            })
            console.log("TaobaoImageListUrl", response)
            if (response && response.data.TaobaoImageListUrl) {
              if (
                !response.data.TaobaoImageListUrl.list ||
                response.data.TaobaoImageListUrl.list.length === 0
              ) {
                setList([])
                shell.openExternal(response.data.TaobaoImageListUrl.url)
              } else {
                setList(response.data.TaobaoImageListUrl.list)
                setVisible(true)
              }
              if (typeof searchClick === "function") {
                searchClick(response.data.TaobaoImageListUrl.list)
              }
            } else {
              setList([])
              notification["error"]({
                message: "이미지 주소를 가져오는데 실패하였습니다.",
              })
            }
          } catch (e) {
            setList([])
            notification["error"]({
              message: "이미지 주소를 가져오는데 실패하였습니다.",
            })
          }

          setLoading(null)
        }}
      >
        검색
      </Button>

      {/* <Drawer
        title={title}
        closable={true}
        // maskClosable={false}
        onClose={onClose}
        visible={visible}
        width={720}
        
      >
        <Container>
          {
            list.map(item => (
              <ItemContainer key={item.num_iid}
              >
                <div>
                  <Tooltip title="선택">
                    <ItemImageContainer
                      onClick={() => {
                        setVisible(false)
                        handleItemClick({url: item.auctionURL})
                      }}
                    >
                      <ItemImage src={item.pic_path} alt={item.title}
                    />
                    </ItemImageContainer>
                  </Tooltip>
                  <TitleComponent item={item} />
                </div>
                <PriceSalesContainer>
                  <div style={{display: "flex", alignItems: "center"}}>
                    {item.iconList === "tmall" && 
                    <img src="https://img.alicdn.com/tfs/TB1XlF3RpXXXXc6XXXXXXXXXXXX-16-16.png" 
                      style={{marginRight: "5px", width: "16px", height: "16px"}}
                    />
                  }
                  <Tooltip title={`${Number(item.price * 175).toLocaleString("ko")}원`}>
                    <PriceLabel>{`¥${item.price}`}</PriceLabel>
                  </Tooltip>
                  </div>
                  <Tooltip title={
                    <div>
                      <div>{`최근 판매: ${Number(item.sold).toLocaleString("ko")}`}</div>
                      <div>{` 총 판매: ${Number(item.totalSold).toLocaleString("ko")}`}</div>
                      <div>{`리뷰: ${Number(item.commentCount).toLocaleString("ko")}`}</div>
                    </div>
                  }>
                    <SalesLabel>{`${Number(item.sold).toLocaleString("ko")}/${Number(item.totalSold).toLocaleString("ko")}(${Number(item.commentCount).toLocaleString("ko")})`}</SalesLabel>
                  </Tooltip>
                </PriceSalesContainer>
              </ItemContainer>
            ))
          }
        </Container>
      </Drawer> */}
    </Tooltip>
  )
}

export default TaobaoImageSearchButton

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`
const ItemContainer = styled.div`
  padding: 8px;
  margin-bottom: 20px;
  width: 218px;
  height: 362px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const ItemImageContainer = styled.div`
  overflow: hidden;
  border: 2px solid lightgray;
  &:hover {
    border: 2px solid #512da8;
  }
`
const ItemImage = styled.img`
  width: 100%;
  height: 222px;
  cursor: pointer;
  transition: all ease 0.3s;
  &:hover {
    transform: scale(1.1);
  }
`

const Title = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
  &:hover {
    text-decoration: underline;
    cursor: pointer;
  }
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

const PriceSalesContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const PriceLabel = styled.div`
  color: #f40;
  font-weight: 700;
  font-size: 16px;
`

const SalesLabel = styled.div``

const TitleComponent = ({ item }) => {
  const [title, setTitle] = useState(item.title)
  // const {networkStatus, refetch, data} = useQuery(TRANSLATE_PAPAGO, {
  //   variables: {
  //     text: item.title
  //   },
  //   notifyOnNetworkStatusChange: true,
  //   onCompleted: data=> {
  //     setTitle(data.TranslatePapago)
  //   }
  // })

  return (
    // <Tooltip title={item.title}>
    <Title
      onClick={() => {
        shell.openExternal(item.auctionURL)
      }}
    >
      {title}
    </Title>
    // </Tooltip>
  )
}
