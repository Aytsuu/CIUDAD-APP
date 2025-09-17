import { useQuery } from "@tanstack/react-query";
import { getMedicineTransactions,getCommodityTransactions,getFirstAidTransactions,getAntigenTransactions} from "./GetRequest";





// API hook for fetching medicine transactions
export const useMedicineTransactions = (
  page: number, 
  pageSize: number, 
  search?: string,
) => {
  return useQuery({
    queryKey: ["medicinetransactions", page, pageSize, search],
    queryFn: () => getMedicineTransactions(page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0,
  });
};

// API hook for fetching commodity transactions
export const useCommodityTransactions = (
  page: number, 
  pageSize: number, 
  search?: string,
) => {
  return useQuery({
    queryKey: ["commoditytransactions", page, pageSize, search],
    queryFn: () => getCommodityTransactions(page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0,
  });
};

// API hook for fetching first aid transactions
export const useFirstAidTransactions = (
  page: number, 
  pageSize: number, 
  search?: string,
) => {
  return useQuery({
    queryKey: ["firstaidtransactions", page, pageSize, search],
    queryFn: () => getFirstAidTransactions(page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0,
  });
};



// API hook for fetching antigen transactions
export const useAntigenTransactions = (
  page: number, 
  pageSize: number, 
  search?: string,
) => {
  return useQuery({
    queryKey: ["antigentransactions", page, pageSize, search],
    queryFn: () => getAntigenTransactions(page, pageSize, search),
    refetchOnMount: true,
    staleTime: 0,
  });
};
