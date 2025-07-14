import { Button } from "@/components/ui/button/button"
import { FileInput, CircleAlert } from "lucide-react"
import DialogLayout from "@/components/ui/dialog/dialog-layout"
import SummonSuppDocForm from "./summon-supp-doc-form"

export default function SummonSuppDocs() {
  return (
    <div className="overflow-hidden">
      {/* Header with Title, Description and Add Button */}
      {/* <div className="border-b border-gray-200"> */}
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
            mainContent={
              <SummonSuppDocForm/>
            }
          />
        </div>
      {/* </div> */}

      {/* Main Content Area */}
      <div className="h-full overflow-auto">
        {/* No Documents Message - centered */}
        <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
          <CircleAlert className="mb-4 text-gray-400" size={64} />
          <p className="text-gray-500 text-xl text-center">No supporting documents available for this case activity</p>
          <p className="text-gray-400 text-sm mt-2 text-center">
            Use the "Add Supporting Document" button above to upload files
          </p>
        </div>
      </div>
    </div>
  )
}
