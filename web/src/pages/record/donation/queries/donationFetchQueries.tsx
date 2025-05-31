import { useQuery } from "@tanstack/react-query";
import { getdonationreq } from "../request-db/donationGetRequest";

export type Donation = {
  don_num: number;
  don_donorfname: string;
  don_donorlname: string;
  don_item_name: string;
  don_qty: number;
  don_category: string;
  don_receiver: string;
  don_description?: string;
  don_date: string;
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