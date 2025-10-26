import { useFamilyPlanningFormSubmission, useFollowUpFamilyPlanningFormSubmission } from "./request-db/PostRequest"
import { getFPCompleteRecord, getLatestCompleteFPRecordForPatient } from "./request-db/GetRequest"
import { useCallback, useState, useEffect } from "react"
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom"
import type { FormData } from "@/form-schema/FamilyPlanningSchema" // Ensure patrec_id is in this interface
import FamilyPlanningForm from "./FpPage1"
import FamilyPlanningForm2 from "./FpPage2"
import FamilyPlanningForm3 from "./FpPage3"
import FamilyPlanningForm4 from "./FpPage4"
import FamilyPlanningForm5 from "./FpPage5"
import FamilyPlanningForm6 from "./FpPage6"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"

// Initial form data structure - keep this for 'create' mode
const initialFormData: FormData = {
  pat_id: "",
  patrec_id: "", // NEW: Added patrec_id to initial state
  client_id: "",
  philhealthNo: "",
  nhts_status: false,
  fourps: false,
  lastName: "",
  givenName: "",
  middleInitial: "",
  dateOfBirth: "",
  age: 0,
  educationalAttainment: "",
  occupation: "",
  gender: "",
  address: { houseNumber: "", street: "", barangay: "", municipality: "", province: "" },
  spouse: { s_lastName: "", s_givenName: "", s_middleInitial: "", s_dateOfBirth: "", s_age: 0, s_occupation: "" },
  numOfLivingChildren: 0,
  plan_more_children: false,
  avg_monthly_income: "",
  typeOfClient: "",
  subTypeOfClient: "",
  reasonForFP: "",
  otherReasonForFP: "",
  reason: "",
  otherReason: "",
  methodCurrentlyUsed: "",
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
    lastDeliveryDate: null,
    typeOfLastDelivery: "",
    lastMenstrualPeriod: null,
    previousMenstrualPeriod: null,
    menstrualFlow: "",
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
    referredTo: "",
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
  cervicalTenderness: "false",
  cervicalAdnexal: "false",
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
  fp_type: {},
  fp_physical_exam: {},
  fp_pelvic_exam: {}
}

export default function FamilyPlanningPage() {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get all parameters from state instead of URL (preferred approach)
  const { 
    patientId: statePatientId, 
    mode: stateMode, 
    prefill: statePrefill,
    patrecId: statePatrecId,
    // prefillFromFpRecord: statePrefillFromFpRecord,
    gender: stateGender,
    isNewMethod: stateIsNewMethod // NEW: Flag for "New Method for Patient"
  } = location.state || {};

  // Use state values with URL params as fallback for backward compatibility
  const { patientId: routePatientId, fprecordId } = useParams<{ patientId?: string; fprecordId?: string }>()
  const [searchParams] = useSearchParams()
  
  const modeParam = searchParams.get("mode")
  const prefillParam = searchParams.get("prefill")
  const patrecIdParam = searchParams.get("patrecId") // patrec_id for follow-up submission
  // const prefillFromFpRecordParam = searchParams.get("prefillFromFpRecord") // fprecord_id to prefill from for follow-up
  const staff_id = user?.staff?.staff_id
  console.log("Staff id",staff_id)

  // Prefer state values over URL params
  const currentMode = (stateMode || modeParam || "create") as "create" | "edit" | "view" | "followup"
  const actualPatientId = statePatientId || routePatientId
  const shouldPrefill = statePrefill || prefillParam === "true"
  const patrecId = statePatrecId || patrecIdParam
  // const prefillFromFpRecord = statePrefillFromFpRecord || prefillFromFpRecordParam
  const passedGender = stateGender || (location.state as { gender?: string })?.gender || ""
  const isNewMethod = stateIsNewMethod || false // NEW: Default to false

  const [currentPage, setCurrentPage] = useState<number>(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isPrefillingData, setIsPrefillingData] = useState(false)

  // Mutation hooks for different submission types
  const { mutateAsync: submitNewRecordSet, isPending: isSubmittingNewRecordSet } = useFamilyPlanningFormSubmission()
  const { mutateAsync: submitFollowUpRecord, isPending: isSubmittingFollowUpRecord } = useFollowUpFamilyPlanningFormSubmission()

  // Determine the actual patient ID to use for data fetching and form submission
  const [internalPatientId, setInternalPatientId] = useState<string | undefined>(actualPatientId);

  // Query for fetching existing record (for edit/view mode)
  const { data: fetchedRecord, isLoading: isFetchingRecord } = useQuery<FormData, Error>({
    queryKey: ["fpCompleteRecord", fprecordId],
    queryFn: () => getFPCompleteRecord(Number(fprecordId)),
    enabled: !!fprecordId && (currentMode === "view" || currentMode === "edit"),
  })

  // Query for fetching latest record for prefill (for 'create' mode with patientId)
const { data: latestRecord, isLoading: isFetchingLatestRecord,refetch: refetchLatest } = useQuery<FormData, Error>({
  queryKey: ["latestFpRecord", internalPatientId, currentMode, isNewMethod],
  queryFn: () => getLatestCompleteFPRecordForPatient(internalPatientId!),
  enabled: !!internalPatientId && 
    (currentMode === "create" || currentMode === "followup") && (shouldPrefill || isNewMethod || currentMode === "followup"),refetchOnMount: "always"})

  console.log("=== LATEST RECORD DEBUG ===");
console.log("latestRecord:", latestRecord);
console.log("num_of_children from backend:", latestRecord?.num_of_children);
console.log("numOfLivingChildren from backend:", latestRecord?.numOfLivingChildren);
console.log("obstetricalHistory:", latestRecord?.obstetricalHistory);

  // Effect to update internalPatientId when fetchedRecord changes (for view/edit modes)
  useEffect(() => {
    if (fetchedRecord && fetchedRecord.pat_id && internalPatientId !== fetchedRecord.pat_id) {
      setInternalPatientId(fetchedRecord.pat_id);
    }
  }, [fetchedRecord, internalPatientId]);

  // Effect to set internalPatientId from state/URL
  useEffect(() => {
  if (actualPatientId && !internalPatientId) {
    setInternalPatientId(actualPatientId);
  }

   if (currentMode === "followup" && actualPatientId && internalPatientId !== actualPatientId) {
    setInternalPatientId(actualPatientId);
  }
}, [actualPatientId, internalPatientId, currentMode]);

  useEffect(() => {
    if (internalPatientId && (shouldPrefill || isNewMethod || currentMode === "followup")) {
      refetchLatest(); // Explicitly refetch if conditions met
    }
  }, [internalPatientId, shouldPrefill, isNewMethod, currentMode, refetchLatest]);

  
  useEffect(() => {
    console.log("=== DEBUG: internalPatientId updated to", internalPatientId);
    console.log("Query enabled?", !!internalPatientId && (currentMode === "create" || currentMode === "followup") && (shouldPrefill || isNewMethod || currentMode === "followup"));
  }, [internalPatientId, currentMode, shouldPrefill, isNewMethod]);



  // Additional check for follow-up mode
 

  // Effect to set formData when fetchedRecord changes (edit/view mode)
  useEffect(() => {
    if (fetchedRecord) {
      setFormData(fetchedRecord)
    }
  }, [fetchedRecord])

  // In main.tsx, add these logs:
console.log("Current Mode:", currentMode);
console.log("isNewMethod:", isNewMethod);
console.log("shouldPrefill:", shouldPrefill);
console.log("internalPatientId:", internalPatientId);
console.log("Query enabled:", !!internalPatientId && (currentMode === "create" || currentMode === "followup") && (shouldPrefill || isNewMethod || currentMode === "followup"));

  // Effect to set formData when latestRecord changes ('create' mode with prefill or new method)
  useEffect(() => {
    if (latestRecord && currentMode === "create" && (shouldPrefill || isNewMethod)) {
      setIsPrefillingData(true)

      const prevEffectiveMethod = latestRecord.methodCurrentlyUsed === "Others"
        ? latestRecord.otherMethod
        : latestRecord.methodCurrentlyUsed;

      const prefillData = isNewMethod ? {
        ...initialFormData,
        ...latestRecord,
        pat_id: internalPatientId || latestRecord.pat_id,
        patrec_id: latestRecord.patrec_id, // Keep the same patrec_id for new method under same record
        client_id: latestRecord.client_id,
        philhealthNo: latestRecord.philhealthNo,
        nhts_status: latestRecord.nhts_status,
        fourps: latestRecord.fourps,
        lastName: latestRecord.lastName,
        givenName: latestRecord.givenName,
        middleInitial: latestRecord.middleInitial,
        dateOfBirth: latestRecord.dateOfBirth,
        age: latestRecord.age,
        educationalAttainment: latestRecord.educationalAttainment,
        occupation: latestRecord.occupation,
        gender: passedGender || latestRecord.gender || "Unknown",
        address: latestRecord.address,
        spouse: latestRecord.spouse,
        weight: latestRecord.weight,
      height: latestRecord.height,
      bodyMeasurementRecordedAt: latestRecord.bodyMeasurementRecordedAt,
        plan_more_children: latestRecord.plan_more_children,
        avg_monthly_income: latestRecord.avg_monthly_income,
        numOfLivingChildren: latestRecord.num_of_children || latestRecord.numOfLivingChildren || 0,
        // Reset method-related fields for new method selection
        typeOfClient: "currentuser",
        subTypeOfClient: "changingmethod",
        reasonForFP: "",
        otherReasonForFP: "",
        reason: "",
        methodCurrentlyUsed: "",
        otherMethod: "",
        previousMethod: prevEffectiveMethod || "",
        acknowledgement: {
          ...initialFormData.acknowledgement,
          clientName: `${latestRecord.lastName}, ${latestRecord.givenName} ${latestRecord.middleInitial}`.trim(),
        },
      } : {
        // For regular prefill - use existing logic
        ...latestRecord,
        fprecord_id: undefined,
        fpt_id: "",
        gender: passedGender || "Unknown",
        acknowledgement: {
          ...latestRecord.acknowledgement,
          clientSignature: "",
          clientSignatureDate: new Date().toISOString().split("T")[0],
          guardianSignature: "",
          guardianSignatureDate: new Date().toISOString().split("T")[0],
        },
        serviceProvisionRecords: [], // Clear service provision records for new visit
        plan_more_children: latestRecord.plan_more_children, // Keep this from previous record
        pat_id: internalPatientId || latestRecord.pat_id, // Ensure pat_id is set correctly
        patrec_id: "", // Ensure patrec_id is cleared for new record set (will be created by backend)
        typeOfClient: "currentuser",
        subTypeOfClient: "changingmethod", // Preserve existing value
        weight: latestRecord.weight,
      height: latestRecord.height,
      bodyMeasurementRecordedAt: latestRecord.bodyMeasurementRecordedAt,
        reasonForFP: latestRecord.fp_type?.fpt_reason_fp || "medicalcondition",
        reason: latestRecord.reason,
        otherReasonForFP: latestRecord.otherReasonForFP || "", // Preserve existing value
        previousMethod: prevEffectiveMethod || "",
        numOfLivingChildren: latestRecord.num_of_children || latestRecord.numOfLivingChildren || 0,
      };

      setFormData(prefillData)
      setIsPrefillingData(false)
      
      if (isNewMethod) {
        toast.success("Ready to add new method for patient. Please select the new contraceptive method.")
      } else {
        toast.success("Form pre-filled with patient's latest data. Please review and update as needed.")
      }
    }
  }, [latestRecord, currentMode, shouldPrefill, internalPatientId, isNewMethod])

  // Effect to set formData when followUpPrefillRecord changes ('followup' mode)
  useEffect(() => {
  if (currentMode === "followup" && latestRecord) {
    setIsPrefillingData(true)
    
    const prevEffectiveMethod = latestRecord.methodCurrentlyUsed === "Others"
      ? latestRecord.otherMethod
      : latestRecord.methodCurrentlyUsed;

    const prefillData = {
      ...latestRecord,
      fprecord_id: undefined, // Clear fprecord_id as it's a new FP record
      fpt_id: "", // Clear fpt_id as it's a new FP type record
      acknowledgement: {
        ...latestRecord.acknowledgement,
        clientSignature: latestRecord.acknowledgement.clientSignature,
        clientSignatureDate: new Date().toISOString().split("T")[0],
        guardianSignature: "",
        guardianSignatureDate: new Date().toISOString().split("T")[0],
      },
      serviceProvisionRecords: [], // Clear service provision records for new visit
      avg_monthly_income: latestRecord.avg_monthly_income,
      plan_more_children: latestRecord.plan_more_children,
      pat_id: internalPatientId || latestRecord.pat_id,
      patrec_id: patrecId || latestRecord.patrec_id, // Use the patrecId from state/URL or latest record
      typeOfClient: "currentuser",
      gender: passedGender || "Unknown",
      subTypeOfClient: latestRecord.subTypeOfClient || "",
      reasonForFP: latestRecord.reasonForFP || "medicalcondition",
      otherReasonForFP: latestRecord.otherReasonForFP || "",
      reason: latestRecord.reason || "",
      weight: latestRecord.weight,
      height: latestRecord.height,
      bodyMeasurementRecordedAt: latestRecord.bodyMeasurementRecordedAt,
      methodCurrentlyUsed: latestRecord.methodCurrentlyUsed,
      bloodPressure: latestRecord.bloodPressure,
      pulseRate: latestRecord.pulseRate,
      numOfLivingChildren: latestRecord.num_of_children || latestRecord.obstetricalHistory?.numOfLivingChildren || latestRecord.numOfLivingChildren || 0,
      skinExamination: latestRecord.fp_physical_exam?.skin_exam ?? "normal",
      conjunctivaExamination: latestRecord.fp_physical_exam?.conjunctiva_exam ?? "normal",
      neckExamination: latestRecord.fp_physical_exam?.neck_exam ?? "normal",
      breastExamination: latestRecord.fp_physical_exam?.breast_exam ?? "normal",
      abdomenExamination: latestRecord.fp_physical_exam?.abdomen_exam ?? "normal",
      extremitiesExamination: latestRecord.fp_physical_exam?.extremities_exam ?? "normal",
      pelvicExamination: latestRecord.fp_pelvic_exam?.pelvicExamination ?? "normal",
      cervicalConsistency: latestRecord.fp_pelvic_exam?.cervicalConsistency ?? "firm",
      cervicalTenderness: String(latestRecord.fp_pelvic_exam?.cervicalTenderness ?? false),
      cervicalAdnexal: String(latestRecord.fp_pelvic_exam?.cervicalAdnexal ?? false),
      uterinePosition: latestRecord.fp_pelvic_exam?.uterinePosition ?? "mid",
      uterineDepth: latestRecord.fp_pelvic_exam?.uterineDepth ?? "",
      previousMethod: prevEffectiveMethod || "", // Add previous method for reference
    }
    
    setFormData(prefillData)
    setIsPrefillingData(false)
    toast.success("Form pre-filled with latest patient data for follow-up. Please review and update as needed.")
  }
}, [latestRecord, currentMode, internalPatientId, patrecId])


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
    }))
  }, [])


  useEffect(() => {
  console.log("=== BODY MEASUREMENT DEBUG ===");
  console.log("Latest Record bodyMeasurementRecordedAt:", latestRecord?.bodyMeasurementRecordedAt);
  console.log("Current FormData bodyMeasurementRecordedAt:", formData.bodyMeasurementRecordedAt);
  console.log("Current FormData weight:", formData.weight);
  console.log("Current FormData height:", formData.height);
}, [latestRecord, formData.bodyMeasurementRecordedAt, formData.weight, formData.height]);


  const reviewFormData = () => {
    console.log("=== CURRENT FORM DATA REVIEW ===")
    console.log("pat_id:", formData.pat_id);
    console.log("patrec_id:", formData.patrec_id);
    console.log("Current Mode:", currentMode);
    console.log("Is New Method:", isNewMethod);
    console.log("General Information:", {
      client_id: formData.client_id,
      philhealthNo: formData.philhealthNo,
      lastName: formData.lastName,
      givenName: formData.givenName,
      occupation: formData.occupation,
    })
    console.log("Method Information:", {
      typeOfClient: formData.typeOfClient,
      subTypeOfClient: formData.subTypeOfClient,
      methodCurrentlyUsed: formData.methodCurrentlyUsed,
      previousMethod: formData.previousMethod,
    })
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
      const finalFormData = {
        ...formData,
        pat_id: internalPatientId || formData.pat_id, // Prioritize internalPatientId
        staff_id: staff_id
      };

      if (currentMode === "followup") {
        if (!finalFormData.patrec_id) {
          toast.error("Error: Patient Record ID (patrec_id) is missing for follow-up submission.");
          return;
        }
        await submitFollowUpRecord(finalFormData) // Use new mutation for follow-up
        toast.success("Family Planning follow-up record submitted successfully!")
        navigate("/services/familyplanning/")  
      } else {
        await submitNewRecordSet(finalFormData) // Use original mutation for new record set
        const successMessage = isNewMethod 
          ? "New contraceptive method added successfully!" 
          : "Family Planning record submitted successfully!";
        toast.success(successMessage)
        navigate("/services/familyplanning/")  
      }
    } catch (error) {
      toast.error("Failed to submit record. Please try again.")
      console.error("Submission error:", error)
    }
  }

  // Display loading state while fetching data
  const isLoading = isFetchingRecord || isFetchingLatestRecord || isPrefillingData;
  const isSubmitting = isSubmittingNewRecordSet || isSubmittingFollowUpRecord;

  if (isLoading || isSubmitting) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>
          {isLoading && (isFetchingRecord && "Loading record details..." || isFetchingLatestRecord && "Loading patient's latest data..." && "Loading follow-up prefill data..." || isPrefillingData && "Pre-filling form with patient data...")}
          {isSubmitting && "Submitting form..."}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto bg-white p-8 rounded-lg shadow-md">
        {/* Show appropriate notification based on mode */}
        {isNewMethod ? (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  <strong>New Method Setup:</strong> You are adding a new contraceptive method for this patient. 
                  Please select the new method and provide the necessary information.
                </p>
              </div>
            </div>
          </div>
        ) : (shouldPrefill && internalPatientId) || currentMode === "followup" ? (
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

        <div className="text-right text-sm text-gray-500 mb-4">Page {currentPage}/6</div>

        {currentPage === 1 && (
          <FamilyPlanningForm
            onNext2={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
            isPatientPreSelected={!!internalPatientId && (shouldPrefill || currentMode === "followup" || isNewMethod)}
            patientGender={passedGender}
          />
        )}
        {currentPage === 2 && (
          <FamilyPlanningForm2
            onPrevious1={handlePrevious}
            onNext3={handleNext}
            updateFormData={updateFormData}
            formData={formData}
          />
        )}
        {currentPage === 3 && (
          <FamilyPlanningForm3
            onPrevious2={handlePrevious}
            onNext4={handleNext}
            updateFormData={updateFormData}
            formData={formData}
          />
        )}
        {currentPage === 4 && (
          <FamilyPlanningForm4
            onPrevious3={handlePrevious}
            onNext5={handleNext}
            updateFormData={updateFormData}
            formData={formData}
          />
        )}
        {currentPage === 5 && (
          <FamilyPlanningForm5
            onPrevious4={handlePrevious}
            onNext6={handleNext}
            updateFormData={updateFormData}
            formData={formData}
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
            patientGender={formData.gender} 
          />
        )}
      </div>
    </div>
  )
}