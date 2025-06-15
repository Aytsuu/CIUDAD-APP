import { api } from "@/pages/api/api";

// Helper function to get vaccine stock info
export const getVaccineStock = async (vaccineTypeId: string) => {
  const vacStck_id = parseInt(vaccineTypeId, 10);
  const response = await api.get(`inventory/vaccine_stocks/${vacStck_id}/`);
  return response.data;
};

export const createPatientRecord = async (pat_id: string) => {
  const response = await api.post("patientrecords/patient-record/", {
    patrec_type: "Vaccination",
    pat_id: pat_id,
    created_at: new Date().toISOString(),
  });
  return response.data;
};

export const createVaccinationRecord = async (
  patrec_id: string,
  // status: "forwarded" | "completed" | "partially vaccinated",
  totalDoses: number
) => {
  const response = await api.post("vaccination/vaccination-record/", {
    patrec_id: patrec_id,
    // vacrec_status: status,
    vacrec_totaldose: totalDoses,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  return response.data;
};

export const createVaccinationHistory = async (
  vacrec_id: string,
  data: Record<string, any>,
  vaccineType: string,
  doseNo: number,
  status: "forwarded" | "completed" | "partially Vaccinated",
  vital_id: string | null = null,
  followv_id: string | null = null
) => {
  const response = await api.post("vaccination/vaccination-history/", {
    vachist_doseNo: doseNo,
    vachist_status: status,
    vachist_age: data.age,
    staff_id: 1,
    vacrec: vacrec_id,
    vital: vital_id,
    created_at: new Date().toISOString(),
    vacStck: vaccineType,
    assigned_to: data.assignto ? parseInt(data.assignto, 10) : null,
    followv: followv_id,
  });
  return response.data;
};

export const createVitalSigns = async (data: Record<string, any>) => {
  const response = await api.post("patientrecords/vital-signs/", {
    vital_bp_systolic: data.bpsystolic?.toString() || "",
    vital_bp_diastolic: data.bpdiastolic?.toString() || "",
    vital_temp: data.temp?.toString() || "",
    vital_RR: "N/A",
    vital_o2: data.o2?.toString() || "",
    vital_pulse: data.pr?.toString() || "",
    created_at: new Date().toISOString(),
  });
  return response.data;
};

export const createFollowUpVisit = async (
  patrec_id: string,
  followv_date: string
) => {
  const response = await api.post("patientrecords/follow-up-visit/", {
    followv_date: followv_date,
    patrec: patrec_id,
    followv_status: "pending",
    created_at: new Date().toISOString(),
  });
  return response.data;
};



// New API function for fetching previous vaccination history
export const getVaccinationHistory = async (vachist_id: string) => {
    const response = await api.get(`vaccination/vaccination-history/${vachist_id}/`);
    return response.data;
  };
  
  // New API function for updating follow-up visit
  export const updateFollowUpVisit = async (followv_id: string, status: string) => {
    await api.put(`patientrecords/follow-up-visit/${followv_id}/`, {
      followv_status: status,
    });
  };
  
  // // New API function for updating vaccination record
  // export const updateVaccinationRecord = async (vacrec_id: string, status: string | null, updated_at: string) => {
  //   await api.put(`vaccination/vaccination-record/${vacrec_id}/`, {
  //     updated_at,
  //     ...(status && { vacrec_status: status }),
  //   });
  // };

  
  
export const deleteVaccinationRecord = async (vacrec_id: string) => {
  await api.delete(`vaccination/vaccination-record/${vacrec_id}/`);
};

export const deletePatientRecord = async (patrec_id: string) => {
  await api.delete(`patientrecords/patient-record/${patrec_id}/`);
};

export const deleteVitalSigns = async (vital_id: string) => {
  await api.delete(`patientrecords/vital-signs/${vital_id}/`);
};

export const deleteFollowUpVisit = async (followv_id: string) => {
  await api.delete(`patientrecords/follow-up-visit/${followv_id}/`);
};

export const deleteVaccinationHistory = async (vachist_id: string) => {
  await api.delete(`vaccination/vaccination-history/${vachist_id}/`);

};


export const createAntigenStockTransaction = async (
  vacStck_id: number,
  qty: string = "1 dose",
  action: string = "Used from TT",
  staffId: number = 1
) => {
  const transactionPayload = {
    antt_qty: qty,
    antt_action: action,
    staff: staffId,
    vacStck_id: vacStck_id,
  };

  await api.post("inventory/antigens_stocks/", transactionPayload);
};