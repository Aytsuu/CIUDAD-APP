
import { api2 } from "@/api/api";

export const getCommodity = async() =>{
    try{
  
      const res= await api2.get("inventory/commoditylist/");
  
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