import { api2 } from "@/api/api";


// Updated getCommodityStocks function with pagination and filtering
export const getAntigenStocks = async (
  page: number, 
  pageSize: number, 
  search?: string,
  filter?: any
): Promise<any> => {
  try {
    const res = await api2.get("inventory/archive/antigenstocks-table/", {
      params: {
        page,
        page_size: pageSize,
        search: search?.trim() || undefined,
        filter: filter || undefined
      }
    });
    
    if (res.status === 200) {
      return res.data;
    }
    console.error(res.status);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  } catch (err) {
    console.log(err);
    return {
      results: [],
      count: 0,
      next: null,
      previous: null
    };
  }
};




  // API function to get archived commodity stocks
  export const getArchivedCommodityStocks = async (
    page: number, 
    pageSize: number, 
    search?: string,
  ): Promise<any> => {
    try {
      const res = await api2.get("inventory/archive/commoditystocks-table/", {
        params: {
          page,
          page_size: pageSize,
          search: search?.trim() || undefined
        }
      });
      
      if (res.status === 200) {
        return res.data;
      }
      console.error(res.status);
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    } catch (err) {
      console.log(err);
      return {
        results: [],
        count: 0,

        next: null,
        previous: null
      };
    }
  };





  // API function to get archived medicine stocks
  export const getArchivedMedicineStocks = async (
    page: number, 
    pageSize: number, 
    search?: string,
  ): Promise<any> => {
    try {
      const res = await api2.get("inventory/archive/medicinestocks-table/", {
        params: {
          page,
          page_size: pageSize,
          search: search?.trim() || undefined
        }
      });
      
      if (res.status === 200) {
        return res.data;
      }
      console.error(res.status);
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    } catch (err) {
      console.log(err);
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
  };

export const getFirstAidInventoryList = async () => {
  try {
    const res = await api2.get("inventory/archive/first-aid-inventory/");
    return res.data || [];
  } catch (err) {
    console.error(err);
  }
};




  // API function to get archived first aid stocks
  export const getArchivedFirstAidStocks = async (
    page: number, 
    pageSize: number, 
    search?: string,
  ): Promise<any> => {
    try {
      const res = await api2.get("inventory/archive/firstaidstocks-table/", {
        params: {
          page,
          page_size: pageSize,
          search: search?.trim() || undefined
        }
      });
      
      if (res.status === 200) {
        return res.data;
      }
      console.error(res.status);
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    } catch (err) {
      console.log(err);
      return {
        results: [],
        count: 0,
        next: null,
        previous: null
      };
    }
  };