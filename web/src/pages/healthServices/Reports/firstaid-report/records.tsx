// MonthlyFirstAidDetails.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import { FirstAidRecord } from "../firstaid-report/restful-api/getAPI";

export default function MonthlyFirstAidDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const state =
    (location.state as {
      month?: string;
      monthName?: string;
      records?: FirstAidRecord[];
      recordCount?: number;
      totalQty?: number;
    }) || {};

  const { month, monthName, records = [], recordCount = 0 } = state;

  const columns: ColumnDef<FirstAidRecord>[] = [
    {
      accessorKey: "farec_id",
      header: "Record ID",
      cell: ({ row }) => (
        <div className="text-center">{row.original.farec_id}</div>
      ),
    },
    {
      accessorKey: "finv_details.fa_detail.fa_name",
      header: "Item Name",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.finv_details?.fa_detail?.fa_name ?? "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "finv_details.fa_detail.catlist",
      header: "Category",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.finv_details?.fa_detail?.catlist ?? "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Quantity Used",
      cell: ({ row }) => (
        <div className="text-center">{row.original.qty ?? "N/A"}</div>
      ),
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.reason || "No reason provided"}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "finv_details.finv_qty_avail",
      header: "Available Qty",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.finv_details?.finv_qty_avail ?? 0}{" "}
          {row.original.finv_details?.finv_qty_unit ?? ""}
        </div>
      ),
    },
  ];

 

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center ">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            First Aid Records for {monthName}
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            {recordCount} records
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Month:</span> {monthName}
            </div>
            <div>
              <span className="font-medium">Total Records:</span> {recordCount}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable columns={columns} data={records} />
        </div>
      </div>
    </div>
  );
}
