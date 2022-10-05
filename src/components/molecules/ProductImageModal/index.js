import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { Modal, Checkbox } from "antd"
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const ProductImageModal = ({ isModalVisible, handleOk, handleCancel, images }) => {
  const [items, setItems] = useState(images)
  const [checkAll, setCheckAll] = useState(true)
  useEffect(() => {
    setItems(images)
  }, images)
  const onChange = (e, image) => {
    console.log(`checked = ${e.target.checked}`)
    setItems(
      items.map((item) => {
        if (item.image === image) {
          item.isChecked = e.target.checked
        }
        return item
      })
    )

    setCheckAll(items.filter((item) => items.isChecked).length === images.length)
  }
  const onCheckAllChange = (e) => {
    console.log(`checked = ${e.target.checked}`)
    setItems(
      items.map((item) => {
        item.isChecked = e.target.checked
        return item
      })
    )
    setCheckAll(e.target.checked)
  }

  const getImageUrl = (image) => {
    if (image.includes("https://shopping-phinf.pstatic.net/")) {
      return image
    }
    return `${image}?type=f232_232`
  }
  return (
    <Modal
      width={1500}
      zIndex={1000}
      visible={isModalVisible}
      onOk={() => handleOk(items)}
      onCancel={handleCancel}
      title={
        <Checkbox onChange={onCheckAllChange} checked={checkAll}>
          전체 선택
        </Checkbox>
      }
    >
      <Container>
        {items && items.map((item, i) => {
          return (
            <ImageWarper key={i}>
              <Checkbox onChange={(e) => onChange(e, item.image)} checked={item.isChecked}>
                <ImageView src={getImageUrl(item.image)} alt={item.image} />
              </Checkbox>
            </ImageWarper>
          )
        })}
      </Container>
    </Modal>
  )
}

export default ProductImageModal

const Container = styled(SimpleBar)`
  max-height: 700px;
  overflow-y: auto;
  display: flex;
  justify-content: center;
`

const ImageView = styled.img`
  width: 232px;
  height: 232px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
`

const ImageWarper = styled.div`
  position: relative;
  display: inline-block;
  width: 232px;
  height: 232px;
  margin-right: 6px;
  margin-bottom: 6px;
`
