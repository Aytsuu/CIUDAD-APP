import { getMedicineStocks } from "./getAPI"; // Your API function
import { useQuery} from '@tanstack/react-query';
import { api2 } from "@/api/api";
  // export const fetchMedicinesWithStock = (is_temp?:boolean) => {
  //   return useQuery({
  //     queryKey: ['medicineStocks'],
  //     queryFn: async () => {
  //       const stocks = await getMedicineStocks();
        
  //       if (!stocks || !Array.isArray(stocks)) {
  //         return [];
  //       }

  //       let transformedData: any[] = [];
  //     if(is_temp){
  //       console.log("is temp true");
  //       transformedData = stocks.map((stock: any) => ({
  //       id: String(stock.minv_id),
  //       avail: (Number(stock.minv_qty_avail )|| 0) - (Number(stock.temporary_deduction) || 0),
  //       unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : (stock.minv_qty_unit || 'units'),
  //       qty: stock.minv_qty || 0,
  //       med_id: stock.med_detail?.med_id || 'Unknown ID',
  //       inv_id: stock.inv_id || 'Unknown Inventory ID',
  //       name: stock.med_detail?.med_name || 'Unknown Medicine',
  //       med_type: stock.med_detail?.med_type || 'General',
  //       dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`.trim(),
  //       form: stock.minv_form || '',
  //       expiry: stock.inv_detail?.expiry_date || null,
  //           }));
  //           console.log(transformedData);
  //     }
  //     else{
  //       transformedData = stocks.map((stock: any) => ({
  //         id: String(stock.minv_id),
  //         avail: stock.minv_qty_avail || 0,
  //         unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : stock.minv_qty_unit || 'units',
  //         qty: stock.minv_qty || 0,
  //         med_id: stock.med_detail?.med_id || 'Unknown ID',
  //         inv_id: stock.inv_id || 'Unknown Inventory ID',
  //         name: stock.med_detail?.med_name || 'Unknown Medicine',
  //         med_type: stock.med_detail?.med_type || 'General',
  //         dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`.trim(),
  //         form: stock.minv_form || '',
  //         expiry: stock.inv_detail?.expiry_date || null,
  //         available: stock.minv_qty_avail || 0,
  //       }));
  //     }

  //       return transformedData.filter(med => {
  //         const isExpired = med.expiry ? new Date(med.expiry) < new Date() : false;
  //         return med.avail  > 0 && !isExpired;
  //       });
  //     },
  //     staleTime: 0, // Disable caching for real-time updates
  //     refetchInterval: 1000 * 5, // Refetch every 5 seconds for real-time inventory updates
  //   });
  // };


  // fetchAPI.ts
export interface MedicineSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  is_temp?: boolean;
}

export const fetchMedicinesWithStock = (params: MedicineSearchParams = {}) => {
  const { page = 1, pageSize = 10, search = '', is_temp = false } = params;
  
  return useQuery({
    queryKey: ['medicineStocks', page, pageSize, search, is_temp],
    queryFn: async () => {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('page_size', pageSize.toString());
      if (search) queryParams.append('search', search);
      
      // Use your existing API endpoint with query parameters
      const response = await api2.get(`/inventory/medicineinventorylist/?${queryParams.toString()}`);
      
      if (!response) {
        throw new Error('Failed to fetch medicines');
      }
      
      const data = response.data;
      
      // Extract pagination info from response
      const paginationInfo = {
        currentPage: page,
        totalPages: Math.ceil(data.count / pageSize),
        totalItems: data.count,
        hasNext: !!data.next,
        hasPrev: !!data.previous,
      };
      
      const stocks = data.results || [];
      
      if (!stocks || !Array.isArray(stocks)) {
        return { medicines: [], pagination: paginationInfo };
      }

      let transformedData: any[] = [];
      
      if (is_temp) {
        transformedData = stocks.map((stock: any) => ({
          id: String(stock.minv_id),
          avail: (Number(stock.minv_qty_avail) || 0) - (Number(stock.temporary_deduction) || 0),
          unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : (stock.minv_qty_unit || 'units'),
          qty: stock.minv_qty || 0,
          med_id: stock.med_detail?.med_id || 'Unknown ID',
          inv_id: stock.inv_id || 'Unknown Inventory ID',
          name: stock.med_detail?.med_name || 'Unknown Medicine',
          med_type: stock.med_detail?.med_type || 'General',
          dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`.trim(),
          form: stock.minv_form || '',
          expiry: stock.inv_detail?.expiry_date || null,
        }));
      } else {
        transformedData = stocks.map((stock: any) => ({
          id: String(stock.minv_id),
          avail: stock.minv_qty_avail || 0,
          unit: stock.minv_qty_unit === 'boxes' ? 'pcs' : stock.minv_qty_unit || 'units',
          qty: stock.minv_qty || 0,
          med_id: stock.med_detail?.med_id || 'Unknown ID',
          inv_id: stock.inv_id || 'Unknown Inventory ID',
          name: stock.med_detail?.med_name || 'Unknown Medicine',
          med_type: stock.med_detail?.med_type || 'General',
          dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ''}`.trim(),
          form: stock.minv_form || '',
          expiry: stock.inv_detail?.expiry_date || null,
        }));
      }

      const filteredMedicines = transformedData.filter(med => {
        const isExpired = med.expiry ? new Date(med.expiry) < new Date() : false;
        return med.avail > 0 && !isExpired;
      });

      return { 
        medicines: filteredMedicines, 
        pagination: paginationInfo 
      };
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: params !== undefined, // Make the query optional
  });
};