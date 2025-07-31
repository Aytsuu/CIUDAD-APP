import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { postdonationreq, putdonationreq, getdonationreq, getPersonalList } from "./requests";

export type DonationInput = {
  don_num?: string;
  don_donor: string;
  don_item_name: string;
  don_qty: string;
  don_category: string;
  don_description?: string;
  don_date: string;
};

export const useAddDonation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: (donationData: DonationInput) => postdonationreq(donationData),
    onSuccess: (don_num) => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donation added successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to add donation");
    },
  });
};

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
  const { toast } = useToastContext();

  return useQuery<Donation[], Error>({
    queryKey: ["donations"],
    queryFn: () => getdonationreq().catch((error) => {
      toast.error(error.message || "Failed to fetch donations");
      console.error("Error fetching donations:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export type Personal = {
  per_id: number;
  full_name: string;
};

export const useGetPersonalList = () => {
  const { toast } = useToastContext();

  return useQuery<Personal[], Error>({
    queryKey: ["personalList"],
    queryFn: () => getPersonalList().catch((error) => {
      toast.error(error.message || "Failed to fetch personal list");
      console.error("Error fetching personal list:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateDonation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: ({ don_num, donationInfo }: { don_num: string; donationInfo: Partial<Donation> }) => 
      putdonationreq(don_num, donationInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["donations"], (old: Donation[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...updatedData } : donation
        )
      );
      queryClient.invalidateQueries({ queryKey: ["donations"] });
      toast.success("Donation updated successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update donation");
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['donations'] });
      const previousDonations = queryClient.getQueryData(['donations']);
      
      queryClient.setQueryData(['donations'], (old: Donation[] = []) => 
        old.map(donation => 
          donation.don_num === variables.don_num ? { ...donation, ...variables.donationInfo } : donation
        )
      );
      return { previousDonations };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    }
  });
};