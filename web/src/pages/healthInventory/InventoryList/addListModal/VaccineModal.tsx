"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { Combobox } from "@/components/ui/combobox"
import { Button } from "@/components/ui/button/button"
import { VaccineSchema, type VaccineType } from "@/form-schema/inventory/lists/inventoryListSchema"
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal"
import { Label } from "@/components/ui/label"
import { Pill, Loader2 } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSubmitVaccine } from "../queries/Antigen/VaccinePostQueries"
import { useUpdateVaccine } from "../queries/Antigen/VaccinePutQueries"
import { getVaccineList } from "../restful-api/Antigen/fetchAPI"
import { toast } from "sonner"
import { FormSelect } from "@/components/ui/form/form-select"
import { getAgegroup } from "@/pages/healthServices/agegroup/restful-api/agepostAPI"
import CardLayout from "@/components/ui/card/card-layout"

const timeUnits = [
  { id: "years", name: "Years" },
  { id: "months", name: "Months" },
  { id: "weeks", name: "Weeks" },
  { id: "days", name: "Days" },
]

const vaccineTypes = [
  { id: "routine", name: "Routine" },
  { id: "primary", name: "Primary Series" },
  { id: "conditional", name: "Conditional" },
]

interface DoseDetail {
  id?: number
  doseNumber: number
  interval?: number
  unit?: string
  vacInt_id?: number
  routineF_id?: number
}

export interface VaccineData {
  id: number
  vaccineName: string
  vaccineType: string
  ageGroup: string
  doses: number | string
  specifyAge: string
  noOfDoses?: number | string
  doseDetails: DoseDetail[]
  category: string
  agegrp_id: string
}

export const fetchAgeGroups = async () => {
  try {
    const response = await getAgegroup()
    const ageGroupData = Array.isArray(response) ? response : []
    return {
      default: ageGroupData,
      formatted: ageGroupData.map((ageGroup: any) => ({
        id: String(ageGroup.agegrp_id), // Simplified ID format
        name: `${ageGroup.agegroup_name} (${ageGroup.min_age}-${ageGroup.max_age} ${ageGroup.time_unit})`,
        originalData: ageGroup,
      })),
    }
  } catch (error) {
    console.error("Error fetching age groups:", error)
    toast.error("Failed to load age groups")
    throw error
  }
}

const isDuplicateVaccineList = (vaccineList: any[], newVaccineName: string) => {
  return vaccineList.some((vac) => vac.vac_name.trim().toLowerCase() === newVaccineName.trim().toLowerCase())
}

const isDuplicateVaccine = (vaccineList: any[], vaccineName: string, currentVaccineId?: number) => {
  return vaccineList.some(
    (vac) => vac.vac_id !== currentVaccineId && vac.vac_name.trim().toLowerCase() === vaccineName.trim().toLowerCase(),
  )
}

export default function AddVaccinationList() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [formData, setFormData] = useState<VaccineType | null>(null)
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const { mutateAsync: submitVaccine, isPending: isSubmitting } = useSubmitVaccine()
  const { mutateAsync: updateVaccine, isPending: isUpdating } = useUpdateVaccine()
  const navigate = useNavigate()
  const location = useLocation()

  const { state } = location

  // Determine mode and initial data from location state
  const mode = state?.mode || "add"
  const initialData = state?.initialData

  // For edit mode, get initial data from props or location state
  const vaccineData = initialData || location.state?.initialData
  const isEditMode = mode === "edit"

  const [ageGroups, setAgeGroups] = useState<{
    default: any[]
    formatted: { id: string; name: string }[]
  }>({ default: [], formatted: [] })
  const [loadingAgeGroups, setLoadingAgeGroups] = useState(false)
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>(
    isEditMode && vaccineData?.agegrp_id && vaccineData.agegrp_id !== "N/A" ? String(vaccineData.agegrp_id) : "",
  )

  // Initialize form with default values
  const defaultFormData: VaccineType =
    isEditMode && vaccineData
      ? {
          vaccineName: vaccineData.vaccineName,
          noOfDoses:
            vaccineData.noOfDoses === "N/A"
              ? vaccineData.vaccineType === "Conditional"
                ? 0
                : 1
              : Number(vaccineData.noOfDoses),
          ageGroup: selectedAgeGroupId,
          type:
            vaccineData.vaccineType === "Routine"
              ? "routine"
              : vaccineData.vaccineType === "Conditional"
                ? "conditional"
                : "primary",
          intervals: vaccineData.doseDetails
            .filter((dose: any) => dose.doseNumber > 1)
            .map((dose: any) => dose.interval || 0),
          timeUnits: vaccineData.doseDetails
            .filter((dose: any) => dose.doseNumber > 1)
            .map((dose: any) => dose.unit || "months"),
          routineFrequency: {
            interval: (vaccineData.vaccineType === "Routine" && vaccineData.doseDetails[0]?.interval) || 1,
            unit: (vaccineData.vaccineType === "Routine" && vaccineData.doseDetails[0]?.unit) || "years",
          },
        }
      : {
          vaccineName: "",
          intervals: [],
          timeUnits: [],
          noOfDoses: 1,
          ageGroup: "",
          type: "routine",
          routineFrequency: {
            interval: 1,
            unit: "years",
          },
        }

  const form = useForm<VaccineType>({
    resolver: zodResolver(VaccineSchema),
    defaultValues: defaultFormData,
    mode: "onChange",
  })

  const {
    watch,
    setValue,
    control,
    handleSubmit,
    formState: { errors, isValid },
    getValues,
  } = form

  const [type, noOfDoses, ageGroup] = watch(["type", "noOfDoses", "ageGroup"])

  // Fetch age groups on component mount
  useEffect(() => {
    const loadAgeGroups = async () => {
      setLoadingAgeGroups(true)
      try {
        const data = await fetchAgeGroups()
        setAgeGroups(data)
        if (isEditMode && vaccineData?.agegrp_id && vaccineData.agegrp_id !== "N/A") {
          const ageGroupId = String(vaccineData.agegrp_id)
          const matchingGroup = data.formatted.find((group) => group.id.split(",")[0] === ageGroupId)

          if (matchingGroup) {
            setSelectedAgeGroupId(ageGroupId)
            form.setValue("ageGroup", ageGroupId, {
              shouldDirty: false,
            })
          } else {
            console.log("[v0] Age group not found in formatted list:", ageGroupId)
            setSelectedAgeGroupId("")
            form.setValue("ageGroup", "")
            toast.warning("Initial age group not found; please select a valid age group")
          }
        }
      } catch (error) {
        toast.error("Failed to load age groups: " + (error instanceof Error ? error.message : "Unknown error"))
      } finally {
        setLoadingAgeGroups(false)
      }
    }
    loadAgeGroups()
  }, [isEditMode, form]) // Removed vaccineData?.agegrp_id dependency to prevent unnecessary re-runs

  const handleAgeGroupSelection = (id: string) => {
    setSelectedAgeGroupId(id)
    form.setValue("ageGroup", id, { shouldDirty: true })
  }

  useEffect(() => {
    if (noOfDoses < watch("noOfDoses") || type !== watch("type")) {
      setValue("intervals", [])
      setValue("timeUnits", [])
    }
    if (type === "routine") {
      setValue("noOfDoses", 1)
    }
    if (type === "conditional") {
      setValue("noOfDoses", 0)
    }
  }, [noOfDoses, type, setValue, watch])

  const hasFormChanged = () => {
    if (!isEditMode) return true

    const currentValues = getValues()
    const initialValues = defaultFormData

    // Convert both values to string for consistent comparison
    const currentAgeGroup = String(currentValues.ageGroup || "")
    const initialAgeGroup = String(initialValues.ageGroup || "")

    return (
      currentValues.vaccineName !== initialValues.vaccineName ||
      currentValues.type !== initialValues.type ||
      currentValues.noOfDoses !== initialValues.noOfDoses ||
      currentAgeGroup !== initialAgeGroup ||
      JSON.stringify(currentValues.intervals) !== JSON.stringify(initialValues.intervals) ||
      JSON.stringify(currentValues.timeUnits) !== JSON.stringify(initialValues.timeUnits) ||
      currentValues.routineFrequency?.interval !== initialValues.routineFrequency?.interval ||
      currentValues.routineFrequency?.unit !== initialValues.routineFrequency?.unit
    )
  }

  const handleFormSubmit = async (data: VaccineType) => {
    if (isEditMode && !hasFormChanged()) {
      toast.info("No changes detected")
      return
    }

    setIsCheckingDuplicate(true)
    try {
      const existingVaccineList = await getVaccineList()
      if (!Array.isArray(existingVaccineList)) {
        throw new Error("Invalid API response - expected an array")
      }

      const isDuplicate = isEditMode
        ? isDuplicateVaccine(existingVaccineList, data.vaccineName, vaccineData?.vac_id || vaccineData?.id)
        : isDuplicateVaccineList(existingVaccineList, data.vaccineName)

      if (isDuplicate) {
        form.setError("vaccineName", {
          type: "manual",
          message: "This vaccine already exists",
        })
        return
      }
    } catch (error) {
      toast.error("Failed to verify vaccine", {
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
      return
    } finally {
      setIsCheckingDuplicate(false)
    }

    setFormData(data)
    setIsConfirmOpen(true)
  }

  const confirmAction = async () => {
    if (!formData) return
    setIsConfirmOpen(false)

    if (isEditMode) {
      await updateVaccine({
        formData: {
          ...formData,
          ageGroup: selectedAgeGroupId,
        },
        vaccineData: {
          ...vaccineData,
          agegrp_id: selectedAgeGroupId,
        },
      })
    } else {
      await submitVaccine(formData)
    }
  }

  const renderDoseFields = () => {
    if (type === "routine") {
      return (
        <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Routine vaccine frequency</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              control={control}
              name="routineFrequency.interval"
              label="Repeat Every"
              type="number"
              placeholder="e.g., 1"
            />
            <FormSelect control={control} name="routineFrequency.unit" label="Frequency Unit" options={timeUnits} />
          </div>
        </div>
      )
    }

    if (type === "conditional") {
      const selectedAgeGroup = ageGroups.default.find(
        (group) => group.agegrp_id.toString() === (isEditMode ? selectedAgeGroupId : ageGroup.split(",")[0]),
      )
      return (
        <div className="space-y-3 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700">Conditional vaccine details</p>
          <div className="bg-white p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vaccine Name:</span>
                <span className="text-sm font-medium">{watch("vaccineName") || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Age Group:</span>
                <span className="text-sm font-medium">
                  {selectedAgeGroup
                    ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})`
                    : "Not selected"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Conditional</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-yellow-800">Note: Administered based on healthcare provider assessment.</p>
        </div>
      )
    }

    return Array.from({ length: noOfDoses }).map((_, doseIndex) => {
      const doseNumber = doseIndex + 1
      const isFirstDose = doseIndex === 0
      const showInterval = doseIndex > 0

      const getDoseLabel = () => {
        const selectedAgeGroup = ageGroups.default.find(
          (group) => group.agegrp_id.toString() === (isEditMode ? selectedAgeGroupId : ageGroup.split(",")[0]),
        )

        const ageGroupLabel = selectedAgeGroup
          ? `${selectedAgeGroup.agegroup_name} (${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age} ${selectedAgeGroup.time_unit})`
          : "selected age group"

        if (isFirstDose) {
          return `First dose for ${ageGroupLabel}`
        }

        const interval = watch(`intervals.${doseIndex - 1}`)
        const timeUnit = watch(`timeUnits.${doseIndex - 1}`)
        return interval && timeUnit ? `Dose ${doseNumber} after ${interval} ${timeUnit}` : `Dose ${doseNumber}`
      }

      return (
        <div key={doseIndex} className="space-y-3 bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm font-medium text-gray-700">{getDoseLabel()}</p>
          {showInterval && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                control={control}
                name={`intervals.${doseIndex - 1}`}
                label="Interval After Previous Dose"
                type="number"
                placeholder="e.g., 4"
              />
              <FormSelect control={control} name={`timeUnits.${doseIndex - 1}`} label="Time Unit" options={timeUnits} />
            </div>
          )}
        </div>
      )
    })
  }

  const isSaveButtonDisabled = () => {
    const values = getValues()
    const hasRequiredFields = values.vaccineName && values.ageGroup && values.type

    if (!hasRequiredFields) return true
    if (isEditMode && !hasFormChanged()) return true
    if (isCheckingDuplicate || isSubmitting || isUpdating) return true

    return false
  }

  return (
    <div className="flex items-center justify-center">
      <CardLayout
        cardClassName="max-w-2xl w-full p-4"
        content={
          <>
            <div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-8">
                  <Pill className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Vaccine" : "Add Vaccine"}</h2>
                </div>
              </div>
              <Form {...form}>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormInput
                        control={control}
                        name="vaccineName"
                        label="Vaccine Name"
                        placeholder="Enter vaccine name"
                      />
                      <div>
                        <Label className="text-darkGray">Age Group</Label>
                        <Combobox
                          options={ageGroups.formatted}
                          value={loadingAgeGroups ? "" : isEditMode ? selectedAgeGroupId : ageGroup}
                          onChange={isEditMode ? handleAgeGroupSelection : (id) => form.setValue("ageGroup", id)}
                          triggerClassName="w-full mt-2"
                          placeholder={loadingAgeGroups ? "Loading..." : "Select age group"}
                          emptyMessage={
                            <div className="text-center">
                              <p className="text-sm text-gray-600">No age groups found.</p>
                              <Link to="/age-group-management" className="text-sm text-teal-600 hover:underline">
                                Add New Age Group
                              </Link>
                            </div>
                          }
                        />
                        {errors.ageGroup && <p className="text-red-500 text-xs mt-1">{errors.ageGroup.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormSelect control={control} name="type" label="Vaccine Type" options={vaccineTypes} />
                      {type !== "conditional" && (
                        <FormInput
                          control={control}
                          name="noOfDoses"
                          label="Required Doses"
                          type="number"
                          placeholder="e.g., 1"
                        />
                      )}
                    </div>
                    {type === "routine" && <p className="text-sm text-gray-500">Routine vaccines require 1 dose.</p>}
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Dose Schedule</h2>
                    {renderDoseFields()}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    <Button variant="outline" type="button" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSaveButtonDisabled()}
                      title={
                        !getValues().vaccineName || !getValues().ageGroup || !getValues().type
                          ? "Please fill in all required fields"
                          : isEditMode && !hasFormChanged()
                            ? "No changes detected"
                            : ""
                      }
                    >
                      {isCheckingDuplicate ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking...
                        </>
                      ) : isSubmitting || isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? "Updating..." : "Submitting..."}
                        </>
                      ) : isEditMode ? (
                        "Update"
                      ) : (
                        "Submit"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
              <ConfirmationDialog
                isOpen={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={confirmAction}
                title={`Confirm Vaccine ${isEditMode ? "Update" : "Addition"}`}
                description={`Are you sure you want to ${isEditMode ? "update" : "add"} the vaccine "${watch(
                  "vaccineName",
                )}"?`}
              />
            </div>
          </>
        }
      />
    </div>
  )
}
