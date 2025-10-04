import { useQuery } from "@tanstack/react-query";
import { getCommodity } from "../../restful-api/commodity/fetch-api";
import { api2 } from "@/api/api";

export const useCommodities = (page?: number, pageSize?: number, search?: string) => {
  return useQuery({
    queryKey: ["commodities", page, pageSize, search],
    queryFn: () => getCommodity(page, pageSize, search),
    staleTime: 1000 * 60 * 5 // 5 minutes
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
