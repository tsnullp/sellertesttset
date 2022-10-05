import React, {useState, forwardRef, useImperativeHandle} from "react"
import styled from "styled-components"
import {  Tooltip,  Tag, Spin, Button } from "antd"
import { useMutation } from "@apollo/client"
import {GET_KIPRISWORD} from "../../../gql"
import { AlertOutlined } from "@ant-design/icons"
const { shell } = window.require("electron")

const TitleArrayComponent = forwardRef(({title, originalTitle, titleArray, SetSelectKeyword, showModal}, ref) => {
  const [kipris, setKipris] = useState([])
  const [loading, setLoading] = useState(false)

  const [getKipris] = useMutation(GET_KIPRISWORD)

  const handleKiprise = async () => {
    setKipris([])
    setLoading(true)
    try {
      
      const response = await getKipris({
        variables:{
          search: title
        }
      })
      console.log("Response", response)
      if(response && response.data && response.data.GetKiprisWord){
        setKipris(response.data.GetKiprisWord.filter(item => item.result === true))            
      } 
      
    } catch(e){
      console.log("에러",e)
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    getKiprisSearch() {
      console.log("여기")
      handleKiprise()
    }
  }));

  if(!Array.isArray(titleArray)){
    return null
  }

  
  return (
    <>
    {originalTitle &&
        <OriginalTitleLable>
          {originalTitle}
        </OriginalTitleLable>
      }
    <TitleContainer>
      {/* <Tooltip
        key={title}
        title="상표권 조회"
      >
      <Button loading={loading}
        shape="circle"
        icon={<AlertOutlined style={{color: "orange"}}/>}
        onClick={async () => {
          handleKiprise()
        }}

        
      >
       
      </Button>
      </Tooltip> */}
      
      {titleArray.map((item, index) => {
        const kiprisArr = kipris.filter(kItem => kItem.search === item.word)
        
        if(kiprisArr.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <div>{`상표권 : ${kiprisArr[0].title}`}</div>
              }
            >
            <TitleTag color="#f50"  
              onClick={() => {
                if(typeof SetSelectKeyword === "function") {
                  SetSelectKeyword(item.word)
                  showModal()
                  // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item.word}`)
                }
              }}
              >{item.word}</TitleTag>
            </Tooltip>
          )
        }else if (item.ban.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <>
                  <div>금지 단어</div>
                  <div>
                    {item.ban.map((item, i) => (
                      <Tag key={i} color="red">
                        {item.trim()}
                      </Tag>
                    ))}
                  </div>
                </>
              }
            >
              <TitleTag color="red"
              onClick={() => {
                if(typeof SetSelectKeyword === "function") {
                  SetSelectKeyword(item.word)
                  showModal()
                  // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item.word}`)
                }
              }}
              >{item.word}</TitleTag>
            </Tooltip>
          )
        } else if (item.prohibit && item.prohibit.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <>
                  <div>금지성분 의심 단어</div>
                  <div>
                    {item.prohibit.map((item, i) => (
                      <Tag key={i} color="orange">
                        {item}
                      </Tag>
                    ))}
                  </div>
                </>
              }
            >
              <TitleTag color="orange"
              
              onClick={() => {
                if(typeof SetSelectKeyword === "function") {
                  SetSelectKeyword(item.word)
                  showModal()
                  // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item.word}`)
                }
              }}
              >{item.word}</TitleTag>
            </Tooltip>
          )
        } else if (item.brand.length > 0) {
          return (
            <Tooltip
              key={index}
              title={
                <>
                  <div>브랜드 의심 단어</div>
                  <div>
                    {item.brand.map((item, i) => (
                      <Tag key={i} color="blue">
                        {item}
                      </Tag>
                    ))}
                  </div>
                </>
              }
            >
              <TitleTag color="blue"
              
              onClick={() => {
                if(typeof SetSelectKeyword === "function") {
                  SetSelectKeyword(item.word)
                  showModal()
                  // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item.word}`)
                }
              }}
              >{item.word}</TitleTag>
            </Tooltip>
          )
        } else {
          return <TitleSpan key={index}
          onClick={() => {
            if(typeof SetSelectKeyword === "function") {
              SetSelectKeyword(item.word)
              showModal()
              // shell.openExternal(`https://pandarank.net/search/detail?keyword=${item.word}`)
            }
          }}
          >{item.word}</TitleSpan>
        }
      })}
      
    </TitleContainer>
    </>
  )
})

export default TitleArrayComponent

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 14px;
  line-height: 1.6;
  & > :not(:last-child) {
    margin-right: 3px;
  }
`

const TitleSpan = styled.span`
  cursor: pointer;
  &:hover{
    font-weight: 700;
  }
`

const TitleTag = styled(Tag)`
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
  font-weight: 700;
  &:hover{
    font-weight: 700;
  }
`

const OriginalTitleLable = styled.div`
  font-size: 11px;
  margin-bottom: 5px;
  color: ${props => props.theme.primaryDark}
`