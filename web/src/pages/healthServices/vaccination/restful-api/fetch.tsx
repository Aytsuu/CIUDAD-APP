import { useState, useEffect } from "react";
import { api2 } from "@/api/api";
import {
  getVaccintStocks,
} from "./get";
import { useQuery } from "@tanstack/react-query";
import { toast

 } from "sonner";
 import { calculateAge } from "@/helpers/ageCalculator";





// Updated fetchVaccinesWithStock function with age filtering
export const fetchVaccinesWithStock = (dob?: string) => {
  return useQuery({
    queryKey: ["vaccineStocks", dob],
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

        // Apply age filtering if DOB is provided
        const filteredStocks = dob ? filterVaccinesByAge(availableStocks, dob) : availableStocks;

        return {
          default: filteredStocks,
          formatted: filteredStocks.map((stock: any) => ({
            id: `${stock.vacStck_id},${stock.vac_id},${
              stock.vaccinelist?.vac_name || "Unknown Vaccine"
            },${stock.inv_details?.expiry_date || "No Expiry"}`,
            name: (
              <div className="flex gap-3">
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




// In fetchVaccinesWithStockVacID function
export const fetchVaccinesWithStockVacID = (vacId: number) => {
  const [vaccines, setVaccines] = useState<{
    default: any[];
    formatted: {
      id: string;
      name: string | JSX.Element;
      vac_id: string;
      expiry: string | null;
      available: number;
      expiryDate: Date | null;
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

        // Filter by vac_id first
        const filteredByVacId = stocks.filter(stock => stock.vac_id === vacId);

        const availableStocks = filteredByVacId.filter((stock) => {
          const isExpired =
            stock.inv_details?.expiry_date &&
            new Date(stock.inv_details.expiry_date) < new Date();
          return stock.vacStck_qty_avail > 0 && !isExpired;
        });

        // Sort by expiry date (nearest first)
        const sortedStocks = [...availableStocks].sort((a, b) => {
          const aDate = a.inv_details?.expiry_date ? new Date(a.inv_details.expiry_date) : new Date(9999, 11, 31);
          const bDate = b.inv_details?.expiry_date ? new Date(b.inv_details.expiry_date) : new Date(9999, 11, 31);
          return aDate.getTime() - bDate.getTime();
        });

        const transformedData = {
          default: sortedStocks,
          formatted: sortedStocks.map((stock: any) => ({
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
            expiryDate: stock.inv_details?.expiry_date ? new Date(stock.inv_details.expiry_date) : null
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



export const filterVaccinesByAge = (vaccines: any[], dob: string) => {
  if (!dob) return vaccines; // Return all vaccines if no DOB provided
  
  try {
    const ageString = calculateAge(dob);
    const patientAge = parseAgeString(ageString);
    
    return vaccines.filter((vaccine) => {
      const ageGroup = vaccine.vaccinelist?.age_group;
      if (!ageGroup) return false; // Skip if no age group info
      
      const minAge = ageGroup.min_age;
      const maxAge = ageGroup.max_age;
      const timeUnit = ageGroup.time_unit;
      
      // Convert patient age to the vaccine's time unit
      let patientAgeInVaccineUnits = patientAge.value;
      
      if (patientAge.unit !== timeUnit) {
        if (timeUnit === 'years' && patientAge.unit === 'months') {
          patientAgeInVaccineUnits = patientAge.value / 12;
        } else if (timeUnit === 'months' && patientAge.unit === 'years') {
          patientAgeInVaccineUnits = patientAge.value * 12;
        } else if (timeUnit === 'weeks') {
          // Convert to weeks if needed
          if (patientAge.unit === 'months') {
            patientAgeInVaccineUnits = patientAge.value * 4.34524; // Approximate weeks in a month
          } else if (patientAge.unit === 'years') {
            patientAgeInVaccineUnits = patientAge.value * 52.1429; // Approximate weeks in a year
          }
        }
      }
      
      // Check if patient age falls within the vaccine's age range
      return patientAgeInVaccineUnits >= minAge && patientAgeInVaccineUnits <= maxAge;
    });
  } catch (error) {
    console.error("Error filtering vaccines by age:", error);
    return vaccines; // Return all vaccines if there's an error calculating age
  }
};

// Helper function to parse the age string into numeric value and unit
const parseAgeString = (ageString: string): { value: number; unit: string } => {
  const parts = ageString.split(' ');
  if (parts.length < 2) return { value: 0, unit: 'days' }; // Default for newborns
  
  const value = parseInt(parts[0]);
  const unit = parts[1].includes('year') ? 'years' : 
               parts[1].includes('month') ? 'months' : 
               parts[1].includes('day') ? 'days' : 
               'days';
  
  return { value, unit };
};
