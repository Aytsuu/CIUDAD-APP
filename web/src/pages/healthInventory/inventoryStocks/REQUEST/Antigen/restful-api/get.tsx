import { api2 } from "@/api/api";
import { useState, useEffect } from "react";
import { showErrorToast } from "@/components/ui/toast";

// Update the getCombinedStock function
export const getCombinedStock = async (page: number, pageSize: number, search?: string, filter?: any): Promise<any> => {
  try {
    const res = await api2.get("inventory/combined-stock-table/", {
      params: { page, page_size: pageSize, search: search?.trim() || undefined, filter: filter || "all" }
    });

    return res.data;
  } catch (error) {
    console.error("Combined Stock API Error:", error);
    return [];
  }
};

export const getImmunizationStocks = async () => {
  try {
    const res = await api2.get("inventory/immunization_stock/");
    if (res.status == 200) {
      return res.data;
    }
    console.error(res.status);
    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getSupplies = async () => {
  try {
    const res = await api2.get("inventory/imz_supplieslist-table/");
    if (res.status === 200) {
      // Transform the data to match your SelectLayout options format
      // Adjusted to match the actual API response structure
      return res.data.results.map((supplies: any) => ({
        id: supplies.imz_id.toString(),
        name: supplies.imz_name,
        category: supplies.category
      }));
    }
    console.error(res.status);
    return [];
  } catch (err) {
    console.log(err);
    return [];
  }
};


export const getVaccineStocks = async () => {
  try {
    const res = await api2.get("inventory/vaccine_stocks/");
    if (res.status !== 200) {
      console.error("Failed to fetch vaccine stocks:", res.status);
      return [];
    }
    return res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
};

export const getVaccine = async () => {
  try {
    const res = await api2.get("inventory/vac_list/");
    if (res.status !== 200) {
      console.error("Failed to fetch vaccines:", res.status);
      return [];
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching vaccines:", err);
    return [];
  }
};



export const createVaccineStock = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("inventory/vaccine_stock-create/", data);
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const AntigenTransaction = async (
  vacStck_id: number,
  string_qty: string,
  action: string,
  staffId: string
) => {
  try {
    const res = await api2.post("inventory/antigens_stocks/transaction/", {
      antt_qty: string_qty,
      antt_action: action,
      vacStck_id: vacStck_id,
      staff: staffId,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};



export const useImzBatchNumber = () => {
  const [batchNumbers, setBatchNumbers] = useState<{ batchNumber: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const stocks = await getImmunizationStocks();
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



export const useVacBatchNumber = () => {
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
