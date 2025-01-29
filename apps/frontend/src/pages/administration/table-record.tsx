import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { SquarePen } from "lucide-react";

export default function TableRecord({}){
    return(
    <Table>
        <TableHeader>
            <TableRow>
                <TableHead className="text-center">ID</TableHead>
                <TableHead className="text-center">Last Name</TableHead>
                <TableHead className="text-center">First Name</TableHead>
                <TableHead className="text-center">Middle Name</TableHead>
                <TableHead className="text-center">Date Assigned</TableHead>
                <TableHead className="text-center">Position</TableHead>
                <TableHead className="text-center">Action</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="text-center">Lorem</TableCell>
                <TableCell className="flex flex-row justify-center"><SquarePen className="text-gray"/></TableCell>
            </TableRow>
        </TableBody>
    </Table>
    )
}