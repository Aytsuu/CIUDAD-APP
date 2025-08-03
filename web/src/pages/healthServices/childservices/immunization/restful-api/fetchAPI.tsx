import { getVaccineList } from "@/pages/healthInventory/InventoryList/restful-api/Antigen/VaccineFetchAPI";

// services/vaccineService.ts
export const fetchVaccineStocks = async () => {
    const data = await getVaccineList(); // Your existing API call
    return {
      default: data,
      formattedOptions: data.map((v: any) => ({
        id: `${v.vac_id},${v.vac_name}`,
        name: v.vac_name,
      })),
    };
  };