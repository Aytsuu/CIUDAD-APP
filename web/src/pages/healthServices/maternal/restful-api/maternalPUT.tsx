import { api2 } from "@/api/api";

export const updatePARequestApprove = async (parId: number) => {
   try {
      const res = await api2.put(`maternal/prenatal/appointment/request/${parId}/approve/`);
      return res.data;
   } catch (error) {
      console.error("Error approving prenatal appointment request:", error);
      throw error;
   }
}


export const updatePARequestReject = async (parId: number, reason: string) => {
   try {
      const res = await api2.put(`maternal/prenatal/appointment/request/${parId}/reject/`, { reason });
      return res.data;
   } catch (error) {
      console.error("Error rejecting prenatal appointment request:", error);
      throw error;
   }
}