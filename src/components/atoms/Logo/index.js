import React from "react"
import styled from "styled-components"

const Logo = () => {
  return (
    <div onClick={() => (window.location.hash = "#/home")}>
      <LogoContainer>
        <CenterContainer1>$</CenterContainer1>
        <CenterContainer1>m</CenterContainer1>
        <CenterContainer1>a</CenterContainer1>
        <CenterContainer1>r</CenterContainer1>
        <CenterContainer1>t</CenterContainer1>
      </LogoContainer>
      <LogoContainer>
        <CenterContainer2>$</CenterContainer2>
        <CenterContainer2>e</CenterContainer2>
        <CenterContainer2>ll</CenterContainer2>
        <CenterContainer2>e</CenterContainer2>
        <CenterContainer2>r</CenterContainer2>
      </LogoContainer>
    </div>
  )
}

export default Logo
const LogoContainer = styled.div`
  cursor: pointer;
  display: flex;
  justify-content: center;
  font-size: 20px;
  color: white;
  font-weight: 500;
`

const CenterContainer1 = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 20px;
  width: 20px;
  font-size: 16px;
  font-weight: 500;
  margin-left: 3px;
  &:not(:last-child) {
    margin-right: 2px;
  }

  :nth-child(1) {
    background: ${props => props.theme.HighlightColor1};
    transform: rotate(-10deg);
    margin-right: -4px;
    font-size: 22px;
  }
  :nth-child(2) {
    background: ${props => props.theme.primary};
    margin-right: -4px;
  }
  :nth-child(3) {
    background: ${props => props.theme.primaryLight};
    transform: rotate(10deg);
    margin-right: -6px;
  }
  :nth-child(4) {
    background: ${props => props.theme.primary};
    transform: rotate(-10deg);
    margin-right: -6px;
  }
  :nth-child(5) {
    background: ${props => props.theme.primaryLight};
    transform: rotate(6deg);
  }
`

const CenterContainer2 = styled.div`
  margin-top: 2px;
  margin-left: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 18px;
  width: 18px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  &:not(:last-child) {
    margin-right: 5px;
  }
  :nth-child(1) {
    background: ${props => props.theme.HighlightColor1};
    transform: rotate(-3deg);
    margin-right: -6px;
    font-size: 20px;
  }
  :nth-child(2) {
    background: ${props => props.theme.secondaryDark};
    transform: rotate(-3deg);
    margin-right: -6px;
  }
  :nth-child(3) {
    background: ${props => props.theme.secondary};
    transform: rotate(10deg);
    margin-right: -6px;
  }
  :nth-child(4) {
    background: ${props => props.theme.secondaryDark};
    transform: rotate(-4deg);
    margin-right: -4px;
  }
  :nth-child(5) {
    background: ${props => props.theme.secondary};
    transform: rotate(-4deg);
  }
`
