import { getMedicineStocks } from "./getAPI"; // Your API function
import { useQuery } from '@tanstack/react-query';


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

// hooks/useMedicineStocks.ts


export const fetchMedicinesWithStock = () => {
  return useQuery({
    queryKey: ['medicineStocks'],
    queryFn: async () => {
      const stocks = await getMedicineStocks();
      
      if (!stocks || !Array.isArray(stocks)) {
        return [];
      }

      const transformedData = stocks.map((stock: any) => ({
        id: String(stock.minv_id),
        avail: stock.minv_qty_avail || 0,
        unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : stock.minv_qty_unit || 'units',
        qty: stock.minv_qty || 0,
        med_id: stock.med_detail?.med_id || 'Unknown ID',
        name: stock.med_detail?.med_name || 'Unknown Medicine',
        dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`.trim(),
        form: stock.minv_form || '',
        expiry: stock.inv_detail?.expiry_date || null,
        available: stock.minv_qty_avail || 0,
        batch_number: stock.inv_detail?.batch_number
      }));

      return transformedData.filter(med => {
        const isExpired = med.expiry ? new Date(med.expiry) < new Date() : false;
        return med.available > 0 && !isExpired;
      });
    },
    staleTime: 0, // Disable caching for real-time updates
    refetchInterval: 1000 * 5, // Refetch every 5 seconds for real-time inventory updates
  });
};