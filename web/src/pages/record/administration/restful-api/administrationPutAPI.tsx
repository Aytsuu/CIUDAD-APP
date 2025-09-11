import { api } from "@/api/api";
import { capitalizeAllFields } from "@/helpers/capitalize";

export const updatePosition = async (
  positionId: string,
  values: Record<string, string>
) => {
  try {
    const body = capitalizeAllFields(values);
    const path = `administration/position/update/${positionId}/`;
    const res = await api.put(path, body);
    // await api2.put(path, body);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
