import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { getCommodity } from "../../restful-api/commodity/CommodityFetchAPI";

export const useCommodities = () => {
    return useQuery({
        queryKey: ["commodities"],
        queryFn: getCommodity,
        refetchOnMount: true,
        staleTime: 0,
    });
};

export const useCommoditylistCount = () => {
    return useQuery({
      queryKey: ["commoditylistcount"],
      queryFn: async () => {
        const response = await api2.get("inventory/commoditylistcount/");
        return response.data;
      }
    });
  };