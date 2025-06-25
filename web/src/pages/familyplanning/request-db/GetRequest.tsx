import { api2 } from "@/api/api"

export const getFPRecordsList = async () => {
  try {
    // Call the new comprehensive API endpoint
    const response = await api2.get("familyplanning/overall-records/"); // This should match your new URL
    const fpRecords = response.data;

    // Transform data to match the FPRecord interface in OverallTable.tsx
    const transformedData = fpRecords.map((record: any) => {
      const personal = record.personal_info;

      return {
        fprecord_id: record.fprecord_id,
        client_id: record.clientID || "N/A",
        patient_name: record.patient_name,
        patient_age: record.patient_age || "N/A", 
        client_type: record.typeOfClient || "N/A",
        method_used: record?.method_use || "N/A", // Directly from the comprehensive record
        created_at: record.created_at || "N/A",
        updated_at: record.updated_at || "N/A",
        sex: record.sex || "Unknown",
        record_count: record?.record_count,
      };
    });

    return transformedData;
  } catch (err) {
    console.error("Error fetching FP records:", err);
    return [];
  }
};
const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  // Adjust age if birthday hasn't occurred yet this year
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// // Get complete FP record with all related data
// export const getFPCompleteRecord = async (fprecord_id: number) => {
//   try {
//     const response = await api2.get(`family-planning/complete_record/${fprecord_id}/`)
//     return response.data
//   } catch (err) {
//     console.error("Error fetching complete FP record:", err)
//     throw err
//   }
// }

// Get patients filtered by family planning type
export const getFamilyPlanningPatients = async () => {
  try {
    const response = await api2.get("patientrecords/patient/", {
      params: {
        patrec_type: "Family Planning",
      },
    })
    return response.data
  } catch (err) {
    console.error("Error fetching family planning patients:", err)
    return []
  }
}

// Individual record getters
export const getFPRecord = async (fprecord_id: number) => {
  try {
    const response = await api2.get(`family-planning/fp_record/${fprecord_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching FP record:", err)
    throw err
  }
}

export const getFPType = async (fpt_id: number) => {
  try {
    const response = await api2.get(`family-planning/fp_type/${fpt_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching FP type:", err)
    throw err
  }
}

export const getMedicalHistory = async (medhistory_id: number) => {
  try {
    const response = await api2.get(`family-planning/medical_history/${medhistory_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching medical history:", err)
    throw err
  }
}

export const getObstetricalHistory = async (obstetrical_id: number) => {
  try {
    const response = await api2.get(`family-planning/obstetrical/${obstetrical_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching obstetrical history:", err)
    throw err
  }
}

export const getRiskSti = async (sti_id: number) => {
  try {
    const response = await api2.get(`family-planning/risk_sti/${sti_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching risk STI:", err)
    throw err
  }
}

export const getRiskVaw = async (vaw_id: number) => {
  try {
    const response = await api2.get(`family-planning/risk_vaw/${vaw_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching risk VAW:", err)
    throw err
  }
}

export const getPhysicalExam = async (physical_id: number) => {
  try {
    const response = await api2.get(`family-planning/physical_exam/${physical_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching physical exam:", err)
    throw err
  }
}

export const getPelvicExam = async (pelvic_id: number) => {
  try {
    const response = await api2.get(`family-planning/pelvic_exam/${pelvic_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching pelvic exam:", err)
    throw err
  }
}

export const getAcknowledgement = async (ack_id: number) => {
  try {
    const response = await api2.get(`family-planning/acknowledgement/${ack_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching acknowledgement:", err)
    throw err
  }
}

export const getPregnancyCheck = async (pregnancy_id: number) => {
  try {
    const response = await api2.get(`family-planning/fp_pregnancycheck/${pregnancy_id}/`)
    return response.data
  } catch (err) {
    console.error("Error fetching pregnancy check:", err)
    throw err
  }
}


// Legacy functions (keeping for compatibility)
export const getFPprofiling = async () => {
  try {
    const response = await api2.get("family-planning/fp_type")
    const patientData = response.data
    return patientData
  } catch (err) {
    console.error("Error fetching data:", err)
    return []
  }
}

export const getPatients = async () => {
  try {
    const response = await api2.get("patientrecords/patient")
    return response.data
  } catch (err) {
    console.error("Error fetching patients:", err)
    return []
  }
}


// Updated function for overall table - one row per patient
export const getPatientsWithFPRecords = async () => {
  try {
    const response = await api2.get("familyplanning/patients-with-fp-records/")
    return response.data
  } catch (err) {
    console.error("❌ Error fetching patients with FP records:", err)
    return []
  }
}

// Function to get all FP records for a specific patient (for individual view)
export const getFPRecordsForPatient = async (patientId: string | number) => {
  try {
    const response = await api2.get(`familyplanning/fp-records-by-patient/${patientId}/`)
    return response.data
  } catch (err) {
    console.error("❌ Error fetching FP records for patient:", err)
    return []
  }
}

// Updated getFPCompleteRecord to handle the new structure
export const getFPCompleteRecord = async (fprecord_id: number) => {
  try {
    const response = await api2.get(`familyplanning/complete_record/${fprecord_id}/`)
    console.log("✅ Complete FP record fetched:", response.data)
    return response.data
  } catch (err) {
    console.error("❌ Error fetching complete FP record:", err)
    throw err
  }
}