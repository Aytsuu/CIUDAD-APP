import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Input } from "@/components/ui/input";
import { Link } from "react-router";
import { ArrowUpDown, Plus, Pen, UserRoundCog, Filter } from "lucide-react";
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
            <Button variant={"outline"}><Pen/></Button>
        )
    }
]

export default function AdministrativeRecords(){

    const data = records;

    return(
        <div className="relative w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-[80%] h-4/5 flex flex-col">
                <div className="w-full h-full bg-white border border-gray rounded-[5px] flex flex-col">
                    <div className="w-full flex justify-between p-5">
                        <div className="w-1/3 flex gap-2">
                            <Input type="text" placeholder="Search..."/>
                            <SelectLayout 
                                label=""
                                placeholder="Filter by"
                                className=""
                                options={[]}
                                value=""
                                onChange={() => {}} 
                            />
                        </div>
                        
                        <div className="flex gap-2">
                            <Link to="/role">
                                <Button > 
                                    <UserRoundCog /> Role
                                </Button>
                            </Link>
                            <Button > 
                                <Plus /> Register a Staff
                            </Button>
                        </div>
                    </div>
                    <DataTable columns={columns} data={data}/>
                </div>
                <PaginationLayout className="justify-end h-[10%]"/>
            </div>  
        </div>
    )

}