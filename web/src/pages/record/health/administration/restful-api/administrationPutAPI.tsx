import { api2 } from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const updatePermissionHealth = async (
  assignmentId: string,
  option: string,
  permission: boolean
) => {
  try {
    console.log({
      [option]: permission,
    })
    const res = await api2.put(
      `administration/permission/update/${assignmentId}/`,
      {
        [option]: permission,
      }
    );
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const batchPermissionUpdateHealth = async (
  assignmentId: string,
  checked: boolean
) => {
  try {
    console.log({
      create: checked,
      update: checked,
      delete: checked
    })
    const res = await api2.put(
      `administration/permission/update/${assignmentId}/`,
      {
        create: checked,
        update: checked,
        delete: checked
      }
    );
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const updatePositionHealth = async (
  positionId: string,
  values: Record<string, string>
) => {
  try {
    const res = await api2.put(
      `administration/position/update/${positionId}/`,
      capitalizeAllFields(values)
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
