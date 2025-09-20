// child-health-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button/button";

// Add this interface for the findings data
interface FindingsData {
  subj_summary: string;
  obj_summary: string;
  assessment_summary: string;
  plantreatment_summary: string;
}

// Alternative approach with more precise formatting
const FindingsCell = ({ findings }: { findings: FindingsData }) => {
  if (!findings || (!findings.subj_summary && !findings.obj_summary && !findings.assessment_summary && !findings.plantreatment_summary)) {
    return <span className="text-gray-400">No findings</span>;
  }

  // Function to format text with bullet points for dashes
  const formatTextWithBullets = (text: string) => {
    if (!text) return null;

    return text
      .split("\n")
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        // Check if line starts with a dash or contains a dash followed by text
        if (trimmedLine.startsWith("-") || trimmedLine.includes(" - ")) {
          const parts = trimmedLine.split(" - ").filter((part) => part.trim() !== "");
          return (
            <div key={index} className="mb-1">
              {parts.map((part, partIndex) => (
                <div key={partIndex} className="ml-2">
                  • {part.replace(/^-/, "").trim()}
                </div>
              ))}
            </div>
          );
        }

        return (
          <div key={index} className="mb-1">
            {trimmedLine}
          </div>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="flex justify-center w-full">
      <div className="mt-2 p-2 text-start rounded-md text-xs w-[180px]">
        {findings.subj_summary && (
          <div className="mb-2">
            <strong className="text-gray-700">Subjective:</strong>
            <div className="text-gray-600">{formatTextWithBullets(findings.subj_summary)}</div>
          </div>
        )}
        {findings.obj_summary && (
          <div className="mb-2">
            <strong className="text-gray-700">Objective:</strong>
            <div className="text-gray-600">{formatTextWithBullets(findings.obj_summary)}</div>
          </div>
        )}
        {findings.assessment_summary && (
          <div className="mb-2">
            <strong className="text-gray-700">Assessment:</strong>
            <div className="text-gray-600">{formatTextWithBullets(findings.assessment_summary)}</div>
          </div>
        )}
        {findings.plantreatment_summary && (
          <div>
            <strong className="text-gray-700">Plan/Treatment:</strong>
            <div className="text-gray-600">{formatTextWithBullets(findings.plantreatment_summary)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const getChildHealthColumns = (childData: any, nutritionalStatusData: any): ColumnDef<any>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">{row.original.id}</div>
      </div>
    )
  },
  {
    accessorKey: "age",
    header: "Age"
  },
  {
    accessorKey: "wt",
    header: "WT (kg)"
  },
  {
    accessorKey: "ht",
    header: "HT (cm)"
  },
  {
    accessorKey: "temp",
    header: "Temp (°C)"
  },

  {
    accessorKey: "findings",
    header: "Findings",
    cell: ({ row }) => {
      const findings = row.original.findings as FindingsData;
      return <FindingsCell findings={findings} />;
    },
    enableSorting: false
  },
  {
    accessorKey: "latestNote",
    header: "Notes & Follow-up",
    cell: ({ row }) => {
      const record = row.original;
      return (
        <div className="min-w-[200px] max-w-[300px]">
          {record.latestNote ? <p className="text-sm mb-2">{record.latestNote}</p> : <p className="text-gray-500 text-sm mb-2">No notes</p>}

          {(record.followUpDescription || record.followUpDate) && (
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-gray-600">Follow-up:</span>
                <span className={`text-xs px-2 py-1 rounded ${record.followUpStatus === "completed" ? "bg-green-100 text-green-800" : record.followUpStatus === "missed" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{record.followUpStatus || "pending"}</span>
              </div>

              {record.followUpDescription && (
                <p className="text-xs text-gray-600 break-words">
                  {record.followUpDescription.split("|").map((part: any, i: any) => (
                    <span key={i}>
                      {part.trim()}
                      {i < record.followUpDescription.split("|").length - 1 && <br />}
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
    }
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At"
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex justify-center gap-2">
          <Link
            to="/services/childhealthrecords/records/history"
            state={{
              params: {
                chhistId: row.original.chhist_id,
                patId: childData?.pat_id,
                originalRecord: row.original,
                patientData: childData,
                chrecId: childData?.chrec_id,
                nutritionalStatusData: nutritionalStatusData
              }
            }}
          >
            <Button variant="ghost">View</Button>
          </Link>
        </div>
      );
    }
  }
];
