import { useState, useMemo, useCallback, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { useFirstAid } from "../queries/firstAid/fetch-queries";
import { useDeleteFirstAid } from "../queries/firstAid/delete-queries";
import { FirstAidColumns, FirstAidRecords } from "./columns/FirstAidCol";
import { FirstAidModal } from "../Modal/FirstAidModal";

export default function FirstAidList() {
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [faToDelete, setFaToDelete] = useState<string | null>(null);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedFirstAid, setSelectedFirstAid] = useState<FirstAidRecords | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const columns = FirstAidColumns({
    onEdit: (firstAid: FirstAidRecords) => {
      setSelectedFirstAid(firstAid);
      setModalMode("edit");
      setShowFirstAidModal(true);
    },
    onDelete: (id: string) => {
      setFaToDelete(id);
      setIsDeleteConfirmationOpen(true);
    }
  });

  const { data: firstAidData, isLoading: isLoadingFirstAid, error } = useFirstAid(currentPage, pageSize, searchQuery.trim() ? searchQuery.trim() : undefined);

  // Debug: Log API response
  useEffect(() => {
    console.log("First Aid Data Response:", firstAidData);
    console.log("API Error:", error);
  }, [firstAidData, error]);

  const deleteFirstAidMutation = useDeleteFirstAid();

  const formatFirstAidData = useCallback((): FirstAidRecords[] => {
    console.log("Formatting first aid data:", firstAidData);

    // Handle different response formats
    let firstAidResults = [];

    if (firstAidData?.results) {
      // Standard Django REST framework format
      firstAidResults = firstAidData.results;
    } else if (Array.isArray(firstAidData)) {
      // Old array format (fallback)
      firstAidResults = firstAidData;
    } else if (firstAidData?.results?.results) {
      // Handle nested format if needed
      firstAidResults = firstAidData.results.results;
    } else if (firstAidData?.data) {
      // If API returns data property
      firstAidResults = firstAidData.data;
    }

    return firstAidResults.map((firstAid: any) => ({
      id: firstAid.fa_id,
      fa_name: firstAid.fa_name,
      cat_id: firstAid.cat,
      cat_name: firstAid.catlist || "N/A"
    }));
  }, [firstAidData]);

  const displayData = useMemo(() => formatFirstAidData(), [formatFirstAidData]);

  const handleDelete = () => {
    if (faToDelete === null) return;
    deleteFirstAidMutation.mutate(faToDelete);
    setIsDeleteConfirmationOpen(false);
    setFaToDelete(null);
  };

  // Get pagination info from API response
  const paginationInfo = useMemo(() => {
    if (firstAidData) {
      // Handle nested format if needed
      if (firstAidData.results?.count) {
        return {
          totalCount: firstAidData.results.count,
          totalPages: firstAidData.results.total_pages || Math.ceil(firstAidData.results.count / pageSize),
          currentPage: firstAidData.results.current_page || currentPage
        };
      }

      // Standard Django REST framework format
      if (firstAidData.count !== undefined) {
        return {
          totalCount: firstAidData.count || 0,
          totalPages: Math.ceil((firstAidData.count || 0) / pageSize),
          currentPage: currentPage
        };
      }

      // Fallback for array response
      if (Array.isArray(firstAidData)) {
        return {
          totalCount: firstAidData.length,
          totalPages: Math.ceil(firstAidData.length / pageSize),
          currentPage: currentPage
        };
      }
    }
    return {
      totalCount: 0,
      totalPages: 0,
      currentPage: 1
    };
  }, [firstAidData, pageSize, currentPage]);

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedFirstAid(null);
    setShowFirstAidModal(true);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="relative">
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input 
              placeholder="Search first aid name..." 
              className="pl-10 bg-white w-full" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
            />
          </div>
        </div>
        <Button onClick={handleAddNew}>
          <div className="flex justify-center items-center gap-2 px-2">
            <Plus size={15} /> New
          </div>
        </Button>
      </div>

      <div className="bg-white rounded-md">
        <div className="flex justify-between p-3">
          <div className="flex items-center gap-2">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={(e) => {
                const value = +e.target.value;
                handlePageSizeChange(value >= 1 ? value : 1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <DropdownLayout
            trigger={
              <Button variant="outline" className="h-[2rem]">
                <FileInput /> Export
              </Button>
            }
            options={[
              { id: "", name: "Export as CSV" },
              { id: "", name: "Export as Excel" },
              { id: "", name: "Export as PDF" }
            ]}
          />
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoadingFirstAid ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading first aid items...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading first aid items. Please check console.</span>
            </div>
          ) : displayData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No first aid items found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={displayData} />
          )}
        </div>

        {displayData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
            <p className="text-xs sm:text-sm text-darkGray">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, paginationInfo.totalCount)} of {paginationInfo.totalCount} rows
            </p>
            {paginationInfo.totalPages > 1 && (
              <PaginationLayout 
                currentPage={currentPage} 
                totalPages={paginationInfo.totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </div>
        )}
      </div>

      <ConfirmationDialog 
        isOpen={isDeleteConfirmationOpen} 
        onOpenChange={setIsDeleteConfirmationOpen} 
        onConfirm={handleDelete} 
        title="Delete First Aid Item" 
        description="Are you sure you want to delete this first aid item? This action cannot be undone." 
      />

      {showFirstAidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <FirstAidModal 
              mode={modalMode} 
              initialData={selectedFirstAid ?? undefined} 
              onClose={() => setShowFirstAidModal(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}