import { useEffect } from "react"
import { useForm } from "react-hook-form"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog/dialog"
import { Button } from "@/components/ui/button/button"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Save, X, Loader2 } from "lucide-react"

interface TBEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tbData: any
  onSave: (data: {
    tb_id: string
    src_anti_tb_meds: string
    no_of_days_taking_meds: string
    tb_status: string
  }) => Promise<void>
  isPending: boolean
}

export const TBEditModal = ({ open, onOpenChange, tbData, onSave, isPending }: TBEditModalProps) => {
  const form = useForm({
    defaultValues: {
      src_anti_tb_meds: tbData?.src_anti_tb_meds || "",
      no_of_days_taking_meds: tbData?.no_of_days_taking_meds || "",
      tb_status: tbData?.tb_status || "",
    },
  })

  useEffect(() => {
    if (open && tbData) {
      form.reset({
        src_anti_tb_meds: tbData.src_anti_tb_meds || "",
        no_of_days_taking_meds: tbData.no_of_days_taking_meds || "",
        tb_status: tbData.tb_status || "",
      })
    }
  }, [open, tbData, form])

  const handleSubmit = async (values: any) => {
    await onSave({
      tb_id: tbData.tb_id,
      ...values,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit TB Surveillance Record</DialogTitle>
          <DialogDescription>Update tuberculosis surveillance information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="src_anti_tb_meds"
                label="Source of Anti-TB Medications"
                options={[
                  { id: "HEALTH CENTER", name: "Health Center" },
                  { id: "PUBLIC HOSPITAL", name: "Public Hospital" },
                  { id: "PRIVATE HOSPITAL", name: "Private Hospital" },
                  { id: "PRIVATE CLINIC", name: "Private Clinic" },
                  { id: "OTHERS", name: "Others" },
                ]}
                placeholder="Select source"
              />

              <FormInput
                control={form.control}
                name="no_of_days_taking_meds"
                label="Number of Days Taking Medications"
                type="number"
                placeholder="Enter number of days"
                min={0}
              />

              <FormSelect
                control={form.control}
                name="tb_status"
                label="TB Status"
                options={[
                  { id: "TREATMENT ONGOING", name: "Treatment Ongoing" },
                  { id: "COMPLETED", name: "Completed" },
                  { id: "NOT COMPLETED", name: "Not Completed" },
                ]}
                placeholder="Select TB status"
              />
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
