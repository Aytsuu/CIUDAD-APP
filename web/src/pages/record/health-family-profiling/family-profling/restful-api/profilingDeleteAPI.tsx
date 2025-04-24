import { api2 } from "@/api/api";

// Request deletion on approve
export const deleteRequest = async (requestId: string) => {
  try {
    const res = await api2.delete(`health-profiling/request/delete/${requestId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
};

// Delete family member
export const deleteFamilyComposition = async (familyId: string, residentId: string) => {
  try {
    const res = await api2.delete(`health-profiling/family-composition/delete/${familyId}/${residentId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
}