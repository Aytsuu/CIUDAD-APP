// import { getMedicineStocks } from "./getAPI"; // Your API function
import { useQuery } from "@tanstack/react-query";
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
  includeZeroAvail?: boolean; // when true, include medicines with 0 final availability (useful for showing disabled/out-of-stock items)
}

export const fetchMedicinesWithStock = (params: MedicineSearchParams = {}) => {
  const { page = 1, pageSize = 10, search = "", is_temp = false, includeZeroAvail = false } = params;

  return useQuery({
    queryKey: ["medicineStocks", page, pageSize, search, is_temp, includeZeroAvail],
    queryFn: async () => {
      console.log("=== fetchMedicinesWithStock called ===");
      console.log("Parameters:", { page, pageSize, search, is_temp });

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("page_size", pageSize.toString());
      if (search) queryParams.append("search", search);

      // Fetch from API
      const response = await api2.get(`/inventory/medicineinventorylist/?${queryParams.toString()}`);

      if (!response) {
        throw new Error("Failed to fetch medicines");
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

      console.log(`Total stocks from API: ${stocks.length}`);
      if (stocks.length > 0) {
        console.log("Sample stock structure:", JSON.stringify(stocks[0], null, 2));
      }

      let transformedData: any[] = [];

      if (is_temp) {
        console.log("=== is_temp is TRUE - Applying temporary deductions ===");

        transformedData = stocks.map((stock: any) => {
          const originalAvail = Number(stock.minv_qty_avail) || 0;
          const tempDeduction = Number(stock.temporary_deduction) || 0;
          const finalAvail = originalAvail - tempDeduction;

          // Log each stock's calculation
          if (tempDeduction > 0) {
            console.log(`Stock ${stock.minv_id} (${stock.med_detail?.med_name}):`, {
              original: originalAvail,
              deduction: tempDeduction,
              final: finalAvail,
            });
          }

          return {
            id: String(stock.minv_id),
            avail: finalAvail,
            unit: stock.minv_qty_unit === "boxes" ? "pcs" : stock.minv_qty_unit || "units",
            qty: stock.minv_qty || 0,
            med_id: stock.med_detail?.med_id || "Unknown ID",
            inv_id: stock.inv_id || "Unknown Inventory ID",
            name: stock.med_detail?.med_name || "Unknown Medicine",
            med_type: stock.med_detail?.med_type || "General",
            dosage: `${stock.med_detail?.med_dsg || 0} ${stock.med_detail?.med_dsg_unit || ""}`.trim(),
            form: stock.med_detail?.med_form || "",
            expiry: stock.inv_detail?.expiry_date || null,
            // Include raw values for debugging
            _debug: {
              originalAvail,
              tempDeduction,
              finalAvail,
            },
          };
        });

        console.log(`Transformed ${transformedData.length} stocks with temp deductions`);
      } else {
        console.log("=== is_temp is FALSE - Using raw availability ===");

        transformedData = stocks.map((stock: any) => ({
          id: String(stock.minv_id),
          avail: stock.minv_qty_avail || 0,
          unit: stock.minv_qty_unit === "boxes" ? "pcs" : stock.minv_qty_unit || "units",
          qty: stock.minv_qty || 0,
          med_id: stock.med_detail?.med_id || "Unknown ID",
          inv_id: stock.inv_id || "Unknown Inventory ID",
          name: stock.med_detail?.med_name || "Unknown Medicine",
          med_type: stock.med_detail?.med_type || "General",
          dosage: `${stock.minv_dsg || 0} ${stock.minv_dsg_unit || ""}`.trim(),
          form: stock.minv_form || "",
          expiry: stock.inv_detail?.expiry_date || null,
        }));

        console.log(`Transformed ${transformedData.length} stocks without temp deductions`);
      }

      // Filter logic: always remove expired; optionally keep zero availability
      const filteredMedicines = transformedData.filter((med) => {
        const isExpired = med.expiry ? new Date(med.expiry) < new Date() : false;
        if (isExpired) {
          console.log(`Filtered out (expired): ${med.name} exp ${med.expiry}`);
          return false;
        }
        if (!includeZeroAvail && med.avail <= 0) {
          console.log(`Filtered out (no stock): ${med.name} avail ${med.avail}`);
          return false;
        }
        return true;
      });

      console.log(`Final filtered medicines: ${filteredMedicines.length}`);
      console.log("=== fetchMedicinesWithStock completed ===\n");

      // If including zero availability, tag them so UI can disable selection
      const finalMedicines = filteredMedicines.map(m => {
        if (m.avail <= 0) {
          return { ...m, out_of_stock: true };
        }
        return m;
      });

      return {
        medicines: finalMedicines,
        pagination: paginationInfo,
      };
    },
    staleTime: 1000 * 30, // 30 seconds
    enabled: params !== undefined,
  });
};
