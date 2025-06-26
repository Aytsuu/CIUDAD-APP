import { useQuery} from "@tanstack/react-query";

import {
  getFeatures,
  getPositions,
  getStaffs,
  getAllAssignedFeatures,
} from "../restful-api/administrationGetAPI";
import { api } from "@/api/api";

export const useStaffs = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["staffs", page, pageSize, searchQuery],
    queryFn: () => getStaffs(page, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositions = () => {
  return useQuery({
    queryKey: ["positions"],
    queryFn: getPositions,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeatures = () => {
  return useQuery({
    queryKey: ["features"],
    queryFn: getFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeatures"],
    queryFn: getAllAssignedFeatures,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositionGroups = () => {
  return useQuery({
    queryKey: ['positionGroups'],
    queryFn: async () => {
      try {
        const res = await api.get('administration/position/group/list/');
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}