// utils/patientSerializer.ts

export interface SerializedPatientData {
    pat_id: string;
    personal_info: {
      per_id: number;
      per_lname: string;
      per_fname: string;
      per_mname: string | null;
      per_suffix: string | null;
      per_dob: string;
      per_sex: string;
      per_status: string;
      per_edAttainment: string | null;
      per_religion: string | null;
      per_contact: string;
      per_disability: string | null;
    };
    address: {
      add_street: string;
      add_barangay: string;
      add_city: string;
      add_province: string;
      add_sitio: string;
      full_address: string;
    };
    households: Array<{
      hh_id: string;
    }>;
    pat_type: string;
    pat_status: string;
  }
  
  export const serializePatientData = (rawPatientData: any): SerializedPatientData | null => {
    if (!rawPatientData) return null;
  
    try {
      return {
        pat_id: rawPatientData.pat_id || '',
        personal_info: {
          per_id: rawPatientData.personal_info?.per_id || 0,
          per_lname: rawPatientData.personal_info?.per_lname || '',
          per_fname: rawPatientData.personal_info?.per_fname || '',
          per_mname: rawPatientData.personal_info?.per_mname || null,
          per_suffix: rawPatientData.personal_info?.per_suffix || null,
          per_dob: rawPatientData.personal_info?.per_dob || '',
          per_sex: rawPatientData.personal_info?.per_sex || '',
          per_status: rawPatientData.personal_info?.per_status || '',
          per_edAttainment: rawPatientData.personal_info?.per_edAttainment || null,
          per_religion: rawPatientData.personal_info?.per_religion || null,
          per_contact: rawPatientData.personal_info?.per_contact || '',
          per_disability: rawPatientData.personal_info?.per_disability || null,
        },
        address: {
          add_street: rawPatientData.address?.add_street || '',
          add_barangay: rawPatientData.address?.add_barangay || '',
          add_city: rawPatientData.address?.add_city || '',
          add_province: rawPatientData.address?.add_province || '',
          add_sitio: rawPatientData.address?.add_sitio || '',
          full_address: rawPatientData.address?.full_address || '',
        },
        households: rawPatientData.households || [],
        pat_type: rawPatientData.pat_type || 'Resident',
        pat_status: rawPatientData.pat_status || 'Active',
      };
    } catch (error) {
      console.error('Error serializing patient data:', error);
      return null;
    }
  };