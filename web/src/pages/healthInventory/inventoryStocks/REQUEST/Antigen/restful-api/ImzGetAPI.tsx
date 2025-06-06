

  import {api} from "@/pages/api/api";
  
  export const  getImmunizationStocks = async()=>{
      try{
        const res= await api.get("inventory/immunization_stock/")
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