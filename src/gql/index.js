import { gql } from "@apollo/client"

export const AUTH_GOOGLE = gql`
  mutation AuthGoogle($input: AuthInput!) {
    authGoogle(input: $input) {
      _id
      adminUser
      nickname
      email
      avatar
      admin
      token
      grade
      error
    }
  }
`

export const ISLOGIN = gql`
  mutation isLogin {
    isLogin {
      _id
      adminUser
      nickname
      avatar
      email
      admin
      token
      grade
    }
  }
`

export const SEARCH_CATEGORY = gql`
  query SearchCategory($categoryID: String) {
    searchCategory(categoryID: $categoryID) {
      imageUrl
      productName
      openDate
      reviewCount
      purchaseCnt
      lowPrice
      dlvry
      price
      id
      mallName
      logo
      crUrl
      rank
      registered
    }
  }
`

export const SEARCH_KEYWORD = gql`
  query SearchKeyword($keyword: String) {
    searchKeyword(keyword: $keyword) {
      imageUrl
      productName
      openDate
      reviewCount
      purchaseCnt
      lowPrice
      dlvry
      price
      id
      mallName
      logo
      crUrl
      rank
      registered
    }
  }
`

export const SEARCH_TAOBAO_IMAGE = gql`
  query SearchTaobaoImage($imageUrl: String) {
    searchTaobaoImage(imageUrl: $imageUrl) {
      image
      detail
      title
      korTitle
      price
      dealCnt
      shop
      location
      korLocation
      registered
      # detailItem {
      #   imgs
      #   good_id
      #   option {
      #     name
      #     key
      #     image
      #     skuId
      #     stock
      #     price
      #   }
      # }
    }
  }
`

export const TAOBAO_LOGIN = gql`
  mutation TaobaoLogin($loginID: String!, $password: String!) {
    taobaoLogin(loginID: $loginID, password: $password)
  }
`

export const ONCE_TAOBAO_LOGIN = gql`
  mutation OnceTaobaoLogin {
    onceTaobaoLogin
  }
`

export const SEARCH_TAOBAO_DETAIL = gql`
  query SearchTaobaoDetail(
    $detailUrl: String!
    $title: String
    $naverID: String
    $naverCategoryCode: Int
    $naverCategoryName: String
  ) {
    searchTaobaoDetail(
      detailUrl: $detailUrl
      title: $title
      naverID: $naverID
      naverCategoryCode: $naverCategoryCode
      naverCategoryName: $naverCategoryName
    ) {
      id
      brand
      manufacture
      good_id
      title
      korTitle
      titleArray {
        word
        brand
        ban
        kipris
      }
      price
      salePrice
      keyword
      mainImages
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      options {
        key
        value
        korValue
        image
        price
        productPrice
        salePrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
          exposed
        }
      }
      attribute {
        key
        value
        korKey
        korValue
      }
      content
      topHtml
      clothesHtml
      isClothes
      shoesHtml
      isShoes
      optionHtml
      html
      bottomHtml
      categoryCode
      attributes {
        attributeTypeName
        attributeValueName
        required
        dataType
        basicUnit
        usableUnits
        groupNumber
        exposed
      }
      noticeCategories {
        noticeCategoryName
        noticeCategoryDetailNames {
          noticeCategoryDetailName
          required
          content
        }
      }
      requiredDocumentNames {
        templateName
        required
      }
      certifications {
        certificationType
        name
        dataType
        required
      }
      afterServiceInformation
      afterServiceContactNumber
      topImage
      bottomImage
      vendorId
      vendorUserId
      shipping {
        outboundShippingPlaceCode
        shippingPlaceName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
        remoteInfos {
          remoteInfoId
          deliveryCode
          jeju
          notJeju
          usable
        }
        deliveryCompanyCode
        deliveryChargeType
        deliveryCharge
        outboundShippingTimeDay
      }
      returnCenter {
        deliveryChargeOnReturn
        returnCharge
        returnCenterCode
        shippingPlaceName
        deliverCode
        deliverName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
      }
      invoiceDocument
      maximumBuyForPerson
      maximumBuyForPersonPeriod
      cafe24_mallID
      cafe24_shop_no
      naverCategoryCode
      keywords {
        keyword
        relatedKeyword {
          name
          count
        }
      }
    }
  }
`

export const CREATE_PRODUCT_DETAIL = gql`
  query CreateProductDetail(
    $_id: ID
    $naverID: String
    $naverCategoryCode: Int
    $naverCategoryName: String
  ) {
    CreateProductDetail(
      _id: $_id
      naverID: $naverID
      naverCategoryCode: $naverCategoryCode
      naverCategoryName: $naverCategoryName
    ) {
      id
      brand
      manufacture
      good_id
      title
      korTitle
      price
      salePrice
      keyword
      mainImages
      options {
        key
        value
        korValue
        image
        price
        productPrice
        salePrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
          exposed
        }
      }
      attribute {
        key
        value
        korKey
        korValue
      }
      content
      html
      categoryCode
      attributes {
        attributeTypeName
        attributeValueName
        required
        dataType
        basicUnit
        usableUnits
        groupNumber
        exposed
      }
      noticeCategories {
        noticeCategoryName
        noticeCategoryDetailNames {
          noticeCategoryDetailName
          required
          content
        }
      }
      requiredDocumentNames {
        templateName
        required
      }
      certifications {
        certificationType
        name
        dataType
        required
      }
      afterServiceInformation
      afterServiceContactNumber
      topImage
      clothesHtml
      isClothes
      shoesHtml
      isShoes
      bottomImage
      vendorId
      vendorUserId
      shipping {
        outboundShippingPlaceCode
        shippingPlaceName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
        remoteInfos {
          remoteInfoId
          deliveryCode
          jeju
          notJeju
          usable
        }
        deliveryCompanyCode
        deliveryChargeType
        deliveryCharge
        outboundShippingTimeDay
      }
      returnCenter {
        deliveryChargeOnReturn
        returnCharge
        returnCenterCode
        shippingPlaceName
        deliverCode
        deliverName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
      }
      invoiceDocument
      maximumBuyForPerson
      maximumBuyForPersonPeriod
      cafe24_mallID
      cafe24_shop_no
      naverCategoryCode
      keywords {
        keyword
        relatedKeyword {
          name
          count
        }
      }
    }
  }
`

export const COUPANG_RECOMMENDED_CATEGORY = gql`
  query CoupangRecommendedCategory($productName: String!) {
    CoupangRecommendedCategory(productName: $productName) {
      code
      message
      data {
        autoCategorizationPredictionResultType
        predictedCategoryId
        predictedCategoryName
        comment
      }
    }
  }
`

export const MARKET_BASIC_IFNO = gql`
  query MarketBasicInfo {
    MarketBasicInfo {
      taobao {
        loginID
        password
        imageKey
      }
      coupang {
        vendorUserId
        vendorId
        accessKey
        secretKey
        deliveryCompanyCode
        deliveryChargeType
        deliveryCharge
        deliveryChargeOnReturn
        returnCharge
        outbound {
          outboundShippingPlaceCode
          shippingPlaceName
          placeAddresses {
            addressType
            countryCode
            companyContactNumber
            phoneNumber2
            returnZipCode
            returnAddress
            returnAddressDetail
          }
          remoteInfos {
            remoteInfoId
            deliveryCode
            jeju
            notJeju
            usable
          }
        }
        returnShippingCenter {
          returnCenterCode
          shippingPlaceName
          deliverCode
          deliverName
          placeAddresses {
            addressType
            countryCode
            companyContactNumber
            phoneNumber2
            returnZipCode
            returnAddress
            returnAddressDetail
          }
        }
        outboundShippingTimeDay
        invoiceDocument
        maximumBuyForPerson
        maximumBuyForPersonPeriod
      }
      cafe24 {
        mallID
        shop_no
        password
      }
      interpark {
        userID
        password
      }
    }
  }
`

export const PRODUCT_DETAIL = gql`
  query ProductDetail($productID: ID!) {
    ProductDetail(productID: $productID) {
      id
      brand
      manufacture
      good_id
      title
      korTitle
      titleArray {
        word
        brand
        ban
        kipris
      }
      price
      salePrice
      mainImages
      options {
        key
        value
        korKey
        korValue
        image
        price
        productPrice
        salePrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
          exposed
        }
        cafe24_variant_code
        coupang_sellerProductItemId
        coupang_vendorItemId
      }
      attribute {
        key
        value
        korKey
        korValue
      }
      content
      topHtml
      clothesHtml
      isClothes
      shoesHtml
      isShoes
      optionHtml
      html
      bottomHtml
      keyword
      categoryCode
      attributes {
        attributeTypeName
        attributeValueName
        required
        dataType
        basicUnit
        usableUnits
        groupNumber
        exposed
      }
      noticeCategories {
        noticeCategoryName
        noticeCategoryDetailNames {
          noticeCategoryDetailName
          required
          content
        }
      }
      requiredDocumentNames {
        templateName
        required
      }
      certifications {
        certificationType
        name
        dataType
        required
      }
      afterServiceInformation
      afterServiceContactNumber
      topImage
      bottomImage
      vendorId
      vendorUserId
      shipping {
        outboundShippingPlaceCode
        shippingPlaceName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
        remoteInfos {
          remoteInfoId
          deliveryCode
          jeju
          notJeju
          usable
        }
        deliveryCompanyCode
        deliveryChargeType
        deliveryCharge
        outboundShippingTimeDay
      }
      returnCenter {
        deliveryChargeOnReturn
        returnCharge
        returnCenterCode
        shippingPlaceName
        deliverCode
        deliverName
        placeAddresses {
          addressType
          countryCode
          companyContactNumber
          phoneNumber2
          returnZipCode
          returnAddress
          returnAddressDetail
        }
      }
      invoiceDocument
      maximumBuyForPerson
      maximumBuyForPersonPeriod
      cafe24_mallID
      cafe24_shop_no
      cafe24_product_no
      cafe24_mainImage
      coupang_productID
      naverCategoryCode
      keywords {
        keyword
        relatedKeyword {
          name
          count
        }
      }
      exchange
      shippingFee
      profit
      discount
      fees
    }
  }
`

export const BASIC_IFNO = gql`
  query BasicInfo {
    BasicInfo {
      afterServiceInformation
      afterServiceContactNumber
      topImage
      clothImage
      shoesImage
      bottomImage
      kiprisInter
    }
  }
`

export const SET_TAOBAO_BASIC_INFO = gql`
  mutation SetTaobaoBasicInfo($loginID: String!, $password: String!, $imageKey: String) {
    SetTaobaoBasicInfo(loginID: $loginID, password: $password, imageKey: $imageKey)
  }
`

export const SET_COUPANG_BASIC_INFO = gql`
  mutation SetCoupangBasicInfo(
    $vendorUserId: String!
    $vendorId: String!
    $accessKey: String!
    $secretKey: String!
    $deliveryCompanyCode: String!
    $deliveryChargeType: String!
    $deliveryCharge: Int
    $deliveryChargeOnReturn: Int
    $returnCharge: Int
    $outboundShippingTimeDay: Int
    $invoiceDocument: String
    $maximumBuyForPerson: Int
    $maximumBuyForPersonPeriod: Int
  ) {
    SetCoupangBasicInfo(
      vendorUserId: $vendorUserId
      vendorId: $vendorId
      accessKey: $accessKey
      secretKey: $secretKey
      deliveryCompanyCode: $deliveryCompanyCode
      deliveryChargeType: $deliveryChargeType
      deliveryCharge: $deliveryCharge
      deliveryChargeOnReturn: $deliveryChargeOnReturn
      returnCharge: $returnCharge
      outboundShippingTimeDay: $outboundShippingTimeDay
      invoiceDocument: $invoiceDocument
      maximumBuyForPerson: $maximumBuyForPerson
      maximumBuyForPersonPeriod: $maximumBuyForPersonPeriod
    )
  }
`
export const SET_CAFE24_BASIC_INFO = gql`
  mutation SetCafe24BasicInfo($mallID: String, $password: String, $shop_no: Int) {
    SetCafe24BasicInfo(mallID: $mallID, password: $password, shop_no: $shop_no)
  }
`

export const SET_INTERPARK_BASIC_INFO = gql`
  mutation SetInterParkBasicInfo($userID: String, $password: String) {
    SetInterParkBasicInfo(userID: $userID, password: $password)
  }
`

export const SET_BASIC_INFO = gql`
  mutation SetBasicInfo(
    $afterServiceInformation: String!
    $afterServiceContactNumber: String!
    $topImage: String
    $bottomImage: String
    $clothImage: String
    $shoesImage: String
    $kiprisInter: Boolean
  ) {
    SetBasicInfo(
      afterServiceInformation: $afterServiceInformation
      afterServiceContactNumber: $afterServiceContactNumber
      topImage: $topImage
      bottomImage: $bottomImage
      clothImage: $clothImage
      shoesImage: $shoesImage
      kiprisInter: $kiprisInter
    )
  }
`

export const COUPANG_OUTBOUND = gql`
  query CoupangOutbound {
    CoupangOutbound
  }
`

export const COUPANG_CATEGORY_META = gql`
  query CoupangCategoryMeta($categoryCode: String) {
    CoupangCategoryMeta(categoryCode: $categoryCode) {
      code
      message
      data {
        isAllowSingleItem
        attributes {
          attributeTypeName
          required
          dataType
          basicUnit
          usableUnits
          groupNumber
          exposed
        }
        noticeCategories {
          noticeCategoryName
          noticeCategoryDetailNames {
            noticeCategoryDetailName
            required
          }
        }
        requiredDocumentNames {
          templateName
          required
        }
        certifications {
          certificationType
          name
          dataType
          required
        }
        allowedOfferConditions
      }
    }
  }
`

export const GET_COUPANG_CATEGORY_META = gql`
  mutation GetCoupangCategoryMeta($categoryCode: String) {
    GetCoupangCategoryMeta(categoryCode: $categoryCode) {
      code
      message
      data {
        isAllowSingleItem
        attributes {
          attributeTypeName
          required
          dataType
          basicUnit
          usableUnits
          groupNumber
          exposed
        }
        noticeCategories {
          noticeCategoryName
          noticeCategoryDetailNames {
            noticeCategoryDetailName
            required
          }
        }
        requiredDocumentNames {
          templateName
          required
        }
        certifications {
          certificationType
          name
          dataType
          required
        }
        allowedOfferConditions
      }
    }
  }
`

export const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $id: ID!
    $product: Product
    $cafe24: Cafe24ProductInputType
    $options: [ProductOptions]
    $coupang: CoupangProductInputType
  ) {
    CreateProduct(
      id: $id
      product: $product
      options: $options
      coupang: $coupang
      cafe24: $cafe24
    ) {
      coupang {
        code
        message
      }
      cafe24 {
        code
        message
      }
    }
  }
`

export const CREATE_COUPANG = gql`
  mutation CreateCoupang(
    $id: ID!
    $product: Product
    $options: [ProductOptions]
    $coupang: CoupangProductInputType
  ) {
    CreateCoupang(id: $id, product: $product, options: $options, coupang: $coupang) {
      coupang {
        code
        message
      }
    }
  }
`

export const CREATE_CAFE24 = gql`
  mutation CreateCafe24(
    $id: ID!
    $product: Product
    $cafe24: Cafe24ProductInputType
    $options: [ProductOptions]
  ) {
    CreateCafe24(id: $id, product: $product, options: $options, cafe24: $cafe24) {
      cafe24 {
        code
        message
      }
    }
  }
`

export const GET_PRODUCT_LIST = gql`
  mutation GetPorductList(
    $page: Int
    $perPage: Int
    $search: String
    $startDate: String
    $endDate: String
    $userID: ID
    $notSales: Boolean
  ) {
    ProductList(
      page: $page
      perPage: $perPage
      search: $search
      startDate: $startDate
      endDate: $endDate
      userID: $userID
      notSales: $notSales
    ) {
      count
      list {
        _id
        naverID
        url
        title
        korTitle
        titleArray {
          word
          brand
          ban
          kipris
        }
        attribute {
          korKey
          korValue
        }
        weightPrice
        weight
        isWinner
        isNaver
        isCoupang
        naverCategoryName
        mainImage
        mainImages
        createdAt
        user {
          _id
          email
          nickname
          avatar
        }
        cafe24 {
          mallID
          shop_no
          product_no
          product_code
          custom_product_code
        }
        coupang {
          productID
          status
          displayCategoryCode
          displayCategoryName
        }
        options {
          key
          value
          korValue
          propPath
          image
          price
          productPrice
          salePrice
          stock
          disabled
          active
          base
          cafe24_variant_code
          coupang_sellerProductItemId
          coupang_vendorItemId
          coupang_itemId
        }
        content
      }
    }
  }
`

export const GET_TAOBAO_FAVORITE_LIST = gql`
  query GetTaobaoFAvoriteList(
    $page: Int
    $perPage: Int
    $search: String
    $startDate: String
    $endDate: String
  ) {
    TaobaoFavoriteList(
      page: $page
      perPage: $perPage
      search: $search
      startDate: $startDate
      endDate: $endDate
    ) {
      count
      list {
        _id
        url
        korTitle
        mainImage
        createdAt
      }
    }
  }
`

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($coupangID: String, $cafe24ID: Int, $mallID: String) {
    DeleteProduct(coupangID: $coupangID, cafe24ID: $cafe24ID, mallID: $mallID)
  }
`
export const DELETE_COUPANG = gql`
  mutation DeleteCoupang($coupangID: String) {
    DeleteCoupang(coupangID: $coupangID)
  }
`
export const DELETE_CAFE24 = gql`
  mutation DeleteCafe24($cafe24ID: Int, $mallID: String) {
    DeleteCafe24(cafe24ID: $cafe24ID, mallID: $mallID)
  }
`

export const FIND_SHIPPING_FEE = gql`
  query FindShippingFee($mallName: String, $crUrl: String) {
    FindShippingFee(mallName: $mallName, crUrl: $crUrl)
  }
`

export const RELATED_KEYWORDS_ONLY = gql`
  query RelatedKeywordsOnly($keywords: [String]) {
    RelatedKeywordsOnly(keywords: $keywords) {
      keyword
      relatedKeyword
    }
  }
`

export const GET_KEYWORD_VIEWS = gql`
  query GetKeywordViews($keywords: [String]) {
    GetKeywordViews(keywords: $keywords) {
      keyword
      item_num
      mpcqry
      mmoqry
      total
      compete
    }
  }
`

export const RELATED_KEYWORD = gql`
  mutation RelatedKeyword($keyword: String) {
    RelatedKeyword(keyword: $keyword) {
      keyword
      item_num
      mpcqry
      mmoqry
      total
      compete
    }
  }
`

export const SENTIMENT_RANK = gql`
  mutation SentimentRank($keyword: String) {
    SentimentRank(keyword: $keyword) {
      keyword
      item_num
      mpcqry
      mmoqry
      total
      compete
    }
  }
`

export const SENTIMENT_RANK_ONLY = gql`
  mutation SentimentRank($keyword: String) {
    SentimentRankOnly(keyword: $keyword)
  }
`

export const GET_CATEGORY_KEYWORDS = gql`
  query GetCategoryKeywords($category: String) {
    GetCategoryKeywords(category: $category) {
      rank
      keyword
      pc
      mobile
      total
      product
      compete
      pcrate
      mobilerate
      adclickrate
      adsclicks
    }
  }
`

export const SEARCH_TAOBAO_KEYWORD = gql`
  query searchTaobaoKeyword($keyword: String) {
    searchTaobaoKeyword(keyword: $keyword) {
      image
      detail
      title
      korTitle
      price
      dealCnt
      shop
      location
      korLocation
      detailItem {
        imgs
        good_id
        option {
          name
          key
          korName
          image
          skuId
          stock
          price
        }
      }
      registered
    }
  }
`

export const RELATED_KEYWORD_ONLY = gql`
  query RelatedKeywordOnly($keyword: String) {
    RelatedKeywordOnly(keyword: $keyword)
  }
`

export const MUTATION_RELATED_KEYWORD_ONLY = gql`
  mutation RelatedKeywordOnly($keyword: String) {
    RelatedKeywordOnly(keyword: $keyword)
  }
`
export const PRODUCT_COUNT_DAILY = gql`
  query ProductCountDaily($userID: ID) {
    ProductCountDaily(userID: $userID) {
      year
      month
      day
      count
      subTotal
      user {
        _id
        email
        nickname
        avatar
      }
    }
  }
`

export const SEARCH_TITLE = gql`
  mutation searchTitle($keyword: String) {
    searchTitle(keyword: $keyword) {
      name
      count
    }
  }
`

export const SEARCH_TITLE_KEYWRODS = gql`
  query searchTitleWithKeyword($keywords: [String]) {
    searchTitleWithKeyword(keywords: $keywords) {
      keyword
      relatedKeyword {
        name
        count
      }
    }
  }
`
export const DELETE_FAVORITE_ITEM = gql`
  mutation DeleteFavoriteItem($id: ID!) {
    DeleteFavoriteItem(id: $id)
  }
`

export const GET_COUPANG_STORE = gql`
  mutation GetCoupangStore($url: String, $sort: String) {
    GetCoupangStore(url: $url, sort: $sort) {
      productID
      title
      image
      delivery
      salePrice
      detail
      registered
    }
  }
`

export const GET_NAVER_BEST = gql`
  query GetNaverBest {
    GetNaverBest {
      mallNo
      mallName
      title
      detail
      price
      shippingfee
      image
      productID
      category1
      category2
      category3
      category4
      lastUpdate
      registered
    }
  }
`

export const GET_NAVER_FLASH_ITEM = gql`
  query {
    GetNaverFlashItem {
      _id
      mallNo
      mallName
      title
      detail
      price
      shippingfee
      image
      productID
      category1
      category2
      category3
      category4
      registered
      otherImage
      isTaobao
      taobaoItem {
        _id
        index
        itemID
        createdAt
        detail
        image
        price
      }
    }
  }
`

export const GET_VAVER_FLASH_DETAIL = gql`
  query GetNaverFlashDetail($itemID: ID, $detail: String) {
    GetNaverFlashDetail(itemID: $itemID, detail: $detail) {
      _id
      registered
      mainImages
      korTitle
      options {
        image
        korValue
        price
        disabled
        active
      }
    }
  }
`

export const DELETE_FAVORITE_ALL_ITEM = gql`
  mutation DeleteFavoriteAllItem {
    DeleteFavoriteAllItem
  }
`

export const GET_KEYWORD = gql`
  query GetKeyword($keyword: String) {
    GetKeyword(keyword: $keyword) {
      keyword
      item_num
      mmoqry
      mpcqry
      total
      compete
    }
  }
`

export const SET_ISTAOBAO_ITEM = gql`
  mutation SetIsTaobaoItem($id: ID!) {
    SetisTaobaoItem(id: $id)
  }
`

export const CAFE24_AUTO = gql`
  mutation Care24Auto {
    Cafe24Auto
  }
`

export const CAFE24_TOKEN = gql`
  mutation Care24Token {
    Cafe24Token
  }
`

export const INTERPARK_AUTO = gql`
  mutation InterparkAuto {
    InterparkAuto
  }
`

export const VATLIST = gql`
  mutation VatList($startDate: String, $endDate: String, $search: String, $userID: ID) {
    VatListType(startDate: $startDate, endDate: $endDate, search: $search, userID: $userID) {
      market
      orderId
      orderer {
        name
        email
        telNumber
        hpNumber
        orderDate
        orderTime
      }
      paidAtDate
      paidAtTime
      shippingPrice
      receiver {
        name
        tellNumber
        hpNumber
        addr
        postCode
        parcelPrintMessage
      }
      orderItems {
        image
        title
        option
        quantity
        salesPrice
        orderPrice
        discountPrice
        sellerProductName
        productId
        vendorItemId
      }
      overseaShippingInfoDto {
        personalCustomsClearanceCode
        ordererPhoneNumber
        ordererName
      }
      saleType
      deliveryItem {
        orderNo
        status
        recipientName
        recipientPostNum
        recipientAddress
        recipientPhoneNumber
        personalCustomsClearanceCode
        weight
        shipFee
        shippingNumber
        deliveryCompanyName
        customs {
          processingStage
          processingDate
          processingTime
        }
        deliveryTracking {
          stage
          processingDate
          processingTime
          status
          store
        }
        taobaoItem {
          orderNumber
          orderDate
          orderTime
          orders {
            id
            productName
            thumbnail
            detail
            skuId
            option {
              name
              value
              visible
            }
            originalPrice
            realPrice
            quantity
          }
          purchaseAmount
          shippingFee
          shippingStatus
          express {
            expressName
            expressId
            address {
              place
              time
            }
          }
        }
        exchange {
          usdPrice
          cnyPrice
        }
      }
    }
  }
`

export const GET_DELIVERY_IMAGE = gql`
  mutation GetDeliveryImage($shippingNumber: String, $type: String) {
    GetDeliveryImage(shippingNumber: $shippingNumber, type: $type)
  }
`

export const GET_COOKIE = gql`
  query GetCookie {
    GetCookie
  }
`

export const SET_COOKIE = gql`
  mutation SetCookie($cookie: String) {
    SetCookie(cookie: $cookie)
  }
`

export const GET_COUPANG_ITEM_LIST = gql`
  query GetCoupangItemList($url: String) {
    GetCoupangItemList(url: $url) {
      _id
      productId
      vendorName
      vendorID
      ratingCount
      ratingAveragePercentage
      otherSellerCount
      detail
      mainImages
      options {
        optionKey1
        optionTitle1
        optionKey2
        optionTitle2
        title
        price
        shippingFee
        image
        deliveryDay
        active
      }
      title
      titleArray {
        word
        brand
        ban
        kipris
      }
      taobaoItems {
        _id
        index
        itemID
        commentCount
        dealCnt
        detail
        image
        isTmail
        location
        price
        shop
        shopGrade {
          description
          service
          delivery
        }
        shopLevel
      }
    }
  }
`

export const GET_NAVER_STORE_ITEM_LIST = gql`
  mutation GetNaverStoreItemList($url: String) {
    GetNaverStoreItemList(url: $url) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`
export const GET_NAVER_KEYWORD_ITEM_LIST = gql`
  mutation GetNaverKeywordItemList($keyword: String) {
    GetNaverKeywordItemList(keyword: $keyword) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`
export const GET_COUPANGE_STORE_ITEM_LIST = gql`
  mutation GetCoupangStoreItemListNew($url: String) {
    GetCoupangStoreItemListNew(url: $url) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`

export const GET_NAVER_RECOMMEND_ITEM_LIST = gql`
  mutation GetNaverRecommendItemList(
    $limit: Int
    $category: String
    $regDay: Int
    $minRecent: Int
    $maxRecent: Int
    $totalMinSale: Int
    $totalMaxSale: Int
    $minReview: Int
    $maxReview: Int
    $minPrice: Int
    $maxPrice: Int
  ) {
    GetNaverRecommendItemList(
      limit: $limit
      category: $category
      regDay: $regDay
      minRecent: $minRecent
      maxRecent: $maxRecent
      totalMinSale: $totalMinSale
      totalMaxSale: $totalMaxSale
      minReview: $minReview
      maxReview: $maxReview
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`

export const GET_NAER_SAVED_ITEM_LIST = gql`
  mutation GetNaverSavedItemList(
    $limit: Int
    $category: String
    $regDay: Int
    $minRecent: Int
    $maxRecent: Int
    $totalMinSale: Int
    $totalMaxSale: Int
    $minReview: Int
    $maxReview: Int
    $minPrice: Int
    $maxPrice: Int
  ) {
    GetNaverSavedItemList(
      limit: $limit
      category: $category
      regDay: $regDay
      minRecent: $minRecent
      maxRecent: $maxRecent
      totalMinSale: $totalMinSale
      totalMaxSale: $totalMaxSale
      minReview: $minReview
      maxReview: $maxReview
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`

export const GET_NAVER_FAVORITE_RECOMMEND_ITEM_LIST = gql`
  mutation GetNaverFavoriteRecommendItemList($url: String) {
    GetNaverFavoriteRecommendItemList(url: $url) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      titleArray {
        word
        brand
        ban
        kipris
      }
      isRegister
    }
  }
`

export const GET_COUPANG_STORE_ITEM_LIST = gql`
  mutation GetCouapngStoreItemList($url: String) {
    GetCoupangStoreItemList(url: $url) {
      count
      list {
        productId
        vendorName
        vendorID
        ratingCount
        ratingAveragePercentage
        otherSellerCount
        detail
        mainImages
        options {
          optionKey1
          optionTitle1
          optionKey2
          optionTitle2
          title
          price
          shippingFee
          image
          deliveryDay
          active
        }
        title
        titleArray {
          word
          brand
          ban
          kipris
        }
        isRegister
      }
    }
  }
`

export const GET_COUPANG_KEYWORD_ITEM_LIST = gql`
  mutation GetCoupangKeywordItemList($keyword: String) {
    GetCoupangKeywordItemList(keyword: $keyword) {
      count
      list {
        productId
        vendorName
        vendorID
        ratingCount
        ratingAveragePercentage
        otherSellerCount
        detail
        mainImages
        options {
          optionKey1
          optionTitle1
          optionKey2
          optionTitle2
          title
          price
          shippingFee
          image
          deliveryDay
          active
        }
        title
        titleArray {
          word
          brand
          ban
          kipris
        }
        isRegister
      }
    }
  }
`

export const GET_COUPANG_ITEM_LIST1 = gql`
  query GetCoupangItemList1($url: String) {
    GetCoupangItemList1(url: $url) {
      _id
      productId
      vendorName
      vendorID
      ratingCount
      ratingAveragePercentage
      otherSellerCount
      detail
      mainImages
      options {
        optionKey1
        optionTitle1
        optionKey2
        optionTitle2
        title
        price
        shippingFee
        image
        deliveryDay
        active
      }
      title
      titleArray {
        word
        brand
        ban
        kipris
      }
      taobaoItems {
        _id
        index
        itemID
        commentCount
        dealCnt
        detail
        image
        isTmail
        location
        price
        shop
        shopGrade {
          description
          service
          delivery
        }
        shopLevel
      }
    }
  }
`

export const TAOBAO_IMAGE_LIST_URL = gql`
  mutation TaobaoImageListUrl($imageUrl: String) {
    TaobaoImageListUrl(imageUrl: $imageUrl) {
      url
      list {
        pic_path
        title
        price
        sold
        totalSold
        commentCount
        iconList
        auctionURL
      }
    }
  }
`

export const UPLOAD_ITEM_WINNER = gql`
  mutation UploadItemWinner(
    $_id: ID
    $coupangID: ID
    $title: String
    $detailUrl: String
    $subPrice: Int
    $isClothes: Boolean
    $isShoes: Boolean
    $userID: ID
  ) {
    UploadItemWinner(
      _id: $_id
      coupangID: $coupangID
      title: $title
      detailUrl: $detailUrl
      subPrice: $subPrice
      isClothes: $isClothes
      isShoes: $isShoes
      userID: $userID
    )
  }
`

export const UPLOAD_NAVER_ITEM_WINNER = gql`
  mutation UploadNaverItemWinner($input: [WinnerItemType]) {
    UploadNaverItemWinner(input: $input)
  }
`

export const UPLOAD_ITEM_WINNER1 = gql`
  mutation UploadItemWinner1(
    $_id: ID
    $coupangID: ID
    $title: String
    $detailUrl: String
    $subPrice: Int
    $isClothes: Boolean
    $isShoes: Boolean
  ) {
    UploadItemWinner1(
      _id: $_id
      coupangID: $coupangID
      title: $title
      detailUrl: $detailUrl
      subPrice: $subPrice
      isClothes: $isClothes
      isShoes: $isShoes
    )
  }
`

export const GET_BRAND_LIST = gql`
  query GetBrandList {
    GetBrandList {
      brand {
        _id
        word
      }
      banWord {
        _id
        word
      }
      prohibit {
        _id
        word
      }
    }
  }
`

export const UPDATE_BANWORD = gql`
  mutation UpdateBanWord($_id: ID, $word: String) {
    UpdateBanWord(_id: $_id, word: $word)
  }
`

export const DELETE_BANWORD = gql`
  mutation DeleteBanWord($_id: ID) {
    DeleteBanWord(_id: $_id)
  }
`

export const GET_ITEMWINNER_PROCESSING_LIST = gql`
  query GetItemWinnerProcessingList($userID: ID) {
    GetItemWinnerProcessingList(userID: $userID) {
      _id
      kind
      state
      createdAt
      lastUpdate
      taobaoUrl
      title
      error
      mainImges
      coupangUrl
      options {
        optionKey1
        optionTitle1
        optionKey2
        optionTitle2
        title
        price
        shippingFee
        image
        deliveryDay
        active
      }
      user {
        _id
        email
        nickname
        avatar
      }
    }
  }
`

export const GET_ACCOUNT_LIST = gql`
  query GetAccountList {
    getAccountList {
      email
      nickname
    }
  }
`

export const ADD_ACCOUNT = gql`
  mutation AddAccount($email: String) {
    addAccount(email: $email)
  }
`

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount($email: String) {
    deleteAccount(email: $email)
  }
`

export const TRANSLATE_PAPAGO = gql`
  query TranslatePapago($text: String) {
    TranslatePapago(text: $text)
  }
`

export const BATCH_TAOBAO_ITEM = gql`
  mutation BatchTaobaoItem($input: [TaobaoBatchInputType]) {
    BatchTaobaoItem(input: $input)
  }
`

export const GET_COUPANG_MALL_LIST = gql`
  query GetCoupangMallList {
    GetCoupangMallList {
      _id
      mallPcUrl
      marketName
      businessName
      representativeName
      isFavorite
    }
  }
`

export const GET_NAVER_MALL_LIST = gql`
  query GetNaverMallList {
    GetNaverMallList {
      _id
      mallPcUrl
      marketName
      businessName
      representativeName
      isFavorite
    }
  }
`

export const GET_COUPANG_MALL_FAVORITE_LIST = gql`
  query GetCoupangMallFavoriteList {
    GetCoupangMallFavoriteList {
      _id
      mallPcUrl
      marketName
      businessName
      representativeName
      isFavorite
    }
  }
`
export const GET_NAVER_MALL_FAVORITE_LIST = gql`
  query GetNaverMallFavoriteList {
    GetNaverMallFavoriteList {
      _id
      mallPcUrl
      marketName
      businessName
      representativeName
      isFavorite
    }
  }
`

export const SET_COUPANG_FAVORITE = gql`
  mutation SetCoupangFavorite($_id: ID) {
    SetCoupangFavorite(_id: $_id)
  }
`
export const SET_NAVER_FAVORITE = gql`
  mutation SetNaverFavorite($_id: ID) {
    SetNaverFavorite(_id: $_id)
  }
`

export const UPLOAD_ITEM_WINNER_LIST = gql`
  mutation UploadItemWinnerList($input: [CoupangWinnerInputType]) {
    UploadItemWinnerList(input: $input)
  }
`

export const UPLOAD_ITEM_COUPANG_LIST = gql`
  mutation UploadItemCoupangList($input: [NaverItmeInputType]) {
    UploadItemCoupangList(input: $input)
  }
`

export const UPLOAD_ITEM_NAVER_LIST = gql`
  mutation UploadItemNaverList($input: [NaverItmeInputType]) {
    UploadItemNaverList(input: $input)
  }
`

export const VAT_SEARCH = gql`
  mutation VatSearch($userID: ID) {
    VatSearch(userID: $userID)
  }
`

export const GET_SUBPRICE = gql`
  mutation GetSubPrice {
    GetSubPrice
  }
`

export const SET_SUBPRICE = gql`
  mutation SetSubPrice($subPrice: Int) {
    SetSubPrice(subPrice: $subPrice)
  }
`

export const GET_ADDPRICE_LIST = gql`
  query GetAddPriceList {
    GetAddPriceList {
      _id
      title
      price
    }
  }
`
export const GET_IHERB_ADDPRICE_LIST = gql`
  query GetIherbAddPriceList {
    GetIherbAddPriceList {
      _id
      title
      price
    }
  }
`
export const GET_ALI_ADDPRICE_LIST = gql`
  query GetAliAddPriceList {
    GetAliAddPriceList {
      _id
      title
      price
    }
  }
`
export const GET_AMAZON_JP_ADDPRICE_LIST = gql`
  query GetAmazonJPAddPriceList {
    GetAmazonJPAddPriceList {
      _id
      title
      price
    }
  }
`

export const SET_ADDPRICE = gql`
  mutation SetAddPrice($_id: ID, $title: Float, $price: Float) {
    SetAddPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_IHERB_ADDPRICE = gql`
  mutation SetIherbAddPrice($_id: ID, $title: Float, $price: Float) {
    SetIherbAddPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_ALI_ADDPRICE = gql`
  mutation SetAliAddPrice($_id: ID, $title: Float, $price: Float) {
    SetAliAddPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_AMAZON_JP_ADDPRICE = gql`
  mutation SetAmazonJPAddPrice($_id: ID, $title: Float, $price: Float) {
    SetAmazonJPAddPrice(_id: $_id, title: $title, price: $price)
  }
`

export const DELETE_ADDPRICE = gql`
  mutation DeleteAddPrice($_id: ID) {
    DeleteAddPrice(_id: $_id)
  }
`

export const GET_SHIPPINGPRICE_LIST = gql`
  query GetShippingPriceList {
    GetShippingPriceList {
      _id
      title
      price
    }
  }
`

export const GET_IHERB_SHIPPINGPRICE_LIST = gql`
  query GetIherbShippingPriceList {
    GetIherbShippingPriceList {
      _id
      title
      price
    }
  }
`
export const GET_ALI_SHIPPINGPRICE_LIST = gql`
  query GetAliShippingPriceList {
    GetAliShippingPriceList {
      _id
      title
      price
    }
  }
`
export const GET_AMAZON_JP_SHIPPINGPRICE_LIST = gql`
  query GetAmazonJPShippingPriceList {
    GetAmazonJPShippingPriceList {
      _id
      title
      price
    }
  }
`

export const GET_SHIPPINGPRICE = gql`
  mutation GetShippingPrice ($userID: ID) {
    GetShippingPrice(userID: $userID) {
      _id
      title
      price
    }
  }
`
export const GET_USA_SHIPPINGPRICE = gql`
  mutation GetUSAShippingPrice($userID: ID)  {
    GetUSAShippingPrice (userID: $userID){
      _id
      title
      price
    }
  }
`

export const SET_SHIPPINGPRICE = gql`
  mutation SetShippingPrice($_id: ID, $title: Float, $price: Float) {
    SetShippingPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_IHERB_SHIPPINGPRICE = gql`
  mutation SetIherbShippingPrice($_id: ID, $title: Float, $price: Float) {
    SetIherbShippingPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_ALI_SHIPPINGPRICE = gql`
  mutation SetAliShippingPrice($_id: ID, $title: Float, $price: Float) {
    SetAliShippingPrice(_id: $_id, title: $title, price: $price)
  }
`
export const SET_AMAZON_JP_SHIPPINGPRICE = gql`
  mutation SetAmazonJPShippingPrice($_id: ID, $title: Float, $price: Float) {
    SetAmazonJPShippingPrice(_id: $_id, title: $title, price: $price)
  }
`

export const DELETE_SHIPPINGPRICE = gql`
  mutation DeleteShippingPrice($_id: ID) {
    DeleteShippingPrice(_id: $_id)
  }
`

export const GET_MARGIN = gql`
  query GetMargin {
    GetMargin
  }
`

export const SET_MARGIN = gql`
  mutation SetMargin($margin: Float) {
    SetMargin(margin: $margin)
  }
`

export const GET_COUPANG_PRODUCT_LIST = gql`
  mutation GetCoupangProductList {
    GetCoupangProductList
  }
`

export const GET_LOWESTPRICE_LIST = gql`
  query GetLowestPriceList(
    $page: Int
    $perPage: Int
    $search: String
    $notWinner: Boolean
    $isNaver: Boolean
    $isWinner: Boolean
    $isExcept: Boolean
    $isManage: Boolean
  ) {
    GetLowestPriceList(
      page: $page
      perPage: $perPage
      search: $search
      isNaver: $isNaver
      notWinner: $notWinner
      isWinner: $isWinner
      isExcept: $isExcept
      isManage: $isManage
    ) {
      count
      list {
        _id
        sellerProductId
        sellerProductName
        user {
          _id
          email
          nickname
          avatar
        }
        sourcingType
        isExcept
        items {
          _id
          isManage
          sellerProductItemId
          vendorItemId
          itemId
          itemName
          originalPrice
          salePrice
          costPrice
          minPrice
          margin
          cdnPath
          status
          otherSeller {
            _id
            vendorName
            vendorItemId
            price
          }
        }
      }
    }
  }
`

export const SET_LOWPRICE_MANAGE = gql`
  mutation SetLowPriceManage($input: [LowPriceManageType]) {
    SetLowPriceManage(input: $input)
  }
`

export const DELETE_PROCESS_ITEM = gql`
  mutation DeleteProcessItem($_id: ID, $userID: ID) {
    DeleteProcessItem(_id: $_id, userID: $userID)
  }
`

export const EXCEPT_PRODUCT = gql`
  mutation ExceptProduct($_id: ID, $isExcept: Boolean) {
    ExceptProduct(_id: $_id, isExcept: $isExcept)
  }
`

export const AUTO_PRICE_MANAGE = gql`
  mutation AutoPriceManage {
    AutoPriceManage
  }
`

export const DUPLICATE_PRODUCT_LIST = gql`
  mutation DuplicateProductList {
    DuplicateProductList
  }
`
export const NAVERSHOPPING_UPLOAD = gql`
  mutation NaverShoppingUpload {
    NaverShoppingUpload
  }
`
export const CAFE24_SYNC = gql`
  mutation Cafe24Sync {
    Cafe24Sync
  }
`

export const GET_KIPRISWORD = gql`
  mutation GetKiprisWord($search: String) {
    GetKiprisWord(search: $search) {
      search
      title
      result
    }
  }
`

export const TAOBAO_ORDER_BATCH = gql`
  mutation TaobaoOrderBatch($userID: ID) {
    TaobaoOrderBatch(userID: $userID)
  }
`
export const TABAE_ORDER_BATCH = gql`
  mutation TabaeOrderBatch($userID: ID) {
    TabaeOrderBatch(userID: $userID)
  }
`

export const NEW_TABAE_ORDER_BATCH = gql`
  mutation NewTabaeOrderBatch($userID: ID) {
    NewTabaeOrderBatch(userID: $userID)
  }
`

export const SALES_CLENDAR = gql`
  query SalesClendar($date: String, $userID: ID) {
    SalesClendar(date: $date, userID: $userID) {
      orderPriceAmount
      orderPriceCount
      discountPriceAmount
      discountPriceCount
      shippingFee
      shippingCount
      cancelPriceAmount
      cancelPriceCount
      returnPriceAmount
      returnPriceCount
    }
  }
`

export const SALES_MONTH_CLENDAR = gql`
  query SalesMonthClendar($date: String, $userID: ID) {
    SalesMonthClendar(date: $date, userID: $userID) {
      orderPriceAmount
      orderPriceCount
      discountPriceAmount
      discountPriceCount
      shippingFee
      shippingCount
      cancelPriceAmount
      cancelPriceCount
      returnPriceAmount
      returnPriceCount
    }
  }
`

export const LIST_ALL_ORDER = gql`
  query ListAllOrders($orderState: String, $userID: ID) {
    ListAllOrders(orderState: $orderState, userID: $userID) {
      order_id
      market_id
      market_order_info
      orderSeq
      delivery_id
      buyer_name
      buyer_phone
      paid
      order_date
      order_price_amount
      cancel_date
      valid_number {
        name
        persEcm
        phone
        checkUnipass
      }
      buyer {
        name
        phone
      }
      receiver {
        name
        phone
        zipcode
        address1
        address2
        address_full
        shipping_message
        clearance_information
      }
      items {
        productID
        order_item_code
        url
        item_no
        quantity
        custom_product_code
        option_value
        isMatch
        korValue
        value
        product_name
        product_price
        status_text
        image
        sellerProductItemId
        vendorItemId
        itemId
        taobaoOrderNumber
        category
      }
      shipping {
        shippingNumber
        deliveryCompanyName
        shipping_code
      }
      createdAt
      orderCount
    }
  }
`

export const GET_TAOBAOITEM = gql`
  mutation GetTaobaoItem($orderNumber: String) {
    GetTaobaoItem(orderNumber: $orderNumber) {
      orderNumber
      expressId
      orders {
        productName
        thumbnail
        detail
        realPrice
        quantity
        option {
          name
          value
        }
      }
    }
  }
`

export const UNIPASSVALID = gql`
  mutation UnipassValid($name: String, $customID: String, $phone: String) {
    UnipassValid(name: $name, customID: $customID, phone: $phone)
  }
`

export const ORDER_COUNT = gql`
  query OrderCount($orderState: String) {
    OrderCount(orderState: $orderState)
  }
`

export const ENG_TRANSLATE = gql`
  query EngTranslate($text: String) {
    EngTranslate(text: $text)
  }
`
export const KORTOENG_TRANSLATE = gql`
  query KorToEngTranslate($text: String) {
    KorToEngTranslate(text: $text)
  }
`

export const SET_ORDER_SHIPPING = gql`
  mutation SetOrderShipping($input: [Cafe24ShipInputType]) {
    SetOrderShipping(input: $input)
  }
`

export const BAEDAEGI_LIST = gql`
  query BaedaegiList($page: Int, $perPage: Int, $search: String, $filterOption: Int) {
    BaedaegiList(page: $page, perPage: $perPage, search: $search, filterOption: $filterOption) {
      count
      list {
        orderNo
        orderSeq
        customsCode
        weight
        shippingFee
        state
        name
        phone
        address
        marketName
        shippingNumber
        isDelete
        orderItems {
          taobaoTrackingNo
          taobaoOrderNo
          marketOrderNumber
        }
      }
    }
  }
`

export const MODIFY_WEIGHT_PRICE = gql`
  mutation ModifyWeightPrice($id: ID, $weight: Float, $userID: ID) {
    ModifyWeightPrice(id: $id, weight: $weight, userID: $userID)
  }
`

export const MODIFY_PRODUCT_TITLE = gql`
  mutation ModifyProductTitle($id: ID, $title: String, $userID: ID) {
    ModifyProductTitle(id: $id, title: $title, userID: $userID)
  }
`

export const MODIFY_PRODUCT_MAINIMAGES = gql`
  mutation ModifyProductMainImages($id: ID, $mainImages: [String], $userID: ID) {
    ModifyProductMainImages(id: $id, mainImages: $mainImages, userID: $userID)
  }
`
export const MODIFY_PRODUCT_HTML = gql`
  mutation ModifyProductHtml($id: ID, $html: String, $userID: ID) {
    ModifyProductHtml(id: $id, html: $html, userID: $userID)
  }
`

export const BAEDAEGI_ITEM_DELETE = gql`
  mutation BaedaegiItmeDelete($orderNumber: String, $isDelete: Boolean) {
    BaedaegiItmeDelete(orderNumber: $orderNumber, isDelete: $isDelete)
  }
`
export const BAEDAEGI_ITEM_MARKETORDER_MODIFY = gql`
  mutation BaedaegiItmeMarketOrderNoModify(
    $orderNumber: String
    $marketNumber: String
    $index: Int
  ) {
    BaedaegiItmeMarketOrderNoModify(
      orderNumber: $orderNumber
      marketNumber: $marketNumber
      index: $index
    )
  }
`

export const SALES_DETAIL = gql`
  query SalesDetail($startDate: String, $endDate: String, $userID: ID) {
    SalesDetail(startDate: $startDate, endDate: $endDate, userID: $userID) {
      market_id
      market_order_info
      payment_amount
      items {
        product_name
        option_value
        quantity
        order_status
        product_price
      }
    }
  }
`

export const NEW_ZIP_CODE = gql`
  query NewZipCode($keyword: String) {
    NewZipCode(keyword: $keyword)
  }
`

export const TABAE_DELAY = gql`
  query {
    TabaeDelay {
      type
      orderNo
      orderNumber
      name
      phone
      orderDate
      orderTime
      thumbnail
    }
  }
`

export const COUPANG_APPROVE = gql`
  mutation CoupangApprove($sellerProductId: String) {
    CoupangApprove(sellerProductId: $sellerProductId)
  }
`
export const COUPANG_APPROVES = gql`
  mutation CoupangApproves($sellerProductId: [String]) {
    CoupangApproves(sellerProductId: $sellerProductId)
  }
`

export const DELETE_SELECT_ROW = gql`
  mutation DelleteSelectedRowItem($input: [RowInput], $userID: ID) {
    DelleteSelectedRowItem(input: $input, userID: $userID)
  }
`

export const GET_SOEASY_PASSWORD = gql`
  query GetSoEasyPasssword {
    GetSoEasyPasssword {
      email
      password
    }
  }
`

export const SET_SOEASY_PASSWORD = gql`
  mutation SetSoEasyPassword($password: String) {
    SetSoEasyPassword(password: $password)
  }
`

export const UPLOAD_IMAGE = gql`
  mutation UploadImage($base64Image: String) {
    UploadImage(base64Image: $base64Image)
  }
`

export const GET_TAOBAO_DETAIL_API = gql`
  mutation GetTaobaoDetailAPI($url: String, $title: String) {
    GetTaobaoDetailAPI(url: $url, title: $title) {
      brand
      manufacture
      good_id
      title
      mainImages
      price
      salePrice
      content
      options {
        key
        propPath
        value
        korKey
        korValue
        image
        price
        productPrice
        salePrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
        }
        cafe24_variant_code
        coupang_sellerProductItemId
        coupang_vendorItemId
      }
      attribute {
        key
        value
        korKey
        korValue
      }
      korTitle
      optionImage {
        vid
        name
        korName
        image
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      taobaoAttributes {
        attributeTypeName
        attributeValueName
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
    }
  }
`

export const GET_TAOBAO_DETAIL_QUERY_API = gql`
  query GetTaobaoDetailAPI($url: String, $title: String) {
    GetTaobaoDetailAPI(url: $url, title: $title) {
      brand
      manufacture
      good_id
      title
      mainImages
      price
      salePrice
      content
      options {
        key
        propPath
        value
        korKey
        korValue
        image
        price
        productPrice
        salePrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
        }
        cafe24_variant_code
        coupang_sellerProductItemId
        coupang_vendorItemId
      }
      attribute {
        key
        value
        korKey
        korValue
      }
      korTitle
      korTitleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      optionImage {
        vid
        name
        korName
        image
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      taobaoAttributes {
        attributeTypeName
        attributeValueName
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
      keyword
      videoUrl
    }
  }
`

export const UPLOAD_NAVERPLUS_ITEM = gql`
  mutation UploadNaverPlusItem($input: [NaverPlusItem]) {
    UploadNaverPlusItem(input: $input)
  }
`

export const SET_NAVER_EXCEPT = gql`
  mutation SetNaverExcept($productNo: String, $isDelete: Boolean) {
    SetNaverExcept(productNo: $productNo, isDelete: $isDelete)
  }
`

export const GET_NAVER_ITEM_LIST = gql`
  mutation GetNaverItemList(
    $page: Int
    $perPage: Int
    $sort: String
    $limit: Int
    $category: String
    $regDay: Int
    $minRecent: Int
    $maxRecent: Int
    $totalMinSale: Int
    $totalMaxSale: Int
    $minReview: Int
    $maxReview: Int
    $minPrice: Int
    $maxPrice: Int
  ) {
    GetNaverItemList(
      page: $page
      perPage: $perPage
      sort: $sort
      limit: $limit
      category: $category
      regDay: $regDay
      minRecent: $minRecent
      maxRecent: $maxRecent
      totalMinSale: $totalMinSale
      totalMaxSale: $totalMaxSale
      minReview: $minReview
      maxReview: $maxReview
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      list {
        type
        productNo
        displayName
        detailUrl
        name
        categoryId
        category1
        category2
        category3
        category4
        image
        sellerTags
        reviewCount
        zzim
        purchaseCnt
        recentSaleCount
        isFavorite
        isDelete
        titleArray {
          word
          brand
          ban
          kipris
        }
      }
      count
    }
  }
`
export const GET_NAVER_JANPAN_ITEM_LIST = gql`
  mutation GetNaverJanpanItemList(
    $page: Int
    $perPage: Int
    $sort: String
    $limit: Int
    $category: String
    $regDay: Int
    $minRecent: Int
    $maxRecent: Int
    $totalMinSale: Int
    $totalMaxSale: Int
    $minReview: Int
    $maxReview: Int
    $minPrice: Int
    $maxPrice: Int
  ) {
    GetNaverJanpanItemList(
      page: $page
      perPage: $perPage
      sort: $sort
      limit: $limit
      category: $category
      regDay: $regDay
      minRecent: $minRecent
      maxRecent: $maxRecent
      totalMinSale: $totalMinSale
      totalMaxSale: $totalMaxSale
      minReview: $minReview
      maxReview: $maxReview
      minPrice: $minPrice
      maxPrice: $maxPrice
    ) {
      list {
        type
        productNo
        displayName
        detailUrl
        name
        categoryId
        category1
        category2
        category3
        category4
        image
        sellerTags
        reviewCount
        zzim
        purchaseCnt
        recentSaleCount
        isFavorite
        isDelete
        titleArray {
          word
          brand
          ban
          kipris
        }
      }
      count
    }
  }
`

export const SET_NAVER_ITEM_FAVORITE = gql`
  mutation SetNaverItemFavorite($productNo: String, $isFavorite: Boolean) {
    SetNaverItemFavorite(productNo: $productNo, isFavorite: $isFavorite)
  }
`
export const GET_NAVER_FAVORITE_ITEM_LIST = gql`
  mutation GetNaverFavoriteItemList {
    GetNaverFavoriteItemList {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const GET_SALED_ITEM_LIST = gql`
  mutation GetSaledItemList {
    GetSaledItemList {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      weightPrice
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const GET_NAVER_JANPAN_FAVORITE_ITEM_LIST = gql`
  mutation GetNaverJanpanFavoriteItemList {
    GetNaverJanpanFavoriteItemList {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const GET_NAVER_ITEM_WITH_KEYWORD = gql`
  query GetNaverItemWithKeyword($category1: String, $keyword: String) {
    GetNaverItemWithKeyword(category1: $category1, keyword: $keyword) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const GET_NAVER_KEYWORD_ITEM_ID = gql`
  query GetNaverItemWithKeywordID($ids: [ID], $keyword: String) {
    GetNaverItemWithKeywordID(ids: $ids, keyword: $keyword) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const GET_NAVER_HEALTHFOOD_ITEM_LIST = gql`
  query GetNaverHealthFood($category1: String, $keyword: String) {
    GetNaverHealthFood(category1: $category1, keyword: $keyword) {
      type
      productNo
      displayName
      detailUrl
      name
      categoryId
      category1
      category2
      category3
      category4
      image
      sellerTags
      reviewCount
      zzim
      purchaseCnt
      recentSaleCount
      isFavorite
      isDelete
      titleArray {
        word
        brand
        ban
        kipris
      }
    }
  }
`

export const QUALITY_CHECK = gql`
  mutation QualityCheck(
    $title: String
    $category1: String
    $category2: String
    $category3: String
    $category4: String
  ) {
    QualityCheck(
      title: $title
      category1: $category1
      category2: $category2
      category3: $category3
      category4: $category4
    ) {
      cause {
        term
        cause
      }
      etc
      totalScore
    }
  }
`

export const TAOBAO_ORDER_MANUAL = gql`
  mutation TaobaoOrderManual($userID: ID, $input: [TaobaoOrderManualInputType]) {
    TaobaoOrderManual(userID: $userID, input: $input)
  }
`

export const ISREGISTER = gql`
  query IsRegister($goodID: String) {
    IsRegister(goodID: $goodID)
  }
`
export const ISUSAREGISTER = gql`
  query IsUSARegister($asin: String) {
    IsUSARegister(asin: $asin)
  }
`

export const GET_MAIN_IMAGES = gql`
  query GetMainImages($_id: ID) {
    GetMainImages(_id: $_id)
  }
`
export const GET_DETAIL_HTML = gql`
  query GetDetailHtml($_id: ID) {
    GetDetailHtml(_id: $_id)
  }
`

export const GET_OPTIONS = gql`
  query GetOptions($_id: ID) {
    GetOptions(_id: $_id) {
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
      option {
        key
        propPath
        value
        korKey
        korValue
        image
        price
        productPrice
        salePrice
        weightPrice
        stock
        disabled
        active
        base
        attributes {
          attributeTypeName
          attributeValueName
          exposed
        }
        cafe24_variant_code
        coupang_sellerProductItemId
        coupang_vendorItemId
      }
    }
  }
`

export const MODIFY_OPTIONS = gql`
  mutation ModifyOptions($id: ID, $props: [PropInputType], $options: [OptionInputType]) {
    ModifyOptions(id: $id, props: $props, options: $options)
  }
`

export const NAVER_MAIN_KEYWORD = gql`
  mutation NaverMainKeyword(
    $search: String
    $page: Int
    $perPage: Int
    $sort: String
    $exceptBrand: Boolean
    $categoryFilter: [String]
  ) {
    NaverMainKeyword(
      search: $search
      page: $page
      perPage: $perPage
      sort: $sort
      exceptBrand: $exceptBrand
      categoryFilter: $categoryFilter
    ) {
      count
      list {
        _id
        category1
        keyword
        productCount
        purchaseCnt
        recentSaleCount
        isBrand
      }
    }
  }
`

export const SOURCING_KEYWORD = gql`
  mutation SourcingKeyword(
    $search: String
    $page: Int
    $perPage: Int
    $sort: String
    $categoryFilter: [String]
    $minCount: Int
    $maxCount: Int
    $minProductCount: Int
    $maxProductCount: Int
    $minOverSeaProductCount: Int
    $maxOverSeaProductCount: Int
    $minCompetition: Int
    $maxCompetition: Int
    $minOverSeaCompetition: Int
    $maxOverSeaCompetition: Int
    $overSeaProductCount: Int
  ) {
    SourcingKeyword(
      search: $search
      page: $page
      perPage: $perPage
      sort: $sort
      categoryFilter: $categoryFilter
      minCount: $minCount
      maxCount: $maxCount
      minProductCount: $minProductCount
      maxProductCount: $maxProductCount
      minOverSeaProductCount: $minOverSeaProductCount
      maxOverSeaProductCount: $maxOverSeaProductCount
      minCompetition: $minCompetition
      maxCompetition: $maxCompetition
      minOverSeaCompetition: $minOverSeaCompetition
      maxOverSeaCompetition: $maxOverSeaCompetition
      overSeaProductCount: $overSeaProductCount
    ) {
      count
      list {
        _id
        isFavorite
        keyword
        category1Code
        category1Name
        category2Name
        category3Name
        category4Name
        totalCount
        overSeaCount
        overSeaRate
        monthlyPcQcCnt
        monthlyMobileQcCnt
        monthlyTotalCnt
        competitionIntensity
        overSeaCompetitionIntensity
        products
        nluTerms {
          keyword
          keywordType
        }
        overSeaProduct
        singleProduct
        notSalesProduct
        overSeaCountRate
        singleProductRate
        notSalesProductRate
        overSeaNotSalesProduct
        overSeaSingleProductRate
        overSeaNotSaleProductRate
      }
    }
  }
`
export const MY_FAVORITE_KEYORD = gql`
  mutation MyFavoriteKeyword($page: Int, $perPage: Int, $sort: String, $categoryFilter: [String]) {
    MyFavoriteKeyword(
      page: $page
      perPage: $perPage
      sort: $sort
      categoryFilter: $categoryFilter
    ) {
      count
      list {
        _id
        isFavorite
        keyword
        category1Code
        category1Name
        category2Name
        category3Name
        category4Name
        totalCount
        overSeaCount
        overSeaRate
        monthlyPcQcCnt
        monthlyMobileQcCnt
        monthlyTotalCnt
        competitionIntensity
        overSeaCompetitionIntensity
        products
        nluTerms {
          keyword
          keywordType
        }
        overSeaProduct
        singleProduct
        notSalesProduct
        overSeaCountRate
        singleProductRate
        notSalesProductRate
        overSeaNotSalesProduct
        overSeaSingleProductRate
        overSeaNotSaleProductRate
      }
    }
  }
`
export const NAVER_HEALTHFOOD = gql`
  mutation NaverHealthFood(
    $search: String
    $page: Int
    $perPage: Int
    $sort: String
    $categoryFilter: [String]
  ) {
    NaverHealthFood(
      search: $search
      page: $page
      perPage: $perPage
      sort: $sort
      categoryFilter: $categoryFilter
    ) {
      count
      list {
        _id
        productNo
        category1
        category2
        category3
        category4
        categoryId
        detailUrl
        displayName
        image
        name
        regDate
        reviewCount
        zzim
        purchaseCnt
        recentSaleCount
        sellerTags
        titleArray {
          word
          brand
          ban
          kipris
          prohibit
        }
      }
    }
  }
`

export const KORTOCN = gql`
  mutation KorToCn($text: String) {
    KorToCn(text: $text)
  }
`

export const GET_PROHIBIT = gql`
  query GetProhibit($asin: String) {
    GetProhibit(asin: $asin) {
      prohibitWord
      engSentence
    }
  }
`

export const GET_AMAZON_DETAIL_API = gql`
  query GetAmazonDetailAPI($url: String, $title: String) {
    GetAmazonDetailAPI(url: $url, title: $title) {
      isRegister
      isPrime
      title
      korTitle
      keyword
      titleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      korTitleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      detailUrl
      brand
      manufacture
      good_id
      mainImages
      content
      feature
      options {
        key
        propPath
        price
        promotion_price
        stock
        image
        optionImage
        productOverview
        disabled
        active
        value
        korValue
        attributes {
          attributeTypeName
          attributeValueName
        }
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
      prohibitWord
      engSentence
    }
  }
`

export const GET_ALIEXPRESS_DETAIL_API = gql`
  query GetAliExpressDetailAPI($url: String, $title: String) {
    GetAliExpressDetailAPI(url: $url, title: $title) {
      isRegister
      title
      korTitle
      shipPrice
      deliverDate
      deliverCompany
      purchaseLimitNumMax
      keyword
      mainKeyword
      korTitleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      detailUrl
      brand
      manufacture
      spec {
        attrName
        attrValue
      }
      good_id
      mainImages
      content
      options {
        key
        propPath
        price
        promotion_price
        stock
        image
        optionImage
        productOverview
        disabled
        active
        value
        korValue
        attributes {
          attributeTypeName
          attributeValueName
        }
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
    }
  }
`

export const GET_IHERB_DETAIL_API = gql`
  query GetiHerbDetailAPI($url: String, $title: String) {
    GetiHerbDetailAPI(url: $url, title: $title) {
      isRegister
      isPrime
      title
      korTitle
      keyword
      titleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      korTitleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      detailUrl
      brand
      manufacture
      good_id
      mainImages
      content
      options {
        key
        propPath
        price
        promotion_price
        stock
        image
        optionImage
        productOverview
        disabled
        active
        value
        korValue
        attributes {
          attributeTypeName
          attributeValueName
        }
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
      prohibitWord
      engSentence
      description
      suggestedUse
      ingredients
      warnings
      disclaimer
      supplementFacts
    }
  }
`

export const GET_AMAZONCOLLECTION = gql`
  mutation GetAmazonCollection {
    GetAmazonCollection {
      isRegister
      isPrime
      title
      korTitle
      keyword
      mainKeyword
      titleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      korTitleArray {
        word
        brand
        ban
        kipris
        prohibit
      }
      detailUrl
      brand
      manufacture
      spec {
        attrName
        attrValue
      }
      good_id
      mainImages
      content
      feature
      prohibitWord
      engSentence
      description
      suggestedUse
      ingredients
      warnings
      disclaimer
      supplementFacts
      shipPrice
      deliverDate
      purchaseLimitNumMax
      deliverCompany
      options {
        key
        propPath
        price
        promotion_price
        stock
        image
        optionImage
        productOverview
        disabled
        active
        value
        korValue
        attributes {
          attributeTypeName
          attributeValueName
        }
      }
      prop {
        pid
        name
        korTypeName
        values {
          vid
          name
          korValueName
          image
        }
      }
      exchange
      marginInfo {
        title
        price
      }
      shippingWeightInfo {
        title
        price
      }
      prohibitWord
      engSentence
    }
  }
`

export const GET_MARKETORDER_INFO = gql`
  query GetMarketOrderInfo($orderId: String) {
    GetMarketOrderInfo(orderId: $orderId) {
      addr
      postCode
      parcelPrintMessage
    }
  }
`
export const GET_TAOBAOORDER_SIMPLE_INFO = gql`
  query GetTaobaoOrderSimpleInfo($orderId: String) {
    GetTaobaoOrderSimpleInfo(orderId: $orderId) {
      productName
      thumbnail
      detail
    }
  }
`

export const DELETE_AMAZON_COLLECTION = gql`
  mutation DeleteAmazonCollection($asin: String) {
    DeleteAmazonCollection(asin: $asin)
  }
`

export const GET_IHERB_OPTION_PID = gql`
  mutation GetiHerbOptionPid($url: String) {
    GetiHerbOptionPid(url: $url) {
      asin
      url
    }
  }
`

export const SEARCH_COUPANG_RELATED_KEYWORD = gql`
  mutation SearchCoupangRelatedKeywrod($keyword: String) {
    SearchCoupangRelatedKeywrod(keyword: $keyword)
  }
`

export const SEARCH_COUPANG_AUTO_KEYWORD = gql`
  mutation SearchCoupangAutoKeywrod($keyword: String) {
    SearchCoupangAutoKeywrod(keyword: $keyword)
  }
`

export const SEARCH_NAVER_RELATED_KEYWORD = gql`
  mutation SearchNaverRelatedKeywrod($keyword: String) {
    SearchNaverRelatedKeywrod(keyword: $keyword)
  }
`

export const SEARCH_NAVER_PRODUCT_KEYWORD = gql`
  mutation SearchNaverProductKeywrod($keyword: String) {
    SearchNaverProductKeywrod(keyword: $keyword)
  }
`
export const SEARCH_NAVER_TAG_KEYWORD = gql`
  mutation SearchNaverTagKeyword($keyword: String) {
    SearchNaverTagKeyword(keyword: $keyword)
  }
`

export const OPTIMIZATION_PRODUCT_NAME = gql`
  mutation OptimizationProductName($title: String) {
    OptimizationProductName(title: $title)
  }
`

export const GET_NAVER_CATALOG_KEYWORD = gql`
  query GetNaverCatalogKeyword($catalog: String, $keyword: String) {
    GetNaverCatalogKeyword(catalog: $catalog, keyword: $keyword) {
      name
      count
    }
  }
`

export const SET_FAVORITE_KEYWORD = gql`
  mutation SetFavoriteKeyword($keywordID: ID, $favorite: Boolean) {
    SetFavoriteKeyword(keywordID: $keywordID, favorite: $favorite)
  }
`

export const SET_NAVER_FAVORITE_ITEM_DELETE = gql`
  mutation SetNaverFavoriteItemDelete {
    SetNaverFavoriteItemDelete
  }
`

export const GET_MARKET_ORDER = gql`
  query GetMarketOrder($orderId: String, $userID: ID) {
    GetMarketOrder(orderId: $orderId, userID: $userID) {
      userID
      market
      shipmentBoxID
      orderId
      cafe24OrderID
      orderer {
        name
        email
        tellNumber
        hpNumber
        orderDate
        orderTime
      }     
      paidAtDate
      paidAtTime
      shippingPrice
      receiver {
        name
        tellNumber
        hpNumber
        addr
        postCode
        parcelPrintMessage
      }
      orderItems {
        image
        title
        option
        quantity
        salesPrice
        orderPrice
        discountPrice
        sellerProductName
        productId
        vendorItemId
        deliveryOrderId
      }
      overseaShippingInfoDto {
        personalCustomsClearanceCode
        ordererPhoneNumber
        ordererName
      }
      saleType
      deliveryCompanyName
      invoiceNumber
      deliveryOrderId
    }
  }
`

export const GET_DELIVERY_ORDER = gql`
  query GetDeliveryOrder($orderId: String, $userID: ID) {
    GetDeliveryOrder(orderId: $orderId, userID: $userID){
      userID
      orderSeq
      orderNo
      status
      address
      zipCode
      name
      hp
      PCCode
      orderItems {
        taobaoTrackingNo
        taobaoOrderNo
        orderId
      }
      weight
      shippingPrice
      shippingNumber
      isDelete
    }
  }
`

export const GET_TAOBAO_ORDER = gql`
  query GetTaobaoOrder($taobaoOrderNo: [String], $userID: ID) {
    GetTaobaoOrder(taobaoOrderNo: $taobaoOrderNo, userID: $userID) {
      orderNumber
      orderDate
      orderTime
      orders {
        id
        productName
        thumbnail
        detail
        skuId
        option {
          name
          value
          visible
        }
        originalPrice
        realPrice
        quantity
      }
      purchaseAmount
      shippingFee
      shippingStatus
    }
  }
`
export const SET_MARKET_ORDER = gql`
  mutation SetMarketOrder($orderId: String, $userID: ID, $input: MarketOrderInputType) {
    SetMarketOrder(orderId: $orderId, userID: $userID, input: $input)
  }
`

export const SET_DELIVERY_ORDER = gql`
  mutation SetDeliveryOrder($userID: ID, $input: [DeliveryOrderInputType]) {
    SetDeliveryOrder(userID: $userID, input: $input)
  }
`
export const SET_TAOBAO_ORDER = gql`
  mutation SetTaobaoOrder($userID: ID, $input: [TaobaoOrderInputType]) {
    SetTaobaoOrder(userID: $userID, input: $input)
  }
`

export const SYNC_DELIVERY_ORDER = gql`
  mutation SyncDeliveryOrder {
    SyncDeliveryOrder
  }
`

export const CATEGORY_SALES = gql`
  query GetCategorySales($sort: String) {
    GetCategorySales(sort: $sort) {
      _id
      categoryId
      count
      purchaseCnt
      recentSaleCount
      category1
      category2
      category3
      category4
    }
  }
`

export const SET_TAOBAO_URL = gql`
  mutation SetTaobaoUrl($_id: ID, $url: String){
    SetTaobaoUrl(_id: $_id, url: $url)
  }
`

export const TAOBAO_SIMILAR_PRODUCTS = gql`
  mutation GetSimilarProducts($urlString: String){
    GetSimilarProducts(urlString: $urlString) {
      title
      image
      link
    }
  }
`

export const GET_SIMILAR_PRODUCT_KORTITLE = gql`
  mutation GetSimilarProductKorTitle($input: [SimilarProductInputType]){
    GetSimilarProductKorTitle(input: $input) {
      korTitle
      title
      image
      link
    }
  }
`

export const CAFE24_BOARDS = gql`
  query Cafe24Boards($userID: ID) {
    Cafe24Boards(userID: $userID)
  }
`

export const GET_COMBINE_TITLE = gql`
  mutation GetCombineTitleKeyword($title: String, $displayName: String) {
    GetCombineTitleKeyword(title: $title, displayName: $displayName) {
      keyword
      count
      isMain
      rank
    }
  }
`

export const GET_DETAIL_IMAGE_LIST = gql`
  mutation GetDetailImageList($userID: ID){
    GetDetailImageList(userID: $userID) {
      _id
      name
      detailUrl
      image
      content
      isContentTranslate
      createdAt
    }
  }
`

export const SET_MODIFY_DETAIL_PAGES = gql`
  mutation SetModifyDetailPage($input: [ModifyDetailPageType]) {
    SetModifyDetailPage(input: $input)
  }
`

export const DELETE_ALL_WEIGHT = gql`
  mutation DeleteAllWeight($userID: ID) {
    DeleteAllWeight(userID: $userID)
  }
`

export const SET_ALL_WEIGHT = gql`
  mutation SetAllWeight($userID: ID, $input:[AllWeightType]) {
    SetAllWeight(userID: $userID, input: $input)
  }
`