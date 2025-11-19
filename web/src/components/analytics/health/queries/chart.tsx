
// api/medicalHistoryApi.ts
import { useQuery } from "@tanstack/react-query";
import {getIllnessChart,getVaccinationChart,getVaccineResidentChart} from "../restful-api/get";

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


    // queries/vaccineChart.ts
  export const useVaccineResidentChart = (year: string) => {
      return useQuery({
          queryKey: ["vaccineResidentChart", year],
          queryFn: () => getVaccineResidentChart(year),
      });
  };


 