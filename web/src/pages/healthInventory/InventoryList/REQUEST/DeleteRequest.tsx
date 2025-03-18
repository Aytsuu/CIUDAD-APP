import api from "@/pages/api/api";

export const handleDeleteMedicineList = async (
  med_id: number,
  setData: React.Dispatch<React.SetStateAction<any[]>>) => {
  try {
    const res = await api.delete(`inventory/medicinelist/${med_id}/`);

    if (res.status === 200 || res.status === 204) {
      console.log("✅ Medicine deleted successfully!");

      // Remove the deleted medicine from the state
      setData((prev) => prev.filter((med) => med.id !== med_id));
    } else {
      console.error(res);
    }
  } catch (err) {
    console.error(err);
  }
};



