// import { useQuery } from "@tanstack/react-query";
// import { getServices, getUniqueServices } from "../restful-api/schedulerGetAPI";

// export const useGetServices = () => {
//   return useQuery({
//     queryKey: ['schedulers'],
//     queryFn: getServices,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// };

// export const useGetUniqueServices = () => {
//   return useQuery({
//     queryKey: ['unique-services'],
//     queryFn: getUniqueServices,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// };

import { useQuery } from "@tanstack/react-query";
import { getServices, getUniqueServices } from "../restful-api/schedulerGetAPI";

export const useGetServices = () => {
  return useQuery({
    queryKey: ['schedulers'],
    queryFn: getServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when the window is focused
    refetchOnReconnect: true, // Refetch when the app reconnects to the internet
    refetchInterval: 0, // No automatic refetching at a set interval
  });
};

export const useGetUniqueServices = () => {
  return useQuery({
    queryKey: ['unique-services'],
    queryFn: getUniqueServices,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when the window is focused
    refetchOnReconnect: true, // Refetch when the app reconnects to the internet
    refetchInterval: 0, // No automatic refetching at a set interval
  });
};
