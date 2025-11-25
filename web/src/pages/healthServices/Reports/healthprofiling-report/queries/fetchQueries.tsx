import { useQuery } from "@tanstack/react-query";
import { fetchPopulationStructureReport, fetchSitios, fetchPopulationYearlyRecords, fetchPopulationBySitio } from "../restful-api/getAPI";
import { fetchHealthProfilingSummary } from "../restful-api/summaryAPI";

// Fetch population structure report
export const usePopulationStructureReport = (year?: string, sitio?: string) => {
  return useQuery({
    queryKey: ["populationStructureReport", year, sitio],
    queryFn: () => fetchPopulationStructureReport(year, sitio),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch sitios list
export const useSitios = () => {
  return useQuery({
    queryKey: ["sitios"],
    queryFn: fetchSitios,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

// Fetch yearly population records
export const usePopulationYearlyRecords = () => {
  return useQuery({
    queryKey: ["populationYearlyRecords"],
    queryFn: fetchPopulationYearlyRecords,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch health profiling summary
export const useHealthProfilingSummary = (year?: string, sitio?: string) => {
  return useQuery({
    queryKey: ["healthProfilingSummary", year, sitio],
    queryFn: () => fetchHealthProfilingSummary(year, sitio),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Fetch population by sitio
export const usePopulationBySitio = (year?: string) => {
  return useQuery({
    queryKey: ["populationBySitio", year],
    queryFn: () => fetchPopulationBySitio(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
