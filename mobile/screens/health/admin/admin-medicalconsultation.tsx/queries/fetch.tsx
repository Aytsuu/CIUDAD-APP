
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";


// Updated API functions
export const getMedicalRecord = async (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
    try {
      const queryParams = new URLSearchParams();
  
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.page_size) queryParams.append("page_size", params.page_size.toString());
      if (params?.search) queryParams.append("search", params.search);
      if (params?.patient_type && params.patient_type !== "all") {
        queryParams.append("patient_type", params.patient_type);
      }
  
      const url = `/medical-consultation/all-medical-consultation-record/${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await api2.get(url);
      return response.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };
export const useMedicalRecord = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
    return useQuery({
      queryKey: ["MedicalRecord", params],
      queryFn: () => getMedicalRecord(params),
      staleTime: 1000 * 60 * 5,
      retry: 3
    });
  };