import { ColumnDef } from "@tanstack/react-table";

export const getArchivedStockColumns = (): ColumnDef<any>[] => [
  {
    accessorKey: "batchNumber",
    header: "Batch Number",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.batchNumber}
        </div>
      );
    },
  },
  {
    accessorKey: "item",
    header: "Item Details",
    cell: ({ row }) => {
      const item = row.original.item;
      return (
        <div className="flex flex-col">
          <div className="font-medium text-center">
            {item.antigen}
          </div>
          
          <div className="text-sm text-center text-gray-600">
            {item.dosage} {item.unit}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "qty",
    header: "Total Qty",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.qty}
        </div>
      );
    },
  },
  {
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const record = row.original;
  
      if (record.type === "vaccine") {
        if (record.solvent?.toLowerCase() === "diluent") {
          return (
            <div className="text-center">
              {record.availableStock} containers
            </div>
          );
        }
  
        const dosesPerVial = record.dose_ml || 1;
        const availableDoses = record.availableStock;
        const fullVials = Math.ceil(availableDoses / dosesPerVial);
  
        return (
          <div className="flex flex-col items-center">
            <span>
              {fullVials} vial{fullVials !== 1 ? "s" : ""}
            </span>
            <span className="">
              ({availableDoses} dose{availableDoses !== 1 ? "s" : ""})
            </span>
          </div>
        );
      }
  
      if (record.type === "supply") {
        if (record.imzStck_unit === "boxes") {
          const pcsPerBox = record.imzStck_pcs || 1;
          const availablePcs = record.availableStock;
          const fullBoxes = Math.floor(availablePcs / pcsPerBox);
          const remainingPcs = availablePcs % pcsPerBox;
  
          return (
            <div className="flex flex-col items-center">
              <span>
                {remainingPcs > 0 ? fullBoxes + 1 : fullBoxes} box{fullBoxes !== 1 ? "es" : ""}
              </span>
              <span className="text-blue-500">
                ({availablePcs} total pc{availablePcs !== 1 ? "s" : ""})
              </span>
            </div>
          );
        }
  
        return (
          <div className="text-center">
            {record.availableStock} pc{record.availableStock !== 1 ? "s" : ""}
          </div>
        );
      }
  
      return (
        <div className="text-center">
          {record.availableStock}
        </div>
      );
    },
  },
  {
    accessorKey: "administered",
    header: "Qty Used",
    cell: ({ row }) => {
      return (
        <div className="text-center ">
          {row.original.administered}
        </div>
      );
    },
  },
  {
    accessorKey: "wastedDose",
    header: "Wasted Units",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.original.wastedDose}
        </div>
      );
    },
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => {
      const expiryDate = row.original.expiryDate;
      return (
        <div className="text-center">
          {expiryDate !== "N/A" ? new Date(expiryDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "archivedDate",
    header: "Archived Date",
    cell: ({ row }) => {
      const archivedDate = row.original.archivedDate;
      return (
        <div className="text-center">
          {archivedDate ? new Date(archivedDate).toLocaleDateString() : "N/A"}
        </div>
      );
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.original.reason;
      return (
        <div className="text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            reason === "Expired" 
              ? "bg-red-100 text-red-800" 
              : "bg-yellow-100 text-yellow-800"
          }`}>
            {reason}
          </span>
        </div>
      );
    },
  },
];