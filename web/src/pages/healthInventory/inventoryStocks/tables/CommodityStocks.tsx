// CommodityStocks.tsx
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
import { CommodityStocksColumns } from "./columns/CommodityCol";
import { useNavigate } from "react-router-dom";
import { useCommodityStocksTable } from "../REQUEST/Commodity/queries/fetch-queries";
import { useArchiveCommodityStocks } from "../REQUEST/Archive/ArchivePutQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";
import WastedModal from "../addstocksModal/WastedModal";

type StockFilter = "all" | "low_stock" | "out_of_stock" | "near_expiry" | "expired";

export default function CommodityStocks() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [commodityToArchive, setCommodityToArchive] = useState<{
    inv_id: string;
    isExpired: boolean;
    hasAvailableStock: boolean;
  } | null>(null);
  
  // New state for WastedModal
  const [isWastedModalOpen, setIsWastedModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const queryClient = useQueryClient();
  const { mutate: archiveCommodityMutation } = useArchiveCommodityStocks();

  // Updated to use pagination parameters with filter
  const { data: apiResponse, isLoading, error } = useCommodityStocksTable(currentPage, pageSize, searchQuery, stockFilter);

  // Extract data from paginated response
  const commodityData = Array.isArray(apiResponse?.results) 
  ? apiResponse.results 
  : [];
  const totalCount = apiResponse?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Use backend-provided counts
  const counts = apiResponse?.filter_counts || { out_of_stock: 0, low_stock: 0, near_expiry: 0, expired: 0, total: 0 };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, stockFilter]);

  const handleArchiveInventory = (commodity: any) => {
    const hasAvailableStock = commodity.availableStock > 0;
    const isExpired = commodity.isExpired;

    setCommodityToArchive({
      inv_id: commodity.inv_id,
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

  const confirmArchiveInventory = async () => {
    if (commodityToArchive !== null) {
      setIsArchiveConfirmationOpen(false);
      try {
        archiveCommodityMutation({
          inv_id: commodityToArchive.inv_id,
          isExpired: commodityToArchive.isExpired,
          hasAvailableStock: commodityToArchive.hasAvailableStock
        });
        queryClient.invalidateQueries({ queryKey: ["commodityStocks"] });
        showSuccessToast("Commodity archived successfully");
      } catch (error) {
        console.error("Failed to archive commodity:", error);
        showErrorToast("Failed to archive commodity.");
      } finally {
        setCommodityToArchive(null);
      }
    }
  };

  // Updated columns to include the wasted modal handler
  const columns = CommodityStocksColumns(handleArchiveInventory, handleOpenWastedModal);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading commodity data</div>
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
            <Input placeholder="Search commodity..." className="pl-10 bg-white w-full" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
        <Button onClick={() => navigate("/addCommodityStock")} className="hover:bg-buttonBlue/90 group">
          <Plus size={15} /> New Commodity
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
              <span className="ml-2">Loading commodities...</span>
            </div>
          ) : error ? (
            <div className="w-full h-[100px] flex text-red-500 items-center justify-center">
              <span className="ml-2">Error loading commodities. Please check console.</span>
            </div>
          ) : commodityData.length === 0 ? (
            <div className="w-full h-[100px] flex text-gray-500 items-center justify-center">
              <span className="ml-2">No commodities found</span>
            </div>
          ) : (
            <DataTable columns={columns} data={commodityData} />
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
        title="Archive Commodity Item"
        description="Are you sure you want to archive this commodity? It will be preserved in the system but removed from active inventory."
      />

      {/* Wasted Modal */}
      <WastedModal isOpen={isWastedModalOpen} onClose={handleCloseWastedModal} record={selectedRecord} mode={"commodity"} />
    </>
  );
}