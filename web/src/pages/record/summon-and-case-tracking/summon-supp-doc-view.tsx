import { Button } from "@/components/ui/button/button"
import { FileInput, CircleAlert, FileText, Edit, Trash2 } from "lucide-react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import SummonSuppDocForm from "./summon-supp-doc-form"
import { useState } from "react"
import { useGetSuppDoc } from "./queries/summonFetchQueries"
import { formatTimestamp } from "@/helpers/timestampformatter"
import { Skeleton } from "@/components/ui/skeleton"
import { useDeleteSuppDoc } from "./queries/summonDeleteQueries"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import SummonSuppDocEditForm from "./summon-supp-doc-edit"

export default function SummonSuppDocs({ ca_id }: { ca_id: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRowId, setEditingRowId] = useState<number | null>(null)

  const { data: suppDocs = [], isLoading } = useGetSuppDoc(ca_id);
  const { mutate: deleteSuppDoc} = useDeleteSuppDoc()
  const hasDocuments = suppDocs.length > 0

  // const handleEdit = (docId: string) => {
  //   // Handle edit functionality
  //   console.log("Edit document:", docId)
  // }

  const handleDelete = (csd_id: string) => {
    deleteSuppDoc(csd_id)
  }

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg">
        <Skeleton className="h-8 w-1/3 mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-16 w-full mt-4" />
      </div>
    )
  }

  return (
    <div>
      {/* Header with Title, Description and Add Button */}
      <div className="flex justify-end items-start mb-2">
        <DialogLayout
          trigger={
            <Button size="default">
              <FileInput className="mr-2 h-4 w-4" />
              Add Supporting Document
            </Button>
          }
          title="Add Supporting Document"
          description="Upload relevant photos to support this case activity."
          mainContent={<SummonSuppDocForm ca_id={ca_id} onSuccess={() => setIsDialogOpen(false)} />}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>

      {/* Main Content Area */}
      <div >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading documents...</p>
          </div>
        ) : hasDocuments ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-2">
            {suppDocs.map((doc) => (
              <div key={doc.csd_id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors shadow-sm">
                <div className="flex gap-8">
                  {/* Document Preview - Made Even Bigger */}
                  {doc.csd_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <div className="flex-shrink-0 w-40 h-40 bg-gray-100 rounded-lg overflow-hidden border">
                      <img
                        src={doc.csd_url || "/placeholder.svg"}
                        alt={doc.csd_name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(doc.csd_url, "_blank")}
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-40 h-40 bg-gray-100 rounded-lg flex items-center justify-center border">
                      <FileText className="text-gray-400 w-16 h-16" />
                    </div>
                  )}

                  {/* Document Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate mb-2">{doc.csd_name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {doc.csd_description || "No description provided"}
                    </p>
                    <p className="text-xs text-gray-400">Uploaded: {formatTimestamp(doc.csd_upload_date)}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex-shrink-0 flex flex-col gap-2">
                    <DialogLayout
                        trigger={
                            <Button variant="outline" size="sm" className="p-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                        }
                        title="Edit Supporting Document"
                        description="Update relevant supporting document for the case activity."
                        mainContent={
                          <SummonSuppDocEditForm
                            csd_id={doc.csd_id}
                            csd_url={doc.csd_url}
                            csd_description = {doc.csd_description}
                            onSuccess={() => setEditingRowId(null)}
                          />
                        }
                        isOpen={editingRowId === Number(doc.csd_id)}
                        onOpenChange={(open) => setEditingRowId(open ? Number(doc.csd_id) : null)}
                    />
                    <ConfirmationModal
                        trigger={
                          <Button variant="outline"  size="sm" className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                        title="Delete Confirmation"
                        description="Would you like to permanently delete this document?"
                        actionLabel="Confirm"
                        onClick={() => handleDelete(doc.csd_id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
            <CircleAlert className="mb-4 text-gray-400" size={64} />
            <p className="text-gray-500 text-xl text-center">
              No supporting documents available for this case activity
            </p>
            <p className="text-gray-400 text-sm mt-2 text-center">
              Use the "Add Supporting Document" button above to upload files
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
