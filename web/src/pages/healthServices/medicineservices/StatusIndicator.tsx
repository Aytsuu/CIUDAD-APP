import { CheckCircle2, ImageIcon, Pill,FileText } from "lucide-react";
import { MediaUploadType } from "@/components/ui/media-upload";

export const StatusIndicator = ({ selectedMedicines, totalSelectedQuantity, hasPrescriptionMedicine, mediaFiles }: { selectedMedicines: any[]; totalSelectedQuantity: number; hasPrescriptionMedicine: boolean; mediaFiles: MediaUploadType }) => {
    return (
      <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-emerald-900">
            {selectedMedicines.length} medicine
            {selectedMedicines.length > 1 ? "s" : ""} selected
          </p>
          <p className="text-xs text-emerald-700">Total quantity: {totalSelectedQuantity} items</p>
          {mediaFiles.length > 0 && (
            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" />
              {mediaFiles.length} supporting document{mediaFiles.length > 1 ? "s" : ""} uploaded
            </p>
          )}
          {hasPrescriptionMedicine && (
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Pill className="h-3 w-3" />
              Prescription medicine detected - {mediaFiles.length > 0 ? "✓ image uploaded" : "image upload required"}
            </p>
          )}
        </div>
      </div>
    );
  };


  export const ImageGallery = ({ mediaFiles }: { mediaFiles: MediaUploadType }) => {
    if (!mediaFiles || mediaFiles.length === 0) return null;
  
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Uploaded Supporting Documents
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {mediaFiles.map((media, index) => (
            <div key={index} className="relative group">
              {media.type.startsWith("image/") ? (
                <img src={media.file as string} alt={media.name || `Supporting document ${index + 1}`} className="w-full h-32 object-cover rounded-lg border border-gray-200" />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                  <FileText className="h-8 w-8 text-gray-400" />
                  <span className="sr-only">Document: {media.name}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <p className="text-white text-xs text-center px-2 truncate">{media.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  