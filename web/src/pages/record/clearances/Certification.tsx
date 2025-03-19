<<<<<<< HEAD
=======
<<<<<<< HEAD
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Eye, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import AddCertificate from '@/pages/record/clearances/CreateDocumentModal';

type Certificate = {
    requestNo: string
    firstname: string
    lastname: string
    paymentMethod: string
    dateRequested: string
    dateClaim: string
    purpose: string[]  // Changed to string array
}

export const columns: ColumnDef<Certificate>[] = [
    {
        accessorKey: "requestNo",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"    
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Request No.
                <ArrowUpDown size={15}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="capitalize">{row.getValue("requestNo")}</div>
        )
    },
    {
        accessorKey: "firstname",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                First Name
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("firstname")}</div>
    },
    {
        accessorKey: "lastname",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Last Name
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("lastname")}</div>
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method",
    },
    {
        accessorKey: "dateRequested",
        header: "Date Requested",
    },
    {
        accessorKey: "dateClaim",
        header: "Date to Claim",
    },
    {
        accessorKey: "purpose",
        header: "Purpose",
        cell: ({ row }) => {
            const purposes = row.getValue("purpose") as string[];
            return (
                <ul className="list-disc list-outside inline-block pl-6">
                    {purposes.map((purpose, index) => (
                        <li key={index}>{purpose}</li>
                    ))}
                </ul>
            );
        }
    },
]

export const certificateRecords: Certificate[] = [
    {
        requestNo: "001",
        firstname: "John",
        lastname: "Doe",
        paymentMethod: "Cash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-25",
        purpose: ["NBI", "Medical Assistance"]
    },
    {
        requestNo: "002",
        firstname: "Jane",
        lastname: "Smith",
        paymentMethod: "GCash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-26",
        purpose: ["NBI", "Employment"]
    },
    {
        requestNo: "003",
        firstname: "Mike",
        lastname: "Johnson",
        paymentMethod: "Cash",
        dateRequested: "2024-02-24",
        dateClaim: "2024-02-27",
        purpose: ["First Time Job Seeker", "Medical Assistance"]
    },
]

function CertificatePage() {
    const data = certificateRecords;

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-left font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                    <h1>CERTIFICATION REQUEST</h1>
                </div>

                <div className="w-full bg-white border border-gray rounded-[5px]">
                    <div className='w-full flex justify-between mb-4 p-5'>
                        {/* Filter Section */}
                        <div className="flex gap-3">
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 text-gray-500" size={18} />
                                <Input
                                    placeholder="Search..."
                                    className="pl-10 max-w-sm"
                                />
                            </div>

                            <SelectLayout
                                className={''}
                                label=""
                                placeholder="Filter Type"
                                options={[
                                    { id: "test", name: "Employment" },
                                    { id: "test", name: "BIR" }
                                ]}
                                value=""
                                onChange={() => { }}
                            />                                
                        </div>
                        <div>
                            <DialogLayout
                                trigger={
                                    <div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center">
                                        Create Certificate <Plus className="ml-2" />
                                    </div>
                                }
                                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="Create Certificate"
                                description="Request a new certificate."
                                mainContent={<AddCertificate />}
                            />
                        </div>
                    </div>
                    
                    {/*Table Section */}
                    <DataTable columns={columns} data={data} />
                </div>
                <div className="flex justify-between items-center p-5 border-t border-gray-200">
                        <span className="text-gray-500 text-[14px]">Showing 1-10 of 150 rows</span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="text-gray-600"> <ChevronLeft className="w-4 h-4 mr-2" /> Previous  </Button>
                            <Button variant="outline" className="px-3">1</Button>
                            <span className="text-gray-600">2</span>
                            <span className="text-gray-600">...</span>
                            <Button variant="ghost" className="text-gray-600">Next <ChevronRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                    </div>
            </div>
        </div>
    );
}

export default CertificatePage;
=======
>>>>>>> frontend/feature/treasurer
import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import {Button} from "@/components/ui/button";
import { Pencil, Trash, Eye, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {SelectLayout} from "@/components/ui/select/select-layout";
import {Input} from "@/components/ui/input";

import {DataTable} from "@/components/ui/table/data-table";
import {ArrowUpDown} from "lucide-react";
import {ColumnDef} from "@tanstack/react-table";

import AddCertificate from "@/pages/record/clearances/CreateDocumentModal";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

type Certificate = {
  requestNo: string;
  firstname: string;
  lastname: string;
  paymentMethod: string;
  dateRequested: string;
  dateClaim: string;
  purpose: string[]; // Changed to string array
};

export const columns: ColumnDef<Certificate>[] = [
  {
    accessorKey: "requestNo",
    header: ({column}) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Request No.
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({row}) => (
      <div className="capitalize">{row.getValue("requestNo")}</div>
    ),
  },
  {
    accessorKey: "firstname",
    header: ({column}) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({row}) => (
      <div className="capitalize">{row.getValue("firstname")}</div>
    ),
  },
  {
    accessorKey: "lastname",
    header: ({column}) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={15} />
      </div>
    ),
    cell: ({row}) => (
      <div className="capitalize">{row.getValue("lastname")}</div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Method",
  },
  {
    accessorKey: "dateRequested",
    header: "Date Requested",
  },
  {
    accessorKey: "dateClaim",
    header: "Date to Claim",
  },
  {
    accessorKey: "purpose",
    header: "Purpose",
    cell: ({row}) => {
      const purposes = row.getValue("purpose") as string[];
      return (
        <ul className="list-disc list-outside inline-block pl-6">
          {purposes.map((purpose, index) => (
            <li key={index}>{purpose}</li>
          ))}
        </ul>
      );
    },
  },
];

export const certificateRecords: Certificate[] = [
  {
    requestNo: "001",
    firstname: "John",
    lastname: "Doe",
    paymentMethod: "Cash",
    dateRequested: "2024-02-23",
    dateClaim: "2024-02-25",
    purpose: ["NBI", "Medical Assistance"],
  },
  {
    requestNo: "002",
    firstname: "Jane",
    lastname: "Smith",
    paymentMethod: "GCash",
    dateRequested: "2024-02-23",
    dateClaim: "2024-02-26",
    purpose: ["NBI", "Employment"],
  },
  {
    requestNo: "003",
    firstname: "Mike",
    lastname: "Johnson",
    paymentMethod: "Cash",
    dateRequested: "2024-02-24",
    dateClaim: "2024-02-27",
    purpose: ["First Time Job Seeker", "Medical Assistance"],
  },
];

function CertificatePage() {
  const data = certificateRecords;

  const [currentPage, setCurrentPage] = useState(1);
  
      
      const handlePageChange = (page: number) => {
          setCurrentPage(page);
      };


  return (
    <div className="w-full h-full px-4 md:px-8 lg:px-16">
      <div className="mb-4 mt-10">
        <div className="text-left font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Certification Request
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view certification request 
                </p>
                </div>
                <hr className="border-gray mb-5 sm:mb-8" />

        <div className="w-full bg-white border border-gray rounded-[5px]">
          <div className="w-full flex justify-between mb-4 p-5">
            {/* Filter Section */}
            <div className="flex gap-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-gray-500" size={18} />
                <Input placeholder="Search..." className="pl-10 max-w-sm" />
              </div>

              <SelectLayout
                className={""}
                label=""
                placeholder="Filter Type"
                options={[
                  {id: "test", name: "Employment"},
                  {id: "test", name: "BIR"},
                ]}
                value=""
                onChange={() => {}}
              />
            </div>
            <div>
              <DialogLayout
                trigger={
                  <div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center">
                    Create Certificate <Plus className="ml-2" />
                  </div>
                }
                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                title="Create Certificate"
                description="Request a new certificate."
                mainContent={<AddCertificate />}
              />
            </div>
          </div>

          {/*Table Section */}
          <DataTable columns={columns} data={data} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of 150 rows
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
           <PaginationLayout 
                totalPages={15} 
                currentPage={currentPage} 
                onPageChange={handlePageChange} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificatePage;
<<<<<<< HEAD
=======
>>>>>>> master
>>>>>>> frontend/feature/treasurer
