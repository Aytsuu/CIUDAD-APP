import { api } from "@/api/api";

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
  data: Record<string, any>,
  familyId: string
) => {
  try {
    const res = await api.put(`profiling/family/update/${familyId}/`, data)
    return res.data;
  } catch (err) {
    console.error(err);
  }
}

export const updateFamilyRole = async (familyId: string, residentId: string, fc_role: string | null) => {
  try {
    const res = await api.put(`profiling/family/role/update/${familyId}/${residentId}/`, {
      fc_role
    })
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const updateHousehold = async (householdInfo: Record<string, any>) => {
  try {
    const res = await api.put(`profiling/household/update/${householdInfo.hh_id}/`, {
      rp: householdInfo.householdHead.split(" ")[0],
      hh_nhts: householdInfo.nhts,
    })
    
    return res.data
  } catch (err) {
    throw err;
  }
}

export const updateBusiness = async (data: Record<string, any>, businessId: string) => {
  try {
    console.log(data)
    const res = await api.put(`profiling/business/${businessId}/update/`, data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}