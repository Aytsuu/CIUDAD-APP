import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api2 } from '@/api/api';
import { SelectLayout } from '@/components/ui/select/select-layout';

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
    ];
    // Revised methodDisplayNames in frontend
    const methodDisplayNames = {
        "BTL": "a. BTL",
        "NSV": "b. NSV",
        "Condom": "c. Condom",
        "COC": "d. 2 Pills - COC", 
        "POP": "d. 1 Pills - POP", 
        "DMPA": "e. DMPA",
        "Implant": "f. Implant",
        "IUD-Interval": "g. 1 IUD-I",
        "IUD-Post Partum": "g. 2 IUD-Post Patrum",
        "LAM": "h. NFP-LAM",
        "BBT": "i. NFP-BBT",
        "CMM": "j. NFP-CMM",
        "STM": "k. NFP-STM",
        "SDM": "l. NFP-SDM", // Assuming SDM is the key
    }
// Define the shape of the data returned from the API
interface ReportData {
    bom_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
    new_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
    other_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
    drop_outs_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
}

// Helper function to format value: display empty string if value is undefined or 0
const formatValue = (value: number | undefined): string => {
    return value !== undefined && value !== 0 ? value.toString() : "";
};

const ReportPage = () => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

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

    return (
        <div className="max-w-full mx-auto p-6 bg-white">
            {/* Header Section */}
            <div className="flex justify-between items-start mb-6">
              

                <div className="text-right text-sm">
                    <div className="flex items-center gap-2">
                        <label>MONTH:</label>
                        <SelectLayout
                            options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'long' }) }))}
                            value={selectedMonth}
                            onValueChange={(value) => setSelectedMonth(Number(value))}
                        />
                        <label>YEAR:</label>
                        <SelectLayout
                            options={Array.from({ length: 5 }, (_, i) => ({ value: new Date().getFullYear() - i, label: String(new Date().getFullYear() - i) }))}
                            value={selectedYear}
                            onValueChange={(value) => setSelectedYear(Number(value))}
                        />
                    </div>
                   
                </div>
            </div>

        
            {/* Main Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs">
                    {/* Table Headers */}
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-1 text-left w-32">METHOD</th>
                            <th className="border border-black p-1" colSpan="4">Current User<br />(Beginning Month)</th>
                            <th className="border border-black p-1" colSpan="4">New <br />(Previous Month)</th>
                            <th className="border border-black p-1" colSpan="4">Other (Present Month)</th>
                            <th className="border border-black p-1" colSpan="4">Drop-outs (Present Month)</th>
                            <th className="border border-black p-1" colSpan="4">Current Users<br />(End of Month)</th>
                            <th className="border border-black p-1" colSpan="4">New Acceptors<br />(Present Month)</th>
                            <th className="border border-black p-1" colSpan="4">TOTAL Demand for FP</th>
                        </tr>
                        <tr className="bg-gray-50">
                            <th className="border border-black p-1"></th>
                            {Array(7).fill(null).map((_, groupIndex) => (
                                <React.Fragment key={groupIndex}>
                                    <th className="border border-black p-1 w-12">10-14</th>
                                    <th className="border border-black p-1 w-12">15-19</th>
                                    <th className="border border-black p-1 w-12">24-49</th>
                                    <th className="border border-black p-1 w-12">Total</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>

                    {/* Table Body */}
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
    
    // Calculate Total Demand for FP
    const totalDemand = {
        '10-14': (eom['10-14'] || 0) + (newAcceptors['10-14'] || 0),
        '15-19': (eom['15-19'] || 0) + (newAcceptors['15-19'] || 0),
        '24-49': (eom['24-49'] || 0) + (newAcceptors['24-49'] || 0),
        'Total': (eom['Total'] || 0) + (newAcceptors['Total'] || 0),
    };

    return (
        <tr key={method} className={index % 2 === 0 ? "bg-gray-100" : ""}>
            <td className="border border-black p-1 font-semibold">{methodDisplayNames[method] || method}</td>
            {/* BOM Current Users */}
            <td className="border border-black p-1 text-center">{formatValue(bom['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(bom['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(bom['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(bom['Total'])}</td>
            {/* New (Previous Month) */}
            <td className="border border-black p-1 text-center">{formatValue(new_['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(new_['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(new_['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(new_['Total'])}</td>
            {/* Other (Present Month) */}
            <td className="border border-black p-1 text-center">{formatValue(other['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(other['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(other['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(other['Total'])}</td>
            {/* Drop-outs (Present Month) */}
            <td className="border border-black p-1 text-center">{formatValue(dropout['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(dropout['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(dropout['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(dropout['Total'])}</td>
            {/* Current Users (End of Month) */}
            <td className="border border-black p-1 text-center">{formatValue(eom['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(eom['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(eom['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(eom['Total'])}</td>
            {/* New Acceptors (Present Month) */}
            <td className="border border-black p-1 text-center">{formatValue(newAcceptors['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(newAcceptors['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(newAcceptors['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(newAcceptors['Total'])}</td>
            {/* TOTAL Demand for FP */}
            <td className="border border-black p-1 text-center">{formatValue(totalDemand['10-14'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(totalDemand['15-19'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(totalDemand['24-49'])}</td>
            <td className="border border-black p-1 text-center">{formatValue(totalDemand['Total'])}</td>
   
                                </tr>
                            );
                        })}
                        {/* Total Current Users */}
                        <tr className="bg-gray-100">
                            <td className="border border-black p-1 font-semibold">m. Total Current Users</td>
                            {Array(28).fill(null).map((_, index) => (
                                <td key={index} className="border border-black p-1 h-8 bg-gray-240"></td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default ReportPage;