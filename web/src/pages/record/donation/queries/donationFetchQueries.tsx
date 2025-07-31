import { useQuery } from "@tanstack/react-query";
import { getdonationreq, getPersonalList } from "../request-db/donationGetRequest";
import { Donations, Personal } from "../donation-types";


export const useGetDonations = () => {
  return useQuery<Donations[], Error>({
    queryKey: ["donations"],
    queryFn: () => getdonationreq().catch((error) => {
        console.error("Error fetching donations:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetPersonalList = () => {
  return useQuery<Personal[], Error>({
    queryKey: ["personalList"],
    queryFn: () => getPersonalList().catch((error) => {
      console.error("Error fetching personal list:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};