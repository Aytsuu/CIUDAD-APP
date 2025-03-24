import api from "@/pages/api/api";

export const handleDeleteMedicineStocks = async (
    minv_id: number,
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const res = await api.delete(`inventory/medicineinventorylist/${minv_id}/`);
  
      if (res.status === 200 || res.status === 204) {
        console.log("✅ Medicine Stocks deleted successfully!");
  
        // Remove the deleted medicine from the state
        setData((prev) => prev.filter((medStock) => medStock.minv_id !== minv_id));
      } else {
        console.error(res);
      }
    } catch (err) {
      console.error(err);
    }
  };


  export const handleDeleteCommodityStocks = async (
    cinv_id: number,
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const res = await api.delete(`inventory/commodityinventorylist/${cinv_id}/`);
  
      if (res.status === 200 || res.status === 204) {
        console.log("✅ Commodiity Stocks deleted successfully!");
  
        // Remove the deleted medicine from the state
        setData((prev) => prev.filter((comStock) => comStock.cinv_id !== cinv_id));
      } else {
        console.error(res);
      }
    } catch (err) {
      console.error(err);
    }
  };