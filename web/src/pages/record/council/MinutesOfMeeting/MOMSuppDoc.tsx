import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Eye, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Label } from "@/components/ui/label";

type SuppDoc = {
    id: string;
    momsp_title: string;
    momsp_date: string;
    file_url: string;
};

export default function MOMSuppDoc() {
    const [searchQuery, setSearchQuery] = useState("");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Sample data - in a real app, this would come from an API
    const data: SuppDoc[] = [
        { id: "1", momsp_title: "Tiltilaok", momsp_date: "2023-01-01", file_url: "#" },
        { id: "2", momsp_title: "Budget Report", momsp_date: "2023-02-15", file_url: "#" },
        { id: "3", momsp_title: "Annual Plan", momsp_date: "2023-03-20", file_url: "#" },
        // Add more sample data as needed
    ];

    // Filter data based on search query
    const filteredData = data.filter((doc) => 
        `${doc.momsp_title} ${doc.momsp_date}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
    );

    // Pagination calculations
    const totalPages = Math.ceil(filteredData.length / pageSize);
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const columns: ColumnDef<SuppDoc>[] = [
        { 
            accessorKey: 'momsp_date',
            header: "Date",
        },
        { 
            accessorKey: 'momsp_title', 
            header: "Document Title",
        },
        {
            accessorKey: 'actions', 
            header: 'Actions',
            cell: ({row}) => (
                <div className='flex justify-center gap-1'>
                    <TooltipLayout
                        trigger={
                            <a
                                href={row.original.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer flex items-center justify-center h-8"
                            >
                                <Eye size={16}/>
                            </a>
                        }
                        content="View"
                    />
                </div>
            )
        }
    ];

    return (
        <div className='w-full h-full'>
            <div className='bg-white rounded-lg'>
                {/* Header with Search and Create Button */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-medium text-gray-800">
                            Supporting Documents ({filteredData.length})
                        </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={17}
                            />
                            <Input
                                placeholder="Search..."
                                className="pl-10 bg-white w-full"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>

                        {/* <div className="w-full sm:w-auto">
                            <DialogLayout
                                trigger={<Button className="w-full sm:w-auto">Add <Plus className="ml-2" /></Button>}
                                title="Add Supporting Document"
                                description="Upload supporting documents for meetings"
                                mainContent={
                                    <AddSuppDoc
                                        onSuccess={() => setIsDialogOpen(false)}
                                    />
                                }
                                isOpen={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            />
                        </div> */}
                    </div>
                </div>

                {/* Entries per page selector */}
                <div className="flex justify-between p-3 border-t">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs sm:text-sm">Show</Label>
                        <Input
                            type="number"
                            className="w-14 h-8"
                            min="1"
                            value={pageSize}
                            onChange={(e) => {
                                const value = +e.target.value;
                                setPageSize(value >= 1 ? value : 1);
                                setCurrentPage(1);
                            }}
                        />
                        <Label className="text-xs sm:text-sm">Entries</Label>
                    </div>
                </div>

                {/* Data Table */}
                <div className="border overflow-auto max-h-[400px]">
                    <DataTable 
                        data={paginatedData} 
                        columns={columns}
                    />
                </div>

                {/* Pagination Section */}
                <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
                    <p className="text-xs sm:text-sm text-gray-600">
                        Showing {(currentPage - 1) * pageSize + 1}-
                        {Math.min(currentPage * pageSize, filteredData.length)} of{" "}
                        {filteredData.length} rows
                    </p>
                    {filteredData.length > 0 && (
                        <PaginationLayout
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                setCurrentPage(page);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}