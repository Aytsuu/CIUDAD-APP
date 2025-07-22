import { useQuery} from "@tanstack/react-query";

import {
  getFeatures,
  getPositions,
  getStaffs,
  getAllAssignedFeatures,
} from "../restful-api/administrationGetAPI";
import { api } from "@/api/api";
import { getResidentsListHealth } from "@/pages/record/health-family-profiling/family-profling/restful-api/profilingGetAPI";
import {
  getFeaturesHealth,
  getPositionsHealth,
  getStaffsHealth,
  getAllAssignedFeaturesHealth,
} from "../restful-api/administrationGetAPI";
import { api2 } from "@/api/api";

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

//------------Health Administration Fetch Queries------------------

// Fetching
export const useResidentsHealth = () => {
  return useQuery({
    queryKey: ["residentsHealth"],
    queryFn: getResidentsListHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStaffsHealth = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["staffsHealth", page, pageSize, searchQuery],
    queryFn: () => getStaffsHealth(page, pageSize, searchQuery),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositionsHealth = () => {
  return useQuery({
    queryKey: ["positionsHealth"],
    queryFn: getPositionsHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useFeaturesHealth = () => {
  return useQuery({
    queryKey: ["featuresHealth"],
    queryFn: getFeaturesHealth, 
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllAssignedFeaturesHealth = () => {
  return useQuery({
    queryKey: ["allAssignedFeaturesHealth"],
    queryFn: getAllAssignedFeaturesHealth,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePositionGroupsHealth = () => {
  return useQuery({
    queryKey: ['positionGroupsHealth'],
    queryFn: async () => {
      try {
        const res = await api2.get('administration/position/group/list/');
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}