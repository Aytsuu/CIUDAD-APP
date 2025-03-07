import React, { useState, useEffect } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ColumnDef } from "@tanstack/react-table";
import { Search, Trash, Plus, FileInput } from "lucide-react";
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

export default function VaccineStocks() {
  type VaccineStocksRecord = {
    id: number;
    batchNumber: string;
    vaccine: {
      vaccineName: string;
      dosage: number;
      dsgUnit: string;
    };
    qty: {
      vialCount: number;
      dosesCount: number;
    };
    administered: {
      vialCount: number;
      dosesCount: number;
    };
    availableVaccine: {
      vialCount: number;
      dosesCount: number;
    };
    expiryDate: string;
  };

  const columns: ColumnDef<VaccineStocksRecord>[] = [
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
      accessorKey: "batchNumber",
      header: "Batch Number",
    },
    {
      accessorKey: "vaccine",
      header: "Vaccine Details",
      cell: ({ row }) => {
        const vaccine = row.original.vaccine;
        return (
          <div className="flex flex-col">
            <div className="font-medium text-center">{vaccine.vaccineName}</div>
            <div className="text-sm text-gray-600 text-center">
              {vaccine.dosage} {vaccine.dsgUnit}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "qty",
      header: "Initial Stock",
      cell: ({ row }) => {
        const qty = row.original.qty;
        return (
          <div className="flex flex-col">
            <div className="text-center">{qty.vialCount} vials</div>
            <div className="text-center">{qty.dosesCount} doses</div>
          </div>
        );
      },
    },
    {
      accessorKey: "administered",
      header: "Administered",
      cell: ({ row }) => {
        const administered = row.original.administered;
        return (
          <div className="flex flex-col text-red-600">
            <div className="text-center">{administered.vialCount} vials</div>
            <div className="text-center">{administered.dosesCount} doses</div>
          </div>
        );
      },
    },
    {
      accessorKey: "availableVaccine",
      header: "Available Stock",
      cell: ({ row }) => {
        const available = row.original.availableVaccine;
        return (
          <div className="flex flex-col text-green-600">
            <div className="text-center">{available.vialCount} vials</div>
            <div className="text-center">{available.dosesCount} doses</div>
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
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                mainContent={<></>}
              />
            }
            content="Delete Batch"
          />
        </div>
      ),
    },
  ];

  const sampleData: VaccineStocksRecord[] = [
    {
      id: 1,
      batchNumber: "VAX-122A",
      vaccine: {
        vaccineName: "COVID-19 mRNA Vaccine",
        dosage: 0.5,
        dsgUnit: "ml",
      },
      qty: {
        vialCount: 100,
        dosesCount: 200,
      },
      administered: {
        vialCount: 20,
        dosesCount: 40,
      },
      availableVaccine: {
        vialCount: 80,
        dosesCount: 160,
      },
      expiryDate: "2025-12-31",
    },
    {
      id: 2,
      batchNumber: "FLU-12S2A",
      vaccine: {
        vaccineName: "Influenza Quadrivalent",
        dosage: 0.5,
        dsgUnit: "ml",
      },
      qty: {
        vialCount: 50,
        dosesCount: 100,
      },
      administered: {
        vialCount: 10,
        dosesCount: 20,
      },
      availableVaccine: {
        vialCount: 40,
        dosesCount: 80,
      },
      expiryDate: "2024-06-30",
    },
  ];

  // ... rest of the component remains the same

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<VaccineStocksRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<VaccineStocksRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const filtered = sampleData.filter((record) => {
      const searchText = `${record.id} ${record.batchNumber} ${record.vaccine.vaccineName} ${record.vaccine.dosage}${record.vaccine.dsgUnit} ${record.expiryDate}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, pageSize]);

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
                placeholder="Search vaccine batches..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <SelectLayout
              placeholder="Filter batches"
              label=""
              className="bg-white"
              options={[
                { id: "1", name: "All Types" },
                { id: "2", name: "Viral" },
                { id: "3", name: "Bacterial" },
                { id: "4", name: "Other" },
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
          title="Vaccine Stock Management"
          description="Add new vaccine batch to inventory"
          mainContent={<></>}
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
            {filteredData.length} batches
          </p>

          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </>
  );
}