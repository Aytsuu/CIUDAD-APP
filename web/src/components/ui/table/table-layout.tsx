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
  // New optional props
  tableClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
  emptyState?: React.ReactNode;
  striped?: boolean;
  hoverEffect?: boolean;
  compact?: boolean;
};

export default function TableLayout({ 
  header, 
  rows,
  tableClassName = "",
  headerRowClassName = "",
  headerCellClassName = "text-center text-sm md:text-base px-2 py-2",
  bodyRowClassName = "",
  bodyCellClassName = "text-center text-sm md:text-base px-2 py-2",
  emptyState = null,
  striped = false,
  hoverEffect = false,
  compact = false,
}: TableProps) {
  // Apply compact styling if enabled
  const resolvedBodyCellClassName = compact 
    ? `${bodyCellClassName} px-1 py-1 text-xs md:text-sm`
    : bodyCellClassName;

  return (
    <div className="overflow-x-auto">
      <Table className={`w-full ${tableClassName}`}>
        <TableHeader>
          <TableRow className={headerRowClassName}>
            {header.map((head, index) => (
              <TableHead
                key={`head-${index}`}
                className={`${headerCellClassName} ${compact ? 'px-1 py-1 text-xs md:text-sm' : ''}`}
              >
                {head}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length > 0 ? (
            rows.map((row, rowIndex) => (
              <TableRow 
                key={`row-${rowIndex}`}
                className={`
                  ${bodyRowClassName}
                  ${striped ? (rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50') : ''}
                  ${hoverEffect ? 'hover:bg-gray-100' : ''}
                `}
              >
                {row.map((cell, cellIndex) => (
                  <TableCell
                    key={`cell-${cellIndex}`}
                    className={resolvedBodyCellClassName}
                  >
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={header.length} 
                className="text-center py-8 text-gray-500"
              >
                {emptyState || "No data available"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}