import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleAlert, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { ResidentRecord } from "../profilingTypes";

// Define the colums for the data table
export const requestColumns: ColumnDef<ResidentRecord>[] = [
    {
        accessorKey: "id",
        header: ({ column }) => (
            <div
            className="flex w-full justify-center items-center gap-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Request (#)
            <ArrowUpDown size={14} />
            </div>
        )
    },
    {
        accessorKey: "address",
        header: 'Address'
    },
    {
        accessorKey: "lname",
        header: ({ column }) => (
            <div
            className="flex w-full justify-center items-center gap-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Last Name
            <ArrowUpDown size={14} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
            {row.getValue("lname")}
            </div>
        ),
    },
    {
        accessorKey: "fname",
        header: ({ column }) => (
            <div
            className="flex w-full justify-center items-center gap-2 cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            First Name
            <ArrowUpDown size={14} />
            </div>
        ),
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
            {row.getValue("fname")}
            </div>
        ),
    },
    {
        accessorKey: "mname",
        header: "Middle Name",
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
            {row.getValue("mname") ? row.getValue("mname") : '-'}
            </div>
        )
    },
    {
        accessorKey: "suffix",
        header: "Suffix",
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
            {row.getValue("suffix") ? row.getValue("suffix") : '-'}
            </div>
        )
    },
    {
        accessorKey: "requestDate",
        header: "Date Requested",
        cell: ({ row }) => (
            <div className="hidden lg:block max-w-xs truncate">
                {row.getValue("dateRegistered")}
            </div>
        ),
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <Link to="/resident-form" 
            >
            <Button variant="outline">
                View <MoveRight/>
            </Button>
            </Link>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];