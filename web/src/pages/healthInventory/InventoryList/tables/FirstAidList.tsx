import React from "react";
import { useState, useMemo, useCallback } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, Loader2 } from "lucide-react";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { useFirstAid } from "../queries/firstAid/FirstAidFetchQueries";
import { useDeleteFirstAid } from "../queries/firstAid/FirstAidDeleteQueries";
import { FirstAidColumns, FirstAidRecords } from "./columns/FirstAidCol";
import { FirstAidModal } from "../addListModal/FirstAidModal";

export default function FirstAidList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [faToDelete, setFaToDelete] = useState<string | null>(null);
  const [showFirstAidModal, setShowFirstAidModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedFirstAid, setSelectedFirstAid] = useState<FirstAidRecords | null>(null);
  
  const columns = FirstAidColumns({
    onEdit: (firstAid: FirstAidRecords) => {
      setSelectedFirstAid(firstAid);
      setModalMode('edit');
      setShowFirstAidModal(true);
    },
    onDelete: (id: string) => {
      setFaToDelete(id);
      setIsDeleteConfirmationOpen(true);
    }
  });
  
  const { data: firstAidData, isLoading: isLoadingFirstAid } = useFirstAid();
  const deleteFirstAidMutation = useDeleteFirstAid();

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

  const handleDelete = () => {
    if (faToDelete === null) return;
    deleteFirstAidMutation.mutate(faToDelete);
    setIsDeleteConfirmationOpen(false);
    setFaToDelete(null);
  };

  const totalPages = Math.ceil(filteredFirstAid.length / pageSize);
  const paginatedFirstAid = filteredFirstAid.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleAddNew = () => {
    setModalMode('add');
    setSelectedFirstAid(null);
    setShowFirstAidModal(true);
  };

  return (
    <div className="relative">
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
              { id: "", name: "Export as PDF" },
            ]}
          />
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoadingFirstAid ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">loading....</span>
            </div>
          ) : (
            <DataTable columns={columns} data={paginatedFirstAid} />
          )}
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