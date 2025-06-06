

  import {api} from "@/pages/api/api";
  
  export const  getVaccineStocks = async()=>{
      try{
        const res= await api.get("inventory/vaccine_stocks/")
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

