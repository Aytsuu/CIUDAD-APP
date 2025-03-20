import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
// import { Button } from "@/components/ui/button";
// import TableLayout from '@/components/ui/table/table-layout.tsx';
// import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button/button";
// import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
// import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import AddPermit from '@/pages/record/clearances/CreateDocumentModal';
import PaginationLayout from "@/components/ui/pagination/pagination-layout";

// Updated Permit type
type Permit = {
    CaseNo: string;
    name: string;
    address: string;
    respondentName: string;
    respon_address: string;
    reason: string;
    dateRequested: string;
};

export const columns: ColumnDef<Permit>[] = [
    {
        accessorKey: "CaseNo",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Case No.
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("CaseNo")}</div>
        )
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("name")}</div>
    },
    {
        accessorKey: "address",
        header: "Address",
    },
    {
        accessorKey: "respondentName",
        header: ({ column }) => (
            <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Respondent Name
                <ArrowUpDown size={15} />
            </div>
        ),
        cell: ({ row }) => <div className="capitalize">{row.getValue("respondentName")}</div>
    },
    {
        accessorKey: "respon_address",
        header: "Respondent Address",
    },
    {
        accessorKey: "reason",
        header: "Reason",
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
];

export const PermitRecords: Permit[] = [
    {
        CaseNo: "001",
        name: "John Doe",
        address: "123 Main St, Cityville",
        respondentName: "Jane Smith",
        respon_address: "456 Elm St, Townsville",
        reason: "Business Dispute",
        dateRequested: "2024-02-23",
    },
    {
        CaseNo: "002",
        name: "Mike Johnson",
        address: "789 Oak St, Villagetown",
        respondentName: "Sarah Lee",
        respon_address: "321 Pine St, Hamletville",
        reason: "Contract Violation",
        dateRequested: "2024-02-24",
    },
    {
        CaseNo: "003",
        name: "Emily Davis",
        address: "654 Birch St, Forestville",
        respondentName: "Chris Brown",
        respon_address: "987 Maple St, Hilltown",
        reason: "Property Dispute",
        dateRequested: "2024-02-25",
    },
];

function PermitPage() {
    const data = PermitRecords;

    const [currentPage, setCurrentPage] = useState(1);
    
        
        const handlePageChange = (page: number) => {
            setCurrentPage(page);
        };

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-left font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Summon Request
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view summon request 
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
                                    { id: "test", name: "Business Dispute" },
                                    { id: "test", name: "Contract Violation" }
                                ]}
                                value=""
                                onChange={() => { }}
                            />
                        </div>
                        <div>
                            <DialogLayout
                                trigger={
                                    <div className="bg-[#3D4C77] hover:bg-[#4e6a9b] text-white px-4 py-1.5 rounded cursor-pointer flex items-center">
                                        Create Permit <Plus className="ml-2" />
                                    </div>
                                }
                                className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                                title="Create Permit"
                                description="Request a new Permit."
                                mainContent={<AddPermit />}
                            />
                        </div>
                    </div>

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

export default PermitPage;