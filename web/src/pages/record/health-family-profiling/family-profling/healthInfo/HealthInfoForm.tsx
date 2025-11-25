"use client"

import { useEffect, useMemo } from "react"
import { Form } from "@/components/ui/form/form"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form"
import { z } from "zod"
import { FormComboCheckbox } from "@/components/ui/form/form-combo-checkbox"
import { Combobox } from "@/components/ui/combobox"

export default function HealthInfoForm({
  form,
  prefix,
  title,
  residents,
  selectedResidentId,
  onSelect,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>
  prefix: "motherInfo.motherHealthInfo"
  title: string
  residents?: any[]
  selectedResidentId?: string
  onSelect?: (id: string) => void
}) {
  // Watch the method field with proper type safety
  const selectedMethods = form.watch(`${prefix}.method`) as string[] || []
  
  // Check if "No Family Planning" is selected (values are stored in lowercase by FormComboCheckbox)
  const noFamilyPlanningSelected = useMemo(
    () => selectedMethods.includes("nofamplanning"),
    [selectedMethods]
  )

  // Clear source field when "No Family Planning" is selected
  useEffect(() => {
    if (noFamilyPlanningSelected) {
      form.setValue(`${prefix}.source`, "")
    }
  }, [noFamilyPlanningSelected, form, prefix])

  // Show family planning source field only when methods are selected AND it's not "No Family Planning"
  const showFamilyPlanningSource = useMemo(() => {
    return selectedMethods.length > 0 && !noFamilyPlanningSelected
  }, [selectedMethods, noFamilyPlanningSelected])

  // Debug logging (remove after testing)
  useEffect(() => {
    console.log("Selected Methods:", selectedMethods)
    console.log("No Family Planning Selected:", noFamilyPlanningSelected)
    console.log("Show Family Planning Source:", showFamilyPlanningSource)
  }, [selectedMethods, noFamilyPlanningSelected, showFamilyPlanningSource])

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">Review all fields before proceeding</p>
      </div>

      {residents && (
        <div className="mb-4">
          <Combobox
            options={residents}
            value={selectedResidentId || ""}
            onChange={(val: any) => onSelect && onSelect(String(val))}
            placeholder="Select resident"
            emptyMessage={<div className="text-sm text-muted">No resident found</div>}
          />
        </div>
      )}

      <Form {...form}>
        <form className="grid gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormSelect
              control={form.control}
              name={`${prefix}.healthRiskClass`}
              label="Health Risk Class"
              options={[
                { id: "pregnant", name: "Pregnant" },
                { id: "adolesentPregant", name: "Adolecent Pregnant" },
                { id: "postPartum", name: "Post Partum" },
              ]}
            />
            <FormSelect
              control={form.control}
              name={`${prefix}.immunizationStatus`}
              label="Immunization Status"
              options={[
                { id: "tt1", name: "TT1" },
                { id: "tt2", name: "TT2" },
                { id: "tt3", name: "TT3" },
                { id: "tt4", name: "TT4" },
                { id: "tt5", name: "TT5" },
                { id: "fim", name: "FIM" },
              ]}
            />
            <FormDateTimeInput
              control={form.control}
              name={`${prefix}.lmpDate`}
              label="Last Menstrual Period (LMP)"
              type="date"
              max={new Date().toISOString().split('T')[0]}
            />
            <FormComboCheckbox
              control={form.control}
              name={`${prefix}.method`}
              label="Family Planning Method"
              placeholder="Select Method"
              maxDisplayValues={5}
              exclusiveOptionId="noFamPlanning"
              options={[
                { id: "pills", name: "Pills" },
                { id: "dmpa", name: "DMPA" },
                { id: "condom", name: "Condom" },
                { id: "iud-i", name: "IUD-I" },
                { id: "iud-pp", name: "IUD-PP" },
                { id: "implant", name: "Implant" },
                { id: "cervicalMucus", name: "Cervical Mucus Method" },
                { id: "basalBodyTemp", name: "Basal Body Temp" },
                { id: "vasectomy", name: "Vasectomy" },
                { id: "noFamPlanning", name: "No Family Planning" },
              ]}
            />
           
            {showFamilyPlanningSource && (
              <FormSelect
                control={form.control}
                name={`${prefix}.source`}
                label="Family Planning Source"
                options={[
                  { id: "healthCenter", name: "Health Center" },
                  { id: "hospital", name: "Hospital" },
                  { id: "pharmacy", name: "Pharmacy" },
                  { id: "others", name: "Others" },
                ]}
              />
            )}

            
          </div>
        </form>
      </Form>
    </div>
  )
}