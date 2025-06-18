import { useState, useEffect } from "react";
import { getVaccineStocks } from "./VaccineGetAPI"; // adjust path

// Modify your useBatchNumbers to fetch imz_id as well
export const useBatchNumbers = () => {
    const [batchNumbers, setBatchNumbers] = useState<
      {batchNumber: string; }[]
    >([]);
  
    useEffect(() => {
      const fetchBatches = async () => {
        const stocks = await getVaccineStocks();
  
        if (Array.isArray(stocks)) {
          const batches = stocks.map((stock: any) => ({
            batchNumber: stock.batch_number,
          }));
          setBatchNumbers(batches);
        }
      };
  
      fetchBatches();
    }, []);
  
    return batchNumbers;
  };
  