import React, {useState, useRef} from "react"
import { Upload, Button, notification } from "antd"
import {FileExcelOutlined} from "@ant-design/icons"
import { OutTable, ExcelRenderer } from "react-excel-renderer"

const ExcelImport = ({onSuccess, size="large", title}) => {

  const excelInput = useRef(null)
  const fileHandler = e => {
    
    let fileObj = e.target.files[0];
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
        notification["error"]({
          message: '파일 에러',
          description:
          err,
        });
      } else {
        try {
          const excelObj = []
          resp.rows.filter((item, index) => index !== 0 && item.length > 0)
          .map(item => {
            const obj = {}
            for(let i = 0; i < resp.rows[0].length; i++){
              obj[resp.rows[0][i]] = item[i]
            }
            excelObj.push(obj)
          })
          console.log("excelObj", excelObj)
          if(typeof onSuccess === "function" ){
            onSuccess(excelObj)
          }
          
        } catch(e) {
          console.log("파싱 에러", e)
          notification["error"]({
            message: '파싱 에러',
            description: e,
          });
        }
        
      }
    });
  };

  return (
    <>
    
    <Button
      size={size}
      icon={<FileExcelOutlined />}
      style={{background: "#33C481", color: "white"}}
      onClick={() => excelInput.current.click()}
    >{title ? title : "엑셀 불러오기"}</Button>
    <input 
      style={{display: "none"}}
      type="file" onChange={fileHandler}
      accept={"application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel.sheet.macroEnabled.12"}
      onClick={e => e.target.value = ""}
      ref={excelInput}
    />
    </>
  )
}

export default ExcelImport