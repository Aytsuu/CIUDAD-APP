<<<<<<< HEAD
import { api } from "@/api/api";
=======
import {api} from "@/api/api";
>>>>>>> mobile-register

export const getdonationreq = async () => {
    try {
        const res = await api.get('donation/donation-record/');
        
        // Handle empty/undefined responses
        const data = res.data?.data ?? res.data ?? [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error("API Error:", err);
        return [];  // Always return an array
    }
};

export const getPersonalList = async () => {
  try {
    const res = await api.get('donation/personal-list/');
    const data = res.data?.data ?? res.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API Error:", err);
    return [];
  }
};


// export const getdonationreq = async () => {
//     try {
//         const res = await api.get('donation/donation-record/');
//         console.log('API Response:', res); 
//         if (!res.data) {
//             throw new Error('No data in response');
//         }
//         return res.data;
//     } catch (err) {
//         console.error("API Error:", err);
//         throw err; 
//     }
// };