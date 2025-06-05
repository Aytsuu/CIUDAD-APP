"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import ReferralFormSchema from "@/form-schema/animal-bite-schema"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Link } from "react-router"
import { Combobox } from "@/components/ui/combobox"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { submitAnimalBiteReferral, addBitingAnimal, addExposureSite } from "./db-request/postrequest"
import { getAllPatients, getBitingAnimals, getExposureSites, getStaffMembers } from "./api/get-api"

const SelectField = ({
  name,
  label,
  options,
  control,
}: {
  name: string
  label: string
  options: string[]
  control: any
}) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <Label>{label}</Label>
        <FormControl>
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)

// Custom Combobox with Add functionality
const ComboboxWithAdd = ({
  name,
  label,
  options,
  control,
  onAdd,
  placeholder,
  loading = false,
}: {
  name: string
  label: string
  options: { id: string; name: string }[]
  control: any
  onAdd: (name: string) => Promise<void>
  placeholder: string
  loading?: boolean
}) => {
  const [isAdding, setIsAdding] = useState(false)
  const [newOptionName, setNewOptionName] = useState("")

  const handleAdd = async () => {
    if (!newOptionName.trim()) return

    setIsAdding(true)
    try {
      await onAdd(newOptionName.trim())
      setNewOptionName("")
      toast.success(`${label} added successfully!`)
    } catch (error) {
      toast.error(`Failed to add ${label.toLowerCase()}`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <Label>{label}</Label>
          <FormControl>
            <div className="space-y-2">
              <Combobox
                options={options}
                value={field.value?.toString()}
                onChange={field.onChange}
                placeholder={loading ? "Loading..." : placeholder}
                triggerClassName="font-normal"
                emptyMessage={
                  <div className="flex gap-2 justify-center items-center">
                    <Label className="font-normal text-[13px]">
                      {loading ? "Loading..." : `No ${label.toLowerCase()} found.`}
                    </Label>
                  </div>
                }
              />

              {/* Add new option */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Add new ${label.toLowerCase()}`}
                  value={newOptionName}
                  onChange={(e) => setNewOptionName(e.target.value)}
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAdd}
                  disabled={isAdding || !newOptionName.trim()}
                  className="h-8 px-3"
                >
                  {isAdding ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

type ReferralFormModalProps = {
  onClose: () => void
  onAddPatient?: (patient: any) => void
}

interface PatientRecord {
  personal_info: any
  pat_id: string
  per_fname: string
  per_lname: string
  per_mname: string
  per_dob: string
  per_age: string
  per_sex: string
  per_address: string
}

const getTodayDate = () => {
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
      transient: false,
      p_lname: "",
      p_fname: "",
      p_mname: "",
      p_address: "",
      p_age: 0,
      p_gender: "",
      exposure_type: "",
      exposure_site: "",
      biting_animal: "",
      p_actions: "",
      p_referred: "",
    },
  })

  const [patients, setPatients] = useState<{ id: string; name: string }[]>([])
  const [bitingAnimals, setBitingAnimals] = useState<{ id: string; name: string }[]>([])
  const [exposureSites, setExposureSites] = useState<{ id: string; name: string }[]>([])
  const [staffMembers, setStaffMembers] = useState<{ id: string; name: string }[]>([])
  const [patientsData, setPatientsData] = useState<PatientRecord[]>([])
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log("🔄 Starting to fetch all form data...")

        // Fetch patients
        console.log("📋 Fetching patients...")
        const patientData = await getAllPatients()
        console.log("📋 Raw patient data:", patientData)

        if (patientData && patientData.length > 0) {
          const formattedPatients = patientData.map((patient: any) => ({
            id: patient.pat_id.toString(),
            name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
          }))

          console.log("📋 Formatted patients:", formattedPatients)
          setPatients(formattedPatients)
          setPatientsData(patientData)
        } else {
          console.warn("⚠️ No patients found in database")
          setPatients([])
          setPatientsData([])
        }

        // Fetch biting animals
        console.log("🐕 Fetching biting animals...")
        const animals = await getBitingAnimals()
        if (animals && animals.length > 0) {
          const formattedAnimals = animals.map((animal: any) => ({
            id: animal.animal_id.toString(),
            name: animal.animal_name,
          }))
          console.log("🐕 Formatted animals:", formattedAnimals)
          setBitingAnimals(formattedAnimals)
        } else {
          console.warn("⚠️ No biting animals found")
          setBitingAnimals([])
        }

        // Fetch exposure sites
        console.log("📍 Fetching exposure sites...")
        const sites = await getExposureSites()
        if (sites && sites.length > 0) {
          const formattedSites = sites.map((site: any) => ({
            id: site.exposure_site_id.toString(),
            name: site.exposure_site,
          }))
          console.log("📍 Formatted sites:", formattedSites)
          setExposureSites(formattedSites)
        } else {
          console.warn("⚠️ No exposure sites found")
          setExposureSites([])
        }

        // Fetch staff members
        console.log("👥 Fetching staff members...")
        const staff = await getStaffMembers()
        if (staff && staff.length > 0) {
          const formattedStaff = staff.map((member: any) => ({
            id: member.staff_id?.toString() || member.id?.toString(),
            name: `${member.staff_fname || member.first_name || ""} ${member.staff_lname || member.last_name || ""}`.trim(),
          }))
          console.log("👥 Formatted staff:", formattedStaff)
          setStaffMembers(formattedStaff)
        } else {
          console.warn("⚠️ No staff members found")
          setStaffMembers([])
        }

        console.log("✅ All form data fetched successfully!")
      } catch (error) {
        console.error("❌ Error fetching form data:", error)
        toast.error("Failed to load form data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePatientSelection = (id: string) => {
    console.log("👤 Patient selected with ID:", id)
    setSelectedPatientId(id)
    const selectedPatient = patientsData.find((p) => p.pat_id.toString() === id)

    if (selectedPatient) {
      console.log("👤 Selected patient data:", selectedPatient)
      const personalInfo = selectedPatient.personal_info
      form.setValue("pat_id", String(selectedPatient.pat_id))
      form.setValue("p_lname", personalInfo?.per_lname || "")
      form.setValue("p_fname", personalInfo?.per_fname || "")
      form.setValue("p_mname", personalInfo?.per_mname || "")
      form.setValue("p_address", personalInfo?.per_address || "")
      form.setValue("p_age", personalInfo?.per_dob ? calculateAge(personalInfo.per_dob) : 0)
      form.setValue("p_gender", personalInfo?.per_sex || "")
    } else {
      console.warn("⚠️ Selected patient not found in data")
    }
  }

  const handleAddBitingAnimal = async (animalName: string) => {
    console.log("🐕 Adding new biting animal:", animalName)
    const newAnimal = await addBitingAnimal(animalName)
    const formattedAnimal = {
      id: newAnimal.animal_id.toString(),
      name: newAnimal.animal_name,
    }
    setBitingAnimals((prev) => [...prev, formattedAnimal])
    console.log("🐕 New animal added:", formattedAnimal)
  }

  const handleAddExposureSite = async (siteName: string) => {
    console.log("📍 Adding new exposure site:", siteName)
    const newSite = await addExposureSite(siteName)
    const formattedSite = {
      id: newSite.exposure_site_id.toString(),
      name: newSite.exposure_site,
    }
    setExposureSites((prev) => [...prev, formattedSite])
    console.log("📍 New site added:", formattedSite)
  }

  const onSubmit = async () => {
    console.log("🚀 Form submission started...")
    const isValid = await form.trigger()
    if (!isValid) {
      console.error("❌ Form validation failed:", form.formState.errors)
      return
    }

    const values = form.getValues()
    console.log("📝 Form values before submission:", values)
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await submitAnimalBiteReferral(values)
      console.log("✅ Submission successful:", result)

      toast.success("Animal bite referral submitted successfully!")
      onAddPatient?.(result)
      onClose()
      form.reset()
    } catch (err: any) {
      console.error("❌ Submission error:", err)
      setError(err?.message || "Something went wrong")
      toast.error(err?.message || "Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-3">
      <h2 className="text-xl font-bold mb-4 border-l-4 border-green-600 pl-2">Animal Bites Referral Form</h2>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
          className="p-4 space-y-4"
        >
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
                    <div className="flex items-center">
                      <input
                        type="date"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        readOnly
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="transient"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 mt-3">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <Label>Transient</Label>
                </FormItem>
              )}
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Patient Information</h3>
            <div className="flex flex-col sm:flex-row items-center mb-5 justify-between w-full">
              <div className="w-full max-w-md">
                <Label className="text-sm font-medium mb-2 block">Select Patient</Label>
                <Combobox
                  options={patients}
                  value={selectedPatientId}
                  onChange={handlePatientSelection}
                  placeholder={loading ? "Loading patients..." : "Select a patient"}
                  triggerClassName="font-normal w-full"
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
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: "p_lname", label: "Last Name" },
                { name: "p_fname", label: "First Name" },
                { name: "p_mname", label: "Middle Name" },
                { name: "p_address", label: "Address" },
                { name: "p_age", label: "Age", type: "number" },
                { name: "p_gender", label: "Gender" },
              ].map(({ name, label, type }) => (
                <FormInput key={name} control={form.control} name={name} label={label} type={type} readOnly />
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Animal Bite Details</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <SelectField
                control={form.control}
                name="exposure_type"
                label="Type of Exposure"
                options={["Bite", "Non-bite"]}
              />

              <ComboboxWithAdd
                control={form.control}
                name="exposure_site"
                label="Site of Exposure"
                options={exposureSites}
                onAdd={handleAddExposureSite}
                placeholder="Select site of exposure"
                loading={loading}
              />

              <ComboboxWithAdd
                control={form.control}
                name="biting_animal"
                label="Biting Animal"
                options={bitingAnimals}
                onAdd={handleAddBitingAnimal}
                placeholder="Select biting animal"
                loading={loading}
              />

              <FormTextArea control={form.control} name="p_actions" label="Actions Taken" className="md:col-span-2" />

              <FormField
                control={form.control}
                name="p_referred"
                render={({ field }) => (
                  <FormItem>
                    <Label>Referred by</Label>
                    <FormControl>
                      <Combobox
                        options={staffMembers}
                        value={field.value?.toString()}
                        onChange={field.onChange}
                        placeholder={loading ? "Loading staff..." : "Select staff member"}
                        triggerClassName="font-normal"
                        emptyMessage={
                          <div className="flex gap-2 justify-center items-center">
                            <Label className="font-normal text-[13px]">
                              {loading ? "Loading..." : "No staff found."}
                            </Label>
                          </div>
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-4 mt-6 mb-6">

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
