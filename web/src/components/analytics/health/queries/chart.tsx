
// api/medicalHistoryApi.ts
import { useQuery } from "@tanstack/react-query";
import {getIllnessChart, getVaccinationChart} from "../restful-api/get";





export const useVaccineChart = (month: string) => {
  return useQuery({
    queryKey: ["vaccineChart", month],
    queryFn: () => getVaccinationChart(month),
  });
}




export const useMedicalHistoryChart = (month: string) => {
    return useQuery({
      queryKey: ["medicalHistoryChart", month],
      queryFn: () => getIllnessChart(month),
    });
  };
