import React, { useCallback, useMemo } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { FirstAidColumns, FirstAidRecords } from "./columns/FirstAidCol";
import { useFirstAid } from "../queries/firstAid/FirstAidFetchQueries";
import { handleDeleteFirstAidList } from "../restful-api/firstAid/FirstAidDeleteAPI";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { Link } from "react-router";

export default function FirstAidList() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = React.useState(false);
  const [faToDelete, setFaToDelete] = React.useState<string | null>(null);
  const queryClient = useQueryClient();
  const { data: firstAidData, isLoading: isLoadingFirstAid } = useFirstAid();

  const formatFirstAidData = useCallback((): FirstAidRecords[] => {
    if (!firstAidData) return [];
    return firstAidData.map((firstAid: any) => ({
      id: firstAid.fa_id,
      fa_name: firstAid.fa_name,
      cat_id: firstAid.cat,
      cat_name: firstAid.catlist,
    }));
  }, [firstAidData]);

  const filteredFirstAid = useMemo(() => {
    return formatFirstAidData().filter((record) =>
      Object.values(record)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatFirstAidData]);

  const handleDelete = async () => {
    if (faToDelete === null) return;

    try {
      await handleDeleteFirstAidList(faToDelete);
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
      toast.success('First aid item deleted successfully', {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    } catch (error) {
      toast.error('Failed to delete first aid item', {
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
      console.error("Delete error:", error);
    } finally {
      setIsDeleteConfirmationOpen(false);
      setFaToDelete(null);
    }
  };

  const totalPages = Math.ceil(filteredFirstAid.length / pageSize);
  const paginatedFirstAid = filteredFirstAid.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const columns = FirstAidColumns(setFaToDelete, setIsDeleteConfirmationOpen);

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
        <div className="flex gap-2">
         
        <Button>
          <Link
            to="/addFirstAidList"
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