import { api2 } from "@/api/api";

// API function to get medicine transactions
export const getMedicineTransactions = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const res = await api2.get("inventory/medicine-transactions/table/", {
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

// API function to get commodity transactions
export const getCommodityTransactions = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const res = await api2.get("inventory/commodity-transactions/table/", {
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

// API function to get first aid transactions
export const getFirstAidTransactions = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const res = await api2.get("inventory/firstaid-transactions/table/", {
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

// API function to get antigen transactions
export const getAntigenTransactions = async (page: number, pageSize: number, search?: string): Promise<any> => {
  try {
    const res = await api2.get("inventory/antigen-transactions/table/", {
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
