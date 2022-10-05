import React, {useState, useEffect} from "react"
import {Modal, Checkbox, Slider, Radio } from "antd"
import styled from "styled-components"
const SearchFilter = ({isModalVisible, handleOk, handleCancel}) => {

  const [sort, setSort] = useState(Number(localStorage.getItem("sort") || "a"))

  const [limit, setLimit] = useState(Number(localStorage.getItem("recommendLimit") || 10))
  const [regDay, setRegDay] = useState(Number(localStorage.getItem("regDay") || 300))

  const [minRecent, setMinRecent] = useState(Number(localStorage.getItem("minRecent") || 1))
  const [maxRecent, setMaxRecent] = useState(Number(localStorage.getItem("maxRecent") || 50))
  
  const [totalMinSale, setTotalMinSale] = useState(Number(localStorage.getItem("totalMinSale") || 0))
  const [totalMaxSale, setTotalMaxSale] = useState(Number(localStorage.getItem("totalMaxSale") || 100))

  const [category, setCategory] = useState(localStorage.getItem("filterCateory") || "") 

  const [minReview, setMinReview] = useState(Number(localStorage.getItem("minReview") || 0))
  const [maxReview, setMaxReview] = useState(Number(localStorage.getItem("maxReview") || 1000))

  const [minPrice, setMinPrice] = useState(Number(localStorage.getItem("minPrice") || 0))
  const [maxPrice, setMaxPrice] = useState(Number(localStorage.getItem("maxPrice") || 2000000))
  
  // 패션의류   50000000
  // 패션잡화   50000001
  // 화장품/미용    50000002
  // 디지털/가전    50000003
  // 가구/인테리어  50000004
  // 출산/육아    50000005
  // 식품       50000006
  // 스포츠/레저  50000007
  // 생활/건강    50000008
  // 여가/생활편의  50000009

  useEffect(() => {

    setSort(localStorage.getItem("sort") || "a")
    setLimit(Number(localStorage.getItem("recommendLimit") || 10))
    setRegDay(Number(localStorage.getItem("regDay") || 300))
    setMinRecent(Number(localStorage.getItem("minRecent") || 1))
    setMaxRecent(Number(localStorage.getItem("maxRecent") || 50))
    setTotalMinSale(Number(localStorage.getItem("totalMinSale") || 0))
    setTotalMaxSale(Number(localStorage.getItem("totalMaxSale") || 100))
    setCategory(localStorage.getItem("filterCateory") || "")
    setMinReview(Number(localStorage.getItem("minReview") || 0))
    setMaxReview(Number(localStorage.getItem("maxReview") || 1000))
    setMinPrice(Number(localStorage.getItem("minPrice") || 0))
    setMaxPrice(Number(localStorage.getItem("maxPrice") || 2000000))

  }, [isModalVisible])
  const options = [
    { label: '패션의류', value: '50000000' },
    { label: '패션잡화', value: '50000001' },
    { label: '화장품/미용', value: '50000002' },
    { label: '디지털/가전', value: '50000003' },
    { label: '가구/인테리어', value: '50000004' },
    { label: '출산/육아', value: '50000005' },
    { label: '식품', value: '50000006' },
    { label: '스포츠/레저', value: '50000007' },
    { label: '생활/건강', value: '50000008' },
    { label: '여가/생활편의', value: '50000009' },
  ];


  const handelOKButton = () => {

    localStorage.setItem("sort", sort)
    localStorage.setItem("recommendLimit", limit)
    localStorage.setItem("regDay", regDay)
    localStorage.setItem("minRecent", minRecent)
    localStorage.setItem("maxRecent", maxRecent)
    localStorage.setItem("totalMinSale", totalMinSale)
    localStorage.setItem("totalMaxSale", totalMaxSale)
    localStorage.setItem("filterCateory", category)
    localStorage.setItem("minReview", minReview)
    localStorage.setItem("maxReview", maxReview)
    localStorage.setItem("minPrice", minPrice)
    localStorage.setItem("maxPrice", maxPrice)
    
    handleOk({
      sort: sort,
      recommendLimit: limit,
      regDay: regDay,
      minRecent: minRecent,
      maxRecent: maxRecent,
      totalMinSale: totalMinSale,
      totalMaxSale: totalMaxSale,
    })

    
  }

  const handleCancelButton = () => {
    
    handleCancel()
  }

  const limitMarks = {
    0: '0',
    5: '5',
    10: '10',
    20: '20',
    30: '30',
    100: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };

  const regDayMarks = {
    0: '0',
    30: '30',
    60: '60',
    90: '90',
    120: '120',
    150: '150',
    180: '180',
    300: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };

  const recentMarks = {
    0: '0',
    5: '5',
    10: '10',
    20: '20',
    30: '30',
    50: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };

  const totalMarks = {
    0: '0',
    5: '5',
    10: '10',
    20: '20',
    30: '30',
    100: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };

  const reviewMarks = {
    0: '0',
    50: '50',
    100: '100',
    200: '200',
    300: '300',
    1000: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };

  const priceMarks = {
    0: '0',
    30000: '3만',
    50000: '5만',
    100000: '10만',
    150000: '15만',
    300000: '30만',
    500000: '50만',
    1000000: '100만',
    2000000: {
      style: {
        color: '#f50',
      },
      label: <strong>최대</strong>,
    },
  };
  
  const onLimitChange = (value) => {
    setLimit(value)
    
  }
  const onRegDayChange = (value) => {
    setRegDay(value)
    
  }
  const onRecentChange = (value) => {
    setMinRecent(value[0])
    setMaxRecent(value[1])
  }

  const onTotalChange = (value) => {
    setTotalMinSale(value[0])
    setTotalMaxSale(value[1])
  }

  const onReviewChange = (value) => {
    setMinReview(value[0])
    setMaxReview(value[1])
  }

  const onPriceChange = (value) => {
    setMinPrice(value[0])
    setMaxPrice(value[1])
  }

  const limitSubTitle = () => {
    if(limit === 0){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else {
      return (
        <SliderSubTitle>
          {`${limit}이상`}
        </SliderSubTitle>
      )
    }
  }

  const regDaySubTitle = () => {
    if(regDay === 0){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else if(regDay === 300) {
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      ) 
    }else {
      return (
        <SliderSubTitle>
          {`${regDay}이내`}
        </SliderSubTitle>
      )
    }
  }


  const recentSubTitle = () => {
    
    if(minRecent === 0 && maxRecent === 50){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else if(minRecent === 0 && maxRecent < 50){
      return (
        <SliderSubTitle>
          {`${maxRecent}까지`}
        </SliderSubTitle>
      )
    } else if(minRecent > 0 && maxRecent === 50){
      return (
        <SliderSubTitle>
          {`${minRecent}부터`}
        </SliderSubTitle>
      )
    } else{
      return (
        <SliderSubTitle>
          {`${minRecent}~${maxRecent}`}
        </SliderSubTitle>
      )
    }
  }
  const totalSubTitle = () => {
    if(totalMinSale === 0 && totalMaxSale === 100){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else if(totalMinSale === 0 && totalMaxSale < 100){
      return (
        <SliderSubTitle>
          {`${totalMaxSale}까지`}
        </SliderSubTitle>
      )
    } else if(totalMinSale > 0 && totalMaxSale === 100){
      return (
        <SliderSubTitle>
          {`${totalMinSale}부터`}
        </SliderSubTitle>
      )
    } else{
      return (
        <SliderSubTitle>
          {`${minRecent}~${totalMaxSale}`}
        </SliderSubTitle>
      )
    }
  }

  const reviewSubTitle = () => {
    if(minReview === 0 && maxReview === 1000){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else if(minReview === 0 && maxReview < 1000){
      return (
        <SliderSubTitle>
          {`${maxReview}까지`}
        </SliderSubTitle>
      )
    } else if(minReview > 0 && maxReview === 1000){
      return (
        <SliderSubTitle>
          {`${minReview}부터`}
        </SliderSubTitle>
      )
    } else{
      return (
        <SliderSubTitle>
          {`${minReview}~${maxReview}`}
        </SliderSubTitle>
      )
    }
  }

  const priceSubTitle = () => {
    if(minPrice === 0 && maxPrice === 2000000){
      return (
        <SliderSubTitle>
          전체
        </SliderSubTitle>
      )
    } else if(minPrice === 0 && maxPrice < 2000000){
      return (
        <SliderSubTitle>
          {`${maxPrice.toLocaleString("ko")}까지`}
        </SliderSubTitle>
      )
    } else if(minPrice > 0 && maxPrice === 2000000){
      return (
        <SliderSubTitle>
          {`${minPrice.toLocaleString("ko")}부터`}
        </SliderSubTitle>
      )
    } else{
      return (
        <SliderSubTitle>
          {`${minPrice.toLocaleString("ko")}~${maxPrice.toLocaleString("ko")}`}
        </SliderSubTitle>
      )
    }
  }

  const categoryOnChange = (checkedValues) => {
    setCategory(checkedValues.join())

  }

  const onRadioChange = (e) => {
    console.log(`radio checked:${e.target.value}`);
    setSort(e.target.value)
  }
  return (
    <Modal title="검색 필터 설정" visible={isModalVisible} onOk={handelOKButton} onCancel={handleCancelButton}>
      <SliderTitle>정렬</SliderTitle>
      <SliderContainer>
        <Radio.Group onChange={onRadioChange} value={sort}>
        <Radio.Button value="a">수집일순</Radio.Button>
        <Radio.Button value="b">최근등록일순</Radio.Button>
        <Radio.Button value="c">판매건순</Radio.Button>
      </Radio.Group>
      </SliderContainer>
      <SliderTitle>카테고리</SliderTitle>
      <SliderContainer>
      <Checkbox.Group options={options} value={category.split(",")} onChange={categoryOnChange} />
      </SliderContainer>
      <TitleContainer>
      <SliderTitle>검색결과</SliderTitle>
      {limitSubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider marks={limitMarks} value={limit} min={1}
        onChange={onLimitChange}
        />
      </SliderContainer>

      <TitleContainer>
      <SliderTitle>등록일</SliderTitle>
      {regDaySubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider marks={regDayMarks} value={regDay} min={1} max={300}
        onChange={onRegDayChange}
        />
      </SliderContainer>

      <TitleContainer>
      <SliderTitle>최근 3일 판매량</SliderTitle>
      {recentSubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider range marks={recentMarks} value={[minRecent, maxRecent]} max={50}
        onChange={onRecentChange}
        />
      </SliderContainer>

      <TitleContainer>
      <SliderTitle>최근 6개월 판매량</SliderTitle>
      {totalSubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider range marks={totalMarks} value={[totalMinSale, totalMaxSale]}
        onChange={onTotalChange}
        />
      </SliderContainer>

      <TitleContainer>
      <SliderTitle>리뷰</SliderTitle>
      {reviewSubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider range marks={reviewMarks} value={[minReview, maxReview]} max={1000}
        onChange={onReviewChange}
        />
      </SliderContainer>

      <TitleContainer>
      <SliderTitle>판매가격</SliderTitle>
      {priceSubTitle()}
      </TitleContainer>
      <SliderContainer>
        <Slider range marks={priceMarks} value={[minPrice, maxPrice]} max={2000000} step={1000}
        onChange={onPriceChange}
        />
      </SliderContainer>
      
    </Modal>
  )
}

export default SearchFilter

const SliderTitle = styled.div`
  font-size: 14px;
`

const SliderContainer = styled.div`
  margin-bottom: 20px;
`

const SliderSubTitle = styled.div`
  font-size: 18px;
  color: #f50;
  font-weight: 700;
`

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  &>:nth-child(1){
    margin-right: 12px;
  }
`