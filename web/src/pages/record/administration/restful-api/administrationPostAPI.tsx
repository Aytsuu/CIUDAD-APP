import { api } from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";
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
    // await api2.post("administration/staff/", body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Add new position
export const addPosition = async (data: any, staffId: string) => {
  try {
    const res = await api.post("administration/position/", {...capitalizeAllFields(data), staffId});
    // await api2.post("administration/position/", {...capitalizeAllFields(data), staffId});
    return res.data;
  } catch (err) {
    console.error(err);
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
    // await api2.post("administration/assignment/create/", body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const setPermission = async (assignmentId: string) => {
  try {
    const body = { assi: assignmentId };
    const res = await api.post("administration/permission/", body);
    // await api2.post("administration/permission/", body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

