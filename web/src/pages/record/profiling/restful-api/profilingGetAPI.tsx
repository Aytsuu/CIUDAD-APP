import api from "@/api/api";

// Fetch staffs
export const getStaffs = async () => {
    try { 

      const res = await api.get('administration/staffs/');
      return res.data;

    } catch (err) {
      console.error(err);
    }
  };

  // Fetch residents
export const getResidents = async () => {
    try {

        const res = await api.get('profiling/personal/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};

// Fecth families
export const getFamilies = async () => {

  try {

      const res = await api.get('profiling/family/')
      return res.data

  } catch (err) {
      console.log(err)
  }

}