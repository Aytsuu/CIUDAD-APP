import React from "react";
import { Film, Play, Image, Plus, X, FileText } from "lucide-react";
import { Label } from "./label";
import { cn } from "@/lib/utils";
import { useInstantFileUpload } from "@/hooks/use-file-upload";

export const MediaUpload = ({
  title,
  description,
  mediaFiles,
  activeVideoId,
  setMediaFiles,
  setActiveVideoId,
  maxFiles,
  viewMode = 'grid',
  acceptableFiles = 'all',
  onRemoveMedia,
  hideRemoveButton = false,
  readOnly = false
}: {
  title: string;
  description: string;
  mediaFiles: MediaUploadType
  activeVideoId?: string;
  setMediaFiles: React.Dispatch<React.SetStateAction<MediaUploadType>>;
  setActiveVideoId?: React.Dispatch<React.SetStateAction<string>>;
  maxFiles?: number;
  viewMode?: 'grid' | 'list';
  acceptableFiles?: "all" | "document" | "image" | "video";
  onRemoveMedia?: (id: string) => void;
  hideRemoveButton?: boolean;
  readOnly?: boolean;
}) => {
  
  const { handleFileChange, handleRemoveMedia } = useInstantFileUpload({
    mediaFiles,
    activeVideoId,
    setMediaFiles,
    setActiveVideoId
  });

  const handleOpenDocument = (url: string) => { 
    window.open(url, '_blank');
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isMaxFilesReached = maxFiles ? mediaFiles.length >= maxFiles : false;

  const toggleVideoPlayback = (id: string) => {
    setActiveVideoId && setActiveVideoId(activeVideoId === id ? "" : id);
  };

  const handleAddMediaClick = () => {
    if (readOnly) return;
    fileInputRef.current?.click();
  };

  const getFileIcon = (type: string) => {
    if (type.split("/")[0] === "video") return <Film size={16} />;
    if (type.split("/")[0] === "image") return <Image size={16} />;
    return <FileText size={16} />;
  };

  const fileAccepted = {
    all: "image/*,video/*,.pdf",
    image: "image/*",
    video: "video/*",
    document: ".pdf"
  }

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white">
      <div className="mb-4">
        <Label className="text-[15px]">{title}</Label>
        <p className="text-sm text-darkGray">{description}</p>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
          {mediaFiles.map((media) => (
            <div key={media.id} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-md overflow-hidden flex items-center justify-center relative">
                {media.type.split("/")[0] === "video" ? (
                  <div className="w-full h-full">
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
                ) : media.type.split("/")[0] === "image" ? (
                  <img
                    src={media.url}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-black/5">
                    <FileText size={48} className="text-gray-400 mb-2 stroke-1" />
                    <p className="text-xs text-gray-500 truncate w-full">
                      {media.name}
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
                {getFileIcon(media.type)}
              </div>

              {!hideRemoveButton && (
                <div
                  onClick={() => handleRemoveMedia(media.id)}
                  className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 
                            opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Remove media"
                >
                  <X size={16} />
                </div>
              )}
            </div>
          ))}
        
        {!readOnly && (
          <div
            onClick={!isMaxFilesReached ? handleAddMediaClick : undefined}
            className={cn(
              "aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center",
              isMaxFilesReached
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 cursor-pointer hover:bg-gray-50"
            )}
            aria-disabled={isMaxFilesReached}
          >
            <Plus size={24} className={isMaxFilesReached ? "text-gray-300" : "text-gray-400"} />
            <p className={cn(
              "text-xs mt-1",
              isMaxFilesReached ? "text-gray-300" : "text-gray-500"
            )}>
              {isMaxFilesReached ? "Maximum reached" : "Add Media"}
            </p>
          </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {mediaFiles.map((media) => (
            <div key={media.id} className="group flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                {media.type.split("/")[0] === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.url}
                      className="object-cover w-full h-full"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div 
                        className="bg-black bg-opacity-50 rounded-full p-1 cursor-pointer"
                        onClick={() => toggleVideoPlayback(media.id)}
                      >
                        <Play size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                ) : media.type.split("/")[0] === "image" ? (
                  <img
                    src={media.url}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <FileText size={24} className="text-gray-400" />
                )}
              </div>

              <div className="flex-grow min-w-0 cursor-pointer"
                onClick={() => handleOpenDocument(media.url as string)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {media.name}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="capitalize">{media.type.split("/").pop()}</span>
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                {media.type.split("/")[0] === "video" && (
                  <button
                    onClick={() => toggleVideoPlayback(media.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={activeVideoId === media.id ? "Pause video" : "Play video"}
                  >
                    <Play size={16} />
                  </button>
                )}
                {!hideRemoveButton && (
                  <button
                    onClick={() => {
                      handleRemoveMedia(media.id)
                      onRemoveMedia && onRemoveMedia(media.id)
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove media"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {!readOnly && (
          <div
            onClick={!isMaxFilesReached ? handleAddMediaClick : undefined}
            className={cn(
              "flex items-center gap-3 p-3 transition-colors",
              isMaxFilesReached
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 cursor-pointer hover:bg-gray-50"
            )}
            aria-disabled={isMaxFilesReached}
          >
            <div className="flex-shrink-0 w-12 h-12 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
              <Plus size={20} className={isMaxFilesReached ? "text-gray-300" : "text-gray-400"} />
            </div>
            <div>
              <p className={cn(
                "text-sm font-medium",
                isMaxFilesReached ? "text-gray-300" : "text-gray-600"
              )}>
                {isMaxFilesReached ? "Maximum files reached" : "Add Media"}
              </p>
              <p className={cn(
                "text-xs",
                isMaxFilesReached ? "text-gray-300" : "text-gray-500"
              )}>
                Click to upload files
              </p>
            </div>
          </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={fileAccepted[acceptableFiles]}
        multiple={maxFiles != 1}
        className="hidden"
        disabled={isMaxFilesReached || readOnly}
      />
    </div>
  );
};

export type MediaUploadType = 
  Array<{
    id: string;
    name: string;
    type: string;
    file?: string;
    url?: string;
  }>