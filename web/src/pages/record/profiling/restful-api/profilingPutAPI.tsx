import { api } from "@/api/api";
import { capitalize } from "@/helpers/capitalize";

export const updateProfile = async (
  perId: string,
  data: Record<string, any>
) => {
  try {
    const res = await api.put(
      `profiling/personal/update/${perId}/`, data
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};


export const updateFamily = async (
  demographicInfo: Record<string, any>,
  familyId: string
) => {
  try {
    const res = await api.put(`profiling/family/update/${familyId}/`, {
      hh_id: demographicInfo.householdNo,
      fam_building: capitalize(demographicInfo.building),
      fam_indigenous: capitalize(demographicInfo.indigenous)
    })

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export const updateHousehold = async (householdInfo: Record<string, any>) => {
  try {
    const res = await api.put(`profiling/household/update/${householdInfo.hh_id}/`, {
      
    })
    
    return res.data
  } catch (err) {
    throw err;
  }
}
