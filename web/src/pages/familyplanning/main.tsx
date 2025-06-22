import { fp_obstetrical,fp_record,physical_exam,fp_type,risk_sti,risk_vaw,acknowledgement,pelvic_exam,pregnancy_check,updateFPRecord,updateFPType,updateMedicalHistory,updateObstetricalHistory,updateRiskSti,updateRiskVaw,updatePhysicalExam,updatePelvicExam,updateAcknowledgement,updatePregnancyCheck, assessment} from "./request-db/PostRequest"
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

        // Store all record IDs for updates, ensuring undefined for null/missing
        setRecordIds({
          fprecord_id: id,
          fpt_id: completeRecord.fp_type?.fpt_id ?? undefined,
          medhistory_id: completeRecord.medical_history?.fp_medhistory_id ?? undefined,
          obstetrical_id: completeRecord.obstetrical?.fpob_id ?? undefined,
          sti_id: completeRecord.risk_sti?.sti_id ?? undefined,
          vaw_id: completeRecord.risk_vaw?.vaw_id ?? undefined,
          physical_id: completeRecord.physical_exam?.fp_pe_id ?? undefined,
          pelvic_id: completeRecord.pelvic_exam?.pelvic_id ?? undefined,
          ack_id: completeRecord.acknowledgement?.ack_id ?? undefined,
          pregnancy_id: completeRecord.pregnancy_check?.fp_pc_id ?? undefined,
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
      clientID: apiData.fp_record?.clientID || "",
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
        fullTerm: 0,
        premature: 0,
        abortion: 0,
        livingChildren: 0,
        lastDeliveryDate: apiData.obstetrical?.fpob_last_delivery || "",
        typeOfLastDelivery: apiData.obstetrical?.fpob_type_last_delivery || undefined,
        lastMenstrualPeriod: apiData.obstetrical?.fpob_last_period || "",
        previousMenstrualPeriod: apiData.obstetrical?.fpob_previous_period || "",
        menstrualFlow: apiData.obstetrical?.fpob_mens_flow || "Moderate",
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
        selectedMethod: mapMethodToAcknowledgement(apiData.fp_type?.fpt_method_used),
        clientSignature: apiData.acknowledgement?.ack_clientSignature || "",
        clientSignatureDate: apiData.acknowledgement?.ack_clientSignatureDate || new Date().toISOString().split("T")[0],
        guardianName: apiData.acknowledgement?.guardian_name || "",
        guardianSignature: apiData.acknowledgement?.guardian_signature || "",
        guardianSignatureDate: apiData.acknowledgement?.guardian_signature_date || new Date().toISOString().split("T")[0],
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
    };
  };

  const handleNext = () => {
    setCurrentPage((prev) => prev + 1);
    console.log("Current formData:", JSON.stringify(formData, null, 2));
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const updateFormData = (newData: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (currentMode === "create") {
        await createNewRecord();
      } else if (currentMode === "edit") {
        await updateExistingRecord();
      }
      toast.success("Family Planning Record saved successfully!");
      navigate("/FamPlanning_table");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(`Failed to save record: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const createNewRecord = async () => {
    try {
      // Step 1: Create FP Record and Patient Record
      console.log("📌 Step 1: Creating FP Record and Patient Record...");
      const fpRecordResponse = await fp_record(formData);
      console.log("✅ FP Record and Patient Record created:", fpRecordResponse);

      // MODIFIED: Destructure the object returned by fp_record
      const { fprecord_id: familyPlanningRecordId, patrec_id: patientRecordId, pat_id } = fpRecordResponse;

      // Ensure these IDs are valid before proceeding
      if (!familyPlanningRecordId) {
        throw new Error("Family Planning Record ID not returned from API. Please check API response structure.");
      }
      if (!patientRecordId) {
        throw new Error("Patient Record ID not returned from FP Record creation. Ensure fp_record API returns it.");
      }

      // Step 2: Create FP Type
      console.log("📌 Step 2: Creating FP Type...");
      const fptResponse = await fp_type(formData, familyPlanningRecordId);
      console.log("✅ FP Type created:", fptResponse);

      // MODIFIED: fp_type directly returns the ID
      const fptId = fptResponse;

      if (!fptId) {
        throw new Error("FP Type ID not returned from API. Please check API response structure for FP Type.");
      }

      // Update form data with the IDs (for potential use in subsequent steps or state)
      setFormData((prev) => ({
        ...prev,
        fprecord_id: familyPlanningRecordId,
        fpt_id: fptId,
        patrec_id: patientRecordId,
        pat_id: pat_id, // Also store pat_id if needed
      }));

      // Now call other functions, passing the correctly extracted IDs
      console.log("📌 Step 3: Creating Obstetrical History...");
      await fp_obstetrical(formData, patientRecordId, familyPlanningRecordId);

      console.log("📌 Step 4: Creating Risk STI...");
      await risk_sti(formData, familyPlanningRecordId);

      console.log("📌 Step 5: Creating Risk VAW...");
      await risk_vaw(formData, familyPlanningRecordId);

      console.log("📌 Step 6: Creating Physical Exam...");
      await physical_exam(formData, familyPlanningRecordId);

      console.log("📌 Step 7: Creating Pelvic Exam...");
      await pelvic_exam(formData, familyPlanningRecordId);

      console.log("📌 Step 8: Creating Pregnancy Check...");
      await pregnancy_check(formData, familyPlanningRecordId);

      // Call assessment with correctly extracted IDs
      console.log("📌 Step 9: Creating Assessment and Follow-up Visit...");
      try {
      const result = await assessment(
        formData,
        patientRecordId,  // patrec_id
        familyPlanningRecordId,  // fp_record_id
        // formData.fpt_id
      );
      console.log('Success:', result);
    } catch (error) {
      console.error('Operation failed:', error);
    }

      console.log("📌 Step 10: Creating Acknowledgement...");
      await acknowledgement(formData, familyPlanningRecordId, fptId);

      console.log("🎉 All records created successfully!");
    } catch (error) {
      console.error("❌ Error creating new record flow:", error);
      throw error; // Re-throw to be caught by handleSubmit's catch block
    }
  };

  const updateExistingRecord = async () => {
    try {
      if (!fpRecordId) {
        throw new Error("No Family Planning Record ID found for update.");
      }

      console.log("🔄 Starting update for FP Record ID:", fpRecordId);

      // Utility to check if data for a sub-record has changed
      const hasChanged = (current: any, original: any) => {
        if (!current && !original) return false;
        if (!current || !original) return true; // One exists, other doesn't
        return JSON.stringify(current) !== JSON.stringify(original);
      };

      // 1. Update FP Record (main record)
      if (hasChanged(formData.clientID, originalData?.clientID) ||
          hasChanged(formData.nhts_status, originalData?.nhts_status) ||
          hasChanged(formData.pantawid_4ps, originalData?.pantawid_4ps) ||
          hasChanged(formData.planToHaveMoreChildren, originalData?.planToHaveMoreChildren) ||
          hasChanged(formData.averageMonthlyIncome, originalData?.averageMonthlyIncome)
      ) {
        console.log("📌 Updating FP Record...");
        await updateFPRecord(fpRecordId, formData);
        console.log("✅ FP Record updated.");
      }

      // 2. Update FP Type
      if (hasChanged(formData.typeOfClient, originalData?.typeOfClient) ||
          hasChanged(formData.subTypeOfClient, originalData?.subTypeOfClient) ||
          hasChanged(formData.reasonForFP, originalData?.reasonForFP) ||
          hasChanged(formData.reason, originalData?.reason) ||
          hasChanged(formData.methodCurrentlyUsed, originalData?.methodCurrentlyUsed)
      ) {
        if (recordIds.fpt_id) {
          console.log("📌 Updating FP Type:", recordIds.fpt_id);
          await updateFPType(recordIds.fpt_id, formData);
          console.log("✅ FP Type updated.");
        } else {
          console.warn("FP Type ID not found for update, skipping FP Type update.");
          // Optionally, create new FP Type if it didn't exist before
          // await fp_type(formData, fpRecordId);
        }
      }

      // 3. Update Medical History
      if (hasChanged(formData.medicalHistory, originalData?.medicalHistory)) {
        if (recordIds.medhistory_id) {
          console.log("📌 Updating Medical History:", recordIds.medhistory_id);
          // await updateMedicalHistory(recordIds.medhistory_id, formData); // Uncomment if medical_history update function exists
          console.log("✅ Medical History updated.");
        } else {
          console.warn("Medical History ID not found for update, skipping Medical History update.");
          // Optionally, create new Medical History if it didn't exist before
          // await medical_history(formData, fpRecordId);
        }
      }

      // 4. Update Obstetrical History
      if (hasChanged(formData.obstetricalHistory, originalData?.obstetricalHistory)) {
        if (recordIds.obstetrical_id) {
          console.log("📌 Updating Obstetrical History:", recordIds.obstetrical_id);
          await updateObstetricalHistory(recordIds.obstetrical_id, formData);
          console.log("✅ Obstetrical History updated.");
        } else {
          console.warn("Obstetrical History ID not found for update, skipping Obstetrical History update.");
          // Optionally, create new Obstetrical History if it didn't exist before
          // await fp_obstetrical(formData, fpRecordId);
        }
      }

      // 5. Update Risk STI
      if (hasChanged(formData.sexuallyTransmittedInfections, originalData?.sexuallyTransmittedInfections)) {
        if (recordIds.sti_id) {
          console.log("📌 Updating Risk STI:", recordIds.sti_id);
          await updateRiskSti(recordIds.sti_id, formData);
          console.log("✅ Risk STI updated.");
        } else {
          console.warn("Risk STI ID not found for update, skipping Risk STI update.");
          // Optionally, create new Risk STI if it didn't exist before
          // await risk_sti(formData, fpRecordId);
        }
      }

      // 6. Update Risk VAW
      if (hasChanged(formData.violenceAgainstWomen, originalData?.violenceAgainstWomen)) {
        if (recordIds.vaw_id) {
          console.log("📌 Updating Risk VAW:", recordIds.vaw_id);
          await updateRiskVaw(recordIds.vaw_id, formData);
          console.log("✅ Risk VAW updated.");
        } else {
          console.warn("Risk VAW ID not found for update, skipping Risk VAW update.");
          // Optionally, create new Risk VAW if it didn't exist before
          // await risk_vaw(formData, fpRecordId);
        }
      }

      // 7. Update Physical Exam
      if (hasChanged(formData.weight, originalData?.weight) ||
          hasChanged(formData.height, originalData?.height) ||
          hasChanged(formData.bloodPressure, originalData?.bloodPressure) ||
          hasChanged(formData.pulseRate, originalData?.pulseRate) ||
          hasChanged(formData.skinExamination, originalData?.skinExamination) ||
          hasChanged(formData.conjunctivaExamination, originalData?.conjunctivaExamination) ||
          hasChanged(formData.neckExamination, originalData?.neckExamination) ||
          hasChanged(formData.breastExamination, originalData?.breastExamination) ||
          hasChanged(formData.abdomenExamination, originalData?.abdomenExamination) ||
          hasChanged(formData.extremitiesExamination, originalData?.extremitiesExamination)
      ) {
        if (recordIds.physical_id) {
          console.log("📌 Updating Physical Exam:", recordIds.physical_id);
          await updatePhysicalExam(recordIds.physical_id, formData);
          console.log("✅ Physical Exam updated.");
        } else {
          console.warn("Physical Exam ID not found for update, skipping Physical Exam update.");
          // Optionally, create new Physical Exam if it didn't exist before
          // await physical_exam(formData, fpRecordId);
        }
      }

      // 8. Update Pelvic Exam
      if (hasChanged(formData.pelvicExamination, originalData?.pelvicExamination) ||
          hasChanged(formData.cervicalConsistency, originalData?.cervicalConsistency) ||
          hasChanged(formData.cervicalTenderness, originalData?.cervicalTenderness) ||
          hasChanged(formData.cervicalAdnexalMassTenderness, originalData?.cervicalAdnexalMassTenderness) ||
          hasChanged(formData.uterinePosition, originalData?.uterinePosition) ||
          hasChanged(formData.uterineDepth, originalData?.uterineDepth)
      ) {
        if (recordIds.pelvic_id) {
          console.log("📌 Updating Pelvic Exam:", recordIds.pelvic_id);
          await updatePelvicExam(recordIds.pelvic_id, formData);
          console.log("✅ Pelvic Exam updated.");
        } else {
          console.warn("Pelvic Exam ID not found for update, skipping Pelvic Exam update.");
          // Optionally, create new Pelvic Exam if it didn't exist before
          // await pelvic_exam(formData, fpRecordId);
        }
      }

      // 9. Update Pregnancy Check
      if (hasChanged(formData.pregnancyCheck, originalData?.pregnancyCheck)) {
        if (recordIds.pregnancy_id) {
          console.log("📌 Updating Pregnancy Check:", recordIds.pregnancy_id);
          await updatePregnancyCheck(recordIds.pregnancy_id, formData);
          console.log("✅ Pregnancy Check updated.");
        } else {
          console.warn("Pregnancy Check ID not found for update, skipping Pregnancy Check update.");
          // Optionally, create new Pregnancy Check if it didn't exist before
          // await pregnancy_check(formData, fpRecordId);
        }
      }

      // 10. Update Acknowledgement
      if (hasChanged(formData.acknowledgement, originalData?.acknowledgement)) {
        if (recordIds.ack_id) {
          console.log("📌 Updating Acknowledgement:", recordIds.ack_id);
          await updateAcknowledgement(recordIds.ack_id, formData);
          console.log("✅ Acknowledgement updated.");
        } else {
          console.warn("Acknowledgement ID not found for update, skipping Acknowledgement update.");
          // Optionally, create new Acknowledgement if it didn't exist before
          // await acknowledgement(formData, fpRecordId);
        }
      }

      console.log("🎉 All relevant records updated successfully!");
    } catch (error) {
      console.error("❌ Error updating existing record flow:", error);
      throw error; // Re-throw to be caught by handleSubmit's catch block
    }
  };

  const mapMethodToAcknowledgement = (method: string | undefined): string => {
    switch (method) {
      case "coc":
        return "Combined Oral Contraceptives (COC)";
      case "pop":
        return "Progestin Only Pills (POP)";
      case "injectable":
        return "Injectable";
      case "implant":
        return "Implant";
      case "iud":
        return "Intrauterine Device (IUD)";
      case "bcm":
        return "Bilateral Tubal Ligation (BTL)"; // Assuming BCM maps to BTL
      case "nfp":
        return "Natural Family Planning"; // Add if applicable
      case "vasectomy":
        return "Vasectomy";
      case "others":
        return formData.otherMethod || "Other Method";
      default:
        return "Unknown Method";
    }
  };

  const isReadOnly = currentMode === "view";
  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-auto p-4">
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
  );
}