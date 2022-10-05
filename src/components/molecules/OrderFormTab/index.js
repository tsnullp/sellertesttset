import React, {useState} from "react"
import { Tabs } from 'antd'
import { OrderForm, BaedaegiForm, TabaeDelayForm } from "components"

const { TabPane } = Tabs


const OrderFormTab = () => {
  return (
    <Tabs defaultActiveKey="2" centered={true}
    tabBarGutter={100}
    >
      <TabPane tab="배대지 지연" key="0">
        <TabaeDelayForm />
      </TabPane>
      <TabPane tab="배대지 로우 데이터" key="1">
        <BaedaegiForm />
      </TabPane>
      <TabPane tab="상품준비중" key="2">
        <OrderForm orderState="상품준비"/>
      </TabPane>
      <TabPane tab="배송지시" key="3">
        <OrderForm orderState="배송지시"/>
      </TabPane>
      <TabPane tab="배송중" key="4">
        <OrderForm orderState="배송중"/>
      </TabPane>
      <TabPane tab="배송완료" key="5">
        <OrderForm orderState="배송완료"/>
      </TabPane>
    </Tabs>
  )
}

export default OrderFormTab


