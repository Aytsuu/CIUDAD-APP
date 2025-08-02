"use client"

import React from "react"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type ColumnOrderState,
  type ColumnResizeMode,
  type ColumnSizingState,
  type PaginationState,
  type RowSelectionState,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table/table"
import { Button } from "@/components/ui/button/button"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronLeft, ChevronRight, Search, ListFilter } from "lucide-react" // Added ArrowUpDown
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select" // Added Select components

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  header?: boolean
  pagination?: boolean
  sorting?: boolean
  filtering?: boolean
  columnVisibility?: boolean
  columnOrdering?: boolean
  columnResizing?: boolean
  rowSelection?: boolean
  className?: string
  pageSize?: number
  manualPagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  title?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  header = true,
  pagination = false,
  sorting = false,
  filtering = false,
  columnVisibility = false,
  columnOrdering = false,
  columnResizing = true,
  rowSelection = false,
  className = "",
  pageSize = 10,
  manualPagination,
  title,
}: DataTableProps<TData, TValue>) {
  const [sortingState, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibilityState, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnOrderState, setColumnOrder] = React.useState<ColumnOrderState>([])
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({})
  const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange")
  const [rowSelectionState, setRowSelection] = React.useState<RowSelectionState>({})
  const [paginationState, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    state: {
      ...(sorting && { sorting: sortingState }),
      ...(filtering && { columnFilters }),
      ...(columnVisibility && { columnVisibility: columnVisibilityState }),
      ...(columnOrdering && { columnOrder: columnOrderState }),
      ...(columnResizing && { columnSizing }),
      ...(rowSelection && { rowSelection: rowSelectionState }),
      ...(pagination && !manualPagination && { pagination: paginationState }),
    },
    ...(sorting && {
      onSortingChange: setSorting,
      getSortedRowModel: getSortedRowModel(),
    }),
    ...(filtering && {
      onColumnFiltersChange: setColumnFilters,
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(columnVisibility && {
      onColumnVisibilityChange: setColumnVisibility,
    }),
    ...(columnOrdering && {
      onColumnOrderChange: setColumnOrder,
    }),
    ...(columnResizing && {
      onColumnSizingChange: setColumnSizing,
      columnResizeMode,
    }),
    ...(rowSelection && {
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
    }),
    ...(pagination &&
      !manualPagination && {
        onPaginationChange: setPagination,
        getPaginationRowModel: getPaginationRowModel(),
      }),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  })

  return (
    <TooltipProvider>
      <div className={`flex flex-col rounded-lg shadow-lg border-2 border-gray-100 bg-card ${className}`}>
        

        {/* Table with vertical borders */}
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            {header && (
              <TableHeader className="bg-snow">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          width: header.getSize(),
                          position: "relative",
                        }}
                        className="overflow-hidden border-r border-gray-200 last:border-r-0 bg-muted/20 font-semibold text-primary-foreground py-3 px-4"
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        {columnResizing && header.column.getCanResize() && (
                          <div
                            onMouseDown={header.getResizeHandler()}
                            onTouchStart={header.getResizeHandler()}
                            className={`absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none ${
                              header.column.getIsResizing() ? "bg-primary" : "hover:bg-primary/50"
                            }`}
                          />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
            )}
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-gray-100 last:border-b-0 hover:bg-muted/10 transition-colors duration-200 data-[state=selected]:bg-primary/10"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                          backgroundColor: cell.column.id === table.getAllColumns()[0].id ? "#F3F4F8" : undefined, // Add background color for column 1
                        }}
                        className="overflow-hidden border-r border-gray-200 last:border-r-0 py-3 px-4"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-lg text-muted-foreground italic py-8"
                  >
                    No results found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination &&
          (manualPagination ? (
            <div className="flex flex-wrap justify-center items-center mt-4 sm:mt-6 gap-2 sm:gap-3 p-4 border-t-2 border-primary/10 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => manualPagination.onPageChange(manualPagination.currentPage - 1)}
                disabled={manualPagination.currentPage === 1}
                className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 h-auto font-medium"
              >
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Previous
              </Button>
              <div className="flex flex-wrap justify-center items-center gap-1 sm:gap-2">
                {Array.from({ length: manualPagination.totalPages }, (_, i) => i + 1).map((number) => (
                  <Button
                    key={number}
                    variant={manualPagination.currentPage === number ? "default" : "ghost"}
                    className="w-8 h-8 text-xs sm:text-sm font-medium rounded-full"
                    onClick={() => manualPagination.onPageChange(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => manualPagination.onPageChange(manualPagination.currentPage + 1)}
                disabled={manualPagination.currentPage === manualPagination.totalPages}
                className="text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-2 h-auto font-medium"
              >
                Next
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between px-4 py-3 gap-2 border-t-2 border-primary/10 rounded-b-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows per page:</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value:any) => {
                    table.setPageSize(Number(value))
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((pageSizeOption) => (
                      <SelectItem key={pageSizeOption} value={`${pageSizeOption}`}>
                        {pageSizeOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 text-sm text-muted-foreground text-center sm:text-left">
                {rowSelection ? (
                  <>
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{" "}
                    row(s) selected
                  </>
                ) : (
                  <>
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </>
                )}
              </div>
              <div className="flex flex-wrap justify-center items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button variant="ghost" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
      </div>
    </TooltipProvider>
  )
}
