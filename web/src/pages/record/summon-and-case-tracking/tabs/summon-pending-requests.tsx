import { DataTable } from "@/components/ui/table/data-table";
import { useGetSummonReqPendingList } from "../queries/summonFetchQueries";
import { ColumnDef } from "@tanstack/react-table";
import { formatTimestamp } from "@/helpers/timestampformatter";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import React from "react";
import { Button } from "@/components/ui/button/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { ComplaintRecordForSummon } from "../complaint-record";

export default function SummonPendingReqs() {
    const { data: pendingReq = [], isLoading } = useGetSummonReqPendingList();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = React.useState<number>(10);
    const [selectedIncident, setSelectedIncident] = useState<string>("0");
    const [editingRowId, setEditingRowId] = useState<string | null>(null);

    
    console.log('fetchedData:', pendingReq);

    // Filter and paginate function
    const filterAndPaginate = (rows: any[], search: string, page: number, pageSize: number) => {
        const filtered = rows.filter(item => {
            const matchesIncident = selectedIncident === "0" || item.incident_type === selectedIncident;
            const matchesSearch = search === "" || 
                (item.sr_code && item.sr_code.toLowerCase().includes(search.toLowerCase())) ||
                (item.complainant_names && item.complainant_names.toString().toLowerCase().includes(search.toLowerCase())) ||
                (item.accused_names && item.accused_names.toString().toLowerCase().includes(search.toLowerCase())) ||
                (item.incident_type && item.incident_type.toLowerCase().includes(search.toLowerCase()));
            return matchesIncident && matchesSearch;
        });
        
        const total = filtered.length;
        const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
        return { filtered, paginated, total };
    };

    // Apply filtering and pagination
    const { filtered: _filteredData, paginated: paginatedData, total: totalItems } = filterAndPaginate(
        pendingReq, 
        searchQuery, 
        currentPage, 
        pageSize
    );

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: "sr_id ",
            header: "Request No.",
            cell: ({ row }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    {row.original.sr_id}
                </span>
            ),
        },
        {
            accessorKey: "sr_req_date",
            header: "Date Requested",
            cell: ({ row }) => formatTimestamp(row.original.sr_req_date),
        },
        {
            accessorKey: "complainant_names",
            header: "Complainant/s",
        },
        { 
            accessorKey: "accused_names", 
            header: "Respondent/s",
            cell: ({ row }) => (
                <div>
                    {Array.isArray(row.original.accused_names) 
                        ? row.original.accused_names.join(", ")
                        : row.original.accused_names
                    }
                </div>
            )
        },
        {
            accessorKey: "incident_type",
            header: "Incident Type",
            cell: ({ row }) => (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {row.original.incident_type}
                </span>
            ),
        },
        {
            // View Button
            accessorKey: "",
            header: " ",
            cell: ({ row }) => {
                const complaint = row.original.comp_id || [];
                return (
                    <DialogLayout
                        className="w-[90vw] h-[80vh] max-w-[1800px] max-h-[1000px]"
                        trigger={
                            <Button className="flex items-center gap-2 text-primary bg-white shadow-none hover:bg-white group">
                                <span className="text-sm font-medium group-hover:text-primary">View</span>
                                <div className="w-5 h-5 rounded-full border border-primary flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <ChevronRight className="h-3 w-3 text-primary group-hover:text-white transition-colors" />
                                </div>
                            </Button>
                        }
                        title="Complaint Record"
                        description = "Full details of the complaint filed."
                            mainContent={
                            <div className="flex flex-col h-full">
                                <div className="overflow-y-auto flex-1 pr-2">
                                    <ComplaintRecordForSummon 
                                        comp_id={complaint} 
                                        sr_id={String(row.original.sr_id)}
                                        onSuccess={() => setEditingRowId(null)}
                                    />
                                </div>
                            </div>
                            
                        }
                        isOpen={editingRowId == row.original.sr_id}
                        onOpenChange={(open) => setEditingRowId(open? row.original.sr_id: null)}
                    />
                );
            },
        },
    ];

    if (isLoading) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3" />
                <Skeleton className="h-7 w-1/4 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4/5 w-full mb-4" />
            </div>
        );
    }

    return (
        <div>
            <div className="mt-3 w-full bg-white p-4 rounded-lg shadow">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 mb-4">
                    <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
                        <div className="relative flex-1 max-w-[500px]">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                            <Input 
                                placeholder="Search..." 
                                className="pl-10 w-full bg-white text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        
                        <div className="w-full sm:w-[250px]">
                            <SelectLayout
                                className="w-full bg-white"
                                placeholder="Filter by Incident Type"
                                options={[
                                    { id: "0", name: "All Incident Types" },
                                    ...Array.from(new Set(pendingReq.map(item => item.incident_type)))
                                        .filter(name => name)
                                        .map((name) => ({ id: name, name }))
                                ]}
                                value={selectedIncident}
                                label=""
                                onChange={(value) => {
                                    setSelectedIncident(value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* Page Size Selector */}
                <div className="flex items-center gap-2 justify-end mb-4">
                    <span className="text-sm">Show</span>
                    <Select 
                        value={pageSize.toString()} 
                        onValueChange={(value) => {
                            setPageSize(Number.parseInt(value));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-20 h-9 bg-white border-gray-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                    </Select>
                    <span className="text-sm">entries</span>
                </div>
                
                <DataTable columns={columns} data={paginatedData} />
                
                {/* Pagination */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-sm mt-4 gap-4">
                    <p className="text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, totalItems)} of {totalItems} rows
                    </p>
                    {totalItems > 0 && (
                        <PaginationLayout
                            currentPage={currentPage}
                            totalPages={Math.ceil(totalItems / pageSize)}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}