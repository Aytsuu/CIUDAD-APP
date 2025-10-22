import { api, api2 } from "@/api/api";

// Delete family member
export const deleteFamilyComposition = async (familyId: string, residentId: string) => {
  try {
    const res = await api.delete(`profiling/family/composition/delete/${familyId}/${residentId}/`);
    await api2.delete(`health-profiling/family/composition/delete/${familyId}/${residentId}/`);
    return res;
  } catch (err) {
    console.error(err);
  }
}