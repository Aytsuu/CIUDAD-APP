import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScrollableTableProps<TData, TValue> {
  header?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  isLoading?: boolean;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  reset?: boolean;
  setReset?: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectedRowsChange?: (rows: TData[]) => void;
  rowSelection?: Record<string, boolean>;
  setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  maxHeight?: string;
}

export function DataTable<TData, TValue>({
  isLoading = false,
  headerClassName,
  cellClassName,
  header = true,
  columns,
  data,
  reset,
  setReset,
  onSelectedRowsChange,
  rowSelection: externalRowSelection,
  setRowSelection: externalSetRowSelection,
  maxHeight = "500px",
}: ScrollableTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [internalRowSelection, setInternalRowSelection] = React.useState({});
  const [columnSizing, setColumnSizing] = React.useState({}); // 👈 for widths

  const rowSelectionState = externalRowSelection ?? internalRowSelection;
  const setRowSelectionState = externalSetRowSelection ?? setInternalRowSelection;

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelectionState,
    onColumnSizingChange: setColumnSizing, // 👈
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    columnResizeMode: "onChange", // 👈 instant resize
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection: rowSelectionState,
      columnSizing, // 👈
    },
  });

  React.useEffect(() => {
    if (onSelectedRowsChange) {
      const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
      onSelectedRowsChange(selectedRows);
    }
  }, [onSelectedRowsChange, rowSelectionState]);

  React.useEffect(() => {
    if (reset) {
      table.resetRowSelection();
      setReset && setReset(false);
    }
  }, [reset]);

  return (
    <div className="w-full">
      <div className="relative overflow-hidden">
        {/* Fixed Header */}
        {header && (
          <div className="bg-white relative z-10">
            <Table className="table-fixed">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="bg-lightBlue hover:bg-lightBlue h-10"
                  >
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{ width: header.getSize() }} // 👈 apply size
                        className={cn("text-center bg-lightBlue", headerClassName)}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            </Table>
          </div>
        )}

        {/* Scrollable Body */}
        <div
          className="overflow-auto"
          style={{ maxHeight: maxHeight }}
        >
          <Table className="table-fixed">
            <TableBody>
              {!isLoading ? (
                table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className={!header ? "border-none hover:bg-white" : ""}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          style={{ width: cell.column.getSize() }} // 👈 apply size
                          className={cn("text-center", cellClassName)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns?.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={columns?.length} className="h-24">
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="animate-spin opacity-50" />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
