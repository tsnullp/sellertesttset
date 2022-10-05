import React, {useState, useEffect} from 'react'
import styled from 'styled-components'
import { Modal, notification } from "antd"
import { TextEditor } from "components"
import { useQuery, useMutation} from "@apollo/client"
import { GET_DETAIL_HTML, MODIFY_PRODUCT_HTML } from "../../../gql"
const DetailModifyModal = ({isModalVisible, handleOk, handleCancel, _id, user}) => {

  const [detailHtml, setDetailHtml] = useState(null)
  const [modifyProductHtml] = useMutation(MODIFY_PRODUCT_HTML)

  const {data, refetch} = useQuery(GET_DETAIL_HTML, {
    variables: {
      _id
    },
    onCompleted: data=> {
      setDetailHtml(data.GetDetailHtml)
    }
  })

  if(data && data.GetDetailHtml && data.GetDetailHtml && !detailHtml){
  
    setDetailHtml(data.GetDetailHtml)
  }


  useEffect(() => {
    if(isModalVisible) {
      refetch()
    }
  }, [isModalVisible])

  // useEffect(() => {
  //   if(html && html.length > 0){
  //     setDetailHtml(html)  
  //   } else {
  //     let tempHtml = ``
  //     tempHtml += `<hr >`

  //     if(Array.isArray(content)){
  //       for(const item of content){
  //         tempHtml += `<img src="${item}" style="width: 100%; max-width: 800px; display: block; margin: 0 auto; "/ />`
  //       }
  //     }
  //     setDetailHtml(tempHtml)
  //   }
    
  // }, [content])
  const handleOkButton = async() => {

    const response = await modifyProductHtml({
      variables: {
        id: _id,
        html: detailHtml,
        userID: user
      }
    })
    console.log("response", response)
    if(response.data.ModifyProductHtml){
      notification['success']({
        message: '상세페이지를 변경하였습니다.',
      });
      handleOk(detailHtml)
      setDetailHtml(null)
    }

    
  }

  return (
    <Modal
      maskClosable={false}
      title="상세페이지 설정"
      visible={isModalVisible}
      onOk={handleOkButton}
      onCancel={() => {
        setDetailHtml(null)
        handleCancel()
      }}
      width={1100}
      centered={true}
    >
   
      <TextEditor
        height={800}
        showHtml={true}
        html={detailHtml}
        getHtmlValue={setDetailHtml}
      />
    </Modal>
  )
}

export default DetailModifyModal