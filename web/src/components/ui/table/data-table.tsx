import React from "react"
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
  } from "@tanstack/react-table"
   
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "./table"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
   
  interface DataTableProps<TData, TValue> {
    header?: boolean;
    headerClassName?: string;
    cellClassName?: string;
    isLoading?: boolean;
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    reset?: boolean;
    setReset?: React.Dispatch<React.SetStateAction<boolean>>
    onSelectedRowsChange?: (rows: TData[]) => void;
    rowSelection?: Record<string, boolean>;
    setRowSelection?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  }
   
  export function DataTable<TData, TValue>({
    isLoading=false, 
    headerClassName, 
    cellClassName,
    header=true, 
    columns, 
    data,
    reset,
    setReset,
    onSelectedRowsChange,
    rowSelection: externalRowSelection,
    setRowSelection: externalSetRowSelection
  }: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [internalRowSelection, setInternalRowSelection] = React.useState({});
    const rowSelectionState = externalRowSelection ?? internalRowSelection;
    const setRowSelectionState = externalSetRowSelection ?? setInternalRowSelection;

    const table = useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelectionState,
      enableRowSelection: true,
      state: {
        sorting,
        columnFilters,
        columnVisibility,
        rowSelection: rowSelectionState,
      },
    })

     React.useEffect(() => {
      if (onSelectedRowsChange) {
        const selectedRows = table.getSelectedRowModel().rows.map(row => row.original)
        onSelectedRowsChange(selectedRows)
      }
    }, [onSelectedRowsChange, rowSelectionState]);

    React.useEffect(() => {
      if(reset) {
        table.resetRowSelection();
        setReset && setReset(false);
      }
    }, [reset])
   
    return (
        <Table>
          {header && (<TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-lightBlue hover:bg-lightBlue h-10">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={cn("text-center", headerClassName)}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>)
          }
          <TableBody className="overflow-auto">
            {!isLoading ? (table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={!header ? "border-none hover:bg-white" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={cn("text-center", cellClassName)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="w-full h-full flex items-center justify-center">
                    <Loader2 className="animate-spin opacity-50"/>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    )
  }