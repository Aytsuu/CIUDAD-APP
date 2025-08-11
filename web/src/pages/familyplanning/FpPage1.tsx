
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { ChevronLeft } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { FormInput } from "@/components/ui/form/form-input"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Label } from "@radix-ui/react-dropdown-menu"
import { Combobox } from "@/components/ui/combobox"
import { api2 } from "@/api/api"
import { zodResolver } from "@hookform/resolvers/zod"
import { page1Schema, type FormData } from "@/form-schema/FamilyPlanningSchema"
import { useObstetricalHistoryData } from "./queries/fpFetchQuery"

type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
  isPatientPreSelected?: boolean // NEW: Indicates if patient is already selected
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const month = today.getMonth() - birthDate.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export default function FamilyPlanningForm({
  onNext2,
  updateFormData,
  formData,
  mode = "create",
  isPatientPreSelected = false, // NEW: Default to false
}: Page1Props) {
  const isReadOnly = mode === "view"
  const navigate = useNavigate()

  const patientId = formData?.pat_id
  const { data: obstetricalData } = useObstetricalHistoryData(patientId)

  useEffect(() => {
    if (obstetricalData?.livingChildren !== undefined) {
      form.setValue("numOfLivingChildren", obstetricalData.livingChildren)
      updateFormData({
        ...form.getValues(),
        numOfLivingChildren: obstetricalData.livingChildren,
        obstetricalHistory: {
          ...form.getValues().obstetricalHistory,
          numOfLivingChildren: obstetricalData.livingChildren,
        },
      })
    }
  }, [obstetricalData, updateFormData])

  const form = useForm<FormData>({
    resolver: zodResolver(page1Schema),
    values: formData,
    mode: "onBlur",
  })

  interface FormattedPatient {
    id: string
    name: React.ReactNode // Change name to React.ReactNode to accommodate JSX
  }

  interface FormattedCommodity {
    id: string
    name: string
    user_type: string
  }

  const [patients, setPatients] = useState<FormattedPatient[]>([])
  const [loadingPatients, setLoadingPatients] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")

  const [commodities, setCommodities] = useState<FormattedCommodity[]>([])
  const [loadingCommodities, setLoadingCommodities] = useState(false)

  // NEW: Set selected patient ID if pre-selected
  useEffect(() => {
    if (isPatientPreSelected && formData.pat_id) {
      setSelectedPatientId(formData.pat_id)
    }
  }, [isPatientPreSelected, formData.pat_id])

  useEffect(() => {
    // Only fetch patients if patient is not pre-selected
    if (!isPatientPreSelected) {
      const fetchPatients = async () => {
        setLoadingPatients(true)
        try {
          const response = await api2.get("patientrecords/patient/")
          const formattedPatients = response.data.map((patient: any) => ({
            id: patient.pat_id?.toString() || "",
            name: (
              <>
                <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.1rem 0.3rem', borderRadius: '0.2rem', marginRight: '0.3rem' }}>
                  {patient.pat_id || ""}
                </span>
                {`${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""} [${patient.pat_type || ""}]`.trim()}
              </>
            ),
          }))
          setPatients(formattedPatients)
        } catch (error) {
          console.error("Error fetching patients:", error)
          toast.error("Failed to load patient data")
        } finally {
          setLoadingPatients(false)
        }
      }

      fetchPatients()
    }
  }, [isPatientPreSelected])



  const handlePatientSelection = async (id: string) => {
  setSelectedPatientId(id);
  try {
    const response = await api2.get(`patientrecords/patient/${id}/`);
    const patientData = response.data;

    let spouseInfo = {
      s_lastName: "",
      s_givenName: "",
      s_middleInitial: "",
      s_dateOfBirth: "",
      s_age: 0,
      s_occupation: "",
    };

    // 3. Determine spouse based on patient gender and family head info
    const gender = patientData.personal_info?.per_sex?.toLowerCase();
    const familyHeads = patientData.family_head_info?.family_heads;
    const spouseData = patientData.spouse_info?.spouse_info;

    // First check if there's direct spouse info in the patient record
    if (spouseData) {
      spouseInfo = {
        s_lastName: spouseData.spouse_lname || "",
        s_givenName: spouseData.spouse_fname || "",
        s_middleInitial: (spouseData.spouse_mname ? spouseData.spouse_mname[0] : "") || "",
        s_dateOfBirth: spouseData.spouse_dob || "",
        s_age: spouseData.spouse_dob ? calculateAge(spouseData.spouse_dob) : 0,
        s_occupation: spouseData.spouse_occupation || "",
      };
    } 
    // If no direct spouse info, try to determine from family heads
    else if (gender === 'female' && familyHeads?.father) {
      // For female patients, use father as spouse
      const father = familyHeads.father.personal_info;
      spouseInfo = {
        s_lastName: father.per_lname || "",
        s_givenName: father.per_fname || "",
        s_middleInitial: (father.per_mname ? father.per_mname[0] : "") || "",
        s_dateOfBirth: father.per_dob || "",
        s_age: father.per_dob ? calculateAge(father.per_dob) : 0,
        s_occupation: "",
      };
    } else if (gender === 'male' && familyHeads?.mother) {
      // For male patients, use mother as spouse
      const mother = familyHeads.mother.personal_info;
      spouseInfo = {
        s_lastName: mother.per_lname || "",
        s_givenName: mother.per_fname || "",
        s_middleInitial: (mother.per_mname ? mother.per_mname[0] : "") || "",
        s_dateOfBirth: mother.per_dob || "",
        s_age: mother.per_dob ? calculateAge(mother.per_dob) : 0,
        s_occupation: "",
      };
    }

    // 4. Fetch other required data
    const [bodyMeasurementsResponse, obsHistoryResponse, lastPrevPregResponse, personalResponse] = await Promise.all([
      api2.get(`familyplanning/body-measurements/${id}`),
      api2.get(`familyplanning/obstetrical-history/${id}/`),
      api2.get(`familyplanning/last-previous-pregnancy/${id}/`),
      api2.get(`familyplanning/patient-details/${id}`)
    ]);

    const bodyMeasurementsData = bodyMeasurementsResponse.data || {};
    const obsHistoryData = obsHistoryResponse.data || {};
    const lastPrevPregData = lastPrevPregResponse.data || {};
    const personalResponseData = personalResponse.data || {};

    const fullName = `${patientData.personal_info?.per_lname || ""}, ${patientData.personal_info?.per_fname || ""} ${patientData.personal_info?.per_mname || ""}`.trim();

    // 5. Prepare the complete form data
    const newFormData = {
      ...formData,
      ...patientData,
      pat_id: patientData.pat_id,
      lastName: patientData.personal_info?.per_lname || "",
      givenName: patientData.personal_info?.per_fname || "",
      clientID: patientData.clientID || "",
      middleInitial: (patientData.personal_info?.per_mname ? patientData.personal_info.per_mname[0] : "") || "",
      dateOfBirth: patientData.personal_info?.per_dob || "",
      gender: patientData.personal_info?.per_sex || "",
      obstetricalHistory: obsHistoryData,
      height: bodyMeasurementsData.height || 0,
      weight: bodyMeasurementsData.weight || 0,
      bodyMeasurementRecordedAt: bodyMeasurementsData.recorded_at || "",
      philhealthNo: personalResponseData.philhealthNo || "",
      nhts_status: personalResponseData.nhts_status || false,
      pantawid_4ps: personalResponseData.pantawid_4ps || false,
      educationalAttainment: personalResponseData.educationalAttainment || "",
      occupation: personalResponseData.ocupation,
      acknowledgement: {
        ...formData.acknowledgement,
        clientName: fullName,
      },
      address: {
        houseNumber: personalResponseData.address?.houseNumber || "",
        street: personalResponseData.address?.street || "",
        barangay: personalResponseData.address?.barangay || "",
        municipality: personalResponseData.address?.municipality || "",
        province: personalResponseData.address?.province || "",
      },
      spouse: spouseInfo,
      lastDeliveryDate: lastPrevPregData.last_delivery_date || "",
      typeOfLastDelivery: lastPrevPregData.last_delivery_type || "",
    };

    // 6. Update the form with the new data
    form.reset(newFormData);
    updateFormData(newFormData);
    toast.success("Patient data loaded successfully");
  } catch (error) {
    console.error("Error fetching patient details:", error);
    toast.error("Failed to load patient details");
  }
};


  const dateOfBirth = form.watch("dateOfBirth")
  const spouseDOB = form.watch("spouse.s_dateOfBirth")
  const typeOfClient = form.watch("typeOfClient")
  const subTypeOfClient = form.watch("subTypeOfClient")
  const isNewAcceptor = typeOfClient === "newacceptor"
  const isCurrentUser = typeOfClient === "currentuser"
  const isChangingMethod =
    isCurrentUser &&
    (subTypeOfClient === "changingmethod" ||
        subTypeOfClient === "changingclinic" ||
        subTypeOfClient === "dropoutrestart");

  useEffect(() => {
    if (dateOfBirth) {
      form.setValue("age", calculateAge(dateOfBirth))
    } else {
      form.setValue("age", 0)
    }
  }, [dateOfBirth, form])

  useEffect(() => {
    if (spouseDOB) {
      form.setValue("spouse.s_age", calculateAge(spouseDOB))
    } else {
      form.setValue("spouse.s_age", 0)
    }
  }, [spouseDOB, form])

  useEffect(() => {
    if (typeOfClient === "newacceptor") {
      form.setValue("subTypeOfClient", "")
      form.setValue("reason", "")
    } else if (typeOfClient === "currentuser") {
      form.setValue("reasonForFP", "")
      form.setValue("otherReasonForFP", "")

      if (subTypeOfClient === "changingclinic" || subTypeOfClient === "dropoutrestart") {
        form.setValue("reason", "")
        form.setValue("methodCurrentlyUsed", "")
        form.setValue("otherMethod", "")
      } else if (subTypeOfClient === "changingmethod") {
        if (form.getValues("methodCurrentlyUsed") !== "others") {
          form.setValue("otherMethod", "")
        }
      }
    } else {
      form.setValue("subTypeOfClient", "")
      form.setValue("reasonForFP", "")
      form.setValue("otherReasonForFP", "")
      form.setValue("reason", "")
      form.setValue("methodCurrentlyUsed", "")
      form.setValue("otherMethod", "")
    }
    form.trigger()
  }, [typeOfClient, subTypeOfClient, form])

  useEffect(() => {
    const fetchCommodities = async () => {
      setLoadingCommodities(true)
      try {
        const response = await api2.get("inventory/commoditylist/")
        const allCommodities: any[] = response.data

        let filteredCommodities: FormattedCommodity[] = []

        if (typeOfClient === "newacceptor") {
          filteredCommodities = allCommodities
            .filter((com) => com.user_type === "New acceptor" || com.user_type === "Both")
            .map((com) => ({ id: com.com_name, name: com.com_name, user_type: com.user_type }))
        } else if (typeOfClient === "currentuser") {
          if (subTypeOfClient === "changingmethod") {
            filteredCommodities = allCommodities
              .filter((com) => com.user_type === "Current user" || com.user_type === "Both")
              .map((com) => ({ id: com.com_name, name: com.com_name, user_type: com.user_type }))
          } else {
            filteredCommodities = allCommodities.map((com) => ({
              id: com.com_name,
              name: com.com_name,
              user_type: com.user_type,
            }))
          }
        }

        setCommodities(filteredCommodities)
      } catch (error) {
        console.error("Error fetching commodities:", error)
        toast.error("Failed to load commodity data")
      } finally {
        setLoadingCommodities(false)
      }
    }

    fetchCommodities()
  }, [typeOfClient, subTypeOfClient])

  const onSubmit = async (data: FormData) => {
    try {
      const validatedData = page1Schema.parse(data)
      updateFormData(validatedData)
      onNext2()
    } catch (error) {
      console.error("Validation failed:", error)
      let errorMessage = "Please fill in all required fields correctly."
      if (error instanceof z.ZodError) {
        const fieldErrors = error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join("\n")
        errorMessage = `Validation failed:\n${fieldErrors}`
      }
      toast.error(errorMessage)
    }
  }

  const inputProps = {
    disabled: isReadOnly,
    readOnly: isReadOnly,
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

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button
          className="text-black p-2 self-start bg-transparent"
          variant="outline"
          onClick={() => navigate(-1)}
          type="button"
        >
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

            {/* NEW: Conditionally render patient selection */}
            {!isPatientPreSelected && (
              <div className="flex flex-col sm:flex-row items-center justify-between w-full">
                <div className="grid gap-2">
                  <Combobox
                    options={patients}
                    value={selectedPatientId}
                    onChange={handlePatientSelection}
                    placeholder={loadingPatients ? "Loading patients..." : "Select a patient"}
                    triggerClassName="font-normal w-[30rem]"
                    emptyMessage={
                      <div className="flex gap-2 justify-center items-center">
                        <Label className="font-normal text-[13px]">
                          {loadingPatients ? "Loading..." : "No patient found."}
                        </Label>
                         <Link to="/create-patients-record">
                                      <Label className="font-normal text-xs text-teal cursor-pointer hover:underline">
                                        Register New Patient
                                      </Label>
                                    </Link>
                      </div>
                    }
                  />
                </div>
              </div>
            )}

            {/* NEW: Show patient info if pre-selected */}
            {isPatientPreSelected && formData.pat_id && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>Patient Selected:</strong> {formData.lastName}, {formData.givenName}{" "}
                      {formData.middleInitial} (ID: {formData.pat_id})
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <FormInput control={form.control} name="clientID" label="CLIENT ID:" {...inputProps} />
              <FormInput control={form.control} name="philhealthNo" label="PHILHEALTH NO:" {...inputProps} />

          <FormField
  control={form.control}
  name="nhts_status"
  render={({ field }) => (
    <FormItem className="ml-5 mt-2 flex flex-col">
      <FormLabel className="mb-2">NHTS?</FormLabel>
      <div className="flex items-center space-x-2">
        <FormControl>
          <Checkbox
            checked={field.value === true}
            onCheckedChange={() => {}} // Empty function prevents changes
            disabled={true} // Force disabled
            className="cursor-not-allowed" // Visual indication
          />
        </FormControl>
        <Label>Yes</Label>
        <FormControl>
          <Checkbox
            className="ml-4 cursor-not-allowed"
            checked={field.value === false}
            onCheckedChange={() => {}} // Empty function prevents changes
            disabled={true} // Force disabled
          />
        </FormControl>
        <Label>No</Label>
      </div>
      <FormMessage />
    </FormItem>
  )}
/>

              <FormField
                control={form.control}
                name="pantawid_4ps"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="mb-2 mt-2">Pantawid Pamilya Pilipino (4Ps)</FormLabel>
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
                className="col-span-1"
                {...inputProps}
              />
              <FormInput
                control={form.control}
                name="educationalAttainment"
                label="Education Attainment"
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
                    <FormLabel className="mb-2">PLAN TO HAVE MORE CHILDREN?</FormLabel>
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

            <div className="border border-t-black w-full p-4 rounded-md mt-6">
              <div className="grid grid-cols-12 gap-6">
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

                <div className="col-span-4 space-y-6">
                  {isNewAcceptor && (
                    <FormSelect
                      control={form.control}
                      name="reasonForFP"
                      label="Reason for Family Planning"
                      options={REASON_FOR_FP_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {isNewAcceptor && form.watch("reasonForFP") === "fp_others" && (
                    <FormInput control={form.control} name="otherReasonForFP" label="Specify Reason:" {...inputProps} />
                  )}

                  {isChangingMethod && (
                    <FormSelect
                      control={form.control}
                      name="reasonForFP"
                      label="Reason (Current User)"
                      options={REASON_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {isChangingMethod && form.watch("reasonForFP") === "sideeffects" && (
                    <FormInput
                      control={form.control}
                      name="otherReasonForFP"
                      label="Specify Side Effects:"
                      {...inputProps}
                    />
                  )}
                </div>

                <div className="col-span-5">
                  {isChangingMethod && (
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Method currently used (for Changing Method):</FormLabel>
                          <Combobox
                            options={commodities}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              if (value !== "Others") {
                                form.setValue("otherMethod", "")
                              }
                            }}
                            placeholder={loadingCommodities ? "Loading methods..." : "Select a method"}
                            triggerClassName="font-normal w-full"
                            emptyMessage={
                              <div className="flex gap-2 justify-center items-center">
                                <Label className="font-normal text-[13px]">
                                  {loadingCommodities ? "Loading..." : "No method found."}
                                </Label>
                              </div>
                            }
                            disabled={isReadOnly}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {isNewAcceptor && (
                    <FormField
                      control={form.control}
                      name="methodCurrentlyUsed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Method Accepted (New Acceptor)</FormLabel>
                          <Combobox
                            options={commodities}
                            value={field.value}
                            onChange={(value) => {
                              field.onChange(value)
                              if (value !== "others") {
                                form.setValue("otherMethod", "")
                              }
                            }}
                            placeholder={loadingCommodities ? "Loading methods..." : "Select a method"}
                            triggerClassName="font-normal w-full"
                            emptyMessage={
                              <div className="flex gap-2 justify-center items-center">
                                <Label className="font-normal text-[13px]">
                                  {loadingCommodities ? "Loading..." : "No method found."}
                                </Label>
                              </div>
                            }
                            disabled={isReadOnly}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {form.watch("methodCurrentlyUsed") === "Others" && (
                    <FormInput
                      control={form.control}
                      name="otherMethod"
                      className="mt-6"
                      label="Specify other method:"
                      {...inputProps}
                    />
                  )}
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