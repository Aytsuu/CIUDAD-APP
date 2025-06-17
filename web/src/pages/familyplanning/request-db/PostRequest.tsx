// PostRequest.tsx
import { api2 } from "@/api/api";
import axios from "axios";

// This function will be called by the new composite serializer on the backend.
// On the frontend, we will consolidate all data and send it in one go.
export const createCompleteFPRecord = async (data: Record<string, any>) => {
  try {
    console.log("🔄 Sending complete FP record for creation:", data);
    // Assuming a new composite endpoint on your backend that handles all sub-records
    const res = await api2.post("familyplanning/complete_record/", data); // This is the recommended new endpoint
    console.log("✅ Complete FP record created successfully:", res.data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Complete FP Record API Error:", err.response?.data || err.message);
      // More specific error handling could be added here based on backend response
      throw new Error(`Complete FP Record API Error: ${err.response?.data?.detail || err.message}`);
    } else {
      console.error("❌ Unexpected Error:", err);
      throw err;
    }
  }
};


// The following individual functions are primarily for update operations
// or if you choose not to use a single transactional endpoint.
// For new record creation, the `createCompleteFPRecord` is preferred.

export const fp_record = async (data: Record<string, any>) => {
  try {
    console.log("🔄 Starting FP record creation with data:", data)

    // Step 1: Create PatientRecord first
    const patientRecordData = {
      patrec_type: "Family Planning",
      pat_id: data.pat_id, // This should be the patient ID from FpPage1
    }

    console.log("📌 Creating patient record:", patientRecordData)
    const patientRecordRes = await api2.post("familyplanning/patient-record/", patientRecordData)
    console.log("✅ Patient record created:", patientRecordRes.data)

    const patrec_id = patientRecordRes.data.patrec_id
    const pat_id = patientRecordRes.data.pat_id

    // Step 2: Create FP Record with the patient record ID
    const requestData = {
      client_id: data.clientID || "",
      nhts: data.nhts_status || false,
      four_ps: data.pantawid_4ps || false,
      plan_more_children: data.planToHaveMoreChildren || false,
      avg_monthly_income: data.averageMonthlyIncome || "0",
      patrec_id: patrec_id, // Link to the PatientRecord
      patrec: patrec_id,
      pat: pat_id,
      hrd: "",
      spouse: "",
    }

    console.log("📌 Creating FP record:", requestData)
    const res = await api2.post(`familyplanning/fp_record/`, requestData)
    console.log("✅ FP record created successfully:", res.data)

    return res.data.fprecord_id
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ FP Record API Error:", err.response?.data || err.message)
      throw new Error(`FP Record API Error: ${err.response?.data?.detail || err.message}`)
    } else {
      console.error("❌ Unexpected Error:", err)
      throw err
    }
  }
}

// Update fp_type to handle the relationship properly
export const fp_type = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating FP Type")
    }

    const requestData = {
      fpt_client_type: data.typeOfClient || "New Acceptor",
      fpt_subtype: data.subTypeOfClient || null,
      fpt_reason_fp: data.reasonForFP || null,
      fpt_reason: data.reason || null,
      fpt_method_used: data.methodCurrentlyUsed || "None",
      fprecord_id: recordId,
    }

    console.log("📌 Creating FP type:", requestData)
    const res = await api2.post("familyplanning/fp_type/", requestData)
    console.log("✅ FP type created successfully:", res.data)
    return res.data.fpt_id
  } catch (err) {
    console.error("❌ Failed to create FP type:", err)
    throw err
  }
}

// export const medical_history = async (data: Record<string, any>, fprecord_id?: number) => {
//   try {
//     const recordId = fprecord_id || data.fprecord_id

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Medical History")
//     }

//     const requestData = {
//       severeHeadaches: data.medicalHistory?.severeHeadaches || false,
//       strokeHeartAttackHypertension: data.medicalHistory?.strokeHeartAttackHypertension || false,
//       hematomaBruisingBleeding: data.medicalHistory?.hematomaBruisingBleeding || false,
//       breastCancerHistory: data.medicalHistory?.breastCancerHistory || false,
//       severeChestPain: data.medicalHistory?.severeChestPain || false,
//       coughMoreThan14Days: data.medicalHistory?.coughMoreThan14Days || false,
//       jaundice: data.medicalHistory?.jaundice || false,
//       unexplainedVaginalBleeding: data.medicalHistory?.unexplainedVaginalBleeding || false,
//       abnormalVaginalDischarge: data.medicalHistory?.abnormalVaginalDischarge || false,
//       phenobarbitalOrRifampicin: data.medicalHistory?.phenobarbitalOrRifampicin || false,
//       smoker: data.medicalHistory?.smoker || false,
//       disability: data.medicalHistory?.disability || false,
//       disabilityDetails: data.medicalHistory?.disabilityDetails || "",
//       fprecord_id: recordId,
//     }

//     console.log("Sending medical history data:", requestData)
//     const res = await api2.post("familyplanning/medical_history/", requestData)
//     console.log("Medical history created successfully:", res.data)
//     return res.data.fp_medhistory_id
//   } catch (err) {
//     console.error("Failed to create medical history:", err)
//     throw err
//   }
// }

export const risk_sti = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk STI")
    }

    const requestData = {
      abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
      dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
        ? data.sexuallyTransmittedInfections?.dischargeFrom || "None"
        : null,
      sores: data.sexuallyTransmittedInfections?.sores || false,
      pain: data.sexuallyTransmittedInfections?.pain || false,
      history: data.sexuallyTransmittedInfections?.history || false,
      hiv: data.sexuallyTransmittedInfections?.hiv || false,
      fprecord_id: recordId,
    }

    console.log("Sending risk STI data:", requestData)
    const res = await api2.post("familyplanning/risk_sti/", requestData)
    console.log("Risk STI created successfully:", res.data)
    return res.data.sti_id
  } catch (err) {
    console.error("Failed to create risk STI:", err)
    throw err
  }
}

export const risk_vaw = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk VAW")
    }

    const requestData = {
      unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
      partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
      domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
      referredTo: data.violenceAgainstWomen?.referredTo || "None",
      fprecord_id: recordId,
    }

    console.log("Sending risk VAW data:", requestData)
    const res = await api2.post("familyplanning/risk_vaw/", requestData)
    console.log("Risk VAW created successfully:", res.data)
    return res.data.vaw_id
  } catch (err) {
    console.error("Failed to create risk VAW:", err)
    throw err
  }
}

export const fp_obstetrical = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Obstetrical History")
    }

    if (!data.obstetricalHistory) {
      console.error("❌ Missing `obstetricalHistory` in form data")
      throw new Error("Obstetrical history data is required")
    }

    const requestData = {
      fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || null,
      fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
      fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || null,
      fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || null,
      fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
      fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
      fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
      fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
      fprecord_id: recordId,
    }

    console.log("Sending obstetrical history data:", requestData)
    const res = await api2.post("familyplanning/obstetrical/", requestData)
    console.log("Obstetrical history created successfully:", res.data)
    return res.data.fpob_id
  } catch (err) {
    console.error("❌ Failed to send obs data:", err)
    throw err
  }
}

export const physical_exam = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Physical Exam")
    }

    const requestData = {
      skinExamination: data.skinExamination || "normal",
      conjunctivaExamination: data.conjunctivaExamination || "normal",
      neckExamination: data.neckExamination || "normal",
      breastExamination: data.breastExamination || "normal",
      abdomenExamination: data.abdomenExamination || "normal",
      extremitiesExamination: data.extremitiesExamination || "normal",
      fprecord_id: recordId,
      bm_id: 1, // Assuming bm_id is a fixed or derived value
    }

    console.log("Sending physical exam data:", requestData)
    const res = await api2.post("familyplanning/physical_exam/", requestData)
    console.log("Physical exam created successfully:", res.data)
    return res.data.fp_pe_id
  } catch (err) {
    console.error("Failed to create physical exam:", err)
    throw err
  }
}

export const pelvic_exam = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Pelvic Exam")
    }

    const isIUD = data.methodCurrentlyUsed?.includes("IUD") || false
    if (!isIUD) {
      console.log("Skipping pelvic exam creation as method is not IUD")
      return null
    }

    const requestData = {
      pelvicExamination: data.pelvicExamination || "normal",
      cervicalConsistency: data.cervicalConsistency || "firm",
      cervicalTenderness: data.cervicalTenderness || false,
      cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
      uterinePosition: data.uterinePosition || "mid",
      uterineDepth: data.uterineDepth || "",
      fprecord_id: recordId,
    }

    console.log("Sending pelvic exam data:", requestData)
    const res = await api2.post("familyplanning/pelvic_exam/", requestData)
    console.log("Pelvic exam created successfully:", res.data)
    return res.data.pelvic_id
  } catch (err) {
    console.error("Failed to create pelvic exam:", err)
    throw err
  }
}

export const acknowledgement = async (data: Record<string, any>, fprecord_id_arg?: number, fpt_id_arg?: number) => {
  try {
    const recordId = fprecord_id_arg || data.fprecord_id;
    const fptId = fpt_id_arg || data.fpt_id; // Corrected: Use the argument first

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Acknowledgement");
    }
    // Optional: Add a check for fptId if it's strictly required by your backend
    // if (!fptId) {
    //   throw new Error("FP Type ID is required for creating Acknowledgement");
    // }

    const requestData = {
      ack_clientSignature: data.acknowledgement?.clientSignature || "",
      ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
      client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
      guardian_signature: data.acknowledgement?.guardianSignature || "",
      guardian_signature_date: data.acknowledgement?.guardianSignatureDate || null,
      fprecord_id: recordId,
      type: fptId, // Use the corrected fptId
    };

    console.log("Sending acknowledgement data:", requestData);
    const res = await api2.post("familyplanning/acknowledgement/", requestData);
    console.log("Acknowledgement created successfully:", res.data);
    return res.data.ack_id;
  } catch (err) {
    console.error("Failed to create acknowledgement:", err);
    throw err;
  }
};

export const pregnancy_check = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Pregnancy check")
    }

    if (!data.pregnancyCheck) {
      console.error("PregnancyCheck is missing in the submitted data", data)
      throw new Error("Pregnancy check data is required")
    }

    const requestData = {
      breastfeeding: data.pregnancyCheck?.breastfeeding || false,
      abstained: data.pregnancyCheck?.abstained || false,
      recent_baby: data.pregnancyCheck?.recent_baby || false,
      recent_period: data.pregnancyCheck?.recent_period || false,
      recent_abortion: data.pregnancyCheck?.recent_abortion || false,
      using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
      fprecord_id: recordId,
    }

    console.log("Sending pregnancy check data:", requestData)
    const res = await api2.post("familyplanning/fp_pregnancycheck/", requestData)
    console.log("Pregnancy check created successfully:", res.data)
    return res.data.fp_pc_id
  } catch (err) {
    console.error("Failed to create pregnancy check:", err)
    throw err
  }
}

// UPDATE OPERATIONS - These remain largely the same, as they update individual records
export const updateFPRecord = async (fprecord_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      client_id: data.clientID || "",
      nhts: data.nhts_status || false,
      four_ps: data.pantawid_4ps || false,
      plan_more_children: data.planToHaveMoreChildren || false,
      avg_monthly_income: data.averageMonthlyIncome || "0",
      per_id: data.pat_id, // Use pat_id for per_id when updating
    }

    console.log("Updating FP record:", requestData)
    const res = await api2.put(`familyplanning/fp_record/${fprecord_id}/`, requestData)
    console.log("FP record updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update FP record:", err)
    throw err
  }
}

export const updateFPType = async (fpt_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      fpt_client_type: data.typeOfClient || "New Acceptor",
      fpt_subtype: data.subTypeOfClient || null,
      fpt_reason_fp: data.reasonForFP || null,
      fpt_reason: data.reason || null,
      fpt_method_used: data.methodCurrentlyUsed || "None",
    }

    console.log("Updating FP type:", requestData)
    const res = await api2.put(`familyplanning/fp_type/${fpt_id}/`, requestData)
    console.log("FP type updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update FP type:", err)
    throw err
  }
}

export const updateMedicalHistory = async (medhistory_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      severeHeadaches: data.medicalHistory?.severeHeadaches || false,
      strokeHeartAttackHypertension: data.medicalHistory?.strokeHeartAttackHypertension || false,
      hematomaBruisingBleeding: data.medicalHistory?.hematomaBruisingBleeding || false,
      breastCancerHistory: data.medicalHistory?.breastCancerHistory || false,
      severeChestPain: data.medicalHistory?.severeChestPain || false,
      coughMoreThan14Days: data.medicalHistory?.coughMoreThan14Days || false,
      jaundice: data.medicalHistory?.jaundice || false,
      unexplainedVaginalBleeding: data.medicalHistory?.unexplainedVaginalBleeding || false,
      abnormalVaginalDischarge: data.medicalHistory?.abnormalVaginalDischarge || false,
      phenobarbitalOrRifampicin: data.medicalHistory?.phenobarbitalOrRifampicin || false,
      smoker: data.medicalHistory?.smoker || false,
      disability: data.medicalHistory?.disability || false,
      disabilityDetails: data.medicalHistory?.disabilityDetails || "",
    }

    console.log("Updating medical history:", requestData)
    const res = await api2.put(`familyplanning/medical_history/${medhistory_id}/`, requestData)
    console.log("Medical history updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update medical history:", err)
    throw err
  }
}

export const updateObstetricalHistory = async (obstetrical_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || null,
      fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
      fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || null,
      fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || null,
      fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
      fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
      fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
      fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
    }

    console.log("Updating obstetrical history:", requestData)
    const res = await api2.put(`familyplanning/obstetrical/${obstetrical_id}/`, requestData)
    console.log("Obstetrical history updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update obstetrical history:", err)
    throw err
  }
}

export const updateRiskSti = async (sti_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
      dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
        ? data.sexuallyTransmittedInfections?.dischargeFrom || "None"
        : null,
      sores: data.sexuallyTransmittedInfections?.sores || false,
      pain: data.sexuallyTransmittedInfections?.pain || false,
      history: data.sexuallyTransmittedInfections?.history || false,
      hiv: data.sexuallyTransmittedInfections?.hiv || false,
    }

    console.log("Updating risk STI:", requestData)
    const res = await api2.put(`familyplanning/risk_sti/${sti_id}/`, requestData)
    console.log("Risk STI updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update risk STI:", err)
    throw err
  }
}

export const updateRiskVaw = async (vaw_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
      partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
      domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
      referredTo: data.violenceAgainstWomen?.referredTo || "None",
    }

    console.log("Updating risk VAW:", requestData)
    const res = await api2.put(`familyplanning/risk_vaw/${vaw_id}/`, requestData)
    console.log("Risk VAW updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update risk VAW:", err)
    throw err
  }
}

export const updatePhysicalExam = async (physical_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      skinExamination: data.skinExamination || "normal",
      conjunctivaExamination: data.conjunctivaExamination || "normal",
      neckExamination: data.neckExamination || "normal",
      breastExamination: data.breastExamination || "normal",
      abdomenExamination: data.abdomenExamination || "normal",
      extremitiesExamination: data.extremitiesExamination || "normal",
    }

    console.log("Updating physical exam:", requestData)
    const res = await api2.put(`familyplanning/physical_exam/${physical_id}/`, requestData)
    console.log("Physical exam updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update physical exam:", err)
    throw err
  }
}

export const updatePelvicExam = async (pelvic_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      pelvicExamination: data.pelvicExamination || "normal",
      cervicalConsistency: data.cervicalConsistency || "firm",
      cervicalTenderness: data.cervicalTenderness || false,
      cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
      uterinePosition: data.uterinePosition || "mid",
      uterineDepth: data.uterineDepth || "",
    }

    console.log("Updating pelvic exam:", requestData)
    const res = await api2.put(`familyplanning/pelvic_exam/${pelvic_id}/`, requestData)
    console.log("Pelvic exam updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update pelvic exam:", err)
    throw err
  }
}

export const updateAcknowledgement = async (ack_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      ack_clientSignature: data.acknowledgement?.clientSignature || "",
      ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
      client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
      guardian_signature: data.acknowledgement?.guardianSignature || "",
      guardian_signature_date: data.acknowledgement?.guardianSignatureDate || null,
    }

    console.log("Updating acknowledgement:", requestData)
    const res = await api2.put(`familyplanning/acknowledgement/${ack_id}/`, requestData)
    console.log("Acknowledgement updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update acknowledgement:", err)
    throw err
  }
}

export const updatePregnancyCheck = async (pregnancy_id: number, data: Record<string, any>) => {
  try {
    const requestData = {
      breastfeeding: data.pregnancyCheck?.breastfeeding || false,
      abstained: data.pregnancyCheck?.abstained || false,
      recent_baby: data.pregnancyCheck?.recent_baby || false,
      recent_period: data.pregnancyCheck?.recent_period || false,
      recent_abortion: data.pregnancyCheck?.recent_abortion || false,
      using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
    }

    console.log("Updating pregnancy check:", requestData)
    const res = await api2.put(`familyplanning/fp_pregnancycheck/${pregnancy_id}/`, requestData)
    console.log("Pregnancy check updated successfully:", res.data)
    return res.data
  } catch (err) {
    console.error("Failed to update pregnancy check:", err)
    throw err
  }
}