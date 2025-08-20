// src/hooks/useTransactions.ts
import { useQuery } from "@tanstack/react-query";
import { getTransactionMedicines, getTransactionCommodity, getTransactionFirstAid, getAntigenTransactions } from "./GetRequest";

export const useMedicineTransactions = () => {
  return useQuery({
    queryKey: ["medicineTransactions"],
    queryFn: getTransactionMedicines,
    staleTime: 0,
  });
};

export const useCommodityTransactions = () => {
  return useQuery({
    queryKey: ["commodityTransactions"],
    queryFn: getTransactionCommodity,
    staleTime: 0,
  });
};

export const useFirstAidTransactions = () => {
  return useQuery({
    queryKey: ["firstAidTransactions"],
    queryFn: getTransactionFirstAid,
    staleTime: 0,
  });
};

export const useAntigenTransactions = () => {
  return useQuery({
    queryKey: ["antigenTransactions"],
    queryFn: getAntigenTransactions,
    staleTime: 0,
  });
};
