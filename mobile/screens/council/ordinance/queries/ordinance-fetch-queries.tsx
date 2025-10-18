import { useQuery } from "@tanstack/react-query";
import { getOrdinances, OrdinanceData } from "../request/ordinance-get-request";

export type { OrdinanceData };

export const useOrdinances = (
    page: number = 1,
    pageSize: number = 10,
    searchQuery?: string, 
    categoryFilter?: string, 
    yearFilter?: string,
    isArchive?: boolean
) => {
    return useQuery<{ results: OrdinanceData[]; count: number; total_pages: number }>({
        queryKey: ["ordinancesData", page, pageSize, searchQuery, categoryFilter, yearFilter, isArchive], 
        queryFn: () => getOrdinances(page, pageSize, searchQuery, categoryFilter, yearFilter, isArchive),
        staleTime: 1000 * 60 * 30,
    });
};

