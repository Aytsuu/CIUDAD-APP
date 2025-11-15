import { VaccinationStatisticsResponse } from "./restful-api/fetch";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";
import { exportToPDF } from "../export/export-report";
import TableLoading from "@/components/ui/table-loading";

interface VaccinationStatisticsTableProps {
  data: VaccinationStatisticsResponse;
  isLoading: boolean;
  monthName?: string;
}

export default function VaccinationStatisticsTable({ data, isLoading }: VaccinationStatisticsTableProps) {
  const handleExportPDF = () => {
    exportToPDF("portrait");
  };

  if (isLoading) {
    return (
     <TableLoading/>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="border-2 border-black p-6 text-center">
        <p className="text-black font-bold">Failed to load vaccination statistics</p>
      </div>
    );
  }

  const hasData = data.special_vaccines?.some((v) => v.total > 0) || 
                  (data["0_12_months"]?.length ?? 0) > 0 || 
                  (data["13_23_months"]?.length ?? 0) > 0;

  if (!hasData) {
    return (
      <div className="border-2 border-black p-6 text-center">
        <p className="text-black">No vaccination data available for this month</p>
      </div>
    );
  }

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
        className="print-area bg-white overflow-x-auto p-4"
        style={{
          width: "13in",
          margin: "0 auto",
          backgroundColor: "white",
        }}
      >
        <div className="border-2 border-black">
          <table className="w-full border-collapse">
            {/* Header Row */}
            <thead>
              <tr className="border-b-2 border-black">
                <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">IMMMUNIZATION</th>
                <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Female</th>
                <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Male</th>
                <th className="p-2 text-center font-bold text-xs bg-white">Total</th>
              </tr>
            </thead>

            <tbody>
              {/* A.1 Special Vaccines Section */}
              <tr className="border-b border-black bg-gray-100">
                <td colSpan={4} className="p-2 font-bold text-xs">
                  A.1 - Immunization Services for Infants and Children
                </td>
              </tr>

              {/* BCG 0-28 days */}
              {data.special_vaccines?.[0] && (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">1. BCG (0-28 days old)</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[0].female}</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[0].male}</td>
                  <td className="p-2 text-center text-xs font-bold">{data.special_vaccines[0].total}</td>
                </tr>
              )}

              {/* BCG 29 days - 1 year */}
              {data.special_vaccines?.[1] && (
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">2. BCG (29 days to 59 days old)</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[1].female}</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[1].male}</td>
                  <td className="p-2 text-center text-xs font-bold">{data.special_vaccines[1].total}</td>
                </tr>
              )}

              {/* HepB */}
              {data.special_vaccines?.[2] && (
                <tr className="border-b-2 border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">3. HepB (24 hours - 14 days)</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[2].female}</td>
                  <td className="border-r border-black p-2 text-center text-xs">{data.special_vaccines[2].male}</td>
                  <td className="p-2 text-center text-xs font-bold">{data.special_vaccines[2].total}</td>
                </tr>
              )}

              {/* A.2 - 0-12 Months Section */}
              {data["0_12_months"] && data["0_12_months"].length > 0 && (
                <>
                  <tr className="border-b border-black bg-gray-100">
                    <td colSpan={4} className="p-2 font-bold text-xs">
                      A.2 - Immunization Services (0-12 months old)
                    </td>
                  </tr>

                  {data["0_12_months"].map((vaccine: any, index: number) => (
                    <tr key={index} className="border-b border-black">
                      <td className="border-r border-black p-2 text-xs pl-6">
                        {index + 1}. {vaccine.vaccine_name}
                      </td>
                      <td className="border-r border-black p-2 text-center text-xs">{vaccine.female}</td>
                      <td className="border-r border-black p-2 text-center text-xs">{vaccine.male}</td>
                      <td className="p-2 text-center text-xs font-bold">{vaccine.total}</td>
                    </tr>
                  ))}
                </>
              )}

              {/* A.3 - 12-23 Months Section */}
              {data["13_23_months"] && data["13_23_months"].length > 0 && (
                <>
                  <tr className="border-b border-black bg-gray-100">
                    <td colSpan={4} className="p-2 font-bold text-xs">
                      A.3 - Immunization Services  (12-23 months old)
                    </td>
                  </tr>

                  {data["13_23_months"].map((vaccine: any, index: number) => (
                    <tr key={index} className="border-b border-black">
                      <td className="border-r border-black p-2 text-xs pl-6">
                        {index + 1}. {vaccine.vaccine_name}
                      </td>
                      <td className="border-r border-black p-2 text-center text-xs">{vaccine.female}</td>
                      <td className="border-r border-black p-2 text-center text-xs">{vaccine.male}</td>
                      <td className="p-2 text-center text-xs font-bold">{vaccine.total}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
