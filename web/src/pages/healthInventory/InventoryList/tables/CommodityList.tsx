import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { CommodityRecords, CommodityColumns } from "./columns/commodityCol";
import { useCommodities } from "../queries/commodity/CommodityFetchQueries";
import { useDeleteCommodity } from "../queries/commodity/CommodityDeleteQueries";
import { CommodityModal } from "../Modal/CommodityModal";

export default function CommodityList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [comToDelete, setComToDelete] = useState<string | null>(null);
  const [showCommodityModal, setShowCommodityModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityRecords | null>(null);

  const columns = CommodityColumns(setComToDelete, setIsDeleteConfirmationOpen, setSelectedCommodity, setModalMode, setShowCommodityModal);

  // Check what the hook actually returns
  const { data: commoditiesData, isLoading: isLoadingCommodities } = useCommodities();
  const deleteMutation = useDeleteCommodity();

  const formatCommodityData = useCallback((): CommodityRecords[] => {
    // Handle different possible data structures
    if (!commoditiesData) return [];
    
    // Check if data is an array directly
    if (Array.isArray(commoditiesData)) {
      return commoditiesData.map((commodity: any) => ({
        id: commodity.com_id,
        com_name: commodity.com_name,
        user_type: commodity.user_type,
        gender_type: commodity.gender_type
      }));
    }
    
    // Check if data is in a nested property (common with API responses)
    if (commoditiesData.data && Array.isArray(commoditiesData.data)) {
      return commoditiesData.data.map((commodity: any) => ({
        id: commodity.com_id,
        com_name: commodity.com_name,
        user_type: commodity.user_type,
        gender_type: commodity.gender_type
      }));
    }
    
    // Check if data is in a results property
    if (commoditiesData.results && Array.isArray(commoditiesData.results)) {
      return commoditiesData.results.map((commodity: any) => ({
        id: commodity.com_id,
        com_name: commodity.com_name,
        user_type: commodity.user_type,
        gender_type: commodity.gender_type
      }));
    }
    
    // Fallback: return empty array if structure is unexpected
    console.warn("Unexpected commodities data structure:", commoditiesData);
    return [];
  }, [commoditiesData]);

  const filteredCommodities = useMemo(() => {
    const formattedData = formatCommodityData();
    return formattedData.filter((record) => 
      Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatCommodityData]);

  const handleDelete = () => {
    if (comToDelete === null) return;
    deleteMutation.mutate(comToDelete);
    setIsDeleteConfirmationOpen(false);
    setComToDelete(null);
  };

  const totalPages = Math.ceil(filteredCommodities.length / pageSize);
  const paginatedCommodities = filteredCommodities.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddNew = () => {
    setModalMode("add");
    setSelectedCommodity(null);
    setShowCommodityModal(true);
  };

  return (
    <div className="relative">
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
                if (value >= 1) {
                  setPageSize(value);
                } else {
                  setPageSize(1);
                }
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
          {isLoadingCommodities ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={paginatedCommodities} />
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredCommodities.length)} of {filteredCommodities.length} rows
          </p>
          {paginatedCommodities.length > 0 && <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
        </div>
      </div>

      <ConfirmationDialog isOpen={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen} onConfirm={handleDelete} title="Delete Commodity" description="Are you sure you want to delete this commodity? This action cannot be undone." />

      {showCommodityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <CommodityModal mode={modalMode} initialData={selectedCommodity ?? undefined} onClose={() => setShowCommodityModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
}