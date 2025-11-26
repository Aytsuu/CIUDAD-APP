import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { Archive, ArchiveRestore, Trash, Eye } from "lucide-react";
import { AttendanceSheet } from "../Calendar/councilEventTypes";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog";

interface AttendanceDocumentCardProps {
  doc: AttendanceSheet;
  showActions: boolean;
  onDelete?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  isDeleting?: boolean;
  isArchived?: boolean;
  index?: number;
}

export function AttendanceDocumentCard({
  doc,
  showActions,
  onDelete,
  onArchive,
  onRestore,
  isDeleting = false,
  isArchived = false,
  index = 0,
}: AttendanceDocumentCardProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const displayName = `Attendance Sheet ${index + 1}`;

  // Check if file is an image (attendance sheets are typically images)
  const isImage = doc.att_file_type?.startsWith("image/");

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
                          className="h-8 w-8 bg-green-600 hover:bg-green-700"
                          disabled={isDeleting}
                        >
                          <ArchiveRestore size={16} />
                        </Button>
                      }
                      title="Restore Attendance Sheet"
                      description="Are you sure you want to restore this attendance sheet?"
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
                      title="Delete Attendance Sheet"
                      description="Are you sure you want to permanently delete this attendance sheet?"
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
                      title="Archive Attendance Sheet"
                      description="Are you sure you want to archive this attendance sheet?"
                      actionLabel={isDeleting ? "Archiving..." : "Archive"}
                      onClick={onArchive}
                      type="warning"
                    />
                  )}
                </>
              )}
            </div>
          )}
          
          {doc.att_file_url ? (
            isImage ? (
              // Image - opens in modal
              <div className="w-full h-full flex justify-center items-center">
                <img
                  src={doc.att_file_url}
                  alt={`Attendance Sheet ${displayName}`}
                  className="w-full h-full object-contain rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                  onError={(e) => {
                    // console.error(`Failed to load image: ${doc.att_file_url}`);
                    (e.target as HTMLImageElement).src = "/placeholder-image.png";
                  }}
                />
              </div>
            ) : (
              // Non-image files - open in new tab
              <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md p-4">
                <Eye size={48} className="text-gray-400 mb-2" />
                <a
                  href={doc.att_file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-blue-600 hover:underline text-sm font-medium"
                >
                  View Document
                </a>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md p-4">
              <Eye size={48} className="text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 text-center">
                No file uploaded for {displayName}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-[95vw] w-auto max-h-[95vh] h-auto p-0 bg-transparent border-none shadow-none">
          <div className="relative">
            <img
              src={doc.att_file_url}
              alt={`Attendance Sheet ${displayName}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onError={(e) => {
                // console.error(`Failed to load image: ${doc.att_file_url}`);
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}