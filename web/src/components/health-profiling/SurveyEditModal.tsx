import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog"
import { Button } from "@/components/ui/button/button"
import { ComboboxInput } from "@/components/ui/form/form-combobox-input"
import { Save, X, Loader2 } from "lucide-react"
import { useState } from "react"

interface SurveyEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  surveyData: any
  healthStaffOptions: any[]
  familyMemberOptions: any[]
  onSave: (data: { si_id: string; filled_by: string; informant: string; checked_by: string; date: string }) => Promise<void>
  isPending: boolean
}

export const SurveyEditModal = ({
  open,
  onOpenChange,
  surveyData,
  healthStaffOptions,
  familyMemberOptions,
  onSave,
  isPending,
}: SurveyEditModalProps) => {
  const [filledBy, setFilledBy] = useState(surveyData?.filled_by || "")
  const [informant, setInformant] = useState(surveyData?.informant || "")
  const [checkedBy, setCheckedBy] = useState(surveyData?.checked_by || "")
  const [date, setDate] = useState(surveyData?.date || "")

  useEffect(() => {
    if (open && surveyData) {
      setFilledBy(surveyData.filled_by || "")
      setInformant(surveyData.informant || "")
      setCheckedBy(surveyData.checked_by || "")
      setDate(surveyData.date || "")
    }
  }, [open, surveyData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      si_id: surveyData.id,
      filled_by: filledBy,
      informant: informant,
      checked_by: checkedBy,
      date: date,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Survey Identification</DialogTitle>
          <DialogDescription>Update survey completion and verification details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComboboxInput
              value={filledBy}
              options={healthStaffOptions}
              label="Profiled By"
              placeholder="Search health staff..."
              emptyText="No staff found"
              onSelect={(value) => setFilledBy(value)}
            />

            <ComboboxInput
              value={informant}
              options={familyMemberOptions}
              label="Informant"
              placeholder="Search family member..."
              emptyText="No family member found"
              onSelect={(value) => setInformant(value)}
            />

            <ComboboxInput
              value={checkedBy}
              options={healthStaffOptions}
              label="Checked By"
              placeholder="Search health staff..."
              emptyText="No staff found"
              onSelect={(value) => setCheckedBy(value)}
            />

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black/70">Date Completed</label>
              <input
                type="date"
                value={date ? new Date(date).toISOString().split("T")[0] : ""}
                onChange={(e) => setDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
