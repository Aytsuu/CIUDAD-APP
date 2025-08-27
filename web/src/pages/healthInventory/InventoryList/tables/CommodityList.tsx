import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
// import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { CommodityRecords, CommodityColumns } from "./columns/commodityCol";
import { useCommodities } from "../queries/commodity/CommodityFetchQueries";
import { Link } from "react-router";
import { useDeleteCommodity } from "../queries/commodity/CommodityDeleteQueries";


export default function CommodityList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [comToDelete, setComToDelete] = useState<string | null>(null);
  // const queryClient = useQueryClient();
  const { data: commodities, isLoading: isLoadingCommodities } = useCommodities();

  const formatCommodityData = useCallback((): CommodityRecords[] => {
    if (!commodities) return [];
    return commodities.map((commodity: any) => ({
      id: commodity.com_id,
      com_name: commodity.com_name,
      user_type: commodity.user_type,
    }));
  }, [commodities]);

  const filteredCommodities = useMemo(() => {
    return formatCommodityData().filter((record) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatCommodityData]);

  const deleteCommodityMutation = useDeleteCommodity();

  const handleDelete = () => {
    if (comToDelete === null) return;
    
    deleteCommodityMutation.mutate(comToDelete);
    setIsDeleteConfirmationOpen(false);
    setComToDelete(null);
  };
  if (isLoadingCommodities) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const totalPages = Math.ceil(filteredCommodities.length / pageSize);
  const paginatedCommodities = filteredCommodities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = CommodityColumns( setComToDelete, setIsDeleteConfirmationOpen);

  return (
    <div>
      <div className="hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
              size={17}
            />
            <Input
              placeholder="Search..."
              className="pl-10 bg-white w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
       
            <Button>
          <Link
            to="/addCommodityList"
            className="flex justify-center items-center gap-2 px-2"
          >
            <Plus size={15} /> New
          </Link>
        </Button>
        </div>
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
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <DataTable columns={columns} data={paginatedCommodities} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredCommodities.length)} of{" "}
            {filteredCommodities.length} rows
          </p>
          {paginatedCommodities.length > 0 && (
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={handleDelete}
        title="Delete Commodity"
        description="Are you sure you want to delete this commodity? This action cannot be undone."
      />
    </div>
  );
}