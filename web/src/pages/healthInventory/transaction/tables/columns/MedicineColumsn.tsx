import { ColumnDef } from "@tanstack/react-table";
import { MedicineRecords } from "../type";

export const MedTransactioncolumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "inv_id",
    header: "ID",
    cell: ({ row }) => (
      <div className="text-center bg-snow p-2 rounded-md text-gray-700">
        {row.original.inv_id}{" "}
      </div>
    ),
  },
  {
    accessorKey: "med_name",
    header: "Medicine Name",
    cell: ({ row }) => {
      const medicineDetail = row.original.med_detail;
      return (
        <div className="flex flex-col space-y-1">
          <div className="font-semibold">{medicineDetail.med_name}</div>
          <div className="text-sm text-gray-600">
            <span>{medicineDetail.minv_dsg}</span>
            <span>{medicineDetail.minv_dsg_unit} </span>
            <span>({medicineDetail.minv_form})</span>
          </div>
        </div>
      );
    },
  },
  { 
    accessorKey: "mdt_qty", 
    header: "Quantity" 
  },
  { 
    accessorKey: "mdt_action", 
    header: "Action" 
  },
  { 
    accessorKey: "staff", 
    header: "Staff" 
  },
  { 
    accessorKey: "created_at", 
    header: "Created At",
    cell: ({ row }) => {
      const createdAt = row.original.created_at;
      return createdAt ? new Date(createdAt).toLocaleString() : "N/A";
    }
  },
];