"use client"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft } from "lucide-react"
import ChildHRPage1 from "./child-hr-page1"
import ChildHRPage2 from "./child-hr-page2"
import ChildHRPage3 from "./child-hr-page3"
import LastPage from "./child-hr-page-last"
import { api2 } from "@/api/api"
import { useAuth } from "@/context/AuthContext"
import type { FormData, VitalSignType } from "@/form-schema/chr-schema/chr-schema"
import { calculateAge, calculateAgeFromDOB } from "@/helpers/ageCalculator"
import { useChildHealthRecordMutation } from "../restful-api/add-record"
import { useUpdateChildHealthRecordMutation } from "../restful-api/edit-record"

export type Medicine = {
  minv_id: string
  medrec_qty: number
  reason: string
  name?: string
  dosage?: number
  dosageUnit?: string
  form?: string
}

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

  },
  birthwt: {
    seen: "",
    given_iron: "",
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
  vaccines: [],
  hasExistingVaccination: false,
  existingVaccines: [],
  created_at: "",
  chhist_status: "",
}

export const isToday = (dateString: string) => {
  if (!dateString) return false
  const today = new Date().toISOString().split("T")[0]
  const checkDate = dateString.split("T")[0]
  return today === checkDate
}

export function areDifferent(val1: any, val2: any): boolean {
  if (val1 === val2) return false
  if (val1 === null || val1 === undefined || val1 === "") {
    return !(val2 === null || val2 === undefined || val2 === "")
  }
  if (val2 === null || val2 === undefined || val2 === "") {
    return !(val1 === null || val1 === undefined || val1 === "")
  }
  if (typeof val1 === "number" && typeof val2 === "number") {
    return val1 !== val2
  }
  if (typeof val1 === "string" && typeof val2 === "string") {
    return val1.trim() !== val2.trim()
  }
  return true
}

export default function ChildHealthRecordForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const mode = params.mode as "newchildhealthrecord" | "edit" | undefined
  const { chrecId, chhistId, patId } = location.state?.params || {}
  const isEditMode = mode === "edit"
  const isNewchildhealthrecord = mode === "newchildhealthrecord"
  const { user } = useAuth()
  const staffId = user?.staff?.staff_id
  const position = user?.staff?.pos?.pos_title
  const [isSubmitting, setIsSubmitting] = useState(false) // Keep local state for loading spinner
  const newchildhealthrecordMutation = useChildHealthRecordMutation()
  const updatechildhealthrecordmutation = useUpdateChildHealthRecordMutation()
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(() => {
    const storedPage = localStorage.getItem(
      `childHealthFormCurrentPage_${isEditMode ? "edit" : "newchildhealthrecord"}`,
    )
    return storedPage ? Number.parseInt(storedPage) : 1
  })
  const [formData, setFormData] = useState<FormData>(() => {
    const storedData = localStorage.getItem(`childHealthFormData_${isEditMode ? "edit" : "newchildhealthrecord"}`)
    return storedData ? JSON.parse(storedData) : initialFormData
  })
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [apiData, setApiData] = useState<any>(null)
  const [historicalBFdates, setHistoricalBFdates] = useState<string[]>([])
  const [historicalVitalSigns, setHistoricalVitalSigns] = useState<VitalSignType[]>([])
  const [historicalNutritionalStatus, setHistoricalNutritionalStatus] = useState<any[]>([])
  const [latestHistoricalNoteContent, setLatestHistoricalNoteContent] = useState<string>("")
  const [latestHistoricalFollowUpDescription, setLatestHistoricalFollowUpDescription] = useState<string>("")
  const [latestHistoricalFollowUpDate, setLatestHistoricalFollowUpDate] = useState<string>("")
  const [historicalMedicines, setHistoricalMedicines] = useState<Medicine[]>([])
  const [patientHistoricalDisabilities, setPatientHistoricalDisabilities] = useState<
    {
      id: number
      pd_id: number
      status: string
      disability_details: {
        disability_id: number
        disability_name: string
        created_at: string
      }
    }[]
  >([])
  const [originalDisabilityRecords, setOriginalDisabilityRecords] = useState<
    { id: number; pd_id: number; status: string }[]
  >([])

  useEffect(() => {
    localStorage.setItem(
      `childHealthFormCurrentPage_${isEditMode ? "edit" : "newchildhealthrecord"}`,
      currentPage.toString(),
    )
  }, [currentPage, isEditMode])

  useEffect(() => {
    localStorage.setItem(
      `childHealthFormData_${isEditMode ? "edit" : "newchildhealthrecord"}`,
      JSON.stringify(formData),
    )
  }, [formData, isEditMode])

  const getLatestNoteForDate = (notesArray: any[], dateString: string) => {
    const targetDate = dateString.split("T")[0]
    const notesForDate = notesArray.filter(
      (note: any) => note.created_at && note.created_at.split("T")[0] === targetDate,
    )
    if (notesForDate.length === 0) return null
    const sortedNotes = [...notesForDate].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    return sortedNotes[0]
  }

  const transformApiDataToFormData = (chhistRecord: any): FormData => {
    console.log("🔍 Starting transformation with raw chhistRecord:", chhistRecord)
    if (!chhistRecord) {
      console.error("❌ chhistRecord is empty or not in expected format.")
      return {} as FormData
    }

    const chrecDetails = chhistRecord?.chrec_details
    const patrecDetails = chrecDetails?.patrec_details
    const patient = patrecDetails?.pat_details
    const familyHeadInfo = patient?.family_head_info

    const transformedData: FormData = {
      chhist_status: chhistRecord.status,
      familyNo: chrecDetails?.family_no || "",
      created_at: chhistRecord?.created_at || "", // Use the created_at from the current chhistRecord
      pat_id: patrecDetails?.pat_id || "",
      rp_id: "",
      trans_id: "",
      ufcNo: chrecDetails?.ufc_no || "N/A",
      childFname: patient?.personal_info?.per_fname || "",
      childLname: patient?.personal_info?.per_lname || "",
      childMname: patient?.personal_info?.per_mname || "",
      childSex: patient?.personal_info?.per_sex || "",
      childDob: patient?.personal_info?.per_dob || "",
      birth_order: chrecDetails?.birth_order,
      placeOfDeliveryType: chrecDetails?.place_of_delivery_type || "Home",
      placeOfDeliveryLocation: chrecDetails?.pod_location || "",
      childAge: patient?.personal_info?.per_dob ? calculateAgeFromDOB(patient.personal_info.per_dob).ageString : "",
      residenceType: patrecDetails?.pat_type || "Resident",
      motherFname: familyHeadInfo?.family_heads?.mother?.personal_info?.per_fname || "",
      motherLname: familyHeadInfo?.family_heads?.mother?.personal_info?.per_lname || "",
      motherMname: familyHeadInfo?.family_heads?.mother?.personal_info?.per_mname || "",
      motherAge: familyHeadInfo?.family_heads?.mother?.personal_info?.per_dob
        ? calculateAge(familyHeadInfo.family_heads.mother.personal_info.per_dob).toString()
        : "",
      motherdob: familyHeadInfo?.family_heads?.mother?.personal_info?.per_dob || "",
      motherOccupation: chrecDetails?.mother_occupation || "",
      fatherFname: familyHeadInfo?.family_heads?.father?.personal_info?.per_fname || "",
      fatherLname: familyHeadInfo?.family_heads?.father?.personal_info?.per_lname || "",
      fatherMname: familyHeadInfo?.family_heads?.father?.personal_info?.per_mname || "",
      fatherAge: familyHeadInfo?.family_heads?.father?.personal_info?.per_dob
        ? calculateAge(familyHeadInfo.family_heads.father.personal_info.per_dob).toString()
        : "",
      fatherdob: familyHeadInfo?.family_heads?.father?.personal_info?.per_dob || "",
      fatherOccupation: chrecDetails?.father_occupation || "",
      address: patient?.address?.full_address || "",
      landmarks: chhistRecord?.landmarks || "",
      dateNewbornScreening: chrecDetails.newborn_screening || "",
      disabilityTypes: [], // As per user request, not retrieving into form's editable state
      edemaSeverity: "None",
      BFdates: [],
      vitalSigns: [],
      medicines: [],
      // is_anemic: false,
      anemic: { seen: "", given_iron: "",is_anemic: false,date_completed:"" },
      birthwt: { seen: "", given_iron: "",date_completed:"" },
      status: chhistRecord.status || "recorded",
      type_of_feeding: chrecDetails?.type_of_feeding || "",
      tt_status: chhistRecord.tt_status || "",
      nutritionalStatus: {},
      vaccines: [],
      hasExistingVaccination: chhistRecord.has_existing_vaccination || false,
      existingVaccines: [],
    }
    console.log("✅ Transformed data (before return):", transformedData)
    return transformedData
  }

  useEffect(() => {
    const fetchRecordData = async () => {
      if (!isEditMode) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        setError(null)
        console.log("🚀 Fetching data for chrecId:", chrecId, "and chhistId:", chhistId)
        if (!chrecId || !chhistId) {
          throw new Error("Missing chrecId or chhistId in location state for edit mode")
        }

        const response = await api2.get(`/child-health/history/${chrecId}/`)
        console.log("📡 API Response (raw data received):", response.data)

        const chrecRecord = response.data && response.data.length > 0 ? response.data[0] : null
        if (!chrecRecord) {
          throw new Error("Parent child health record (chrec) not found.")
        }

        const allHistoricalVitalSigns: VitalSignType[] = []
        const allHistoricalMedicines: Medicine[] = []
        const allHistoricalNutritionalStatuses: any[] = []
        const allHistoricalBFdates: string[] = []
        const allPatientHistoricalDisabilities: {
          id: number
          pd_id: number
          status: string
          disability_details: {
            disability_id: number
            disability_name: string
            created_at: string
          }
        }[] = []

        // Iterate through all child_health_histories to aggregate data
        chrecRecord.child_health_histories?.forEach((history: any) => {
          // Aggregate Vital Signs
          const vitalSignsFromHistory: VitalSignType[] =
            history.child_health_vital_signs?.map((vital: any) => {
              const vitalSignDate = vital.created_at
              const latestNoteForThisVitalSign = getLatestNoteForDate(history.child_health_notes || [], vitalSignDate)
              return {
                date: vitalSignDate ? vitalSignDate.split("T")[0] : "",
                temp: vital.temp ? Number.parseFloat(vital.temp) : undefined,
                wt: vital.bm_details?.weight ? Number.parseFloat(vital.bm_details.weight) : undefined,
                ht: vital.bm_details?.height ? Number.parseFloat(vital.bm_details.height) : undefined,
                age: vital.bm_details?.age || "",
                notes: latestNoteForThisVitalSign?.chn_notes || "",
                follov_description: latestNoteForThisVitalSign?.followv_details?.followv_description || "",
                followUpVisit: latestNoteForThisVitalSign?.followv_details?.followv_date || "",
                chvital_id: vital.chvital_id?.toString() || undefined,
                bm_id: vital.bm_details?.bm_id?.toString() || undefined,
                chnotes_id: latestNoteForThisVitalSign?.chnotes_id?.toString() || undefined,
                followv_id: latestNoteForThisVitalSign?.followv_details?.followv_id?.toString() || undefined,
              }
            }) || []
          allHistoricalVitalSigns.push(...vitalSignsFromHistory)

          // Aggregate Medicines
          const medicinesFromHistory: Medicine[] =
            history.child_health_supplements?.map((supp: any) => ({
              minv_id: supp.medrec_details?.minv_id?.toString() || "",
              medrec_qty: supp.medrec_details?.medrec_qty || 0,
              reason: supp.medrec_details?.reason || "",
              name: supp.medrec_details?.minv_details?.med_detail?.med_name || "",
              dosage: supp.medrec_details?.minv_details?.minv_dsg || undefined,
              dosageUnit: supp.medrec_details?.minv_details?.minv_dsg_unit || "",
              form: supp.medrec_details?.minv_details?.minv_form || "",
            })) || []
          allHistoricalMedicines.push(...medicinesFromHistory)

          // Aggregate Nutritional Statuses
          const nutritionalStatusFromHistory = history.nutrition_statuses?.[0]
            ? {
                nutstat_id: history.nutrition_statuses[0].nutstat_id?.toString() || undefined,
                wfa: history.nutrition_statuses[0].wfa || "",
                lhfa: history.nutrition_statuses[0].lhfa || "",
                wfh: history.nutrition_statuses[0].wfl || "",
                muac: history.nutrition_statuses[0].muac
                  ? Number.parseFloat(history.nutrition_statuses[0].muac)
                  : undefined,
                muac_status: history.nutrition_statuses[0].muac_status || "",
                date: history.nutrition_statuses[0].created_at,
                edemaSeverity: history.nutrition_statuses[0].edemaSeverity || "None",
              }
            : null
          if (nutritionalStatusFromHistory) {
            allHistoricalNutritionalStatuses.push(nutritionalStatusFromHistory)
          }

          // Aggregate BF dates
          const BFdatesFromHistory = history.exclusive_bf_checks?.map((check: any) => check.ebf_date) || []
          allHistoricalBFdates.push(...BFdatesFromHistory)

          // Aggregate Disabilities from all historical records, including disability_details
          const disabilitiesFromHistory =
            history.disabilities?.map((d: any) => ({
              id: d.disability_details?.disability_id || "",
              pd_id: Number(d.pd_id) || "",
              status: d.status || "active",
              disability_details: d.disability_details, // Include the full details object
            })) || []
          allPatientHistoricalDisabilities.push(...disabilitiesFromHistory)
        })

        // Set the aggregated historical data
        setHistoricalVitalSigns(allHistoricalVitalSigns)
        setHistoricalMedicines(allHistoricalMedicines)
        setHistoricalNutritionalStatus(allHistoricalNutritionalStatuses)
        setHistoricalBFdates(allHistoricalBFdates)
        setPatientHistoricalDisabilities(allPatientHistoricalDisabilities) // Set all historical disabilities

        // Keep the logic for the *currently edited* chhistRecord to populate the form data
        const selectedChhistRecord = chrecRecord.child_health_histories?.find(
          (history: any) => history.chhist_id === Number.parseInt(chhistId),
        )
        if (!selectedChhistRecord) {
          throw new Error(`Child health history with ID ${chhistId} not found within chrec ${chrecId}.`)
        }
        setApiData(selectedChhistRecord) // This is the specific record being edited

        // Extract disabilities specifically from the selectedChhistRecord for originalDisabilityRecords
        const disabilitiesForSelectedRecord =
          selectedChhistRecord.disabilities?.map((d: any) => ({
            id: d.disability_details?.disability_id || "",
            pd_id: Number(d.pd_id) || "",
            status: d.status || "active",
          })) || []
        setOriginalDisabilityRecords(disabilitiesForSelectedRecord) // Set only relevant disabilities for update logic

        // Update latest historical note/follow-up based on the *selected* chhistRecord
        if (selectedChhistRecord.child_health_notes && selectedChhistRecord.child_health_notes.length > 0) {
          const sortedNotes = [...selectedChhistRecord.child_health_notes].sort(
            (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          )
          const latestNote = sortedNotes[0]
          setLatestHistoricalNoteContent(latestNote.chn_notes || "")
          setLatestHistoricalFollowUpDescription(latestNote.followv_details?.followv_description || "")
          setLatestHistoricalFollowUpDate(latestNote.followv_details?.followv_date || "")
        } else {
          setLatestHistoricalNoteContent("")
          setLatestHistoricalFollowUpDescription("")
          setLatestHistoricalFollowUpDate("")
        }

        const recordData = transformApiDataToFormData(selectedChhistRecord)
        console.log("📝 Final form data (after transformation):", recordData)
        setFormData(recordData)
      } catch (error) {
        console.error("❌ Error fetching record data:", error)
        setError(`Failed to load record data: ${error instanceof Error ? error.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecordData()
  }, [chrecId, chhistId, isEditMode])

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => (prev ? { ...prev, ...data } : (data as FormData)))
  }

  const handleSubmit = async (submittedData: FormData) => {
    setIsSubmitting(true) // Set submitting to true at the start
    setError(null)
    try {
      console.log("Submitted data received in ChildHealthRecordForm:", submittedData)
      console.log("Medicines in submittedData:", submittedData.medicines)

      if (isNewchildhealthrecord) {
        await newchildhealthrecordMutation.mutateAsync({
          // Use mutateAsync
          submittedData: submittedData,
          staff: staffId || null,
        })
      } else {
        await updatechildhealthrecordmutation.mutateAsync({
          // Use mutateAsync
          submittedData: submittedData,
          staff: staffId || null,
          todaysHistoricalRecord: historicalVitalSigns.find((vital) => isToday(vital.date)),
          originalRecord: apiData,
          originalDisabilityRecords: originalDisabilityRecords,
        })
      }

      // Clear local storage and reset state ONLY after successful submission
      localStorage.removeItem("selectedPatient")
      localStorage.removeItem(`childHealthFormData_${isEditMode ? "edit" : "newchildhealthrecord"}`)
      localStorage.removeItem(`childHealthFormCurrentPage_${isEditMode ? "edit" : "newchildhealthrecord"}`)
      setFormData(initialFormData)
      setCurrentPage(1)
      // Navigation is handled by the onSuccess callback in the mutation hooks
    } catch (Error) {
      console.error("Error submitting form:", Error)
      // Error handling is already done by the onError callback in the mutation hooks
    } finally {
      setIsSubmitting(false) // Ensure submitting is set to false in finally
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-gray-500">Loading record data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="text-red-500">{error}</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  if (isEditMode && !formData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <div className="text-red-500">No record data available to edit</div>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <Button
          className="self-start p-2 text-black"
          variant={"outline"}
          onClick={() => {
            localStorage.removeItem("selectedPatient")
            localStorage.removeItem(`childHealthFormData_${isEditMode ? "edit" : "newchildhealthrecord"}`)
            localStorage.removeItem(`childHealthFormCurrentPage_${isEditMode ? "edit" : "newchildhealthrecord"}`)
            setFormData(initialFormData)
            setCurrentPage(1)
            navigate(-1)
          }}
        >
          <ChevronLeft />
        </Button>
        <div className="mb-4 flex-col items-center">
          <h1 className="text-xl font-semibold text-darkBlue2 sm:text-2xl">
            {isEditMode ? "Edit Child Health Record" : "Add New Child Health Record"}
          </h1>
          <p className="text-xs text-darkGray sm:text-sm">
            {isEditMode
              ? `Editing record for ${formData.childFname} ${formData.childLname}`
              : "Manage and view patient's information"}
          </p>
        </div>
      </div>

      {currentPage === 1 && (
        <ChildHRPage1
          onNext={() => setCurrentPage(2)}
          updateFormData={updateFormData}
          formData={formData}
          mode={mode || "newchildhealthrecord"}
        />
      )}
      {currentPage === 2 && (
        <ChildHRPage2
          onPrevious={() => setCurrentPage(1)}
          onNext={() => setCurrentPage(3)}
          updateFormData={updateFormData}
          formData={formData}
          historicalBFdates={historicalBFdates}
          patientHistoricalDisabilities={patientHistoricalDisabilities} // Pass the historical disabilities
          mode={mode || "newchildhealthrecord"}
        />
      )}
      {currentPage === 3 && (
        <ChildHRPage3
          onPrevious={() => setCurrentPage(2)}
          onNext={() => setCurrentPage(4)}
          updateFormData={updateFormData}
          formData={formData}
          position={position}
          mode={mode || "newchildhealthrecord"}
        />
      )}
      {currentPage === 4 && (
        <LastPage
          onPrevious={() => setCurrentPage(3)}
          onSubmit={handleSubmit}
          updateFormData={updateFormData}
          formData={formData}
          historicalVitalSigns={historicalVitalSigns}
          historicalNutritionalStatus={historicalNutritionalStatus}
          latestHistoricalNoteContent={latestHistoricalNoteContent}
          latestHistoricalFollowUpDescription={latestHistoricalFollowUpDescription}
          isSubmitting={isSubmitting} // Pass the local isSubmitting state
          latestHistoricalFollowUpDate={latestHistoricalFollowUpDate}
          historicalMedicines={historicalMedicines}
          mode={mode || "newchildhealthrecord"}
        />
      )}
    </>
  )
}
