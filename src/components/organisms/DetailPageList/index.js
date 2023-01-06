import React, {useState, useContext} from "react"
import { Button, Table, Image } from "antd"
import { DetailExcelModal, UserSelect} from "components"
import { useMutation } from "@apollo/client"
import { GET_DETAIL_IMAGE_LIST } from "gql"
import { UserContext } from "context/UserContext"
import moment from "moment"
import styled from "styled-components"
const { shell } = window.require("electron")

const DetailPageList = () => {
  const { user } = useContext(UserContext)
  const [selectUser, setSelectUser] = useState(null)
  const [isLoading, setLoading] = useState(false)
  const [list, setList] = useState([])
  const [getDetailImageList] = useMutation(GET_DETAIL_IMAGE_LIST)
  const [excelModalVisible, setExcelModalVisible] = useState(false)

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
      title: "상세페이지",
      render: (data) => data.content.length.toLocaleString("ko")
    },
    {
      title: "등록일",
      render: (data) => moment(Number(data.createdAt)).format("YYYY.MM.DD")
    },
  
  ]
  return (
    <>
      <ButtonContainer>
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
      </ButtonContainer>

      <Table
        columns={columns}
        rowKey={(record) => record._id}
        dataSource={list}
        pagination={false}
        loading={isLoading}
      />

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
  & > :not(:last-child) {
    margin-right: 10px;
  }
`