import { 
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell 
} from "@/components/ui/table/table";

interface TableProps{
    header: React.ReactNode[]
    rows: React.ReactNode[][]
}

export default function TableLayout({ header, rows }: TableProps){
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    {
                        header.map((head) => ( <TableHead className="text-center">{head}</TableHead> ))  
                    }             
                </TableRow>
            </TableHeader>
            <TableBody>
                    {
                        rows.map((row) => (
                        <TableRow>
                            {row.map((cell) => (
                                    <TableCell className="text-center">{cell}</TableCell>
                                ))}
                        </TableRow>))
                    }
            </TableBody>
        </Table>

    );
}