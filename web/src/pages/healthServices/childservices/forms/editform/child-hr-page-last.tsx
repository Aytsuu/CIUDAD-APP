"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData, VitalSignType, NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChildHealthFormSchema, VitalSignSchema } from "@/form-schema/chr-schema/chr-schema"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form" // Corrected import path
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"
import { NutritionalStatusCalculator } from "../nutritional-status-calculator"
import { calculateAgeFromDOB } from "@/helpers/mmddwksAgeCalculator"
import { MedicineDisplay } from "@/components/ui/medicine-display"
import type { Medicine } from "./child-health-record-form"
import type { ColumnDef } from "@tanstack/react-table" // Corrected import for ColumnDef
import { DataTable } from "@/components/ui/table/data-table" // Corrected import path for DataTable
import { Pencil, Activity, Pill, Loader2 } from "lucide-react" // Ensure icons are imported
import { useMemo, useEffect, useState } from "react" // Ensure all hooks are imported
export const NUTRITIONAL_STATUS_DESCRIPTIONS = {
  wfa: {
    N: "Normal",
    UW: "Underweight",
    SUW: "Severely Underweight",
  },
  lhfa: {
    N: "Normal",
    ST: "Stunted",
    SST: "Severely Stunted",
    T: "Tall",
    OB: "Obese",
  },
  wfh: {
    N: "Normal",
    W: "Wasted",
    SW: "Severely Wasted",
    OW: "Overweight",
  },
  muac: {
    N: "Normal",
    MAM: "Moderate Acute Malnutrition",
    SAM: "Severe Acute Malnutrition",
  },
}
const calculateCurrentAge = (birthDate: string) => {
  if (!birthDate) return ""
  return calculateAgeFromDOB(birthDate).ageString
}
const isToday = (dateString: string) => {
  if (!dateString) return false
  const today = new Date().toISOString().split("T")[0]
  const checkDate = dateString.split("T")[0]
  return today === checkDate
}
const getLatestVitalSigns = (vitalSigns: VitalSignType[] | undefined) => {
  if (!vitalSigns || vitalSigns.length === 0) return null
  const sorted = [...vitalSigns].sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
  return sorted[0]
}
interface LastPageProps {
  onPrevious: () => void
  onSubmit: (data: FormData) => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  historicalVitalSigns?: VitalSignType[]
  historicalNutritionalStatus?: NutritionalStatusType[]
  latestHistoricalNoteContent?: string
  latestHistoricalFollowUpDescription?: string
  latestHistoricalFollowUpDate?: string
  historicalMedicines?: Medicine[]
  mode: "newchildhealthrecord" | "edit"
  isSubmitting: boolean // This prop is now correctly managed by parent
}
export default function LastPage({
  onPrevious,
  onSubmit,
  updateFormData,
  formData,
  historicalVitalSigns = [],
  historicalNutritionalStatus = [],
  latestHistoricalNoteContent = "",
  latestHistoricalFollowUpDescription = "",
  latestHistoricalFollowUpDate = "",
  historicalMedicines = [],
  mode,
  isSubmitting, // Use this prop directly
}: LastPageProps) {
  const isEditMode = mode === "edit"
  const currentAge = useMemo(() => calculateCurrentAge(formData.childDob), [formData.childDob])
  const todaysHistoricalRecord = useMemo(() => {
    return historicalVitalSigns.find((vital) => isToday(vital.date))
  }, [historicalVitalSigns])
  const [newVitalSigns, setNewVitalSigns] = useState<VitalSignType[]>(() => {
    if (isEditMode && todaysHistoricalRecord) {
      return [{ ...todaysHistoricalRecord }]
    }
    return []
  })
  const nonTodaysHistoricalVitalSigns = useMemo(() => {
    return historicalVitalSigns.filter((vital) => !isToday(vital.date))
  }, [historicalVitalSigns])
  const combinedVitalSignsForTable = useMemo(() => {
    return newVitalSigns.map((vital, index) => ({
      ...vital,
      originalIndex: index,
    }))
  }, [newVitalSigns])
  
  const shouldHideAddForm = useMemo(() => {
    return isEditMode  && formData.created_at && isToday(formData.created_at)
  }, [newVitalSigns, isEditMode])
  const latestOverallVitalSign = useMemo(() => {
    if (newVitalSigns.length > 0) {
      return newVitalSigns[0]
    }
    return getLatestVitalSigns(historicalVitalSigns)
  }, [newVitalSigns, historicalVitalSigns])
  const [currentPage, setCurrentPage] = useState(1)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<VitalSignType | null>(null)
  const [edemaSeverityOptions] = useState([
    { id: "+1", name: "+1" },
    { id: "+2", name: "+2" },
    { id: "+3", name: "+3" },
    { id: "none", name: "None" },
  ])
  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock()
  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: newVitalSigns,
      // is_anemic: false,
      anemic: { seen: "", given_iron: "" ,     is_anemic: false,date_completed:""
      },
      birthwt: { seen: "", given_iron: "" ,date_completed:""},
      medicines: [],
      status: "recorded",
      nutritionalStatus: {},
      edemaSeverity: "none",
    },
  })
  const vitalSignForm = useForm<VitalSignType>({
    resolver: zodResolver(VitalSignSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestOverallVitalSign?.wt || undefined,
      ht: latestOverallVitalSign?.ht || undefined,
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
  const {
    control: editFormControl,
    setValue: editFormSetValue,
    handleSubmit: editFormHandleSubmit,
    formState: { errors: editFormErrors },
  } = editForm
  const selectedMedicines = watch("medicines")
  const currentStatus = watch("status")
  const nutritionalStatus = watch("nutritionalStatus")
  const chhistCreatedAt = formData.created_at // Get the created_at date from formData
  const shouldHideLowBirthWeightFollowUp = useMemo(() => {
    return isEditMode && chhistCreatedAt && isToday(chhistCreatedAt)
  }, [isEditMode, chhistCreatedAt])
  // Find the latest historical nutritional status if available
  const latestHistoricalNutritionalStatus = useMemo(() => {
    if (!historicalNutritionalStatus || historicalNutritionalStatus.length === 0) return null
    const sorted = [...historicalNutritionalStatus].sort(
      (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
    )
    return sorted[0]
  }, [historicalNutritionalStatus])
  const hasSevereMalnutrition = useMemo(() => {
    // Prioritize the current form's nutritional status if it has data
    const currentNutritionalStatus =
      Object.keys(nutritionalStatus || {}).length > 0 ? nutritionalStatus : latestHistoricalNutritionalStatus // Use the latest historical if current is empty
    if (!currentNutritionalStatus) return false
    const { wfa, lhfa, wfh, muac_status } = currentNutritionalStatus
    return wfa === "SUW" || lhfa === "SST" || wfh === "SW" || muac_status === "SAM"
  }, [nutritionalStatus, latestHistoricalNutritionalStatus])
  useEffect(() => {
    setValue("vitalSigns", newVitalSigns)
    updateFormData({ vitalSigns: newVitalSigns })
  }, [newVitalSigns, setValue, updateFormData])
  useEffect(() => {
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: latestOverallVitalSign?.wt || undefined,
      ht: latestOverallVitalSign?.ht || undefined,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    })
  }, [currentAge, latestOverallVitalSign, vitalSignForm])
  const canSubmit = useMemo(() => {
    return newVitalSigns && newVitalSigns.length > 0
  }, [newVitalSigns])
  const handleMedicineSelectionChange = (
    selectedMedicines: {
      minv_id: string
      medrec_qty: number
      reason: string
    }[],
  ) => {
    const validMedicines = selectedMedicines.filter((med: any) => med.minv_id && med.medrec_qty && med.medrec_qty >= 1)
    setValue("medicines", validMedicines)
    updateFormData({
      medicines: validMedicines,
    })
  }
  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
    const updatedVitalSigns = [...newVitalSigns]
    updatedVitalSigns[index] = values
    setNewVitalSigns(updatedVitalSigns)
    setEditingRowIndex(null)
    setEditingData(null)
  }
  const handleAddVitalSign = (values: VitalSignType) => {
    const updatedVitalSigns = [...newVitalSigns, values]
    setNewVitalSigns(updatedVitalSigns)
    vitalSignForm.reset({
      date: new Date().toISOString().split("T")[0],
      age: currentAge,
      wt: values.wt,
      ht: values.ht,
      temp: undefined,
      follov_description: "",
      followUpVisit: "",
      notes: "",
    })
  }
  const handleDeleteVitalSign = (index: number) => {
    const updatedVitalSigns = [...newVitalSigns]
    updatedVitalSigns.splice(index, 1)
    setNewVitalSigns(updatedVitalSigns)
  }
  const handleNutritionalStatusChange = (status: NutritionalStatusType) => {
    setValue("nutritionalStatus", status)
    updateFormData({ nutritionalStatus: status })
  }
  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Submitting form data:", data)
      console.log("Medicines being submitted from LastPage:", data.medicines)
      if (!canSubmit) {
        console.error("Cannot submit: No vital signs added")
        return
      }
      onSubmit(data) // Call the onSubmit prop from the parent
    },
    (errors) => {
      console.error("Form validation failed:", errors)
    },
  )
  const columns = useMemo<ColumnDef<VitalSignType>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => {
          const isEditing = editingRowIndex === row.index
          if (isEditing) {
            return <FormDateTimeInput control={editFormControl} name="date" label="" type="date" readOnly />
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
            return <FormInput control={editFormControl} name="age" label="" type="text" placeholder="Age" readOnly />
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
                control={editFormControl}
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
                control={editFormControl}
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
                control={editFormControl}
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
              <div className="min-w-[250px] space-y-2">
                <FormTextArea control={editFormControl} name="notes" label="Notes" placeholder="Enter notes" rows={3} />
                <FormInput
                  control={editFormControl}
                  name="follov_description"
                  label="Follow-up reason"
                  type="text"
                  placeholder="Follow-up reason"
                  className="w-full"
                  readOnly={!!row.original.followv_id}
                />
                <FormDateTimeInput
                  control={editFormControl}
                  name="followUpVisit"
                  label="Follow-up date"
                  type="date"
                  readOnly={!!row.original.followv_id}
                />
              </div>
            )
          }
          const displayNotes = row.original.notes || "No notes for this entry."
          return (
            <div className="max-w-[200px] text-left">
              <p className="whitespace-pre-wrap text-sm text-gray-700">{displayNotes}</p>
              {row.original.followUpVisit && (
                <p className="mt-1 text-xs text-gray-500">
                  Follow Up: {row.original.followUpVisit} ({row.original.follov_description || "N/A"})
                </p>
              )}
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
                  onClick={editFormHandleSubmit((data) => {
                    handleUpdateVitalSign(row.index, data)
                  })}
                  className="bg-green-600 px-2 py-1 text-xs hover:bg-green-700"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingRowIndex(null)
                    setEditingData(null)
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
                title={"Edit vital sign"}
              >
                <Pencil size={14} />
              </Button>
            </div>
          )
        },
      },
    ],
    [editingRowIndex, editingData, editFormControl, editFormHandleSubmit, editFormSetValue],
  )
  const historicalMedicineColumns = useMemo<ColumnDef<Medicine>[]>(
    () => [
      {
        accessorKey: "name", // Changed accessorKey to "name"
        header: "Medicine Name",
        cell: ({ row }) => {
          const { name, dosage, dosageUnit, form } = row.original
          return name ? `${name} (${dosage || "N/A"} ${dosageUnit || ""}, ${form || "N/A"})` : "N/A"
        },
      },
      {
        accessorKey: "medrec_qty",
        header: "Quantity",
        cell: ({ row }) => row.original.medrec_qty,
      },
      {
        accessorKey: "reason",
        header: "Reason",
        cell: ({ row }) => row.original.reason || "N/A",
      },
    ],
    [medicineStocksOptions],
  )
  return (
    <div className="bg-white rounded-lg shadow md:p-4 lg:p-8">
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="rounded border border-red-200 bg-red-50 p-4">
              <h4 className="font-medium text-red-800">Form Validation Errors:</h4>
              <pre className="mt-2 text-sm text-red-700">{JSON.stringify(errors, null, 2)}</pre>
            </div>
          )}
          {!canSubmit && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800">⚠️ Required Information Missing</h4>
              <p className="mt-1 text-sm text-yellow-700">
                Please add at least one vital sign record before submitting the form.
              </p>
            </div>
          )}
          {historicalNutritionalStatus && historicalNutritionalStatus.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-green-200 bg-green-50">
              <div className="border-b border-green-200 bg-white px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Activity className="h-4 w-4" />
                  Historical Nutritional Status
                </h3>
              </div>
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        WFA
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        LHFA
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        WFH
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        MUAC
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        MUAC Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Edema
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {historicalNutritionalStatus
                      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
                      .map((status, index) => (
                        <tr key={`nut-stat-${index}`}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.date ? new Date(status.date).toLocaleDateString() : "N/A"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.wfa} -{" "}
                            {NUTRITIONAL_STATUS_DESCRIPTIONS.wfa[
                              status.wfa as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfa
                            ] || "Unknown"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.lhfa} -{" "}
                            {NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa[
                              status.lhfa as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.lhfa
                            ] || "Unknown"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.wfh} -{" "}
                            {NUTRITIONAL_STATUS_DESCRIPTIONS.wfh[
                              status.wfh as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.wfh
                            ] || "Unknown"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{status.muac ?? "N/A"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.muac_status} -{" "}
                            {NUTRITIONAL_STATUS_DESCRIPTIONS.muac[
                              status.muac_status as keyof typeof NUTRITIONAL_STATUS_DESCRIPTIONS.muac
                            ] || "Unknown"}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                            {status.edemaSeverity || "N/A"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {nonTodaysHistoricalVitalSigns && nonTodaysHistoricalVitalSigns.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Historical Vital Signs (Past Dates)</h3>
              </div>
              <div className="p-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Age
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Weight (kg)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Height (cm)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Temp (°C)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {nonTodaysHistoricalVitalSigns
                      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime())
                      .map((vital, index) => (
                        <tr key={`hist-vital-${index}`}>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{vital.date || "N/A"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{vital.age || "N/A"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{vital.wt || "N/A"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{vital.ht || "N/A"}</td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{vital.temp || "N/A"}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            <p className="whitespace-pre-wrap">{vital.notes || "No notes for this entry."}</p>
                            {vital.followUpVisit && (
                              <p className="mt-1 text-xs text-gray-500">
                                Follow Up: {vital.followUpVisit} ({vital.follov_description || "N/A"})
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!shouldHideAddForm && (
            <div className="rounded-lg border bg-blue-50 p-4">
              <h3 className="mb-4 text-lg font-bold">Add New Vital Signs</h3>
              <Form {...vitalSignForm}>
                <div className="space-y-4">
                  <div className="flex w-full justify-between gap-2">
                    <FormInput
                      control={vitalSignForm.control}
                      name="age"
                      label="Age"
                      type="text"
                      placeholder="Current age"
                      readOnly
                      className="bg-gray-100"
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
                      rows={3}
                    />
                  </div>
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
                      className="bg-green-600 px-6 py-2 hover:bg-green-700"
                    >
                      Add Vital Signs
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}
          <div className="pb-10">
            <h3 className="mb-4 text-lg font-bold">Vital Signs Records (Today's Entry)</h3>
            <Form {...editForm}>
              <DataTable columns={columns} data={combinedVitalSignsForTable || []} />
            </Form>
          </div>
          <div className="mb-10 rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-4 text-lg font-bold">Health Status</h3>
            <div className="mb-4">
              <h4 className="mb-2 font-medium">Anemia Screening</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormField
                  control={control}
                  name="anemic.is_anemic"
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
                {watch("anemic.is_anemic") && (
                  <>
                    <FormDateTimeInput control={control} name="anemic.seen" label="Date Anemia Detected" type="date" />
                    <FormDateTimeInput control={control} name="anemic.given_iron" label="Date Iron Given" type="date" />
                  </>
                )}
              </div>
            </div>
            {latestOverallVitalSign &&
              latestOverallVitalSign.wt &&
              Number.parseFloat(String(latestOverallVitalSign.wt)) < 2.5 &&
              !shouldHideLowBirthWeightFollowUp && ( // Apply the new condition here
                <div className="mt-4">
                  <h4 className="mb-2 font-medium">
                    Low Birth Weight Follow-up (Latest Weight: {latestOverallVitalSign.wt} kg)
                  </h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormDateTimeInput control={control} name="birthwt.seen" label="Date Seen" type="date" />
                    <FormDateTimeInput
                      control={control}
                      name="birthwt.given_iron"
                      label="Date Iron Given"
                      type="date"
                    />
                  </div>
                </div>
              )}
            {hasSevereMalnutrition && (
              <div className="mt-6 rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="mb-4 font-medium text-orange-800">
                  🚨 Severe Malnutrition Detected - Edema Assessment Required
                </h4>
                <div className="space-y-4">
                  <div className="ml-6 p-3">
                    <FormSelect
                      control={control}
                      name="edemaSeverity"
                      label="Edema Severity Level"
                      options={edemaSeverityOptions}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {historicalMedicines && historicalMedicines.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Pill className="h-4 w-4" />
                  Historical Medicine Prescriptions
                </h3>
              </div>
              <div className="p-4">
                <DataTable columns={historicalMedicineColumns} data={historicalMedicines} />
              </div>
            </div>
          )}
          <div className="mb-10 rounded-lg border bg-blue-50 p-4">
            <h3 className="mb-4 text-lg font-bold">Medicine Prescription</h3>
            <div className="grid grid-cols-1 gap-6">
              {isMedicinesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mb-2 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 last:mx-auto"></div>
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
          {(latestOverallVitalSign || (newVitalSigns && newVitalSigns.length > 0)) && (
            <div className="mb-10">
              <NutritionalStatusCalculator
                weight={
                  newVitalSigns && newVitalSigns.length > 0
                    ? newVitalSigns[newVitalSigns.length - 1].wt
                    : latestOverallVitalSign?.wt
                }
                height={
                  newVitalSigns && newVitalSigns.length > 0
                    ? newVitalSigns[newVitalSigns.length - 1].ht
                    : latestOverallVitalSign?.ht
                }
                age={currentAge}
                muac={watch("nutritionalStatus")?.muac}
                onStatusChange={handleNutritionalStatusChange}
                initialStatus={watch("nutritionalStatus")}
              />
            </div>
          )}
          <div className="mb-10 rounded-lg border bg-purple-50 p-4">
            <h3 className="mb-4 text-lg font-bold">Record Purpose & Status</h3>
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
            {currentStatus && (
              <div
                className={`mt-4 rounded border p-3 ${
                  currentStatus === "check-up"
                    ? "border-green-200 bg-green-50 text-green-600"
                    : currentStatus === "immunization"
                      ? "border-blue-200 bg-blue-50 text-blue-600"
                      : "border-purple-200 bg-purple-50 text-purple-600"
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
              <div className="mt-4 text-sm italic text-gray-500">Please select the purpose for this health record.</div>
            )}
          </div>
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onPrevious} className="w-[100px] bg-transparent">
              Previous
            </Button>
            <Button
              type="submit"
              className="w-[100px]"
              disabled={!canSubmit || isSubmitting} // Use the isSubmitting prop
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : isEditMode ? (
                "Update Record"
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
