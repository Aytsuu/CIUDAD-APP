// useMedicines.ts
import { useState, useEffect } from "react";
import { getCommodity, getMedicines } from "../../InventoryList/requests/GetRequest";// Adjust the import based on your API setup
import { getFirstAid } from "../../InventoryList/requests/GetRequest";

export const fetchMedicines = () => {
  const [medicines, setMedicines] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const medicines = await getMedicines();
      console.log("Raw Medicines Data:", medicines); // Debugging log

      if (medicines && medicines.length > 0) {
        const transformedData = medicines.map((medicine: any) => ({
          id: String(medicine.med_id), // Force id to be a string
          name: medicine.med_name,
        }));

        console.log("Transformed Data:", transformedData); // Debugging log
        setMedicines(transformedData); // No default option
      }
    };

    fetchData();
  }, []);

  return medicines;
};

export const fetchFirstAid = () => {
    const [firstAid, setFirstAid] = useState<{ id: string; name: string }[]>([]);
  
    useEffect(() => {
      const fetchData = async () => {
        const firstAid = await getFirstAid();
        console.log("Raw Medicines Data:", firstAid); // Debugging log
  
        if (firstAid && firstAid.length > 0) {
          const transformedData = firstAid.map((firstAid: any) => ({
            id: String(firstAid.fa_id), // Force id to be a string
            name: firstAid.fa_name,
          }));
          console.log("Transformed Data:", transformedData); // Debugging log
          setFirstAid(transformedData); // No default option
        }
      };
      fetchData();
    }, []);
  
    return firstAid;
  };


  export const fetchCommodity = () => {
    const [commdity, setCommodity] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
      const fetchData = async () => {
        const commodity = await getCommodity();
        console.log("Raw Medicines Data:", commodity); // Debugging log
  
        if (commodity && commodity.length > 0) {
          const transformedData = commodity.map((commodity: any) => ({
            id: String(commodity.com_id), // Force id to be a string
            name: commodity.com_name,
          }));
          console.log("Transformed Data:", transformedData); // Debugging log
          setCommodity(transformedData); // No default option
        }
      };
      fetchData();
    }, []);
  
    return commdity;
  };