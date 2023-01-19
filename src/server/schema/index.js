const { gql } = require("apollo-server")

const schema = gql`
  type AuthResponse {
    _id: ID
    adminUser: ID
    nickname: String
    email: String
    avatar: String
    admin: Boolean
    token: String
    grade: String
    error: String
  }

  input AuthInput {
    accessToken: String!
  }

  type CategorySourcingResponse {
    imageUrl: String
    productName: String
    openDate: String
    reviewCount: String
    purchaseCnt: String
    lowPrice: String
    dlvry: String
    price: String
    id: String
    mallName: String
    logo: String
    crUrl: String
    rank: String
    registered: Boolean
  }

  type TaobaoOptions {
    name: String
    key: String
    korName: String
    image: String
    skuId: String
    stock: String
    price: String
  }
  type TaobaoDetailItem {
    imgs: [String]
    good_id: String
    option: [TaobaoOptions]
  }

  type TaobaoSourcingResponse {
    image: String
    detail: String
    title: String
    korTitle: String
    price: String
    dealCnt: String
    shop: String
    location: String
    korLocation: String
    detailItem: TaobaoDetailItem
    registered: Boolean
  }

  type Attributes1 {
    attributeTypeName: String
    attributeValueName: String
    exposed: String
  }
  type PropValueType {
    vid: String
    name: String
    korValueName: String
    image: String
  }
  type PropType {
    pid: String
    name: String
    korTypeName: String
    values: [PropValueType]
  }
  input PropValueInputType {
    vid: String
    disabled: Boolean
    name: String
    korValueName: String
    image: String
  }
  input PropInputType {
    pid: String
    name: String
    korTypeName: String
    values: [PropValueInputType]
  }

  type TaobaoOption {
    key: String
    propPath: String
    value: String
    korKey: String
    korValue: String
    image: String
    price: Float
    productPrice: Float
    salePrice: Float
    stock: Int
    disabled: Boolean
    active: Boolean
    base: Boolean
    attributes: [Attributes1]
    cafe24_variant_code: String
    coupang_sellerProductItemId: String
    coupang_vendorItemId: String
  }

  type TaobaoOption1 {
    key: String
    propPath: String
    value: String
    korKey: String
    korValue: String
    image: String
    price: Float
    productPrice: Float
    salePrice: Float
    weightPrice: Float
    stock: Int
    disabled: Boolean
    active: Boolean
    base: Boolean
    attributes: [Attributes]
    cafe24_variant_code: String
    coupang_sellerProductItemId: String
    coupang_vendorItemId: String
  }

  type TaobaoAttribute {
    key: String
    value: String
    korKey: String
    korValue: String
  }

  type ShippingType {
    outboundShippingPlaceCode: Int
    shippingPlaceName: String
    placeAddresses: [CoupangPlaceAddressesType]
    remoteInfos: [CoupangPlaceRemoteInfosType]
    deliveryCompanyCode: String
    deliveryChargeType: String
    deliveryCharge: Int
    outboundShippingTimeDay: Int
  }

  type CoupangCenterType {
    deliveryChargeOnReturn: Int
    returnCharge: Int
    returnCenterCode: String
    shippingPlaceName: String
    deliverCode: String
    deliverName: String
    placeAddresses: [CoupangPlaceAddressesType]
  }

  type TaobaoDetailResponse {
    id: ID!
    brand: String
    manufacture: String
    good_id: String
    title: String
    korTitle: String
    titleArray: [BrandTitleArray]
    price: String
    salePrice: String
    keyword: [String]
    mainImages: [String]
    content: [String]
    topHtml: String
    clothesHtml: String
    isClothes: Boolean
    shoesHtml: String
    isShoes: Boolean
    optionHtml: String
    html: String
    bottomHtml: String
    prop: [PropType]
    options: [TaobaoOption]
    attribute: [TaobaoAttribute]
    categoryCode: Int
    attributes: [Attributes]
    noticeCategories: [NoticeCategories]
    requiredDocumentNames: [RequiredDocumentNames]
    certifications: [Certifications]
    afterServiceInformation: String
    afterServiceContactNumber: String
    topImage: String
    bottomImage: String
    vendorId: String
    vendorUserId: String
    shipping: ShippingType
    returnCenter: CoupangCenterType
    invoiceDocument: String
    maximumBuyForPerson: Int
    maximumBuyForPersonPeriod: Int
    cafe24_mallID: String
    cafe24_shop_no: Int
    cafe24_product_no: Int
    cafe24_mainImage: String
    coupang_productID: String
    naverCategoryCode: Int
    keywords: [TitleKeywordsType]

    exchange: Float
    shippingFee: Int
    profit: Int
    discount: Int
    fees: Int
  }

  type CoupangRecommendedData {
    autoCategorizationPredictionResultType: String
    predictedCategoryId: String
    predictedCategoryName: String
    comment: String
  }
  type CoupangRecommendedCategory {
    code: Int
    message: String
    data: CoupangRecommendedData
  }

  type CoupangCategory6 {
    value: Int
    label: String
  }
  type CoupangCategory5 {
    value: Int
    label: String
    children: [CoupangCategory6]
  }
  type CoupangCategory4 {
    value: Int
    label: String
    children: [CoupangCategory5]
  }
  type CoupangCategory3 {
    value: Int
    label: String
    children: [CoupangCategory4]
  }
  type CoupangCategory2 {
    value: Int
    label: String
    children: [CoupangCategory3]
  }
  type CoupangCategory1 {
    value: Int
    label: String
    children: [CoupangCategory2]
  }

  type CoupangPlaceAddressesType {
    addressType: String
    countryCode: String
    companyContactNumber: String
    phoneNumber2: String
    returnZipCode: String
    returnAddress: String
    returnAddressDetail: String
  }
  type CoupangPlaceRemoteInfosType {
    remoteInfoId: Int
    deliveryCode: String
    jeju: Int
    notJeju: Int
    usable: Boolean
  }
  type CoupangOutboungType {
    outboundShippingPlaceCode: Int
    shippingPlaceName: String
    placeAddresses: [CoupangPlaceAddressesType]
    remoteInfos: [CoupangPlaceRemoteInfosType]
  }

  type CoupangReturnShippingCenterType {
    returnCenterCode: String
    shippingPlaceName: String
    deliverCode: String
    deliverName: String
    placeAddresses: [CoupangPlaceAddressesType]
  }

  type TaobaoInfoType {
    loginID: String
    password: String
    imageKey: String
  }
  type CoupangInfoType {
    vendorUserId: String
    vendorId: String
    accessKey: String
    secretKey: String
    deliveryCompanyCode: String
    deliveryChargeType: String
    deliveryCharge: Int
    deliveryChargeOnReturn: Int
    returnCharge: Int
    outbound: CoupangOutboungType
    returnShippingCenter: CoupangReturnShippingCenterType
    outboundShippingTimeDay: Int
    invoiceDocument: String
    maximumBuyForPerson: Int
    maximumBuyForPersonPeriod: Int
  }
  type Cafe24InfoType {
    mallID: String
    shop_no: Int
    password: String
  }
  type InterParkInfoType {
    userID: String
    password: String
  }
  type MarketBasicInfoType {
    taobao: TaobaoInfoType
    coupang: CoupangInfoType
    cafe24: Cafe24InfoType
    interpark: InterParkInfoType
  }

  type BasicInfoType {
    topImage: String
    bottomImage: String
    clothImage: String
    shoesImage: String
    afterServiceInformation: String
    afterServiceContactNumber: String
    kiprisInter: Boolean
  }

  type Attributes {
    attributeTypeName: String
    attributeValueName: String
    required: String
    dataType: String
    basicUnit: String
    usableUnits: [String]
    groupNumber: String
    exposed: String
  }
  type NoticeCategoryDetailNames {
    noticeCategoryDetailName: String
    required: String
    content: String
  }
  type NoticeCategories {
    noticeCategoryName: String
    noticeCategoryDetailNames: [NoticeCategoryDetailNames]
  }
  type RequiredDocumentNames {
    templateName: String
    required: String
  }
  type Certifications {
    certificationType: String
    name: String
    dataType: String
    required: String
  }
  type CoupangCategoryMetaDataType {
    isAllowSingleItem: Boolean
    attributes: [Attributes]
    noticeCategories: [NoticeCategories]
    requiredDocumentNames: [RequiredDocumentNames]
    certifications: [Certifications]
    allowedOfferConditions: [String]
  }
  type CoupangCategoryMetaResponse {
    code: String
    message: String
    data: CoupangCategoryMetaDataType
  }

  input Product {
    exchange: Int
    shippingFee: Int
    profit: Int
    discount: Int
    fees: Int

    good_id: String
    naverID: String
    korTitle: String
    keyword: [String]
    mainImages: [String]
    price: String
    salePrice: String
    topHtml: String
    clothesHtml: String
    isClothes: Boolean
    shoesHtml: String
    isShoes: Boolean
    optionHtml: String
    html: String
    bottomHtml: String
    brand: String # 브랜드
    manufacture: String # 제조사
    outboundShippingTimeDay: Int #기준출고일(일)
    deliveryChargeType: String # 배송비 종류
    deliveryCharge: Int # 기본배송비
    deliveryChargeOnReturn: Int # 초도반품배송비
    cafe24_product_no: Int
    cafe24_mainImage: String
    coupang_productID: String
    naverCategoryCode: Int
  }
  input ProductOptions {
    key: String
    value: String
    korKey: String
    korValue: String
    image: String
    price: Float
    productPrice: Float
    salePrice: Float
    stock: Int
    disabled: Boolean
    active: Boolean
    base: Boolean
    attributes: [AttributesInput]
    cafe24_variant_code: String
    coupang_sellerProductItemId: String
    coupang_vendorItemId: String
  }
  input NoticeInput {
    noticeCategoryName: String #상품고시정보카테고리명
    noticeCategoryDetailName: String # 상품고시정보카테고리상세명
    content: String # 내용
  }
  input AttributesInput {
    attributeTypeName: String #옵션타입명
    attributeValueName: String #옵션값
    required: String
  }

  input CertificationsInput {
    certificationType: String
    name: String
    dataType: String
    required: String
  }
  input CoupangProductInputType {
    displayCategoryCode: Int # 노출카테고리코드
    displayCategoryName: String # 노출카테고리이름
    vendorId: String # 판매자ID,
    deliveryCompanyCode: String # 택배사 코드
    returnCenterCode: String # 반품지센터코드
    returnChargeName: String # 반품지명
    companyContactNumber: String # 반품지 연락처
    returnZipCode: String # 반품지우편번호
    returnAddress: String # 반품지주소
    returnAddressDetail: String # 반품지주소상세
    returnCharge: Int # 반품배송비
    afterServiceInformation: String # A/S안내
    afterServiceContactNumber: String # A/S전화번호
    outboundShippingPlaceCode: Int # 출고지주소코드
    vendorUserId: String # 실사용자아이디(쿠팡 Wing ID)
    invoiceDocument: String # 인보이스 서류
    maximumBuyForPerson: Int # 인당 최대 구매수량
    maximumBuyForPersonPeriod: Int # 최대 구매 수량 기간
    notices: [NoticeInput]
    attributes: [AttributesInput]
    certifications: [CertificationsInput]
  }

  input Cafe24ProductInputType {
    mallID: String
    shop_no: Int
  }

  type Cafe24OriginType {
    origin_place_no: Int
    origin_place_name: [String]
    foreign: String
    made_in_code: String
  }

  type CoupangResponse {
    code: String
    message: String
  }
  type CreateProductResponse {
    coupang: CoupangResponse
    cafe24: CoupangResponse
  }

  type CreateCoupangResponse {
    coupang: CoupangResponse
  }
  type CreateCafe24Response {
    cafe24: CoupangResponse
  }
  type Cafe24ProductType {
    mallID: String
    shop_no: Int
    product_no: Int
    product_code: String
    custom_product_code: String
  }

  type CoupangProductType {
    productID: String
    status: String
    displayCategoryCode: Int
    displayCategoryName: String
  }

  type ProductOptionType {
    key: String
    value: String
    propPath: String
    korValue: String
    image: String
    price: Float
    productPrice: Float
    salePrice: Float
    stock: Float
    disabled: Boolean
    active: Boolean
    base: Boolean
    cafe24_variant_code: String
    coupang_sellerProductItemId: String
    coupang_vendorItemId: String
    coupang_itemId: String
  }

  type ProductUserType {
    _id: ID
    email: String
    nickname: String
    avatar: String
  }
  type ProductListType {
    _id: ID
    url: String # 상품 원본 주소
    korTitle: String # 상품명
    titleArray: [BrandTitleArray]
    weightPrice: Int
    weight: Int
    naverCategoryName: String
    mainImage: String
    isWinner: Boolean
    isNaver: Boolean
    isCoupang: Boolean
    cafe24: Cafe24ProductType
    coupang: CoupangProductType
    createdAt: String
    options: [ProductOptionType]
    user: ProductUserType
  }
  type ProductListResponse {
    count: Int
    list: [ProductListType]
  }

  type FavoriteListType {
    _id: ID
    url: String # 상품 원본 주소
    korTitle: String # 상품명
    mainImage: String
    createdAt: String
  }
  type TaobaoFavoriteListResponse {
    count: Int
    list: [FavoriteListType]
  }

  type RepresentativeKeywordType {
    keyword: String
    relatedKeyword: [String]
  }
  type RelatedKeywordType {
    keyword: String
    item_num: Int
    mpcqry: Int
    mmoqry: Int
    total: Int
    compete: Float
  }

  type CategoryKeywordType {
    rank: String
    keyword: String
    pc: String
    mobile: String
    total: String
    product: String
    compete: String
    pcrate: String
    mobilerate: String
    adclickrate: String
    adsclicks: String
  }

  type DailyCountType {
    year: Int
    month: Int
    day: Int
    count: Int
    subTotal: Int
    user: ProductUserType
  }

  type TitleKeywordType {
    name: String
    count: Int
  }

  type TitleKeywordsType {
    keyword: String
    relatedKeyword: [TitleKeywordType]
  }

  type CoupangItemType {
    productID: String
    image: String
    delivery: String
    title: String
    salePrice: String
    productPrce: String
    discount: String
    detail: String
    registered: Boolean
  }

  type NaverItemType {
    mallNo: String
    mallName: String
    title: String
    detail: String
    price: String
    shippingfee: String
    image: String
    productID: String
    category1: String
    category2: String
    category3: String
    category4: String
    lastUpdate: String
    registered: Boolean
  }

  type TaobaoDetailItemType {
    _id: ID
    registered: Boolean
    mainImages: [String]
    options: [TaobaoOption]
    korTitle: String
  }
  type TaobaoImageSearchingType {
    _id: ID
    index: Int
    itemID: ID
    createdAt: String
    detail: String
    image: String
    price: String
  }
  type NaverDetailItemType {
    _id: ID
    mallNo: String
    mallName: String
    title: String
    detail: String
    price: String
    shippingfee: String
    image: String
    productID: String
    category1: String
    category2: String
    category3: String
    category4: String
    lastUpdate: String
    registered: Boolean
    taobaoItem: [TaobaoImageSearchingType]
    otherImage: [String]
    isTaobao: Boolean
  }

  type OrdererType {
    name: String
    email: String
    telNumber: String
    hpNumber: String
    orderDate: String
    orderTime: String
  }
  type ReceiverType {
    name: String
    tellNumber: String
    hpNumber: String
    addr: String
    postCode: String
    parcelPrintMessage: String
  }
  type OrderItemType {
    image: String
    title: String
    option: String
    quantity: Float
    salesPrice: Float # 상품 가격
    orderPrice: Float # 결제 가격
    discountPrice: Float # 할인가격
    sellerProductName: String
    productId: String
    vendorItemId: String
  }
  type OverseaShippingInfoDto {
    personalCustomsClearanceCode: String
    ordererPhoneNumber: String
    ordererName: String
  }

  type TaobaoOrderItemOptionType {
    name: String
    value: String
    visible: String
  }
  type TaobaoOrderItemType {
    id: String
    productName: String
    thumbnail: String
    detail: String
    skuId: String
    option: [TaobaoOrderItemOptionType]
    originalPrice: String
    realPrice: String
    quantity: String
  }
  type TaobaoExpressAddressType {
    place: String
    time: String
  }
  type TaobaoExpressType {
    expressName: String
    expressId: String
    address: [TaobaoExpressAddressType]
  }
  type TaobaoOrderType {
    orderNumber: String
    orderDate: String
    orderTime: String
    orders: [TaobaoOrderItemType]
    purchaseAmount: String
    shippingFee: String
    shippingStatus: String
    express: TaobaoExpressType
  }

  type ExchangeType {
    usdPrice: String
    cnyPrice: String
  }

  type CustomsType {
    processingStage: String
    processingDate: String
    processingTime: String
  }

  type DeliveryTrackingType {
    stage: String
    processingDate: String
    processingTime: String
    status: String
    store: String
  }
  type DeliveryInfoType {
    orderNo: String # 배대지주문번호
    status: String # 배송상태
    recipientName: String # 수취인명
    recipientPostNum: String # 수취인우편번호
    recipientAddress: String # 수취인주소
    recipientPhoneNumber: String # 수취인연락처
    personalCustomsClearanceCode: String
    weight: Float
    shipFee: Float
    shippingNumber: String
    deliveryCompanyName: String
    customs: [CustomsType]
    deliveryTracking: [DeliveryTrackingType]
    taobaoItem: TaobaoOrderType
    exchange: ExchangeType
  }

  type VatListType {
    _id: ID
    market: String
    orderId: String
    orderer: OrdererType
    paidAtDate: String
    paidAtTime: String
    shippingPrice: Int
    receiver: ReceiverType
    orderItems: [OrderItemType]
    overseaShippingInfoDto: OverseaShippingInfoDto
    saleType: Int
    deliveryOrderId: String
    deliveryItem: [DeliveryInfoType]
  }

  type CoupangOptionType {
    optionKey1: String
    optionKey2: String
    optionTitle1: String
    optionTitle2: String
    title: String
    price: Int
    shippingFee: Int
    image: String
    deliveryDay: Int
    active: Boolean
  }

  type TaobaoShopGradeType {
    description: Int
    service: Int
    delivery: Int
  }
  type TaoBaoItemType {
    _id: ID
    index: Int
    itemID: ID
    commentCount: String
    dealCnt: String
    detail: String
    image: String
    isTmail: Boolean
    location: String
    price: String
    shop: String
    shopGrade: TaobaoShopGradeType
    shopLevel: [String]
  }

  type BrandTitleArray {
    word: String
    brand: [String]
    ban: [String]
    kipris: [String]
    prohibit: [String]
  }
  type CoupangItemListType {
    _id: ID
    productId: String
    vendorName: String
    vendorID: String
    ratingCount: Int
    ratingAveragePercentage: Int
    otherSellerCount: Int
    detail: String
    mainImages: [String]
    options: [CoupangOptionType]
    title: String
    taobaoItems: [TaoBaoItemType]
    titleArray: [BrandTitleArray]
    isRegister: Boolean
  }

  type BrandWordType {
    _id: ID
    word: String
  }
  type BrandResponseType {
    brand: [BrandWordType]
    banWord: [BrandWordType]
    prohibit: [BrandWordType]
  }

  type ItemWinnerType {
    _id: ID
    kind: String
    createdAt: String
    lastUpdate: String
    taobaoUrl: String
    title: String
    coupangUrl: String
    state: Int
    error: String
    mainImges: [String]
    options: [CoupangOptionType]
    user: ProductUserType
  }

  type AccountType {
    email: String
    nickname: String
  }

  input TaobaoBatchInputType {
    detailUrl: String
    korTitle: String
    profit: Int
    fees: Int
    discount: Int
    shippingFee: Int
    exchange: Int
    isClothes: Boolean
    isShoes: Boolean
  }

  type CoupangMallType {
    _id: ID
    mallPcUrl: String
    marketName: String
    businessName: String
    representativeName: String
    isFavorite: Boolean
  }

  input CoupangWinnerInputType {
    title: String
    detail: String
    detailUrl: String
    subPrice: Int
    isClothes: Boolean
    isShoes: Boolean
  }

  type CoupangStoreItemType {
    count: Int
    list: [CoupangItemListType]
  }

  type NaverShoppingItemType {
    type: String
    productNo: String
    displayName: String
    detailUrl: String
    name: String
    categoryId: String
    category1: String
    category2: String
    category3: String
    category4: String
    image: String
    sellerTags: [String]
    reviewCount: Int
    zzim: Int
    purchaseCnt: Int
    recentSaleCount: Int
    titleArray: [BrandTitleArray]
    isRegister: Boolean
    isFavorite: Boolean
    isDelete: Boolean
    weightPrice: Int
  }

  type AddPriceType {
    _id: ID
    title: Float
    price: Int
  }

  input NaverItmeInputType {
    productNo: String
    title: String
    detail: String
    detailUrl: String
    shippingWeight: Float
    isClothes: Boolean
    isShoes: Boolean
    sellerTags: [String]
    isNaver: Boolean
    html: String
    detailImages: [String]
  }

  type OtherSellerType {
    _id: ID
    vendorName: String
    vendorItemId: String
    price: Int
  }
  type CoupangProductItemType {
    _id: ID
    isManage: Boolean
    sellerProductItemId: String
    vendorItemId: String
    itemId: String
    itemName: String
    originalPrice: Float
    salePrice: Float
    costPrice: Float
    minPrice: Float
    margin: Float
    cdnPath: String
    status: Int
    otherSeller: [OtherSellerType]
  }
  type CoupangLowestProductType {
    _id: ID
    sellerProductId: String
    sellerProductName: String
    user: ProductUserType
    sourcingType: Int
    isExcept: Boolean
    items: [CoupangProductItemType]
  }
  type LowestPriceResponse {
    count: Int
    list: [CoupangLowestProductType]
  }

  input LowPriceManageType {
    sellerProductItemId: String
    margin: Float
    minPrice: Int
    isManage: Boolean
  }

  type KiprisType {
    search: String
    title: String
    result: Boolean
  }

  type TaobaoImageListType {
    pic_path: String
    title: String
    price: String
    sold: String
    totalSold: String
    commentCount: String
    iconList: String
    auctionURL: String
  }

  type TaobaoImageSearchType {
    url: String
    list: [TaobaoImageListType]
  }

  type OrderReceiverType {
    name: String
    phone: String
    zipcode: String
    address1: String
    address2: String
    address_full: String
    shipping_message: String
    clearance_information: String
  }
  type OrderBuyerType {
    name: String
    phone: String
  }

  type OrderItemsType {
    productID: ID
    order_item_code: String
    url: String
    item_no: String
    quantity: String
    custom_product_code: String
    option_value: String
    isMatch: Boolean
    product_name: String
    korValue: String
    value: String
    product_price: Int
    status_text: String
    image: String
    sellerProductItemId: String
    vendorItemId: String
    itemId: String
    taobaoOrderNumber: String
    category: String
  }
  type ValidNumberType {
    name: String
    persEcm: String
    phone: String
    checkUnipass: Boolean
  }

  type ShippingInfoType {
    shippingNumber: String
    deliveryCompanyName: String
    shipping_code: String
  }
  type OrderInfoType {
    order_id: String
    market_id: String
    market_order_info: String
    orderSeq: String
    delivery_id: String
    buyer_name: String
    buyer_phone: String
    paid: String
    order_date: String
    order_price_amount: String
    cancel_date: String
    buyer: OrderBuyerType
    receiver: OrderReceiverType
    items: [OrderItemsType]
    valid_number: ValidNumberType
    shipping: ShippingInfoType
    createdAt: String
    orderCount: Int
  }

  type SalesClendarType {
    orderPriceAmount: Int
    orderPriceCount: Int
    discountPriceAmount: Int
    discountPriceCount: Int
    shippingFee: Int
    shippingCount: Int
    cancelPriceAmount: Int
    cancelPriceCount: Int
    returnPriceAmount: Int
    returnPriceCount: Int
  }

  type TaobaoOrderOption {
    name: String
    value: String
  }
  type TaobaoOrdersItemType {
    productName: String
    thumbnail: String
    detail: String
    realPrice: String
    quantity: String
    option: [TaobaoOrderOption]
  }
  type TaobaoItemType {
    orderNumber: String
    expressId: String
    orders: [TaobaoOrdersItemType]
  }

  input CoupangWinnerItemType {
    productId: Float
    vendorItemId: Float
    itemId: Float
    vendorInventoryId: Float
    vendorInventoryItemId: Float
    productName: String
    sdpUrl: String
    vendorInventoryUrl: String
    img: String
    winnerStatus: Boolean
    soldOut: Boolean
    banned: Boolean
    currentApStatus: String
    currentMinPrice: Float
    currentMaxPrice: Float
    priceGapWithWinnerProduct: String
    winnerPrice: String
    winnerFinalPrice: String
    winnerCoupon: String
    winnerShippingFee: String
    currentPrice: String
    currentFinalPrice: String
    currentCoupon: String
    currentShippingFee: String
    recommendPrice: String
    potentialSales: String
    outboundShippingTime: String
    itemWinnerRate: String
    alarmSettings: Boolean
    changePriceInProgress: Boolean
    changeEsdInProgress: Boolean
    buyboxSalesShare: String
    myRecentSales: String
    myRecentGmv: String
    itemRecentSales: String
    itemRecentGmv: String
    coupangMinSalePrice: String
    coupangMaxSalePrice: String
    tp80SalePrice: String
    defaultAutoPricingMinPrice: String
    defaultAutoPricingMaxPrice: String
    nudgeAp: String
    nudgeCrp: String
    rodBadge: String
    mvendorInventoryUrl: String
  }

  input Cafe24ShipInputType {
    order_id: String
    deliveryCompanyName: String
    shippingNumber: String
    order_item_code: [String]
    shipping_code: String
  }

  type BaedaegiOrderItemType {
    taobaoTrackingNo: String
    taobaoOrderNo: String
    marketOrderNumber: String
  }
  type BaedaegiListType {
    orderNo: String
    orderSeq: String
    customsCode: String
    weight: String
    shippingFee: String
    state: String
    name: String
    phone: String
    address: String
    marketName: String
    shippingNumber: String
    isDelete: Boolean
    orderItems: [BaedaegiOrderItemType]
  }

  type BaedaegiResponseType {
    count: Int
    list: [BaedaegiListType]
  }

  type MarketOrderItem {
    product_name: String
    option_value: String
    quantity: Int
    order_status: String
    product_price: Int
  }
  type MarketOrderSimpleType {
    market_id: String
    market_order_info: String
    payment_amount: Int
    items: [MarketOrderItem]
  }

  type TabaeDelyType {
    type: Int
    orderNo: String
    name: String
    phone: String
    orderNumber: String
    orderDate: String
    orderTime: String
    thumbnail: String
  }

  input RowInput {
    _id: ID
    coupangID: String
    cafe24ID: Int
    mallID: String
  }

  type SoEasyPasswordType {
    email: String
    password: String
  }

  input WinnerItemType {
    _id: ID
    userID: ID
  }
  type OptionImageType {
    vid: String
    name: String
    korName: String
    image: String
  }
  type MaginInfoType {
    title: String
    price: String
  }
  type TaobaoDetailAPIType {
    brand: String
    manufacture: String
    good_id: String
    title: String
    mainImages: [String]
    price: String
    salePrice: String
    content: [String]
    options: [TaobaoOption]
    attribute: [TaobaoAttribute]
    korTitle: String
    korTitleArray: [BrandTitleArray]
    optionImage: [OptionImageType]
    prop: [PropType]
    taobaoAttributes: [Attributes1]
    exchange: String
    marginInfo: [MaginInfoType]
    shippingWeightInfo: [MaginInfoType]
    keyword: [String]
    videoUrl: String
  }

  input InputAttributes1 {
    attributeTypeName: String
    attributeValueName: String
  }

  input InputTaobaoOption {
    key: String
    propPath: String
    value: String
    korKey: String
    korValue: String
    image: String
    price: Float
    productPrice: Float
    salePrice: Float
    stock: Int
    disabled: Boolean
    active: Boolean
    base: Boolean
    weightPrice: Int
    attributes: [InputAttributes1]
    cafe24_variant_code: String
    coupang_sellerProductItemId: String
    coupang_vendorItemId: String
  }
  input InputPropValueType {
    vid: String
    name: String
    korValueName: String
    image: String
  }
  input InputPropType {
    pid: String
    name: String
    korTypeName: String
    values: [InputPropValueType]
  }
  input NaverPlusItem {
    categoryId: String
    content: [String]
    detail: String
    detailUrl: String
    videoUrl: String
    html: String
    isClothes: Boolean
    isShoes: Boolean
    mainImages: [String]
    options: [InputTaobaoOption]
    productNo: String
    prop: [InputPropType]
    sellerTags: [String]
    title: String
    type: String
    engSentence: String
  }

  input NaverShoppingItemInput {
    type: String
    productNo: String
    displayName: String
    detailUrl: String
    name: String
    categoryId: String
    image: String
    sellerTags: [String]
    reviewCount: Int
    zzim: Int
    purchaseCnt: Int
    recentSaleCount: Int
  }

  type NaverSourcingItemResponse {
    list: [NaverShoppingItemType]
    count: Int
  }
  type QualityCauseType {
    term: [String]
    cause: String
  }
  type QualityCheckResponse {
    cause: [QualityCauseType]
    etc: [String]
    totalScore: Float
  }

  input TaobaoOSubOrderOptionInput {
    name: String
    value: String
    visible: String
  }
  input TaobaoSubOrdersInput {
    id: Float
    productName: String
    thumbnail: String
    detail: String
    skuId: Float
    option: [TaobaoOSubOrderOptionInput]
    originalPrice: String
    realPrice: String
    quantity: String
  }

  input TaobaoOrderManualInputType {
    orderDate: String
    orderTime: String
    orderNumber: String
    purchaseAmount: String
    shippingFee: String
    quantity: String
    shippingStatus: String
    orders: [TaobaoSubOrdersInput]
  }

  type OptionModalType {
    prop: [PropType]
    exchange: Float
    marginInfo: [MaginInfoType]
    shippingWeightInfo: [MaginInfoType]
    option: [TaobaoOption1]
  }

  input OptionInputType {
    active: Boolean
    base: Boolean
    disabled: Boolean
    image: String
    key: String
    korKey: String
    korValue: String
    price: Int
    productPrice: Int
    propPath: String
    salePrice: Int
    stock: Int
    value: String
    weightPrice: Int
    attributes: [InputAttributes1]
  }

  type MainKeywordType {
    _id: ID
    category1: String
    keyword: String
    productCount: Int
    purchaseCnt: Int
    recentSaleCount: Int
    isBrand: Boolean
  }

  type NaverMainKeywordResponse {
    count: Int
    list: [MainKeywordType]
  }

  type NluTermsType {
    keyword: String
    keywordType: String
  }

  type SourcingKeywordType {
    _id: ID
    isFavorite: Boolean
    keyword: String
    category1Code: String
    category1Name: String
    category2Name: String
    category3Name: String
    category4Name: String
    totalCount: Int
    overSeaCount: Int
    overSeaRate: Float
    monthlyPcQcCnt: Int
    monthlyMobileQcCnt: Int
    monthlyTotalCnt: Int
    competitionIntensity: Float
    overSeaCompetitionIntensity: Float
    products: [ID]
    nluTerms: [NluTermsType]
    overSeaProduct: Int
    singleProduct: Int
    notSalesProduct: Int
    overSeaCountRate: Float
    singleProductRate: Float
    notSalesProductRate: Float
    overSeaNotSalesProduct: Int
    overSeaSingleProductRate: Float
    overSeaNotSaleProductRate: Float
  }
  type SourcingKeywordResponse {
    count: Int
    list: [SourcingKeywordType]
  }

  type HealthFoodItemType {
    _id: ID
    productNo: String
    category1: String
    category2: String
    category3: String
    category4: String
    categoryId: String
    detailUrl: String
    displayName: String
    image: String
    name: String
    regDate: String
    reviewCount: String
    zzim: String
    purchaseCnt: Int
    recentSaleCount: Int
    sellerTags: [String]
    titleArray: [BrandTitleArray]
  }

  type NaverHealthFoodResponse {
    count: Int
    list: [HealthFoodItemType]
  }

  type OCRType {
    text: String
    prohibit: [String]
  }

  type AmazonOptions {
    key: String
    propPath: String
    price: String
    promotion_price: String
    stock: String
    image: String
    optionImage: [String]
    productOverview: [String]
    disabled: Boolean
    active: Boolean
    value: String
    korValue: String
    attributes: [Attributes1]
  }

  type AmazonDataType {
    isRegister: Boolean
    isPrime: Boolean
    title: String
    korTitle: String
    keyword: [String]
    detailUrl: String
    brand: String
    manufacture: String
    good_id: String
    mainImages: [String]
    content: [String]
    feature: [String]
    prop: [PropType]
    options: [AmazonOptions]
    exchange: String
    marginInfo: [MaginInfoType]
    shippingWeightInfo: [MaginInfoType]
    titleArray: [BrandTitleArray]
    korTitleArray: [BrandTitleArray]
    prohibitWord: [String]
    engSentence: String
  }
  type IHerbDataType {
    isRegister: Boolean
    isPrime: Boolean
    title: String
    korTitle: String
    mainKeyword: String
    keyword: [String]
    detailUrl: String
    brand: String
    manufacture: String
    spec: [SpecType]
    good_id: String
    mainImages: [String]
    content: [String]
    feature: [String]
    prop: [PropType]
    options: [AmazonOptions]
    exchange: String
    marginInfo: [MaginInfoType]
    shippingWeightInfo: [MaginInfoType]
    titleArray: [BrandTitleArray]
    korTitleArray: [BrandTitleArray]
    prohibitWord: [String]
    engSentence: String
    description: String
    suggestedUse: String
    ingredients: String
    warnings: String
    disclaimer: String
    supplementFacts: String
    shipPrice: Int
    deliverDate: String
    purchaseLimitNumMax: Int
    deliverCompany: String
  }

  type SpecType {
    attrName: String
    attrValue: String
  }
  type AliExpressDataType {
    isRegister: Boolean
    title: String
    korTitle: String
    keyword: [String]
    mainKeyword: String
    shipPrice: Int
    deliverDate: String
    deliverCompany: String
    purchaseLimitNumMax: Int
    detailUrl: String
    brand: String
    manufacture: String
    spec: [SpecType]
    good_id: String
    mainImages: [String]
    content: [String]
    prop: [PropType]
    options: [AmazonOptions]
    exchange: String
    marginInfo: [MaginInfoType]
    shippingWeightInfo: [MaginInfoType]
    korTitleArray: [BrandTitleArray]
  }

  type MarketOrderInfo {
    addr: String
    postCode: String
    parcelPrintMessage: String
  }

  type TaobaoOrderSimpleInfo {
    productName: String
    thumbnail: String
    detail: String
  }

  type IHerbOptionPidType {
    asin: String
    url: String
  }

  type ProhibitType {
    engSentence: String
    prohibitWord: [String]
  }

  type MakretOrdererType {
    name: String
    email: String
    tellNumber: String
    hpNumber: String
    orderDate: String
    orderTime: String
  }
  type MarketReceiverType {
    name: String
    tellNumber: String
    hpNumber: String
    addr: String
    postCode: String
    parcelPrintMessage: String
  }
  type MarketOrderItemsType {
    image: String
    title: String
    option: String
    quantity: Int
    salesPrice: Int
    orderPrice: Int
    discountPrice: Int
    sellerProductName: String
    productId: String
    vendorItemId: String
    deliveryOrderId: String
  }
  type MarketOverseaShippingInfoDto {
    personalCustomsClearanceCode: String
    ordererPhoneNumber: String
    ordererName: String
  }
  type MarkerOrderType {
    userID: ID
    market: String
    shipmentBoxID: String
    orderId: String
    cafe24OrderID: String
    orderer: MakretOrdererType
    paidAtDate: String
    paidAtTime: String
    shippingPrice: Int
    receiver: MarketReceiverType
    orderItems: [MarketOrderItemsType]
    overseaShippingInfoDto: MarketOverseaShippingInfoDto
    saleType: Int
    deliveryCompanyName: String
    invoiceNumber: String
    deliveryOrderId: String
  }
  type DeliveryOrderItemsType {
    taobaoTrackingNo: String
    taobaoOrderNo: String
    orderId: String
  }
  type DeliveryOrderType {
    userID: ID
    orderSeq: String
    orderNo: String
    status: String
    address: String
    zipCode: String
    name: String
    hp: String
    PCCode: String
    orderItems: [DeliveryOrderItemsType]
    weight: Float
    shippingPrice: Int
    shippingNumber: String
    isDelete: Boolean
  }

  input MarketOrderOrdererInputType {
    name: String
    email: String
    tellNumber: String
    hpNumber: String
    orderDate: String
    orderTime: String
  }
  input MaketOrderReceiverInputType {
    name: String
    tellNumber: String
    hpNumber: String
    addr: String
    postCode: String
    parcelPrintMessage: String
  }
  input MarketOrderOrderItemsInputType {
    title: String
    option: String
    quantity: Int
    salesPrice: Int
    orderPrice: Int
    discountPrice: Int
    sellerProductName: String
    productId: String
    vendorIteId: String
    deliveryOrderId: String
  }
  input MakretOrderOverseaShippingInfoDtoInputType {
    personalCustomsClearanceCode: String
    ordererPhoneNumber: String
    ordererName: String 
  }
  input MarketOrderInputType {
    market: String
    orderId: String
    cafe24OrderID: String
    orderer: MarketOrderOrdererInputType
    paidAtDate: String
    paidAtTime: String
    shippingPrice: Int
    receiver: MaketOrderReceiverInputType
    orderItems: [MarketOrderOrderItemsInputType]
    overseaShippingInfoDto: MakretOrderOverseaShippingInfoDtoInputType
    saleType: Int
    deliveryCompanyName: String
    invoiceNumber: String
    deliveryOrderId: String
  }
  input DeliveryOrderOrderItemsInputType {
    taobaoTrackingNo: String
    taobaoOrderNo: String
    orderId: String
  }
  input DeliveryOrderInputType {
    orderSeq: String
    orderNo: String
    status: String
    address: String
    zipCode: String
    name: String
    hp: String
    PCCode: String
    orderItems: [DeliveryOrderOrderItemsInputType]
    weight: Float
    shippingPrice: Int
    shippingNumber: String
    isDelete: Boolean
  }

  input TaobaoOrderOrdersOptionInputType {
    name: String
    value: String
    visible: String
  }
  input TaobaoOrderOrdersInputType{
    productName: String
    thumbnail: String
    detail: String
    originalPrice: String
    realPrice: String
    quantity: String
    option: [TaobaoOrderOrdersOptionInputType]
  }
  input TaobaoOrderInputType {
    orderNumber: String
    orderDate: String
    orderTime: String
    purchaseAmount: String
    shippingFee: String
    orders: [TaobaoOrderOrdersInputType]
  }
  type CategroySalesType {
    _id: String
    categoryId: String
    count: Int
    purchaseCnt: Int
    recentSaleCount: Int
    category1: String
    category2: String
    category3: String
    category4: String
  }

  type SimilarProductsType {
    title: String
    image: String
    link: String
  }

  type SimilarProductsKorType {
    korTitle: String
    title: String
    image: String
    link: String
  }

  input SimilarProductInputType {
    title: String
    image: String
    link: String
  }
  type CombineTitleType {
    keyword: String
    count: Int
    isMain: Boolean
    rank: Int
  }


  type DetailImageListType {
    _id: ID
    name: String
    detailUrl: String
    image: String
    content: String
    isContentTranslate: Boolean
    createdAt: String
  }

  input ModifyDetailPageType {
    _id: ID
    content: [String]
  }

  type Query {
    "A simple type for getting started!"
    hello: String
    searchCategory(categoryID: String): [CategorySourcingResponse]
    searchKeyword(keyword: String): [CategorySourcingResponse]

    searchTaobaoImage(imageUrl: String): [TaobaoSourcingResponse]
    searchTaobaoKeyword(keyword: String): [TaobaoSourcingResponse]
    searchTaobaoDetail(
      detailUrl: String!
      title: String
      naverID: String
      naverCategoryCode: Int
      naverCategoryName: String
    ): TaobaoDetailResponse
    CoupangRecommendedCategory(productName: String!): CoupangRecommendedCategory
    CoupangCategorySearch(displayCategoryCode: String): Boolean
    CoupangDisplayCategoryes: [CoupangCategory1]
    CoupangOutbound: Boolean
    MarketBasicInfo: MarketBasicInfoType
    CoupangCategoryMeta(categoryCode: String): CoupangCategoryMetaResponse
    BasicInfo: BasicInfoType
    Cafe24OriginType(offset: Int): [Cafe24OriginType]
    CoupangGET_PRODUCT_BY_PRODUCT_ID(productID: String): Boolean

    TaobaoFavoriteList(
      page: Int
      perPage: Int
      search: String
      startDate: String
      endDate: String
    ): TaobaoFavoriteListResponse
    ProductDetail(productID: ID!): TaobaoDetailResponse
    FindShippingFee(mallName: String, crUrl: String): Int
    RelatedKeywordsOnly(keywords: [String]): [RepresentativeKeywordType]
    GetKeywordViews(keywords: [String]): [RelatedKeywordType]
    GetCategoryKeywords(category: String): [CategoryKeywordType]
    RelatedKeywordOnly(keyword: String): [String]
    ProductCountDaily(userID: ID): [DailyCountType]
    searchTitleWithKeyword(keywords: [String]): [TitleKeywordsType]
    favoriteSourcing: Boolean

    GetNaverStore(url: String): [CoupangItemType]
    GetNaverBest: [NaverItemType]

    GetNaverFlashItem: [NaverDetailItemType]
    GetNaverFlashDetail(itemID: ID, detail: String): TaobaoDetailItemType

    CreateProductDetail(
      _id: ID
      naverID: String
      naverCategoryCode: Int
      naverCategoryName: String
    ): TaobaoDetailResponse
    GetKeyword(keyword: String): RelatedKeywordType
    GetCookie: String
    GetCoupangItemList(url: String): [CoupangItemListType]
    GetCoupangItemList1(url: String): [CoupangItemListType]

    GetBrandList: BrandResponseType
    GetItemWinnerProcessingList(userID: ID): [ItemWinnerType]
    getAccountList: [AccountType]
    TranslatePapago(text: String): String
    Test(keyword: String): Boolean

    GetCoupangMallList: [CoupangMallType]
    GetNaverMallList: [CoupangMallType]
    GetCoupangMallFavoriteList: [CoupangMallType]
    GetNaverMallFavoriteList: [CoupangMallType]

    GetAddPriceList: [AddPriceType]
    GetIherbAddPriceList: [AddPriceType]
    GetAliAddPriceList: [AddPriceType]
    GetAmazonJPAddPriceList: [AddPriceType]
    GetShippingPriceList: [AddPriceType]
    GetIherbShippingPriceList: [AddPriceType]
    GetAliShippingPriceList: [AddPriceType]
    GetAmazonJPShippingPriceList: [AddPriceType]
    GetMargin: Float

    GetLowestPriceList(
      page: Int
      perPage: Int
      search: String
      notWinner: Boolean
      isNaver: Boolean
      isWinner: Boolean
      isExcept: Boolean
      isManage: Boolean
    ): LowestPriceResponse

    GetKiprisWord(search: String): [KiprisType]

    ListAllOrders(orderState: String, userID: ID): [OrderInfoType]

    SalesClendar(date: String, userID: ID): SalesClendarType
    SalesMonthClendar(date: String, userID: ID): SalesClendarType

    SalesDetail(startDate: String, endDate: String, userID: ID): [MarketOrderSimpleType]

    OrderCount(orderState: String): Int

    EngTranslate(text: String): String
    KorToEngTranslate(text: String): String

    BaedaegiList(page: Int, perPage: Int, search: String, filterOption: Int): BaedaegiResponseType

    NewZipCode(keyword: String): String

    TabaeDelay: [TabaeDelyType]

    GetSoEasyPasssword: SoEasyPasswordType

    IsRegister(goodID: String): Boolean
    IsUSARegister(asin: String): Boolean

    GetMainImages(_id: ID): [String]
    GetDetailHtml(_id: ID): String
    GetOptions(_id: ID): OptionModalType

    GetNaverItemWithKeyword(category1: String, keyword: String): [NaverShoppingItemType]
    GetNaverItemWithKeywordID(ids: [ID], keyword: String): [NaverShoppingItemType]

    GetAmazonDetailAPI(url: String, title: String): AmazonDataType
    GetiHerbDetailAPI(url: String, title: String): IHerbDataType
    GetAliExpressDetailAPI(url: String, title: String): AliExpressDataType
    GetTaobaoDetailAPI(url: String, title: String): TaobaoDetailAPIType

    GetMarketOrderInfo(orderId: String): MarketOrderInfo
    GetTaobaoOrderSimpleInfo(orderId: String): TaobaoOrderSimpleInfo

    GetProhibit(asin: String): ProhibitType

    GetNaverCatalogKeyword(catalog: String, keyword: String): [TitleKeywordType]

    GetMarketOrder(orderId: String, userID: ID): MarkerOrderType
    GetDeliveryOrder(orderId: String, userID: ID): [DeliveryOrderType]
    GetTaobaoOrder(taobaoOrderNo: [String], userID: ID): [TaobaoOrderType]

    GetCategorySales(sort: String):[CategroySalesType]

    Cafe24Boards(userID: ID): Boolean
  }

  type Mutation {
    ProductList(
      page: Int
      perPage: Int
      search: String
      startDate: String
      endDate: String
      userID: ID
      notSales: Boolean
    ): ProductListResponse
    authGoogle(input: AuthInput!): AuthResponse
    authNaver(input: AuthInput!): AuthResponse
    isLogin: AuthResponse!
    taobaoLogin(loginID: String!, password: String!): Boolean
    onceTaobaoLogin: Boolean
    SetTaobaoBasicInfo(loginID: String!, password: String!, imageKey: String): Boolean
    SetCoupangBasicInfo(
      vendorUserId: String!
      vendorId: String!
      accessKey: String!
      secretKey: String!
      deliveryCompanyCode: String!
      deliveryChargeType: String!
      deliveryCharge: Int
      deliveryChargeOnReturn: Int
      returnCharge: Int
      outboundShippingTimeDay: Int
      invoiceDocument: String
      maximumBuyForPerson: Int
      maximumBuyForPersonPeriod: Int
    ): Boolean
    SetCafe24BasicInfo(mallID: String, password: String, shop_no: Int): Boolean
    SetInterParkBasicInfo(userID: String, password: String): Boolean
    SetBasicInfo(
      afterServiceInformation: String!
      afterServiceContactNumber: String!
      topImage: String
      bottomImage: String
      clothImage: String
      shoesImage: String
      kiprisInter: Boolean
    ): Boolean
    CreateProduct(
      id: ID!
      product: Product
      cafe24: Cafe24ProductInputType
      options: [ProductOptions]
      coupang: CoupangProductInputType
    ): CreateProductResponse
    CreateCoupang(
      id: ID!
      product: Product
      options: [ProductOptions]
      coupang: CoupangProductInputType
    ): CreateCoupangResponse
    CreateCafe24(
      id: ID!
      product: Product
      cafe24: Cafe24ProductInputType
      options: [ProductOptions]
    ): CreateCafe24Response
    DeleteProduct(coupangID: String, cafe24ID: Int, mallID: String): Boolean
    DeleteCoupang(coupangID: String): Boolean
    DeleteCafe24(cafe24ID: Int, mallID: String): Boolean
    CreateCategory(mallID: String!, userID: ID!): Boolean
    AddShoppingBag(url: String, key1: String, key2: String): Boolean
    RelatedKeyword(keyword: String): [RelatedKeywordType]
    SentimentRank(keyword: String): [RelatedKeywordType]
    RelatedKeywordOnly(keyword: String): [String]
    SentimentRankOnly(keyword: String): [String]
    searchTitle(keyword: String): [TitleKeywordType]
    DeleteFavoriteItem(id: ID!): Boolean
    DeleteFavoriteAllItem: Boolean
    GetCoupangStore(url: String, sort: String): [CoupangItemType]
    GetCoupangCategoryMeta(categoryCode: String): CoupangCategoryMetaResponse
    SetisTaobaoItem(id: ID!): Boolean
    GetExcelNaver: Boolean
    GetCategoryWithTitle(title: String): Boolean
    Cafe24Auto: Boolean
    Cafe24Token: Boolean
    InterparkAuto: Boolean
    VatListType(startDate: String, endDate: String, search: String, userID: ID): [VatListType]
    GetDeliveryImage(shippingNumber: String, type: String): String
    SetCookie(cookie: String): Boolean
    TaobaoImageListUrl(imageUrl: String): TaobaoImageSearchType
    UploadItemWinner(
      _id: ID
      coupangID: ID
      title: String
      detailUrl: String
      subPrice: Int
      isClothes: Boolean
      isShoes: Boolean
      userID: ID
    ): Boolean
    UploadItemWinner1(
      _id: ID
      coupangID: ID
      title: String
      detailUrl: String
      subPrice: Int
      isClothes: Boolean
      isShoes: Boolean
    ): Boolean
    UploadNaverItemWinner(input: [WinnerItemType]): Boolean
    UploadItemWinnerList(input: [CoupangWinnerInputType]): Boolean
    UploadItemNaverList(input: [NaverItmeInputType]): Boolean
    UploadItemCoupangList(input: [NaverItmeInputType]): Boolean
    UpdateBanWord(_id: ID, word: String): Boolean
    DeleteBanWord(_id: ID): Boolean
    addAccount(email: String): Boolean
    deleteAccount(email: String): Boolean
    BatchTaobaoItem(input: [TaobaoBatchInputType]): Boolean
    GetNaverStoreItemList(url: String): [NaverShoppingItemType]
    GetNaverKeywordItemList(keyword: String): [NaverShoppingItemType]
    GetCoupangStoreItemListNew(url: String): [NaverShoppingItemType]
    GetNaverRecommendItemList(
      limit: Int
      category: String
      regDay: Int
      minRecent: Int
      maxRecent: Int
      totalMinSale: Int
      totalMaxSale: Int
      minReview: Int
      maxReview: Int
      minPrice: Int
      maxPrice: Int
    ): [NaverShoppingItemType]
    GetNaverSavedItemList(
      limit: Int
      category: String
      regDay: Int
      minRecent: Int
      maxRecent: Int
      totalMinSale: Int
      totalMaxSale: Int
      minReview: Int
      maxReview: Int
      minPrice: Int
      maxPrice: Int
    ): [NaverShoppingItemType]
    GetNaverFavoriteRecommendItemList(url: String): [NaverShoppingItemType]
    GetCoupangStoreItemList(url: String): CoupangStoreItemType
    GetCoupangKeywordItemList(keyword: String): CoupangStoreItemType
    SetCoupangFavorite(_id: ID): Boolean
    SetNaverFavorite(_id: ID): Boolean
    VatSearch(userID: ID): Boolean
    GetSubPrice: Int
    SetSubPrice(subPrice: Int): Boolean
    SetAddPrice(_id: ID, title: Float, price: Float): Boolean
    SetIherbAddPrice(_id: ID, title: Float, price: Float): Boolean
    SetAliAddPrice(_id: ID, title: Float, price: Float): Boolean
    SetAmazonJPAddPrice(_id: ID, title: Float, price: Float): Boolean
    DeleteAddPrice(_id: ID): Boolean
    SetShippingPrice(_id: ID, title: Float, price: Float): Boolean
    SetIherbShippingPrice(_id: ID, title: Float, price: Float): Boolean
    SetAliShippingPrice(_id: ID, title: Float, price: Float): Boolean
    SetAmazonJPShippingPrice(_id: ID, title: Float, price: Float): Boolean
    DeleteShippingPrice(_id: ID): Boolean

    GetShippingPrice(userID: ID): [AddPriceType]
    GetUSAShippingPrice(userID: ID): [AddPriceType]

    SetMargin(margin: Float): Boolean

    GetCoupangProductList: Boolean

    SetLowPriceManage(input: [LowPriceManageType]): Boolean
    DeleteProcessItem(_id: ID, userID: ID): Boolean

    ExceptProduct(_id: ID, isExcept: Boolean): Boolean

    AutoPriceManage: Boolean

    DeleteBatch: Boolean
    DuplicateProductList: Boolean
    NaverShoppingUpload: Boolean
    Cafe24Sync: Boolean
    GetKiprisWord(search: String): [KiprisType]

    TaobaoOrderBatch(userID: ID): Boolean
    TabaeOrderBatch(userID: ID): Boolean
    NewTabaeOrderBatch(userID: ID): Boolean

    GetTaobaoItem(orderNumber: String): TaobaoItemType
    UnipassValid(name: String, customID: String, phone: String): Boolean

    DeleteCoupangItem(userID: ID, input: [CoupangWinnerItemType]): Boolean

    SetOrderShipping(input: [Cafe24ShipInputType]): Boolean

    ModifyWeightPrice(id: ID, weight: Float, userID: ID): String
    ModifyProductTitle(id: ID, title: String, userID: ID): String
    ModifyProductMainImages(id: ID, mainImages: [String], userID: ID): Boolean
    ModifyProductHtml(id: ID, html: String, userID: ID): Boolean

    BaedaegiItmeDelete(orderNumber: String, isDelete: Boolean): Boolean
    BaedaegiItmeMarketOrderNoModify(orderNumber: String, marketNumber: String, index: Int): Boolean

    CoupangApprove(sellerProductId: String): Boolean
    CoupangApproves(sellerProductId: [String]): Boolean

    DelleteSelectedRowItem(input: [RowInput], userID: ID): Boolean

    SetSoEasyPassword(password: String): Boolean

    UploadImage(base64Image: String): String

    GetTaobaoDetailAPI(url: String, title: String): TaobaoDetailAPIType

    UploadNaverPlusItem(input: [NaverPlusItem]): Boolean

    SetNaverItemFavoriteTemp(input: NaverShoppingItemInput): Boolean

    NaverRecommendItemList: Boolean

    SetNaverExcept(productNo: String, isDelete: Boolean): Boolean
    ExceptBrand: Boolean

    GetNaverItemList(
      page: Int
      perPage: Int
      sort: String
      limit: Int
      category: String
      regDay: Int
      minRecent: Int
      maxRecent: Int
      totalMinSale: Int
      totalMaxSale: Int
      minReview: Int
      maxReview: Int
      minPrice: Int
      maxPrice: Int
    ): NaverSourcingItemResponse
    GetNaverJanpanItemList(
      page: Int
      perPage: Int
      sort: String
      limit: Int
      category: String
      regDay: Int
      minRecent: Int
      maxRecent: Int
      totalMinSale: Int
      totalMaxSale: Int
      minReview: Int
      maxReview: Int
      minPrice: Int
      maxPrice: Int
    ): NaverSourcingItemResponse
    SetNaverItemFavorite(productNo: String, isFavorite: Boolean): Boolean
    GetNaverFavoriteItemList: [NaverShoppingItemType]
    GetSaledItemList: [NaverShoppingItemType]
    GetNaverJanpanFavoriteItemList: [NaverShoppingItemType]
    SetNaverFavoriteItemDelete: Boolean
    QualityCheck(
      title: String
      category1: String
      category2: String
      category3: String
      category4: String
    ): QualityCheckResponse

    TaobaoOrderManual(userID: ID, input: [TaobaoOrderManualInputType]): Boolean

    AuctionList: Boolean

    ModifyOptions(id: ID, props: [PropInputType], options: [OptionInputType]): Boolean

    NaverShoppingData: Boolean

    NaverMainKeyword(
      search: String
      page: Int
      perPage: Int
      sort: String
      exceptBrand: Boolean
      categoryFilter: [String]
    ): NaverMainKeywordResponse
    NaverHealthFood(
      search: String
      page: Int
      perPage: Int
      sort: String
      categoryFilter: [String]
    ): NaverHealthFoodResponse
    SourcingKeyword(
      search: String
      page: Int
      perPage: Int
      sort: String
      categoryFilter: [String]
      minCount: Int
      maxCount: Int
      minProductCount: Int
      maxProductCount: Int
      minOverSeaProductCount: Int
      maxOverSeaProductCount: Int
      minCompetition: Int
      maxCompetition: Int
      minOverSeaCompetition: Int
      maxOverSeaCompetition: Int
      overSeaProductCount: Int
    ): SourcingKeywordResponse
    MyFavoriteKeyword(
      page: Int
      perPage: Int
      sort: String
      categoryFilter: [String]
    ): SourcingKeywordResponse
    KorToCn(text: String): String

    GetOcrData(url: String): OCRType

    GetAmazonCollection: [IHerbDataType]

    DeleteAmazonCollection(asin: String): Boolean

    GetiHerbOptionPid(url: String): [IHerbOptionPidType]

    GetAliProduct(url: String): Boolean

    SearchCoupangRelatedKeywrod(keyword: String): [String]
    SearchCoupangAutoKeywrod(keyword: String): [String]
    SearchNaverRelatedKeywrod(keyword: String): [String]
    SearchNaverProductKeywrod(keyword: String): [String]
    SearchNaverTagKeyword(keyword: String): [String]
    OptimizationProductName(title: String): String

    SetFavoriteKeyword(keywordID: ID, favorite: Boolean): Boolean

    SetMarketOrder(orderId: String, userID: ID, input: MarketOrderInputType): Boolean
    SetDeliveryOrder(userID: ID, input: [DeliveryOrderInputType]): Boolean
    SetTaobaoOrder(userID: ID, input: [TaobaoOrderInputType]): Boolean
    SyncDeliveryOrder: Boolean
    SetTaobaoUrl(_id: ID, url: String): Boolean

    GetSimilarProducts(urlString: String): [SimilarProductsType]
    GetSimilarProductKorTitle(input: [SimilarProductInputType]): [SimilarProductsKorType]

    GetCombineTitleKeyword(title: String, displayName: String): [CombineTitleType]

    GetDetailImageList(userID: ID): [DetailImageListType]

    SetModifyDetailPage(input:[ModifyDetailPageType]): Boolean
  }
`

module.exports = schema
