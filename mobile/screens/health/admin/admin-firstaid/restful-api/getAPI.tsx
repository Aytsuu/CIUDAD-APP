// restful-api/Firstaid/GetFirstaid.js
import {api2} from "@/api/api";

export const getFirstaidRecords = async (
  search: string = '',
  patient_type: string = 'all',
  page: number = 1,
  page_size: number = 20  // Default page size; adjust as needed
) => {
  const params = new URLSearchParams();
  if (search && search.length >= 2) {  // Match backend min length
    params.append('search', search);
  }
  if (patient_type !== 'all') {
    params.append('patient_type', patient_type.toLowerCase());  // Backend expects 'resident'/'transient'
  }
  params.append('page', page.toString());
  params.append('page_size', page_size.toString());

  try {
    const response = await api2.get(`/firstaid/all-firstaid-record/?${params.toString()}`);
    return response.data;  // {count, next, previous, results: [records]}
  } catch (error) {
    console.error("Error fetching first aid records:", error);
    throw error;
  }
};


export const getFirstAidCounts = async (search: string = '') => {
  const fetchCount = async (patient_type: string) => {
    const data = await getFirstaidRecords(search, patient_type, 1, 1);  // page_size=1 for minimal data
    return data.count || 0;
  };

  const [allCount, residentCount, transientCount] = await Promise.all([
    fetchCount('all'),
    fetchCount('resident'),
    fetchCount('transient'),
  ]);

  return {
    all: allCount,
    resident: residentCount,
    transient: transientCount,
  };
};



// export const getMedicatedCount = async () => {
//   try {
//     const response = await api.get("/Firstaid/Firstaid-records/medicated-count/");
//     return response.data;
//   } catch (error) {
//     console.error("Error fetching medicated count:", error);
//     throw error;
//   }
// };

export const getFirstaidStocks = async () => {
  try {
    const response = await api2.get("/inventory/firstaidinventorylist/");
    console.log(response.data)

    return response.data;
  } catch (error) {
    console.error("Error fetching Firstaid stocks:", error);
    throw error;
  }
}


