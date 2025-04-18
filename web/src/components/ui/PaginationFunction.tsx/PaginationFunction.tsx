import { useState, useEffect } from "react";

export function usePagination<T extends Record<string, any>>(
  data: T[],
  initialPageSize: number
) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [currentData, setCurrentData] = useState<T[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // Filter data based on search query
  useEffect(() => {
    const filtered = data.filter((item) => {
      const searchText = Object.values(item).join(" ").toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1); // Reset to first page when search or page size changes
  }, [searchQuery, pageSize, data]);

  // Paginate filtered data
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  // Handlers for search, page size, and page change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setPageSize(!isNaN(value) && value > 0 ? value : initialPageSize);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    searchQuery,
    pageSize,
    currentPage,
    currentData,
    totalPages,
    handleSearchChange,
    handlePageSizeChange,
    handlePageChange,
  };
}
