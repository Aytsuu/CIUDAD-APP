import api from "@/pages/api/api";

const addCategory = async (CategoryInfo: Record<string, string>) => {
  try {
    const res = await api.post("inventory/category/", {
      cat_type: CategoryInfo.cat_type,
      cat_name: CategoryInfo.cat_name,
    });

    console.log("Category added successfully:", res.data);

    return res.data;
  } catch (err) {
    console.error("Error adding category:", err);
    return null;
  }
};


// Function to add a new medicine to the database
const addMedicine = async (MedicineInfo: Record<string, string>) => {
  try {
    const res = await api.post("inventory/medicinelist/", {
      med_name: MedicineInfo.med_name,
      cat_id: MedicineInfo.category, // Ensure correct mapping
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return res.data;
  } catch (err) {
    console.error("Error adding medicine:", err);
    return null;
  }
};



export { addCategory, addMedicine };
