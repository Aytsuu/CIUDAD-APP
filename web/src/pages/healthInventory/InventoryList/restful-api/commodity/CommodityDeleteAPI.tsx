
import {api2} from "@/api/api";

export const handleDeleteCommodityList = async (id: string) => {
    try {
      const res = await api2.delete(`inventory/commoditylist/${id}/`); // API call
      return res.data; 
      
    } catch (error) {
      console.error("Error deleting medicine:", error);
      throw error;
    }
  };
  

  
// import {api2} from "@/api/api";

// export const handleDeleteCommodityList = async (
//     com_id: number,
//     setData: React.Dispatch<React.SetStateAction<any[]>>
//   ) => {
//     try {
//       const res = await api.delete(`inventory/commoditylist/${com_id}/`);
  
//       if (res.status === 200 || res.status === 204) {
//         console.log("✅ Medicine deleted successfully!");
  
//         // Remove the deleted medicine from the state
//         setData((prev) => prev.filter((com) => com.id !== com_id));
//       } else {
//         console.error(res);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };
  