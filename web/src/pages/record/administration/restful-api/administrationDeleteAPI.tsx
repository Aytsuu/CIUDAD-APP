import { api } from "@/api/api";


// Delete a position
export const deletePosition = async (selectedPosition: string) => {
  try {
    const res = await api.delete(
      `administration/position/delete/${selectedPosition}/`
    );
    return res.status;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const deleteAssignedFeature = async (
  selectedPosition: string,
  featureId: string
) => {
  try {
    const res = await api.delete(
      `administration/assignment/delete/${featureId}/${selectedPosition}/`
    );
    return res;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
