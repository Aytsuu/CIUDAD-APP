import {api} from "@/pages/api/api";

export const  getCommodityStocks = async()=>{
    try{
      const res= await api.get("inventory/commodityinventorylist/")
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