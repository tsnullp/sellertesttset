import React from 'react'
import styled from "styled-components"
import Highlighter from "react-highlight-words"
import { Modal } from 'antd'
import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"

const HighligthModal = ({isModalVisible, handleOk, handleCancel, text, seachWords}) => {
  return (
    <Modal title="금지성분 의심"  
      visible={isModalVisible} 
      onOk={handleOk} 
      onCancel={handleCancel}
      maskClosable={true}
      zIndex={5}
      width={1000}
    >
      <ModalContainer>
        <Highlighter
          highlightClassName="YourHighlightClass"
          searchWords={seachWords}
          autoEscape={true}
          textToHighlight={text}
          highlightStyle={{background: "red"}}
        />
      </ModalContainer>
    </Modal>
  )
}

export default HighligthModal

const ModalContainer = styled(SimpleBar)`
  max-height: 600px;
  overflow-y: auto;
`