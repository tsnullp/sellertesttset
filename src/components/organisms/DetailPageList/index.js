import React, {useState, useContext } from "react"
import { Button, Table, Image, notification } from "antd"
import { DetailExcelModal, UserSelect, ExcelImport} from "components"
import { useMutation } from "@apollo/client"
import { GET_DETAIL_IMAGE_LIST, SET_MODIFY_DETAIL_PAGES } from "gql"
import { UserContext } from "context/UserContext"
import moment from "moment"
import styled from "styled-components"
const { shell } = window.require("electron")

const DetailPageList = () => {
  const { user } = useContext(UserContext)
  const [selectUser, setSelectUser] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [translateList, setTranslateList] = useState([])
  const [getDetailImageList] = useMutation(GET_DETAIL_IMAGE_LIST)
  const [setModifyDetailPages] = useMutation(SET_MODIFY_DETAIL_PAGES)
  const [excelModalVisible, setExcelModalVisible] = useState(false)
  const [uploading, setUploading] = useState(false)

  
  const handleExcelOk = () => {
    setExcelModalVisible(false)
  }

  const handleExcelCancel = () => {
    setExcelModalVisible(false)
  }

  const handleDetailImages = async () => {
    try {
      setLoading(true)
      setList([])
      const response = await getDetailImageList({
        variables: {
          userID: selectUser,
        }
      })
      if(response && response.data && response.data.GetDetailImageList){
        console.log("response", response)
        setList(response.data.GetDetailImageList)
      }

      
    } catch(e) {

    } finally {
      setLoading(false)
    }
    
  }

  const handleSelectChange = (value) => {
    setSelectUser(value)
  }

  const handleExcel = async (value) => {
    console.log("value--", value)
    const rowDatas = value.filter(item => {
      if(item.아이디 && item["상세페이지 번역"]) {
        let temp = item["상세페이지 번역"]
        temp = temp.split("#").filter(fItem => fItem.length > 0 && fItem.includes("jpg"))
        if(temp.length > 0){
          return true
        }
      } 

      return false
    })

    if(rowDatas && rowDatas.length > 0){
      setList([])
      setTranslateList(rowDatas)
    }
  }

  
  const columns = [
    {
      title: "이미지",
      dataIndex: "image",
      render: (mainImage) => {
        let imageUrl = mainImage
        if (imageUrl && imageUrl.includes("alicdn.com")) {
          imageUrl = `${imageUrl}_150x150.jpg`
        } else if (imageUrl && imageUrl.includes("coupangcdn.com")) {
          imageUrl = imageUrl.replace(/492/gi, "150")
        }
        return (
          <Image
              width={150}
            height={150}
            src={imageUrl}
            preview={{
              src: mainImage,
            }}
          />
        )
      }
    },
    {
      title: "상품명",
      render: (data) => <LinkLabel onClick={() => shell.openExternal(data.detailUrl)}>{data.name}</LinkLabel>
    },
    
    {
      title: "등록일",
      align: "center",
      render: (data) => moment(Number(data.createdAt)).format("YYYY.MM.DD")
    },
  
  ]

  const transLateColumns = [
    {
      title: "아이디",
      width: 250,
      render: (data) => data.아이디
    },
    {
      title: "번역",
      ellipsis: true,
      render: (data) => data["상세페이지 번역"]
    }
  ]
  return (
    <>
      <ButtonContainer>
        <div>
        <UserSelect handleSelectChange={handleSelectChange} userID={user.id} />
        <Button
          onClick={handleDetailImages}
          loading={isLoading}
        >상세페이지 리스트 조회</Button>

        <Button
          disabled={list.length === 0}
          style={{ background: "blue", color: "white" }}
          onClick={() => setExcelModalVisible(true)}  
        >상세페이지 엑셀 다운</Button>
        {list.length > 0 && excelModalVisible && 
          <DetailExcelModal 
            isModalVisible={excelModalVisible}
            handleOk={handleExcelOk}
            handleCancel={handleExcelCancel}
            data={list}
          />
        }
        <ExcelImport size="middle" title="가져오기"
          onSuccess={handleExcel}
        />
        </div>
        {translateList.length > 0 &&<Button loading={uploading} type="primary"
        
          onClick={async() => {
            try {
              setUploading(true)
              const response = await setModifyDetailPages({
                variables: {
                  input: translateList.map(item => {
                    return {
                      _id: item.아이디,
                      content: item["상세페이지 번역"].split("#").filter(item => item.includes("jpg"))
                    }
                  })
                }
              })
              console.log("response", response)

              if(response && response.data.SetModifyDetailPage) {
                notification['success']({
                  message: '상세페이지를 변경하고 있습니다...',
                });
              } else {
                notification['error']({
                  message: '상세페이지를 변경 오류...',
                });
              }
              

            } catch(e) {
              
            } finally{
              setTranslateList([])
              setUploading(false)
            }
          }}
        >상세페이지 업데이트</Button>}
      </ButtonContainer>

      {list.length > 0 && 
      <Table
        columns={columns}
        rowKey={(record) => record._id}
        dataSource={list}
        pagination={false}
        loading={isLoading}
      />}

      {translateList.length > 0 && 
      <Table
        columns={transLateColumns}
        rowKey={(record) => record._id}
        dataSource={translateList}
        pagination={false}
        
      />}

    </>
  )
}

export default DetailPageList


const LinkLabel = styled.div`
  cursor: pointer;
  &:hover {
    font-weight: 700;
    text-decoration: underline
  }
`

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  & > div > :not(:last-child) {
    margin-right: 10px;
  }
`