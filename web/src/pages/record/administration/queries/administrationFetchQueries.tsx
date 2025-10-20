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
    staleTime: 5000
  });
};

export const usePositions = (staff_type?: string) => {
  return useQuery({
    queryKey: ["positions", staff_type],
    queryFn: () => getPositions(staff_type),
    staleTime: 5000
  });
};

export const useFeatures = (category: string) => {
  return useQuery({
    queryKey: ["features", category],
    queryFn: () => getFeatures(category),
    staleTime: 5000
  });
};

export const useAllAssignedFeatures = () => {
  return useQuery({
    queryKey: ["allAssignedFeatures"],
    queryFn: getAllAssignedFeatures,
    staleTime: 5000
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
    },
    staleTime: 5000
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

