import { api } from "@/api/api";

// Request deletion on approve
export const deleteRequest = async (requestId: string) => {
  try {
    const res = await api.delete(`profiling/request/delete/${requestId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
};

// Delete family member
export const deleteFamilyComposition = async (familyId: string, residentId: string) => {
  try {
    const res = await api.delete(`profiling/family-composition/delete/${familyId}/${residentId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
}