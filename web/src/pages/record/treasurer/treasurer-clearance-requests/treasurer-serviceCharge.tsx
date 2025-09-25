import { DataTable } from "@/components/ui/table/data-table";
import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { X, ReceiptText, Search, Loader2 } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ReceiptForm from "./treasurer-create-receipt-form";
import { useServiceChargeRate, useTreasurerServiceCharges } from "./queries/serviceChargeQueries";
import type { ServiceCharge } from "./restful-api/serviceChargeGetAPI";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQueryClient } from "@tanstack/react-query";


// Create columns function that accepts the handlePaymentSuccess callback
const createColumns = (handlePaymentSuccess: () => void): ColumnDef<ServiceCharge>[] => [
    { accessorKey: "sr_id",
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
            <div className="">{row.getValue("sr_id")}</div>
        )
    },
    {accessorKey: "complainant_name", header: "Complainant Name"},
    {accessorKey: "sr_type", header: "Type"},
    {accessorKey: "sr_req_date",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Date Requested
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => {
            const dateValue = row.getValue("sr_req_date") as string;
            const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '';
            return (
                <div className="">{formattedDate}</div>
            );
        }
    },
    {accessorKey: "sr_req_status", header: "Request Status"},
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
                          const receiptData = {
                            id: String(sc.sr_id),
                            purpose: sc.sr_type || "Service Charge",
                            rate: (window as any).__serviceChargeRate || "0",
                            requester: sc.complainant_name || "Unknown",
                            pay_status: sc.payment_request?.spay_status || "Unpaid",
                            nat_col: "Service Charge",
                            is_resident: false,
                            spay_id: sc.payment_request?.spay_id
                          };
                          console.log("ReceiptForm data being passed:", receiptData);
                          console.log("Full ServiceCharge object:", sc);
                          return (
                            <ReceiptForm
                              id={receiptData.id}
                              purpose={receiptData.purpose}
                              rate={receiptData.rate}
                              requester={receiptData.requester}
                              pay_status={receiptData.pay_status}
                              nat_col={receiptData.nat_col}
                              is_resident={receiptData.is_resident}
                              spay_id={receiptData.spay_id}
                              onSuccess={handlePaymentSuccess}
                            />
                          );
                        })()
                    } 
                  />
              } content="Create Receipt"/>
              <TooltipLayout 
               trigger={
                  <DialogLayout
                      trigger={<div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer"> <X size={16} /></div>}
                      className="max-w-[50%] h-2/3 flex flex-col"
                      title="Decline Summon"
                      description="Are you sure you want to decline this summon request?"
                      mainContent={<div className="p-4">Decline functionality will be implemented here.</div>} 
                  />
               }  content="Decline"/>
          </div>
        )},
];

function ServiceCharge(){
    const queryClient = useQueryClient();
    const { data = [], isLoading, refetch } = useTreasurerServiceCharges();
    const { data: rateObj } = useServiceChargeRate();
    
    // Console log the fetched data
    console.log("Fetched ServiceCharge data:", data);
    console.log("Fetched rate data:", rateObj);
    
    // Expose to receipt dialog content renderer (string value)
    (window as any).__serviceChargeRate = rateObj?.pr_rate != null ? String(rateObj.pr_rate) : "0";
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState<"pending" | "declined">("pending");
    const [searchQuery, setSearchQuery] = useState("");

    // Function to refresh data after successful payment
    const handlePaymentSuccess = async () => {
        console.log("Payment successful, refreshing data...");
        // Invalidate and refetch the service charges data
        await queryClient.invalidateQueries({ queryKey: ['treasurer-service-charges'] });
        await refetch();
        console.log("Data refreshed successfully");
    };

    
    const columns = useMemo(() => createColumns(handlePaymentSuccess), [handlePaymentSuccess]);

    // Filter data based on active tab
    const filteredData = useMemo(() => {
        // Show all fetched rows (already filtered by sr_code=null on server/client)
        const base = data || [];

        const q = searchQuery.trim().toLowerCase();
        if (!q) return base;

        return base.filter((item) => {
            const fields: Array<unknown> = [
                item.sr_code,
                item.sr_id,
                item.sr_type,
                item.sr_req_date,
                item.sr_req_status,
                item.sr_case_status,
                item.comp_id,
                item.complainant_name,
            ];
            return fields.some((v) => String(v ?? "").toLowerCase().includes(q));
        });
    }, [data, activeTab, searchQuery]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((filteredData?.length || 0) / pageSize));
    }, [filteredData, pageSize]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        return filteredData.slice(start, end);
    }, [filteredData, currentPage, pageSize]);

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
                    <Input
                        placeholder="Search..."
                        className="pl-10 w-full bg-white text-sm"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    /> {/* Adjust padding and text size */}
                </div>
               
                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
                        <div className="flex items-center gap-4">
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

                            {/* Tabs - moved beside Show Entries */}
                            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                                <button
                                    onClick={() => setActiveTab("pending")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                                        activeTab === "pending"
                                            ? "bg-[#ffeaea] text-[#b91c1c] border-[#f3dada] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    Pending
                                </button>
                                <button
                                    onClick={() => setActiveTab("declined")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                                        activeTab === "declined"
                                            ? "bg-[#ffeaea] text-[#b91c1c] border-[#f3dada] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    Declined
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-6 flex items-center justify-center">
                            <div className="flex items-center gap-3 text-darkGray">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span className="text-sm">Loading service charges...</span>
                            </div>
                        </div>
                    ) : paginatedData.length === 0 ? (
                        <div className="p-6 text-sm text-darkGray text-center">
                            {activeTab === "pending" ? "No pending service charge records found." : "No declined service charge records found."}
                        </div>
                    ) : (
                        <DataTable columns={columns} data={paginatedData}></DataTable>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        {(() => {
                            const total = filteredData?.length || 0;
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