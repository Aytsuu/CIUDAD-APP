import { DisbursementFile } from "./incDisb-types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { Archive, ArchiveRestore, Trash } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog";

export function DocumentCard({
  doc,
  showActions,
  onDelete,
  onArchive,
  onRestore,
  isDeleting,
  isArchived = false,
}: {
  doc: DisbursementFile;
  showActions: boolean;
  onDelete?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  isDeleting: boolean;
  isArchived?: boolean;
}) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const displayName = doc.disf_name 
    ? doc.disf_name.length > 21 
      ? `${doc.disf_name.substring(0, 25)}...` 
      : doc.disf_name
    : "Unknown";

  // Check if file is an image
  const isImage = doc.disf_type?.startsWith("image/");
  // Check if file is a PDF
  const isPDF = doc.disf_type === "application/pdf" || doc.disf_name?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="flex flex-col items-center p-4 rounded-lg">
        <div className="relative w-full h-64 flex justify-center items-center">
          {showActions && (
            <div className="absolute right-2 top-2 z-10 flex gap-2">
              {isArchived ? (
                <>
                  {onRestore && (
                    <ConfirmationModal
                      trigger={
                        <Button
                          size="icon"
                          className="h-8 w-8 bg-green-600"
                          disabled={isDeleting}
                        >
                          <ArchiveRestore size={16} />
                        </Button>
                      }
                      title="Restore Supporting Document"
                      description="Are you sure you want to restore this document?"
                      actionLabel={isDeleting ? "Restoring..." : "Restore"}
                      onClick={onRestore}
                      type="success"
                    />
                  )}
                  {onDelete && (
                    <ConfirmationModal
                      trigger={
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDeleting}
                        >
                          <Trash size={16} />
                        </Button>
                      }
                      title="Delete Supporting Document"
                      description="Are you sure you want to permanently delete this document?"
                      actionLabel={isDeleting ? "Deleting..." : "Delete"}
                      onClick={onDelete}
                      type="destructive"
                    />
                  )}
                </>
              ) : (
                <>
                  {onArchive && (
                    <ConfirmationModal
                      trigger={
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          disabled={isDeleting}
                        >
                          <Archive size={16} />
                        </Button>
                      }
                      title="Archive Supporting Document"
                      description="Are you sure you want to archive this document?"
                      actionLabel={isDeleting ? "Archiving..." : "Archive"}
                      onClick={onArchive}
                      type="warning"
                    />
                  )}
                </>
              )}
            </div>
          )}
          
          {isImage && doc.disf_url ? (
            // Image - opens in modal
            <div className="w-full h-full flex justify-center items-center">
              <img
                src={doc.disf_url}
                alt={`Supporting Document ${displayName}`}
                className="w-full h-full object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
                onError={(e) => {
                  // console.error(`Failed to load image: ${doc.disf_url}`);
                  (e.target as HTMLImageElement).src = "/placeholder-image.png";
                }}
              />
            </div>
          ) : isPDF && doc.disf_url ? (
            // PDF - opens in new tab
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md p-4">
              <div className="mt-2 text-sm text-gray-600">
                <p className="text-sm text-gray-600">{displayName}</p>
              </div>
              <a
                href={doc.disf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 hover:underline"
              >
                View PDF
              </a>
            </div>
          ) : doc.disf_url ? (
            // Other file types - open in new tab
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md p-4">
              <p className="text-sm text-gray-600 text-center mb-2">
                {displayName}
              </p>
              <a
                href={doc.disf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 hover:underline"
              >
                View Document
              </a>
            </div>
          ) : (
            // No file available
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md">
              <p className="text-sm text-gray-600">No file available</p>
            </div>
          )}
        </div>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {displayName} {isArchived && "(Archived)"}
        </p>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] w-auto max-h-[95vh] h-auto p-0 bg-transparent border-none shadow-none">
          <div className="relative">
            <img
              src={doc.disf_url}
              alt={`Supporting Document ${displayName}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                // console.error(`Failed to load image: ${doc.disf_url}`);
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}