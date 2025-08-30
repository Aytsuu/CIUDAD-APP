// src/features/medicine/components/medicine-record-columns.ts
import { ColumnDef } from "@tanstack/react-table";
import { MedicineRecord } from "../../types";

export const medicineRecordColumns: ColumnDef<MedicineRecord>[] = [
  {
    accessorKey: "medicine",
    header: "Medicine",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[200px] px-2">
        <div className="font-medium">
          {row.original.minv_details?.med_detail?.med_name || "Unknown"}
          <div className="text-xs  text-zinc-600">
            {row.original.minv_details?.minv_dsg}{" "}
            {row.original.minv_details?.minv_dsg_unit}{" "}
            {row.original.minv_details?.minv_form}
          </div>
          <div className="text-xs text-gray-500">
            Type: {row.original.minv_details?.med_detail?.med_type || "N/A"}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[200px] px-2">
        <div className="flex flex-col">
          <div className="text-sm">
            {row.original.medrec_qty}{" "}
            {row.original.minv_details?.minv_qty_unit === "boxes"
              ? "pcs"
              : row.original.minv_details?.minv_qty_unit}
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "request_info",
    header: "Reason",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        {row.original.reason && <div>{row.original.reason}</div>}
      </div>
    ),
  },
  {
    accessorKey: "dates",
    header: "Dates",
    cell: ({ row }) => {
      const requestedAt = new Date(row.original.requested_at || Date.now());
      const fulfilledAt = row.original.fulfilled_at
        ? new Date(row.original.fulfilled_at)
        : null;

      return (
        <div className="flex flex-col text-sm">
          <div>
            <span className="font-medium">Requested: </span>
            {requestedAt.toLocaleDateString()}
            <span className="text-gray-500 ml-1">
              {requestedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          {fulfilledAt && (
            <div>
              <span className="font-medium">Fulfilled: </span>
              {fulfilledAt.toLocaleDateString()}
              <span className="text-gray-500 ml-1">
                {fulfilledAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "signature",
    header: "Signature",
    cell: ({ row }) => (
      <div className="flex justify-center px-2 w-full">
        {row.original.signature && (
          <div className="w-[200px]">
            <img
              src={`data:image/png;base64,${row.original.signature}`}
              alt="Authorized Signature"
              className="h-10 w-auto object-contain"
            />
          </div>
        )}
      </div>
    ),
  },
 
];
