"use client"


import { useState, useCallback, useEffect } from "react" 
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form/form" 
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { MedicineDisplay } from "@/components/ui/medicine-display"
import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"
import { usePrenatalPatientFollowUpVisits } from "../../queries/maternalFetchQueries"
import { ScrollText } from "lucide-react"
import { ANCVisitsGuide } from "../../maternal-components/guide-for-8anc"
import { useAuth } from "@/context/AuthContext"

// main  component
export default function PrenatalFormThirdPg({ form, onSubmit, back, selectedMedicines, setSelectedMedicines }: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
  selectedMedicines: { minv_id: string; medrec_qty: number; reason: string }[]
  setSelectedMedicines: React.Dispatch<React.SetStateAction<{ minv_id: string; medrec_qty: number; reason: string }[]>>
}) {

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { data: medicineStocksOptions, isLoading: isMedicineLoading } = fetchMedicinesWithStock()
  const { data: followUpVisitsData, isLoading: isFUVLoading, error: followUpVisitsError } = usePrenatalPatientFollowUpVisits(form.getValues("pat_id") || "")
  const { user } = useAuth()
  const staff = `${user?.personal?.per_fname || ""} ${user?.personal?.per_lname || ""} (${user?.staff?.pos || ""})`
  const staffId = user?.staff?.staff_id || ""

  useEffect(() => {
    if (staff && staffId) {
      form.setValue("assessedBy.name", staff)
      form.setValue("assessedBy.id", staffId)
    }
  }, [staff, staffId, form])

  const handleNext = async () => {
    if (Object.keys(form.formState.errors).length === 0) {
      console.log("Form is valid, proceeding to next page")
      onSubmit() 
    } else {
      console.log("Form validation failed for RHF fields.")
      console.log("Validation errors:", form.formState.errors) 
      
      const firstErrorElement = document.querySelector('[data-error="true"]')
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }

  function calculateAOG(lmp: string): {weeks: number, days: number} {
    const lmpDate = new Date(lmp)
    const today = new Date()

    // clearing time portion
    lmpDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    // difference in milliseconds
    const diffInMs = today.getTime() - lmpDate.getTime()
    if (diffInMs < 0) return {weeks: 0, days: 0}

    // convert to days
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    const weeks = Math.floor(totalDays / 7);
    const days = totalDays % 7;

    return {weeks, days}
  }

  const lmp = form.watch("presentPregnancy.pf_lmp")

  // compute age of gestation (weeks, days) from LMP; default to 0 when not available
  const aog = (() => {
    try {
      if (!lmp) return { weeks: 0, days: 0 }
      const res = calculateAOG(lmp)
      form.setValue("followUpSchedule.aogWeeks", res.weeks)
      form.setValue("followUpSchedule.aogDays", res.days)
      return {
        weeks: Number.isFinite(res.weeks) ? res.weeks : 0,
        days: Number.isFinite(res.days) ? res.days : 0,
      }
    } catch {
      return { weeks: 0, days: 0 }
    }
  })()

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    return  date.toLocaleDateString("en-PH", { weekday: "long" })
  }

  const followupDate = form.watch("followUpSchedule.followUpDate")

  // compute today's date in YYYY-MM-DD for use as min on date inputs
  const todayIso = (() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const followupDayName = followupDate ? `is on ${getDayName(followupDate)}` : ""

  const handleSelectedMedicinesChange = useCallback(
    (
      updatedMedicines: {
        minv_id: string
        medrec_qty: number
        reason: string
      }[],
    ) => {
      setSelectedMedicines(updatedMedicines)
    },
    [],
  )

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // checklist
  type AssessmentChecklistKeys = keyof z.infer<typeof PrenatalFormSchema>["assessmentChecklist"]
  const preEclampsiaChecklist: { name: AssessmentChecklistKeys; label: string }[] = [
    { name: "increasedBP", label: "INCREASED BP" },
    { name: "epigastricPain", label: "EPIGASTRIC PAIN" },
    { name: "nausea", label: "NAUSEA" },
    { name: "blurringOfVision", label: "BLURRING OF VISION" },
    { name: "edema", label: "EDEMA" },
    { name: "severeHeadache", label: "SEVERE HEADACHE" },
    { name: "abnormalVaginalDischarges", label: "ABNORMAL VAGINAL DISCHARGES" },
    { name: "vaginalBleeding", label: "VAGINAL BLEEDING" },
    { name: "chillsFever", label: "CHILLS & FEVER" },
    { name: "diffInBreathing", label: "DIFF. IN BREATHING" },
    { name: "varicosities", label: "VARICOSITIES" },
    { name: "abdominalPain", label: "ABDOMINAL PAIN" },
  ]

  const preEclampsiaChecklistGroup = [
    [
      preEclampsiaChecklist[0],
      preEclampsiaChecklist[1],
      preEclampsiaChecklist[2],
      preEclampsiaChecklist[3],
      preEclampsiaChecklist[4],
      preEclampsiaChecklist[5],
    ],
    [
      preEclampsiaChecklist[6],
      preEclampsiaChecklist[7],
      preEclampsiaChecklist[8],
      preEclampsiaChecklist[9],
      preEclampsiaChecklist[10],
      preEclampsiaChecklist[11],
    ],
  ]

  type RiskCodes = z.infer<typeof PrenatalFormSchema>["riskCodes"]
  type HasOneOrMoreOfTheFFKeys = keyof RiskCodes["hasOneOrMoreOfTheFF"]
  type HasOneOrMoreOneConditionsKeys = keyof RiskCodes["hasOneOrMoreOneConditions"]
  const riskCodesList = {
    hasOneOrMoreOfTheFF: [
      { name: "prevCaesarian" as HasOneOrMoreOfTheFFKeys, label: "Previous Caesarian Section" },
      { name: "miscarriages" as HasOneOrMoreOfTheFFKeys, label: "3 consecutive micarriages of stillborn baby" },
      { name: "postpartumHemorrhage" as HasOneOrMoreOfTheFFKeys, label: "Postpartum Hemorrhage" },
    ],
    hasOneOrMoreOneConditions: [
      { name: "tuberculosis" as HasOneOrMoreOneConditionsKeys, label: " Tuberculosis" },
      { name: "heartDisease" as HasOneOrMoreOneConditionsKeys, label: "Heart Disease" },
      { name: "diabetes" as HasOneOrMoreOneConditionsKeys, label: "Diabetes" },
      { name: "bronchialAsthma" as HasOneOrMoreOneConditionsKeys, label: "Bronchial Asthma" },
      { name: "goiter" as HasOneOrMoreOneConditionsKeys, label: "Goiter" },
    ],
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return { variant: "outline" as const, className: "bg-green-50 text-green-700 border-green-200" }
      case 'pending':
        return { variant: "outline" as const, className: "bg-yellow-50 text-yellow-700 border-yellow-200" }
      case 'scheduled':
        return { variant: "outline" as const, className: "bg-blue-50 text-blue-700 border-blue-200" }
      case 'missed':
        return { variant: "outline" as const, className: "bg-red-50 text-red-700 border-red-200" }
      default:
        return { variant: "outline" as const, className: "bg-gray-50 text-gray-700 border-gray-200" }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  useEffect(() => {
    const isCesarean = form.getValues("previousPregnancy.typeOfDelivery") === "Cesarean Section";

    if (isCesarean) {
      form.setValue("riskCodes.hasOneOrMoreOfTheFF.prevCaesarian", true);
    }
  }, [form]);

  return (
    <>
      <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
        <Label className="text-black text-opacity-50 italic mb-10">Page 3 of 4</Label>
        <Form {...form}>
          <form>
            <div className="border rounded-lg shadow-md p-4 grid mb-8">
              {/* schedule for follow-up */}
              <div className="">
                <div className="flex flex-col">
                  <div className="px-5">
                    <ANCVisitsGuide />
                  </div>
                  
                  <h3 className="text-md font-semibold mt-2 p-5">SCHEDULE FOR FOLLOW-UP VISIT</h3>
                  <div className="px-8">
                    {/* age of gestation */}
                    <div className="border shadow-md rounded-md p-2 mb-4">
                      <div className="grid grid-cols-2">
                        <Label className="text-sm font-medium mb-1">Current age of gestation (AOG)</Label>
                        <div className="flex-1">
                            <div className="grid grid-cols-2">
                              <span className="text-[12px] text-black/50 font-poppins font-semibold">Weeks: <span className="font-bold text-black text-[16px] ml-1">{aog.weeks}</span></span>
                              <span className="text-[12px] text-black/50 font-poppins font-semibold">Days: <span className="font-bold text-black text-[16px] ml-1">{aog.days}</span></span>
                            </div> 
                        </div>
                      </div>
                    </div>

                    {/* Follow-up Date Picker */}
                    <div className="mb-4">
                      <FormDateTimeInput
                        control={form.control}
                        name="followUpSchedule.followUpDate"
                        label='Follow-up Date'
                        type="date"
                        min={todayIso}
                      />
                    </div>
                    {followupDate && (
                      <span className="text-sm italic text-yellow-600">
                        Note: Next follow-up visit {followupDayName}
                      </span>
                    )}
                    

                    {/* Follow-up History */}
                    <Card className="border rounded-lg p-2 bg-gray-50 mt-3">
                      <CardHeader>
                        <CardTitle className="text-sm font-semibold mb-2">Recent Follow-ups</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {isFUVLoading ? (
                            <div className="flex justify-center items-center py-4">
                              <span className="text-sm text-gray-500">Loading follow-up visits...</span>
                            </div>
                          ) : followUpVisitsError ? (
                            <div className="flex justify-center items-center py-4">
                              <span className="text-sm text-red-500">Error loading follow-up visits</span>
                            </div>
                          ) : followUpVisitsData?. prenatal_records && followUpVisitsData.prenatal_records.length > 0 ? (
                            followUpVisitsData.prenatal_records
                              .filter((record:any) => record.followup_visits)
                              .sort((a : any, b : any) => new Date(b.followup_visits.followup_date).getTime() - new Date(a.followup_visits.followup_date).getTime())
                              .map((record: any) => {
                                const followUp = record.followup_visits
                                const statusBadge = getStatusBadge(followUp.followv_status)

                                return (
                                  <div key={`${record.prenatal_id}-${followUp.followv_id}`}
                                    className="flex justify-between items-center text-sm py-1"
                                  >
                                    <div className="flex flex-col">
                                      <span>{formatDate(followUp.followv_date)}</span>
                                      <span className="text-xs text-gray-500">ID: {record.prenatal_id}</span>
                                    </div>
                                    <Badge variant={statusBadge.variant} className={statusBadge.className}>
                                      {followUp.followv_status.charAt(0).toUpperCase() + followUp.followv_status.slice(1)}
                                    </Badge>
                                  </div>
                                )
                              })
                          ) : (
                            <div className="flex justify-center items-center py-4">
                              <span className="flex justify-center items-center text-sm text-gray-500">
                                <ScrollText size={30}/> No follow-up visits found
                              </span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    
                  </div>
                </div>
              </div>
            </div>

            <div>
              {/* Checklist */}
                <Card className="border rounded-lg shadow-md flex flex-col w-full mb-5">
                  <CardHeader>
                    <CardTitle className="text-md font-semibold p-5">CHECKLIST</CardTitle>
                    <Label className="ml-10">()PRE-ECLAMPSIA</Label>
                  </CardHeader>
                  <CardContent>
                    {preEclampsiaChecklistGroup.map((group, i) => (
                      <div className="grid grid-cols-2 gap-4 mt-4 ml-10 mr-10 mb-4" key={i}>
                        {group.map((item) => (
                          <FormField
                            key={item.name}
                            control={form.control}
                            name={`assessmentChecklist.${item.name}`}
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="cursor-pointer font-medium flex-1">{item.label}</FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </CardContent>
                </Card>
            </div>
            
            {/* Birth Plans and Micronutrient Supplementation */}
            <div className="grid ">
              <Card className=" p-4 border rounded-lg shadow-md mb-5">
                <CardHeader>
                  <CardTitle className="text-md font-semibold mt-2">BIRTH PLANS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols- gap-7 mt-5 px-4">
                    <FormInput
                      control={form.control}
                      name="pregnancyPlan.planPlaceOfDel"
                      label="PLAN FOR PLACE OF DELIVERY"
                      placeholder="Enter plan of delivery place"
                    />

                    <FormField
                      control={form.control}
                      name="pregnancyPlan.planNewbornScreening"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>PLAN FOR NEWBORN SCREENING:</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={(value) => {
                                field.onChange(value === "yes") // Convert "yes"/"no" to boolean
                              }}
                              value={field.value ? "yes" : "no"} // Convert boolean to "yes"/"no" for RadioGroup
                              className="ml-3"
                            >
                              <FormItem className="mr-4">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="ml-2">YES</FormLabel>
                              </FormItem>
                              <FormItem>
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="ml-2">NO</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border rounded-lg shadow-md p-4 mb-5">
                <CardHeader>
                  <span className="flex flex-row items-center">
                    <CardTitle className="text-md font-semibold mt-2 mb-3 mr-2">
                      MICRONUTRIENT SUPPLEMENTATION{" "}
                    </CardTitle>
                    <p className="text-[14px] text-black/50 font-poppins">
                      (Select <b>Iron with Folic Acid</b> and <b>Deworming Tab</b>)
                    </p>
                  </span>
                </CardHeader>
                <CardContent>
                  {isMedicineLoading ? (
                    <div className="p-4 flex justify-center items-center space-y-4">
                      <p className="text-center text-red-600">Loading medicines...</p>
                    </div>
                  ) : (
                    <MedicineDisplay
                      medicines={medicineStocksOptions?.medicines ?? []}
                      initialSelectedMedicines={selectedMedicines}
                      onSelectedMedicinesChange={handleSelectedMedicinesChange}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                  
                  <div className="flex px-3 mt-4">
                    <div className="border rounded-lg p-3 w-full">
                      <Label className="font-semibold">Given Medicines</Label>
                      <div className="flex justify-center items-center p-3">
                        {/* {selectedMedicines.map((medicine) => (
                          <div key={medicine.id} className="flex justify-between">
                            <span>{medicine.name}</span>
                            <span>{medicine.dosage}</span>
                          </div>
                        ))} */}
                        <Label className="text-black/70">No history of given medicines yet.</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* risk codes */}
            <Card className="flex flex-col mt-3 p-5 border rounded-md shadow-md mb-10">
              <CardHeader>
                <CardTitle className="text-md font-semibold">RISK CODES</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 px-5 gap-5 my-5">
                  <Label>HAS ONE OR MORE OF THE FF:</Label>
                  <Label>HAS ONE OR MORE 1 CONDITIONS:</Label>
                </div>
                <div className="grid grid-cols-2 ml-1">
                  <div className="space-y-3 px-7">
                    {riskCodesList.hasOneOrMoreOfTheFF.map((item) => (
                      <FormField
                        key={item.name}
                        control={form.control}
                        name={`riskCodes.hasOneOrMoreOfTheFF.${item.name}`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-medium flex-1">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <div className="space-y-3 px-7">
                    {riskCodesList.hasOneOrMoreOneConditions.map((item) => (
                      <FormField
                        key={item.name}
                        control={form.control}
                        name={`riskCodes.hasOneOrMoreOneConditions.${item.name}`}
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 p-3 pr-[10rem] rounded-lg border hover:bg-gray-50 transition-colors">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-medium flex-1">{item.label}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* staff assessed by */}
            <div className="grid w-full m-2">
              <FormInput
                control={form.control}
                name="assessedBy.name"
                label="ASSESSED BY:"
              />
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
    </>
  )
}
