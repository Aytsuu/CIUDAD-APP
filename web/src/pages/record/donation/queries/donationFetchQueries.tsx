import { useQuery } from "@tanstack/react-query";
import { getdonationreq, getPersonalList } from "../request-db/donationGetRequest";

export type Donation = {
  don_num: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
  per_id?: number | null;
};

export const useGetDonations = () => {
  return useQuery<Donation[], Error>({
    queryKey: ["donations"],
    queryFn: () => getdonationreq().catch((error) => {
        console.error("Error fetching donations:", error);
        throw error; // Re-throw to let React Query handle the error
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export type Personal = {
  per_id: number;
  full_name: string;
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