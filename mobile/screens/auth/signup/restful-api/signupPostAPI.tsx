import { api } from "@/api/api";
import { formatDate } from "@/helpers/dateFormatter";
import { capitalize } from "@/helpers/capitalize";

export const addPersonal = async (values: Record<string, any>) => {
  const personalInfo = values.personalInfoSchema;
  const dob = values.verificationSchema.dob;

  try {
    console.log({
      per_lname: capitalize(personalInfo.per_lname),
      per_fname: capitalize(personalInfo.per_fname),
      per_mname: capitalize(personalInfo.per_mname) || null,
      per_suffix: capitalize(personalInfo.per_suffix) || null,
      per_dob: formatDate(dob),
      per_sex: capitalize(personalInfo.per_sex),
      per_status: capitalize(personalInfo.per_status),
      per_address: capitalize(personalInfo.per_address),
      per_edAttainment: capitalize(personalInfo.per_edAttainment) || null,
      per_religion: capitalize(personalInfo.per_religion),
      per_contact: capitalize(personalInfo.per_contact),
    })
    const res = await api.post("profiling/personal/", {
      per_lname: capitalize(personalInfo.per_lname),
      per_fname: capitalize(personalInfo.per_fname),
      per_mname: capitalize(personalInfo.per_mname) || null,
      per_suffix: capitalize(personalInfo.per_suffix) || null,
      per_dob: formatDate(dob),
      per_sex: capitalize(personalInfo.per_sex),
      per_status: capitalize(personalInfo.per_status),
      per_address: capitalize(personalInfo.per_address),
      per_edAttainment: capitalize(personalInfo.per_edAttainment) || null,
      per_religion: capitalize(personalInfo.per_religion),
      per_contact: capitalize(personalInfo.per_contact),
    });

    return res.data;
  } catch (err) {
    console.error(err);
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
  }
}

export const addRequestFile = async (requestId: string, fileId: string) => {
  try {
    const res = await api.post('profiling/request/file/', {
      req: requestId,
      file: fileId
    })

    return res.data
  } catch (err) {
    console.error(err);
  }
}
