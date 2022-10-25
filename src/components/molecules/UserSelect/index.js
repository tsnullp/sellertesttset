import React from "react"
import { Select } from "antd"
const { Option, OptGroup } = Select

const UserSelect = ({ isRoot = false, handleSelectChange, userID }) => {

  const getUserOption = () => {

    switch(userID) {
      case "5f0d5ff36fc75ec20d54c40b":
      case "625f9ca226d0840a73e2dbb8":
      case "5f1947bd682563be2d22f008":
      case "62bd48f391d7fb85bcc54693":
        return (
          <>
            <OptGroup key="정태석 대표님" label="정태석 대표님">
              <Option value="5f0d5ff36fc75ec20d54c40b">널포인트</Option>
              <Option value="625f9ca226d0840a73e2dbb8">원포인트</Option>
              <Option value="5f1947bd682563be2d22f008">투포인트</Option>
              <Option value="62bd48f391d7fb85bcc54693">삼포인트</Option>
            </OptGroup>
    
            <>
              <OptGroup key="정영미 대표님" label="정영미 대표님">
                <Option value="5f6040f67f596146ccf2fb3a">미니투스</Option>
                <Option value="615cfa9e89d5ed87bc48159a">미인이야</Option>
                <Option value="624fcac36397b5f40972ed81">투미스타</Option>
                <Option value="62b12557cb10cb7ac536aa9f">아이니야</Option>
              </OptGroup>
      
              <OptGroup key="신준환 대표님" label="신준환 대표님">
                <Option value="5f601bdf18d42d13d0d616d0">메타트론</Option>
                <Option value="61cd0b79d5ecd34d6cd5115d">디쎌</Option>
                <Option value="62707ad073dd9253ac84bfbd">디파인드</Option>
              </OptGroup>
            </>
          </>
        )
      case "5f6040f67f596146ccf2fb3a":
      case "615cfa9e89d5ed87bc48159a":
      case "624fcac36397b5f40972ed81":
      case "62b12557cb10cb7ac536aa9f":
        return (
          <>
            <OptGroup key="정영미 대표님" label="정영미 대표님">
              <Option value="5f6040f67f596146ccf2fb3a">미니투스</Option>
              <Option value="615cfa9e89d5ed87bc48159a">미인이야</Option>
              <Option value="624fcac36397b5f40972ed81">투미스타</Option>
              <Option value="62b12557cb10cb7ac536aa9f">아이니야</Option>
            </OptGroup>

            {isRoot && 
              <>
                 <OptGroup key="정태석 대표님" label="정태석 대표님">
                  <Option value="5f0d5ff36fc75ec20d54c40b">널포인트</Option>
                  <Option value="625f9ca226d0840a73e2dbb8">원포인트</Option>
                  <Option value="5f1947bd682563be2d22f008">투포인트</Option>
                  <Option value="62bd48f391d7fb85bcc54693">삼포인트</Option>
                </OptGroup>

                <OptGroup key="신준환 대표님" label="신준환 대표님">
                  <Option value="5f601bdf18d42d13d0d616d0">메타트론</Option>
                  <Option value="61cd0b79d5ecd34d6cd5115d">디쎌</Option>
                  <Option value="62707ad073dd9253ac84bfbd">디파인드</Option>
                </OptGroup>
              </>}
          </>
        )
      case "5f601bdf18d42d13d0d616d0":
      case "61cd0b79d5ecd34d6cd5115d":
      case "62707ad073dd9253ac84bfbd":
        return (
          <>
            <OptGroup key="신준환 대표님" label="신준환 대표님">
              <Option value="5f601bdf18d42d13d0d616d0">메타트론</Option>
              <Option value="61cd0b79d5ecd34d6cd5115d">디쎌</Option>
              <Option value="62707ad073dd9253ac84bfbd">디파인드</Option>
            </OptGroup>

            {isRoot && 
              <>
                <OptGroup key="정태석 대표님" label="정태석 대표님">
                  <Option value="5f0d5ff36fc75ec20d54c40b">널포인트</Option>
                  <Option value="625f9ca226d0840a73e2dbb8">원포인트</Option>
                  <Option value="5f1947bd682563be2d22f008">투포인트</Option>
                  <Option value="62bd48f391d7fb85bcc54693">삼포인트</Option>
                </OptGroup>

                <OptGroup key="정영미 대표님" label="정영미 대표님">
                  <Option value="5f6040f67f596146ccf2fb3a">미니투스</Option>
                  <Option value="615cfa9e89d5ed87bc48159a">미인이야</Option>
                  <Option value="624fcac36397b5f40972ed81">투미스타</Option>
                  <Option value="62b12557cb10cb7ac536aa9f">아이니야</Option>
                </OptGroup>
              </>}
          </>
        )
      default:
        return null
    }
  }
  return (
    <Select
      style={{ minWidth: 120, maxWidth: 120, marginRight: "10px" }}
      size="middle"
      status="warning"
      onChange={handleSelectChange}
      defaultValue={userID}
    >
      {getUserOption()}
    </Select>
  )
}

export default UserSelect
