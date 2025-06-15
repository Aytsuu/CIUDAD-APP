
// src/restful-api/FetchPatientInfo.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";
import { toast } from "sonner";

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
    const response = await api.get(`/patient-info/${patId}/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient info:", error);
    toast.error("Failed to load patient information");
    throw error;
  }
};

// export const usePatientInfo = (patId: string) => {
//   return useQuery({
//     queryKey: ["patientInfo", patId],
//     queryFn: () => fetchPatientInfo(patId),
//     enabled: !!patId, // Only fetch if patId is provided
//     staleTime: 5 * 60 * 1000, // Cache for 5 minutes
//   });
// };


export const fetchPatientRecords = async () => {
  try {
    const response = await api.get("patientrecords/patient/");
    const patientData = response.data;

    return {
      default: patientData,
      formatted: patientData.map((patient: any) => ({
        id: patient.pat_id.toString(),
        pat_id: patient.pat_id,
        name: (
          <div className="flex items-center gap-3">
            <span>
            <span className="bg-green-500 rounded text-white p-1 mt-2 mr-4"> {patient.pat_id}</span>

              {`${patient.personal_info?.per_lname || ""}, ${
                patient.personal_info?.per_fname || ""
              } ${patient.personal_info?.per_mname || ""} [${
                patient.pat_type
              }]`}
            </span>
          </div>
        ),
      })),
    };
  } catch (error) {
    console.error("Error fetching patients:", error);
    toast.error("Failed to load patient records");
    throw error;
  }
};

