"use client"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import api  from "../api/api"

type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
}

export default function FamilyPlanningForm({ onNext2, updateFormData, formData }: Page1Props) {
  const form = useForm<FormData>({
    // resolver: zodResolver(page1Schema),
    defaultValues: formData,
    values: formData,
    mode: "onBlur",
  })

  interface PatientRecord {
    clientID: string
    per_id: string
    per_fname: string
    per_lname: string
    per_mname: string
    per_dob: string
    per_age: string
    per_sex: string
    per_address: string
    per_edAttainment: string
    // street: string
    // sitio: string
    // barangay: string
    // city: string
    // province: string
    // pat_type: string
    per_religion: string
  }

  interface FormattedPatient {
    id: string
    name: string
  }

  const [patients, setPatients] = useState<{
    default: PatientRecord[]
    formatted: { id: string; name: string }[]
  }>({ default: [], formatted: [] })

  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [loading, setLoading] = useState(false)

  // Fetch patient records
  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        // const response = await api.get("/health-profiling/personal/")
        // const patientData = response.data

        // Make sure we're mapping the data correctly based on the API response
        const formatted = patientData.map((patient: PatientRecord) => ({
          id: patient.per_id.toString(),
          name: `${patient.per_lname}, ${patient.per_fname} ${patient.per_mname || ""}`.trim(),
        }))

        setPatients({
          default: patientData,
          formatted,
        })
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast.error("Failed to load patient records")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Update the handlePatientSelection function
  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id)
    const selectedPatient = patients.default.find((patient) => patient.per_id.toString() === id)

    if (selectedPatient) {
      // Store the patient ID and information in the form data
      const patientData = {
        per_id: selectedPatient.per_id,
        clientID: selectedPatient.clientID || "",
        lastName: selectedPatient.per_lname,
        givenName: selectedPatient.per_fname,
        middleInitial: selectedPatient.per_mname || "",
        dateOfBirth: selectedPatient.per_dob,
        age: calculateAge(selectedPatient.per_dob),
        educationalAttainment: selectedPatient.per_edAttainment,
        address: {
          ...formData.address,
          // Since per_address is a single field in the API but split in your form
          // You might need to parse it or use it as is
          street: selectedPatient.per_address || "",
        },
      }

      updateFormData(patientData)

      // For debugging:
      console.log("Patient data loaded:", selectedPatient)
      console.log("Updated form data with patient ID:", patientData.per_id)
    }
  }

  const CLIENT_TYPES = [
    { id: "newacceptor", name: "New Acceptor" },
    { id: "currentuser", name: "Current User" },
  ]

  const SUB_CLIENT_TYPES = [
    { id: "changingmethod", name: "Changing Method" },
    { id: "changingclinic", name: "Changing Clinic" },
    { id: "dropoutrestart", name: "Dropout/Restart" },
  ]

  const REASON_FOR_FP_OPTIONS = [
    { id: "spacing", name: "Spacing" },
    { id: "limiting", name: "Limiting" },
    { id: "fp_others", name: "Others" },
  ]

  const REASON_OPTIONS = [
    { id: "medicalcondition", name: "Medical Condition" },
    { id: "sideeffects", name: "Side Effects" },
  ]

  const METHOD_OPTIONS = [
    { id: "COC", name: "COC" },
    { id: "POP", name: "POP" },
    { id: "Injectable", name: "Injectable" },
    { id: "Implant", name: "Implant" },
    { id: "IUD-Interval", name: "IUD-Interval" },
    { id: "IUD-Post Partum", name: "IUD-Post Partum" },
    { id: "Condom", name: "Condom" },
    { id: "BOM/CMM", name: "BOM/CMM" },
    { id: "BBT", name: "BBT" },
    { id: "STM", name: "STM" },
    { id: "SDM", name: "SDM" },
    { id: "LAM", name: "LAM" },
    { id: "Others", name: "Others" },
  ]

  const EDUCATION_OPTIONS = [
    { id: "Elementary", name: "Elementary" },
    { id: "High School", name: "High School" },
    { id: "Senior High School", name: "Senior High School" },
    { id: "College level", name: "College level" },
    { id: "College Graduate", name: "College Graduate" },
  ]

  const INCOME_OPTIONS = [
    { id: "lower", name: "Lower than 5,000" },
    { id: "5,000-10,000", name: "5,000-10,000" },
    { id: "10,000-30,000", name: "10,000-30,000" },
    { id: "30,000-50,000", name: "30,000-50,000" },
    { id: "50,000-80,000", name: "50,000-80,000" },
    { id: "80,000-100,000", name: "80,000-100,000" },
    { id: "100,000-200,000", name: "100,000-200,000" },
    { id: "higher", name: "Higher than 200,000" },
  ]

  // Calculate age matic
  const calculateAge = (birthDate: string): number => {
    const today = new Date()
    const birthDateObj = new Date(birthDate)

    let age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }

    return age
  }

  // Track date of birth and compute age
  const dateOfBirth = form.watch("dateOfBirth")
  const [computedAge, setComputedAge] = useState<number | null>(null)

  const location = useLocation()
  // const recordType = location.state?.recordType || "nonExistingPatient"
  const navigate = useNavigate()

  useEffect(() => {
    if (dateOfBirth) {
      const age = calculateAge(dateOfBirth)
      setComputedAge(age)
      form.setValue("age", age)
    } else {
      setComputedAge(null)
      form.setValue("age", 0)
    }
  }, [dateOfBirth, form])

  // Spouse compute age by date of birth
  const spouseDOB = form.watch("spouse.s_dateOfBirth")
  const [spouseAge, setSpouseAge] = useState<number | null>(null)

  useEffect(() => {
    if (spouseDOB) {
      const age = calculateAge(spouseDOB)
      setSpouseAge(age)
      form.setValue("spouse.s_age", age)
    } else {
      setSpouseAge(null)
      form.setValue("spouse.s_age", 0)
    }
  }, [spouseDOB, form])

  // Watch values for conditional rendering
  const typeOfClient = form.watch("typeOfClient")
  const subTypeOfClient = form.watch("subTypeOfClient")
  const isNewAcceptor = typeOfClient === "newacceptor"
  const isCurrentUser = typeOfClient === "currentuser"
  const isChangingMethod = isCurrentUser && subTypeOfClient === "changingmethod"

  useEffect(() => {
    if (isNewAcceptor) {
      form.setValue("reason", "")
      form.setValue("methodCurrentlyUsed", undefined)
      form.setValue("otherMethod", "")
    } else if (isCurrentUser) {
      form.setValue("reasonForFP", "")
      if (!isChangingMethod) {
        form.setValue("reason", "")
        form.setValue("methodCurrentlyUsed", undefined)
        form.setValue("otherMethod", "")
      }
    }
  }, [typeOfClient, subTypeOfClient, form, isNewAcceptor, isCurrentUser, isChangingMethod])

  const onSubmit = async (data: FormData) => {
    updateFormData(data)
    onNext2()
  }

  const saveFormData = () => updateFormData(form.getValues())
  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 p-4 text-center">Family Planning (FP) Form 1</h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-4 space-y-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <strong className="text-lg">FAMILY PLANNING CLIENT ASSESSMENT RECORD</strong>
              <p className="mt-2">
                Instructions for Physicians, Nurses, and Midwives.{" "}
                <strong>Make sure that the client is not pregnant by using the questions listed in SIDE B.</strong>{" "}
                Completely fill out or check the required information. Refer accordingly for any abnormal
                history/findings for further medical evaluation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between w-full">
              <div className="grid gap-2">
                <Combobox
                  options={patients.formatted}
                  value={selectedPatientId}
                  onChange={(value) => {
                    handlePatientSelection(value)
                  }}
                  placeholder={loading ? "Loading patients..." : "Select a patient"}
                  triggerClassName="font-normal w-[30rem]"
                  emptyMessage={
                    <div className="flex gap-2 justify-center items-center">
                      <Label className="font-normal text-[13px]">{loading ? "Loading..." : "No patient found."}</Label>
                      <Link to="/patient-records/new">
                        <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                          Register New Patient
                        </Label>
                      </Link>
                    </div>
                  }
                />
              </div>

              <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
                <FormField
                  control={form.control}
                  name="isTransient"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "transient"}
                          onCheckedChange={(checked) => {
                            field.onChange(checked ? "transient" : "resident")
                          }}
                        />
                      </FormControl>
                      <FormLabel className="leading-none">Transient</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormInput control={form.control} name="clientID" label="CLIENT ID:" />
              {/* rules={{ required: "Client ID is required" }}  */}
              <FormInput control={form.control} name="philhealthNo" label="PHILHEALTH NO:" />

              {/* NHTS Checkbox */}
              <FormField
                control={form.control}
                name="nhts_status"
                render={({ field }) => (
                  <FormItem className="ml-5 mt-2 flex flex-col">
                    <Label className="mb-2">NHTS?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={() => field.onChange(true)} />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 4Ps Checkbox */}
              <FormField
                control={form.control}
                name="pantawid_4ps"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label className="mb-2 mt-2">Pantawid Pamilya Pilipino (4Ps)</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={() => field.onChange(true)} />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Name and Basic Info Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="lastName"
                label="NAME OF CLIENT"
                placeholder="Last name"
                className="col-span-1"
              />
              <FormInput
                control={form.control}
                label=""
                name="givenName"
                placeholder="Given name"
                className="col-span-1 mt-6"
              />
              <FormInput
                control={form.control}
                name="middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 mt-6"
              />
              <FormDateTimeInput control={form.control} type="date" name="dateOfBirth" label="Date of Birth:" />
              <FormInput
                control={form.control}
                name="age"
                label="Age"
                type="number"
                readOnly
                value={computedAge || ""}
                className="col-span-1"
              />
              <FormSelect
                control={form.control}
                name="educationalAttainment"
                label="Educational Attainment"
                options={EDUCATION_OPTIONS}
              />
              <FormInput
                control={form.control}
                name="occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1 sm:col-span-2 md:col-span-1"
              />
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <FormInput control={form.control} name="" label="ADDRESS" placeholder="No." className="col-span-1" />
              <FormInput
                control={form.control}
                name="address.street"
                label=""
                placeholder="Street"
                className="col-span-1 mt-6"
              />
              <FormInput
                control={form.control}
                name="address.barangay"
                placeholder="Barangay"
                label=""
                className="col-span-1 mt-6"
              />
              <FormInput
                control={form.control}
                name="address.municipality"
                placeholder="Municipality/City"
                label=""
                className="col-span-1 mt-6"
              />
              <FormInput
                control={form.control}
                name="address.province"
                placeholder="Province"
                label=""
                className="col-span-1 mt-6"
              />
            </div>

            {/* Spouse Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="spouse.s_lastName"
                label="NAME OF SPOUSE"
                placeholder="Last name"
                className="col-span-1"
              />
              <FormInput
                control={form.control}
                name="spouse.s_givenName"
                label=""
                placeholder="Given name"
                className="col-span-1 mt-6"
              />
              <FormInput
                control={form.control}
                name="spouse.s_middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 mt-6"
              />
              <FormDateTimeInput control={form.control} type="date" name="spouse.s_dateOfBirth" label="Date of Birth" />
              <FormInput
                control={form.control}
                name="spouse.s_age"
                label="Age"
                type="number"
                readOnly
                value={spouseAge || ""}
                className="col-span-1"
              />
              <FormInput
                control={form.control}
                name="spouse.s_occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1"
              />
            </div>

            {/* Children and Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="numOfLivingChildren"
                label="NO. OF LIVING CHILDREN"
                type="number"
              />
              <FormField
                control={form.control}
                name="planToHaveMoreChildren"
                render={({ field }) => (
                  <FormItem className="flex flex-col mt-3 ml-5">
                    <Label className="mb-2">PLAN TO HAVE MORE CHILDREN?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          className="border"
                          checked={field.value}
                          onCheckedChange={() => field.onChange(true)}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="border ml-4"
                          checked={!field.value}
                          onCheckedChange={() => field.onChange(false)}
                        />
                      </FormControl>
                      <Label>No</Label>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormSelect
                control={form.control}
                name="averageMonthlyIncome"
                label="AVERAGE MONTHLY INCOME"
                options={INCOME_OPTIONS}
              />
            </div>

            {/* Client Type and Methods Section */}
            <div className="border border-t-black w-full p-4 rounded-md mt-6">
              <div className="grid grid-cols-12 gap-6">
                {/* Type of Client Section */}
                <div className="col-span-3">
                  <h3 className="font-semibold mb-3">
                    Type of Client<span className="text-red-500 ml-1">*</span>
                  </h3>
                  <FormSelect control={form.control} name="typeOfClient" options={CLIENT_TYPES} />

                  {isCurrentUser && (
                    <div className="mt-4">
                      <FormSelect
                        control={form.control}
                        name="subTypeOfClient"
                        label="Sub Type of Client"
                        options={SUB_CLIENT_TYPES}
                      />
                    </div>
                  )}
                </div>

                {/* Middle Column - Reasons */}
                <div className="col-span-4 space-y-6">
                  {/* Reason for FP Section - only show for New Acceptor */}
                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="reasonForFP"
                      label="Reason for Family Planning"
                      options={REASON_FOR_FP_OPTIONS}
                    />
                  )}

                  {/* Show specify reason field when "Others" is selected as reason for FP */}
                  {isNewAcceptor && form.watch("reasonForFP") === "fp_others" && (
                    <FormInput control={form.control} name="otherReasonForFP" label="Specify Reason:" />
                  )}

                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="reason"
                      label="Reason (Current User)"
                      options={REASON_OPTIONS}
                    />
                  )}

                  {/* Show specify side effects field when "Side Effects" is selected as reason */}
                  {isChangingMethod && form.watch("reason") === "sideeffects" && (
                    <FormInput control={form.control} name="otherReason" label="Specify Side Effects:" />
                  )}
                </div>

                {/* Right Column - Methods */}
                <div className="col-span-5">
                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="methodCurrentlyUsed"
                      label="Method currently used (for Changing Method):"
                      options={METHOD_OPTIONS}
                    />
                  )}

                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="methodCurrentlyUsed"
                      label="Method Accepted (New Acceptor)"
                      options={[
                        { id: "Pills", name: "Pills" },
                        { id: "DMPA", name: "DMPA" },
                        { id: "Condom", name: "Condom" },
                        { id: "IUD-Interval", name: "IUD-Interval" },
                        { id: "IUD-Post Partum", name: "IUD-Post Partum" },
                        { id: "Implant", name: "Implant" },
                        { id: "Lactating Amenorrhea", name: "Lactating Amenorrhea" },
                        { id: "Bilateral Tubal Ligation", name: "Bilateral Tubal Ligation" },
                        { id: "Vasectomy", name: "Vasectomy" },
                        { id: "Source", name: "Source of FP Method (pls. specify) e.g. Buying,HC,etc) " },
                      ]}
                    />
                  )}

                   {(() => {
                    const methodUsed = form.watch("methodCurrentlyUsed")
                    return (
                      (methodUsed === "Others" || methodUsed === "Source") && (
                        <FormInput
                          control={form.control}
                          name="otherMethod"
                          className="mt-6"
                          label={methodUsed === "Source" ? "Specify FP Method:" : "Specify other method:"}
                        />
                      )
                    )
                  })()}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                onClick={async () => {
                  const isValid = await form.trigger()
                  if (isValid) {
                    const currentValues = form.getValues()
                    updateFormData(currentValues)
                    onNext2()
                  }
                }}
              >
                Next
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
