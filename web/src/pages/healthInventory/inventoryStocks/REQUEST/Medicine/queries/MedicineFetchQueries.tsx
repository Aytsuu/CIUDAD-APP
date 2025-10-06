import { useQuery } from "@tanstack/react-query";
import { getMedicineInventory } from "../restful-api/MedicineGetAPI";

 export const useMedicineStocks = () => {
    return useQuery({
        queryKey: ["medicineinventorylist"],
        queryFn: getMedicineInventory,
        refetchOnMount: true,
        staleTime: 0,
    });
};