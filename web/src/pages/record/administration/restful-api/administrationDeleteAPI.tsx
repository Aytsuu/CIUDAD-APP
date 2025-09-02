import { api, api2 } from "@/api/api";

// Delete a position in both main and health APIs
export const deletePosition = async (selectedPosition: string) => {
  try {
    const res = await api.delete(
      `administration/position/delete/${selectedPosition}/`
    );
    // await api2.delete(
    //   `administration/position/delete/${selectedPosition}/`
    // );
    return res.status;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Delete an assigned feature in both main and health APIs
export const deleteAssignedFeature = async (
  selectedPosition: string,
  featureId: string
) => {
  try {
    const res = await api.delete(
      `administration/assignment/delete/${featureId}/${selectedPosition}/`
    );
    // await api2.delete(
    //   `administration/assignment/delete/${featureId}/${selectedPosition}/`
    // );
    return res.status;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
