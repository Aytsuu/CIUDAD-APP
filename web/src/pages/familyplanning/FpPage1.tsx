import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import type { FormData } from "@/form-schema/FamilyPlanningSchema"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import { api2 } from "@/api/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { page1Schema } from "@/form-schema/FamilyPlanningSchema"

type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningForm({ onNext2, updateFormData, formData, mode = "create" }: Page1Props) {
  const isReadOnly = mode === "view"

  const form = useForm<FormData>({
    // resolver: zodResolver(page1Schema),
    defaultValues: formData,
    values: formData,
    mode: "onBlur",
  })

  interface PatientRecord {
    // address: any
    personal_info:
    | {
      per_lname?: string
      per_fname?: string
      per_mname?: string
      per_dob?: string
      per_age?: string
      per_sex?: string
      per_address?: string
      per_edAttainment?: string
      per_religion?: string
      per_occupation?: string
      per_city?: string
      per_province?: string
      spouse_lname?: string
      spouse_fname?: string
      spouse_mname?: string
    }
    | undefined
    clientID: string
    pat_id: string
    per_fname: string
    per_lname: string
    per_mname: string
    per_dob: string
    per_age: string
    per_sex: string
    per_address: string
    per_edAttainment: string
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
  const [spouse, setSpouse] = useState<any[]>([])
  const [bodyMeasurements, setBodyMeasurements] = useState<any[]>([])

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await api2.get("patientrecords/patient/")
        console.log("✅ Patients fetched successfully:", response.data)
        const patientData = response.data

        // Make sure we're mapping the data correctly based on the API response
        const formatted = patientData.map((patient: any) => ({
          id: patient.pat_id?.toString() || "",
          name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
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
    
    
    const fetchPatientsAndSpouses = async () => {
    setLoading(true)
    try {
      const [patientsRes, spousesRes, measurementsRes] = await Promise.all([
        api2.get("patientrecords/patient/"),
        api2.get("patientrecords/spouse/"),
        api2.get("patientrecords/body-measurements/")
      ])

      const patientData = patientsRes.data
      const spouseData = spousesRes.data
      const measurementsData = measurementsRes.data

      const formatted = patientData.map((patient: any) => ({
        id: patient.pat_id?.toString() || "",
        name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
      }))

      setPatients({ default: patientData, formatted })
      setSpouse(spouseData)
      setBodyMeasurements(measurementsData)

      console.log("✅ Patients fetched:", patientData)
      console.log("✅ Spouses fetched:", spouseData)
    } catch (error) {
      console.error("❌ Error fetching data:", error)
      toast.error("Failed to load patient or spouse data")
    } finally {
      setLoading(false)
    }
  }

  fetchPatientsAndSpouses()
}, [])

  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id)

    const selectedPatient = patients.default.find((patient) => patient.pat_id?.toString() === id)
    

    if (selectedPatient && selectedPatient.personal_info) {
      const info = selectedPatient.personal_info
     
      const patientMeasurements = bodyMeasurements.find(
      (measurement) => measurement.pat === id
    )
      const patientData = {
        pat_id: selectedPatient.pat_id,
        clientID: selectedPatient.clientID || "",
        lastName: info.per_lname || "",
        givenName: info.per_fname || "",
        middleInitial: info.per_mname || "",
        dateOfBirth: info.per_dob || "",
        age: info.per_dob ? calculateAge(info.per_dob) : 0,
        educationalAttainment: info.per_edAttainment || "",
        address: {
          houseNumber: formData.address?.houseNumber || "",
          street: info.per_address || "",
          barangay: formData.address?.barangay || "",
          municipality: info.per_city || "",
          province: info.per_province || "",
        },
        occupation: info.per_occupation || "",
        weight: patientMeasurements?.weight || "",
        height: patientMeasurements?.height || "",
        bmi: patientMeasurements?.bmi || "",
        bmi_category: patientMeasurements?.bmi_category || "",
      }

      // Reset form with patient data while preserving existing form values
      form.reset({
        ...formData,
        ...patientData,
      })

      updateFormData(patientData)
      console.log("✅ Auto-filled form with patient data:", patientData)
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
    { id: "coc", name: "COC" },
    { id: "pop", name: "POP" },
    { id: "injectable", name: "Injectable" },
    { id: "implant", name: "Implant" },
    { id: "iud-interval", name: "IUD-Interval" },
    { id: "iud-postpartum", name: "IUD-Post Partum" },
    { id: "condom", name: "Condom" },
    { id: "bom/cmm", name: "BOM/CMM" },
    { id: "bbt", name: "BBT" },
    { id: "stm", name: "STM" },
    { id: "sdm", name: "SDM" },
    { id: "lam", name: "LAM" },
    { id: "others", name: "Others" },
  ]

  const EDUCATION_OPTIONS = [
    { id: "elementary", name: "Elementary" },
    { id: "highschool", name: "High School" },
    { id: "shs", name: "Senior High School" },
    { id: "collegelevel", name: "College Level" },
    { id: "collegegrad", name: "College Graduate" },
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

  // const location = useLocation()
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
  // const selectedPatient = patients.default.find((patient) => patient.pat_id?.toString() === selectedPatientId)
  // const address = selectedPatient?.address
  // const selectedSpouse = spouse.find((s) => s.pat?.toString() === selectedPatientId)
  const mapEducationValue = (value: string): string | undefined => {
  switch (value.toLowerCase()) {
    case "elementary":
      return "elementary"
    case "high school":
      return "highschool"
    case "senior high school":
    case "shs":
      return "shs"
    case "college":
    case "college level":
      return "collegelevel"
    case "college graduate":
      return "collegegrad"
    default:
      return undefined
  }
}

  useEffect(() => {
  const selectedPatient = patients.default.find((patient) => patient.pat_id?.toString() === selectedPatientId)
  const address = selectedPatient?.address
  const selectedSpouse = spouse.find((s) => s.pat_id?.toString() === selectedPatientId)

  if (address) {
    form.setValue("address.street", address.add_street || "N/A")
    form.setValue("address.houseNumber", address.houseNumber || "N/A")
    form.setValue("address.barangay", address.add_barangay || "N/A")
    form.setValue("address.municipality", address.add_city || "N/A")
    form.setValue("address.province", address.add_province || "N/A")
  }
  if (selectedPatient?.personal_info?.per_edAttainment) {
  const mapped = mapEducationValue(selectedPatient.personal_info.per_edAttainment)
  if (mapped) {
    form.setValue("educationalAttainment", mapped)
    console.log("Mapped educational attainment:", mapped)
  }
}
  // if(selectedPatient?.)

  if (selectedSpouse) {
    form.setValue("spouse.s_lastName", selectedSpouse.spouse_lname || "")
    form.setValue("spouse.s_givenName", selectedSpouse.spouse_fname || "")
    form.setValue("spouse.s_middleInitial", selectedSpouse.spouse_mnane || "")
    form.setValue("spouse.s_occupation", selectedSpouse.spouse_occupation || "")
    form.setValue("spouse.s_dateOfBirth", selectedSpouse.spouse_dob || "")

    if (selectedSpouse.spouse_dob) {
      const age = calculateAge(selectedSpouse.spouse_dob)
      form.setValue("spouse.s_age", age)
      setSpouseAge(age)
    }
  }
}, [selectedPatientId, patients.default, spouse])


  useEffect(() => {
    if (isNewAcceptor) {
      form.setValue("reason", "")
      form.setValue("methodCurrentlyUsed", undefined) // Set to undefined or empty string for New Acceptor
      form.setValue("otherMethod", "")
      form.setValue("otherReason", "") // Clear otherReason if not changing method
    } else if (isCurrentUser) {
      form.setValue("reasonForFP", "")
      // form.setValue("otherReasonForFP", "")

      if (!isChangingMethod) {
        form.setValue("reason", "")
        form.setValue("methodCurrentlyUsed", undefined) // Clear methodCurrentlyUsed if not changing method
        form.setValue("otherMethod", "")
        form.setValue("otherReason", "")
      }
    }
  }, [typeOfClient, subTypeOfClient, form, isNewAcceptor, isCurrentUser, isChangingMethod])

  const onSubmit = async (data: FormData) => {
    try {
      // Validate the form data
      const validatedData = page1Schema.parse(data)
      console.log("✅ Page 1 validation passed:", validatedData)

      updateFormData(validatedData)
      onNext2()
    } catch (error) {
      console.error("❌ Page 1 validation failed:", error)
      toast.error("Please fill in all required fields correctly")
    }
  }

  // Add disabled state for readonly mode
  const inputProps = {
    disabled: isReadOnly,
    readOnly: isReadOnly,
  }

  const saveFormData = () => updateFormData(form.getValues())
  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 p-4 text-center">Family Planning (FP) Form 1</h2>
        <h5 className="text-lg text-right font-semibold mb-2 ">Page 1</h5>
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
              <FormInput control={form.control} name="clientID" label="CLIENT ID:" {...inputProps} />
              <FormInput control={form.control} name="philhealthNo" label="PHILHEALTH NO:" {...inputProps} />

              {/* NHTS Checkbox */}
              <FormField
                control={form.control}
                name="nhts_status"
                render={({ field }) => (
                  <FormItem className="ml-5 mt-2 flex flex-col">
                    <Label className="mb-2">NHTS?</Label>
                    <div className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
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
                        <Checkbox
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
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
                {...inputProps}
              />
              <FormInput
                control={form.control}
                label=""
                name="givenName"
                placeholder="Given name"
                className="col-span-1 m-4"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 m-4"
                {...inputProps}
              />
              <FormDateTimeInput
                control={form.control}
                type="date"
                name="dateOfBirth"
                label="Date of Birth:"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="age"
                label="Age"
                type="number"
                readOnly
                value={computedAge !== null ? computedAge.toString() : ""}
                className="col-span-1"
                {...inputProps}
              />
              <FormSelect
                control={form.control}
                name="educationalAttainment"
                label="Education Attainment"
                options={EDUCATION_OPTIONS}
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1 sm:col-span-2 md:col-span-1"
                {...inputProps}
              />
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 gap-2 mt-3">
              <FormLabel className="text-sm font-medium text-muted-foreground">
                ADDRESS (No. Street, Brgy, Municipality/City, Province)
              </FormLabel>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                <FormInput
                  control={form.control}
                  name="address.houseNumber"
                  label=""
                  placeholder="No."
                  className="col-span-1 "
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.street"
                  label=""
                  placeholder="Street"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.barangay"
                  label=""
                  placeholder="Barangay"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.municipality"
                  label=""
                  placeholder="Municipality/City"
                  className="col-span-1"
                  {...inputProps}
                />
                <FormInput
                  control={form.control}
                  name="address.province"
                  label=""
                  placeholder="Province"
                  className="col-span-1"
                  {...inputProps}
                />
              </div>
            </div>


            {/* Spouse Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="spouse.s_lastName"
                label="NAME OF SPOUSE"
                placeholder="Last name"
                className="col-span-1"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_givenName"
                label=""
                placeholder="Given name"
                className="col-span-1 mt-4"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_middleInitial"
                label=""
                placeholder="Middle Initial"
                className="col-span-1 mt-4"
                {...inputProps}
              />
              <FormDateTimeInput
                control={form.control}
                type="date"
                name="spouse.s_dateOfBirth"
                label="Date of Birth"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_age"
                label="Age"
                type="number"
                readOnly
                value={spouseAge !== null ? spouseAge.toString() : ""}
                className="col-span-1"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="spouse.s_occupation"
                label="Occupation"
                placeholder="Occupation"
                className="col-span-1"
                {...inputProps}
              />
            </div>

            {/* Children and Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <FormInput
                control={form.control}
                name="numOfLivingChildren"
                label="NO. OF LIVING CHILDREN"
                type="number"
                {...inputProps}
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
                          checked={field.value === true}
                          onCheckedChange={() => field.onChange(true)}
                          disabled={isReadOnly}
                        />
                      </FormControl>
                      <Label>Yes</Label>
                      <FormControl>
                        <Checkbox
                          className="border ml-4"
                          checked={field.value === false}
                          onCheckedChange={() => field.onChange(false)}
                          disabled={isReadOnly}
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
                {...inputProps}
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
                  <FormSelect control={form.control} name="typeOfClient" options={CLIENT_TYPES} {...inputProps} />

                  {isCurrentUser && (
                    <div className="mt-4">
                      <FormSelect
                        control={form.control}
                        name="subTypeOfClient"
                        label="Sub Type of Client"
                        options={SUB_CLIENT_TYPES}
                        {...inputProps}
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
                      {...inputProps}
                    />
                  )}

                  {/* Show specify reason field when "Others" is selected as reason for FP */}
                  {isNewAcceptor && form.watch("reasonForFP") === "fp_others" && (
                    <FormInput control={form.control} name="otherReasonForFP" label="Specify Reason:" {...inputProps} />
                  )}

                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="reason"
                      label="Reason (Current User)"
                      options={REASON_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {/* Show specify side effects field when "Side Effects" is selected as reason */}
                  {isChangingMethod && form.watch("reason") === "sideeffects" && (
                    <FormInput
                      control={form.control}
                      name="otherReason"
                      label="Specify Side Effects:"
                      {...inputProps}
                    />
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
                      {...inputProps}
                    />
                  )}

                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="methodCurrentlyUsed"
                      label="Method Accepted (New Acceptor)"
                      options={[
                        { id: "pills", name: "Pills" },
                        { id: "dmpa", name: "DMPA" },
                        { id: "condom", name: "Condom" },
                        { id: "iud-interval", name: "IUD-Interval" },
                        { id: "iud-postpartum", name: "IUD-Post Partum" },
                        { id: "implant", name: "Implant" },
                        { id: "lactating", name: "Lactating Amenorrhea" },
                        { id: "bilateral", name: "Bilateral Tubal Ligation" },
                        { id: "vasectomy", name: "Vasectomy" },
                        { id: "others", name: "Others" }, // Ensure "Others" is an option here if used
                      ]}
                      {...inputProps}
                    />
                  )}

                  {(() => {
                    const methodUsed = form.watch("methodCurrentlyUsed")
                    return (
                      methodUsed === "others" && (
                        <FormInput
                          control={form.control}
                          name="otherMethod"
                          className="mt-6"
                          label="Specify other method:"
                          {...inputProps}
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
                disabled={isReadOnly}
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
