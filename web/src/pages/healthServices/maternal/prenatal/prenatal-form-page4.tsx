"use client"

import { useFormContext, type UseFormReturn } from "react-hook-form"
import { useNavigate } from "react-router"
import { Form } from "@/components/ui/form/form"
import type { z } from "zod"

import type { PrenatalFormSchema } from "@/form-schema/maternal/prenatal-schema"
import { DataTable } from "@/components/ui/table/data-table"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button/button"
import type { ColumnDef } from "@tanstack/react-table"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { useEffect, useState } from "react"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { Card, CardContent } from "@/components/ui/card/card"
import { useAddPrenatalRecord } from "../queries/maternalAddQueries"

export default function PrenatalFormFourthPq({
  form,
  onSubmit,
  back,
}: {
  form: UseFormReturn<z.infer<typeof PrenatalFormSchema>>
  onSubmit: () => void
  back: () => void
}) {
  const { control, trigger, setValue, getValues } = useFormContext()
  const addPrenatalRecordMutation = useAddPrenatalRecord()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // Watch values from other parts of the form to auto-fill
  const momWt = form.watch("motherPersonalInfo.motherWt")
  const aogWks = form.watch("followUpSchedule.aogWeeks")
  const aogDays = form.watch("followUpSchedule.aogDays")

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
    }
  }

  // Local state to hold the array of added prenatal care entries for the table
  const [prenatalCareData, setPrenatalCareData] = useState<prenatalCareTypes[]>([])

  // date today for initial input value
  const today = new Date().toLocaleDateString("en-CA")

  // DEBUG: Log form state changes
  // useEffect(() => {
  //   console.log("🔍 Form state changed:", {
  //     momWt,
  //     aogWks,
  //     aogDays,
  //     prenatalCareDataLength: prenatalCareData.length,
  //     formErrors: form.formState.errors,
  //     isSubmitting: form.formState.isSubmitting,
  //     isValid: form.formState.isValid
  //   })
  // }, [momWt, aogWks, aogDays, prenatalCareData, form.formState])

  useEffect(() => {
    // Set initial date for the current entry input field
    setValue("prenatalCare.date", today)
    console.log("🔍 Initial date set:", today)
  }, [setValue, today])

  useEffect(() => {
    // Auto-fill Weight and AOG from other pages
    setValue("prenatalCare.wt", momWt !== undefined && momWt !== null ? String(momWt) : "")
    setValue("prenatalCare.aog.aogWeeks", aogWks !== undefined && aogWks !== null ? String(aogWks) : "")
    setValue("prenatalCare.aog.aogDays", aogDays !== undefined && aogDays !== null ? String(aogDays) : "")
    
    console.log("🔍 Auto-filled values:", {
      weight: momWt !== undefined && momWt !== null ? String(momWt) : "",
      aogWeeks: aogWks !== undefined && aogWks !== null ? String(aogWks) : "",
      aogDays: aogDays !== undefined && aogDays !== null ? String(aogDays) : ""
    })
  }, [momWt, aogWks, aogDays, setValue])

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
      advises
    })

    // Manual validation for required fields
    if (
      !date ||
      isNaN(weight) ||
      isNaN(aogWks) ||
      isNaN(aogDays) ||
      isNaN(systolic) ||
      isNaN(diastolic) ||
      weight <= 0 ||
      aogWks < 0 ||
      aogDays < 0 ||
      systolic <= 0 ||
      diastolic <= 0
    ) {
      console.error("❌ Validation failed:", {
        date: !date ? "Date is required" : "OK",
        weight: isNaN(weight) ? "Weight is not a number" : weight <= 0 ? "Weight must be positive" : "OK",
        aogWks: isNaN(aogWks) ? "AOG weeks is not a number" : aogWks < 0 ? "AOG weeks must be non-negative" : "OK",
        aogDays: isNaN(aogDays) ? "AOG days is not a number" : aogDays < 0 ? "AOG days must be non-negative" : "OK",
        systolic: isNaN(systolic) ? "Systolic is not a number" : systolic <= 0 ? "Systolic must be positive" : "OK",
        diastolic: isNaN(diastolic) ? "Diastolic is not a number" : diastolic <= 0 ? "Diastolic must be positive" : "OK"
      })
      return
    }

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
      },
    }

    console.log("✅ New entry created:", newEntry)
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

    console.log("✅ Prenatal care data added successfully. Total entries:", prenatalCareData.length + 1)
  }

  const removePrenatalCareEntry = (index: number) => {
    console.log("🔍 Removing prenatal care entry at index:", index)
    setPrenatalCareData((prev) => prev.filter((_, i) => i !== index))
  }

  const prenatalCareColumn: ColumnDef<prenatalCareTypes>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        return <div className="text-center">{row.original.date}</div>
      },
    },
    {
      accessorKey: "aog",
      header: "AOG",
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {row.original.aog.aogWeeks} wk/s {row.original.aog.aogDays} day/s
          </div>
        )
      },
    },
    {
      accessorKey: "wt",
      header: "Weight",
      cell: ({ row }) => {
        return <div className="text-center">{row.original.wt} kg</div>
      },
    },
    {
      accessorKey: "bp",
      header: "Blood Pressure",
      cell: ({ row }) => {
        return (
          <div className="text-center">
            {row.original.bp.systolic}/{row.original.bp.diastolic}
          </div>
        )
      },
    },
    {
      accessorKey: "leopoldsFindings",
      header: "Leopold's Findings",
      cell: ({ row }) => {
        return (
          <div className="text-center">
            FH: {row.original.leopoldsFindings.fundalHeight || "N/A"},<br />
            FHB: {row.original.leopoldsFindings.fetalHeartRate || "N/A"},<br />
            FP: {row.original.leopoldsFindings.fetalPosition || "N/A"}
          </div>
        )
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        return (
          <div className="text-center">
            Complaint/s: {row.original.notes.complaints || "N/A"} <br />
            Advises: {row.original.notes.advises || "N/A"}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="destructive" onClick={() => removePrenatalCareEntry(row.index)}>
          Remove
        </Button>
      ),
    },
  ]

  const submitFinalForm = async (data: z.infer<typeof PrenatalFormSchema>) => {
    console.log("🚀 Submit button clicked!")
    console.log("🔍 Form data received:", data)
    console.log("🔍 Prenatal care data to submit:", prenatalCareData)
    
    setIsSubmitting(true)

    try {
      // Check if there's any prenatal care data to submit
      if (prenatalCareData.length === 0) {
        console.warn("⚠️ No prenatal care data to submit")
        alert("Please add at least one prenatal care entry before submitting.")
        setIsSubmitting(false)
        return
      }

      // Transform the prenatal care data to match schema expectations
      const transformedPrenatalCare = prenatalCareData.map(entry => ({
        ...entry,
        // Ensure date is in correct format
        date: entry.date,
        // Ensure numbers are properly typed
        wt: Number(entry.wt),
        aog: {
          aogWeeks: Number(entry.aog.aogWeeks),
          aogDays: Number(entry.aog.aogDays)
        },
        bp: {
          systolic: Number(entry.bp.systolic),
          diastolic: Number(entry.bp.diastolic)
        },
        // Optional fields - remove if empty
        leopoldsFindings: {
          ...(entry.leopoldsFindings.fundalHeight && { fundalHeight: entry.leopoldsFindings.fundalHeight }),
          ...(entry.leopoldsFindings.fetalHeartRate && { fetalHeartRate: entry.leopoldsFindings.fetalHeartRate }),
          ...(entry.leopoldsFindings.fetalPosition && { fetalPosition: entry.leopoldsFindings.fetalPosition })
        },
        notes: {
          ...(entry.notes.complaints && { complaints: entry.notes.complaints }),
          ...(entry.notes.advises && { advises: entry.notes.advises })
        }
      }))

      console.log("🔍 Transformed prenatal care data:", transformedPrenatalCare)

      // IMPORTANT: Set the prenatal care data in the form BEFORE validation
      setValue("prenatalCare", transformedPrenatalCare)
      console.log("🔍 Prenatal care data set in form as array")

      // Create the final form data with prenatal care array
      const finalFormData = {
        ...data,
        prenatalCare: transformedPrenatalCare
      }

      console.log("🔍 Final form data prepared:", finalFormData)

      // Trigger validation on the entire form with the updated data
      console.log("🔍 Triggering validation...")
      const isValid = await trigger()
      console.log("🔍 Validation result:", isValid)

      if (isValid) {
        console.log("✅ Form is valid, submitting...")

        // Get the latest form values after setting prenatalCare
        const latestFormData = form.getValues()
        console.log("🔍 Latest form data:", latestFormData)

        addPrenatalRecordMutation.mutate(latestFormData as any, {
          onSuccess: (result) => {
            console.log("✅ Mutation successful:", result)
            onSubmit()
          },
          onError: (error) => {
            console.error("❌ Mutation error:", error)
            alert(`Submission failed: ${error.message || 'Unknown error'}`)
          },
        })
      } else {
        console.error("❌ Form validation failed")
        console.error("🔍 Form errors:", form.formState.errors)
        
        // Show more detailed validation errors
        const errors = form.formState.errors
        if (errors.prenatalCare) {
          console.error("🔍 Prenatal care validation errors:", errors.prenatalCare)
        }
        
        alert("Form validation failed. Please check the form for errors.")
      }
    } catch (error) {
      console.error("❌ Error in submitFinalForm:", error)
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Alternative approach: Handle form submission differently
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setValue("prenatalCare", prenatalCareData)
    
    const formData = form.getValues()
    
    await submitFinalForm(formData)

    // navigate(-1)
    
    console.log("🔍 Form submitted:", formData)
  }

  // Debug: Log mutation state
  useEffect(() => {
    console.log("🔍 Mutation state:", {
      isPending: addPrenatalRecordMutation.isPending,
      isError: addPrenatalRecordMutation.isError,
      error: addPrenatalRecordMutation.error,
      isSuccess: addPrenatalRecordMutation.isSuccess,
    })
  }, [addPrenatalRecordMutation])

  return (
    <>
      <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto">
        <Label className="text-black text-opacity-50 italic mb-10">Page 4 of 4</Label>
        <Form {...form}>
          <form onSubmit={handleFormSubmit}>
            <h3 className="text-md font-semibold mt-2 mb-4">PRENATAL CARE</h3>
            <Card className="border rounded-md border-gray p-5">
              <CardContent>
                <div className="flex mb-3">
                  <FormDateTimeInput
                    control={control}
                    name="prenatalCare.date"
                    label="Date"
                    type="date"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-7">
                  <Label className="text-black/70">Weight</Label>
                  <Label className="text-black/70">AOG</Label>
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
              <DataTable columns={prenatalCareColumn} data={prenatalCareData} />
            </div>
            <div className="mt-8 sm:mt-10 flex justify-end">
              <Button variant="outline" className="mt-4 mr-4 w-[120px] bg-transparent" onClick={back}>
                Prev
              </Button>
              <Button 
                type="submit" 
                className="mt-4 mr-4 w-[120px]"
                disabled={isSubmitting || addPrenatalRecordMutation.isPending}
              >
                {isSubmitting || addPrenatalRecordMutation.isPending ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}