import { api } from "@/api/api";

export const handleDeleteFirstAidList = async (
    fa_id: number,
    setData: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    try {
      const res = await api.delete(`inventory/firstaidlist/${fa_id}/`);
  
      if (res.status === 200 || res.status === 204) {
        console.log("✅ Medicine deleted successfully!");
  
        // Remove the deleted medicine from the state
        setData((prev) => prev.filter((fa) => fa.id !== fa_id));
      } else {
        console.error(res);
      }
    } catch (err) {
      console.error(err);
    }
  };
  