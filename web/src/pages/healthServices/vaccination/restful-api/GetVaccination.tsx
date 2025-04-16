import api from "@/api/api";

export const getPatientRecord =  async () => {
  try {
    const response = await api.get(`/patient`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const getVaccinationRecords =  async () => {
  try {
    const response = await api.get(`/vaccination`);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};



export const getVaccinelist =  async () => {
    try {
        const response = await api.get(`/inventory/vac_list`);
        return response.data;
    } catch (err) {
        console.error(err);
    }
    }