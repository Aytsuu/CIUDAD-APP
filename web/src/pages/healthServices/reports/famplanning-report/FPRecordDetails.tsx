import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { api2 } from '@/api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button/button';
import { ChevronLeft, Printer } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF } from '../export/export-report';
import { ExportDropdown } from '../export/export-dropdown';

const methods = [
  "BTL", "NSV", "Condom", "POP", "COC", "DMPA", "Implant",
  "IUD-Interval", "IUD-Post Partum", "LAM", "BBT", "CMM", "STM", "SDM"
] as const;

type Method = typeof methods[number];
type AgeGroup = '10-14' | '15-19' | '20-49' | 'Total';

const methodDisplayNames: Record<Method, string> = {
  BTL: "a. BTL",
  NSV: "b. NSV",
  Condom: "c. Condom",
  POP: "d.1 Pills-POP",
  COC: "d.2 Pills-COC",
  DMPA: "e. DMPA",
  Implant: "f. Implant",
  "IUD-Interval": "g.1 IUD-I",
  "IUD-Post Partum": "g.2 IUD-PP",
  LAM: "h. NFP-LAM",
  BBT: "i. NFP-BBT",
  CMM: "j. NFP-CMM",
  STM: "k. NFP-STM",
  SDM: "l. NFP-SDM",
};

interface ReportData {
  bom_counts: Record<Method, Record<AgeGroup, number>>;
  prev_month_new_counts: Record<Method, Record<AgeGroup, number>>;
  new_counts: Record<Method, Record<AgeGroup, number>>;
  other_counts: Record<Method, Record<AgeGroup, number>>;
  drop_outs_counts: Record<Method, Record<AgeGroup, number>>;
  eom_counts: Record<Method, Record<AgeGroup, number>>;
}

/* ---------- Formatting helpers ---------- */
const formatValue = (v: number | undefined) => (v ? v.toString() : "");               // hide 0 everywhere
const formatTotal = (v: number | undefined) => (v && v > 0 ? v.toString() : "");      // hide 0 only in totals

/* ---------- Column totals ---------- */
const calculateColumnTotals = (data: ReportData) => {
  const totals = {
    bom: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    prev: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    other: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    dropout: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    eom: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    newPresent: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    demand: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
  };

  methods.forEach(m => {
    const b = data.bom_counts[m] ?? {};
    const p = data.prev_month_new_counts[m] ?? {};
    const n = data.new_counts[m] ?? {};
    const o = data.other_counts[m] ?? {};
    const d = data.drop_outs_counts[m] ?? {};
    const e = data.eom_counts[m] ?? {};

    const newPres = {
      '10-14': n['10-14'] ?? 0,
      '15-19': n['15-19'] ?? 0,
      '20-49': n['20-49'] ?? 0,
      Total: n.Total ?? 0,
    };

    const dem = {
      '10-14': (e['10-14'] ?? 0) + newPres['10-14'],
      '15-19': (e['15-19'] ?? 0) + newPres['15-19'],
      '20-49': (e['20-49'] ?? 0) + newPres['20-49'],
      Total: (e.Total ?? 0) + newPres.Total,
    };

    (['10-14', '15-19', '20-49', 'Total'] as AgeGroup[]).forEach(g => {
      totals.bom[g] += b[g] ?? 0;
      totals.prev[g] += p[g] ?? 0;
      totals.other[g] += o[g] ?? 0;
      totals.dropout[g] += d[g] ?? 0;
      totals.eom[g] += e[g] ?? 0;
      totals.newPresent[g] += newPres[g];
      totals.demand[g] += dem[g];
    });
  });

  return totals;
};

/* ---------- Print helper ---------- */
const handlePrint = () => {
  const el = document.getElementById('print-content');
  if (!el) return;
  const win = window.open('', '', 'height=600,width=900');
  win?.document.write(`
    <html><head><title>FP Report</title>
    <style>
      table{border-collapse:collapse;width:100%;font-family:arial;font-size:11px;}
      th,td{border:1px solid #000;padding:3px;text-align:center;}
      th{background:#f0f0f0;}
      .method-col{width:150px;text-align:left;}
      .age-col{width:55px;}
    </style></head><body>`);
  win?.document.write(el.innerHTML);
  win?.document.write('</body></html>');
  win?.document.close();
  win?.focus();
  win?.print();
};

/* ---------- Export data (CSV/Excel/PDF) ---------- */
const prepareExportData = (data: ReportData) => {
  const rows: any[] = [];
  methods.forEach(m => {
    const b = data.bom_counts[m] ?? {};
    const p = data.prev_month_new_counts[m] ?? {};
    const n = data.new_counts[m] ?? {};
    const o = data.other_counts[m] ?? {};
    const d = data.drop_outs_counts[m] ?? {};
    const e = data.eom_counts[m] ?? {};

    const newPres = { '10-14': n['10-14'] ?? 0, '15-19': n['15-19'] ?? 0, '20-49': n['20-49'] ?? 0, Total: n.Total ?? 0 };
    const dem = {
      '10-14': (e['10-14'] ?? 0) + newPres['10-14'],
      '15-19': (e['15-19'] ?? 0) + newPres['15-19'],
      '20-49': (e['20-49'] ?? 0) + newPres['20-49'],
      Total: (e.Total ?? 0) + newPres.Total,
    };

    rows.push({
      Method: methodDisplayNames[m],
      'BOM 10-14': b['10-14'] ?? 0,
      'BOM 15-19': b['15-19'] ?? 0,
      'BOM 20-49': b['20-49'] ?? 0,
      'BOM Total': b.Total ?? 0,
      'Prev 10-14': p['10-14'] ?? 0,
      'Prev 15-19': p['15-19'] ?? 0,
      'Prev 20-49': p['20-49'] ?? 0,
      'Prev Total': p.Total ?? 0,
      'Other 10-14': o['10-14'] ?? 0,
      'Other 15-19': o['15-19'] ?? 0,
      'Other 20-49': o['20-49'] ?? 0,
      'Other Total': o.Total ?? 0,
      'Drop 10-14': d['10-14'] ?? 0,
      'Drop 15-19': d['15-19'] ?? 0,
      'Drop 20-49': d['20-49'] ?? 0,
      'Drop Total': d.Total ?? 0,
      'EOM 10-14': e['10-14'] ?? 0,
      'EOM 15-19': e['15-19'] ?? 0,
      'EOM 20-49': e['20-49'] ?? 0,
      'EOM Total': e.Total ?? 0,
      'NewPres 10-14': newPres['10-14'],
      'NewPres 15-19': newPres['15-19'],
      'NewPres 20-49': newPres['20-49'],
      'NewPres Total': newPres.Total,
      'Demand 10-14': dem['10-14'],
      'Demand 15-19': dem['15-19'],
      'Demand 20-49': dem['20-49'],
      'Demand Total': dem.Total,
    });
  });
  return rows;
};

/* ---------- MAIN COMPONENT ---------- */
export default function FPReportDetails() {
  const { state } = useLocation() as { state?: { month: string; monthName: string } };
  const navigate = useNavigate();
  const { month = '', monthName = '' } = state ?? {};
  const [year, monthNum] = month ? month.split('-') : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString()];

  const { data, isLoading, isError, error } = useQuery<ReportData>({
    queryKey: ['detailedMonthlyReport', year, monthNum],
    queryFn: async () => (await api2.get(`/familyplanning/monthly-report/${year}/${monthNum}/`)).data,
  });

  if (isLoading) return <div className="p-4 text-center">Loading report...</div>;
  if (isError) return <div className="p-4 text-center text-red-500">Error: {(error as Error)?.message}</div>;

  const report = data!;
  const totals = calculateColumnTotals(report);

  /* ---- Helper to render the 4 age cells ---- */
  const ageCells = (obj: Record<AgeGroup, number | undefined>, fmt: (v: number | undefined) => string = formatValue) => (
    <>
      <td className="border border-black p-1 text-center age-col">{fmt(obj['10-14'])}</td>
      <td className="border border-black p-1 text-center age-col">{fmt(obj['15-19'])}</td>
      <td className="border border-black p-1 text-center age-col">{fmt(obj['20-49'])}</td>
      <td className="border border-black p-1 text-center age-col">{fmt(obj.Total)}</td>
    </>
  );

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft /></Button>
        <h1 className="text-2xl font-bold">Family Planning Report - {monthName}</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <ExportDropdown
          onExportCSV={() => exportToCSV(prepareExportData(report), `FP_Report_${month}`)}
          onExportExcel={() => exportToExcel(prepareExportData(report), `FP_Report_${month}`)}
          onExportPDF={() => exportToPDF('landscape')}
        />
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>

      <div className="overflow-x-auto" id="print-content">
        <table className="w-full border-collapse border border-black text-xs">
          {/* ---------- HEADER ---------- */}
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-black p-1 text-left method-col">FP Methods</th>

              {[
                "Current Users<br />(Beginning of Month)",
                "New Acceptor<br />(Previous Month)",
                "Other Acceptor<br />(Present Month)",
                "Drop-outs<br />(Present Month)",
                "Current Users<br />(End of Month)",
                "New Acceptors<br />(Present Month)",
                "TOTAL Demand for FP"
              ].map((t, i) => (
                <th key={i} colSpan={4} className="border border-black p-1" dangerouslySetInnerHTML={{ __html: t }} />
              ))}
            </tr>

            <tr className="bg-gray-50">
              {[...Array(7)].map((_, i) => (
                <React.Fragment key={i}>
                  <th className="border border-black p-1 age-col">10-14</th>
                  <th className="border border-black p-1 age-col">15-19</th>
                  <th className="border border-black p-1 age-col">20-49</th>
                  <th className="border border-black p-1 age-col">Total</th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          {/* ---------- BODY ---------- */}
          <tbody>
            {methods.map((m, idx) => {
              const b = report.bom_counts[m] ?? {};
              const p = report.prev_month_new_counts[m] ?? {};
              const n = report.new_counts[m] ?? {};
              const o = report.other_counts[m] ?? {};
              const d = report.drop_outs_counts[m] ?? {};
              const e = report.eom_counts[m] ?? {};

              const newPres = {
                '10-14': n['10-14'] ?? 0,
                '15-19': n['15-19'] ?? 0,
                '20-49': n['20-49'] ?? 0,
                Total: n.Total ?? 0,
              };
              const demand = {
                '10-14': (e['10-14'] ?? 0) + newPres['10-14'],
                '15-19': (e['15-19'] ?? 0) + newPres['15-19'],
                '20-49': (e['20-49'] ?? 0) + newPres['20-49'],
                Total: (e.Total ?? 0) + newPres.Total,
              };

              return (
                <tr key={m} className={idx % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="border border-black p-1 font-semibold method-col text-left">
                    {methodDisplayNames[m]}
                  </td>

                  {ageCells(b)}               {/* BOM */}
                  {ageCells(p)}               {/* Prev New */}
                  {ageCells(o)}               {/* Other */}
                  {ageCells(d)}               {/* Drop-out */}
                  {ageCells(e)}               {/* EOM */}
                  {ageCells(newPres)}         {/* New Present */}
                  {ageCells(demand)}          {/* Demand */}
                </tr>
              );
            })}

            {/* ---------- TOTAL ROW (hide 0) ---------- */}
            <tr className="bg-gray-100 font-semibold">
              <td className="border border-black p-1 method-col text-left">m. Total Current Users</td>
              {ageCells(totals.bom, formatTotal)}
              {ageCells(totals.prev, formatTotal)}
              {ageCells(totals.other, formatTotal)}
              {ageCells(totals.dropout, formatTotal)}
              {ageCells(totals.eom, formatTotal)}
              {ageCells(totals.newPresent, formatTotal)}
              {ageCells(totals.demand, formatTotal)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}