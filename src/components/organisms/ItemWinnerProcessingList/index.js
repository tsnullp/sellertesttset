import React, { useState, useEffect, useContext } from "react"
import {
  Table,
  Popover,
  Popconfirm,
  Select,
  Image,
  Tooltip,
  Tag,
  BackTop,
  message,
  Button
} from "antd"
import { RetweetOutlined, ExclamationCircleOutlined, TrophyFilled, ShoppingOutlined, DeleteTwoTone, QuestionCircleOutlined } from "@ant-design/icons"
import { useQuery, useMutation } from "@apollo/client"
import { GET_ITEMWINNER_PROCESSING_LIST, UPLOAD_ITEM_WINNER, UPLOAD_NAVER_ITEM_WINNER, DELETE_PROCESS_ITEM } from "../../../gql"
import { useLocation } from "react-router-dom"
import styled from "styled-components"
import { UserContext } from "context/UserContext"
import {UserSelect} from "components"
import moment from "moment"
moment.locale("ko")
const { Option } = Select

const { shell } = window.require("electron")

const ItemWinnerProcessingList = () => {
  const { user } = useContext(UserContext)
  const location = useLocation()

  const [uploadItem] = useMutation(UPLOAD_NAVER_ITEM_WINNER)
  const [deleteItem] = useMutation(DELETE_PROCESS_ITEM)
  const [selectUser, setSelectUser] = useState(null)


  const { data, refetch, networkStatus } = useQuery(GET_ITEMWINNER_PROCESSING_LIST, {
    variables: {
      userID: selectUser
    },
    pollInterval: 60000,
    // fetchPolicy: "network-only",
    // fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  })

  console.log("data123123", data)
  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const errorContent = error => {
    return <div style={{maxWidth: "500px"}}>{error}</div>
  }
  const columns = [
    {
      title: "등록",
      dataIndex: "user",
      width: "100px",
      render: user => {
        if(user){
          return (
            <AvatarContainer>
              <Avatar src={user.avatar} />
              <NickName>{user.nickname}</NickName>
            </AvatarContainer>
          )
        } else {
          return null
        }
      }
    },
    {
      title: "이미지",
      dataIndex: "mainImges",
      render: mainImges => {
        let imageUrl = mainImges[0]
        if(!imageUrl) {
          return
        }
        if (imageUrl.includes("alicdn.com")) {
          imageUrl = `${imageUrl}_80x80.jpg`
        } else if (imageUrl.includes("coupangcdn.com")) {
          imageUrl = imageUrl.replace(/492/gi, "80")
        }
        
        return (
          <ColumnContainer>
            <Image
              width={80}
              height={80}
              src={imageUrl}
              preview={{
                src: mainImges[0]
              }}
            />
          </ColumnContainer>
        )
      }
    },
    {
      title: "상품명",
      dataIndex: "",
      render: data => (
        <ColumnContainer>
          <span>
            <Tag
              style={{
                display: "inline-flex",
                alignItems: "center"
              }}
              icon={
                <img
                  style={{ marginRight: "4px" }}
                  src="https://img.alicdn.com/tfs/TB1VlKFRpXXXXcNapXXXXXXXXXX-16-16.png"
                  alt="taobao"
                />
              }
              onClick={() => shell.openExternal(data.taobaoUrl)}
            >
              타오바오
            </Tag>
            {data.coupangUrl && <Tag
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px"
              }}
              icon={
                <img
                  width="16px"
                  src="http://image9.coupangcdn.com/image/coupang/favicon/v2/favicon.ico"
                  alt="coupang"
                />
              }
              onClick={() => {
                if (data.options.length > 0) {
                  shell.openExternal(data.coupangUrl)
                }
              }}
            ></Tag>}
            {data.kind === "winner" && <TrophyFilled
                  style={{
                    color: "#ffd700",
                    fontSize: "18px",
                    marginLeft: "-1px",
                    marginRight: "4px"
                  }}
                />}
            {data.kind === "naver" && <ShoppingOutlined
                  style={{
                    color: "#20C73D",
                    fontSize: "18px",
                    marginLeft: "-1px",
                    marginRight: "4px"
                  }}
                />}
            <TitleLabel>{data.title}</TitleLabel>
          </span>
        </ColumnContainer>
      )
    },
    {
      title: "상태",
      dataIndex: "",
      width: "220px",
      render: data => {
        switch (data.state) {
          case 1:
            return (
              <span>
                <Tag color="green">준비중</Tag>
                {data.error && data.error.length > 0 && (
                  <Tooltip title="에러가 있습니다.">
                    <Popover content={errorContent(data.error)} title="에러" trigger="click">
                      <Tag
                        color="red"
                        style={{ cursor: "pointer" }}
                        icon={
                          <div>
                            <ExclamationCircleOutlined />
                          </div>
                        }
                      ></Tag>
                    </Popover>
                  </Tooltip>
                )}
                {/* <Tooltip title="재등록을 요청합니다.">
                  <Tag
                    style={{ cursor: "pointer" }}
                    icon={
                      <div>
                        <RetweetOutlined />
                      </div>
                    }
                    onClick={async () => {
                      const response = await uploadItem({
                        variables: {
                          _id: data._id,
                          userID: selectUser
                        }
                      })
                      console.log("response", response)
                      if (response.data.UploadItemWinner) {
                        message.success("업로드 요청 하였습니다.")
                        refetch()
                      }
                    }}
                  ></Tag>
                </Tooltip> */}
              </span>
            )
          case 3:
            return (
              <span>
                <Tag color="red">에러</Tag>
                {data.error && data.error.length > 0 && (
                  <Tooltip title="에러가 있습니다.">
                    <Popover content={errorContent(data.error)} title="에러" trigger="click">
                      <Tag
                        color="red"
                        style={{ cursor: "pointer" }}
                        icon={
                          <div>
                            <ExclamationCircleOutlined />
                          </div>
                        }
                      ></Tag>
                    </Popover>
                  </Tooltip>
                )}
                {/* <Tooltip title="재등록을 요청합니다.">
                  <Tag
                    style={{ cursor: "pointer" }}
                    icon={
                      <div>
                        <RetweetOutlined />
                      </div>
                    }
                    onClick={async () => {
                      const response = await uploadItem({
                        variables: {
                          _id: data._id,
                          userID: selectUser
                        }
                      })
                      console.log("response", response)
                      if (response.data.UploadItemWinner) {
                        message.success("업로드 요청 하였습니다.")
                        refetch()
                      }
                    }}
                  ></Tag>
                </Tooltip> */}
              </span>
            )
          case 4:
            return (
              <span>
                <Tag color="volcano">재등록중</Tag>
                {data.error && data.error.length > 0 && (
                 
                  <Tooltip title="에러가 있습니다.">
                    <Popover content={errorContent(data.error)} title="에러" trigger="click">
                      <Tag
                        color="red"
                        style={{ cursor: "pointer" }}
                        icon={
                          <div>
                            <ExclamationCircleOutlined />
                          </div>
                        }
                      ></Tag>
                    </Popover>
                  </Tooltip>
                 
                  
                )}

                  {/* <Tooltip title="재등록을 요청합니다.">
                   <Tag
                     style={{ cursor: "pointer" }}
                     icon={
                       <div>
                         <RetweetOutlined />
                       </div>
                     }
                     onClick={async () => {
                       const response = await uploadItem({
                         variables: {
                           _id: data._id,
                           userID: selectUser
                         }
                       })
                       console.log("response", response)
                       if (response.data.UploadItemWinner) {
                         message.success("업로드 요청 하였습니다.")
                         refetch()
                       }
                     }}
                   ></Tag>
                 </Tooltip> */}
              </span>
            )
          default:
            return null
        }
      }
    },
    {
      title: "삭제",
      dataIndex: "_id",
      render: _id => (
        <Popconfirm
          title="등록중인 상품을 삭제하시겠습니까？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          cancelText="취소"
          okText="삭제"
          onConfirm={async() => {
            const response = await deleteItem({
              variables: {
                _id,
                userID: selectUser
              }
            })

            if(response.data.DeleteProcessItem){
              message.success("삭제 하였습니다.")
              refetch()
            } else {
              message.error("삭제에 실패 하였습니다.")
            }
          }}

        >
          <Button 
          icon={<DeleteTwoTone />}
          onClick={() => {
            
          }}>삭제</Button>
        </Popconfirm>
      )
    },
    {
      title: "등록일",
      dataIndex: "createdAt",

      render: createdAt => (
        <ColumnContainer>{moment(Number(createdAt)).format("YYYY-MM-DD")}</ColumnContainer>
      ),
      width: "120px"
    }
  ]

  const handleSelectChange = (value) => {
    setSelectUser(value)
  }


  const handleUpload = async() => {
    console.log("diddd", data.GetItemWinnerProcessingList.map(item => {
      return {
        _id: item._id,
        userID: selectUser
      }
    }))
    const response = await uploadItem({
      variables: {
        input: data.GetItemWinnerProcessingList.map(item => {
          return {
            _id: item._id,
            userID: selectUser
          }
        })
      }
    })

    console.log("response", response)
    if (response.data.UploadNaverItemWinner) {
      message.success("업로드 요청 하였습니다, 업로드 요청은 한번만 하면 됩니다.")
      
    }
  }
  
  
  return (
    <div>
      {<UserSelect isRoot={true} handleSelectChange={handleSelectChange} userID={user.id} />}
      <Button onClick={handleUpload}>재등록</Button>
      <BackTop />
      <Image.PreviewGroup>
        <Table
          columns={columns}
          rowKey={record => record._id}
          dataSource={
            data && data.GetItemWinnerProcessingList ? data.GetItemWinnerProcessingList : []
          }
          pagination={false} 
          loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
      
        />
      </Image.PreviewGroup>
    </div>
  )
}

export default ItemWinnerProcessingList

const ColumnContainer = styled.div`
  cursor: pointer;
  vertical-align: middle;
  display: table-cell;
`

const TitleLabel = styled.span`
  vertical-align: text-bottom;
  font-weight: 700;
`

const AvatarContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  color: lightgray;
`

const Avatar = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50px;
  margin-right: 5px;
  background: white;
`

const NickName = styled.div`
  color: gray;
  font-size: 11px;
  margin-bottom: 2px;
`