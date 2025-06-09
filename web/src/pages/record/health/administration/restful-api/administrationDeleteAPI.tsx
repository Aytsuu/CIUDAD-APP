import { api2 } from "@/api/api";


// Delete a position
export const deletePositionHealth = async (selectedPosition: string) => {
  try {
    const res = await api2.delete(
      `administration/position/delete/${selectedPosition}/`
    );
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const deleteAssignedFeatureHealth = async (
  selectedPosition: string,
  featureId: string
) => {
  try {
    const res = await api2.delete(
      `administration/assignment/delete/${featureId}/${selectedPosition}/`
    );
    return res;
  } catch (err) {
    console.error(err);
  }
};
