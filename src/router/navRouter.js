import React from "react"
import { HashRouter as Router, Route, Switch } from "react-router-dom"
import {
  Home,
  CategoryPage,
  KeywordPage,
  ProductUploadPage,
  BasicSettingPage,
  MarketSettingPage,
  TaobaoProductUploadPage,
  ProductPage,
  ProductCalendarPage,
  TaobaoFavoritePage,
  CoupangStorePage,
  CoupangWinnerPage,
  NaverBestPage,
  NaverFlashItemPage,
  KeywordTool1Page,
  BatchTaobaoPage,
  ExplainingDataPage,
  ItemWinnerPage,
  ItemWinnerPage1,
  BrandPage,
  NaverShoppingPage,
  NaverShoppingPlusPage,
  LowPricePage,
  SalesPage,
  OrderPage,
  SoEasyPage,
  NaverMainKeywordPage,
  AmazonUploadPage,
  HealthFoodPage,
  BoardsPage
} from "components"

const navRouter = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/itemWinner">
          <ItemWinnerPage />
        </Route>
        <Route path="/itemWinner1">
          <ItemWinnerPage1 />
        </Route>
        <Route path="/naverShopping">
          <NaverShoppingPage />
        </Route>
        <Route path="/naverShoppingPlus">
          <NaverShoppingPlusPage />
        </Route>
        <Route path="/category">
          <CategoryPage />
        </Route>
        <Route path="/keyword">
          <KeywordPage />
        </Route>
        <Route path="/taobaofavorite">
          <TaobaoFavoritePage />
        </Route>
        <Route path="/coupangStore">
          <CoupangStorePage />
        </Route>
        <Route path="/coupangWinner">
          <CoupangWinnerPage />
        </Route>
        <Route path="/naverFlash">
          <NaverFlashItemPage />
        </Route>
        <Route path="/naverBest">
          <NaverBestPage />
        </Route>
        <Route path="/product">
          <TaobaoProductUploadPage />
        </Route>
        <Route path="/productUpload">
          <ProductUploadPage />
        </Route>
        <Route path="/productmanage">
          <ProductPage />
        </Route>
        <Route path="/productCalendar">
          <ProductCalendarPage />
        </Route>
        <Route path="/explainingData">
          <ExplainingDataPage />
        </Route>
        <Route path="/basicSetting">
          <BasicSettingPage />
        </Route>
        <Route path="/marketSetting">
          <MarketSettingPage />
        </Route>
        <Route path="/keywordtool1">
          <KeywordTool1Page />
        </Route>
        <Route path="/batch_taobao">
          <BatchTaobaoPage />
        </Route>
        <Route path="/brand">
          <BrandPage />
        </Route>
        <Route path="/lowPrice">
          <LowPricePage />
        </Route>
        <Route path="/sales">
          <SalesPage />
        </Route>
        <Route path="/order">
          <OrderPage />
        </Route>
        <Route path="/soEasySetting">
          <SoEasyPage />
        </Route>
        <Route path="/naverMainKeyword">
          <NaverMainKeywordPage />
        </Route>
        <Route path="/amazonUpload">
          <AmazonUploadPage />
        </Route>
        <Route path="/healthFood">
          <HealthFoodPage />
        </Route>
        <Route path="/board">
          <BoardsPage />
        </Route>
      </Switch>
    </Router>
  )
}

export default navRouter
