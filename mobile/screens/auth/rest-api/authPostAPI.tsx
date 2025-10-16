import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelpers";

// export const addAddress =  async (data: Record<string, any>[]) => {
//   try {
//     const res = await api.post("profiling/address/create/", data);
//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// }

// export const addPersonalAddress = async (data: Record<string, any>[], staff_id?: string, history_id?: string) => {
//   try {
//     const values = {
//       per_add: data,
//       staff_id: staff_id,
//       history_id: history_id
//     }
//     const res = await api.post("profiling/per_address/create/", values);
//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// }

// export const addPersonal = async (data: Record<string, any>) => {
  
//   try {
//     const new_data = {
//       per_lname: data.per_lname,
//       per_fname: data.per_fname,
//       per_mname: data.per_mname || null,
//       per_suffix: data.per_suffix || null,
//       per_dob: formatDate(data.per_dob),
//       per_sex: data.per_sex,
//       per_status: data.per_status,
//       per_edAttainment: data.per_edAttainment || null,
//       per_religion: data.per_religion,
//       per_contact: data.per_contact,
//       per_disability: data.per_disability || null
//     }
//     const res = await api.post("profiling/personal/create/", new_data);

//     return res.data;
//   } catch (err) {
//     throw err;
//   }
// };

export const addRequest = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/request/create/", data);
    return res.data
  } catch (err) {
    throw err;
  }
};

export const postFaceData = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/kyc/match-face/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const postDocumentData = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/kyc/match-document/", data);
    return res.data;
  } catch (err) {
    throw err;
  }
}

export const addAccount = async (data: Record<string, any>) => {
  try {
    const response = await api.post('authentication/signup/', data);

    return response.data;
  } catch (err: any) {
    throw err;
  }
}