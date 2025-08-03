import { useQuery} from "@tanstack/react-query";

import {
  getFeatures,
  getPositions,
  getStaffs,
  getAllAssignedFeatures,
} from "../restful-api/administrationGetAPI";
import { api } from "@/api/api";


export const useStaffs = (
  page: number, 
  pageSize: number, 
  searchQuery: string, 
  staffTypeFilter?: 'Barangay Staff' | 'Health Staff'
) => {
  return useQuery({
    queryKey: ["staffs", page, pageSize, searchQuery, staffTypeFilter],
    queryFn: () => getStaffs(page, pageSize, searchQuery, staffTypeFilter),
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

export const useGetStaffByTitle = (position: string) => {
  return useQuery({
    queryKey: ['staffByTitle', position]  ,
    queryFn: async () => {
      try {
        const res = await api.get('administration/staff/by-title/', {
          params: {
            pos_title: position
          }
        });
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    staleTime: 5000
  })
}

