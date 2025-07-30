import React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getFilteredRowModel,
    getPaginationRowModel,
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
   
  interface DataTableProps<TData, TValue> {
<<<<<<< HEAD
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
=======
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    header?: boolean
    onRowClick?: (row: TData) => void
>>>>>>> 08e94eb06 (bulk commit)
  }
   
  export function DataTable<TData, TValue>({ 
    columns, 
<<<<<<< HEAD
    data,
    reset,
    setReset,
    onSelectedRowsChange,
    rowSelection: externalRowSelection,
    setRowSelection: externalSetRowSelection
=======
    data, 
    onRowClick, 
    header = false 
>>>>>>> 08e94eb06 (bulk commit)
  }: DataTableProps<TData, TValue>) {

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [internalRowSelection, setInternalRowSelection] = React.useState({});
    const rowSelectionState = externalRowSelection ?? internalRowSelection;
    const setRowSelectionState = externalSetRowSelection ?? setInternalRowSelection;

    const table = useReactTable({
<<<<<<< HEAD
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
=======
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })
>>>>>>> 08e94eb06 (bulk commit)
   
    return (
        <Table>
          {header && (<TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none bg-lightBlue hover:bg-lightBlue h-12">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="text-center">
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
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-center">
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
            )}
          </TableBody>
        </Table>
    )
  }