import { useState, useEffect } from "react";
import { getFirstaidStocks } from "./getAPI"; // Your API function

export interface FirstaidStock {
  id: string; // Same as minv_id but using consistent naming
  fa_id: string;
  name: string; // med_name
  // dosage: string;
  // form: string;
  expiry: string | null;
  available: number; // minv_qty_avail
  // batch_number?: string; // Optional if 
  avail: number; // minv_qty
  qty: number; // minv_qty
    unit: string; // minv_qty_unit
}

export const fetchFirstaidsWithStock = () => {
  const [Firstaids, setFirstaids] = useState<FirstaidStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const stocks = await getFirstaidStocks();
        
        // Skip if no stocks or empty array
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
          console.log("No Firstaid stocks available.");
          setFirstaids([]);
          return;
        }

        // Transform data with proper error handling
        const transformedData = stocks.map((stock: any) => ({
          id: String(stock.finv_id),
          avail: stock.finv_qty_avail || 0,
          unit: stock.finv_qty_unit === 'boxes' ? 'pcs' : stock.finv_qty_unit || 'units',
          qty: stock.finv_qty || 0,
          fa_id: stock.fa_detail?.fa_id || 'Unknown ID',
          name: stock.fa_detail?.fa_name || 'Unknown Firstaid',
          // dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`,
          // form: stock.minv_form || '',
          expiry: stock.inv_detail?.expiry_date || null,
          available: stock.finv_qty_avail || 0,
          // batch_number: stock.inv_detail?.batch_number // Optional field
        }));

        // Filter out Firstaids with zero available stock
        const availableFirstaids = transformedData.filter(
          fa => fa.available > 0
        );

        setFirstaids(availableFirstaids);
      } catch (error) {
        console.error("Error fetching Firstaid stocks:", error);
        setFirstaids([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    firstAidStocksOptions: Firstaids, 
    isLoading 
  };
};