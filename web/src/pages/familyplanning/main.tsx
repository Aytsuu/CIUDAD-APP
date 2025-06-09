// import {
//   fp_obstetrical,
//   fp_record,
//   physical_exam,
//   fp_type,
//   risk_sti,
//   risk_vaw,
//   acknowledgement,
//   pelvic_exam,
//   pregnancy_check,
//   medical_history,
//   updateFPRecord,
//   updateFPType,
//   updateMedicalHistory,
//   updateObstetricalHistory,
//   updateRiskSti,
//   updateRiskVaw,
//   updatePhysicalExam,
//   updatePelvicExam,
//   updateAcknowledgement,
//   updatePregnancyCheck,
// } from "./request-db/PostRequest"
// import { getFPCompleteRecord } from "./request-db/GetRequest"
// import { useState, useEffect } from "react"
// import { useNavigate, useParams } from "react-router-dom"

// import type { FormData } from "@/form-schema/FamilyPlanningSchema"
// import FamilyPlanningForm from "./FpPage1"
// import FamilyPlanningForm2 from "./FpPage2"
// import FamilyPlanningForm3 from "./FpPage3"
// import FamilyPlanningForm4 from "./FpPage4"
// import FamilyPlanningForm5 from "./FpPage5"
// import FamilyPlanningForm6 from "./FpPage6"

// // Initial form data structure
// const initialFormData: FormData = {
//   pat_id: "",
//   fpt_id: "",
//   clientID: "",
//   philhealthNo: "",
//   nhts_status: false,
//   pantawid_4ps: false,
//   lastName: "",
//   givenName: "",
//   middleInitial: "",
//   dateOfBirth: "",
//   age: 0,
//   educationalAttainment: "",
//   occupation: "",
//   address: {
//     houseNumber: "",
//     street: "",
//     barangay: "",
//     municipality: "",
//     province: "",
//   },
//   spouse: {
//     s_lastName: "",
//     s_givenName: "",
//     s_middleInitial: "",
//     s_dateOfBirth: "",
//     s_age: 0,
//     s_occupation: "",
//   },
//   numOfLivingChildren: 0,
//   planToHaveMoreChildren: false,
//   averageMonthlyIncome: "",
//   typeOfClient: "",
//   subTypeOfClient: "",
//   reasonForFP: "",
//   otherReasonForFP: "",
//   reason: "",
//   otherReason: "",
//   methodCurrentlyUsed: undefined,
//   otherMethod: "",
//   medicalHistory: {
//     severeHeadaches: false,
//     strokeHeartAttackHypertension: false,
//     hematomaBruisingBleeding: false,
//     breastCancerHistory: false,
//     severeChestPain: false,
//     coughMoreThan14Days: false,
//     jaundice: false,
//     unexplainedVaginalBleeding: false,
//     abnormalVaginalDischarge: false,
//     phenobarbitalOrRifampicin: false,
//     smoker: false,
//     disability: false,
//     disabilityDetails: "",
//   },
//   obstetricalHistory: {
//     g_pregnancies: 0,
//     p_pregnancies: 0,
//     fullTerm: 0,
//     premature: 0,
//     abortion: 0,
//     livingChildren: 0,
//     lastDeliveryDate: "",
//     typeOfLastDelivery: undefined,
//     lastMenstrualPeriod: "",
//     previousMenstrualPeriod: "",
//     menstrualFlow: "Scanty",
//     dysmenorrhea: false,
//     hydatidiformMole: false,
//     ectopicPregnancyHistory: false,
//   },
//   sexuallyTransmittedInfections: {
//     abnormalDischarge: false,
//     dischargeFrom: undefined,
//     sores: false,
//     pain: false,
//     history: false,
//     hiv: false,
//   },
//   violenceAgainstWomen: {
//     unpleasantRelationship: false,
//     partnerDisapproval: false,
//     domesticViolence: false,
//     referredTo: undefined,
//     otherReferral: "",
//   },
//   weight: "",
//   height: "",
//   bloodPressure: "",
//   pulseRate: "",
//   skinExamination: "normal",
//   conjunctivaExamination: "normal",
//   neckExamination: "normal",
//   breastExamination: "normal",
//   abdomenExamination: "normal",
//   extremitiesExamination: "normal",
//   pelvicExamination: "normal",
//   cervicalConsistency: "firm",
//   cervicalTenderness: false,
//   cervicalAdnexalMassTenderness: false,
//   uterinePosition: "mid",
//   uterineDepth: "",
//   acknowledgement: {
//     selectedMethod: "coc",
//     clientSignature: "",
//     clientSignatureDate: new Date().toISOString().split("T")[0],
//     guardianName: "",
//     guardianSignature: "",
//     guardianSignatureDate: new Date().toISOString().split("T")[0],
//   },
//   serviceProvisionRecords: [],
//   pregnancyCheck: {
//     breastfeeding: false,
//     abstained: false,
//     recent_baby: false,
//     recent_period: false,
//     recent_abortion: false,
//     using_contraceptive: false,
//   },
//   isTransient: "Resident",
//   patientId: undefined,
// }

// interface FamilyPlanningMainProps {
//   mode?: "create" | "edit" | "view"
//   recordId?: string
// }

// export default function FamilyPlanningMain({ mode = "create", recordId }: FamilyPlanningMainProps) {
//   const [currentPage, setCurrentPage] = useState(1)
//   const [formData, setFormData] = useState<FormData>(initialFormData)
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isLoading, setIsLoading] = useState(false)
//   const [fpRecordId, setFpRecordId] = useState<number | null>(null)
//   const [recordIds, setRecordIds] = useState<any>({})

//   const navigate = useNavigate()
//   const params = useParams()

//   // Load existing record if in edit/view mode
//   useEffect(() => {
//     const id = recordId || params.id
//     if ((mode === "edit" || mode === "view") && id) {
//       loadExistingRecord(Number.parseInt(id))
//     }
//   }, [mode, recordId, params.id])

//   const loadExistingRecord = async (id: number) => {
//     setIsLoading(true)
//     try {
//       console.log("Loading FP record with ID:", id)
//       const completeRecord = await getFPCompleteRecord(id)

//       if (completeRecord) {
//         const transformedData = transformApiDataToFormData(completeRecord)
//         setFormData(transformedData)
//         setFpRecordId(id)

//         // Store all record IDs for updates
//         setRecordIds({
//           fprecord_id: id,
//           fpt_id: completeRecord.fp_type?.fpt_id,
//           medhistory_id: completeRecord.medical_history?.fp_medhistory_id,
//           obstetrical_id: completeRecord.obstetrical?.fpob_id,
//           sti_id: completeRecord.risk_sti?.sti_id,
//           vaw_id: completeRecord.risk_vaw?.vaw_id,
//           physical_id: completeRecord.physical_exam?.fp_pe_id,
//           pelvic_id: completeRecord.pelvic_exam?.pelvic_id,
//           ack_id: completeRecord.acknowledgement?.ack_id,
//           pregnancy_id: completeRecord.pregnancy_check?.fp_pc_id,
//         })

//         console.log("✅ Record loaded successfully:", completeRecord)
//       }
//     } catch (error) {
//       console.error("❌ Error loading existing record:", error)
//       alert("Failed to load the record. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const transformApiDataToFormData = (apiData: any): FormData => {
//     return {
//       ...initialFormData,
//       // FP Record data
//       pat_id: apiData.fp_record?.per_id?.toString() || "",
//       clientID: apiData.fp_record?.client_id || "",
//       nhts_status: apiData.fp_record?.nhts || false,
//       pantawid_4ps: apiData.fp_record?.four_ps || false,
//       planToHaveMoreChildren: apiData.fp_record?.plan_more_children || false,
//       averageMonthlyIncome: apiData.fp_record?.avg_monthly_income || "",

//       // FP Type data
//       typeOfClient: apiData.fp_type?.fpt_client_type || "",
//       subTypeOfClient: apiData.fp_type?.fpt_subtype || "",
//       reasonForFP: apiData.fp_type?.fpt_reason_fp || "",
//       reason: apiData.fp_type?.fpt_reason || "",
//       methodCurrentlyUsed: apiData.fp_type?.fpt_method_used || undefined,

//       // Medical History
//       medicalHistory: {
//         severeHeadaches: apiData.medical_history?.severeHeadaches || false,
//         strokeHeartAttackHypertension: apiData.medical_history?.strokeHeartAttackHypertension || false,
//         hematomaBruisingBleeding: apiData.medical_history?.hematomaBruisingBleeding || false,
//         breastCancerHistory: apiData.medical_history?.breastCancerHistory || false,
//         severeChestPain: apiData.medical_history?.severeChestPain || false,
//         coughMoreThan14Days: apiData.medical_history?.coughMoreThan14Days || false,
//         jaundice: apiData.medical_history?.jaundice || false,
//         unexplainedVaginalBleeding: apiData.medical_history?.unexplainedVaginalBleeding || false,
//         abnormalVaginalDischarge: apiData.medical_history?.abnormalVaginalDischarge || false,
//         phenobarbitalOrRifampicin: apiData.medical_history?.phenobarbitalOrRifampicin || false,
//         smoker: apiData.medical_history?.smoker || false,
//         disability: apiData.medical_history?.disability || false,
//         disabilityDetails: apiData.medical_history?.disabilityDetails || "",
//       },

//       // Obstetrical History
//       obstetricalHistory: {
//         g_pregnancies: 0, // These need to be fetched from patient record
//         p_pregnancies: 0,
//         fullTerm: 0,
//         premature: 0,
//         abortion: 0,
//         livingChildren: 0,
//         lastDeliveryDate: apiData.obstetrical?.fpob_last_delivery || "",
//         typeOfLastDelivery: apiData.obstetrical?.fpob_type_last_delivery || undefined,
//         lastMenstrualPeriod: apiData.obstetrical?.fpob_last_period || "",
//         previousMenstrualPeriod: apiData.obstetrical?.fpob_previous_period || "",
//         menstrualFlow: apiData.obstetrical?.fpob_mens_flow || "Scanty",
//         dysmenorrhea: apiData.obstetrical?.fpob_dysme || false,
//         hydatidiformMole: apiData.obstetrical?.fpob_hydatidiform || false,
//         ectopicPregnancyHistory: apiData.obstetrical?.fpob_ectopic_pregnancy || false,
//       },

//       // STI Risk
//       sexuallyTransmittedInfections: {
//         abnormalDischarge: apiData.risk_sti?.abnormalDischarge || false,
//         dischargeFrom: apiData.risk_sti?.dischargeFrom || undefined,
//         sores: apiData.risk_sti?.sores || false,
//         pain: apiData.risk_sti?.pain || false,
//         history: apiData.risk_sti?.history || false,
//         hiv: apiData.risk_sti?.hiv || false,
//       },

//       // VAW Risk
//       violenceAgainstWomen: {
//         unpleasantRelationship: apiData.risk_vaw?.unpleasant_relationship || false,
//         partnerDisapproval: apiData.risk_vaw?.partner_disapproval || false,
//         domesticViolence: apiData.risk_vaw?.domestic_violence || false,
//         referredTo: apiData.risk_vaw?.referredTo || undefined,
//         otherReferral: "",
//       },

//       // Physical Exam
//       skinExamination: apiData.physical_exam?.skinExamination || "normal",
//       conjunctivaExamination: apiData.physical_exam?.conjunctivaExamination || "normal",
//       neckExamination: apiData.physical_exam?.neckExamination || "normal",
//       breastExamination: apiData.physical_exam?.breastExamination || "normal",
//       abdomenExamination: apiData.physical_exam?.abdomenExamination || "normal",
//       extremitiesExamination: apiData.physical_exam?.extremitiesExamination || "normal",

//       // Pelvic Exam
//       pelvicExamination: apiData.pelvic_exam?.pelvicExamination || "normal",
//       cervicalConsistency: apiData.pelvic_exam?.cervicalConsistency || "firm",
//       cervicalTenderness: apiData.pelvic_exam?.cervicalTenderness || false,
//       cervicalAdnexalMassTenderness: apiData.pelvic_exam?.cervicalAdnexal || false,
//       uterinePosition: apiData.pelvic_exam?.uterinePosition || "mid",
//       uterineDepth: apiData.pelvic_exam?.uterineDepth || "",

//       // Acknowledgement
//       acknowledgement: {
//         selectedMethod: "coc", // This needs to be derived from method
//         clientSignature: apiData.acknowledgement?.ack_clientSignature || "",
//         clientSignatureDate: apiData.acknowledgement?.ack_clientSignatureDate || new Date().toISOString().split("T")[0],
//         guardianName: apiData.acknowledgement?.client_name || "",
//         guardianSignature: apiData.acknowledgement?.guardian_signature || "",
//         guardianSignatureDate: apiData.acknowledgement?.guardian_signature_date || "",
//       },

//       // Pregnancy Check
//       pregnancyCheck: {
//         breastfeeding: apiData.pregnancy_check?.breastfeeding || false,
//         abstained: apiData.pregnancy_check?.abstained || false,
//         recent_baby: apiData.pregnancy_check?.recent_baby || false,
//         recent_period: apiData.pregnancy_check?.recent_period || false,
//         recent_abortion: apiData.pregnancy_check?.recent_abortion || false,
//         using_contraceptive: apiData.pregnancy_check?.using_contraceptive || false,
//       },
//     }
//   }

//   const handleNext = () => {
//     console.log("Moving to next page, current data:", formData)
//     setCurrentPage((prev) => prev + 1)
//   }

//   const handlePrevious = () => {
//     setCurrentPage((prev) => prev - 1)
//   }

//   const updateFormData = (data: Partial<FormData>) => {
//     setFormData((prev) => ({ ...prev, ...data }))
//   }

//   const handleSubmit = async () => {
//     console.log("Starting form submission with data:", formData)
//     setIsSubmitting(true)

//     try {
//       if (mode === "edit" && fpRecordId) {
//         await updateExistingRecord()
//       } else {
//         await createNewRecord()
//       }

//       console.log("🎉 All data submitted successfully!")
//       alert(`Family Planning record ${mode === "edit" ? "updated" : "created"} successfully!`)
//       navigate("/family-planning/records")
//     } catch (err) {
//       console.error("❌ Error submitting form:", err)
//       alert("Something went wrong while submitting the form. Please check the console for details.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const createNewRecord = async () => {
//     // Step 1: Create FP Record
//     console.log("📌 Step 1: Creating FP Record...")
//     const fprecord_id = await fp_record(formData)
//     console.log("✅ FP Record created with ID:", fprecord_id)

//     // Step 2: Create FP Type
//     console.log("📌 Step 2: Creating FP Type...")
//     const fpt_id = await fp_type(formData, fprecord_id)
//     console.log("✅ FP Type created with ID:", fpt_id)

//     // Update form data with the IDs
//     setFormData((prev) => ({ ...prev, fprecord_id, fpt_id }))

//     // Step 3-10: Create all other records
//     await medical_history(formData, fprecord_id)
//     await fp_obstetrical(formData, fprecord_id)
//     await risk_sti(formData, fprecord_id)
//     await risk_vaw(formData, fprecord_id)
//     await physical_exam(formData, fprecord_id)
//     await pelvic_exam(formData, fprecord_id)
//     await pregnancy_check(formData, fprecord_id)
//     await acknowledgement(formData, fprecord_id)
//   }

//   const updateExistingRecord = async () => {
//     console.log("📌 Updating existing record with ID:", fpRecordId)

//     // Update FP Record
//     if (recordIds.fprecord_id) {
//       await updateFPRecord(recordIds.fprecord_id, formData)
//     }

//     // Update FP Type
//     if (recordIds.fpt_id) {
//       await updateFPType(recordIds.fpt_id, formData)
//     }

//     // Update Medical History
//     if (recordIds.medhistory_id) {
//       await updateMedicalHistory(recordIds.medhistory_id, formData)
//     }

//     // Update Obstetrical History
//     if (recordIds.obstetrical_id) {
//       await updateObstetricalHistory(recordIds.obstetrical_id, formData)
//     }

//     // Update Risk STI
//     if (recordIds.sti_id) {
//       await updateRiskSti(recordIds.sti_id, formData)
//     }

//     // Update Risk VAW
//     if (recordIds.vaw_id) {
//       await updateRiskVaw(recordIds.vaw_id, formData)
//     }

//     // Update Physical Exam
//     if (recordIds.physical_id) {
//       await updatePhysicalExam(recordIds.physical_id, formData)
//     }

//     // Update Pelvic Exam
//     if (recordIds.pelvic_id) {
//       await updatePelvicExam(recordIds.pelvic_id, formData)
//     }

//     // Update Acknowledgement
//     if (recordIds.ack_id) {
//       await updateAcknowledgement(recordIds.ack_id, formData)
//     }

//     // Update Pregnancy Check
//     if (recordIds.pregnancy_id) {
//       await updatePregnancyCheck(recordIds.pregnancy_id, formData)
//     }
//   }

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-lg">Loading record...</div>
//       </div>
//     )
//   }

//   return (
//     <>
//       {currentPage === 1 && (
//         <FamilyPlanningForm onNext2={handleNext} updateFormData={updateFormData} formData={formData} mode={mode} />
//       )}
//       {currentPage === 2 && (
//         <FamilyPlanningForm2
//           onPrevious1={handlePrevious}
//           onNext3={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//           mode={mode}
//         />
//       )}
//       {currentPage === 3 && (
//         <FamilyPlanningForm3
//           onPrevious2={handlePrevious}
//           onNext4={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//           mode={mode}
//         />
//       )}
//       {currentPage === 4 && (
//         <FamilyPlanningForm4
//           onPrevious3={handlePrevious}
//           onNext5={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//           mode={mode}
//         />
//       )}
//       {currentPage === 5 && (
//         <FamilyPlanningForm5
//           onPrevious4={handlePrevious}
//           onNext6={handleNext}
//           updateFormData={updateFormData}
//           formData={formData}
//           mode={mode}
//         />
//       )}
//       {currentPage === 6 && (
//         <FamilyPlanningForm6
//           onPrevious5={handlePrevious}
//           onSubmitFinal={handleSubmit}
//           updateFormData={updateFormData}
//           formData={formData}
//           isSubmitting={isSubmitting}
//           mode={mode}
//         />
//       )}
//     </>
//   )
// }


"use client"

import { fp_obstetrical,fp_record,physical_exam,fp_type,risk_sti,risk_vaw,acknowledgement,pelvic_exam,pregnancy_check,medical_history,updateFPRecord,updateFPType,updateMedicalHistory,updateObstetricalHistory,updateRiskSti,updateRiskVaw,updatePhysicalExam,updatePelvicExam,updateAcknowledgement,updatePregnancyCheck} from "./request-db/PostRequest"
import { getFPCompleteRecord } from "./request-db/GetRequest"
import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import type { FormData } from "@/form-schema/FamilyPlanningSchema"

import FamilyPlanningForm2 from "./FpPage2"
import FamilyPlanningForm3 from "./FpPage3"
import FamilyPlanningForm4 from "./FpPage4"
import FamilyPlanningForm5 from "./FpPage5"
import FamilyPlanningForm6 from "./FpPage6"
import { toast } from "sonner"
import FamilyPlanningForm from "./FpPage1"

// Initial form data structure
const initialFormData: FormData = {
  pat_id: "",
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
  address: {
    houseNumber: "",
    street: "",
    barangay: "",
    municipality: "",
    province: "",
  },
  spouse: {
    s_lastName: "",
    s_givenName: "",
    s_middleInitial: "",
    s_dateOfBirth: "",
    s_age: 0,
    s_occupation: "",
  },
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
    coughMoreThan14Days: false,
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
    livingChildren: 0,
    lastDeliveryDate: "",
    typeOfLastDelivery: undefined,
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
    otherReferral: "",
  },
  weight: "",
  height: "",
  bloodPressure: "",
  pulseRate: "",
  skinExamination: "normal",
  conjunctivaExamination: "normal",
  neckExamination: "normal",
  breastExamination: "normal",
  abdomenExamination: "normal",
  extremitiesExamination: "normal",
  pelvicExamination: "normal",
  cervicalConsistency: "firm",
  cervicalTenderness: false,
  cervicalAdnexalMassTenderness: false,
  uterinePosition: "mid",
  uterineDepth: "",
  acknowledgement: {
    selectedMethod: "coc",
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
  isTransient: "Resident",
  patientId: undefined,
}

interface FamilyPlanningMainProps {
  mode?: "create" | "edit" | "view"
}

export default function FamilyPlanningMain({ mode = "create" }: FamilyPlanningMainProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fpRecordId, setFpRecordId] = useState<number | null>(null)
  const [recordIds, setRecordIds] = useState<any>({})
  const [originalData, setOriginalData] = useState<FormData | null>(null)

  const navigate = useNavigate()
  const params = useParams()
  const [searchParams] = useSearchParams()

  // Determine mode and record ID
  const editRecordId = params.id || searchParams.get("edit")
  const viewRecordId = params.id || searchParams.get("view")
  const isEditMode = mode === "edit" || !!editRecordId
  const isViewMode = mode === "view" || !!viewRecordId
  const currentMode = isViewMode ? "view" : isEditMode ? "edit" : "create"

  // Load existing record if in edit/view mode
  useEffect(() => {
    const recordId = editRecordId || viewRecordId
    if ((isEditMode || isViewMode) && recordId) {
      loadExistingRecord(Number.parseInt(recordId))
    }
  }, [isEditMode, isViewMode, editRecordId, viewRecordId])

  const loadExistingRecord = async (id: number) => {
    setIsLoading(true)
    try {
      console.log("🔄 Loading FP record with ID:", id)
      const completeRecord = await getFPCompleteRecord(id)

      if (completeRecord) {
        const transformedData = transformApiDataToFormData(completeRecord)
        setFormData(transformedData)
        setOriginalData(transformedData) // Store original data for comparison
        setFpRecordId(id)

        // Store all record IDs for updates
        setRecordIds({
          fprecord_id: id,
          fpt_id: completeRecord.fp_type?.fpt_id,
          medhistory_id: completeRecord.medical_history?.fp_medhistory_id,
          obstetrical_id: completeRecord.obstetrical?.fpob_id,
          sti_id: completeRecord.risk_sti?.sti_id,
          vaw_id: completeRecord.risk_vaw?.vaw_id,
          physical_id: completeRecord.physical_exam?.fp_pe_id,
          pelvic_id: completeRecord.pelvic_exam?.pelvic_id,
          ack_id: completeRecord.acknowledgement?.ack_id,
          pregnancy_id: completeRecord.pregnancy_check?.fp_pc_id,
        })

        console.log("✅ Record loaded and auto-populated:", transformedData)
        toast.success("Record loaded successfully")
      }
    } catch (error) {
      console.error("❌ Error loading existing record:", error)
      toast.error("Failed to load the record. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const transformApiDataToFormData = (apiData: any): FormData => {
    // Get patient info from the related patient record
    const patientInfo = apiData.patient_info || {}

    return {
      ...initialFormData,
      // Patient and FP Record data
      pat_id: apiData.fp_record?.per_id?.toString() || "",
      clientID: apiData.fp_record?.client_id || "",
      nhts_status: apiData.fp_record?.nhts || false,
      pantawid_4ps: apiData.fp_record?.four_ps || false,
      planToHaveMoreChildren: apiData.fp_record?.plan_more_children || false,
      averageMonthlyIncome: apiData.fp_record?.avg_monthly_income || "",

      // Patient personal info (auto-populated from patient record)
      lastName: patientInfo.per_lname || "",
      givenName: patientInfo.per_fname || "",
      middleInitial: patientInfo.per_mname || "",
      dateOfBirth: patientInfo.per_dob || "",
      age: patientInfo.per_age || 0,
      educationalAttainment: patientInfo.per_edAttainment || "",
      occupation: patientInfo.per_occupation || "",

      // Address (auto-populated from patient record)
      address: {
        houseNumber: patientInfo.per_houseNumber || "",
        street: patientInfo.per_address || "",
        barangay: patientInfo.per_barangay || "",
        municipality: patientInfo.per_city || "",
        province: patientInfo.per_province || "",
      },

      // Spouse info (auto-populated from patient record)
      spouse: {
        s_lastName: patientInfo.spouse_lname || "",
        s_givenName: patientInfo.spouse_fname || "",
        s_middleInitial: patientInfo.spouse_mname || "",
        s_dateOfBirth: patientInfo.spouse_dob || "",
        s_age: patientInfo.spouse_age || 0,
        s_occupation: patientInfo.spouse_occupation || "",
      },

      // FP Type data
      typeOfClient: apiData.fp_type?.fpt_client_type || "",
      subTypeOfClient: apiData.fp_type?.fpt_subtype || "",
      reasonForFP: apiData.fp_type?.fpt_reason_fp || "",
      reason: apiData.fp_type?.fpt_reason || "",
      methodCurrentlyUsed: apiData.fp_type?.fpt_method_used || undefined,

      // Medical History
      medicalHistory: {
        severeHeadaches: apiData.medical_history?.severeHeadaches || false,
        strokeHeartAttackHypertension: apiData.medical_history?.strokeHeartAttackHypertension || false,
        hematomaBruisingBleeding: apiData.medical_history?.hematomaBruisingBleeding || false,
        breastCancerHistory: apiData.medical_history?.breastCancerHistory || false,
        severeChestPain: apiData.medical_history?.severeChestPain || false,
        coughMoreThan14Days: apiData.medical_history?.coughMoreThan14Days || false,
        jaundice: apiData.medical_history?.jaundice || false,
        unexplainedVaginalBleeding: apiData.medical_history?.unexplainedVaginalBleeding || false,
        abnormalVaginalDischarge: apiData.medical_history?.abnormalVaginalDischarge || false,
        phenobarbitalOrRifampicin: apiData.medical_history?.phenobarbitalOrRifampicin || false,
        smoker: apiData.medical_history?.smoker || false,
        disability: apiData.medical_history?.disability || false,
        disabilityDetails: apiData.medical_history?.disabilityDetails || "",
      },

      // Obstetrical History
      obstetricalHistory: {
        g_pregnancies: apiData.obstetrical?.g_pregnancies || 0,
        p_pregnancies: apiData.obstetrical?.p_pregnancies || 0,
        fullTerm: apiData.obstetrical?.fullTerm || 0,
        premature: apiData.obstetrical?.premature || 0,
        abortion: apiData.obstetrical?.abortion || 0,
        livingChildren: apiData.obstetrical?.livingChildren || 0,
        lastDeliveryDate: apiData.obstetrical?.fpob_last_delivery || "",
        typeOfLastDelivery: apiData.obstetrical?.fpob_type_last_delivery || undefined,
        lastMenstrualPeriod: apiData.obstetrical?.fpob_last_period || "",
        previousMenstrualPeriod: apiData.obstetrical?.fpob_previous_period || "",
        menstrualFlow: apiData.obstetrical?.fpob_mens_flow || "Scanty",
        dysmenorrhea: apiData.obstetrical?.fpob_dysme || false,
        hydatidiformMole: apiData.obstetrical?.fpob_hydatidiform || false,
        ectopicPregnancyHistory: apiData.obstetrical?.fpob_ectopic_pregnancy || false,
      },

      // STI Risk
      sexuallyTransmittedInfections: {
        abnormalDischarge: apiData.risk_sti?.abnormalDischarge || false,
        dischargeFrom: apiData.risk_sti?.dischargeFrom || undefined,
        sores: apiData.risk_sti?.sores || false,
        pain: apiData.risk_sti?.pain || false,
        history: apiData.risk_sti?.history || false,
        hiv: apiData.risk_sti?.hiv || false,
      },

      // VAW Risk
      violenceAgainstWomen: {
        unpleasantRelationship: apiData.risk_vaw?.unpleasant_relationship || false,
        partnerDisapproval: apiData.risk_vaw?.partner_disapproval || false,
        domesticViolence: apiData.risk_vaw?.domestic_violence || false,
        referredTo: apiData.risk_vaw?.referredTo || undefined,
        otherReferral: "",
      },

      // Physical Exam
      weight: apiData.physical_exam?.weight || "",
      height: apiData.physical_exam?.height || "",
      bloodPressure: apiData.physical_exam?.bloodPressure || "",
      pulseRate: apiData.physical_exam?.pulseRate || "",
      skinExamination: apiData.physical_exam?.skinExamination || "normal",
      conjunctivaExamination: apiData.physical_exam?.conjunctivaExamination || "normal",
      neckExamination: apiData.physical_exam?.neckExamination || "normal",
      breastExamination: apiData.physical_exam?.breastExamination || "normal",
      abdomenExamination: apiData.physical_exam?.abdomenExamination || "normal",
      extremitiesExamination: apiData.physical_exam?.extremitiesExamination || "normal",

      // Pelvic Exam
      pelvicExamination: apiData.pelvic_exam?.pelvicExamination || "normal",
      cervicalConsistency: apiData.pelvic_exam?.cervicalConsistency || "firm",
      cervicalTenderness: apiData.pelvic_exam?.cervicalTenderness || false,
      cervicalAdnexalMassTenderness: apiData.pelvic_exam?.cervicalAdnexal || false,
      uterinePosition: apiData.pelvic_exam?.uterinePosition || "mid",
      uterineDepth: apiData.pelvic_exam?.uterineDepth || "",

      // Acknowledgement
      acknowledgement: {
        selectedMethod: mapMethodToAcknowledgement(apiData.fp_type?.fpt_method_used) || "coc",
        clientSignature: apiData.acknowledgement?.ack_clientSignature || "",
        clientSignatureDate: apiData.acknowledgement?.ack_clientSignatureDate || new Date().toISOString().split("T")[0],
        guardianName: apiData.acknowledgement?.client_name || "",
        guardianSignature: apiData.acknowledgement?.guardian_signature || "",
        guardianSignatureDate: apiData.acknowledgement?.guardian_signature_date || "",
      },

      // Pregnancy Check
      pregnancyCheck: {
        breastfeeding: apiData.pregnancy_check?.breastfeeding || false,
        abstained: apiData.pregnancy_check?.abstained || false,
        recent_baby: apiData.pregnancy_check?.recent_baby || false,
        recent_period: apiData.pregnancy_check?.recent_period || false,
        recent_abortion: apiData.pregnancy_check?.recent_abortion || false,
        using_contraceptive: apiData.pregnancy_check?.using_contraceptive || false,
      },

      // Service provision records (if any)
      serviceProvisionRecords: apiData.service_records || [],
    }
  }

  // Helper function to map method to acknowledgement format
  const mapMethodToAcknowledgement = (method: string) => {
    const methodMap: { [key: string]: string } = {
      COC: "coc",
      "IUD-Interval": "iud-interval",
      "IUD-Post Partum": "iud-postpartum",
      Injectable: "injectable",
      Implant: "implant",
      Condom: "condom",
      POP: "pop",
      LAM: "lam",
      Others: "others",
    }
    return methodMap[method] || "coc"
  }

  const handleNext = () => {
    console.log("Moving to next page, current data:", formData)
    setCurrentPage((prev) => prev + 1)
  }

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1)
  }

  const updateFormData = (data: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async () => {
    console.log("Starting form submission with data:", formData)
    setIsSubmitting(true)

    try {
      if (currentMode === "edit" && fpRecordId) {
        await updateExistingRecord()
        toast.success("Family Planning record updated successfully!")
      } else {
        await createNewRecord()
        toast.success("Family Planning record created successfully!")
      }

      console.log("🎉 All data submitted successfully!")
      navigate("/family-planning/records")
    } catch (err) {
      console.error("❌ Error submitting form:", err)
      toast.error("Something went wrong while submitting the form. Please check the console for details.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const createNewRecord = async () => {
    // Step 1: Create FP Record
    console.log("📌 Step 1: Creating FP Record...")
    const fprecord_id = await fp_record(formData)
    console.log("✅ FP Record created with ID:", fprecord_id)

    // Step 2: Create FP Type
    console.log("📌 Step 2: Creating FP Type...")
    const fpt_id = await fp_type(formData, fprecord_id)
    console.log("✅ FP Type created with ID:", fpt_id)

    // Update form data with the IDs
    setFormData((prev) => ({ ...prev, fprecord_id, fpt_id }))

    // Step 3-10: Create all other records
    await medical_history(formData, fprecord_id)
    await fp_obstetrical(formData, fprecord_id)
    await risk_sti(formData, fprecord_id)
    await risk_vaw(formData, fprecord_id)
    await physical_exam(formData, fprecord_id)
    await pelvic_exam(formData, fprecord_id)
    await pregnancy_check(formData, fprecord_id)
    await acknowledgement(formData, fprecord_id)
  }

  const updateExistingRecord = async () => {
    console.log("📌 Updating existing record with ID:", fpRecordId)

    // Only update records that have changed
    const changedFields = getChangedFields(originalData, formData)
    console.log("🔄 Changed fields:", changedFields)

    // Update FP Record if changed
    if (
      recordIds.fprecord_id &&
      hasChangedFields(changedFields, [
        "clientID",
        "nhts_status",
        "pantawid_4ps",
        "planToHaveMoreChildren",
        "averageMonthlyIncome",
      ])
    ) {
      await updateFPRecord(recordIds.fprecord_id, formData)
      console.log("✅ FP Record updated")
    }

    // Update FP Type if changed
    if (
      recordIds.fpt_id &&
      hasChangedFields(changedFields, [
        "typeOfClient",
        "subTypeOfClient",
        "reasonForFP",
        "reason",
        "methodCurrentlyUsed",
      ])
    ) {
      await updateFPType(recordIds.fpt_id, formData)
      console.log("✅ FP Type updated")
    }

    // Update Medical History if changed
    if (recordIds.medhistory_id && changedFields.some((field) => field.startsWith("medicalHistory"))) {
      await updateMedicalHistory(recordIds.medhistory_id, formData)
      console.log("✅ Medical History updated")
    }

    // Update Obstetrical History if changed
    if (recordIds.obstetrical_id && changedFields.some((field) => field.startsWith("obstetricalHistory"))) {
      await updateObstetricalHistory(recordIds.obstetrical_id, formData)
      console.log("✅ Obstetrical History updated")
    }

    // Update Risk STI if changed
    if (recordIds.sti_id && changedFields.some((field) => field.startsWith("sexuallyTransmittedInfections"))) {
      await updateRiskSti(recordIds.sti_id, formData)
      console.log("✅ Risk STI updated")
    }

    // Update Risk VAW if changed
    if (recordIds.vaw_id && changedFields.some((field) => field.startsWith("violenceAgainstWomen"))) {
      await updateRiskVaw(recordIds.vaw_id, formData)
      console.log("✅ Risk VAW updated")
    }

    // Update Physical Exam if changed
    if (
      recordIds.physical_id &&
      hasChangedFields(changedFields, [
        "weight",
        "height",
        "bloodPressure",
        "pulseRate",
        "skinExamination",
        "conjunctivaExamination",
        "neckExamination",
        "breastExamination",
        "abdomenExamination",
        "extremitiesExamination",
      ])
    ) {
      await updatePhysicalExam(recordIds.physical_id, formData)
      console.log("✅ Physical Exam updated")
    }

    // Update Pelvic Exam if changed
    if (
      recordIds.pelvic_id &&
      hasChangedFields(changedFields, [
        "pelvicExamination",
        "cervicalConsistency",
        "cervicalTenderness",
        "cervicalAdnexalMassTenderness",
        "uterinePosition",
        "uterineDepth",
      ])
    ) {
      await updatePelvicExam(recordIds.pelvic_id, formData)
      console.log("✅ Pelvic Exam updated")
    }

    // Update Acknowledgement if changed
    if (recordIds.ack_id && changedFields.some((field) => field.startsWith("acknowledgement"))) {
      await updateAcknowledgement(recordIds.ack_id, formData)
      console.log("✅ Acknowledgement updated")
    }

    // Update Pregnancy Check if changed
    if (recordIds.pregnancy_id && changedFields.some((field) => field.startsWith("pregnancyCheck"))) {
      await updatePregnancyCheck(recordIds.pregnancy_id, formData)
      console.log("✅ Pregnancy Check updated")
    }
  }

  // Helper function to detect changed fields
  const getChangedFields = (original: FormData | null, current: FormData): string[] => {
    if (!original) return []

    const changes: string[] = []

    const compareObjects = (obj1: any, obj2: any, prefix = "") => {
      for (const key in obj2) {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof obj2[key] === "object" && obj2[key] !== null && !Array.isArray(obj2[key])) {
          compareObjects(obj1[key] || {}, obj2[key], fullKey)
        } else if (obj1[key] !== obj2[key]) {
          changes.push(fullKey)
        }
      }
    }

    compareObjects(original, current)
    return changes
  }

  // Helper function to check if any of the specified fields have changed
  const hasChangedFields = (changedFields: string[], fieldsToCheck: string[]): boolean => {
    return changedFields.some((field) => fieldsToCheck.includes(field))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading record...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with mode indicator */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Family Planning Form</h1>
              <p className="text-sm text-gray-600">
                {currentMode === "create" && "Create new family planning record"}
                {currentMode === "edit" && `Edit record #${fpRecordId} - Fields are auto-populated`}
                {currentMode === "view" && `View record #${fpRecordId} - Read only`}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  currentMode === "create"
                    ? "bg-green-100 text-green-800"
                    : currentMode === "edit"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}
              >
                {currentMode.toUpperCase()}
              </span>
              <span className="text-sm text-gray-500">Page {currentPage} of 6</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Pages */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 1 && (
          <FamilyPlanningForm
            onNext2={handleNext}
            updateFormData={updateFormData}
            formData={formData}
            mode={currentMode}
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
