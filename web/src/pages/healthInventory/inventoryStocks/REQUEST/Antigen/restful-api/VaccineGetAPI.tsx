

  import {api} from "@/api/api";
  
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


  export const getVaccine = async () => {
    try {
      const res = await api.get("inventory/vac_list/");
      if (res.status === 200) {
        // Transform the data to match your SelectLayout options format
        return res.data.map((vaccine: any) => ({
          id: vaccine.vac_id.toString(),
          name: vaccine.vac_name,
          // Include other fields you might need
          type: vaccine.vac_type_choices,
          categoryId: vaccine.vaccat_id
        }));
      }
      console.error(res.status);
      return [];
    } catch (err) {
      console.log(err);
      return [];
    }
  };

  