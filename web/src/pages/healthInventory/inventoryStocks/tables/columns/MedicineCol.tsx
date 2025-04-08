import { ColumnDef } from "@tanstack/react-table";
import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Search, Trash, Edit } from "lucide-react";

import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EditMedicineForm from "../../editModal/EditMedStockModal";

export type MedicineStocksRecord = {
    id: number; // Added id property
    minv_id: number;
    medicineInfo: {
      medicineName: string;
      dosage: number;
      dsgUnit: string;
      form: string;
    };
    expiryDate: string;
    category: string;
    qty: {
      qty: number;
      pcs: number;
    };
    minv_qty_unit: string;
    availQty: string;
    distributed: string;
    inv_id: number;
  };

export const getColumns = (

  handleArchiveInventory: (inv_id: number) => void,
    setIsDialog: (value: boolean) => void
): ColumnDef<MedicineStocksRecord>[] => [
{
      accessorKey: "medicineInfo",
      header: "Medicine",
      cell: ({ row }) => {
        const medicine = row.original.medicineInfo;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{medicine.medicineName}</span>
            <div className="text-sm text-gray-600">
              {medicine.dosage} {medicine.dsgUnit},
              <span className="capitalize italic text-darkGray">
                {" "}
                {medicine.form}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.category}</div>
        </div>
      ),
    },
    {
      accessorKey: "qty",
      header: "Stocks",
      cell: ({ row }) => {
        const { qty, pcs } = row.original.qty;
        const unit = row.original.minv_qty_unit;
        return (
          <div className="text-center">
            {pcs > 0 ? (
              <div className="flex flex-col">
                <span className="text-blue">{qty} box/es</span>
                <span className="text-red-500"> ({pcs} pcs per box)</span>
              </div>
            ) : (
              <span className="text-blue">
                {qty} {unit}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "distributed",
      header: "Distributed",
      cell: ({ row }) => (
        <div className="text-red-700">{row.original.distributed}</div>
      ),
    },
    {
      accessorKey: "availQty",
      header: "Available",
      cell: ({ row }) => (
        <div className="text-green-700">
          {row.original.qty.pcs > 0
            ? `${row.original.qty.qty * row.original.qty.pcs} pcs`
            : `${row.original.availQty} ${row.original.minv_qty_unit}`}
        </div>
      ),
    },
    {
      accessorKey: "expiryDate",
      header: "Expiry Date",
      cell: ({ row }) => (
        <div className="flex justify-center min-w-[100px] px-2">
          <div className="text-center w-full">{row.original.expiryDate}</div>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="hover:bg-slate-300 text-black border border-gray px-4 py-2 rounded cursor-pointer">
                      <Edit size={16} />
                    </div>
                  }
                  mainContent={
                    <EditMedicineForm
                      initialData={row.original}
                      setIsDialog={setIsDialog}
                    />
                  }
                />
              }
              content="Edit"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleArchiveInventory(row.original.inv_id)}
            >
              <Trash />
            </Button>
          </div>
        );
      },
    },
  ];
