import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Edit } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import FirstAidModal from "../addListModal/FirstAidModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import { SelectLayout } from "@/components/ui/select/select-layout";
import EditFirstAidModal from "../editListModal/EditFirstAidModal";
import { getFirstAid } from "../requests/GetRequest";
import { usePagination } from "../../PaginationFunction.tsx/PaginationFunction";
import { ConfirmationDialog } from "../../confirmationLayout/ConfirmModal";
import { handleDeleteFirstAidList } from "../requests/DeleteRequest";

export default function FirstAidList() {
  type FirstAidRecords = {
    id: number;
    firstAidName: string;
  };
  const [data, setData] = useState<FirstAidRecords[]>([]);
  const [isDialog, setIsDialog] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [faDelete, setfaDelete] = useState<number | null>(null);

  const {
    searchQuery,
    pageSize,
    currentPage,
    currentData,
    totalPages,
    handleSearchChange,
    handlePageSizeChange,
    handlePageChange,
  } = usePagination<FirstAidRecords>(data, 10);

  const fetchData = async () => {
    const firstaid = await getFirstAid();
    if (firstaid) {
      const transformedData = firstaid.map((firstaid: any) => ({
        id: firstaid.fa_id,
        firstAidName: firstaid.fa_name,
      }));
      setData(transformedData);
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  // Open delete confirmation dialog
  const handleDeleteFa = (med_id: number) => {
    setfaDelete(med_id);
    setIsDeleteConfirmationOpen(true);
  };

  // Confirm deletion
  const confirmDeleteFa = async () => {
    if (faDelete !== null) {
      await handleDeleteFirstAidList(faDelete, setData);
      setIsDeleteConfirmationOpen(false);
      setfaDelete(null);
    }
  };

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
              <div className=" border  px-3 py-2 rounded cursor-pointer">
                <Edit size={16} />
              </div>
            }
            mainContent={<EditFirstAidModal initialData={row.original} fetchData={fetchData}  setIsDialog={setIsDialog} />}
          />

          <Button
            variant="destructive"
            size="sm"
            onClick={() => handleDeleteFa(row.original.id)}
          >
            <Trash />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <SelectLayout
              placeholder="Filter by"
              label=""
              className="bg-white"
              options={[
                { id: "1", name: "" },
                { id: "2", name: "By category" },
                { id: "3", name: "By item name" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
        <DialogLayout
          trigger={
            <div className="w-auto flex justify-end items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> New
            </div>
          }
          title="First Aid "
          description="Add New First Aid Item"
          mainContent={
            <FirstAidModal fetchData={fetchData} setIsDialog={setIsDialog} />
          }
          isOpen={isDialog}
          onOpenChange={setIsDialog}
        />
      </div>

      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input
              type="number"
              className="w-14 h-6"
              value={pageSize}
              onChange={handlePageSizeChange}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <FileInput />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as Excel</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          <DataTable columns={columns} data={currentData} />
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {currentData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{" "}
            {Math.min(currentPage * pageSize, data.length)} of {data.length}{" "}
            rows
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={confirmDeleteFa}
        title="Delete Medicine"
        description="Are you sure you want to delete this medicine? This action cannot be undone."
      />
    </>
  );
}
