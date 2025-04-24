
import { useState,useEffect } from "react";
import { getVaccintStocks,getSpecificVaccintStocks } from "./GetVaccination"




export const fetchVaccinesWithStock = () => {
    const [vaccines, setVaccines] = useState<{
        id: string;
        name: string;
        vac_id: string;
        expiry: string | null;
    }[]>([]);
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

                // Filter out vaccines with zero available stock (if needed)
                const availableStocks = stocks.filter(
                    (stock) => stock.vacStck_qty_avail > 0
                );

                // Transform data only if stocks exist
                const transformedData = availableStocks.map((stock: any) => ({
                    id: String(stock.vacStck_id),
                    name: stock.vaccinelist?.vac_name || 'Unknown Vaccine',
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
        isLoading 
    };
};
export const fetchSpecificVaccinesWithStock = (vacStck_id: number) => {
    const [vaccines, setVaccines] = useState<{
        id: string;
        name: string;
        vac_id: string;
        expiry: string | null;
        available: boolean;
    }[]>([{  // Default loading state
        id: "loading",
        name: "Loading vaccine data...",
        vac_id: "loading",
        expiry: null,
        available: false
    }]);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const specificStock = await getSpecificVaccintStocks(vacStck_id);
                
                if (!specificStock) {
                    setError("Vaccine stock not found");
                    setVaccines([{
                        id: "not-found",
                        name: "Vaccine not found",
                        vac_id: "not-found",
                        expiry: null,
                        available: false
                    }]);
                    return;
                }

                const isAvailable = specificStock.vacStck_qty_avail > 0;
                const expiryDate = specificStock.inv_details?.expiry_date;
                const isExpired = expiryDate && new Date(expiryDate) < new Date();

                setVaccines([{
                    id: specificStock.vacStck_id.toString(),
                    name: `${specificStock.vaccinelist?.vac_name || 'Unknown Vaccine'}${isExpired ? ' (Expired)' : ''}`,
                    vac_id: specificStock.vac_id.toString(),
                    expiry: expiryDate || null,
                    available: isAvailable && !isExpired
                }]);

            } catch (error) {
                console.error("Error fetching vaccine stocks:", error);
                setError("Failed to fetch vaccine data");
                setVaccines([{
                    id: "error",
                    name: "Error loading vaccine",
                    vac_id: "error",
                    expiry: null,
                    available: false
                }]);
            }
        };

        fetchData();
    }, [vacStck_id]);

    // Sort by expiry date (soonest first)
    const sortedVaccines = [...vaccines].sort((a, b) => {
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        return new Date(a.expiry).getTime() - new Date(b.expiry).getTime();
    });

    return { 
        vaccineStocksOptions: sortedVaccines, 
        error,
        hasAvailableStock: sortedVaccines.some(v => v.available && v.id !== "loading")
    };
};