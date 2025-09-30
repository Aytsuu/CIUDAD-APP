// components/prenatal/PrenatalHistoryTable.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { Badge } from "@/components/ui/badge";

interface PrenatalVisit {
  date: string;
  aog: string;
  weight: string;
  bloodPressure: string;
  leopoldsFindings: {
    fundalHeight: string;
    fetalHeartbeat: string;
    fetalPosition: string;
  };
  notes: {
    complaint: string;
    advice: string;
  };
}

interface PrenatalHistoryTableProps {
  data: PrenatalVisit[];
  className?: string;
}

interface TableRowConfig {
  label: string;
  icon?: React.ReactNode;
  accessor: (visit: PrenatalVisit) => string | React.ReactNode;
  cellClassName?: string;
}

export function PrenatalHistoryTable({ data, className = "" }: PrenatalHistoryTableProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Sort data by date in descending order (latest first)
  const sortedData = [...data].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const tableRows: TableRowConfig[] = [
    {
      label: "Visit Date",
      accessor: (visit) => visit.date,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Gestational Age (AOG)",
      accessor: (visit) => (
        <Badge variant="outline" className="font-poppins text-sm">
          {visit.aog}
        </Badge>
      ),
      cellClassName: "text-center"
    },
    {
      label: "Weight",
      accessor: (visit) => visit.weight,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Blood Pressure",
      accessor: (visit) => visit.bloodPressure,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Leopold's Findings",
      accessor: (visit) => (
        <div className="text-sm leading-relaxed space-y-1">
          <div>
            <span className="font-medium">Fundal Height:</span> {visit.leopoldsFindings.fundalHeight}
          </div>
          <div>
            <span className="font-medium">Fetal HR:</span> {visit.leopoldsFindings.fetalHeartbeat}
          </div>
          <div>
            <span className="font-medium">Position:</span> {visit.leopoldsFindings.fetalPosition}
          </div>
        </div>
      ),
      cellClassName: "text-center max-w-xs"
    },
    {
      label: "Clinical Notes",
      accessor: (visit) => (
        <div className="text-s leading-relaxed space-y-2">
          <div className="p-2 rounded  border-red-400">
            <div className="font-medium mb-1">Complaints:</div>
            <div className="">{visit.notes.complaint}</div>
          </div>
          <div className="p-2 rounded border-green-400">
            <div className="font-medium mb-1">Advises:</div>
            <div className="">{visit.notes.advice}</div>
          </div>
        </div>
      ),
      cellClassName: "text-center max-w-sm"
    }
  ];

  const hasMoreVisits = sortedData.length > 3;

  return (
    <Card className={`border-slate-200 shadow-sm font-poppins ${className}`}>
      <CardContent className="p-0">
        <div className={hasMoreVisits ? "overflow-x-auto" : ""}>
          <Table className={hasMoreVisits ? "w-max" : "w-full"}>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-slate-200">
                <TableHead className={`font-semibold text-slate-700 text-xs uppercase tracking-wide w-44 ${hasMoreVisits ? "sticky left-0 bg-slate-100 z-10" : ""}`}>Clinical Parameter</TableHead>
                {sortedData.map((_, index) => (
                  <TableHead key={index} className={`font-semibold text-slate-700 p-5 text-xs uppercase tracking-wide text-center ${hasMoreVisits ? "min-w-48" : "w-auto"}`}>
                    Visit {sortedData.length - index}
                    {index === 0 && <span className="text-blue-500 ml-1">[CURRENT]</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className={`font-semibold 0text-slate-70 bg-slate-50 align-middle p-5 ${hasMoreVisits ? "sticky left-0 z-5" : ""}`}>
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                  </TableCell>
                  {sortedData.map((visit, visitIndex) => (
                    <TableCell key={visitIndex} className={`${row.cellClassName} ${hasMoreVisits ? "min-w-48" : ""}`}>
                      {row.accessor(visit)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMoreVisits && <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-sm text-slate-600">Showing all {sortedData.length} visits. Scroll left/right to see all records.</div>}
      </CardContent>
    </Card>
  );
}
