import { FormData } from "@/form-schema/FamilyPlanningSchema"; // Ensure this path is correct

export const calculateAgeFromDateString = (dateString?: string | Date | null): number => {
  if (!dateString) return 0;
  try {
    const birthDate = new Date(dateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  } catch (e) {
    console.error("Error calculating age:", e);
    return 0;
  }
};

// const mapEducationalAttainment = (education?: string | null): string => {
//   if (!education) return '';
//   const educationLower = education.toLowerCase();
//   if (educationLower.includes('elementary')) return 'elementary';
//   if (educationLower.includes('high school') && !educationLower.includes('senior')) return 'highschool';
//   if (educationLower.includes('senior high school') || educationLower.includes('shs')) return 'shs';
//   if (educationLower.includes('college level')) return 'collegelevel';
//   if (educationLower.includes('college graduate') || educationLower.includes('grad')) return 'collegegrad';
//   if (educationLower.includes('post graduate')) return 'postgrad';
//   return 'none';
// };

// /**
//  * Transforms API data (from get_complete_fp_record) into the frontend FormData structure.
//  * @param apiData The complete FP record data fetched from the backend.
//  * @returns Transformed FormData object.
//  */
export const transformApiDataToFormData = (apiData: any): FormData => {
  // const patientInfo = apiData.patient_info || {};
  // const personalInfo = apiData.patient_info?.personal_info || {};
  // const addressInfo = apiData.patient_info?.address || {};
  // const fpType = apiData.fp_type || {};
  // const medicalHistory = apiData.medicalHistory || {}; // Note: backend now flattens this
  // const obstetricalHistory = apiData.obstetricalHistory || {}; // Note: backend now flattens this
  // const sexuallyTransmittedInfections = apiData.sexuallyTransmittedInfections || {}; // Flattened
  // const violenceAgainstWomen = apiData.violenceAgainstWomen || {}; // Flattened
  // const fpPhysicalExam = apiData.fp_physical_exam || {}; // Raw object if not flattened
  // const bodyMeasurement = apiData.body_measurement || {}; // Raw object if not flattened
  // const fpPelvicExam = apiData.fp_pelvic_exam || {}; // Raw object if not flattened
  const acknowledgement = apiData.acknowledgement || {}; // Flattened
  const pregnancyCheck = apiData.pregnancyCheck || {}; // Flattened
  const serviceProvisionRecords = apiData.serviceProvisionRecords || []; // Flattened
  // const spouseInfo = apiData.spouse || {}; // Flattened spouse data

  return {
    // --- Page 1 ---
    // fprecord: apiData.fprecord_id || null, // Important for updates
    pat_id: apiData.pat_id || "",
    client_id: apiData.client_id || "",
    philhealthNo: apiData.philhealthNo || "",
    nhts_status: apiData.nhts_status || false,
    fourps: apiData.fourps || false,
    lastName: apiData.lastName || "",
    givenName: apiData.givenName || "",
    middleInitial: apiData.middleInitial || "",
    dateOfBirth: apiData.dateOfBirth || "",
    age: apiData.age || 0,
    educationalAttainment: apiData.educationalAttainment || "", // Mapped by backend
    occupation: apiData.occupation || "",
    address: {
      houseNumber: apiData.address?.houseNumber || "",
      street: apiData.address?.street || "",
      barangay: apiData.address?.barangay || "",
      municipality: apiData.address?.municipality || "",
      province: apiData.address?.province || "",
    },
    spouse: {
      s_lastName: apiData.spouse?.s_lastName || "",
      s_givenName: apiData.spouse?.s_givenName || "",
      s_middleInitial: apiData.spouse?.s_middleInitial || "",
      s_dateOfBirth: apiData.spouse?.s_dateOfBirth || "",
      s_age: apiData.spouse?.s_age || 0,
      s_occupation: apiData.spouse?.s_occupation || "",
    },
    numOfLivingChildren: apiData.numOfLivingChildren || 0,
    plan_more_children: apiData.plan_more_children || false,
    avg_monthly_income: apiData.avg_monthly_income || "",

    typeOfClient: apiData.typeOfClient || "",
    subTypeOfClient: apiData.subTypeOfClient || "",
    reasonForFP: apiData.reasonForFP || "",
    otherReasonForFP: apiData.otherReasonForFP || "", // Ensure this exists in your schema
    reason: apiData.reason || "",
    otherReason: apiData.otherReason || "", // Ensure this exists in your schema
    methodCurrentlyUsed: apiData.methodCurrentlyUsed || undefined,
    otherMethod: apiData.otherMethod || "", // Ensure this exists in your schema

    // --- Page 2 ---
    medicalHistory: {
      severeHeadaches: apiData.medicalHistory?.severeHeadaches || false,
      strokeHeartAttackHypertension: apiData.medicalHistory?.strokeHeartAttackHypertension || false,
      hematomaBruisingBleeding: apiData.medicalHistory?.hematomaBruisingBleeding || false,
      breastCancerHistory: apiData.medicalHistory?.breastCancerHistory || false,
      severeChestPain: apiData.medicalHistory?.severeChestPain || false,
      cough: apiData.medicalHistory?.cough || false,
      jaundice: apiData.medicalHistory?.jaundice || false,
      unexplainedVaginalBleeding: apiData.medicalHistory?.unexplainedVaginalBleeding || false,
      abnormalVaginalDischarge: apiData.medicalHistory?.abnormalVaginalDischarge || false,
      phenobarbitalOrRifampicin: apiData.medicalHistory?.phenobarbitalOrRifampicin || false,
      smoker: apiData.medicalHistory?.smoker || false,
      disability: apiData.medicalHistory?.disability || false,
      disabilityDetails: apiData.medicalHistory?.disabilityDetails || "",
    },
    obstetricalHistory: {
      g_pregnancies: apiData.obstetricalHistory?.g_pregnancies || 0,
      p_pregnancies: apiData.obstetricalHistory?.p_pregnancies || 0,
      fullTerm: apiData.obstetricalHistory?.fullTerm || 0,
      premature: apiData.obstetricalHistory?.premature || 0,
      abortion: apiData.obstetricalHistory?.abortion || 0,
      numOfLivingChildren: apiData.obstetricalHistory?.numOfLivingChildren || 0,
      lastDeliveryDate: apiData.obstetricalHistory?.lastDeliveryDate || "",
      typeOfLastDelivery: apiData.obstetricalHistory?.typeOfLastDelivery || undefined,
      lastMenstrualPeriod: apiData.obstetricalHistory?.lastMenstrualPeriod || "",
      previousMenstrualPeriod: apiData.obstetricalHistory?.previousMenstrualPeriod || "",
      menstrualFlow: apiData.obstetricalHistory?.menstrualFlow || "Scanty",
      dysmenorrhea: apiData.obstetricalHistory?.dysmenorrhea || false,
      hydatidiformMole: apiData.obstetricalHistory?.hydatidiformMole || false,
      ectopicPregnancyHistory: apiData.obstetricalHistory?.ectopicPregnancyHistory || false,
    },

    // --- Page 3 ---
    sexuallyTransmittedInfections: {
      abnormalDischarge: apiData.sexuallyTransmittedInfections?.abnormalDischarge || false,
      dischargeFrom: apiData.sexuallyTransmittedInfections?.dischargeFrom || undefined,
      sores: apiData.sexuallyTransmittedInfections?.sores || false,
      pain: apiData.sexuallyTransmittedInfections?.pain || false,
      history: apiData.sexuallyTransmittedInfections?.history || false,
      hiv: apiData.sexuallyTransmittedInfections?.hiv || false,
    },
    violenceAgainstWomen: {
      unpleasantRelationship: apiData.violenceAgainstWomen?.unpleasantRelationship || false,
      partnerDisapproval: apiData.violenceAgainstWomen?.partnerDisapproval || false,
      domesticViolence: apiData.violenceAgainstWomen?.domesticViolence || false,
      referredTo: apiData.violenceAgainstWomen?.referredTo || undefined,
    },

    // --- Page 4 ---
    weight: apiData.weight || 0,
    height: apiData.height || 0,
    bloodPressure: apiData.bloodPressure || "",
    pulseRate: apiData.pulseRate || 0,
    skinExamination: apiData.skinExamination || "normal",
    conjunctivaExamination: apiData.conjunctivaExamination || "normal",
    neckExamination: apiData.neckExamination || "normal",
    breastExamination: apiData.breastExamination || "normal",
    abdomenExamination: apiData.abdomenExamination || "normal",
    extremitiesExamination: apiData.extremitiesExamination || "normal",
    pelvicExamination: apiData.pelvicExamination || "normal",
    cervicalConsistency: apiData.cervicalConsistency || "firm",
    cervicalTenderness: apiData.cervicalTenderness || false,
    cervicalAdnexal: apiData.cervicalAdnexal || false,
    uterinePosition: apiData.uterinePosition || "mid",
    uterineDepth: apiData.uterineDepth || "",

    // --- Page 5 ---
    acknowledgement: {
      selectedMethod: acknowledgement.selectedMethod || apiData.methodCurrentlyUsed || "", // Use methodCurrentlyUsed as fallback
      clientSignature: acknowledgement.clientSignature || "",
      clientSignatureDate: acknowledgement.clientSignatureDate || "",
      clientName: acknowledgement.clientName || "",
      guardianName: acknowledgement.guardianName || "",
      guardianSignature: acknowledgement.guardianSignature || "",
      guardianSignatureDate: acknowledgement.guardianSignatureDate || "",
    },

    // --- Page 6 ---
    serviceProvisionRecords: serviceProvisionRecords,
    pregnancyCheck: {
      breastfeeding: pregnancyCheck.breastfeeding || false,
      abstained: pregnancyCheck.abstained || false,
      recent_baby: pregnancyCheck.recent_baby || false,
      recent_period: pregnancyCheck.recent_period || false,
      recent_abortion: pregnancyCheck.recent_abortion || false,
      using_contraceptive: pregnancyCheck.using_contraceptive || false,
    },
  };
};
