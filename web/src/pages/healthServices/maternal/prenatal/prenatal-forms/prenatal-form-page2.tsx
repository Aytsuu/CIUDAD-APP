"use client"

import type { UseFormReturn } from "react-hook-form"
import { useState, useEffect } from "react"
import { CircleAlert } from "lucide-react"
import type { z } from "zod"

import { Form } from "@/components/ui/form/form" 
// import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form/form" 
// import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
// import { Separator } from "@/components/ui/separator"
// import { Checkbox } from "@/components/ui/checkbox"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import LaboratoryResults, {
  createInitialLabResults,
  getLabResultsSummary,
  validateLabResults,
  convertLabResultsToSchema,
  type LabResults,
} from "@/pages/healthServices/maternal/maternal-components/lab-result"
import { showErrorToast } from "@/components/ui/toast"

import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

// import { fetchVaccinesWithStock } from "../../../vaccination/restful-api/fetch"


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
  const [ttRecords, setTTRecords] = useState<TetanusToxoidType[]>([])

  // const { vaccineStocksOptions, isLoading } = fetchVaccinesWithStock()


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

  useEffect(() => {
    const labResultsLatest = form.getValues("labResults.labResultsData") || [];
    
    if (Array.isArray(labResultsLatest) && labResultsLatest.length > 0 && 
      (!labResults || Array.isArray(labResults) && labResults.length === 0)) 
    {
      const mappedResults = createInitialLabResults();
      labResultsLatest.forEach((item: any) => {
        const labType = (item.lab_type || "").toLowerCase();
        const keyMap: Record<string, string> = {
          urinalysis: "urinalysis",
          cbc: "cbc",
          sgot_sgpt: "sgotSgpt",
          creatinine_serum: "creatinineSerum",
          bua_bun: "buaBun",
          syphilis: "syphilis",
          hiv_test: "hivTest",
          hepa_b: "hepaB",
          blood_typing: "bloodTyping",
          ogct_50gms: "ogct50",
          ogct_100gms: "ogct100",
        };
        const key = keyMap[labType];
        if (key && mappedResults[key]) {
          mappedResults[key] = {
            ...mappedResults[key],
            checked: true,
            date: item.resultDate || "",
            toBeFollowed: item.toBeFollowed || false,
            remarks: item.labRemarks || "",
            images: Array.isArray(item.images)
              ? item.images.map((img: any) => ({
                  file: undefined, 
                  preview: img.image_url || "",
                  name: img.image_name || "",
                  type: img.image_type || "",
                  size: img.image_size || 0,
                  url: img.image_url || "",
                }))
              : [],
          };
        }
      });
      setLabResults(mappedResults);
    }
  }, [form, labResults]);

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

  const handleNext = async () => {
    window.scrollTo(0, 0) 

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
    console.log("Laboratory Results Summary: ", labSummary)

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

  // const handleVaccineChange = (value: string) => {
  //   form.setValue("prenatalVaccineInfo.vaccineType", value)
  // }

  //tt type
  type TetanusToxoidType = {
    vaccineType?: string
    ttStatus?: string
    ttDateGiven?: string
  }

  // tetanus toxoid history
  const addTTRecord = () => {
    const ttstatus = form.getValues("prenatalVaccineInfo.ttStatus")
    const ttDateGiven = form.getValues("prenatalVaccineInfo.ttDateGiven")

    if (!ttstatus ) {
      showErrorToast("Error! No TT Status selected.")
      return
    }
    const newTTData: TetanusToxoidType = {
      vaccineType: form.getValues("prenatalVaccineInfo.vaccineType"),
      ttStatus: ttstatus,
      ttDateGiven: ttDateGiven || "",
    }

    setTTRecords((prev) => {
      const upd = [...prev, newTTData]
      console.log("Updated TT Records:", upd)
      form.setValue("prenatalVaccineInfo.ttRecordsHistory", upd)
      return upd
    })

    form.setValue("prenatalVaccineInfo.ttStatus", "")
    form.setValue("prenatalVaccineInfo.ttDateGiven", "")
  }


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
              <p className="flex items-center text-black/50 text-[14px] ml-2">
                <CircleAlert size={15} className="mr-1" />
                Note: Do not forget to add a vaccination record if a <b className="pl-1">TT</b>/<b>TD</b>/<b className="pr-1">TDAP</b> is administered by midwife on the day of visit.
              </p>
            </h3>
            <div className="grid gap-3 px-5">
              <div className="flex flex-col">
                {/* <div className="grid mt-5 mb-5"> */}
                  {/* <div className="">
                    <div className="mb-2">
                      <Label className="flex text-black/70 items-center">Vaccine Type</Label>
                    </div>
                    {/* <Combobox
                      options={vaccineStocksOptions.map((vaccine: any) => ({
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
                  </div> */}
                {/* </div> */}
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
                {/* <div className="mt-4">
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
                </div> */}

                {/* <Separator className="mt-6 mb-3" /> */}

                <div className="flex justify-end mt-2 mb-5">
                  <Button type="button" onClick={addTTRecord}>
                    Add
                  </Button>
                </div>
              </div>

              {/* <div className="border rounded-lg p-5"> */}
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
                          // Sort by date (most recent first)
                          const dateA = a.ttDateGiven ? new Date(a.ttDateGiven).getTime() : 0
                          const dateB = b.ttDateGiven ? new Date(b.ttDateGiven).getTime() : 0
                          return dateB - dateA
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
                                {/* {record.vaccineType && (
                                  <span className="text-xs text-gray-500">
                                    Vaccine: {record.vaccineType}
                                  </span>
                                )} */}
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
          {/* </div> */}

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
