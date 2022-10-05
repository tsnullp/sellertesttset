import React, {useState, useEffect} from 'react'
import styled from "styled-components"
import Highlighter from "react-highlight-words"
import {OverText} from "../../../lib/userFunc"

const TitleHighlightForm = ({text}) => {

  const [title, setTitle] = useState(text)

  useEffect(() => {
    setTitle(text)
  }, [text])

  const CalcTextObj = OverText(title)

  return (
    <Container>
      <div>
        {CalcTextObj.firstText}
      </div>
      <Highlighter
        highlightClassName="YourHighlightClass"
        searchWords={[CalcTextObj.searchText]}
        autoEscape={true}
        textToHighlight={CalcTextObj.searchText}
        highlightStyle={{background: "lightGreen"}}
      />
    </Container>
  )
}

export default TitleHighlightForm

const Container = styled.div`
  margin-top: 5px;
  display: flex;
  font-size: 12px;
`