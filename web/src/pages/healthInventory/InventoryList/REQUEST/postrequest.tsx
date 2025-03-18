import api from "@/pages/api/api";

// Function to add a new medicine
export const addMedicine = async (medicineName: string) => {
  try {
    const res = await api.post("inventory/medicinelist/", {
      med_name: medicineName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.data;
  } catch (err) {
    console.log(err);
  }
};

export const addFirstAid = async (firstAidName: string) => {
  try {
    const res = await api.post("inventory/firstaidlist/", {
      fa_name: firstAidName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return res.data;
  } catch (err) {
    console.log(err);
  }
};


export const addCommodity = async (commodityName:string)=>{
    try{
        const res = await api.post("inventory/commoditylist/",{
            com_name:commodityName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        return res.data
    }catch(err){
        console.log(err)
    }
}