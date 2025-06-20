import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { capitalize } from "@/helpers/capitalize";

export const addAddress =  async (data: Record<string, any>[]) => {
  try {
    const res = await api.post("profiling/address/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const addPersonalAddress = async (data: Record<string, any>[]) => {
  try {
    const res = await api.post("profiling/per_address/create/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}


export const addPersonal = async (data: Record<string, any>) => {

  try {
    console.log(data)
    const res = await api.post("profiling/personal/create/", {
      per_lname: data.per_lname,
        per_fname: data.per_fname,
        per_mname: data.per_mname || null,
        per_suffix: data.per_suffix || null,
        per_dob: formatDate(data.per_dob),
        per_sex: data.per_sex,
        per_status: data.per_status,
        per_edAttainment: data.per_edAttainment || null,
        per_religion: data.per_religion,
        per_contact: data.per_contact,
    });

    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addRequest = async (personalId: string) => {
  try {
    const res = await api.post("profiling/request/create/", {
      per: personalId,
    });

    return res.data
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addRequestFile = async (data: Record<string, any>[]) => {
  try {
    console.log(data)
    const res = await api.post('profiling/request/file/create/', data)
    return res.data
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const postFaceData = async (data: Record<string, any>) => {
  try {
    const res = await api.post("api/detection/face/", data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}