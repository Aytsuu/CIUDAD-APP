import {api} from "@/api/api";

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
    if(res.status==200){ return res.data;}
    console.error(res.status)
    return[]
  }catch(err){
    console.log(err)
    return[]
  }
  
}




export const getVaccineTransactions = async() =>{
  try{
    const res = await api.get("inventory/antigens_stocks/");
    if(res.status==200){return res.data;}
    console.error(res.status)
    return[]
  }catch(err){
    console.log(err)
    return[]
  }
  
}


export const getImmunizationTransactions = async() =>{
  try{
    const res = await api.get("inventory/imz_transaction/");
    if(res.status==200){ return res.data; }
    console.error(res.status)
    return[]
  }catch(err){
    console.log(err)
    return[]
  }
  
}