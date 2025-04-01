import { Film, Play, Image, Plus, X } from "lucide-react";
import { ChangeEvent } from "react";
import { Label } from "./label";

interface MediaFile {
  id: string;
  type: "image" | "video" | "document";
  url: string;
  file?: File;
  description: string;
}

export const MediaUpload = ({
  title,
  description,
  mediaFiles,
  activeVideoId,
  fileInputRef,
  toggleVideoPlayback,
  handleRemoveMedia,
  handleAddMediaClick,
  handleFileChange
}: {
  title: string;
  description: string;
  mediaFiles: MediaFile[];
  activeVideoId: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  toggleVideoPlayback: (value: string) => void;
  handleRemoveMedia: (value: string) => void;
  handleAddMediaClick: () => void;
  handleFileChange: (value: ChangeEvent<HTMLInputElement>) => void;
  
}) => {
  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white">
      {/*Description */}
      <div className="mb-4">
        <Label className="text-[15px]">{title}</Label>
        <p className="text-sm text-darkGray">
          {description}
        </p>
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
              ) : (
                <img
                  src={media.url}
                  alt={`Evidence ${media.id}`}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow">
              {media.type === "video" ? (
                <Film size={16} className="text-gray-500" />
              ) : (
                <Image size={16} className="text-gray-500" />
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
            accept="image/*,video/*"
            multiple
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
