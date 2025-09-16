import { useQuery } from '@tanstack/react-query';
import { fetchVaccineList } from '../restful-api/fetch-api';

export const useVaccinesListImmunization = () => {
  return useQuery({
    queryKey: ['vaccineListImmunization'],
    queryFn: fetchVaccineList,
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};


