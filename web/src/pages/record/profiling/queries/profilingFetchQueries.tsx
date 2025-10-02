import { useQuery } from "@tanstack/react-query";
import {
  getActiveBusinesses,
  getBusinessRespondent,
  getFamFilteredByHouse,
  getFamiliesTable,
  getFamilyComposition,
  getFamilyData,
  getFamilyMembers,
  getHouseholdList,
  getHouseholdTable,
  getPendingBusinesses,
  getPerAddressesList,
  getPersonalInfo,
  getRequests,
  getResidentsFamSpecificList,
  getResidentsList,
  getResidentsTable,
  getResidentsWithFamExclusion,
  getSitioList,
} from "../restful-api/profilingGetAPI";
import { api } from "@/api/api";

// ================ ALL =================
export const useProfilingAllRecord = (
  page: number,
  pageSize: number,
  searchQuery: string,
) => {
  return useQuery({
    queryKey: ['profilingAllRecord', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/all/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
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
 
// ================ ADDRESS =================
export const usePerAddressesList = () => {
  return useQuery({
    queryKey: ["perAddressesList"],
    queryFn: () => getPerAddressesList(),
    staleTime: 5000,
  });
};

// ================ RESIDENTS ================ (Status: Optmizing....)
export const usePersonalInfo = (residentId: string) => {
  return useQuery({
    queryKey: ['personalInfo', residentId],
    queryFn: () => getPersonalInfo(residentId),
    staleTime: 5000
  })
}

export const usePersonalHistory = (per_id: string) => {
  return useQuery({
    queryKey: ['personalHistory', per_id],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/personal/history/', {
          params: {
            per_id
          }
        });

        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!per_id
  })
}

export const usePersonalModification = (per_id?: string) => {
  return useQuery({
    queryKey: ['personalModification', per_id],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/personal/modification-list/", {
          params: {
            per: per_id
          }
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useResidentsList = (
  is_staff: boolean = false,
  exclude_independent: boolean = false,
  isSearchOnly: boolean = false,
  search: string = "",
  disable: boolean = false
) => {
  return useQuery({
    queryKey: ["residentsList", search, isSearchOnly, is_staff, exclude_independent, disable],
    queryFn: () => {
      if(disable) return [];
      return getResidentsList(is_staff, exclude_independent, isSearchOnly, search)
    },
    staleTime: 5000,  
  });
};

export const useResidentsTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["residentsTableData", page, pageSize, searchQuery],
    queryFn: () => getResidentsTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useResidentsWithFamExclusion = (familyId: string) => {
  return useQuery({
    queryKey: ["residentsWithFamExclusion", familyId],
    queryFn: () => getResidentsWithFamExclusion(familyId),
    staleTime: 5000,
  });
};

export const useResidentsFamSpecificList = (familyId: string) => {
  return useQuery({
    queryKey: ["residentsFamSpecificList", familyId],
    queryFn: () => getResidentsFamSpecificList(familyId),
    staleTime: 5000,
  });
};

export const useRequests = (
  page: number,
  pageSize: number,
  searchQuery: string,
  selectedRequestType: string
) => {
  return useQuery({
    queryKey: ["requests", page, pageSize, searchQuery, selectedRequestType],
    queryFn: () =>
      getRequests(page, pageSize, searchQuery, selectedRequestType),
    staleTime: 5000,
  });
};

export const useRequestCount = () => {
  return useQuery({
    queryKey: ["requestCount"],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/request/count/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
  });
};

export const useSitioList = () => {
  return useQuery({
    queryKey: ["sitioList"],
    queryFn: getSitioList,
    staleTime: 5000,
  });
};

// ================ FAMILIES ================ (Status: Optmizing....)
export const useFamiliesTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["familiesTableData", page, pageSize, searchQuery],
    queryFn: () => getFamiliesTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useFamilyData = (familyId: string) => {
  return useQuery({
    queryKey: ["familyData", familyId],
    queryFn: () => getFamilyData(familyId),
    staleTime: 5000,
  });
};

export const useFamilyMembers = (familyId: string) => {
  // if(!familyId) return [];
  return useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: () => getFamilyMembers(familyId),
    staleTime: 5000,
  });
};

export const useFamFilteredByHouse = (householdId: string) => {
  return useQuery({
    queryKey: ["famFilteredByHouse", householdId],
    queryFn: () => getFamFilteredByHouse(householdId),
    staleTime: 5000,
  });
};

export const useFamilyComposition = () => {
  return useQuery({
    queryKey: ["familyCompositions"],
    queryFn: getFamilyComposition,
    staleTime: 5000,
  });
};

// ================ BUSINESS ================
export const useActiveBusinesses = (
  page: number,
  pageSize: number,
  searchQuery: string,
) => {
  return useQuery({
    queryKey: ["activeBusinesses", page, pageSize, searchQuery],
    queryFn: () => getActiveBusinesses(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const usePendingBusinesses = (
  page: number,
  pageSize: number,
  searchQuery: string,
) => {
  return useQuery({
    queryKey: ["pendingBusinesses", page, pageSize, searchQuery],
    queryFn: () => getPendingBusinesses(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useBusinessRespondent = (
  page: number,
  pageSize: number,
  searchQuery: string,
) => {
  return useQuery({
    queryKey: ["businessesRespondent", page, pageSize, searchQuery],
    queryFn: () => getBusinessRespondent(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

export const useBusinessInfo = (busId: number) => {
  return useQuery({
    queryKey: ["businessInfo", busId],
    queryFn: async () => {
      if (!busId) return null;
      
      try {
        const res = await api.get(`profiling/business/${busId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!busId
  });
}

export const useBusinessHistory = (busId: string) => {
  return useQuery({
    queryKey: ['businessHistory', busId],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/history/', {
          params: {
            bus_id: busId
          }
        });
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!busId
  })
}

export const useOwnedBusinesses = (data: Record<string, any>) => {
  return useQuery({
    queryKey: ['ownedBusinesses', data],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/specific/ownership', {
          params: data
        });

        return res.data;
      } catch (err){
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useRespondentInfo = (respondentId: string) => {
  return useQuery({
    queryKey: ['respondentInfo', respondentId],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/business/respondent/${respondentId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useModificationRequests = () => {
  return useQuery({
    queryKey: ['modificationRequests'],
    queryFn: async () => {
      try {
        const res = await api.get('profiling/business/modification/request-list/');
        return res.data
      } catch (err) {
        console.error(err);
        throw(err);
      }
    },
    staleTime: 5000
  })
}


// ================ HOUSEHOLDS ================ (Status: Optmizing....)
export const useHouseholdsList = (search: string) => {
  return useQuery({
    queryKey: ["householdsList", search],
    queryFn: () => getHouseholdList(search),
    staleTime: 5000,
  });
};

export const useHouseholdData = (hh_id: string) => {
  return useQuery({
    queryKey: ["householdData", hh_id],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/household/${hh_id}/data/`)
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}

export const useHouseholdTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["householdTable", page, pageSize, searchQuery],
    queryFn: () => getHouseholdTable(page, pageSize, searchQuery),
    staleTime: 5000,
  });
};

// ================ VOTER ================ (Status: Optmizing....)
export const useVoterTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["voterTable", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/voter/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
          }
        });
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    }
  })
}