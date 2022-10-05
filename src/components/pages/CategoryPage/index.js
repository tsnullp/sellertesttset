import React, { useState } from "react"
import { CategoryForm, CategoryList } from "components"
import styled from "styled-components"

const CategoryPage = () => {
  const [categoryCode, setCategoryCode] = useState(null)
  const [isUnsold, setUnsold] = useState(localStorage.getItem("unsold"))

  const [research, setResearch] = useState(0)
  const handleSearch = categoryID => {
    setCategoryCode(categoryID)
    setResearch(research + 1)
  }

  const handleUnsold = unsold => {
    setUnsold(unsold)
  }

  return (
    <>
      <CategoryFormContainer>
        <CategoryForm
          handleSearch={handleSearch}
          handleUnsold={handleUnsold}
          isUnsold={isUnsold === "true" || isUnsold === true ? true : false}
        />
      </CategoryFormContainer>
      {categoryCode && (
        <CategoryList
          categoryCode={categoryCode}
          research={research}
          isUnsold={isUnsold === "true" || isUnsold === true ? true : false}
        />
      )}
    </>
  )
}

export default CategoryPage

const CategoryFormContainer = styled.div`
  box-sizing: border-box;
  padding: 20px 20px;

  border-bottom: ${props => `2px dashed ${props.theme.primaryDark}`};
`
