import { api2 } from "@/api/api";


export const updateProfileHealth = async (
  perId: string,
  data: Record<string, string>
) => {
  try {
    const res = await api2.put(
      `health-profiling/personal/update/${perId}/`, data
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};


export const updateFamilyHealth = async (
  data: Record<string, any>,
  familyId: string
) => {
  try {
      const res = await api2.put(`health-profiling/family/update/${familyId}/`, data)
      return res.data;
    } catch (err) {
      console.error(err);
    }
}

export const updateFamilyRoleHealth = async (familyId: string, residentId: string, fc_role: string | null) => {
  try {
    const res = await api2.put(`health-profiling/family/role/update/${familyId}/${residentId}/`, {
      fc_role
    })
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const updateHouseholdHealth = async (householdInfo: Record<string, any>) => {
  try {
    const res = await api2.put(`health-profiling/household/update/${householdInfo.hh_id}/`, {
      rp: householdInfo.householdHead.split(" ")[0],
      hh_nhts: householdInfo.nhts,
    })
    
    return res.data
  } catch (err) {
    throw err;
  }
}