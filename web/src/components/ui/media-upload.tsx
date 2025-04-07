import React from "react";
import { Film, Play, Image, Plus, X, FileText } from "lucide-react";
import { ChangeEvent } from "react";
import { Label } from "./label";

export const MediaUpload = ({
  title,
  description,
  mediaFiles,
  activeVideoId,
  setMediaFiles,
  setActiveVideoId
}: {
  title: string;
  description: string;
  mediaFiles: any[];
  activeVideoId: string;
  setMediaFiles: React.Dispatch<React.SetStateAction<any[]>>
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>
}) => {
  // Create a ref for the file input
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Handler for file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 0) {
      const newMediaFiles = selectedFiles.map((file, index) => {
        // Create URL for preview
        const previewUrl = URL.createObjectURL(file);

        // Determine if file is image or video
        const fileType = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document";

        return {
          id: mediaFiles.length + index + 1,
          type: fileType as "image" | "video" | "document",
          url: previewUrl,
          file: file,
          description: file.name,
        };
      });

      setMediaFiles([...mediaFiles, ...newMediaFiles]);
    }

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  // Toggle video playback
  const toggleVideoPlayback = (id: string) => {
    setActiveVideoId(activeVideoId === id ? "" : id);
  };

  // Handler to open file dialog
  const handleAddMediaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler to remove a media file
  const handleRemoveMedia = (id: string) => {
    setMediaFiles(mediaFiles.filter((media) => media.id !== id));
    if (activeVideoId === id) {
      setActiveVideoId("");
    }
  };

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white">
      {/*Description */}
      <div className="mb-4">
        <Label className="text-[15px]">{title}</Label>
        <p className="text-sm text-darkGray">{description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
        {mediaFiles.map((media) => (
          <div key={media.id} className="relative group">
            <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
              {media.type === "video" ? (
                <div className="w-full h-full relative">
                  <video
                    src={media.url}
                    className="object-cover w-full h-full"
                    controls={activeVideoId === media.id}
                    muted={activeVideoId !== media.id}
                    onClick={() => toggleVideoPlayback(media.id)}
                  />
                  {activeVideoId !== media.id && (
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
                  src={media.url}
                  alt={`Evidence ${media.id}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black/5">
                  <FileText size={48} className="text-gray-400 mb-2 stroke-1" />
                  <p className="text-xs text-gray-500 truncate w-full">
                    {media.file?.name || "Document"}
                  </p>
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              {media.type === "video" ? (
                <Film size={16} className="text-black" />
              ) : media.type === "image" ? (
                <Image size={16} className="text-black" />
              ) : (
                <FileText size={16} className="text-black" />
              )}
            </div>

            {/* Remove button and shows on hover */}
            <button
              onClick={() => handleRemoveMedia(media.id)}
              className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove media"
              type="button"
            >
              <X size={16} />
            </button>
          </div>
        ))}

        {/* Upload new */}
        <div
          onClick={handleAddMediaClick}
          className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
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