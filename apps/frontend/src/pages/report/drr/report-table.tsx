import { 
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell 
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

export default function ReportTable(){
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">Category</TableHead>
                    <TableHead className="text-center">Location</TableHead>
                    <TableHead className="text-center">Description</TableHead>
                    <TableHead className="text-center">Time of Incident</TableHead>
                    <TableHead className="text-center">Reported By</TableHead>
                    <TableHead className="text-center">Time Reported</TableHead>
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
                    <TableCell className="text-center">
                        <Button
                            variant={"outline"}
                            className=""
                        >
                            View
                        </Button>
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>

    );
}