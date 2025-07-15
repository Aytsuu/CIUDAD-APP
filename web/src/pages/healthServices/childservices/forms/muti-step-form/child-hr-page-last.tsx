"use client"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button/button" // Corrected import path
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { FormData, VitalSignType, NutritionalStatusType } from "@/form-schema/chr-schema/chr-schema"
import type { CHSSupplementStat } from "./types"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ChildHealthFormSchema, VitalSignSchema } from "@/form-schema/chr-schema/chr-schema"
import { Form, FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { fetchMedicinesWithStock } from "@/pages/healthServices/medicineservices/restful-api/fetchAPI"
import { NutritionalStatusCalculator } from "../nutritional-status-calculator"
import { calculateAgeFromDOB } from "@/helpers/mmddwksAgeCalculator"
import { MedicineDisplay } from "@/components/ui/medicine-display"
import type { Medicine } from "./types"
import { DataTable } from "@/components/ui/table/data-table"
import { Activity, Pill, Loader2, AlertTriangle } from "lucide-react"
import { useMemo, useEffect, useState } from "react"
import { z } from "zod"
import {
  createHistoricalNutritionalStatusColumns,
  createHistoricalVitalSignsColumns,
  createTodaysVitalSignsColumns,
  createHistoricalMedicineColumns,
  createHistoricalSupplementStatusColumns,
} from "./columns"
import { edemaSeverityOptions } from "./options"

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
  historicalSupplementStatuses: CHSSupplementStat[]
  onUpdateHistoricalSupplementStatus: (updatedStatuses: CHSSupplementStat[]) => void
  latestHistoricalNoteContent?: string
  latestHistoricalFollowUpDescription?: string
  latestHistoricalFollowUpDate?: string
  historicalMedicines?: Medicine[]
  mode: "newchildhealthrecord" | "addnewchildhealthrecord" | "immunization"
  isSubmitting: boolean
}

export default function LastPage({
  onPrevious,
  onSubmit,
  updateFormData,
  formData,
  historicalVitalSigns = [],
  historicalNutritionalStatus = [],
  historicalSupplementStatuses: historicalSupplementStatusesProp = [], // Rename here
  onUpdateHistoricalSupplementStatus,
  latestHistoricalNoteContent = "",
  latestHistoricalFollowUpDescription = "",
  latestHistoricalFollowUpDate = "",
  historicalMedicines = [],
  mode,
  isSubmitting,
}: LastPageProps) {
  const isaddnewchildhealthrecordMode = mode === "addnewchildhealthrecord"
  const isImmunizationMode = mode === "immunization"
  const [currentPage, setCurrentPage] = useState(1)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [editingData, setEditingData] = useState<VitalSignType | null>(null)
  const [editingAnemiaIndex, setEditingAnemiaIndex] = useState<number | null>(null)
  const [editingBirthWeightIndex, setEditingBirthWeightIndex] = useState<number | null>(null)
  const { medicineStocksOptions, isLoading: isMedicinesLoading } = fetchMedicinesWithStock()

  const currentAge = useMemo(() => calculateCurrentAge(formData.childDob), [formData.childDob])

  // Find today's vital sign record from historical data
  const todaysHistoricalRecord = useMemo(() => {
    return historicalVitalSigns.find((vital) => isToday(vital.date))
  }, [historicalVitalSigns])

  // newVitalSigns will hold the vital signs for the *current* session/today's entry
  const [newVitalSigns, setNewVitalSigns] = useState<VitalSignType[]>(() => {
    // If in update mode and there's an existing vital sign for today, pre-fill it
    if (isaddnewchildhealthrecordMode && todaysHistoricalRecord) {
      return [{ ...todaysHistoricalRecord }]
    }
    return [] // Otherwise, start with an empty array for new entries
  })

  const nonTodaysHistoricalVitalSigns = useMemo(() => {
    return historicalVitalSigns.filter((vital) => !isToday(vital.date))
  }, [historicalVitalSigns])

  // Combined vital signs for the "Today's Entry" table (will contain newVitalSigns)
  const combinedVitalSignsForTable = useMemo(() => {
    return newVitalSigns.map((vital, index) => ({
      ...vital,
      originalIndex: index, // Used for editing/deleting in the table
    }))
  }, [newVitalSigns])

  // Add this to your existing state declarations
  const [hasAddedVitalSign, setHasAddedVitalSign] = useState<boolean>(() => {
    // If in addnewchildhealthrecord mode and there's a vital sign for today, hide the form
    return isaddnewchildhealthrecordMode && !!todaysHistoricalRecord
  })

  // Modify the shouldShowAddVitalSignsForm useMemo
  const shouldShowAddVitalSignsForm = useMemo(() => {
    return !hasAddedVitalSign // Hide form if a vital sign has been added
  }, [hasAddedVitalSign])

  // Determine if Health Status and Nutritional sections should be shown
  const shouldShowGeneralHealthSections = useMemo(() => {
    // These sections are relevant if we are not in immunization mode
    return !isImmunizationMode
  }, [isImmunizationMode])

  // Updated to show nutritional status calculator when vital signs are present
  const shouldShowNutritionalStatusCalculator = useMemo(() => {
    if (isImmunizationMode) return false
    const hasTodayVitalSign = todaysHistoricalRecord || (newVitalSigns.length > 0 && isToday(newVitalSigns[0].date))
    return hasTodayVitalSign && shouldShowGeneralHealthSections
  }, [isImmunizationMode, todaysHistoricalRecord, newVitalSigns, shouldShowGeneralHealthSections])

  const latestOverallVitalSign = useMemo(() => {
    if (newVitalSigns.length > 0) {
      return newVitalSigns[0] // If new vital signs are added, use the first one (assuming only one for today)
    }
    return getLatestVitalSigns(historicalVitalSigns) // Otherwise, get the latest from all historical
  }, [newVitalSigns, historicalVitalSigns])

  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: newVitalSigns, // Ensure form's vitalSigns reflect newVitalSigns state
      anemic: formData.anemic || {
        seen: "",
        given_iron: "",
        is_anemic: false,
        date_completed: "",
      },
      birthwt: formData.birthwt || {
        seen: "",
        given_iron: "",
        date_completed: "",
      },
      medicines: formData.medicines || [],
      status: formData.status || "recorded",
      nutritionalStatus: formData.nutritionalStatus || {},
      edemaSeverity: formData.edemaSeverity || "None",
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
      followv_status: "pending",
      notes: "",
    },
  })

  const editVitalSignForm = useForm<VitalSignType>({
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

  const supplementStatusEditForm = useForm<{ date_completed: string | null }>({
    resolver: zodResolver(z.object({ date_completed: z.string().nullable().optional() })),
    defaultValues: { date_completed: null },
  })

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = form
  const {
    control: editVitalSignFormControl,
    setValue: editVitalSignFormSetValue,
    handleSubmit: editVitalSignFormHandleSubmit,
    formState: { errors: editVitalSignFormErrors },
  } = editVitalSignForm

  const selectedMedicines = watch("medicines")
  const currentStatus = watch("status")
  const nutritionalStatus = watch("nutritionalStatus")
  const chhistCreatedAt = formData.created_at

  const shouldHideLowBirthWeightFollowUp = useMemo(() => {
    return isImmunizationMode || (newVitalSigns.length === 0 && !todaysHistoricalRecord)
  }, [isImmunizationMode, newVitalSigns.length, todaysHistoricalRecord])

  const latestHistoricalNutritionalStatus = useMemo(() => {
    if (!historicalNutritionalStatus || historicalNutritionalStatus.length === 0) return null
    const sorted = [...historicalNutritionalStatus].sort(
      (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
    )
    return sorted[0]
  }, [historicalNutritionalStatus])

  const hasSevereMalnutrition = useMemo(() => {
    if (newVitalSigns.length === 0) return false // Only show if new vital signs are added
    const currentNutritionalStatus = nutritionalStatus // This 'nutritionalStatus' is updated by NutritionalStatusCalculator based on newVitalSigns
    if (!currentNutritionalStatus) return false
    const { wfa, lhfa, wfh, muac_status } = currentNutritionalStatus
    return wfa === "SUW" || lhfa === "SST" || wfh === "SW" || muac_status === "SAM"
  }, [nutritionalStatus, newVitalSigns.length])

  // REMOVE this local state, as the prop is now the source of truth for the table
  // const [historicalSupplementStatuses, setHistoricalSupplementStatuses] = useState<CHSSupplementStat[]>([])

  // REMOVE this useEffect, as the prop is now directly used in the table and synced with form
  // useEffect(() => {
  //   setHistoricalSupplementStatuses(historicalSupplementStatusesProp) // Rename prop to avoid shadowing
  // }, [historicalSupplementStatusesProp]) // Depend on the prop

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

  // ADD THIS NEW useEffect to synchronize the form's historicalSupplementStatuses
  useEffect(() => {
    setValue("historicalSupplementStatuses", historicalSupplementStatusesProp)
  }, [historicalSupplementStatusesProp, setValue])

  const canSubmit = useMemo(() => {
    // Can submit if there's at least one vital sign for today's entry
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
    // If there's already a vital sign for today, update it instead of adding a new one
    if (newVitalSigns.length > 0) {
      handleUpdateVitalSign(0, values) // Assuming only one "today's" vital sign
    } else {
      setNewVitalSigns([values]) // Add as the first (and only) today's vital sign
      setHasAddedVitalSign(true) // Set flag to hide the form
    }
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

  const handleNutritionalStatusChange = (status: NutritionalStatusType) => {
    setValue("nutritionalStatus", status)
    updateFormData({ nutritionalStatus: status })
  }

  const handleSaveAnemiaDate = (index: number, newDateCompleted: string | null) => {
    const updatedStatuses = [...historicalSupplementStatusesProp];
    if (index >= 0 && index < updatedStatuses.length) {
      updatedStatuses[index] = {
        ...updatedStatuses[index],
        date_completed: newDateCompleted
      };
      onUpdateHistoricalSupplementStatus(updatedStatuses);
    }
    setEditingAnemiaIndex(null);
  };
  
  const handleSaveBirthWeightDate = (index: number, newDateCompleted: string | null) => {
    const updatedStatuses = [...historicalSupplementStatusesProp];
    if (index >= 0 && index < updatedStatuses.length) {
      updatedStatuses[index] = {
        ...updatedStatuses[index],
        date_completed: newDateCompleted
      };
      onUpdateHistoricalSupplementStatus(updatedStatuses);
    }
    setEditingBirthWeightIndex(null);
  };

  const handleFormSubmit = handleSubmit(
    (data) => {
      console.log("Submitting form data:", data)
      console.log("Medicines being submitted from LastPage:", data.medicines)
      if (!canSubmit) {
        console.error("Cannot submit: No vital signs added")
        return
      }
      onSubmit(data)
    },
    (errors) => {
      console.error("Form validation failed:", errors)
    },
  )

  // Use the imported column definitions
  const historicalNutritionalStatusColumns = useMemo(() => createHistoricalNutritionalStatusColumns(), [])
  const historicalVitalSignsColumns = useMemo(() => createHistoricalVitalSignsColumns(), [])
  const columns = useMemo(
    () =>
      createTodaysVitalSignsColumns(
        editingRowIndex,
        editVitalSignFormControl,
        editVitalSignFormHandleSubmit,
        handleUpdateVitalSign,
        (index, data) => {
          setEditingRowIndex(index)
          setEditingData(data)
        },
        () => {
          setEditingRowIndex(null)
          setEditingData(null)
        },
        editVitalSignForm.reset,
      ),
    [editingRowIndex, editVitalSignFormControl, editVitalSignFormHandleSubmit, editVitalSignForm.reset],
  )
  const historicalMedicineColumns = useMemo(() => createHistoricalMedicineColumns(), [])
  const historicalSupplementStatusColumns = useMemo(
    () =>
      createHistoricalSupplementStatusColumns(
        editingAnemiaIndex,
        editingBirthWeightIndex,
        supplementStatusEditForm.control,
        supplementStatusEditForm.handleSubmit,
        handleSaveAnemiaDate,
        handleSaveBirthWeightDate,
        (index, currentDate) => {
          setEditingAnemiaIndex(index)
          supplementStatusEditForm.reset({ date_completed: currentDate })
        },
        (index, currentDate) => {
          setEditingBirthWeightIndex(index)
          supplementStatusEditForm.reset({ date_completed: currentDate })
        },
        () => setEditingAnemiaIndex(null),
        () => setEditingBirthWeightIndex(null),
        supplementStatusEditForm.reset,
      ),
    [
      editingAnemiaIndex,
      editingBirthWeightIndex,
      supplementStatusEditForm.control,
      supplementStatusEditForm.handleSubmit,
      supplementStatusEditForm.reset,
    ],
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
          {!canSubmit && shouldShowAddVitalSignsForm && (
            <div className="rounded border border-yellow-200 bg-yellow-50 p-4">
              <h4 className="font-medium text-yellow-800">⚠️ Required Information Missing</h4>
              <p className="mt-1 text-sm text-yellow-700">
                Please add at least one vital sign record before submitting the form.
              </p>
            </div>
          )}
          {/* Historical Nutritional Status Table */}
          {historicalNutritionalStatus && historicalNutritionalStatus.length > 0 && (
            <div className="overflow-hidden rounded-lg border">
              <div className=" px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Activity className="h-4 w-4" />
                  Historical Nutritional Status
                </h3>
              </div>
              <div className="">
                <DataTable
                  columns={historicalNutritionalStatusColumns}
                  data={historicalNutritionalStatus.sort(
                    (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
                  )}
                />
              </div>
            </div>
          )}
          {/* Historical Supplement Statuses Table */}
          {historicalSupplementStatusesProp && // Use the prop directly here
            historicalSupplementStatusesProp.length > 0 && (
              <div className="overflow-hidden rounded-lg border ">
                <div className="px-4 py-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Pill className="h-4 w-4" />
                    Historical Supplement Statuses (Anemia & Low Birth Weight)
                  </h3>
                </div>
                <div className="">
                  <DataTable
                    columns={historicalSupplementStatusColumns}
                    data={historicalSupplementStatusesProp} // Use the prop directly here
                  />
                </div>
              </div>
            )}
          {/* Historical Vital Signs Table */}
          {nonTodaysHistoricalVitalSigns && nonTodaysHistoricalVitalSigns.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Historical Vital Signs (Past Dates)</h3>
              </div>
              <div>
                <DataTable
                  columns={historicalVitalSignsColumns}
                  data={nonTodaysHistoricalVitalSigns.sort(
                    (a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime(),
                  )}
                />
              </div>
            </div>
          )}
          {/* Today's Entry Table (shows newVitalSigns) */}
          {newVitalSigns.length > 0 && (
            <div className=" pt-4">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="text-sm font-semibold text-gray-700">Today's Entry</h3>
              </div>
              <Form {...editVitalSignForm}>
                {" "}
                {/* Use editVitalSignForm for editing */}
                <DataTable columns={columns} data={combinedVitalSignsForTable || []} />
              </Form>
            </div>
          )}
          {/* Show "Add New Vital Signs" form based on shouldShowAddVitalSignsForm */}
          {shouldShowAddVitalSignsForm && (
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
          {/* Health Status Section */}
          {shouldShowGeneralHealthSections && (
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
                      <FormDateTimeInput
                        control={control}
                        name="anemic.seen"
                        label="Date Anemia Detected"
                        type="date"
                      />
                      <FormDateTimeInput
                        control={control}
                        name="anemic.given_iron"
                        label="Date Iron Given"
                        type="date"
                      />
                    </>
                  )}
                </div>
              </div>
              {latestOverallVitalSign &&
                latestOverallVitalSign.wt &&
                Number.parseFloat(String(latestOverallVitalSign.wt)) < 2.5 &&
                !shouldHideLowBirthWeightFollowUp && (
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
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="mb-2 font-medium text-red-800">Severe Malnutrition Detected</h4>
                      <p className="text-sm text-red-700">
                        This child shows signs of severe malnutrition. Please assess for edema and provide appropriate
                        intervention.
                      </p>
                      <div className="mt-3 ml-3 p-3">
                        <FormSelect
                          control={control}
                          name="edemaSeverity"
                          label="Edema Severity Level"
                          options={edemaSeverityOptions}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Nutritional Status Calculator - Now shown when vital signs are present */}
          {shouldShowNutritionalStatusCalculator && (
            <div className="mb-10 rounded-lg border bg-green-50 p-4">
              <h3 className="mb-4 text-lg font-bold">Nutritional Status</h3>
              <NutritionalStatusCalculator
                weight={newVitalSigns.length > 0 ? newVitalSigns[0].wt : latestOverallVitalSign?.wt}
                height={newVitalSigns.length > 0 ? newVitalSigns[0].ht : latestOverallVitalSign?.ht}
                age={currentAge}
                muac={watch("nutritionalStatus")?.muac}
                onStatusChange={handleNutritionalStatusChange}
                initialStatus={watch("nutritionalStatus")}
              />
            </div>
          )}
          {/* Historical Medicine Prescriptions */}
          {historicalMedicines && historicalMedicines.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="border-b border-gray-200 bg-white px-4 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Pill className="h-4 w-4" />
                  Historical Medicine Prescriptions
                </h3>
              </div>
              <div>
                <DataTable columns={historicalMedicineColumns} data={historicalMedicines} />
              </div>
            </div>
          )}
          {/* Medicine Prescription */}
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
          {/* Record Purpose & Status */}
          {!isImmunizationMode && (
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
                <div className="mt-4 text-sm italic text-gray-500">
                  Please select the purpose for this health record.
                </div>
              )}
            </div>
          )}
          {/* Form Navigation */}
          <div className="flex w-full justify-end gap-2">
            <Button type="button" variant="outline" onClick={onPrevious} className="w-[100px] bg-transparent">
              Previous
            </Button>
            <Button type="submit" className="w-[100px]" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </div>
              ) : isaddnewchildhealthrecordMode ? (
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
