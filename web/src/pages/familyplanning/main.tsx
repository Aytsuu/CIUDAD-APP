import { useFamilyPlanningFormSubmission, useFollowUpFamilyPlanningFormSubmission } from "./request-db/PostRequest"
import { getFPCompleteRecord, getLatestCompleteFPRecordForPatient } from "./request-db/GetRequest"
import { useCallback, useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import type { FormData } from "@/form-schema/FamilyPlanningSchema" // Ensure patrec_id is in this interface
import FamilyPlanningForm from "./FpPage1"
import FamilyPlanningForm2 from "./FpPage2"
import FamilyPlanningForm3 from "./FpPage3"
import FamilyPlanningForm4 from "./FpPage4"
import FamilyPlanningForm5 from "./FpPage5"
import FamilyPlanningForm6 from "./FpPage6"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

// Initial form data structure - keep this for 'create' mode
const initialFormData: FormData = {
  pat_id: "",
  patrec_id: "", // NEW: Added patrec_id to initial state
  fpt_id: "",
  clientID: "",
  philhealthNo: "",
  nhts_status: false,
  pantawid_4ps: false,
  lastName: "",
  givenName: "",
  middleInitial: "",
  dateOfBirth: "",
  age: 0,
  educationalAttainment: "",
  occupation: "",
  address: { houseNumber: "", street: "", barangay: "", municipality: "", province: "" },
  spouse: { s_lastName: "", s_givenName: "", s_middleInitial: "", s_dateOfBirth: "", s_age: 0, s_occupation: "" },
  numOfLivingChildren: 0,
  planToHaveMoreChildren: false,
  averageMonthlyIncome: "",
  typeOfClient: "",
  subTypeOfClient: "",
  reasonForFP: "",
  otherReasonForFP: "",
  reason: "",
  otherReason: "",
  methodCurrentlyUsed: undefined,
  otherMethod: "",
  medicalHistory: {
    severeHeadaches: false,
    strokeHeartAttackHypertension: false,
    hematomaBruisingBleeding: false,
    breastCancerHistory: false,
    severeChestPain: false,
    cough: false,
    jaundice: false,
    unexplainedVaginalBleeding: false,
    abnormalVaginalDischarge: false,
    phenobarbitalOrRifampicin: false,
    smoker: false,
    disability: false,
    disabilityDetails: "",
  },
  obstetricalHistory: {
    g_pregnancies: 0,
    p_pregnancies: 0,
    fullTerm: 0,
    premature: 0,
    abortion: 0,
    numOfLivingChildren: 0,
    lastDeliveryDate: "",
    typeOfLastDelivery: "",
    lastMenstrualPeriod: "",
    previousMenstrualPeriod: "",
    menstrualFlow: "Scanty",
    dysmenorrhea: false,
    hydatidiformMole: false,
    ectopicPregnancyHistory: false,
  },
  sexuallyTransmittedInfections: {
    abnormalDischarge: false,
    dischargeFrom: undefined,
    sores: false,
    pain: false,
    history: false,
    hiv: false,
  },
  violenceAgainstWomen: {
    unpleasantRelationship: false,
    partnerDisapproval: false,
    domesticViolence: false,
    referredTo: undefined,
  },
  weight: 0,
  height: 0,
  bloodPressure: "",
  pulseRate: 0,
  skinExamination: "normal",
  conjunctivaExamination: "normal",
  neckExamination: "normal",
  breastExamination: "normal",
  abdomenExamination: "normal",
  extremitiesExamination: "normal",
  pelvicExamination: "normal",
  cervicalConsistency: "firm",
  cervicalTenderness: false,
  cervicalAdnexal: false,
  uterinePosition: "mid",
  uterineDepth: "",
  acknowledgement: {
    clientName: "",
    selectedMethod: "",
    clientSignature: "",
    clientSignatureDate: new Date().toISOString().split("T")[0],
    guardianName: "",
    guardianSignature: "",
    guardianSignatureDate: new Date().toISOString().split("T")[0],
  },
  serviceProvisionRecords: [],
  pregnancyCheck: {
    breastfeeding: false,
    abstained: false,
    recent_baby: false,
    recent_period: false,
    recent_abortion: false,
    using_contraceptive: false,
  },
}

export default function FamilyPlanningPage() {
  const navigate = useNavigate()
  // useParams will now correctly extract patientId if the route is /new-record/:patientId?
  // and fprecordId if the route is /view/:fprecordId or /edit/:fprecordId
  const { patientId: routePatientId, fprecordId } = useParams<{ patientId?: string; fprecordId?: string }>()
  const [searchParams] = useSearchParams()

  const modeParam = searchParams.get("mode")
  const prefillParam = searchParams.get("prefill")
  const patrecIdParam = searchParams.get("patrecId") // patrec_id for follow-up submission
  const prefillFromFpRecordParam = searchParams.get("prefillFromFpRecord") // fprecord_id to prefill from for follow-up

  // Determine the current mode of operation
  const currentMode = (modeParam || "create") as "create" | "edit" | "view" | "followup"

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isPrefillingData, setIsPrefillingData] = useState(false)

  // Mutation hooks for different submission types
  const { mutateAsync: submitNewRecordSet, isPending: isSubmittingNewRecordSet } = useFamilyPlanningFormSubmission()
  const { mutateAsync: submitFollowUpRecord, isPending: isSubmittingFollowUpRecord } = useFollowUpFamilyPlanningFormSubmission()

  // Determine the actual patient ID to use for data fetching and form submission
  // This will be the patientId from the URL for new/followup, or derived from fetched data for view/edit
  const [actualPatientId, setActualPatientId] = useState<string | undefined>(routePatientId);

  // Query for fetching existing record (for edit/view mode)
  const { data: fetchedRecord, isLoading: isFetchingRecord } = useQuery<FormData, Error>({
    queryKey: ["fpCompleteRecord", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId && (currentMode === "view" || currentMode === "edit"),
  })

  // Query for fetching latest record for prefill (for 'create' mode with patientId)
  const { data: latestRecord, isLoading: isFetchingLatestRecord } = useQuery<FormData, Error>({
    queryKey: ["latestFpRecord", actualPatientId],
    queryFn: () => getLatestCompleteFPRecordForPatient(actualPatientId!),
    enabled: !!actualPatientId && currentMode === "create" && prefillParam === "true",
  })

  // Query for fetching specific FP record for follow-up prefill
  const { data: followUpPrefillRecord, isLoading: isFetchingFollowUpPrefillRecord } = useQuery<FormData, Error>({
    queryKey: ["followUpPrefillRecord", prefillFromFpRecordParam],
    queryFn: () => getFPCompleteRecord(Number(prefillFromFpRecordParam)),
    enabled: currentMode === "followup" && !!prefillFromFpRecordParam,
  })

  // Effect to update actualPatientId when fetchedRecord changes (for view/edit modes)
  useEffect(() => {
    if (fetchedRecord && fetchedRecord.pat_id && !actualPatientId) {
      setActualPatientId(fetchedRecord.pat_id);
    }
  }, [fetchedRecord, actualPatientId]);


  // Effect to set formData when fetchedRecord changes (edit/view mode)
  useEffect(() => {
    if (fetchedRecord) {
      setFormData(fetchedRecord)
    }
  }, [fetchedRecord])

  // Effect to set formData when latestRecord changes ('create' mode with prefill)
  useEffect(() => {
    if (latestRecord && currentMode === "create" && prefillParam === "true") {
      setIsPrefillingData(true)
      const prefillData = {
        ...latestRecord,
        fprecord_id: undefined, // Clear fprecord_id as it's a new FP record
        fpt_id: "", // Clear fpt_id as it's a new FP type record
        acknowledgement: {
          ...latestRecord.acknowledgement,
          clientSignature: "",
          clientSignatureDate: new Date().toISOString().split("T")[0],
          guardianSignature: "",
          guardianSignatureDate: new Date().toISOString().split("T")[0],
        },
        serviceProvisionRecords: [], // Clear service provision records for new visit
        planToHaveMoreChildren: latestRecord.planToHaveMoreChildren, // Keep this from previous record
        pat_id: actualPatientId || latestRecord.pat_id, // Ensure pat_id is set correctly
        patrec_id: "", // Ensure patrec_id is cleared for new record set (will be created by backend)
      }
      setFormData(prefillData)
      setIsPrefillingData(false)
      toast.success("Form pre-filled with patient's latest data. Please review and update as needed.")
    }
  }, [latestRecord, currentMode, prefillParam, actualPatientId])

  // Effect to set formData when followUpPrefillRecord changes ('followup' mode)
  useEffect(() => {
    if (followUpPrefillRecord && currentMode === "followup") {
      setIsPrefillingData(true)
      const prefillData = {
        ...followUpPrefillRecord,
        fprecord_id: undefined, // Clear fprecord_id as it's a new FP record
        fpt_id: "", // Clear fpt_id as it's a new FP type record
        acknowledgement: {
          ...followUpPrefillRecord.acknowledgement,
          clientSignature: "",
          clientSignatureDate: new Date().toISOString().split("T")[0],
          guardianSignature: "",
          guardianSignatureDate: new Date().toISOString().split("T")[0],
        },
        serviceProvisionRecords: [], // Clear service provision records for new visit
        planToHaveMoreChildren: followUpPrefillRecord.planToHaveMoreChildren, // Keep this from previous record
        pat_id: actualPatientId || followUpPrefillRecord.pat_id, // Ensure pat_id is set correctly
        patrec_id: patrecIdParam || followUpPrefillRecord.patrec_id, // Crucial: Use the patrecId from URL or fetched record
      }
      setFormData(prefillData)
      setIsPrefillingData(false)
      toast.success("Form pre-filled for follow-up. Please review and update as needed.")
    }
  }, [followUpPrefillRecord, currentMode, actualPatientId, patrecIdParam])


  // Update form data (this function is passed down to child components)
  const updateFormData = useCallback((newData: Partial<FormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...newData,
      address: newData.address ? { ...prev.address, ...newData.address } : prev.address,
      spouse: newData.spouse ? { ...prev.spouse, ...newData.spouse } : prev.spouse,
      medicalHistory: newData.medicalHistory ? { ...prev.medicalHistory, ...newData.medicalHistory } : prev.medicalHistory,
      obstetricalHistory: newData.obstetricalHistory ? { ...prev.obstetricalHistory, ...newData.obstetricalHistory } : prev.obstetricalHistory,
      sexuallyTransmittedInfections: newData.sexuallyTransmittedInfections
        ? { ...prev.sexuallyTransmittedInfections, ...newData.sexuallyTransmittedInfections }
        : prev.sexuallyTransmittedInfections,
      violenceAgainstWomen: newData.violenceAgainstWomen
        ? { ...prev.violenceAgainstWomen, ...newData.violenceAgainstWomen }
        : prev.violenceAgainstWomen,
      acknowledgement: newData.acknowledgement
        ? { ...prev.acknowledgement, ...newData.acknowledgement }
        : prev.acknowledgement,
      // pregnancyCheck: newData.pregnancyCheck
      //   ? { ...prev.pregnancyCheck, ...newData.pregnancyCheck }
      //   : prev.pregnancyCheck,
    }))
  }, [])

  const reviewFormData = () => {
    console.log("=== CURRENT FORM DATA REVIEW ===")
    console.log("pat_id:", formData.pat_id);
    console.log("patrec_id:", formData.patrec_id);
    console.log("Current Mode:", currentMode); // Debug current mode
    console.log("General Information:", {
      clientID: formData.clientID,
      philhealthNo: formData.philhealthNo,
      lastName: formData.lastName,
      givenName: formData.givenName,
      occupation: formData.occupation,
    })
    console.log("Address:", formData.address)
    console.log("Spouse Info:", formData.spouse)
    console.log("Medical History:", formData.medicalHistory)
    console.log("Obstetrical History:", formData.obstetricalHistory)
    console.log("STI Info:", formData.sexuallyTransmittedInfections)
    console.log("VAW Info:", formData.violenceAgainstWomen)
    console.log("Pelvic Exam:", formData.pelvicExamination)
    console.log("Physical Exam:", {
      weight: formData.weight,
      height: formData.height,
      bloodPressure: formData.bloodPressure,
    })
    console.log("Acknowledgement:", formData.acknowledgement)
    console.log("Service Provision Records:", formData.serviceProvisionRecords)
    console.log("Pregnancy Check:", formData.pregnancyCheck)
    console.log("=== END OF REVIEW ===")
  }

  const handleNext = () => {
    reviewFormData()
    if (currentPage < 6) {
      setCurrentPage((prevPage) => prevPage + 1)
    }
  }

  const handlePrevious = () => {
    reviewFormData()
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1)
    }
  }

  const handleSubmit = async () => {
    reviewFormData()
    try {
      // Ensure pat_id is always set in formData before submission
      // This is important because actualPatientId might be undefined initially
      // but will be set by useEffects after data fetching.
      // We need to ensure it's in the formData for the backend.
      const finalFormData = {
        ...formData,
        pat_id: actualPatientId || formData.pat_id, // Prioritize actualPatientId
      };

      if (currentMode === "followup") {
        if (!finalFormData.patrec_id) {
          toast.error("Error: Patient Record ID (patrec_id) is missing for follow-up submission.");
          return;
        }
        await submitFollowUpRecord(finalFormData) // Use new mutation for follow-up
        toast.success("Family Planning follow-up record submitted successfully!")
      } else {
        await submitNewRecordSet(finalFormData) // Use original mutation for new record set
        toast.success("Family Planning record submitted successfully!")
      }

      // Navigate back to the individual patient page
      // if (actualPatientId) { // Use actualPatientId for navigation
      //   navigate(`/familyplanning/individual/${actualPatientId}`)
      // } else {
      //   // Fallback if patientId is not available (e.g., if coming from overall table)
      //   navigate("/FamPlanning_table")
      // }
    } catch (error) {
      toast.error("Failed to submit record. Please try again.")
      console.error("Submission error:", error)
    }
  }

  // Display loading state while fetching data
  const isLoading = isFetchingRecord || isFetchingLatestRecord || isFetchingFollowUpPrefillRecord || isPrefillingData;
  const isSubmitting = isSubmittingNewRecordSet || isSubmittingFollowUpRecord;

  if (isLoading || isSubmitting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>
          {isLoading && (isFetchingRecord && "Loading record details..." || isFetchingLatestRecord && "Loading patient's latest data..." || isFetchingFollowUpPrefillRecord && "Loading follow-up prefill data..." || isPrefillingData && "Pre-filling form with patient data...")}
          {isSubmitting && "Submitting form..."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* Show prefill notification */}
        {(prefillParam === "true" && actualPatientId) || currentMode === "followup" ? (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Form Pre-filled:</strong> This form has been pre-filled with the patient's latest Family
                  Planning data. Please review and update the information as needed before submitting.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="text-right text-sm  text-gray-500 mb-4">Page {currentPage}/6</div>

        {currentPage === 1 && (
          <FamilyPlanningForm
            onNext2={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
            isPatientPreSelected={!!actualPatientId && (prefillParam === "true" || currentMode === "followup")}
          />
        )}
        {currentPage === 2 && (
          <FamilyPlanningForm2
            onPrevious1={handlePrevious}
            onNext3={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
          />
        )}
        {currentPage === 3 && (
          <FamilyPlanningForm3
            onPrevious2={handlePrevious}
            onNext4={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
          />
        )}
        {currentPage === 4 && (
          <FamilyPlanningForm4
            onPrevious3={handlePrevious}
            onNext5={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
          />
        )}
        {currentPage === 5 && (
          <FamilyPlanningForm5
            onPrevious4={handlePrevious}
            onNext6={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
            age={formData.age}
          />
        )}
        {currentPage === 6 && (
          <FamilyPlanningForm6
            onPrevious5={handlePrevious}
            onSubmitFinal={handleSubmit}
            updateFormData={updateFormData}
            formData={formData}
            isSubmitting={isSubmitting}
            mode={currentMode}
          />
        )}
      </div>
    </div>
  )
}
