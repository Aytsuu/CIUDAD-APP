<<<<<<< HEAD
import { 
=======
import {
>>>>>>> frontend/feature/treasurer
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
<<<<<<< HEAD
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

=======
    TableCell,
} from "@/components/ui/table/table";

type TableProps = {
    header: React.ReactNode[];
    rows: React.ReactNode[][];
};

export default function TableLayout({ header, rows }: TableProps) {
    return (
        <div className="overflow-x-auto">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                        {header.map((head, index) => (
                            <TableHead
                                key={`head-${index}`}
                                className="text-center text-sm md:text-base px-2 py-2"
                            >
                                {head}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row, rowIndex) => (
                        <TableRow key={`row-${rowIndex}`}>
                            {row.map((cell, cellIndex) => (
                                <TableCell
                                    key={`cell-${cellIndex}`}
                                    className="text-center text-sm md:text-base px-2 py-2" // Responsive font size and padding
                                >
                                    {cell}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
>>>>>>> frontend/feature/treasurer
    );
}