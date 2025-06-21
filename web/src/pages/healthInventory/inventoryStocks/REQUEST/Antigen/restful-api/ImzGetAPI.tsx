

  import {api2} from "@/api/api";
  
  export const  getImmunizationStocks = async()=>{
      try{
        const res= await api2.get("inventory/immunization_stock/")
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

  
  export const getSupplies = async () => {
    try {
      const res = await api2.get("inventory/imz_supplies/");
      if (res.status === 200) {
        // Transform the data to match your SelectLayout options format
        return res.data.map((supplies: any) => ({
          id: supplies.imz_id.toString(),
          name: supplies.imz_name,
          // Include other fields you might need
          type: supplies.vac_type_choices,
          categoryId: supplies.vaccat_id
        }));
      }
      console.error(res.status);
      return [];
    } catch (err) {
      console.log(err);
      return [];
    }
  };