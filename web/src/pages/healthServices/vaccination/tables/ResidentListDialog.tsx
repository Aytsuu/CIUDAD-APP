import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"
import type { UnvaccinatedResident } from "./columns/types"

interface ResidentListDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  title: string
  residents: UnvaccinatedResident[]
}

export default function ResidentListDialog({ isOpen, onOpenChange, title, residents }: ResidentListDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>List of unvaccinated residents for this age group.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {residents.length > 0 ? (
            residents.map((resident) => (
              <div key={resident.pat_id} className="border rounded-md p-2 bg-gray-50 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <p className="text-lg font-semibold text-darkBlue2">
                    {resident.fname} {resident.mname ? `${resident.mname} ` : ""}
                    {resident.lname}
                  </p>
                  <p className="text-sm text-gray-600">
                    Age: <span className="font-medium">{resident.age}</span>
                  </p>
                </div>
                <p className="text-sm text-gray-500">Sex: {resident.sex}</p>
                <p className="text-sm text-gray-500">Address: {resident.address}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No residents found for this group.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
