import { api } from "@/api/api";
import { formatDate } from '@/helpers/dateHelper';

// Update Waste Truck
export const putWasteTruck = async (truck_id: number, truckInfo: Record<string, any>) => {
  try {
    const payload = {
      truck_plate_num: truckInfo.truck_plate_num,
      truck_model: truckInfo.truck_model,
      truck_capacity: truckInfo.truck_capacity,
      truck_status: truckInfo.truck_status || "operational",
      truck_last_maint: formatDate(truckInfo.truck_last_maint || new Date()),
      truck_track_device: truckInfo.truck_track_device || null,
    };

    const res = await api.put(`waste/waste-trucks/${truck_id}/`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};