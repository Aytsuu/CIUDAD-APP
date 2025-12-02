// src/restful-api/FetchPatientInfo.ts
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { toast } from "sonner";
import { calculateCurrentAge } from "@/helpers/ageCalculator";
interface PatientInfo {
  pat_id: string;
  pat_type: string;
  lname: string;
  fname: string;
  mname?: string;
  dob: string;
  address: string;
  vaccination_count: number;
}

export const fetchPatientInfo = async (patId: string): Promise<PatientInfo> => {
  try {
    const response = await api2.get(`/patient-info/${patId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient info:", error);
    toast.error("Failed to load patient information");
    throw error;
  }
};

export const fetchPatientRecords = async () => {
  try {
    const response = await api2.get("patientrecords/patients/");
    const patientData = response.data;

    return {
      default: patientData,
      formatted: patientData.map((patient: any) => ({
        id: `${patient.pat_id.toString()}, ${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
        pat_id: patient.pat_id,
        name: (
          <div className="flex items-center gap-3">
            <span>
              <span className="bg-green-500 rounded text-white p-1 mt-2 mr-4"> {patient.pat_id}</span>

              {`${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""} [${patient.pat_type}]`}
            </span>
          </div>
        )
      }))
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Failed to load patient records");
    throw error;
  }
};


export const fetchPatient5yearsbelow = async () => {
  try {
    const response = await api2.get("patientrecords/children/");
    const patientData = response.data;

    // Filter patients aged 5 years and below (0-5 years)
    const filteredPatients = patientData.filter((patient: any) => {
      try {
        if (!patient.personal_info?.per_dob) return false;

        const birthDate = new Date(patient.personal_info.per_dob);
        const today = new Date();

        if (isNaN(birthDate.getTime())) return false;

        // Calculate age in months
        let months = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());

        // Adjust for day of month
        if (today.getDate() < birthDate.getDate()) {
          months--;
        }

        return months <= 60; // 5 years * 12 months = 60 months
      } catch (e) {
        console.error(`Error calculating age for patient ${patient.pat_id}:`, e);
        return false;
      }
    });

    return {
      default: filteredPatients,
      formatted: filteredPatients.map((patient: any) => ({
        id: `${patient.pat_id.toString()}, ${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim(),
        pat_id: patient.pat_id,
        name: (
          <div className="flex items-center gap-3">
            <span>
              <span className="bg-green-500 rounded text-white p-1 mt-2 mr-4"> {patient.pat_id}</span>
              {`${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""} [${patient.pat_type}]`}
              <span className="ml-2 text-sm text-blue-600">({calculateCurrentAge(patient.personal_info?.per_dob || "")} old)</span>
            </span>
          </div>
        )
      }))
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Failed to load patient records");
    throw error;
  }
};

export const usePatientsQuery = () => {
  return useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatientRecords,
    staleTime: 5 * 60 * 1000 // optional: 5 minutes cache
  });
};

export const usePatients5yearsbelowQuery = () => {
  return useQuery({
    queryKey: ["patients5yearsbelow"],
    queryFn: fetchPatient5yearsbelow,
    staleTime: 5 * 60 * 1000 // optional: 5 minutes cache
  });
};
