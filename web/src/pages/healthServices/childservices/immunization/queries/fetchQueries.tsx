import { useQuery } from '@tanstack/react-query';
import { fetchVaccineList } from '../restful-api/fetchAPI';
import { getVaccintStocks } from '@/pages/healthServices/vaccination/restful-api/get';

export const useVaccinesListImmunization = () => {
  return useQuery({
    queryKey: ['vaccineListImmunization'],
    queryFn: fetchVaccineList,
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};


