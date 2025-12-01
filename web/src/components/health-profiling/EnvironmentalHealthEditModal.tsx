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
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { Save, X, Loader2 } from "lucide-react"

interface EnvironmentalHealthEditModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  waterSupplyData: any
  sanitaryData: any
  wasteData: any
  waterSupplyOptions: { id: string; name: string; description?: string }[]
  onSave: (data: {
    water: { id: string; type: string; description: string }
    sanitary: {
      id: string
      facility_type: string
      sanitary_facility_type?: string
      unsanitary_facility_type?: string
      toilet_facility_type: string
    }
    waste: { id: string; type: string; description?: string }
  }) => Promise<void>
  isPending: boolean
}

export const EnvironmentalHealthEditModal = ({
  open,
  onOpenChange,
  waterSupplyData,
  sanitaryData,
  wasteData,
  waterSupplyOptions,
  onSave,
  isPending,
}: EnvironmentalHealthEditModalProps) => {
  const form = useForm({
    defaultValues: {
      water_type: waterSupplyData?.type || "",
      water_description: waterSupplyData?.description || "",
      facility_type: sanitaryData?.facility_type || "",
      sanitary_facility_type: sanitaryData?.facility_type === "SANITARY" ? sanitaryData?.description : "",
      unsanitary_facility_type: sanitaryData?.facility_type === "UNSANITARY" ? sanitaryData?.description : "",
      toilet_facility_type: sanitaryData?.toilet_facility_type || "",
      waste_type: wasteData?.type || "",
      waste_description: wasteData?.description || "",
    },
  })

  const facilityType = form.watch("facility_type")
  const waterType = form.watch("water_type")
  const wasteType = form.watch("waste_type")

  // Update water description when type changes
  useEffect(() => {
    if (waterType && waterSupplyOptions.length > 0) {
      // Get the full description from the water supply data
      const selectedOption = waterSupplyOptions.find((opt) => opt.id === waterType)
      if (selectedOption && selectedOption.description) {
        form.setValue("water_description", selectedOption.description)
      }
    }
  }, [waterType, waterSupplyOptions, form])

  // Reset form when data changes
  useEffect(() => {
    if (open) {
      form.reset({
        water_type: waterSupplyData?.type || "",
        water_description: waterSupplyData?.description || "",
        facility_type: sanitaryData?.facility_type || "",
        sanitary_facility_type: sanitaryData?.facility_type === "SANITARY" ? sanitaryData?.description : "",
        unsanitary_facility_type: sanitaryData?.facility_type === "UNSANITARY" ? sanitaryData?.description : "",
        toilet_facility_type: sanitaryData?.toilet_facility_type || "",
        waste_type: wasteData?.type || "",
        waste_description: wasteData?.description || "",
      })
    }
  }, [open, waterSupplyData, sanitaryData, wasteData, form])

  const handleSubmit = async (values: any) => {
    await onSave({
      water: {
        id: waterSupplyData.id,
        type: values.water_type,
        description: values.water_description,
      },
      sanitary: {
        id: sanitaryData.id,
        facility_type: values.facility_type,
        sanitary_facility_type: values.sanitary_facility_type,
        unsanitary_facility_type: values.unsanitary_facility_type,
        toilet_facility_type: values.toilet_facility_type,
      },
      waste: {
        id: wasteData.id,
        type: values.waste_type,
        description: values.waste_description,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Environmental Health & Sanitation</DialogTitle>
          <DialogDescription>Update water supply, sanitation facilities, and waste management information</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Water Supply Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-blue-50/30">
              <h3 className="font-semibold text-blue-900 flex items-center gap-2">Water Supply</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="water_type"
                  label="Water Supply Type"
                  options={waterSupplyOptions}
                  placeholder="Select water supply type"
                />
                <FormInput control={form.control} name="water_description" label="Description" readOnly />
              </div>
            </div>

            {/* Sanitary Facility Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-green-50/30">
              <h3 className="font-semibold text-green-900 flex items-center gap-2">Sanitary Facility</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="facility_type"
                  label="Facility Type"
                  options={[
                    { id: "SANITARY", name: "Sanitary" },
                    { id: "UNSANITARY", name: "Unsanitary" },
                  ]}
                  placeholder="Select facility type"
                />

                {facilityType === "SANITARY" && (
                  <FormSelect
                    control={form.control}
                    name="sanitary_facility_type"
                    label="Sanitary Facility Subtype"
                    options={[
                      { id: "Pour/flush type with septic tank", name: "Pour/flush type with septic tank" },
                      {
                        id: "Pour/flush toilet connected to septic tank AND to sewerage system",
                        name: "Pour/flush toilet connected to septic tank AND to sewerage system",
                      },
                      { id: "Ventilated Pit (VIP) Latrine", name: "Ventilated Pit (VIP) Latrine" },
                    ]}
                    placeholder="Select sanitary type"
                  />
                )}

                {facilityType === "UNSANITARY" && (
                  <FormSelect
                    control={form.control}
                    name="unsanitary_facility_type"
                    label="Unsanitary Facility Subtype"
                    options={[
                      {
                        id: "Water-sealed toilet without septic tank",
                        name: "Water-sealed toilet without septic tank",
                      },
                      { id: "Overhung latrine", name: "Overhung latrine" },
                      { id: "Open Pit Latrine", name: "Open Pit Latrine" },
                      { id: "Without toilet", name: "Without toilet" },
                    ]}
                    placeholder="Select unsanitary type"
                  />
                )}

                <FormSelect
                  control={form.control}
                  name="toilet_facility_type"
                  label="Toilet Facility Type"
                  options={[
                    { id: "SHARED", name: "SHARED with Other Household" },
                    { id: "NOT SHARED", name: "NOT SHARED with Other Household" },
                  ]}
                  placeholder="Select toilet facility type"
                />
              </div>
            </div>

            {/* Waste Management Section */}
            <div className="space-y-4 p-4 border rounded-lg bg-orange-50/30">
              <h3 className="font-semibold text-orange-900 flex items-center gap-2">Waste Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  control={form.control}
                  name="waste_type"
                  label="Waste Management Type"
                  options={[
                    { id: "WASTE SEGREGATION", name: "Waste Segregation" },
                    { id: "BACKYARD COMPOSTING", name: "Backyard Composting" },
                    { id: "RECYCLING", name: "Recycling/Reuse" },
                    { id: "COLLECTED BY CITY", name: "Collected by City Collection and Disposal System" },
                    { id: "BURNING/BURYING", name: "Burning/Burying" },
                    { id: "OTHERS", name: "Others" },
                  ]}
                  placeholder="Select waste management type"
                />

                {wasteType === "OTHERS" && (
                  <FormTextarea
                    control={form.control}
                    name="waste_description"
                    label="Specify Other Waste Management"
                    placeholder="Enter waste management description"
                    rows={3}
                  />
                )}
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
        </Form>
      </DialogContent>
    </Dialog>
  )
}
