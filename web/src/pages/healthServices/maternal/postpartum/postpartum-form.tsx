"use client"

import { useFormContext, type UseFormReturn } from "react-hook-form"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import type { z } from "zod"

import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { Button } from "@/components/ui/button/button"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input"
import { Separator } from "@/components/ui/separator"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormTextArea } from "@/components/ui/form/form-text-area"
import { DataTable } from "@/components/ui/table/data-table"
import type { ColumnDef } from "@tanstack/react-table"
import { Label } from "@/components/ui/label"
import { PatientSearch } from "@/components/ui/patientSearch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

import type { PostPartumSchema } from "@/form-schema/maternal/postpartum-schema"
import { useAddPostpartumRecord } from "../queries/maternalAddQueries"
import {
  transformPostpartumFormData,
  validatePostpartumFormData,
} from "@/pages/healthServices/maternal/postpartum/postpartumFormHelpers"
import { toast } from "sonner"

// Updated interface to match the expected Patient type
interface Patient {
  pat_id: string
  pat_type: string
  family?: {
    fam_id: string
    fc_id: string
    fc_role: string
  }
  personal_info?: {
    per_fname?: string
    per_lname?: string
    per_mname?: string
    per_dob?: string
    per_sex?: string
  }
  address?: {
    add_street?: string
    add_barangay?: string
    add_city?: string
    add_province?: string
    sitio?: string
  }
  family_head_info?: {
    family_heads?: {
      father?: {
        personal_info?: {
          per_fname?: string
          per_mname?: string
          per_lname?: string
          per_dob?: string
        }
      }
    }
  }
  spouse_info?: {
    spouse_info?: {
      spouse_fname?: string
      spouse_lname?: string
      spouse_mname?: string
      spouse_dob?: string
    }
  }
}

type PostpartumTableType = {
  date: string
  lochialDischarges?: string
  bp: string
  feeding: string
  findings: string
  nursesNotes: string | "None"
}

const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

export default function PostpartumFormFirstPg({
  form,
  onSubmit,
}: {
  form: UseFormReturn<z.infer<typeof PostPartumSchema>>
  onSubmit: () => void
}) {
  const { setValue, getValues } = useFormContext()
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [postpartumCareData, setPostpartumCareData] = useState<PostpartumTableType[]>([])
  const [formErrors, setFormErrors] = useState<string[]>([])
  const navigate = useNavigate()

  const addPostpartumMutation = useAddPostpartumRecord()

  const handlePatientSelection = (patient: Patient | null, patientId: string) => {
    console.log("Selected Patient:", patient)
    console.log("Patient ID from callback:", patientId)

    if (!patient) {
      setSelectedPatientId("")
      setSelectedPatient(null)
      form.reset({
        mothersPersonalInfo: {
          familyNo: "",
          motherLName: "",
          motherFName: "",
          motherMName: "",
          motherAge: "",
          husbandLName: "",
          husbandFName: "",
          husbandMName: "",
          husbandDob: "",
          address: {
            street: "",
            sitio: "",
            barangay: "",
            city: "",
            province: "",
          },
        },
        postpartumInfo: {
          dateOfDelivery: "",
          timeOfDelivery: "",
          placeOfDelivery: "",
          outcome: "",
          attendedBy: "",
          ttStatus: "",
          ironSupplement: "",
          vitASupplement: "",
          noOfPadPerDay: "",
          mebendazole: "",
          dateBfInitiated: "",
          timeBfInitiated: "",
          nextVisitDate: "",
          lochialDischarges: "",
        },
        postpartumTable: {
          date: today,
          bp: {
            systolic: "",
            diastolic: "",
          },
          feeding: "",
          findings: "",
          nursesNotes: "",
        },
      })
      return
    }

    const actualPatientId = patient.pat_id
    console.log("Using Patient ID:", actualPatientId)

    // check if patient ID is not NaN or empty
    if (!actualPatientId || actualPatientId.trim() === "" || actualPatientId.toLowerCase() === "nan") {
      toast.error("Invalid patient ID. Please select a different patient.")
      console.error("Invalid patient ID:", actualPatientId)
      return
    }

    setSelectedPatientId(actualPatientId)
    setSelectedPatient(patient)

    if (patient && patient.personal_info) {
      const personalInfo = patient.personal_info
      const address = patient.address
      const familyHeadFather = patient.family_head_info?.family_heads?.father?.personal_info
      const spouse = patient.spouse_info?.spouse_info

      form.setValue("mothersPersonalInfo.familyNo", patient.family?.fam_id || "")
      form.setValue("mothersPersonalInfo.motherLName", personalInfo?.per_lname || "")
      form.setValue("mothersPersonalInfo.motherFName", personalInfo?.per_fname || "")
      form.setValue("mothersPersonalInfo.motherMName", personalInfo?.per_mname || "")
      form.setValue(
        "mothersPersonalInfo.motherAge",
        personalInfo?.per_dob ? String(calculateAge(personalInfo.per_dob)) : "",
      )
      form.setValue("mothersPersonalInfo.husbandLName", familyHeadFather?.per_lname || "")
      form.setValue("mothersPersonalInfo.husbandFName", familyHeadFather?.per_fname || "")
      form.setValue("mothersPersonalInfo.husbandMName", familyHeadFather?.per_mname || "")
      form.setValue("mothersPersonalInfo.husbandDob", familyHeadFather?.per_dob || "")

      if (address) {
        form.setValue("mothersPersonalInfo.address.street", address.add_street || "")
        form.setValue("mothersPersonalInfo.address.sitio", address.sitio || "")
        form.setValue("mothersPersonalInfo.address.barangay", address.add_barangay || "")
        form.setValue("mothersPersonalInfo.address.city", address.add_city || "")
        form.setValue("mothersPersonalInfo.address.province", address.add_province || "")
      }

      if (spouse) {
        form.setValue("mothersPersonalInfo.husbandLName", spouse.spouse_lname || "")
        form.setValue("mothersPersonalInfo.husbandFName", spouse.spouse_fname || "")
        form.setValue("mothersPersonalInfo.husbandMName", spouse.spouse_mname || "")
        form.setValue("mothersPersonalInfo.husbandDob", spouse.spouse_dob || "")
      }
    }
  }

  const postpartumTableColumns: ColumnDef<PostpartumTableType>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => <div className="text-center">{row.original.date}</div>,
    },
    {
      accessorKey: "lochialDischarges",
      header: "Lochial Discharges",
      cell: ({ row }) => <div className="text-center">{row.original.lochialDischarges}</div>,
    },
    {
      accessorKey: "bp",
      header: "BP",
      cell: ({ row }) => <div className="text-center">{row.original.bp}</div>,
    },
    {
      accessorKey: "feeding",
      header: "Feeding",
      cell: ({ row }) => <div className="text-center">{row.original.feeding}</div>,
    },
    {
      accessorKey: "findings",
      header: "Findings",
      cell: ({ row }) => <div className="text-center">{row.original.findings}</div>,
    },
    {
      accessorKey: "nursesNotes",
      header: "Nurses Notes",
      cell: ({ row }) => <div className="text-center">{row.original.nursesNotes}</div>,
    },
  ]

  // Date setup
  const today = new Date().toLocaleDateString("en-CA")

  useEffect(() => {
    form.setValue("postpartumTable.date", today)
  }, [setValue, today])

  const addPostpartumCare = () => {
    const date = getValues("postpartumTable.date")
    const lochialDischarges = getValues("postpartumInfo.lochialDischarges")
    const systolic = Number.parseInt(getValues("postpartumTable.bp.systolic"), 10)
    const diastolic = Number.parseInt(getValues("postpartumTable.bp.diastolic"), 10)
    const feeding = getValues("postpartumTable.feeding")
    const findings = getValues("postpartumTable.findings")
    const nursesNotes = getValues("postpartumTable.nursesNotes") || "None"

    const feedingOptions = [
      { id: "0", name: "Select" },
      { id: "1", name: "Exclusive Breastfeeding" },
      { id: "2", name: "Mixed Feeding" },
      { id: "3", name: "Formula Feeding" },
    ]

    const lochialOptions = [
      { id: "0", name: "Select" },
      { id: "1", name: "Lochia Rubra" },
      { id: "2", name: "Lochia Serosa" },
      { id: "3", name: "Lochia Alba" },
    ]

    // Convert IDs to names
    const feedingName = feedingOptions.find((option) => option.id === feeding)?.name || feeding
    const lochialName = lochialOptions.find((option) => option.id === lochialDischarges)?.name || lochialDischarges

    if (
      date &&
      !isNaN(systolic) &&
      !isNaN(diastolic) &&
      feeding &&
      feeding !== "0" &&
      lochialDischarges &&
      lochialDischarges !== "0"
    ) {
      setPostpartumCareData((prev) => [
        ...prev,
        {
          date: date, // Use the actual date from form
          lochialDischarges: lochialName,
          bp: `${systolic} / ${diastolic}`,
          feeding: feedingName,
          findings: findings || "Normal",
          nursesNotes: nursesNotes,
        },
      ])

      // Clear form fields
      form.setValue("postpartumTable.date", today)
      form.setValue("postpartumInfo.lochialDischarges", "")
      form.setValue("postpartumTable.bp.systolic", "")
      form.setValue("postpartumTable.bp.diastolic", "")
      form.setValue("postpartumTable.feeding", "")
      form.setValue("postpartumTable.findings", "")
      form.setValue("postpartumTable.nursesNotes", "")
    } else {
      toast.error("Please fill in all required fields for the assessment including lochial discharges")
    }
  }

  const handleFormSubmit = async () => {
    const formData = form.getValues()

    // Validate form data
    const errors = validatePostpartumFormData(formData, selectedPatientId, postpartumCareData)

    if (errors.length > 0) {
      setFormErrors(errors)
      toast.error("Please fix the form errors before submitting")
      return
    }

    if (!selectedPatient) {
      toast.error("Please select a patient first")
      return
    }

    if (!selectedPatientId || selectedPatientId.trim() === "" || selectedPatientId.toLowerCase() === "nan") {
      toast.error("Invalid patient ID selected")
      console.error("Invalid patient ID:", selectedPatientId)
      return
    }

    setFormErrors([])

    try {
      const transformedData = transformPostpartumFormData(formData, selectedPatientId, postpartumCareData)

      console.log("Submitting postpartum data:", transformedData)

      const success = await addPostpartumMutation.mutateAsync(transformedData)

      onSubmit()
      if (success) {
        navigate(-1)
      }
    } catch (error) {
      console.error("Error submitting postpartum form:", error)
    }
  }

  const submit = () => {
    form.trigger(["mothersPersonalInfo", "postpartumInfo", "postpartumTable"]).then((isValid) => {
      if (isValid) {
        handleFormSubmit()
      }
    })
  }

  const nextVisitDate = form.watch("postpartumInfo.nextVisitDate")

  return (
    <LayoutWithBack title="Postpartum Form" description="Fill out the postpartum form with the mother's information.">
      <div>
        <PatientSearch onPatientSelect={handlePatientSelection} />
      </div>

      {/* Form Errors */}
      {formErrors.length > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {formErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white flex flex-col min-h-0 h-auto md:p-10 rounded-lg overflow-auto mt-2">
        <div className="pb-4">
          <h2 className="text-3xl font-bold text-center mt-12">POSTPARTUM RECORD</h2>
        </div>

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <div className="flex mt-10">
              <FormInput
                control={form.control}
                label="Family No."
                name="mothersPersonalInfo.familyNo"
                placeholder="Family No."
              />
            </div>

            <div className="mt-10 mb-3">
              <Label className="text-lg">Personal Information</Label>
              <Separator className="mt-2" />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-4">
              <FormInput
                control={form.control}
                label="Last Name"
                name="mothersPersonalInfo.motherLName"
                placeholder="Last Name"
              />
              <FormInput
                control={form.control}
                label="First Name"
                name="mothersPersonalInfo.motherFName"
                placeholder="First Name"
              />
              <FormInput
                control={form.control}
                label="Middle Name"
                name="mothersPersonalInfo.motherMName"
                placeholder="Middle Name"
              />
              <FormInput control={form.control} label="Age" name="mothersPersonalInfo.motherAge" placeholder="Age" />

              <FormInput
                control={form.control}
                label="Husband's Last Name"
                name="mothersPersonalInfo.husbandLName"
                placeholder="Last Name (optional)"
              />
              <FormInput
                control={form.control}
                label="Husband's First Name"
                name="mothersPersonalInfo.husbandFName"
                placeholder="First Name (optional)"
              />
              <FormInput
                control={form.control}
                label="Husband's Middle Name"
                name="mothersPersonalInfo.husbandMName"
                placeholder="Middle Name (optional)"
              />
              <FormDateTimeInput
                control={form.control}
                type="date"
                label="Husband's Date of Birth"
                name="mothersPersonalInfo.husbandDob"
              />
            </div>
            <div className="grid grid-cols-5 gap-4 mt-4">
              <FormInput
                control={form.control}
                label="Street"
                name="mothersPersonalInfo.address.street"
                placeholder="Street"
              />
              <FormInput
                control={form.control}
                label="Sitio"
                name="mothersPersonalInfo.address.sitio"
                placeholder="Sitio"
              />
              <FormInput
                control={form.control}
                label="Barangay"
                name="mothersPersonalInfo.address.barangay"
                placeholder="Barangay"
              />
              <FormInput
                control={form.control}
                label="City"
                name="mothersPersonalInfo.address.city"
                placeholder="City"
              />
              <FormInput
                control={form.control}
                label="Province"
                name="mothersPersonalInfo.address.province"
                placeholder="Province"
              />
            </div>

            <div className="mt-10 mb-3">
              <Label className="text-lg">Delivery and Other Information</Label>
              <Separator className="mt-2" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <FormDateTimeInput
                control={form.control}
                label="Date of Delivery"
                name="postpartumInfo.dateOfDelivery"
                type="date"
              />
              <FormDateTimeInput
                control={form.control}
                label="Time of Delivery"
                name="postpartumInfo.timeOfDelivery"
                type="time"
              />
              <FormInput
                control={form.control}
                label="Place of Delivery"
                name="postpartumInfo.placeOfDelivery"
                placeholder="Place of Delivery"
              />
              <FormSelect
                control={form.control}
                label="Outcome"
                name="postpartumInfo.outcome"
                options={[
                  { id: "0", name: "Select" },
                  { id: "1", name: "Fullterm" },
                  { id: "2", name: "Preterm" },
                ]}
              />

              <FormInput
                control={form.control}
                label="Attended By"
                name="postpartumInfo.attendedBy"
                placeholder="Attended By"
              />
              <FormSelect
                control={form.control}
                label="Tetanus Toxoid Status"
                name="postpartumInfo.ttStatus"
                options={[
                  { id: "tt1", name: "TT1" },
                  { id: "tt2", name: "TT2" },
                  { id: "tt3", name: "TT3" },
                  { id: "tt4", name: "TT4" },
                  { id: "tt5", name: "TT5" },
                  { id: "fim", name: "FIM" },
                ]}
              />
              <FormDateTimeInput
                control={form.control}
                label="Iron Supplement"
                name="postpartumInfo.ironSupplement"
                type="date"
              />
              <FormDateTimeInput
                control={form.control}
                label="Vitamin A Supplement"
                name="postpartumInfo.vitASupplement"
                type="date"
              />

              <FormInput
                control={form.control}
                label="Number of Pads per Day"
                name="postpartumInfo.noOfPadPerDay"
                placeholder="Number of Pads per Day"
              />
              <FormDateTimeInput
                control={form.control}
                label="Mebendazole"
                name="postpartumInfo.mebendazole"
                type="date"
              />
              <FormDateTimeInput
                control={form.control}
                label="Date Breastfeeding Initiated"
                name="postpartumInfo.dateBfInitiated"
                type="date"
              />
              <FormDateTimeInput
                control={form.control}
                label="Time Breastfeeding Initiated"
                name="postpartumInfo.timeBfInitiated"
                type="time"
              />
            </div>

            <div className="mt-10 mb-3">
              <Label className="text-lg">Schedule</Label>
              <Separator className="mt-2" />
            </div>
            <div className="flex flex-col gap-4 mt-4">
              <FormDateTimeInput
                control={form.control}
                label="Date of next visit"
                name="postpartumInfo.nextVisitDate"
                type="date"
              />
              {nextVisitDate && ( // Only display if a date is selected
                <div className="bg-gray-50 p-4 rounded-md border">
                  <p className="text-sm font-medium text-gray-700">Scheduled Follow-up:</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {nextVisitDate
                      ? new Date(nextVisitDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">Description: Postpartum Follow-up Visit</p>
                </div>
              )}
            </div>

            {/* Postpartum table fields */}
            <Separator className="my-10" />
            <div className="border rounded-md p-5">
              <div className="flex">
                <FormDateTimeInput control={form.control} type="date" name="postpartumTable.date" label="Date" />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <Label className="text-black/70">BP</Label>
                <Label className="text-black/70">Feeding</Label>
                <Label className="text-black/70">Lochial Discharges</Label>

                <div className="grid grid-cols-2 gap-4 mt-[8px]">
                  <FormInput
                    control={form.control}
                    name="postpartumTable.bp.systolic"
                    placeholder="Systolic"
                    type="number"
                  />
                  <FormInput
                    control={form.control}
                    name="postpartumTable.bp.diastolic"
                    placeholder="Diastolic"
                    type="number"
                  />
                </div>

                <FormSelect
                  control={form.control}
                  name="postpartumTable.feeding"
                  options={[
                    { id: "0", name: "Select" },
                    { id: "1", name: "Exclusive Breastfeeding" },
                    { id: "2", name: "Mixed Feeding" },
                    { id: "3", name: "Formula Feeding" },
                  ]}
                />
                <FormSelect
                  control={form.control}
                  label=""
                  name="postpartumInfo.lochialDischarges"
                  options={[
                    { id: "0", name: "Select" },
                    { id: "1", name: "Lochia Rubra" },
                    { id: "2", name: "Lochia Serosa" },
                    { id: "3", name: "Lochia Alba" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormTextArea
                  control={form.control}
                  label="Findings"
                  name="postpartumTable.findings"
                  placeholder="Enter findings"
                />
                <FormTextArea
                  control={form.control}
                  label="Nurses Notes"
                  name="postpartumTable.nursesNotes"
                  placeholder="Enter nurses notes"
                />
              </div>
              <div className="mt-6 flex justify-end">
                <Button type="button" onClick={addPostpartumCare}>
                  Add Assessment
                </Button>
              </div>

              <div className="mt-5">
                <DataTable columns={postpartumTableColumns} data={postpartumCareData} />
              </div>
            </div>

            <div className="mt-8 sm:mt-auto flex justify-end">
              <Button
                type="submit"
                className="mt-4 mr-4 sm-w-32"
                disabled={addPostpartumMutation.isPending || !selectedPatient}
              >
                {addPostpartumMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Record
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </LayoutWithBack>
  )
}
