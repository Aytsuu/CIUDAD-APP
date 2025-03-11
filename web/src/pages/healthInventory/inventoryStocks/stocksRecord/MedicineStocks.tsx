// MedicineStocks.tsx
import React, { useState, useEffect } from "react";
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
import MedicineStockForm from "../addstocksModal/MedStockModal";
import EditMedicineForm from "../editModal/EditMedStockModal";

export default function MedicineStocks() {
  type MedicineStocksRecord = {
    id: number;
    medicineInfo: {
      medicineName: string;
      dosage: number;
      dsgUnit: string;
      form: string;
    };
    expiryDate: string;
    category: string;
    qty: string;
    availQty: string;
    distributed: string;
  };

  const sampleData: MedicineStocksRecord[] = [
    {
      id: 2323,
      medicineInfo: {
        medicineName: "Paracetamol",
        dosage: 500,
        dsgUnit: "mg",
        form: "tablet",
      },
      expiryDate: "2025-12-31",
      category: "Analgesic",
      qty: "10 boxes (50 pcs)",
      distributed: "7 boxes (30 pcs)",
      availQty: "7 boxes (30 pcs)",
    },
    {
      id: 1212,
      medicineInfo: {
        medicineName: "Amoxicillin",
        dosage: 250,
        dsgUnit: "mg",
        form: "capsule",
      },
      expiryDate: "2024-06-30",
      category: "Antibiotic",
      qty: "5 bot",
      distributed: "0",
      availQty: "5 bot",
    },
  ];

  // State management
  const [medicines, setMedicines] =
    useState<MedicineStocksRecord[]>(sampleData);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] =
    useState<MedicineStocksRecord[]>(sampleData);
  const [currentData, setCurrentData] = useState<MedicineStocksRecord[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // // Handle edit save
  // const handleSaveEditedMedicine = (updatedMedicine: MedicineStocksRecord) => {
  //   setMedicines((prevMedicines) =>
  //     prevMedicines.map((medicine) =>
  //       medicine.id === updatedMedicine.id
  //         ? updatedMedicine
  //         : medicine
  //     )
  //   );
  // };

  
  // Table columns
  const columns: ColumnDef<MedicineStocksRecord>[] = [
   
    {
      accessorKey: "medicineInfo",
      header: "Medicine ",
      cell: ({ row }) => {
        const medicine = row.original.medicineInfo;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{medicine.medicineName}</span>
            <div className="text-sm text-gray-600">
              {medicine.dosage} {medicine.dsgUnit},
              <span className="capitalize italic text-darkGray">
                {" "}
                {medicine.form}
              </span>
            </div>
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
      cell: ({ row }) => <div className="text-center">{row.original.qty}</div>,
    },
    {
      accessorKey: "distributed",
      header: "Distributed",
      cell: ({ row }) => (
        <div className="text-red-700">{row.original.distributed}</div>
      ),
    },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-green-700">{row.original.availQty}</div>
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
      cell: ({ row }) => (
        <>
          <div className="flex gap-2">
            <div className="flex justify-center gap-2">
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className=" hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                        <Edit size={16} />
                      </div>
                    }
                    mainContent={
                      <>
                        <EditMedicineForm
                          medicine={row.original}
                          // onSave={handleSaveEditedMedicine}
                        />
                      </>
                    }
                  />
                }
                content="Delete"
              />
            </div>
            <div className="flex justify-center gap-2">
              <TooltipLayout
                trigger={
                  <DialogLayout
                    trigger={
                      <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                        <Trash size={16} />
                      </div>
                    }
                    mainContent={<> </>}
                  />
                }
                content="Delete"
              />
            </div>
          </div>
        </>
      ),
    },
  ];

  // Search and pagination effects
  useEffect(() => {
    const filtered = medicines.filter((medicine) => {
      const searchText =
        `${medicine.id} ${medicine.medicineInfo.medicineName} ${medicine.medicineInfo.dosage}${medicine.medicineInfo.dsgUnit} ${medicine.expiryDate} ${medicine.category}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });

    setFilteredData(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  }, [searchQuery, pageSize, medicines]);

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
                placeholder="Search..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChange={handleSearchChange}
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
          mainContent={<MedicineStockForm />}
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
          <DataTable columns={columns} data={currentData} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing{" "}
            {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
            {filteredData.length} rows
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
