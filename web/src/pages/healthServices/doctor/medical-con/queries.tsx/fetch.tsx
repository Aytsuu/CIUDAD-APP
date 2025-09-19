import { useQuery } from '@tanstack/react-query';
import { getPESections, getPEOptions } from '../restful-api/get';

export const usePhysicalExamQueries = () => {
  const sectionsQuery = useQuery({
    queryKey: ['peSections'],
    queryFn: getPESections,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const optionsQuery = useQuery({
    queryKey: ['peOptions'],
    queryFn: getPEOptions,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    sectionsQuery,
    optionsQuery,
    isPeLoading: sectionsQuery.isLoading || optionsQuery.isLoading,
  };
};