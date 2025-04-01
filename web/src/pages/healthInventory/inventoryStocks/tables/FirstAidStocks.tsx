import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Minus, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import FirstAidStockForm from "../addstocksModal/FirstAidStockModal";
import UsedFAModal from "../addstocksModal/UsedFAModal";
import EditFirstAidStockForm from "../editModal/EditFirstAidStockModal";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { handleDeleteFirstAidStocks } from "../REQUEST/Delete";
import { getFirstAidStocks } from "../REQUEST/Get";

export type FirstAidStocksRecord = {
  finv_id: number;
  firstAidInfo: {
    fa_name: string;
  };
  expiryDate: string;
  category: string;
  qty: {
    finv_qty: number;
    finv_pcs: number;
  };
  finv_qty_unit: string;
  availQty: string;
  used: string;
};

export default function FirstAidStocks() {
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [firstAidStockDelete, setFirstAidStockDelete] = useState<number | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch first aid stocks using useQuery
  const { data: firstAidStocks, isLoading: isLoadingFirstAid } = useQuery({
    queryKey: ["firstaidinventorylist"],
    queryFn: getFirstAidStocks,
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatFirstAidStocksData = React.useCallback((): FirstAidStocksRecord[] => {
    if (!firstAidStocks) return [];
    return firstAidStocks.map((firstAidStock: any) => ({
      finv_id: firstAidStock.finv_id,
      firstAidInfo: {
        fa_name: firstAidStock.fa_detail?.fa_name,
      },
      expiryDate: firstAidStock.inv_detail?.expiry_date,
      category: firstAidStock.cat_detail?.cat_name,
      qty: {
        finv_qty: firstAidStock.finv_qty,
        finv_pcs: firstAidStock.finv_pcs,
      },
      finv_qty_unit: firstAidStock.finv_qty_unit,
      availQty: firstAidStock.finv_qty_avail,
      used: firstAidStock.finv_used,
    }));
  }, [firstAidStocks]);

  const filteredData = React.useMemo(() => {
    return formatFirstAidStocksData().filter((record) =>
      Object.values(record.firstAidInfo)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatFirstAidStocksData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDeleteFirstAid = (finv_id: number) => {
    setFirstAidStockDelete(finv_id);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteFirstAid = async () => {
    if (firstAidStockDelete !== null) {
      await handleDeleteFirstAidStocks(firstAidStockDelete, () => {
        queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      });
      setIsDeleteConfirmationOpen(false);
      setFirstAidStockDelete(null);
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

  const columns: ColumnDef<FirstAidStocksRecord>[] = [
    {
      accessorKey: "finv_id",
      header: "Batch No.",
      cell: ({ row }) => <div className="text-center">{row.original.finv_id}</div>,
    },
    {
      accessorKey: "firstAidInfo",
      header: "Item Name",
      cell: ({ row }) => {
        const firstAid = row.original.firstAidInfo;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{firstAid.fa_name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Stocks",
      cell: ({ row }) => {
        const { finv_qty, finv_pcs } = row.original.qty;
        const unit = row.original.finv_qty_unit;
        return (
          <div className="text-center">
            {finv_pcs > 0 ? (
              <div className="flex flex-col">
                <span className="text-blue">{finv_qty} box/es</span>
                <span className="text-red-500"> ({finv_pcs} pcs per box)</span>
              </div>
            ) : (
              <span className="text-blue">
                {finv_qty} {unit}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "used",
      header: "Used",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-red-700">
            {row.original.used || 0}
          </span>
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <button className="flex items-center justify-center w-7 h-5 text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                    <Minus size={15} />
                  </button>
                }
                mainContent={<UsedFAModal />}
              />
            }
            content="Used Items"
          />
        </div>
      ),
    },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-center text-green-700">
          {row.original.qty.finv_pcs > 0
            ? `${row.original.qty.finv_qty * row.original.qty.finv_pcs} pcs`
            : `${row.original.availQty} ${row.original.finv_qty_unit}`}
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.expiryDate}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <>
            <div className="flex gap-2">
              <div className="flex justify-center gap-2">
                <TooltipLayout
                  trigger={
                    <DialogLayout
                      trigger={
                        <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                          <Edit size={16} />
                        </div>
                      }
                      mainContent={
                        <EditFirstAidStockForm
                          initialData={row.original}
                          setIsDialog={setIsDialog}
                        />
                      }
                    />
                  }
                  content="Edit"
                />
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteFirstAid(row.original.finv_id)}
                >
                  <Trash />
                </Button>
              </div>
            </div>
          </>
        );
      },
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter by"
              label=""
              className="bg-white"
              options={[
                { id: "1", name: "" },
                { id: "2", name: "By date" },
                { id: "3", name: "By category" },
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
          title="First Aid Items"
          description="Add New First Aid Item"
          mainContent={<FirstAidStockForm setIsDialog={setIsDialog} />}
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
          <DataTable columns={columns} data={paginatedData} />
        </div>
        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {paginatedData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{" "}
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={confirmDeleteFirstAid}
        title="Delete First Aid Item"
        description="Are you sure you want to delete this first aid item? This action cannot be undone."
      />
    </>
  );
}