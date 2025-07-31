import { useQuery } from "@tanstack/react-query";
import { getVaccineTransactions, getImmunizationTransactions,getTransactionCommodity ,getTransactionFirstAid,getTransactionMedicines} from "../restful-api/GetRequest";


    export const useVaccineTransaction = () => {
    return useQuery({
      queryKey: ["vaccineTransactions"],
      queryFn: getVaccineTransactions,
      staleTime: 0,
    });
  };


  export const useImzTransactions = () => {
    return useQuery({
      queryKey: ["immunizationTransactions"],
      queryFn: getImmunizationTransactions,
      staleTime: 0,
    });
  };


  export const useCommodities= () => {
    return useQuery({
      queryKey: ["commodities"],
      queryFn: getTransactionCommodity,
      staleTime: 0,
    });
  };

  export const useFirstaid= () => {
    return useQuery({
      queryKey: ["TransactionfirstAid"],
      queryFn: getTransactionFirstAid,
      staleTime: 0,
    });
  };

  export const useMedicine= () => {
    return useQuery({
      queryKey: ["transactionmedicines"],
      queryFn: getTransactionMedicines,
      staleTime: 0,
    });
  };
