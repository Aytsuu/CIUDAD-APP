import { api } from "@/api/api";


export const updateProfile = async (
  perId: string,
  data: Record<string, any>
) => {
  try {
    const res = await api.patch(`profiling/personal/update/${perId}/`, data);
    await api2.patch(`health-profiling/personal/update/${perId}/`, data);
    return res.data;
  } catch (err) {
    console.error(err)
    throw err;
  }
};

export const updateFamily = async (
  data: Record<string, any>,
  familyId: string
) => {
  try {
    const res = await api.put(`profiling/family/update/${familyId}/`, data)
    await api2.put(`health-profiling/family/update/${familyId}/`, data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const updateFamilyRole = async (familyId: string, residentId: string, fc_role: string | null) => {
  try {
    const res = await api.put(`profiling/family/role/update/${familyId}/${residentId}/`, {
      fc_role
    })
    await api2.put(`health-profiling/family/role/update/${familyId}/${residentId}/`, { fc_role });
    return res.data;
  } catch (err) {
    console.error(err)
    throw err;
  }
}

export const updateHousehold = async (householdInfo: Record<string, any>) => {
  try {
    const data = {
      rp: householdInfo.householdHead.split(" ")[0],
      hh_nhts: householdInfo.nhts,
    }
    const res = await api.patch(`profiling/household/update/${householdInfo.hh_id}/`, data)
    await api2.patch(`health-profiling/household/update/${householdInfo.hh_id}/`, data);

    return res.data;
  } catch (err) {
    console.error(err)
    throw err;
  }
}

export const updateBusiness = async (data: Record<string, any>, businessId: string) => {
  try {
    const res = await api.patch(`profiling/business/${businessId}/update/`, data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}