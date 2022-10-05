import React from "react"
import { HashRouter as Router, Route, Switch } from "react-router-dom"
import {
  BasicTemplates,
  TaobaoProductUploadPage,
  ProductUploadPage,
  ProductUpdatePage,
  ProductPage,
  CategoryPage,
  KeywordPage,
  ProductCalendar,
  TaobaoItemListPage,
  TaobaoFavoritePage,
  CoupangStorePage,
  CoupangWinnerPage,
  NaverBestPage,
  NaverFlashItemPage,
  SavedProductUploadPage,
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
  NaverMainKeywordPage,
  AmazonUploadPage,
  HealthFoodPage,
} from "components"

const rootRouter = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <BasicTemplates />
          </Route>
          <Route path="/itemWinnerWindow">
            <ItemWinnerPage />
          </Route>
          <Route path="/itemWinnerWindow1">
            <ItemWinnerPage1 />
          </Route>
          <Route path="/naverShoppingWindow">
            <NaverShoppingPage />
          </Route>
          <Route path="/naverShoppingPlusWindow">
            <NaverShoppingPlusPage />
          </Route>
          <Route path="/categoryWindow">
            <CategoryPage />
          </Route>
          <Route path="/keywordWindow">
            <KeywordPage />
          </Route>
          <Route path="/taobaoFavoitedWindow">
            <TaobaoFavoritePage />
          </Route>
          <Route path="/productUploadWindow">
            <ProductUploadPage />
          </Route>
          <Route path="/productUpdatedWindow/:ID">
            <ProductUpdatePage />
          </Route>
          <Route path="/taobaoItemList">
            <TaobaoItemListPage />
          </Route>
          <Route path="/taobaoProductUploadWindow">
            <TaobaoProductUploadPage />
          </Route>
          <Route path="/productmanageWindow">
            <ProductPage />
          </Route>
          <Route path="/productCalendarWindow">
            <ProductCalendar />
          </Route>
          <Route path="/explainingDataWindow">
            <ExplainingDataPage />
          </Route>
          <Route path="/coupangStoreWindow">
            <CoupangStorePage />
          </Route>
          <Route path="/coupangWinnerWindow">
            <CoupangWinnerPage />
          </Route>
          <Route path="/naverBestWindow">
            <NaverBestPage />
          </Route>
          <Route path="/naverFlashWindow">
            <NaverFlashItemPage />
          </Route>
          <Route path="/savedProductUploadWindow">
            <SavedProductUploadPage />
          </Route>
          <Route path="/batch_taobaoWindow">
            <BatchTaobaoPage />
          </Route>
          <Route path="/brandWindow">
            <BrandPage />
          </Route>
          <Route path="/lowPriceWindow">
            <LowPricePage />
          </Route>
          <Route path="/salesWindow">
            <SalesPage />
          </Route>
          <Route path="/orderWindow">
            <OrderPage />
          </Route>
          <Route path="/naverMainKeywordWindow">
            <NaverMainKeywordPage />
          </Route>
          <Route path="/amazonUploadWindow">
            <AmazonUploadPage />
          </Route>
          <Route path="/healthFoodWindow">
            <HealthFoodPage />
          </Route>
          <Route path="/healthFoodWindow">
            <HealthFoodPage />
          </Route>
          <Route>
            <BasicTemplates />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default rootRouter
