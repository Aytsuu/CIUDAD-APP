import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Ellipsis, Trash } from "lucide-react"
import { AdministrationRecord } from "./administrationTypes"
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout"
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout"

export const administrationColumns: ColumnDef<AdministrationRecord>[] = [
    {
        accessorKey: 'id',
        header: ({column}) => (
            <div
                className="w-full h-full flex justify-center items-center gap-2 cursor-pointer"
                onClick={() => (column.toggleSorting(column.getIsSorted() === "asc"))}
            >
                Staff (#)
                <TooltipLayout
                    trigger={<ArrowUpDown size={15}/>}
                    content={"Sort"}
                />
            </div>
        )
    },
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
        ),
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
                {row.getValue("mname") ? row.getValue("mname") : '-'}
            </div>
        )
    },
    {
        accessorKey: 'suffix',
        header: 'Suffix',
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
                {row.getValue("suffix") ? row.getValue("suffix") : '-'}
            </div>
        )
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
        accessorKey: 'position',
        header: 'Position'
    },
    {
        accessorKey: 'dateAssigned',
        header: 'Date Assigned'
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({row}) => (
            <DropdownLayout
                trigger={<Ellipsis size={20}/>}
                itemClassName="text-red-500 focus:text-red-500"
                options={[
                    {
                        id: 'delete',
                        name: 'Remove',
                        icon: <Trash />
                    }
                ]}
            />
        )
    }
]