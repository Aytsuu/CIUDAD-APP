// "use client"
// import {useEditor,EditorContent} from "@tiptap/react"
// import StarterKit from "@tiptap/starter-kit"
// import { Toolbar } from "./toolbar"
// import Heading from "@tiptap/extension-heading"
// import BulletList from "@tiptap/extension-bullet-list"
// import OrderedList from "@tiptap/extension-ordered-list"
// import ListItem from "@tiptap/extension-list-item"


// export default function Tiptap({
//     description,
//     onChange,
// }:{
//     description: string
//     onChange: (richText: string) => void
// }) {
//     const editor = useEditor({
//         extensions: [StarterKit.configure({
            
//         }), Heading.configure({
//             HTMLAttributes: {
//                 class: "text-xl font-bold ",
//                 levels: [2],
//             }            
//         }),
//         BulletList, 
//         OrderedList, 
//         ListItem,],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "rounded-md border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//                 // class: "flex flex-col px-4 py-3 justify-start border-b border-l border-gray-700 text-gray-400 items-start w-full gap-3 font-medium text-[16px] pt-4 rounded-bl-md rounded-br-md outline-none"
//             },
//         },
//         onUpdate({ editor }){
//             onChange(editor.getHTML())
//             console.log(editor.getHTML())
//         },
//     })

//     return(
//         <div className="flex flex-col justify-stretch min-h-[250px]">
//             <Toolbar editor={editor}/>
//             <EditorContent style={{ whiteSpace: "pre-line" }} editor={editor} className="mt-[7px]"/>
//         </div>
//     )
// }



// Tiptap.tsx
// "use client"
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Toolbar } from "./toolbar";
// import Heading from "@tiptap/extension-heading";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import ListItem from "@tiptap/extension-list-item";
// import Image from "@tiptap/extension-image";
// import ResizeImage from 'tiptap-extension-resize-image';

// export default function Tiptap({
//     description,
//     onChange,
// }: {
//     description: string;
//     onChange: (richText: string) => void;
// }) {
//     const editor = useEditor({
//         extensions: [
//             StarterKit,
//             Heading.configure({
//                 HTMLAttributes: {
//                     class: "text-xl font-bold ",
//                     levels: [2],
//                 }
//             }),
//             BulletList,
//             OrderedList,
//             ListItem,
//             Image, // Add the image extension
//             ResizeImage, 
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "rounded-md border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             onChange(editor.getHTML());
//             console.log(editor.getHTML());
//         },
//     });

//     const uploadImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
//         const file = event.target.files?.[0];
//         if (!file || !editor) return;
    
//         const imageUrl = URL.createObjectURL(file);
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };

//     return (
//         <div className="flex flex-col justify-stretch min-h-[250px]">
//             <Toolbar editor={editor} uploadImage={uploadImage} />
//             <EditorContent style={{ whiteSpace: "pre-line" }} editor={editor} className="mt-[7px]" />
//         </div>
//     );
// }




"use client"
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "./toolbar";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";
import ResizeImage from 'tiptap-extension-resize-image';
import TextAlign from "@tiptap/extension-text-align";
import { useState } from "react";



export default function Tiptap({
    description,
    onChange,
}: {
    description: string;
    onChange: (richText: string) => void;
}) {

    const editor = useEditor({
        extensions: [
            StarterKit,
            Heading.configure({
                HTMLAttributes: {
                    class: "text-xl font-bold ",
                    levels: [2],
                }
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"], // Apply alignment to headings and paragraphs
                alignments: ["left", "center", "right", "justify"], // Supported alignments
                defaultAlignment: "left", // Default alignment
            }),
            OrderedList.configure({
                HTMLAttributes: {
                  class: "list-decimal pl-5 pr-5",
                },
            }),            
            BulletList,
            ListItem,
            Image, // Add the image extension
            ResizeImage,
        ],
        content: description,
        editorProps: {
            attributes: {
                class: "border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
            console.log(editor.getHTML());
        },
    });

    const uploadImage = (imageUrl: string) => {
        if (!editor) return;
        editor.chain().focus().setImage({ src: imageUrl }).run();
    };


    //MARGIN
    const [editorMargin, setEditorMargin] = useState('96px')

    const handleMarginChange = (margin: string) => {
        setEditorMargin(margin);
        console.log(margin); // Add this line
    };



    //PAPER SIZE
    const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

    const handlePaperSizeChange = (size: 'short' | 'long') => {
        setPaperSize(size);
    };
    
    const getPaperDimensions = () => {
        if (paperSize === 'short') {
            return { width: '816px', height: '1056px' };
        } else {
            return { width: '816px', height: '1248px' };
        }
    };
    
    const dimensions = getPaperDimensions();


      return (
        <div className="flex flex-col h-full w-full">
          <Toolbar editor={editor} uploadImage={uploadImage} onMarginChange={handleMarginChange} onPaperSizeChange={handlePaperSizeChange}/>
          <div className="flex justify-center mt-3">
            <EditorContent key={editorMargin} style={{ whiteSpace: "pre-line" }} editor={editor} className="mt-[7px]" />
          </div>
    
          {/* Add this <style> tag */}
          <style dangerouslySetInnerHTML={{ __html: `
            .tiptap.ProseMirror { /* Target paragraph elements directly */
                padding: ${editorMargin};
                width: ${dimensions.width};
                height: ${dimensions.height};
            }
        ` }} />
        </div>
      );
}


