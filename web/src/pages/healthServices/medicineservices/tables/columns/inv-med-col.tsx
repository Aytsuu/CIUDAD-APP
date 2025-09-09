// src/features/medicine/components/medicine-record-columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Skeleton component for loading state
const DocumentSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse flex flex-col">
    <div className="bg-gray-200 h-4 w-3/4 mb-3 rounded"></div>
    <div className="bg-gray-200 h-48 w-full rounded flex-grow"></div>
  </div>
);

// Signature Modal Component
export const SignatureModal = ({ 
  signature, 
  isOpen, 
  onClose 
}: { 
  signature: string; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 bg-black bg-opacity-50 rounded-full"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {/* Main Signature Image */}
      <div className="max-w-full max-h-full flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-2xl">
          <img
            src={`data:image/png;base64,${signature}`}
            alt="Authorized Signature"
            className="max-w-full max-h-full object-contain"
            style={{ maxHeight: '80vh', maxWidth: '80vw', minWidth: '400px', minHeight: '200px' }}
          />
        </div>
      </div>

      {/* Signature Label */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
        Authorized Signature
      </div>
    </div>
  );
};

// Full Screen Image Viewer Component
const FullScreenImageViewer = ({ 
  images, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrev 
}: { 
  images: any[]; 
  currentIndex: number; 
  onClose: () => void; 
  onNext: () => void; 
  onPrev: () => void; 
}) => {
  const currentImage = images[currentIndex];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2 bg-black bg-opacity-50 rounded-full"
        aria-label="Close"
      >
        <X size={24} />
      </button>
      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 bg-black bg-opacity-50 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 p-2 bg-black bg-opacity-50 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}
      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute top-4 left-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
          {currentIndex + 1} / {images.length}
        </div>
      )}
      {/* Main Image */}
      <div className="max-w-full max-h-full flex items-center justify-center">
        <img
          src={currentImage.medf_url}
          alt={currentImage.medf_name || `Document ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
          style={{ maxHeight: '90vh', maxWidth: '90vw' }}
        />
      </div>
      {/* Image Name */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full max-w-80 truncate">
        {currentImage.medf_name || `Document ${currentIndex + 1}`}
      </div>
    </div>
  );
};

// Modal component for viewing documents
export const DocumentModal = ({ files, isOpen, onClose, isLoading = false }: { files: any[]; isOpen: boolean; onClose: () => void; isLoading?: boolean }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  if (!isOpen) return null;

  // Handle image click to open full screen
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setIsFullScreenOpen(true);
  };

  // Handle full screen navigation
  const handleNextImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % files.length);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + files.length) % files.length);
    }
  };

  const handleCloseFullScreen = () => {
    setIsFullScreenOpen(false);
    setSelectedImageIndex(null);
  };

  return (
    <>
      {/* Main Document Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg flex flex-col max-w-4xl w-full max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Medicine Documents</h3>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 text-2xl transition-colors"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>
          
          {/* Modal Content - Fixed height with scrolling */}
          <div className="p-6 overflow-auto flex-grow">
            {isLoading ? (
              // Skeleton loading state
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((index) => (
                  <DocumentSkeleton key={index} />
                ))}
              </div>
            ) : (
              // Actual content
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {files.length > 0 ? (
                  files.map((file, index) => (
                    <div 
                      key={file.medf_id || index} 
                      className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                      onClick={() => handleImageClick(index)}
                    >
                      <div className="mb-2">
                        <h4 className="text-sm font-medium text-gray-700 truncate">
                          {file.medf_name || `Document ${index + 1}`}
                        </h4>
                      </div>
                      <div className="flex-grow overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[250px] relative">
                        <img 
                          src={file.medf_url} 
                          alt={file.medf_name || `Document ${index + 1}`} 
                          className="w-full h-auto max-h-64 object-contain p-2 transition-transform group-hover:scale-105" 
                        />
                        {/* Overlay with click hint */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
                            Click to view full screen
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Click image to view full screen
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p className="text-lg font-medium">No documents available</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Modal Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Full Screen Image Viewer */}
      {isFullScreenOpen && selectedImageIndex !== null && (
        <FullScreenImageViewer
          images={files}
          currentIndex={selectedImageIndex}
          onClose={handleCloseFullScreen}
          onNext={handleNextImage}
          onPrev={handlePrevImage}
        />
      )}
    </>
  );
};

export const medicineRecordColumns: ColumnDef<any>[] = [
  {
    accessorKey: "medicine",
    header: "Medicine Details",
    cell: ({ row }) => (
      <div className="min-w-[250px] px-3 py-2">
        <div className="font-semibold text-gray-900">{row.original.medicine_name || "Unknown"}</div>
        <div className="text-sm text-gray-600 mt-1">
          {row.original.dosage} {row.original.form}
        </div>
      </div>
    )
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[200px] px-2">
        <div className="flex flex-col">
          <div className="text-sm">
            {row.original.medrec_qty} {row.original.minv_details?.minv_qty_unit === "boxes" ? "pcs" : row.original.minv_details?.minv_qty_unit}
          </div>
        </div>
      </div>
    )
  },
  {
    accessorKey: "requested_at",
    header: "Date Requested",
    cell: ({ row }) => {
      const requestedAt = new Date(row.original.requested_at || Date.now());
      return (
        <div className="min-w-[140px] px-3 py-2">
          <div className="text-sm font-medium">{requestedAt.toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {requestedAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "signature",
    header: "Signature",
    cell: ({ row }) => {
      const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
      
      return (
        <div className="flex justify-center px-3 py-2">
          {row.original.signature ? (
            <>
              <div 
                className="h-12 w-32 border border-gray-200 rounded bg-white p-1 cursor-pointer hover:shadow-md transition-shadow group relative"
                onClick={() => setIsSignatureModalOpen(true)}
              >
                <img 
                  src={`data:image/png;base64,${row.original.signature}`} 
                  alt="Authorized Signature" 
                  className="h-full w-full object-contain group-hover:scale-105 transition-transform" 
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded">
                  <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                    Click to enlarge
                  </span>
                </div>
              </div>
              
              <SignatureModal 
                signature={row.original.signature}
                isOpen={isSignatureModalOpen}
                onClose={() => setIsSignatureModalOpen(false)}
              />
            </>
          ) : (
            <div className="text-xs text-gray-400 italic">No signature</div>
          )}
        </div>
      );
    }
  },
  {
    id: "actions",
    header: "Documents",
    cell: ({ row }) => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isLoading, setIsLoading] = useState(false);
      const files = row.original.files || [];

      const handleOpenModal = async () => {
        setIsModalOpen(true);
        
        // Simulate loading if files are being fetched asynchronously
        if (files.length === 0 || needsToFetchFiles()) {
          setIsLoading(true);
          // Simulate API call or file loading
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsLoading(false);
        }
      };

      // Helper function to determine if files need to be fetched
      const needsToFetchFiles = () => {
        // Add your logic here to determine if files need to be fetched
        // For example: return !row.original.filesLoaded;
        return false; // Default to false if files are already available
      };

      return (
        <div className="px-3 py-2 min-w-[150px]">
          {files.length > 0 ? (
            <>
              <button 
                onClick={handleOpenModal} 
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                View Documents ({files.length})
              </button>
              <DocumentModal 
                files={files} 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                isLoading={isLoading}
              />
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">No documents</span>
          )}
        </div>
      );
    }
  }
];