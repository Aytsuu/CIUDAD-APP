
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import ReferralFormSchema from "@/form-schema/animal-bite-schema"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form"
import { SelectLayout } from "@/components/ui/select/select-layout"
import { SelectLayoutWithAdd } from "@/components/ui/select/select-searchadd-layout"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { submitAnimalBiteReferral } from "./db-request/postrequest"
import { getAllPatients } from "./api/get-api"
import { Link } from "react-router"

type ReferralFormModalProps = {
  onClose: () => void
  onAddPatient?: (patient: any) => void
}

interface PatientRecord {
  personal_info: any
  address: any
  pat_id: string
  per_fname: string
  per_lname: string
  per_mname: string
  per_dob: string
  per_age: string
  per_sex: string
  per_address: string
}

interface SelectOption {
  id: string
  name: string
}

const getTodayDate = (): string => {
  const today = new Date()
  return today.toISOString().split("T")[0]
}

const calculateAge = (dobStr: string): number => {
  const dob = new Date(dobStr)
  const today = new Date()
  const age = today.getFullYear() - dob.getFullYear()
  const hasHadBirthday =
    today.getMonth() > dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())
  return hasHadBirthday ? age : age - 1
}

export default function ReferralFormModal({ onClose, onAddPatient }: ReferralFormModalProps) {
  const todayDate = getTodayDate()

  const form = useForm<z.infer<typeof ReferralFormSchema>>({
    resolver: zodResolver(ReferralFormSchema),
    defaultValues: {
      pat_id: "",
      receiver: "Cebu City Health Department",
      sender: "Brgy. San Roque Health Center",
      date: todayDate,
      // transient: false,
      p_lname: "",
      p_fname: "",
      p_mname: "",
      p_age: 0,
      p_gender: "",
      exposure_type: "",
      exposure_site: "",
      biting_animal: "",
      actions_taken: "",
      referredby: "Midwife",
    },
  })

  // State management
  const [patients, setPatients] = useState<SelectOption[]>([])
  const [patientsData, setPatientsData] = useState<PatientRecord[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Track the actual names of custom options
  const [customExposureSiteName, setCustomExposureSiteName] = useState<string>("")
  const [customBitingAnimalName, setCustomBitingAnimalName] = useState<string>("")

  // Static options
  const exposureTypeOptions: SelectOption[] = [
    { id: "Bite", name: "Bite" },
    { id: "Non-bite", name: "Non-bite" },
  ]

  // Initialize state with static options - these will be the dynamic arrays
  const [exposureSites, setExposureSites] = useState<SelectOption[]>([
    { id: "Head", name: "Head" },
    { id: "Neck", name: "Neck" },
    { id: "Hand", name: "Hand" },
    { id: "Foot", name: "Foot" },
    { id: "Trunk", name: "Trunk" },
  ])

  const [bitingAnimals, setBitingAnimals] = useState<SelectOption[]>([
    { id: "Dog", name: "Dog" },
    { id: "Cat", name: "Cat" },
    { id: "Rodent", name: "Rodent" },
  ])

  // Keep track of default options for deletion prevention
  const defaultExposureSiteIds = new Set(["Head", "Neck", "Foot", "Hand", "Trunk"])

  const defaultBitingAnimalIds = new Set(["Dog", "Cat", "Rodent"])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        console.log("🔄 Starting to fetch all form data...")

        // Fetch patients
        const patientData = await getAllPatients()
        console.log("📥 Fetched patients:", patientData)
        if (patientData && patientData.length > 0) {
          const formattedPatients: SelectOption[] = patientData.map((patient: any) => ({
            id: patient.pat_id.toString(),
            name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
          }))
          setPatients(formattedPatients)
          setPatientsData(patientData)
        } else {
          console.warn("⚠️ No patients found in database")
          setPatients([])
          setPatientsData([])
        }

        console.log("✅ All form data fetched successfully!")
      } catch (error) {
        console.error("❌ Error fetching form data:", error)
        setError("Failed to load form data. Please refresh and try again.")
        toast.error("Failed to load form data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePatientSelection = (id: string) => {
    setSelectedPatientId(id)
    const selectedPatient = patientsData.find((p) => p.pat_id.toString() === id)
    // Removed selectedAddress as it's redundant; selectedPatient already holds the necessary info.

    if (selectedPatient) { // Use selectedPatient directly
      const personalInfo = selectedPatient.personal_info
      form.setValue("pat_id", String(selectedPatient.pat_id))
      form.setValue("p_lname", personalInfo?.per_lname || "")
      form.setValue("p_fname", personalInfo?.per_fname || "")
      form.setValue("p_mname", personalInfo?.per_mname || "")
      form.setValue("p_age", personalInfo?.per_dob ? calculateAge(personalInfo.per_dob) : 0)
      form.setValue("p_gender", personalInfo?.per_sex || "")

      const address = selectedPatient.address // Assuming address is directly on the patient object from getAllPatients
      if (address) {
        const fullAddress = [
          address.sitio,
          address.add_street,
          address.add_barangay,
          address.add_city,
          address.add_province,
        ]
          .filter(Boolean)
          .join(", ")

        form.setValue("p_address", fullAddress)
      } else {
        form.setValue("p_address", "")
      }
    } else {
      console.warn("⚠️ Selected patient not found in data")
    }
  }

  // Handle adding new exposure site
  const handleAddExposureSite = (newSite: string, callback?: (newId: string) => void) => {
    const newId = `custom-site-${Date.now()}`
    const newOption: SelectOption = { id: newId, name: newSite }

    setExposureSites((prev) => [...prev, newOption])
    setCustomExposureSiteName(newSite) // Store the actual name
    toast.success(`Added new exposure site: ${newSite}`)

    if (callback) {
      callback(newId)
    }
  }

  // Handle adding new biting animal
  const handleAddBitingAnimal = (newAnimal: string, callback?: (newId: string) => void) => {
    const newId = `custom-animal-${Date.now()}`
    const newOption: SelectOption = { id: newId, name: newAnimal }

    setBitingAnimals((prev) => [...prev, newOption])
    setCustomBitingAnimalName(newAnimal) // Store the actual name
    toast.success(`Added new biting animal: ${newAnimal}`)

    if (callback) {
      callback(newId)
    }
  }

  // Handle deleting exposure site
  const handleDeleteExposureSite = (id: string) => {
    // Don't allow deleting default options
    if (defaultExposureSiteIds.has(id)) {
      toast.error("Cannot delete default exposure sites")
      return
    }

    setExposureSites((prev) => prev.filter((site) => site.id !== id))

    // If the deleted item was selected, clear the form field
    if (form.getValues("exposure_site") === id) {
      form.setValue("exposure_site", "")
    }

    toast.success("Exposure site deleted")
  }

  // Handle deleting biting animal
  const handleDeleteBitingAnimal = (id: string) => {
    // Don't allow deleting default options
    if (defaultBitingAnimalIds.has(id)) {
      toast.error("Cannot delete default biting animals")
      return
    }

    setBitingAnimals((prev) => prev.filter((animal) => animal.id !== id))

    // If the deleted item was selected, clear the form field
    if (form.getValues("biting_animal") === id) {
      form.setValue("biting_animal", "")
    }

    toast.success("Biting animal deleted")
  }

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      console.error("❌ Form validation failed:", form.formState.errors)
      toast.error("Please fill in all required fields correctly")
      return
    }

    const values = form.getValues()
    if (!values.pat_id || !values.exposure_type || !values.biting_animal || !values.referredby) { // Ensure exposure_type is also checked
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Add the actual names for custom options
      const submissionData = { ...values }

      // If exposure_site is a custom ID, add the actual name
      if (values.exposure_site.startsWith("custom-")) {
        // Find the name from the options array
        const option = exposureSites.find((site) => site.id === values.exposure_site)
        submissionData.exposure_site_name = option?.name || customExposureSiteName
      }

      // If biting_animal is a custom ID, add the actual name
      if (values.biting_animal.startsWith("custom-")) {
        // Find the name from the options array
        const option = bitingAnimals.find((animal) => animal.id === values.biting_animal)
        submissionData.biting_animal_name = option?.name || customBitingAnimalName
      }

      const result = await submitAnimalBiteReferral(submissionData)
      toast.success("Animal bite referral submitted successfully!")
      onAddPatient?.(result)
      onClose()
      form.reset()
    } catch (err: any) {
      console.error("❌ Submission error:", err)
      const errorMessage = err?.message || "Submission failed. Please try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading form data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold border-l-4 border-green-600 pl-2">Animal Bites Referral Form</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="p-4 space-y-6"
        >
          {/* Header Information */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormInput control={form.control} name="receiver" label="Receiver" readOnly />
            <FormInput control={form.control} name="sender" label="Sender" readOnly />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <Label>Date</Label>
                  <FormControl>
                    <input
                      type="date"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      readOnly
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* <FormField
              control={form.control}
              name="transient"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-8">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Transient</Label>
                </FormItem>
              )}
            /> */}
          </div>

          {/* Patient Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>

            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Select Patient</Label>
              <div className="max-w-md">
                <Combobox
                  options={patients}
                  value={selectedPatientId}
                  onChange={handlePatientSelection}
                  placeholder="Select a patient"
                  triggerClassName="font-normal w-full"
                  emptyMessage={
                    <div className="flex gap-2 justify-center items-center">
                      <Label className="font-normal text-[13px]">No patient found.</Label>
                      <Link to="/patient-records/new">
                        <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                          Register New Patient
                        </Label>
                      </Link>
                    </div>
                  }
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <FormInput control={form.control} name="p_lname" label="Last Name" readOnly />
              <FormInput control={form.control} name="p_fname" label="First Name" readOnly />
              <FormInput control={form.control} name="p_mname" label="Middle Name" readOnly />
              <FormInput control={form.control} name="p_address" label="Address" readOnly />
              <FormInput control={form.control} name="p_age" label="Age" type="number" readOnly />
              <FormInput control={form.control} name="p_gender" label="Gender" readOnly />
            </div>
          </div>

          {/* Animal Bite Details */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Animal Bite Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="exposure_type"
                render={({ field }) => (
                  <FormItem>
                    <Label>Type of Exposure</Label>
                    <FormControl>
                      <SelectLayout
                        options={exposureTypeOptions}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Select exposure type"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exposure_site"
                render={({ field }) => (
                  <FormItem>
                    <Label>Site of Exposure</Label>
                    <FormControl>
                      <SelectLayoutWithAdd
                        placeholder="Select exposure site"
                        label=""
                        options={exposureSites}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onAdd={(newSite) => {
                          handleAddExposureSite(newSite, (newId) => {
                            field.onChange(newId)
                          })
                        }}
                        onDelete={(id) => handleDeleteExposureSite(id)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="biting_animal"
                render={({ field }) => (
                  <FormItem>
                    <Label>Biting Animal</Label>
                    <FormControl>
                      <SelectLayoutWithAdd
                        placeholder="Select biting animal"
                        label=""
                        options={bitingAnimals}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onAdd={(newAnimal) => {
                          handleAddBitingAnimal(newAnimal, (newId) => {
                            field.onChange(newId)
                          })
                        }}
                        onDelete={(id) => handleDeleteBitingAnimal(id)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormTextArea control={form.control} name="actions_taken" label="Actions Taken" />
              </div>

              <FormInput control={form.control} name="referredby" label="Referred by" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !selectedPatientId} className="w-full sm:w-auto">
              {isSubmitting ? "Submitting..." : "Submit Referral"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
