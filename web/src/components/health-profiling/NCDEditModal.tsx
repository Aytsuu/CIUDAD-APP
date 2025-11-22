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
import { FormSelect } from "@/components/ui/form/form-select"
import { Save, X, Loader2 } from "lucide-react"

interface NCDEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ncdData: any
  illnessOptions: { id: string; name: string }[]
  onSave: (data: {
    ncd_id: string
    risk_class_age_group: string
    comorbidities: string
    lifestyle_risk: string
    in_maintenance: string
  }) => Promise<void>
  isPending: boolean
}

export const NCDEditModal = ({
  open,
  onOpenChange,
  ncdData,
  illnessOptions,
  onSave,
  isPending,
}: NCDEditModalProps) => {
  const form = useForm({
    defaultValues: {
      risk_class_age_group: ncdData?.risk_class_age_group || "",
      comorbidities: ncdData?.comorbidities || "",
      lifestyle_risk: ncdData?.lifestyle_risk || "",
      in_maintenance: ncdData?.in_maintenance || "",
    },
  })

  useEffect(() => {
    if (open && ncdData) {
      form.reset({
        risk_class_age_group: ncdData.risk_class_age_group || "",
        comorbidities: ncdData.comorbidities || "",
        lifestyle_risk: ncdData.lifestyle_risk || "",
        in_maintenance: ncdData.in_maintenance || "",
      })
    }
  }, [open, ncdData, form])

  const handleSubmit = async (values: any) => {
    await onSave({
      ncd_id: ncdData.ncd_id,
      ...values,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit NCD Record</DialogTitle>
          <DialogDescription>Update non-communicable disease information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                control={form.control}
                name="risk_class_age_group"
                label="Risk Class (Age Group)"
                options={[
                  { id: "NEWBORN", name: "Newborn (0-28 days)" },
                  { id: "INFANT", name: "Infant (20 days - 11 months)" },
                  { id: "UNDER FIVE", name: "Under five (1-4 years old)" },
                  { id: "SCHOOLAGED", name: "School-aged (5-9 years old)" },
                  { id: "ADOLESCENT", name: "Adolescent (10-19 years old)" },
                  { id: "ADULT", name: "Adult (20-59 years old)" },
                  { id: "SENIOR CITIZEN", name: "Senior Citizen (60+ years old)" },
                ]}
                placeholder="Select age group"
              />

              <FormSelect
                control={form.control}
                name="comorbidities"
                label="Comorbidities"
                options={illnessOptions}
                placeholder="Select comorbidity"
              />

              <FormSelect
                control={form.control}
                name="lifestyle_risk"
                label="Lifestyle Risk"
                options={[
                  { id: "SMOKER", name: "Smoker" },
                  { id: "ALCOHOLIC", name: "Alcoholic Beverage Drinking" },
                  { id: "NONE", name: "None" },
                  { id: "OTHERS", name: "Others" },
                ]}
                placeholder="Select lifestyle risk"
              />

              <FormSelect
                control={form.control}
                name="in_maintenance"
                label="In Maintenance"
                options={[
                  { id: "YES", name: "Yes" },
                  { id: "NO", name: "No" },
                ]}
                placeholder="Select maintenance status"
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
