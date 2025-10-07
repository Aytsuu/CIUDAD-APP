import { SupportDoc } from "./projprop-types";
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
  doc: SupportDoc;
  showActions: boolean;
  onDelete?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  isDeleting: boolean;
  isArchived?: boolean;
}) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const displayName = doc.psd_name 
    ? doc.psd_name.length > 21 
      ? `${doc.psd_name.substring(0, 25)}...` 
      : doc.psd_name
    : "Unknown";
  
  const isPDF = doc.psd_type === "application/pdf" || doc.psd_name?.toLowerCase().endsWith('.pdf');
  
  return (
    <> {/* Added fragment wrapper */}
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
          {doc.psd_type?.startsWith("image/") && doc.psd_url ? (
            <div className="w-full h-full flex justify-center items-center">
                <img
                  src={doc.psd_url}
                  alt={`Supporting Document ${displayName}`}
                  className="w-full h-full object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                  onError={(e) => {
                    console.error(`Failed to load image: ${doc.psd_url}`);
                    (e.target as HTMLImageElement).src = "/placeholder-image.png";
                  }}
                />
              </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md">
              <p className="mt-2 text-sm text-gray-600">
                {isPDF ? "PDF Document" : displayName}
              </p>
              {doc.psd_url ? (
                <a
                  href={doc.psd_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-600 hover:underline"
                >
                  {isPDF ? "View PDF" : "View Document"}
                </a>
              ) : (
                <p className="mt-2 text-sm text-red-500">No file available</p>
              )}
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
              src={doc.psd_url}
              alt={`Supporting Document ${displayName}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                console.error(`Failed to load image: ${doc.psd_url}`);
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}