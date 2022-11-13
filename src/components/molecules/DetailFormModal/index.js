import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { Modal } from "antd"
import { TextEditor } from "components"

const DetailFormModal = ({isModalVisible, handleOk, handleCancel, content, html}) => {

  const [detailHtml, setDetailHtml] = useState("")

  useEffect(() => {
    if(html && html.length > 0){
      setDetailHtml(html)  
    } else {
      let tempHtml = ``
      tempHtml += `<hr >`

      if(Array.isArray(content)){
        for(const item of content){
          tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
        }
      }
      setDetailHtml(tempHtml)
    }
    
  }, [content])
  const handleOkButton = () => {
    handleOk(detailHtml.replace("http://tsnullp.chickenkiller.com", "https://tsnullp.chickenkiller.com"))
  }

  return (
    <Modal
      maskClosable={false}
      title="상세페이지 설정"
      visible={isModalVisible}
      onOk={handleOkButton}
      onCancel={handleCancel}
      width={1100}
      centered={true}
    >
      <TextEditor
        height={800}
        showHtml={true}
        html={detailHtml.replace("https://tsnullp.chickenkiller.com", "http://tsnullp.chickenkiller.com")}
        getHtmlValue={setDetailHtml}
      />
    </Modal>
  )
}

export default DetailFormModal