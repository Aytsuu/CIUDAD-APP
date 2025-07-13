"use client"
import { useEffect } from "react"
import type React from "react"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormMessage, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form/form"
import { Button } from "@/components/ui/button/button"
import { calculateAge, calculateAgeFromDOB } from "@/helpers/ageCalculator"
import { FormInput } from "@/components/ui/form/form-input"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { PatientSearch } from "@/components/ui/patientSearch" // Assuming this component exists
import { useLocalStorage } from "@/helpers/useLocalStorage" // Assuming this hook exists
import type { Patient } from "@/components/ui/patientSearch" // Assuming this type exists
import type { FormData } from "@/form-schema/chr-schema/chr-schema"
import { BasicInfoSchema } from "@/form-schema/chr-schema/chr-schema"

// Define initial form data
 const initialFormData: FormData = {
  familyNo: "",
  pat_id: "",
  rp_id: "",
  trans_id: "",
  ufcNo: "",
  childFname: "",
  childLname: "",
  childMname: "",
  childSex: "",
  childDob: "",
  birth_order: 1,
  placeOfDeliveryType: "Home",
  placeOfDeliveryLocation: "",
  childAge: "",
  residenceType: "Resident",
  motherFname: "",
  motherLname: "",
  motherMname: "",
  motherAge: "",
  motherdob: "",
  motherOccupation: "",
  fatherFname: "",
  fatherLname: "",
  fatherMname: "",
  fatherAge: "",
  fatherdob: "",
  fatherOccupation: "",
  address: "",
  landmarks: "",
  dateNewbornScreening: "",
  disabilityTypes: [],
  edemaSeverity: "none",
  BFdates: [],
  vitalSigns: [],
  medicines: [],
  anemic: {
    seen: "",
    given_iron: "",
    is_anemic: false,
    date_completed: "",
  },
  birthwt: {
    seen: "",
    given_iron: "",
    date_completed:""
  },
  status: "recorded",
  type_of_feeding: "",
  tt_status: "",
  nutritionalStatus: {
    wfa: "",
    lhfa: "",
    wfh: "",
    muac: undefined,
    muac_status: "",
  },
}
type Page1Props = {
  onNext: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode: "newchildhealthrecord" | "addnewchildhealthrecord" | "immunization"
}

const PATIENT_STORAGE_KEY = "selectedPatient"

export default function ChildHRPage1({ onNext, updateFormData, formData, mode }: Page1Props) {
  const isaddnewchildhealthrecordMode =  mode === "immunization" || mode =="addnewchildhealthrecord"
  const [selectedPatient, setSelectedPatient] = useLocalStorage<Patient | null>(PATIENT_STORAGE_KEY, null)

  const form = useForm<FormData>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onChange",
    defaultValues: formData, // Initialize with formData from parent
  })

  const { handleSubmit, watch, setValue, reset, control, formState, setError, clearErrors } = form
  const { errors, isValid, isSubmitting, isDirty } = formState

  const residenceType = watch("residenceType")
  const isTransient = residenceType === "Transient"
  const childDob = watch("childDob")
  const motherdob = watch("motherdob")
  const fatherdob = watch("fatherdob")
  const placeOfDeliveryType = watch("placeOfDeliveryType")
  const placeOfDeliveryLocation = watch("placeOfDeliveryLocation")

  // Reset form when formData changes (this is the key fix for addnewchildhealthrecord mode)
  useEffect(() => {
    if (isaddnewchildhealthrecordMode && formData && Object.keys(formData).length > 0) {
      console.log("🔄 ChildHRPage1: Resetting form with data (addnewchildhealthrecord Mode):", formData)
      reset(formData)
    } else if (!isaddnewchildhealthrecordMode && !selectedPatient) {
      // In add mode, if no patient selected, clear form
      console.log("🔄 ChildHRPage1: Resetting form (Add Mode, no patient selected)")
      reset(initialFormData)
    }
  }, [formData, reset, isaddnewchildhealthrecordMode, selectedPatient])

  // Handle age calculations
  useEffect(() => {
    if (childDob) {
      const age = calculateAgeFromDOB(childDob).ageString
      setValue("childAge", age, { shouldValidate: true })
    } else {
      setValue("childAge", "", { shouldValidate: true })
    }
    if (motherdob) {
      const age = calculateAge(motherdob)
      setValue("motherAge", age.toString(), { shouldValidate: true })
    } else {
      setValue("motherAge", "", { shouldValidate: true })
    }
    if (fatherdob) {
      const age = calculateAge(fatherdob)
      setValue("fatherAge", age.toString(), { shouldValidate: true })
    } else {
      setValue("fatherAge", "", { shouldValidate: true })
    }
  }, [childDob, motherdob, fatherdob, setValue])

  // Add validation for HC location
  useEffect(() => {
    if (placeOfDeliveryType === "HC") {
      if (!placeOfDeliveryLocation || placeOfDeliveryLocation.trim() === "") {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        })
      } else {
        clearErrors("placeOfDeliveryLocation")
      }
    } else {
      clearErrors("placeOfDeliveryLocation")
    }
  }, [placeOfDeliveryType, placeOfDeliveryLocation, setError, clearErrors])

  // Update parent form data on change
  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<FormData>)
    })
    return () => subscription.unsubscribe()
  }, [watch, updateFormData])

  const populatePatientData = (patient: Patient) => {
    const newFormData: Partial<FormData> = {
      pat_id: patient.pat_id?.toString() || "",
      familyNo: patient.family?.fam_id || "",
      ufcNo: "N/A", // Default for existing patients
      childFname: patient.personal_info?.per_fname || "",
      childLname: patient.personal_info?.per_lname || "",
      childMname: patient.personal_info?.per_mname || "",
      childSex: patient.personal_info?.per_sex || "",
      childDob: patient.personal_info?.per_dob || "",
      residenceType: patient.pat_type || "Resident",
      address: patient.address?.full_address || "No address provided",
      landmarks:   "",
      trans_id: patient.trans_id || "",
      rp_id: patient.rp_id?.rp_id || "",
      birth_order: 1, // Default, can be updated manually
      placeOfDeliveryType: "Home", // Default, can be updated manually
      placeOfDeliveryLocation: "", // Default, can be updated manually
      motherFname: "",
      motherLname: "",
      motherMname: "",
      motherdob: "",
      motherAge: "",
      motherOccupation: "",
      fatherFname: "",
      fatherLname: "",
      fatherMname: "",
      fatherdob: "",
      fatherAge: "",
      fatherOccupation: "",
    }

    if (patient.personal_info?.per_dob) {
      newFormData.childAge = calculateAgeFromDOB(patient.personal_info.per_dob).ageString
    }

    if (patient.pat_type !== "Transient") {
      const motherInfo = patient.family_head_info?.family_heads?.mother?.personal_info
      if (motherInfo) {
        newFormData.motherFname = motherInfo.per_fname || ""
        newFormData.motherLname = motherInfo.per_lname || ""
        newFormData.motherMname = motherInfo.per_mname || ""
        newFormData.motherdob = motherInfo.per_dob || ""
        if (motherInfo.per_dob) {
          newFormData.motherAge = calculateAge(motherInfo.per_dob).toString()
        }
      }
      const fatherInfo = patient.family_head_info?.family_heads?.father?.personal_info
      if (fatherInfo) {
        newFormData.fatherFname = fatherInfo.per_fname || ""
        newFormData.fatherLname = fatherInfo.per_lname || ""
        newFormData.fatherMname = fatherInfo.per_mname || ""
        newFormData.fatherdob = fatherInfo.per_dob || ""
        if (fatherInfo.per_dob) {
          newFormData.fatherAge = calculateAge(fatherInfo.per_dob).toString()
        }
      }
    }
    reset(newFormData)
    updateFormData(newFormData)
  }

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatient(patient)
    if (patient) {
      populatePatientData(patient)
    } else {
      // If patient is unselected, reset form to initial state for add mode
      reset(initialFormData)
      updateFormData(initialFormData)
    }
  }

  const onSubmitForm = async (data: FormData) => {
    try {
      if (
        data.placeOfDeliveryType === "HC" &&
        (!data.placeOfDeliveryLocation || data.placeOfDeliveryLocation.trim() === "")
      ) {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        })
        return
      }
      console.log("PAGE 1 submitted data:", data)
      updateFormData(data)
      onNext()
    } catch (error) {
      console.error("Form submission error:", error)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleSubmit(onSubmitForm, (errors) => {
      console.error("Form validation errors:", errors)
    })(e)
  }

  return (
    <>
      {!isaddnewchildhealthrecordMode && (
        <div className="flex items-center justify-between gap-3 mb-10 w-full">
          <div className="flex-1">
            <PatientSearch onPatientSelect={handlePatientSelect} className="w-full" />
          </div>
        </div>
      )}
      <div className="bg-white rounded-lg shadow md:p-4 lg:p-8">
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6 md:p-6 lg:p-8" noValidate>
            <div className="flex w-full flex-wrap gap-4">
              <div className="flex justify-end gap-4 w-full">
                <FormInput
                  control={control}
                  name="residenceType"
                  label="Residence Type"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                  className="w-[200px]"
                />
              </div>
              <div className="flex justify-end gap-4 w-full">
                <FormInput
                  control={control}
                  name="familyNo"
                  label="Family No:"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                  className="w-[200px]"
                />
                <FormInput
                  control={control}
                  name="ufcNo"
                  label="UFC No:"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                  className="w-[200px]"
                />
                {isTransient && (
                  <FormInput
                    control={control}
                    name="trans_id"
                    label="Transient ID:"
                    type="text"
                    readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                    className="w-[200px]"
                  />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">Child's Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={control}
                  name="childFname"
                  label="First Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                />
                <FormInput
                  control={control}
                  name="childLname"
                  label="Last Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                />
                <FormInput
                  control={control}
                  name="childMname"
                  label="Middle Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || !!selectedPatient}
                />
                <FormField
                  control={control}
                  name="childSex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          disabled={isaddnewchildhealthrecordMode || !!selectedPatient}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormDateTimeInput
                  control={control}
                  name="childDob"
                  label="Date of Birth"
                  type="date"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput control={control} name="childAge" label="Age" type="text" readOnly className="bg-gray-100" />
                <FormInput
                  control={control}
                  name="birth_order"
                  label="Birth Order"
                  type="number"
                  min={1}
                  max={20}
                  readOnly={isaddnewchildhealthrecordMode}
                />
                <div className="sm:col-span-2 lg:col-span-3">
                  <FormField
                    control={control}
                    name="placeOfDeliveryType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Place of Delivery</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex flex-col space-y-1"
                            disabled={isaddnewchildhealthrecordMode}
                          >
                            {["Hospital Gov't/Private", "Home", "Private Clinic", "HC"].map((option) => (
                              <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={option} />
                                </FormControl>
                                <FormLabel className="font-normal">{option}</FormLabel>
                              </FormItem>
                            ))}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {placeOfDeliveryType === "HC" && (
                    <FormField
                      control={control}
                      name="placeOfDeliveryLocation"
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Specify Location (HC)</FormLabel>
                          <FormControl>
                            <input
                              {...field}
                              type="text"
                              placeholder="e.g., Barangay Health Center"
                              disabled={isaddnewchildhealthrecordMode}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">Mother's Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={control}
                  name="motherFname"
                  label="First Name"
                  placeholder="Enter First Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="motherLname"
                  label="Last Name"
                  placeholder="Enter Last Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="motherMname"
                  label="Middle Name"
                  placeholder="Enter Middle Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormDateTimeInput
                  control={control}
                  name="motherdob"
                  label="Date of Birth"
                  type="date"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="motherAge"
                  label="Age"
                  type="text"
                  readOnly
                  className="bg-gray-100"
                />
                <FormInput
                  control={control}
                  name="motherOccupation"
                  label="Occupation"
                  placeholder="Enter Occupation"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">Father's Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormInput
                  control={control}
                  name="fatherFname"
                  label="First Name"
                  placeholder="Enter First Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="fatherLname"
                  placeholder="Enter Last Name"
                  label="Last Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="fatherMname"
                  label="Middle Name"
                  placeholder="Enter Middle Name"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormDateTimeInput
                  control={control}
                  name="fatherdob"
                  label="Date of Birth"
                  type="date"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="fatherAge"
                  label="Age"
                  type="text"
                  readOnly
                  className="bg-gray-100"
                />
                <FormInput
                  control={control}
                  name="fatherOccupation"
                  label="Occupation"
                  placeholder="Enter Occupation"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="font-bold text-lg text-darkBlue2 mt-10">Address</h2>
              <div className="grid grid-cols-1 gap-4">
                <FormInput
                  control={control}
                  name="address"
                  label="Complete Address"
                  type="text"
                  readOnly={isaddnewchildhealthrecordMode || (!isTransient && !!selectedPatient)}
                />
                <FormInput
                  control={control}
                  name="landmarks"
                  label="Landmarks"
                  type="text"
                  placeholder="Enter landmarks"
                  readOnly={isaddnewchildhealthrecordMode}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="w-full sm:w-[100px]" >
                {isSubmitting ? "Loading..." : "Next"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  )
}
