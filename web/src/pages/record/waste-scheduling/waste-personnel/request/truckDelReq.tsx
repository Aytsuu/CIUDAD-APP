import { api } from "@/api/api";

// Delete Waste Truck (now supports soft delete/archive)
export const delWasteTruck = async (truck_id: number, permanent: boolean = false) => {
  try {
    const res = await api.delete(`waste/waste-trucks/${truck_id}/?permanent=${permanent}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const restoreWasteTruck = async (truck_id: number) => {
  try {
    const res = await api.patch(`waste/waste-trucks/${truck_id}/restore/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};