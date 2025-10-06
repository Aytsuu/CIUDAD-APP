// child-health-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";

export const getChildHealthColumns = (childData: any): ColumnDef<any>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
          {row.original.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "wt",
    header: "WT (kg)",
  },
  {
    accessorKey: "ht",
    header: "HT (cm)",
  },
  {
    accessorKey: "temp",
    header: "Temp (°C)",
  },
  {
    accessorKey: "nutritionStatus.wfa",
    header: "WFA",
    cell: ({ row }) => row.original.nutritionStatus.wfa || "N/A",
  },
  {
    accessorKey: "nutritionStatus.lhfa",
    header: "LFA",
    cell: ({ row }) => row.original.nutritionStatus.lhfa || "N/A",
  },
  {
    accessorKey: "nutritionStatus.wfl",
    header: "WFL",
    cell: ({ row }) => row.original.nutritionStatus.wfl || "N/A",
  },
  {
    accessorKey: "nutritionStatus.muac",
    header: "MUAC",
    cell: ({ row }) => row.original.nutritionStatus.muac || "N/A",
  },
  {
    accessorKey: "nutritionStatus.edemaSeverity",
    header: "Edema",
    cell: ({ row }) =>
      row.original.nutritionStatus.edemaSeverity === "none"
        ? "None"
        : row.original.nutritionStatus.edemaSeverity,
  },
  {
    accessorKey: "latestNote",
    header: "Notes & Follow-up",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="min-w-[200px] max-w-[300px]">
          {record.latestNote ? (
            <p className="text-sm mb-2">{record.latestNote}</p>
          ) : (
            <p className="text-gray-500 text-sm mb-2">No notes</p>
          )}

          {(record.followUpDescription || record.followUpDate) && (
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-600">Follow-up:</span>
                <span 
                  className={`text-xs px-2 py-1 rounded ${
                    record.followUpStatus === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : record.followUpStatus === 'missed' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {record.followUpStatus || 'pending'}
                </span>
              </div>
              
              {record.followUpDescription && (
                <p className="text-xs text-gray-600 break-words">
                  {record.followUpDescription.split('|').map((part:any, i:any) => (
                    <span key={i}>
                      {part.trim()}
                      {i < record.followUpDescription.split('|').length - 1 && <br />}
                    </span>
                  ))}
                </p>
              )}
              
              {record.followUpDate && (
                <p className="text-xs text-gray-600 mt-1">
                  <span className="font-medium">Date:</span> {record.followUpDate}
                </p>
              )}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex justify-center gap-2">
          <Link
            to="/child-health-history-detail"
            state={{
              params: {
                chhistId: row.original.chhist_id,
                patId: childData?.pat_id,
                originalRecord: row.original,
                patientData: childData,
                chrecId: childData?.chrec_id,
              },
            }}
          >
            <Button variant="ghost">View</Button>
          </Link>
        </div>
      );
    },
  },
];