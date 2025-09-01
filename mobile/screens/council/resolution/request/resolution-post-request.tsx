import {api} from "@/api/api";




export const resolution_create = async (resolutionInfo: Record<string, any>) => {
    try{
        let staff = "00002250829";

        console.log({
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: Number(staff),
        })

        const res = await api.post('council/resolution/',{
            res_title: resolutionInfo.res_title,
            res_date_approved: resolutionInfo.res_date_approved,
            res_area_of_focus: resolutionInfo.res_area_of_focus,
            res_is_archive: false,
            staff_id: Number(staff),
        })

        return res.data.res_num;
    }
    catch (err){
        console.error(err);
    }
}



export const resolution_file_create = async (data: {
  res_num: number;
  file_data: {
    name: string;
    type: string;
    file: any;
  };
}) => {
  try {
    // Create the payload that matches your serializer's _upload_files method
    const payload = {
      res_num: data.res_num,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file // The actual file object
      }]
    };

    const res = await api.post('council/resolution-file/', payload);
    return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}



// export const resolution_supp_doc_create = async (data: {
//   res_num: number;
//   file_data: {
//     name: string;
//     type: string;
//     path: string;
//     uri: string;
//   };
// }) => {
//   try {

//     console.log("NI SUD SA REQ SUPP DOCS",{
//       res_num: data.res_num,
//       rsd_name: data.file_data.name,
//       rsd_type: data.file_data.type,
//       rsd_path: data.file_data.path,
//       rsd_url: data.file_data.uri
//     })

//     const res = await api.post('council/resolution-supp/', {
//       res_num: data.res_num,
//       rsd_name: data.file_data.name,
//       rsd_type: data.file_data.type,
//       rsd_path: data.file_data.path,
//       rsd_url: data.file_data.uri
//     });

//     return res.data;
//   } catch (err) {
//     console.error(`Failed to create file ${data.file_data.name}:`, err);
//     throw err;
//   }
// }



export const resolution_supp_doc_create = async (data: {
  res_num: number;
  file_data: {
    name: string;
    type: string;
    file: any;
  };
}) => {
  try {
    // Create the payload that matches your serializer's _upload_files method
    const payload = {
      res_num: data.res_num,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file // The actual file object
      }]
    };

    const res = await api.post('council/resolution-supp/', payload);
    return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}