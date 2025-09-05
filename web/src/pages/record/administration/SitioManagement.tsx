import { Badge } from "@/components/ui/badge"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Plus, X } from "lucide-react"

export default function SitioManagement() {
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
      <div className="flex flex-wrap h-full max-h-[400px] pb-10 overflow-y-auto gap-5">
        {sitioList?.map((sitio) => (
          <div className="relative">
            <div className="flex">
              <ConfirmationModal 
                trigger={
                  <div className="absolute top-0 right-[-14px] p-1 bg-red-400/20 rounded-full cursor-pointer">
                    <X size={14} className="text-red-600"/>
                  </div>
                }
                title="Confirm Deletion"
                description="Are you sure you want to delete this sitio? Once confirmed, it cannot be undone."
                variant="destructive"
                onClick={() => {}}
              />
            </div>
            <div className="pt-3">
              <Badge>{sitio.name}</Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute w-full bottom-0 right-0 p-5 bg-white rounded-b-lg">
        <div className="w-full flex justify-end items-center gap-2 text-sm cursor-pointer">
          Add Sitio
          <Plus size={20}/>
        </div>
      </div>
    </div>
  )
}