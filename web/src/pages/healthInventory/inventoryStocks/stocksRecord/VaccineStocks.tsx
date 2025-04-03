// VaccineStocks.tsx
import React, { useState, useEffect } from "react";
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

export default function VaccineStocks() {
  type VaccineStocksRecord = {
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
  };

  const sampleData: VaccineStocksRecord[] = [
    {
      batchNumber: "VAX-122A",
      category: "vaccine",
      item: {
        antigen: "COVID-19 mRNA Vaccine",
        dosage: 0.5,
        unit: "ml",
      },
      qty: "100 vials (200 doses)",
      administered: "20 vials (40 doses)",
      wastedDose: "20",
      availableStock: "80 vials (160 doses)",
      expiryDate: "2025-12-31",
    },
    {
      batchNumber: "MED-456B",
      category: "medsupplies",
      item: {   
        dosage: 0.5,
     antigen: "Sterile Gloves",
        unit: "pairs",
      },
      qty: "50 boxes (500 pcs)",
      administered: "10 boxes (100 pcs)",
      wastedDose: "5",
      availableStock: "35 boxes (350 pcs)",
      expiryDate: "2026-01-01",
    },
  ];

  const [vaccines, setVaccines] = useState<VaccineStocksRecord[]>(sampleData);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] =
    useState<VaccineStocksRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<VaccineStocksRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);


  const columns: ColumnDef<VaccineStocksRecord>[] = [
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
            {row.original.category === "vaccine" && (
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
      cell: ({ row }) => {
        const isMedicalSupply = row.original.category === "medsupplies";
        const [quantity, units] = row.original.qty.split(" (");
        return (
          <div className="text-center">
            {isMedicalSupply
              ? `${quantity.replace("vials", "boxes")} (${units.replace(
                  "doses",
                  "pcs"
                )}`
              : row.original.qty}
          </div>
        );
      },
    },
    {
      accessorKey: "administered",
      header: "Units Used",
      cell: ({ row }) => {
        const isMedicalSupply = row.original.category === "medsupplies";
        const [quantity, units] = row.original.administered.split(" (");
        return (
          <div className="text-center text-red-600">
            {isMedicalSupply
              ? `${quantity.replace("vials", "boxes")} (${units.replace(
                  "doses",
                  "pcs"
                )}`
              : row.original.administered}
          </div>
        );
      },
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
                mainContent={<WastedDoseForm />}
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
      cell: ({ row }) => {
        const isMedicalSupply = row.original.category === "medsupplies";
        const [quantity, units] = row.original.availableStock.split(" (");
        return (
          <div className="text-center text-green-600">
            {isMedicalSupply
              ? `${quantity.replace("vials", "boxes")} (${units.replace(
                  "doses",
                  "pcs"
                )}`
              : row.original.availableStock}
          </div>
        );
      },
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
      accessorKey: "action",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          {/* Maintained original TooltipLayout structure */}
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                    <Edit size={16} />
                  </div>
                }
                mainContent={
                  <EditVacStockForm
                    vaccine={row.original}
                  />
                }
              />
            }
            content="Edit Item"
          />
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                mainContent={<div>Confirm deletion</div>}
              />
            }
            content="Delete Item"
          />
        </div>
      ),
    },
  ];

  useEffect(() => {
    const filtered = vaccines.filter((record) => {
      const searchText =
        `${record.batchNumber} ${record.item.antigen}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, pageSize, vaccines]);

  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setCurrentData(filteredData.slice(startIndex, endIndex));
  }, [currentPage, pageSize, filteredData]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    setPageSize(!isNaN(value) && value > 0 ? value : 10);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
                onChange={handleSearchChange}
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
        <DialogLayout
          trigger={
            <div className="w-auto flex justify-end items-center bg-buttonBlue py-1.5 px-4 text-white text-[14px] rounded-md gap-1 shadow-sm hover:bg-buttonBlue/90">
              <Plus size={15} /> New
            </div>
          }
          title="Add Inventory Item"
          mainContent={<VaccineStockForm />}
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
          <DataTable columns={columns} data={currentData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} items
          </p>
          <PaginationLayout
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </>
  );
}
