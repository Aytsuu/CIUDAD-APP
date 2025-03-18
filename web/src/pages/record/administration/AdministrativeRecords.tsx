import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { ArrowUpDown, Plus, Pen, UserRoundCog, Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";

type Record = {
    id: string
    lname: string
    fname: string
    mname: string
    suffix: string
    dateOfBirth: string
    contact: number
    dateAssigned: string
    position: string
}

const records: Record[] = [
    {
        id: 'Lorem',
        lname: 'Lorem',
        fname: 'Lorem',
        mname: 'Lorem',
        suffix: 'Lorem',
        dateOfBirth: 'Lorem',
        contact: 1233,
        dateAssigned: 'Lorem',
        position: 'Lorem'
    }
]

const columns: ColumnDef<Record>[] = [
    {
        accessorKey: 'lname',
        header: ({column}) => (
            <div
                className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
                onClick={() => (column.toggleSorting(column.getIsSorted() === "asc"))}
            >
                Last Name
                <TooltipLayout
                    trigger={<ArrowUpDown size={15}/>}
                    content={"Sort"}
                />
            </div>
        )
    },
    {
        accessorKey: 'fname',
        header: ({column}) => (
            <div
                className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
                onClick={()=> (
                    column.toggleSorting(column.getIsSorted() === "asc")
                )}
            >
                First Name
                <TooltipLayout
                    trigger={<ArrowUpDown size={15} />}
                    content={"Sort"}
                />
            </div>
        )
    },
    {
        accessorKey: 'mname',
        header: ({column}) => (
            <div
                className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
                onClick={()=> (
                    column.toggleSorting(column.getIsSorted() === "asc")
                )}
            >
                Middle Name
                <TooltipLayout
                    trigger={<ArrowUpDown size={15} />}
                    content={"Sort"}
                />
            </div>
        )
    },
    {
        accessorKey: 'suffix',
        header: 'Suffix'
    },
    {
        accessorKey: 'dateOfBirth',
        header: 'Date of Birth'
    },
    {
        accessorKey: 'contact',
        header: 'Contact'
    },
    {
        accessorKey: 'dateAssigned',
        header: 'Date Assigned'
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({row}) => (
            <Button variant={"outline"}>View</Button>
        )
    }
]

export default function AdministrativeRecords(){

    const data = records;

    return(
        <div className="w-full h-full flex flex-col">
            {/* Header Section */}
            <div className="flex-col items-center mb-4">
                <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                    Administrative Records
                </h1>
                <p className="text-xs sm:text-sm text-darkGray">
                    Manage and view staff information
                </p>
            </div>
            <hr className="border-gray mb-5 sm:mb-8" />

            <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
                <div className="flex gap-x-2">
                    <div className="relative flex-1 bg-white">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                        <Input placeholder="Search..." className="pl-10 w-72" />
                    </div>
                    <SelectLayout 
                        placeholder="Filter by"
                        label=""
                        className="bg-white"
                        options={[]}
                        value=""
                        onChange={() => {}}
                    />
                </div>
                <div>
                    <div className="flex gap-2">
                        <Link to="/role">
                            <Button > 
                                <UserRoundCog /> Role
                            </Button>
                        </Link>
                        <Link to="/resident-registration" state={{params: {origin: 'administration'}}}>
                            <Button > 
                                <Plus /> Register a Staff
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            
            <div className="w-full flex flex-col">
                <div className="w-full h-auto bg-white p-3">
                    <div className="flex gap-x-2 items-center">
                        <p className="text-xs sm:text-sm">Show</p>
                            <Input type="number" className="w-14 h-8" defaultValue="10" />
                        <p className="text-xs sm:text-sm">Entries</p>
                    </div>
                </div>
                <div className="bg-white w-full overflow-x-auto">
                    {/* Table Placement */}
                    <DataTable columns={columns} data={data} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
                {/* Showing Rows Info */}
                <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
                    Showing 1-10 of 150 rows
                </p>
    
                {/* Pagination */}
                <div className="w-full sm:w-auto flex justify-center">
                    <PaginationLayout />
                </div>
            </div>
        </div>  
    )

}