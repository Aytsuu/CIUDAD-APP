import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelper";

export const addStaff = async (
  residentId: string,
  positionId: string,
  staffId: string,
  staffType: string
) => {
  try {

    const body = {
      staff_id: residentId,
      staff_assign_date: formatDate(new Date()),
      staff_type: staffType,
      rp: residentId,
      pos: positionId,
      manager: staffId,
    };
    const res = await api.post("administration/staff/", body);
    return res.data;
  } catch (err) {
    throw err;
  }
};

export const assignFeature = async (
  selectedPositionId: string,
  featureId: string,
  staffId: string
) => {
  try {
    console.log({
      feat: featureId,
      pos: selectedPositionId,
      assi_date: formatDate(new Date()),
      staff: staffId,
    })
    const body = {
      feat: featureId,
      pos: selectedPositionId,
      assi_date: formatDate(new Date()),
      staff: staffId,
    };
    const res = await api.post("administration/assignment/create/", body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
