import { calculateAgeFromDOB,calculateAge } from "@/helpers/ageCalculator";


export const formatChildHealthData = (childRecords: any[]): any[] => {
  if (!childRecords || !Array.isArray(childRecords)) {
    return [];
  }

  return childRecords.map((record: any) => {
    const patrecDetails = record.patrec_details || {};
    const patientDetails = patrecDetails.pat_details || {};
    const personalInfo = patientDetails.personal_info || {};
    const addressInfo = patientDetails.address || {};
    const familyHeadInfo = patientDetails.family_head_info || {};
    const familyHeads = familyHeadInfo.family_heads || {};
    const motherInfo = familyHeads.mother?.personal_info || {};
    const fatherInfo = familyHeads.father?.personal_info || {};

    return {
      chrec_id: record.chrec_id,
      pat_id: patientDetails.pat_id || "",
      fname: personalInfo.per_fname || "",
      lname: personalInfo.per_lname || "",
      mname: personalInfo.per_mname || "",
      sex: personalInfo.per_sex || "",
      age: personalInfo.per_dob ? calculateAge(personalInfo.per_dob).toString() : "",
      dob: personalInfo.per_dob || "",
      householdno: patientDetails.households?.[0]?.hh_id || "",
      address: addressInfo.full_address || "No address Provided",
      sitio: addressInfo.add_sitio || "",
      landmarks: addressInfo.add_landmarks || "",
      pat_type: patientDetails.pat_type || "",
      mother_fname: motherInfo.per_fname || "",
      mother_lname: motherInfo.per_lname || "",
      mother_mname: motherInfo.per_mname || "",
      mother_contact: motherInfo.per_contact || "",
      mother_occupation: motherInfo.per_occupation || record.mother_occupation || "",
      father_fname: fatherInfo.per_fname || "",
      father_lname: fatherInfo.per_lname || "",
      father_mname: fatherInfo.per_mname || "",
      father_contact: fatherInfo.per_contact || "",
      father_occupation: fatherInfo.per_occupation || record.father_occupation || "",
      family_no: record.family_no || "Not Provided",
      birth_weight: record.birth_weight || 0,
      birth_height: record.birth_height || 0,
      type_of_feeding: record.type_of_feeding || "Unknown",
      delivery_type: record.place_of_delivery_type || "",
      place_of_delivery_type: record.place_of_delivery_type || "",
      pod_location: record.pod_location || "",
      pod_location_details: record.pod_location_details || "",
      health_checkup_count: record.health_checkup_count || 0,
      birth_order: record.birth_order || "",
      tt_status: record.tt_status || "",
      latest_child_history_date: record.latest_child_history_date || ""
    };
  });
};
export const processHistoryData = (historyData: any[], dob: string): any[] => {
  if (!Array.isArray(historyData) || historyData.length === 0) return [];

  // Sort histories by created_at descending
  const sortedHistories = [...historyData].sort(
    (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const latestDate = sortedHistories.length > 0 ? sortedHistories[0].created_at : null;

  return sortedHistories.map((record: any, index: number) => {
    let bmi = "N/A";
    let findingsData = {
      subj_summary: "",
      obj_summary: "",
      assessment_summary: "",
      plantreatment_summary: ""
    };

    if (record.child_health_vital_signs?.length > 0) {
      const vital = record.child_health_vital_signs[0];

      // Calculate BMI if height and weight available.
      if (vital.bm_details?.height && vital.bm_details?.weight) {
        const heightInM = vital.bm_details.height / 100;
        const bmiValue = (vital.bm_details.weight / (heightInM * heightInM)).toFixed(1);
        bmi = bmiValue;
      }

      if (vital.find_details) {
        findingsData = {
          subj_summary: vital.find_details.subj_summary || "",
          obj_summary: vital.find_details.obj_summary || "",
          assessment_summary: vital.find_details.assessment_summary || "",
          plantreatment_summary: vital.find_details.plantreatment_summary || ""
        };
      }
    }

    let latestNoteContent: string | null = null;
    let followUpDescription = "";
    let followUpDate = "";
    let followUpStatus = "";

    if (record.child_health_notes && record.child_health_notes.length > 0) {
      const sortedNotes = [...record.child_health_notes].sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      latestNoteContent = sortedNotes[0].chn_notes || null;
      if (sortedNotes[0].followv_details) {
        followUpDescription = sortedNotes[0].followv_details.followv_description || "";
        followUpDate = sortedNotes[0].followv_details.followv_date || "";
        followUpStatus = sortedNotes[0].followv_details.followv_status || "";
      }
    }

    return {
      chrec_id: record.chrec, // note: adjust if necessary
      patrec: record.patrec_id,
      status: record.status || "N/A",
      chhist_id: record.chhist_id,
      id: record.index,

      latestDate: latestDate,
      temp: record.child_health_vital_signs?.[0]?.temp || 0,
      age: dob ? calculateAgeFromDOB(dob, record.created_at).ageString : "N/A",
      wt: record.child_health_vital_signs?.[0]?.bm_details?.weight || 0,
      ht: record.child_health_vital_signs?.[0]?.bm_details?.height || 0,
      bmi,
      latestNote: latestNoteContent,
      followUpDescription,
      followUpDate,
      followUpStatus,
      vaccineStat: record.tt_status || "N/A",
      updatedAt: new Date(record.created_at).toLocaleDateString(),
      rawCreatedAt: record.created_at,
      findings: findingsData,
      hasFindings:
        !!findingsData.subj_summary ||
        !!findingsData.obj_summary ||
        !!findingsData.assessment_summary ||
        !!findingsData.plantreatment_summary,
    };
  });
};