import api from "@/api/api";

  // Fetch residents
export const getResidents = async () => {
    try {

        const res = await api.get('profiling/resident/');
        return res.data;
        
    } catch (err) {
        console.error(err);
    }
};

// Fetch families
export const getFamilies = async () => {

  try {

      const res = await api.get('profiling/family/')
      return res.data

  } catch (err) {
      console.error(err)
  }

}


// Fetch households
export const getHouseholds = async () => {

  try {

      const res = await api.get('profiling/household/')
      return res.data

  } catch (err) {
      console.error(err)
  }

}

// Fetch sitio
export const getSitio = async () => {

  try {

    const res = await api.get('profiling/sitio/')
    return res.data

  } catch (err) {
    console.error(err)
  }

}

// Fetch registration requests
export const getRequest = async () => {

  try {

    const res = await api.get('profiling/request/')
    return res.data

  } catch (err) {
    console.error(err)
  }

}