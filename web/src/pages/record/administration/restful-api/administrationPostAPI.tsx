import { api } from "@/api/api";
import { capitalize } from "@/helpers/capitalize";
import { formatDate } from "@/helpers/dateHelper";
import { api2 } from "@/api/api";

export const addStaff = async (residentId: string, positionId: string, staffId: string) => {
  try {
    const res = await api.post("administration/staff/", {
      staff_id: residentId,
      staff_assign_date: formatDate(new Date()),
      rp: residentId,
      pos: positionId,
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
      pos_title: capitalize(data.pos_title),
      pos_max: data.pos_max,
      pos_group: data.pos_group?.toUpperCase(),
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
    const res = await api.post(`administration/assignment/create/`, {
      feat: featureId,
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


// --------------Health Administration Post APIs----------------

export const addStaffHealth = async (residentId: string, positionId: string, staffId: string) => {
  try {
    const res = await api2.post("administration/staff/", {
      staff_id: residentId,
      staff_assign_date: formatDate(new Date()),
      rp: residentId,
      pos: positionId,
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
    const res = await api2.post(`administration/assignment/create`, {
      feat: featureId,
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
