import { useState, useEffect } from "react";
import { api2 } from "@/api/api";
import { getVaccintStocks, getVaccinationHistory } from "./GetVaccination";
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

// export const checkVachistory =() =>{

//    vachistResponse = await getVaccinationHistory()

// }

// export const fetchSpecificVaccinesWithStock = (vacStck_id: number) => {
//     const [vaccines, setVaccines] = useState<{
//       id: string;
//       name: string;
//       vac_id: string;
//       expiry: string | null;
//       available: boolean;
//     }[]>([{  // Default loading state
//       id: "loading",
//       name: "Loading vaccine data...",
//       vac_id: "loading",
//       expiry: null,
//       available: false
//     }]);

//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//       const fetchData = async () => {
//         try {
//           const specificStock = await getSpecificVaccintStocks(vacStck_id); // Fixed typo

//           if (!specificStock) {
//             setError("No vaccine available");
//             setVaccines([{
//               id: "no-vaccine",
//               name: "No vaccine available",
//               vac_id: "not-found",
//               expiry: null,
//               available: false
//             }]);
//             return;
//           }

//           // Handle archived vaccine
//           if (specificStock.inv_details?.is_Archived) {
//             setError("No vaccine available");
//             setVaccines([{
//               id: "no-vaccine",
//               name: "No vaccine available",
//               vac_id: specificStock.vac_id.toString(),
//               expiry: null,
//               available: false
//             }]);
//             return;
//           }

//           const isAvailable = specificStock.vacStck_qty_avail > 0;
//           const expiryDate = specificStock.inv_details?.expiry_date;
//           const isExpired = expiryDate && new Date(expiryDate) < new Date();

//           let displayName = specificStock.vaccinelist?.vac_name || "Unknown Vaccine";
//           if (!isAvailable) {
//             displayName += " (Out of Stock)";
//           }
//           if (isExpired) {
//             displayName += " (Expired)";
//           }

//           setVaccines([{
//             id: specificStock.vacStck_id.toString(),
//             name: displayName,
//             vac_id: specificStock.vac_id.toString(),
//             expiry: expiryDate || null,
//             available: isAvailable && !isExpired
//           }]);

//         } catch (error) {
//           console.error("Error fetching vaccine stocks:", error);
//           setError("No vaccine available");
//           setVaccines([{
//             id: "no-vaccine",
//             name: "No vaccine available",
//             vac_id: "error",
//             expiry: null,
//             available: false
//           }]);
//         }
//       };

//       fetchData();
//     }, [vacStck_id]);

//     // Sort by expiry date (soonest first)
//     const sortedVaccines = [...vaccines].sort((a, b) => {
//       if (!a.expiry) return 1;
//       if (!b.expiry) return -1;
//       return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
//     });

//     return {
//       vaccineStocksOptions: sortedVaccines,
//       error,
//       hasAvailableStock: sortedVaccines.some(v => v.available && v.id !== "loading")
//     };
//   };

export const fetchVaccinesWithStockVacID = (vac_id: number) => {
  const [vaccines, setVaccines] = useState<
    {
      id: string;
      name: string;
      vac_id: string;
      expiryDate: string | null;
      available: boolean;
      isExpired: boolean;
      isOutOfStock: boolean;
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
              !stock.inv_isArchive // Filter out archived vaccines
          )
          .map((stock: any) => {
            const isExpired =
              stock.inv_details?.expiry_date &&
              new Date(stock.inv_details.expiry_date) < new Date();
            const isOutOfStock = stock.vacStck_qty_avail <= 0;
            const isAvailable = !isExpired && !isOutOfStock;

            return {
              id: String(stock.vacStck_id),
              name: stock.vaccinelist?.vac_name || "Unknown Vaccine",
              vac_id: String(stock.vac_id),
              expiryDate: stock.inv_details?.expiry_date || null,
              available: isAvailable,
              isExpired,
              isOutOfStock,
            };
          });

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



export const checkVaccineStatus = async (pat_id:string, vac_id:number) => {
  try {
    const response = await api2.get(
      `/vaccination/check-vaccine/${pat_id}/${vac_id}`
    );
    return response.data; // Return the data from the response
  } catch (error:unknown) {
    // Handle errors (you can customize this based on your needs)
    console.error('Error checking vaccine status:', error);
  }
};