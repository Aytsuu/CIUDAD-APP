
// api/medicalHistoryApi.ts
import { useQuery } from "@tanstack/react-query";
import {getIllnessChart,getVaccinationChart} from "../restful-api/get";






export const useMedicalHistoryChart = (month: string) => {
    return useQuery({
      queryKey: ["medicalHistoryChart", month],
      queryFn: () => getIllnessChart(month),
    });
  };

  export const useVaccinationChart = (month: string) => {
    return useQuery({
      queryKey: ["vaccinationchart", month],
      queryFn: () => getVaccinationChart(month),
    });
  };

