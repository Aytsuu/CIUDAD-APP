// MedicineStocks.tsx - Updated version
"use client";
import { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileInput, Loader2, XCircle, Clock, CalendarOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { getColumns } from "./columns/MedicineCol";
import { useNavigate } from "react-router-dom";
import { useMedicineStockTable } from "../REQUEST/Medicine/queries/MedicineFetchQueries";
import { useArchiveMedicineStocks } from "../REQUEST/Archive/ArchivePutQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import WastedModal from "../addstocksModal/WastedModal";

type StockFilter = "all" | "low_stock" | "out_of_stock" | "near_expiry" | "expired";

export default function MedicineStocks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [medicineToArchive, setMedicineToArchive] = useState<string | null>(null);
  const [archiveContext, setArchiveContext] = useState({ isExpired: false, hasAvailableStock: false });
  
  // New state for WastedModal
  const [isWastedModalOpen, setIsWastedModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const queryClient = useQueryClient();
  const { mutate: archiveInventoryMutation } = useArchiveMedicineStocks();

  // Updated to use pagination parameters with filter
  const { data: apiResponse, isLoading, error } = useMedicineStockTable(currentPage, pageSize, searchQuery, stockFilter);

  // Extract data from paginated response
  const medicineData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Use backend-provided counts
  const counts = apiResponse?.filter_counts || { out_of_stock: 0, low_stock: 0, near_expiry: 0, expired: 0, total: 0 };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stockFilter]);

  const handleArchiveInventory = (medicine: any) => {
    // Check if the item is expired and has available stock
    const isExpired = medicine.expiry_status === 'expired';
    const hasAvailableStock = medicine.minv_qty_avail > 0;
    
    setMedicineToArchive(medicine.inv_id);
    setArchiveContext({ isExpired, hasAvailableStock });
    setIsArchiveConfirmationOpen(true);
  };

  // New handler for opening WastedModal
  const handleOpenWastedModal = (record: any) => {
    setSelectedRecord(record);
    setIsWastedModalOpen(true);
  };

  // New handler for closing WastedModal
  const handleCloseWastedModal = () => {
    setIsWastedModalOpen(false);
    setSelectedRecord(null);
  };

  const confirmArchiveInventory = async () => {
    if (medicineToArchive !== null) {
      setIsArchiveConfirmationOpen(false);
      try {
        // Pass the expiration and stock status to the mutation
        await archiveInventoryMutation({ 
          inv_id: medicineToArchive, 
          isExpired: archiveContext.isExpired,
          hasAvailableStock: archiveContext.hasAvailableStock
        });
        queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });
        showSuccessToast("Medicine archived successfully");
      } catch (error) {
        console.error("Failed to archive medicine:", error);
        showErrorToast("Failed to archive medicine.");
      } finally {
        setMedicineToArchive(null);
        setArchiveContext({ isExpired: false, hasAvailableStock: false });
      }
    }
  };

  // Updated columns to include the wasted modal handler
  const columns = getColumns(handleArchiveInventory, handleOpenWastedModal);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading medicine data</div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.out_of_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <Loader2 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.low_stock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Near Expiry</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.near_expiry}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <CalendarOff className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.expired}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="w-full flex gap-2 mr-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
            <Input placeholder="Search medicine..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <SelectLayout
            placeholder="Filter by stock status"
            label=""
            className="bg-white w-48"
            options={[
              { id: "all", name: "All Items" },
              { id: "low_stock", name: "Low Stock" },
              { id: "out_of_stock", name: "Out of Stock" },
              { id: "near_expiry", name: "Near Expiry" },
              { id: "expired", name: "Expired" }
            ]}
            value={stockFilter}
            onChange={(value) => setStockFilter(value as StockFilter)}
          />
        </div>
        <Button onClick={() => navigate("/inventory-stocks/list/stocks/medicine/add")} className="hover:bg-buttonBlue/90 group">
          <Plus size={15} /> New Medicine
        </Button>
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
                setCurrentPage(1);
              }}
              min="1"
            />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-transparent">
                  <FileInput />
                  Export Data
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
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading medicines...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading medicines. Please check console.</span>
            </div>
          ) : medicineData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No medicines found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={medicineData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
          </p>
          <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmArchiveInventory}
        title="Archive Medicine Item"
        description="Are you sure you want to archive this medicine? It will be preserved in the system but removed from active inventory."
      />

      {/* Wasted Modal */}
      <WastedModal isOpen={isWastedModalOpen} onClose={handleCloseWastedModal} record={selectedRecord} mode={"medicine"} />
    </>
  );
}