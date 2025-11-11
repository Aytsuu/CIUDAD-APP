"use client"

// react and others
import type { UseFormReturn } from "react-hook-form"
import { useState, useEffect } from "react"
import { CircleAlert } from "lucide-react"
import type { z } from "zod"

// components
import { Form } from "@/components/ui/form/form" 
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { showErrorToast } from "@/components/ui/toast"

// maternal components
import LaboratoryResults, {
  createInitialLabResults,
  getLabResultsSummary,
  validateLabResults,
  convertLabResultsToSchema,
  type LabResults,
} from "@/pages/healthServices/maternal/maternal-components/lab-result"

// schema
import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

// hooks
import { fetchVaccinesWithStock } from "../../../vaccination/queries/fetch"
import { usePrenatalLabResult } from "../../queries/maternalFetchQueries"

// helpers
import { mapApiLabResultsToFormData } from "../../helpers/labResultsMapper"


export default function PrenatalFormSecPg({
  form,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
}) {
  
  //tt type
  type TetanusToxoidType = {
    vaccineType?: string
    ttStatus?: string
    ttDateGiven?: string
  }

  // Lab results state
  const [labResults, setLabResults] = useState<LabResults>(createInitialLabResults())
  const [labErrors, setLabErrors] = useState<Record<string, string>>({})
  const [ttRecords, setTTRecords] = useState<TetanusToxoidType[]>([])

  // Fetch vaccine stocks with age filtering based on patient DOB
  const patientDob = form.watch("motherPersonalInfo.motherDOB")
  const pregnancyId = form.watch("pregnancy_id")

  const { data: vaccineStocksData, isLoading: isVaccineLoading } = fetchVaccinesWithStock(patientDob)
  const { data: prenatalLabResults } = usePrenatalLabResult(pregnancyId || "")

  // Check if selected vaccine is conditional
  const selectedVaccineType = form.watch("prenatalVaccineInfo.vaccineType")
  const isConditionalVaccine = selectedVaccineType && vaccineStocksData?.default?.find((stock: any) => {
    const stockId = `${stock.vacStck_id},${stock.vac_id},${stock.vaccinelist?.vac_name || "Unknown Vaccine"},${stock.inv_details?.expiry_date || "No Expiry"}`
    return stockId === selectedVaccineType && stock.is_conditional === true
  })

  // tt status badge
  const getTTStatusBadge = (status?: string) => {
    switch (status) {
      case "TT1":
        return {
          variant: "secondary" as const,
          className: "text-lg bg-blue-100 text-blue-800 hover:bg-blue-100"
        }
      case "TT2":
        return {
          variant: "secondary" as const,
          className: "text-lg bg-green-100 text-green-800 hover:bg-green-100"
        }
      case "TT3":
        return {
          variant: "secondary" as const,
          className: "text-lg bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
        }
      case "TT4":
        return {
          variant: "secondary" as const,
          className: "text-lg bg-orange-100 text-orange-800 hover:bg-orange-100"
        }
      case "TT5":
        return {
          variant: "secondary" as const,
          className: "text-lg bg-purple-100 text-purple-800 hover:bg-purple-100"
        }
      default:
        return {
          variant: "outline" as const,
          className: "text-lg bg-gray-100 text-gray-600 hover:bg-gray-100"
        }
    }
  }

  // handle next button click
  const handleNext = async () => {
    // validate lab results first
    const labValidation = validateLabResults(labResults)
    console.log("Lab validation result:", labValidation.isValid, "Errors:", labValidation.errors)

    if (!labValidation.isValid) {
      console.log("Lab validation failed, preventing page transition.")
      setLabErrors(labValidation.errors)
      // scroll to lab results section
      const labSection = document.querySelector('[data-section="laboratory-results"]')
      if (labSection) {
        labSection.scrollIntoView({ behavior: "smooth" })
      }
      return 
    }

    // get lab summary for logging/processing
    const labSummary = getLabResultsSummary(labResults)

    // other form validation on this page
    const isValid = await form.trigger(["previousPregnancy", "prenatalVaccineInfo", "presentPregnancy"])
    console.log("Page 2 RHF validation result:", isValid, "Errors:", form.formState.errors)

    if (isValid) {
      console.log("Form is valid, proceeding to next page")
      console.log("Lab Results: ", labSummary)
      onSubmit()
    } else {
      console.log("Form validation failed for RHF fields.")
      // scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  // Handle vaccine selection change
  const handleVaccineChange = (value: string) => {
    form.setValue("prenatalVaccineInfo.vaccineType", value)
    
    // Clear total dose when vaccine changes
    form.setValue("prenatalVaccineInfo.vacrec_totaldose", undefined)
    
    console.log("Selected vaccine:", value)
  }  

  // tetanus toxoid history
  const addTTRecord = () => {
    const ttstatus = form.getValues("prenatalVaccineInfo.ttStatus")
    const ttDateGiven = form.getValues("prenatalVaccineInfo.ttDateGiven")
    const vaccineType = form.getValues("prenatalVaccineInfo.vaccineType")

    if (!ttstatus) {
      showErrorToast("Error! No TT Status selected.")
      return
    }

    // if (!vaccineType) {
    //   showErrorToast("Error! Please select a vaccine type.")
    //   return
    // }

    const newTTData: TetanusToxoidType = {
      vaccineType: vaccineType,
      ttStatus: ttstatus,
      ttDateGiven: ttDateGiven || "",
    }

    setTTRecords((prev) => {
      const upd = [...prev, newTTData]
      console.log("Updated TT Records:", upd)
      form.setValue("prenatalVaccineInfo.ttRecordsHistory", upd)
      return upd
    })

    // Clear form fields after adding
    form.setValue("prenatalVaccineInfo.vaccineType", "")
    form.setValue("prenatalVaccineInfo.ttStatus", "")
    form.setValue("prenatalVaccineInfo.ttDateGiven", "")
  }

  // tt status fetching
  useEffect(() => {
    const existingTTRecords = form.getValues("prenatalVaccineInfo.ttRecordsHistory") || []
    
    if (existingTTRecords.length > 0 && ttRecords.length === 0) {
      console.log("Loading existing TT records from API:", existingTTRecords)
      setTTRecords(existingTTRecords)
    }
  }, [ttRecords.length, form])

  // automatic edc calculation based on lmp
  useEffect(() => {
    const lmp = form.getValues("presentPregnancy.pf_lmp");
    if (lmp) {
      const edc = new Date(lmp);
      edc.setFullYear(edc.getFullYear() + 1);
      edc.setMonth(edc.getMonth() - 3);
      edc.setDate(edc.getDate() + 7);
      form.setValue("presentPregnancy.pf_edc", edc.toISOString().split("T")[0]);
    }

  }, [form.watch("presentPregnancy.pf_lmp")])

  // Load lab results from API when pregnancy ID changes
  useEffect(() => {
    if (prenatalLabResults?.lab_results && prenatalLabResults.lab_results.length > 0) {
      console.log("Loading lab results from API:", prenatalLabResults)
      const mappedLabResults = mapApiLabResultsToFormData(prenatalLabResults)
      setLabResults(mappedLabResults)
    }
  }, [prenatalLabResults?.lab_results])

  useEffect(() => {
    // convert lab results to the format expected by your form schema
    const convertAndSetLabResults = async () => {
      const convertedLabResults = await convertLabResultsToSchema(labResults)
      form.setValue("labResults.labResultsData", convertedLabResults)

      // validate lab results and set errors
      const validation = validateLabResults(labResults)
      setLabErrors(validation.errors)

      if (!validation.isValid) {
        form.setError("labResults", {
          type: "manual",
          message: "Please complete all required lab result fields",
        })
      } else {
        form.clearErrors("labResults")
      }
    }
    
    convertAndSetLabResults()
  }, [labResults, form])


  return (
    <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
      <Label className="text-black text-opacity-50 italic mb-10">Page 2 of 4</Label>
      <Form {...form}>
        <form>
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
                  { id: "Fullterm", name: "FULLTERM" },
                  { id: "Preterm", name: "PRETERM" },
                ]}
              />
              <FormSelect
                control={form.control}
                name="previousPregnancy.typeOfDelivery"
                label="TYPE OF DELIVERY"
                options={[
                  { id: "Vaginal", name: "Vaginal Delivery" },
                  { id: "Cesarean Section", name: "C-Section" },
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
                  { id: "Female", name: "Female" },
                  { id: "Male", name: "Male" },
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
              <p className="flex items-center text-black/60 text-[14px] ml-2">
                <CircleAlert size={15} className="mr-1" />
                Note: This is strictly for Tetanus Toxoid or Tetanus Diptheria vaccination only. Other vaccines should be recorded in Vaccination Service.
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
                      options={vaccineStocksData?.formatted || []}
                      value={form.watch("prenatalVaccineInfo.vaccineType") || ""}
                      placeholder={isVaccineLoading ? "Loading vaccines..." : "Select a vaccine (TT/TD)"}
                      triggerClassName="font-normal w-full"
                      emptyMessage={
                        <div className="flex gap-2 justify-center items-center">
                          <Label className="font-normal text-[13px]">
                            {isVaccineLoading ? "Loading..." : "No available vaccines in stock."}
                          </Label>
                        </div>
                      }
                      onChange={(value) => handleVaccineChange(value ?? "")}
                    />
                  </div>
                </div>

                {/* Only shown for conditional vaccines */}
                {isConditionalVaccine && (
                  <div className="mb-3">
                    <FormInput
                      control={form.control}
                      name="prenatalVaccineInfo.vacrec_totaldose"
                      label="Total dose"
                      type="number"
                      placeholder="Enter total number of doses"
                    />
                    <Label className="text-xs text-black/50 italic mt-1">
                      This vaccine requires manual input of total dose count
                    </Label>
                  </div>
                )}

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

                <div className="flex justify-end mt-2 mb-5">
                  <Button type="button" onClick={addTTRecord}>
                    Add
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold"> TT Records History</h3>
              </div>
              <Card className="border rounded-lg bg-gray-50">
                <CardContent>
                  <div className="space-y-2 mt-5 max-h-[20rem] overflow-y-auto">
                    {ttRecords.length === 0 ? (
                      <div className="flex justify-center items-center p-5">
                        <span className="text-sm text-gray-500">No TT records found</span>
                      </div>
                    ) : (
                      ttRecords
                        .sort((a, b) => {
                          // Sort by TT status: TT5, TT4, TT3, TT2, TT1
                          const ttOrder: Record<string, number> = {
                            "TT5": 5,
                            "TT4": 4,
                            "TT3": 3,
                            "TT2": 2,
                            "TT1": 1,
                          }
                          const statusA = ttOrder[a.ttStatus || ""] || 0
                          const statusB = ttOrder[b.ttStatus || ""] || 0
                          return statusB - statusA
                        })
                        .map((record, index) => {
                          const statusBadge = getTTStatusBadge(record.ttStatus)

                          return (
                            <div key={`tt-record-${index}`}
                              className="flex justify-between items-center text-sm p-2 rounded-md border border-black/20"
                            >
                              <div className="flex flex-col">
                                <span className="text-lg font-medium">
                                  {record.ttDateGiven 
                                    ? new Date(record.ttDateGiven).toLocaleDateString("en-PH", {
                                        year: "numeric",
                                        month: "short", 
                                        day: "numeric"
                                      })
                                    : "Date not set"
                                  }
                                </span>
                                {record.vaccineType && (
                                  <span className="text-xs text-gray-500">
                                    Vaccine: {(() => {
                                      // Format: vaccineStockId,vaccineId,vaccineName,expiryDate
                                      // Vaccine name can contain commas, so we need to extract carefully
                                      const parts = record.vaccineType.split(',')
                                      if (parts.length > 3) {
                                        // Remove first 2 parts (stock ID and vaccine ID) and last part (expiry date)
                                        // Join the remaining parts which form the vaccine name
                                        return parts.slice(2, -1).join(',')
                                      }
                                      return record.vaccineType
                                    })()}
                                  </span>
                                )}
                              </div>
                              <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                {record.ttStatus}
                              </Badge>
                            </div>
                          )
                        })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* present pregnancy */}
          <div className="border rounded-lg p-4 shadow-md mb-10">
            <h3 className="text-md font-semibold mt-2">PRESENT PREGNANCY</h3>
            <div className="grid grid-cols-6 gap-4 mt-2 px-4">
              <FormInput control={form.control} name="presentPregnancy.gravida" label="GRAVIDA" placeholder="" type="number"/>
              <FormInput control={form.control} name="presentPregnancy.para" label="PARA" placeholder="" type="number"/>
              <FormInput control={form.control} name="presentPregnancy.fullterm" label="FULLTERM" placeholder="" type="number"/>
              <FormInput control={form.control} name="presentPregnancy.preterm" label="PRETERM" placeholder="" type="number"/>
              <FormDateTimeInput control={form.control} name="presentPregnancy.pf_lmp" label="LMP" type="date" />
              <FormDateTimeInput control={form.control} name="presentPregnancy.pf_edc" label="EDC" type="date" />
            </div>
          </div>

          {/* Laboratory Results Section */}
          <div data-section="laboratory-results" className="border rounded-lg p-4 shadow-md">
            <LaboratoryResults labResults={labResults} onLabResultsChange={setLabResults} errors={labErrors} />
          </div>

          <div className="mt-8 sm:mt-12 flex justify-end">
            <Button type="button" variant="outline" className="mt-4 mr-4 w-[120px] bg-transparent" onClick={back}>
              Prev
            </Button>
            <Button type="button" className="mt-4 mr-4 w-[120px]" onClick={handleNext}>
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
