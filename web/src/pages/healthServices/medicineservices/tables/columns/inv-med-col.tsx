// src/features/medicine/components/medicine-record-columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

// Skeleton component for loading state
const DocumentSkeleton = () => (
  <div className="border rounded-lg p-4 animate-pulse flex flex-col">
    <div className="bg-gray-200 h-4 w-3/4 mb-3 rounded"></div>
    <div className="bg-gray-200 h-48 w-full rounded flex-grow"></div>
  </div>
);

// Modal component for viewing documents
const DocumentModal = ({ files, isOpen, onClose, isLoading = false }: { files: any[]; isOpen: boolean; onClose: () => void; isLoading?: boolean }) => {
  if (!isOpen) return null;

  return (
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
                    className="border border-gray-200 rounded-lg p-4 flex flex-col shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="mb-2">
                      <h4 className="text-sm font-medium text-gray-700 truncate">
                        {file.medf_name || `Document ${index + 1}`}
                      </h4>
                    </div>
                    <div className="flex-grow overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center min-h-[250px]">
                      <img 
                        src={file.medf_url} 
                        alt={file.medf_name || `Document ${index + 1}`} 
                        className="w-full h-auto max-h-64 object-contain p-2" 
                      />
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
    cell: ({ row }) => (
      <div className="flex justify-center px-3 py-2">
        {row.original.signature ? (
            <div className="h-12 w-32 border border-gray-200 rounded bg-white p-1">
              <img 
                src={`data:image/png;base64,${row.original.signature}`} 
                alt="Authorized Signature" 
                className="h-full w-full object-contain" 
              />
            </div>
        ) : (
          <div className="text-xs text-gray-400 italic">No signature</div>
        )}
      </div>
    )
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