import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  ColumnOrderState,
  ColumnResizeMode,
  ColumnSizingState,
  PaginationState,
  RowSelectionState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../table/table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  header?: boolean;
  pagination?: boolean;
  sorting?: boolean;
  filtering?: boolean;
  columnVisibility?: boolean;
  columnOrdering?: boolean;
  columnResizing?: boolean;
  rowSelection?: boolean;
  className?: string;
  pageSize?: number;
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
  columnResizing = false,
  rowSelection = false,
  className = "",
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const [sortingState, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibilityState, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnOrderState, setColumnOrder] = React.useState<ColumnOrderState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [columnResizeMode] = React.useState<ColumnResizeMode>('onChange');
  const [rowSelectionState, setRowSelection] = React.useState<RowSelectionState>({});
  const [paginationState, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: pageSize,
  });

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
      ...(pagination && { pagination: paginationState }),
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
    ...(pagination && {
      onPaginationChange: setPagination,
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
  });



    // const handleVaccineWaste = async (
  //   record: StockRecords,
  //   wastedAmount: number
  // ) => {
  //   if (!isVaccine(record)) return;

  //   const inventoryList = await api.get("inventory/vaccine_stocks/");

  //   const existingItem = inventoryList.data.find(
  //     (item: any) => item.vacStck_id === record.vacStck_id
  //   );
  //   if (!existingItem) {
  //     throw new Error("Vaccine item not found. Please check the ID.");
  //   }
  //   const currentQtyAvail = existingItem.vacStck_qty_avail;
  //   const existingUsedItem = existingItem.vacStck_used;

  //   let newUsedItem = 0;
  //   let newQty = 0;
  //   if (currentQtyAvail === 0) {
  //     throw new Error("Current quantity available is 0.");
  //   } else if (wastedAmount > currentQtyAvail) {
  //     throw new Error("Cannot use more items than available.");
  //   } else {
  //     newQty = currentQtyAvail - wastedAmount;
  //     newUsedItem = existingUsedItem + wastedAmount;
  //   }

  //   const unit = record.solvent === "diluent" ? "containers" : "doses";
  //   const updatePayload = {
  //     wasted_dose:
  //       (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
  //     vacStck_qty_avail: newQty,
  //     vacStck_used: newUsedItem,
  //   };

  //   await api.put(
  //     `inventory/vaccine_stocks/${record.vacStck_id}/`,
  //     updatePayload
  //   );

  //   const transactionPayload = {
  //     antt_qty: `${wastedAmount} ${unit}`,
  //     antt_action: "Wasted",
  //     staff: 0,
  //     vacStck_id: record.vacStck_id,
  //   };

  //   await api.post("inventory/antigens_stocks/", transactionPayload);
  // };

  // const handleSupplyWaste = async (
  //   record: StockRecords,
  //   wastedAmount: number
  // ) => {
  //   if (!isSupply(record)) return;

  //   // Determine the unit for display (boxes or pcs)
  //   const displayUnit = record.imzStck_unit === "boxes" ? "boxes" : "pcs";
  //   // For transaction, always use pcs if the unit is boxes
  //   const transactionUnit = record.imzStck_unit === "boxes" ? "pcs" : "pcs";

  //   let piecesToDeduct = wastedAmount;
  //   let updatePayload: any = {
  //     wasted_items:
  //       (record.wastedDose ? parseInt(record.wastedDose) : 0) + wastedAmount,
  //     imzStck_avail: record.availableStock - wastedAmount,
  //   };

  //   if (record.imzStck_unit === "boxes") {
  //     const pcsPerBox = record.imzStck_per_pcs || 1;
  //     piecesToDeduct = wastedAmount * pcsPerBox;
  //     if ("imzStck_pcs" in record) {
  //       updatePayload.imzStck_pcs =
  //         (Number(record.imzStck_pcs) || 0) - piecesToDeduct;
  //     }
  //   }

  //   await api.put(
  //     `inventory/immunization_stock/${record.imzStck_id}/`,
  //     updatePayload
  //   );

  //   // Calculate the quantity for transaction

  //   const transactionPayload = {
  //     imzt_qty: `${wastedAmount} ${transactionUnit}`,
  //     imzt_action: "Wasted",
  //     staff: 0,
  //     imzStck_id: record.imzStck_id,
  //   };

  //   await api.post("inventory/imz_transaction/", transactionPayload);
  // };


  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Toolbar with filtering and column visibility */}
      <div className="flex items-center justify-between">
        {filtering && (
          <Input
            placeholder="Filter data..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}

        {columnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          {header && (
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{
                        ...(columnResizing && {
                          width: header.getSize(),
                          position: 'relative',
                        }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      {columnResizing && header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1 bg-gray-300 cursor-col-resize select-none touch-none ${
                            header.column.getIsResizing() ? 'bg-blue-500' : ''
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
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...(columnResizing && {
                          width: cell.column.getSize(),
                        }),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            {rowSelection && (
              <>
                {table.getFilteredSelectedRowModel().rows.length} of{" "}
                {table.getFilteredRowModel().rows.length} row(s) selected
              </>
            )}
          </div>
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}