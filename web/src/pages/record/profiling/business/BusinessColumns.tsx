import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord } from "../profilingTypes";
import { Button } from "@/components/ui/button/button";
import { MoveRight } from "lucide-react";
import { Link } from "react-router";

export const businessColumns = (): ColumnDef<BusinessRecord>[] => [
    {
        accessorKey: 'id',
        header: 'Business No.'
    },
    {
        accessorKey: 'name',
        header: 'Business Name'
    },
    {
        accessorKey: 'grossSales',
        header: 'Gross Sales'
    },
    {
        accessorKey: 'sitio',
        header: 'Sitio'
    },
    {
        accessorKey: 'street',
        header: 'Street'
    },
    {
        accessorKey: 'respondent',
        header: 'Respondent'
    },
    {
        accessorKey: 'dateRegistered',
        header: 'Date Registered'
    },
    {
        accessorKey: 'registeredBy',
        header: 'Registered By'
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
            <Link to="/business-form">
                <Button variant={"outline"}>
                    View <MoveRight />
                </Button>
            </Link>
        )
    }
] 