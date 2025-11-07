
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button/button';
import { ChevronLeft, Printer } from "lucide-react";
import { exportToCSV, exportToExcel, exportToPDF } from "../export/export-report";
import { ExportDropdown } from '../export/export-dropdown';

const methods = [
  "BTL", "NSV", "Condom", "POP", "COC", "DMPA", "Implant",
  "IUD-Interval", "IUD-Post Partum", "LAM", "BBT", "CMM", "STM", "SDM"
] as const;

type Method = typeof methods[number];
type AgeGroup = '10-14' | '15-19' | '20-49' | 'Total';

const methodDisplayNames: Record<Method, string> = {
  "BTL": "a. BTL",
  "NSV": "b. NSV",
  "Condom": "c. Condom",
  "POP": "d. 1 Pills - POP", 
  "COC": "d. 2 Pills - COC", 
  "DMPA": "e. DMPA",
  "Implant": "f. Implant",
  "IUD-Interval": "g. 1 IUD-I",
  "IUD-Post Partum": "g. 2 IUD-Post Partum",
  "LAM": "h. NFP-LAM",
  "BBT": "i. NFP-BBT",
  "CMM": "j. NFP-CMM",
  "STM": "k. NFP-STM",
  "SDM": "l. NFP-SDM",
}

interface ReportData {
  bom_counts: Record<Method, Record<AgeGroup, number>>;
  new_counts: Record<Method, Record<AgeGroup, number>>;
  other_counts: Record<Method, Record<AgeGroup, number>>;
  drop_outs_counts: Record<Method, Record<AgeGroup, number>>;
}

const formatValue = (value: number | undefined): string => {
  return value !== undefined && value !== 0 ? value.toString() : "";
};

const calculateColumnTotals = (reportData: ReportData) => {
  const totals = {
    bom: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    new: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    other: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    dropout: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    eom: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    newAcceptors: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 },
    totalDemand: { '10-14': 0, '15-19': 0, '20-49': 0, Total: 0 }
  };

  methods.forEach((method) => {
    const bom = reportData.bom_counts[method] || {};
    const new_ = reportData.new_counts[method] || {};
    const other = reportData.other_counts[method] || {};
    const dropout = reportData.drop_outs_counts[method] || {};
    
    const eom = {
      '10-14': (bom['10-14'] || 0) + (new_['10-14'] || 0) + (other['10-14'] || 0) - (dropout['10-14'] || 0),
      '15-19': (bom['15-19'] || 0) + (new_['15-19'] || 0) + (other['15-19'] || 0) - (dropout['15-19'] || 0),
      '20-49': (bom['20-49'] || 0) + (new_['20-49'] || 0) + (other['20-49'] || 0) - (dropout['20-49'] || 0),
      'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
    };
    
    const newAcceptors = {
      '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
      '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
      '20-49': (new_['20-49'] || 0) + (other['20-49'] || 0),
      'Total': (new_['Total'] || 0) + (other['Total'] || 0),
    };
    
    const totalDemand = {
      '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
      '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
      '20-49': (eom['20-49'] || 0) + (newAcceptors['20-49'] || 0),
      'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
    };

    const ageGroups: AgeGroup[] = ['10-14', '15-19', '20-49', 'Total'];
    ageGroups.forEach(ageGroup => {
      totals.bom[ageGroup] += bom[ageGroup] || 0;
      totals.new[ageGroup] += new_[ageGroup] || 0;
      totals.other[ageGroup] += other[ageGroup] || 0;
      totals.dropout[ageGroup] += dropout[ageGroup] || 0;
      totals.eom[ageGroup] += eom[ageGroup] || 0;
      totals.newAcceptors[ageGroup] += newAcceptors[ageGroup] || 0;
      totals.totalDemand[ageGroup] += totalDemand[ageGroup] || 0;
    });
  });

  return totals;
};

const handlePrint = () => {
  const content = document.getElementById('print-content');
  if (content) {
    const printWindow = window.open('', '', 'height=500, width=800');
    // printWindow?.document.write('<html><head><title>Print</title>');
    printWindow?.document.write(`
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
        }
        table { 
          border-collapse: collapse; 
          width: 100%;
        } 
        th, td { 
          border: 1px solid black; 
          padding: 5px; 
          text-align: center; 
          font-size: 11px;
          text-size: 11px;
        }
      </style>
    `);
   printWindow?.document.write(`
  <div class="header" style="margin-bottom: 15px;">BRGY: SAN ROQUE<span style="margin-left: 20px;">BHS: SAN ROQUE H.C</span><span style="margin-left: 20px;">MUNICIPALITY/CITY: CEBU CITY</span></div>`);
    printWindow?.document.write('</head><body>');
    printWindow?.document.write(content.innerHTML);
    printWindow?.document.write('</body></html>');
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  }
};

export default function FPReportDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { month, monthName } = location.state || {};
 console.log("MONTH:",month)
  const [year, monthNum] = month ? month.split('-') : [new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString()];

  const { data, isLoading, isError, error } = useQuery<ReportData>({
    queryKey: ['detailedMonthlyReport', year, monthNum],
    queryFn: async () => {
      const response = await api2.get(`/familyplanning/monthly-report/${year}/${monthNum}/`);
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-4 text-center">Loading report...</div>;
  }

  if (isError) {
    return <div className="p-4 text-center text-red-500">Error loading report: {error?.message}</div>;
  }

  const reportData = data!;

  const columnTotals = calculateColumnTotals(reportData);

  const prepareExportData = () => {
    const rows: any[] = [];
    methods.forEach(method => {
      const bom = reportData.bom_counts[method] || {};
      const new_ = reportData.new_counts[method] || {};
      const other = reportData.other_counts[method] || {};
      const dropout = reportData.drop_outs_counts[method] || {};
      
      const eom = {
        '10-14': (bom['10-14'] || 0) + (new_['10-14'] || 0) + (other['10-14'] || 0) - (dropout['10-14'] || 0),
        '15-19': (bom['15-19'] || 0) + (new_['15-19'] || 0) + (other['15-19'] || 0) - (dropout['15-19'] || 0),
        '20-49': (bom['20-49'] || 0) + (new_['20-49'] || 0) + (other['20-49'] || 0) - (dropout['20-49'] || 0),
        'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
      };
      
      const newAcceptors = {
        '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
        '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
        '20-49': (new_['20-49'] || 0) + (other['20-49'] || 0),
        'Total': (new_['Total'] || 0) + (other['Total'] || 0),
      };
      
      const totalDemand = {
        '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
        '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
        '20-49': (eom['20-49'] || 0) + (newAcceptors['20-49'] || 0),
        'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
      };

      rows.push({
        Method: methodDisplayNames[method],
        'BOM 10-14': bom['10-14'] || 0,
        'BOM 15-19': bom['15-19'] || 0,
        'BOM 20-49': bom['20-49'] || 0,
        'BOM Total': bom['Total'] || 0,
        'New 10-14': new_['10-14'] || 0,
        'New 15-19': new_['15-19'] || 0,
        'New 20-49': new_['20-49'] || 0,
        'New Total': new_['Total'] || 0,
        'Other 10-14': other['10-14'] || 0,
        'Other 15-19': other['15-19'] || 0,
        'Other 20-49': other['20-49'] || 0,
        'Other Total': other['Total'] || 0,
        'Dropout 10-14': dropout['10-14'] || 0,
        'Dropout 15-19': dropout['15-19'] || 0,
        'Dropout 20-49': dropout['20-49'] || 0,
        'Dropout Total': dropout['Total'] || 0,
        'EOM 10-14': eom['10-14'],
        'EOM 15-19': eom['15-19'],
        'EOM 20-49': eom['20-49'],
        'EOM Total': eom['Total'],
        'New Acceptors 10-14': newAcceptors['10-14'],
        'New Acceptors 15-19': newAcceptors['15-19'],
        'New Acceptors 20-49': newAcceptors['20-49'],
        'New Acceptors Total': newAcceptors['Total'],
        'Total Demand 10-14': totalDemand['10-14'],
        'Total Demand 15-19': totalDemand['15-19'],
        'Total Demand 20-49': totalDemand['20-49'],
        'Total Demand Total': totalDemand['Total'],
      });
    });
    return rows;
  };

  const handleExportCSV = () => exportToCSV(prepareExportData(), `FP_Report_${month}`);
  const handleExportExcel = () => exportToExcel(prepareExportData(), `FP_Report_${month}`);
  const handleExportPDF = () => exportToPDF(prepareExportData(), `FP_Report_${month}`);

  return (
    <div className="p-4">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}><ChevronLeft /></Button>
        <h1 className="text-2xl font-bold">Family Planning Report - {monthName}</h1>
      </div>

      <div className="flex gap-2 mb-4">
        <ExportDropdown onExportCSV={handleExportCSV} onExportExcel={handleExportExcel} onExportPDF={handleExportPDF} />
        <Button variant="outline" onClick={handlePrint} className="gap-2">
          <Printer className="h-4 w-4" /> Print
        </Button>
      </div>



      <div className="overflow-x-auto max-w-full" id="print-content">
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1 text-left method-col" rowSpan={2}>METHOD</th>
              <th className="border border-black p-1 header-group" colSpan={4}>Current User<br />(Beginning of Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>New Acceptor<br />(Previous Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>Other<br/>(Present Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>Drop-outs<br/>(Present Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>Current Users<br />(End of Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>New Acceptors<br />(Present Month)</th>
              <th className="border border-black p-1 header-group" colSpan={4}>TOTAL Demand for FP</th>
            </tr>
            <tr className="bg-gray-50">
              {/* Current User (BOM) */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* New Acceptor */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* Other */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* Drop-outs */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* Current Users (EOM) */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* New Acceptors */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
              
              {/* TOTAL Demand for FP */}
              <th className="border border-black p-1 age-col">10-14</th>
              <th className="border border-black p-1 age-col">15-19</th>
              <th className="border border-black p-1 age-col">20-49</th>
              <th className="border border-black p-1 age-col">Total</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((method, index) => {
              const bom = reportData.bom_counts[method] || {};
              const new_ = reportData.new_counts[method] || {};
              const other = reportData.other_counts[method] || {};
              const dropout = reportData.drop_outs_counts[method] || {};
              
              const eom = {
                '10-14': (bom['10-14'] || 0) + (new_['10-14'] || 0) + (other['10-14'] || 0) - (dropout['10-14'] || 0),
                '15-19': (bom['15-19'] || 0) + (new_['15-19'] || 0) + (other['15-19'] || 0) - (dropout['15-19'] || 0),
                '20-49': (bom['20-49'] || 0) + (new_['20-49'] || 0) + (other['20-49'] || 0) - (dropout['20-49'] || 0),
                'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
              };
              
              const newAcceptors = {
                '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
                '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
                '20-49': (new_['20-49'] || 0) + (other['20-49'] || 0),
                'Total': (new_['Total'] || 0) + (other['Total'] || 0),
              };
              
              const totalDemand = {
                '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
                '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
                '20-49': (eom['20-49'] || 0) + (newAcceptors['20-49'] || 0),
                'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
              };

              return (
                <tr key={method} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                  <td className="border border-black p-1 font-semibold method-col text-left">{methodDisplayNames[method] || method}</td>
                  
                  {/* Current User (BOM) */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(bom['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(bom['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(bom['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(bom['Total'])}</td>
                  
                  {/* New Acceptor */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(new_['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(new_['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(new_['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(new_['Total'])}</td>
                  
                  {/* Other */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(other['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(other['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(other['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(other['Total'])}</td>
                  
                  {/* Drop-outs */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(dropout['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(dropout['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(dropout['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(dropout['Total'])}</td>
                  
                  {/* Current Users (EOM) */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(eom['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(eom['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(eom['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(eom['Total'])}</td>
                  
                  {/* New Acceptors */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['Total'])}</td>
                  
                  {/* TOTAL Demand for FP */}
                  <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['10-14'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['15-19'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['20-49'])}</td>
                  <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['Total'])}</td>
                </tr>
              );
            })}
            
            <tr className="bg-gray-100 font-semibold total-row">
              <td className="border border-black p-1 method-col text-left">m. Total Current Users</td>
              
              {/* Current User (BOM) */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['Total'])}</td>
              
              {/* New Acceptor */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['Total'])}</td>
              
              {/* Other */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['Total'])}</td>
              
              {/* Drop-outs */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['Total'])}</td>
              
              {/* Current Users (EOM) */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['Total'])}</td>
              
              {/* New Acceptors */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['Total'])}</td>
              
              {/* TOTAL Demand for FP */}
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['10-14'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['15-19'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['20-49'])}</td>
              <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['Total'])}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}