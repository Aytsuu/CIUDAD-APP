import { VaccinationStatisticsResponse } from "./restful-api/fetch";

interface VaccinationStatisticsTableProps {
  data: VaccinationStatisticsResponse;
  isLoading: boolean;
}

export default function VaccinationStatisticsTable({ data, isLoading }: VaccinationStatisticsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!data || !data.success) {
    return (
      <div className="border-2 border-black p-6 text-center">
        <p className="text-black font-bold">Failed to load vaccination statistics</p>
      </div>
    );
  }

  const hasData = 
    data.special_vaccines.some(v => v.total > 0) ||
    data["0_12_months"].length > 0 ||
    data["12_23_months"].length > 0;

  if (!hasData) {
    return (
      <div className="border-2 border-black p-6 text-center">
        <p className="text-black">No vaccination data available for this month</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-black">
      <table className="w-full border-collapse">
        {/* Header Row */}
        <thead>
          <tr className="border-b-2 border-black">
            <th className="border-r border-black p-3 text-left font-bold bg-white text-xs">
            
            </th>
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
          {data.special_vaccines[0] && (
            <tr className="border-b border-black">
              <td className="border-r border-black p-2 text-xs pl-6">
                1. BCG (0-28 days old)
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[0].female}
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[0].male}
              </td>
              <td className="p-2 text-center text-xs font-bold">
                {data.special_vaccines[0].total}
              </td>
            </tr>
          )}

          {/* BCG 29 days - 1 year */}
          {data.special_vaccines[1] && (
            <tr className="border-b border-black">
              <td className="border-r border-black p-2 text-xs pl-6">
                2. BCG (29 days to 59 days old)
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[1].female}
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[1].male}
              </td>
              <td className="p-2 text-center text-xs font-bold">
                {data.special_vaccines[1].total}
              </td>
            </tr>
          )}

          {/* HepB */}
          {data.special_vaccines[2] && (
            <tr className="border-b-2 border-black">
              <td className="border-r border-black p-2 text-xs pl-6">
                3. Hepatitis B vaccine within 24 hours (newborns)
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[2].female}
              </td>
              <td className="border-r border-black p-2 text-center text-xs">
                {data.special_vaccines[2].male}
              </td>
              <td className="p-2 text-center text-xs font-bold">
                {data.special_vaccines[2].total}
              </td>
            </tr>
          )}

          {/* A.2 - 0-12 Months Section */}
          {data["0_12_months"].length > 0 && (
            <>
              <tr className="border-b border-black bg-gray-100">
                <td colSpan={4} className="p-2 font-bold text-xs">
                  A.2 - Fully Immunized Children (FIC) (0-11 months old)
                </td>
              </tr>
              
              {data["0_12_months"].map((vaccine, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">
                    {index + 1}. {vaccine.vaccine_name}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">
                    {vaccine.female}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">
                    {vaccine.male}
                  </td>
                  <td className="p-2 text-center text-xs font-bold">
                    {vaccine.total}
                  </td>
                </tr>
              ))}
            </>
          )}

          {/* A.3 - 12-23 Months Section */}
          {data["12_23_months"].length > 0 && (
            <>
              <tr className="border-b border-black bg-gray-100">
                <td colSpan={4} className="p-2 font-bold text-xs">
                  A.3 - Fully Immunized Children (12-23 months old)
                </td>
              </tr>
              
              {data["12_23_months"].map((vaccine, index) => (
                <tr key={index} className="border-b border-black">
                  <td className="border-r border-black p-2 text-xs pl-6">
                    {index + 1}. {vaccine.vaccine_name}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">
                    {vaccine.female}
                  </td>
                  <td className="border-r border-black p-2 text-center text-xs">
                    {vaccine.male}
                  </td>
                  <td className="p-2 text-center text-xs font-bold">
                    {vaccine.total}
                  </td>
                </tr>
              ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}
