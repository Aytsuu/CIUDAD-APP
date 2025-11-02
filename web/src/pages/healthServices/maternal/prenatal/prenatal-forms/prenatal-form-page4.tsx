"use client"

import { useEffect, useState } from "react"
import { useFormContext, type UseFormReturn } from "react-hook-form"
import { Form } from "@/components/ui/form/form"
import type { ColumnDef } from "@tanstack/react-table"
import { Loader2, SquarePen } from "lucide-react"

import type { z } from "zod"

import { DataTable } from "@/components/ui/table/data-table"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { ProtectedComponent } from "@/ProtectedComponent" 
import { Combobox } from "@/components/ui/combobox"

import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"

import { useAddPrenatalRecord } from "../../queries/maternalAddQueries"
import { usePrenatalPatientPrenatalCare } from "../../queries/maternalFetchQueries"
import { useMaternalStaff } from "../../queries/maternalFetchQueries"
import { useAuth } from "@/context/AuthContext"


export default function PrenatalFormFourthPq({
  form,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
}) {
  const { control, setValue, getValues } = useFormContext()
  const addPrenatalRecordMutation = useAddPrenatalRecord()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [prenatalCareData, setPrenatalCareData] = useState<prenatalCareTypes[]>([])
  const [prenatalCareHistoryTableData, setPrenatalCareHistoryTableData] = useState<any[]>([])
  const [selectedStaffId, setSelectedStaffId] = useState<string>("")
  const [selectedStaffPosition, setSelectedStaffPosition] = useState<string>("")
  const { user } = useAuth()

  // watch values
  const patId = form.watch("pat_id") || ""
  const pregnancyId = form.watch("pregnancy_id") || ""
  const momWt = form.watch("motherPersonalInfo.motherWt")
  const aogWks = form.watch("followUpSchedule.aogWeeks")
  const aogDays = form.watch("followUpSchedule.aogDays")

  // fetch hooks
  const { data: prenatalCareHistory, isLoading: isLoadingPrenatalCare } = usePrenatalPatientPrenatalCare(patId, pregnancyId)
  const { data: staffsData, isLoading: isLoadingStaff } = useMaternalStaff()
  
  // user's staff ID
  const currentUserStaffId = user?.staff?.staff_id || ""

  // staff options for forward to
  const staffOptions = 
    staffsData && Array.isArray(staffsData.staff)
      ? staffsData.staff
          .filter((staff: any) => String(staff.staff_id || "") !== String(currentUserStaffId)) // Exclude logged-in user
          .map((staff: any) => {
            const fullName = staff.full_name || `${staff.first_name || ""} ${staff.last_name || ""}`.trim() || "Unknown Staff"
            const position = staff.position || staff.pos || ""
            // Create a searchable ID that includes name and position for searching
            const searchableId = `${fullName} ${position}`.toLowerCase()
            
            return {
              id: searchableId,
              name: position ? (
                <div className="flex items-center gap-2">
                  <span className="border border-green-300 rounded px-2 py-1 text-xs bg-green-500 text-white">{position}</span>
                  <span>{fullName}</span>
                </div>
              ) : (
                fullName
              ),
              realId: String(staff.staff_id || ""),
            }
          })
      : []


  // prenatal care types
  type prenatalCareTypes = {
    date: string
    aog: {
      aogWeeks: number
      aogDays: number
    }
    wt: number
    bp: {
      systolic: number
      diastolic: number
    }
    leopoldsFindings: {
      fundalHeight?: string
      fetalHeartRate?: string
      fetalPosition?: string
    }
    notes: {
      complaints?: string
      advises?: string
      temp?: string
      resRate?: string
      pulseRate?: string
      o2?: string
    }
  }

  

  const today = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    setValue("prenatalCare.date", today)
  }, [setValue, today])

  useEffect(() => {
    setValue("prenatalCare.wt", momWt !== undefined && momWt !== null ? String(momWt) : "")
    setValue("prenatalCare.aog.aogWeeks", aogWks !== undefined && aogWks !== null ? String(aogWks) : "")
    setValue("prenatalCare.aog.aogDays", aogDays !== undefined && aogDays !== null ? String(aogDays) : "")

  }, [momWt, aogWks, aogDays, setValue])

  // prenatal care fetching
  useEffect(() => {
    if (prenatalCareHistory && !isLoadingPrenatalCare) {
      const prenatalRecords = prenatalCareHistory.prenatal_records || []
      
      if (prenatalRecords.length > 0) {
        const allCareEntries: prenatalCareTypes[] = []
        
        prenatalRecords.forEach((record: any) => {
          const careEntries = record.prenatal_care_entries || []
          
          careEntries.forEach((entry: any) => {
            const mappedEntry: prenatalCareTypes = {
              date: entry.pfpc_date || 'N/A',
              aog: {
                aogWeeks: entry.pfpc_aog_wks || 0,
                aogDays: entry.pfpc_aog_days || 0,
              },
              wt: Number(entry.weight) || 0,
              bp: {
                systolic: entry.bp_systolic === "None" ? 0 : Number(entry.bp_systolic) || 0,
                diastolic: entry.bp_diastolic === "None" ? 0 : Number(entry.bp_diastolic) || 0,
              },
              leopoldsFindings: {
                fundalHeight: entry.pfpc_fundal_ht || undefined,
                fetalHeartRate: entry.pfpc_fetal_hr || undefined,
                fetalPosition: entry.pfpc_fetal_pos || undefined,
              },
              notes: {
                complaints: entry.pfpc_complaints === "None" ? "None" : entry.pfpc_complaints || undefined,
                advises: entry.pfpc_advises === "None" ? "None" : entry.pfpc_advises || undefined,

              },
            }
            
            allCareEntries.push(mappedEntry)
          })
        })
        
        console.log("🔍 Mapped prenatal care entries:", allCareEntries)
        setPrenatalCareHistoryTableData(allCareEntries)
      } else {
        setPrenatalCareHistoryTableData([])
      }
    }
  }, [prenatalCareHistory, isLoadingPrenatalCare])

  const getAllPrenatalCareData = (): prenatalCareTypes[] => {
    return [...prenatalCareHistoryTableData, ...prenatalCareData]
  }

  const addPrenatalCare = () => {
    console.log("🔍 Adding prenatal care entry...")
    
    // Get values directly from the form state for the temporary input fields
    const date = getValues("prenatalCare.date")
    const weight = Number.parseFloat(getValues("prenatalCare.wt") as string)
    const aogWks = Number.parseInt(getValues("prenatalCare.aog.aogWeeks") as string, 10)
    const aogDays = Number.parseInt(getValues("prenatalCare.aog.aogDays") as string, 10)
    const systolic = Number.parseInt(getValues("prenatalCare.bp.systolic") as string, 10)
    const diastolic = Number.parseInt(getValues("prenatalCare.bp.diastolic") as string, 10)
    const fundalHt = getValues("prenatalCare.leopoldsFindings.fundalHeight")
    const fetalHR = getValues("prenatalCare.leopoldsFindings.fetalHeartRate")
    const fetalPos = getValues("prenatalCare.leopoldsFindings.fetalPosition")
    const complaints = getValues("prenatalCare.notes.complaints")
    const advises = getValues("prenatalCare.notes.advises")
    const temp = getValues("prenatalCare.notes.temp")
    const resRate = getValues("prenatalCare.notes.resRate")
    const pulseRate = getValues("prenatalCare.notes.pulseRate")
    const o2 = getValues("prenatalCare.notes.o2")

    console.log("🔍 Form values retrieved:", {
      date,
      weight,
      aogWks,
      aogDays,
      systolic,
      diastolic,
      fundalHt,
      fetalHR,
      fetalPos,
      complaints,
      advises,
      temp,
      resRate,
      pulseRate,
      o2,
    })


    const newEntry: prenatalCareTypes = {
      date: date,
      wt: weight,
      aog: { aogWeeks: aogWks, aogDays: aogDays },
      bp: { systolic, diastolic },
      leopoldsFindings: {
        fundalHeight: fundalHt || undefined,
        fetalHeartRate: fetalHR || undefined,
        fetalPosition: fetalPos || undefined,
      },
      notes: {
        complaints: complaints || undefined,
        advises: advises || undefined,
        temp: temp || undefined,
        resRate: resRate || undefined,
        pulseRate: pulseRate || undefined,
        o2: o2 || undefined,
      },
    }

    console.log("New entry created:", newEntry)
    setPrenatalCareData((prev) => [...prev, newEntry])

    // Clear the input fields in the form state
    setValue("prenatalCare.date", today)
    setValue("prenatalCare.wt", "")
    setValue("prenatalCare.aog.aogWeeks", "")
    setValue("prenatalCare.aog.aogDays", "")
    setValue("prenatalCare.bp.systolic", "")
    setValue("prenatalCare.bp.diastolic", "")
    setValue("prenatalCare.leopoldsFindings.fundalHeight", "")
    setValue("prenatalCare.leopoldsFindings.fetalHeartRate", "")
    setValue("prenatalCare.leopoldsFindings.fetalPosition", "")
    setValue("prenatalCare.notes.complaints", "")
    setValue("prenatalCare.notes.advises", "")
    setValue("prenatalCare.notes.temp", "")
    setValue("prenatalCare.notes.resRate", "")
    setValue("prenatalCare.notes.pulseRate", "")
    setValue("prenatalCare.notes.o2", "")

    console.log("Prenatal care data added successfully. Total entries:", prenatalCareData.length + 1)
  }

  const removePrenatalCareEntry = (index: number) => {
    console.log("🔍 Removing prenatal care entry at index:", index)
    setPrenatalCareData((prev) => prev.filter((_, i) => i !== index))
  }

  const prenatalCareColumn: ColumnDef<prenatalCareTypes>[] = [
    {
      accessorKey: "date",
      header: "Date",
      size: 100,
      cell: ({ row }) => {
        return <div className="text-center">{row.original.date}</div>
      },
    },
    {
      accessorKey: "aog",
      header: "AOG",
      size: 100,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {row.original.aog.aogWeeks || ""} wk/s {row.original.aog.aogDays || ""} day/s
          </div>
        )
      },
    },
    {
      accessorKey: "wt",
      header: "Weight",
      size: 100,
      cell: ({ row }) => {
        return <div className="text-center">{row.original.wt || ""} kg</div>
      },
    },
    {
      accessorKey: "bp",
      header: "Blood Pressure",
      size: 100,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {row.original.bp.systolic || ""}/{row.original.bp.diastolic || ""}
          </div>
        )
      },
    },
    {
      accessorKey: "leopoldsFindings",
      header: "Leopold's Findings",
      size: 200,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            FH: {row.original.leopoldsFindings.fundalHeight || "N/A"},<br />
            FHB: {row.original.leopoldsFindings.fetalHeartRate || "N/A"} bpm,<br />
            FP: {row.original.leopoldsFindings.fetalPosition || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      size: 250,
      cell: ({ row }) => {
        return (
          <div className="text-center">
            Complaint/s: {row.original.notes.complaints || "N/A"} <br />
            Advises: {row.original.notes.advises || "N/A"} <br />
            Temperature: {row.original.notes.temp || "N/A"} <br />
            Respiratory Rate: {row.original.notes.resRate || "N/A"} <br />
            Pulse Rate: {row.original.notes.pulseRate || "N/A"} <br />
            O2 Saturation: {row.original.notes.o2 || "N/A"}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <ProtectedComponent exclude={['BARANGAY HEALTH WORKERS']}>
            <Button variant="outline" onClick={() => removePrenatalCareEntry(row.index)}>
              <SquarePen className="h-4 w-4" />
            </Button>
          </ProtectedComponent>
        </div>
        
      ),
    },
  ]
  
  // form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfirmOpen(false)
    
    try {
      const transformedPrenatalCare = prenatalCareData.map(entry => ({
        ...entry,
        date: entry.date,
        wt: Number(entry.wt),
        aog: {
          aogWeeks: entry.aog.aogWeeks != null && !isNaN(Number(entry.aog.aogWeeks)) ? Number(entry.aog.aogWeeks) : null,
          aogDays: entry.aog.aogDays != null && !isNaN(Number(entry.aog.aogDays)) ?  Number(entry.aog.aogDays) : null
        },
        bp: {
          systolic: (entry.bp.systolic != null && !isNaN(Number(entry.bp.systolic))) ?  Number(entry.bp.systolic) : null,
          diastolic: (entry.bp.diastolic != null && !isNaN(Number(entry.bp.diastolic))) ? Number(entry.bp.diastolic) : null
        },
        leopoldsFindings: {
          ...(entry.leopoldsFindings.fundalHeight && { fundalHeight: entry.leopoldsFindings.fundalHeight }),
          ...(entry.leopoldsFindings.fetalHeartRate && { fetalHeartRate: entry.leopoldsFindings.fetalHeartRate }),
          ...(entry.leopoldsFindings.fetalPosition && { fetalPosition: entry.leopoldsFindings.fetalPosition })
        },
        notes: {
          ...(entry.notes.complaints && { complaints: entry.notes.complaints }),
          ...(entry.notes.advises && { advises: entry.notes.advises }),
          ...(entry.notes.temp && { temp: entry.notes.temp }),
          ...(entry.notes.resRate && { resRate: entry.notes.resRate }),
          ...(entry.notes.pulseRate && { pulseRate: entry.notes.pulseRate }),
          ...(entry.notes.o2 && { o2: entry.notes.o2 })
        }
      }))

      console.log("Transformed prenatal care data:", transformedPrenatalCare)

      setValue("prenatalCare", transformedPrenatalCare)
      console.log("Prenatal care data set in form as array")

      // Handle forward record logic based on position
      if (selectedStaffId) {
        // Determine status based on staff position
        let forwardStatus = "pending_review"
        let forwardedStatus = "completed"
        
        if (selectedStaffPosition.toUpperCase() === "ADMIN") {
          forwardStatus = "tbc_by_midwife"
          forwardedStatus = "pending"
          console.log("Forwarding to ADMIN staff - setting status to: tbc_by_midwife, forwarded_status to: pending")
        } else if (selectedStaffPosition.toUpperCase() === "DOCTOR") {
          forwardStatus = "check_up"
          forwardedStatus = "completed"
          console.log("Forwarding to DOCTOR staff - setting status to: check_up, forwarded_status to: completed")
        }
        
        // Store forward information in form for backend
        form.setValue("assigned_to", selectedStaffId)
        form.setValue("status", forwardStatus)
        form.setValue("forwarded_status", forwardedStatus)
        
        console.log("Forward record: Staff ID:", selectedStaffId, "Status:", forwardStatus, "Forwarded Status:", forwardedStatus)
      }

      setIsSubmitting(true)
      
      await new Promise(resolve => setTimeout(resolve, 50))

      onSubmit()
      
    } catch (error) {
      console.error("Error in handleFormSubmit:", error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSubmitting(false)
    }
  }


  return (
    <>
      <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
        <Label className="text-black text-opacity-50 italic mb-10">Page 4 of 4</Label>
        <Form {...form}>
          <form onSubmit={e => {e.preventDefault(); setIsConfirmOpen(true);}}>
            <h3 className="text-md font-semibold mt-2 mb-4">PRENATAL CARE</h3>
            <Card className="border rounded-md border-gray p-5">
              <CardContent>
                <div className="flex flex-1 gap-4 mb-7">
                  <FormDateTimeInput
                    control={control}
                    name="prenatalCare.date"
                    label="Date"
                    type="date"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-7">
                  <Label className="text-black/70">Weight</Label>
                  <Label className="text-black/70">Age of Gestation (AOG)</Label>
                  <Label className="text-black/70">BP</Label>

                  <FormInput
                    control={control}
                    name="prenatalCare.wt"
                    label=""
                    placeholder="wt in kg"
                    type="number"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={control}
                      name="prenatalCare.aog.aogWeeks"
                      label=""
                      placeholder="AOG in weeks"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="prenatalCare.aog.aogDays"
                      label=""
                      placeholder="AOG in days"
                      type="number"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormInput
                      control={control}
                      name="prenatalCare.bp.systolic"
                      label=""
                      placeholder="systolic"
                      type="number"
                    />
                    <FormInput
                      control={control}
                      name="prenatalCare.bp.diastolic"
                      label=""
                      placeholder="diastolic"
                      type="number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-7">
                  <FormInput
                    control={control}
                    name="prenatalCare.notes.temp"
                    label="Temperature"
                    placeholder="Temperature in °C"
                  />
                  <FormInput
                    control={control}
                    name="prenatalCare.notes.resRate"
                    label="Respiratory Rate"
                    placeholder="Respiratory Rate in bpm"
                  />
                  <FormInput
                    control={control}
                    name="prenatalCare.notes.pulseRate"
                    label="Pulse Rate"
                    placeholder="Pulse Rate in bpm"
                  />
                  <FormInput
                    control={control}
                    name="prenatalCare.notes.o2"
                    label="Oxygen Saturation"
                    placeholder="O2 in %"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-7">
                  <FormInput
                    control={control}
                    name="prenatalCare.leopoldsFindings.fundalHeight"
                    label="Fundal Height"
                    placeholder="FH in cm"
                  />
                  <FormInput
                    control={control}
                    name="prenatalCare.leopoldsFindings.fetalHeartRate"
                    label="Fetal Heartbeat"
                    placeholder="FHB bpm"
                  />
                  <FormSelect
                    control={control}
                    name="prenatalCare.leopoldsFindings.fetalPosition"
                    label="Fetal Position"
                    options={[
                      { id: "Cephalic", name: "Cephalic" },
                      { id: "Occiput Posterior", name: "Occiput Posterior" },
                      { id: "Breech", name: "Breech" },
                      { id: "Transvere Lie", name: "Transverse Lie" },
                      { id: "Other", name: "Other" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mb-10">
                  <FormTextArea
                    control={control}
                    name="prenatalCare.notes.complaints"
                    label="Complaints"
                    placeholder="Enter complaints"
                  />
                  <FormTextArea
                    control={control}
                    name="prenatalCare.notes.advises"
                    label="Advises"
                    placeholder="Enter advises"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={addPrenatalCare}>
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
            <div className="mt-10 border h-[40rem] overflow-auto">
              <DataTable columns={prenatalCareColumn} data={getAllPrenatalCareData()} />
            </div>
            <div>
              <div className="flex flex-col gap-2 mt-4">
                <Label className="text-sm font-medium">Forward record to</Label>
                <Combobox
                  options={staffOptions}
                  value={staffOptions.find((opt: any) => opt.realId === selectedStaffId)?.id || ""}
                  placeholder={isLoadingStaff ? "Loading staff..." : "Select staff"}
                  emptyMessage="No staff found"
                  onChange={(value:any) => {
                    // Find the realId and position from the selected option
                    const selectedOption = staffOptions.find((opt: any) => opt.id === value)
                    const realStaffId = selectedOption?.realId || value
                    
                    // Extract position from the searchable ID (format: "name position")
                    const fullStaffData = staffsData?.staff.find((staff: any) => String(staff.staff_id) === realStaffId)
                    const position = fullStaffData?.position || fullStaffData?.pos || ""
                    
                    console.log("Selected staff:", value, "Real ID:", realStaffId, "Position:", position)
                    setSelectedStaffId(realStaffId)
                    setSelectedStaffPosition(position)
                  }}
                />
              </div>
            </div>
            <div className="mt-8 sm:mt-10 flex justify-end">
              <Button type="button" variant="outline" className="mt-4 mr-4 w-[120px] bg-transparent" onClick={back}>
                Prev
              </Button>
              <Button type="submit" className="mt-4 mr-4 w-[120px]" disabled={isSubmitting || addPrenatalRecordMutation.isPending}>
                {(addPrenatalRecordMutation.isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>

          <ConfirmationDialog
            isOpen={isConfirmOpen}
            onOpenChange={setIsConfirmOpen}
            title="Prenatal Record Submission"
            description="Are you sure you want to submit this prenatal record?"
            onConfirm={() => handleFormSubmit(new Event("submit") as unknown as React.FormEvent)}
          >
          </ConfirmationDialog>
        </Form>
      </div>
    </>
  )
}