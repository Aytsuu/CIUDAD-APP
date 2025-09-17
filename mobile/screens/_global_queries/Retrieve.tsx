import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useGetSitio = () => {
  return useQuery({
    queryKey: ["sitioList"],
    queryFn: async () => {
      const res = await api.get("profiling/sitio/list/");
      return res.data;
    },
    staleTime: 5000,
  });
};

export const usePositions = (staff_type: string) => {
  return useQuery({
    queryKey: ["positions", staff_type],
    queryFn: async () => {
      const res = await api.get("administration/position/", {
        params: { staff_type },
      });

      console.log("Positions:", JSON.stringify(res.data, null, 2));

      return res.data;
    },
    staleTime: 5000,
  });
};
