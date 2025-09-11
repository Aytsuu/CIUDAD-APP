// import React from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { api2 } from '@/api/api';
// import { Button } from '@/components/ui/button/button';
// import { SelectLayout } from '@/components/ui/select/select-layout';
// import { Link } from 'react-router-dom';
// import { ChevronLeft } from 'lucide-react';
// import { useState } from 'react';

// // Define the method names as they appear in the backend
// const methods = [
//     "Condoms",
//     "Pills - COC",
//     "Pills - POC",
//     "Injectable (DMPA/Depo)",
//     "Implant",
//     "IUD-Interval",
//     "IUD-Post Partum",
//     "LAM",
//     "BBT",
//     "CMM",
//     "STM",
//     "DMPA",
//     "SDM",
// ];

// // Map method names to display names for the table
// const methodDisplayNames = {
//     "BTL": "a. BTL",
//     "NSV": "b. NSV",
//     "Condom": "c. Condom",
//     "COC": "d. 1 Pills - COC",
//     "POP": "d. 2 Pills - POP",
//     "DMPA": "e. Injectable (DMPA/Depo)",
//     "Implant": "f. Implant",
//     "IUD-Interval": "g. 1 IUD-I",
//     "IUD-Post Partum": "g. 2 IUD-Post Patrum",
//     "LAM": "h. NFP-LAM",
//     "BBT": "i. NFP-BBT",
//     "CMM": "j. NFP-CMM",
//     "STM": "k. NFP-STM",
//     "SDM": "l. NFP-SDM",
// };

// // Define the shape of the data returned from the API
// interface ReportData {
//     bom_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
//     new_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
//     other_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
//     drop_outs_counts: Record<string, { "10-14": number; "15-19": number; "24-49": number; "Total": number; }>;
// }


// const ReportPage = () => {
//     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

//     const { data, isLoading, isError, error } = useQuery<ReportData>({
//         queryKey: ['detailedMonthlyReport', selectedYear, selectedMonth],
//         queryFn: async () => {
//             const response = await api2.get(`/familyplanning/monthly-report/${selectedYear}/${selectedMonth}/`);
//             return response.data;
//         },
//     });

//     if (isLoading) {
//         return <div className="p-4 text-center">Loading report...</div>;
//     }

//     if (isError) {
//         return <div className="p-4 text-center text-red-500">Error loading report: {error.message}</div>;
//     }

//     const reportData = data!;

//     return (
//         <div className="max-w-full mx-auto p-6 bg-white">
//             {/* Header Section */}
//             <div className="flex justify-between items-start mb-6">
//                 <div className="flex items-center space-x-4">
//                     <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
//                         <div className="text-xs text-center">
                    
//                         </div>
//                     </div>
//                     <div className="text-sm">
//                         <div>FSBS REPORT for the</div>
//                         <div>Family Planning Services</div>
//                         <div>Name of BHS: ________________</div>
//                         <div>Name of Municipality/City: ________________</div>
//                         <div>Name of Province: ________________</div>
//                         <div>Projected Population of the Year: ________________</div>
//                     </div>
//                 </div>

//                 <div className="text-right text-sm">
//                     <div className="flex items-center gap-2">
//                         <label>MONTH:</label>
//                         <SelectLayout
//                             options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: new Date(0, i).toLocaleString('default', { month: 'long' }) }))}
//                             value={selectedMonth}
//                             onValueChange={(value) => setSelectedMonth(Number(value))}
//                         />
//                         <label>YEAR:</label>
//                         <SelectLayout
//                             options={Array.from({ length: 5 }, (_, i) => ({ value: new Date().getFullYear() - i, label: String(new Date().getFullYear() - i) }))}
//                             value={selectedYear}
//                             onValueChange={(value) => setSelectedYear(Number(value))}
//                         />
//                     </div>
//                     <div className="mt-4">
//                         <div className="text-3xl font-bold">M1</div>
//                         <div className="text-lg font-semibold">BRGY</div>
//                     </div>
//                 </div>
//             </div>

//             {/* Additional Info Section */}
//             <div className="grid grid-cols-4 gap-4 mb-4 text-xs">
//                 <div>
//                     <div>No. of Barangays Projected:</div>
//                     <div className="border-b border-black w-16 h-5"></div>
//                 </div>
//                 <div>
//                     <div>Total no WRA:</div>
//                     <div className="border-b border-black w-16 h-5"></div>
//                 </div>
//                 <div>
//                     <div>Current Users:</div>
//                     <div className="border-b border-black w-16 h-5"></div>
//                 </div>
//                 <div>
//                     <div>New Acceptors:</div>
//                     <div className="border-b border-black w-16 h-5"></div>
//                 </div>
//             </div>

//             {/* Main Table */}
//             <div className="overflow-x-auto">
//                 <table className="w-full border-collapse border border-black text-xs">
//                     <thead>
//                         <tr className="bg-gray-100">
//                             <th className="border border-black p-1 text-left w-32">METHOD</th>
//                             <th className="border border-black p-1" colSpan="4">Current User<br />(Beginning Month)</th>
//                             <th className="border border-black p-1" colSpan="4">New <br />(Previous Month)</th>
//                             <th className="border border-black p-1" colSpan="4">Other (Present Month)</th>
//                             <th className="border border-black p-1" colSpan="4">Drop-outs (Present Month)</th>
//                             <th className="border border-black p-1" colSpan="4">Current Users<br />(End of Month)</th>
//                             <th className="border border-black p-1" colSpan="4">New Acceptors<br />(Present Month)</th>
//                         </tr>
//                         <tr className="bg-gray-50">
//                             <th className="border border-black p-1"></th>
//                             {Array(6).fill(null).map((_, groupIndex) => (
//                                 <React.Fragment key={groupIndex}>
//                                     <th className="border border-black p-1 w-12">10-14</th>
//                                     <th className="border border-black p-1 w-12">15-19</th>
//                                     <th className="border border-black p-1 w-12">24-49</th>
//                                     <th className="border border-black p-1 w-12">Total</th>
//                                 </React.Fragment>
//                             ))}
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {methods.map((method, index) => {
//                             const bom = reportData.bom_counts[method] || {};
//                             const new_ = reportData.new_counts[method] || {};
//                             const other = reportData.other_counts[method] || {};
//                             const dropout = reportData.drop_outs_counts[method] || {};
//                             const eom = {
//                                 '10-14': (bom['10-14'] || 0) + (new_['10-14'] || 0) + (other['10-14'] || 0) - (dropout['10-14'] || 0),
//                                 '15-19': (bom['15-19'] || 0) + (new_['15-19'] || 0) + (other['15-19'] || 0) - (dropout['15-19'] || 0),
//                                 '24-49': (bom['24-49'] || 0) + (new_['24-49'] || 0) + (other['24-49'] || 0) - (dropout['24-49'] || 0),
//                                 'Total': (bom['Total'] || 0) + (new_['Total'] || 0) + (other['Total'] || 0) - (dropout['Total'] || 0),
//                             };

//                             const newAcceptors = {
//                                 '10-14': (new_['10-14'] || 0) + (other['10-14'] || 0),
//                                 '15-19': (new_['15-19'] || 0) + (other['15-19'] || 0),
//                                 '24-49': (new_['24-49'] || 0) + (other['24-49'] || 0),
//                                 'Total': (new_['Total'] || 0) + (other['Total'] || 0),
//                             };

//                             return (
//                                 <tr key={method} className={index % 2 === 0 ? "bg-gray-100" : ""}>
//                                     <td className="border border-black p-1 font-semibold">{methodDisplayNames[method] || method}</td>
                                    
//                                     {/* BOM Current Users */}
//                                     <td className="border border-black p-1 text-center">{bom['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{bom['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{bom['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{bom['Total']}</td>

//                                     {/* New (Previous Month) - The form seems to use 'Present' month for new, we'll follow that */}
//                                     <td className="border border-black p-1 text-center">{new_['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{new_['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{new_['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{new_['Total']}</td>

//                                     {/* Other (Present Month) */}
//                                     <td className="border border-black p-1 text-center">{other['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{other['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{other['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{other['Total']}</td>

//                                     {/* Drop-outs (Present Month) */}
//                                     <td className="border border-black p-1 text-center">{dropout['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{dropout['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{dropout['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{dropout['Total']}</td>

//                                     {/* Current Users (End of Month) */}
//                                     <td className="border border-black p-1 text-center">{eom['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{eom['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{eom['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{eom['Total']}</td>
                                    
//                                     {/* New Acceptors (Present Month) */}
//                                     <td className="border border-black p-1 text-center">{newAcceptors['10-14']}</td>
//                                     <td className="border border-black p-1 text-center">{newAcceptors['15-19']}</td>
//                                     <td className="border border-black p-1 text-center">{newAcceptors['24-49']}</td>
//                                     <td className="border border-black p-1 text-center">{newAcceptors['Total']}</td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </div>

//             {/* Bottom Section */}
//             <div className="mt-6 grid grid-cols-2 gap-8">
//                 <div className="space-y-2 text-xs">
//                     <div className="flex justify-between">
//                         <span>No. of FP-CRA using new choice of contraceptive method for March to September 2424:</span>
//                         <div className="border-b border-black w-16"></div>
//                     </div>
//                     <div className="flex justify-between">
//                         <span>No. of FP-CRA using new choice of contraceptive method:</span>
//                         <div className="border-b border-black w-16"></div>
//                     </div>
//                 </div>

//                 <div className="text-right text-xs">
//                     <div className="space-y-4">
//                         <div>
//                             <div>Prepared by:</div>
//                             <div className="mt-8 border-b border-black w-48 ml-auto"></div>
//                             <div className="text-center">Signature over Printed Name</div>
//                             <div className="text-center">BHW/BNS/PHN/RHM</div>
//                         </div>
//                         <div className="mt-8">
//                             <div>Date: _______________</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ReportPage;