import { api } from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';

// Update Waste Truck
export const putWasteTruck = async (truck_id: number, truckInfo: Record<string, any>) => {
  try {
    const payload = {
      truck_plate_num: truckInfo.truck_plate_num,
      truck_model: truckInfo.truck_model,
      truck_capacity: truckInfo.truck_capacity,
      truck_status: truckInfo.truck_status || "operational",
      truck_last_maint: formatDate(truckInfo.truck_last_maint || new Date()),
    };

    console.log(`Updating truck ${truck_id}:`, payload);

    const res = await api.put(`waste/waste-trucks/${truck_id}/`, payload);
    return res.data;
  } catch (err) {
    console.error("Error updating truck:", err);
    throw err;
  }
};