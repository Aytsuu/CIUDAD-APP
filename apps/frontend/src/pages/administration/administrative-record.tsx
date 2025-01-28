import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"

import { Button } from "@/components/ui/button";
import { Plus, SquarePen } from "lucide-react";

export function TableRecord({}){
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


export function AdministrativeRecord(){

    return(
        <main className="relative w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-1/2 h-1/2 flex flex-col gap-3">
                <div className="flex flex-row gap-2">
                    <Button className="bg-blue hover:bg-blue hover:opacity-[80%]"> 
                        <Plus /> Register
                    </Button>
                    <Button variant='outline' className="border-darkBlue1"> 
                        Position
                    </Button>
                </div>
                <div className="w-full h-full bg-white border border-gray rounded-[10px] p-[10px]">
                    <TableRecord/>
                </div>
                <TableCaption>A list of your recent invoices.</TableCaption>
            </div>
        </main>
    )

}