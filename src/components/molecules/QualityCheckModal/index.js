import React from "react"
import styled from "styled-components"
import {Modal} from "antd"

const QualityCheckModal = ({isModalVisible, handleOkOk, totalScore, cause, etc}) => {

  console.log("totalScore", totalScore)
  return (
    <Modal
      title="상품명 검색품질 체크"
      visible={isModalVisible}
      onOk={handleOkOk}
      onCancel={handleOkOk}
    >
      {cause && cause.length > 0 &&
        cause.map((item, i) => {
          return (
            <Container key={i}>
              <div>{item.cause}</div>
              <div>{item.term.join(", ")}</div>
            </Container>
          )
        })    
      }
      {etc && etc.length > 0 &&
        etc.map((item, i) => {
          return (
            <Container key={i}>
              <div>기타</div>
              <div>{item}</div>
            </Container>
          )
        })
      }
      <Container>
        <div>총점</div>
        <div>{`${totalScore * 100} 점`}</div>
      </Container>
    </Modal>
  )
}

export default QualityCheckModal

const Container = styled.div`
  display: flex;
  align-items: center;
  margin-top: -1px;
  &>:nth-child(1){
    min-width: 180px;
    max-width: 180px;
    border: 1px solid lightgray;
    padding-left: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
    background: #f8f9fd;
  }
  &>:nth-child(2){
    width: 100%;
    border: 1px solid lightgray;
    margin-left: -1px;
    padding-left: 10px;
    padding-top: 5px;
    padding-bottom: 5px;
  }
`