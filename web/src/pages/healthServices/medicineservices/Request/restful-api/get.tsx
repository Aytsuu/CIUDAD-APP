import { api2 } from "@/api/api";
export const getMedicineRequest = async () => {
  try {
    const response = await api2.get("/medicine/medicine-request/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};

export const getMedicineRequestItem = async () => {
  try {
    const response = await api2.get("/medicine/medicine-request-items/");
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    throw error;
  }
};

//   export const fetchRequestItems = async (medreq_id: number) => {
//     try {
//       const response = await api2.get(
//         `/medicine/medicine-request-items/?medreq_id=${medreq_id}`
//       );
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching medicine request items:", error);
//       throw error;
//     }
//   };



export const fetchRequestItems = async (medreq_id: number, pat_id: string | null, rp_id: string | null) => {
    try {
      const params = {
        medreq_id,
        ...(pat_id && { pat_id }),
        ...(rp_id && { rp_id })
      };
      
      const response = await api2.get(
        `/medicine/medicine-request-items/`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching medicine request items:", error);
      throw error;
    }
  };