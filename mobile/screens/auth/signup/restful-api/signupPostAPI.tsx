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


export const addPersonal = async (values: Record<string, any>) => {
  const personalInfo = values.personalInfoSchema;
  const dob = values.verificationSchema.dob;

  try {
    const res = await api.post("profiling/personal/create", {
      per_lname: personalInfo.per_lname,
        per_fname: personalInfo.per_fname,
        per_mname: personalInfo.per_mname || null,
        per_suffix: personalInfo.per_suffix || null,
        per_dob: formatDate(personalInfo.per_dob),
        per_sex: personalInfo.per_sex,
        per_status: personalInfo.per_status,
        per_edAttainment: personalInfo.per_edAttainment || null,
        per_religion: personalInfo.per_religion,
        per_contact: personalInfo.per_contact,
    });

    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addRequest = async (personalId: string) => {
  try {
    const res = await api.post("profiling/request/", {
      req_date: formatDate(new Date()),
      per_id: personalId,
    });

    return res.data
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addFile = async (name: string, type: string, path: string, url: string) => {
  try {
    const res = await api.post('file/upload/', {
      file_name: name,
      file_type: type,
      file_path: path,
      file_url: url
    })

    return res.data
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const addRequestFile = async (data: Record<string, any>) => {
  try {
    const res = await api.post('profiling/request/file/', data)

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