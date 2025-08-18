import { useEffect, useState } from "react";
import { getMedicines } from "../../../../InventoryList/restful-api/medicine/MedicineFetchAPI";
import { useQuery } from "@tanstack/react-query";
import { showErrorToast } from "@/components/ui/toast";


export const fetchMedicines = () => {
  return useQuery({
    queryKey: ["medicines"],
    queryFn: async () => {
      try {
        const medicines = await getMedicines();

        if (!medicines || !Array.isArray(medicines)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: medicines,
          formatted: medicines.map((medicine: any) => ({
            id: String(medicine.med_id),
            name: `${medicine.med_name} `,
            rawName: medicine.med_name,
            category: medicine.catlist || "No Category"
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch medicines data");
        throw error;
      }
    }
  });
};
