// Update your prenatal-history.tsx to use real API data
import { useLocation } from "react-router";
import { Card, CardContent } from "@/components/ui/card/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { Badge } from "@/components/ui/badge";

import { usePrenatalPatientPrenatalCare } from "../queries/maternalFetchQueries";


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
  changes?: {
    weight?: boolean;
    bloodPressure?: boolean;
    fundalHeight?: boolean;
    fetalHeartbeat?: boolean;
    fetalPosition?: boolean;
  };
}

interface PrenatalHistoryTableProps {
  data?: PrenatalVisit[]; // Make optional since we'll get real data from API
  className?: string;
}

interface TableRowConfig {
  label: string;
  icon?: React.ReactNode;
  accessor: (visit: PrenatalVisit) => string | React.ReactNode;
  cellClassName?: string;
}

export function PrenatalHistoryTable({ data, className = "" }: PrenatalHistoryTableProps) {
  const location = useLocation();
  const { patientData, pregnancyId, visitNumber } = location.state?.params || {}

  const { 
    data: prenatalCareData, 
    isLoading, 
    error 
  } = usePrenatalPatientPrenatalCare(
    patientData?.pat_id || "", 
    pregnancyId || ""
  )

  // Get records up to the selected visit number
  const recordsToShow = prenatalCareData?.prenatal_records?.slice(0, visitNumber) || []

  // Transform API data to match your existing PrenatalVisit interface
  const transformedData: PrenatalVisit[] = recordsToShow.flatMap((record: any) => 
    record.prenatal_care_entries.map((entry: any) => ({
      date: new Date(entry.pfpc_date).toLocaleDateString(),
      aog: `${entry.pfpc_aog_wks || 0} wks and ${entry.pfpc_aog_days || 0} days`,
      weight: `${entry.weight || 0} kg`,
      bloodPressure: `${entry.bp_systolic || 0}/${entry.bp_diastolic || 0}`,
      leopoldsFindings: {
        fundalHeight: entry.pfpc_fundal_ht || "N/A",
        fetalHeartbeat: entry.pfpc_fetal_hr || "N/A",
        fetalPosition: entry.pfpc_fetal_pos || "N/A"
      },
      notes: {
        complaint: entry.pfpc_complaints || "No complaints",
        advice: entry.pfpc_advises || "No specific advice"
      }
    }))
  )

  // data from database 
  const finalData = transformedData.length > 0 ? transformedData : (data || [])

  const detectChanges = (currentVisit: PrenatalVisit, previousVisit: PrenatalVisit | null): PrenatalVisit => {
    if (!previousVisit) {
      return { ...currentVisit, changes: {} };
    }

    const changes = {
      weight: currentVisit.weight !== previousVisit.weight,
      bloodPressure: currentVisit.bloodPressure !== previousVisit.bloodPressure,
      fundalHeight: currentVisit.leopoldsFindings.fundalHeight !== previousVisit.leopoldsFindings.fundalHeight,
      fetalHeartbeat: currentVisit.leopoldsFindings.fetalHeartbeat !== previousVisit.leopoldsFindings.fetalHeartbeat,
      fetalPosition: currentVisit.leopoldsFindings.fetalPosition !== previousVisit.leopoldsFindings.fetalPosition,
    };

    return { ...currentVisit, changes };
  };
  

  // sorting data from most recent to oldest
  const sortedData = [...finalData].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime();
  });

  const processedPrenatalData = sortedData.map((visit, index) => {
    const previousVisit = index > 0 ? sortedData[index - 1] : null;
    return detectChanges(visit, previousVisit);
  });
    
  if (isLoading) {
    return (
      <Card className={`border-slate-200 shadow-sm font-poppins ${className}`}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading prenatal care history...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={`border-slate-200 shadow-sm font-poppins ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-red-600">Failed to load prenatal care history. Please try again.</p>
        </CardContent>
      </Card>
    )
  }

  if (!finalData || finalData.length === 0) {
    return (
      <Card className={`border-slate-200 shadow-sm font-poppins ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-slate-600">No prenatal care records found for this pregnancy.</p>
        </CardContent>
      </Card>
    )
  }

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
      accessor: (visit) => (
        <span className={`font-poppins text-sm ${
          visit.changes?.weight ? 'bg-red-100 text-red-700 px-2 py-1 rounded font-semibold' : ''
        }`}>
          {visit.weight}
          {visit.changes?.weight && (
            <span className="ml-1 text-red-500">●</span>
          )}
      </span>
      ),
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Blood Pressure",
      accessor: (visit) => (
        <span className={`font-poppins text-sm ${
          visit.changes?.bloodPressure ? 'bg-red-100 text-red-700 px-2 py-1 rounded font-semibold' : ''
        }`}>
          {visit.bloodPressure}
          {visit.changes?.bloodPressure && (
            <span className="ml-1 text-red-500">●</span>
          )}
      </span>
      ),
      cellClassName: "font-poppins text-sm text-center"
    },
    {
      label: "Leopold's Findings",
      accessor: (visit) => (
        <div className="text-sm leading-relaxed space-y-1">
        <div>
          <span className="font-medium">Fundal Height:</span>{' '}
          <span className={visit.changes?.fundalHeight ? 'bg-red-100 text-red-700 px-1 py-0.5 rounded font-semibold' : ''}>
            {visit.leopoldsFindings.fundalHeight}
            {visit.changes?.fundalHeight && <span className="ml-1 text-red-500">●</span>}
          </span>
        </div>
        <div>
          <span className="font-medium">Fetal HR:</span>{' '}
          <span className={visit.changes?.fetalHeartbeat ? 'bg-red-100 text-red-700 px-1 py-0.5 rounded font-semibold' : ''}>
            {visit.leopoldsFindings.fetalHeartbeat}
            {visit.changes?.fetalHeartbeat && <span className="ml-1 text-red-500">●</span>}
          </span>
        </div>
        <div>
          <span className="font-medium">Position:</span>{' '}
          <span className={visit.changes?.fetalPosition ? 'bg-red-100 text-red-700 px-1 py-0.5 rounded font-semibold' : ''}>
            {visit.leopoldsFindings.fetalPosition}
            {visit.changes?.fetalPosition && <span className="ml-1 text-red-500">●</span>}
          </span>
        </div>
      </div>
      ),
      cellClassName: "text-center max-w-xs"
    },
    {
      label: "Clinical Notes",
      accessor: (visit) => (
        <div className="text-s leading-relaxed space-y-2">
          <div className="p-2 rounded border-red-400">
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

  // Keep your existing table structure - no changes
  return (
    <Card className={`border-slate-200 shadow-sm font-poppins ${className}`}>
      <CardContent className="p-0">
        {/* Add context info above the table */}
        {/* {pregnancyId && visitNumber && (
          <div className="p-4 bg-blue-50 border-b border-slate-200">
            <p className="text-blue-800 font-medium text-sm">
              📊 Viewing prenatal history for {patientData?.personal_info?.per_fname} {patientData?.personal_info?.per_lname}
            </p>
          </div>
        )} */}
        
        <div className={hasMoreVisits ? "overflow-x-auto" : ""}>
          <Table className={hasMoreVisits ? "w-max" : "w-full"}>
            <TableHeader className="bg-slate-100">
              <TableRow className="border-slate-200">
                <TableHead className={`font-semibold text-slate-700 text-xs uppercase tracking-wide w-44 ${hasMoreVisits ? 'sticky left-0 bg-slate-100 z-10' : ''}`}>
                  Clinical Parameter
                </TableHead>
                {sortedData.map((_, index) => (
                  <TableHead 
                    key={index} 
                    className={`font-semibold text-slate-700 p-5 text-xs uppercase tracking-wide text-center ${hasMoreVisits ? 'min-w-48' : 'w-auto'}`}
                  >
                    Visit {sortedData.length - index}
                    {index === 0 && <span className="text-blue-500 ml-1">[CURRENT]</span>}
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