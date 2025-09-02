import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button/button";
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Plus, RotateCcw, Trash, X } from "lucide-react"
import React from "react"

export default function SitioManagement() {
  const [deleteMode, setDeleteMode] = React.useState<boolean>(false);

  const sitioList = [
    {id: "palma", name: "Palma"},
    {id: "cuenco", name: "Cuenco"},
    {id: "arellano", name: "Arellano"},
    {id: "lomboy", name: "Lomboy"},
    {id: "lapu-lapu", name: "Lapu-Lapu"},
    {id: "mabini", name: "Mabini"},
    {id: "logarta", name: "Logarta"},
    {id: "burgos", name: "Burgos"},
    {id: "v. gullas", name: "V. Gullas"},
  ]
  // title="Sitio"
  //               description="List of Sition in San Roque (Ciudad)"
  return (
    <div className="flex justify-center">
      <div className="flex flex-wrap h-full max-h-[400px] pb-10 overflow-y-auto gap-4">
        {sitioList?.map((sitio) => (
          <div className="relative">
            <div className="flex">
              {deleteMode && <ConfirmationModal 
                trigger={
                  <div className="absolute top-0 right-[-14px] p-1 bg-red-400/20 rounded-full cursor-pointer">
                    <X size={14} className="text-red-600"/>
                  </div>
                }
                title="Confirm Deletion"
                description="Are you sure you want to delete this sitio? Once confirmed, it cannot be undone."
                variant="destructive"
                onClick={() => {}}
              />}
            </div>
            <div className="pt-2">
              <p className="py-2 px-3 bg-gray-200 rounded-lg text-sm">{sitio.name}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute w-full bottom-0 right-0 p-4 bg-white rounded-b-lg">
        <div className="flex justify-end gap-2">
            {
              !deleteMode ? (
                <Button variant={"destructive"} className="rounded-full w-7 h-8"
                  onClick={() => setDeleteMode((prev) => !prev)}
                >
                  <Trash size={18}/>
                </Button>
              ) : (
                <Button variant={"secondary"} className="rounded-full w-7 h-8"
                  onClick={() => setDeleteMode((prev) => !prev)}
                >
                  <RotateCcw size={18}/>
                </Button>
              )
            }
            <Button className="rounded-full w-7 h-8">
              <Plus size={18}/>
            </Button>
        </div>
      </div>
    </div>
  )
}