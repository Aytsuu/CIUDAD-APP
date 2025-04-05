import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput, Edit } from "lucide-react";
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
import CommodityStockForm from "../addstocksModal/ComStockModal";
import EditCommodityStockForm from "../editModal/EditComStockModal";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getCommodityStocks } from "../REQUEST/Get";
import { archiveInventory } from "../REQUEST/archive";


export type CommodityStocksRecord = {
  cinv_id: number;
  commodityInfo: {
    com_name: string;
  };
  expiryDate: string;
  category: string;
  qty: {
    cinv_qty: number;
    cinv_pcs: number;
  };
  cinv_qty_unit: string;
  availQty: string;
  dispensed: string;
  recevFrom: string;
  inv_id: number;
};

export default function CommodityStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [commodityToArchive, setCommodityToArchive] = useState<number | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: commodityStocks, isLoading: isLoadingCommodities } = useQuery({
    queryKey: ["commodityinventorylist"],
    queryFn: getCommodityStocks,
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatCommodityStocksData = React.useCallback((): CommodityStocksRecord[] => {
    if (!commodityStocks) return [];
    return commodityStocks
      .filter((stock: any) => !stock.inv_detail?.is_Archived)
      .map((commodityStock: any) => ({
        cinv_id: commodityStock.cinv_id,
        commodityInfo: {
          com_name: commodityStock.com_detail?.com_name,
        },
        expiryDate: commodityStock.inv_detail?.expiry_date,
        category: commodityStock.cat_detail?.cat_name,
        qty: {
          cinv_qty: commodityStock.cinv_qty,
          cinv_pcs: commodityStock.cinv_pcs,
        },
        cinv_qty_unit: commodityStock.cinv_qty_unit,
        availQty: commodityStock.cinv_qty_avail,
        dispensed: commodityStock.cinv_dispensed,
        recevFrom: commodityStock.cinv_recevFrom,
        inv_id:commodityStock.inv_id
      }));
  }, [commodityStocks]);

  const filteredData = React.useMemo(() => {
    return formatCommodityStocksData().filter((record) =>
      Object.values(record.commodityInfo)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatCommodityStocksData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleArchiveInventory = (inv_id: number) => {
    setCommodityToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };

  const confirmArchiveInventory = async () => {
    console.log(commodityToArchive) 
    if (commodityToArchive !== null) {
      try {
        await archiveInventory(commodityToArchive);
        queryClient.invalidateQueries({ queryKey: ["commodityinventorylist"] });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
      } finally {
        setIsArchiveConfirmationOpen(false);
        setCommodityToArchive(null);
      }
    }
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

  const columns: ColumnDef<CommodityStocksRecord>[] = [
    {
      accessorKey: "commodityInfo",
      header: "Commodity",
      cell: ({ row }) => {
        const commodity = row.original.commodityInfo;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{commodity.com_name}</span>
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
      accessorKey: "recevFrom",
      header: "Received From",
      cell: ({ row }) => (
        <div className="text-center">{row.original.recevFrom}</div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Stocks",
      cell: ({ row }) => {
        const { cinv_qty, cinv_pcs } = row.original.qty;
        const unit = row.original.cinv_qty_unit;
        return (
          <div className="text-center">
            {cinv_pcs > 0 ? (
              <div className="flex flex-col">
                <span className="text-blue">{cinv_qty} box/es</span>
                <span className="text-red-500"> ({cinv_pcs} pcs per box)</span>
              </div>
            ) : (
              <span className="text-blue">
                {cinv_qty} {unit}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "dispensed",
      header: "Dispensed",
      cell: ({ row }) => (
        <div className="text-red-700">{row.original.dispensed}</div>
      ),
    },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-green-700">
          {row.original.qty.cinv_pcs > 0
            ? `${row.original.qty.cinv_qty * row.original.qty.cinv_pcs} pcs`
            : `${row.original.availQty} ${row.original.cinv_qty_unit}`}
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
          <div className="flex gap-2">
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                      <Edit size={16} />
                    </div>
                  }
                  mainContent={
                    <EditCommodityStockForm
                      initialData={row.original}
                      setIsDialog={setIsDialog}
                    />
                  }
                />
              }
              content="Edit"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleArchiveInventory(row.original.inv_id)}
            >
              <Trash />
            </Button>
          </div>
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
          title="Commodity List"
          description="Add New Commodity"
          mainContent={<CommodityStockForm setIsDialog={setIsDialog} />}
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
                setPageSize(value >= 1 ? value : 1);
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

      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveInventory}
        title="Archive Inventory Item"
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />
    </>
  );
}