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
import { Plus } from "lucide-react";

export function TableRecord({}){
    return(
    <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
            <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            <TableRow>
            <TableCell className="font-medium">INV001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
            </TableRow>
        </TableBody>
    </Table>
    )
}


export function AdministrativeRecord(){

    return(
        <main className="relative w-full h-[100vh] bg-snow flex flex-col justify-center items-center">
            <div className="w-1/2 h-1/2 flex flex-col gap-3">
                <div>
                    <Button className="bg-blue hover:bg-blue hover:opacity-[80%]"> 
                        <Plus /> Register
                    </Button>
                </div>
                <div>
                    <TableRecord/>
                </div>
            </div>
        </main>
    )

}