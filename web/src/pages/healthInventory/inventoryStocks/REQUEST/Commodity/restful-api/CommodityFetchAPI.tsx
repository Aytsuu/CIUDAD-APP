
import { useState,useEffect } from "react";
import { getCommodity } from "@/pages/healthInventory/InventoryList/restful-api/commodity/CommodityFetchAPI";

export const fetchCommodity = () => {
  const [commdity, setCommodity] = useState<{ id: string; name: string,category:string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const commodity = await getCommodity();
      console.log("Raw Medicines Data:", commodity); // Debugging log

      if (Array.isArray(commdity)) {
        const transformedData = commodity.map((commodity: any) => ({
          id: String(commodity.com_id), // Force id to be a string
          name: commodity.com_name,
          user_type:commodity.user_type,
        }));
        console.log("Transformed Data:", transformedData); // Debugging log
        setCommodity(transformedData); // No default option
      }
    };
    fetchData();
  }, []);

  return commdity;
};