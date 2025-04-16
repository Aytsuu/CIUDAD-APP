import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { Link } from "react-router";
import { RequestRecord } from "../profilingTypes";

// Define the colums for the data table
export const requestColumns = (requests: any[]): ColumnDef<RequestRecord>[] => [
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
        header: "Middle Name"
    },
    {
        accessorKey: "suffix",
        header: "Suffix"
    },
    {
        accessorKey: "address",
        header: 'Address'
    },
    {
        accessorKey: "requestDate",
        header: "Date Requested",
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <Link 
                to="/resident-form" 
                state={{
                    params: {
                        type: 'request',
                        title: 'Registration Request',
                        description: 'This is a registration request submitted by the user. Please review the details and approve or reject accordingly.',
                        data: requests.find((request) => request.req_id === row.original.id)
                    }
                }}
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