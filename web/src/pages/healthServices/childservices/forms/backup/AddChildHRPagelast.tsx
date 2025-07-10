"use client"
import { useEffect, useMemo, useState, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"
import { DataTable } from "@/components/ui/table/data-table"
import { Button } from "@/components/ui/button/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ChildHealthFormSchema,
  type FormData,
  type NutritionalStatusType,
  type VitalSignType,
  VitalSignSchema,
} from "@/form-schema/chr-schema/chr-schema"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { MedicineDisplay } from "@/components/ui/medicine-display"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"
import { Label } from "@/components/ui/label"
import { NutritionalStatusCalculator } from "../nutritional-status-calculator" // Corrected import path
import { calculateAgeFromDOB } from "@/helpers/mmddwksAgeCalculator" // Corrected import path

export default function LastPage({
  onPrevious,
  onSubmit,
  updateFormData,
  formData,
}: {
  onPrevious: () => void
  onSubmit: (data: FormData) => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}) {
  const [vitalSigns, setVitalSigns] = useState<FormData["vitalSigns"]>(formData.vitalSigns ?? [])
  const [isLowBirthWeight, setIsLowBirthWeight] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [isManualEdit, setIsManualEdit] = useState(false)
  const prevSelectedMedicinesRef = useRef<typeof formData.medicines>()
  // Removed hasFollowUp state
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<VitalSignType | null>(null)
  // Removed editHasFollowUp state
  // Add state to track if vital signs have been added
  const [hasAddedVitalSigns, setHasAddedVitalSigns] = useState(false)
  // Edema severity options
  const [edemaSeverity] = useState([
    { id: "+1", name: "+1" },
    { id: "+2", name: "+2" },
    { id: "+3", name: "+3" },
    { id: "none", name: "none" },
  ])
  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock()

  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: vitalSigns,
      is_anemic: formData.is_anemic || false,
      anemic: formData.anemic || { seen: "", given_iron: "" },
      birthwt: formData.birthwt || { seen: "", given_iron: "" },
      medicines: formData.medicines || [],
      // supplementSummary: formData.supplementSummary || "",
      status: formData.status || "",
      nutritionalStatus: formData.nutritionalStatus || {},
      edemaSeverity: formData.edemaSeverity || "none",
    },
  })

  const vitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      // Corrected: Access .ageString property
      age: formData.childDob ? calculateAgeFromDOB(formData.childDob).ageString : "",
      wt: undefined,
      ht: undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    },
  })

  const editForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: "",
      age: "",
      wt: undefined,
      ht: undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    },
  })

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form

  const selectedMedicines = watch("medicines")
  const currentStatus = watch("status")
  const nutritionalStatus = watch("nutritionalStatus")

  // Check if there's severe malnutrition that requires edema screening
  const hasSevereMalnutrition = useMemo(() => {
    if (!nutritionalStatus) return false
    const { wfa, lhfa, wfh, muac_status } = nutritionalStatus
    return (
      wfa === "SUW" || // Severely Underweight
      lhfa === "SST" || // Severely Stunted
      wfh === "SW" || // Severely Wasted
      muac_status === "SAM" // Severe Acute Malnutrition
    )
  }, [nutritionalStatus])

  // Check if vital signs have been added on component mount
  useEffect(() => {
    if (vitalSigns && vitalSigns.length > 0) {
      setHasAddedVitalSigns(true)
    }
  }, [vitalSigns]) // Added vitalSigns to dependency array

  useEffect(() => {
    const subscription = watch((value: any) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateFormData])

  useEffect(() => {
    const hasLowBirthWeight = vitalSigns?.some((vs: any) => Number.parseFloat(String(vs.wt)) < 2.5) || false
    setIsLowBirthWeight(hasLowBirthWeight)
  }, [vitalSigns])

  // Check if form can be submitted (vital signs required)
  const canSubmit = useMemo(() => {
    return vitalSigns && vitalSigns.length > 0
  }, [vitalSigns])

  // Simplified medicine selection handler
  const handleMedicineSelectionChange = (
    selectedMedicines: {
      minv_id: string
      medrec_qty: number
      reason: string
    }[],
  ) => {
    setIsManualEdit(false)
    setValue("medicines", selectedMedicines)
    // Generate summary with medicine name, dosage, and form
    const summary = selectedMedicines
      .map((selectedMed) => {
        const fullMedicine = medicineStocksOptions?.find((med) => med.id === selectedMed.minv_id)
        if (fullMedicine) {
          return `${fullMedicine.name} (${fullMedicine.dosage}, ${fullMedicine.form}) - Qty: ${selectedMed.medrec_qty} - : ${selectedMed.reason}`
        }
        return `Medicine ID: ${selectedMed.minv_id} (Qty: ${selectedMed.medrec_qty}) - Reason: ${selectedMed.reason}`
      })
      .join("\n")
    updateFormData({
      medicines: selectedMedicines,
    })
  }

  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
    const updatedVitalSigns = [...(vitalSigns ?? [])]
    updatedVitalSigns[index] = values
    setVitalSigns(updatedVitalSigns)
    setValue("vitalSigns", updatedVitalSigns)
    updateFormData({ vitalSigns: updatedVitalSigns })
  }

  const handleAddVitalSign = (values: VitalSignType) => {
    const updatedVitalSigns = [...(vitalSigns ?? []), values]
    setVitalSigns(updatedVitalSigns)
    setValue("vitalSigns", updatedVitalSigns)
    updateFormData({ vitalSigns: updatedVitalSigns })
    // Set the flag to disable the button after adding
    setHasAddedVitalSigns(true)
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: formData.childDob ? calculateAgeFromDOB(formData.childDob).ageString : "", // Ensure age is updated on reset
      wt: undefined,
      ht: undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    })
  }

  const handleDeleteVitalSign = (index: number) => {
    const updatedVitalSigns = [...(vitalSigns ?? [])]
    updatedVitalSigns.splice(index, 1)
    setVitalSigns(updatedVitalSigns)
    setValue("vitalSigns", updatedVitalSigns)
    updateFormData({ vitalSigns: updatedVitalSigns })
    // If all vital signs are deleted, allow adding again
    if (updatedVitalSigns.length === 0) {
      setHasAddedVitalSigns(false)
    }
  }

  const handleNutritionalStatusChange = (status: NutritionalStatusType) => {
    setValue("nutritionalStatus", status)
    updateFormData({ nutritionalStatus: status })
  }

  const handleFormSubmit = handleSubmit(
    (data) => {
      if (!canSubmit) {
        console.error("Cannot submit: No vital signs added")
        return
      }
      console.log("Form validation passed! Submitting data:", data)
      onSubmit(data)
    },
    (errors) => {
      console.error("Form validation failed:", errors)
    },
  )

  const columns = useMemo<ColumnDef<NonNullable<FormData["vitalSigns"]>[number]>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return <FormDateTimeInput control={editForm.control} name="date" label="" type="date" readOnly />
          }
          return row.original.date
        },
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return <FormInput control={editForm.control} name="age" label="" type="text" placeholder="Age" readOnly />
          }
          return row.original.age
        },
      },
      {
        accessorKey: "ht",
        header: "Height (cm)",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return (
              <FormInput
                control={editForm.control}
                name="ht"
                label=""
                type="number"
                placeholder="Height"
                className="w-full"
              />
            )
          }
          return row.original.ht || "-"
        },
      },
      {
        accessorKey: "wt",
        header: "Weight (kg)",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return (
              <FormInput
                control={editForm.control}
                name="wt"
                label=""
                type="number"
                placeholder="Weight"
                className="w-full"
              />
            )
          }
          return <div className="flex justify-center">{row.original.wt || "-"}</div>
        },
      },
      {
        accessorKey: "temp",
        header: "Temp (°C)",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return (
              <FormInput
                control={editForm.control}
                name="temp"
                label=""
                type="number"
                placeholder="Temperature"
                className="w-full"
              />
            )
          }
          return <div className="flex justify-center">{row.original.temp || "-"}</div>
        },
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return (
              <div className="space-y-2 min-w-[250px]">
                <FormTextArea control={editForm.control} name="notes" label="" placeholder="Enter notes" rows={3} />
                {/* Removed Checkbox for "Requires follow-up visit?" */}
                {/* The follow-up fields are now always visible when editing */}
                <>
                  <FormInput
                    control={editForm.control}
                    name="follov_description"
                    label="Follow-up reason" // Added label for clarity
                    type="text"
                    placeholder="Follow-up reason"
                    className="w-full"
                  />
                  <FormDateTimeInput
                    control={editForm.control}
                    name="followUpVisit"
                    label="Follow-up date"
                    type="date"
                  />{" "}
                  {/* Added label for clarity */}
                </>
              </div>
            )
          }
          const notes = row.original.notes || "No notes"
          const followUpVisit = row.original.followUpVisit
            ? `\n- Follow Up: ${row.original.followUpVisit} (${row.original.follov_description || ""})`
            : ""
          return (
            <div className="max-w-[200px] flex justify-center items-center">
              <div className="truncate whitespace-pre-wrap text-center" title={`${notes}${followUpVisit}`}>
                {`${notes}${followUpVisit}`}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return (
              <div className="flex gap-1">
                <Button
                  size="sm"
                  onClick={editForm.handleSubmit((data) => {
                    handleUpdateVitalSign(row.index, data)
                    setEditingRowIndex(null)
                    setEditingData(null)
                    // Removed setEditHasFollowUp(false)
                  })}
                  className="bg-green-600 hover:bg-green-700 px-2 py-1 text-xs"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingRowIndex(null)
                    setEditingData(null)
                    // Removed setEditHasFollowUp(false)
                  }}
                  className="px-2 py-1 text-xs"
                >
                  Cancel
                </Button>
              </div>
            )
          }
          return (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditingRowIndex(row.index)
                  setEditingData({ ...row.original })
                  // Removed setEditHasFollowUp(hasExistingFollowUp)
                  editForm.reset({
                    date: row.original.date,
                    age: row.original.age,
                    wt: row.original.wt,
                    ht: row.original.ht,
                    temp: row.original.temp,
                    follov_description: row.original.follov_description || "",
                    followUpVisit: row.original.followUpVisit || "",
                    notes: row.original.notes || "",
                  })
                }}
                className="px-2 py-1"
              >
                <Pencil size={14} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDeleteVitalSign(row.index)}
                className="px-2 py-1"
              >
                <Trash size={14} />
              </Button>
            </div>
          )
        },
      },
    ],
    [editingRowIndex, editingData, editForm], // Removed editHasFollowUp from dependencies
  )

  return (
    <div className="w-full max-w-6xl my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="text-red-800 font-medium">Form Validation Errors:</h4>
              <pre className="text-red-700 text-sm mt-2">{JSON.stringify(errors, null, 2)}</pre>
            </div>
          )}
          {/* Warning message when no vital signs are added */}
          {!canSubmit && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <h4 className="text-yellow-800 font-medium">⚠️ Required Information Missing</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Please add at least one vital sign record before submitting the form.
              </p>
            </div>
          )}
          {!hasAddedVitalSigns && (
            <div className="p-4 border rounded-lg bg-blue-50">
              <h3 className="font-bold text-lg mb-4">Add New Vital Signs</h3>
              <Form {...vitalSignForm}>
                <div className="space-y-4">
                  <div className="flex gap-2 w-full justify-between">
                    <FormInput
                      control={vitalSignForm.control}
                      name="age"
                      label="Age"
                      type="text"
                      placeholder="Enter age"
                      readOnly
                    />
                    <FormInput
                      control={vitalSignForm.control}
                      name="wt"
                      label="Weight (kg)"
                      type="number"
                      placeholder="Enter weight"
                    />
                    <FormInput
                      control={vitalSignForm.control}
                      name="ht"
                      label="Height (cm)"
                      type="number"
                      placeholder="Enter height"
                    />
                    <FormInput
                      control={vitalSignForm.control}
                      name="temp"
                      label="Temperature (°C)"
                      type="number"
                      placeholder="Enter temperature"
                    />
                  </div>
                  <div className="w-full">
                    <FormTextArea
                      control={vitalSignForm.control}
                      name="notes"
                      label="Notes"
                      placeholder="Enter notes"
                    />
                  </div>
                  {/* Removed Checkbox for "Requires follow-up visit?" */}
                  {/* The follow-up fields are now always visible */}
                  <div className="flex w-full gap-4">
                    <FormInput
                      control={vitalSignForm.control}
                      name="follov_description"
                      label="Follow Up Reason"
                      type="text"
                      placeholder="Enter reason for follow-up"
                      className="w-full"
                    />
                    <FormDateTimeInput
                      control={vitalSignForm.control}
                      name="followUpVisit"
                      label="Follow Up Visit Date"
                      type="date"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      onClick={vitalSignForm.handleSubmit(handleAddVitalSign)}
                      className="bg-green-600 hover:bg-green-700 px-6 py-2"
                    >
                      Add Vital Signs
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}
          <div className="pb-10">
            <h3 className="font-bold text-lg mb-4">Vital Signs Records</h3>
            <Form {...editForm}>
              <DataTable columns={columns} data={vitalSigns || []} />
            </Form>
          </div>
          <div className="mb-10 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-bold text-lg mb-4">Health Status</h3>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Anemia Screening</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={control}
                  name="is_anemic"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!m-0">Is the child anemic?</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watch("is_anemic") && (
                  <>
                    <FormDateTimeInput control={control} name="anemic.seen" label="Date Anemia Detected" type="date" />
                    <FormDateTimeInput control={control} name="anemic.given_iron" label="Date Iron Given" type="date" />
                  </>
                )}
              </div>
            </div>
            {isLowBirthWeight && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">
                  Low Birth Weight Follow-up (Weight:{" "}
                  {vitalSigns?.find((vs: any) => Number.parseFloat(String(vs.wt)) < 2.5)?.wt || "N/A"} kg)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormDateTimeInput control={control} name="birthwt.seen" label="Date Seen" type="date" />
                  <FormDateTimeInput control={control} name="birthwt.given_iron" label="Date Iron Given" type="date" />
                </div>
              </div>
            )}
          </div>
          {/* Conditional Nutritional Status Display */}
          {hasAddedVitalSigns && (
            <div className="mb-10">
              <NutritionalStatusCalculator
                weight={vitalSigns?.[vitalSigns.length - 1]?.wt}
                height={vitalSigns?.[vitalSigns.length - 1]?.ht}
                age={formData.childAge}
                muac={watch("nutritionalStatus")?.muac}
                onStatusChange={handleNutritionalStatusChange}
                initialStatus={watch("nutritionalStatus")}
              />
            </div>
          )}
          {/* Conditional Edema Assessment - Only show when severe malnutrition is detected */}
          {hasSevereMalnutrition && (
            <div className="mt-6 p-4 border border-orange-200 rounded-lg bg-orange-50">
              <h4 className="font-medium mb-4 text-orange-800">
                🚨 Severe Malnutrition Detected - Edema Assessment Required
              </h4>
              <div className="ml-6 p-3">
                <FormSelect
                  control={control}
                  name="edemaSeverity"
                  label="Edema Severity Level"
                  options={edemaSeverity}
                />
              </div>
            </div>
          )}
          <div className="mb-10 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg md:text-xl mb-4">Medicine Prescription</h3>
            <div className="grid grid-cols-1 gap-6">
              {isMedicinesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading medicines...</p>
                  </div>
                </div>
              ) : (
                <MedicineDisplay
                  medicines={medicineStocksOptions || []}
                  initialSelectedMedicines={selectedMedicines || []}
                  onSelectedMedicinesChange={handleMedicineSelectionChange}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
          {/* Healthcare Provider Status Selection */}
          <div className="p-4 border rounded-lg bg-purple-50">
            <h3 className="font-bold text-lg mb-4">Record Purpose & Status</h3>
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Select the purpose of this record:
                  </FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="check-up" id="check-up" />
                        <Label htmlFor="check-up" className="cursor-pointer">
                          Check-up
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immunization" id="immunization" />
                        <Label htmlFor="immunization" className="cursor-pointer">
                          Immunization
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="recorded" id="recorded" />
                        <Label htmlFor="recorded" className="cursor-pointer">
                          Record only
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Status Confirmation */}
            {currentStatus && (
              <div
                className={`mt-4 p-3 rounded border ${
                  currentStatus === "check-up"
                    ? "text-green-600 bg-green-50 border-green-200"
                    : currentStatus === "immunization"
                      ? "text-blue-600 bg-blue-50 border-blue-200"
                      : "text-purple-600 bg-purple-50 border-purple-200"
                }`}
              >
                <strong>Status:</strong>{" "}
                {currentStatus === "check-up"
                  ? "Record prepared for Check-up"
                  : currentStatus === "immunization"
                    ? "Record prepared for Immunization"
                    : "Record only - No further action required"}
              </div>
            )}
            {!currentStatus && (
              <div className="mt-4 text-sm text-gray-500 italic">Please select the purpose for this health record.</div>
            )}
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onPrevious} className="w-[100px] bg-transparent">
              Previous
            </Button>
            <Button type="submit" className="w-[100px]" disabled={!canSubmit}>
              Submit
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
