"use client"
import { useState, useMemo, useEffect } from "react"
import React from "react"
import { ChevronLeft, Edit, AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useParams } from "react-router"
import { toast } from "sonner"

import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CardLayout from "@/components/ui/card/card-layout"
import { calculateAge } from "@/helpers/ageCalculator"
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema"
import {PatientData,ChildHealthRecord} from "./types"
import PersonalInfoTab from "./PersonalInfoTab"
import Records from "./Records"
import VisitHistoryTab from "./VisitHistoryTab"
import { useUpdatePatient } from "../queries/update"
import { usePatientDetails } from "../queries/fetch"
import { useChildHealthRecords } from "../queries/fetch"
import { useMedConCount, useChildHealthRecordCount } from "../queries/count"
import { useMedicineCount } from "@/pages/healthServices/medicineservices/queries/MedCountQueries"
import { useVaccinationCount } from "@/pages/healthServices/vaccination/queries/VacCount"
import { useFirstAidCount } from "@/pages/healthServices/firstaidservices/queries/FirstAidCountQueries"
import { useCompletedFollowUpVisits, usePendingFollowUpVisits } from "../queries/followv"
import { usePatientPostpartumCount, usePatientPrenatalCount } from "../../../../healthServices/maternal/queries/maternalFetchQueries"


export default function ViewPatientRecord() {
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "visits">("personal")
  const [isEditable, setIsEditable] = useState(false)
  const { patientId } = useParams<{ patientId: string }>()
  const { data: patientsData, error, isError } = usePatientDetails(patientId ?? "")
  const { data: rawChildHealthRecords } = useChildHealthRecords(patientId);
  const { data: medicineCountData } = useMedicineCount(patientId ?? "")
  const medicineCount = medicineCountData?.medicinerecord_count
  const { data: vaccinationCountData } = useVaccinationCount(patientId ?? "")
  const vaccinationCount = vaccinationCountData?.vaccination_count
  const { data: firstAidCountData } = useFirstAidCount(patientId ?? "")
  const firstAidCount = firstAidCountData?.firstaidrecord_count
  const { data: childHealthCount } = useChildHealthRecordCount(patientId ?? "")
  const childHealthCountData = childHealthCount?.childhealthrecord_count
  const { data: medconCountData } = useMedConCount(patientId ?? "")
  const medconCount = medconCountData?.medcon_count
  const { data: completedData } = useCompletedFollowUpVisits(patientId ?? "")
  const { data: pendingData } = usePendingFollowUpVisits(patientId ?? "")
  const { data: postpartumCountData } = usePatientPostpartumCount(patientId ?? "")
  const postpartumCount = postpartumCountData
  const { data: prenatalCountData } = usePatientPrenatalCount(patientId ?? "")
  const prenatalCount = prenatalCountData
  const updatePatientData = useUpdatePatient()

  const currentPatient = useMemo(() => {
    if (!patientsData || !patientId) return null
    if ("pat_id" in patientsData && patientsData.pat_id === patientId) {
      return patientsData as PatientData
    }
    const patientArray = Array.isArray(patientsData) ? patientsData : (patientsData.results ?? patientsData.data ?? [])
    return patientArray.find((patient: PatientData) => patient.pat_id === patientId) ?? null
  }, [patientsData, patientId])

  useEffect(() => {
    if (currentPatient) {
      console.log("Current Patient Data:", currentPatient)
      console.log("Address Object:", currentPatient.address)
      console.log("Individual Address Fields:", {
        street: currentPatient.address?.add_street,
        barangay: currentPatient.address?.add_barangay,
        city: currentPatient.address?.add_city,
        province: currentPatient.address?.add_province,
        sitio: currentPatient.address?.add_sitio,
      })
    }
  }, [currentPatient])

  const patientData = useMemo(() => {
    if (!currentPatient) return null
    return {
      lastName: currentPatient.personal_info.per_lname,
      firstName: currentPatient.personal_info.per_fname,
      middleName: currentPatient.personal_info.per_mname,
      sex: currentPatient.personal_info.per_sex,
      contact: currentPatient.personal_info.per_contact,
      dateOfBirth: currentPatient.personal_info.per_dob,
      patientType: currentPatient.pat_type,
      houseNo: currentPatient.households[0]?.hh_id ?? "N/A",
      address: {
        street: currentPatient.address?.add_street || "",
        sitio: currentPatient.address?.add_sitio || "",
        barangay: currentPatient.address?.add_barangay || "",
        city: currentPatient.address?.add_city || "",
        province: currentPatient.address?.add_province || "",
      },
      bloodType: currentPatient.bloodType ?? "N/A",
      allergies: currentPatient.allergies ?? "N/A",
      chronicConditions: currentPatient.chronicConditions ?? "N/A",
      lastVisit: currentPatient.lastVisit ?? "",
      visits: currentPatient.visits ?? [],
    }
  }, [currentPatient])

  const form = useForm({
    resolver: zodResolver(patientRecordSchema),
    defaultValues: patientData ?? {
      lastName: "",
      firstName: "",
      middleName: "",
      sex: "",
      contact: "",
      dateOfBirth: "",
      patientType: "",
      houseNo: "",
      address: { street: "", sitio: "", barangay: "", city: "", province: "" },
    },
  })

  useEffect(() => {
    if (patientData) form.reset(patientData)
  }, [patientData, form])

  const getInitials = () => (patientData ? `${patientData.firstName[0] ?? ""}${patientData.lastName[0] ?? ""}` : "")



  const getFullAddress = () => {
    if (!currentPatient || !currentPatient.address) return "No address provided"
    const addressParts = [
      currentPatient.address.add_street,
      currentPatient.address.add_sitio,
      currentPatient.address.add_barangay,
      currentPatient.address.add_city,
      currentPatient.address.add_province,
    ].filter((part) => part && part.trim() !== "" && part.toLowerCase() !== "n/a")
    return addressParts.length > 0 ? addressParts.join(", ") : "No address provided"
  }

  const getAddressField = (field: string | undefined | null): string => {
    if (!field || field.trim() === "" || field.toLowerCase() === "n/a") {
      return ""
    }
    return field.trim()
  }

  const patientLinkData = useMemo(() => {
    console.log("Creating patientLinkData with currentPatient:", currentPatient)

    const linkData = {
      pat_id: currentPatient?.pat_id ?? patientId ?? "",
      pat_type: currentPatient?.pat_type ?? patientData?.patientType ?? "",
      age: patientData ? calculateAge(patientData.dateOfBirth).toString() : "0",
      addressFull: getFullAddress(),
      address: {
        add_street: getAddressField(currentPatient?.address?.add_street),
        add_barangay: getAddressField(currentPatient?.address?.add_barangay),
        add_city: getAddressField(currentPatient?.address?.add_city),
        add_province: getAddressField(currentPatient?.address?.add_province),
        add_sitio: getAddressField(currentPatient?.address?.add_sitio),
      },
      households: [
        {
          hh_id: currentPatient?.households[0]?.hh_id ?? patientData?.houseNo ?? "",
        },
      ],
      personal_info: {
        per_fname: currentPatient?.personal_info.per_fname ?? patientData?.firstName ?? "",
        per_mname: currentPatient?.personal_info.per_mname ?? patientData?.middleName ?? "",
        per_lname: currentPatient?.personal_info.per_lname ?? patientData?.lastName ?? "",
        per_dob: currentPatient?.personal_info.per_dob ?? patientData?.dateOfBirth ?? "",
        per_sex: currentPatient?.personal_info.per_sex ?? patientData?.sex ?? "",
      },
    }

    console.log("Generated patientLinkData:", linkData)
    console.log("Address in patientLinkData:", linkData.address)

    return linkData
  }, [currentPatient, patientData, patientId])

  const formatFullAddressForChildHealth = (address: any): string => {
    if (!address) return "No address provided"
    const addressParts = [
      address.add_street,
      address.add_sitio,
      address.add_barangay,
      address.add_city,
      address.add_province,
    ].filter((part) => part && part.trim() !== "" && part.toLowerCase() !== "n/a")
    return addressParts.length > 0 ? addressParts.join(", ") : "No address provided"
  }

  const formatChildHealthData = React.useCallback((): ChildHealthRecord[] => {
    if (!rawChildHealthRecords || !rawChildHealthRecords.child_health_histories) return []
    return rawChildHealthRecords.child_health_histories.map((record: any) => {
      const chrecDetails = record.chrec_details || {}
      const patrecDetails = chrecDetails.patrec_details || {}
      const patDetails = patrecDetails.pat_details || {}
      const childInfo = patDetails.personal_info || {}
      const addressInfo = patDetails.address || {}
      const familyHeadInfo = patDetails.family_head_info || {}
      const motherInfo = familyHeadInfo.family_heads?.mother?.personal_info || {}
      const fatherInfo = familyHeadInfo.family_heads?.father?.personal_info || {}
      const vitalSigns = record.child_health_vital_signs?.[0]?.bm_details || {}

      return {
        chrec_id: chrecDetails.chrec_id || 0,
        pat_id: patDetails.pat_id || "",
        fname: childInfo.per_fname || "",
        lname: childInfo.per_lname || "",
        mname: childInfo.per_mname || "",
        sex: childInfo.per_sex || "",
        age: calculateAge(childInfo.per_dob).toString(),
        dob: childInfo.per_dob || "",
        householdno: patDetails.households?.[0]?.hh_id || "",
        street: addressInfo.add_street || "",
        sitio: addressInfo.add_sitio || "",
        barangay: addressInfo.add_barangay || "",
        city: addressInfo.add_city || "",
        province: addressInfo.add_province || "",
        landmarks: addressInfo.add_landmarks || "",
        pat_type: patDetails.pat_type || "",
        address: formatFullAddressForChildHealth(addressInfo),
        mother_fname: motherInfo.per_fname || "",
        mother_lname: motherInfo.per_lname || "",
        mother_mname: motherInfo.per_mname || "",
        mother_contact: motherInfo.per_contact || "",
        mother_occupation: motherInfo.per_occupation || chrecDetails.mother_occupation || "",
        father_fname: fatherInfo.per_fname || "",
        father_lname: fatherInfo.per_lname || "",
        father_mname: fatherInfo.per_mname || "",
        father_contact: fatherInfo.per_contact || "",
        father_occupation: fatherInfo.per_occupation || chrecDetails.father_occupation || "",
        family_no: chrecDetails.family_no || "",
        birth_weight: Number.parseFloat(vitalSigns.weight) || 0,
        birth_height: Number.parseFloat(vitalSigns.height) || 0,
        type_of_feeding: chrecDetails.type_of_feeding || "Unknown",
        delivery_type: chrecDetails.place_of_delivery_type || "",
        place_of_delivery_type: chrecDetails.place_of_delivery_type || "",
        pod_location: chrecDetails.pod_location || "",
        birth_order: chrecDetails.birth_order || 0,
        tt_status: record.tt_status || "",
      }
    })
    
  }, [rawChildHealthRecords])


  const formattedChildHealthData = formatChildHealthData()

  const handleEdit = () => {
    setIsEditable(true)
  }

  const handleSaveEdit = async () => {
    try {
      const formData = form.getValues()
      if (!currentPatient?.trans_id) {
        toast.error("Cannot update: Missing transient ID.")
        return
      }
      const updatedData = {
        pat_type: formData.patientType,
        transient_data: {
          trans_id: currentPatient?.trans_id,
          tran_lname: formData.lastName,
          tran_fname: formData.firstName,
          tran_mname: formData.middleName,
          tran_dob: formData.dateOfBirth,
          tran_sex: formData.sex,
          tran_contact: formData.contact,
          tran_status: "Active",
          tran_ed_attainment: "N/A",
          tran_religion: "N/A",
          address: {
            tradd_street: formData.address.street,
            tradd_sitio: formData.address.sitio,
            tradd_barangay: formData.address.barangay,
            tradd_city: formData.address.city,
            tradd_province: formData.address.province,
          },
        },
      }
      await updatePatientData.mutateAsync(updatedData)
      setIsEditable(false)
      toast.success("Patient data updated successfully!")
    } catch (error) {
      console.error("Error saving patient data: ", error)
      toast.error("Failed to update patient data. Please try again.")
    }
  }

  const handleCancelEdit = () => {
    if (patientData) form.reset(patientData)
    setIsEditable(false)
    toast("Edit cancelled. No changes were made.")
  }

  if (isError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Patient Not Found</strong>
            <br />
            {error instanceof Error ? error.message : "The requested patient could not be found."}
            <br />
            <span className="text-sm">Patient ID: {patientId}</span>
          </AlertDescription>
        </Alert>
        <Button onClick={() => window.history.back()} variant="outline" className="mt-4">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    )
  }

  if (!patientData) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">No patient data available</p>
      </div>
    )
  }

  const isTransient = patientData?.patientType?.toLowerCase() === "transient"

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">Patient Record</h1>
          <p className="text-xs sm:text-sm text-darkGray">View patient information</p>
        </div>
        <div className="flex gap-2 sm:ml-auto">
          {isTransient && activeTab === "personal" && (
            <Button onClick={handleEdit} className="gap-1 bg-buttonBlue hover:bg-buttonBlue/90">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )}
        </div>
      </div>
      <Separator className="bg-gray mb-4 sm:mb-6" />
      <div className="mb-6">
        <CardLayout
          title=""
          description=""
          content={
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Avatar className="h-16 w-16 border-2 border-primary/10">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">
                  {`${patientData.firstName} ${
                    patientData.middleName ? patientData.middleName + " " : ""
                  }${patientData.lastName}`}
                </h2>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>
                    ID: <span className="font-medium text-foreground">{patientId}</span>
                  </span>
                  <span>•</span>
                  <span>{calculateAge(patientData.dateOfBirth)}</span>
                  <span>•</span>
                  <span>{patientData.sex.toLowerCase() === "male" ? "Male" : "Female"}</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge variant={patientData.patientType === "Resident" ? "default" : "secondary"}>
                    {patientData.patientType}
                  </Badge>
                </div>
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg"
          headerClassName="hidden"
          contentClassName="p-4"
        />
      </div>
      
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "personal" | "medical" | "visits")}
        className="ml-2"
      >
        <TabsList className="mb-4 bg-background border-b w-full justify-start rounded-none h-auto p-0 space-x-6">
          <TabsTrigger
            value="personal"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent ml-6"
          >
            Personal Information
          </TabsTrigger>
          <TabsTrigger
            value="medical"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Records
          </TabsTrigger>
          <TabsTrigger
            value="visits"
            className="py-3 px-0 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent"
          >
            Follow up Visits
          </TabsTrigger>
        </TabsList>

        {activeTab === "personal" && (
          <PersonalInfoTab
            form={form}
            isEditable={isEditable}
            isTransient={isTransient}
            patientData={patientData}
            handleSaveEdit={handleSaveEdit}
            handleCancelEdit={handleCancelEdit}
          />
        )}

        {activeTab === "medical" && (
          <Records
            vaccinationCount={vaccinationCount}
            medicineCount={medicineCount}
            firstAidCount={firstAidCount}
            postpartumCount={postpartumCount}
            patientLinkData={patientLinkData}
            medicalconCount={medconCount}
            childHealthCount={childHealthCountData}
            childHealthRecords={formattedChildHealthData}
            prenatalCount={prenatalCount}
          />
        )}

        {activeTab === "visits" && (
          <VisitHistoryTab completedData={completedData} pendingData={pendingData} />
        )}
      </Tabs>
    </div>
  )
}