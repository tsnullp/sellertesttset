import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { Input, BackTop, Button, Modal, message } from "antd"
import { PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons"
import { useMutation } from "@apollo/client"
import { UPDATE_BANWORD, DELETE_BANWORD } from "../../../gql"
const { confirm } = Modal

const BanForm = ({ list, refetch }) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedWord, setSelectedWord] = useState({ _id: null, word: "" })
  const [search, setSearch] = useState("")
  const [data, setData] = useState(list)
  const [mode, setMode] = useState("add")
  const [updateBrand] = useMutation(UPDATE_BANWORD)
  const [deleteBrand] = useMutation(DELETE_BANWORD)
  useEffect(() => {
    setData(list)
  }, [list])

  const showPromiseConfirm = () => {
    confirm({
      title: `${selectedWord.word}을(를) 삭제하시겠습니까?`,
      icon: <ExclamationCircleOutlined />,

      onOk() {
        return new Promise(async (resolve, reject) => {
          const response = await deleteBrand({
            variables: {
              _id: selectedWord._id
            }
          })
          if (response.data.DeleteBanWord) {
            message.success("삭제 하였습니다.")
            setIsModalVisible(false)
            setSelectedWord({ _id: null, word: "" })
            refetch()
            resolve()
          } else {
            message.warning("삭제에 실패 하였습니다.")
          }
        }).catch(() => console.log("Oops errors!"))
      },
      onCancel() {}
    })
  }
  return (
    <Container>
      <InputContainer>
        <Input
          style={{ width: "260px" }}
          size="large"
          allowClear={true}
          addonBefore="검색어"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button
          size="large"
          style={{ marginRight: "16px" }}
          icon={<PlusOutlined />}
          onClick={() => {
            setSelectedWord({ _id: null, word: "" })
            setMode("add")
            setIsModalVisible(true)
          }}
        >
          추가
        </Button>
        <Modal
          title={`금지 단어 ${mode === "add" ? "추가" : "수정"}`}
          visible={isModalVisible}
          okText="저장"
          onOk={async () => {
            console.log("selectedWord", selectedWord)
            const response = await updateBrand({
              variables: {
                _id: selectedWord._id,
                word: selectedWord.word
              }
            })
            console.log("response", response)
            if (response.data.UpdateBanWord) {
              message.success("저장하였습니다.")
              setSelectedWord({ word: "" })
              setIsModalVisible(false)
            } else {
              message.error("저장에 실패하였습니다.")
            }
          }}
          onCancel={() => {
            setSelectedWord({ _id: null, word: "" })
            setIsModalVisible(false)
          }}
          afterClose={() => {
            setSelectedWord({ _id: null, word: "" })
            refetch()
          }}
        >
          <InputButtonContainer>
            <Input
              addonBefore="금지단어"
              value={selectedWord.word}
              onChange={e => {
                const _id = selectedWord._id
                setSelectedWord({
                  _id,
                  word: e.target.value
                })
              }}
            />
            {mode === "modify" && (
              <Button type="primary" danger onClick={showPromiseConfirm}>
                삭제
              </Button>
            )}
          </InputButtonContainer>
        </Modal>
      </InputContainer>
      <ItemContainer>
        {data
          .filter(item => {
            if (search.length > 0) {
              if (item.word.includes(search)) {
                return true
              } else {
                return false
              }
            } else {
              return true
            }
          })
          .map(item => (
            <Item
              key={item._id}
              onClick={() => {
                setMode("modify")
                setSelectedWord({
                  _id: item._id,
                  word: item.word
                })
                console.log("selectedWord", item)
                setIsModalVisible(true)
              }}
            >
              {item.word}
            </Item>
          ))}
        <BackTop />
      </ItemContainer>
    </Container>
  )
}

export default BanForm

const Container = styled.div``

const InputContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const Item = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1.4;
  height: 60px;
  width: 100px;
  padding: 10px;
  border: 1px solid gray;
  margin-left: -1px;
  margin-top: -1px;
  &:hover {
    background: rgb(255, 239, 238);

    font-weight: 700;
    font-size: 16px;
  }
`

const InputButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > :nth-child(1) {
    width: 100%;
  }
  & > :nth-child(2) {
    width: 60px;
  }
`
