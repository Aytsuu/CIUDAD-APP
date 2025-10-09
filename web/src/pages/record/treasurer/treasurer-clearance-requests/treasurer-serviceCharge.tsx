import { DataTable } from "@/components/ui/table/data-table";
import { useMemo, useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { X, Search, ReceiptText } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Input } from "@/components/ui/input";
import { ArrowUpDown } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import ReceiptForm from "./treasurer-create-receipt-form";
import { useServiceChargeRate, useTreasurerServiceCharges } from "./queries/serviceChargeQueries";
import type { ServiceCharge } from "./restful-api/serviceChargeGetAPI";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { useQueryClient } from "@tanstack/react-query";
import { useLoading } from "@/context/LoadingContext";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";


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
                            id: String(sc.payment_request?.spay_id || sc.sr_id),
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
    const { showLoading, hideLoading } = useLoading();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [activeTab, setActiveTab] = useState<"pending" | "declined" | "paid">("pending");
    const [searchQuery, setSearchQuery] = useState("");
    
    const { data, isLoading, error, refetch } = useTreasurerServiceCharges(searchQuery, currentPage, pageSize);
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
    
    const serviceCharges = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    // Function to refresh data after successful payment
    const handlePaymentSuccess = async () => {
        console.log("Payment successful, refreshing data...");
        showSuccessToast("Payment processed successfully!");
        // Invalidate and refetch the service charges data
        await queryClient.invalidateQueries({ queryKey: ['treasurer-service-charges'] });
        await refetch();
        console.log("Data refreshed successfully");
    };

    const columns = useMemo(() => createColumns(handlePaymentSuccess), [handlePaymentSuccess]);

    // Filter data based on active tab (client-side filtering)
    const filteredData = useMemo(() => {
        if (activeTab === "declined") {
            // For declined items, we might need to implement server-side filtering
            // For now, return empty array as declined items are handled differently
            return [];
        } else if (activeTab === "paid") {
            // Filter for paid service charges
            return serviceCharges.filter(charge => 
                charge.payment_request?.spay_status === "Paid"
            );
        }
        // For pending tab, show unpaid service charges
        return serviceCharges.filter(charge => 
            charge.payment_request?.spay_status === "Unpaid" || 
            !charge.payment_request?.spay_status
        );
    }, [serviceCharges, activeTab]);

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
                            placeholder="Search by case number, complainant name, or status..."
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
                                    onClick={() => setActiveTab("paid")}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors border ${
                                        activeTab === "paid"
                                            ? "bg-[#e6f7e6] text-[#16a34a] border-[#d1f2d1] shadow-sm"
                                            : "text-gray-600 hover:text-gray-900 border-transparent hover:bg-gray-200"
                                    }`}
                                >
                                    Paid
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
                        <div className="flex items-center justify-center py-12">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-4 text-red-500">Error loading data</div>
                    ) : filteredData.length === 0 ? (
                        <div className="p-6 text-sm text-darkGray text-center">
                            {activeTab === "pending" ? "No pending service charge records found." : 
                             activeTab === "paid" ? "No paid service charge records found." : 
                             "No declined service charge records found."}
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <DataTable columns={columns} data={filteredData} header={true} />
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 sm:gap-0">
                    <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} rows
                    </p>

                    <div className="w-full sm:w-auto flex justify-center">
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