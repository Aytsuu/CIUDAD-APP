import { useState, useEffect } from "react";
import { getFirstAid } from "../../../../InventoryList/restful-api/firstAid/FirstAidFetchAPI";

export const fetchFirstAid = () => {
  const [firstAid, setFirstAid] = useState<
    { id: string; name: string; category: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const firstAid = await getFirstAid();
      console.log("Raw Medicines Data:", firstAid); // Debugging log

      if (Array.isArray(firstAid)) {
        const transformedData = firstAid.map((firstAid: any) => ({
          id: firstAid.fa_id, // Force id to be a string
          name: firstAid.fa_name,
          category: firstAid.catlist, // Assuming category is available in the response
        }));
        console.log("Transformed Data:", transformedData); // Debugging log
        setFirstAid(transformedData); // No default option
      }
    };
    fetchData();
  }, []);

  return firstAid;
};
