import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateHelpers";
import { capitalize } from "@/helpers/capitalize";
import { supabase } from "@/lib/supabase";

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

export const addRequest = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/request/create/", data);
    return res.data
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const postFaceData = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/kyc/face-match/", data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const postDocumentData = async (data: Record<string, any>) => {
  try {
    const res = await api.post("profiling/kyc/match-document/", data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export const addAccount = async (accountInfo: Record<string, string>, residentId: string) => {
  try {
    const response = await api.post('authentication/signup/', {
      username: accountInfo.username,
      email: accountInfo.email,
      password: accountInfo.password,
      resident_id: residentId 
    });

    return response.data;
  } catch (err: any) {
    console.error('Account creation failed:', err);
    
    let errorMessage = 'Failed to create account';
    if (err.response) {
      errorMessage = err.response.data?.error || errorMessage;
    } else if (err.message) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
}