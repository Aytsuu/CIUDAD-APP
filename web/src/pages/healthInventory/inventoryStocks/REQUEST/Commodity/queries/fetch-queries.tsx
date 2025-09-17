import { useQuery } from "@tanstack/react-query";
import { getCommodityStocksTable } from "../restful-api/CommodityGetAPI";
import { showErrorToast } from "@/components/ui/toast";
import { getCommodity } from "@/pages/healthInventory/InventoryList/restful-api/commodity/fetch-api";



export const useCommodityStocksTable = (page: number, pageSize: number, search?: string, filter?: string) => {
  return useQuery({
    queryKey: ["commodityStocks", page, pageSize, search, filter],
    queryFn: () => getCommodityStocksTable(page, pageSize, search, filter),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
};

export const fetchCommodity = () => {
  return useQuery({
    queryKey: ["commodities"],
    queryFn: async () => {
      try {
        const commodities = await getCommodity();

        if (!commodities || !Array.isArray(commodities)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: commodities,
          formatted: commodities
            .map((commodity: any) => ({
              id: `${String(commodity.com_id)},${commodity.com_name}`,
              name: String(commodity.com_name || ""), // Ensure it's a string and trimmed
              rawName: commodity.com_name,
              user_type: commodity.user_type || "No User Type"
            }))
            .filter((item) => item.name) // Remove items with empty names
        };
      } catch (error) {
        showErrorToast("Failed to fetch commodities data");
        throw error;
      }
    }
  });
};
