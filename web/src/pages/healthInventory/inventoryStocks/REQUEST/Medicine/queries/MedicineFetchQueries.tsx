import { useQuery } from "@tanstack/react-query";
import { getMedicineInventory,getMedicineStocks} from "../restful-api/MedicineGetAPI";

 export const useMedicineStocks = () => {
    return useQuery({
        queryKey: ["medicineinventorylist"],
        queryFn: getMedicineInventory,
        refetchOnMount: true,
        staleTime: 0,
    });
};



export const useMedicineStockTable = (
  page: number, 
  pageSize: number, 
  search?: string,
  filter?: string
) => {
  return useQuery({
    queryKey: ["medicineStocks", page, pageSize, search, filter],
    queryFn: () => getMedicineStocks(page, pageSize, search, filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};