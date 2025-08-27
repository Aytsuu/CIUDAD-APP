import { useQuery } from "@tanstack/react-query";
import { getCombinedStock } from "../restful-api/AntigenGetAPI";
import { getVaccine, getVaccineStocks } from "../restful-api/VaccineGetAPI";
import { showErrorToast } from "@/components/ui/toast";

export const useAntigenCombineStocks = () => {
  return useQuery({
    queryKey: ["combinedStocks"],
    queryFn: getCombinedStock,
    refetchOnMount: true,
    staleTime: 0
  });
};

export const fetchVaccines = () => {
  return useQuery({
    queryKey: ["vaccines"],
    queryFn: async () => {
      try {
        const res = await getVaccine();

        const vaccines = res;

        return {
          default: vaccines,
          formatted: vaccines.map((vaccine: any) => ({
            id: vaccine.vac_id.toString(),
            name: vaccine.vac_name,
            rawName: vaccine.vac_name,
            type: vaccine.vac_type_choices,
            categoryId: vaccine.vaccat_id
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch vaccines data");
        throw error;
      }
    }
  });
};

export const fetchBatchNumbers = () => {
  return useQuery({
    queryKey: ["vaccineBatchNumbers"],
    queryFn: async () => {
      try {
        const res = await getVaccineStocks();
        return res.data.map((item: any) => ({
          batchNumber: item.batch_number,
          imz_id: item.imz_id 
        }));
      } catch (error) {
        showErrorToast("Failed to fetch batch numbers");
        throw error;
      }
    }
  });
};
