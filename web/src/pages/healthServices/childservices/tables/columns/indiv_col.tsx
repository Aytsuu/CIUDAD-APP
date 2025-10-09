// child-health-columns.tsx
import type { ColumnDef } from "@tanstack/react-table";
import ViewButton from "@/components/ui/view-button";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog/dialog";
import { Eye } from "lucide-react";

interface FindingsData {
  subj_summary: string;
  obj_summary: string;
  assessment_summary: string;
  plantreatment_summary: string;
}

// Custom Modal Component for Findings Details
const FindingsModal = ({ findings, trigger }: { findings: FindingsData; trigger: React.ReactNode }) => {
  const formatTextWithBullets = (text: string) => {
    if (!text) return null;

    return text
      .split("\n")
      .map((line, index) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;

        if (trimmedLine.startsWith("-") || trimmedLine.includes(" - ")) {
          const parts = trimmedLine.split(" - ").filter((part) => part.trim() !== "");
          return (
            <div key={index} className="mb-2">
              {parts.map((part, partIndex) => (
                <div key={partIndex} className="ml-4 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{part.replace(/^-/, "").trim()}</span>
                </div>
              ))}
            </div>
          );
        }

        return (
          <div key={index} className="mb-2">
            {trimmedLine}
          </div>
        );
      })
      .filter(Boolean);
  };

  const hasFindings = findings && (findings.subj_summary || findings.obj_summary || findings.assessment_summary || findings.plantreatment_summary);

  if (!hasFindings) {
    return <span className="text-gray-400 text-sm">No findings</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="text-lg font-medium text-gray-800">Clinical Findings Details</DialogTitle>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {findings.subj_summary && (
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Subjective Findings</h3>
          <div className="text-gray-600 whitespace-pre-wrap">{formatTextWithBullets(findings.subj_summary)}</div>
        </div>
        )}

        {findings.obj_summary && (
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Objective Findings</h3>
          <div className="text-gray-600 whitespace-pre-wrap">{formatTextWithBullets(findings.obj_summary)}</div>
        </div>
        )}

        {findings.assessment_summary && (
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Assessment</h3>
          <div className="text-gray-600 whitespace-pre-wrap">{formatTextWithBullets(findings.assessment_summary)}</div>
        </div>
        )}

        {findings.plantreatment_summary && (
        <div className="p-4 border rounded-md">
          <h3 className="font-medium text-gray-700 mb-2">Plan & Treatment</h3>
          <div className="text-gray-600 whitespace-pre-wrap">{formatTextWithBullets(findings.plantreatment_summary)}</div>
        </div>
        )}
      </div>
      </DialogContent>
    </Dialog>
  );
};

// Compact Findings Cell for Table View
const FindingsCell = ({ findings }: { findings: FindingsData }) => {
  const hasFindings = findings && (findings.subj_summary || findings.obj_summary || findings.assessment_summary || findings.plantreatment_summary);

  if (!hasFindings) {
    return <span className="text-gray-400 text-sm">No findings</span>;
  }

  return (
    <FindingsModal
      findings={findings}
      trigger={
        <Button variant="ghost" className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 text-xs">
          <Eye size={14} />
          View Findings
        </Button>
      }
    />
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
    header: "Age",
    cell: ({ row }) => (
      <div className="w-full flex justify-center">
        <div className="w-10">{row.original.age || "N/A"}</div>
      </div>
    )
  },
  {
    accessorKey: "wt_ht",
    header: "WT/HT",
    cell: ({ row }) => {
      const weight = row.original.wt;
      const height = row.original.ht;
      return <div className="text-center">{weight && height ? `${weight} kg / ${height} cm` : "N/A"}</div>;
    }
  },
  {
    accessorKey: "temp",
    header: "Temp (°C)",
    cell: ({ row }) => <div className="text-center">{row.original.temp || "N/A"}</div>
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
        <div className="flex justify-center">
          <div className="w-[300px] px-2">
            {record.latestNote ? <p className="text-sm mb-2 line-clamp-3">{record.latestNote}</p> : <p className="text-gray-500 text-sm mb-2">No notes</p>}

            {(record.followUpDescription || record.followUpDate) && (
              <div className="border-t pt-2 mt-2">
                <div className="flex flex-col items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">Follow-up:</span>
                  <span className={`text-xs px-2 py-1 rounded ${record.followUpStatus === "completed" ? "bg-green-100 text-green-800" : record.followUpStatus === "missed" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>{record.followUpStatus || "pending"}</span>
                </div>

                {record.followUpDescription && (
                  <p className="text-xs text-gray-600 break-words line-clamp-2">
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
        </div>
      );
    }
  },
  {
    accessorKey: "updatedAt",
    header: "Date Visited",
    cell: ({ row }) => (
      <div className="w-full flex justify-center text-center">
        <div className="w-16">{row.original.updatedAt}</div>
      </div>
    )
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({}) => (
      <div className="w-full flex justify-center">
        <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">Completed</span>
      </div>
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();

      return (
        <ViewButton
          onClick={() =>
            navigate(`/services/childhealthrecords/records/history`, {
              state: {
                params: {
                  chhistId: row.original.chhist_id,
                  patId: childData?.pat_id,
                  originalRecord: row.original,
                  patientData: childData,
                  chrecId: childData?.chrec_id,
                  nutritionalStatusData: nutritionalStatusData
                }
              }
            })
          }
        />
      );
    }
  }
];
