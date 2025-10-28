import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";

export const useGetResidentLists = () => {
  return useQuery({
    queryKey: ["resident"],
    queryFn: async() => {
      try{
        const res = await api.get("complaint/residentLists/")
        return res.data;
      } catch (error){
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

