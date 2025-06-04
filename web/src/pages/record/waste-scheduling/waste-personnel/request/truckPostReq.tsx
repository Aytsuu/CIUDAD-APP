import { api } from "@/api/api";
import { formatDate } from '@/helpers/dateFormatter';

// For Waste Truck
export const postWasteTruck = async (truckInfo: Record<string, any>) => {
  try {
    const payload = {
      truck_plate_num: truckInfo.truck_plate_num,
      truck_model: truckInfo.truck_model,
      truck_capacity: parseInt(truckInfo.truck_capacity),
      truck_status: truckInfo.truck_status || "operational",
      truck_last_maint: formatDate(truckInfo.truck_last_maint || new Date()),
    };

    console.log("Posting new truck:", payload);

    const res = await api.post("waste/waste-trucks/", payload);
    return res.data.truck_id;
  } catch (err) {
    console.error("Error posting truck:", err);
    throw err;
  }
};