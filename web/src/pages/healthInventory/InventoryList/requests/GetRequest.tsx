import api from "@/pages/api/api";

// Fetches the list of medicines from the API
export const getMedicines = async () => {
  try {
    const res = await api.get("inventory/medicinelist/");
    if (res.status === 200) { 
      return res.data;
    }
    console.error(res.status);
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getFirstAid = async () => {
  try {
    const res = await api.get("inventory/firstaidlist/");
    if (res.status === 200) {
      return res.data;
    }
    console.error(res.status);
    return [];
  } catch (err) {
    console.log(err);
    return[]
  }
};

export const getCommodity = async() =>{
  try{

    const res= await api.get("inventory/commoditylist/");

    if(res.status==200){
      return res.data;
    }
    console.error(res.status)
    return[]
  }catch(err){
    console.log(err)
    return[]
  }
  
}