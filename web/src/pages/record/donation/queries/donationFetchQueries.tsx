import { useQuery } from "@tanstack/react-query";
import { getdonationreq, getPersonalList, getDonationById, getStaffList } from "../request-db/donationGetRequest";
import { Donations, Personal, Staff } from "../donation-types";

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

export const useGetDonationById = (don_num: string) => {
  return useQuery<Donations, Error>({
    queryKey: ["donation", don_num],
    queryFn: () => getDonationById(don_num),
    enabled: !!don_num,
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetPersonalList = () => {
  return useQuery<Personal[], Error>({
    queryKey: ["personalList"],
    queryFn: () => getPersonalList().catch((error) => {
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetStaffList = () => {
  return useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: () => getStaffList(),
    staleTime: 1000 * 60 * 5,
  });
};