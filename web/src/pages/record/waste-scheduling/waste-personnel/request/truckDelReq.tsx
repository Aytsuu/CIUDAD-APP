import { api } from "@/api/api";

// Delete Waste Truck
export const delWasteTruck = async (truck_id: number) => {
  try {
    console.log("Deleting truck with truck_id:", truck_id);
    const res = await api.delete(`waste/waste-trucks/${truck_id}/`);
    console.log("Delete response:", res.data);
    return res.data;
  } catch (err) {
    console.error("Error deleting truck:", err);
    throw err;
  }
};