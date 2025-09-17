
import { useQuery } from "@tanstack/react-query";
import { getMedicinesTable,getMedicines } from "../../restful-api/medicine/MedicineFetchAPI";
import { api2 } from "@/api/api";




export const useMedicines = (page: number, pageSize: number, search?: string) => {
  return useQuery({
    queryKey: ["medicines", page, pageSize, search], // Add parameters to queryKey
    queryFn: () => getMedicinesTable(page, pageSize, search),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};



  export const useMedicinesList = () => {
    return useQuery({
      queryKey: ["medicines"],
      queryFn: getMedicines,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  };

  export const useMedicinelistCount = () => {
    return useQuery({
      queryKey: ["medicinelistcount"],
      queryFn: async () => {
        const response = await api2.get("inventory/medicinelistcount/");
        return response.data;
      }
    });
  };