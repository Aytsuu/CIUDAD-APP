import { NutritionStatisticsResponse } from "./restful-api/fetch";
import { Button } from "@/components/ui/button/button";
import { Printer } from "lucide-react";
import { exportToPDF } from "../export/export-report";


interface NutritionStatisticsTableProps {
  data: NutritionStatisticsResponse;
}

export default function NutritionStatisticsTable({ data }: NutritionStatisticsTableProps) {
  const handleExportPDF = () => {
    exportToPDF("portrait");
  };


 

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
        className="print-area bg-white overflow-x-auto px-4"
        style={{
          width: "13in",
          margin: "0 auto",
          backgroundColor: "white",
        }}
      >
        <div className="border-2 border-black">
          {/* Nutrition Services Table */}
          <table className="w-full border-collapse">
            <colgroup>
              <col style={{ width: '60%' }} />
              <col style={{ width: '13.33%' }} />
              <col style={{ width: '13.33%' }} />
              <col style={{ width: '13.34%' }} />
            </colgroup>
            {/* Header Row */}
            <thead>
              <tr className="border-b-2 border-black">
                <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">Nutrition Service</th>
                <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Female</th>
                <th className="border-r border-black p-2 text-center font-bold text-xs bg-white">Male</th>
                <th className="p-2 text-center font-bold text-xs bg-white">Total</th>
              </tr>
            </thead>

            <tbody>
              {/* B. Nutrition Services Section */}
              <tr className="border-b border-black bg-gray-100">
                <td colSpan={4} className="p-2 font-bold text-xs">
                  B. Child Health and Nutrition Services (Monthly)
                </td>
              </tr>

              {data.nutrition_services.map((service, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">
                    {index + 1}. {service.service_name}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">{service.female}</td>
                  <td className="border-r border-black p-2 text-center text-xs">{service.male}</td>
                  <td className="p-2 text-center text-xs font-bold">{service.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nutritional Status Assessment Table */}
          <table className="w-full border-collapse">
            <colgroup>
              <col style={{ width: '60%' }} />
              <col style={{ width: '13.33%' }} />
              <col style={{ width: '13.33%' }} />
              <col style={{ width: '13.34%' }} />
            </colgroup>
            {/* Header Row */}
            <thead>
              <tr className="border-b-2 border-black">
                <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">Nutritional Status</th>
              </tr>
            </thead>

            <tbody>
              {/* C. Nutritional Status Assessment Section */}
              <tr className="border-b border-black bg-gray-100">
                <td colSpan={4} className="p-2 font-bold text-xs">
                  C. Nutritional Status Assessment (Annual)
                </td>
              </tr>

              {data.nutritional_status_assessment.map((status, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">
                    {index + 1}. {status.status_name}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">{status.female}</td>
                  <td className="border-r border-black p-2 text-center text-xs">{status.male}</td>
                  <td className="p-2 text-center text-xs font-bold">{status.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
