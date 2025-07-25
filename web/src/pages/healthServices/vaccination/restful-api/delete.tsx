import {api2} from "@/api/api";


  
export const deleteVaccinationRecord = async (vacrec_id: string) => {
    await api2.delete(`vaccination/vaccination-record/${vacrec_id}/`);
  };
  
  export const deletePatientRecord = async (patrec_id: string) => {
    const parsedPatrecId = parseInt(patrec_id, 10);
    await api2.delete(`patientrecords/patient-record/${parsedPatrecId}/`);
  };
  
  export const deleteVitalSigns = async (vital_id: string) => {
    await api2.delete(`patientrecords/vital-signs/${vital_id}/`);
  };
  
  export const deleteFollowUpVisit = async (followv_id: string) => {
    await api2.delete(`patientrecords/follow-up-visit/${followv_id}/`);
  };
  
  export const deleteVaccinationHistory = async (vachist_id: string) => {
    await api2.delete(`vaccination/vaccination-history/${vachist_id}/`);
  
  };
  