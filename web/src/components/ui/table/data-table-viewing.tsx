import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface Column {
  accessorKey: string;
  header: string;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
}

export default function DataTable({ columns = [], data = [] }: DataTableProps) {
  return (
    <div className="p-4 w-full mx-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.length > 0 ? (
              columns.map((column) => <TableHead className="font-bold text-black border border-black text-center" key={column.accessorKey}>{column.header}</TableHead>)
            ) : (
              <TableHead >No Columns</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell className="border border-black h-10" key={column.accessorKey}>{item[column.accessorKey]}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length || 1} className="text-center">
                No Data Available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
