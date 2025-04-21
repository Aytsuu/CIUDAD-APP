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
import { SelectLayout } from "@/components/ui/select/select-layout";
import MedicineStockForm from "../addstocksModal/MedStockModal";
import { ConfirmationDialog } from "../../../../components/ui/confirmationLayout/ConfirmModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMedicineStocks } from "../REQUEST/Get";
import { Skeleton } from "@/components/ui/skeleton";
import { archiveInventory } from "../REQUEST/archive";
import { MedicineStocksRecord } from "./columns/MedicineCol";
import { getColumns } from "./columns/MedicineCol";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { toast } from "sonner";
import { CircleCheck,Loader2 } from "lucide-react";

export default function MedicineStocks() {
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [medicineToArchive, setMedicineToArchive] = useState<number | null>(null);
  const [isDialog, setIsDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [editDialogStates, setEditDialogStates] = useState<Record<number, boolean>>({});
  const queryClient = useQueryClient();

  const { data: medicineStocks, isLoading: isLoadingMedicines } = useQuery({
    queryKey: ["medicineinventorylist"],
    queryFn: getMedicineStocks,
    refetchOnMount: true,
    staleTime: 0,
  });

  const setIsEditDialogOpen = (id: number | null, isOpen: boolean) => {
    if (id !== null) {
      setEditDialogStates(prev => ({
        ...prev,
        [id]: isOpen
      }));
    }
  };

  const formatMedicineStocksData = React.useCallback((): MedicineStocksRecord[] => {
    if (!medicineStocks) return [];
    return medicineStocks.map((medicineStock: any) => ({
      id: medicineStock.minv_id,
      minv_id: medicineStock.minv_id,
      medicineInfo: {
        medicineName: medicineStock.med_detail?.med_name,
        dosage: medicineStock.minv_dsg,
        dsgUnit: medicineStock.minv_dsg_unit,
        form: medicineStock.minv_form,
      },
      expiryDate: medicineStock.inv_detail?.expiry_date,
      category: medicineStock.cat_detail?.cat_name,
      qty: {
        qty: medicineStock.minv_qty,
        pcs: medicineStock.minv_pcs,
      },
      minv_qty_unit: medicineStock.minv_qty_unit,
      availQty: medicineStock.minv_qty_avail,
      distributed: medicineStock.minv_distributed,
      inv_id: medicineStock.inv_id,
    }));
  }, [medicineStocks]);

  const filteredData = React.useMemo(() => {
    return formatMedicineStocksData().filter((record) =>
      Object.values(record.medicineInfo)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, formatMedicineStocksData]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleArchiveInventory = (inv_id: number) => {
    setMedicineToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };

  const confirmArchiveInventory = async () => {
    if (medicineToArchive !== null) {
      setIsArchiveConfirmationOpen(false); // Immediately close the dialog
      
    const toastId = toast.loading(
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Archiving commodity...
      </div>,
      { duration: Infinity } // Show until replaced
    );
  
      try {
        await archiveInventory(medicineToArchive);
        queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });
        
        toast.success("Medicine item archived successfully", {
          id: toastId, // Replace the loading toast
          icon: <CircleCheck size={20} className="text-green-500" />,
          duration: 2000,
        });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        toast.error("Failed to archive medicine item", {
          id: toastId, // Replace the loading toast
          duration: 5000,
        });
      } finally {
        setMedicineToArchive(null);
      }
    }
  };
  if (isLoadingMedicines) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  const columns = getColumns(handleArchiveInventory, setIsEditDialogOpen, editDialogStates);

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
          title="Medicine List"
          description="Add New Medicine"
          mainContent={<MedicineStockForm setIsDialog={setIsDialog} />}
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
        title="Archive Medicine Item"
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />
    </>
  );
}