
import { useState,useEffect } from "react";
import { getVaccintStocks } from "./GetVaccination"


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