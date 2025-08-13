import { api, api2 } from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const updatePermission = async (
  assignmentId: string,
  option: string,
  permission: boolean
) => {
  try {
    const body = { [option]: permission };
    const path = `administration/permission/update/${assignmentId}/`;
    const res = await api.put(path, body);
    await api2.put(path, body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const batchPermissionUpdate = async (
  assignmentId: string,
  checked: boolean
) => {
  try {
    const body = { create: checked, update: checked, delete: checked };
    const path = `administration/permission/update/${assignmentId}/`;
    const res = await api.put(path, body);
    await api2.put(path, body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updatePosition = async (
  positionId: string,
  values: Record<string, string>
) => {
  try {
    const payload = capitalizeAllFields(values);
    const path = `administration/position/update/${positionId}/`;
    const res = await api.put(path, payload);
    await api2.put(path, payload);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
