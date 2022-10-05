// import React, {useState, useEffect} from "react"
// import styled from "styled-components"
// import { Input, Popconfirm, Modal, Button} from "antd"
// import {
//   EditOutlined,
//   DeleteOutlined,
//   QuestionCircleOutlined
// } from "@ant-design/icons"
// import { SortableElement } from "react-sortable-hoc"
// import 'tui-image-editor/dist/tui-image-editor.css'
// import 'tui-color-picker/dist/tui-color-picker.css'
// import ImageEditor from '@toast-ui/react-image-editor'
// import { useMutation } from "@apollo/client"
// import { UPLOAD_IMAGE } from "../../../gql"

// const ImageEditorForm = SortableElement(({ url, i, handleDelete, handleOK }) => {
//   const [visible, setVisible] = useState(false)
//   const [mainImage, setMainImage] = useState("")
//   const [uploadImage] = useMutation(UPLOAD_IMAGE)
//   const imageEditor = React.createRef()

//   const saveImage = async () => {
//     const imageEditorInst = imageEditor.current.imageEditorInst;
//     const data = imageEditorInst.toDataURL();
//     if (data) {
//       console.log("data--", data)
//       const response = await uploadImage({
//         variables: {
//           base64Image: data
//         }
//       })
//       if(response && response.data.UploadImage){
//         setMainImage(response.data.UploadImage)
//         handleOK(i, response.data.UploadImage)
//         setVisible(false)
//       }
//     }
//   }

//   return (
//     <ul style={{ zIndex: "10" }}>
//       <MainImageWrapper>
//         <MainImage src={url} alt={url} />
        
//         <Modal
//           // title="이미지 변경"
//           visible={visible}
//           centered
//           onOk={() => {
//             handleOK(i, mainImage)
//             setVisible(false)
//           }}
//           onCancel={() => setVisible(false)}
//           width={1100}
//         >
//           {/* <div style={{ display: "flex", justifyContent: "center" }}>
//             <ConfirmMainImage src={mainImage} />
//           </div> */}
//           <ImageEditorContainer>
//           <ImageEditor
//             includeUI={{
//               loadImage: {
//                 path: url,
//                 name: 'SampleImage'
//               },
//               theme: {
              
//               },
//               // menu: ['shape', 'filter', "crop", "flip", "rotation", "drawing", "icon", "text", "mask"],
//               initMenu: 'crop',
//               uiSize: {
//                 width: '1000px',
//                 height: '800px'
//               },
//               menuBarPosition: 'bottom'
//             }}
//             cssMaxHeight={700}
//             cssMaxWidth={700}
//             selectionStyle={{
//               cornerSize: 20,
//               rotatingPointOffset: 70
//             }}
//             usageStatistics={true}
//             ref={imageEditor}
//           />
//           <ButtonContainer>
//             <Button 
//             type="primary"
//               style={{
//                 width: "120px",
//                 borderRadius: "50px"
//               }}
//             size="large" onClick={saveImage}>저장</Button>
//           </ButtonContainer>
//         </ImageEditorContainer>
//           {/* <Input
//             placeholder={"이미지 URL만 입력하세요."}
//             allowClear={true}
//             value={mainImage}
//             onChange={e => setMainImage(e.target.value)}
//           /> */}
          
//         </Modal>
//         <MainImageModifyContianer className={"modify"}>
//           <div
//             className={"modify"}
//             style={{ cursor: "pointer", textAlign: "center" }}
//             onClick={() => {
//               setMainImage(url)
//               setVisible(true)
//             }}
//           >
//             <EditOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
//           </div>
//           <Popconfirm
//             title="삭제하시겠습니까？"
//             icon={<QuestionCircleOutlined style={{ color: "red" }} />}
//             cancelText="취소"
//             okText="삭제"
//             onConfirm={() => handleDelete(i)}
//           >
//             <div className={"modify"} style={{ cursor: "pointer", textAlign: "center" }}>
//               <DeleteOutlined className={"modify"} style={{ color: "white", fontSize: "20px" }} />
//             </div>
//           </Popconfirm>
//         </MainImageModifyContianer>
//       </MainImageWrapper>
//     </ul>
//   )
// })

// export default ImageEditorForm

// const MainImageModifyContianer = styled.div`
//   opacity: 0;
//   position: absolute;
//   left: 0;
//   right: 20px;
//   bottom: 3px;
//   height: 40px;
//   background: rgba(0, 0, 0, 0.4);
//   display: flex;
//   align-items: center;
//   z-index: 10;
//   & > :nth-child(n) {
//     flex: 1;
//   }
// `

// const MainImageWrapper = styled.div`
//   position: relative;
//   &:hover {
//     & > ${MainImageModifyContianer} {
//       opacity: 1;
//     }
//   }
// `
// const MainImage = styled.img`
//   cursor: pointer;
//   min-width: 160px;
//   max-width: 160px;
//   min-height: 160px;
//   max-height: 160px;
//   margin-right: 20px;
// `




// const ConfirmMainImage = styled.img`
//   width: 200px;
//   height: 200px;
//   border-radius: 5px;
//   margin-bottom: 10px;
// `

// const ImageEditorContainer = styled.div`
//   position: relative;
// `

// const ButtonContainer = styled.div`
//   position: absolute;
//   top: 8px;
//   right: 60px;
// `
