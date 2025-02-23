import { useState } from 'react';
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Button } from "@/components/ui/button";
import TableLayout from '@/components/ui/table/table-layout.tsx';
import PaginationLayout from '@/components/ui/pagination/pagination-layout';
import { Pencil, Trash, Eye, Plus } from 'lucide-react';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout.tsx';
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { DataTable } from "@/components/ui/table/data-table"
import { ArrowUpDown } from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import AddPermit from '@/pages/CreateDocumentModal';

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
        header: "Name",
    },
    {
        accessorKey: "address",
        header: "Address",
    },
    {
        accessorKey: "respondentName",
        header: "Respondent Name",
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
        header: "Date Requested",
    },
];

export const PermitRecords: Permit[] = [
    {
        CaseNo: "CASE-001",
        name: "John Doe",
        address: "123 Main St, Cityville",
        respondentName: "Jane Smith",
        respon_address: "456 Elm St, Townsville",
        reason: "Business Dispute",
        dateRequested: "2024-02-23",
    },
    {
        CaseNo: "CASE-002",
        name: "Mike Johnson",
        address: "789 Oak St, Villagetown",
        respondentName: "Sarah Lee",
        respon_address: "321 Pine St, Hamletville",
        reason: "Contract Violation",
        dateRequested: "2024-02-24",
    },
    {
        CaseNo: "CASE-003",
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

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-center font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                    <h1>PERMIT REQUESTS</h1>
                </div>

                <div className="w-full bg-white border border-gray rounded-[5px]">
                    <div className='w-full flex justify-between mb-4 p-5'>
                        {/* Filter Section */}
                        <div className="flex gap-3">
                            <Input
                                placeholder="Filter by search..."
                                className="max-w-sm"
                            />

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
            </div>
        </div>
    );
}

export default PermitPage;