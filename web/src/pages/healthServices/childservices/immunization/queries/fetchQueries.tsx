import { useQuery } from '@tanstack/react-query';
import { fetchVaccineStocks } from '../restful-api/fetchAPI';

export const useVaccinesListImmunization = () => {
  return useQuery({
    queryKey: ['vaccineListImmunization'],
    queryFn: fetchVaccineStocks,
    staleTime: 5 * 60 * 1000, 
    retry: 2, 
  });
};