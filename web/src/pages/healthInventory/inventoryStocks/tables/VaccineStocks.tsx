// CombinedStockTable.tsx
"use client";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Loader2, XCircle, Clock, CalendarOff } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/confirmModal";
import { useArchiveAntigenStocks } from "../REQUEST/Archive/ArchivePutQueries";
import { getStockColumns } from "./columns/AntigenCol";
import { useNavigate } from "react-router-dom";
import { useAntigenCombineStocks } from "../REQUEST/Antigen/queries/AntigenFetchQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast } from "@/components/ui/toast";
import WastedModal from "../addstocksModal/WastedModal";
import { exportToCSV, exportToExcel, exportToPDF2 } from "@/pages/healthServices/reports/export/export-report";
import { ExportDropdown } from "@/pages/healthServices/reports/export/export-dropdown";


export default function CombinedStockTable() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<any>("all");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [inventoryToArchive, setInventoryToArchive] = useState<{
    inv_id: string;
    isExpired: boolean;
    hasAvailableStock: boolean;
  } | null>(null);

  // New state for WastedModal
  const [isWastedModalOpen, setIsWastedModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Updated to use pagination parameters with filter
  const { data: apiResponse, isLoading, error } = useAntigenCombineStocks(currentPage, pageSize, searchQuery, stockFilter);
  const { mutate: archiveCommodityMutation } = useArchiveAntigenStocks();

  // Extract data from paginated response
  const stockData = apiResponse?.results || [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Use backend-provided counts
  const counts = apiResponse?.filter_counts || { out_of_stock: 0, low_stock: 0, near_expiry: 0, expired: 0, total: 0 };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stockFilter]);

  const handleuseArchiveAntigenStocks = (antigen: any) => {
    const hasAvailableStock = antigen.availableStock > 0;
    const isExpired = antigen.isExpired;

    setInventoryToArchive({
      inv_id: antigen.inv_id,
      isExpired: isExpired,
      hasAvailableStock: hasAvailableStock
    });
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

  

  // Corrected prepareExportData function
const prepareExportData = () => {
  return stockData.map((item: any) => {
    const expired = item.isExpired;
    const isLow = item.isLowStock;
    const isOutOfStock = item.isOutOfStock;
    const isNear = item.isNearExpiry;
    
    // Calculate Qty Used based on type
    let qtyUsed = 0;
    let qtyUsedUnit = "";
    const availQty = Number(item.availableStock) || 0;
    
    if (item.type === "vaccine") {
      if (item.solvent === "diluent") {
        qtyUsed = Number(item.qty_number) - availQty - (item.wastedDose || 0);
        qtyUsedUnit = "containers";
      } else {
        qtyUsed = Number(item.qty_number) * Number(item.dose_ml) - availQty - (item.wastedDose || 0);
        qtyUsedUnit = "doses";
      }
    } else if (item.type === "supply") {
      if (item.imzStck_unit === "boxes") {
        qtyUsed = Number(item.qty_number) * Number(item.imzStck_pcs) - availQty - (item.wastedDose || 0);
        qtyUsedUnit = "pcs";
      } else {
        qtyUsed = Number(item.qty_number) - availQty - (item.wastedDose || 0);
        qtyUsedUnit = "pcs";
      }
    }

    // Format Available Stock based on type
    let availableStockDisplay = "";
    if (item.type === "vaccine") {
      if (item.solvent?.toLowerCase() === "diluent") {
        availableStockDisplay = `${item.availableStock} containers`;
      } else {
        const dosesPerVial = item.dose_ml || 1;
        const availableDoses = item.availableStock;
        const fullVials = Math.ceil(availableDoses / dosesPerVial);
        availableStockDisplay = `${fullVials} vial${fullVials !== 1 ? 's' : ''} (${availableDoses} dose${availableDoses !== 1 ? 's' : ''})`;
      }
    } else if (item.type === "supply") {
      if (item.imzStck_unit === "boxes") {
        const pcsPerBox = item.imzStck_pcs || 1;
        const availablePcs = item.availableStock;
        const fullBoxes = Math.floor(availablePcs / pcsPerBox);
        const remainingPcs = availablePcs % pcsPerBox;
        const totalBoxes = remainingPcs > 0 ? fullBoxes + 1 : fullBoxes;
        availableStockDisplay = `${totalBoxes} box${totalBoxes !== 1 ? 'es' : ''} (${availablePcs} total pc${availablePcs !== 1 ? 's' : ''})`;
      } else {
        availableStockDisplay = `${item.availableStock} pc${item.availableStock !== 1 ? 's' : ''}`;
      }
    } else {
      availableStockDisplay = `${item.availableStock}`;
    }

    // Determine status
    let status = "Normal";
    if (expired) {
      status = "Expired";
    } else if (isOutOfStock) {
      status = "Out of Stock";
    } else if (isLow) {
      status = "Low Stock";
    } else if (isNear) {
      status = "Near Expiry";
    }

    // Add status indicators to fields
    if (expired) {
      availableStockDisplay += " (Expired)";
    } else {
      if (isOutOfStock) availableStockDisplay += " (Out of Stock)";
      if (isLow) availableStockDisplay += " (Low Stock)";
    }

    const baseData = {
      "Date": item.created_at ? new Date(item.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      }) : "N/A",
      "Batch Number": item.batchNumber || "N/A",
      "Item Details": item.item?.antigen || "Unknown Item",
      "Total Qty": `${item.qty || "0"}${expired ? " (Expired)" : ""}`,
      "Available Stock": availableStockDisplay,
      "Qty Used": `${qtyUsed} ${qtyUsedUnit}`,
      "Wasted Units": item.wastedDose || 0,
      "Expiry Date": `${item.expiryDate || "N/A"}${expired ? " (Expired)" : isNear ? " (Near Expiry)" : ""}`,
      "Status": status
    };

    // Add type-specific additional information
    if (item.type === "vaccine") {
      return {
        ...baseData,
        "Item Details": `${item.item?.antigen || "Unknown Item"}${item.item?.dosage ? ` - ${item.item.dosage} ${item.item.unit || ""}` : ""}${expired ? " (Expired)" : ""}`,
      };
    }

    if (item.type === "supply") {
      return {
        ...baseData,
        "Unit Type": item.imzStck_unit || "pcs",
        "Pieces per Box": item.imzStck_pcs || 1
      };
    }

    return baseData;
  });
};

  const handleExportCSV = () => {
    const dataToExport = prepareExportData();
    exportToCSV(dataToExport, `antigen_stocks_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportExcel = () => {
    const dataToExport = prepareExportData();
    exportToExcel(dataToExport, `antigen_stocks_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportPDF = () => {
    const dataToExport = prepareExportData();
    exportToPDF2(dataToExport, `antigen_stocks_${new Date().toISOString().slice(0, 10)}`, "Antigen Stocks Report");
  };

  const confirmuseArchiveAntigenStocks = async () => {
    if (inventoryToArchive !== null) {
      setIsArchiveConfirmationOpen(false);
      try {
        archiveCommodityMutation({
          inv_id: inventoryToArchive.inv_id,
          isExpired: inventoryToArchive.isExpired,
          hasAvailableStock: inventoryToArchive.hasAvailableStock
        });
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        showErrorToast("Failed to archive.");
      } finally {
        setInventoryToArchive(null);
      }
    }
  };

  // Updated columns to include the wasted modal handler
  const columns = getStockColumns(handleuseArchiveAntigenStocks, handleOpenWastedModal);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading stock data</div>
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
            <Input placeholder="Search inventory..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
            onChange={(value) => setStockFilter(value as any)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className=" hover:bg-buttonBlue/90 group">
                <Plus size={15} /> New
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[200px]" align="end">
              <DropdownMenuItem onSelect={() => navigate("/inventory-stocks/list/stocks/antigen/vaccine/add")} className="cursor-pointer hover:bg-gray-100 px-4 py-2">
                Vaccine
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate("/inventory-stocks/list/stocks/immunization-supply/add")} className="cursor-pointer hover:bg-gray-100 px-4 py-2">
                Immunization Supplies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
            <ExportDropdown 
              onExportCSV={handleExportCSV} 
              onExportExcel={handleExportExcel} 
              onExportPDF={handleExportPDF} 
              className="border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200" 
            />
          </div>
        </div>

        <div className="bg-white w-full overflow-x-auto">
          {isLoading ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading antigens...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading antigens. Please check console.</span>
            </div>
          ) : stockData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No antigens found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={stockData} />
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalCount)}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} items
          </p>
          <PaginationLayout currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* Archive Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveConfirmationOpen}
        onOpenChange={setIsArchiveConfirmationOpen}
        onConfirm={confirmuseArchiveAntigenStocks}
        title="Archive Inventory Item"
        description="Are you sure you want to archive this item? It will be preserved in the system but removed from active inventory."
      />

      {/* Wasted Modal */}
      <WastedModal isOpen={isWastedModalOpen} onClose={handleCloseWastedModal} record={selectedRecord} mode={"antigen"} />
    </>
  );
}