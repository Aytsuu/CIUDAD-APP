import { api2 } from "@/api/api";
import axios from "axios";

export const fp_record = async (data: Record<string, any>) => {
  try {
    console.log("🔄 Starting FP record creation with data:", data);

    // Step 1: Create PatientRecord first
    const patientRecordData = {
      patrec_type: "Family Planning",
      pat_id: data.pat_id,
    };

    console.log("📌 Creating patient record:", patientRecordData);
    const patientRecordRes = await api2.post("familyplanning/patient-record/", patientRecordData);
    console.log("✅ Patient record created:", patientRecordRes.data);
    
    const pat_id = patientRecordRes.data.pat_id;
    const patrec_id = patientRecordRes.data.patrec_id
    let per_id = data.per_id;

    if (!per_id) {
      try {
        console.log(`📌 Attempting to fetch personal ID for patient: ${pat_id}`);
        const patientRes = await api2.get(`patientrecords/patient/${pat_id}/`);
        console.log("Patientres:",patientRes)
        per_id = patientRes.data.personal_info?.per_id || patientRes.data.per_id;
        if (!per_id) {
          throw new Error("Personal ID not found in patient details response.");
        }
        console.log("✅ Personal ID fetched:", per_id);
      } catch (fetchError) {
        console.error("❌ Failed to fetch patient details to get personal ID:", fetchError);
        throw new Error("Could not determine personal ID required for health record. Please ensure patient data includes per_id or patient fetch endpoint is correct.");
      }
    }
    // const philhealthNo = data.philhealthNo || "";
   

    // Step 2: Create FP Record with the patient record ID and linked HRD ID
    const requestData = {
      client_id: data.clientID || "",
      // nhts: data.nhts_status || false, // Note: your famplan-models.py has 'nhts' commented out, verify its actual usage
      four_ps: data.pantawid_4ps || false,
      plan_more_children: data.planToHaveMoreChildren || false,
      avg_monthly_income: data.averageMonthlyIncome || "0",
      patrec_id: patrec_id, 
      patrec: patrec_id,
      pat: pat_id,
      hrd: data.hrd_res_data ? data.hrd_res_data.hrd_id : null,
      spouse: "", 
    };

    console.log("📌 Creating FP record:", requestData);
    const res = await api2.post(`familyplanning/fp_record/`, requestData);
    console.log("✅ FP record created successfully:", res.data);

    return {
      fprecord_id: res.data.fprecord_id,
      patrec_id: patrec_id,
      pat_id: pat_id,
      // hrd_id: hrd_res_data ? hrd_res_data.hrd_id : null // Return hrd_id if it was created/updated
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.error("❌ FP Record API Error (overall):", err.response?.data || err.message);
      throw new Error(`FP Record API Error: ${err.response?.data?.detail || err.message}`);
    } else {
      console.error("❌ Unexpected Error (overall):", err);
      throw err;
    }
  }
};

export const fp_type = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating FP Type");
    }

    const requestData = {
      fpt_client_type: data.typeOfClient || "New Acceptor",
      fpt_subtype: data.subTypeOfClient || null,
      fpt_reason_fp: data.reasonForFP || null,
      fpt_reason: data.reason || null,
      fpt_method_used: data.methodCurrentlyUsed || "None",
      fprecord_id: recordId,
    };

    console.log("📌 Creating FP type:", requestData);
    const res = await api2.post("familyplanning/fp_type/", requestData);
    console.log("✅ FP type created successfully:", res.data);
    return res.data.fpt_id; // fp_type correctly returns the ID directly
  } catch (err) {
    console.error("❌ Failed to create FP type:", err);
    throw err;
  }
};

export const risk_sti = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk STI");
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
    };

    console.log("Sending risk STI data:", requestData);
    const res = await api2.post("familyplanning/risk_sti/", requestData);
    console.log("Risk STI created successfully:", res.data);
    return res.data.sti_id;
  } catch (err) {
    console.error("Failed to create risk STI:", err);
    throw err;
  }
};

export const risk_vaw = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Risk VAW");
    }

    const requestData = {
      unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
      partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
      domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
      referredTo: data.violenceAgainstWomen?.referredTo || "None",
      fprecord_id: recordId,
    };

    console.log("Sending risk VAW data:", requestData);
    const res = await api2.post("familyplanning/risk_vaw/", requestData);
    console.log("Risk VAW created successfully:", res.data);
    return res.data.vaw_id;
  } catch (err) {
    console.error("Failed to create risk VAW:", err);
    throw err;
  }
};

export const fp_obstetrical = async (data: Record<string, any>, patrec_id?: number, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id;
    const patientRecordId = patrec_id || data.patrec_id; // Use the passed parameter first

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Obstetrical History");
    }

    if (!patientRecordId) {
      throw new Error("Patient Record ID (patrec_id) is required for creating Obstetrical History");
    }

    if (!data.obstetricalHistory) {
      console.error("❌ Missing `obstetricalHistory` in form data");
      throw new Error("Obstetrical history data is required");
    }

    const obs_main_requestData = {
      obs_living_ch: data.obstetricalHistory.livingChildren || 0, 
      obs_abortion: data.obstetricalHistory.abortion || 0,      
      obs_gravida: data.obstetricalHistory.g_pregnancies || 0, 
      obs_para: data.obstetricalHistory.p_pregnancies || 0,     
      obs_fullterm: data.obstetricalHistory.fullTerm || 0,       
      obs_preterm: data.obstetricalHistory.premature || 0,      
      obs_ch_born_alive: 0,
      obs_lg_babies: 0,
      obs_record_from: 0,
      obs_still_birth: 0,
      patrec_id: patientRecordId, // Use the properly obtained patientRecordId
    };

    console.log("Sending patient records obstetrical history data:", obs_main_requestData);
    const obs_res = await api2.post("/patientrecords/obstetrical_history/", obs_main_requestData);
    console.log("Patient records obstetrical history created successfully:", obs_res.data);

    const fp_obstetrical_requestData = {
      fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || null,
      fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
      fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || null,
      fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || null,
      fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
      fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
      fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
      fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
      fprecord_id: recordId,
    };

    console.log("Sending family planning obstetrical history data:", fp_obstetrical_requestData);
    const fp_obstetrical_res = await api2.post("familyplanning/obstetrical/", fp_obstetrical_requestData);
    console.log("Family planning obstetrical history created successfully:", fp_obstetrical_res.data);
    const fpob_id = fp_obstetrical_res.data.fpob_id;

    return {
      fpob_id: fpob_id,
      patient_obs_record: obs_res.data
    };

  } catch (err) {
    console.error("❌ Failed to send obstetrical data:", err);
    throw err;
  }
};


export const physical_exam = async (data: Record<string, any>, fpRecordId?: number) => {
  try {
    const recordId = fpRecordId || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Physical Exam");
    }

    // Calculate BMI if weight and height are provided
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    let bmi = 0;
    let bmi_category = "Unknown";

    if (weight && height) {
      // Calculate BMI (weight in kg / (height in m)^2)
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      
      // Round BMI to 2 decimal places and ensure it has no more than 5 digits total
      bmi = parseFloat(bmi.toFixed(2));
      
      // If BMI has more than 5 digits (e.g., 123.45 has 5 digits), adjust it
      const bmiString = bmi.toString();
      if (bmiString.replace('.', '').length > 5) {
        // If integer part is 3 digits or more, don't use decimals
        if (bmi >= 100) {
          bmi = Math.round(bmi);
        } 
        // If integer part is 2 digits, allow 1 decimal
        else if (bmi >= 10) {
          bmi = parseFloat(bmi.toFixed(1));
        }
        // Otherwise allow 2 decimals
        else {
          bmi = parseFloat(bmi.toFixed(2));
        }
      }
      
      // Determine BMI category
      if (bmi < 18.5) {
        bmi_category = "Underweight";
      } else if (bmi >= 18.5 && bmi < 25) {
        bmi_category = "Normal";
      } else if (bmi >= 25 && bmi < 30) {
        bmi_category = "Overweight";
      } else {
        bmi_category = "Obese";
      }
    }

    const requestBody = {
      weight: data.weight,
      height: data.height,
      bmi: bmi,
      bmi_category: bmi_category,
      age: data.age || 0,
      category: "Family planning",
      pat_id: data.pat_id,
      created_at: new Date().toISOString(), 
    }

    const requestData = {
      skinExamination: data.skinExamination || "normal",
      conjunctivaExamination: data.conjunctivaExamination || "normal",
      neckExamination: data.neckExamination || "normal",
      breastExamination: data.breastExamination || "normal",
      abdomenExamination: data.abdomenExamination || "normal",
      extremitiesExamination: data.extremitiesExamination || "normal",
      fprecord_id: recordId,
    };

    console.log("Sending body measurements:", requestBody);
    console.log("Sending physical exam data:", requestData);
    
    const res1 = await api2.post("patientrecords/body-measurements/", requestBody);
    const res = await api2.post("familyplanning/physical_exam/", requestData);
    
    console.log("Physical exam created successfully:", res.data);
    console.log("Weight and height created", res1.data);
    return res.data.fp_pe_id;
  } catch (err) {
    console.error("Failed to create physical exam:", err);
    throw err;
  }
};

export const pelvic_exam = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Pelvic Exam");
    }

    const isIUD = data.methodCurrentlyUsed?.includes("IUD") || false;
    if (!isIUD) {
      console.log("Skipping pelvic exam creation as method is not IUD");
      return null;
    }

    const requestData = {
      pelvicExamination: data.pelvicExamination || "normal",
      cervicalConsistency: data.cervicalConsistency || "firm",
      cervicalTenderness: data.cervicalTenderness || false,
      cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
      uterinePosition: data.uterinePosition || "mid",
      uterineDepth: data.uterineDepth || "",
      fprecord_id: recordId,
    };

    console.log("Sending pelvic exam data:", requestData);
    const res = await api2.post("familyplanning/pelvic_exam/", requestData);
    console.log("Pelvic exam created successfully:", res.data);
    return res.data.pelvic_id;
  } catch (err) {
    console.error("Failed to create pelvic exam:", err);
    throw err;
  }
};

export const acknowledgement = async (data: Record<string, any>, fprecord_id_arg?: number, fpt_id_arg?: number) => {
  try {
    const recordId = fprecord_id_arg || data.fprecord_id;
    const fptId = fpt_id_arg || data.fpt_id; // Corrected: Use the argument first
    if (!recordId) {
      throw new Error("FP Record ID is required for creating Acknowledgement");
    }
    // Optional: Add a check for fptId if it's strictly required by your backend
    // if (!fptId) {
    // throw new Error("FP Type ID is required for creating Acknowledgement");
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
export const assessment = async (
  data: Record<string, any>,
  patientRecordId?: number,
  fpRecordId?: number,
  fpTypeId?: number
) => {
  try {
    // Debug: Log all incoming data
    console.log('Assessment function called with:', {
      params: { patientRecordId, fpRecordId, fpTypeId },
      formData: {
        fpt_id: data.fpt_id,
        fp_type_id: data.fp_type_id,
        availableKeys: Object.keys(data)
      },
      serviceRecords: data.serviceProvisionRecords
    });

    const resolvedPatientId = patientRecordId || data.patrec_id || data.patient_record_id;
    const resolvedFPRecordId = fpRecordId || data.fprecord_id || data.fp_record_id;
    const resolvedFPTypeId = fpTypeId || data.fpt_id || data.fp_type_id || data.method?.type_id;

    // Validate required fields with detailed errors
    // if (!resolvedFPTypeId) {
    //   throw new Error(`Missing FP Type ID. Available data: ${JSON.stringify({
    //     params: { fpTypeId },
    //     data: { 
    //       fpt_id: resolvedFPTypeId,
    //     }
    //   })}`);
    // }

    if (!resolvedPatientId) {
      throw new Error('Patient Record ID is required');
    }

    if (!resolvedFPRecordId) {
      throw new Error('Family Planning Record ID is required');
    }

    // Get the latest service record
    const serviceRecords = data.serviceProvisionRecords || [];
    const latestRecord = serviceRecords[serviceRecords.length - 1];

    if (!latestRecord?.dateOfFollowUp) {
      throw new Error('No valid follow-up date found in service records');
    }

    // 1. Create Follow-up Visit
    const followUpData = {
      patrec: resolvedPatientId,
      followv_date: latestRecord.dateOfFollowUp,
      followv_status: 'pending',
      followv_description: 'Family Planning Follow up',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating follow-up visit:', followUpData);
    const followUpRes = await api2.post('patientrecords/follow-up-visit/', followUpData);
    const followv_id = followUpRes.data.followv_id;

    if (!followv_id) {
      throw new Error('Failed to get follow-up visit ID');
    }

    // 2. Create Assessment
    const assessmentData = {
      quantity: Number(latestRecord?.methodQuantity) || 0,
      as_provider_signature: latestRecord?.serviceProviderSignature || '',
      as_provider_name: latestRecord?.nameOfServiceProvider || '',
      as_findings: latestRecord?.medicalFindings || 'None',
      followv: followv_id,
      // fpt: resolvedFPTypeId,  // FP Type ID
      fprecord: resolvedFPRecordId,  // FP Record ID
      // Optional fields
      vital_signs: data.vital_signs_id || null,
      dispensed_items: data.dispensed_items || null,
      created_at: new Date().toISOString()
    };

    console.log('Creating assessment:', assessmentData);
    const assessmentRes = await api2.post('familyplanning/assessment/', assessmentData);

    return {
      assessmentId: assessmentRes.data.as_id,
      followUpId: followv_id,
      fpRecordId: resolvedFPRecordId
    };

  } catch (error) {
    console.error('❌ Full error details:', {
      error,
      inputData: data,
      timestamp: new Date().toISOString()
    });

    if (axios.isAxiosError(error)) {
      const apiError = {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      };
      console.error('API Error Details:', apiError);
      throw new Error(`Assessment failed: ${apiError.message}\n${JSON.stringify(apiError.data)}`);
    }

    throw new Error(`Assessment failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const pregnancy_check = async (data: Record<string, any>, fprecord_id?: number) => {
  try {
    const recordId = fprecord_id || data.fprecord_id;

    if (!recordId) {
      throw new Error("FP Record ID is required for creating Pregnancy Check");
    }

    const requestData = {
      breastfeeding: data.pregnancyCheck?.breastfeeding || false,
      abstained: data.pregnancyCheck?.abstained || false,
      recent_baby: data.pregnancyCheck?.recent_baby || false,
      recent_period: data.pregnancyCheck?.recent_period || false,
      recent_abortion: data.pregnancyCheck?.recent_abortion || false,
      using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
      fprecord_id: recordId,
    };

    console.log("Sending pregnancy check data:", requestData);
    const res = await api2.post("familyplanning/fp_pregnancycheck/", requestData);
    console.log("Pregnancy check created successfully:", res.data);
    return res.data.fp_pc_id;
  } catch (err) {
    console.error("Failed to create pregnancy check:", err);
    throw err;
  }
};

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