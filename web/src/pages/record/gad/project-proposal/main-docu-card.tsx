import { SupportDoc } from "./projprop-types";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button/button";
import { Archive, ArchiveRestore, Trash } from "lucide-react";

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
  return (
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
          <a
            href={doc.psd_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-full flex justify-center items-center"
          >
            <img
              src={doc.psd_url}
              alt={`Supporting Document ${doc.psd_name || "Unknown"}`}
              className="w-full h-full object-contain rounded-md cursor-pointer"
              onError={(e) => {
                console.error(`Failed to load image: ${doc.psd_url}`);
                (e.target as HTMLImageElement).src = "/placeholder-image.png";
              }}
            />
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center h-full w-full bg-gray-100 rounded-md">
            <p className="mt-2 text-sm text-gray-600">
              {doc.psd_name || "No file name"}
            </p>
            {doc.psd_url ? (
              <a
                href={doc.psd_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-blue-600 hover:underline"
              >
                View Document
              </a>
            ) : (
              <p className="mt-2 text-sm text-red-500">No file available</p>
            )}
          </div>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        {doc.psd_name || "Unknown"} {isArchived && "(Archived)"}
      </p>
    </div>
  );
}