import {api2} from "@/api/api";
import {useState,useEffect} from "react"
import {getFirstAid} from "@/pages/healthInventory/InventoryList/restful-api/firstAid/FirstAidGetAPI";  

export const getFirstAidStocksList = async () => {
    try {
      const res = await api2.get("inventory/firstaidinventorylist/");
      return res.data ;
    } catch (err) {
      console.error(err)
      return []
  }
  };


  

 
export const getFirstAidStocksTable= async (
  page: number, 
  pageSize: number, 
  search?: string, 
  filter?: string
): Promise<any> => {
  try {
    const res = await api2.get("inventory/first-aid-stock-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        filter: filter || "all"
      }
    });

    console.log("First Aid Stock API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("First Aid Stock API Error:", error);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
      filter_counts: {
        out_of_stock: 0,
        low_stock: 0,
        near_expiry: 0,
        expired: 0,
        total: 0
      }
    };
  }
};




export const getFirstAidList = () => {
  const [firstAid, setFirstAid] = useState<
    { id: string; name: string; category: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const firstAid = await getFirstAid();
      console.log("Raw Medicines Data:", firstAid); // Debugging log

      if (Array.isArray(firstAid)) {
        const transformedData = firstAid.map((firstAid: any) => ({
          id: firstAid.fa_id, // Force id to be a string
          name: firstAid.fa_name,
          category: firstAid.catlist, // Assuming category is available in the response
        }));
        console.log("Transformed Data:", transformedData); // Debugging log
        setFirstAid(transformedData); // No default option
      }
    };
    fetchData();
  }, []);

  return firstAid;
};
