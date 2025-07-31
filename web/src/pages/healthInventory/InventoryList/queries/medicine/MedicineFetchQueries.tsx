import { useQuery } from "@tanstack/react-query";
import { getMedicines } from "../../restful-api/medicine/MedicineFetchAPI";

export const useMedicines = () => {
    return useQuery({
      queryKey: ["medicines"],
      queryFn: getMedicines,
      refetchOnMount: true,
      staleTime: 0,
    });
  };