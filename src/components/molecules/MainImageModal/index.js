import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { Modal, message, Popconfirm, Input } from "antd"
import {
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons"
import { useMutation} from "@apollo/client"
import { UPLOAD_IMAGE } from "../../../gql"
import {arrayMoveImmutable} from "array-move"
import { SortableContainer, SortableElement } from "react-sortable-hoc"

const MainImageModal = ({isModalVisible, handleOk, handleCancel, mainImages}) => {
  const [images, setImages] = useState(mainImages)
  

  useEffect(() => {
    setImages(mainImages)
  }, [mainImages])

  const handleOkButton = () => {
    // const temp = taobaoOrder
    // temp.orders = [temp.orders[value]]
    // handleOk(temp)

    handleOk(images)
  }

  const onSortEnd = ({ oldIndex, newIndex }) => {
    const array = arrayMoveImmutable(images, oldIndex, newIndex)
    setImages(array)
  }

  const shouldCancelStart = e => {
    var targetEle = e
    if (!targetEle.id) {
      targetEle = e.target
    }

    if (targetEle.className === "modify" || targetEle.className instanceof SVGAnimatedString) {
      return true
    }
  }

  const handleDelete = index => {
    if(images.length <= 1) {
      message.error({
        content: `메인 이미지는 최소 한개 이상이여야 합니다.`,
        key: "mainImageDelete",
        duration: 5
      })
      return
    }

    const array = [
      ...images.slice(0, index),
      ...images.slice(index + 1)
    ]
    setImages(array)
  }

  const handleSuccess = (index, mainImage) => {
    const array = images
    array[index] = mainImage
    setImages([...array])
  }

  return (
    <Modal
      maskClosable={false}
      title="메인이미지 설정"
      visible={isModalVisible}
      onOk={handleOkButton}
      onCancel={handleCancel}
      width={1000}
      zIndex={5}
    >
      <MainImageList
        items={images}
        axis="xy"
        onSortEnd={onSortEnd}
        shouldCancelStart={shouldCancelStart}
        handleDelete={handleDelete}
        handleOk={handleSuccess}
      />
    </Modal>
  )
}

export default MainImageModal


const MainImageList = SortableContainer(({ items, handleDelete, handleOk }) => {

  return ( 
    <MainImageContainer>
      {items.length > 0 && <MainImageFirst />}
      {items && items.map((value, index) => (
        // <MainImageFirst key={index} first={index === 0} index={index}>
        <MainImageItem
          key={index}
          index={index}
          i={index}
          url={value}
          handleDelete={handleDelete}
          handleOK={handleOk}
        />
        // </MainImageFirst>
      ))}
      <AddItemForm handleAddOK={(img) => {
        handleOk(items.length, img)
      }}/>
    </MainImageContainer>
  )
})

const AddItemForm = ({handleAddOK}) => {
  const [visible, setVisible] = useState(false)
  const [mainImage, setMainImage] = useState("")
  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const response = await uploadImage({
        variables: {
          base64Image: reader.result
        }
      })
      
      setMainImage(response.data.UploadImage)
    }
  }

  return (
    <div>
      <AddItemStyle
        onClick={()=>setVisible(true)}
      >+</AddItemStyle>
      <Modal
        title="이미지 추가"
        visible={visible}
        onOk={() => {
          handleAddOK(mainImage)
          setVisible(false)
          setMainImage("")
        }}
        onCancel={() => {
          setVisible(false)
          setMainImage("")
        }}
      >
        {mainImage && mainImage.length > 0 && <div style={{ display: "flex", justifyContent: "center" }}>
          <ConfirmMainImage src={mainImage} />
        </div>}
        <input type="file" onChange={handleFileChange}/>
        <Input
          placeholder={"이미지 URL만 입력하세요."}
          allowClear={true}
          value={mainImage}
          onChange={e => setMainImage(e.target.value)}
        />
        </Modal>
    </div>
  )
}
const MainImageContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  position: relative;
  margin: 20px;
`

const MainImageItem = SortableElement(({ url, i, handleDelete, handleOK }) => {
  const [visible, setVisible] = useState(false)
  const [mainImage, setMainImage] = useState("")
  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const response = await uploadImage({
        variables: {
          base64Image: reader.result
        }
      })
      
      setMainImage(response.data.UploadImage)
    }
  }
  
  return (
    <ul style={{ zIndex: "10" }}>
      <MainImageWrapper>
        <MainImage src={url} alt={url} />
        <Modal
          title="이미지 변경"
          visible={visible}
          onOk={() => {
            handleOK(i, mainImage)
            setVisible(false)
          }}
          onCancel={() => setVisible(false)}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ConfirmMainImage src={mainImage} />
          </div>
          <input type="file" onChange={handleFileChange}/>
          <Input
            placeholder={"이미지 URL만 입력하세요."}
            allowClear={true}
            value={mainImage}
            onChange={e => setMainImage(e.target.value)}
          />
        </Modal>
        <MainImageModifyContianer className={"modify"}>
          <div
            className={"modify"}
            style={{ cursor: "pointer", textAlign: "center" }}
            onClick={() => {
              setMainImage(url)
              setVisible(true)
            }}
          >
            <EditOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
          </div>
          <Popconfirm
            title="삭제하시겠습니까？"
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
            cancelText="취소"
            okText="삭제"
            onConfirm={() => handleDelete(i)}
          >
            <div className={"modify"} style={{ cursor: "pointer", textAlign: "center" }}>
              <DeleteOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
            </div>
          </Popconfirm>
        </MainImageModifyContianer>
      </MainImageWrapper>
    </ul>
  )
})


const MainImageModifyContianer = styled.div`
  opacity: 0;
  position: absolute;
  left: 0;
  right: 20px;
  bottom: 3px;
  height: 40px;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  z-index: 10;
  & > :nth-child(n) {
    flex: 1;
  }
`
const MainImageFirst = styled.div`
  position: absolute;
  left: -3px;
  top: -3px;
  height: 166px;
  width: 166px;
  border-radius: 5px;
  border: ${props => `3px dashed ${props.theme.primaryDark}`};
  
`



const MainImageWrapper = styled.div`
  position: relative;
  &:hover {
    & > ${MainImageModifyContianer} {
      opacity: 1;
    }
  }
`
const MainImage = styled.img`
  cursor: pointer;
  min-width: 160px;
  max-width: 160px;
  min-height: 160px;
  max-height: 160px;
  margin-right: 20px;
  margin-bottom: 20px;
`

const ConfirmMainImage = styled.img`
  width: 200px;
  height: 200px;
  border-radius: 5px;
  margin-bottom: 10px;
`

const AddItemStyle = styled.div`
  cursor: pointer;
  min-width: 160px;
  max-width: 160px;
  min-height: 160px;
  max-height: 160px;
  margin-right: 20px;
  margin-bottom: 20px;
  background: #B5B5B5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 60px;
  color: white;
`