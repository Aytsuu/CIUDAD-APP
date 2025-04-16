import api from "@/api/api"
// import { formatDate } from "@/helpers/dateFormatter"

export const risk_sti = async (data: Record<string, any>) => {
  try {
    const requestData: Record<string, any> = {
      abnormalDischarge: data.sexuallyTransmittedInfections.abnormalDischarge,
      dischargeFrom: data.sexuallyTransmittedInfections.dischargeFrom,
      sores: data.sexuallyTransmitztedInfections.sores,
      pain: data.sexuallyTransmittedInfections.pain,
      history: data.sexuallyTransmittedInfections.history,
      hiv: data.sexuallyTransmittedInfections.hiv,
    }

    // Include dischargeFrom only if abnormalDischarge is true
    if (data.sexuallyTransmittedInfections.abnormalDischarge) {
      requestData.dischargeFrom = data.sexuallyTransmittedInfections.dischargeFrom
    }
    console.log("STI: ", requestData)
    const res = await api.post("familyplanning/risk_sti/", requestData)
    return res.data.per_id
  } catch (err) {
    console.log(err)
  }
}

export const risk_vaw = async (data: Record<string, any>) => {
  try {
    const requestData: Record<string, any> = {
      unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
      partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
      domesticViolence: data.violenceAgainstWomen.domesticViolence,
      referredTo: data.violenceAgainstWomen.referredTo,
    }

    console.log("Vaw: ", requestData)
    const res = await api.post("familyplanning/risk_vaw/", requestData)
    return res.data.per_id
  } catch (err) {
    console.log(err)
  }
}

export const pregnancyCheck = async (data: Record<string, any>) => {
  try {
    if (!data.pregnancyCheck) {
      console.error("PregnancyCheckSchema is missing in the submitted data", data)
      return
    }

    const requestData: Record<string, any> = {
      breastfeeding: data.pregnancyCheck.breastfeeding,
      abstained: data.pregnancyCheck.abstained,
      recent_baby: data.pregnancyCheck.recent_baby,
      recent_period: data.pregnancyCheck.recent_period,
      recent_abortion: data.pregnancyCheck.recent_abortion,
      using_contraceptive: data.pregnancyCheck.using_contraceptive,
    }

    const res = await api.post("familyplanning/pregnancy_check/", requestData)
    console.log("PregnancyCheck data being sent to API:", requestData)
    return res.data.per_id
  } catch (err) {
    console.log(err)
  }
}

export const fp_type = async (data: Record<string, any>) => {
  try {
    const requestData = {
      fpt_client_type: data.typeOfClient,
      fpt_subtype: data.subTypeOfClient || null,
      fpt_reason_fp: data.reasonForFP || null,
      fpt_reason: data.reason || null,
      fpt_method_used: data.methodCurrentlyUsed,
    }
    console.log("FP type: ", requestData)

    const res = await api.post("familyplanning/fp_type/", requestData)
    return res.data.per_id
  } catch (err) {
    console.error("Failed to send family planning data:", err)
  }
}

export const fp_obstetrical = async (data: Record<string, any>) => {
  try {
    if (!data.obstetricalHistory) {
      console.error("❌ Missing `obstetricalHistory` in form data")
      return
    }

    const fieldsToCheck = {
      lastDeliveryDate: data.obstetricalHistory.lastDeliveryDate,
      typeOfLastDelivery: data.obstetricalHistory.typeOfLastDelivery,
      lastMenstrualPeriod: data.obstetricalHistory.lastMenstrualPeriod,
      previousMenstrualPeriod: data.obstetricalHistory.previousMenstrualPeriod,
      menstrualFlow: data.obstetricalHistory.menstrualFlow,
      dysmenorrhea: data.obstetricalHistory.dysmenorrhea,
      hydatidiformMole: data.obstetricalHistory.hydatidiformMole,
      ectopicPregnancyHistory: data.obstetricalHistory.ectopicPregnancyHistory,
    }

    // Log all values and highlight missing ones
    for (const [key, value] of Object.entries(fieldsToCheck)) {
      if (value === undefined || value === null || value === "") {
        console.warn(`⚠️ Missing or empty: ${key}`)
      } else {
        console.log(`✅ ${key}:`, value)
      }
    }

    const requestData = {
      fpob_last_delivery: fieldsToCheck.lastDeliveryDate,
      fpob_type_last_delivery: fieldsToCheck.typeOfLastDelivery || null,
      fpob_last_period: fieldsToCheck.lastMenstrualPeriod || null,
      fpob_previous_period: fieldsToCheck.previousMenstrualPeriod || null,
      fpob_mens_flow: fieldsToCheck.menstrualFlow,
      fpob_dysme: fieldsToCheck.dysmenorrhea || null,
      fpob_hydatidiform: fieldsToCheck.hydatidiformMole || null,
      fpob_ectopic_pregnancy: fieldsToCheck.ectopicPregnancyHistory || null,
    }

    console.log("📦 Final requestData:", requestData)

    const res = await api.post("familyplanning/obstetrical/", requestData)
    console.log("✅ Data sent successfully")
    return res.data.per_id
  } catch (err) {
    console.error("❌ Failed to send obs data:", err)
  }
}

// const risks_vaw = async (data: Record<string, any>) => {
//     try {
//         console.log({
//             unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
//             partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
//             domesticViolence: data.violenceAgainstWomen.domesticViolence,
//             referredTo: data.violenceAgainstWomen.referredTo,
//             otherReferral: data.violenceAgainstWomen.otherReferral,
//         })

//         const res = await api.post("familyplanning/risk_vaw/", {
//             unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
//             partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
//             domesticViolence: data.violenceAgainstWomen.domesticViolence,
//             referredTo: data.violenceAgainstWomen.referredTo,
//             otherReferral: data.violenceAgainstWomen.otherReferral,
//         })

//         return res.data.per_id
//     } catch (err) {
//         console.log(err)
//     }
// }

// const physical_exam = async (data: Record<string, any>) => {
//     try {
//         // Get the method from the data
//         const method = data.methodCurrentlyUsed

//         // Create a base request object with the required fields
//         const requestData = {
//             method: method,
//             weight: data.weight,
//             height: data.height,
//             bloodPressure: data.bloodPressure,
//             pulseRate: data.pulseRate,

//             // Common examination fields
//             skinExamination: data.skinExamination,
//             conjunctivaExamination: data.conjunctivaExamination,
//             neckExamination: data.neckExamination,
//             breastExamination: data.breastExamination,
//             abdomenExamination: data.abdomenExamination,
//             extremitiesExamination: data.extremitiesExamination,
//         }

//         // Only include IUD-specific fields if the method is IUD
//         if (method === "IUD") {
//             Object.assign(requestData, {
//                 pelvicExamination: data.pelvicExamination,
//                 cervicalConsistency: data.cervicalConsistency,
//                 cervicalTenderness: data.cervicalTenderness,
//                 cervicalAdnexalMassTenderness: data.cervicalAdnexalMassTenderness,
//                 uterinePosition: data.uterinePosition,
//                 uterineDepth: data.uterineDepth || null,
//             })
//         }

//         console.log("Sending physical exam data:", requestData)

//         const res = await api.post("familyplanning/physical_exam/", requestData)
//         return res.data.per_id
//     } catch (err) {
//         const error = err as any
//         console.error("Error submitting physical examination:", error.response?.data || error.message)
//     }
// }

// const acknowledgement = async (data: Record<string, any>) => {
//     try {
//         console.log({
//             selectedMethod: data.acknowledgement.selectedMethod,
//             clientSignature: data.acknowledgement.clientSignature,
//             clientSignatureDate: data.acknowledgement.clientSignatureDate,
//             guardianName: data.acknowledgement.guardianName,
//             guardianSignature: data.acknowledgement.guardianSignature,
//             guardianSignatureDate: data.acknowledgement.guardianSignatureDate,

//         })
//         const res = await api.post("familyplanning/acknowledgement/", {
//             selectedMethod: data.acknowledgement.selectedMethod,
//             clientSignature: data.acknowledgement.clientSignature,
//             clientSignatureDate: data.acknowledgement.clientSignatureDate,
//             guardianName: data.acknowledgement.guardianName,
//             guardianSignature: data.acknowledgement.guardianSignature,
//             guardianSignatureDate: data.acknowledgement.guardianSignatureDate,
//         })
//         return res.data.per_id
//     } catch (err) {
//         console.log(err)
//     }
// }

export const fp_record = async (data: Record<string, any>) => {
  try {
    const requestData = {
      nhts: data.nhts_status,
      four_ps: data.pantawid_4ps,
      plan_more_children: data.planToHaveMoreChildren,
      avg_monthly_income: data.averageMonthlyIncome,
    }
    console.log("Type of client: ", requestData)
    const res = await api.post("familyplanning/fp_record/", requestData)

    return res.data.per_id
  } catch (err) {
    console.log(err)
  }
}

//////////////////////////////////////////////////////////////////////////////

// export const update_risk_vaw = async (id: number | string, data: Record<string, any>) => {
//   try {
//     const requestData = {
//       unpleasantRelationship: data.violenceAgainstWomen.unpleasantRelationship,
//       partnerDisapproval: data.violenceAgainstWomen.partnerDisapproval,
//       domesticViolence: data.violenceAgainstWomen.domesticViolence,
//       referredTo: data.violenceAgainstWomen.referredTo,
//     };

//     const res = await api.put(`familyplanning/risk_vaw/${id}/`, requestData);
//     return res.data;
//   } catch (err) {
//     console.error("Update error:", err);
//   }
// };
