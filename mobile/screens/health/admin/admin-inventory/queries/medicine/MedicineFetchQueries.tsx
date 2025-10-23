
import { useQuery } from "@tanstack/react-query";
import { getMedicinesTable,getMedicines } from "../../restful-api/medicine/MedicineFetchAPI";
import { api2 } from "@/api/api";




export const useMedicines = (
  page: number, 
  pageSize: number, 
  search?: string,
  category?: string
) => {
  return useQuery({
    queryKey: ["medicines", page, pageSize, search, category], // Include all filters
    queryFn: () => getMedicinesTable(page, pageSize, search, category),
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