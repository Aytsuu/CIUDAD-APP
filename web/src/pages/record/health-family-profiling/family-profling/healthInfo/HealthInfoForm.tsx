"use client"

import { useEffect, useMemo } from "react"
import { Form } from "@/components/ui/form/form"
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
  
  // Memoize the noFamilyPlanningSelected check (checking lowercase since FormComboCheckbox stores lowercase)
  const noFamilyPlanningSelected = useMemo(
    () => selectedMethods.includes("nofamplanning"), // lowercase to match FormComboCheckbox behavior
    [selectedMethods]
  )

  useEffect(() => {
    // If "No Family Planning" is selected, clear any other methods and clear the source
    if (noFamilyPlanningSelected) {
      if (selectedMethods.length > 1) {
        form.setValue(`${prefix}.method`, ["nofamplanning"]) // lowercase
      }
      // Clear the source field when no family planning is selected
      form.setValue(`${prefix}.source`, "")
    }
    // If other family planning methods are selected and "No Family Planning" gets added, 
    // remove "No Family Planning" to allow multiple selections
    else if (selectedMethods.length > 1 && selectedMethods.includes("nofamplanning")) {
      const filteredMethods = selectedMethods.filter(method => method !== "nofamplanning")
      form.setValue(`${prefix}.method`, filteredMethods)
    }
  }, [noFamilyPlanningSelected, selectedMethods, form, prefix])

  // Memoize the show condition - only show if methods are selected AND it's not "No Family Planning"
  const showFamilyPlanningSource = useMemo(() => {
    return selectedMethods.length > 0 && !selectedMethods.includes("nofamplanning") // lowercase
  }, [selectedMethods])

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className={showFamilyPlanningSource ? "sm:col-span-2 lg:col-span-1" : "sm:col-span-2 lg:col-span-2"}>
              <FormComboCheckbox
                control={form.control}
                name={`${prefix}.method`}
                label="Family Planning Method"
                placeholder="Select Method"
                maxDisplayValues={5}
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
            </div>
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