import { DewormingStatisticsResponse } from "./restful-api/fetch";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";
import { exportToPDF } from "../export/export-report";

interface DewormingStatisticsTableProps {
  data: DewormingStatisticsResponse;
}

export default function DewormingStatisticsTable({ data }: DewormingStatisticsTableProps) {
  const handleExportPDF = () => {
    exportToPDF("portrait");
  };

  // Check if we have rounds (July-December response) or single round (January-June response)
  const hasMultipleRounds = data.rounds && data.rounds.length > 0;

  return (
    <>
      {/* Export Button */}
    <div className="flex justify-end mb-4 sticky left-0 right-0 top-0 z-10 bg-white">
      <Button variant="outline" onClick={handleExportPDF} className="flex items-center gap-2">
        <Printer className="h-4 w-4" />
        Export PDF
      </Button>
    </div>

      {/* Printable Area */}
      <div
        id="printable-area"
        className="print-area bg-white overflow-x-auto"
        style={{
          width: "13in",
          margin: "0 auto",
          backgroundColor: "white",
        }}
      >
        <div className="border-2 border-black">
          {hasMultipleRounds ? (
            // Render multiple rounds (July-December response)
            data.rounds!.map((round, roundIndex) => (
              <div key={roundIndex}>
                {/* Round Header */}
                <div className="bg-gray-200 border-b-2 border-black p-3">
                  <h3 className="font-bold text-sm">
                    {round.round_name} - Period: {round.round_period}
                  </h3>
                </div>

                {/* Round Table */}
                <table className="w-full border-collapse">
                  <colgroup>
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '13.33%' }} />
                    <col style={{ width: '13.33%' }} />
                    <col style={{ width: '13.34%' }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">Age Group</th>
                      <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Female</th>
                      <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Male</th>
                      <th className="p-2 text-center font-bold text-xs bg-white">Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {round.age_groups.map((ageGroup, index) => (
                      <tr key={index} className="border-b border-black">
                        <td className="border-r border-black p-2 text-xs pl-6">
                          {index + 1}. {ageGroup.age_group}
                        </td>
                        <td className="border-r border-black p-2 text-center text-xs">{ageGroup.female}</td>
                        <td className="border-r border-black p-2 text-center text-xs">{ageGroup.male}</td>
                        <td className="p-2 text-center text-xs font-bold">{ageGroup.total}</td>
                      </tr>
                    ))}

                    {/* Totals Row */}
                    <tr className="border-b-2 border-black bg-gray-100">
                      <td className="border-r border-black p-2 text-xs pl-6 font-bold">TOTAL</td>
                      <td className="border-r border-black p-2 text-center text-xs font-bold">
                        {round.totals.female}
                      </td>
                      <td className="border-r border-black p-2 text-center text-xs font-bold">
                        {round.totals.male}
                      </td>
                      <td className="p-2 text-center text-xs font-bold">{round.totals.total}</td>
                    </tr>
                  </tbody>
                </table>

                {roundIndex < data.rounds!.length - 1 && <div className="h-6"></div>}
              </div>
            ))
          ) : (
            // Render single round (January-June response)
            <>
              {/* Round Header */}
              <div className="bg-gray-200 border-b-2 border-black p-3">
                <h3 className="font-bold text-sm">
                  {data.round_name} - Period: {data.round_period}
                </h3>
              </div>

              {/* Single Round Table */}
              <table className="w-full border-collapse">
                <colgroup>
                  <col style={{ width: '60%' }} />
                  <col style={{ width: '13.33%' }} />
                  <col style={{ width: '13.33%' }} />
                  <col style={{ width: '13.34%' }} />
                </colgroup>
                <thead>
                  <tr className="border-b-2 border-black">
                    <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">Age Group</th>
                    <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Female</th>
                    <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Male</th>
                    <th className="p-2 text-center font-bold text-xs bg-white">Total</th>
                  </tr>
                </thead>

                <tbody>
                  {data.age_groups!.map((ageGroup, index) => (
                    <tr key={index} className="border-b border-black">
                      <td className="border-r border-black p-2 text-xs pl-6">
                        {index + 1}. {ageGroup.age_group}
                      </td>
                      <td className="border-r border-black p-2 text-center text-xs">{ageGroup.female}</td>
                      <td className="border-r border-black p-2 text-center text-xs">{ageGroup.male}</td>
                      <td className="p-2 text-center text-xs font-bold">{ageGroup.total}</td>
                    </tr>
                  ))}

                  {/* Totals Row */}
                  <tr className="border-b-2 border-black bg-gray-100">
                    <td className="border-r border-black p-2 text-xs pl-6 font-bold">TOTAL</td>
                    <td className="border-r border-black p-2 text-center text-xs font-bold">
                      {data.totals!.female}
                    </td>
                    <td className="border-r border-black p-2 text-center text-xs font-bold">{data.totals!.male}</td>
                    <td className="p-2 text-center text-xs font-bold">{data.totals!.total}</td>
                  </tr>
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </>
  );
}
