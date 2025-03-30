import { ColumnDef } from "@tanstack/react-table";
import { BusinessRecord } from "../profilingTypes";

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
] 