import { useQuery } from "@tanstack/react-query";
import { 
        getScheduler,
        getService, getDays,

 } from "../restful-api/schedulerGetAPI";


export const useGetServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: getService,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false,
  })
}

export const useGetDays = () => {
  return useQuery({
    queryKey: ['days'],
    queryFn: getDays,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}

export const useGetScheduler = () => {
  return useQuery({
    queryKey: ['schedulers'],
    queryFn: getScheduler,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// export const useGetUniqueServices = () => {
//   return useQuery({
//     queryKey: ['unique-services'],
//     queryFn: getUniqueServices,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     refetchOnWindowFocus: false,
//   });
// };