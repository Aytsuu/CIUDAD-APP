import { api } from "@/api/api";

// Delete Waste Truck (now supports soft delete/archive)
export const delWasteTruck = async (truck_id: number, permanent: boolean = false) => {
  try {
    console.log(`${permanent ? "Permanently deleting" : "Archiving"} truck with truck_id:`, truck_id);
    const res = await api.delete(`waste/waste-trucks/${truck_id}/?permanent=${permanent}`);
    console.log("Delete response:", res.data);
    return res.data;
  } catch (err) {
    console.error(`Error ${permanent ? "deleting" : "archiving"} truck:`, err);
    throw err;
  }
};


export const restoreWasteTruck = async (truck_id: number) => {
  try {
    console.log("Restoring truck with truck_id:", truck_id);
    const res = await api.patch(`waste/waste-trucks/${truck_id}/restore/`);
    console.log("Restore response:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error restoring truck:", err);
    throw err;
  }
};