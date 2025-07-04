import { useState, useEffect } from "react";
import { getMedicineStocks } from "./getAPI"; // Your API function

export interface MedicineStock {
  id: string; // Same as minv_id but using consistent naming
  med_id: string;
  name: string; // med_name
  dosage: string;
  form: string;
  expiry: string | null;
  available: number; // minv_qty_avail
  batch_number?: string; // Optional if 
  avail: number; // minv_qty
  qty: number; // minv_qty
    unit: string; // minv_qty_unit
}
export const fetchMedicinesWithStock = () => {
  const [medicines, setMedicines] = useState<MedicineStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const stocks = await getMedicineStocks();
        
        // Skip if no stocks or empty array
        if (!stocks || !Array.isArray(stocks) || stocks.length === 0) {
          console.log("No medicine stocks available.");
          setMedicines([]);
          return;
        }

        // Transform data with proper error handling
        const transformedData = stocks.map((stock: any) => ({
          id: String(stock.minv_id),
          avail: stock.minv_qty_avail || 0,
          unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : stock.minv_qty_unit || 'units',
          qty: stock.minv_qty || 0,
          med_id: stock.med_detail?.med_id || 'Unknown ID',
          name: stock.med_detail?.med_name || 'Unknown Medicine',
          dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`,
          form: stock.minv_form || '',
          expiry: stock.inv_detail?.expiry_date || null,
          available: stock.minv_qty_avail || 0,
          batch_number: stock.inv_detail?.batch_number // Optional field
        }));

        // Filter out medicines with zero available stock or expired
        const availableMedicines = transformedData.filter(med => {
          const isExpired = med.expiry ? new Date(med.expiry) < new Date() : false;
          return med.available > 0 && !isExpired;
        });

        setMedicines(availableMedicines);
      } catch (error) {
        console.error("Error fetching medicine stocks:", error);
        setMedicines([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return { 
    medicineStocksOptions: medicines, 
    isLoading 
  };
};