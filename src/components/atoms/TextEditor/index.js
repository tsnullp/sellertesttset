import React from "react"
import { Editor } from "@tinymce/tinymce-react"
import { useMutation } from "@apollo/client"
import { UPLOAD_IMAGE } from "../../../gql"

const TextEditor = ({ initHtml, html, getHtmlValue, disabled = false, height = 1200 }) => {

  const [uploadImage] = useMutation(UPLOAD_IMAGE)

  const handleEditorChange = value => {

    if (getHtmlValue && typeof getHtmlValue === "function") {
      getHtmlValue(value)
    }
  }

  return (
    <Editor
      apiKey="z3rght94pg0e98mmj9dvczei38xkjykh35ad37sw1f70ajgh"
      initialValue={initHtml}
      value={html}
      disabled={disabled}
      init={{
        height,
        menubar: false,
        paste_as_text: true,
        
        plugins: [
          "advlist autolink lists link",
          // "charmap print preview anchor help",
          "searchreplace visualblocks",
          "insertdatetime media table paste wordcount",
          "image",
          "code",
          "hr",
          "table",
          "emoticons",
        ],
        toolbar:
          "undo redo | fontselect fontsizeselect formatselect | bold italic underline strikethrough | alignleft aligncenter alignright | forecolor backcolor | hr | bullist numlist outdent indent | image emoticons | table | code",
        image_title: true,
        automatic_uploads: true,
        file_picker_types: "image",
        file_picker_callback: async (callback, value, meta) => {
      
          var input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');

          /*
            Note: In modern browsers input[type="file"] is functional without
            even adding it to the DOM, but that might not be the case in some older
            or quirky browsers like IE, so you might want to add it to the DOM
            just in case, and visually hide it. And do not forget do remove it
            once you do not need it anymore.
          */

          input.onchange = async (e) => {
            console.log("onchange", e.path[0].files[0])
            var file = e.path[0].files[0];

            var reader = new FileReader();
            reader.onload = async () => {
              /*
                Note: Now we need to register the blob in TinyMCEs image blob
                registry. In the next release this part hopefully won't be
                necessary, as we are looking to handle it internally.
              */
              var id = 'blobid' + (new Date()).getTime();
              // var blobCache =  tinymce.activeEditor.editorUpload.blobCache;
              const response = await uploadImage({
                variables: {
                  base64Image: reader.result
                }
              })
              console.log("response", response)
              // console.log("reader.result", reader.result)
              // var base64 = reader.result.split(',')[1];
              // var blobInfo = blobCache.create(id, file, base64);
              // blobCache.add(blobInfo);

              /* call the callback and populate the Title field with the file name */
              callback(response.data.UploadImage, { title: file.name });
            };
            reader.readAsDataURL(file);
          };

          input.click();
        }
      }}
      onEditorChange={handleEditorChange}
    />
  )
}

export default TextEditor
