import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
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
  );
}
