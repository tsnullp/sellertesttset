import React, {useState, useEffect} from "react"
import { Modal, message, Input } from "antd"
import { useMutation} from "@apollo/client"
import { SET_TAOBAO_URL } from "../../../gql"

const LinkUrlModal = ({isModalVisible, handleOk, handleCancel, _id, url}) => {
  const [linkUrl, setLinkUrl] = useState(url)
  const [setTaobaoUrl] = useMutation(SET_TAOBAO_URL)

  useEffect(() => {
    setLinkUrl(url)
  }, [url])

  const handleOkButton = async() => {
    const response = await setTaobaoUrl({
      variables: {
        _id,
        url: linkUrl
      }
    })
    if(response.data.SetTaobaoUrl){
      message.success("상품 URL 변경에 성공 하였습니다.")
      handleOk(linkUrl)
    } else {
      message.error("상품 URL 변경에 실패하였습니다.")
    }
    
    
  }

  return (
    <Modal
      
      title="상품 페이지 링크 설정"
      visible={isModalVisible}
      onOk={handleOkButton}
      onCancel={handleCancel}
      width={800}
      zIndex={5}
    >
      <Input allowClear={true} value={linkUrl} onChange={e=> setLinkUrl(e.target.value)}/>
    </Modal>
  )

}

export default LinkUrlModal