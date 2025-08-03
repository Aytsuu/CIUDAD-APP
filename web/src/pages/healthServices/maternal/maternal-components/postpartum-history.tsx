import { Card, CardContent } from "@/components/ui/card/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { Badge } from "@/components/ui/badge";

interface PostpartumVisit {
  date: string;
  lochialDischarges: string;
  bloodPressure: string;
  feedings: string;
  findings: string;
  nursesNotes: string;
}

interface PostpartumHistoryTableProps {
  data: PostpartumVisit[];
  className?: string;
}

interface TableRowConfig {
  label: string;
  icon?: React.ReactNode;
  accessor: (visit: PostpartumVisit) => string | React.ReactNode;
  cellClassName?: string;
}

export function PostpartumHistoryTable({ data, className = "" }: PostpartumHistoryTableProps) {
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
      label: "Lochial Discharges",
      accessor: (visit) => (
        <Badge variant="outline" className="font-poppins text-sm">
          {visit.lochialDischarges}
        </Badge>
      ),
      cellClassName: "text-center"
    },
    {
      label: "Blood Pressure",
      accessor: (visit) => visit.bloodPressure,
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Feedings",
      accessor: (visit) => (
        <div className="text-sm leading-relaxed">
          <div className="font-medium text-blue-800">{visit.feedings}</div>
        </div>
      ),
      cellClassName: "text-center max-w-xs"
    },
    {
      label: "Clinical Findings",
      accessor: (visit) => (
        <div className="text-sm leading-relaxed">
          <div className="p-2 rounded border-l-2 border-blue">
            <div className="font-medium text-blue-800 mb-1">Findings:</div>
            <div className="text-blue-700">{visit.findings}</div>
          </div>
        </div>
      ),
      cellClassName: "text-center max-w-xs"
    },
    {
      label: "Nurses Notes",
      accessor: (visit) => (
        <div className="text-sm leading-relaxed">
          <div className="p-2 rounded border-l-2 border-green-400">
            <div className="font-medium text-green-800 mb-1">Notes:</div>
            <div className="text-green-700">{visit.nursesNotes}</div>
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
            <TableHeader className="bg-slate-50">
              <TableRow className="border-slate-200">
                <TableHead className={`font-semibold text-slate-700 text-xs uppercase tracking-wide w-44 ${hasMoreVisits ? 'sticky left-0 bg-red-50 z-10' : ''}`}>
                  Clinical Parameter
                </TableHead>
                {sortedData.map((_, index) => (
                  <TableHead 
                    key={index} 
                    className={`font-semibold text-slate-700 p-5 text-xs uppercase tracking-wide text-center ${hasMoreVisits ? 'min-w-48' : 'w-auto'}`}
                  >
                    Visit {sortedData.length - index}
                    {index === 0 && <span className="text-blue ml-1">[CURRENT]</span>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="border-slate-100 hover:bg-slate-50/50">
                  <TableCell className={`font-semibold text-slate-700 bg-slate-50 align-middle p-5 ${hasMoreVisits ? 'sticky left-0 z-5' : ''}`}>
                    <div className="flex items-center gap-2">
                      {row.icon}
                      <span>{row.label}</span>
                    </div>
                  </TableCell>
                  {sortedData.map((visit, visitIndex) => (
                    <TableCell 
                      key={visitIndex} 
                      className={`${row.cellClassName} ${hasMoreVisits ? 'min-w-48' : ''}`}
                    >
                      {row.accessor(visit)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {hasMoreVisits && (
          <div className="bg-slate-50 border-t border-slate-200 p-3 text-center text-sm text-slate-600">
            Showing all {sortedData.length} visits. Scroll left/right to see all records.
          </div>
        )}
      </CardContent>
    </Card>
  );
}