import React from "react";
import { Search, Plus, FileInput} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { DataTable } from "@/components/ui/table/data-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { householdColumns } from "./HouseholdColumns";
import { HouseholdRecord } from "../profilingTypes";
import { useQuery } from "@tanstack/react-query";
import { getHouseholds, getSitio, getResidents } from "../restful-api/profilingGetAPI";
import { Skeleton } from "@/components/ui/skeleton";
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component";
import { Link } from "react-router";

export default function HouseholdRecords(){

    const [searchQuery, setSearchQuery] = React.useState<string>('')
    const [pageSize, setPageSize] = React.useState<number>(10)
    const [currentPage, setCurrentPage] = React.useState<number>(1);

    // Fetch households using useQuery
    const { data: households, isLoading: isLoadingHouseholds } = useQuery({
        queryKey: ['households'],
        queryFn: getHouseholds,
        refetchOnMount: true,
        staleTime: 0
    })
    
    // Fetch staffs using useQuery
    const { data: sitio, isLoading: isLoadingSitio } = useQuery({
        queryKey: ['sitio'],
        queryFn: getSitio,
        refetchOnMount: true,
        staleTime: 0
    })

    // Fetch residents using useQuery
    const { data: residents, isLoading: isLoadingResidents } = useQuery({
        queryKey: ['residents'],
        queryFn: getResidents,
        refetchOnMount: true, 
        staleTime: 0, 
    });

    // Format households to populate data table
    const formatHouseholdData = (): HouseholdRecord[] => {
        if(!households) return [];

        return households.map((item: any)=> {

            const sitio = item.sitio
            const personal = item.rp.per
            const staff = item.staff.rp.per

            return {
                id: item.hh_id || '',
                streetAddress: item.hh_street || '',
                sitio: sitio?.sitio_name || '',
                nhts: item.hh_nhts || '',
                headNo: item.rp.rp_id,
                head: `${personal.per_lname}, ${personal.per_fname} ${personal.per_mname.slice(0,1)}.` || '',
                dateRegistered: item.hh_date_registered || '',
                registeredBy: `${staff.per_lname}, ${staff.per_fname} ${staff.per_mname.slice(0,1)}.` || ''
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

    if(isLoadingHouseholds || isLoadingSitio || isLoadingResidents) {
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
            <div className="hidden lg:flex justify-between items-center mb-4 gap-2">
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
                <Link to="/household-form" 
                    state={{
                        params: {
                            sitio: sitio, 
                            residents: residents, 
                            households: households
                        }
                    }}
                >
                    <Button>
                        <Plus size={15} /> Register
                    </Button>
                </Link>
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