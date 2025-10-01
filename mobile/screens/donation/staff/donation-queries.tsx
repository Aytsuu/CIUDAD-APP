import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import {
  postdonationreq,
  putdonationreq,
  getdonationreq,
  getPersonalList,
} from "./donation-requests";
import { DonationInput, Donation, Personal, Donations } from "../donation-types";

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

export const useGetDonations = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  category?: string,
  status?: string
) => {
  return useQuery<{ results: Donations[]; count: number }, Error>({
    queryKey: ["donations", page, pageSize, searchQuery, category, status],
    queryFn: () => getdonationreq(page, pageSize, searchQuery, category, status),
    staleTime: 1000 * 60 * 5,
  });
};


export const useGetPersonalList = () => {
  const { toast } = useToastContext();

  return useQuery<Personal[], Error>({
    queryKey: ["personalList"],
    queryFn: () =>
      getPersonalList().catch((error) => {
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
    mutationFn: ({
      don_num,
      donationInfo,
    }: {
      don_num: string;
      donationInfo: Partial<Donation>;
    }) => putdonationreq(don_num, donationInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["donations"], (old: Donation[] = []) =>
        old.map((donation) =>
          donation.don_num === variables.don_num
            ? { ...donation, ...updatedData }
            : donation
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
      await queryClient.cancelQueries({ queryKey: ["donations"] });
      const previousDonations = queryClient.getQueryData(["donations"]);

      queryClient.setQueryData(["donations"], (old: Donation[] = []) =>
        old.map((donation) =>
          donation.don_num === variables.don_num
            ? { ...donation, ...variables.donationInfo }
            : donation
        )
      );
      return { previousDonations };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["donations"] });
    },
  });
};