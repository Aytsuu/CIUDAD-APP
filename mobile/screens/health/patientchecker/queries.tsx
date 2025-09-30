import { useQuery, useQueryClient } from "@tanstack/react-query"
import { api2 } from "@/api/api";

export const getPatientByResidentId = async (rpId: string) => {
  try {
    const res = await api2.get(`patientrecords/patient/by-resident/${rpId}/`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching patient by resident ID:", error);
    return null;
  }
};

export const usePatientByResidentId = (rp_id:any) => {
    return useQuery({
      queryKey: ['patientByResidentId', rp_id],
      queryFn: () => {
        if (!rp_id) throw new Error('Resident ID is undefined');
        return getPatientByResidentId(rp_id);
      },
      enabled: !!rp_id,
    });
  };