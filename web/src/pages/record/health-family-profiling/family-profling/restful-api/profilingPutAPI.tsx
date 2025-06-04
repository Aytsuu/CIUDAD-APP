import { api2 } from "@/api/api";
import { capitalizeAllFields, capitalize } from "@/helpers/capitalize";

export const updateProfile = async (
  perId: string,
  data: Record<string, string>
) => {
  try {
    const res = await api2.put(
      `health-profiling/personal/${perId}/`,
      capitalizeAllFields(data)
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
    const res = await api2.put(`health-profiling/family/update/${familyId}/`, {
      hh_id: demographicInfo.householdNo,
      fam_building: capitalize(demographicInfo.building),
      fam_indigenous: capitalize(demographicInfo.indigenous)
    })

    return res.data;
  } catch (err) {
    console.error(err);
  }
}
