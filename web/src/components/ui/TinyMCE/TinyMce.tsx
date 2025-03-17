// import { useState } from 'react';
// import { Editor } from '@tinymce/tinymce-react';

// export default function TinyMce (){
//     const [text, setText] = useState('');
//     const [value, setValue] = useState('<p>Enter Details</p>');

//     console.log("Value: ", value);
//     console.log("Text: ", text);
//     return(
//         <>
//             <Editor
//                 apiKey='kq90y03ijpz65uz8nsahsv777zz7lqlqcozpq3al9i0dsnwt'
//                 onEditorChange={(newValue: any, editor: any) => {
//                     setValue(newValue);
//                     setText(editor.getContent({ format: 'text' }));
//                 }}
//                 onitInit={(evt: any, editor: any) => {
//                     setText(editor.getContent({ format: "text" }))
//                 }}
//                 value={value}
//                 init={{
//                     plugins: "a11ychecker advcode advlist advtable anchor autocorrect autolink autoresize autosave casechange charmap checklist code codesample directionality editimage emoticons export footnotes formatpainter fullscreen image importcss inlinecss insertdatetime link linkchecker lists media mediaembed mentions mergetags nonbreaking pagebreak pageembed permanentpen powerpaste preview quickbars save searchreplace table tableofcontents template tinydrive tinymcespellchecker typography visualblocks visualchars wordcount"
//                 }}
//             />
            
//         </>
//     )
// }




import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';

export default function TinyMce() {
    const editorRef = useRef<any>(null); 

    const log = () => {
    if (editorRef.current) {
        console.log(editorRef.current.getContent());
    }
    };
    return (
    <>
        <Editor
            apiKey='kq90y03ijpz65uz8nsahsv777zz7lqlqcozpq3al9i0dsnwt'
            onInit={(_evt: any, editor: any) => editorRef.current = editor}
            initialValue="<p>This is the initial content of the editor.</p>"
            init={{
                height: 800,
                width: 1000,
                menubar: false,
                plugins: [
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount', 'pagebreak',
                'fontsizeinput', 'underline', 'editimage', 'backcolor ', 'fontfamily', 'exportpdf'
                ],
                toolbar: 'undo redo | fontfamily fontsizeinput | blocks |forecolor backcolor | ' +
                'bold italic underline | pagebreak image | align bullist numlist |' +
                'outdent indent | ' +
                'removeformat exportpdf | help | ',

                content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',

                images_upload_handler: async (blobInfo: any, progress: any) => {
                    return new Promise((resolve, reject) => {
                        const file = blobInfo.blob();
                        const reader = new FileReader();

                        reader.onloadend = () => {
                            resolve(reader.result as string);
                        };

                        reader.onerror = () => {
                            reject('Failed to read file');
                        };

                        reader.readAsDataURL(file); // Converts image to Base64
                    });
                }
       
            }}
        />
    </>
    );
}


