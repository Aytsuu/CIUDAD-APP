import {api2} from "@/api/api";

export const  getCommodityStocks = async()=>{
    try{
      const res= await api2.get("inventory/commodityinventorylist/")
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


export const getCommodityStocksTable = async (
  page: number, 
  pageSize: number, 
  search?: string, 
  filter?: string
): Promise<any> => {
  try {
    const res = await api2.get("inventory/commodity-stock-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        filter: filter || "all"
      }
    });

    console.log("Commodity Stock API Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("Commodity Stock API Error:", error);
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