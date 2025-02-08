import { 
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell 
} from "@/components/ui/table/table";

interface TableProps{
    header: {head: React.ReactNode}[],
    body: {cell: React.ReactNode}[]
}

export default function TableLayout({ header, body }: TableProps){
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    {
<<<<<<< HEAD
                        header.map((header) => ( <TableHead className="text-center">{header.head}</TableHead> ))  
=======
                        header.map((head, index) => ( <TableHead key={`head-${index}`} className="text-center">{head}</TableHead> ))  
>>>>>>> 53565c43 (Update)
                    }             
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    {
<<<<<<< HEAD
                        body.map((body) => (<TableCell className="text-center">{body.cell}</TableCell>))
=======
                        rows.map((row, index) => (
                        <TableRow key={`row-${index}`}>
                            {row.map((cell, index) => (
                                    <TableCell key={`cell-${index}`} className="text-center">{cell}</TableCell>
                                ))}
                        </TableRow>))
>>>>>>> 53565c43 (Update)
                    }
                </TableRow>
            </TableBody>
        </Table>

    );
}