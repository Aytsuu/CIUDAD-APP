import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import { SelectLayout } from '@/components/ui/select/select-layout';
import { Button } from '@/components/ui/button/button';

const methods = [
    "BTL",
    "NSV",
    "Condom",
    "POP",
    "COC",
    "DMPA",
    "Implant",
    "IUD-Interval",
    "IUD-Post Partum",
    "LAM",
    "BBT",
    "CMM",
    "STM",
    "SDM", 
] as const;

type Method = typeof methods[number];

type AgeGroup = '10-14' | '15-19' | '24-49' | 'Total';

const methodDisplayNames: Record<Method, string> = {
    "BTL": "a. BTL",
    "NSV": "b. NSV",
    "Condom": "c. Condom",
    "COC": "d. 2 Pills - COC", 
    "POP": "d. 1 Pills - POP", 
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

const ReportPage = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

    const { data, isLoading, isError, error } = useQuery<ReportData>({
        queryKey: ['detailedMonthlyReport', selectedYear, selectedMonth],
        queryFn: async () => {
            const response = await api2.get(`/familyplanning/monthly-report/${selectedYear}/${selectedMonth}/`);
            return response.data;
        },
    });

    if (isLoading) {
        return <div className="p-4 text-center">Loading report...</div>;
    }

    if (isError) {
        return <div className="p-4 text-center text-red-500">Error loading report: {error.message}</div>;
    }

    const reportData = data!;

    const calculateColumnTotals = () => {
        const totals = {
            bom: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            new: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            other: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            dropout: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            eom: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            newAcceptors: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 },
            totalDemand: { '10-14': 0, '15-19': 0, '24-49': 0, Total: 0 }
        };

        methods.forEach((method) => {
            const bom = reportData.bom_counts[method] || {};
            const new_ = reportData.new_counts[method] || {};
            const other = reportData.other_counts[method] || {};
            const dropout = reportData.drop_outs_counts[method] || {};
            
            const eom = {
                '10-14': (bom['10-14'] || 0) + (new_['10-14'] || 0) + (other['10-14'] || 0) - (dropout['10-14'] || 0),
                '15-19': (bom['15-19'] || 0) + (new_['15-19'] || 0) + (other['15-19'] || 0) - (dropout['15-19'] || 0),
                '24-49': (bom['24-49'] || 0) + (new_['24-49'] || 0) + (other['24-49'] || 0) - (dropout['24-49'] || 0),
                'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
            };
            
            const newAcceptors = {
                '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
                '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
                '24-49': (new_['24-49'] || 0) + (other['24-49'] || 0),
                'Total': (new_['Total'] || 0) + (other['Total'] || 0),
            };
            
            const totalDemand = {
                '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
                '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
                '24-49': (eom['24-49'] || 0) + (newAcceptors['24-49'] || 0),
                'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
            };

            const ageGroups: AgeGroup[] = ['10-14', '15-19', '24-49', 'Total'];
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

    const columnTotals = calculateColumnTotals();

const handlePrint = () => {
    const reportContent = document.getElementById('report-content');
    if (reportContent) {
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Report</title>');
            printWindow.document.write(`
                <style>
                    @page {
                        size: legal landscape;
                        margin: 0.25in;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.3;
                        margin: 0;
                        padding: 0;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        max-width: 100%;
                        table-layout: fixed;
                        height: 90vh;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px 2px;
                        text-align: center;
                        font-size: 11px;
                        line-height: 1.3;
                        word-wrap: break-word;
                        overflow: hidden;
                        vertical-align: middle;
                    }
                    th {
                        background-color: #f2f2f2;
                        font-weight: bold;
                        padding: 6px 2px;
                    }
                    tr:nth-child(even) {
                        background-color: #f9f9f9;
                    }
                    .header {
                        text-align: right;
                        margin-bottom: 10px;
                        font-size: 14px;
                        font-weight: bold;
                    }
                    .method-col {
                        width: 11%;
                        text-align: left;
                        font-size: 10px;
                        padding: 8px 4px;
                    }
                    .age-col {
                        width: 3.18%;
                    }
                    .header-group {
                        font-size: 9px;
                        padding: 4px 2px;
                        line-height: 1.2;
                    }
                    .total-row {
                        font-weight: bold;
                        background-color: #e6e6e6 !important;
                        font-size: 12px;
                    }
                    tbody tr {
                        height: 4vh;
                    }
                    thead tr {
                        height: 6vh;
                    }
                </style>
            `);
            printWindow.document.write('</head><body>');
            printWindow.document.write('<div class="header">BRGY: SAN ROQUE<span style="margin-left: 20px;"> BHS: SAN ROQUE H.C<span style="margin-left: 20px;"> MUNICIPALITY/CITY: CEBU CITY<span style="margin-left: 20px;"> MONTH: ' + new Date(0, parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' }) + ' <span style="margin-left: 20px;">YEAR: ' + selectedYear + '</span></div>');
            printWindow.document.write(reportContent.innerHTML);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
            printWindow.close();
        }
    }
};

    return (
        <div className="max-w-full mx-auto p-6 bg-white">
            <div className="flex justify-between items-start mb-6">
                <div className="text-right text-sm">
                    <div className="flex items-center gap-2">
                        <label>MONTH:</label>
                        <SelectLayout
                            placeholder="Select Month"
                            label="Month"
                            options={Array.from({ length: 12 }, (_, i) => ({ id: (i + 1).toString(), name: new Date(0, i).toLocaleString('default', { month: 'long' }) }))}
                            value={selectedMonth}
                            onChange={(value) => setSelectedMonth(value)}
                        />
                        <label>YEAR:</label>
                        <SelectLayout
                            placeholder="Select Year"
                            label="Year"
                            options={Array.from({ length: 5 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return { id: year.toString(), name: year.toString() };
                            })}
                            value={selectedYear}
                            onChange={(value) => setSelectedYear(value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto" id="report-content">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 text-left method-col">METHOD</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>Current User<br />(Beginning of Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>New Acceptor<br />(Previous Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>Other (Present Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>Drop-outs (Present Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>Current Users<br />(End of Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>New Acceptors<br />(Present Month)</th>
                            <th className="border border-black p-1 header-group" colSpan={4}>TOTAL Demand for FP</th>
                        </tr>
                        <tr className="bg-gray-50">
                            <th className="border border-black p-1"></th>
                            {Array(7).fill(null).map((_, groupIndex) => (
                                <React.Fragment key={groupIndex}>
                                    <th className="border border-black p-1 age-col">10-14</th>
                                    <th className="border border-black p-1 age-col">15-19</th>
                                    <th className="border border-black p-1 age-col">24-49</th>
                                    <th className="border border-black p-1 age-col">Total</th>
                                </React.Fragment>
                            ))}
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
                                '24-49': (bom['24-49'] || 0) + (new_['24-49'] || 0) + (other['24-49'] || 0) - (dropout['24-49'] || 0),
                                'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
                            };
                            
                            const newAcceptors = {
                                '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
                                '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
                                '24-49': (new_['24-49'] || 0) + (other['24-49'] || 0),
                                'Total': (new_['Total'] || 0) + (other['Total'] || 0),
                            };
                            
                            const totalDemand = {
                                '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
                                '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
                                '24-49': (eom['24-49'] || 0) + (newAcceptors['24-49'] || 0),
                                'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
                            };

                            return (
                                <tr key={method} className={index % 2 === 0 ? "bg-gray-100" : ""}>
                                    <td className="border border-black p-1 font-semibold method-col text-left">{methodDisplayNames[method] || method}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(bom['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(bom['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(bom['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(bom['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(new_['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(new_['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(new_['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(new_['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(other['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(other['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(other['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(other['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(dropout['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(dropout['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(dropout['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(dropout['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(eom['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(eom['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(eom['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(eom['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(newAcceptors['Total'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['10-14'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['15-19'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['24-49'])}</td>
                                    <td className="border border-black p-1 text-center age-col">{formatValue(totalDemand['Total'])}</td>
                                </tr>
                            );
                        })}
                        
                        <tr className="bg-gray-100 font-semibold total-row">
                            <td className="border border-black p-1 method-col text-left">m. Total Current Users</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.bom['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.new['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.other['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.dropout['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.eom['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.newAcceptors['Total'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['10-14'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['15-19'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['24-49'])}</td>
                            <td className="border border-black p-1 text-center age-col">{formatValue(columnTotals.totalDemand['Total'])}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-4">
                <Button
                    onClick={handlePrint}
                    className="bg-blue rounded"
                >
                    Print / Download as PDF
                </Button>
            </div>
        </div>
    );
};

export default ReportPage;