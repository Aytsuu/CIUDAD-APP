import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button/button";
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
import WastedDoseForm from "../addstocksModal/WastedDoseModal";
import EditVacStockForm from "../editModal/EditVacStockModal";
import VaccineStockForm from "../addstocksModal/VacStockModal";
import ImmunizationSupplies from "../addstocksModal/ImmunizationSupplies";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import api from "@/pages/api/api";
import EditImmunizationForm from "../editModal/EditImzSupply";
import { ConfirmationDialog } from "@/components/ui/confirmationLayout/ConfirmModal";
import { archiveInventory } from "../REQUEST/archive";

export const getCombinedStock = async () => {
  try {
    const [vaccineStocks, supplyStocks, vaccines, supplies, inventory] =
      await Promise.all([
        api.get("inventory/vaccine_stocks/"),
        api.get("inventory/immunization_stock/"),
        api.get("inventory/vac_list/"),
        api.get("inventory/imz_supplies/"),
        api.get("inventory/inventorylist/"),
      ]);

    const vaccineData = vaccineStocks.data.map((stock: any) => {
      const vaccine = vaccines.data.find((v: any) => v.vac_id === stock.vac_id);
      const inventoryData = inventory.data.find(
        (i: any) => i.inv_id === stock.inv_id
      );
      
      // Calculate vial and dose information
      const dosesPerVial = stock.dose_ml;
      const totalDoses = dosesPerVial * stock.qty;
      const remainingDoses = stock.vacStck_qty_avail;
      const remainingVials = Math.floor(remainingDoses / dosesPerVial);
      const remainingPartialDoses = remainingDoses % dosesPerVial;
      
      // Format available stock as "vials-doses"
      const availableStock = remainingPartialDoses === 0 
        ? `${remainingVials} vials -${remainingVials * dosesPerVial} doses`
        : `${remainingVials} vials -${remainingDoses} doses`;

      if (stock.solvent === "diluent") {
        return {
          type: "vaccine" as const,
          id: stock.vacStck_id,
          batchNumber: stock.batch_number,
          category: "vaccine",
          item: {
            antigen: vaccine?.vac_name || "Unknown Vaccine",
            dosage: stock.volume,
            unit: "container",
          },
          qty: `${stock.qty} containers`,
          administered: `${stock.vacStck_used} containers`,
          wastedDose: stock.wasted_doses?.toString() || "0",
          availableStock: `${stock.vacStck_qty_avail} containers`,
          expiryDate: inventoryData?.expiry_date,
          inv_id: stock.inv_id,
          solvent: stock.solvent,
          volume: stock.volume,
          vacStck_id: stock.vacStck_id,
          vac_id: stock.vac_id,
        };
      }

      return {
        type: "vaccine" as const,
        id: stock.vacStck_id,
        batchNumber: stock.batch_number,
        category: "Vaccine",
        item: {
          antigen: vaccine?.vac_name || "Unknown Vaccine",
          dosage: stock.dose_ml,
          unit: "ml",
        },
        qty: `${stock.qty} vials (${totalDoses} doses)`,
        administered: `${stock.vacStck_used} doses`,
        wastedDose: stock.wasted_doses?.toString() || "0",
        availableStock: availableStock,
        expiryDate: inventoryData?.expiry_date,
        solvent: stock.solvent,
        inv_id: stock.inv_id,
        dose_ml: stock.dose_ml,
        vacStck_id: stock.vacStck_id,
        dosesPerVial: dosesPerVial,
        vac_id: stock.vac_id,
      };
    });

    const supplyData = supplyStocks.data.map((stock: any) => {
      const supply = supplies.data.find((s: any) => s.imz_id === stock.imz_id);
      const inventoryData = inventory.data.find(
        (i: any) => i.inv_id === stock.inv_id
      );

      const pcsPerBox = stock.imzStck_per_pcs || 1;
      const totalPcs = stock.imzStck_pcs || (stock.imzStck_qty * pcsPerBox);
      const availablePcs = stock.imzStck_avail || (totalPcs - stock.imzStck_used);
      const remainingBoxes = Math.floor(availablePcs / pcsPerBox);
      const remainingPieces = availablePcs % pcsPerBox;

      let qtyDisplay;
      if (stock.imzStck_unit === "pcs") {
        qtyDisplay = `${totalPcs} pcs`;
      } else {
        qtyDisplay = `${stock.imzStck_qty} ${stock.imzStck_unit} (${totalPcs} pcs)`;
      }

      let availableStockDisplay;
      if (stock.imzStck_unit === "pcs") {
        availableStockDisplay = `${availablePcs} pcs`;
      } else {
        availableStockDisplay = `${remainingBoxes} ${stock.imzStck_unit} - ${availablePcs} pcs`;
      }

      return {
        type: "supply" as const,
        id: stock.imzStck_id,
        batchNumber: stock.batch_number || "N/A",
        category: "Immunization Supplies",
        item: {
          antigen: supply?.imz_name || "Unknown Supply",
          dosage: 1,
          unit: stock.imzStck_unit,
        },
        qty: qtyDisplay,
        administered: `${stock.imzStck_used} pcs`,
        wastedDose: stock.wasted_items?.toString() || "0",
        availableStock: availableStockDisplay,
        expiryDate: inventoryData?.expiry_date || "N/A",
        inv_id: stock.inv_id,
        imz_id: stock.imz_id,
        imzStck_id: stock.imzStck_id,
        imzStck_unit: stock.imzStck_unit,
        imzStck_per_pcs: pcsPerBox
      };
    });

    return [...vaccineData, ...supplyData].sort((a, b) => b.id - a.id);
  } catch (err) {
    console.error("Error fetching combined stock data:", err);
    throw err;
  }
};

type StockRecords = {
  id: number;
  batchNumber: string;
  category: string;
  item: {
    antigen: string;
    dosage: number;
    unit: string;
  };
  qty: string;
  administered: string;
  wastedDose: string;
  availableStock: string;
  expiryDate: string;
  type: "vaccine" | "supply";
  inv_id: number;
  vac_id: number;
  imz_id: number;
  vacStck_id: number;
  solvent: string;
  volume: number;
  dose_ml: number;
  imzStck_id: number;
  imzStck_unit: string;
  imzStck_per_pcs: number;
};

function isVaccine(record: StockRecords): record is StockRecords & { type: 'vaccine' } {
  return record.type === 'vaccine';
}

function isSupply(record: StockRecords): record is StockRecords & { type: 'supply' } {
  return record.type === 'supply';
}

export default function CombinedStockTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialog, setIsDialog] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"vaccine" | "supply">("vaccine");
  const [isArchiveConfirmationOpen, setIsArchiveConfirmationOpen] = useState(false);
  const [inventoryToArchive, setInventoryToArchive] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const {
    data: stockData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["combinedStocks"],
    queryFn: getCombinedStock,
    refetchOnMount: true,
  });

  const filteredStocks = React.useMemo(() => {
    if (!stockData) return [];
    return stockData.filter((record: StockRecords) => {
      const searchText =
        `${record.batchNumber} ${record.item.antigen}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, stockData]);

  const totalPages = Math.ceil(filteredStocks.length / pageSize);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleArchiveInventory = (inv_id: number) => {
    setInventoryToArchive(inv_id);
    setIsArchiveConfirmationOpen(true);
  };

  const confirmArchiveInventory = async () => {
    if (inventoryToArchive !== null) {
      try {
        await archiveInventory(inventoryToArchive);
        queryClient.invalidateQueries({ queryKey: ["combinedStocks"] });
        alert("Inventory item archived successfully");
      } catch (error) {
        console.error("Failed to archive inventory:", error);
        alert("Failed to archive inventory item");
      } finally {
        setIsArchiveConfirmationOpen(false);
        setInventoryToArchive(null);
      }
    }
  };

  const columns: ColumnDef<StockRecords>[] = [
    {
      accessorKey: "batchNumber",
      header: "Batch Number",
    },
    {
      accessorKey: "item",
      header: "Item Details",
      cell: ({ row }) => {
        const item = row.original.item;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-center">{item.antigen}</div>
            {row.original.type === "vaccine" && (
              <div className="text-sm text-gray-600 text-center">
                {item.dosage} {item.unit}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "qty",
      header: "Stock Quantity",
      cell: ({ row }) => <div className="text-center">{row.original.qty}</div>,
    },
    {
      accessorKey: "administered",
      header: "Units Used",
      cell: ({ row }) => (
        <div className="text-center text-red-600">
          {row.original.administered}
        </div>
      ),
    },
    {
      accessorKey: "wastedDose",
      header: "Wasted Units",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">
            {row.original.wastedDose || 0}
          </span>
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <button className="flex items-center justify-center w-7 h-5 text-red-700 bg-red-200 rounded-md hover:bg-red-300 transition-colors">
                    <Minus size={15} />
                  </button>
                }
                title={
                  row.original.category === "medsupplies"
                    ? "Wasted Items"
                    : "Wasted Dose"
                }
                mainContent={<WastedDoseForm wasted={row.original.id} />}
              />
            }
            content={
              row.original.category === "medsupplies"
                ? "Record Wasted Items"
                : "Record Wasted Dose"
            }
          />
        </div>
      ),
    },
    {
      accessorKey: "availableStock",
      header: "Available Stock",
      cell: ({ row }) => (
        <div className="text-center text-green-600">
          {row.original.availableStock}
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[120px] px-2">
          <div className="text-center w-full">{row.original.expiryDate}</div>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const record = row.original;
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
                  title={
                    record.type === "vaccine"
                      ? "Edit Vaccine Stock"
                      : "Edit Supply Stock"
                  }
                  mainContent={
                    isVaccine(record) ? (
                      <EditVacStockForm vaccine={record} setIsDialog={setIsDialog} />
                    ) : isSupply(record) ? (
                      <EditImmunizationForm supply={record} />
                    ) : null
                  }
                />
              }
              content="Edit"
            />
            <TooltipLayout
              trigger={
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleArchiveInventory(record.inv_id)}
                >
                  <Trash />
                </Button>
              }
              content="Archive"
            />
          </div>
        );
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="w-full h-full">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error loading stock data</div>
      </div>
    );
  }

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
                placeholder="Search inventory..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <SelectLayout
              placeholder="Filter items"
              label=""
              className="bg-white"
              options={[
                { id: "all", name: "All Items" },
                { id: "vaccine", name: "Vaccines" },
                { id: "medsupplies", name: "Medical Supplies" },
              ]}
              value=""
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-buttonBlue text-white hover:bg-buttonBlue/90 group">
                <Plus size={15} /> New Vaccine
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-[200px]"
              onMouseEnter={(e: React.MouseEvent) => e.preventDefault()}
            >
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOption("vaccine");
                  setIsDialog(true);
                }}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Vaccine
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setSelectedOption("supply");
                  setIsDialog(true);
                }}
                className="cursor-pointer hover:bg-gray-100 px-4 py-2"
              >
                Immunization Supplies
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DialogLayout
            isOpen={isDialog}
            onOpenChange={setIsDialog}
            title={
              selectedOption === "vaccine"
                ? "Add New Vaccine"
                : "Add Immunization Supplies"
            }
            mainContent={
              selectedOption === "vaccine" ? (
                <VaccineStockForm />
              ) : (
                <ImmunizationSupplies setIsDialog={setIsDialog} />
              )
            }
            trigger={undefined}
          />
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
          <DataTable columns={columns} data={paginatedStocks} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredStocks.length)}-
            {Math.min(currentPage * pageSize, filteredStocks.length)} of{" "}
            {filteredStocks.length} items
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