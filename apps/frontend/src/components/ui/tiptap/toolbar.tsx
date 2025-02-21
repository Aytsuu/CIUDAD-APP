"use client";
import { useState } from "react";
import { type Editor } from "@tiptap/react";
import {
    Bold,
    Strikethrough,
    Italic,
    List,
    ListOrdered,
    Heading2,
    Image as ImageIcon,
    Scissors,
    AlignLeft, AlignCenter, AlignRight, AlignJustify
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

//components
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import MarginSelector from "./MarginSelector";
import PaperSizeSelector from "./PaperSizeSelector";


type Props = {
  editor: Editor | null;
  uploadImage: (imageUrl: string) => void;
  onMarginChange: (margin: string) => void;
};

export function Toolbar({ editor, uploadImage, onMarginChange}: Props) {
  const [crop, setCrop] = useState<Crop>({
    unit: "px",
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  });
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  if (!editor) return null;

  const handleImageUpload = () => {
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCropper(true); // Show cropper when a new image is uploaded
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

  const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop
  ): string | null => {
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

  return (
    <div className="flex space-x-2 h-15 border border-input bg-transparent rounded-md p-2">
        <MarginSelector onMarginChange={onMarginChange} />

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("heading")} onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                    <Heading2 size={20} />
                </Toggle>
            }
            content="Heading"
        />

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
                    <Bold size={20} />
                </Toggle>
            }
            content="Bold"
        />

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
                    <Italic size={20} />
                </Toggle>
            }
            content="Italic"
        />

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("strike")} onPressedChange={() => editor.chain().focus().toggleStrike().run()}>
                    <Strikethrough size={20} />
                </Toggle>
            }
            content="Striketrough"
        />         

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
                    <List size={20} />
                </Toggle>
            }
            content="Bullet List"
        />   

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
                    <ListOrdered size={20} />
                </Toggle>
            }
            content="Ordered List"
        />

        <TooltipLayout
            trigger={
                <Toggle
                    size="lg"
                    pressed={editor.isActive({ textAlign: "left" })}
                    onPressedChange={() =>
                        editor.chain().focus().setTextAlign("left").run()
                    }
                    >
                    <AlignLeft size={20} />
                </Toggle>
            }
            content="Align Left"
        />

        <TooltipLayout
            trigger={
                <Toggle
                    size="lg"
                    pressed={editor.isActive({ textAlign: "center" })}
                    onPressedChange={() =>
                    editor.chain().focus().setTextAlign("center").run()
                    }
                >
                    <AlignCenter size={20} />
                </Toggle>
            }
            content="Align Center"
        />        

        <TooltipLayout
            trigger={
                <Toggle
                    size="lg" 
                    pressed={editor.isActive({ textAlign: "right" })}
                    onPressedChange={() =>
                        editor.chain().focus().setTextAlign("right").run()
                    }
                >
                    <AlignRight size={20} />
                </Toggle>
            }
            content="Align Right"
        />

        <TooltipLayout
            trigger={
                <Toggle
                    size="lg"
                    pressed={editor.isActive({ textAlign: "justify" })}
                    onPressedChange={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                    }
                >
                    <AlignJustify size={20} />
                </Toggle>
            }
            content="Justify"
        />                 

        <TooltipLayout
            trigger={
                <Toggle size="lg" pressed={false} onPressedChange={handleImageUpload}>
                    <ImageIcon size={20} />
                </Toggle>
            }
            content="Upload Image"
        />        

        <TooltipLayout
            trigger={
                <Toggle
                    size="lg"
                    pressed={false}
                    onPressedChange={handleScissorsClick}
                    disabled={!editor.getAttributes("image").src}
                >
                    <Scissors size={20} />
                </Toggle>
            }
            content="Crop"
        />  

        <input
            type="file"
            accept="image/*"
            onChange={onSelectFile}
            style={{ display: "none" }}
            id="image-upload"
        />

        {showCropper && imageSrc && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-4 rounded-lg h-[550px]">
                    <ReactCrop
                        crop={crop}
                        onChange={(c) => setCrop(c)}
                        onComplete={onCropComplete}
                        >
                        <img
                            src={imageSrc}
                            onLoad={(e) => onImageLoaded(e.currentTarget)}
                            alt="Crop preview"
                            style={{
                            maxWidth: "100%",
                            maxHeight: "400px",
                            objectFit: "contain",
                            }}
                        />
                    </ReactCrop>
                    <div className="flex justify-between mt-4">
                        <button onClick={() => setShowCropper(false)} className="bg-red-500 text-white px-4 py-2 rounded"> Cancel </button>
                        <button onClick={() => onCropComplete(crop!)} className="bg-[#3D4C77] text-white px-4 py-2 rounded"> Crop </button>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}


