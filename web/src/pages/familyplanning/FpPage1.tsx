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
import { page1Schema, type FormData } from "@/form-schema/FamilyPlanningSchema"

type Page1Props = {
  onNext2: () => void
  updateFormData: (data: Partial<FormData>) => void
  formData: FormData
  mode?: "create" | "edit" | "view"
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

export default function FamilyPlanningForm({ onNext2, updateFormData, formData, mode = "create" }: Page1Props) {
  const isReadOnly = mode === "view"
  const navigate = useNavigate()

  const getDefaultValues = (data: FormData) => ({
    clientID: data.clientID || "",
    philhealthNo: data.philhealthNo || "",
    nhts_status: data.nhts_status ?? false,
    pantawid_4ps: data.pantawid_4ps ?? false,
    lastName: data.lastName || "",
    givenName: data.givenName || "",
    middleInitial: data.middleInitial || "",
    dateOfBirth: data.dateOfBirth || "",
    age: data.age || 0,
    educationalAttainment: data.educationalAttainment || "",
    occupation: data.occupation || "",
    address: {
      houseNumber: data.address?.houseNumber || "",
      street: data.address?.street || "",
      barangay: data.address?.barangay || "",
      municipality: data.address?.municipality || "",
      province: data.address?.province || "",
    },
    spouse: {
      s_lastName: data.spouse?.s_lastName || "",
      s_givenName: data.spouse?.s_givenName || "",
      s_middleInitial: data.spouse?.s_middleInitial || "",
      s_dateOfBirth: data.spouse?.s_dateOfBirth || "",
      s_age: data.spouse?.s_age || 0,
      s_occupation: data.spouse?.s_occupation || "",
    },
    numOfLivingChildren: data.numOfLivingChildren ?? 0,
    planToHaveMoreChildren: data.planToHaveMoreChildren ?? false,
    averageMonthlyIncome: data.averageMonthlyIncome || "",
    typeOfClient: data.typeOfClient || "",
    subTypeOfClient: data.subTypeOfClient || "",
    reasonForFP: data.reasonForFP || "",
    otherReasonForFP: data.otherReasonForFP || "",
    reason: data.reason || "",
    fpt_other_reason_fp: data.fpt_other_reason_fp || "",
    methodCurrentlyUsed: data.methodCurrentlyUsed || "",
    otherMethod: data.otherMethod || "",
    acknowledgement: {
      clientName: data.acknowledgement?.clientName || "",
      clientSignature: data.acknowledgement?.clientSignature || "",
      clientSignatureDate: data.acknowledgement?.clientSignatureDate || "",
      guardianName: data.acknowledgement?.guardianName || "",
      guardianSignature: data.acknowledgement?.guardianSignature || "",
      guardianSignatureDate: data.acknowledgement?.guardianSignatureDate || "",
    },
    pat_id: data.pat_id || "",
    weight: data.weight ?? 0,
    height: data.height ?? 0,
    obstetricalHistory: {
      g_pregnancies: data.obstetricalHistory?.g_pregnancies ?? 0,
      p_pregnancies: data.obstetricalHistory?.p_pregnancies ?? 0,
      fullTerm: data.obstetricalHistory?.fullTerm ?? 0,
      premature: data.obstetricalHistory?.premature ?? 0,
      abortion: data.obstetricalHistory?.abortion ?? 0,
      livingChildren: data.obstetricalHistory?.livingChildren ?? 0,
      lastDeliveryDate: data.obstetricalHistory?.lastDeliveryDate || "",
      typeOfLastDelivery: data.obstetricalHistory?.typeOfLastDelivery || "",
      lastMenstrualPeriod: data.obstetricalHistory?.lastMenstrualPeriod || "",
      previousMenstrualPeriod: data.obstetricalHistory?.previousMenstrualPeriod || "",
      menstrualFlow: data.obstetricalHistory?.menstrualFlow || "Scanty",
      dysmenorrhea: data.obstetricalHistory?.dysmenorrhea ?? false,
      hydatidiformMole: data.obstetricalHistory?.hydatidiformMole ?? false,
      ectopicPregnancyHistory: data.obstetricalHistory?.ectopicPregnancyHistory ?? false,
    },
  })

  const form = useForm<FormData>({
    defaultValues: getDefaultValues(formData),
    values: getDefaultValues(formData),
    mode: "onBlur",
  })

  interface FormattedPatient {
    id: string
    name: string
  }

  const [patients, setPatients] = useState<FormattedPatient[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState("")

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true)
      try {
        const response = await api2.get("patientrecords/patient/")
        const formattedPatients = response.data.map((patient: any) => ({
          id: patient.pat_id?.toString() || "",
          name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
        }))
        setPatients(formattedPatients)
      } catch (error) {
        console.error("Error fetching patients:", error)
        toast.error("Failed to load patient data")
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const handlePatientSelection = async (id: string) => {
    
    setSelectedPatientId(id)
    try {
      const response = await api2.get(`familyplanning/patient-details/${id}/`)
      const patientData = response.data

      console.log("Received patient data:", patientData) // Add this for debugging

      const fullName = `${patientData.lastName || ''}, ${patientData.givenName || ''} ${patientData.middleInitial || ''}`.trim()
      const newFormData = {
      ...getDefaultValues(formData),
      ...patientData,
      acknowledgement: {
        ...getDefaultValues(formData).acknowledgement,
        clientName: fullName // Add the full name here
      }
    }
      form.reset(newFormData)
      updateFormData(newFormData)
      
      toast.success("Patient data loaded successfully")
    } catch (error) {
      console.error("Error fetching patient details:", error)
      toast.error("Failed to load patient details")
      form.reset(getDefaultValues(formData))
      updateFormData(getDefaultValues(formData))
    }
  }

  const dateOfBirth = form.watch("dateOfBirth")
  const spouseDOB = form.watch("spouse.s_dateOfBirth")
  const typeOfClient = form.watch("typeOfClient")
  const subTypeOfClient = form.watch("subTypeOfClient")
  const isNewAcceptor = typeOfClient === "newacceptor"
  const isCurrentUser = typeOfClient === "currentuser"
  const isChangingMethod = isCurrentUser && subTypeOfClient === "changingmethod"

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
      form.setValue("fpt_other_reason_fp", "")
    } else if (typeOfClient === "currentuser") {
      form.setValue("reasonForFP", "")
      form.setValue("otherReasonForFP", "")

      if (subTypeOfClient === "changingclinic" || subTypeOfClient === "dropoutrestart") {
        form.setValue("reason", "")
        form.setValue("fpt_other_reason_fp", "")
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
      form.setValue("fpt_other_reason_fp", "")
      form.setValue("methodCurrentlyUsed", "")
      form.setValue("otherMethod", "")
    }
    form.trigger()
  }, [typeOfClient, subTypeOfClient, form])

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

  const NEW_ACCEPTOR_METHOD_OPTIONS = [
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

  return (
    <div className="bg-white min-h-screen w-full overflow-x-hidden">
      <div className="rounded-lg w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button className="text-black p-2 self-start" variant="outline" onClick={() => navigate(-1)} type="button">
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
                  options={patients}
                  value={selectedPatientId}
                  onChange={handlePatientSelection}
                  placeholder={loading ? "Loading patients..." : "Select a patient"}
                  triggerClassName="font-normal w-[30rem]"
                  emptyMessage={
                    <div className="flex gap-2 justify-center items-center">
                      <Label className="font-normal text-[13px]">{loading ? "Loading..." : "No patient found."}</Label>
                      {/* <Link to="/patient-records/new">
                        <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                          Register New Patient
                        </Label>
                      </Link> */}
                    </div>
                  }
                />
              </div>
            </div>

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
                      name="reason"
                      label="Reason (Current User)"
                      options={REASON_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {isChangingMethod && form.watch("reason") === "sideeffects" && (
                    <FormInput
                      control={form.control}
                      name="otherReason"
                      label="Specify Side Effects:"
                      {...inputProps}
                    />
                  )}
                </div>

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
                      options={NEW_ACCEPTOR_METHOD_OPTIONS}
                      {...inputProps}
                    />
                  )}

                  {form.watch("methodCurrentlyUsed") === "others" && (
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
