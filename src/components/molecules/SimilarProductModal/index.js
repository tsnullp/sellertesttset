import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { Modal, Button, Checkbox, Alert, notification, Spin } from "antd"
import { useMutation } from "@apollo/client"
import { TAOBAO_SIMILAR_PRODUCTS, GET_SIMILAR_PRODUCT_KORTITLE } from "../../../gql"

import SimpleBar from "simplebar-react"
import "simplebar/dist/simplebar.min.css"
import _ from "lodash"

const SimilarProductModal = ({ isModalVisible, handleOk, handleCancel, url, image}) => {
  const [loading, setLoading] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState(url)
  const [selectedImage, setSelectedImage] = useState(image)
  const [items, setItems] = useState([])
  const [simialrItems, setSimilarItems] = useState([])
  const [getSimilarProducts] = useMutation(TAOBAO_SIMILAR_PRODUCTS)
  const [getSimilarProductsKorTitle] = useMutation(GET_SIMILAR_PRODUCT_KORTITLE)


  const handleSimilarProducts = async () => {
    setLoading(true)
    try {
      const response = await getSimilarProducts({
        variables: {
          urlString: selectedUrl
        }
      })
      console.log("resposen", response)
      setSimilarItems(response.data.GetSimilarProducts)
      if(!response || response.data.GetSimilarProducts.length === 0){
        notification["error"]({
          message: '찾기 오류',
          description: "타오바오 로그인 후 셀러 확장프로그램 클릭"
        });
      }
    } catch(e){

    } finally {
      setLoading(false)
    }
    
  }

  useEffect(() => {
    handleSimilarProducts()
  }, [])
  useEffect(() => {
    setSelectedUrl(url)
  }, url)
  
  const handleOkClick = async() => {

    // handleOk(items.filter(item => item.isChecked))
    try {
      console.log("items", items)
      const response = await getSimilarProductsKorTitle({
        variables: {
          input: items.filter(item => item.isChecked).map(item => {
            return {
              title: item.title,
              link: item.link,
              image: item.image
            }
          })
        }
      })

      console.log("response", response)
      handleOk(response.data.GetSimilarProductKorTitle)
    } catch(e){
      console.log("ERROR",e)
    }
  }

  const onChange = (e, image) => {
    console.log(`checked = ${e.target.checked}`)
    let itemTemp = items
    const temp = simialrItems.map((item) => {
      if(!e.target.checked) {
        
        itemTemp = items.filter(fItem => fItem.image !== image)
        console.log("여기 타지/", itemTemp.length)
      }
      if (item.image === image) {
        item.isChecked = e.target.checked
      }
      return item
    })
    setSimilarItems(temp)

    itemTemp = [...itemTemp, ...temp.filter(item => item.isChecked)]
    itemTemp = _.uniqBy(itemTemp, "image")
    console.log("itemTemp", itemTemp)
    setItems(itemTemp)
    // setCheckAll(items.filter((item) => items.isChecked).length === images.length)
  }


  return  (
    <Modal
      width={1500}
      zIndex={1000}
      centered={true}
      visible={isModalVisible}
      onOk={handleOkClick}
      onCancel={handleCancel}
      title={
      <TitleContainer>
        <div>
        <TitleImage src={image}
        onClick={() => {
          setSelectedUrl(url)
          setSelectedImage(image)
          handleSimilarProducts()
        }}
        />
          원본 이미지
        </div>
        {/* <Button onClick={() => handleSimilarProducts()}>찾기</Button> */}
        {selectedImage && 
          <div>
          <TitleImage src={selectedImage}
          onClick={() => handleSimilarProducts()}
          />
            찾을려는 이미지
          </div>
        }
      </TitleContainer>
      }
      >
       
        
        <Container>
          <div>
            <Alert message="선택됨" type="success" showIcon banner/>
            <ScrollView>
              {items && items.map((item, i) => {
                return (
                  <ImageWarper key={i}>
                    <Checkbox 
                    // onChange={(e) => onChange(e, item.image)} 
                    checked={item.isChecked}>
                      <ImageView src={item.image} alt={item.title} />
                    </Checkbox>
                  </ImageWarper>
                )
              })}
          </ScrollView>
          </div>
          <div>
            <Alert 
              message="유사 상품"
              type="info"
              banner
              icon={<Spin />}
              showIcon={loading}
             />
          
            <ScrollView>
              {
                simialrItems && simialrItems.map((item, i) => {
                  return (
                    <ImageWarper key={i}>
                      <Checkbox onChange={(e) => onChange(e, item.image)} checked={item.isChecked}>
                        <ImageView src={item.image} alt={item.title} />
                      </Checkbox>
                      <SimilarButton
                      onClick={() => {
                        setSelectedImage(item.image)
                        setSelectedUrl(item.link)
                        handleSimilarProducts()
                      }}
                      >유사 상품 찾기</SimilarButton>
                    </ImageWarper>
                  )
                })
              }
          </ScrollView>
          </div>
        </Container>
    </Modal>
  )
}

export default SimilarProductModal


const Container = styled.div`
  margin-top: -20px;  display: flex;

  &>:nth-child(1) {
    min-width: 200px;
    max-width: 200px;
    margin-right: 30px;
  }
  &>:nth-child(2) {
    width: 100%;
  }
`

const ScrollView = styled(SimpleBar)`
  max-height: 700px;
  overflow-y: auto;
`

const ImageWarper = styled.div`
  position: relative;
  display: inline-block;
  width: 160px;
  height: 160px;
  margin-right: 10px;
  margin-bottom: 10px;
`

const ImageView = styled.img`
  width: 160px;
  height: 160px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
`

const SimilarButton = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0%;
  height: 25px;
  z-index: 10;
  text-align: center;
  background: black;
  color: white;
  font-weight: 700;
  cursor: pointer;
`
const TitleImage = styled.img`
  width: 80px;
  height: 80px;
  margin-right: 5px;
`

const TitleContainer = styled.div`
  display: flex;

  &>:nth-child(1) {
    min-width: 200px;
    max-width: 200px;
    margin-right: 30px;
  }
  &>:nth-child(2) {
    width: 100%;
  }
`