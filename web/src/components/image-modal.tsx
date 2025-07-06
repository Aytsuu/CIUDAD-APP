import { X } from "lucide-react";

// Image Modal Component
export const ImageModal = ({
  src,
  alt,
  isOpen,
  onClose,
}: {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button - always visible */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-200"
        >
          <X size={20} />
        </button>

        {/* Image container - fully responsive */}
        <div className="relative w-full h-full">
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-contain bg-black/30 py-16"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>
    </div>
  );
};
