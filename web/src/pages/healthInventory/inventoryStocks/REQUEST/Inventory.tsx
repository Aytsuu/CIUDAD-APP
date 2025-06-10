import { api } from "@/pages/api/api";

// export const addInventory = async (inventoryData: any) => {
//   try {
//     const res = await api.post("inventory/inventorylist/", inventoryData);
//     return res.data;
//   } catch (err: any) {
//     console.log("Error response:", err.response?.data || err.message);
//     throw err;
//   }
// };


// 2. Wrapped function version (still fully combined)
export const addInventory = async (data:any, inv_type: string) => {
  try {
    const res = await api.post("inventory/inventorylist/", {
      expiry_date: data.expiryDate,
      inv_type: inv_type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};


// MEDICINE
export const InventoryPayload = (data: any) => {
    return {
      expiry_date: data.expiryDate,
      inv_type: "Medicine",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };
  