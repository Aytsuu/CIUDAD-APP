import api from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const updatePermission = async (
  assignmentId: string,
  option: string,
  permission: boolean
) => {
  try {
    const res = await api.put(`administration/permission/update/${assignmentId}/`, {
      [option]: permission,
    });
    return res;
  } catch (err) {
    console.error(err);
  }
};

export const updatePosition = async (
  positionId: string,
  values: Record<string, string>
) => {
  try {
    const res = await api.put(
      `administration/position/update/${positionId}/`, 
      capitalizeAllFields(values)
    );
    return res.data;
  } catch (err) {
    console.error(err);
  }
};
