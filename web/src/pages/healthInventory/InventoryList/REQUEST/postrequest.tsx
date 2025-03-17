import api from "@/pages/api/api";

  // Function to add a new medicine
  export const addMedicine = async (medicineName: string) => {
    try {
      const response = await api.post("inventory/medicinelist/", {
        med_name: medicineName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      return response.status === 201 || response.status === 200;
    } catch (err) {
      console.error("🔥 Error adding medicine:", err);
      return false;
    }
  };
