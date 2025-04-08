import api from "@/pages/api/api";

export const addInventory = async (inventoryData: any) => {
  try {
    const res = await api.post("inventory/inventorylist/", inventoryData);
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const InventoryPayload = (data: any) => {
    return {
      expiry_date: data.expiryDate,
      inv_type: "Medicine",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  };
  