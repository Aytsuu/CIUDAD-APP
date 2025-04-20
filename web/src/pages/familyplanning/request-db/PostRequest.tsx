import { api } from "@/api/api"
import axios from "axios"
// import { formatDate } from "@/helpers/dateFormatter"

// Update the fp_record function to correctly format the patient ID
export const fp_record = async (data: Record<string, any>) => {
  try {
    // Make sure we have a patient ID
    if (!data.pat_id) {
      console.error("❌ Missing patient ID (pat_id) in form data")
      throw new Error("Patient ID is required")
    }

    const requestData = {
      client_id: data.clientID || "",
      nhts: data.nhts_status || false,
      four_ps: data.pantawid_4ps || false,
      plan_more_children: data.planToHaveMoreChildren || false,
      avg_monthly_income: data.averageMonthlyIncome || "0",
      pat_id: data.pat_id,
    }

    console.log("Sending FP record data:", requestData)
    const res = await api.post("family-planning/fp_record/", requestData)
    console.log("FP record created successfully:", res.data)
    return res.data.fprecord_id
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ Records API Error:", err.response?.data || err.message)
    } else {
      console.error("❌ Unexpected Error:", err)
    }
    throw err // Re-throw to handle in the calling function
  }
}

// Update the fp_type function to use the fprecord_id
export const fp_type = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
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
      fprecord_id: recordId, // This is the foreign key to FP_Record
    }

    console.log("Sending FP type data:", requestData)
    const res = await api.post("family-planning/fp_type/", requestData)
    console.log("FP type created successfully:", res.data)
    return res.data.fpt_id
  } catch (err) {
    console.error("Failed to send family planning data:", err)
    throw err
  }
}

// Update the risk_sti function to use the fprecord_id
export const risk_sti = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk STI")
    }

    const requestData: Record<string, any> = {
      abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
      dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
        ? data.sexuallyTransmittedInfections?.dischargeFrom || "None"
        : null,
      sores: data.sexuallyTransmittedInfections?.sores || false,
      pain: data.sexuallyTransmittedInfections?.pain || false,
      history: data.sexuallyTransmittedInfections?.history || false,
      hiv: data.sexuallyTransmittedInfections?.hiv || false,
      fprecord_id: recordId, // This is the foreign key to FP_Record
    }

    console.log("Sending risk STI data:", requestData)
    const res = await api.post("family-planning/risk_sti/", requestData)
    console.log("Risk STI created successfully:", res.data)
    return res.data.sti_id
  } catch (err) {
    console.error("Failed to create risk STI:", err)
    throw err
  }
}

// Update the risk_vaw function to use the fprecord_id
export const risk_vaw = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk VAW")
    }

    const requestData: Record<string, any> = {
      unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
      partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
      domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
      referredTo: data.violenceAgainstWomen?.referredTo || "None",
      fprecord_id: recordId, // This is the foreign key to FP_Record
    }

    console.log("Sending risk VAW data:", requestData)
    const res = await api.post("family-planning/risk_vaw/", requestData)
    console.log("Risk VAW created successfully:", res.data)
    return res.data.vaw_id
  } catch (err) {
    console.error("Failed to create risk VAW:", err)
    throw err
  }
}

// Update the fp_obstetrical function to use the fprecord_id
export const fp_obstetrical = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Obstetrical History")
    }

    if (!data.obstetricalHistory) {
      console.error("❌ Missing `obstetricalHistory` in form data")
      throw new Error("Obstetrical history data is required")
    }

    const requestData = {
      fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || new Date().toISOString().split("T")[0],
      fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
      fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || new Date().toISOString().split("T")[0],
      fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || new Date().toISOString().split("T")[0],
      fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
      fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
      fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
      fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
      fprecord_id: recordId, // This is the foreign key to FP_Record
    }

    console.log("Sending obstetrical history data:", requestData)
    const res = await api.post("family-planning/obstetrical/", requestData)
    console.log("Obstetrical history created successfully:", res.data)
    return res.data.fpob_id
  } catch (err) {
    console.error("❌ Failed to send obs data:", err)
    throw err
  }
}

// Add the missing functions for physical_exam, pelvic_exam, acknowledgement, pregnancy_check, and fp_findings
export const physical_exam = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
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
      fprecord_id: recordId, // This is the foreign key to FP_Record
    }

    console.log("Sending physical exam data:", requestData)
    const res = await api.post("family-planning/physical_exam/", requestData)
    console.log("Physical exam created successfully:", res.data)
    return res.data.fp_pe_id
  } catch (err) {
    console.error("Failed to create physical exam:", err)
    throw err
  }
}

export const pelvic_exam = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Pelvic Exam")
    }

    // Only create pelvic exam if method is IUD
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
      fprecord_id: recordId, // This is the foreign key to FP_Record
      fpt_id: data.fpt_id || null, // This is needed if your model requires it
    }

    console.log("Sending pelvic exam data:", requestData)
    const res = await api.post("family-planning/pelvic_exam/", requestData)
    console.log("Pelvic exam created successfully:", res.data)
    return res.data.pelvic_id
  } catch (err) {
    console.error("Failed to create pelvic exam:", err)
    throw err
  }
}

export const acknowledgement = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fprecord_id || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Acknowledgement")
    }

    const requestData = {
      ack_clientSignature: data.acknowledgement?.clientSignature || "",
      ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
      client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
      guardian_signature: data.acknowledgement?.guardianSignature || "",
      guardian_signature_date: data.acknowledgement?.guardianSignatureDate || new Date().toISOString().split("T")[0],
      patient_ack_id: data.pat_id, // This is the foreign key to PatientRecordSample
      fprecord_id: recordId, // This is the foreign key to FP_Record
      fpt_id: data.fpt_id || null, // This is needed if your model requires it
    }

    console.log("Sending acknowledgement data:", requestData)
    const res = await api.post("family-planning/acknowledgement/", requestData)
    console.log("Acknowledgement created successfully:", res.data)
    return res.data.ack_id
  } catch (err) {
    console.error("Failed to create acknowledgement:", err)
    throw err
  }
}



export const pregnancy_check = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    // Use the provided fpRecordId or try to get it from data
    const recordId = fpRecordId || data.fprecord_id

    if (!recordId) {
      throw new Error("FP Record ID is required for creating FP Findings & Pregnancy check")
    }

    if (!data.pregnancyCheck) {
      console.error("PregnancyCheckSchema is missing in the submitted data", data)
      throw new Error("Pregnancy check data is required")
    }

    const requestData = {
      breastfeeding: data.pregnancyCheck?.breastfeeding || false,
      abstained: data.pregnancyCheck?.abstained || false,
      recent_baby: data.pregnancyCheck?.recent_baby || false,
      recent_period: data.pregnancyCheck?.recent_period || false,
      recent_abortion: data.pregnancyCheck?.recent_abortion || false,
      using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
      pregnancy_patient: data.pat_id, // This is the foreign key to PatientRecordSample
      fprecord_id: recordId, // This is the foreign key to FP_Record
      fpt_id: data.fpt_id || null // fk in fp_type for method used
    }

    console.log("Sending FP findings & Pregnancy check data:", requestData)
    const res = await api.post("family-planning/fp_pregnancycheck/", requestData)
    console.log("FP findings & Pregnancy check created successfully:", res.data)
    return res.data.fp_pc_id
  } catch (err) {
    console.error("Failed to create FP findings & Pregnancy check:", err)
    throw err
  }
}
