


import { useState,useEffect } from "react";
import { getVaccintStocks } from "./GetVaccination"


export const fetchVaccinesWithStock = () => {
   
    const [vaccines, setVaccines] = useState<{
        id: string;
        name: string;
        vac_id: string;
    }[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const stocks = await getVaccintStocks();
               
                if (Array.isArray(stocks)) {
                    const transformedData = stocks.map((stock: any) => ({
                        id: String(stock.vacStck_id),
                        name: stock.vaccinelist?.vac_name || 'Unknown Vaccine',
                        vac_id: String(stock.vac_id),
                    }));
                    setVaccines(transformedData);
                }
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
        options: vaccines,
        isLoading
    };
};





