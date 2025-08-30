

  import {api2} from "@/api/api";
  import { useState, useEffect } from "react";
  import { showErrorToast,showSuccessToast } from "@/components/ui/toast";

  export const  getImmunizationStocks = async()=>{
      try{
        const res= await api2.get("inventory/immunization_stock/")
        if(res.status==200){
          return res.data;
        }
        console.error(res.status)
        return[]
      }catch(err){
        console.log(err)
        return[]
      }
    }

  
  export const getSupplies = async () => {
    try {
      const res = await api2.get("inventory/imz_supplieslist-view/");
      if (res.status === 200) {
        // Transform the data to match your SelectLayout options format
        return res.data.map((supplies: any) => ({
          id: supplies.imz_id.toString(),
          name: supplies.imz_name,
          // Include other fields you might need
          type: supplies.vac_type_choices,
          categoryId: supplies.vaccat_id
        }));
      }
      console.error(res.status);
      return [];
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  // Updated useBatchNumbers hook
export const useBatchNumbers = () => {
  const [batchNumbers, setBatchNumbers] = useState<
    { batchNumber: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const stocks = await getImmunizationStocks();
        if (Array.isArray(stocks)) {
          const batches = stocks.map((stock: any) => ({
            batchNumber: stock.batch_number || "",
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