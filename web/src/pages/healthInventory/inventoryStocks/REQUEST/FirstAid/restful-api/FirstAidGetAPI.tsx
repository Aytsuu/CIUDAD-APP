import {api2} from "@/api/api";


export const getFirstAidInventoryList = async () => {
    try {
      const res = await api2.get("inventory/firstaidinventorylist/");
      return res.data || [];
    } catch (err) {
      console.error(err)
  }
  };


  

  
  export const  getFirstAidStocks = async()=>{
    try{
      const res= await api2.get("inventory/firstaidinventorylist/")
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
