"use client"

import type React from "react"

import type { UseFormReturn } from "react-hook-form"
import { useState, useEffect } from "react"
import { CircleAlert } from "lucide-react"
import type { z } from "zod"

import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form" // Corrected import path
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import LaboratoryResults, {
  createInitialLabResults,
  getLabResultsSummary,
  validateLabResults,
  convertLabResultsToSchema,
  type LabResults,
} from "@/pages/healthServices/maternal/maternal-components/lab-result"
import { Combobox } from "@/components/ui/combobox"

import { fetchVaccinesWithStock } from "../../vaccination/restful-api/fetch"

export default function PrenatalFormSecPg({
  form,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
}) {
  // Lab results state
  const [labResults, setLabResults] = useState<LabResults>(createInitialLabResults())
  const [labErrors, setLabErrors] = useState<Record<string, string>>({})
  const { vaccineStocksOptions, isLoading } = fetchVaccinesWithStock()

  useEffect(() => {
    // Convert lab results to the format expected by your form schema
    const convertedLabResults = convertLabResultsToSchema(labResults)

    // Set the lab results in the form
    form.setValue("labResults.labResultsData", convertedLabResults)

    // Validate lab results and set errors
    const validation = validateLabResults(labResults)
    setLabErrors(validation.errors)

    // Optional: Set form error if validation fails
    if (!validation.isValid) {
      form.setError("labResults", {
        type: "manual",
        message: "Please complete all required lab result fields",
      })
    } else {
      form.clearErrors("labResults")
    }
  }, [labResults, form])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault() 

    window.scrollTo(0, 0) 

    // Validate lab results first
    const labValidation = validateLabResults(labResults)
    console.log("Lab validation result:", labValidation.isValid, "Errors:", labValidation.errors)

    if (!labValidation.isValid) {
      console.log("Lab validation failed, preventing page transition.")
      setLabErrors(labValidation.errors)
      // Scroll to lab results section
      const labSection = document.querySelector('[data-section="laboratory-results"]')
      if (labSection) {
        labSection.scrollIntoView({ behavior: "smooth" })
      }
      return // Stop submission if lab results are invalid
    }

    // Get lab summary for logging/processing
    const labSummary = getLabResultsSummary(labResults)
    console.log("Laboratory Results Summary: ", labSummary)

    // Trigger form validation for other fields on this page
    const isValid = await form.trigger(["previousPregnancy", "prenatalVaccineInfo", "presentPregnancy"]) // Removed "labResults" from here as it's handled above
    console.log("Page 2 RHF validation result:", isValid, "Errors:", form.formState.errors)

    if (isValid) {
      console.log("Form is valid, proceeding to next page")
      console.log("Lab Results: ", labSummary)
      onSubmit()
    } else {
      console.log("Form validation failed for RHF fields.")
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth" })
      }
    }

    window.scrollTo(0, 0)
  }

  const handleVaccineChange = (value: string) => {
    form.setValue("prenatalVaccineInfo.vaccineType", value)
  }
  //tt type
  type TetanusToxoidType = {
    vaccineType?: string
    ttStatus?: string
    ttDateGiven?: string
  }

  // tetanus toxoid history
  const [ttRecords, setTTRecords] = useState<TetanusToxoidType[]>([])
  const addTTRecord = () => {
    const ttstatus = form.getValues("prenatalVaccineInfo.ttStatus")

    const newTTData: TetanusToxoidType = {
      vaccineType: form.getValues("prenatalVaccineInfo.vaccineType"),
      ttStatus: ttstatus,
      ttDateGiven: form.getValues("prenatalVaccineInfo.ttDateGiven"),
    }

    setTTRecords((prev) => {
      const upd = [...prev, newTTData]
      console.log("Updated TT Records:", upd)
      return upd
    })

    form.setValue("prenatalVaccineInfo.ttStatus", "")
    form.setValue("prenatalVaccineInfo.ttDateGiven", "")
  }

  // Helper function to get lab results for form submission
  // const getLabResultsForSubmission = () => {
  //   return {
  //     labResults: convertLabResultsToSchema(labResults),
  //     labSummary: getLabResultsSummary(labResults),
  //     // labRemarks: form.getValues("laboratoryRemarks") || ""
  //   }
  // }

  return (
    <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
      <Label className="text-black text-opacity-50 italic mb-10">Page 2 of 4</Label>
      <Form {...form}>
        <form onSubmit={submit}>
          <div className="border rounded-lg p-4 shadow-md mb-10">
            <h3 className="text-md font-semibold mt-2">PREVIOUS PREGNANCY</h3>
            <div className="grid grid-cols-4 gap-4 mt-5 px-5">
              <FormDateTimeInput
                control={form.control}
                name="previousPregnancy.dateOfDelivery"
                label="DATE OF DELIVERY"
                type="date"
              />
              <FormSelect
                control={form.control}
                name="previousPregnancy.outcome"
                label="OUTCOME"
                options={[
                  { id: "0", name: "FULLTERM" },
                  { id: "1", name: "PRETERM" },
                ]}
              />
              <FormSelect
                control={form.control}
                name="previousPregnancy.typeOfDelivery"
                label="TYPE OF DELIVERY"
                options={[
                  { id: "0", name: "Vaginal Delivery" },
                  { id: "1", name: "C-Section" },
                ]}
              />
              <FormInput
                control={form.control}
                name="previousPregnancy.babysWt"
                label="BABY'S WT"
                placeholder="Baby's wt in lbs"
              />
              <FormSelect
                control={form.control}
                name="previousPregnancy.gender"
                label="GENDER"
                options={[
                  { id: "0", name: "Female" },
                  { id: "1", name: "Male" },
                ]}
              />
              <FormInput
                control={form.control}
                name="previousPregnancy.ballardScore"
                label="BALLARD SCORE"
                placeholder=""
              />
              <FormInput
                control={form.control}
                name="previousPregnancy.apgarScore"
                label="APGAR SCORE"
                placeholder=""
              />
            </div>
          </div>

          {/* tetanus toxoid status */}
          <div className="border rounded-lg p-4 shadow-md mb-10">
            <h3 className="text-md font-semibold mt-2">
              {" "}
              TETANUS TOXOID GIVEN: (DATE GIVEN){" "}
              <p className="flex items-center text-black/50 text-[14px] ml-2">
                <CircleAlert size={15} className="mr-1" />
                Note: Choose vaccine type only if administered by midwife. If not, do not select any vaccine type and
                proceed to TT Status.
              </p>
            </h3>
            <div className="grid gap-3 px-5">
              <div className="flex flex-col">
                <div className="grid mt-5 mb-5">
                  <div className="">
                    <div className="mb-2">
                      <Label className="flex text-black/70 items-center">Vaccine Type</Label>
                    </div>

                    <Combobox
                      options={vaccineStocksOptions.map((vaccine) => ({
                        id: vaccine.id,
                        name: `${vaccine.name} (Expiry: ${vaccine.expiry || "N/A"})`,
                      }))}
                      value={form.watch("prenatalVaccineInfo.vaccineType") || ""}
                      placeholder={isLoading ? "Loading vaccines..." : "Select a vaccine"}
                      triggerClassName="font-normal w-full"
                      emptyMessage={
                        <div className="flex gap-2 justify-center items-center">
                          <Label className="font-normal text-[13px]">
                            {isLoading ? "Loading..." : "No available vaccines in stock."}
                          </Label>
                        </div>
                      }
                      onChange={handleVaccineChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2 mb-5">
                  <FormSelect
                    control={form.control}
                    name="prenatalVaccineInfo.ttStatus"
                    label="TT Status"
                    options={[
                      { id: "TT1", name: "TT1" },
                      { id: "TT2", name: "TT2" },
                      { id: "TT3", name: "TT3" },
                      { id: "TT4", name: "TT4" },
                      { id: "TT5", name: "TT5" },
                    ]}
                  />
                  <FormDateTimeInput
                    control={form.control}
                    name="prenatalVaccineInfo.ttDateGiven"
                    label="Date Given"
                    type="date"
                  />
                </div>
                <div className="mt-4">
                  <FormField
                    control={form.control}
                    name="prenatalVaccineInfo.isTDAPAdministered"
                    render={({ field }) => (
                      <FormItem className="flex">
                        <FormControl>
                          <Checkbox checked={!!field.value} onCheckedChange={field.onChange} className="mr-2 mt-2" />
                        </FormControl>
                        <FormLabel>TDAP (Tetanus, Diptheria, and Petussis)</FormLabel>
                        <Label className="text-black text-opacity-50 italic ml-2">
                          Administer in 7 months or 1 month before giving birth
                        </Label>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="mt-8 mb-3" />

                <div className="flex justify-end mt-2 mb-5">
                  <Button type="button" onClick={addTTRecord}>
                    Add
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg p-5">
                <div>
                  <h3 className="text-sm font-semibold pl-3 pb-3"> TT STATUS HISTORY</h3>
                </div>
                <div className="flex flex-col pl-3 pr-3 ">
                  <div className="grid grid-cols-6 gap-2">
                    {/* TT1 */}
                    <div
                      className="border h-[80px] rounded-md text-center flex flex-col justify-center items-center"
                      id="tt1-div"
                    >
                      <h3 className="font-bold">TT1</h3>
                      <p className="text-[10px]">(FIRST VISIT)</p>
                      {ttRecords
                        .filter((record) => record.ttStatus === "TT1")
                        .map((record, idx) => (
                          <div key={`tt1-${idx}`} className="text-sm font-bold">
                            {record.ttDateGiven ? new Date(record.ttDateGiven).toLocaleDateString() : "N/A"}
                          </div>
                        ))}
                    </div>
                    <div
                      className="border h-[80px] rounded-md text-center flex flex-col justify-center items-center"
                      id="tt2-div"
                    >
                      <h3 className="font-bold">TT2</h3>
                      <p className="text-[10px] mb-2">(ONE MO. AFTER THE FIRST DOSE)</p>
                      {ttRecords
                        .filter((record) => record.ttStatus === "TT2")
                        .map((record, idx) => (
                          <div key={`tt2-${idx}`} className="text-sm font-bold">
                            {record.ttDateGiven ? new Date(record.ttDateGiven).toLocaleDateString() : "N/A"}
                          </div>
                        ))}
                    </div>
                    <div
                      className="border h-[80px] rounded-md text-center flex flex-col justify-center items-center"
                      id="tt3-div"
                    >
                      <h3 className="font-bold">TT3</h3>
                      <p className="text-[10px] mb-2">(6 MONTHS AFTER THE SECOND DOSE)</p>
                      {ttRecords
                        .filter((record) => record.ttStatus === "TT3")
                        .map((record, idx) => (
                          <div key={`tt3-${idx}`} className="text-sm font-bold">
                            {record.ttDateGiven ? new Date(record.ttDateGiven).toLocaleDateString() : "N/A"}
                          </div>
                        ))}
                    </div>
                    <div
                      className="border h-[80px] rounded-md text-center flex flex-col justify-center items-center"
                      id="tt4-div"
                    >
                      <h3 className="font-bold">TT4</h3>
                      <p className="text-[10px] mb-2">(1 YEAR AFTER THE THIRD DOSE)</p>
                      {ttRecords
                        .filter((record) => record.ttStatus === "TT4")
                        .map((record, idx) => (
                          <div key={`tt4-${idx}`} className="text-sm font-bold">
                            {record.ttDateGiven ? new Date(record.ttDateGiven).toLocaleDateString() : "N/A"}
                          </div>
                        ))}
                    </div>
                    <div
                      className="border h-[80px] rounded-md text-center flex flex-col justify-center items-center"
                      id="tt5-div"
                    >
                      <h3 className="font-bold">TT5</h3>
                      <p className="text-[10px] mb-2">(1 YEAR AFTER THE FOURTH DOSE)</p>
                      {ttRecords
                        .filter((record) => record.ttStatus === "TT5")
                        .map((record, idx) => (
                          <div key={`tt5-${idx}`} className="text-sm font-bold">
                            {record.ttDateGiven ? new Date(record.ttDateGiven).toLocaleDateString() : "N/A"}
                          </div>
                        ))}
                    </div>
                    <div className="border h-[80px] rounded-md text-center" id="fim-div">
                      <h3 className="font-bold">FIM</h3>
                      <Label className="fimInput mb-2"></Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* present pregnancy */}
          <div className="border rounded-lg p-4 shadow-md mb-10">
            <h3 className="text-md font-semibold mt-2">PRESENT PREGNANCY</h3>
            <div className="grid grid-cols-6 gap-4 mt-2 px-4">
              <FormInput control={form.control} name="presentPregnancy.gravida" label="GRAVIDA" placeholder="" />
              <FormInput control={form.control} name="presentPregnancy.para" label="PARA" placeholder="" />
              <FormInput control={form.control} name="presentPregnancy.fullterm" label="FULLTERM" placeholder="" />
              <FormInput control={form.control} name="presentPregnancy.preterm" label="PRETERM" placeholder="" />
              <FormDateTimeInput control={form.control} name="presentPregnancy.pf_lmp" label="LMP" type="date" />
              <FormDateTimeInput control={form.control} name="presentPregnancy.pf_edc" label="EDC" type="date" />
            </div>
          </div>

          {/* Laboratory Results Section */}
          <div data-section="laboratory-results" className="border rounded-lg p-4 shadow-md">
            <LaboratoryResults labResults={labResults} onLabResultsChange={setLabResults} errors={labErrors} />
          </div>

          <div className="mt-8 sm:mt-12 flex justify-end">
            <Button variant="outline" className="mt-4 mr-4 w-[120px] bg-transparent" onClick={back}>
              Prev
            </Button>
            <Button type="submit" className="mt-4 mr-4 w-[120px]">
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
