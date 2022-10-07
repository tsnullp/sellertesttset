import React, { useState, useEffect } from "react"
import { Table, Input, DatePicker, Popconfirm, notification, Spin } from "antd"
import styled from "styled-components"
import { useQuery, useMutation } from "@apollo/client"
import {
  GET_TAOBAO_FAVORITE_LIST,
  DELETE_FAVORITE_ITEM,
  DELETE_FAVORITE_ALL_ITEM
} from "../../../gql"
import moment from "moment"
import { useLocation } from "react-router-dom"
import queryString from "query-string"
import { TaobaoCircleOutlined, QuestionCircleOutlined, DeleteOutlined } from "@ant-design/icons"
import url from "url"
import path from "path"
import "moment/locale/ko"
moment.locale("ko")

const { shell, remote } = window.require("electron")

const { RangePicker } = DatePicker
const { Search } = Input

// const { shell, remote, isDev  = true } = window

const dateFormat = "YYYY-MM-DD"
const TaobaoFavoriteList = () => {
  const location = useLocation()
  const query = queryString.parse(location.search)
  const [isLoading, setLoading] = useState(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
  const [search, setSearch] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [deleteProduct] = useMutation(DELETE_FAVORITE_ITEM)
  const [deleteAllProduct] = useMutation(DELETE_FAVORITE_ALL_ITEM)
  const { data, refetch, networkStatus } = useQuery(GET_TAOBAO_FAVORITE_LIST, {
    variables: {
      page: pagination.current,
      perPage: 10,
      search,
      startDate,
      endDate
    },
    pollInterval: 60000,
    //fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
    onCompleted: data => {
      setPagination({
        ...pagination,
        total: data.TaobaoFavoriteList.count
      })
    }
  })

  const isDev = query && query.isDev === "true" ? true : false

  useEffect(() => {
    refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key])

  const confirm = async data => {
    setLoading(data._id)
    const response = await deleteProduct({
      variables: {
        id: data._id
      }
    })

    if (response.data.DeleteFavoriteItem) {
      notification["success"]({
        message: "삭제하였습니다."
      })
      refetch()
    } else {
      notification["error"]({
        message: "실패하였습니다. 잠시 후 다시 시도해 보세요."
      })
    }
    setLoading(null)
  }

  const columns = [
    {
      title: "",
      dataIndex: "url",

      render: url => (
        <ColumnContainer>
          <TaobaoCircleOutlined
            style={{ fontSize: "20px" }}
            onClick={() => shell.openExternal(url)}
          />
        </ColumnContainer>
      ),
      width: "30px"
    },
    {
      title: "이미지",
      dataIndex: "mainImage",

      render: url => (
        <ColumnContainer>
          <MainImage src={url} />
        </ColumnContainer>
      ),
      width: "30px"
    },

    {
      title: "상품명",
      dataIndex: "",

      render: data => (
        <ColumnContainer>
          <TitleLabel onClick={() => handleNewWindow(data)}>{data.korTitle}</TitleLabel>
        </ColumnContainer>
      )
    },

    {
      title: "수집일 ",
      dataIndex: "createdAt",

      render: createdAt => (
        <ColumnContainer>{moment(Number(createdAt)).format("YYYY-MM-DD")}</ColumnContainer>
      ),
      width: "120px"
    },
    {
      title: "",
      dataIndex: "",
      key: "x",
      render: data => {
        if (isLoading === data._id) {
          return <Spin />
        } else {
          return (
            <Popconfirm
              title="삭제하시겠습니까？"
              icon={<QuestionCircleOutlined style={{ color: "red" }} />}
              cancelText="취소"
              okText="삭제"
              onConfirm={() => confirm(data)}
            >
              <ColumnContainer>
                <DeleteOutlined style={{ fontSize: "20px" }} />
              </ColumnContainer>
            </Popconfirm>
          )
        }
      }
    }
  ]

  const handleTableChange = (pagination, filters, sorter) => {
    // this.fetch({
    //   sortField: sorter.field,
    //   sortOrder: sorter.order,
    //   pagination,
    //   ...filters,
    // });
    // refetch({
    //   variables: {
    //     page: pagination.current,
    //     perPage: 10
    //   }
    // })
    setPagination(pagination)
  }

  const handleNewWindow = data => {
    const BrowserWindow = remote.BrowserWindow
    const win = new BrowserWindow({
      width: 1600,
      height: 1000,
      frame: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        webSecurity: false
      }
    })
    win.setAutoHideMenuBar(true)
    // win.loadURL(`http://localhost:3001#/productUploadWindow/${encodeURIComponent(detail)}`)
    if (isDev) {
      win.loadURL(`http://localhost:3001#/productUpdatedWindow/${data._id}?update=false`)
    } else {
      let dirpath = null
      if (remote.process.platform === "darwin") {
        dirpath = remote.process.execPath.replace("/MacOS/smartseller", "")
      } else {
        dirpath = remote.process.execPath.replace("\\smartseller.exe", "")
      }

      const startUrl = url.format({
        pathname: path.join(decodeURIComponent(dirpath), `resources/app/build/index.html`),
        // pathname: path.join(__dirname, "../../index.html"),
        hash: `/productUpdatedWindow/${data._id}?update=false`,
        protocol: "file:",
        slashes: true
      })

      // win.loadURL(`bulid/index.html#/productUpdatedWindow/${data._id}`)
      //  win.loadURL(`file://${__dirname}/app/build/index.html#/productUpdatedWindow/${data._id}`)
      // win.loadFile(path.join(dirpath, `resources/app/bulid/index.html`))
      win.loadURL(startUrl)

      // win.loadURL(`file:///C:/Program%20Files/smartseller/resources/app/build/index.html#/productUpdatedWindow/${data._id}`);
    }
  }

  return (
    <Container>
      <TopContainer>
        <Popconfirm
          title="전체 삭제하시겠습니까？"
          icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          cancelText="취소"
          okText="삭제"
          onConfirm={async () => {
            await deleteAllProduct()
            refetch()
          }}
        >
          <AllDeleteContainer>
            <DeleteOutlined style={{ fontSize: "20px" }} />
            전체삭제
          </AllDeleteContainer>
        </Popconfirm>

        <TotalCountLabel>
          총<span>{` ${(pagination.total || 0).toLocaleString("ko").toLocaleString("ko")}`}</span>
          개의 상품이 검색되었습니다.
        </TotalCountLabel>
      </TopContainer>
      <SearchContainer>
        <RangePicker
          // locale={{ lang: { locale: "ko_KR" } }}
          // defaultValue={[moment('2015/01/01', dateFormat), moment('2015/01/01', dateFormat)]}
          allowClear={true}
          allowEmpty={[true, true]}
          placeholder={["시작일", "종료일"]}
          size={"large"}
          format={dateFormat}
          // value={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
          onChange={value => {
            if (!value) {
              setStartDate("")
              setEndDate("")
            }
            if (value && value[0]) {
              setStartDate(value[0].format("YYYYMMDD"))
            } else {
              setStartDate("")
            }

            if (value && value[1]) {
              setEndDate(value[1].format("YYYYMMDD"))
            } else {
              setEndDate("")
            }
          }}
        />
        <Search
          allowClear={true}
          placeholder="상품명을 입력하세요."
          size="large"
          onSearch={value => {
            setSearch(value)
            refetch()
          }}
          enterButton
        />
      </SearchContainer>
      <Table
        columns={columns}
        rowKey={record => record._id}
        dataSource={data && data.TaobaoFavoriteList ? data.TaobaoFavoriteList.list : []}
        pagination={pagination}
        loading={networkStatus === 1 || networkStatus === 2 || networkStatus === 4}
        onChange={handleTableChange}
      />
    </Container>
  )
}

export default TaobaoFavoriteList

const Container = styled.div`
  padding: 50px;

  & > :nth-child(1) {
    margin-bottom: 10px;
  }
`

const TitleLabel = styled.div`
  cursor: pointer;
  font-weight: 700;
  &:hover {
    text-decoration: underline;
    color: blueviolet;
  }
`

const MainImage = styled.img`
  min-width: 80px;
  max-width: 80px;
  min-height: 80px;
  max-height: 80px;
  border-radius: 5px;
`

const ColumnContainer = styled.div`
  cursor: pointer;
  vertical-align: middle;
  display: table-cell;
`

const AllDeleteContainer = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 15px;
`

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  & > :nth-child(1) {
    min-width: 300px;
    margin-right: 20px;
  }
`

const TopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`
const TotalCountLabel = styled.div`
  font-size: 14px;

  & > span {
    font-size: 18px;
    font-weight: 700;
    color: #ff545c;
  }
`
