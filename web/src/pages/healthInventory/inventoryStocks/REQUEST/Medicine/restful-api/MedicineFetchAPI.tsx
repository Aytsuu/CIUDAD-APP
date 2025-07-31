import { useEffect, useState } from "react";
import { getMedicines } from "../../../../InventoryList/restful-api/medicine/MedicineFetchAPI";


export const fetchMedicines = () => {
    const [medicines, setMedicines] = useState<
    { id: string; name: string; category: string }[]
  >([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const medicines = await getMedicines();
        console.log("Raw Medicines Data:", medicines); // Debugging log
  
        if (Array.isArray(medicines)) {
          const transformedData = medicines.map((medicine: any) => ({
            id: String(medicine.med_id), // Force id to be a string
            name: medicine.med_name,
            category:medicine.catlist, 
          }));
  
          console.log("Transformed Data:", transformedData); // Debugging log
          setMedicines(transformedData); // No default option
        }
      };
  
      fetchData();
    }, []);
  
    return medicines;
  };
  