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
                        header.map((header) => ( <TableHead className="text-center">{header.head}</TableHead> ))  
                    }             
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    {
                        body.map((body) => (<TableCell className="text-center">{body.cell}</TableCell>))
                    }
                </TableRow>
            </TableBody>
        </Table>

    );
}