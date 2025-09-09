"use client"


import { useState, useCallback, useEffect } from "react" 
import type { UseFormReturn } from "react-hook-form"
import type { z } from "zod"

import { Button } from "@/components/ui/button/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormLabel, Form } from "@/components/ui/form/form" // Ensure Form is imported
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // Added Card imports

import { MedicineDisplay } from "@/components/ui/medicine-display"
import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"
import { usePrenatalPatientFollowUpVisits, useCalculatedMissedVisits } from "../../queries/maternalFetchQueries"
import { ScrollText } from "lucide-react"


export default function PrenatalFormThirdPg({
  form,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
}) {

  const handleNext = async () => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

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

  const aogWks = form.watch("followUpSchedule.aogWeeks") || undefined
  const aogDays = form.watch("followUpSchedule.aogDays") || undefined
  const pregnancyId = form.watch("pregnancy_id") || ""

  const [selectedMedicines, setSelectedMedicines] = useState<{ minv_id: string; medrec_qty: number; reason: string }[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const { data: medicineStocksOptions, isLoading: isMedicineLoading } = fetchMedicinesWithStock()
  const { data: followUpVisitsData, isLoading: isFUVLoading, error: followUpVisitsError } = usePrenatalPatientFollowUpVisits(form.getValues("pat_id") || "")
  const { data: missedVisitsData, isLoading: isMissedVisitsLoading, error: missedVisitsError, refetch: refetchMissedVisits } = useCalculatedMissedVisits(pregnancyId, aogWks, aogDays)

  useEffect(() => {
    if(pregnancyId && aogWks) {
      refetchMissedVisits()
    }
  }, [pregnancyId, aogWks, aogDays, refetchMissedVisits])

  const getDayName = (dateString: string) => {
    const date = new Date(dateString)
    return  date.toLocaleDateString("en-PH", { weekday: "long" })
  }

  const followupDate = form.watch("followUpSchedule.followUpDate")

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

  // risk codes
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

  // AOG Analysis and Visit Tracking
  // const [aogAnalysis, setAogAnalysis] = useState<{
  //   currentMonth: number
  //   currentWeek: number
  //   expectedVisits: number
  //   missedVisits: number
  //   visitFrequency: string
  //   nextVisitRecommendation: string
  // } | null>(null)

  // const calculateAOGAnalysis = () => {
  //   const weeks = Number(form.getValues("followUpSchedule.aogWeeks")) || 0
  //   const days = Number(form.getValues("followUpSchedule.aogDays")) || 0

  //   if (weeks === 0) return

  //   const totalWeeks = weeks + days / 7
  //   const currentMonth = Math.ceil(totalWeeks / 4.33) // Average weeks per month

  //   let expectedVisits = 0
  //   let visitFrequency = ""
  //   let nextVisitRecommendation = ""

  //   if (totalWeeks < 28) {
  //     // monthly visits
  //     expectedVisits = Math.floor(totalWeeks / 4)
  //     visitFrequency = "Monthly (every 4 weeks)"
  //     nextVisitRecommendation = "4 weeks"
  //   } else if (totalWeeks < 36) {
  //     // bi-weekly visits
  //     const visitsBeforeWeek28 = 7 // total monthly visits

  //     const weeksAfter28 = totalWeeks - 28
  //     const biWeeklyVisits = Math.floor(weeksAfter28 / 2)
  //     expectedVisits = visitsBeforeWeek28 + biWeeklyVisits
  //     visitFrequency = "Bi-weekly (every 2 weeks)"
  //     nextVisitRecommendation = "2 weeks"
  //   } else {
  //     // weekly visits
  //     const visitsBeforeWeek28 = 7 // total monthly visits
  //     const biWeeklyVisits = 4 // total bi-weekly visits

  //     const weeksAfter36 = totalWeeks - 36
  //     const weeklyVisits = Math.floor(weeksAfter36)
  //     expectedVisits = visitsBeforeWeek28 + biWeeklyVisits + weeklyVisits
  //     visitFrequency = "Weekly"
  //     nextVisitRecommendation = "1 week"
  //   }

  //   const actualVisits = 1 // example visit
  //   const missedVisits = Math.max(0, expectedVisits - actualVisits)

  //   setAogAnalysis({
  //     currentMonth,
  //     currentWeek: Math.floor(totalWeeks),
  //     expectedVisits,
  //     missedVisits,
  //     visitFrequency,
  //     nextVisitRecommendation,
  //   })
  // }

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


  // Set initial values for micronutrientSupp from form if they exist
  // useEffect(() => {
  //   const ironFolicStarted = form.getValues("micronutrientSupp.ironFolicStarted")
  //   const ironFolicCompleted = form.getValues("micronutrientSupp.ironFolicCompleted")
  //   const deworming = form.getValues("micronutrientSupp.deworming")

  //   // You might need to map these to your `selectedMedicines` structure
  //   // For now, I'll just ensure the form fields are correctly watched/set
  // }, [form])

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
                  <h3 className="text-md font-semibold mt-2 mb-4 p-5">SCHEDULE FOR FOLLOW-UP VISIT</h3>
                  <div className="px-4">
                    <div className="mb-4 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-sm">
                      <strong>📋 Prenatal Visit Guidelines:</strong>
                      <ul className="mt-1 ml-4 list-disc text-xs">
                        <li>Months 1-6 (Weeks 4-28): Monthly visits (6 total)</li>
                        <li>Months 7-8 (Weeks 28-36): Bi-weekly visits (4 total)</li>
                        <li>Month 9 (Weeks 36-40): Weekly visits (4-5 total)</li>
                      </ul>
                    </div>

                    {/* AOG Input Section */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <FormInput
                        control={form.control}
                        name="followUpSchedule.aogWeeks"
                        label="AOG Weeks"
                        type="number"
                        placeholder="0"
                      />
                      <FormInput
                        control={form.control}
                        name="followUpSchedule.aogDays"
                        label="AOG Days"
                        type="number"
                        placeholder="0"
                      />
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full mr-2 bg-transparent"
                        >
                          Check AOG
                        </Button>
                        <Button
                          type="button"
                          variant="default"
                          className="w-full"
                          onClick={() => {
                            // Auto-calculate recommended follow-up based on AOG
                            const weeks = Number(form.getValues("followUpSchedule.aogWeeks")) || 0
                            const today = new Date()
                            const recommendedDate = new Date(today)

                            if (weeks <= 28) {
                              // Monthly visits for first 28 weeks
                              recommendedDate.setMonth(today.getMonth() + 1)
                            } else if (weeks <= 36) {
                              // Bi-weekly visits from 28-36 weeks
                              recommendedDate.setDate(today.getDate() + 14)
                            } else {
                              // Weekly visits after 36 weeks
                              recommendedDate.setDate(today.getDate() + 7)
                            }

                            form.setValue("followUpSchedule.followUpDate", recommendedDate.toISOString().split("T")[0])
                          }}
                        >
                          Auto Schedule
                        </Button>
                      </div>
                    </div>

                    {/* {aogAnalysis && (
                      <Card className="mt-4 mb-4 p-4 border rounded-lg bg-blue-50">
                        <CardHeader>
                          <CardTitle className="font-semibold text-blue-800 mb-3">AOG Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <strong>Current Status:</strong>
                              </p>
                              <p>
                                Month {aogAnalysis.currentMonth} (Week {aogAnalysis.currentWeek})
                              </p>
                              <p>
                                <strong>Visit Frequency:</strong>
                              </p>
                              <p>{aogAnalysis.visitFrequency}</p>
                            </div>
                            <div>
                              <p>
                                <strong>Expected Visits by Now:</strong> {aogAnalysis.expectedVisits}
                              </p>
                              {aogAnalysis.missedVisits > 0 && (
                                <p className="text-red-600">
                                  <strong>Missed Visits:</strong> {aogAnalysis.missedVisits}
                                </p>
                              )}
                              <p>
                                <strong>Next Visit:</strong> In {aogAnalysis.nextVisitRecommendation}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )} */}
                    <div>
                      {/* Your existing form fields */}
                      
                      {/* AOG Analysis Display */}
                      {isMissedVisitsLoading && (
                        <Card className="mt-4 mb-4 p-4 border rounded-lg bg-gray-50">
                          <CardContent>
                            <p>Calculating missed visits...</p>
                          </CardContent>
                        </Card>
                      )}

                      {missedVisitsError && (
                        <Card className="mt-4 mb-4 p-4 border rounded-lg bg-red-50">
                          <CardContent>
                            <p className="text-red-600">Error calculating missed visits</p>
                          </CardContent>
                        </Card>
                      )}

                      {missedVisitsData && !missedVisitsData.error && (
                        <Card className="mt-4 mb-4 p-4 border rounded-lg bg-blue-50">
                          <CardHeader>
                            <CardTitle className="font-semibold text-blue-800 mb-3">
                              AOG Analysis & Visit Tracking
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Current Status:</strong></p>
                                <p>Week {missedVisitsData.current_aog_weeks}, Day {missedVisitsData.current_aog_days}</p>
                                <p><strong>First Visit:</strong> Month {missedVisitsData.first_visit_month} (Week {missedVisitsData.first_visit_week})</p>
                                <p><strong>Visit Schedule:</strong></p>
                                <p>
                                  {missedVisitsData.current_aog_weeks <= 28 
                                    ? "Monthly (every 4 weeks)"
                                    : missedVisitsData.current_aog_weeks <= 36
                                    ? "Bi-weekly (every 2 weeks)"
                                    : "Weekly"
                                  }
                                </p>
                              </div>
                              <div>
                                <p><strong>Expected Visits by Now:</strong> {missedVisitsData.expected_visits}</p>
                                <p><strong>Actual Visits:</strong> {missedVisitsData.actual_visits}</p>
                                {missedVisitsData.missed_visits > 0 && (
                                  <p className="text-red-600">
                                    <strong>Missed Visits:</strong> {missedVisitsData.missed_visits}
                                  </p>
                                )}
                                <p><strong>Next Visit:</strong> 
                                  {missedVisitsData.current_aog_weeks <= 28 
                                    ? " In 4 weeks"
                                    : missedVisitsData.current_aog_weeks <= 36
                                    ? " In 2 weeks"
                                    : " In 1 week"
                                  }
                                </p>
                              </div>
                            </div>
                            
                            {/* Visit Breakdown */}
                            {missedVisitsData.visit_breakdown && missedVisitsData.visit_breakdown.length > 0 && (
                              <div className="mt-4">
                                <p className="font-semibold mb-2">Visit History:</p>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                  {missedVisitsData.visit_breakdown.map((visit : any, index : any) => (
                                    <div key={index} className="flex justify-between items-center text-xs py-1">
                                      <span>{visit.period} - Month {visit.expected_month} (Week {visit.expected_week})</span>
                                      <Badge 
                                        variant={visit.status === 'completed' ? 'default' : 'destructive'}
                                        className={visit.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                      >
                                        {visit.status === 'completed' ? 'Completed' : 'Missed'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {missedVisitsData?.error && (
                        <Card className="mt-4 mb-4 p-4 border rounded-lg bg-yellow-50">
                          <CardContent>
                            <p className="text-yellow-700">{missedVisitsData.error}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    {/* Follow-up Date Picker */}
                    <div className="mb-4">
                      <FormDateTimeInput
                        control={form.control}
                        name="followUpSchedule.followUpDate"
                        label='Follow-up Date'
                        type="date"
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

              {/* guide for 4anc visits */}
              <div className="grid grid-cols- gap-4 mb-8 p-4">
                <Card className="border rounded-lg shadow-md flex flex-col w-full mb-8">
                  <CardHeader>
                    <div className="flex justify-between items-center p-5">
                      <CardTitle className="text-md font-semibold">GUIDE FOR 4ANC VISITS</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="px-4">
                      <div className="grid grid-cols-3 px-4 mb-5 gap-3 ">
                        <Card className="border rounded-md p-5">
                          <CardContent>
                            <FormDateTimeInput
                              control={form.control}
                              name="ancVisits.firstTri"
                              label="1st Trimester"
                              type="date"
                            />
                            <Label className="text-black text-opacity-50 italic ml-1">(up to 12 wks and 6 days)</Label>
                          </CardContent>
                        </Card>
                        <Card className="border rounded-md p-5">
                          <CardContent>
                            <FormDateTimeInput
                              control={form.control}
                              name="ancVisits.secondTri"
                              label="2nd Trimester"
                              type="date"
                            />
                            <Label className="text-black text-opacity-50 italic ml-1">(13-27 wks and 6 days)</Label>
                          </CardContent>
                        </Card>
                        <Card className="grid gap-2 border p-5">
                          <CardContent>
                            <Label className="col-span-2">3rd Trimester</Label>
                            <div>
                              <FormDateTimeInput
                                control={form.control}
                                name="ancVisits.thirdTriOne"
                                label="1st visit"
                                type="date"
                              />
                            </div>
                            <div>
                              <FormDateTimeInput
                                control={form.control}
                                name="ancVisits.thirdTriTwo"
                                label="2nd visit"
                                type="date"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              {/* checklist */}
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
                      medicines={medicineStocksOptions ?? []}
                      initialSelectedMedicines={selectedMedicines}
                      onSelectedMedicinesChange={handleSelectedMedicinesChange}
                      itemsPerPage={itemsPerPage}
                      currentPage={currentPage}
                      onPageChange={handlePageChange}
                    />
                  )}
                  {/* <div className="flex flex-col px-4">
                    <Label className="mt-5">IRON W/ FOLIC ACID:</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <FormDateTimeInput
                        control={form.control}
                        name="micronutrientSupp.ironFolicStarted"
                        label="Date Started"
                        type="date"
                      />
                      <FormDateTimeInput
                        control={form.control}
                        name="micronutrientSupp.ironFolicCompleted"
                        label="Date Completed"
                        type="date"
                      />
                    </div>

                    <Label className="mt-5">DEWORMING TAB: (preferably 3rd trimester):</Label>
                    <FormDateTimeInput
                      control={form.control}
                      name="micronutrientSupp.deworming"
                      label="Date Given"
                      type="date"
                    />
                  </div> */}
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
              <FormSelect
                control={form.control}
                name="assessedBy.assessedby"
                label="ASSESSED BY:"
                options={[
                  { id: "0", name: "Juliana Zamora" },
                  { id: "1", name: "Inka Kamarani" },
                  { id: "2", name: "Lowe Anika" },
                ]}
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
