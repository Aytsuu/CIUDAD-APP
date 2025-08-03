import {api2} from "@/api/api";

export const  getCommodityStocks = async()=>{
    try{
      const res= await api2.get("inventory/commodityinventorylist/")
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