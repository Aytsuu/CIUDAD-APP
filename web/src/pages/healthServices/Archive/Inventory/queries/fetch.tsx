
import { useQuery } from "@tanstack/react-query";
import { getCommodityStocks,getMedicineInventory ,getFirstAidInventoryList,getFirstAidStocks,getCombinedStock} from "../restful-api/getAPI";

 export const useCommodityStocks = () => {
    return useQuery({
        queryKey: ["archivecommodityinventorylist"],
        queryFn: getCommodityStocks,
        refetchOnMount: true,
        staleTime: 0,
    });
};


 export const useMedicineStocks = () => {
    return useQuery({
        queryKey: ["archivemedicineinventorylist"],
        queryFn: getMedicineInventory,
        refetchOnMount: true,
        staleTime: 0,
    });
};

export const useFirstAidList = () => {
    return useQuery({
      queryKey: ["archivefirstaidinventorylist"],
      queryFn: getFirstAidInventoryList,
      staleTime: 1000 * 60 * 30,
    });
  };

  
  export const useAntigenCombineStocks = () => {
      return useQuery({
          queryKey: ["combinedStocks"],
          queryFn: getCombinedStock,
          refetchOnMount: true,
          staleTime: 0,
      });
  };