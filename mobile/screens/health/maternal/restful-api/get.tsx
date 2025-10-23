import { api2 } from "@/api/api";

export const getPrenatalAppointmentRequests = async (rp_id: string) => {
   try {
      const res = await api2.get(`/maternal/prenatal/appointment/requests/${rp_id}/`);
      return res.data || [];
   } catch (error) {
      console.error("Error fetching prenatal appointment requests:", error);
      return [];
   }
}