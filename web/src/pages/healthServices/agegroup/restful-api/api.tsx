import { api2 } from "@/api/api";

export const createAgegroup = async (data: Record<string, any>) => {
  try {
    const res = await api2.post("/inventory/age_group/", {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return { ...res.data, id: res.data.agegrp_id };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateAgegroup = async (id: string, data: Record<string, any>) => {
  try {
    const res = await api2.patch(`/inventory/age_group/${parseInt(id, 10)}/`, {
      ...data,
      updated_at: new Date().toISOString()
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return { ...res.data, id };
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const deleteAgeroup = async (id: string) => {
  try {
    const res = await api2.delete(`inventory/age_group/${parseInt(id, 10)}/`);
    console.log(res.data);
    return { ...res.data, queryKey: ["ageGroups"] };
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getAgegroup = async () => {
  try {
    const res = await api2.get("/inventory/age_group/");
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching age groups:", err);
    throw err;
  }
};
