import React from "react";
import { Film, Play, Image, Plus, X, FileText, Loader2 } from "lucide-react";
import { Label } from "./label";
import { useInstantFileUpload } from "@/hooks/use-file-upload";

export type MediaUploadType = 
  Array<{
    id: string;
    type: "image" | "video" | "document";
    file: File;
    publicUrl?: string;
    storagePath?: string;
    status: "uploading" | "uploaded" | "error";
    previewUrl?: string;
  }>

export const MediaUpload = ({
  title,
  description,
  mediaFiles,
  activeVideoId,
  setMediaFiles,
  setActiveVideoId,
  onFileRemoved, // Add optional prop
}: {
  title: string;
  description: string;
  mediaFiles: MediaUploadType
  activeVideoId: string;
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>;
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>;
  onFileRemoved?: (id: string) => void; // Optional callback
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { handleFileChange, handleRemoveFile } = useInstantFileUpload(
    {mediaFiles,
    activeVideoId,
    setMediaFiles,
    setActiveVideoId
});

  const toggleVideoPlayback = (id: string) => {
    setActiveVideoId(activeVideoId === id ? "" : id);
  };

<<<<<<< HEAD
=======
  const handleRemoveMedia = async (id: string) => {
    const mediaToRemove = mediaFiles.find((media) => media.id === id);
    if (!mediaToRemove) return;

    try {
      // Remove from Supabase if already uploaded
      if (mediaToRemove.storagePath) {
        await deleteFile(mediaToRemove.storagePath);
      }

      // Remove from local state
      setMediaFiles((prev) => prev.filter((media) => media.id !== id));
      
      // Clean up video playback if needed
      if (activeVideoId === id) setActiveVideoId("");
      
      // Clean up object URL
      if (mediaToRemove.previewUrl) {
        URL.revokeObjectURL(mediaToRemove.previewUrl);
      }
      onFileRemoved?.(id);
    } catch (error) {
      console.error("Failed to delete file:", error);
    }
  };

>>>>>>> master
  const handleAddMediaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white">
      <div className="mb-4">
        <Label className="text-[15px]">{title}</Label>
        <p className="text-sm text-darkGray">{description}</p>
      </div>
  
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {mediaFiles.map((media) => (
          <div key={media.id} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center relative">
              {media.status === "uploading" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Loader2 className="animate-spin text-white h-8 w-8" />
                </div>
              )}
              {media.type === "video" ? (
                <div className="w-full h-full">
                  <video
                    src={media.publicUrl}
                    className="object-cover w-full h-full"
                    controls={activeVideoId === media.id}
                    muted={activeVideoId !== media.id}
                    onClick={() => {media.status === "uploaded" && toggleVideoPlayback(media.id)}}
                  />
                  {activeVideoId !== media.id && media.status === "uploaded" && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => toggleVideoPlayback(media.id)}
                    >
                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                        <Play size={40} className="text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ) : media.type === "image" ? (
                <img
                  src={media.status === "uploading" ? media.previewUrl : media.publicUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black/5">
                  <FileText size={48} className="text-gray-400 mb-2 stroke-1" />
                  <p className="text-xs text-gray-500 truncate w-full">
                    {media.file.name}
                  </p>
                </div>
              )}
            </div>
  
            {/* File type indicator and remove button remain the same */}
            <div className="absolute top-2 left-2 bg-white rounded-full p-1 shadow">
              {media.type === "video" ? (
                <Film size={16} />
              ) : media.type === "image" ? (
                <Image size={16} />
              ) : (
                <FileText size={16} />
              )}
            </div>
  
            {!(media.status === "uploading") &&
              <div
                onClick={() => handleRemoveFile(media.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 
                          opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Remove media"
              >
                <X size={16} />
              </div>
            }
          </div>
        ))}
  
        {/* Add media button remains the same */}
        <div
          onClick={handleAddMediaClick}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex 
                    flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
        >
          <Plus size={24} className="text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">Add Media</p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,video/*,.pdf,.doc,.docx"
            multiple
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
