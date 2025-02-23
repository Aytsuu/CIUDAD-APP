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

import AddCertificate from '@/pages/CreateDocumentModal';

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
        header: "First Name",
    },
    {
        accessorKey: "lastname",
        header: "Last Name",
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
        requestNo: "CERT-001",
        firstname: "John",
        lastname: "Doe",
        paymentMethod: "Cash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-25",
        purpose: ["Employment", "Loan Application"]
    },
    {
        requestNo: "CERT-002",
        firstname: "Jane",
        lastname: "Smith",
        paymentMethod: "GCash",
        dateRequested: "2024-02-23",
        dateClaim: "2024-02-26",
        purpose: ["Business", "Bank Requirement"]
    },
    {
        requestNo: "CERT-003",
        firstname: "Mike",
        lastname: "Johnson",
        paymentMethod: "Cash",
        dateRequested: "2024-02-24",
        dateClaim: "2024-02-27",
        purpose: ["Residential", "Permit Application", "Legal Requirement"]
    },
]

function CertificatePage() {
    const data = certificateRecords;

    return (
        <div className="w-full h-full px-4 md:px-8 lg:px-16">
            <div className="mb-4 mt-10">
                <div className="text-center font-bold text-[#394360] text-2xl md:text-3xl mb-[20px]">
                    <h1>CERTIFICATION REQUEST</h1>
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

                    <DataTable columns={columns} data={data} />
                </div>                
            </div>
        </div>
    );
}

export default CertificatePage;