// MonthlyMedicineDetails.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowLeft } from "lucide-react";
import { MedicineRecord } from "../medicine-report/restful-api/getAPI";

export default function MonthlyMedicineDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    month = "",
    monthName = "",
    records = [],
    recordCount = 0,
  } = state || {};

  const columns: ColumnDef<MedicineRecord>[] = [
    {
      accessorKey: "patrec_details.pat_details.personal_info.per_fname",
      header: "Patient",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.patrec_details?.pat_details?.personal_info?.per_lname ||
            "N/A"}
          {", "}
          {row.original.patrec_details?.pat_details?.personal_info?.per_fname ||
            "N/A"}{" "}
          {row.original.patrec_details?.pat_details?.personal_info?.per_mname ||
            "N/A"}{" "}
        </div>
      ),
    },
    {
      accessorKey: "minv_details.med_detail.med_name",
      header: "Medicine",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.minv_details?.med_detail?.med_name || "N/A"}
        </div>
      ),
    },
    // {
    //   accessorKey: "minv_details.med_detail.catlist",
    //   header: "Category",
    //   cell: ({ row }) => (
    //     <div className="text-center">
    //       {row.original.minv_details?.med_detail?.catlist || "N/A"}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "medrec_qty",
      header: "Quantity",
      cell: ({ row }) => (
        <div className="text-center">{row.original.medrec_qty}</div>
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
      accessorKey: "requested_at",
      header: "Requested",
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.requested_at
            ? new Date(row.original.requested_at).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
  ];

 

  return (
    <div className="w-full h-full flex flex-col">
    

      <hr className="border-gray-300 mb-4" />

      <div className="bg-white rounded-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Month:</span> {monthName}
            </div>
            <div>
              <span className="font-medium">Records:</span> {recordCount}
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={records} />
      </div>
    </div>
  );
}
