import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";

export const addStaff = async (personalId: string, positionId: string, staffId: string) => {
  try {
    const res = await api.post("administration/staff/", {
      staff_id: personalId,
      staff_assign_date: formatDate(new Date()),
      rp_id: personalId,
      pos_id: positionId,
      manager: staffId,
    });

    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Add new position
export const addPosition = async (data: any, staffId: string) => {
  try {
    const res = await api.post("administration/position/", {
      pos_title: data.pos_title,
      pos_max: data.pos_max,
      staff: staffId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const assignFeature = async (
  selectedPositionId: string,
  featureId: string,
  staffId: string
) => {
  try {
    const res = await api.post(`administration/assignment/`, {
      feat_id: featureId,
      pos: selectedPositionId,
      assi_date: formatDate(new Date()),
      staff: staffId
    });
    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const setPermission = async (assignmentId: string) => {
  try {
    const res = await api.post("administration/permission/", {
      assi: assignmentId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
};
