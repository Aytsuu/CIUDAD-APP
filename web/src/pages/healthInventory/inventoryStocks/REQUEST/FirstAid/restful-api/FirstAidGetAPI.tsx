import {api2} from "@/api/api";
import {getFirstAid} from "@/pages/healthInventory/InventoryList/restful-api/firstAid/FirstAidGetAPI";  
import { useQuery } from "@tanstack/react-query";
import { showErrorToast } from "@/components/ui/toast";



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


export const FetchFirstAid = () => {
  return useQuery({
    queryKey: ["firstAid"],
    queryFn: async () => {
      try {
        const firstAid = await getFirstAid();

        if (!firstAid || !Array.isArray(firstAid)) {
          return {
            default: [],
            formatted: []
          };
        }

        return {
          default: firstAid,
          formatted: firstAid.map((fa: any) => ({
            id:`${ String(fa.fa_id)},${fa.fa_name}`,
            name: `${fa.fa_name}`,
            rawName: fa.fa_name,
            category: fa.catlist || "No Category"
          }))
        };
      } catch (error) {
        showErrorToast("Failed to fetch first aid data");
        throw error;
      }
    }
  });
};