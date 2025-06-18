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
import { page1Schema,FamilyPlanningSchema } from "@/form-schema/FamilyPlanningSchema"
import { zodResolver } from "@hookform/resolvers/zod"



type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningForm({ onNext2, updateFormData, formData, mode = "create" }: Page1Props) {
  const isReadOnly = mode === "view"

  // Create proper default values to ensure no undefined values
  const getDefaultValues = (data: FormData) => ({
    // Personal Information
    clientID: data.clientID || "",
    philhealthNo: data.philhealthNo || "",
    nhts_status: data.nhts_status || false, // Default to false
    pantawid_4ps: data.pantawid_4ps || false,
    isTransient: (data as any).isTransient || "resident",
    lastName: data.lastName || "",
    givenName: data.givenName || "",
    middleInitial: data.middleInitial || "",
    dateOfBirth: data.dateOfBirth || "",
    age: data.age || 0,
    educationalAttainment: data.educationalAttainment || "",
    occupation: data.occupation || "",

    // Address
    address: {
      houseNumber: data.address?.houseNumber || "",
      street: data.address?.street || "",
      barangay: data.address?.barangay || "",
      municipality: data.address?.municipality || "",
      province: data.address?.province || "",
    },

    // Spouse Information
    spouse: {
      s_lastName: data.spouse?.s_lastName || "",
      s_givenName: data.spouse?.s_givenName || "",
      s_middleInitial: data.spouse?.s_middleInitial || "",
      s_dateOfBirth: data.spouse?.s_dateOfBirth || "",
      s_age: data.spouse?.s_age || 0,
      s_occupation: data.spouse?.s_occupation || "",
    },

    // Children and Income
    numOfLivingChildren: data.numOfLivingChildren,
    planToHaveMoreChildren: data.planToHaveMoreChildren || false,
    averageMonthlyIncome: data.averageMonthlyIncome || "",

    // Client Type and Methods - CRITICAL: Initialize as empty strings for correct conditional validation
    typeOfClient: data.typeOfClient || "",
    subTypeOfClient: data.subTypeOfClient || "",
    reasonForFP: data.reasonForFP || "",
    otherReasonForFP: data.otherReasonForFP || "",
    reason: data.reason || "", // For current user reasons
    fpt_other_reason_fp: data.fpt_other_reason_fp || "", // For current user reason specify
    methodCurrentlyUsed: data.methodCurrentlyUsed || "",
    otherMethod: data.otherMethod || "",

    // Acknowledgement (ensure nested objects are initialized)
    acknowledgement: {
      clientName: data.acknowledgement?.clientName || "",
      clientSignature: data.acknowledgement?.clientSignature || "",
      clientSignatureDate: data.acknowledgement?.clientSignatureDate || "",
      guardianName: data.acknowledgement?.guardianName || "",
      guardianSignature: data.acknowledgement?.guardianSignature || "",
      guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
    },

    // Other fields (ensure numerical fields are properly defaulted)
    pat_id: data.pat_id || "",
    weight: data.weight || 0, // Default number to 0, not empty string
    height: data.height || 0, // Default number to 0, not empty string
  })

  const form = useForm<FormData>({
    resolver: zodResolver(page1Schema),
    defaultValues: getDefaultValues(formData),
    values: getDefaultValues(formData), // Use values to keep form in sync with external formData
    mode: "onBlur", // Validate on blur for better UX
  })

  // Patient data types (keeping as is from your provided file)
  interface PatientRecord {
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
    patrec_id: string
    per_fname: string
    per_lname: string
    per_mname: string // This will come from backend, may be full middle name
    per_dob: string
    per_age: string
    per_sex: string
    per_address: string
    per_edAttainment: string
    per_religion: string
    // Add the new fields here to your PatientRecord interface
    nhts_status_from_household?: boolean;
    philhealth_id_from_hrd?: string;
  }

  interface FormattedPatient {
    id: string
    name: string
  }

  const [patients, setPatients] = useState<{
    default: PatientRecord[]
    formatted: { id: string; name: string }[]
  }>({ default: [], formatted: [] })

  const [loading, setLoading] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")
  // const [selectedPatrecId,setSelectedPatrecId] = useState("")
  const [spouse, setSpouse] = useState<any[]>([])
  const [bodyMeasurements, setBodyMeasurements] = useState<any[]>([])
  const [obstetricalHistory, setObstetricalHistory] = useState<any[]>([])

  useEffect(() => {
    const fetchPatientsAndSpouses = async () => {
      setLoading(true)
      try {
        const [patientsRes, measurementsRes,obstetricalRes] = await Promise.all([
          api2.get("patientrecords/patient/"),
          // api2.get("patientrecords/spouse/"),
          api2.get("patientrecords/body-measurements/"),
          api2.get("patientrecords/obstetrical_history")
        ])

        const patientData = patientsRes.data
        // const spouseData = spousesRes.data
        const measurementsData = measurementsRes.data
        const obstetricalData = obstetricalRes.data

        const formatted = patientData.map((patient: any) => ({
          id: patient.pat_id?.toString() || "",
          name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
        }))

        setPatients({ default: patientData, formatted })
        // setSpouse(spouseData)
        setBodyMeasurements(measurementsData)
        setObstetricalHistory(obstetricalData)

        console.log("✅ Patients fetched:", patientData)
        // console.log("✅ Spouses fetched:", spouseData)
        console.log("✅ Body Measurements fetched:", measurementsData)
        console.log("✅ Obstetrical History fetched:", obstetricalData)

        
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
  setSelectedPatientId(id);
  // setSelectedPatrecId(patrec_id);

  const selectedPatient = patients.default.find((p) => p.pat_id?.toString() === id);
  const selectedSpouse = spouse.find((s) => s.pat_id?.toString() === id);
  const patientMeasurements = bodyMeasurements.find((m) => m.pat?.toString() === id);

  // Corrected: Finding obstetrical history linked to the selected PatientRecord's patrec_id
  const obsPatient = obstetricalHistory.find((obs: any) => 
      selectedPatient && obs.patrec_id === selectedPatient.patrec_id
  ) || null;

  if (!selectedPatient?.personal_info) {
        // Reset form to default if no patient info is found
        form.reset(getDefaultValues(formData));
        updateFormData(getDefaultValues(formData));
        return;
  }

  const info = selectedPatient.personal_info;

  const patientData = {
    pat_id: selectedPatient.pat_id,
    clientID: selectedPatient.clientID || "",
    // Use the new fields from the selectedPatient object for NHTS and PhilHealth
    nhts_status: selectedPatient.nhts_status_from_household || false, 
    philhealthNo: selectedPatient.philhealth_id_from_hrd || "",
    
    lastName: info.per_lname || "",
    givenName: info.per_fname || "",
    middleInitial: (info.per_mname ? info.per_mname.charAt(0) : "") || "", // <<<--- MODIFIED LINE
    dateOfBirth: info.per_dob || "",
    age: info.per_dob ? calculateAge(info.per_dob) : 0,
    educationalAttainment: mapEducationValue(info.per_edAttainment || "") || "",
    address: {
      houseNumber: formData.address?.houseNumber || "", // Use existing if available
      street: info.per_address || "", // This might need parsing if it's a combined string
      barangay: formData.address?.barangay || "",
      municipality: info.per_city || "",
      province: info.per_province || "",
    },
    occupation: info.per_occupation || "",
    weight: patientMeasurements?.weight || 0, // Default to 0 for numbers
    height: patientMeasurements?.height || 0, // Default to 0 for numbers
    bmi: patientMeasurements?.bmi || 0,
    bmi_category: patientMeasurements?.bmi_category || "",
    acknowledgement: {
      clientName: `${info.per_lname || ""}, ${info.per_fname || ""} ${info.per_mname || ""}`.trim(),
    },
    spouse: {
      s_lastName: selectedSpouse?.spouse_lname || "",
      s_givenName: selectedSpouse?.spouse_fname || "",
      s_middleInitial: selectedSpouse?.spouse_mnane || "",
      s_dateOfBirth: selectedSpouse?.spouse_dob || "",
      s_age: selectedSpouse?.spouse_dob ? calculateAge(selectedSpouse.spouse_dob) : 0,
      s_occupation: selectedSpouse?.spouse_occupation || "",
    },
  };

  form.reset({
    ...getDefaultValues(formData),
    ...patientData,
  });

  if (obsPatient) {
    form.setValue("obstetricalHistory.g_pregnancies", obsPatient.obs_gravida || 0);
    form.setValue("obstetricalHistory.p_pregnancies", obsPatient.obs_para || 0);
    form.setValue("obstetricalHistory.fullTerm", obsPatient.obs_fullterm || 0);
    form.setValue("obstetricalHistory.premature", obsPatient.obs_preterm || 0);
    form.setValue("obstetricalHistory.abortion", obsPatient.obs_abortion || 0);
    form.setValue("obstetricalHistory.livingChildren", obsPatient.obs_living_ch || 0);
    // You might also need to set other fields from obstetrical history here if they exist
    form.setValue("obstetricalHistory.lastDeliveryDate", obsPatient.obs_last_delivery || "");
    form.setValue("obstetricalHistory.typeOfLastDelivery", obsPatient.obs_type_last_delivery || "");
    form.setValue("obstetricalHistory.lastMenstrualPeriod", obsPatient.obs_last_period || "");
    form.setValue("obstetricalHistory.previousMenstrualPeriod", obsPatient.obs_previous_period || "");
    form.setValue("obstetricalHistory.menstrualFlow", obsPatient.obs_mens_flow || "Scanty"); // Default if needed
    form.setValue("obstetricalHistory.dysmenorrhea", obsPatient.obs_dysme || false);
    form.setValue("obstetricalHistory.hydatidiformMole", obsPatient.obs_hydatidiform || false);
    form.setValue("obstetricalHistory.ectopicPregnancyHistory", obsPatient.obs_ectopic_pregnancy || false);
  } else {
      // If no obstetrical history, ensure it's reset to defaults for `obstetricalHistory` object
      form.setValue("obstetricalHistory", getDefaultValues(formData).obstetricalHistory);
  }

  // Update the parent formData
  updateFormData({
    ...formData,
    ...patientData,
    obstetricalHistory: form.getValues("obstetricalHistory"), // Ensure updated obstetrical history is passed
  });

  console.log("✅ Form auto-filled with patient, NHTS, PhilHealth, and obstetrical data:", patientData);
};


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
    { id: "pills", name: "Pills" },
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

  // Calculate age automatically
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

  const mapEducationValue = (value: string): string | undefined => {
    if (!value) return undefined

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
    // Corrected: Finding obstetrical history linked to the selected PatientRecord's patrec_id
    const obstetricalpatient = obstetricalHistory.find((obs) => 
        selectedPatient && obs.patrec_id === selectedPatient.patrec_id
    ) || null; // Ensure it's null if not found, not undefined

    if (address) {
      form.setValue("address.street", address.add_street || "")
      form.setValue("address.houseNumber", address.houseNumber || "")
      form.setValue("address.barangay", address.add_barangay || "")
      form.setValue("address.municipality", address.add_city || "")
      form.setValue("address.province", address.add_province || "")
    }
    
    if (selectedPatient?.personal_info?.per_edAttainment) {
      const mapped = mapEducationValue(selectedPatient.personal_info?.per_edAttainment)
      if (mapped) {
        form.setValue("educationalAttainment", mapped)
        console.log("Mapped educational attainment:", mapped)
      }
    }

    if (selectedPatient) {
      form.setValue(
        "acknowledgement.clientName",
        `${selectedPatient.personal_info?.per_lname || ""}, ${selectedPatient.personal_info?.per_fname || ""} ${selectedPatient.personal_info?.per_mname || ""}`.trim(),
      )
    }

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
  }, [selectedPatientId, patients.default, spouse, form, obstetricalHistory]) // Added obstetricalHistory to dependencies

  // CRITICAL FIX: Ensure all non-applicable form values are cleared
  useEffect(() => {
    if (typeOfClient === "newacceptor") {
      // Clear fields relevant only to "Current User" paths
      form.setValue("subTypeOfClient", "");
      form.setValue("reason", ""); // "Reason (Current User)"
      form.setValue("fpt_other_reason_fp", ""); // "Specify Side Effects" for current user
      // No need to clear methodCurrentlyUsed or reasonForFP, as they ARE required for newacceptor
    } else if (typeOfClient === "currentuser") {
      // Clear fields relevant only to "New Acceptor" path
      form.setValue("reasonForFP", ""); // "Reason for Family Planning"
      form.setValue("otherReasonForFP", ""); // "Specify Reason" for new acceptor

      if (subTypeOfClient === "changingclinic" || subTypeOfClient === "dropoutrestart") {
        // Clear fields relevant only to "Changing Method"
        form.setValue("reason", "");
        form.setValue("fpt_other_reason_fp", "");
        form.setValue("methodCurrentlyUsed", ""); // Clear method for these specific subtypes
        form.setValue("otherMethod", "");
      } else if (subTypeOfClient === "changingmethod") {
        // MethodCurrentlyUsed, reason, fpt_other_reason_fp are conditionally required here, so don't clear them.
        // Ensure otherMethod is cleared if "others" is not selected for method.
        if (form.getValues("methodCurrentlyUsed") !== "others") {
            form.setValue("otherMethod", "");
        }
      }
    } else { // When no typeOfClient is selected
        form.setValue("subTypeOfClient", "");
        form.setValue("reasonForFP", "");
        form.setValue("otherReasonForFP", "");
        form.setValue("reason", "");
        form.setValue("fpt_other_reason_fp", "");
        form.setValue("methodCurrentlyUsed", "");
        form.setValue("otherMethod", "");
    }
    // Also trigger validation to reflect changes immediately
    form.trigger(); 
  }, [typeOfClient, subTypeOfClient, form]);


  const onSubmit = async (data: FormData) => {
    try {
      // Validate the form data based on page1Schema
      const validatedData = page1Schema.parse(data)
      console.log("✅ Page 1 validation passed:", validatedData)

      updateFormData(validatedData)
      onNext2()
    } catch (error) {
      console.error("❌ Page 1 validation failed:", error)
      let errorMessage = "Please fill in all required fields correctly.";
      if (error instanceof z.ZodError) {
          const fieldErrors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
          errorMessage = `Validation failed:\n${fieldErrors}`;
          console.error("Zod Validation Errors:", error.errors);
      }
      toast.error(errorMessage);
    }
  }

  // Add disabled state for readonly mode
  const inputProps = {
    disabled: isReadOnly,
    readOnly: isReadOnly,
  }

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant={"outline"} onClick={() => navigate(-1)}>
          <ChevronLeft />
        </Button>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 p-4 text-center">Family Planning (FP) Form 1</h2>
        <h5 className="text-lg text-right font-semibold mb-2">Page 1</h5>
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

              {/* <div className="flex justify-end w-full sm:w-auto sm:ml-auto">
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
              </div> */}
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
                  className="col-span-1"
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
                        { id: "others", name: "Others" },
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
