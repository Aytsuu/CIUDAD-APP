
import api from "@/pages/api/api"

export const  getMedicineStocks = async()=>{
    try{
      const res= await api.get("inventory/medicineinventorylist/")
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