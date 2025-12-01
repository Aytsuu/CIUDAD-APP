import { useQuery } from "@tanstack/react-query";
import { getCombinedStock } from "../restful-api/get";
import { getVaccine, getVaccineStocks ,getImmunizationStocks} from "../restful-api/get";
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

export const useFetchVaccines = () => {
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

export const useFetchBatchNumbers = () => {
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

export const useFetchImmunizationSupplies = () => {
  return useQuery({
    queryKey: ["immunizationSupplies"],
    queryFn: async () => {
      try {
        const res = await getImmunizationStocks();

        const supplies = Array.isArray(res) ? res : [];

        return {
          default: supplies,
          formatted: supplies.map((supply: any) => ({
            id: `${supply.imzStck_id?.toString()},${supply.imz_detail?.imz_name}`,
            name: supply.imz_detail?.imz_name || 'Unknown',
            rawName: supply.imz_detail?.imz_name || 'Unknown',
            batchNumber: supply.batch_number,
            availableQty: supply.imzStck_avail,
            unit: supply.imzStck_unit,
            imz_id: supply.imz_id,
            inv_id: supply.inv_id
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch immunization supplies data");
        throw error;
      }
    }
  });
};

// useFetchImmunizationSuppliesWithStock function with availability and expiry filtering
export const useFetchImmunizationSuppliesWithStock = () => {
  return useQuery({
    queryKey: ["immunizationSuppliesWithStock"],
    queryFn: async () => {
      try {
        const stocks = await getImmunizationStocks();

        if (!stocks || !Array.isArray(stocks)) {
          return {
            default: [],
            formatted: []
          };
        }

        const availableStocks = stocks.filter((stock) => {
          const isExpired = stock.inv_detail?.expiry_date && new Date(stock.inv_detail.expiry_date) < new Date();
          return stock.imzStck_avail > 0 && !isExpired;
        });

        return {
          default: availableStocks,
          formatted: availableStocks.map((stock: any) => ({
            id: `${stock.imzStck_id},${stock.imz_id},${stock.imz_detail?.imz_name || "Unknown Supply"},${stock.inv_detail?.inv_id || "No Inv ID"}`,
            name: (
              <div className="flex gap-3">
                <span className="bg-blue-500 rounded text-white p-1 text-xs">{stock.inv_detail?.inv_id}</span>
                {`${stock.imz_detail?.imz_name || "Unknown Supply"} 
                (Avail: ${stock.imzStck_avail} ${stock.imzStck_unit}) ${stock.inv_detail?.expiry_date ? `[Exp: ${new Date(stock.inv_detail.expiry_date).toLocaleDateString()}]` : ""}`}
              </div>
            ),
            rawName: stock.imz_detail?.imz_name || 'Unknown Supply',
            batchNumber: stock.batch_number,
            availableQty: stock.imzStck_avail,
            unit: stock.imzStck_unit,
            imz_id: stock.imz_id,
            inv_id: stock.inv_detail?.inv_id,
            imzStck_id: stock.imzStck_id
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch immunization supplies with stock");
        throw error;
      }
    }
  });
};
