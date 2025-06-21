import { api2 } from "@/api/api";
import { capitalize } from "@/helpers/capitalize";
import { formatDate } from "@/helpers/dateFormatter";

export const addStaffHealth = async (residentId: string, positionId: string, staffId: string) => {
  try {
    const res = await api2.post("administration/staff/", {
      staff_id: residentId,
      staff_assign_date: formatDate(new Date()),
      rp_id: residentId,
      pos_id: positionId,
      manager: staffId,
    });

    return res.data;
  } catch (err) {
    console.log(err);
  }
};

// Add new position
export const addPositionHealth = async (data: any, staffId: string) => {
  try {
    const res = await api2.post("administration/position/", {
      pos_id: data.pos_title.toLowerCase(),
      pos_title: capitalize(data.pos_title),
      pos_max: parseInt(data.pos_max),
      staff: staffId,
    });
    

    return res.data;
  } catch (err) {
    console.error(err);
  }
};

export const assignFeatureHealth = async (
  selectedPositionId: string,
  featureId: string,
  staffId: string
) => {
  try {
    const res = await api2.post(`administration/assignment/`, {
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

export const setPermissionHealth = async (assignmentId: string) => {
  try {
    const res = await api2.post("administration/permission/", {
      assi: assignmentId,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
};
