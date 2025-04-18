import api from "@/pages/api/api";

// Fetches the list of medicines from the API
export const getTransactionMedicines = async () => {
  try {
    const res = await api.get("inventory/medicinetransaction/");
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

export const getTransactionFirstAid = async () => {
  try {
    const res= await api.get("inventory/firstaidtransaction/");
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

export const getTransactionCommodity = async() =>{
  try{

    const res = await api.get("inventory/commoditytransaction/");


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