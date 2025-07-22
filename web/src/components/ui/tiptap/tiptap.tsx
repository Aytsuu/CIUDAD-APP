 
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
// import TextAlign from "@tiptap/extension-text-align";
// import { useState } from "react";



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
//             TextAlign.configure({
//                 types: ["heading", "paragraph"], // Apply alignment to headings and paragraphs
//                 alignments: ["left", "center", "right", "justify"], // Supported alignments
//                 defaultAlignment: "left", // Default alignment
//             }),
//             OrderedList.configure({
//                 HTMLAttributes: {
//                   class: "list-decimal pl-5 pr-5",
//                 },
//             }),            
//             BulletList,
//             ListItem,
//             Image, // Add the image extension
//             ResizeImage,
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             onChange(editor.getHTML());
//             console.log(editor.getHTML());
//         },
//     });

//     const uploadImage = (imageUrl: string) => {
//         if (!editor) return;
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };


//     //MARGIN
//     const [editorMargin, setEditorMargin] = useState('96px')

//     const handleMarginChange = (margin: string) => {
//         setEditorMargin(margin);
//         console.log(margin); // Add this line
//     };



//     //PAPER SIZE
//     const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

//     const handlePaperSizeChange = (size: 'short' | 'long') => {
//         setPaperSize(size);
//     };
    
//     const getPaperDimensions = () => {
//         if (paperSize === 'short') {
//             return { width: '816px', height: '1056px' };
//         } else {
//             return { width: '816px', height: '1248px' };
//         }
//     };
    
//     const dimensions = getPaperDimensions();


//       return (
//         <div className="flex flex-col h-full w-full">
//           <Toolbar editor={editor} uploadImage={uploadImage} onMarginChange={handleMarginChange} onPaperSizeChange={handlePaperSizeChange}/>
//           <div className="flex justify-center mt-3">
//             <EditorContent key={editorMargin} style={{ whiteSpace: "pre-line" }} editor={editor} className="mt-[7px]" />
//           </div>
    
//           {/* Add this <style> tag */}
//           <style dangerouslySetInnerHTML={{ __html: `
//             .tiptap.ProseMirror { 
//                 padding: ${editorMargin};
//                 width: ${dimensions.width};
//                 height: ${dimensions.height};
//             }
//         ` }} />
//         </div>
//       );
// }




// "use client";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Toolbar } from "./toolbar";
// import Heading from "@tiptap/extension-heading";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import ListItem from "@tiptap/extension-list-item";
// import Image from "@tiptap/extension-image";
// import ResizeImage from 'tiptap-extension-resize-image';
// import TextAlign from "@tiptap/extension-text-align";
// import { useEffect, useState } from "react";

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
//             TextAlign.configure({
//                 types: ["heading", "paragraph"],
//                 alignments: ["left", "center", "right", "justify"],
//                 defaultAlignment: "left",
//             }),
//             OrderedList.configure({
//                 HTMLAttributes: {
//                     class: "list-decimal pl-5 pr-5",
//                 },
//             }),
//             BulletList,
//             ListItem,
//             Image,
//             ResizeImage,
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "border border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             onChange(editor.getHTML());
//             checkPagination();
//         },
//     });


//     const uploadImage = (imageUrl: string) => {
//         if (!editor) return;
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };


//     // User-defined margin
//     const [editorMargin, setEditorMargin] = useState("96px");

//     const handleMarginChange = (margin: string) => {
//         setEditorMargin(margin);
//     };

//     // Paper size selection
//     const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

//     const handlePaperSizeChange = (size: 'short' | 'long') => {
//         setPaperSize(size);
//     };

//     const getPaperDimensions = () => {
//         return paperSize === 'short'
//             ? { width: '816px', height: '1056px' }
//             : { width: '816px', height: '1248px' };
//     };

//     const dimensions = getPaperDimensions();

//     // State to hold paginated content
//     const [pages, setPages] = useState<string[]>([description]);

//     useEffect(() => {
//         checkPagination();
//     }, [description, paperSize]);


//     const checkPagination = () => {
//         const editorContent = document.getElementById("editor-content");
//         if (!editorContent) return;
    
//         const text = editor?.getHTML() || "";
//         const blocks = text.split("</p>"); // Split text into paragraphs (or use regex for better precision)
//         const pageHeight = Number(dimensions.height.replace("px", "")) - 50;
    
//         let currentPage = "";
//         let newPages: string[] = [];
//         let tempDiv = document.createElement("div");
    
//         // Apply the same styles as the editor
//         tempDiv.style.position = "absolute";
//         tempDiv.style.visibility = "hidden";
//         tempDiv.style.width = dimensions.width;
//         tempDiv.style.height = "auto";
//         tempDiv.style.whiteSpace = "pre-wrap";
//         tempDiv.style.padding = editorMargin;
//         tempDiv.style.fontSize = "16px"; // Match actual text size
//         document.body.appendChild(tempDiv);
    
//         for (let block of blocks) {
//             tempDiv.innerHTML = currentPage + block + "</p>"; // Wrap paragraph
//             if (tempDiv.clientHeight > pageHeight) {
//                 newPages.push(currentPage);
//                 currentPage = block + "</p>"; // Start new page
//             } else {
//                 currentPage += block + "</p>";
//             }
//         }
    
//         newPages.push(currentPage); // Add the last page
//         document.body.removeChild(tempDiv);
    
//         setPages(newPages);
//     };
    

//     return (
//         <div className="flex flex-col h-full w-full">
//             <Toolbar
//                 editor={editor}
//                 uploadImage={uploadImage}
//                 onMarginChange={handleMarginChange}
//                 onPaperSizeChange={handlePaperSizeChange}
//             />

//             <div className="flex flex-col items-center mt-3">
//                 {pages.map((content, index) => (
//                     <div key={index} className="page border bg-white mb-5 shadow-lg" style={{ width: dimensions.width, height: dimensions.height }}>
//                         <EditorContent
//                             key={index}
//                             editor={editor}
//                             style={{ padding: editorMargin }}
//                         />
//                     </div>
//                 ))}
//             </div>

//             <style dangerouslySetInnerHTML={{
//                 __html: `
//                 .page {
//                     overflow: hidden;
//                     page-break-after: always;
//                     display: flex;
//                     flex-direction: column;
//                 }
//                 `
//             }} />
//         </div>
//     );
// }







// "use client";
// import { useEditor, EditorContent } from "@tiptap/react";
// import StarterKit from "@tiptap/starter-kit";
// import { Toolbar } from "./toolbar";
// import Heading from "@tiptap/extension-heading";
// import BulletList from "@tiptap/extension-bullet-list";
// import OrderedList from "@tiptap/extension-ordered-list";
// import ListItem from "@tiptap/extension-list-item";
// import Image from "@tiptap/extension-image";
// import ResizeImage from 'tiptap-extension-resize-image';
// import TextAlign from "@tiptap/extension-text-align";
// import { useEffect, useState } from "react";

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
//             TextAlign.configure({
//                 types: ["heading", "paragraph"],
//                 alignments: ["left", "center", "right", "justify"],
//                 defaultAlignment: "left",
//             }),
//             OrderedList.configure({
//                 HTMLAttributes: {
//                     class: "list-decimal pl-5 pr-5",
//                 },
//             }),
//             BulletList,
//             ListItem,
//             Image,
//             ResizeImage,
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "border border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             onChange(editor.getHTML());
//             checkPagination();
//         },
//     });

//     const uploadImage = (imageUrl: string) => {
//         if (!editor) return;
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };


//     // User-defined margin
//     const [editorMargin, setEditorMargin] = useState("96px");

//     const handleMarginChange = (margin: string) => {
//         setEditorMargin(margin);
//     };

//     // Paper size selection
//     const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

//     const handlePaperSizeChange = (size: 'short' | 'long') => {
//         setPaperSize(size);
//     };

//     const getPaperDimensions = () => {
//         return paperSize === 'short'
//             ? { width: '816px', height: '1056px' }
//             : { width: '816px', height: '1248px' };
//     };

//     const dimensions = getPaperDimensions();


//     const [pages, setPages] = useState<string[]>([description]);

//     let pageHeight;

//     if (dimensions.height == '1056px'){
//         pageHeight = 1056; 
//     }
//     else{
//         pageHeight = 1248;         
//     }

//     console.log(pageHeight)

//     const checkPagination = () => {
//         if (!editor) return;
    
//         const content = editor.getHTML();
    
//         // Create a hidden container for measuring content height
//         const container = document.createElement("div");
//         container.innerHTML = content;
//         container.style.position = "absolute";
//         container.style.visibility = "hidden";
//         container.style.width = "816px";
//         container.style.padding = editorMargin;
//         container.style.whiteSpace = "normal"; // Ensure text wrapping is considered
//         container.style.lineHeight = "1.5"; // Adjust to match editor
//         container.style.fontSize = "16px"; // Match Tiptap editor font size
//         document.body.appendChild(container);
    
//         let newPages: string[] = [];
//         let currentPage = "";
//         let height = 0;
    
//         Array.from(container.children).forEach((child) => {
//             const element = child as HTMLElement;
//             height += element.offsetHeight;
    
//             if (height > pageHeight) {
//                 // If the element makes the page overflow, split it at the text level
//                 const words = element.innerHTML.split(" ");
//                 let tempText = "";
//                 let tempHeight = 0;
    
//                 words.forEach(word => {
//                     tempText += word + " ";
//                     container.innerHTML = currentPage + tempText;
//                     tempHeight = container.offsetHeight;
    
//                     if (tempHeight > pageHeight) {
//                         newPages.push(currentPage);
//                         currentPage = tempText; // Start a new page
//                     } else {
//                         currentPage += word + " ";
//                     }
//                 });
    
//                 height = container.offsetHeight;
//             } else {
//                 currentPage += element.outerHTML;
//             }
//         });
    
//         if (currentPage) {
//             newPages.push(currentPage);
//         }
    
//         document.body.removeChild(container);
//         setPages(newPages);
//     };
    

//     useEffect(() => {
//         checkPagination();
//     }, [description]);

//     return (
//         <div className="flex flex-col h-full w-full">
//             <Toolbar
//                 editor={editor}
//                 uploadImage={uploadImage}
//                 onMarginChange={handleMarginChange}
//                 onPaperSizeChange={handlePaperSizeChange}
//             />

//             <div className="flex flex-col items-center mt-3">
//                 {pages.map((content, index) => (
//                     <div key={index} className="page border bg-white mb-40 shadow-lg"
//                         style={{ width: "816px", height: `${pageHeight}px`, overflow: "hidden" }}>
//                         <EditorContent editor={editor} style={{ padding: editorMargin }}/>
//                     </div>
//                 ))}
//             </div>

//             <style dangerouslySetInnerHTML={{
//                 __html: `
//                 .page {
//                     overflow: hidden;
//                     page-break-after: always;
//                     display: flex;
//                     flex-direction: column;
//                 }
//                 `
//             }} />
//         </div>
//     );
// }







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
// import TextAlign from "@tiptap/extension-text-align";
// import { useState } from "react";
// import { Node } from '@tiptap/core';

// const PageBreak = Node.create({
//     name: 'pageBreak',
//     inline: false,
//     group: 'block',
//     selectable: false,
//     parseHTML() {
//         return [{ tag: 'hr[data-type="page-break"]' }];
//     },
//     renderHTML() {
//         return ['hr', { 'data-type': 'page-break', style: 'border: 1px dashed gray; margin: 20px 0;' }];
//     },
// });

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
//             TextAlign.configure({
//                 types: ["heading", "paragraph"], // Apply alignment to headings and paragraphs
//                 alignments: ["left", "center", "right", "justify"], // Supported alignments
//                 defaultAlignment: "left", // Default alignment
//             }),
//             OrderedList.configure({
//                 HTMLAttributes: {
//                   class: "list-decimal pl-5 pr-5",
//                 },
//             }),            
//             BulletList,
//             ListItem,
//             Image, // Add the image extension
//             ResizeImage,
//             PageBreak,
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             onChange(editor.getHTML());
//             console.log(editor.getHTML());
//         },
//     });

//     const uploadImage = (imageUrl: string) => {
//         if (!editor) return;
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };


//     //MARGIN
//     const [editorMargin, setEditorMargin] = useState('96px')

//     const handleMarginChange = (margin: string) => {
//         setEditorMargin(margin);
//         console.log(margin); // Add this line
//     };



//     //PAPER SIZE
//     const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

//     const handlePaperSizeChange = (size: 'short' | 'long') => {
//         setPaperSize(size);
//     };
    
//     const getPaperDimensions = () => {
//         if (paperSize === 'short') {
//             return { width: '816px', height: '1056px' };
//         } else {
//             return { width: '816px', height: '1248px' };
//         }
//     };
    
//     const dimensions = getPaperDimensions();


//       return (
//         <div className="flex flex-col h-full w-full">
//           <Toolbar editor={editor} uploadImage={uploadImage} onMarginChange={handleMarginChange} onPaperSizeChange={handlePaperSizeChange}/>
//           <div className="flex justify-center mt-3">
//             <EditorContent key={editorMargin} style={{ whiteSpace: "pre-line", overflowY: "auto", maxHeight: dimensions.height }} editor={editor} className="mt-[7px]" />
//           </div>
    
//           {/* Add this <style> tag */}
//           <style dangerouslySetInnerHTML={{ __html: `
//             .tiptap.ProseMirror { 
//                 padding: ${editorMargin};
//                 width: ${dimensions.width};
//                 height: ${dimensions.height};
//                 overflow-y: auto;
//             }
//         ` }} />
//         </div>
//       );
// }







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
// import TextAlign from "@tiptap/extension-text-align";
// import { useState } from "react";
// import { Node } from '@tiptap/core';


// const PageBreak = Node.create({
//     name: 'pageBreak',
//     inline: false,
//     group: 'block',
//     selectable: false,
//     parseHTML() {
//         return [{ tag: 'hr[data-type="page-break"]' }];
//     },
//     renderHTML() {
//         return ['hr', { 'data-type': 'page-break', style: 'border: 1px dashed gray; margin: 20px 0;' }];
//     },
// });



// const EmptyLine = Node.create({
//     name: "emptyLine",
//     group: "block",
//     content: "text*",
//     parseHTML() {
//         return [{ tag: 'br' }]; // Parse <br> tags as empty lines
//     },
//     renderHTML() {
//         return ["br"]; // Render <br> tags for empty lines
//     },
// });

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
//             TextAlign.configure({
//                 types: ["heading", "paragraph"], // Apply alignment to headings and paragraphs
//                 alignments: ["left", "center", "right", "justify"], // Supported alignments
//                 defaultAlignment: "left", // Default alignment
//             }),
//             OrderedList.configure({
//                 HTMLAttributes: {
//                   class: "list-decimal pl-5 pr-5",
//                 },
//             }),            
//             BulletList,
//             ListItem,
//             Image, // Add the image extension
//             ResizeImage,
//             PageBreak,
//             EmptyLine,
//         ],
//         content: description,
//         editorProps: {
//             attributes: {
//                 class: "border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
//             },
//         },
//         onUpdate({ editor }) {
//             // onChange(editor.getHTML());
//             // console.log(editor.getHTML());
//             let html = editor.getHTML();

//             // Replace empty lines with <br> tags
//             html = html.replace(/(<p style="text-align: (left|right|center|justify)"><\/p>)/g, "<br/>");
    
//             onChange(html);
//             console.log(html)
//         },
//     });

//     const uploadImage = (imageUrl: string) => {
//         if (!editor) return;
//         editor.chain().focus().setImage({ src: imageUrl }).run();
//     };


//     //MARGIN
//     const [editorMargin, setEditorMargin] = useState('96px')

//     const handleMarginChange = (margin: string) => {
//         setEditorMargin(margin);
//         console.log(margin); // Add this line
//     };



//     //PAPER SIZE
//     const [paperSize, setPaperSize] = useState<'short' | 'long'>('short');

//     const handlePaperSizeChange = (size: 'short' | 'long') => {
//         setPaperSize(size);
//     };
    
//     const getPaperDimensions = () => {
//         if (paperSize === 'short') {
//             return { width: '816px', height: '1056px' };
//         } else {
//             return { width: '816px', height: '1248px' };
//         }
//     };
    
//     const dimensions = getPaperDimensions();


//       return (
//         <div className="flex flex-col h-full w-full">
//           <Toolbar editor={editor} uploadImage={uploadImage} onMarginChange={handleMarginChange} onPaperSizeChange={handlePaperSizeChange}/>
//           <div className="flex justify-center mt-3">
//             <EditorContent key={editorMargin} style={{ whiteSpace: "pre-line", overflowY: "auto", maxHeight: dimensions.height }} editor={editor} className="mt-[7px]" />
//           </div>
    
//           {/* Add this <style> tag */}
//           <style dangerouslySetInnerHTML={{ __html: `
//             .tiptap.ProseMirror { 
//                 padding: ${editorMargin};
//                 width: ${dimensions.width};
//                 height: ${dimensions.height};
//                 overflow-y: auto;
//                 white-space: pre-wrap;
//             }
//         ` }} />
//         </div>
//       );
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
import { Node } from '@tiptap/core';


const PageBreak = Node.create({
    name: 'pageBreak',
    inline: false,
    group: 'block',
    selectable: false,
    parseHTML() {
        return [{ tag: 'hr[data-type="page-break"]' }];
    },
    renderHTML() {
        return ['hr', { 'data-type': 'page-break', style: 'border: 1px dashed gray; margin: 20px 0;' }];
    },
});



const EmptyLine = Node.create({
    name: "emptyLine",
    group: "block",
    content: "text*",
    parseHTML() {
        return [{ tag: 'br' }]; // Parse <br> tags as empty lines
    },
    renderHTML() {
        return ["br"]; // Render <br> tags for empty lines
    },
});

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
            PageBreak,
            EmptyLine,
        ],
        content: description,
        editorProps: {
            attributes: {
                class: "border min-h-[500px] border-input bg-background px-3 py-3 disabled:cursor-not-allowed disabled:opacity-50 outline-none"
            },
        },
        onUpdate({ editor }) {
            // onChange(editor.getHTML());
            // console.log(editor.getHTML());
            let html = editor.getHTML();

            // Replace empty lines with <br> tags
            html = html.replace(/(<p style="text-align: (left|right|center|justify)"><\/p>)/g, "<br/>");
    
            onChange(html);
            console.log(html)
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
            <EditorContent key={editorMargin} style={{ whiteSpace: "pre-line", overflowY: "auto", maxHeight: dimensions.height }} editor={editor} className="mt-[7px]" />
          </div>
    
          {/* Add this <style> tag */}
          <style dangerouslySetInnerHTML={{ __html: `
            .tiptap.ProseMirror { 
                padding: ${editorMargin};
                width: ${dimensions.width};
                height: ${dimensions.height};
                overflow-y: auto;
                white-space: pre-wrap;
            }
        ` }} />
        </div>
      );
}