import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button/button";
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import AddBusinessDocument from '@/pages/record/clearances/CreateDocumentModal';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";;

// Updated BusinessDocument type
type BusinessDocument = {
    requestNo: string;
    businessname: string,
    address: string;
    gross: string;
    paymentMethod: string;
    dateRequested: string;
    dateClaim: string;
};

export const columns: ColumnDef<BusinessDocument>[] = [
    {
        accessorKey: "requestNo",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Request No.
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("requestNo")}</div>
        )
    },
    {
        accessorKey: "businessname",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Business Name
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("businessname")}</div>
    },
    {
        accessorKey: "address",
        header: "Address",
    },
    {
        accessorKey: "gross",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Gross Sales
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("gross")}</div>
    },
    {
        accessorKey: "paymentMethod",
        header: "Payment Method",
    },
    {
        accessorKey: "dateRequested",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date Requested
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("dateRequested")}</div>
    },
    {
        accessorKey: "dateClaim",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Date to Claim
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("dateClaim")}</div>
    },
];

export const BusinessDocumentRecords: BusinessDocument[] = [
    {
        requestNo: "001",
        businessname: "John's Bakery",
        address: "123 Main St, Cityville",
        gross: "$50,000",
        paymentMethod: "Cash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-25",
    },
    {
        requestNo: "002",
        businessname: "Jane's Cafe",
        address: "456 Elm St, Townsville",
        gross: "$30,000",
        paymentMethod: "GCash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-26",
    },
    {
        requestNo: "003",
        businessname: "Mike's Auto Shop",
        address: "789 Oak St, Villagetown",
        gross: "$75,000",
        paymentMethod: "Cash",
        dateRequested: "2024-02-24",
        dateClaim: "2024-02-27",
    },
];

function BusinessDocumentPage() {
    const data = BusinessDocumentRecords;

    const [currentPage, setCurrentPage] = useState(1);

    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-left font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Business Permit Request
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view business permit request 
                </p>
                </div>
                <hr className="border-gray mb-5 sm:mb-8" />

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
                                        Create Business Permit <Plus className="ml-2" />
                                    </div>
                                }
                                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="Create Business Permit"
                                description="Request a new Business Permit."
                                mainContent={<AddBusinessDocument />}
                            />
                        </div>
                    </div>

                    <DataTable columns={columns} data={data} />
                </div>
                
                {/* Pagination */}
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

export default BusinessDocumentPage;


