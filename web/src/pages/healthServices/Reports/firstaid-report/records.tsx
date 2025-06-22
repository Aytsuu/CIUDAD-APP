// MonthlyFirstAidDetails.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { FirstAidRecord } from "../firstaid-report/restful-api/getAPI";

export default function MonthlyFirstAidDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const state = location.state as {
    month?: string;
    monthName?: string;
    records?: FirstAidRecord[];
    recordCount?: number;
    totalQty?: number;
  } || {};

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
        <div className="text-center">{row.original.reason || "No reason provided"}</div>
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
          {row.original.finv_details?.finv_qty_avail ?? 0} {row.original.finv_details?.finv_qty_unit ?? ""}
        </div>
      ),
    },
  ];

  if (!records || records.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">No records found for this month</p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back
        </Button>
        <div>
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            First Aid Records for {monthName}
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            {recordCount} records 
          </p>
        </div>
      </div>
      
      <hr className="border-gray-300 mb-4" />

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