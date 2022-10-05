import React, { useState } from 'react'
import styled from 'styled-components'
import { Modal, Radio, Button } from 'antd'
import Draggable from 'react-draggable'

const TaobaoOrderModal = ({isModalVisible, handleOk, handleCancel, taobaoOrder}) => {

  const [disabled, setDisabled] = useState(true)
  const [bounds, setBounds] = useState({ left: 0, top: 0, bottom: 0, right: 0 })
  const [value, setValue] = useState(0)

  const draggleRef = React.createRef()

  const onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window.document.documentElement
    const targetRect = draggleRef.current.getBoundingClientRect()
    setBounds(
      {
        left: -targetRect.left + uiData.x,
        right: clientWidth - (targetRect.right - uiData.x),
        top: -targetRect.top + uiData.y,
        bottom: clientHeight - (targetRect.bottom - uiData.y),
      }
    )
  }
  const onChange = e => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  }

  const handleOkButton = () => {
    const temp = taobaoOrder
    temp.orders = [temp.orders[value]]
    handleOk(temp)
  }

  console.log("taobaoOrder", taobaoOrder)
  return (
    <Modal 
    width={400}
    title={
      <div
      style={{
        width: '100%',
        cursor: 'move',
      }}
      onMouseOver={() => {
        if(disabled){
          setDisabled(false)
        }
      }}
      onMouseOut={() => {
        setDisabled(true)
      }}>상품을 선택해 주세요.</div>
    } visible={isModalVisible} onOk={handleOkButton} onCancel={handleCancel}
    modalRender={modal => (
      <Draggable 
        disabled={disabled}
        bounds={bounds}
        onStart={(event, uiData) => onStart(event, uiData)}
      >
        <div ref={draggleRef}>{modal}</div>
      </Draggable>
    )}
    
    >
      <Container>
        <div>
          <Radio.Group onChange={onChange} value={value} size="large">
          {taobaoOrder.orders.map((item, i) => {
            return (
              <ItemContainer key={i}>
              <Radio value={i} style={{marginTop: "120px"}}>
              <Image src={item.thumbnail} />
              {/* <div>{item.</div> */}
              </Radio>
              </ItemContainer>
            )
          })}
          </Radio.Group>
          
        </div>
      </Container>
    </Modal>
  )
}

export default TaobaoOrderModal

const Container = styled.div`
  height: 500px;
  overflow-y: auto;
  display: flex;
  justify-content: center;

`
const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  margin-top: -120px;
  margin-bottom: 120px;
`
const Image = styled.img`
  margin-bottom: -120px;
  width: 240px;
`