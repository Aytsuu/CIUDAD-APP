import { useQuery } from "@tanstack/react-query";
import { getHealthStaffList } from "../restful-api/administrationGetAPI";

export const useHealthStaffList = () => {
  return useQuery({
    queryKey: ["healthStaffList"],
    queryFn: getHealthStaffList,
    staleTime: 5000,
  });
};
