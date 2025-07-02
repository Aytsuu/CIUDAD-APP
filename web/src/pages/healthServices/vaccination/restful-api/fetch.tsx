import { useState, useEffect } from "react";
import { api2 } from "@/api/api";
import { getVaccintStocks, getUnvaccinatedResidents,getVaccinationRecords ,getVaccinationRecordById} from "./get";
import { useQuery } from "@tanstack/react-query";
import { VaccinationRecord } from "../tables/columns/types";



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
    staleTime: 0,
  });
};

export const useUnvaccinatedResidents = () => {
  return useQuery({
    queryKey: ["unvaccinatedResidents"],
    queryFn: getUnvaccinatedResidents,
    refetchOnMount: true,
    staleTime: 0,
  });
};

export const fetchVaccinesWithStock = () => {
  const [vaccines, setVaccines] = useState<
    {
      id: string;
      name: string;
      vac_id: string;
      expiry: string | null;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const stocks = await getVaccintStocks();

        // Skip if no stocks or empty array
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
          console.log("No vaccine stocks available.");
          setVaccines([]);
          return; // Exit early
        }

        // Filter out vaccines with zero available stock or expired
        const availableStocks = stocks.filter((stock) => {
          const isExpired =
            stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });

        // Transform data only if stocks exist
        const transformedData = availableStocks.map((stock: any) => ({
          id: `${stock.vacStck_id},${stock.vac_id},${stock.vaccinelist?.vac_name || "Unknown Vaccine"},${stock.inv_details?.expiry_date || "No Expiry"}`,
          name: stock.vaccinelist?.vac_name || "Unknown Vaccine",
          vac_id: String(stock.vac_id),
          expiry: stock.inv_details?.expiry_date || null,
        }));

        setVaccines(transformedData);
      } catch (error) {
        console.error("Error fetching vaccine stocks:", error);
        setVaccines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    vaccineStocksOptions: vaccines,
    isLoading,
  };
};


export const fetchVaccinesWithStockVacID = (vac_id: number) => {
  const [vaccines, setVaccines] = useState<
    {
      id: string;
      name: string;
      vac_id: string;
      expiryDate: string | null;
      available: boolean;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching vaccine stock for vac_id:", vac_id); // Debugging line
        const stocks = await getVaccintStocks();

        // Skip if no stocks or empty array
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
          console.log("No vaccine stocks available.");
          setVaccines([]);
          return;
        }

        // Transform and filter data for the specific vac_id
        const transformedData = stocks
          .filter(
            (stock: any) =>
              stock.vac_id === vac_id && // Match exact vac_id
              !stock.inv_isArchive && // Filter out archived vaccines
              !(stock.inv_details?.expiry_date && new Date(stock.inv_details.expiry_date) < new Date()) // Filter out expired vaccines
          )
          .map((stock: any) => {
            const isAvailable = stock.vacStck_qty_avail > 0;

            return {
              id: String(stock.vacStck_id),
              name: stock.vaccinelist?.vac_name || "Unknown Vaccine",
              vac_id: String(stock.vac_id),
              expiryDate: stock.inv_details?.expiry_date || null,
              available: isAvailable,
            };
          })
          .filter((vaccine) => vaccine.available); // Filter out unavailable vaccines

        // Validate if the provided vac_id exists
        if (transformedData.length === 0) {
          console.warn(
            `Vaccine with vac_id ${vac_id} not found, archived, or unavailable.`
          );
        }

        setVaccines(transformedData);
      } catch (error) {
        console.error("Error fetching vaccine stocks:", error);
        setVaccines([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (vac_id) {
      fetchData();
    } else {
      console.warn("No vac_id provided.");
      setVaccines([]);
      setIsLoading(false);
    }
  }, [vac_id]); // Re-fetch if vac_id changes

  return {
    vaccineStocksOptions: vaccines,
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
