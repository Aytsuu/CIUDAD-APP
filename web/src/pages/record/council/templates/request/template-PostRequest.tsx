import {api} from "@/api/api";



export const template_record = async (templateInfo: Record<string, any>) => {

    try{


        console.log({
            temp_contact_num: templateInfo.temp_contact_number,
            temp_email: templateInfo.temp_email,
            staff_id: templateInfo.staff_id || null,
        })

        const res = await api.post('council/template/',{

            temp_contact_num: templateInfo.temp_contact_number,
            temp_email: templateInfo.temp_email,
            staff_id: templateInfo.staff_id || null,

        })

        return res.data.temp_id;
    }
    catch (err){
        console.error(err);
    }
}




export const template_file = async (data: {
  temp_id: number;
  file_data: {
    name: string;
    type: string;
    file: any;
    logoType: any;
  };
}) => {
  try {
    // Create the payload that matches your serializer's _upload_files method
    const payload = {
      temp_id: data.temp_id,
      files: [{
        name: data.file_data.name,
        type: data.file_data.type,
        file: data.file_data.file, // The actual file object
        logoType: data.file_data.logoType
      }]
    };

    const res = await api.post('council/template-file/', payload);
    return res.data;
  } catch (err) {
    console.error(`Failed to create file ${data.file_data.name}:`, err);
    throw err;
  }
}