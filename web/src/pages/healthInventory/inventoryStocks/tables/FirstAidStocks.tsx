import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import FirstAidStockForm from "../addstocksModal/FirstAidStockModal";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { getFirstAidStocks } from "../REQUEST/Get";
import { archiveInventory } from "../REQUEST/archive";
import { getColumns } from "../tables/columns/FirstAidCol";
import { toast } from "sonner";
import { CircleCheck,Loader2 } from "lucide-react";

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
  inv_id: number;
};

export default function FirstAidStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] =
    useState(false);
  const [firstAidToArchive, setFirstAidToArchive] = useState<number | null>(
    null
  );
  const [isDialog, setIsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { data: firstAidStocks, isLoading: isLoadingFirstAid } = useQuery({
    queryKey: ["firstaidinventorylist"],
    queryFn: getFirstAidStocks,
    refetchOnMount: true,
    staleTime: 0,
  });

  const formatFirstAidStocksData =
    React.useCallback((): FirstAidStocksRecord[] => {
      if (!firstAidStocks) return [];
      return firstAidStocks
        .filter((stock: any) => !stock.inv_detail?.is_Archived)
        .map((firstAidStock: any) => ({
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
          inv_id: firstAidStock.inv_id,
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

  const handleArchiveInventory = (inv_id: number) => {
    setFirstAidToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };
  const confirmArchiveInventory = async () => {
    if (firstAidToArchive !== null) {
      setIsArchiveConfirmationOpen(false); // Immediately close the dialog
      
    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Archiving commodity...
      </div>,
      { duration: Infinity } // Show until replaced
    );
  
      try {
        await archiveInventory(firstAidToArchive);
        queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
        
        toast.success("First aid item archived successfully", {
          id: toastId, // Replace the loading toast
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        toast.error("Failed to archive first aid item", {
          id: toastId, // Replace the loading toast
          duration: 5000,
        });
      } finally {
        setFirstAidToArchive(null);
      }
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
  const columns = getColumns(handleArchiveInventory, setIsDialog);

  return (
    <>
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17}  />
              <Input placeholder="Search..." className="pl-10 w-72 bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
            <Button>
              <Plus size={15} /> New
            </Button>
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