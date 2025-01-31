import ComplaintDialog from "./complaint-dialog";
import dialogProps from "./props";

import { 
    Table, 
    TableHeader,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
} from "@/components/ui/table";

export default function BlotterTable(){
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="text-center">No.</TableHead>
                    <TableHead className="text-center">Complainant Name</TableHead>
                    <TableHead className="text-center">Complainant Address</TableHead>
                    <TableHead className="text-center">Accused Name</TableHead>
                    <TableHead className="text-center">Accused Address</TableHead>
                    <TableHead className="text-center">Incident Date</TableHead>
                    <TableHead className="text-center">Date Submitted</TableHead>
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
                    <TableCell className="text-center">Lorem</TableCell>
                    <TableCell className="text-center">
                        <ComplaintDialog 
                            trigger={dialogProps.viewTrigger} 
                            action={dialogProps.ViewAction}  
                            title={dialogProps.viewTitle}
                            description={dialogProps.viewDescription}
                        />
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    )
}