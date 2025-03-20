import React from "react";
import { Search, Plus, FileInput} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { householdColumns } from "../profilingColumns";
import HouseholdProfileForm from "./HouseholdProfileForm";
import { HouseholdRecord } from "../profilingTypes";
import { useQuery } from "@tanstack/react-query";
import { getHouseholds } from "../restful-api/profilingGetAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayoutComponent } from "@/components/ui/main-layout-component";

export default function ProfilingHousehold(){

    const [searchQuery, setSearchQuery] = React.useState('')
    const [pageSize, setPageSize] = React.useState(10)
    const [currentPage, setCurrentPage] = React.useState(1);
    const { data: households, isLoading: isLoadingHouseholds } = useQuery({
        queryKey: ['households'],
        queryFn: getHouseholds,
        refetchOnMount: true,
        staleTime: 0
    })

    const formatHouseholdData = (): HouseholdRecord[] => {
        if(!households) return [];

        return households.map((item: any)=> {

            const sitio = item.sitio
            const personal = item.per

            return {
                id: item.hh_id || '',
                streetAddress: item.hh_street || '',
                sitio: sitio?.sitio_name || '',
                nhts: item.hh_nhts || '',
                head: personal?.per_fname + ' ' + personal?.per_lname || '',
                dateRegistered: item.hh_date_registered || '',
                registeredBy: ''
            }
        })

    }

    const filteredHouseholds = React.useMemo(() => {
        let filtered = formatHouseholdData();

        filtered = filtered.filter((record: any) =>
            Object.values(record).join(" ").toLowerCase().includes(searchQuery.toLowerCase())
        )

        return filtered;
    }, [searchQuery, households])

    // Calculate total pages for pagination
    const totalPages = Math.ceil(filteredHouseholds.length / pageSize);

    // Slice the data for the current page
    const paginatedHouseholds = filteredHouseholds.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    if(isLoadingHouseholds) {
        return (
            <div className="w-full h-full">
                <Skeleton className="h-10 w-1/6 mb-3" />
                <Skeleton className="h-7 w-1/4 mb-6" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4/5 w-full mb-4" />
            </div>
        )
    }

    return (
        <MainLayoutComponent 
            title="Household Profiling"
            description="Manage and view household records"
        >
            <div className="hidden lg:flex justify-between items-center mb-4">
                <div className="flex gap-2 w-full">
                    <div className="relative flex-1">

                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={17} />
                        <Input
                            placeholder="Search..." 
                            className="pl-10 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <DialogLayout
                    trigger={
                        <Button>
                            <Plus size={15} /> Register
                        </Button>
                    }
                    title="Household Registration"
                    description="All fields are required"
                    mainContent={<HouseholdProfileForm/>}
                />
            </div>

            <div className="bg-white rounded-md">
                <div className="flex justify-between p-3">
                    <div className="flex items-center gap-2">
                        <p className="text-xs sm:text-sm">Show</p>
                        <Input
                            type="number"
                            className="w-14 h-6"
                            value={pageSize}
                            onChange={(e) => {
                                const value = +e.target.value;
                                if (value >= 1) {
                                    setPageSize(value);
                                } else {
                                    setPageSize(1); // Reset to 1 if invalid
                                }
                            }}
                            min="1"
                        />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                    <DropdownLayout
                        trigger={
                            <Button variant="outline">
                                <FileInput className="mr-2" /> Export
                            </Button>
                        }
                        options={[
                        { id: '', name: "Export as CSV"},
                        { id: '', name: "Export as Excel"},
                        { id: '', name: "Export as PDF"},
                        ]}
                    />
                </div>
                <div className="overflow-x-auto">
                    <DataTable columns={householdColumns} data={paginatedHouseholds} />
                </div>
                <div className="flex flex-col sm:flex-row justify-between items-center p-3 gap-3">
                    <p className="text-xs sm:text-sm text-darkGray">
                        Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredHouseholds.length)} of {filteredHouseholds.length} rows
                    </p>
                    {paginatedHouseholds.length > 0 && <PaginationLayout
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />}
                </div>
            </div>
        </MainLayoutComponent>
    )
}