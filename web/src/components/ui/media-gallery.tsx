import React from "react"
import { ImageModal } from "@/components/ui/image-modal"
import {
  ExternalLink,
  FileText,
  ZoomIn,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Media Gallery Component
export const MediaGallery = ({ mediaFiles, emptyState } : { mediaFiles: any, emptyState?: React.ReactNode}) => {
  const [selectedImage, setSelectedImage] = React.useState<any>();

  const handleOpenDocument = (url: string) => { 
    // Open document in new tab
    window.open(url, '_blank');
  };

  if (!mediaFiles || mediaFiles.length === 0 && emptyState) {
    return emptyState
  }

  if (!mediaFiles || mediaFiles.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No document
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mediaFiles.map((media: any, index: any) => (
          <div key={index} className="group relative">
            <div
              className="relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
              onClick={() => {
                if(media.type === 'document') handleOpenDocument(media.url)
                else setSelectedImage(media as any)
              }}
            >
              {media.type === 'document' ? (
                // Document preview
                <div className="w-full aspect-square bg-gray-100 flex flex-col items-center justify-center">
                  <FileText size={48} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-600 text-center px-2">
                    {media.name || `Document ${index + 1}`}
                  </span>
                </div>
              ) : (
                // Image preview
                <img
                  src={media.url}
                  alt={`Supporting document ${index + 1}`}
                  className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {media.type === 'document' ? (
                    <ExternalLink size={40} className="text-white"/>
                  ) : (
                    <ZoomIn size={40} className="text-white"/>
                  )}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 mt-2 text-center truncate">
              {media.type === 'document' ? 
                (media.name || `Document ${index + 1}`) : 
                `Image ${index + 1}`
              }
            </p>
          </div>
        ))}
      </div>

      <ImageModal
        src={selectedImage?.url || ""}
        alt="Supporting document"
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  );
};