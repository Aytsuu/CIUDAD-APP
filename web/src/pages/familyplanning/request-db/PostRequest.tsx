// import { api2 } from "@/api/api";
// import axios from "axios";

// export const fp_record = async (data: Record<string, any>) => {
//   try {
//     console.log("🔄 Starting FP record creation with data:", data);

//     // Step 1: Create PatientRecord first
//     const patientRecordData = {
//       patrec_type: "Family Planning",
//       pat_id: data.pat_id,
//     };

//     console.log("📌 Creating patient record:", patientRecordData);
//     const patientRecordRes = await api2.post("familyplanning/patient-record/", patientRecordData);
//     console.log("✅ Patient record created:", patientRecordRes.data);
    
//     const pat_id = patientRecordRes.data.pat_id;
//     const patrec_id = patientRecordRes.data.patrec_id
//     let per_id = data.per_id;

//     if (!per_id) {
//       try {
//         console.log(`📌 Attempting to fetch personal ID for patient: ${pat_id}`);
//         const patientRes = await api2.get(`patientrecords/patient/${pat_id}/`);
//         console.log("Patientres:",patientRes)
//         per_id = patientRes.data.personal_info?.per_id || patientRes.data.per_id;
//         if (!per_id) {
//           throw new Error("Personal ID not found in patient details response.");
//         }
//         console.log("✅ Personal ID fetched:", per_id);
//       } catch (fetchError) {
//         console.error("❌ Failed to fetch patient details to get personal ID:", fetchError);
//         throw new Error("Could not determine personal ID required for health record. Please ensure patient data includes per_id or patient fetch endpoint is correct.");
//       }
//     }
//     const requestData = {
//       client_id: data.clientID || "",
//       // nhts: data.nhts_status || false, // Note: your famplan-models.py has 'nhts' commented out, verify its actual usage
//       four_ps: data.pantawid_4ps || false,
//       plan_more_children: data.planToHaveMoreChildren || false,
//       avg_monthly_income: data.averageMonthlyIncome || "0",
//       patrec_id: patrec_id, 
//       patrec: patrec_id,
//       pat: pat_id,
//       hrd: data.hrd_res_data ? data.hrd_res_data.hrd_id : null,
//       spouse: "", 
//     };

//     console.log("📌 Creating FP record:", requestData);
//     const res = await api2.post(`familyplanning/fp_record/`, requestData);
//     console.log("✅ FP record created successfully:", res.data);

//     return {
//       fprecord_id: res.data.fprecord_id,
//       patrec_id: patrec_id,
//       pat_id: pat_id,
//       // hrd_id: hrd_res_data ? hrd_res_data.hrd_id : null // Return hrd_id if it was created/updated
//     };
//   } catch (err) {
//     if (axios.isAxiosError(err)) {
//       console.error("❌ FP Record API Error (overall):", err.response?.data || err.message);
//       throw new Error(`FP Record API Error: ${err.response?.data?.detail || err.message}`);
//     } else {
//       console.error("❌ Unexpected Error (overall):", err);
//       throw err;
//     }
//   }
// };

// export const fp_type = async (data: Record<string, any>, fprecord_id?: number) => {
//   try {
//     const recordId = fprecord_id || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating FP Type");
//     }

//     const requestData = {
//       fpt_client_type: data.typeOfClient || "New Acceptor",
//       fpt_subtype: data.subTypeOfClient || null,
//       fpt_reason_fp: data.reasonForFP || null,
//       fpt_reason: data.reason || null,
//       fpt_method_used: data.methodCurrentlyUsed || "None",
//       fprecord_id: recordId,
//     };

//     console.log("📌 Creating FP type:", requestData);
//     const res = await api2.post("familyplanning/fp_type/", requestData);
//     console.log("✅ FP type created successfully:", res.data);
//     return res.data.fpt_id; // fp_type correctly returns the ID directly
//   } catch (err) {
//     console.error("❌ Failed to create FP type:", err);
//     throw err;
//   }
// };

// export const risk_sti = async (data: Record<string, any>, fprecord_id?: number) => {
//   try {
//     const recordId = fprecord_id || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Risk STI");
//     }

//     const requestData = {
//       abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
//       dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
//         ? data.sexuallyTransmittedInfections?.dischargeFrom || "None"
//         : null,
//       sores: data.sexuallyTransmittedInfections?.sores || false,
//       pain: data.sexuallyTransmittedInfections?.pain || false,
//       history: data.sexuallyTransmittedInfections?.history || false,
//       hiv: data.sexuallyTransmittedInfections?.hiv || false,
//       fprecord_id: recordId,
//     };

//     console.log("Sending risk STI data:", requestData);
//     const res = await api2.post("familyplanning/risk_sti/", requestData);
//     console.log("Risk STI created successfully:", res.data);
//     return res.data.sti_id;
//   } catch (err) {
//     console.error("Failed to create risk STI:", err);
//     throw err;
//   }
// };

// export const risk_vaw = async (data: Record<string, any>, fpRecordId?: number) => {
//   try {
//     const recordId = fpRecordId || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Risk VAW");
//     }

//     const requestData = {
//       unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
//       partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
//       domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
//       referredTo: data.violenceAgainstWomen?.referredTo || "None",
//       fprecord_id: recordId,
//     };

//     console.log("Sending risk VAW data:", requestData);
//     const res = await api2.post("familyplanning/risk_vaw/", requestData);
//     console.log("Risk VAW created successfully:", res.data);
//     return res.data.vaw_id;
//   } catch (err) {
//     console.error("Failed to create risk VAW:", err);
//     throw err;
//   }
// };

// export const fp_obstetrical = async (data: Record<string, any>, patrec_id?: number, fpRecordId?: number) => {
//   try {
//     const recordId = fpRecordId || data.fprecord_id;
//     const patientRecordId = patrec_id || data.patrec_id; // Use the passed parameter first

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Obstetrical History");
//     }

//     if (!patientRecordId) {
//       throw new Error("Patient Record ID (patrec_id) is required for creating Obstetrical History");
//     }

//     if (!data.obstetricalHistory) {
//       console.error("❌ Missing `obstetricalHistory` in form data");
//       throw new Error("Obstetrical history data is required");
//     }

//     const obs_main_requestData = {
//       obs_living_ch: data.obstetricalHistory.livingChildren || 0, 
//       obs_abortion: data.obstetricalHistory.abortion || 0,      
//       obs_gravida: data.obstetricalHistory.g_pregnancies || 0, 
//       obs_para: data.obstetricalHistory.p_pregnancies || 0,     
//       obs_fullterm: data.obstetricalHistory.fullTerm || 0,       
//       obs_preterm: data.obstetricalHistory.premature || 0,      
//       obs_ch_born_alive: 0,
//       obs_lg_babies: 0,
//       obs_record_from: 0,
//       obs_still_birth: 0,
//       patrec_id: patientRecordId, // Use the properly obtained patientRecordId
//     };

//     console.log("Sending patient records obstetrical history data:", obs_main_requestData);
//     const obs_res = await api2.post("/patientrecords/obstetrical_history/", obs_main_requestData);
//     console.log("Patient records obstetrical history created successfully:", obs_res.data);

//     const fp_obstetrical_requestData = {
//       fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || null,
//       fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
//       fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || null,
//       fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || null,
//       fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
//       fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
//       fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
//       fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
//       fprecord_id: recordId,
//     };

//     console.log("Sending family planning obstetrical history data:", fp_obstetrical_requestData);
//     const fp_obstetrical_res = await api2.post("familyplanning/obstetrical/", fp_obstetrical_requestData);
//     console.log("Family planning obstetrical history created successfully:", fp_obstetrical_res.data);
//     const fpob_id = fp_obstetrical_res.data.fpob_id;

//     return {
//       fpob_id: fpob_id,
//       patient_obs_record: obs_res.data
//     };

//   } catch (err) {
//     console.error("❌ Failed to send obstetrical data:", err);
//     throw err;
//   }
// };


// export const physical_exam = async (data: Record<string, any>, fpRecordId?: number) => {
//   try {
//     const recordId = fpRecordId || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Physical Exam");
//     }

//     // Calculate BMI if weight and height are provided
//     const weight = parseFloat(data.weight);
//     const height = parseFloat(data.height);
//     let bmi = 0;
//     let bmi_category = "Unknown";

//     if (weight && height) {
//       // Calculate BMI (weight in kg / (height in m)^2)
//       const heightInMeters = height / 100;
//       bmi = weight / (heightInMeters * heightInMeters);
      
//       // Round BMI to 2 decimal places and ensure it has no more than 5 digits total
//       bmi = parseFloat(bmi.toFixed(2));
      
//       // If BMI has more than 5 digits (e.g., 123.45 has 5 digits), adjust it
//       const bmiString = bmi.toString();
//       if (bmiString.replace('.', '').length > 5) {
//         // If integer part is 3 digits or more, don't use decimals
//         if (bmi >= 100) {
//           bmi = Math.round(bmi);
//         } 
//         // If integer part is 2 digits, allow 1 decimal
//         else if (bmi >= 10) {
//           bmi = parseFloat(bmi.toFixed(1));
//         }
//         // Otherwise allow 2 decimals
//         else {
//           bmi = parseFloat(bmi.toFixed(2));
//         }
//       }
      
//       // Determine BMI category
//       if (bmi < 18.5) {
//         bmi_category = "Underweight";
//       } else if (bmi >= 18.5 && bmi < 25) {
//         bmi_category = "Normal";
//       } else if (bmi >= 25 && bmi < 30) {
//         bmi_category = "Overweight";
//       } else {
//         bmi_category = "Obese";
//       }
//     }

//     const requestBody = {
//       weight: data.weight,
//       height: data.height,
//       bmi: bmi,
//       bmi_category: bmi_category,
//       age: data.age || 0,
//       category: "Family planning",
//       pat_id: data.pat_id,
//       created_at: new Date().toISOString(), 
//     }

//     const requestData = {
//       skinExamination: data.skinExamination || "normal",
//       conjunctivaExamination: data.conjunctivaExamination || "normal",
//       neckExamination: data.neckExamination || "normal",
//       breastExamination: data.breastExamination || "normal",
//       abdomenExamination: data.abdomenExamination || "normal",
//       extremitiesExamination: data.extremitiesExamination || "normal",
//       fprecord_id: recordId,
//     };

//     console.log("Sending body measurements:", requestBody);
//     console.log("Sending physical exam data:", requestData);
    
//     const res1 = await api2.post("patientrecords/body-measurements/", requestBody);
//     const res = await api2.post("familyplanning/physical_exam/", requestData);
    
//     console.log("Physical exam created successfully:", res.data);
//     console.log("Weight and height created", res1.data);
//     return res.data.fp_pe_id;
//   } catch (err) {
//     console.error("Failed to create physical exam:", err);
//     throw err;
//   }
// };

// export const pelvic_exam = async (data: Record<string, any>, fprecord_id?: number) => {
//   try {
//     const recordId = fprecord_id || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Pelvic Exam");
//     }

//     const isIUD = data.methodCurrentlyUsed?.includes("IUD") || false;
//     if (!isIUD) {
//       console.log("Skipping pelvic exam creation as method is not IUD");
//       return null;
//     }

//     const requestData = {
//       pelvicExamination: data.pelvicExamination || "normal",
//       cervicalConsistency: data.cervicalConsistency || "firm",
//       cervicalTenderness: data.cervicalTenderness || false,
//       cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
//       uterinePosition: data.uterinePosition || "mid",
//       uterineDepth: data.uterineDepth || "",
//       fprecord_id: recordId,
//     };

//     console.log("Sending pelvic exam data:", requestData);
//     const res = await api2.post("familyplanning/pelvic_exam/", requestData);
//     console.log("Pelvic exam created successfully:", res.data);
//     return res.data.pelvic_id;
//   } catch (err) {
//     console.error("Failed to create pelvic exam:", err);
//     throw err;
//   }
// };

// export const acknowledgement = async (data: Record<string, any>, fprecord_id_arg?: number, fpt_id_arg?: number) => {
//   try {
//     const recordId = fprecord_id_arg || data.fprecord_id;
//     const fptId = fpt_id_arg || data.fpt_id; // Corrected: Use the argument first
//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Acknowledgement");
//     }
//     // Optional: Add a check for fptId if it's strictly required by your backend
//     // if (!fptId) {
//     // throw new Error("FP Type ID is required for creating Acknowledgement");
//     // }
//     const requestData = {
//       ack_clientSignature: data.acknowledgement?.clientSignature || "",
//       ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
//       client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
//       guardian_signature: data.acknowledgement?.guardianSignature || "",
//       guardian_signature_date: data.acknowledgement?.guardianSignatureDate || null,
//       fprecord_id: recordId,
//       type: fptId, // Use the corrected fptId
//     };

//     console.log("Sending acknowledgement data:", requestData);
//     const res = await api2.post("familyplanning/acknowledgement/", requestData);
//     console.log("Acknowledgement created successfully:", res.data);
//     return res.data.ack_id;
//   } catch (err) {
//     console.error("Failed to create acknowledgement:", err);
//     throw err;
//   }
// };
// export const assessment = async (
//   data: Record<string, any>,
//   patientRecordId?: number,
//   fpRecordId?: number,
//   fpTypeId?: number
// ) => {
//   try {
//     // Debug: Log all incoming data
//     console.log('Assessment function called with:', {
//       params: { patientRecordId, fpRecordId, fpTypeId },
//       formData: {
//         fpt_id: data.fpt_id,
//         fp_type_id: data.fp_type_id,
//         availableKeys: Object.keys(data)
//       },
//       serviceRecords: data.serviceProvisionRecords
//     });

//     const resolvedPatientId = patientRecordId || data.patrec_id || data.patient_record_id;
//     const resolvedFPRecordId = fpRecordId || data.fprecord_id || data.fp_record_id;
//     const resolvedFPTypeId = fpTypeId || data.fpt_id || data.fp_type_id || data.method?.type_id;

//     // Validate required fields with detailed errors
//     // if (!resolvedFPTypeId) {
//     //   throw new Error(`Missing FP Type ID. Available data: ${JSON.stringify({
//     //     params: { fpTypeId },
//     //     data: { 
//     //       fpt_id: resolvedFPTypeId,
//     //     }
//     //   })}`);
//     // }

//     if (!resolvedPatientId) {
//       throw new Error('Patient Record ID is required');
//     }

//     if (!resolvedFPRecordId) {
//       throw new Error('Family Planning Record ID is required');
//     }

//     // Get the latest service record
//     const serviceRecords = data.serviceProvisionRecords || [];
//     const latestRecord = serviceRecords[serviceRecords.length - 1];

//     if (!latestRecord?.dateOfFollowUp) {
//       throw new Error('No valid follow-up date found in service records');
//     }

//     // 1. Create Follow-up Visit
//     const followUpData = {
//       patrec: resolvedPatientId,
//       followv_date: latestRecord.dateOfFollowUp,
//       followv_status: 'pending',
//       followv_description: 'Family Planning Follow up',
//       created_at: new Date().toISOString(),
//       updated_at: new Date().toISOString()
//     };

//     console.log('Creating follow-up visit:', followUpData);
//     const followUpRes = await api2.post('patientrecords/follow-up-visit/', followUpData);
//     const followv_id = followUpRes.data.followv_id;

//     if (!followv_id) {
//       throw new Error('Failed to get follow-up visit ID');
//     }

//     // 2. Create Assessment
//     const assessmentData = {
//       quantity: Number(latestRecord?.methodQuantity) || 0,
//       as_provider_signature: latestRecord?.serviceProviderSignature || '',
//       as_provider_name: latestRecord?.nameOfServiceProvider || '',
//       as_findings: latestRecord?.medicalFindings || 'None',
//       followv: followv_id,
//       // fpt: resolvedFPTypeId,  // FP Type ID
//       fprecord: resolvedFPRecordId,  // FP Record ID
//       // Optional fields
//       // vital_signs: data.vital_signs_id || null,
//       dispensed_items: data.dispensed_items || null,
//       created_at: new Date().toISOString()
//     };

//     console.log('Creating assessment:', assessmentData);
//     const assessmentRes = await api2.post('familyplanning/assessment/', assessmentData);

//     return {
//       assessmentId: assessmentRes.data.as_id,
//       followUpId: followv_id,
//       fpRecordId: resolvedFPRecordId
//     };

//   } catch (error) {
//     console.error('❌ Full error details:', {
//       error,
//       inputData: data,
//       timestamp: new Date().toISOString()
//     });

//     if (axios.isAxiosError(error)) {
//       const apiError = {
//         status: error.response?.status,
//         data: error.response?.data,
//         message: error.message
//       };
//       console.error('API Error Details:', apiError);
//       throw new Error(`Assessment failed: ${apiError.message}\n${JSON.stringify(apiError.data)}`);
//     }

//     throw new Error(`Assessment failed: ${error instanceof Error ? error.message : String(error)}`);
//   }
// };

// export const pregnancy_check = async (data: Record<string, any>, fprecord_id?: number) => {
//   try {
//     const recordId = fprecord_id || data.fprecord_id;

//     if (!recordId) {
//       throw new Error("FP Record ID is required for creating Pregnancy Check");
//     }

//     const requestData = {
//       breastfeeding: data.pregnancyCheck?.breastfeeding || false,
//       abstained: data.pregnancyCheck?.abstained || false,
//       recent_baby: data.pregnancyCheck?.recent_baby || false,
//       recent_period: data.pregnancyCheck?.recent_period || false,
//       recent_abortion: data.pregnancyCheck?.recent_abortion || false,
//       using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
//       fprecord_id: recordId,
//     };

//     console.log("Sending pregnancy check data:", requestData);
//     const res = await api2.post("familyplanning/fp_pregnancycheck/", requestData);
//     console.log("Pregnancy check created successfully:", res.data);
//     return res.data.fp_pc_id;
//   } catch (err) {
//     console.error("Failed to create pregnancy check:", err);
//     throw err;
//   }
// };

// // UPDATE OPERATIONS - These remain largely the same, as they update individual records
// export const updateFPRecord = async (fprecord_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       client_id: data.clientID || "",
//       nhts: data.nhts_status || false,
//       four_ps: data.pantawid_4ps || false,
//       plan_more_children: data.planToHaveMoreChildren || false,
//       avg_monthly_income: data.averageMonthlyIncome || "0",
//       per_id: data.pat_id, // Use pat_id for per_id when updating
//     }

//     console.log("Updating FP record:", requestData)
//     const res = await api2.put(`familyplanning/fp_record/${fprecord_id}/`, requestData)
//     console.log("FP record updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update FP record:", err)
//     throw err
//   }
// }

// export const updateFPType = async (fpt_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       fpt_client_type: data.typeOfClient || "New Acceptor",
//       fpt_subtype: data.subTypeOfClient || null,
//       fpt_reason_fp: data.reasonForFP || null,
//       fpt_reason: data.reason || null,
//       fpt_method_used: data.methodCurrentlyUsed || "None",
//     }

//     console.log("Updating FP type:", requestData)
//     const res = await api2.put(`familyplanning/fp_type/${fpt_id}/`, requestData)
//     console.log("FP type updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update FP type:", err)
//     throw err
//   }
// }

// export const updateMedicalHistory = async (medhistory_id: number, data: Record<string, any>) => {
//   try {
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
//     }

//     console.log("Updating medical history:", requestData)
//     const res = await api2.put(`familyplanning/medical_history/${medhistory_id}/`, requestData)
//     console.log("Medical history updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update medical history:", err)
//     throw err
//   }
// }

// export const updateObstetricalHistory = async (obstetrical_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       fpob_last_delivery: data.obstetricalHistory?.lastDeliveryDate || null,
//       fpob_type_last_delivery: data.obstetricalHistory?.typeOfLastDelivery || null,
//       fpob_last_period: data.obstetricalHistory?.lastMenstrualPeriod || null,
//       fpob_previous_period: data.obstetricalHistory?.previousMenstrualPeriod || null,
//       fpob_mens_flow: data.obstetricalHistory?.menstrualFlow || "Moderate",
//       fpob_dysme: data.obstetricalHistory?.dysmenorrhea || false,
//       fpob_hydatidiform: data.obstetricalHistory?.hydatidiformMole || false,
//       fpob_ectopic_pregnancy: data.obstetricalHistory?.ectopicPregnancyHistory || false,
//     }

//     console.log("Updating obstetrical history:", requestData)
//     const res = await api2.put(`familyplanning/obstetrical/${obstetrical_id}/`, requestData)
//     console.log("Obstetrical history updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update obstetrical history:", err)
//     throw err
//   }
// }

// export const updateRiskSti = async (sti_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
//       dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
//         ? data.sexuallyTransmittedInfections?.dischargeFrom || "None"
//         : null,
//       sores: data.sexuallyTransmittedInfections?.sores || false,
//       pain: data.sexuallyTransmittedInfections?.pain || false,
//       history: data.sexuallyTransmittedInfections?.history || false,
//       hiv: data.sexuallyTransmittedInfections?.hiv || false,
//     }

//     console.log("Updating risk STI:", requestData)
//     const res = await api2.put(`familyplanning/risk_sti/${sti_id}/`, requestData)
//     console.log("Risk STI updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update risk STI:", err)
//     throw err
//   }
// }

// export const updateRiskVaw = async (vaw_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
//       partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
//       domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
//       referredTo: data.violenceAgainstWomen?.referredTo || "None",
//     }

//     console.log("Updating risk VAW:", requestData)
//     const res = await api2.put(`familyplanning/risk_vaw/${vaw_id}/`, requestData)
//     console.log("Risk VAW updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update risk VAW:", err)
//     throw err
//   }
// }

// export const updatePhysicalExam = async (physical_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       skinExamination: data.skinExamination || "normal",
//       conjunctivaExamination: data.conjunctivaExamination || "normal",
//       neckExamination: data.neckExamination || "normal",
//       breastExamination: data.breastExamination || "normal",
//       abdomenExamination: data.abdomenExamination || "normal",
//       extremitiesExamination: data.extremitiesExamination || "normal",
//     }

//     console.log("Updating physical exam:", requestData)
//     const res = await api2.put(`familyplanning/physical_exam/${physical_id}/`, requestData)
//     console.log("Physical exam updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update physical exam:", err)
//     throw err
//   }
// }

// export const updatePelvicExam = async (pelvic_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       pelvicExamination: data.pelvicExamination || "normal",
//       cervicalConsistency: data.cervicalConsistency || "firm",
//       cervicalTenderness: data.cervicalTenderness || false,
//       cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
//       uterinePosition: data.uterinePosition || "mid",
//       uterineDepth: data.uterineDepth || "",
//     }

//     console.log("Updating pelvic exam:", requestData)
//     const res = await api2.put(`familyplanning/pelvic_exam/${pelvic_id}/`, requestData)
//     console.log("Pelvic exam updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update pelvic exam:", err)
//     throw err
//   }
// }

// export const updateAcknowledgement = async (ack_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       ack_clientSignature: data.acknowledgement?.clientSignature || "",
//       ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
//       client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
//       guardian_signature: data.acknowledgement?.guardianSignature || "",
//       guardian_signature_date: data.acknowledgement?.guardianSignatureDate || null,
//     }

//     console.log("Updating acknowledgement:", requestData)
//     const res = await api2.put(`familyplanning/acknowledgement/${ack_id}/`, requestData)
//     console.log("Acknowledgement updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update acknowledgement:", err)
//     throw err
//   }
// }

// export const updatePregnancyCheck = async (pregnancy_id: number, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       breastfeeding: data.pregnancyCheck?.breastfeeding || false,
//       abstained: data.pregnancyCheck?.abstained || false,
//       recent_baby: data.pregnancyCheck?.recent_baby || false,
//       recent_period: data.pregnancyCheck?.recent_period || false,
//       recent_abortion: data.pregnancyCheck?.recent_abortion || false,
//       using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
//     }

//     console.log("Updating pregnancy check:", requestData)
//     const res = await api2.put(`familyplanning/fp_pregnancycheck/${pregnancy_id}/`, requestData)
//     console.log("Pregnancy check updated successfully:", res.data)
//     return res.data
//   } catch (err) {
//     console.error("Failed to update pregnancy check:", err)
//     throw err
//   }
// }


import { api2 } from "@/api/api";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { type FormData } from "@/form-schema/FamilyPlanningSchema"; // Assuming this schema is comprehensive

// --- 1. Individual API Call Functions (adapted for clearer returns) ---

export const createFPRecord = async (data: Record<string, any>) => {
  try {
    console.log("🔄 Starting FP record creation with data:", data);

    // Step 1: Create PatientRecord first
    const patientRecordData = {
      patrec_type: "Family Planning",
      pat_id: data.pat_id, // This should be the pat_id selected in FpPage1
    };

    console.log("📌 Creating patient record for FP:", patientRecordData);
    const patientRecordRes = await api2.post("familyplanning/patient-record/", patientRecordData);
    console.log("✅ Patient record created:", patientRecordRes.data);

    const pat_id = patientRecordRes.data.pat_id;
    const patrec_id = patientRecordRes.data.patrec_id; // patrec_id for the Family Planning record type

    const requestData = {
      client_id: data.clientID || "",
      four_ps: data.pantawid_4ps || false,
      plan_more_children: data.planToHaveMoreChildren || false,
      avg_monthly_income: data.averageMonthlyIncome || "0",
      occupation: data.occupation || null, // Ensure occupation is passed
      patrec: patrec_id, // Link to the PatientRecord for this FP entry
      pat: pat_id, // Link to the Patient
      hrd: data.hrd_id || null, // Assuming hrd_id comes from initial patient fetch or will be handled if needed
      spouse: data.spouse_id || null, // Assuming spouse_id comes from initial patient fetch or will be handled if needed
    };

    console.log("📌 Creating FP record:", requestData);
    const res = await api2.post(`familyplanning/fp_record/`, requestData);
    console.log("✅ FP record created successfully:", res.data);

    return {
      fprecord_id: res.data.fprecord_id,
      patrec_id: patrec_id, // PatientRecord ID for this FP entry
      pat_id: pat_id, // Original patient ID
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

export const createFPType = async (data: Record<string, any>, fprecord_id: number) => {
  try {
    // IMPORTANT: Log the incoming fprecord_id here to confirm its value
    console.log(`📌 createFPType received fprecord_id: ${fprecord_id}`);

    if (!fprecord_id) {
        throw new Error("fprecord_id is missing or invalid for FP Type creation.");
    }

    const requestData = {
      fpt_client_type: data.typeOfClient || "New Acceptor",
      fpt_subtype: data.subTypeOfClient || null,
      fpt_reason_fp: data.reasonForFP || null,
      fpt_reason: data.reason || null,
      fpt_method_used: data.methodCurrentlyUsed || "None",
      fprecord_id: fprecord_id, // Link to the FP_Record
    };

    console.log("📌 Creating FP type with data:", requestData);
    const res = await api2.post("familyplanning/fp_type/", requestData);
    console.log("✅ FP type created successfully:", res.data);
    return res.data.fpt_id;
  } catch (err) {
    console.error("❌ Failed to create FP type:", err);
    throw err;
  }
};

export const createRiskSti = async (data: Record<string, any>, fprecord_id: number) => {
  try {
    const requestData = {
      abnormalDischarge: data.sexuallyTransmittedInfections?.abnormalDischarge || false,
      dischargeFrom: data.sexuallyTransmittedInfections?.abnormalDischarge
        ? data.sexuallyTransmittedInfections?.dischargeFrom || null
        : null,
      sores: data.sexuallyTransmittedInfections?.sores || false,
      pain: data.sexuallyTransmittedInfections?.pain || false,
      history: data.sexuallyTransmittedInfections?.history || false,
      hiv: data.sexuallyTransmittedInfections?.hiv || false,
      fprecord_id: fprecord_id, // Link to the FP_Record
    };

    console.log("📌 Creating risk STI:", requestData);
    const res = await api2.post("familyplanning/risk_sti/", requestData);
    console.log("✅ Risk STI created successfully:", res.data);
    return res.data.sti_id;
  } catch (err) {
    console.error("❌ Failed to create risk STI:", err);
    throw err;
  }
};

export const createRiskVaw = async (data: Record<string, any>, fprecord_id: number) => {
  try {
    const requestData = {
      unpleasant_relationship: data.violenceAgainstWomen?.unpleasantRelationship || false,
      partner_disapproval: data.violenceAgainstWomen?.partnerDisapproval || false,
      domestic_violence: data.violenceAgainstWomen?.domesticViolence || false,
      referredTo: data.violenceAgainstWomen?.referredTo || null,
      fprecord_id: fprecord_id, // Link to the FP_Record
    };

    console.log("📌 Creating risk VAW:", requestData);
    const res = await api2.post("familyplanning/risk_vaw/", requestData);
    console.log("✅ Risk VAW created successfully:", res.data);
    return res.data.vaw_id;
  } catch (err) {
    console.error("❌ Failed to create risk VAW:", err);
    throw err;
  }
};

// New function to fetch existing Obstetrical_History from patientrecords
export const getExistingObstetricalHistory = async (pat_id: string) => {
  try {
    const response = await api2.get(`patientrecords/obstetrical_history/by_patient/${pat_id}/`); // Assuming this new endpoint exists
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      console.log(`No existing obstetrical history found for patient ${pat_id}`);
      return null; // Return null if not found
    }
    console.error("Error fetching existing obstetrical history:", err);
    throw err;
  }
};

// Function to create a new Obstetrical_History in patientrecords
export const createPatientObstetricalHistory = async (data: Record<string, any>, pat_id: string) => {
  try {
    // 1. Create PatientRecord specifically for Obstetrical History type
    const patientRecordData = {
      patrec_type: "Obstetrical",
      pat_id: pat_id,
    };
    console.log("📌 Creating patient record for Obstetrical History:", patientRecordData);
    const patientRecordRes = await api2.post("familyplanning/patient-record/", patientRecordData); // Re-use the existing endpoint
    const patrec_id_obs = patientRecordRes.data.patrec_id;

    // 2. Create the Obstetrical_History record
    const requestData = {
      obs_living_ch: data.obstetricalHistory?.livingChildren || 0,
      obs_abortion: data.obstetricalHistory?.abortion || 0,
      obs_gravida: data.obstetricalHistory?.g_pregnancies || 0,
      obs_para: data.obstetricalHistory?.p_pregnancies || 0,
      obs_fullterm: data.obstetricalHistory?.fullTerm || 0,
      obs_preterm: data.obstetricalHistory?.premature || 0,
      obs_ch_born_alive: 0, // Assuming default or not collected on form
      obs_lg_babies: 0, // Assuming default or not collected on form
      obs_record_from: "Family Planning", // Source of the record
      obs_still_birth: 0, // Assuming default or not collected on form
      patrec_id: patrec_id_obs, // Link to the specific Obstetrical PatientRecord
    };

    console.log("📌 Creating patient obstetrical history:", requestData);
    const res = await api2.post("/patientrecords/obstetrical_history/", requestData);
    console.log("✅ Patient obstetrical history created successfully:", res.data);
    return { obs_id: res.data.obs_id, patrec_id_obs: patrec_id_obs };
  } catch (err) {
    console.error("❌ Failed to create patient obstetrical history:", err);
    throw err;
  }
};

export const createFPOBstetricalHistory = async (
  data: Record<string, any>,
  fprecord_id: number,
  obs_id: number, // The obs_id from the patientrecords.Obstetrical_History
  fpt_id: number // FP Type ID from Page 1
) => {
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
      fprecord_id: fprecord_id, // Link to the FP_Record
      obs_id: obs_id, // Link to the Obstetrical_History (patientrecords)

    };

    console.log("📌 Creating FP obstetrical history:", requestData);
    const res = await api2.post("familyplanning/obstetrical/", requestData); 

    console.log("✅ FP obstetrical history created successfully:", res.data);
    return res.data.fpob_id;
  } catch (err) {
    console.error("❌ Failed to create FP obstetrical history:", err);
    throw err;
  }
};
// New function to fetch existing BodyMeasurement from patientrecords
export const getLatestBodyMeasurement = async (pat_id: string) => {
  try {
    // Assuming an endpoint to get the latest body measurement for a patient
    const response = await api2.get(`patientrecords/body-measurements/latest/${pat_id}/`); // You might need to create this endpoint
    return response.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      console.log(`No existing body measurement found for patient ${pat_id}`);
      return null;
    }
    console.error("Error fetching latest body measurement:", err);
    throw err;
  }
};

// Function to create a new BodyMeasurement in patientrecords
export const createBodyMeasurement = async (data: Record<string, any>, pat_id: string) => {
  try {
    // Calculate BMI
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    let bmi = 0;
    let bmi_category = "Unknown";

    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      bmi = parseFloat(bmi.toFixed(2)); // Round BMI
      if (bmi < 18.5) bmi_category = "Underweight";
      else if (bmi < 25) bmi_category = "Normal";
      else if (bmi < 30) bmi_category = "Overweight";
      else bmi_category = "Obese";
    }

    const requestData = {
      weight: data.weight,
      height: data.height,
      bmi: bmi,
      bmi_category: bmi_category,
      age: data.age || 0, // Ensure age is passed from form data
      category: "Family planning", // Or "General" if not specific to FP
      pat_id: pat_id,
      created_at: new Date().toISOString(),
    };

    console.log("📌 Creating body measurement:", requestData);
    const res = await api2.post("patientrecords/body-measurements/", requestData);
    console.log("✅ Body measurement created successfully:", res.data);
    return res.data.bm_id; // Assuming bm_id is returned
  } catch (err) {
    console.error("❌ Failed to create body measurement:", err);
    throw err;
  }
};

// Function to update an existing BodyMeasurement in patientrecords
export const updateBodyMeasurement = async (bm_id: number, data: Record<string, any>) => {
  try {
    // Recalculate BMI based on potentially updated weight/height
    const weight = parseFloat(data.weight);
    const height = parseFloat(data.height);
    let bmi = 0;
    let bmi_category = "Unknown";

    if (weight && height) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      bmi = parseFloat(bmi.toFixed(2));
      if (bmi < 18.5) bmi_category = "Underweight";
      else if (bmi < 25) bmi_category = "Normal";
      else if (bmi < 30) bmi_category = "Overweight";
      else bmi_category = "Obese";
    }

    const requestData = {
      weight: data.weight,
      height: data.height,
      bmi: bmi,
      bmi_category: bmi_category,
      age: data.age || 0, // Ensure age is passed from form data
      category: "Family planning", // Or "General" if not specific to FP
    };

    console.log("📌 Updating body measurement:", requestData);
    const res = await api2.put(`patientrecords/body-measurements/${bm_id}/`, requestData);
    console.log("✅ Body measurement updated successfully:", res.data);
    return res.data.bm_id;
  } catch (err) {
    console.error("❌ Failed to update body measurement:", err);
    throw err;
  }
};


export const createPhysicalExam = async (data: Record<string, any>, fprecord_id: number, bm_id: number) => {
  try {
    const requestData = {
      skinExamination: data.skinExamination || "normal",
      conjunctivaExamination: data.conjunctivaExamination || "normal",
      neckExamination: data.neckExamination || "normal",
      breastExamination: data.breastExamination || "normal",
      abdomenExamination: data.abdomenExamination || "normal",
      extremitiesExamination: data.extremitiesExamination || "normal",
      blood_pressure: data.bloodPressure || null, // Assuming you collect this
      pulse_rate: data.pulseRate || null, // Assuming you collect this
      fprecord_id: fprecord_id, // Link to the FP_Record
      bm: bm_id, // Link to the BodyMeasurement
    };

    console.log("📌 Creating physical exam:", requestData);
    const res = await api2.post("familyplanning/physical_exam/", requestData);
    console.log("✅ Physical exam created successfully:", res.data);
    return res.data.fp_pe_id;
  } catch (err) {
    console.error("❌ Failed to create physical exam:", err);
    throw err;
  }
};

export const createPelvicExam = async (data: Record<string, any>, fprecord_id: number) => {
  try {
    // Only create if IUD method is selected
    const isIUDSelected = data.methodCurrentlyUsed?.includes("IUD");
    if (!isIUDSelected) {
      console.log("Skipping pelvic exam creation as method is not IUD.");
      return null;
    }

    const requestData = {
      pelvicExamination: data.pelvicExamination || "normal",
      cervicalConsistency: data.cervicalConsistency || "firm",
      cervicalTenderness: data.cervicalTenderness || false,
      cervicalAdnexal: data.cervicalAdnexalMassTenderness || false,
      uterinePosition: data.uterinePosition || "mid",
      uterineDepth: data.uterineDepth || "",
      fprecord_id: fprecord_id, // Link to the FP_Record
    };

    console.log("📌 Creating pelvic exam:", requestData);
    const res = await api2.post("familyplanning/pelvic_exam/", requestData);
    console.log("✅ Pelvic exam created successfully:", res.data);
    return res.data.pelvic_id;
  } catch (err) {
    console.error("❌ Failed to create pelvic exam:", err);
    throw err;
  }
};

export const createAcknowledgement = async (
  data: Record<string, any>,
  fprecord_id: number,
  fpt_id: number // FP Type ID from Page 1
) => {
  try {
    const requestData = {
      ack_clientSignature: data.acknowledgement?.clientSignature || "",
      ack_clientSignatureDate: data.acknowledgement?.clientSignatureDate || new Date().toISOString().split("T")[0],
      client_name: `${data.lastName}, ${data.givenName} ${data.middleInitial || ""}`.trim(),
      guardian_signature: data.acknowledgement?.guardianSignature || "",
      guardian_signature_date: data.acknowledgement?.guardianSignatureDate || null,
      fprecord_id: fprecord_id, // Link to the FP_Record
      type: fpt_id, // Link to the FP_Type
    };

    console.log("📌 Creating acknowledgement:", requestData);
    const res = await api2.post("familyplanning/acknowledgement/", requestData);
    console.log("✅ Acknowledgement created successfully:", res.data);
    return res.data.ack_id;
  } catch (err) {
    console.error("❌ Failed to create acknowledgement:", err);
    throw err;
  }
};

export const createPregnancyCheck = async (data: Record<string, any>, fprecord_id: number) => {
  try {
    const requestData = {
      breastfeeding: data.pregnancyCheck?.breastfeeding || false,
      abstained: data.pregnancyCheck?.abstained || false,
      recent_baby: data.pregnancyCheck?.recent_baby || false,
      recent_period: data.pregnancyCheck?.recent_period || false,
      recent_abortion: data.pregnancyCheck?.recent_abortion || false,
      using_contraceptive: data.pregnancyCheck?.using_contraceptive || false,
      fprecord_id: fprecord_id, // Link to the FP_Record
    };

    console.log("📌 Creating pregnancy check:", requestData);
    const res = await api2.post("familyplanning/fp_pregnancycheck/", requestData);
    console.log("✅ Pregnancy check created successfully:", res.data);
    return res.data.fp_pc_id;
  } catch (err) {
    console.error("❌ Failed to create pregnancy check:", err);
    throw err;
  }
};

export const createAssessment = async (
  data: Record<string, any>,
  fprecord_id: number,
  patrec_id: number, // patrec_id from initial FP_Record creation
  fpt_id: number, // FP_Type ID from Page 1
  bm_id: number // BodyMeasurement ID from Page 4
) => {
  try {
    console.log('Assessment function called with:', {
      params: { fprecord_id, patrec_id, fpt_id, bm_id },
      formData: data
    });

    const serviceRecords = data.serviceProvisionRecords || [];
    const latestRecord = serviceRecords[serviceRecords.length - 1];

    if (!latestRecord?.dateOfFollowUp) {
      throw new Error('No valid follow-up date found in service records for assessment.');
    }

    // 1. Create Follow-up Visit (linked to patient's main record)
    const followUpData = {
      patrec: patrec_id, // Link to the PatientRecord for this FP entry
      followv_date: latestRecord.dateOfFollowUp,
      followv_status: 'pending', // Or an appropriate status
      followv_description: 'Family Planning Follow up',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📌 Creating follow-up visit:', followUpData);
    const followUpRes = await api2.post('patientrecords/follow-up-visit/', followUpData);
    const followv_id = followUpRes.data.followv_id;
    console.log("✅ Follow-up visit created:", followUpRes.data);

    if (!followv_id) {
      throw new Error('Failed to get follow-up visit ID.');
    }

    // 2. Create FP_Assessment_Record
    const assessmentData = {
      quantity: Number(latestRecord?.methodQuantity) || 0,
      as_provider_signature: latestRecord?.serviceProviderSignature || '',
      as_provider_name: latestRecord?.nameOfServiceProvider || '',
      as_findings: latestRecord?.medicalFindings || 'None',
      followv: followv_id, // Link to the newly created Follow-up Visit
      fprecord: fprecord_id, // Link to the FP Record
      fpt: fpt_id, // Link to the FP Type
      bm: bm_id, // Link to the BodyMeasurement
      dispensed_commodity_item: latestRecord?.dispensedCommodityItemId || null, // Assuming these IDs are available
      dispensed_medicine_item: latestRecord?.dispensedMedicineItemId || null,
      dispensed_vaccine_item: latestRecord?.dispensedVaccineItemId || null,
      dispensed_item_name_for_report: latestRecord?.dispensedItemNameForReport || null,
      created_at: new Date().toISOString()
    };

    console.log('📌 Creating assessment:', assessmentData);
    const assessmentRes = await api2.post('familyplanning/assessment/', assessmentData);
    console.log("✅ Assessment created successfully:", assessmentRes.data);

    return {
      assessmentId: assessmentRes.data.fpassessment_id, // Assuming this is the correct ID
      followUpId: followv_id,
      fpRecordId: fprecord_id
    };

  } catch (error) {
    console.error('❌ Full error details for assessment:', {
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
      console.error('API Error Details for assessment:', apiError);
      throw new Error(`Assessment failed: ${apiError.message}\n${JSON.stringify(apiError.data)}`);
    }

    throw new Error(`Assessment failed: ${error instanceof Error ? error.message : String(error)}`);
  }
};


// --- 2. React Query useMutation Hooks for individual operations ---

// FP Record (Page 1)
export const useCreateFPRecordMutation = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => createFPRecord(data),
    onSuccess: () => {
      toast.success("Family Planning record initiated!");
    },
    onError: (error) => {
      toast.error(`Failed to initiate FP record: ${error.message}`);
      console.error("Mutation error (createFPRecord):", error);
    },
  });
};

// FP Type (Page 1 - also)
export const useCreateFPTypeMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id }: { data: Record<string, any>; fprecord_id: number }) =>
      createFPType(data, fprecord_id),
    onSuccess: () => {
      toast.success("Client type and method saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save FP type: ${error.message}`);
      console.error("Mutation error (createFPType):", error);
    },
  });
};

// Risk STI (Page 3)
export const useCreateRiskStiMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id }: { data: Record<string, any>; fprecord_id: number }) =>
      createRiskSti(data, fprecord_id),
    onSuccess: () => {
      toast.success("Risk STI data saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save Risk STI data: ${error.message}`);
      console.error("Mutation error (createRiskSti):", error);
    },
  });
};

// Risk VAW (Page 3)
export const useCreateRiskVawMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id }: { data: Record<string, any>; fprecord_id: number }) =>
      createRiskVaw(data, fprecord_id),
    onSuccess: () => {
      toast.success("Risk VAW data saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save Risk VAW data: ${error.message}`);
      console.error("Mutation error (createRiskVaw):", error);
    },
  });
};

// Obstetrical History (Page 2) - PatientRecord Obstetrical History & FP Obstetrical History
export const useCreatePatientObstetricalHistoryMutation = () => {
  return useMutation({
    mutationFn: ({ data, pat_id }: { data: Record<string, any>; pat_id: string }) =>
      createPatientObstetricalHistory(data, pat_id),
    onSuccess: () => {
      toast.success("Patient Obstetrical history created!");
    },
    onError: (error) => {
      toast.error(`Failed to create Patient Obstetrical history: ${error.message}`);
      console.error("Mutation error (createPatientObstetricalHistory):", error);
    },
  });
};

export const useCreateFPOBstetricalHistoryMutation = () => {
  return useMutation({
    mutationFn: ({
      data,
      fprecord_id,
      obs_id,
      fpt_id,
    }: {
      data: Record<string, any>;
      fprecord_id: number;
      obs_id: number;
      fpt_id: number;
    }) => createFPOBstetricalHistory(data, fprecord_id, obs_id, fpt_id),
    onSuccess: () => {
      toast.success("Family Planning Obstetrical history created!");
    },
    onError: (error) => {
      toast.error(`Failed to create FP Obstetrical history: ${error.message}`);
      console.error("Mutation error (createFPOBstetricalHistory):", error);
    },
  });
};

// Body Measurement (Page 4)
export const useCreateBodyMeasurementMutation = () => {
  return useMutation({
    mutationFn: ({ data, pat_id }: { data: Record<string, any>; pat_id: string }) =>
      createBodyMeasurement(data, pat_id),
    onSuccess: () => {
      toast.success("Body Measurement created!");
    },
    onError: (error) => {
      toast.error(`Failed to create Body Measurement: ${error.message}`);
      console.error("Mutation error (createBodyMeasurement):", error);
    },
  });
};

export const useUpdateBodyMeasurementMutation = () => {
  return useMutation({
    mutationFn: ({ bm_id, data }: { bm_id: number; data: Record<string, any> }) =>
      updateBodyMeasurement(bm_id, data),
    onSuccess: () => {
      toast.success("Body Measurement updated!");
    },
    onError: (error) => {
      toast.error(`Failed to update Body Measurement: ${error.message}`);
      console.error("Mutation error (updateBodyMeasurement):", error);
    },
  });
};

// Physical Exam (Page 4)
export const useCreatePhysicalExamMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id, bm_id }: { data: Record<string, any>; fprecord_id: number; bm_id: number }) =>
      createPhysicalExam(data, fprecord_id, bm_id),
    onSuccess: () => {
      toast.success("Physical Exam created!");
    },
    onError: (error) => {
      toast.error(`Failed to create Physical Exam: ${error.message}`);
      console.error("Mutation error (createPhysicalExam):", error);
    },
  });
};

// Pelvic Exam (Page 4)
export const useCreatePelvicExamMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id }: { data: Record<string, any>; fprecord_id: number }) =>
      createPelvicExam(data, fprecord_id),
    onSuccess: () => {
      toast.success("Pelvic Exam created!");
    },
    onError: (error) => {
      toast.error(`Failed to create Pelvic Exam: ${error.message}`);
      console.error("Mutation error (createPelvicExam):", error);
    },
  });
};

// Acknowledgement (Page 5)
export const useCreateAcknowledgementMutation = () => {
  return useMutation({
    mutationFn: ({
      data,
      fprecord_id,
      fpt_id,
    }: {
      data: Record<string, any>;
      fprecord_id: number;
      fpt_id: number;
    }) => createAcknowledgement(data, fprecord_id, fpt_id),
    onSuccess: () => {
      toast.success("Acknowledgement saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save Acknowledgement: ${error.message}`);
      console.error("Mutation error (createAcknowledgement):", error);
    },
  });
};

// Pregnancy Check (Page 6)
export const useCreatePregnancyCheckMutation = () => {
  return useMutation({
    mutationFn: ({ data, fprecord_id }: { data: Record<string, any>; fprecord_id: number }) =>
      createPregnancyCheck(data, fprecord_id),
    onSuccess: () => {
      toast.success("Pregnancy Check data saved!");
    },
    onError: (error) => {
      toast.error(`Failed to save Pregnancy Check data: ${error.message}`);
      console.error("Mutation error (createPregnancyCheck):", error);
    },
  });
};

// Assessment (Page 6)
export const useCreateAssessmentMutation = () => {
  return useMutation({
    mutationFn: ({
      data,
      fprecord_id,
      patrec_id,
      fpt_id,
      bm_id,
    }: {
      data: Record<string, any>;
      fprecord_id: number;
      patrec_id: number;
      fpt_id: number;
      bm_id: number;
    }) => createAssessment(data, fprecord_id, patrec_id, fpt_id, bm_id),
    onSuccess: () => {
      toast.success("Assessment and Follow-up created!");
    },
    onError: (error) => {
      toast.error(`Failed to create Assessment: ${error.message}`);
      console.error("Mutation error (createAssessment):", error);
    },
  });
};

// --- 3. Master Hook for Multi-Page Form Submission ---

interface UseFamilyPlanningFormSubmissionResult {
  submitForm: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

export const useFamilyPlanningFormSubmission = (): UseFamilyPlanningFormSubmissionResult => {
  const queryClient = useQueryClient();

  // Initialize all individual mutations
  const createFPRecordMut = useCreateFPRecordMutation();
  const createFPTypeMut = useCreateFPTypeMutation();
  const createRiskStiMut = useCreateRiskStiMutation();
  const createRiskVawMut = useCreateRiskVawMutation();
  const createPatientObstetricalHistoryMut = useCreatePatientObstetricalHistoryMutation();
  const createFPOBstetricalHistoryMut = useCreateFPOBstetricalHistoryMutation();
  const createBodyMeasurementMut = useCreateBodyMeasurementMutation();
  const updateBodyMeasurementMut = useUpdateBodyMeasurementMutation();
  const createPhysicalExamMut = useCreatePhysicalExamMutation();
  const createPelvicExamMut = useCreatePelvicExamMutation();
  const createAcknowledgementMut = useCreateAcknowledgementMutation();
  const createPregnancyCheckMut = useCreatePregnancyCheckMutation();
  const createAssessmentMut = useCreateAssessmentMutation();

  // Combine loading states
  const isLoading =
    createFPRecordMut.isPending ||
    createFPTypeMut.isPending ||
    createRiskStiMut.isPending ||
    createRiskVawMut.isPending ||
    createPatientObstetricalHistoryMut.isPending ||
    createFPOBstetricalHistoryMut.isPending ||
    createBodyMeasurementMut.isPending ||
    updateBodyMeasurementMut.isPending ||
    createPhysicalExamMut.isPending ||
    createPelvicExamMut.isPending ||
    createAcknowledgementMut.isPending ||
    createPregnancyCheckMut.isPending ||
    createAssessmentMut.isPending;

  // Combine error states (simplified for single error message)
  const isError =
    createFPRecordMut.isError ||
    createFPTypeMut.isError ||
    createRiskStiMut.isError ||
    createRiskVawMut.isError ||
    createPatientObstetricalHistoryMut.isError ||
    createFPOBstetricalHistoryMut.isError ||
    createBodyMeasurementMut.isError ||
    updateBodyMeasurementMut.isError ||
    createPhysicalExamMut.isError ||
    createPelvicExamMut.isError ||
    createAcknowledgementMut.isError ||
    createPregnancyCheckMut.isError ||
    createAssessmentMut.isError;

  const error =
    createFPRecordMut.error ||
    createFPTypeMut.error ||
    createRiskStiMut.error ||
    createRiskVawMut.error ||
    createPatientObstetricalHistoryMut.error ||
    createFPOBstetricalHistoryMut.error ||
    createBodyMeasurementMut.error ||
    updateBodyMeasurementMut.error ||
    createPhysicalExamMut.error ||
    createPelvicExamMut.error ||
    createAcknowledgementMut.error ||
    createPregnancyCheckMut.error ||
    createAssessmentMut.error;

  const submitForm = async (formData: FormData) => {
    try {
      console.log("Initiating full form submission...");

      // --- Step 1: Create FP_Record ---
      const fpRecordResult = await createFPRecordMut.mutateAsync(formData);
      const fprecord_id = fpRecordResult.fprecord_id;
      const patrec_id = fpRecordResult.patrec_id; // This is the PatientRecord ID for FP

      // IMPORTANT DEBUGGING STEP: Check fprecord_id right after creation
      if (typeof fprecord_id !== 'number' || isNaN(fprecord_id)) {
        console.error("❌ fprecord_id is invalid after createFPRecord:", fprecord_id);
        throw new Error("Failed to get a valid FP Record ID. Submission halted.");
      }
      console.log(`✅ Obtained fprecord_id: ${fprecord_id}`);


      // --- Step 2: Create FP_type ---
      const fpt_id = await createFPTypeMut.mutateAsync({ data: formData, fprecord_id });

      // --- Step 3: Obstetrical History (Conditional Fetch/Create) ---
      let obs_id_from_patientrecords: number | null = null;
      let patrec_id_for_obs: number | null = null; // Separate patrec_id for Obstetrical type

      // Attempt to fetch existing patient obstetrical history
      const existingPatientObs = await getExistingObstetricalHistory(formData.pat_id);

      if (existingPatientObs && existingPatientObs.obs_id) {
        // If exists, use its obs_id and patrec_id
        obs_id_from_patientrecords = existingPatientObs.obs_id;
        patrec_id_for_obs = existingPatientObs.patrec_id; // Assuming API returns this
        console.log(`Using existing patient obstetrical history (obs_id: ${obs_id_from_patientrecords})`);
      } else {
        // If not, create a new one
        console.log("No existing patient obstetrical history, creating new one...");
        const newObsResult = await createPatientObstetricalHistoryMut.mutateAsync({
          data: formData,
          pat_id: formData.pat_id,
        });
        obs_id_from_patientrecords = newObsResult.obs_id;
        patrec_id_for_obs = newObsResult.patrec_id_obs; // New patrec_id for Obstetrical type
      }

      // Now create FP_Obstetrical_History using the obtained obs_id and fpt_id
      await createFPOBstetricalHistoryMut.mutateAsync({
        data: formData,
        fprecord_id,
        obs_id: obs_id_from_patientrecords,
        fpt_id,
      });

      // --- Step 4: Risk STI ---
      await createRiskStiMut.mutateAsync({ data: formData, fprecord_id });

      // --- Step 5: Risk VAW ---
      await createRiskVawMut.mutateAsync({ data: formData, fprecord_id });

      // --- Step 6: Body Measurement (Conditional Fetch/Create/Update) ---
      let bm_id: number;
      const latestBm = await getLatestBodyMeasurement(formData.pat_id); // Fetch latest BM

      if (latestBm && latestBm.bm_id) {
        // Check if weight/height changed. For simplicity, we'll update if any values are different,
        // or always update if the user provides new values.
        const currentWeight = parseFloat(formData.weight as string);
        const currentHeight = parseFloat(formData.height as string);

        if (
          (currentWeight && currentWeight !== latestBm.weight) ||
          (currentHeight && currentHeight !== latestBm.height)
        ) {
          console.log(`Updating existing body measurement (bm_id: ${latestBm.bm_id})`);
          const updatedBm = await updateBodyMeasurementMut.mutateAsync({
            bm_id: latestBm.bm_id,
            data: formData,
          });
          bm_id = updatedBm.bm_id;
        } else {
          console.log(`Using existing body measurement (bm_id: ${latestBm.bm_id}) as no changes detected.`);
          bm_id = latestBm.bm_id;
        }
      } else {
        // No existing body measurement, create a new one
        console.log("No existing body measurement, creating new one...");
        const newBm = await createBodyMeasurementMut.mutateAsync({
          data: formData,
          pat_id: formData.pat_id,
        });
        bm_id = newBm;
      }

      // --- Step 7: Physical Exam ---
      await createPhysicalExamMut.mutateAsync({ data: formData, fprecord_id, bm_id });

      // --- Step 8: Pelvic Exam (Conditional) ---
      // This mutation includes its own check for IUD, so no need for external if.
      await createPelvicExamMut.mutateAsync({ data: formData, fprecord_id });

      // --- Step 9: Acknowledgement ---
      await createAcknowledgementMut.mutateAsync({ data: formData, fprecord_id, fpt_id });

      // --- Step 10: Pregnancy Check ---
      await createPregnancyCheckMut.mutateAsync({ data: formData, fprecord_id });

      // --- Step 11: Assessment ---
      // Need to pass the patrec_id from the initial FP_Record creation, not the obs patrec_id
      await createAssessmentMut.mutateAsync({
        data: formData,
        fprecord_id,
        patrec_id, // This is the patrec_id from the main FP_Record
        fpt_id,
        bm_id,
      });

      toast.success("Family Planning record submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["fpRecords"] }); // Invalidate for overall table refresh
    } catch (err) {
      console.error("Full form submission failed:", err);
      toast.error(`Submission failed: ${err instanceof Error ? err.message : "An unknown error occurred"}`);
      throw err; // Re-throw to propagate error state to the component
    }
  };

  return { submitForm, isLoading, isError, error };
};

