// src/services/patientService.ts
import { api2 } from "@/api/api";
import { toast } from "sonner";

export const fetchPatientRecords = async () => {
  try {
    const response = await api2.get("patientrecords/patient/");
    const patientData = response.data;

    return {
      default: patientData,
      formatted: patientData.map((patient: any) => ({
        id: patient.pat_id.toString(),
        name: `${patient.personal_info?.per_lname || ""}, ${patient.personal_info?.per_fname || ""} ${patient.personal_info?.per_mname || ""}`.trim()
      }))
    };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching patients:", error);
    }
    toast.error("Failed to load patient records");
    // Do not throw in production; only log in development
  }
};


