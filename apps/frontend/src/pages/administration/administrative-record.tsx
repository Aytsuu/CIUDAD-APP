import { useState } from "react";

import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Plus } from "lucide-react";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Pen } from "lucide-react";
import { Input } from "@/components/ui/input";

const categoryOptions = [
    { id: "1", label: "Profiling", checked: false },
    { id: "2", label: "Certification", checked: false },
    { id: "3", label: "Report", checked: false },
];

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

export function AdministrativeRecord(){

    const data = records;
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    const handleCategoryChange = (id: string, checked: boolean) => {
        setSelectedCategories((prev) =>
        checked ? [...prev, id] : prev.filter((category) => category !== id)
        );
    };

    const handleReset = () => {
        setSelectedCategories([]);
    };

    return(
        <div className="relative w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-[80%] h-4/5 flex flex-col">
                <div className="w-full h-full bg-white border border-gray rounded-[5px] flex flex-col">
                    <div className="w-full flex justify-between p-5">
                        <div className="w-1/4 flex">
                            <Input type="text" placeholder="Search..."/>
                        </div>
                        <Button 
                        > 
                            <Plus /> Register a Staff
                        </Button>
                    </div>
                    <DataTable columns={columns} data={data}/>
                </div>
                <PaginationLayout className="justify-end h-[10%]"/>
                {/* <div className="w-1/4 bg-white border border-gray rounded-[10px] p-5 flex flex-col gap-2">
                    <FilterAccordion
                        title="Secretary"
                        options={categoryOptions.map((option) => ({
                            ...option,
                            checked: selectedCategories.includes(option.id),
                        }))}
                        selectedCount={selectedCategories.length}
                        onChange={handleCategoryChange}
                        onReset={handleReset}
                    />
                </div> */}
            </div>  
        </div>
    )

}