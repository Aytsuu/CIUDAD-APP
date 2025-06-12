//toolbar
// import { useState } from "react";
// import { type Editor } from "@tiptap/react";
// import {
//     Bold,
//     Strikethrough,
//     Italic,
//     List,
//     ListOrdered,
//     Heading2,
//     Image as ImageIcon,
//     Scissors,
//     AlignLeft, AlignCenter, AlignRight, AlignJustify,
//     TableRowsSplit 
// } from "lucide-react";
// import { Toggle } from "@/components/ui/toggle";
// import ReactCrop, { type Crop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";

// //components
// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
// import MarginSelector from "./MarginSelector";
// import PaperSizeSelector from "./PaperSizeSelector";



// type Props = {
//   editor: Editor | null;
//   uploadImage: (imageUrl: string) => void;
//   onMarginChange: (margin: string) => void;
//   onPaperSizeChange: (size: 'short' | 'long') => void;
// };

// export function Toolbar({ editor, uploadImage, onMarginChange, onPaperSizeChange,}: Props) {
//   const [crop, setCrop] = useState<Crop>({
//     unit: "px",
//     width: 100,
//     height: 100,
//     x: 0,
//     y: 0,
//   });
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
//   const [showCropper, setShowCropper] = useState(false);

//   if (!editor) return null;

//   const handleImageUpload = () => {
//     const fileInput = document.getElementById(
//       "image-upload"
//     ) as HTMLInputElement;
//     if (fileInput) {
//       fileInput.click();
//     }
//   };

//   const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageSrc(reader.result as string);
//         setShowCropper(true); // Show cropper when a new image is uploaded
//       };
//       reader.readAsDataURL(e.target.files[0]);
//     }
//   };

//   const onImageLoaded = (image: HTMLImageElement) => {
//     setImageRef(image);
//     return false;
//   };

//   const onCropComplete = (crop: Crop) => {
//     if (imageRef && crop.width && crop.height) {
//       const croppedImageUrl = getCroppedImg(imageRef, crop);
//       if (croppedImageUrl) {
//         uploadImage(croppedImageUrl);
//         setShowCropper(false);
//       }
//     }
//   };

//   const getCroppedImg = (
//     image: HTMLImageElement,
//     crop: Crop
//   ): string | null => {
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;
//     canvas.width = crop.width;
//     canvas.height = crop.height;
//     const ctx = canvas.getContext("2d");

//     if (ctx) {
//       ctx.drawImage(
//         image,
//         crop.x * scaleX,
//         crop.y * scaleY,
//         crop.width * scaleX,
//         crop.height * scaleY,
//         0,
//         0,
//         crop.width,
//         crop.height
//       );
//     }

//     return canvas.toDataURL("image/jpeg");
//   };

//   const handleScissorsClick = () => {
//     const selectedImage = editor.getAttributes("image").src;
//     if (selectedImage) {
//       setImageSrc(selectedImage);
//       setShowCropper(true);
//     }
//   };

//   return (
//     <div className="flex space-x-2 h-15 border border-input bg-lightBlue rounded-md p-2">


//         <MarginSelector onMarginChange={onMarginChange} />

//         <PaperSizeSelector onPaperSizeChange={onPaperSizeChange} />

        
//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("heading")} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
//                     <Heading2 size={20} />
//                 </Toggle>
//             }
//             content="Heading"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
//                     <Bold size={20} />
//                 </Toggle>
//             }
//             content="Bold"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
//                     <Italic size={20} />
//                 </Toggle>
//             }
//             content="Italic"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
//                     <Strikethrough size={20} />
//                 </Toggle>
//             }
//             content="Striketrough"
//         />         

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
//                     <List size={20} />
//                 </Toggle>
//             }
//             content="Bullet List"
//         />   

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
//                     <ListOrdered size={20} />
//                 </Toggle>
//             }
//             content="Ordered List"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle
//                     size="lg"
//                     pressed={editor.isActive({ textAlign: "left" })}
//                     onPressedChange={() =>
//                         editor.chain().focus().setTextAlign("left").run()
//                     }
//                     >
//                     <AlignLeft size={20} />
//                 </Toggle>
//             }
//             content="Align Left"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle
//                     size="lg"
//                     pressed={editor.isActive({ textAlign: "center" })}
//                     onPressedChange={() =>
//                     editor.chain().focus().setTextAlign("center").run()
//                     }
//                 >
//                     <AlignCenter size={20} />
//                 </Toggle>
//             }
//             content="Align Center"
//         />        

//         <TooltipLayout
//             trigger={
//                 <Toggle
//                     size="lg" 
//                     pressed={editor.isActive({ textAlign: "right" })}
//                     onPressedChange={() =>
//                         editor.chain().focus().setTextAlign("right").run()
//                     }
//                 >
//                     <AlignRight size={20} />
//                 </Toggle>
//             }
//             content="Align Right"
//         />

//         <TooltipLayout
//             trigger={
//                 <Toggle
//                     size="lg"
//                     pressed={editor.isActive({ textAlign: "justify" })}
//                     onPressedChange={() =>
//                     editor.chain().focus().setTextAlign("justify").run()
//                     }
//                 >
//                     <AlignJustify size={20} />
//                 </Toggle>
//             }
//             content="Justify"
//         />                 

//         <TooltipLayout
//             trigger={
//                 <Toggle size="lg" pressed={false} onPressedChange={handleImageUpload}>
//                     <ImageIcon size={20} />
//                 </Toggle>
//             }
//             content="Upload Image"
//         />        

//         <TooltipLayout
//             trigger={
//                 <Toggle
//                     size="lg"
//                     pressed={false}
//                     onPressedChange={handleScissorsClick}
//                     disabled={!editor.getAttributes("image").src}
//                 >
//                     <Scissors size={20} />
//                 </Toggle>
//             }
//             content="Crop"
//         />  

//         <TooltipLayout
//             trigger={
//                 <Toggle 
//                     size="lg"
//                     onClick={() => editor?.chain().focus().insertContent({ type: 'pageBreak' }).run()}
//                 >
//                     <TableRowsSplit size={20}/>
//                 </Toggle>
//             }
//             content="Page Break"
//         />

//         <input
//             type="file"
//             accept="image/*"
//             onChange={onSelectFile}
//             style={{ display: "none" }}
//             id="image-upload"
//         />

//         {showCropper && imageSrc && (
//             <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                 <div className="bg-white p-4 rounded-lg h-[550px]">
//                     <ReactCrop
//                         crop={crop}
//                         onChange={(c) => setCrop(c)}
//                         onComplete={onCropComplete}
//                         >
//                         <img
//                             src={imageSrc}
//                             onLoad={(e) => onImageLoaded(e.currentTarget)}
//                             alt="Crop preview"
//                             style={{
//                             maxWidth: "100%",
//                             maxHeight: "400px",
//                             objectFit: "contain",
//                             }}
//                         />
//                     </ReactCrop>
//                     <div className="flex justify-between mt-4">
//                         <button onClick={() => setShowCropper(false)} className="bg-red-500 text-white px-4 py-2 rounded"> Cancel </button>
//                         <button onClick={() => onCropComplete(crop!)} className="bg-[#3D4C77] text-white px-4 py-2 rounded"> Crop </button>
//                     </div>
//                 </div>
//             </div>
//         )}

//     </div>
//   );
// }



// import { useState } from "react";
// import { type Editor } from "@tiptap/react";
// import {
//   Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Image as ImageIcon,
//   Scissors, AlignLeft, AlignCenter, AlignRight, AlignJustify, TableRowsSplit,
//   Underline, Eraser, Undo2, Redo2, Code, Highlighter, Quote
// } from "lucide-react";
// import { Toggle } from "@/components/ui/toggle";
// import ReactCrop, { type Crop } from "react-image-crop";
// import "react-image-crop/dist/ReactCrop.css";

// import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
// import MarginSelector from "./MarginSelector";
// import PaperSizeSelector from "./PaperSizeSelector";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem
// } from "@/components/ui/dropdown-menu";
// import { Button } from "../button/button";

// type Props = {
//   editor: Editor | null;
//   uploadImage: (imageUrl: string) => void;
//   onMarginChange: (margin: string) => void;
//   onPaperSizeChange: (size: "short" | "long") => void;
// };

// const getToggleClass = (active: boolean) =>
//   active ? "bg-muted text-primary" : "";

// export function Toolbar({ editor, uploadImage, onMarginChange, onPaperSizeChange }: Props) {
//   const [crop, setCrop] = useState<Crop>({ unit: "px", width: 100, height: 100, x: 0, y: 0 });
//   const [imageSrc, setImageSrc] = useState<string | null>(null);
//   const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
//   const [showCropper, setShowCropper] = useState(false);

//   if (!editor) return null;

//   const handleImageUpload = () => {
//     const fileInput = document.getElementById("image-upload") as HTMLInputElement;
//     if (fileInput) fileInput.click();
//   };

//   const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       const reader = new FileReader();
//       reader.onload = () => {
//         setImageSrc(reader.result as string);
//         setShowCropper(true);
//       };
//       reader.readAsDataURL(e.target.files[0]);
//     }
//   };

//   const onImageLoaded = (image: HTMLImageElement) => {
//     setImageRef(image);
//     return false;
//   };

//   const onCropComplete = (crop: Crop) => {
//     if (imageRef && crop.width && crop.height) {
//       const croppedImageUrl = getCroppedImg(imageRef, crop);
//       if (croppedImageUrl) {
//         uploadImage(croppedImageUrl);
//         setShowCropper(false);
//       }
//     }
//   };

//   const getCroppedImg = (image: HTMLImageElement, crop: Crop): string | null => {
//     const canvas = document.createElement("canvas");
//     const scaleX = image.naturalWidth / image.width;
//     const scaleY = image.naturalHeight / image.height;
//     canvas.width = crop.width;
//     canvas.height = crop.height;
//     const ctx = canvas.getContext("2d");

//     if (ctx) {
//       ctx.drawImage(
//         image,
//         crop.x * scaleX,
//         crop.y * scaleY,
//         crop.width * scaleX,
//         crop.height * scaleY,
//         0,
//         0,
//         crop.width,
//         crop.height
//       );
//     }

//     return canvas.toDataURL("image/jpeg");
//   };

//   const handleScissorsClick = () => {
//     const selectedImage = editor.getAttributes("image").src;
//     if (selectedImage) {
//       setImageSrc(selectedImage);
//       setShowCropper(true);
//     }
//   };

//   const setFontSize = (size: string) => {
//     editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
//   };
  
//   return (
//     <div className="flex flex-wrap gap-2 h-fit border border-input bg-lightBlue rounded-md p-2">
//       <MarginSelector onMarginChange={onMarginChange} />
//       <PaperSizeSelector onPaperSizeChange={onPaperSizeChange} />

//       {/* Font Family */}
//       <select
//         onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
//         value={editor.getAttributes("textStyle").fontFamily || "Arial"}
//         className="border rounded px-2 py-1 text-sm"
//       >
//         <option value="Arial">Arial</option>
//         <option value="Georgia">Georgia</option>
//         <option value="Times New Roman">Times New Roman</option>
//         <option value="Courier New">Courier New</option>
//         <option value="Verdana">Verdana</option>
//       </select>

//       {/* Font Size Input */}
//      <div className="flex items-center gap-2">
//         <input
//           type="number"
//           min={8}
//           max={200}
//           value={
//             parseInt(editor.getAttributes("textStyle").fontSize || "16") || 16
//           }
//           onChange={(e) => {
//             const newSize = `${e.target.value}px`;
//             editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
//           }}
//           onBlur={(e) => {
//             const newSize = `${e.target.value}px`;
//             editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
//           }}
//           onKeyDown={(e) => {
//             if (e.key === "Enter") {
//               const newSize = `${(e.target as HTMLInputElement).value}px`;
//               editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
//             }
//           }}
//           className="w-20 border rounded px-2 py-1 text-sm"
//           placeholder="Font size"
//         />
//       </div>

//       {/* Alignment Dropdown */}
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button variant="outline" size="icon">
//             {{
//               left: <AlignLeft size={20} />,
//               center: <AlignCenter size={20} />,
//               right: <AlignRight size={20} />,
//               justify: <AlignJustify size={20} />
//             }[editor.getAttributes("textAlign")?.textAlign || "left"]}
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent>
//           <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("left").run()}>
//             <AlignLeft size={18} className="mr-2" /> Align Left
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("center").run()}>
//             <AlignCenter size={18} className="mr-2" /> Align Center
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("right").run()}>
//             <AlignRight size={18} className="mr-2" /> Align Right
//           </DropdownMenuItem>
//           <DropdownMenuItem onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
//             <AlignJustify size={18} className="mr-2" /> Justify
//           </DropdownMenuItem>
//         </DropdownMenuContent>
//       </DropdownMenu>


//       {/* Formatting Buttons */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("heading")} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
//           className={getToggleClass(editor.isActive("heading"))}>
//           <Heading2 size={20} />
//         </Toggle>} content="Heading" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}
//           className={getToggleClass(editor.isActive("bold"))}>
//           <Bold size={20} />
//         </Toggle>} content="Bold" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}
//           className={getToggleClass(editor.isActive("italic"))}>
//           <Italic size={20} />
//         </Toggle>} content="Italic" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}
//           className={getToggleClass(editor.isActive("strike"))}>
//           <Strikethrough size={20} />
//         </Toggle>} content="Strikethrough" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
//           className={getToggleClass(editor.isActive("underline"))}>
//           <Underline size={20} />
//         </Toggle>} content="Underline" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" onPressedChange={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
//           <Eraser size={20} />
//         </Toggle>} content="Clear Formatting" />

//       {/* List & Quote */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
//           className={getToggleClass(editor.isActive("bulletList"))}>
//           <List size={20} />
//         </Toggle>} content="Bullet List" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
//           className={getToggleClass(editor.isActive("orderedList"))}>
//           <ListOrdered size={20} />
//         </Toggle>} content="Ordered List" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
//           className={getToggleClass(editor.isActive("blockquote"))}>
//           <Quote size={20} />
//         </Toggle>} content="Block Quote" />

//       {/* Alignment */}
//       {/* <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
//           className={getToggleClass(editor.isActive({ textAlign: "left" }))}>
//           <AlignLeft size={20} />
//         </Toggle>} content="Align Left" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
//           className={getToggleClass(editor.isActive({ textAlign: "center" }))}>
//           <AlignCenter size={20} />
//         </Toggle>} content="Align Center" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
//           className={getToggleClass(editor.isActive({ textAlign: "right" }))}>
//           <AlignRight size={20} />
//         </Toggle>} content="Align Right" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive({ textAlign: "justify" })} onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
//           className={getToggleClass(editor.isActive({ textAlign: "justify" }))}>
//           <AlignJustify size={20} />
//         </Toggle>} content="Justify" /> */}

//       {/* Image Upload / Crop */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" onPressedChange={handleImageUpload}>
//           <ImageIcon size={20} />
//         </Toggle>} content="Upload Image" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" onPressedChange={handleScissorsClick} disabled={!editor.getAttributes("image").src}>
//           <Scissors size={20} />
//         </Toggle>} content="Crop" />

//       {/* Highlight */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" pressed={editor.isActive("highlight")} onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
//           className={getToggleClass(editor.isActive("highlight"))}>
//           <Highlighter size={20} />
//         </Toggle>} content="Highlight" />

//       {/* Page Break */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" onClick={() => editor.chain().focus().insertContent({ type: "pageBreak" }).run()}>
//           <TableRowsSplit size={20} />
//         </Toggle>} content="Page Break" />

//       {/* Undo / Redo */}
//       <TooltipLayout trigger={
//         <Toggle size="lg" onPressedChange={() => editor.chain().focus().undo().run()}>
//           <Undo2 size={20} />
//         </Toggle>} content="Undo" />

//       <TooltipLayout trigger={
//         <Toggle size="lg" onPressedChange={() => editor.chain().focus().redo().run()}>
//           <Redo2 size={20} />
//         </Toggle>} content="Redo" />

//         {/* Hidden File Input */}
//       <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: "none" }} id="image-upload" />

//         {showCropper && imageSrc && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white p-4 rounded-lg h-[550px]">
//               <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={onCropComplete}>
//                 <img
//                   src={imageSrc}
//                   onLoad={(e) => onImageLoaded(e.currentTarget)}
//                   alt="Crop preview"
//                   style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
//                 />
//               </ReactCrop>
//               <div className="flex justify-between mt-4">
//                 <button onClick={() => setShowCropper(false)} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
//                 <button onClick={() => onCropComplete(crop)} className="bg-[#3D4C77] text-white px-4 py-2 rounded">Crop</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
// }


// Toolbar.tsx
import { useState } from "react";
import { type Editor } from "@tiptap/react";
import {
  Bold, Strikethrough, Italic, List, ListOrdered, Heading2, Image as ImageIcon,
  Scissors, AlignLeft, AlignCenter, AlignRight, AlignJustify, TableRowsSplit,
  Underline, Eraser, Undo2, Redo2, Code, Highlighter, Quote, ChevronDown, Check, Type
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import MarginSelector from "./MarginSelector";
import PaperSizeSelector from "./PaperSizeSelector";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Input } from "../input";
import { Button } from "../button/button";

type Props = {
  editor: Editor | null;
  uploadImage: (imageUrl: string) => void;
  onMarginChange: (margin: string) => void;
  onPaperSizeChange: (size: "short" | "long") => void;
};

const getToggleClass = (active: boolean) =>
  active ? "bg-muted text-primary" : "";

export function Toolbar({ editor, uploadImage, onMarginChange, onPaperSizeChange }: Props) {
  const [crop, setCrop] = useState<Crop>({ unit: "px", width: 100, height: 100, x: 0, y: 0 });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  if (!editor) return null;

  const handleImageUpload = () => {
    const fileInput = document.getElementById("image-upload") as HTMLInputElement;
    if (fileInput) fileInput.click();
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onImageLoaded = (image: HTMLImageElement) => {
    setImageRef(image);
    return false;
  };

  const onCropComplete = (crop: Crop) => {
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imageRef, crop);
      if (croppedImageUrl) {
        uploadImage(croppedImageUrl);
        setShowCropper(false);
      }
    }
  };

  const getCroppedImg = (image: HTMLImageElement, crop: Crop): string | null => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );
    }

    return canvas.toDataURL("image/jpeg");
  };

  const handleScissorsClick = () => {
    const selectedImage = editor.getAttributes("image").src;
    if (selectedImage) {
      setImageSrc(selectedImage);
      setShowCropper(true);
    }
  };

  const setFontSize = (size: string) => {
    editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
  };

  const textAlign = (editor.getAttributes("textAlign")?.textAlign || "left") as
    | "left"
    | "center"
    | "right"
    | "justify";

  
  const COLORS = [
    { color: '#ffc078', name: 'Orange' },
    { color: '#ffd8a8', name: 'Peach' },
    { color: '#d8f5a2', name: 'Green' },
    { color: '#91a7ff', name: 'Blue' },
    { color: '#b197fc', name: 'Purple' },
    { color: '#ff8787', name: 'Red' },
  ];

  const icons: Record<"left" | "center" | "right" | "justify", JSX.Element> = {
    left: <AlignLeft size={20} />,
    center: <AlignCenter size={20} />,
    right: <AlignRight size={20} />,
    justify: <AlignJustify size={20} />,
  };

  return (
    // <div className="flex flex-wrap gap-2 h-fit border border-input bg-lightBlue rounded-md p-2">
    //   <MarginSelector onMarginChange={onMarginChange} />
    //   <PaperSizeSelector onPaperSizeChange={onPaperSizeChange} />

    //   {/* Font Family */}
    //   <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button 
    //           variant="outline" 
    //           size="sm"
    //           className="px-3 py-1.5 h-auto flex items-center gap-2 hover:bg-muted/50"
    //         >
    //           <Type size={16} />
    //           <span className="text-xs font-medium capitalize">
    //             {editor.getAttributes('textStyle').fontFamily || 'Arial'}
    //           </span>
    //           <ChevronDown className="h-3 w-3 opacity-70" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent className="min-w-[140px] p-1 rounded-md shadow-lg border bg-background">
    //         <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
    //           Font Family
    //         </DropdownMenuLabel>
    //         <DropdownMenuSeparator />
    //         {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'].map((font) => (
    //           <DropdownMenuItem
    //             key={font}
    //             onClick={() => editor.chain().focus().setFontFamily(font).run()}
    //             className={`flex items-center px-2 py-1.5 text-sm rounded ${
    //               editor.getAttributes('textStyle').fontFamily === font
    //                 ? 'bg-accent text-accent-foreground font-medium'
    //                 : 'hover:bg-muted/50'
    //             }`}
    //             style={{ fontFamily: font }}
    //           >
    //             {font}
    //             {editor.getAttributes('textStyle').fontFamily === font && (
    //               <Check className="h-4 w-4 ml-auto text-primary" />
    //             )}
    //           </DropdownMenuItem>
    //         ))}
    //       </DropdownMenuContent>
    //   </DropdownMenu>

    //   {/* Font Size */}
    //   <div className="flex items-center gap-2">
    //     <Input
    //       type="number"
    //       min={8}
    //       max={200}
    //       value={
    //         parseInt(editor.getAttributes("textStyle").fontSize || "16") || 16
    //       }
    //       onChange={(e) => {
    //         const newSize = `${e.target.value}px`;
    //         editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
    //       }}
    //       onBlur={(e) => {
    //         const newSize = `${e.target.value}px`;
    //         editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
    //       }}
    //       onKeyDown={(e) => {
    //         if (e.key === "Enter") {
    //           const newSize = `${(e.target as HTMLInputElement).value}px`;
    //           editor.chain().focus().setMark("textStyle", { fontSize: newSize }).run();
    //         }
    //       }}
    //       className="w-20 border rounded px-2 py-1 text-sm bg-white"
    //       placeholder="Font size"
    //     />
    //   </div>

    //   {/* Alignment Dropdown (Fixed) */}
    //   <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button 
    //           variant="outline" 
    //           size="sm"
    //           className="relative px-3 py-1.5 h-auto flex items-center gap-2 hover:bg-muted/50"
    //         >
    //           {icons[textAlign]}
    //           <span className="text-xs font-medium capitalize">{textAlign}</span>
    //           <ChevronDown className="h-3 w-3 opacity-70" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent 
    //         className="min-w-[140px] p-1 rounded-md shadow-lg border bg-background"
    //         align="start"
    //       >
    //         <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
    //           Text Alignment
    //         </DropdownMenuLabel>
    //         <DropdownMenuSeparator />
    //         {[
    //           { value: "left", icon: <AlignLeft size={16} />, label: "Left" },
    //           { value: "center", icon: <AlignCenter size={16} />, label: "Center" },
    //           { value: "right", icon: <AlignRight size={16} />, label: "Right" },
    //           { value: "justify", icon: <AlignJustify size={16} />, label: "Justify" },
    //         ].map((item) => (
    //           <DropdownMenuItem
    //             key={item.value}
    //             onClick={() => editor.chain().focus().setTextAlign(item.value).run()}
    //             className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded ${
    //               textAlign === item.value 
    //                 ? "bg-accent text-accent-foreground font-medium" 
    //                 : "hover:bg-muted/50"
    //             }`}
    //           >
    //             {item.icon}
    //             <span>{item.label}</span>
    //             {textAlign === item.value && (
    //               <Check className="h-4 w-4 ml-auto text-primary" />
    //             )}
    //           </DropdownMenuItem>
    //         ))}
    //       </DropdownMenuContent>
    //   </DropdownMenu>

    //   {/* Remaining Toggles & Tools */}
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("heading")} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getToggleClass(editor.isActive("heading"))}><Heading2 size={20} /></Toggle>} content="Heading" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className={getToggleClass(editor.isActive("bold"))}><Bold size={20} /></Toggle>} content="Bold" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className={getToggleClass(editor.isActive("italic"))}><Italic size={20} /></Toggle>} content="Italic" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className={getToggleClass(editor.isActive("strike"))}><Strikethrough size={20} /></Toggle>} content="Strikethrough" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className={getToggleClass(editor.isActive("underline"))}><Underline size={20} /></Toggle>} content="Underline" />
    //   <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={20} /></Toggle>} content="Clear Formatting" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className={getToggleClass(editor.isActive("bulletList"))}><List size={20} /></Toggle>} content="Bullet List" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className={getToggleClass(editor.isActive("orderedList"))}><ListOrdered size={20} /></Toggle>} content="Ordered List" />
    //   <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} className={getToggleClass(editor.isActive("blockquote"))}><Quote size={20} /></Toggle>} content="Block Quote" />
    //   <TooltipLayout trigger={<Toggle size="lg" onPressedChange={handleImageUpload}><ImageIcon size={20} /></Toggle>} content="Upload Image" />
    //   <TooltipLayout trigger={<Toggle size="lg" onPressedChange={handleScissorsClick} disabled={!editor.getAttributes("image").src}><Scissors size={20} /></Toggle>} content="Crop" />
      <div className="flex flex-wrap gap-3 border border-input bg-lightBlue rounded-md p-3">
      {/* Paper Settings */}
      <div className="flex items-center gap-2">
        <MarginSelector onMarginChange={onMarginChange} />
        <PaperSizeSelector onPaperSizeChange={onPaperSizeChange} />
      </div>

      {/* Typography Section */}
      <div className="flex items-center gap-3 border-l pl-3 ml-3">
        {/* Font Family */}
        <div className="flex flex-col items-start">
          <label className="text-xs font-medium text-muted-foreground mb-1">Font</label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-[140px] justify-between"
              >
                <div className="flex items-center gap-2">
                  <Type size={16} />
                  <span className="text-xs font-medium truncate w-[70px]">
                    {editor.getAttributes('textStyle').fontFamily || 'Arial'}
                  </span>
                </div>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[160px] p-1">
              <DropdownMenuLabel className="text-xs font-medium px-2 py-1.5">Font Family</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'].map(font => (
                <DropdownMenuItem
                  key={font}
                  onClick={() => editor.chain().focus().setFontFamily(font).run()}
                  className={`flex items-center px-2 py-1.5 text-sm rounded ${editor.getAttributes('textStyle').fontFamily === font ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted/50'}`}
                  style={{ fontFamily: font }}
                >
                  {font}
                  {editor.getAttributes('textStyle').fontFamily === font && (
                    <Check className="h-4 w-4 ml-auto text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Font Size */}
        <div className="flex flex-col items-start">
          <label className="text-xs font-medium text-muted-foreground mb-1">Font Size</label>
          <Input
            type="number"
            min={8}
            max={200}
            value={parseInt(editor.getAttributes("textStyle").fontSize || "16") || 16}
            onChange={(e) => editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}px` }).run()}
            onBlur={(e) => editor.chain().focus().setMark("textStyle", { fontSize: `${e.target.value}px` }).run()}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                editor.chain().focus().setMark("textStyle", { fontSize: `${(e.target as HTMLInputElement).value}px` }).run();
              }
            }}
            className="w-[70px] px-2 py-1 text-sm rounded border bg-white"
            placeholder="Size"
          />
        </div>
      </div>

      {/* Text Alignment */}
      <div className="flex flex-col items-start border-l pl-3 ml-3">
        <label className="text-xs font-medium text-muted-foreground mb-1">Align</label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-[130px] flex justify-between">
              <div className="flex items-center gap-2">
                {icons[textAlign]}
                <span className="text-xs capitalize">{textAlign}</span>
              </div>
              <ChevronDown className="h-3 w-3 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {["left", "center", "right", "justify"].map((align) => (
              <DropdownMenuItem
                key={align}
                onClick={() => editor.chain().focus().setTextAlign(align as any).run()}
                className={`flex items-center gap-2 text-sm px-2 py-1.5 rounded ${textAlign === align ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted/50'}`}
              >
                {icons[align as keyof typeof icons]}
                <span>{align.charAt(0).toUpperCase() + align.slice(1)}</span>
                {textAlign === align && <Check className="h-4 w-4 ml-auto text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Text Formatting */}
      <div className="flex items-center gap-2 border-l pl-3 ml-3">
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()} className={getToggleClass(editor.isActive("bold"))}><Bold size={20} /></Toggle>} content="Bold" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()} className={getToggleClass(editor.isActive("italic"))}><Italic size={20} /></Toggle>} content="Italic" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()} className={getToggleClass(editor.isActive("strike"))}><Strikethrough size={20} /></Toggle>} content="Strikethrough" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()} className={getToggleClass(editor.isActive("underline"))}><Underline size={20} /></Toggle>} content="Underline" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("heading")} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={getToggleClass(editor.isActive("heading"))}><Heading2 size={20} /></Toggle>} content="Heading" />
        <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={20} /></Toggle>} content="Clear Formatting" />
      </div>

      {/* Lists & Quotes */}
      <div className="flex items-center gap-2 border-l pl-3 ml-3">
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()} className={getToggleClass(editor.isActive("bulletList"))}><List size={20} /></Toggle>} content="Bullet List" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()} className={getToggleClass(editor.isActive("orderedList"))}><ListOrdered size={20} /></Toggle>} content="Ordered List" />
        <TooltipLayout trigger={<Toggle size="lg" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()} className={getToggleClass(editor.isActive("blockquote"))}><Quote size={20} /></Toggle>} content="Block Quote" />
      </div>

      {/* Image Tools */}
      <div className="flex items-center gap-2 border-l pl-3 ml-3">
        <TooltipLayout trigger={<Toggle size="lg" onPressedChange={handleImageUpload}><ImageIcon size={20} /></Toggle>} content="Upload Image" />
        <TooltipLayout trigger={<Toggle size="lg" onPressedChange={handleScissorsClick} disabled={!editor.getAttributes("image").src}><Scissors size={20} /></Toggle>} content="Crop Image" />
      </div>

      {/* Highlight Color */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="px-3 py-1.5 h-auto flex items-center gap-2 hover:bg-muted/50"
          >
            <div className="relative">
              <Highlighter size={16} />
              {editor.isActive('highlight') && (
                <div 
                  className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full border border-background"
                  style={{ 
                    backgroundColor: editor.getAttributes('highlight').color || '#ffc078' 
                  }}
                />
              )}
            </div>
            <span className="text-xs font-medium">
              {editor.isActive('highlight') ? 
                COLORS.find(c => c.color === editor.getAttributes('highlight').color)?.name || 'Highlight' 
                : 'Highlight'
              }
            </span>
            <ChevronDown className="h-3 w-3 opacity-70" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[140px] p-1 rounded-md shadow-lg border bg-background">
          <DropdownMenuLabel className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            Highlight Color
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {COLORS.map(({ color, name }) => (
            <DropdownMenuItem
              key={color}
              onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
              className={`flex items-center px-2 py-1.5 text-sm rounded ${
                editor.isActive('highlight') && editor.getAttributes('highlight').color === color
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'hover:bg-muted/50'
              }`}
            >
              <div 
                className="w-4 h-4 rounded-full mr-2 border" 
                style={{ backgroundColor: color }}
              />
              {name}
              {editor.isActive('highlight') && editor.getAttributes('highlight').color === color && (
                <Check className="h-4 w-4 ml-auto text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="flex items-center px-2 py-1.5 text-sm text-destructive rounded hover:bg-muted/50"
          >
            <Eraser size={16} className="mr-2" />
            Clear Highlight
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* <TooltipLayout trigger={<Toggle size="lg" onClick={() => editor.chain().focus().insertContent({ type: "pageBreak" }).run()}><TableRowsSplit size={20} /></Toggle>} content="Page Break" />
      <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().undo().run()}><Undo2 size={20} /></Toggle>} content="Undo" />
      <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().redo().run()}><Redo2 size={20} /></Toggle>} content="Redo" /> */}

      {/* Hidden File Input */}
      {/* <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: "none" }} id="image-upload" /> */}
      <div className="flex items-center gap-2 border-l pl-3 ml-3">
        <TooltipLayout trigger={<Toggle size="lg" onClick={() => editor.chain().focus().insertContent({ type: "pageBreak" }).run()}><TableRowsSplit size={20} /></Toggle>} content="Page Break" />
        <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().undo().run()}><Undo2 size={20} /></Toggle>} content="Undo" />
        <TooltipLayout trigger={<Toggle size="lg" onPressedChange={() => editor.chain().focus().redo().run()}><Redo2 size={20} /></Toggle>} content="Redo" />
      </div>

      {/* Hidden File Input */}
      <input type="file" accept="image/*" onChange={onSelectFile} style={{ display: "none" }} id="image-upload" />


      {/* Image Cropper Modal */}
      {showCropper && imageSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg h-[550px]">
            <ReactCrop crop={crop} onChange={(c) => setCrop(c)} onComplete={onCropComplete}>
              <img
                src={imageSrc}
                onLoad={(e) => onImageLoaded(e.currentTarget)}
                alt="Crop preview"
                style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
              />
            </ReactCrop>
            <div className="flex justify-between mt-4">
              <button onClick={() => setShowCropper(false)} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
              <button onClick={() => onCropComplete(crop)} className="bg-[#3D4C77] text-white px-4 py-2 rounded">Crop</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
