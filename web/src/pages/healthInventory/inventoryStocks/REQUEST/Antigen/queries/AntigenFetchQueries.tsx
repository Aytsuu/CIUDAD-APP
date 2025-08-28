import { useQuery } from "@tanstack/react-query";
import { getCombinedStock } from "../restful-api/AntigenGetAPI";
import { getVaccine, getVaccineStocks } from "../restful-api/VaccineGetAPI";
import { showErrorToast } from "@/components/ui/toast";


// Updated useQuery hook following your pattern
export const useAntigenCombineStocks = (
  page: number, 
  pageSize: number, 
  search?: string,
  filter?: any
) => {
  return useQuery({
    queryKey: ["combinedStocks", page, pageSize, search, filter],
    queryFn: () => getCombinedStock(page, pageSize, search, filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
            id: `${vaccine.vac_id.toString()},${vaccine.vac_name}`,
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
