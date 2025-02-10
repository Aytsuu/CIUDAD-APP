import { 
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell 
} from "@/components/ui/table/table";

type TableProps = {     
    header: React.ReactNode[]
    rows: React.ReactNode[][]
}

export default function TableLayout({ header, rows }: TableProps){
    return(
        <Table>
            <TableHeader>
                <TableRow>
                    {
                        header.map((head, index) => ( <TableHead key={`head-${index}`} className="text-center">{head}</TableHead> ))  
                    }             
                </TableRow>
            </TableHeader>
            <TableBody className="">
                    {
                        rows.map((row, index) => (
                        <TableRow key={`row-${index}`}>
                            {row.map((cell, index) => (
                                    <TableCell key={`cell-${index}`} className="text-center">{cell}</TableCell>
                                ))}
                        </TableRow>))
                    }
            </TableBody> 
        </Table>

    );
}