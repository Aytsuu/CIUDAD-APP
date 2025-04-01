// FirstAidList.tsx
import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { handleDeleteFirstAidList } from "../requests/DeleteRequest";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { FirstAidColumns } from "./MedicineListColumsn";
import { FirstAidRecords } from "./MedicineListColumsn";
import { getTransactionFirstAid } from "../requests/GetRequest";

export default function FirstAidList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    React.useState(false);
  const [faToDelete, setFaToDelete] = React.useState<number | null>(null);
  const [isDialog, setIsDialog] = React.useState(false);
  const queryClient = useQueryClient();

  // Fetch first aid data using useQuery
  const { data: firstAidData, isLoading: isLoadingFirstAid } = useQuery({
    queryKey: ["TransactionfirstAid"],
    queryFn: getTransactionFirstAid,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Format first aid data
  const formatFirstAidData = React.useCallback(() => {
    if (!firstAidData) return [];
    return firstAidData.map((firstAid: any) => ({
      fat_id: firstAid.fat_id,
      fa_name: firstAid.fa_name,
      fat_qty: firstAid.fat_qty,
      fat_action: firstAid.fat_action,
      staff: firstAid.staff,
      created_at: new Date(firstAid.created_at).toLocaleDateString()
    }));
  }, [firstAidData]);


  const filteredFirstAid = React.useMemo(() => {
    return formatFirstAidData().filter((record: FirstAidRecords) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatFirstAidData]);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(filteredFirstAid.length / pageSize);

  // Slice the data for the current page
  const paginatedFirstAid = filteredFirstAid.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle delete operation
  const handleDelete = async () => {
    if (faToDelete !== null) {
      await handleDeleteFirstAidList(faToDelete, () => {
        queryClient.invalidateQueries({ queryKey: ["firstAid"] });
      });
      setIsDeleteConfirmationOpen(false);
      setFaToDelete(null);
    }
  };

  // Generate columns using FirstAidColumns
  const columns = FirstAidColumns();

  if (isLoadingFirstAid) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

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
                  setPageSize(1); // Reset to 1 if invalid
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
          <DataTable columns={columns} data={paginatedFirstAid} />
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
          <p className="text-xs sm:text-sm text-darkGray">
            Showing {(currentPage - 1) * pageSize + 1}-
            {Math.min(currentPage * pageSize, filteredFirstAid.length)} of{" "}
            {filteredFirstAid.length} rows
          </p>
          {paginatedFirstAid.length > 0 && (
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
        title="Delete First Aid Item"
        description="Are you sure you want to delete this first aid item? This action cannot be undone."
      />
    </div>
  );
}