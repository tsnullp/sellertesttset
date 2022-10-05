import React, { useState } from "react"
import styled from "styled-components"
import smartStoreCategory from "./category.js"
import { Select, Switch } from "antd"
import { Button } from "antd"
import { SearchOutlined } from "@ant-design/icons"
const { Option } = Select

const CategoryForm = ({ handleSearch, isUnsold, handleUnsold }) => {
  const [categoryObj, setCategoryObj] = useState({
    대분류: localStorage.getItem("대분류") || "패션의류",
    중분류: localStorage.getItem("중분류") || "",
    소분류: localStorage.getItem("소분류") || "",
    세분류: localStorage.getItem("세분류") || ""
  })

  const getSelectedCategoryCode = () => {
    const selectedItem = smartStoreCategory.filter(
      item =>
        item.대분류 === categoryObj.대분류 &&
        item.중분류 === categoryObj.중분류 &&
        item.소분류 === categoryObj.소분류 &&
        item.세분류 === categoryObj.세분류
    )
    if (selectedItem.length === 1) {
      return selectedItem[0]["카테고리코드"]
    } else {
      return null
    }
  }

  const 대분류 = smartStoreCategory.reduce(
    (unique, item) => (unique.includes(item["대분류"]) ? unique : [...unique, item["대분류"]]),
    []
  )

  let 중분류 = smartStoreCategory
    .filter(item => item["대분류"] === categoryObj["대분류"])
    .reduce(
      (unique, item) => (unique.includes(item["중분류"]) ? unique : [...unique, item["중분류"]]),
      []
    )

  let 소분류 = smartStoreCategory
    .filter(
      item => item["대분류"] === categoryObj["대분류"] && item["중분류"] === categoryObj["중분류"]
    )
    .reduce(
      (unique, item) => (unique.includes(item["소분류"]) ? unique : [...unique, item["소분류"]]),
      []
    )

  let 세분류 = smartStoreCategory
    .filter(
      item =>
        item.대분류 === categoryObj.대분류 &&
        item.중분류 === categoryObj.중분류 &&
        item.소분류 === categoryObj.소분류
    )
    .reduce(
      (unique, item) => (unique.includes(item["세분류"]) ? unique : [...unique, item["세분류"]]),
      []
    )

  const handleChange1 = value => {
    setCategoryObj({
      대분류: value,
      중분류: "",
      소분류: "",
      세분류: ""
    })
    localStorage.setItem("대분류", value)
    localStorage.removeItem("중분류")
    localStorage.removeItem("소분류")
    localStorage.removeItem("세분류")
  }

  const handleChange2 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: value,
      소분류: "",
      세분류: ""
    })
    localStorage.setItem("중분류", value)
    localStorage.removeItem("소분류")
    localStorage.removeItem("세분류")
  }

  const handleChange3 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: categoryObj.중분류,
      소분류: value,
      세분류: ""
    })
    localStorage.setItem("소분류", value)
    localStorage.removeItem("세분류")
  }

  const handleChange4 = value => {
    setCategoryObj({
      대분류: categoryObj.대분류,
      중분류: categoryObj.중분류,
      소분류: categoryObj.소분류,
      세분류: value
    })
    localStorage.setItem("세분류", value)
  }

  const Cagegory1 = () => {
    return 대분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory2 = () => {
    return 중분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory3 = () => {
    return 소분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const Cagegory4 = () => {
    return 세분류.map((item, i) => (
      <Option key={i} value={item}>
        {item}
      </Option>
    ))
  }

  const unsoldOnChange = value => {
    handleUnsold(value)
  }

  return (
    <Container>
      <div>
        <CategoryContainer>
          <FirstSelect>
            <Select
              size="large"
              defaultValue={categoryObj.대분류}
              style={{ width: 160 }}
              onChange={handleChange1}
            >
              {Cagegory1()}
            </Select>
            <CheckBoxContainer>
              <Switch checked={isUnsold} onChange={unsoldOnChange} />
              <span>구매건수 없는 상품 포함</span>
            </CheckBoxContainer>
          </FirstSelect>
          <Select
            size="large"
            listHeight={600}
            value={categoryObj.중분류}
            style={{ width: 160 }}
            onChange={handleChange2}
            disabled={중분류.length === 0}
          >
            {Cagegory2()}
          </Select>
          <Select
            size="large"
            value={categoryObj.소분류}
            style={{ width: 160 }}
            onChange={handleChange3}
            disabled={소분류.length === 0}
          >
            {Cagegory3()}
          </Select>
          <Select
            size="large"
            value={categoryObj.세분류}
            style={{ width: 160 }}
            onChange={handleChange4}
            disabled={세분류.length === 0}
          >
            {Cagegory4()}
          </Select>
          <Button
            size="large"
            type="primary"
            disabled={!getSelectedCategoryCode()}
            icon={<SearchOutlined />}
            onClick={() => handleSearch(getSelectedCategoryCode())}
          >
            검색
          </Button>
        </CategoryContainer>
      </div>
      <ContegoryCode>{`선택한 카테고리 코드: ${
        getSelectedCategoryCode() ? getSelectedCategoryCode() : ""
      }`}</ContegoryCode>
    </Container>
  )
}

export default CategoryForm

const Container = styled.div``
const CategoryContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  & > :not(:last-child) {
    margin-right: 10px;
  }
`

const FirstSelect = styled.div`
  position: relative;
`

const CheckBoxContainer = styled.div`
  position: absolute;
  left: 0;
  right: -30px;
  top: 50px;
  font-size: 13px;
  & > :nth-child(2) {
    margin-left: 5px;
  }
`

const ContegoryCode = styled.div`
  font-size: 14px;
  margin-top: 20px;
  text-align: center;
`
