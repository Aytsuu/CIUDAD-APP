// REQUEST/Archive/ArchivepatchQueries.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api2 } from "@/api/api";
import { showErrorToast, showSuccessToast } from '@/components/ui/toast';



export const useArchiveCommodityStocks= () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inv_id, isExpired, hasAvailableStock }: { 
      inv_id: string; 
      isExpired: boolean; 
      hasAvailableStock: boolean; 
    }) => {
      try {
        const response = await api2.patch(`inventory/archive/commoditystocks/${inv_id}/`, {
          is_expired: isExpired,
          has_available_stock: hasAvailableStock
        });
        return response.data;
      } catch (error) {
        console.error("Error archiving commodity inventory:", error);
        throw error;
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodityStocks"] });
      showSuccessToast  ("Successfully archived the item.");
    },
    
    onError: (error: Error) => {
      console.error("Error archiving commodity inventory:", error.message);
      showErrorToast("Failed to archive the item.")
    }
  });
};





export const useArchiveAntigenStocks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inv_id, isExpired, hasAvailableStock }: { 
      inv_id: string; 
      isExpired: boolean; 
      hasAvailableStock: boolean; 
    }) => {
      try {
        const response = await api2.patch(`inventory/archive/antigen/${inv_id}/`, {
          is_expired: isExpired,
          has_available_stock: hasAvailableStock
        });
        return response.data;
      } catch (error) {
        console.error("Error archiving commodity inventory:", error);
        throw error;
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commodityStocks"] });
    },
    
    onError: (error: Error) => {
      console.error("Error archiving commodity inventory:", error.message);
    }
  });
};




export const useArchiveFirstAidInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ inv_id, isExpired, hasAvailableStock }: { 
      inv_id: string; 
      isExpired: boolean; 
      hasAvailableStock: boolean; 
    }) => {
      try {
        const response = await api2.patch(`inventory/archive/firstaidstocks/${inv_id}/`, {
          is_expired: isExpired,
          has_available_stock: hasAvailableStock
        });
        return response.data;
      } catch (error) {
        console.error("Error archiving first aid inventory:", error);
        throw error;
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAidStocks"] });
    },
    
    onError: (error: Error) => {
      console.error("Error archiving first aid inventory:", error.message);
    }
  });
};



export const useArchiveMedicineStocks = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      inv_id, 
      isExpired, 
      hasAvailableStock 
    }: { 
      inv_id: string; 
      isExpired: boolean; 
      hasAvailableStock: boolean; 
    }) => {
      try {
        const response = await api2.patch(`inventory/archive/medicinestocks/${inv_id}/`, {
          is_expired: isExpired,
          has_available_stock: hasAvailableStock
        });
        return response.data;
      } catch (error) {
        console.error("Error archiving medicine inventory:", error);
        throw error;
      }
    },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
    },
    
    onError: (error: Error) => {
      console.error("Error archiving medicine inventory:", error.message);
    }
  });
};