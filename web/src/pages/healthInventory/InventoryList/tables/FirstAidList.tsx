import React from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Edit } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import FirstAidModal from "../addListModal/FirstAidModal";
import EditFirstAidModal from "../editListModal/EditFirstAidModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getFirstAid } from "../requests/GetRequest";
import { handleDeleteFirstAidList } from "../requests/DeleteRequest";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { MainLayoutComponent } from "@/components/ui/main-layout-component";
import { Skeleton } from "@/components/ui/skeleton";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";

type FirstAidRecords = {
  id: number;
  firstAidName: string;
};

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
    queryKey: ["firstAid"],
    queryFn: getFirstAid,
    refetchOnMount: true,
    staleTime: 0,
  });

  // Format first aid data
  const formatFirstAidData = React.useCallback((): FirstAidRecords[] => {
    if (!firstAidData) return [];
    return firstAidData.map((firstAid: any) => ({
      id: firstAid.fa_id,
      firstAidName: firstAid.fa_name,
    }));
  }, [firstAidData]);

  // Filter first aid data based on search query
  const filteredFirstAid = React.useMemo(() => {
    return formatFirstAidData().filter((record) =>
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

  const columns: ColumnDef<FirstAidRecords>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "firstAidName",
      header: "Item Name",
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <DialogLayout
            trigger={
              <Button variant="outline">
                <Edit size={16} />
              </Button>
            }
            mainContent={
              <EditFirstAidModal
                initialData={row.original}
                fetchData={formatFirstAidData}
                setIsDialog={setIsDialog}
              />
            }
          />
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setFaToDelete(row.original.id);
              setIsDeleteConfirmationOpen(true);
            }}
          >
            <Trash />
          </Button>
        </div>
      ),
    },
  ];

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
          <DialogLayout
            trigger={
              <Button className="bg-buttonBlue text-white hover:bg-buttonBlue/90">
                <Plus size={15} /> New
              </Button>
            }
            title="Add New First Aid Item"
            // mainContent={<FirstAidModal setIsDialog={setIsDialog}  />}
            mainContent={<></>}
            isOpen={isDialog}
            onOpenChange={setIsDialog}
          />
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
