import { useState, useEffect } from "react";
import { api2 } from "@/api/api";
import {
  getVaccintStocks,
  getUnvaccinatedResidents,
  getVaccinationRecords,
  getVaccinationRecordById,
} from "./get";
import { useQuery } from "@tanstack/react-query";
import { VaccinationRecord } from "../tables/columns/types";
import { toast

 } from "sonner";
export const usePatientVaccinationDetails = (patientId: string) => {
  return useQuery({
    queryKey: ["patientVaccinationDetails", patientId],
    queryFn: () => getVaccinationRecordById(patientId),
    refetchOnMount: true,
    staleTime: 0,
    enabled: !!patientId, // Only fetch if patientId exists
  });
};

// Updated hook with parameters
export const useVaccinationRecords = () => {
  return useQuery<VaccinationRecord[]>({
    queryKey: ["vaccinationRecords"],
    queryFn: getVaccinationRecords,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const useUnvaccinatedResidents = () => {
  return useQuery({
    queryKey: ["unvaccinatedResidents"],
    queryFn: getUnvaccinatedResidents,
    refetchOnMount: true,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};


export const fetchVaccinesWithStock = () => {
  return useQuery({
    queryKey: ["vaccineStocks"],
    queryFn: async () => {
      try {
        const stocks = await getVaccintStocks();
        
        if (!stocks || !Array.isArray(stocks)) {
          return {
            default: [],
            formatted: []
          };
        }

        const availableStocks = stocks.filter((stock) => {
          const isExpired =
            stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });

        return {
          default: availableStocks,
          formatted: availableStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${
              stock.vaccinelist?.vac_name || "Unknown Vaccine"
            },${stock.inv_details?.expiry_date || "No Expiry"}`,
            name: (
              <div className="flex  gap-3">
                <span className="bg-blue-500 rounded text-white p-1 text-xs">
                  {stock.inv_details?.inv_id}
                </span>
                {`${stock.vaccinelist?.vac_name || "Unknown Vaccine"} 
                (Avail: ${stock.vacStck_qty_avail}) ${
                  stock.inv_details?.expiry_date 
                    ? `[Exp: ${new Date(stock.inv_details.expiry_date).toLocaleDateString()}]` 
                    : ''
                }`}
              </div>
            ),
          })),
        };
      } catch (error) {
        toast.error("Failed to fetch vaccine stocks");
        throw error;
      }
    },
  });
};





// In your fetchVaccinesWithStockVacID function
export const fetchVaccinesWithStockVacID = (vacId: number) => {
  const [vaccines, setVaccines] = useState<{
    default: any[];
    formatted: {
      id: string;
      name: string | JSX.Element;
      vac_id: string;
      expiry: string | null;
      available: number;
    }[];
  }>({ default: [], formatted: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const stocks = await getVaccintStocks();

        if (!stocks || !Array.isArray(stocks)) {
          setVaccines({ default: [], formatted: [] });
          return;
        }

        const availableStocks = stocks.filter((stock) => {
          const isExpired =
            stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });

        const transformedData = {
          default: availableStocks,
          formatted: availableStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${
              stock.vaccinelist?.vac_name || "Unknown Vaccine"
            },${stock.inv_details?.expiry_date || "No Expiry"}`,
            name: (
              <div className="flex items-center gap-3">
                <span className="bg-blue-500 rounded text-white p-1 text-xs">
                  {stock.vac_id}
                </span>
                {`${stock.vaccinelist?.vac_name || "Unknown Vaccine"} 
                (Available: ${stock.vacStck_qty_avail}) ${
                  stock.inv_details?.expiry_date 
                    ? `[Exp: ${new Date(stock.inv_details.expiry_date).toLocaleDateString()}]` 
                    : ''
                }`}
              </div>
            ),
            vac_id: String(stock.vac_id),
            expiry: stock.inv_details?.expiry_date || null,
            available: stock.vacStck_qty_avail,
          })),
        };

        setVaccines(transformedData);
      } catch (error) {
        console.error("Error fetching vaccine stocks:", error);
        setVaccines({ default: [], formatted: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [vacId]);

  return {
    vaccineStocksOptions: vaccines.formatted,
    defaultVaccineStocks: vaccines.default,
    isLoading,
  };
};


export const checkVaccineStatus = async (pat_id: string, vac_id: number) => {
  try {
    const response = await api2.get(
      `/vaccination/check-vaccine/${pat_id}/${vac_id}`
    );
    return response.data; // Return the data from the response
  } catch (error: unknown) {
    // Handle errors (you can customize this based on your needs)
    console.error("Error checking vaccine status:", error);
  }
};
