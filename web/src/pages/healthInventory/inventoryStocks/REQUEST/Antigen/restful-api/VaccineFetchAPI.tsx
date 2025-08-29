import { useState, useEffect } from "react";
import { getVaccineStocks } from "./VaccineGetAPI"; // adjust path
import { showErrorToast } from "@/components/ui/toast";

export const useBatchNumbers = () => {
  const [batchNumbers, setBatchNumbers] = useState<{ batchNumber: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const stocks = await getVaccineStocks();

        if (Array.isArray(stocks)) {
          const batches = stocks.map((stock: any) => ({
            batchNumber: stock.batch_number || ""
          }));
          setBatchNumbers(batches);
        } else {
          showErrorToast("Failed to fetch batch numbers");
          setBatchNumbers([]);
        }
      } catch (error) {
        showErrorToast("Error fetching batch numbers");
        setBatchNumbers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  return {
    batchNumbers,
    isLoading
  };
};
