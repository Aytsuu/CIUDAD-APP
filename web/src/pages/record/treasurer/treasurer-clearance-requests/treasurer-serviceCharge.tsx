import { DataTable } from "@/components/ui/table/data-table";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {Search, ReceiptText, Clock, CheckCircle, Ban } from 'lucide-react';
import { Button } from "@/components/ui/button/button";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ReceiptForm from "./treasurer-create-receipt-form";
import DeclineRequestForm from "./declineForm";
import { useServiceChargeRate, useTreasurerServiceCharges } from "./queries/serviceChargeQueries";
import type { ServiceCharge } from "./restful-api/serviceChargeGetAPI";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/LoadingContext";
import { showErrorToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";


// Create columns function that accepts the handlePaymentSuccess and handleDeclineSuccess callbacks
const createColumns = (handlePaymentSuccess: () => void, handleDeclineSuccess: () => void, activeTab: "unpaid" | "paid" | "declined"): ColumnDef<ServiceCharge>[] => [
    { accessorKey: "sr_code",
        header: ({ column }) => (
              <div
                className="flex w-full justify-center items-center gap-2 cursor-pointer"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                SR No.
                <ArrowUpDown size={14}/>
              </div>
        ),
        cell: ({row}) => (
            <div className="flex justify-center items-center gap-2">
              <span className="px-4 py-1 rounded-full text-xs font-semibold bg-[#eaf4ff] text-[#2563eb] border border-[#b6d6f7]">
                {row.getValue("sr_code")}
              </span>
            </div>
        )
    },
    {accessorKey: "complainant_name", header: "Complainant Name"},
    {
        accessorKey: "accused_names",
        header: "Respondent",
        cell: ({ row }: { row: any }) => {
            const accusedNames = row.original.accused_names as string[] | null | undefined;
            if (!accusedNames || accusedNames.length === 0) {
                return <span className="text-gray-400">N/A</span>;
            }
            return (
                <div className="max-w-md">
                    <span className="text-sm text-gray-700">
                        {accusedNames.join(', ')}
                    </span>
                </div>
            );
        }
    },
    {accessorKey: "sr_type", 
        header: "Type",
        cell: ({ row }) => {
            const value = row.getValue("sr_type") as string;
            const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
            let bg = "bg-[#eaf4ff]";
            let text = "text-[#2563eb]";
            let border = "border border-[#b6d6f7]";
            
            if (capitalizedValue === "Summon") {
                bg = "bg-[#fffbe6]";
                text = "text-[#b59f00]";
                border = "border border-[#f7e7b6]";
            } else if (capitalizedValue === "File action") {
                bg = "bg-[#e6f7e6]";
                text = "text-[#16a34a]";
                border = "border border-[#d1f2d1]";
            } else {
                bg = "bg-[#f3f2f2]";
                text = "text-black";
                border = "border border-[#e5e7eb]";
            }
            
            return (
                <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
                    style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
                >
                    {capitalizedValue}
                </span>
            );
        }
    },
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
    
    ...(activeTab === "unpaid" ? [{
        accessorKey: "sr_req_status" as const, 
        header: "Request Status",
        cell: ({ row }: { row: any }) => {
            const value = row.getValue("sr_req_status") as string;
            const capitalizedValue = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
            let bg = "bg-[#eaf4ff]";
            let text = "text-[#2563eb]";
            let border = "border border-[#b6d6f7]";
            
            if (capitalizedValue === "Pending") {
                bg = "bg-[#fffbe6]";
                text = "text-[#b59f00]";
                border = "border border-[#f7e7b6]";
            } else if (capitalizedValue === "Completed") {
                bg = "bg-[#e6f7e6]";
                text = "text-[#16a34a]";
                border = "border border-[#d1f2d1]";
            } else if (capitalizedValue === "Declined") {
                bg = "bg-[#ffeaea]";
                text = "text-[#b91c1c]";
                border = "border border-[#f3dada]";
            } else {
                bg = "bg-[#f3f2f2]";
                text = "text-black";
                border = "border border-[#e5e7eb]";
            }
            
            return (
                <span
                    className={`px-4 py-1 rounded-full text-xs font-semibold ${bg} ${text} ${border}`}
                    style={{ display: "inline-block", minWidth: 80, textAlign: "center" }}
                >
                    {capitalizedValue}
                </span>
            );
        }
    }] : []),
    // Conditionally show Reason for Decline column only for declined tab
    ...(activeTab === "declined" ? [{
        accessorKey: "pay_reason" as const,
        header: "Reason for Decline",
        cell: ({ row }: { row: any }) => {
            const reason = row.original.pay_reason as string | null | undefined;
            return (
                <div className="max-w-md">
                    <span className="text-sm text-gray-700">
                        {reason || "N/A"}
                    </span>
                </div>
            );
        }
    }] : []),
    // Conditionally show Action column only for unpaid tab
    ...(activeTab === "unpaid" ? [{
        accessorKey: "action" as const, 
        header: "Action",
        cell: ({ row }: { row: any }) =>(
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
                            id: String(sc.sr_id), // Always use sr_id for service charge
                            purpose: sc.sr_type || "Service Charge",
                            rate: (window as any).__serviceChargeRate || "0",
                            requester: sc.complainant_name || "Unknown",
                            pay_status: sc.payment_request?.spay_status || "Unpaid",
                            nat_col: "Service Charge",
                            is_resident: false,
                            pay_id: sc.payment_request?.spay_id || (parseInt(sc.sr_id) || undefined) // Get spay_id from payment_request, fallback to sr_id if valid
                          };
                          return (
                            <ReceiptForm
                              id={receiptData.id}
                              purpose={receiptData.purpose}
                              rate={receiptData.rate}
                              requester={receiptData.requester}
                              pay_status={receiptData.pay_status}
                              nat_col={receiptData.nat_col}
                              is_resident={receiptData.is_resident}
                              pay_id={receiptData.pay_id}
                              onComplete={handlePaymentSuccess}
                              onRequestDiscount={() => {}}
                            />
                          );
                        })()
                    } 
                  />
              } content="Create Receipt"/>
              <TooltipLayout 
                trigger={
                    <DialogLayout
                    trigger={
                        <Button variant="destructive" size="sm">
                        Decline
                        </Button>
                    }
                    className="max-w-md"
                    title="Decline Service Charge Request"
                    description="Provide a reason for declining this service charge request."
                    mainContent={
                        <DeclineRequestForm
                        // Use payment request spay_id (which is the pay_id string from backend)
                        id={String(row.original.payment_request?.spay_id || row.original.sr_id)}
                        isResident={false}
                        isServiceCharge={true}
                        onSuccess={async () => {
                            // Refresh the data
                            await handleDeclineSuccess();
                        }}
                        />
                    }
                    />
                }
                content="Decline Request"
                />
          </div>
        )}] : [])
];

function ServiceCharge(){
    const { showLoading, hideLoading } = useLoading();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState<"unpaid" | "paid" | "declined">("unpaid");
    const [searchQuery, setSearchQuery] = useState("");
    
    // Reset to page 1 when tab changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);
    
    const { data, isLoading, error, refetch } = useTreasurerServiceCharges(searchQuery, currentPage, pageSize, activeTab);
    const { data: rateObj } = useServiceChargeRate();
    
    // Handle loading state
    useEffect(() => {
        if (isLoading) {
            showLoading();
        } else {
            hideLoading();
        }
    }, [isLoading, showLoading, hideLoading]);

    // Handle errors
    useEffect(() => {
        if (error) {
            console.error("Error fetching service charges:", error);
            showErrorToast("Failed to load service charge data. Please try again.");
        }
    }, [error]);
    
    // Console log the fetched data
    console.log("Fetched ServiceCharge data:", data);
    console.log("Fetched rate data:", rateObj);
    
    // Expose to receipt dialog content renderer (string value)
    (window as any).__serviceChargeRate = rateObj?.pr_rate != null ? String(rateObj.pr_rate) : "0";
    
    // Use data directly from backend (already filtered by tab)
    const serviceCharges = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Function to refresh data after successful payment
    const handlePaymentSuccess = async () => {
        console.log("Payment successful, refreshing data...");
        // Invalidate and refetch the service charges data
        await queryClient.invalidateQueries({ queryKey: ['treasurer-service-charges'] });
        await refetch();
        console.log("Data refreshed successfully");
    };

    // Function to refresh data after declining a request
    const handleDeclineSuccess = async () => {
        console.log("Request declined, refreshing data...");
        // Invalidate and refetch the service charges data
        await queryClient.invalidateQueries({ queryKey: ['treasurer-service-charges'] });
        await refetch();
        console.log("Data refreshed successfully");
    };

    const columns = useMemo(() => createColumns(handlePaymentSuccess, handleDeclineSuccess, activeTab), [handlePaymentSuccess, handleDeclineSuccess, activeTab]);

    // Handle search
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1); // Reset to first page when searching
    };

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
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative flex-1 max-w-[20rem]">
                        <Search
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                            size={17}
                        />
                        <Input
                            placeholder="Search by SR number, complainant name, or status..."
                            className="pl-10 w-full bg-white text-sm"
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>
                </div>
               
                <div className="bg-white">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 m-6">
                        <div className="flex items-center gap-4">
                            <div className="flex gap-x-2 items-center">
                            <p className="text-xs sm:text-sm">Show</p>
                            <Input 
                                type="number" 
                                className="w-14 h-8" 
                                value={pageSize}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value || '10', 10);
                                    const safe = isNaN(val) || val <= 0 ? 10 : val;
                                    setPageSize(safe);
                                    setCurrentPage(1);
                                }}
                                min="1"
                                max="100"
                            />
                            <p className="text-xs sm:text-sm">Entries</p>
                            </div>

                            {/* Tabs - moved beside Show Entries */}
                            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300">
                                <button
                                    onClick={() => setActiveTab("unpaid")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                        activeTab === "unpaid"
                                            ? "bg-[#fffbe6] text-[#b59f00] border-[#f7e7b6] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    <Clock size={14} />
                                    Unpaid
                                </button>
                                <button
                                    onClick={() => setActiveTab("paid")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                        activeTab === "paid"
                                            ? "bg-[#e6f7e6] text-[#16a34a] border-[#d1f2d1] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    <CheckCircle size={14} />
                                    Paid
                                </button>
                                <button
                                    onClick={() => setActiveTab("declined")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border flex items-center gap-2 ${
                                        activeTab === "declined"
                                            ? "bg-[#ffeaea] text-[#b91c1c] border-[#f3dada] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    <Ban size={14} />
                                    Declined
                                </button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : serviceCharges.length === 0 ? (
                        <div className="p-6 text-sm text-darkGray text-center">
                            {activeTab === "unpaid" ? "No unpaid service charge records found." : 
                             activeTab === "paid" ? "No paid service charge records found." : 
                             "No declined service charge records found."}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <DataTable columns={columns} data={serviceCharges} header={true} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-end">
                        <PaginationLayout
                            totalPages={totalPages}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </div>  
            </div>
        </div>
    )


}

export default ServiceCharge