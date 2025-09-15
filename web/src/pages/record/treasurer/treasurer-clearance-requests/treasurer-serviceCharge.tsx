import { DataTable } from "@/components/ui/table/data-table";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Trash, FileInput, ReceiptText, Search } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ReceiptForm from "./treasurer-create-receipt-form";
import { Button } from "@/components/ui/button/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown/dropdown-menu";
import { useTreasurerServiceCharges } from "./queries/serviceChargeQueries";
import type { ServiceCharge } from "./restful-api/serviceChargeGetAPI";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";


export const columns: ColumnDef<ServiceCharge>[] = [
    { accessorKey: "caseNo",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Case No.
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("caseNo")}</div>
        )
    },
    {accessorKey: "name", header: "Name"},
    {accessorKey: "address1", header: "Address"},
    {accessorKey: "respondent", header: "Respondent Name"},
    {accessorKey: "address2", header: "Address"},
    {accessorKey: "reason", header: "Reason"},
    {accessorKey: "reqDate",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Date Requested
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="">{row.getValue("reqDate")}</div>
        )
    },
    { accessorKey: "action", 
        header: "Action",
        cell: ({ row }) =>(
          <div className="flex justify-center gap-1">
              <TooltipLayout
              trigger={
                  <DialogLayout
                    trigger={<div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer"><ReceiptText size={16}/></div>}
                    className="flex flex-col"
                    title="Create Receipt"
                    description="Enter the serial number to generate a receipt."
                    mainContent={
                        (() => {
                          const sc = row.original as ServiceCharge;
                          return (
                            <ReceiptForm
                              id={String(sc.caseNo)}
                              purpose={sc.reason}
                              rate={"0"}
                              requester={sc.name}
                              pay_status={"Unpaid"}
                              nat_col={"Service Charge"}
                              is_resident={false}
                              onSuccess={() => {}}
                            />
                          );
                        })()
                    } 
                  />
              } content="Create Receipt"/>
              <TooltipLayout 
               trigger={
                  <DialogLayout
                      trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <Trash size={16} /></div>}
                      className="max-w-[50%] h-2/3 flex flex-col"
                      title="Image Details"
                      description="Here is the image related to the report."
                      mainContent={<img src="path_to_your_image.jpg" alt="Report Image" className="w-full h-auto" />} 
                  />
               }  content="Delete"/>
          </div>
        )},
];


function ServiceCharge(){
    const { data = [], isLoading } = useTreasurerServiceCharges();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((data?.length || 0) / pageSize));
    }, [data, pageSize]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return (data || []).slice(start, end);
    }, [data, currentPage, pageSize]);

    return(
        <div className="w-full h-full">
            <div className="flex flex-col gap-3 mb-3">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2 flex flex-row items-center gap-2">
                    <div>Service Charge Requests</div>
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and process service charge requests.
                </p>
            </div>
            <hr className="border-gray mb-7 sm:mb-8" /> 

            <div className="flex flex-col gap-5">
                <div className="relative flex-1 max-w-[20rem]"> {/* Adjust max-width as needed */}
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                        size={17}
                    />
                    <Input placeholder="Search..." className="pl-10 w-full bg-white text-sm" /> {/* Adjust padding and text size */}
                </div>
               
                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
                        <div className="flex gap-x-2 items-center">
                            <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" value={pageSize}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value || '10', 10);
                                    const safe = isNaN(val) || val <= 0 ? 10 : val;
                                    setPageSize(safe);
                                    setCurrentPage(1);
                                }}
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

                    {isLoading ? (
                        <div className="p-6 text-sm text-darkGray">Loading service charges...</div>
                    ) : paginatedData.length === 0 ? (
                        <div className="p-6 text-sm text-darkGray">No service charge records found.</div>
                    ) : (
                        <DataTable columns={columns} data={paginatedData}></DataTable>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        {(() => {
                            const total = data?.length || 0;
                            const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
                            const end = Math.min(total, currentPage * pageSize);
                            return `Showing ${start}-${end} of ${total} rows`;
                        })()}
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
                        <PaginationLayout
                            className=""
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={(p) => setCurrentPage(p)}
                        />
                    </div>
                </div>  
            </div>
        </div>
    )


}

export default ServiceCharge